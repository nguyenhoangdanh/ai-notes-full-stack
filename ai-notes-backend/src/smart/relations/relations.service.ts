import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { VectorsService } from '../../vectors/vectors.service';
import * as natural from 'natural';

export interface RelatedNoteResult {
  noteId: string;
  title: string;
  relevance: number;
  type: 'SEMANTIC' | 'CONTEXTUAL' | 'TEMPORAL' | 'REFERENCE';
  excerpt: string;
  reasons: string[];
}

@Injectable()
export class RelationsService {
  constructor(
    private prisma: PrismaService,
    private vectorsService: VectorsService,
    @InjectQueue('related-notes') private relationsQueue: Queue,
  ) {}

  async findRelatedNotes(noteId: string, userId: string, limit: number = 5): Promise<RelatedNoteResult[]> {
    const targetNote = await this.prisma.note.findFirst({
      where: { id: noteId, ownerId: userId, isDeleted: false },
    });

    if (!targetNote) {
      throw new Error('Note not found');
    }

    const [semanticRelated, contextualRelated, temporalRelated, referenceRelated] = await Promise.all([
      this.findSemanticRelated(targetNote, userId),
      this.findContextualRelated(targetNote, userId),
      this.findTemporalRelated(targetNote, userId),
      this.findReferenceRelated(targetNote, userId),
    ]);

    // Combine and deduplicate results
    const allRelated = new Map<string, RelatedNoteResult>();

    [...semanticRelated, ...contextualRelated, ...temporalRelated, ...referenceRelated].forEach(related => {
      const existing = allRelated.get(related.noteId);
      if (existing) {
        // Combine relevance scores and reasons
        existing.relevance = Math.max(existing.relevance, related.relevance);
        existing.reasons = [...new Set([...existing.reasons, ...related.reasons])];
      } else {
        allRelated.set(related.noteId, related);
      }
    });

    // Sort by relevance and return top results
    return Array.from(allRelated.values())
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);
  }

  async findSemanticRelated(targetNote: any, userId: string): Promise<RelatedNoteResult[]> {
    // Enhanced semantic search using vector similarity
    try {
      const semanticResults = await this.vectorsService.semanticSearch(
        targetNote.title + ' ' + targetNote.content,
        userId,
        20
      );

      return semanticResults
        .filter(result => result.noteId !== targetNote.id)
        .slice(0, 10)
        .map(result => ({
          noteId: result.noteId,
          title: result.noteTitle || 'Untitled',
          relevance: Math.min(result.similarity * 1.2, 1.0), // Boost semantic scores slightly
          type: 'SEMANTIC' as const,
          excerpt: result.chunkContent.substring(0, 200),
          reasons: [
            `Semantic similarity: ${(result.similarity * 100).toFixed(1)}%`,
            'Content analysis using AI embeddings'
          ],
        }));
    } catch (error) {
      console.error('Error finding semantic relations:', error);
      return [];
    }
  }

  private async findContextualRelated(targetNote: any, userId: string): Promise<RelatedNoteResult[]> {
    // Find notes with similar tags, keywords, or topics
    const relatedNotes = await this.prisma.note.findMany({
      where: {
        ownerId: userId,
        isDeleted: false,
        id: { not: targetNote.id },
        OR: [
          // Similar tags
          {
            tags: {
              hasSome: targetNote.tags,
            },
          },
          // Same workspace
          {
            workspaceId: targetNote.workspaceId,
          },
        ],
      },
      select: {
        id: true,
        title: true,
        content: true,
        tags: true,
        workspaceId: true,
        createdAt: true,
      },
      take: 50,
    });

    return relatedNotes
      .map(note => {
        let relevance = 0;
        const reasons: string[] = [];

        // Tag similarity
        const commonTags = note.tags.filter(tag => targetNote.tags.includes(tag));
        if (commonTags.length > 0) {
          relevance += (commonTags.length / Math.max(note.tags.length, targetNote.tags.length)) * 0.4;
          reasons.push(`Shared tags: ${commonTags.join(', ')}`);
        }

        // Workspace similarity
        if (note.workspaceId === targetNote.workspaceId) {
          relevance += 0.2;
          reasons.push('Same workspace');
        }

        // Keyword similarity in title and content
        const keywordSimilarity = this.calculateKeywordSimilarity(
          targetNote.title + ' ' + targetNote.content,
          note.title + ' ' + note.content
        );
        if (keywordSimilarity > 0.3) {
          relevance += keywordSimilarity * 0.4;
          reasons.push('Similar keywords');
        }

        return {
          noteId: note.id,
          title: note.title,
          relevance,
          type: 'CONTEXTUAL' as const,
          excerpt: note.content.substring(0, 200),
          reasons,
        };
      })
      .filter(result => result.relevance > 0.3)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5);
  }

  private async findTemporalRelated(targetNote: any, userId: string): Promise<RelatedNoteResult[]> {
    const timeWindow = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    const targetTime = new Date(targetNote.createdAt).getTime();

    const temporalNotes = await this.prisma.note.findMany({
      where: {
        ownerId: userId,
        isDeleted: false,
        id: { not: targetNote.id },
        createdAt: {
          gte: new Date(targetTime - timeWindow),
          lte: new Date(targetTime + timeWindow),
        },
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
      },
      take: 20,
    });

    return temporalNotes
      .map(note => {
        const timeDiff = Math.abs(new Date(note.createdAt).getTime() - targetTime);
        const relevance = Math.max(0.2, 1 - (timeDiff / timeWindow));

        return {
          noteId: note.id,
          title: note.title,
          relevance: relevance * 0.6, // Lower weight for temporal relationships
          type: 'TEMPORAL' as const,
          excerpt: note.content.substring(0, 200),
          reasons: [`Created around same time (${Math.ceil(timeDiff / (24 * 60 * 60 * 1000))} days apart)`],
        };
      })
      .filter(result => result.relevance > 0.3)
      .slice(0, 3);
  }

  private async findReferenceRelated(targetNote: any, userId: string): Promise<RelatedNoteResult[]> {
    // Find notes that reference this note's title or key phrases
    const keyPhrases = this.extractKeyPhrases(targetNote.title);
    
    if (keyPhrases.length === 0) return [];

    const referencingNotes = await this.prisma.note.findMany({
      where: {
        ownerId: userId,
        isDeleted: false,
        id: { not: targetNote.id },
        OR: keyPhrases.map(phrase => ({
          content: {
            contains: phrase,
            mode: 'insensitive' as const,
          },
        })),
      },
      select: {
        id: true,
        title: true,
        content: true,
      },
      take: 20,
    });

    return referencingNotes
      .map(note => {
        const matchingPhrases = keyPhrases.filter(phrase =>
          note.content.toLowerCase().includes(phrase.toLowerCase())
        );

        if (matchingPhrases.length === 0) return null;

        const relevance = (matchingPhrases.length / keyPhrases.length) * 0.8;

        return {
          noteId: note.id,
          title: note.title,
          relevance,
          type: 'REFERENCE' as const,
          excerpt: note.content.substring(0, 200),
          reasons: [`References: ${matchingPhrases.join(', ')}`],
        };
      })
      .filter(Boolean)
      .slice(0, 3);
  }

  private calculateKeywordSimilarity(text1: string, text2: string): number {
    const tokenizer = new natural.WordTokenizer();
    const stemmer = natural.PorterStemmer;
    
    const tokens1 = tokenizer.tokenize(text1.toLowerCase()) || [];
    const tokens2 = tokenizer.tokenize(text2.toLowerCase()) || [];
    
    const stems1 = new Set(tokens1.map(token => stemmer.stem(token)));
    const stems2 = new Set(tokens2.map(token => stemmer.stem(token)));
    
    const intersection = new Set([...stems1].filter(x => stems2.has(x)));
    const union = new Set([...stems1, ...stems2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private extractKeyPhrases(text: string): string[] {
    // Simple key phrase extraction (can be enhanced with NLP libraries)
    const words = text.toLowerCase().split(/\s+/);
    const phrases: string[] = [];
    
    // Single important words (longer than 4 characters)
    phrases.push(...words.filter(word => word.length > 4 && !/^(the|and|or|but|in|on|at|to|for|of|with|by)$/.test(word)));
    
    // Two-word phrases
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = `${words[i]} ${words[i + 1]}`;
      if (phrase.length > 6) {
        phrases.push(phrase);
      }
    }
    
    return phrases.slice(0, 5); // Limit to top 5 phrases
  }

  async saveRelatedNote(sourceNoteId: string, targetNoteId: string, relevance: number, type: string, userId: string) {
    // Check if relation already exists
    const existing = await this.prisma.relatedNote.findUnique({
      where: {
        sourceNoteId_targetNoteId: {
          sourceNoteId,
          targetNoteId,
        },
      },
    });

    if (existing) {
      // Update existing relation if new relevance is higher
      if (relevance > existing.relevance) {
        return this.prisma.relatedNote.update({
          where: { id: existing.id },
          data: { relevance, type: type as any },
        });
      }
      return existing;
    }

    // Create new relation
    return this.prisma.relatedNote.create({
      data: {
        sourceNoteId,
        targetNoteId,
        relevance,
        type: type as any,
      },
    });
  }

  async getStoredRelations(noteId: string, userId: string, limit: number = 10) {
    const relations = await this.prisma.relatedNote.findMany({
      where: {
        sourceNoteId: noteId,
        targetNote: {
          ownerId: userId,
          isDeleted: false,
        },
      },
      include: {
        targetNote: {
          select: {
            id: true,
            title: true,
            content: true,
          },
        },
      },
      orderBy: { relevance: 'desc' },
      take: limit,
    });

    return relations.map(relation => ({
      noteId: relation.targetNoteId,
      title: relation.targetNote.title,
      relevance: relation.relevance,
      type: relation.type,
      excerpt: relation.targetNote.content.substring(0, 200),
      reasons: [`Stored relation: ${relation.type.toLowerCase()}`],
    }));
  }

  async queueRelationAnalysis(noteId: string, userId: string, options?: {
    analysisType?: 'full' | 'semantic' | 'contextual' | 'temporal';
    maxRelations?: number;
    priority?: number;
  }) {
    const jobData = {
      noteId,
      userId,
      analysisType: options?.analysisType || 'full',
      maxRelations: options?.maxRelations || 10
    };

    const jobOptions = {
      attempts: 2,
      backoff: {
        type: 'exponential' as const,
        delay: 3000,
      },
      priority: options?.priority || 0,
      delay: 1000, // 1 second delay
    };

    const job = await this.relationsQueue.add('analyze-relations', jobData, jobOptions);
    
    console.log(`Queued relation analysis job ${job.id} for note ${noteId}`);
    
    return {
      jobId: job.id,
      noteId,
      userId,
      message: 'Relation analysis queued successfully'
    };
  }

  async queueBatchRelationAnalysis(userId: string, noteIds: string[], analysisType?: string) {
    const job = await this.relationsQueue.add(
      'batch-relation-analysis',
      { userId, noteIds, analysisType },
      {
        attempts: 1, // Don't retry batch jobs
        priority: -1, // Lower priority than individual analysis
      }
    );

    return {
      jobId: job.id,
      userId,
      noteCount: noteIds.length,
      message: 'Batch relation analysis queued successfully'
    };
  }

  async queueRelationScoreUpdate(userId: string, noteId?: string) {
    const job = await this.relationsQueue.add(
      'update-relation-scores',
      { userId, noteId },
      {
        attempts: 1,
        priority: 1, // Higher priority
      }
    );

    return {
      jobId: job.id,
      message: 'Relation score update queued successfully'
    };
  }

  async queueCleanupWeakRelations(userId: string, minRelevance: number = 0.3, olderThanDays: number = 30) {
    const job = await this.relationsQueue.add(
      'cleanup-weak-relations',
      { userId, minRelevance, olderThanDays },
      {
        attempts: 1,
        priority: -2, // Lowest priority
      }
    );

    return {
      jobId: job.id,
      message: 'Weak relations cleanup queued successfully'
    };
  }

  async queueRebuildSemanticRelations(userId: string, noteId?: string) {
    const job = await this.relationsQueue.add(
      'rebuild-semantic-relations',
      { userId, noteId },
      {
        attempts: 1,
        priority: 0,
      }
    );

    return {
      jobId: job.id,
      message: 'Semantic relations rebuild queued successfully'
    };
  }

  async getRelationInsights(noteId: string, userId: string) {
    try {
      const [
        outgoingRelations,
        incomingRelations,
        relationsByType,
        strongestRelations
      ] = await Promise.all([
        this.prisma.relatedNote.count({
          where: { sourceNoteId: noteId, sourceNote: { ownerId: userId } }
        }),
        this.prisma.relatedNote.count({
          where: { targetNoteId: noteId, sourceNote: { ownerId: userId } }
        }),
        this.prisma.relatedNote.groupBy({
          by: ['type'],
          where: {
            OR: [
              { sourceNoteId: noteId, sourceNote: { ownerId: userId } },
              { targetNoteId: noteId, sourceNote: { ownerId: userId } }
            ]
          },
          _count: { type: true },
          _avg: { relevance: true }
        }),
        this.prisma.relatedNote.findMany({
          where: {
            OR: [
              { sourceNoteId: noteId, sourceNote: { ownerId: userId } },
              { targetNoteId: noteId, sourceNote: { ownerId: userId } }
            ],
            relevance: { gte: 0.7 }
          },
          include: {
            sourceNote: { select: { id: true, title: true } },
            targetNote: { select: { id: true, title: true } }
          },
          orderBy: { relevance: 'desc' },
          take: 5
        })
      ]);

      return {
        totalRelations: outgoingRelations + incomingRelations,
        outgoingRelations,
        incomingRelations,
        relationsByType: relationsByType.reduce((acc, item) => {
          acc[item.type] = {
            count: item._count.type,
            avgRelevance: item._avg.relevance || 0
          };
          return acc;
        }, {}),
        strongestRelations: strongestRelations.map(rel => ({
          id: rel.id,
          relatedNote: rel.sourceNoteId === noteId ? rel.targetNote : rel.sourceNote,
          relevance: rel.relevance,
          type: rel.type
        }))
      };
    } catch (error) {
      console.error('Error getting relation insights:', error);
      throw error;
    }
  }
}
