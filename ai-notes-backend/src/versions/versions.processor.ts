import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

interface VersionCleanupJobData {
  noteId: string;
  userId: string;
  maxVersions?: number;
  olderThanDays?: number;
}

interface VersionAnalyticsJobData {
  noteId: string;
  userId: string;
}

@Injectable()
@Processor('version-control')
export class VersionsProcessor extends WorkerHost {
  private readonly logger = new Logger(VersionsProcessor.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'cleanup-old-versions':
        return this.handleCleanupOldVersions(job);
      case 'update-version-analytics':
        return this.handleUpdateVersionAnalytics(job);
      case 'generate-version-summary':
        return this.handleGenerateVersionSummary(job);
      case 'optimize-version-storage':
        return this.handleOptimizeVersionStorage(job);
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async handleCleanupOldVersions(job: Job<VersionCleanupJobData>) {
    const { noteId, userId, maxVersions = 50, olderThanDays = 90 } = job.data;
    
    this.logger.log(`Cleaning up old versions for note ${noteId}`);
    
    try {
      // Get version count
      const totalVersions = await this.prisma.noteVersion.count({
        where: { noteId }
      });

      if (totalVersions <= 10) {
        this.logger.log(`Only ${totalVersions} versions exist, skipping cleanup`);
        return { noteId, deletedCount: 0, reason: 'Too few versions to cleanup' };
      }

      let deletedCount = 0;

      // Strategy 1: Remove versions older than specified days (keep at least 10)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const oldVersions = await this.prisma.noteVersion.findMany({
        where: {
          noteId,
          createdAt: { lt: cutoffDate }
        },
        orderBy: { version: 'asc' },
        take: Math.max(0, totalVersions - 10) // Keep at least 10 versions
      });

      if (oldVersions.length > 0) {
        const oldVersionIds = oldVersions.map(v => v.id);
        
        const deleted = await this.prisma.noteVersion.deleteMany({
          where: { id: { in: oldVersionIds } }
        });

        deletedCount += deleted.count;
        this.logger.log(`Deleted ${deleted.count} old versions (older than ${olderThanDays} days)`);
      }

      // Strategy 2: If still too many versions, keep only the most significant ones
      const remainingCount = totalVersions - deletedCount;
      if (remainingCount > maxVersions) {
        const excessCount = remainingCount - maxVersions;
        
        // Keep versions with significant changes, delete auto-generated ones first
        const autoVersions = await this.prisma.noteVersion.findMany({
          where: {
            noteId,
            changeLog: {
              contains: 'Auto-generated',
              mode: 'insensitive'
            }
          },
          orderBy: { version: 'asc' },
          take: excessCount
        });

        if (autoVersions.length > 0) {
          const autoVersionIds = autoVersions.map(v => v.id);
          
          const deleted = await this.prisma.noteVersion.deleteMany({
            where: { id: { in: autoVersionIds } }
          });

          deletedCount += deleted.count;
          this.logger.log(`Deleted ${deleted.count} auto-generated versions to reduce total count`);
        }
      }

      this.logger.log(`Version cleanup completed for note ${noteId}. Deleted ${deletedCount} versions`);

      return {
        noteId,
        userId,
        deletedCount,
        totalVersionsBefore: totalVersions,
        totalVersionsAfter: totalVersions - deletedCount
      };

    } catch (error) {
      this.logger.error(`Version cleanup failed for note ${noteId}:`, error);
      throw error;
    }
  }

  private async handleUpdateVersionAnalytics(job: Job<VersionAnalyticsJobData>) {
    const { noteId, userId } = job.data;
    
    this.logger.log(`Updating version analytics for note ${noteId}`);
    
    try {
      // Get version statistics
      const [versionCount, firstVersion, lastVersion, changeTypes] = await Promise.all([
        this.prisma.noteVersion.count({ where: { noteId } }),
        this.prisma.noteVersion.findFirst({
          where: { noteId },
          orderBy: { version: 'asc' }
        }),
        this.prisma.noteVersion.findFirst({
          where: { noteId },
          orderBy: { version: 'desc' }
        }),
        this.prisma.noteVersion.findMany({
          where: { noteId },
          select: { changeLog: true, createdAt: true }
        })
      ]);

      // Analyze change patterns
      const changeTypeStats = this.analyzeChangeTypes(changeTypes);
      const versionFrequency = this.calculateVersionFrequency(firstVersion, lastVersion, versionCount);
      
      // Update note analytics if exists
      try {
        await this.prisma.noteAnalytics.upsert({
          where: { noteId },
          update: {
            // Add version-specific analytics if needed
          },
          create: {
            noteId,
            viewCount: 0,
            editCount: versionCount,
            shareCount: 0,
            lastEdited: lastVersion?.createdAt,
            wordCount: 0 // Would need to be calculated from current note
          }
        });
      } catch (error) {
        // Ignore if noteAnalytics table doesn't exist yet
        this.logger.debug('NoteAnalytics table not available:', error.message);
      }

      this.logger.log(`Version analytics updated for note ${noteId}`);

      return {
        noteId,
        userId,
        analytics: {
          versionCount,
          changeTypeStats,
          versionFrequency,
          firstVersionDate: firstVersion?.createdAt,
          lastVersionDate: lastVersion?.createdAt
        }
      };

    } catch (error) {
      this.logger.error(`Version analytics update failed for note ${noteId}:`, error);
      throw error;
    }
  }

  private async handleGenerateVersionSummary(job: Job) {
    const { userId, startDate, endDate } = job.data;
    
    this.logger.log(`Generating version summary for user ${userId}`);
    
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const [totalVersions, noteVersionCounts, changeTypeStats, timelineData] = await Promise.all([
        // Total versions created in period
        this.prisma.noteVersion.count({
          where: {
            note: { ownerId: userId },
            createdAt: { gte: start, lte: end }
          }
        }),
        
        // Versions per note
        this.prisma.noteVersion.groupBy({
          by: ['noteId'],
          where: {
            note: { ownerId: userId },
            createdAt: { gte: start, lte: end }
          },
          _count: { noteId: true },
          orderBy: { _count: { noteId: 'desc' } },
          take: 10
        }),
        
        // Change type analysis
        this.prisma.noteVersion.findMany({
          where: {
            note: { ownerId: userId },
            createdAt: { gte: start, lte: end }
          },
          select: { changeLog: true }
        }),
        
        // Timeline data (versions by day)
        this.prisma.noteVersion.groupBy({
          by: ['createdAt'],
          where: {
            note: { ownerId: userId },
            createdAt: { gte: start, lte: end }
          },
          _count: { createdAt: true }
        })
      ]);

      // Process timeline data by day
      const versionsByDay = this.groupVersionsByDay(timelineData);
      
      // Analyze change types
      const changeAnalysis = this.analyzeChangeTypes(changeTypeStats);

      const summary = {
        userId,
        period: { startDate, endDate },
        totalVersions,
        averageVersionsPerDay: totalVersions / this.daysBetween(start, end),
        mostActiveNotes: noteVersionCounts.slice(0, 5),
        changeTypeBreakdown: changeAnalysis,
        versionsByDay,
        insights: this.generateInsights(totalVersions, changeAnalysis, versionsByDay)
      };

      this.logger.log(`Version summary generated for user ${userId}. ${totalVersions} versions in period`);

      return summary;

    } catch (error) {
      this.logger.error(`Version summary generation failed for user ${userId}:`, error);
      throw error;
    }
  }

  private async handleOptimizeVersionStorage(job: Job) {
    const { noteId } = job.data;
    
    this.logger.log(`Optimizing version storage for note ${noteId || 'all notes'}`);
    
    try {
      // Find versions with very large content that could be compressed
      const largeVersions = await this.prisma.noteVersion.findMany({
        where: noteId ? { noteId } : {},
        select: { id: true, content: true },
        // This is a simplified approach - in production, you might want to:
        // 1. Compress content using gzip
        // 2. Store only diffs for similar versions
        // 3. Move old versions to cold storage
      });

      let optimizedCount = 0;

      // Example: Simple optimization by removing excessive whitespace
      for (const version of largeVersions) {
        if (version.content.length > 50000) { // 50KB+
          const optimizedContent = version.content
            .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
            .replace(/[ ]{2,}/g, ' ') // Replace multiple spaces with single
            .trim();

          if (optimizedContent.length < version.content.length) {
            await this.prisma.noteVersion.update({
              where: { id: version.id },
              data: { content: optimizedContent }
            });
            optimizedCount++;
          }
        }
      }

      this.logger.log(`Version storage optimization completed. Optimized ${optimizedCount} versions`);

      return {
        noteId,
        totalVersionsProcessed: largeVersions.length,
        optimizedCount,
        message: 'Version storage optimization completed'
      };

    } catch (error) {
      this.logger.error(`Version storage optimization failed:`, error);
      throw error;
    }
  }

  private analyzeChangeTypes(versions: any[]) {
    const stats = {
      autoGenerated: 0,
      userInitiated: 0,
      restorations: 0,
      majorChanges: 0,
      minorChanges: 0
    };

    versions.forEach(version => {
      const log = (version.changeLog || '').toLowerCase();
      
      if (log.includes('auto-generated') || log.includes('auto-save')) {
        stats.autoGenerated++;
      } else {
        stats.userInitiated++;
      }

      if (log.includes('restored')) {
        stats.restorations++;
      }

      if (log.includes('added') && log.includes('words')) {
        const match = log.match(/added (\d+) words/);
        if (match && parseInt(match[1]) > 100) {
          stats.majorChanges++;
        } else {
          stats.minorChanges++;
        }
      }
    });

    return stats;
  }

  private calculateVersionFrequency(firstVersion: any, lastVersion: any, versionCount: number) {
    if (!firstVersion || !lastVersion || versionCount <= 1) {
      return 0;
    }

    const timeDiff = lastVersion.createdAt.getTime() - firstVersion.createdAt.getTime();
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    
    return daysDiff > 0 ? versionCount / daysDiff : 0;
  }

  private groupVersionsByDay(timelineData: any[]) {
    const versionsByDay = new Map();

    timelineData.forEach(item => {
      const date = new Date(item.createdAt).toISOString().split('T')[0];
      versionsByDay.set(date, (versionsByDay.get(date) || 0) + item._count.createdAt);
    });

    return Array.from(versionsByDay.entries()).map(([date, count]) => ({
      date,
      count
    }));
  }

  private daysBetween(start: Date, end: Date): number {
    const timeDiff = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
  }

  private generateInsights(totalVersions: number, changeAnalysis: any, versionsByDay: any[]) {
    const insights = [];

    if (totalVersions > 100) {
      insights.push('High version activity - consider version cleanup');
    }

    if (changeAnalysis.autoGenerated > changeAnalysis.userInitiated * 2) {
      insights.push('Mostly auto-generated versions - review auto-versioning settings');
    }

    if (versionsByDay.length > 0) {
      const maxDay = versionsByDay.reduce((max, day) => day.count > max.count ? day : max);
      insights.push(`Most active day: ${maxDay.date} (${maxDay.count} versions)`);
    }

    return insights;
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`✅ Version control job ${job.id} (${job.name}) completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`❌ Version control job ${job.id} (${job.name}) failed:`, error);
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job, progress: number) {
    if (progress % 25 === 0) {
      this.logger.log(`📊 Version control job ${job.id} progress: ${progress}%`);
    }
  }
}
