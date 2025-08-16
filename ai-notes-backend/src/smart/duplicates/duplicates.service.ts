import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { VectorsService } from '../../vectors/vectors.service';
import * as stringSimilarity from 'string-similarity';
import * as natural from 'natural';

export interface DuplicateDetectionResult {
  originalNoteId: string;
  duplicateNoteId: string;
  similarity: number;
  type: 'CONTENT' | 'TITLE' | 'SEMANTIC';
  suggestedAction: 'MERGE' | 'KEEP_SEPARATE' | 'REVIEW';
}

@Injectable()
export class DuplicatesService {
  constructor(
    private prisma: PrismaService,
    private vectorsService: VectorsService,
    @InjectQueue('duplicate-detection') private duplicateQueue: Queue,
  ) {}

  async findDuplicates(userId: string, noteId?: string, threshold: number = 0.7): Promise<DuplicateDetectionResult[]> {
    try {
      const where = { ownerId: userId, isDeleted: false };
      if (noteId) {
        where['id'] = noteId;
      }

      const notes = await this.prisma.note.findMany({
        where,
        select: { id: true, title: true, content: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: noteId ? 1 : 500, // Limit for performance
      });

      if (notes.length === 0) return [];

      const duplicateResults: DuplicateDetectionResult[] = [];
      const targetNote = noteId ? notes[0] : null;
      
      // Get comparison notes (exclude the target note itself)
      const comparisonNotes = noteId 
        ? await this.prisma.note.findMany({
            where: { ownerId: userId, isDeleted: false, id: { not: noteId } },
            select: { id: true, title: true, content: true },
            take: 200, // Reduced for performance
            orderBy: { updatedAt: 'desc' } // Get most recent notes first
          })
        : notes;

      const notesToCheck = targetNote ? [targetNote] : notes;

      for (const note of notesToCheck) {
        for (const otherNote of comparisonNotes) {
          if (note.id === otherNote.id) continue;

          // Skip if we already checked this pair
          const existingCheck = duplicateResults.find(
            r => (r.originalNoteId === note.id && r.duplicateNoteId === otherNote.id) ||
                 (r.originalNoteId === otherNote.id && r.duplicateNoteId === note.id)
          );
          if (existingCheck) continue;

          const duplicateCheck = await this.checkDuplicate(note, otherNote, threshold);
          if (duplicateCheck) {
            duplicateResults.push(duplicateCheck);
          }
        }
      }

      return duplicateResults.sort((a, b) => b.similarity - a.similarity);
    } catch (error) {
      console.error('Error in findDuplicates:', error);
      throw new Error(`Failed to find duplicates: ${error.message}`);
    }
  }

  private async checkDuplicate(note1: any, note2: any, threshold: number): Promise<DuplicateDetectionResult | null> {
    try {
      // 1. Title similarity check (fast)
      const titleSimilarity = stringSimilarity.compareTwoStrings(
        note1.title.toLowerCase(),
        note2.title.toLowerCase()
      );

      // 2. Content similarity check
      const contentSimilarity = this.calculateContentSimilarity(note1.content, note2.content);

      // 3. Semantic similarity check (if vectors available and content similarity is promising)
      let semanticSimilarity = 0;
      if (contentSimilarity > 0.3 || titleSimilarity > 0.5) {
        semanticSimilarity = await this.calculateSemanticSimilarity(note1.id, note2.id);
      }

      // Determine the highest similarity and type
      let maxSimilarity = Math.max(titleSimilarity, contentSimilarity);
      let type: 'CONTENT' | 'TITLE' | 'SEMANTIC' = 
        titleSimilarity > contentSimilarity ? 'TITLE' : 'CONTENT';

      if (semanticSimilarity > maxSimilarity) {
        maxSimilarity = semanticSimilarity;
        type = 'SEMANTIC';
      }

      if (maxSimilarity < threshold) return null;

      // Suggest action based on similarity score and type
      let suggestedAction: 'MERGE' | 'KEEP_SEPARATE' | 'REVIEW' = 'REVIEW';
      if (maxSimilarity >= 0.95) {
        suggestedAction = 'MERGE';
      } else if (maxSimilarity >= 0.85) {
        suggestedAction = 'REVIEW';
      } else {
        suggestedAction = 'KEEP_SEPARATE';
      }

      return {
        originalNoteId: note1.id,
        duplicateNoteId: note2.id,
        similarity: Math.round(maxSimilarity * 1000) / 1000, // Round to 3 decimal places
        type,
        suggestedAction,
      };
    } catch (error) {
      console.error('Error checking duplicate:', error);
      return null; // Skip this comparison on error
    }
  }

  private calculateContentSimilarity(content1: string, content2: string): number {
    // Clean content (remove markdown, extra spaces, etc.)
    const clean1 = this.cleanContent(content1);
    const clean2 = this.cleanContent(content2);

    // Use string similarity for basic comparison
    const basicSimilarity = stringSimilarity.compareTwoStrings(clean1, clean2);

    // Use Jaccard similarity for better accuracy
    const jaccardSimilarity = this.calculateJaccardSimilarity(clean1, clean2);

    // Return weighted average
    return (basicSimilarity * 0.6) + (jaccardSimilarity * 0.4);
  }

  private cleanContent(content: string): string {
    return content
      .replace(/[#*_`~]/g, '') // Remove markdown formatting
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim()
      .toLowerCase();
  }

  private calculateJaccardSimilarity(text1: string, text2: string): number {
    const tokenizer = new natural.WordTokenizer();
    const tokens1 = new Set(tokenizer.tokenize(text1) || []);
    const tokens2 = new Set(tokenizer.tokenize(text2) || []);

    const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
    const union = new Set([...tokens1, ...tokens2]);

    if (union.size === 0) return 0;
    return intersection.size / union.size;
  }

  private async calculateSemanticSimilarity(noteId1: string, noteId2: string): Promise<number> {
    try {
      // Get vector embeddings for both notes
      const vectors1 = await this.prisma.vector.findMany({
        where: { noteId: noteId1 },
        select: { embedding: true },
      });

      const vectors2 = await this.prisma.vector.findMany({
        where: { noteId: noteId2 },
        select: { embedding: true },
      });

      if (vectors1.length === 0 || vectors2.length === 0) return 0;

      // Calculate cosine similarity between embeddings
      let maxSimilarity = 0;
      for (const v1 of vectors1) {
        for (const v2 of vectors2) {
          if (v1.embedding.length === 0 || v2.embedding.length === 0) continue;
          const similarity = this.cosineSimilarity(v1.embedding, v2.embedding);
          maxSimilarity = Math.max(maxSimilarity, similarity);
        }
      }

      return maxSimilarity;
    } catch (error) {
      console.error('Error calculating semantic similarity:', error);
      return 0;
    }
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async createDuplicateReport(originalNoteId: string, duplicateNoteId: string, similarity: number, type: string, userId: string) {
    return this.prisma.duplicateReport.create({
      data: {
        originalNoteId,
        duplicateNoteId,
        similarity,
        type: type as any,
        ownerId: userId,
      },
      include: {
        originalNote: {
          select: { id: true, title: true },
        },
        duplicateNote: {
          select: { id: true, title: true },
        },
      },
    });
  }

  async getDuplicateReports(userId: string, status?: 'PENDING' | 'CONFIRMED' | 'DISMISSED' | 'MERGED') {
    return this.prisma.duplicateReport.findMany({
      where: {
        ownerId: userId,
        ...(status && { status }),
      },
      include: {
        originalNote: {
          select: { id: true, title: true, content: true },
        },
        duplicateNote: {
          select: { id: true, title: true, content: true },
        },
      },
      orderBy: { similarity: 'desc' },
    });
  }

  async updateDuplicateReport(reportId: string, userId: string, status: 'CONFIRMED' | 'DISMISSED' | 'MERGED') {
    const report = await this.prisma.duplicateReport.findFirst({
      where: { id: reportId, ownerId: userId },
    });

    if (!report) {
      throw new NotFoundException('Duplicate report not found');
    }

    return this.prisma.duplicateReport.update({
      where: { id: reportId },
      data: {
        status,
        resolvedAt: new Date(),
      },
    });
  }

  async mergeNotes(originalNoteId: string, duplicateNoteId: string, userId: string) {
    // Get both notes
    const [originalNote, duplicateNote] = await Promise.all([
      this.prisma.note.findFirst({
        where: { id: originalNoteId, ownerId: userId },
      }),
      this.prisma.note.findFirst({
        where: { id: duplicateNoteId, ownerId: userId },
      }),
    ]);

    if (!originalNote || !duplicateNote) {
      throw new NotFoundException('One or both notes not found');
    }

    // Merge content (append duplicate content to original)
    const mergedContent = `${originalNote.content}\n\n---\n\n${duplicateNote.content}`;
    
    // Merge tags
    const mergedTags = [...new Set([...originalNote.tags, ...duplicateNote.tags])];

    // Update original note
    const updatedNote = await this.prisma.note.update({
      where: { id: originalNoteId },
      data: {
        content: mergedContent,
        tags: mergedTags,
        updatedAt: new Date(),
      },
    });

    // Soft delete duplicate note
    await this.prisma.note.update({
      where: { id: duplicateNoteId },
      data: { isDeleted: true },
    });

    // Update duplicate report status
    await this.prisma.duplicateReport.updateMany({
      where: {
        OR: [
          { originalNoteId, duplicateNoteId },
          { originalNoteId: duplicateNoteId, duplicateNoteId: originalNoteId },
        ],
        ownerId: userId,
      },
      data: {
        status: 'MERGED',
        resolvedAt: new Date(),
      },
    });

    // Reprocess vectors for merged note
    await this.vectorsService.processNoteForRAG(originalNoteId, userId);

    return {
      mergedNote: updatedNote,
      deletedNoteId: duplicateNoteId,
    };
  }

  async queueDuplicateDetection(userId: string, noteId?: string, options?: {
    threshold?: number;
    priority?: number;
  }) {
    const jobData = {
      userId,
      noteId,
      threshold: options?.threshold || 0.7
    };

    const jobOptions = {
      attempts: 2,
      backoff: {
        type: 'exponential' as const,
        delay: 5000,
      },
      priority: options?.priority || 0,
      delay: 1000, // 1 second delay to allow note processing to complete
    };

    const job = await this.duplicateQueue.add('detect-duplicates', jobData, jobOptions);
    
    console.log(`Queued duplicate detection job ${job.id} for user ${userId}${noteId ? ` (note: ${noteId})` : ''}`);
    
    return {
      jobId: job.id,
      userId,
      noteId,
      message: 'Duplicate detection queued successfully'
    };
  }

  async queueBatchDuplicateCheck(userId: string, noteIds: string[], threshold?: number) {
    const job = await this.duplicateQueue.add(
      'batch-duplicate-check',
      { userId, noteIds, threshold },
      {
        attempts: 1, // Don't retry batch jobs
        priority: -1, // Lower priority than individual checks
      }
    );

    return {
      jobId: job.id,
      userId,
      noteCount: noteIds.length,
      message: 'Batch duplicate check queued successfully'
    };
  }

  async queueAutoMerge(userId: string, minSimilarity: number = 0.95) {
    const job = await this.duplicateQueue.add(
      'auto-merge-high-confidence',
      { userId, minSimilarity },
      {
        attempts: 1,
        priority: 1, // Higher priority
      }
    );

    return {
      jobId: job.id,
      message: 'Auto-merge job queued successfully'
    };
  }
}
