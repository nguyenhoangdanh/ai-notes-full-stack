import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CategoriesService } from './categories.service';

@Processor('smart-categorization')
export class CategoriesProcessor extends WorkerHost {
  private readonly logger = new Logger(CategoriesProcessor.name);

  constructor(private categoriesService: CategoriesService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'auto-categorize-note':
        return this.handleAutoCategorizeNote(job);
      case 'batch-categorize':
        return this.handleBatchCategorize(job);
      case 'update-category-keywords':
        return this.handleUpdateCategoryKeywords(job);
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async handleAutoCategorizeNote(job: Job) {
    const { noteId, userId, threshold = 0.7 } = job.data;
    
    this.logger.log(`Processing auto-categorization for note ${noteId}`);
    
    try {
      const results = await this.categoriesService.autoCategorizeNote(noteId, userId, threshold);
      
      this.logger.log(`Auto-categorization completed for note ${noteId}. Applied ${results.filter(r => r.assigned).length} categories`);
      
      return {
        noteId,
        categoriesApplied: results.filter(r => r.assigned).length,
        suggestions: results.length,
        results,
      };
    } catch (error) {
      this.logger.error(`Auto-categorization failed for note ${noteId}:`, error);
      throw error;
    }
  }

  private async handleBatchCategorize(job: Job) {
    const { noteIds, userId, threshold = 0.7 } = job.data;
    
    this.logger.log(`Processing batch categorization for ${noteIds.length} notes`);
    
    const results = [];
    
    for (const noteId of noteIds) {
      try {
        const result = await this.categoriesService.autoCategorizeNote(noteId, userId, threshold);
        results.push({ noteId, success: true, result });
        
        // Add small delay between notes to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        this.logger.error(`Failed to categorize note ${noteId}:`, error);
        results.push({ noteId, success: false, error: error.message });
      }
    }
    
    this.logger.log(`Batch categorization completed. Processed ${results.length} notes`);
    
    return {
      total: noteIds.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    };
  }

  private async handleUpdateCategoryKeywords(job: Job) {
    const { categoryId, userId } = job.data;
    
    this.logger.log(`Updating keywords for category ${categoryId}`);
    
    // This could analyze all notes in the category and suggest new keywords
    // Implementation would depend on specific requirements
    
    return { categoryId, updated: true };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed:`, error);
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job, progress: number) {
    this.logger.log(`Job ${job.id} progress: ${progress}%`);
  }
}
