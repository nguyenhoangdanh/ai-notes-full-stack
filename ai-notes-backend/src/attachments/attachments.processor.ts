import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

interface AttachmentProcessingJobData {
  attachmentId: string;
  userId: string;
}

@Injectable()
@Processor('attachment-processing')
export class AttachmentsProcessor extends WorkerHost {
  private readonly logger = new Logger(AttachmentsProcessor.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'process-attachment':
        return this.handleProcessAttachment(job);
      case 'extract-text':
        return this.handleExtractText(job);
      case 'generate-thumbnail':
        return this.handleGenerateThumbnail(job);
      case 'analyze-content':
        return this.handleAnalyzeContent(job);
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async handleProcessAttachment(job: Job<AttachmentProcessingJobData>) {
    const { attachmentId, userId } = job.data;
    
    this.logger.log(`Processing attachment ${attachmentId} for user ${userId}`);
    
    try {
      const attachment = await this.prisma.attachment.findUnique({
        where: { id: attachmentId },
        include: {
          note: { select: { id: true, title: true } }
        }
      });

      if (!attachment) {
        throw new Error('Attachment not found');
      }

      const results = {
        attachmentId,
        fileType: attachment.fileType,
        processedFeatures: []
      };

      // Process based on file type
      if (this.isImageFile(attachment.fileType)) {
        // Extract text via OCR
        const ocrResult = await this.performOCR(attachment);
        if (ocrResult) {
          results.processedFeatures.push('ocr');
        }
        
        // Generate thumbnail
        const thumbnail = await this.generateImageThumbnail(attachment);
        if (thumbnail) {
          results.processedFeatures.push('thumbnail');
        }
      } else if (this.isDocumentFile(attachment.fileType)) {
        // Extract text content
        const textResult = await this.extractDocumentText(attachment);
        if (textResult) {
          results.processedFeatures.push('text_extraction');
        }
      } else if (this.isAudioFile(attachment.fileType)) {
        // Transcribe audio
        const transcription = await this.transcribeAudio(attachment);
        if (transcription) {
          results.processedFeatures.push('transcription');
        }
      } else if (this.isVideoFile(attachment.fileType)) {
        // Generate video thumbnail
        const videoThumbnail = await this.generateVideoThumbnail(attachment);
        if (videoThumbnail) {
          results.processedFeatures.push('video_thumbnail');
        }
      }

      // Update metadata in database
      await this.updateAttachmentMetadata(attachmentId, results.processedFeatures);

      this.logger.log(`Attachment processing completed for ${attachmentId}: ${results.processedFeatures.join(', ')}`);

      return results;

    } catch (error) {
      this.logger.error(`Attachment processing failed for ${attachmentId}:`, error);
      throw error;
    }
  }

  private async handleExtractText(job: Job) {
    const { attachmentId } = job.data;
    
    this.logger.log(`Extracting text from attachment ${attachmentId}`);
    
    try {
      const attachment = await this.prisma.attachment.findUnique({
        where: { id: attachmentId }
      });

      if (!attachment) {
        throw new Error('Attachment not found');
      }

      let extractedText = '';
      
      if (this.isImageFile(attachment.fileType)) {
        extractedText = await this.performOCR(attachment);
      } else if (this.isDocumentFile(attachment.fileType)) {
        extractedText = await this.extractDocumentText(attachment);
      } else if (attachment.fileType === 'application/pdf') {
        extractedText = await this.extractPDFText(attachment);
      }

      if (extractedText) {
        // Store OCR result
        await this.prisma.oCRResult.upsert({
          where: { attachmentId },
          update: {
            text: extractedText,
            confidence: 0.85, // Mock confidence
            language: 'en'
          },
          create: {
            attachmentId,
            text: extractedText,
            confidence: 0.85,
            language: 'en'
          }
        });

        this.logger.log(`Text extracted successfully from attachment ${attachmentId}`);
        return { success: true, extractedText: extractedText.substring(0, 200) + '...' };
      }

      return { success: false, message: 'No text could be extracted' };

    } catch (error) {
      this.logger.error(`Text extraction failed for attachment ${attachmentId}:`, error);
      throw error;
    }
  }

  private async handleGenerateThumbnail(job: Job) {
    const { attachmentId } = job.data;
    
    this.logger.log(`Generating thumbnail for attachment ${attachmentId}`);
    
    try {
      const attachment = await this.prisma.attachment.findUnique({
        where: { id: attachmentId }
      });

      if (!attachment) {
        throw new Error('Attachment not found');
      }

      let thumbnailUrl = '';

      if (this.isImageFile(attachment.fileType)) {
        thumbnailUrl = await this.generateImageThumbnail(attachment);
      } else if (this.isVideoFile(attachment.fileType)) {
        thumbnailUrl = await this.generateVideoThumbnail(attachment);
      } else if (attachment.fileType === 'application/pdf') {
        thumbnailUrl = await this.generatePDFThumbnail(attachment);
      }

      if (thumbnailUrl) {
        // Update attachment metadata
        await this.prisma.attachment.update({
          where: { id: attachmentId },
          data: {
            // Note: metadata is JSON field, so we'd need to handle this properly
            // For now, this is a placeholder
          }
        });

        this.logger.log(`Thumbnail generated for attachment ${attachmentId}`);
        return { success: true, thumbnailUrl };
      }

      return { success: false, message: 'Thumbnail generation not supported for this file type' };

    } catch (error) {
      this.logger.error(`Thumbnail generation failed for attachment ${attachmentId}:`, error);
      throw error;
    }
  }

  private async handleAnalyzeContent(job: Job) {
    const { attachmentId } = job.data;
    
    this.logger.log(`Analyzing content of attachment ${attachmentId}`);
    
    try {
      const attachment = await this.prisma.attachment.findUnique({
        where: { id: attachmentId },
        include: {
          ocrResult: true
        }
      });

      if (!attachment) {
        throw new Error('Attachment not found');
      }

      const analysis = {
        hasText: !!attachment.ocrResult?.text,
        textLength: attachment.ocrResult?.text?.length || 0,
        language: attachment.ocrResult?.language || 'unknown',
        confidence: attachment.ocrResult?.confidence || 0,
        fileCategory: this.getFileCategory(attachment.fileType),
        isSearchable: !!attachment.ocrResult?.text && attachment.ocrResult.text.length > 10
      };

      this.logger.log(`Content analysis completed for attachment ${attachmentId}:`, analysis);
      
      return analysis;

    } catch (error) {
      this.logger.error(`Content analysis failed for attachment ${attachmentId}:`, error);
      throw error;
    }
  }

  // Helper methods for file type detection
  private isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  private isDocumentFile(mimeType: string): boolean {
    const documentTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown'
    ];
    return documentTypes.includes(mimeType);
  }

