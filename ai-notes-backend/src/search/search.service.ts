import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { VectorsService } from '../vectors/vectors.service';
import * as natural from 'natural';

export interface AdvancedSearchFilters {
  workspaceId?: string;
  tags?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  hasAttachments?: boolean;
  wordCountRange?: {
    min: number;
    max: number;
  };
  categories?: string[];
  lastModifiedDays?: number;
  sortBy?: 'relevance' | 'created' | 'updated' | 'title' | 'size';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  score: number;
  highlights: string[];
  reasons: string[];
  workspace: {
    id: string;
    name: string;
  };
  tags: string[];
  categories: { name: string; color?: string }[];
  createdAt: Date;
  updatedAt: Date;
  wordCount: number;
  hasAttachments: boolean;
}

@Injectable()
export class SearchService {
  private readonly tokenizer = new natural.WordTokenizer();
  private readonly stemmer = natural.PorterStemmer;

  constructor(
    private prisma: PrismaService,
    private vectorsService: VectorsService,
    @InjectQueue('search-ranking') private searchQueue: Queue,
  ) {}

  async advancedSearch(
    query: string,
    userId: string,
    filters: AdvancedSearchFilters = {},
    limit: number = 20
  ): Promise<{ results: SearchResult[]; total: number; facets: any }> {
    // Record search in history
    await this.recordSearchHistory(userId, query, filters);

    // Build search conditions
    const searchConditions = this.buildSearchConditions(query, userId, filters);

    // Get notes matching conditions
    const notes = await this.prisma.note.findMany({
      where: searchConditions,
      include: {
        workspace: {
          select: { id: true, name: true }
        },
        categories: {
          include: {
            category: {
              select: { name: true, color: true }
            }
          }
        },
        attachments: {
          select: { id: true }
        }
      },
      take: Math.min(limit * 2, 100), // Get more for ranking
    });

    // Calculate search scores and rank results
    const scoredResults = await this.scoreAndRankResults(query, notes, userId);

    // Apply final sorting and limiting
    const sortedResults = this.applySorting(scoredResults, filters.sortBy, filters.sortOrder);
    const finalResults = sortedResults.slice(0, limit);

    // Generate facets for filtering
    const facets = this.generateFacets(notes);

    // Queue search ranking update
    await this.queueSearchRankingUpdate(query, finalResults, userId);

    return {
      results: finalResults,
      total: scoredResults.length,
      facets
    };
  }

  private buildSearchConditions(query: string, userId: string, filters: AdvancedSearchFilters) {
    const keywords = this.extractKeywords(query);
    
    const baseConditions = {
      ownerId: userId,
      isDeleted: false,
    };

    const searchConditions = [];

    // Text search conditions
    if (keywords.length > 0) {
      searchConditions.push(
        // Exact phrase in title (highest priority)
        {
          title: {
            contains: query,
            mode: 'insensitive' as const,
          }
        },
        // Exact phrase in content
        {
          content: {
            contains: query,
            mode: 'insensitive' as const,
          }
        },
        // Individual keywords in title
        ...keywords.map(keyword => ({
          title: {
            contains: keyword,
            mode: 'insensitive' as const,
          }
        })),
        // Individual keywords in content
        ...keywords.map(keyword => ({
          content: {
            contains: keyword,
            mode: 'insensitive' as const,
          }
        })),
        // Tags matching
        {
          tags: {
            hasSome: keywords
          }
        }
      );
    }

    const conditions = {
      ...baseConditions,
      ...(searchConditions.length > 0 && {
        OR: searchConditions
      }),
      // Apply filters
      ...(filters.workspaceId && {
        workspaceId: filters.workspaceId
      }),
      ...(filters.tags && filters.tags.length > 0 && {
        tags: {
          hasSome: filters.tags
        }
      }),
      ...(filters.dateRange && {
        createdAt: {
          gte: filters.dateRange.from,
          lte: filters.dateRange.to
        }
      }),
      ...(filters.lastModifiedDays && {
        updatedAt: {
          gte: new Date(Date.now() - filters.lastModifiedDays * 24 * 60 * 60 * 1000)
        }
      }),
      ...(filters.hasAttachments !== undefined && {
        attachments: filters.hasAttachments 
          ? { some: {} }
          : { none: {} }
      }),
      ...(filters.categories && filters.categories.length > 0 && {
        categories: {
          some: {
            category: {
              name: {
                in: filters.categories
              }
            }
          }
        }
      })
    };

    return conditions;
  }

