import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AttachmentsService } from './attachments.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../types/user.types';
import { createReadStream } from 'fs';

@ApiTags('attachments')
@ApiBearerAuth()
@Controller('attachments')
@UseGuards(JwtAuthGuard)
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post(':noteId/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload file attachment to note' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiConsumes('multipart/form-data')
  async uploadAttachment(
    @Param('noteId') noteId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    try {
      if (!file) {
        return {
          success: false,
          message: 'No file provided'
        };
      }

      return await this.attachmentsService.uploadAttachment(
        {
          fieldname: file.fieldname,
          originalname: file.originalname,
          encoding: file.encoding,
          mimetype: file.mimetype,
          size: file.size,
          buffer: file.buffer,
        },
        noteId,
        user.id
      );
    } catch (error) {
      console.error('Upload attachment error:', error);
      return {
        success: false,
        message: error.message || 'Failed to upload attachment'
      };
    }
  }

  @Get(':noteId')
  @ApiOperation({ summary: 'Get attachments for a note' })
  @ApiResponse({ status: 200, description: 'Attachments retrieved successfully' })
  async getAttachments(
    @Param('noteId') noteId: string,
    @CurrentUser() user: User,
  ) {
    try {
      const attachments = await this.attachmentsService.getAttachments(noteId, user.id);
      
      return {
        success: true,
        attachments,
        count: attachments.length
      };
    } catch (error) {
      console.error('Get attachments error:', error);
      return {
        success: false,
        attachments: [],
        error: error.message
      };
    }
  }

  @Delete(':attachmentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete attachment' })
  @ApiResponse({ status: 200, description: 'Attachment deleted successfully' })
  async deleteAttachment(
    @Param('attachmentId') attachmentId: string,
    @CurrentUser() user: User,
  ) {
    try {
      return await this.attachmentsService.deleteAttachment(attachmentId, user.id);
    } catch (error) {
      console.error('Delete attachment error:', error);
      throw error;
    }
  }

  @Get(':attachmentId/download')
  @ApiOperation({ summary: 'Download attachment' })
  @ApiResponse({ status: 200, description: 'File download started' })
  async downloadAttachment(
    @Param('attachmentId') attachmentId: string,
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const downloadInfo = await this.attachmentsService.downloadAttachment(attachmentId, user.id);
      
      if (downloadInfo.url) {
        // For R2 files, redirect to the public URL
        return {
          success: true,
          downloadUrl: downloadInfo.url,
          filename: downloadInfo.filename
        };
      } else if (downloadInfo.localPath) {
        // For local files, stream the file
        res.set({
          'Content-Disposition': `attachment; filename="${downloadInfo.filename}"`,
          'Content-Type': downloadInfo.mimeType,
        });

        const file = createReadStream(downloadInfo.localPath);
        return new StreamableFile(file);
      }
    } catch (error) {
      console.error('Download attachment error:', error);
      throw error;
    }
  }

  @Get('search/:query')
  @ApiOperation({ summary: 'Search attachments by text content' })
  @ApiResponse({ status: 200, description: 'Search results retrieved' })
  async searchAttachments(
      @Param('query') query: string,
    @CurrentUser() user: User,
    @Query('limit') limit?: string,
  ) {
    try {
      const limitValue = limit ? parseInt(limit) : 10;
      const results = await this.attachmentsService.searchAttachmentsByText(query, user.id, limitValue);
      
      return {
        success: true,
        results,
        count: results.length,
        query
      };
    } catch (error) {
      console.error('Search attachments error:', error);
      return {
        success: false,
        results: [],
        error: error.message
      };
    }
  }

  @Get('analytics/overview')
  @ApiOperation({ summary: 'Get attachment analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getAttachmentAnalytics(
    @CurrentUser() user: User,
    @Query('days') days?: string,
  ) {
    try {
      const daysValue = days ? parseInt(days) : 30;
      const analytics = await this.attachmentsService.getAttachmentAnalytics(user.id, daysValue);
      
      return {
        success: true,
        analytics,
        period: {
          days: daysValue,
          startDate: new Date(Date.now() - daysValue * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Get attachment analytics error:', error);
      return {
        success: false,
        analytics: null,
        error: error.message
      };
    }
  }

  @Post(':attachmentId/ocr')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Request OCR processing for attachment' })
  @ApiResponse({ status: 202, description: 'OCR processing started' })
  async requestOCR(
    @Param('attachmentId') attachmentId: string,
    @CurrentUser() user: User,
  ) {
    try {
      // This would trigger OCR processing
      // For now, return a placeholder response
      return {
        success: true,
        message: 'OCR processing requested',
        attachmentId,
        note: 'OCR functionality will be implemented with Google Cloud Vision API'
      };
    } catch (error) {
      console.error('Request OCR error:', error);
      return {
        success: false,
        message: error.message || 'Failed to request OCR processing'
      };
    }
  }

  @Get('types/supported')
  @ApiOperation({ summary: 'Get supported file types' })
  @ApiResponse({ status: 200, description: 'Supported file types retrieved' })
  async getSupportedTypes() {
    const supportedTypes = {
      image: {
        mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
        maxSize: '10MB',
        description: 'Images with OCR text extraction support'
      },
      document: {
        mimeTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain',
          'text/markdown'
        ],
        maxSize: '50MB',
        description: 'Documents with text extraction support'
      },
      audio: {
        mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/webm', 'audio/ogg'],
        maxSize: '100MB',
        description: 'Audio files with transcription support'
      },
      video: {
        mimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
        maxSize: '500MB',
        description: 'Video files with preview generation'
      },
      archive: {
        mimeTypes: ['application/zip', 'application/x-zip-compressed'],
        maxSize: '100MB',
        description: 'Archive files (content extraction available)'
      }
    };

    return {
      success: true,
      supportedTypes,
      totalTypes: Object.values(supportedTypes).reduce((sum, category) => sum + category.mimeTypes.length, 0)
    };
  }
}
