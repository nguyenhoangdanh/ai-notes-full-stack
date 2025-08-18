import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExportDto } from './dto/export.dto';
import { ExportType, ExportFormat, ExportStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.exportHistory.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const exportRecord = await this.prisma.exportHistory.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!exportRecord) {
      throw new NotFoundException('Export record not found');
    }

    return exportRecord;
  }

  async create(createExportDto: CreateExportDto, userId: string) {
    // Validate that all notes belong to the user
    const notes = await this.prisma.note.findMany({
      where: {
        id: { in: createExportDto.noteIds },
        ownerId: userId,
        isDeleted: false,
      },
      include: {
        attachments: true,
      },
    });

    if (notes.length !== createExportDto.noteIds.length) {
      throw new NotFoundException('Some notes not found or not owned by user');
    }

    // Generate filename if not provided
    const filename = createExportDto.filename || this.generateFilename(createExportDto.type, createExportDto.format);

    // Create export record
    const exportRecord = await this.prisma.exportHistory.create({
      data: {
        userId,
        type: createExportDto.type,
        format: createExportDto.format,
        noteIds: createExportDto.noteIds,
        filename,
        settings: createExportDto.settings || {},
        status: ExportStatus.PROCESSING,
      },
    });

    // Process export in background
    this.processExport(exportRecord.id, notes);

    return exportRecord;
  }

  async remove(id: string, userId: string) {
    const exportRecord = await this.findOne(id, userId);

    // Delete the file if it exists
    if (exportRecord.downloadUrl) {
      const filePath = path.join('./exports', path.basename(exportRecord.downloadUrl));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await this.prisma.exportHistory.delete({
      where: {
        id,
        userId,
      },
    });
  }

  async getDownloadUrl(id: string, userId: string) {
    const exportRecord = await this.findOne(id, userId);

    if (exportRecord.status !== ExportStatus.COMPLETED) {
      throw new Error('Export is not ready for download');
    }

    if (exportRecord.expiresAt && exportRecord.expiresAt < new Date()) {
      throw new Error('Download link has expired');
    }

    return {
      downloadUrl: exportRecord.downloadUrl,
      filename: exportRecord.filename,
      fileSize: exportRecord.fileSize,
      expiresAt: exportRecord.expiresAt,
    };
  }

  private async processExport(exportId: string, notes: any[]) {
    try {
      const exportRecord = await this.prisma.exportHistory.findUnique({
        where: { id: exportId },
      });

      if (!exportRecord) {
        throw new Error('Export record not found');
      }

      let exportContent: string | Buffer;
      let fileExtension: string;

      switch (exportRecord.format) {
        case ExportFormat.MARKDOWN:
          exportContent = this.generateMarkdown(notes, exportRecord.settings);
          fileExtension = '.md';
          break;
        case ExportFormat.HTML:
          exportContent = this.generateHTML(notes, exportRecord.settings);
          fileExtension = '.html';
          break;
        case ExportFormat.PDF:
          exportContent = await this.generatePDF(notes, exportRecord.settings) as Buffer;
          fileExtension = '.pdf';
          break;
        case ExportFormat.EPUB:
          exportContent = await this.generateEPUB(notes, exportRecord.settings) as Buffer;
          fileExtension = '.epub';
          break;
        case ExportFormat.DOCX:
          exportContent = await this.generateDOCX(notes, exportRecord.settings) as Buffer;
          fileExtension = '.docx';
          break;
        case ExportFormat.NOTION:
          exportContent = this.generateNotionFormat(notes, exportRecord.settings);
          fileExtension = '.md';
          break;
        case ExportFormat.OBSIDIAN:
          exportContent = this.generateObsidianFormat(notes, exportRecord.settings);
          fileExtension = '.md';
          break;
        default:
          throw new Error(`Unsupported export format: ${exportRecord.format}`);
      }

      // Save file
      const exportsDir = './exports';
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }

      const filename = `${path.parse(exportRecord.filename).name}${fileExtension}`;
      const filePath = path.join(exportsDir, filename);
      
      if (typeof exportContent === 'string') {
        fs.writeFileSync(filePath, exportContent, 'utf8');
      } else {
        fs.writeFileSync(filePath, exportContent);
      }

      const fileStats = fs.statSync(filePath);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      // Update export record
      await this.prisma.exportHistory.update({
        where: { id: exportId },
        data: {
          status: ExportStatus.COMPLETED,
          downloadUrl: `/exports/${filename}`,
          fileSize: fileStats.size,
          expiresAt,
          completedAt: new Date(),
        },
      });

    } catch (error) {
      console.error(`Export processing failed for ${exportId}:`, error);
      await this.prisma.exportHistory.update({
        where: { id: exportId },
        data: {
          status: ExportStatus.FAILED,
          completedAt: new Date(),
        },
      });
    }
  }

  private generateMarkdown(notes: any[], settings: any): string {
    const { includeMetadata = true, includeTags = true } = settings;
    let content = '';

    for (const note of notes) {
      content += `# ${note.title}\n\n`;
      
      if (includeMetadata) {
        content += `**Created:** ${note.createdAt.toISOString()}\n`;
        content += `**Updated:** ${note.updatedAt.toISOString()}\n\n`;
      }

      if (includeTags && note.tags.length > 0) {
        content += `**Tags:** ${note.tags.join(', ')}\n\n`;
      }

      content += `${note.content}\n\n---\n\n`;
    }

    return content;
  }

  private generateHTML(notes: any[], settings: any): string {
    const { includeMetadata = true, includeTags = true } = settings;
    
    let content = `
<!DOCTYPE html>
<html>
<head>
    <title>Exported Notes</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #333; border-bottom: 2px solid #333; }
        .note { margin-bottom: 40px; page-break-inside: avoid; }
        .metadata { color: #666; font-size: 0.9em; margin-bottom: 10px; }
        .tags { background: #f0f0f0; padding: 5px; border-radius: 3px; }
        .content { line-height: 1.6; }
    </style>
</head>
<body>
`;

    for (const note of notes) {
      content += `<div class="note">`;
      content += `<h1>${note.title}</h1>`;
      
      if (includeMetadata || includeTags) {
        content += `<div class="metadata">`;
        if (includeMetadata) {
          content += `<p><strong>Created:</strong> ${note.createdAt.toISOString()}</p>`;
          content += `<p><strong>Updated:</strong> ${note.updatedAt.toISOString()}</p>`;
        }
        if (includeTags && note.tags.length > 0) {
          content += `<p class="tags"><strong>Tags:</strong> ${note.tags.join(', ')}</p>`;
        }
        content += `</div>`;
      }

      content += `<div class="content">${note.content.replace(/\n/g, '<br>')}</div>`;
      content += `</div>`;
    }

    content += `</body></html>`;
    return content;
  }

  private async generatePDF(notes: any[], settings: any): Promise<Buffer> {
    // In a real implementation, you would use a library like puppeteer or pdfkit
    // For now, we'll create a simple text-based PDF placeholder
    const html = this.generateHTML(notes, settings);
    
    // This is a placeholder - in reality you'd convert HTML to PDF
    return Buffer.from(html, 'utf8');
  }

  private async generateEPUB(notes: any[], settings: any): Promise<Buffer> {
    // In a real implementation, you would use a library like epub-gen
    // For now, we'll create a placeholder
    const content = this.generateMarkdown(notes, settings);
    return Buffer.from(content, 'utf8');
  }

  private async generateDOCX(notes: any[], settings: any): Promise<Buffer> {
    // In a real implementation, you would use a library like docx
    // For now, we'll create a placeholder
    const content = this.generateMarkdown(notes, settings);
    return Buffer.from(content, 'utf8');
  }

  private generateNotionFormat(notes: any[], settings: any): string {
    // Generate Notion-compatible markdown
    let content = '';

    for (const note of notes) {
      content += `# ${note.title}\n\n`;
      
      if (note.tags.length > 0) {
        content += note.tags.map(tag => `#${tag.replace(/\s+/g, '_')}`).join(' ') + '\n\n';
      }

      content += `${note.content}\n\n`;
      content += `---\n\n`;
    }

    return content;
  }

  private generateObsidianFormat(notes: any[], settings: any): string {
    // Generate Obsidian-compatible markdown with internal links
    let content = '';

    for (const note of notes) {
      content += `# ${note.title}\n\n`;
      
      if (note.tags.length > 0) {
        content += note.tags.map(tag => `#${tag.replace(/\s+/g, '_')}`).join(' ') + '\n\n';
      }

      // Convert note references to Obsidian links
      let noteContent = note.content;
      // This is a simplified link conversion - in reality you'd have more sophisticated parsing
      noteContent = noteContent.replace(/\[\[([^\]]+)\]\]/g, '[[note:$1]]');

      content += `${noteContent}\n\n`;
      content += `---\n\n`;
    }

    return content;
  }

  private generateFilename(type: ExportType, format: ExportFormat): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const typeStr = type.toLowerCase().replace('_', '-');
    const formatStr = format.toLowerCase();
    
    return `${typeStr}-export-${timestamp}.${formatStr}`;
  }

  async getExportStats(userId: string) {
    const [total, completed, processing, failed] = await Promise.all([
      this.prisma.exportHistory.count({
        where: { userId },
      }),
      this.prisma.exportHistory.count({
        where: { userId, status: ExportStatus.COMPLETED },
      }),
      this.prisma.exportHistory.count({
        where: { userId, status: ExportStatus.PROCESSING },
      }),
      this.prisma.exportHistory.count({
        where: { userId, status: ExportStatus.FAILED },
      }),
    ]);

    const formatStats = await this.prisma.exportHistory.groupBy({
      by: ['format'],
      where: { userId },
      _count: { format: true },
    });

    const totalSize = await this.prisma.exportHistory.aggregate({
      where: { userId, fileSize: { not: null } },
      _sum: { fileSize: true },
    });

    return {
      total,
      completed,
      processing,
      failed,
      totalSizeBytes: totalSize._sum.fileSize || 0,
      formatBreakdown: formatStats.map(stat => ({
        format: stat.format,
        count: stat._count.format,
      })),
    };
  }

  async cleanupExpiredExports() {
    const expiredExports = await this.prisma.exportHistory.findMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
        status: ExportStatus.COMPLETED,
      },
    });

    for (const exportRecord of expiredExports) {
      if (exportRecord.downloadUrl) {
        const filePath = path.join('./exports', path.basename(exportRecord.downloadUrl));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    const result = await this.prisma.exportHistory.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
        status: ExportStatus.COMPLETED,
      },
    });

    return { deletedCount: result.count };
  }
}