  private async scoreAndRankResults(query: string, notes: any[], userId: string): Promise<SearchResult[]> {
    const keywords = this.extractKeywords(query);
    const results: SearchResult[] = [];

    // Get semantic search results for comparison
    let semanticResults = [];
    try {
      semanticResults = await this.vectorsService.semanticSearch(query, userId, 50);
    } catch (error) {
      console.log('Semantic search not available, using text-based scoring only');
    }

    for (const note of notes) {
      const searchResult = await this.calculateSearchScore(
        note,
        query,
        keywords,
        semanticResults,
        userId
      );

      if (searchResult.score > 0) {
        results.push(searchResult);
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  private async calculateSearchScore(
    note: any,
    query: string,
    keywords: string[],
    semanticResults: any[],
    userId: string
  ): Promise<SearchResult> {
    let score = 0;
    const reasons: string[] = [];
    const highlights: string[] = [];

    const titleLower = note.title.toLowerCase();
    const contentLower = note.content.toLowerCase();
    const queryLower = query.toLowerCase();

    // 1. Exact phrase matching (highest score)
    if (titleLower.includes(queryLower)) {
      score += 100;
      reasons.push('Exact match in title');
      highlights.push(this.highlightText(note.title, query));
    }

    if (contentLower.includes(queryLower)) {
      score += 80;
      reasons.push('Exact phrase match in content');
      highlights.push(this.extractHighlight(note.content, query));
    }

    // 2. Individual keyword matching
    let titleKeywordMatches = 0;
    let contentKeywordMatches = 0;

    for (const keyword of keywords) {
      if (titleLower.includes(keyword.toLowerCase())) {
        titleKeywordMatches++;
        score += 20;
      }
      if (contentLower.includes(keyword.toLowerCase())) {
        contentKeywordMatches++;
        score += 10;
      }
    }

    if (titleKeywordMatches > 0) {
      reasons.push(`${titleKeywordMatches} keyword(s) in title`);
    }
    if (contentKeywordMatches > 0) {
      reasons.push(`${contentKeywordMatches} keyword(s) in content`);
    }

    // 3. Tag matching
    const tagMatches = note.tags.filter(tag => 
      keywords.some(keyword => tag.toLowerCase().includes(keyword.toLowerCase()))
    );
    if (tagMatches.length > 0) {
      score += tagMatches.length * 15;
      reasons.push(`Tag matches: ${tagMatches.join(', ')}`);
    }

    // 4. Semantic similarity bonus
    const semanticMatch = semanticResults.find(result => result.noteId === note.id);
    if (semanticMatch) {
      const semanticBonus = semanticMatch.similarity * 50;
      score += semanticBonus;
      reasons.push(`Semantic similarity: ${(semanticMatch.similarity * 100).toFixed(1)}%`);
    }

    // 5. Recency bonus (newer notes get slight boost)
    const daysSinceUpdated = Math.floor(
      (Date.now() - new Date(note.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceUpdated <= 7) {
      score += (7 - daysSinceUpdated) * 2;
      reasons.push('Recently updated');
    }

    // 6. Length penalty/bonus
    const wordCount = note.content.split(/\s+/).length;
    if (wordCount > 50 && wordCount < 1000) {
      score += 5; // Sweet spot bonus
    } else if (wordCount > 2000) {
      score -= 10; // Very long content penalty
    }

    // 7. User behavior bonus (from historical search rankings)
    try {
      const historicalRanking = await this.prisma.searchRanking.findFirst({
        where: {
          noteId: note.id,
          query: {
            contains: query,
            mode: 'insensitive'
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (historicalRanking) {
        score += historicalRanking.score * 0.1; // 10% of historical score
        reasons.push('Previously relevant');
      }
    } catch (error) {
      // Ignore ranking lookup errors
    }

    // Create excerpt
    const excerpt = this.createExcerpt(note.content, query, 200);

    return {
      id: note.id,
      title: note.title,
      content: note.content,
      excerpt,
      score: Math.round(score * 100) / 100,
      highlights: highlights.slice(0, 3),
      reasons: reasons.slice(0, 5),
      workspace: note.workspace,
      tags: note.tags,
      categories: note.categories.map(nc => ({
        name: nc.category.name,
        color: nc.category.color
      })),
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      wordCount,
      hasAttachments: note.attachments.length > 0
    };
  }

  private extractKeywords(query: string): string[] {
    const tokens = this.tokenizer.tokenize(query.toLowerCase()) || [];
    return tokens
      .filter(token => token.length > 2)
      .filter(token => !['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'].includes(token))
      .slice(0, 10); // Limit keywords
  }

  private highlightText(text: string, query: string): string {
    const regex = new RegExp(`(${this.escapeRegExp(query)})`, 'gi');
    return text.replace(regex, '**$1**');
  }

  private extractHighlight(content: string, query: string, contextLength: number = 100): string {
    const queryLower = query.toLowerCase();
    const contentLower = content.toLowerCase();
    const index = contentLower.indexOf(queryLower);
    
    if (index === -1) return '';
    
    const start = Math.max(0, index - contextLength / 2);
    const end = Math.min(content.length, index + query.length + contextLength / 2);
    
    let excerpt = content.substring(start, end);
    if (start > 0) excerpt = '...' + excerpt;
    if (end < content.length) excerpt = excerpt + '...';
    
    return this.highlightText(excerpt, query);
  }

  private createExcerpt(content: string, query: string, maxLength: number): string {
    // Try to find context around the query
    const queryIndex = content.toLowerCase().indexOf(query.toLowerCase());
    
    if (queryIndex !== -1) {
      const start = Math.max(0, queryIndex - maxLength / 2);
      const end = Math.min(content.length, start + maxLength);
      let excerpt = content.substring(start, end);
      
      if (start > 0) excerpt = '...' + excerpt;
      if (end < content.length) excerpt = excerpt + '...';
      
      return excerpt.trim();
    }
    
    // Fallback to beginning of content
    return content.substring(0, maxLength) + (content.length > maxLength ? '...' : '');
  }

  private applySorting(results: SearchResult[], sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc'): SearchResult[] {
    switch (sortBy) {
      case 'title':
        return results.sort((a, b) => {
          const comparison = a.title.localeCompare(b.title);
          return sortOrder === 'asc' ? comparison : -comparison;
        });
      
      case 'created':
        return results.sort((a, b) => {
          const comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          return sortOrder === 'asc' ? comparison : -comparison;
        });
      
      case 'updated':
        return results.sort((a, b) => {
          const comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          return sortOrder === 'asc' ? comparison : -comparison;
        });
      
      case 'size':
        return results.sort((a, b) => {
          const comparison = a.wordCount - b.wordCount;
          return sortOrder === 'asc' ? comparison : -comparison;
        });
      
      case 'relevance':
      default:
        return results.sort((a, b) => {
          const comparison = a.score - b.score;
          return sortOrder === 'asc' ? comparison : -comparison;
        });
    }
  }

  private generateFacets(notes: any[]) {
    const workspaces = new Map();
    const tags = new Map();
    const categories = new Map();
    const dateRanges = { last7Days: 0, last30Days: 0, last90Days: 0, older: 0 };
    
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    for (const note of notes) {
      // Workspace facets
      if (note.workspace) {
        workspaces.set(note.workspace.id, {
          id: note.workspace.id,
          name: note.workspace.name,
          count: (workspaces.get(note.workspace.id)?.count || 0) + 1
        });
      }

      // Tag facets
      for (const tag of note.tags) {
        tags.set(tag, (tags.get(tag) || 0) + 1);
      }

      // Category facets
      for (const noteCategory of note.categories || []) {
        const categoryName = noteCategory.category.name;
        categories.set(categoryName, {
          name: categoryName,
          color: noteCategory.category.color,
          count: (categories.get(categoryName)?.count || 0) + 1
        });
      }

      // Date range facets
      const noteDate = new Date(note.updatedAt);
      if (noteDate >= sevenDaysAgo) {
        dateRanges.last7Days++;
      } else if (noteDate >= thirtyDaysAgo) {
        dateRanges.last30Days++;
      } else if (noteDate >= ninetyDaysAgo) {
        dateRanges.last90Days++;
      } else {
        dateRanges.older++;
      }
    }

    return {
      workspaces: Array.from(workspaces.values()),
      tags: Array.from(tags.entries()).map(([name, count]) => ({ name, count })),
      categories: Array.from(categories.values()),
      dateRanges,
      total: notes.length
    };
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async recordSearchHistory(userId: string, query: string, filters: AdvancedSearchFilters) {
    try {
      const resultCount = 0; // This would be set after getting results
      
      await this.prisma.searchHistory.create({
        data: {
          userId,
          query,
          filters: filters as any,
          resultCount,
        }
      });
    } catch (error) {
      console.error('Failed to record search history:', error);
    }
  }

  async getSearchHistory(userId: string, limit: number = 20) {
    return this.prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { searchedAt: 'desc' },
      take: limit,
    });
  }

  async getPopularSearches(userId: string, limit: number = 10) {
    const popularSearches = await this.prisma.searchHistory.groupBy({
      by: ['query'],
      where: { userId },
      _count: { query: true },
      orderBy: { _count: { query: 'desc' } },
      take: limit,
    });

    return popularSearches.map(search => ({
      query: search.query,
      count: search._count.query
    }));
  }

  async saveSearch(userId: string, name: string, query: string, filters: AdvancedSearchFilters) {
    return this.prisma.savedSearch.create({
      data: {
        userId,
        name,
        query,
        filters: filters as any,
      }
    });
  }

  async getSavedSearches(userId: string) {
    return this.prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteSavedSearch(id: string, userId: string) {
    return this.prisma.savedSearch.deleteMany({
      where: { id, userId }
    });
  }

  async getSearchSuggestions(userId: string, query: string, limit: number = 5) {
    const suggestions = [];

    // Recent searches
    const recentSearches = await this.prisma.searchHistory.findMany({
      where: {
        userId,
        query: {
          contains: query,
          mode: 'insensitive'
        }
      },
      select: { query: true },
      distinct: ['query'],
      orderBy: { searchedAt: 'desc' },
      take: limit,
    });

    suggestions.push(...recentSearches.map(s => ({ 
      text: s.query, 
      type: 'history' as const 
    })));

    // Popular tags
    const notes = await this.prisma.note.findMany({
      where: { ownerId: userId, isDeleted: false },
      select: { tags: true },
      take: 1000,
    });

    const tagCounts = new Map();
    for (const note of notes) {
      for (const tag of note.tags) {
        if (tag.toLowerCase().includes(query.toLowerCase())) {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        }
      }
    }

    const sortedTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit - suggestions.length);

    suggestions.push(...sortedTags.map(([tag]) => ({ 
      text: tag, 
      type: 'tag' as const 
    })));

    return suggestions.slice(0, limit);
  }

  private async queueSearchRankingUpdate(query: string, results: SearchResult[], userId: string) {
    try {
      await this.searchQueue.add(
        'update-search-rankings',
        { query, results: results.slice(0, 10), userId },
        {
          attempts: 1,
          priority: -1, // Low priority
        }
      );
    } catch (error) {
      console.error('Failed to queue search ranking update:', error);
    }
  }
}
