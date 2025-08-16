import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SummariesService } from './summaries.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../types/user.types';
import { IsString, IsArray, IsOptional, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GenerateSummaryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(50)
  @Max(500)
  minWords?: number = 100;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(100)
  @Max(1000)
  maxSummaryLength?: number = 300;

  @IsOptional()
  @IsBoolean()
  includeKeyPoints?: boolean = true;

  @IsOptional()
  @IsString()
  model?: string; // Override user's default model
}

export class BatchSummaryDto {
  @IsArray()
  @IsString({ each: true })
  noteIds: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(50)
  minWords?: number = 100;

  @IsOptional()
  @IsBoolean()
  skipExisting?: boolean = false;
}

@ApiTags('summaries')
@ApiBearerAuth()
@Controller('summaries')
@UseGuards(JwtAuthGuard)
export class SummariesController {
  constructor(private readonly summariesService: SummariesService) {}

  @Get('notes/:noteId')
  @ApiOperation({ summary: 'Get existing summary for a note' })
  @ApiResponse({ status: 200, description: 'Summary retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Summary not found' })
  async getSummary(
    @Param('noteId') noteId: string,
    @CurrentUser() user: User,
  ) {
    try {
      const summary = await this.summariesService.getSummary(noteId, user.id);
      
      if (!summary) {
        return {
          success: false,
          message: 'No summary found for this note',
          noteId,
          summary: null
        };
      }

      return {
        success: true,
        noteId,
        summary,
        message: 'Summary retrieved successfully'
      };
    } catch (error) {
      console.error('Get summary error:', error);
      return {
        success: false,
        message: 'Failed to retrieve summary',
        error: error.message
      };
    }
  }

  @Post('notes/:noteId/generate')
  @ApiOperation({ summary: 'Generate AI summary for a note' })
  @ApiResponse({ status: 200, description: 'Summary generated successfully' })
  @ApiResponse({ status: 400, description: 'Note too short or invalid parameters' })
  async generateSummary(
    @Param('noteId') noteId: string,
    @Body() options: GenerateSummaryDto,
    @CurrentUser() user: User,
  ) {
    try {
      const summary = await this.summariesService.generateSummary(
        noteId, 
        user.id, 
        options
      );

      return {
        success: true,
        noteId,
        summary,
        message: 'Summary generated successfully'
      };
    } catch (error) {
      console.error('Generate summary error:', error);
      return {
        success: false,
        noteId,
        message: 'Failed to generate summary',
        error: error.message
      };
    }
  }

