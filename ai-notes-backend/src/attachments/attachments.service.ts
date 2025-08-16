import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { CloudflareR2Service } from '../common/r2.service';
import { ActivitiesService } from '../activities/activities.service';
import * as path from 'path';
import * as crypto from 'crypto';

interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface AttachmentMetadata {
  dimensions?: { width: number; height: number };
  duration?: number; // For audio/video files
  pages?: number; // For PDF files
  extractedText?: string; // For OCR results
  thumbnail?: string; // Thumbnail URL for preview
}

@Injectable()
export class AttachmentsService {
  // File type categories
  private readonly ALLOWED_MIME_TYPES = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
    document: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/markdown',
      'text/csv'
    ],
    audio: ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/webm', 'audio/ogg'],
    video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/avi'],
    archive: ['application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed', 'application/x-7z-compressed']
  };

  private readonly MAX_FILE_SIZE = {
    image: 10 * 1024 * 1024, // 10MB
    document: 50 * 1024 * 1024, // 50MB
    audio: 100 * 1024 * 1024, // 100MB
    video: 500 * 1024 * 1024, // 500MB
    archive: 100 * 1024 * 1024 // 100MB
  };

  constructor(
    private prisma: PrismaService,
    private r2Service: CloudflareR2Service,
    private activitiesService: ActivitiesService,
    @InjectQueue('attachment-processing') private attachmentQueue: Queue,
  ) {}

  async uploadAttachment(
    file: UploadedFile,
    noteId: string,
    userId: string
  ) {
    try {
      // Verify note ownership
      const note = await this.prisma.note.findFirst({
        where: { id: noteId, ownerId: userId, isDeleted: false }
      });

      if (!note) {
        throw new NotFoundException('Note not found or not accessible');
      }

      // Validate file
      const fileCategory = this.validateFile(file);
      
      // Generate unique filename
      const fileExtension = this.getFileExtension(file.originalname);
      const uniqueId = crypto.randomUUID();
      const fileName = `attachments/${userId}/${noteId}/${uniqueId}.${fileExtension}`;

      // Upload to R2 (with local fallback)
      let fileUrl: string;
      try {
        fileUrl = await this.uploadToR2(file, fileName);
      } catch (error) {
        console.error('R2 upload failed, using local storage:', error);
        fileUrl = await this.uploadToLocal(file, fileName);
      }

      // Create database record
      const attachment = await this.prisma.attachment.create({
        data: {
          noteId,
          filename: file.originalname,
          filepath: fileUrl,
          fileType: file.mimetype,
          fileSize: file.size,
          uploadedBy: userId,
          // metadata will be populated by background processing
        }
      });

      // Track activity
      await this.activitiesService.recordActivity({
        userId,
        action: 'ATTACHMENT_UPLOAD',
        noteId,
        metadata: {
          filename: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          category: fileCategory
        }
      });

      // Queue background processing for metadata extraction and OCR
      await this.queueAttachmentProcessing(attachment.id, userId);

      return {
        success: true,
        attachment: {
          id: attachment.id,
          filename: attachment.filename,
          fileType: attachment.fileType,
          fileSize: attachment.fileSize,
          fileUrl: attachment.filepath,
          uploadedAt: attachment.createdAt,
          category: fileCategory
        }
      };

    } catch (error) {
      console.error('Upload attachment error:', error);
      throw error;
    }
  }

  async getAttachments(noteId: string, userId: string) {
    // Verify note ownership
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, ownerId: userId, isDeleted: false }
    });

    if (!note) {
      throw new NotFoundException('Note not found or not accessible');
    }

    const attachments = await this.prisma.attachment.findMany({
      where: { noteId },
      include: {
        ocrResult: {
          select: {
            text: true,
            confidence: true,
            language: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return attachments.map(attachment => ({
      id: attachment.id,
      filename: attachment.filename,
      fileType: attachment.fileType,
      fileSize: attachment.fileSize,
      fileUrl: attachment.filepath,
      uploadedAt: attachment.createdAt,
      category: this.getFileCategory(attachment.fileType),
      ocrText: attachment.ocrResult?.text,
      ocrConfidence: attachment.ocrResult?.confidence
    }));
  }

  async deleteAttachment(attachmentId: string, userId: string) {
    const attachment = await this.prisma.attachment.findFirst({
      where: {
        id: attachmentId,
        note: { ownerId: userId }
      },
      include: {
        note: { select: { id: true, title: true } }
      }
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found or not accessible');
    }

    // Delete from storage
    try {
      if (attachment.filepath.startsWith('http')) {
        // R2 file
        await this.r2Service.deleteAvatar(attachment.filepath);
      } else {
        // Local file
        await this.deleteLocalFile(attachment.filepath);
      }
    } catch (error) {
      console.error('Failed to delete file from storage:', error);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database (cascade will handle OCR results)
    await this.prisma.attachment.delete({
      where: { id: attachmentId }
    });

    // Track activity
    await this.activitiesService.recordActivity({
      userId,
      action: 'ATTACHMENT_DELETE',
      noteId: attachment.note.id,
      metadata: {
        filename: attachment.filename,
        fileType: attachment.fileType
      }
    });

    return {
      success: true,
      message: `Attachment "${attachment.filename}" deleted successfully`
    };
  }

  async downloadAttachment(attachmentId: string, userId: string) {
    const attachment = await this.prisma.attachment.findFirst({
      where: {
        id: attachmentId,
        note: { ownerId: userId }
      }
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found or not accessible');
    }

    // For R2 files, return the URL directly (they're already publicly accessible)
    if (attachment.filepath.startsWith('http')) {
      return {
        url: attachment.filepath,
        filename: attachment.filename,
        mimeType: attachment.fileType
      };
    }

    // For local files, return the local path
    return {
      localPath: attachment.filepath,
      filename: attachment.filename,
      mimeType: attachment.fileType
    };
  }

  async searchAttachmentsByText(query: string, userId: string, limit: number = 10) {
    const attachments = await this.prisma.attachment.findMany({
      where: {
        note: { ownerId: userId, isDeleted: false },
        OR: [
          {
            filename: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            ocrResult: {
              text: {
                contains: query,
                mode: 'insensitive'
              }
            }
          }
        ]
      },
      include: {
        note: {
          select: { id: true, title: true }
        },
        ocrResult: {
          select: { text: true, confidence: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return attachments.map(attachment => ({
      id: attachment.id,
      filename: attachment.filename,
      fileType: attachment.fileType,
      fileUrl: attachment.filepath,
      note: attachment.note,
      ocrText: attachment.ocrResult?.text,
      relevance: this.calculateTextRelevance(query, attachment.filename, attachment.ocrResult?.text)
    }));
  }

  async getAttachmentAnalytics(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalAttachments, recentAttachments, storageUsage, typeDistribution] = await Promise.all([
      // Total attachments
      this.prisma.attachment.count({
        where: {
          note: { ownerId: userId },
          createdAt: { gte: startDate }
        }
      }),

      // Recent uploads
      this.prisma.attachment.findMany({
        where: {
          note: { ownerId: userId },
          createdAt: { gte: startDate }
        },
        include: {
          note: { select: { id: true, title: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),

      // Storage usage
      this.prisma.attachment.groupBy({
        by: ['fileType'],
        where: {
          note: { ownerId: userId }
        },
        _sum: { fileSize: true },
        _count: { fileType: true }
      }),

      // Type distribution
      this.prisma.attachment.groupBy({
        by: ['fileType'],
        where: {
          note: { ownerId: userId },
          createdAt: { gte: startDate }
        },
        _count: { fileType: true },
        orderBy: { _count: { fileType: 'desc' } }
      })
    ]);

    return {
      totalAttachments,
      totalStorageUsed: storageUsage.reduce((sum, item) => sum + (item._sum.fileSize || 0), 0),
      averageFileSize: storageUsage.length > 0 
        ? Math.round(storageUsage.reduce((sum, item) => sum + (item._sum.fileSize || 0), 0) / 
          storageUsage.reduce((sum, item) => sum + item._count.fileType, 0))
        : 0,
      typeDistribution: typeDistribution.map(item => ({
        fileType: item.fileType,
        count: item._count.fileType,
        category: this.getFileCategory(item.fileType)
      })),
        recentUploads: recentAttachments,
        totalRecentUploads: recentAttachments.length,
    };
  }

  private validateFile(file: UploadedFile): string {
    const allMimeTypes = Object.values(this.ALLOWED_MIME_TYPES).flat();
    
    if (!allMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} is not allowed`);
    }

    const category = this.getFileCategory(file.mimetype);
    const maxSize = this.MAX_FILE_SIZE[category];
    
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size ${this.formatFileSize(file.size)} exceeds maximum allowed size ${this.formatFileSize(maxSize)} for ${category} files`
      );
    }

    return category;
  }

  private getFileCategory(mimeType: string): string {
    for (const [category, types] of Object.entries(this.ALLOWED_MIME_TYPES)) {
      if (types.includes(mimeType)) {
        return category;
      }
    }
    return 'other';
  }

  private getFileExtension(filename: string): string {
    return path.extname(filename).toLowerCase().substring(1) || 'bin';
  }

  private formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  private async uploadToR2(file: UploadedFile, fileName: string): Promise<string> {
    // Extend R2Service upload method to handle general files (not just avatars)
    // We'll create a new method or extend the existing one
    return this.r2Service.uploadFile(file, fileName);
  }

  private async uploadToLocal(file: UploadedFile, fileName: string): Promise<string> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    // Create uploads directory structure
    const filePath = path.join(process.cwd(), 'uploads', fileName);
    const dirPath = path.dirname(filePath);
    
    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(filePath, file.buffer);
    
    return `/uploads/${fileName}`;
  }

  private async deleteLocalFile(filePath: string): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    try {
      const fullPath = path.join(process.cwd(), filePath.startsWith('/') ? filePath.substring(1) : filePath);
      await fs.unlink(fullPath);
    } catch (error) {
      console.error('Failed to delete local file:', error);
    }
  }

  private calculateTextRelevance(query: string, filename: string, ocrText?: string): number {
    let score = 0;
    const queryLower = query.toLowerCase();
    
    // Filename match (higher weight)
    if (filename.toLowerCase().includes(queryLower)) {
      score += 0.6;
    }
    
    // OCR text match
    if (ocrText && ocrText.toLowerCase().includes(queryLower)) {
      score += 0.4;
      
      // Boost score for exact phrase matches
      const words = queryLower.split(' ');
      const exactMatches = words.filter(word => ocrText.toLowerCase().includes(word)).length;
      score += (exactMatches / words.length) * 0.3;
    }
    
    return Math.min(score, 1.0);
  }

  private async queueAttachmentProcessing(attachmentId: string, userId: string) {
    try {
      await this.attachmentQueue.add(
        'process-attachment',
        { attachmentId, userId },
        {
          attempts: 2,
          priority: 1,
          delay: 1000 // 1 second delay to ensure file is fully uploaded
        }
      );
    } catch (error) {
      console.error('Failed to queue attachment processing:', error);
    }
  }
}
