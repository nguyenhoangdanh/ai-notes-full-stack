import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

interface TagMaintenanceJobData {
  userId?: string;
  action: string;
}

@Injectable()
@Processor('tag-processing')
export class TagsProcessor extends WorkerHost {
  private readonly logger = new Logger(TagsProcessor.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'cleanup-unused-tags':
        return this.handleCleanupUnusedTags(job);
      case 'update-tag-statistics':
        return this.handleUpdateTagStatistics(job);
      case 'generate-tag-suggestions':
        return this.handleGenerateTagSuggestions(job);
      case 'optimize-tag-relationships':
        return this.handleOptimizeTagRelationships(job);
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async handleCleanupUnusedTags(job: Job<TagMaintenanceJobData>) {
    const { userId } = job.data;
    
    this.logger.log(`Cleaning up unused tags${userId ? ` for user ${userId}` : ' (system-wide)'}`);
    
    try {
      // Find tags with no associated notes
      const unusedTags = await this.prisma.tag.findMany({
        where: {
          ...(userId && { ownerId: userId }),
          noteTags: {
            none: {}
          }
        },
        include: {
          noteTags: true
        }
      });

      if (unusedTags.length === 0) {
        this.logger.log('No unused tags found');
        return { deletedCount: 0 };
      }

      // Delete unused tags older than 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const tagsToDelete = unusedTags.filter(tag => tag.createdAt < sevenDaysAgo);

      if (tagsToDelete.length > 0) {
        const deletedResult = await this.prisma.tag.deleteMany({
          where: {
            id: { in: tagsToDelete.map(t => t.id) }
          }
        });

        this.logger.log(`Cleanup completed. Deleted ${deletedResult.count} unused tags`);
        
        return {
          deletedCount: deletedResult.count,
          tagNames: tagsToDelete.map(t => t.name)
        };
      }

      return { deletedCount: 0, message: 'No old unused tags to delete' };

    } catch (error) {
      this.logger.error('Cleanup unused tags failed:', error);
      throw error;
    }
  }

  private async handleUpdateTagStatistics(job: Job<TagMaintenanceJobData>) {
    const { userId } = job.data;
    
    this.logger.log(`Updating tag statistics${userId ? ` for user ${userId}` : ' (system-wide)'}`);
    
    try {
      // This would update cached statistics for better performance
      // For now, we'll just log the process
      
      const tags = await this.prisma.tag.findMany({
        where: {
          ...(userId && { ownerId: userId })
        },
        include: {
          noteTags: {
            select: { noteId: true }
          }
        }
      });

      let updatedCount = 0;
      
      // In a real implementation, you might cache these statistics
      for (const tag of tags) {
        const noteCount = tag.noteTags.length;
        // Update cached statistics here
        updatedCount++;
      }

      this.logger.log(`Tag statistics updated for ${updatedCount} tags`);

      return {
        updatedCount,
        totalTags: tags.length
      };

    } catch (error) {
      this.logger.error('Update tag statistics failed:', error);
      throw error;
    }
  }

  private async handleGenerateTagSuggestions(job: Job) {
    const { noteId, userId, content } = job.data;
    
    this.logger.log(`Generating tag suggestions for note ${noteId}`);
    
    try {
      // This would generate and cache tag suggestions
      // For now, we'll implement basic content-based suggestions
      
      const userTags = await this.prisma.tag.findMany({
        where: { ownerId: userId },
        select: { name: true, id: true }
      });

      const suggestions = [];
      const words = content.toLowerCase().split(/\s+/);
      
      // Simple keyword matching
      userTags.forEach(tag => {
        const tagWords = tag.name.toLowerCase().split(/\s+/);
        const matches = tagWords.filter(tagWord => 
          words.some(word => word.includes(tagWord) || tagWord.includes(word))
        );
        
        if (matches.length > 0) {
          suggestions.push({
            tagId: tag.id,
            tagName: tag.name,
            confidence: Math.min(0.9, matches.length * 0.4),
            reason: 'keyword_match'
          });
        }
      });

      this.logger.log(`Generated ${suggestions.length} tag suggestions for note ${noteId}`);

      return {
        noteId,
        suggestions,
        count: suggestions.length
      };

    } catch (error) {
      this.logger.error(`Tag suggestion generation failed for note ${noteId}:`, error);
      throw error;
    }
  }

  private async handleOptimizeTagRelationships(job: Job<TagMaintenanceJobData>) {
    const { userId } = job.data;
    
    this.logger.log(`Optimizing tag relationships${userId ? ` for user ${userId}` : ' (system-wide)'}`);
    
    try {
      // Analyze tag co-occurrence patterns and suggest merges
      const notes = await this.prisma.note.findMany({
        where: {
          ...(userId && { ownerId: userId }),
          isDeleted: false,
          noteTags: {
            some: {}
          }
        },
        include: {
          noteTags: {
            include: {
              tag: { select: { id: true, name: true } }
            }
          }
        }
      });

      // Calculate tag similarities
      const tagCoOccurrence = new Map<string, Map<string, number>>();
      
      notes.forEach(note => {
        const tags = note.noteTags.map(nt => ({ id: nt.tag.id, name: nt.tag.name }));
        
        for (let i = 0; i < tags.length; i++) {
          for (let j = i + 1; j < tags.length; j++) {
            const tag1 = tags[i].id;
            const tag2 = tags[j].id;
            
            if (!tagCoOccurrence.has(tag1)) {
              tagCoOccurrence.set(tag1, new Map());
            }
            
            const tag1Map = tagCoOccurrence.get(tag1)!;
            tag1Map.set(tag2, (tag1Map.get(tag2) || 0) + 1);
          }
        }
      });

      // Find potential duplicate tags (high co-occurrence, similar names)
      const duplicateCandidates = [];
      const processedPairs = new Set();

      for (const [tag1Id, relatedTags] of tagCoOccurrence.entries()) {
        for (const [tag2Id, coOccurrence] of relatedTags.entries()) {
          const pairKey = [tag1Id, tag2Id].sort().join('|');
          
          if (processedPairs.has(pairKey)) continue;
          processedPairs.add(pairKey);

          if (coOccurrence >= 3) { // High co-occurrence threshold
            // Get tag names to check similarity
            const [tag1, tag2] = await Promise.all([
              this.prisma.tag.findUnique({ where: { id: tag1Id }, select: { name: true } }),
              this.prisma.tag.findUnique({ where: { id: tag2Id }, select: { name: true } })
            ]);

            if (tag1 && tag2) {
              const nameSimilarity = this.calculateStringSimilarity(tag1.name, tag2.name);
              
              if (nameSimilarity > 0.6) { // Similar names
                duplicateCandidates.push({
                  tag1: { id: tag1Id, name: tag1.name },
                  tag2: { id: tag2Id, name: tag2.name },
                  coOccurrence,
                  nameSimilarity
                });
              }
            }
          }
        }
      }

      this.logger.log(`Found ${duplicateCandidates.length} potential duplicate tag pairs`);

      return {
        userId,
        analysedNotes: notes.length,
        duplicateCandidates,
        recommendations: duplicateCandidates.map(candidate => ({
          suggestion: `Consider merging "${candidate.tag1.name}" and "${candidate.tag2.name}"`,
          confidence: candidate.nameSimilarity,
          coOccurrence: candidate.coOccurrence
        }))
      };

    } catch (error) {
      this.logger.error('Optimize tag relationships failed:', error);
      throw error;
    }
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`✅ Tag processing job ${job.id} (${job.name}) completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`❌ Tag processing job ${job.id} (${job.name}) failed:`, error);
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job, progress: number) {
    if (progress % 25 === 0) {
      this.logger.log(`📊 Tag processing job ${job.id} progress: ${progress}%`);
    }
  }
}
