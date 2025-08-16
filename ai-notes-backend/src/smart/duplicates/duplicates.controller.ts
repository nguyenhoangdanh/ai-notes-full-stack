import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DuplicatesService } from './duplicates.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../types/user.types';
import { IsString, IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class DetectDuplicatesDto {
  @IsOptional()
  @IsString()
  noteId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(1.0)
  threshold?: number = 0.7;
}

export class CreateDuplicateReportDto {
  @IsString()
  originalNoteId: string;

  @IsString()
  duplicateNoteId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  similarity: number;

  @IsEnum(['CONTENT', 'TITLE', 'SEMANTIC'])
  type: 'CONTENT' | 'TITLE' | 'SEMANTIC';
}

export class UpdateDuplicateReportDto {
  @IsEnum(['CONFIRMED', 'DISMISSED', 'MERGED'])
  status: 'CONFIRMED' | 'DISMISSED' | 'MERGED';
}

export class MergeNotesDto {
  @IsString()
  originalNoteId: string;

  @IsString()
  duplicateNoteId: string;
}

@ApiTags('duplicates')
@ApiBearerAuth()
@Controller('duplicates')
@UseGuards(JwtAuthGuard)
export class DuplicatesController {
  constructor(private readonly duplicatesService: DuplicatesService) {}

  @Get('detect')
  @ApiOperation({ summary: 'Detect duplicate notes' })
  @ApiResponse({ status: 200, description: 'Duplicate detection results' })
  @ApiQuery({ name: 'noteId', required: false, description: 'Check specific note for duplicates' })
  @ApiQuery({ name: 'threshold', required: false, description: 'Similarity threshold (0.1-1.0)', type: Number })
  async detectDuplicates(
    @Query() query: DetectDuplicatesDto,
    @CurrentUser() user: User,
  ) {
    try {
      const results = await this.duplicatesService.findDuplicates(
        user.id, 
        query.noteId, 
        query.threshold
      );

      return {
        success: true,
        count: results.length,
        duplicates: results,
        message: results.length > 0 
          ? `Found ${results.length} potential duplicate(s)`
          : 'No duplicates detected'
      };
    } catch (error) {
      console.error('Duplicate detection error:', error);
      return {
        success: false,
        count: 0,
        duplicates: [],
        message: 'Failed to detect duplicates',
        error: error.message
      };
    }
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get duplicate reports' })
  @ApiResponse({ status: 200, description: 'Duplicate reports retrieved' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'CONFIRMED', 'DISMISSED', 'MERGED'] })
  async getDuplicateReports(
    @CurrentUser() user: User,
    @Query('status') status?: 'PENDING' | 'CONFIRMED' | 'DISMISSED' | 'MERGED',
  ) {
    try {
      const reports = await this.duplicatesService.getDuplicateReports(user.id, status);
      
      return {
        success: true,
        count: reports.length,
        reports,
        statusFilter: status || 'all'
      };
    } catch (error) {
      console.error('Get duplicate reports error:', error);
      throw error;
    }
  }

  @Post('reports')
  @ApiOperation({ summary: 'Create duplicate report' })
  @ApiResponse({ status: 201, description: 'Duplicate report created' })
  async createDuplicateReport(
    @Body() data: CreateDuplicateReportDto,
    @CurrentUser() user: User,
  ) {
    try {
      // Validate that both notes belong to user
      const [originalNote, duplicateNote] = await Promise.all([
        this.duplicatesService['prisma'].note.findFirst({
          where: { id: data.originalNoteId, ownerId: user.id, isDeleted: false }
        }),
        this.duplicatesService['prisma'].note.findFirst({
          where: { id: data.duplicateNoteId, ownerId: user.id, isDeleted: false }
        })
      ]);

      if (!originalNote || !duplicateNote) {
        return {
          success: false,
          message: 'One or both notes not found or not owned by user'
        };
      }

      const report = await this.duplicatesService.createDuplicateReport(
        data.originalNoteId,
        data.duplicateNoteId,
        data.similarity,
        data.type,
        user.id,
      );

      return {
        success: true,
        report,
        message: 'Duplicate report created successfully'
      };
    } catch (error) {
      console.error('Create duplicate report error:', error);
      return {
        success: false,
        message: 'Failed to create duplicate report',
        error: error.message
      };
    }
  }

  @Patch('reports/:id')
  @ApiOperation({ summary: 'Update duplicate report status' })
  @ApiResponse({ status: 200, description: 'Duplicate report updated' })
  async updateDuplicateReport(
    @Param('id') id: string,
    @Body() data: UpdateDuplicateReportDto,
    @CurrentUser() user: User,
  ) {
    try {
      const updatedReport = await this.duplicatesService.updateDuplicateReport(
        id, 
        user.id, 
        data.status
      );

      return {
        success: true,
        report: updatedReport,
        message: `Report status updated to ${data.status}`
      };
    } catch (error) {
      console.error('Update duplicate report error:', error);
      return {
        success: false,
        message: 'Failed to update report status',
        error: error.message
      };
    }
  }

  @Post('merge')
  @ApiOperation({ summary: 'Merge duplicate notes' })
  @ApiResponse({ status: 200, description: 'Notes merged successfully' })
  async mergeNotes(
    @Body() data: MergeNotesDto,
    @CurrentUser() user: User,
  ) {
    try {
      const result = await this.duplicatesService.mergeNotes(
        data.originalNoteId,
        data.duplicateNoteId,
        user.id,
      );

      return {
        success: true,
        ...result,
        message: 'Notes merged successfully'
      };
    } catch (error) {
      console.error('Merge notes error:', error);
      return {
        success: false,
        message: 'Failed to merge notes',
        error: error.message
      };
    }
  }

  @Post('queue-detection')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Queue duplicate detection job' })
  @ApiResponse({ status: 202, description: 'Detection job queued' })
  async queueDetection(
    @Body() data: { noteId?: string },
    @CurrentUser() user: User,
  ) {
    try {
      await this.duplicatesService.queueDuplicateDetection(user.id, data.noteId);
      
      return { 
        success: true,
        message: 'Duplicate detection job queued successfully',
        noteId: data.noteId || null
      };
    } catch (error) {
      console.error('Queue detection error:', error);
      return {
        success: false,
        message: 'Failed to queue duplicate detection',
        error: error.message
      };
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get duplicate detection statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getDuplicateStats(@CurrentUser() user: User) {
    try {
      const [totalReports, pendingReports, mergedReports] = await Promise.all([
        this.duplicatesService['prisma'].duplicateReport.count({
          where: { ownerId: user.id }
        }),
        this.duplicatesService['prisma'].duplicateReport.count({
          where: { ownerId: user.id, status: 'PENDING' }
        }),
        this.duplicatesService['prisma'].duplicateReport.count({
          where: { ownerId: user.id, status: 'MERGED' }
        })
      ]);

      return {
        success: true,
        stats: {
          totalReports,
          pendingReports,
          mergedReports,
          resolvedReports: totalReports - pendingReports
        }
      };
    } catch (error) {
      console.error('Get duplicate stats error:', error);
      return {
        success: false,
        stats: {
          totalReports: 0,
          pendingReports: 0,
          mergedReports: 0,
          resolvedReports: 0
        }
      };
    }
  }
}
