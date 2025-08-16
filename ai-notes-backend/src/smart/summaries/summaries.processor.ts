import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { SummariesService } from './summaries.service';

interface SummaryGenerationJobData {
  noteId: string;
  userId: string;
  options?: {
    minWords?: number;
    maxSummaryLength?: number;
    includeKeyPoints?: boolean;
    model?: string;
  };
}

interface BatchSummaryJobData {
  userId: string;
  noteIds: string[];
  options?: {
    minWords?: number;
    skipExisting?: boolean;
  };
}

interface SummaryMaintenanceJobData {
  userId?: string;
  olderThanDays?: number;
  updateStale?: boolean;
}

@Injectable()
@Processor('auto-summary')
export class SummariesProcessor extends WorkerHost {
  private readonly logger = new Logger(SummariesProcessor.name);

  constructor(private summariesService: SummariesService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'generate-summary':
        return this.handleGenerateSummary(job);
      case 'batch-generate-summaries':
        return this.handleBatchGenerateSummaries(job);
      case 'update-stale-summaries':
        return this.handleUpdateStaleSummaries(job);
      case 'cleanup-old-summaries':
        return this.handleCleanupOldSummaries(job);
      case 'regenerate-with-new-model':
        return this.handleRegenerateWithNewModel(job);
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async handleGenerateSummary(job: Job<SummaryGenerationJobData>) {
    const { noteId, userId, options = {} } = job.data;
    
    this.logger.log(`Generating summary for note ${noteId}`);
    
    try {
      await job.updateProgress(10);

      // Check if note exists and get content
      const note = await this.summariesService['prisma'].note.findFirst({
        where: { id: noteId, ownerId: userId, isDeleted: false },
        select: { id: true, title: true, content: true, updatedAt: true }
      });

      if (!note) {
        throw new Error(`Note ${noteId} not found or not accessible`);
      }

      await job.updateProgress(25);

      // Check word count
      const wordCount = note.content.split(/\s+/).length;
      const minWords = options.minWords || 100;
      
      if (wordCount < minWords) {
        throw new Error(`Note too short: ${wordCount} words (minimum: ${minWords})`);
      }

      await job.updateProgress(40);

      // Generate summary
      const summary = await this.summariesService.generateSummary(noteId, userId, options);

      await job.updateProgress(100);

      const result = {
        noteId,
        userId,
        summary,
        originalWordCount: wordCount,
        summaryWordCount: summary.wordCount,
        compressionRatio: Math.round((summary.wordCount / wordCount) * 100) / 100
      };

      this.logger.log(`Summary generated for note ${noteId}. Original: ${wordCount} words, Summary: ${summary.wordCount} words`);
      
      return result;
    } catch (error) {
      this.logger.error(`Summary generation failed for note ${noteId}:`, error);
      throw error;
    }
  }

  private async handleBatchGenerateSummaries(job: Job<BatchSummaryJobData>) {
    const { userId, noteIds, options = {} } = job.data;
    
    this.logger.log(`Processing batch summary generation for ${noteIds.length} notes`);
    
    try {
      const results = [];
      const totalNotes = noteIds.length;
      let successful = 0;
      let skipped = 0;
      let failed = 0;
      
      for (let i = 0; i < noteIds.length; i++) {
        const noteId = noteIds[i];
        const progress = Math.floor(((i + 1) / totalNotes) * 100);
        
        try {
          // Check if summary exists and should be skipped
          if (options.skipExisting) {
            const existingSummary = await this.summariesService['prisma'].autoSummary.findUnique({
              where: { noteId }
            });
            
            if (existingSummary) {
              results.push({
                noteId,
                success: true,
                skipped: true,
                reason: 'Summary already exists'
              });
              skipped++;
              await job.updateProgress(progress);
              continue;
            }
          }

          // Generate summary
          const summary = await this.summariesService.generateSummary(
            noteId, 
            userId, 
            { minWords: options.minWords }
          );
          
          results.push({
            noteId,
            success: true,
            summary: {
              wordCount: summary.wordCount,
              model: summary.model
            }
          });
          successful++;
          
        } catch (error) {
          this.logger.error(`Failed to generate summary for note ${noteId}:`, error);
          results.push({
            noteId,
            success: false,
            error: error.message
          });
          failed++;
        }
        
        await job.updateProgress(progress);
        
        // Small delay to prevent overwhelming the AI API
        if (i % 5 === 0 && i > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      this.logger.log(`Batch summary generation completed. Success: ${successful}, Skipped: ${skipped}, Failed: ${failed}`);
      
      return {
        userId,
        totalNotes,
        successful,
        skipped,
        failed,
        results
      };
      
    } catch (error) {
      this.logger.error(`Batch summary generation failed:`, error);
      throw error;
    }
  }

  private async handleUpdateStaleSummaries(job: Job<SummaryMaintenanceJobData>) {
    const { userId, olderThanDays = 30 } = job.data;
    
    this.logger.log(`Updating stale summaries (older than ${olderThanDays} days)`);
    
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      // Find summaries that are stale (summary created before note was last updated)
      const staleSummaries = await this.summariesService['prisma'].autoSummary.findMany({
        where: {
          ...(userId && { ownerId: userId }),
          createdAt: { lt: cutoffDate },
        },
        include: {
          note: {
            select: { id: true, title: true, updatedAt: true }
          }
        },
        take: 50 // Limit to prevent overwhelming
      });

      // Filter for actually stale summaries (summary older than note update)
      const actuallyStale = staleSummaries.filter(summary => 
        summary.createdAt < summary.note.updatedAt
      );

      let updated = 0;
      const results = [];

      for (const staleSummary of actuallyStale) {
        try {
          const newSummary = await this.summariesService.generateSummary(
            staleSummary.noteId,
            staleSummary.ownerId
          );

          results.push({
            noteId: staleSummary.noteId,
            success: true,
            oldWordCount: staleSummary.wordCount,
            newWordCount: newSummary.wordCount
          });
          updated++;

        } catch (error) {
          this.logger.error(`Failed to update stale summary for note ${staleSummary.noteId}:`, error);
          results.push({
            noteId: staleSummary.noteId,
            success: false,
            error: error.message
          });
        }

        // Small delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      this.logger.log(`Stale summaries update completed. Updated ${updated}/${actuallyStale.length} summaries`);

      return {
        userId,
        candidatesFound: actuallyStale.length,
        successfulUpdates: updated,
        results
      };

    } catch (error) {
      this.logger.error(`Update stale summaries failed:`, error);
      throw error;
    }
  }

  private async handleCleanupOldSummaries(job: Job<SummaryMaintenanceJobData>) {
    const { userId, olderThanDays = 90 } = job.data;
    
    this.logger.log(`Cleaning up old summaries (older than ${olderThanDays} days)`);
    
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      // Only cleanup summaries for deleted notes or very old unused summaries
      const deletedCount = await this.summariesService['prisma'].autoSummary.deleteMany({
        where: {
          ...(userId && { ownerId: userId }),
          OR: [
            // Summaries for deleted notes
            { note: { isDeleted: true } },
            // Very old summaries that haven't been accessed
            {
              createdAt: { lt: cutoffDate },
              note: {
                updatedAt: { lt: cutoffDate } // Note also hasn't been updated
              }
            }
          ]
        }
      });

      this.logger.log(`Cleanup completed. Deleted ${deletedCount.count} old summaries`);

      return {
        userId,
        deletedCount: deletedCount.count,
        cutoffDate
      };

    } catch (error) {
      this.logger.error(`Cleanup old summaries failed:`, error);
      throw error;
    }
  }

  private async handleRegenerateWithNewModel(job: Job) {
    const { userId, newModel, noteIds } = job.data;
    
    this.logger.log(`Regenerating summaries with new model: ${newModel}`);
    
    try {
      const notes = noteIds ? 
        await this.summariesService['prisma'].note.findMany({
          where: { id: { in: noteIds }, ownerId: userId },
          select: { id: true, title: true }
        }) :
        await this.summariesService['prisma'].note.findMany({
          where: { ownerId: userId, isDeleted: false },
          select: { id: true, title: true },
          take: 20 // Limit for safety
        });

      let regenerated = 0;
      const results = [];

      for (const note of notes) {
        try {
          const summary = await this.summariesService.generateSummary(
            note.id,
            userId,
            { model: newModel }
          );

          results.push({
            noteId: note.id,
            success: true,
            model: newModel,
            wordCount: summary.wordCount
          });
          regenerated++;

        } catch (error) {
          this.logger.error(`Failed to regenerate summary for note ${note.id}:`, error);
          results.push({
            noteId: note.id,
            success: false,
            error: error.message
          });
        }

        // Delay between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      this.logger.log(`Summary regeneration completed. Regenerated ${regenerated}/${notes.length} summaries with model ${newModel}`);

      return {
        userId,
        newModel,
        processedNotes: notes.length,
        successfulRegenerations: regenerated,
        results
      };

    } catch (error) {
      this.logger.error(`Regenerate with new model failed:`, error);
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`✅ Summary job ${job.id} (${job.name}) completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`❌ Summary job ${job.id} (${job.name}) failed:`, error);
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job, progress: number) {
    if (progress % 25 === 0) { // Log every 25%
      this.logger.log(`📊 Summary job ${job.id} progress: ${progress}%`);
    }
  }
}
