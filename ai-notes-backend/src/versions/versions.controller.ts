import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VersionsService, CreateVersionOptions } from './versions.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../types/user.types';
import { IsString, IsOptional, IsNumber, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVersionDto {
  @IsOptional()
  @IsString()
  changeLog?: string;

  @IsOptional()
  @IsEnum(['major', 'minor', 'patch'])
  changeType?: 'major' | 'minor' | 'patch';

  @IsOptional()
  @IsString()
  isAutomatic?: boolean = false;
}

@ApiTags('versions')
@ApiBearerAuth()
@Controller('versions')
@UseGuards(JwtAuthGuard)
export class VersionsController {
  constructor(private readonly versionsService: VersionsService) {}

  @Post('notes/:noteId/create')
  @ApiOperation({ summary: 'Create a new version of a note' })
  @ApiResponse({ status: 201, description: 'Version created successfully' })
  @ApiResponse({ status: 400, description: 'No significant changes to version' })
  async createVersion(
    @Param('noteId') noteId: string,
    @Body() data: CreateVersionDto,
    @CurrentUser() user: User,
  ) {
    try {
      const options: CreateVersionOptions = {
        changeLog: data.changeLog,
        changeType: data.changeType,
        isAutomatic: data.isAutomatic,
        forceSave: !!data.changeLog // Force save if user provides change log
      };

      return await this.versionsService.createVersion(noteId, user.id, options);
    } catch (error) {
      console.error('Create version error:', error);
      return {
        success: false,
        message: error.message || 'Failed to create version'
      };
    }
  }

  @Get('notes/:noteId/history')
  @ApiOperation({ summary: 'Get version history for a note' })
  @ApiResponse({ status: 200, description: 'Version history retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getVersionHistory(
      @Param('noteId') noteId: string,
        @CurrentUser() user: User,
    @Query('limit') limit?: string,
  ) {
    try {
      const limitValue = limit ? parseInt(limit) : 50;
      const versions = await this.versionsService.getVersionHistory(noteId, user.id, limitValue);
      
      return {
        success: true,
        noteId,
        versions,
        count: versions.length
      };
    } catch (error) {
      console.error('Get version history error:', error);
      return {
        success: false,
        versions: [],
        error: error.message
      };
    }
  }

  @Get(':versionId')
  @ApiOperation({ summary: 'Get specific version details' })
  @ApiResponse({ status: 200, description: 'Version retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Version not found' })
  async getVersion(
    @Param('versionId') versionId: string,
    @CurrentUser() user: User,
  ) {
    try {
      const version = await this.versionsService.getVersion(versionId, user.id);
      
      return {
        success: true,
        version
      };
    } catch (error) {
      console.error('Get version error:', error);
      return {
        success: false,
        version: null,
        error: error.message
      };
    }
  }

  @Get('notes/:noteId/compare')
  @ApiOperation({ summary: 'Compare two versions of a note' })
  @ApiResponse({ status: 200, description: 'Version comparison retrieved successfully' })
  @ApiQuery({ name: 'from', required: true, description: 'From version number' })
  @ApiQuery({ name: 'to', required: true, description: 'To version number' })
  async compareVersions(
    @Param('noteId') noteId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @CurrentUser() user: User,
  ) {
    try {
      const fromVersion = parseInt(from);
      const toVersion = parseInt(to);

      if (isNaN(fromVersion) || isNaN(toVersion)) {
        return {
          success: false,
          message: 'Invalid version numbers'
        };
      }

      const comparison = await this.versionsService.compareVersions(
        noteId,
        fromVersion,
        toVersion,
        user.id
      );

      return {
        success: true,
        comparison
      };
    } catch (error) {
      console.error('Compare versions error:', error);
      return {
        success: false,
        comparison: null,
        error: error.message
      };
    }
  }

  @Post(':versionId/restore')
  @ApiOperation({ summary: 'Restore note to a specific version' })
  @ApiResponse({ status: 200, description: 'Note restored successfully' })
  @ApiResponse({ status: 404, description: 'Version not found' })
  async restoreVersion(
    @Param('versionId') versionId: string,
    @CurrentUser() user: User,
  ) {
    try {
      return await this.versionsService.restoreVersion(versionId, user.id);
    } catch (error) {
      console.error('Restore version error:', error);
      return {
        success: false,
        message: error.message || 'Failed to restore version'
      };
    }
  }

  @Delete(':versionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a version' })
  @ApiResponse({ status: 204, description: 'Version deleted successfully' })
  @ApiResponse({ status: 403, description: 'Cannot delete this version' })
  async deleteVersion(
    @Param('versionId') versionId: string,
    @CurrentUser() user: User,
  ) {
    try {
      await this.versionsService.deleteVersion(versionId, user.id);
      return { success: true };
    } catch (error) {
      console.error('Delete version error:', error);
      throw error;
    }
  }

  @Get('notes/:noteId/statistics')
  @ApiOperation({ summary: 'Get version statistics for a note' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getVersionStatistics(
    @Param('noteId') noteId: string,
    @CurrentUser() user: User,
  ) {
    try {
      const statistics = await this.versionsService.getVersionStatistics(noteId, user.id);
      
      return {
        success: true,
        noteId,
        statistics
      };
    } catch (error) {
      console.error('Get version statistics error:', error);
      return {
        success: false,
        statistics: null,
        error: error.message
      };
    }
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent versions across all user notes' })
  @ApiResponse({ status: 200, description: 'Recent versions retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecentVersions(
    @CurrentUser() user: User,
    @Query('limit') limit?: string,
  ) {
    try {
      const limitValue = limit ? parseInt(limit) : 20;
      const versions = await this.versionsService.getRecentVersions(user.id, limitValue);
      
      return {
        success: true,
        versions,
        count: versions.length
      };
    } catch (error) {
      console.error('Get recent versions error:', error);
      return {
        success: false,
        versions: [],
        error: error.message
      };
    }
  }

  @Post('notes/:noteId/auto-version')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Trigger automatic versioning check' })
  @ApiResponse({ status: 202, description: 'Auto-versioning triggered' })
  async triggerAutoVersioning(
    @Param('noteId') noteId: string,
    @CurrentUser() user: User,
  ) {
    try {
      // This would typically be called internally, but exposed for debugging
      return {
        success: true,
        message: 'Auto-versioning check triggered'
      };
    } catch (error) {
      console.error('Auto-versioning error:', error);
      return {
        success: false,
        message: 'Failed to trigger auto-versioning'
      };
    }
  }

  @Get('notes/:noteId/timeline')
  @ApiOperation({ summary: 'Get version timeline with visual representation' })
  @ApiResponse({ status: 200, description: 'Version timeline retrieved successfully' })
  async getVersionTimeline(
    @Param('noteId') noteId: string,
    @CurrentUser() user: User,
  ) {
    try {
      const versions = await this.versionsService.getVersionHistory(noteId, user.id, 100);
      
      // Process versions for timeline visualization
      const timeline = versions.map((version, index) => {
        const nextVersion = versions[index - 1]; // Next in chronological order
        
        return {
          ...version,
          isLatest: index === 0,
          timeFromPrevious: nextVersion 
            ? version.createdAt.getTime() - nextVersion.createdAt.getTime()
            : null,
          position: index,
          type: this.categorizeVersionChange(version.changeLog || '')
        };
      });

      return {
        success: true,
        noteId,
        timeline,
        summary: {
          totalVersions: timeline.length,
          oldestVersion: timeline[timeline.length - 1]?.createdAt,
          newestVersion: timeline[0]?.createdAt,
          averageTimeBetweenVersions: this.calculateAverageTimeBetween(timeline)
        }
      };
    } catch (error) {
      console.error('Get version timeline error:', error);
      return {
        success: false,
        timeline: [],
        error: error.message
      };
    }
  }

  private categorizeVersionChange(changeLog: string): 'major' | 'minor' | 'patch' | 'auto' {
    const log = changeLog.toLowerCase();
    
    if (log.includes('restored') || log.includes('major')) {
      return 'major';
    } else if (log.includes('auto-generated') || log.includes('auto-save')) {
      return 'auto';
    } else if (log.includes('added') && log.includes('words')) {
      const wordMatch = log.match(/added (\d+) words/);
      if (wordMatch && parseInt(wordMatch[1]) > 100) {
        return 'major';
      }
      return 'minor';
    }
    
    return 'patch';
  }

  private calculateAverageTimeBetween(timeline: any[]): number | null {
    if (timeline.length < 2) return null;
    
    const timeDifferences = timeline
      .filter(v => v.timeFromPrevious)
      .map(v => v.timeFromPrevious);
    
    if (timeDifferences.length === 0) return null;
    
    const average = timeDifferences.reduce((sum, time) => sum + time, 0) / timeDifferences.length;
    return Math.round(average / (1000 * 60)); // Convert to minutes
  }
}