  private isAudioFile(mimeType: string): boolean {
    return mimeType.startsWith('audio/');
  }

  private isVideoFile(mimeType: string): boolean {
    return mimeType.startsWith('video/');
  }

  private getFileCategory(mimeType: string): string {
    if (this.isImageFile(mimeType)) return 'image';
    if (this.isDocumentFile(mimeType)) return 'document';
    if (this.isAudioFile(mimeType)) return 'audio';
    if (this.isVideoFile(mimeType)) return 'video';
    if (mimeType === 'application/pdf') return 'pdf';
    return 'other';
  }

  // Placeholder implementations for processing functions
  private async performOCR(attachment: any): Promise<string> {
    // Placeholder for OCR implementation
    // In production, this would use Google Cloud Vision API or similar
    this.logger.log(`Mock OCR processing for ${attachment.filename}`);
    return 'Mock extracted text from image. In production, this would use Google Cloud Vision API.';
  }

  private async extractDocumentText(attachment: any): Promise<string> {
    // Placeholder for document text extraction
    this.logger.log(`Mock text extraction for ${attachment.filename}`);
    return 'Mock extracted text from document. In production, this would extract actual text content.';
  }

  private async extractPDFText(attachment: any): Promise<string> {
    // Placeholder for PDF text extraction
    this.logger.log(`Mock PDF text extraction for ${attachment.filename}`);
    return 'Mock extracted text from PDF. In production, this would use PDF parsing libraries.';
  }

  private async transcribeAudio(attachment: any): Promise<string> {
    // Placeholder for audio transcription
    this.logger.log(`Mock audio transcription for ${attachment.filename}`);
    return 'Mock audio transcription. In production, this would use Google Speech-to-Text API.';
  }

  private async generateImageThumbnail(attachment: any): Promise<string> {
    // Placeholder for image thumbnail generation
    this.logger.log(`Mock thumbnail generation for ${attachment.filename}`);
    return 'mock-thumbnail-url.jpg';
  }

  private async generateVideoThumbnail(attachment: any): Promise<string> {
    // Placeholder for video thumbnail generation
    this.logger.log(`Mock video thumbnail generation for ${attachment.filename}`);
    return 'mock-video-thumbnail-url.jpg';
  }

  private async generatePDFThumbnail(attachment: any): Promise<string> {
    // Placeholder for PDF thumbnail generation
    this.logger.log(`Mock PDF thumbnail generation for ${attachment.filename}`);
    return 'mock-pdf-thumbnail-url.jpg';
  }

  private async updateAttachmentMetadata(attachmentId: string, features: string[]) {
    // Update attachment metadata with processed features
    await this.prisma.attachment.update({
      where: { id: attachmentId },
      data: {
        // In production, you'd update a proper metadata JSON field
        // For now, we'll just log this
      }
    });

    this.logger.log(`Updated metadata for attachment ${attachmentId} with features: ${features.join(', ')}`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`✅ Attachment processing job ${job.id} (${job.name}) completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`❌ Attachment processing job ${job.id} (${job.name}) failed:`, error);
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job, progress: number) {
    if (progress % 25 === 0) {
      this.logger.log(`📊 Attachment processing job ${job.id} progress: ${progress}%`);
    }
  }
}
