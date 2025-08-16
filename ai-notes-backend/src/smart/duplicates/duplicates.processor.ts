import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { DuplicatesService } from './duplicates.service';

interface DuplicateDetectionJobData {
  userId: string;
  noteId?: string;
  threshold?: number;
  batchSize?: number;
}

interface BatchDuplicateJobData {
  userId: string;
  noteIds: string[];
  threshold?: number;
}

@Injectable()
@Processor('duplicate-detection')
export class DuplicatesProcessor extends WorkerHost {
  private readonly logger = new Logger(DuplicatesProcessor.name);

  constructor(private duplicatesService: DuplicatesService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'detect-duplicates':
        return this.handleDetectDuplicates(job);
      case 'batch-duplicate-check':
        return this.handleBatchDuplicateCheck(job);
      case 'auto-merge-high-confidence':
        return this.handleAutoMergeHighConfidence(job);
      case 'cleanup-dismissed-reports':
        return this.handleCleanupDismissedReports(job);
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async handleDetectDuplicates(job: Job<DuplicateDetectionJobData>) {
    const { userId, noteId, threshold = 0.7 } = job.data;
    
    this.logger.log(`Processing duplicate detection for user ${userId}${noteId ? ` (note: ${noteId})` : ''}`);
    
    try {
      // Update job progress
      await job.updateProgress(10);

      const duplicates = await this.duplicatesService.findDuplicates(
        userId, 
        noteId, 
        threshold
      );

      await job.updateProgress(60);

      // Auto-create reports for high-confidence duplicates
      let reportsCreated = 0;
      const highConfidenceDuplicates = duplicates.filter(d => d.similarity >= 0.85);

      for (const duplicate of highConfidenceDuplicates) {
        try {
          await this.duplicatesService.createDuplicateReport(
            duplicate.originalNoteId,
            duplicate.duplicateNoteId,
            duplicate.similarity,
            duplicate.type,
            userId
          );
          reportsCreated++;
        } catch (error) {
          // Report might already exist, ignore
          this.logger.warn(`Could not create report for duplicate: ${error.message}`);
        }
      }

      await job.updateProgress(100);

      const result = {
        userId,
        noteId,
        duplicatesFound: duplicates.length,
        reportsCreated,
        highConfidenceDuplicates: highConfidenceDuplicates.length,
        threshold,
        results: duplicates
      };

      this.logger.log(`Duplicate detection completed for user ${userId}. Found ${duplicates.length} duplicates, created ${reportsCreated} reports`);
      
      return result;
    } catch (error) {
      this.logger.error(`Duplicate detection failed for user ${userId}:`, error);
      throw error;
    }
  }

  private async handleBatchDuplicateCheck(job: Job<BatchDuplicateJobData>) {
    const { userId, noteIds, threshold = 0.7 } = job.data;
    
    this.logger.log(`Processing batch duplicate check for ${noteIds.length} notes`);
    
    try {
      const results = [];
      const totalNotes = noteIds.length;
      
      for (let i = 0; i < noteIds.length; i++) {
        const noteId = noteIds[i];
        const progress = Math.floor(((i + 1) / totalNotes) * 100);
        
        try {
          const duplicates = await this.duplicatesService.findDuplicates(
            userId,
            noteId,
            threshold
          );
          
          results.push({
            noteId,
            success: true,
            duplicatesFound: duplicates.length,
            duplicates
          });
          
        } catch (error) {
          this.logger.error(`Failed to check duplicates for note ${noteId}:`, error);
          results.push({
            noteId,
            success: false,
            error: error.message
          });
        }
        
        await job.updateProgress(progress);
        
        // Small delay to prevent overwhelming the system
        if (i % 10 === 0 && i > 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      const successful = results.filter(r => r.success).length;
      const totalDuplicates = results
        .filter(r => r.success)
        .reduce((sum, r) => sum + r.duplicatesFound, 0);
      
      this.logger.log(`Batch duplicate check completed. Processed ${successful}/${totalNotes} notes, found ${totalDuplicates} total duplicates`);
      
      return {
        userId,
        totalNotes,
        successful,
        failed: totalNotes - successful,
        totalDuplicatesFound: totalDuplicates,
        results
      };
      
    } catch (error) {
      this.logger.error(`Batch duplicate check failed:`, error);
      throw error;
    }
  }

  private async handleAutoMergeHighConfidence(job: Job) {
    const { userId, minSimilarity = 0.95 } = job.data;
    
    this.logger.log(`Processing auto-merge for high confidence duplicates (similarity >= ${minSimilarity})`);
    
    try {
      // Find pending reports with very high similarity
      const highConfidenceReports = await this.duplicatesService['prisma'].duplicateReport.findMany({
        where: {
          ownerId: userId,
          status: 'PENDING',
          similarity: { gte: minSimilarity }
        },
        include: {
          originalNote: { select: { id: true, title: true } },
          duplicateNote: { select: { id: true, title: true } }
        },
        take: 20 // Limit to prevent overwhelming
      });

      let mergedCount = 0;
      const results = [];

      for (const report of highConfidenceReports) {
        try {
          await this.duplicatesService.mergeNotes(
            report.originalNoteId,
            report.duplicateNoteId,
            userId
          );
          
          mergedCount++;
          results.push({
            reportId: report.id,
            originalNoteId: report.originalNoteId,
            duplicateNoteId: report.duplicateNoteId,
            similarity: report.similarity,
            success: true
          });
          
        } catch (error) {
          this.logger.error(`Failed to auto-merge notes from report ${report.id}:`, error);
          results.push({
            reportId: report.id,
            success: false,
            error: error.message
          });
        }
      }

      this.logger.log(`Auto-merge completed. Merged ${mergedCount}/${highConfidenceReports.length} high-confidence duplicates`);

      return {
        userId,
        candidatesFound: highConfidenceReports.length,
        successfulMerges: mergedCount,
        results
      };

    } catch (error) {
      this.logger.error(`Auto-merge high confidence duplicates failed:`, error);
      throw error;
    }
  }

  private async handleCleanupDismissedReports(job: Job) {
    const { userId, olderThanDays = 30 } = job.data;
    
    this.logger.log(`Cleaning up dismissed duplicate reports older than ${olderThanDays} days`);
    
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const deletedCount = await this.duplicatesService['prisma'].duplicateReport.deleteMany({
        where: {
          ownerId: userId,
          status: 'DISMISSED',
          resolvedAt: { lt: cutoffDate }
        }
      });

      this.logger.log(`Cleanup completed. Deleted ${deletedCount.count} old dismissed reports`);

      return {
        userId,
        deletedCount: deletedCount.count,
        cutoffDate
      };

    } catch (error) {
      this.logger.error(`Cleanup dismissed reports failed:`, error);
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`✅ Duplicate detection job ${job.id} (${job.name}) completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`❌ Duplicate detection job ${job.id} (${job.name}) failed:`, error);
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job, progress: number) {
    if (progress % 25 === 0) { // Log every 25%
      this.logger.log(`📊 Duplicate detection job ${job.id} progress: ${progress}%`);
    }
  }
}
