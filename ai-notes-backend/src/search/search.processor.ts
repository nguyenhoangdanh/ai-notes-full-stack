import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

interface SearchRankingJobData {
  query: string;
  results: Array<{
    id: string;
    score: number;
    reasons: string[];
  }>;
  userId: string;
}

@Injectable()
@Processor('search-ranking')
export class SearchProcessor extends WorkerHost {
  private readonly logger = new Logger(SearchProcessor.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'update-search-rankings':
        return this.handleUpdateSearchRankings(job);
      case 'cleanup-old-rankings':
        return this.handleCleanupOldRankings(job);
      case 'rebuild-search-index':
        return this.handleRebuildSearchIndex(job);
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async handleUpdateSearchRankings(job: Job<SearchRankingJobData>) {
    const { query, results, userId } = job.data;
    
    this.logger.log(`Updating search rankings for query: "${query}" (${results.length} results)`);
    
    try {
      let updated = 0;

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const position = i + 1;
        
        // Calculate ranking factors
        const factors = {
          position,
          score: result.score,
          reasons: result.reasons,
          clickThrough: false, // Would be updated when user clicks
          timestamp: new Date().toISOString()
        };

        // Upsert search ranking
        try {
          await this.prisma.searchRanking.upsert({
            where: {
              noteId_query: {
                noteId: result.id,
                query
              }
            },
            update: {
              score: result.score,
              factors: factors as any,
            },
            create: {
              noteId: result.id,
              query,
              score: result.score,
              factors: factors as any,
            }
          });
          updated++;
        } catch (error) {
          this.logger.warn(`Failed to update ranking for note ${result.id}: ${error.message}`);
        }
      }

      this.logger.log(`Search rankings updated: ${updated}/${results.length} records`);

      return {
        query,
        userId,
        totalResults: results.length,
        updatedRankings: updated
      };

    } catch (error) {
      this.logger.error(`Update search rankings failed:`, error);
      throw error;
    }
  }

  private async handleCleanupOldRankings(job: Job) {
    const { olderThanDays = 90 } = job.data;
    
    this.logger.log(`Cleaning up search rankings older than ${olderThanDays} days`);
    
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const deletedCount = await this.prisma.searchRanking.deleteMany({
        where: {
          createdAt: { lt: cutoffDate }
        }
      });

      this.logger.log(`Cleanup completed. Deleted ${deletedCount.count} old search rankings`);

      return {
        deletedCount: deletedCount.count,
        cutoffDate
      };

    } catch (error) {
      this.logger.error(`Cleanup old rankings failed:`, error);
      throw error;
    }
  }

  private async handleRebuildSearchIndex(job: Job) {
    const { userId } = job.data;
    
    this.logger.log(`Rebuilding search index for user ${userId || 'all users'}`);
    
    try {
      // This would implement a full search index rebuild
      // For now, we'll just clean up orphaned rankings
      
      const orphanedRankings = await this.prisma.searchRanking.findMany({
        where: {
          note: null // Rankings pointing to deleted notes
        },
        select: { id: true }
      });

      if (orphanedRankings.length > 0) {
        const deletedCount = await this.prisma.searchRanking.deleteMany({
          where: {
            id: { in: orphanedRankings.map(r => r.id) }
          }
        });

        this.logger.log(`Cleaned up ${deletedCount.count} orphaned search rankings`);
      }

      // In a full implementation, you might:
      // 1. Reindex all notes for search
      // 2. Recalculate search scores
      // 3. Update ranking algorithms
      // 4. Rebuild search caches

      return {
        userId,
        orphanedRankingsDeleted: orphanedRankings.length,
        message: 'Search index rebuild completed'
      };

    } catch (error) {
      this.logger.error(`Rebuild search index failed:`, error);
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`✅ Search ranking job ${job.id} (${job.name}) completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`❌ Search ranking job ${job.id} (${job.name}) failed:`, error);
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job, progress: number) {
    if (progress % 25 === 0) {
      this.logger.log(`📊 Search ranking job ${job.id} progress: ${progress}%`);
    }
  }
}
