import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActivitiesService, ActivityAction } from './activities.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../types/user.types';
import { IsString, IsOptional, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetActivitiesDto {
  @IsOptional()
  @IsEnum([
    'NOTE_CREATE', 'NOTE_UPDATE', 'NOTE_DELETE', 'NOTE_VIEW',
    'SEARCH_QUERY', 'SEARCH_CLICK',
    'COLLABORATION_JOIN', 'COLLABORATION_INVITE', 'COLLABORATION_EDIT',
    'SHARE_CREATE', 'SHARE_VIEW', 'SHARE_ACCESS',
    'VERSION_CREATE', 'VERSION_RESTORE',
    'CATEGORY_CREATE', 'CATEGORY_ASSIGN',
    'DUPLICATE_DETECT', 'DUPLICATE_MERGE',
    'SUMMARY_GENERATE', 'SUMMARY_VIEW',
    'CHAT_QUERY', 'CHAT_RESPONSE',
    'LOGIN', 'LOGOUT',
    'SETTINGS_UPDATE',
    'EXPORT_START', 'EXPORT_COMPLETE',
    'TASK_CREATE', 'TASK_COMPLETE',
    'POMODORO_START', 'POMODORO_COMPLETE'
  ])
  action?: ActivityAction;

  @IsOptional()
  @IsString()
  noteId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

@ApiTags('activities')
@ApiBearerAuth()
@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get user activities with filters' })
  @ApiResponse({ status: 200, description: 'Activities retrieved successfully' })
  async getActivities(
    @Query() query: GetActivitiesDto,
    @CurrentUser() user: User,
  ) {
    try {
      const options = {
        action: query.action,
        noteId: query.noteId,
        limit: query.limit,
        offset: query.offset,
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
      };

      const activities = await this.activitiesService.getActivities(user.id, options);
      
      return {
        success: true,
        activities,
        count: activities.length,
        filters: {
          action: query.action,
          noteId: query.noteId,
          dateRange: query.startDate && query.endDate ? {
            start: query.startDate,
            end: query.endDate
          } : null
        }
      };
    } catch (error) {
      console.error('Get activities error:', error);
      return {
        success: false,
        activities: [],
        error: error.message
      };
    }
  }

  @Get('insights')
  @ApiOperation({ summary: 'Get activity insights and analytics' })
  @ApiResponse({ status: 200, description: 'Activity insights retrieved successfully' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to analyze' })
  async getActivityInsights(
    @CurrentUser() user: User,
    @Query('days') days?: string,
  ) {
    try {
      const daysValue = days ? parseInt(days) : 30;
      const insights = await this.activitiesService.getActivityInsights(user.id, daysValue);
      
      return {
        success: true,
        insights,
        period: {
          days: daysValue,
          startDate: new Date(Date.now() - daysValue * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Get activity insights error:', error);
      return {
        success: false,
        insights: null,
        error: error.message
      };
    }
  }

  @Get('feed')
  @ApiOperation({ summary: 'Get activity feed for dashboard' })
  @ApiResponse({ status: 200, description: 'Activity feed retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getActivityFeed(
    @CurrentUser() user: User,
    @Query('limit') limit?: string,
  ) {
    try {
      const limitValue = limit ? parseInt(limit) : 20;
      const feed = await this.activitiesService.getActivityFeed(user.id, limitValue);
      
      return {
        success: true,
        feed,
        count: feed.length
      };
    } catch (error) {
      console.error('Get activity feed error:', error);
      return {
        success: false,
        feed: [],
        error: error.message
      };
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get activity statistics summary' })
  @ApiResponse({ status: 200, description: 'Activity stats retrieved successfully' })
  async getActivityStats(@CurrentUser() user: User) {
    try {
      const stats = await this.activitiesService.getActivityStats(user.id);
      
      return {
        success: true,
        stats
      };
    } catch (error) {
      console.error('Get activity stats error:', error);
      return {
        success: false,
        stats: {
          today: 0,
          thisWeek: 0,
          thisMonth: 0,
          total: 0,
          currentStreak: 0,
          longestStreak: 0,
          averagePerDay: 0
        }
      };
    }
  }

  @Post('track')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Manually track an activity' })
  @ApiResponse({ status: 201, description: 'Activity tracked successfully' })
  async trackActivity(
    @Body() data: {
      action: ActivityAction;
      noteId?: string;
      metadata?: Record<string, any>;
    },
    @CurrentUser() user: User,
  ) {
    try {
      const activity = await this.activitiesService.recordActivity({
        userId: user.id,
        action: data.action,
        noteId: data.noteId,
        metadata: data.metadata
      });

      return {
        success: true,
        activity,
        message: 'Activity tracked successfully'
      };
    } catch (error) {
      console.error('Track activity error:', error);
      return {
        success: false,
        message: 'Failed to track activity',
        error: error.message
      };
    }
  }

  @Delete('cleanup')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clean up old activities (admin only)' })
  @ApiResponse({ status: 204, description: 'Old activities cleaned up successfully' })
  @ApiQuery({ name: 'days', required: false, description: 'Delete activities older than N days' })
  async cleanupOldActivities(
    @Query('days') days?: string,
  ) {
    try {
      // In a real app, you'd check for admin permissions here
      const daysValue = days ? parseInt(days) : 90;
      const result = await this.activitiesService.deleteOldActivities(daysValue);
      
      return {
        success: true,
        deletedCount: result.deletedCount,
        cutoffDate: result.cutoffDate
      };
    } catch (error) {
      console.error('Cleanup activities error:', error);
      throw error;
    }
  }

  @Get('export')
  @ApiOperation({ summary: 'Export activity data' })
  @ApiResponse({ status: 200, description: 'Activity data exported successfully' })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv'] })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async exportActivities(
      @Query('format') format: 'json' | 'csv' = 'json',
    @CurrentUser() user: User,
    @Query('days') days?: string,
  ) {
    try {
      const daysValue = days ? parseInt(days) : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysValue);

      const activities = await this.activitiesService.getActivities(user.id, {
        startDate,
        endDate: new Date(),
        limit: 10000 // Large limit for export
      });

      if (format === 'csv') {
        // Convert to CSV format
        const csvHeader = 'Date,Action,Note,Metadata\n';
        const csvData = activities.map(activity => 
          `${activity.createdAt.toISOString()},${activity.action},"${activity.note?.title || ''}","${JSON.stringify(activity.metadata)}"`
        ).join('\n');
        
        return {
          success: true,
          data: csvHeader + csvData,
          format: 'csv',
          count: activities.length
        };
      }

      return {
        success: true,
        data: activities,
        format: 'json',
        count: activities.length,
        period: {
          days: daysValue,
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Export activities error:', error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  }

  @Get('heatmap')
  @ApiOperation({ summary: 'Get activity heatmap data' })
  @ApiResponse({ status: 200, description: 'Activity heatmap data retrieved' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getActivityHeatmap(
    @CurrentUser() user: User,
    @Query('days') days?: string,
  ) {
    try {
      const daysValue = days ? parseInt(days) : 365;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysValue);

      const activities = await this.activitiesService.getActivities(user.id, {
        startDate,
        endDate: new Date(),
        limit: 50000
      });

      // Group activities by date and hour
      const heatmapData = new Map();
      
      activities.forEach(activity => {
        const date = activity.createdAt.toISOString().split('T')[0];
        const hour = activity.createdAt.getHours();
        const key = `${date}-${hour}`;
        
        heatmapData.set(key, (heatmapData.get(key) || 0) + 1);
      });

      const heatmap = Array.from(heatmapData.entries()).map(([key, count]) => {
        const [date, hour] = key.split('-');
        return {
          date,
          hour: parseInt(hour),
          count
        };
      });

      return {
        success: true,
        heatmap,
        period: {
          days: daysValue,
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Get activity heatmap error:', error);
      return {
        success: false,
        heatmap: [],
        error: error.message
      };
    }
  }

  @Get('productivity')
  @ApiOperation({ summary: 'Get productivity metrics' })
  @ApiResponse({ status: 200, description: 'Productivity metrics retrieved' })
  async getProductivityMetrics(@CurrentUser() user: User) {
    try {
      const insights = await this.activitiesService.getActivityInsights(user.id, 30);
      
      // Calculate productivity metrics
      const productiveActivities = [
        'NOTE_CREATE', 'NOTE_UPDATE', 'TASK_COMPLETE', 
        'POMODORO_COMPLETE', 'SUMMARY_GENERATE'
      ];
      
      const productiveCount = Object.entries(insights.activitiesByType)
        .filter(([action]) => productiveActivities.includes(action))
        .reduce((sum, [, count]) => sum + count, 0);

      const totalActivities = Object.values(insights.activitiesByType)
        .reduce((sum, count) => sum + count, 0);

      const productivityRatio = totalActivities > 0 ? productiveCount / totalActivities : 0;

      return {
        success: true,
        metrics: {
          productivityScore: insights.productivityScore,
          productivityRatio: Math.round(productivityRatio * 100),
          productiveActivities: productiveCount,
          totalActivities,
          averageSessionDuration: insights.averageSessionDuration,
          mostActiveHours: insights.mostActiveHours,
          weeklyTrends: insights.weeklyTrends
        }
      };
    } catch (error) {
      console.error('Get productivity metrics error:', error);
      return {
        success: false,
        metrics: null,
        error: error.message
      };
    }
  }
}
