import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

interface ActivityAnalyticsJobData {
  userId: string;
  action: string;
  period?: 'daily' | 'weekly' | 'monthly';
}

@Injectable()
@Processor('activity-analytics')
export class ActivitiesProcessor extends WorkerHost {
  private readonly logger = new Logger(ActivitiesProcessor.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'update-user-analytics':
        return this.handleUpdateUserAnalytics(job);
      case 'generate-activity-report':
        return this.handleGenerateActivityReport(job);
      case 'cleanup-old-activities':
        return this.handleCleanupOldActivities(job);
      case 'calculate-productivity-score':
        return this.handleCalculateProductivityScore(job);
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async handleUpdateUserAnalytics(job: Job<ActivityAnalyticsJobData>) {
    const { userId, action } = job.data;
    
    this.logger.log(`Updating analytics for user ${userId}, action: ${action}`);
    
    try {
      // Update or create user analytics
      const today = new Date().toISOString().split('T')[0];
      
      // This is a simplified example - in production, you might have a separate analytics table
      await this.prisma.userActivity.create({
        data: {
          userId,
          action: 'ANALYTICS_UPDATE',
          metadata: {
            triggeredBy: action,
            processedAt: new Date().toISOString(),
            type: 'background_analytics'
          }
        }
      });

      this.logger.log(`✅ Analytics updated for user ${userId}`);

      return {
        userId,
        action,
        processed: true
      };

    } catch (error) {
      this.logger.error(`❌ Analytics update failed for user ${userId}:`, error);
      throw error;
    }
  }

  private async handleGenerateActivityReport(job: Job) {
    const { userId, startDate, endDate, reportType } = job.data;
    
    this.logger.log(`Generating activity report for user ${userId}`);
    
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const [activities, summary] = await Promise.all([
        // Get activities in period
        this.prisma.userActivity.findMany({
          where: {
            userId,
            createdAt: { gte: start, lte: end }
          },
          include: {
            note: { select: { title: true } }
          },
          orderBy: { createdAt: 'desc' }
        }),
        
        // Get summary statistics
        this.prisma.userActivity.groupBy({
          by: ['action'],
          where: {
            userId,
            createdAt: { gte: start, lte: end }
          },
          _count: { action: true }
        })
      ]);

      const report = {
        userId,
        reportType,
        period: { startDate, endDate },
        summary: {
          totalActivities: activities.length,
          uniqueActions: summary.length,
          activitiesByType: summary.reduce((acc, item) => {
            acc[item.action] = item._count.action;
            return acc;
          }, {}),
          mostActiveDay: this.findMostActiveDay(activities),
          productivityScore: this.calculateProductivityFromActivities(activities)
        },
        activities: activities.slice(0, 100) // Limit for report size
      };

      this.logger.log(`Activity report generated for user ${userId}. ${activities.length} activities processed`);

      return report;

    } catch (error) {
      this.logger.error(`Activity report generation failed for user ${userId}:`, error);
      throw error;
    }
  }

  private async handleCleanupOldActivities(job: Job) {
    const { olderThanDays = 90 } = job.data;
    
    this.logger.log(`Cleaning up activities older than ${olderThanDays} days`);
    
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const deletedCount = await this.prisma.userActivity.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
          // Keep important activities longer
          action: {
            notIn: [
              'NOTE_CREATE',
              'COLLABORATION_INVITE', 
              'SHARE_CREATE',
              'VERSION_RESTORE',
              'TASK_COMPLETE'
            ]
          }
        }
      });

      this.logger.log(`Cleanup completed. Deleted ${deletedCount.count} old activities`);

      return {
        deletedCount: deletedCount.count,
        cutoffDate
      };

    } catch (error) {
      this.logger.error(`Cleanup old activities failed:`, error);
      throw error;
    }
  }

  private async handleCalculateProductivityScore(job: Job) {
    const { userId, period = 'weekly' } = job.data;
    
    this.logger.log(`Calculating productivity score for user ${userId} (${period})`);
    
    try {
      const days = period === 'daily' ? 1 : period === 'weekly' ? 7 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const activities = await this.prisma.userActivity.groupBy({
        by: ['action'],
        where: {
          userId,
          createdAt: { gte: startDate }
        },
        _count: { action: true }
      });

      // Weight different activities for productivity scoring
      const productivityWeights = {
        'NOTE_CREATE': 10,
        'NOTE_UPDATE': 8,
        'TASK_COMPLETE': 15,
        'POMODORO_COMPLETE': 12,
        'SUMMARY_GENERATE': 6,
        'COLLABORATION_EDIT': 5,
        'NOTE_VIEW': 1,
        'SEARCH_QUERY': 1
      };

      let weightedScore = 0;
      let totalActivities = 0;

      activities.forEach(activity => {
        const weight = productivityWeights[activity.action] || 1;
        const count = activity._count.action;
        weightedScore += weight * count;
        totalActivities += count;
      });

      const productivity = {
        userId,
        period,
        days,
        totalActivities,
        weightedScore,
        averageScore: totalActivities > 0 ? weightedScore / totalActivities : 0,
        productivityScore: Math.min(100, Math.round((weightedScore / Math.max(totalActivities, 1)) * 10)),
        calculatedAt: new Date()
      };

      this.logger.log(`Productivity calculated for user ${userId}: ${productivity.productivityScore}/100`);

      return productivity;

    } catch (error) {
      this.logger.error(`Productivity calculation failed for user ${userId}:`, error);
      throw error;
    }
  }

  private findMostActiveDay(activities: any[]) {
    const dayCount = new Map();
    
    activities.forEach(activity => {
      const day = activity.createdAt.toISOString().split('T')[0];
      dayCount.set(day, (dayCount.get(day) || 0) + 1);
    });

    if (dayCount.size === 0) return null;

    let mostActiveDay = null;
    let maxCount = 0;

    for (const [day, count] of dayCount.entries()) {
      if (count > maxCount) {
        maxCount = count;
        mostActiveDay = day;
      }
    }

    return { date: mostActiveDay, activityCount: maxCount };
  }

  private calculateProductivityFromActivities(activities: any[]): number {
    const productiveActions = [
      'NOTE_CREATE', 'NOTE_UPDATE', 'TASK_COMPLETE', 
      'POMODORO_COMPLETE', 'SUMMARY_GENERATE'
    ];
    
    const productiveCount = activities.filter(a => 
      productiveActions.includes(a.action as string) // Fix: cast to string
    ).length;

    return activities.length > 0 
      ? Math.round((productiveCount / activities.length) * 100)
      : 0;
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`✅ Activity analytics job ${job.id} (${job.name}) completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`❌ Activity analytics job ${job.id} (${job.name}) failed:`, error);
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job, progress: number) {
    if (progress % 25 === 0) {
      this.logger.log(`📊 Activity analytics job ${job.id} progress: ${progress}%`);
    }
  }
}
