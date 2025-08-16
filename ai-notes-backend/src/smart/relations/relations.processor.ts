import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { RelationsService } from './relations.service';

interface RelationAnalysisJobData {
  noteId: string;
  userId: string;
  analysisType?: 'full' | 'semantic' | 'contextual' | 'temporal';
  maxRelations?: number;
}

interface BatchRelationJobData {
  userId: string;
  noteIds: string[];
  analysisType?: string;
}

interface CleanupJobData {
  userId: string;
  minRelevance?: number;
  olderThanDays?: number;
}

@Injectable()
@Processor('related-notes')
export class RelationsProcessor extends WorkerHost {
  private readonly logger = new Logger(RelationsProcessor.name);

  constructor(private relationsService: RelationsService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'analyze-relations':
        return this.handleAnalyzeRelations(job);
      case 'batch-relation-analysis':
        return this.handleBatchRelationAnalysis(job);
      case 'update-relation-scores':
        return this.handleUpdateRelationScores(job);
      case 'cleanup-weak-relations':
        return this.handleCleanupWeakRelations(job);
      case 'rebuild-semantic-relations':
        return this.handleRebuildSemanticRelations(job);
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async handleAnalyzeRelations(job: Job<RelationAnalysisJobData>) {
    const { noteId, userId, analysisType = 'full', maxRelations = 10 } = job.data;
    
    this.logger.log(`Analyzing relations for note ${noteId} (type: ${analysisType})`);
    
    try {
      await job.updateProgress(10);

      // Get related notes using the service
      const relatedNotes = await this.relationsService.findRelatedNotes(noteId, userId, maxRelations);
      
      await job.updateProgress(50);

      // Store high-relevance relations in database
      let storedCount = 0;
      const minRelevanceThreshold = 0.5;

      for (const relatedNote of relatedNotes) {
        if (relatedNote.relevance >= minRelevanceThreshold) {
          try {
            await this.relationsService.saveRelatedNote(
              noteId,
              relatedNote.noteId,
              relatedNote.relevance,
              relatedNote.type,
              userId
            );
            storedCount++;
          } catch (error) {
            // Relation might already exist, ignore
            this.logger.debug(`Relation already exists or failed to save: ${error.message}`);
          }
        }
      }

      await job.updateProgress(100);

      const result = {
        noteId,
        userId,
        analysisType,
        relatedNotesFound: relatedNotes.length,
        relationsStored: storedCount,
        minRelevanceThreshold,
        results: relatedNotes
      };

      this.logger.log(`Relation analysis completed for note ${noteId}. Found ${relatedNotes.length} related notes, stored ${storedCount} relations`);
      
      return result;
    } catch (error) {
      this.logger.error(`Relation analysis failed for note ${noteId}:`, error);
      throw error;
    }
  }

  private async handleBatchRelationAnalysis(job: Job<BatchRelationJobData>) {
    const { userId, noteIds, analysisType = 'full' } = job.data;
    
    this.logger.log(`Processing batch relation analysis for ${noteIds.length} notes`);
    
    try {
      const results = [];
      const totalNotes = noteIds.length;
      
      for (let i = 0; i < noteIds.length; i++) {
        const noteId = noteIds[i];
        const progress = Math.floor(((i + 1) / totalNotes) * 100);
        
        try {
          const relatedNotes = await this.relationsService.findRelatedNotes(noteId, userId, 5);
          
          let storedCount = 0;
          for (const relatedNote of relatedNotes) {
            if (relatedNote.relevance >= 0.5) {
              try {
                await this.relationsService.saveRelatedNote(
                  noteId,
                  relatedNote.noteId,
                  relatedNote.relevance,
                  relatedNote.type,
                  userId
                );
                storedCount++;
              } catch (error) {
                // Ignore duplicate relations
              }
            }
          }
          
          results.push({
            noteId,
            success: true,
            relatedNotesFound: relatedNotes.length,
            relationsStored: storedCount
          });
          
        } catch (error) {
          this.logger.error(`Failed to analyze relations for note ${noteId}:`, error);
          results.push({
            noteId,
            success: false,
            error: error.message
          });
        }
        
        await job.updateProgress(progress);
        
        // Small delay to prevent overwhelming the system
        if (i % 5 === 0 && i > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      const successful = results.filter(r => r.success).length;
      const totalRelations = results
        .filter(r => r.success)
        .reduce((sum, r) => sum + r.relationsStored, 0);
      
      this.logger.log(`Batch relation analysis completed. Processed ${successful}/${totalNotes} notes, stored ${totalRelations} relations`);
      
      return {
        userId,
        totalNotes,
        successful,
        failed: totalNotes - successful,
        totalRelationsStored: totalRelations,
        results
      };
      
    } catch (error) {
      this.logger.error(`Batch relation analysis failed:`, error);
      throw error;
    }
  }

  private async handleUpdateRelationScores(job: Job) {
    const { userId, noteId } = job.data;
    
    this.logger.log(`Updating relation scores for ${noteId ? `note ${noteId}` : `all notes of user ${userId}`}`);
    
    try {
      const whereClause = noteId 
        ? { sourceNoteId: noteId, sourceNote: { ownerId: userId } }
        : { sourceNote: { ownerId: userId } };

      const relations = await this.relationsService['prisma'].relatedNote.findMany({
        where: whereClause,
        include: {
          sourceNote: { select: { id: true, title: true, content: true, updatedAt: true } },
          targetNote: { select: { id: true, title: true, content: true, updatedAt: true } }
        }
      });

      let updatedCount = 0;

      for (const relation of relations) {
        try {
          // Recalculate relevance based on current content
          const newRelevance = await this.calculateUpdatedRelevance(
            relation.sourceNote,
            relation.targetNote,
            relation.type
          );

          if (Math.abs(newRelevance - relation.relevance) > 0.1) {
            await this.relationsService['prisma'].relatedNote.update({
              where: { id: relation.id },
              data: { relevance: newRelevance }
            });
            updatedCount++;
          }
        } catch (error) {
          this.logger.warn(`Failed to update relation ${relation.id}: ${error.message}`);
        }
      }

      this.logger.log(`Relation score update completed. Updated ${updatedCount}/${relations.length} relations`);

      return {
        userId,
        noteId,
        totalRelations: relations.length,
        updatedRelations: updatedCount
      };

    } catch (error) {
      this.logger.error(`Update relation scores failed:`, error);
      throw error;
    }
  }

  private async handleCleanupWeakRelations(job: Job<CleanupJobData>) {
    const { userId, minRelevance = 0.3, olderThanDays = 30 } = job.data;
    
    this.logger.log(`Cleaning up weak relations (relevance < ${minRelevance}) older than ${olderThanDays} days`);
    
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const deletedCount = await this.relationsService['prisma'].relatedNote.deleteMany({
        where: {
          sourceNote: { ownerId: userId },
          relevance: { lt: minRelevance },
          createdAt: { lt: cutoffDate }
        }
      });

      this.logger.log(`Cleanup completed. Deleted ${deletedCount.count} weak relations`);

      return {
        userId,
        deletedCount: deletedCount.count,
        minRelevance,
        cutoffDate
      };

    } catch (error) {
      this.logger.error(`Cleanup weak relations failed:`, error);
      throw error;
    }
  }

  private async handleRebuildSemanticRelations(job: Job) {
    const { userId, noteId } = job.data;
    
    this.logger.log(`Rebuilding semantic relations for ${noteId ? `note ${noteId}` : `all notes of user ${userId}`}`);
    
    try {
      // Delete existing semantic relations
      await this.relationsService['prisma'].relatedNote.deleteMany({
        where: {
          sourceNote: { ownerId: userId },
          type: 'SEMANTIC',
          ...(noteId && { sourceNoteId: noteId })
        }
      });

      // Get notes to process
      const notes = await this.relationsService['prisma'].note.findMany({
        where: {
          ownerId: userId,
          isDeleted: false,
          ...(noteId && { id: noteId })
        },
        select: { id: true, title: true, content: true },
        take: noteId ? 1 : 100 // Limit for batch processing
      });

      let rebuiltCount = 0;

      for (const note of notes) {
        try {
          const semanticRelations = await this.relationsService.findSemanticRelated(note, userId);
          
          for (const relation of semanticRelations.slice(0, 5)) { // Top 5 semantic relations
            try {
              await this.relationsService.saveRelatedNote(
                note.id,
                relation.noteId,
                relation.relevance,
                'SEMANTIC',
                userId
              );
              rebuiltCount++;
            } catch (error) {
              // Ignore duplicates
            }
          }
        } catch (error) {
          this.logger.warn(`Failed to rebuild semantic relations for note ${note.id}: ${error.message}`);
        }
        
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      this.logger.log(`Semantic relations rebuild completed. Rebuilt ${rebuiltCount} semantic relations for ${notes.length} notes`);

      return {
        userId,
        noteId,
        processedNotes: notes.length,
        rebuiltRelations: rebuiltCount
      };

    } catch (error) {
      this.logger.error(`Rebuild semantic relations failed:`, error);
      throw error;
    }
  }

  private async calculateUpdatedRelevance(sourceNote: any, targetNote: any, relationType: string): Promise<number> {
    // Simple relevance recalculation based on content similarity
    // This is a basic implementation - you could enhance with more sophisticated algorithms
    
    const sourceText = `${sourceNote.title} ${sourceNote.content}`.toLowerCase();
    const targetText = `${targetNote.title} ${targetNote.content}`.toLowerCase();
    
    // Simple word overlap calculation
    const sourceWords = new Set(sourceText.split(/\s+/).filter(word => word.length > 3));
    const targetWords = new Set(targetText.split(/\s+/).filter(word => word.length > 3));
    
    const intersection = new Set([...sourceWords].filter(x => targetWords.has(x)));
    const union = new Set([...sourceWords, ...targetWords]);
    
    const jaccard = union.size > 0 ? intersection.size / union.size : 0;
    
    // Adjust relevance based on relation type
    switch (relationType) {
      case 'SEMANTIC':
        return Math.min(jaccard * 1.2, 1.0); // Boost semantic relations
      case 'CONTEXTUAL':
        return Math.min(jaccard * 1.0, 1.0);
      case 'TEMPORAL':
        const timeDiff = Math.abs(new Date(sourceNote.updatedAt).getTime() - new Date(targetNote.updatedAt).getTime());
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        const temporalBonus = Math.max(0, 1 - (daysDiff / 30)); // Decay over 30 days
        return Math.min((jaccard * 0.8) + (temporalBonus * 0.3), 1.0);
      default:
        return jaccard;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`✅ Relations job ${job.id} (${job.name}) completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`❌ Relations job ${job.id} (${job.name}) failed:`, error);
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job, progress: number) {
    if (progress % 20 === 0) { // Log every 20%
      this.logger.log(`📊 Relations job ${job.id} progress: ${progress}%`);
    }
  }
}