  @Delete('notes/:noteId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete summary for a note' })
  @ApiResponse({ status: 204, description: 'Summary deleted successfully' })
  @ApiResponse({ status: 404, description: 'Summary not found' })
  async deleteSummary(
    @Param('noteId') noteId: string,
    @CurrentUser() user: User,
  ) {
    try {
      await this.summariesService.deleteSummary(noteId, user.id);
      return { success: true };
    } catch (error) {
      console.error('Delete summary error:', error);
      throw error;
    }
  }

  @Post('batch')
  @ApiOperation({ summary: 'Generate summaries for multiple notes' })
  @ApiResponse({ status: 200, description: 'Batch summary generation completed' })
  async batchGenerateSummaries(
    @Body() data: BatchSummaryDto,
    @CurrentUser() user: User,
  ) {
    try {
      if (data.noteIds.length === 0) {
        return {
          success: false,
          message: 'No note IDs provided'
        };
      }

      if (data.noteIds.length > 50) {
        return {
          success: false,
          message: 'Maximum 50 notes allowed per batch request'
        };
      }

      const result = await this.summariesService.batchGenerateSummaries(
        user.id, 
        data.noteIds,
        {
          minWords: data.minWords,
          skipExisting: data.skipExisting
        }
      );

      return {
        success: true,
        ...result,
        message: `Batch processing completed. ${result.successful}/${result.total} summaries generated.`
      };
    } catch (error) {
      console.error('Batch generate summaries error:', error);
      return {
        success: false,
        message: 'Failed to process batch summary generation',
        error: error.message
      };
    }
  }

  @Post('notes/:noteId/queue')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Queue summary generation for background processing' })
  @ApiResponse({ status: 202, description: 'Summary generation queued successfully' })
  async queueSummaryGeneration(
      @Param('noteId') noteId: string,
        @CurrentUser() user: User,
    @Body() options?: GenerateSummaryDto,
  ) {
    try {
      const result = await this.summariesService.queueSummaryGeneration(
        noteId, 
        user.id, 
        options
      );

      return { 
        success: true,
        ...result,
        message: 'Summary generation queued successfully'
      };
    } catch (error) {
      console.error('Queue summary generation error:', error);
      return {
        success: false,
        message: 'Failed to queue summary generation',
        error: error.message
      };
    }
  }

  @Get('user/stats')
  @ApiOperation({ summary: 'Get summary statistics for user' })
  @ApiResponse({ status: 200, description: 'Summary statistics retrieved' })
  async getSummaryStats(@CurrentUser() user: User) {
    try {
      const [
        totalSummaries,
        recentSummaries,
        summariesByModel,
        averageWordCount
      ] = await Promise.all([
        this.summariesService['prisma'].autoSummary.count({
          where: { ownerId: user.id }
        }),
        this.summariesService['prisma'].autoSummary.count({
          where: { 
            ownerId: user.id,
            createdAt: { 
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            }
          }
        }),
        this.summariesService['prisma'].autoSummary.groupBy({
          by: ['model'],
          where: { ownerId: user.id },
          _count: { model: true }
        }),
        this.summariesService['prisma'].autoSummary.aggregate({
          where: { ownerId: user.id },
          _avg: { wordCount: true }
        })
      ]);

      return {
        success: true,
        stats: {
          totalSummaries,
          recentSummaries,
          averageWordCount: Math.round(averageWordCount._avg.wordCount || 0),
          summariesByModel: summariesByModel.reduce((acc, item) => {
            acc[item.model] = item._count.model;
            return acc;
          }, {}),
        }
      };
    } catch (error) {
      console.error('Get summary stats error:', error);
      return {
        success: false,
        stats: {
          totalSummaries: 0,
          recentSummaries: 0,
          averageWordCount: 0,
          summariesByModel: {}
        }
      };
    }
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get available summary templates' })
  @ApiResponse({ status: 200, description: 'Summary templates retrieved' })
  async getSummaryTemplates() {
    return {
      success: true,
      templates: [
        {
          id: 'executive',
          name: 'Executive Summary',
          description: 'Brief, high-level overview focusing on key decisions and outcomes',
          prompt: 'Create a brief executive summary highlighting key decisions, outcomes, and action items.'
        },
        {
          id: 'academic',
          name: 'Academic Summary',
          description: 'Structured summary with main arguments, evidence, and conclusions',
          prompt: 'Provide an academic-style summary with main arguments, supporting evidence, and conclusions.'
        },
        {
          id: 'meeting',
          name: 'Meeting Summary',
          description: 'Focus on decisions made, action items, and next steps',
          prompt: 'Summarize this meeting content focusing on decisions made, action items, and next steps.'
        },
        {
          id: 'research',
          name: 'Research Summary',
          description: 'Methodology, findings, and implications for research notes',
          prompt: 'Create a research summary covering methodology, key findings, and implications.'
        },
        {
          id: 'project',
          name: 'Project Summary',
          description: 'Project status, milestones, risks, and next phases',
          prompt: 'Summarize project status, completed milestones, identified risks, and upcoming phases.'
        }
      ]
    };
  }

  @Post('notes/:noteId/template/:templateId')
  @ApiOperation({ summary: 'Generate summary using specific template' })
  @ApiResponse({ status: 200, description: 'Template-based summary generated' })
  async generateTemplatedSummary(
    @Param('noteId') noteId: string,
    @Param('templateId') templateId: string,
    @CurrentUser() user: User,
  ) {
    try {
      const templates = {
        executive: 'Create a brief executive summary highlighting key decisions, outcomes, and action items.',
        academic: 'Provide an academic-style summary with main arguments, supporting evidence, and conclusions.',
        meeting: 'Summarize this meeting content focusing on decisions made, action items, and next steps.',
        research: 'Create a research summary covering methodology, key findings, and implications.',
        project: 'Summarize project status, completed milestones, identified risks, and upcoming phases.'
      };

      if (!templates[templateId]) {
        return {
          success: false,
          message: 'Invalid template ID'
        };
      }

      const summary = await this.summariesService.generateTemplatedSummary(
        noteId,
        user.id,
        templates[templateId]
      );

      return {
        success: true,
        noteId,
        templateId,
        summary,
        message: 'Template-based summary generated successfully'
      };
    } catch (error) {
      console.error('Generate templated summary error:', error);
      return {
        success: false,
        message: 'Failed to generate template-based summary',
        error: error.message
      };
    }
  }

  @Get('notes/:noteId/versions')
  @ApiOperation({ summary: 'Get summary version history' })
  @ApiResponse({ status: 200, description: 'Summary versions retrieved' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of versions to retrieve' })
  async getSummaryVersions(
      @Param('noteId') noteId: string,
        @CurrentUser() user: User,
    @Query('limit') limit?: string,
  ) {
    try {
      const versions = await this.summariesService.getSummaryVersions(
        noteId, 
        user.id, 
        limit ? parseInt(limit) : 10
      );

      return {
        success: true,
        noteId,
        versions,
        count: versions.length
      };
    } catch (error) {
      console.error('Get summary versions error:', error);
      return {
        success: false,
        versions: [],
        count: 0,
        error: error.message
      };
    }
  }
}
