import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { ActivitiesService } from '../activities/activities.service';

export interface TagHierarchy {
  id: string;
  name: string;
  color?: string;
  description?: string;
  noteCount: number;
  children: TagHierarchy[];
  parent?: string;
}

export interface TagAnalytics {
  totalTags: number;
  mostUsedTags: Array<{ name: string; count: number; color?: string }>;
  recentlyUsed: Array<{ name: string; lastUsed: Date }>;
  tagGrowth: Array<{ date: string; count: number }>;
  colorDistribution: Array<{ color: string; count: number }>;
  relationshipMap: Array<{ tag1: string; tag2: string; coOccurrences: number }>;
}

export interface TagSuggestion {
  name: string;
  confidence: number;
  reason: 'content_based' | 'pattern_based' | 'similar_notes' | 'user_history';
  relatedTags: string[];
}

@Injectable()
export class TagsService {
  constructor(
    private prisma: PrismaService,
    private activitiesService: ActivitiesService,
    @InjectQueue('tag-processing') private tagQueue: Queue,
  ) {}

  async createTag(userId: string, data: {
    name: string;
    color?: string;
    description?: string;
    parentId?: string;
  }) {
    // Check if tag already exists
    const existing = await this.prisma.tag.findFirst({
      where: {
        name: data.name,
        ownerId: userId
      }
    });

    if (existing) {
      throw new ConflictException('Tag already exists');
    }

    // Validate parent tag if provided
    if (data.parentId) {
      const parentTag = await this.prisma.tag.findFirst({
        where: {
          id: data.parentId,
          ownerId: userId
        }
      });

      if (!parentTag) {
        throw new NotFoundException('Parent tag not found');
      }
    }

    const tag = await this.prisma.tag.create({
      data: {
        name: data.name,
        color: data.color || this.generateRandomColor(),
        description: data.description,
        ownerId: userId,
        // Store parent relationship in metadata if needed
        ...(data.parentId && {
          description: `${data.description || ''}\nParent: ${data.parentId}`
        })
      }
    });

    // Track activity
    await this.activitiesService.recordActivity({
      userId,
      action: 'TAG_CREATE',
      metadata: {
        tagName: data.name,
        hasParent: !!data.parentId
      }
    });

    return tag;
  }

  async updateTag(tagId: string, userId: string, data: {
    name?: string;
    color?: string;
    description?: string;
  }) {
    // Verify ownership
    const tag = await this.prisma.tag.findFirst({
      where: { id: tagId, ownerId: userId }
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    // Check for name conflicts if renaming
    if (data.name && data.name !== tag.name) {
      const existing = await this.prisma.tag.findFirst({
        where: {
          name: data.name,
          ownerId: userId,
          id: { not: tagId }
        }
      });

      if (existing) {
        throw new ConflictException('Tag name already exists');
      }
    }

    const updated = await this.prisma.tag.update({
      where: { id: tagId },
      data,
    });

    // Track activity
    await this.activitiesService.recordActivity({
      userId,
      action: 'TAG_UPDATE',
      metadata: {
        tagName: updated.name,
        changes: Object.keys(data)
      }
    });

    return updated;
  }

  async deleteTag(tagId: string, userId: string, options: {
    reassignTo?: string;
    removeFromNotes?: boolean;
  } = {}) {
    const tag = await this.prisma.tag.findFirst({
      where: { id: tagId, ownerId: userId },
      include: {
        noteTags: {
          include: { note: { select: { id: true, title: true } } }
        }
      }
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    const affectedNotes = tag.noteTags.length;

    if (options.reassignTo) {
      // Reassign to another tag
      const targetTag = await this.prisma.tag.findFirst({
        where: { id: options.reassignTo, ownerId: userId }
      });

      if (!targetTag) {
        throw new NotFoundException('Target tag not found');
      }

      // Update note tags to use new tag
      for (const noteTag of tag.noteTags) {
        try {
          await this.prisma.noteTag.upsert({
            where: {
              noteId_tagId: {
                noteId: noteTag.noteId,
                tagId: options.reassignTo
              }
            },
            update: {},
            create: {
              noteId: noteTag.noteId,
              tagId: options.reassignTo
            }
          });
        } catch (error) {
          // Tag already exists for this note, skip
        }
      }
    }

    if (options.removeFromNotes || options.reassignTo) {
      // Remove original tag associations
      await this.prisma.noteTag.deleteMany({
        where: { tagId }
      });
    }

    // Delete the tag
    await this.prisma.tag.delete({
      where: { id: tagId }
    });

    // Track activity
    await this.activitiesService.recordActivity({
      userId,
      action: 'TAG_DELETE',
      metadata: {
        tagName: tag.name,
        affectedNotes,
        reassignedTo: options.reassignTo || null
      }
    });

    return {
      success: true,
      affectedNotes,
      message: `Tag "${tag.name}" deleted successfully`
    };
  }

  async getUserTags(userId: string) {
    const tags = await this.prisma.tag.findMany({
      where: { ownerId: userId },
      include: {
        noteTags: {
          select: { noteId: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      description: tag.description,
      noteCount: tag.noteTags.length,
      createdAt: tag.createdAt
    }));
  }

  async getTagHierarchy(userId: string): Promise<TagHierarchy[]> {
    const tags = await this.getUserTags(userId);
    
    // For now, return flat structure since we don't have parent relationships in schema
    // In a full implementation, you'd parse parent relationships from description or add parentId field
    return tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      description: tag.description,
      noteCount: tag.noteCount,
      children: []
    }));
  }

  async getTagAnalytics(userId: string, days: number = 30): Promise<TagAnalytics> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [allTags, recentActivity, tagUsage] = await Promise.all([
      // All user tags with note counts
      this.prisma.tag.findMany({
        where: { ownerId: userId },
        include: {
          noteTags: {
            select: { noteId: true }
          }
        }
      }),

      // Recent tag usage activities
      this.prisma.userActivity.findMany({
        where: {
          userId,
          action: { in: ['TAG_CREATE', 'TAG_ASSIGN'] },
          createdAt: { gte: startDate }
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      }),

      // Tag usage in recent notes
      this.prisma.noteTag.findMany({
        where: {
          tag: { ownerId: userId },
          note: {
            createdAt: { gte: startDate },
            isDeleted: false
          }
        },
        include: {
          tag: { select: { name: true, color: true } },
          note: { select: { createdAt: true } }
        }
      })
    ]);

    // Most used tags
    const tagCounts = new Map();
    allTags.forEach(tag => {
      tagCounts.set(tag.name, {
        count: tag.noteTags.length,
        color: tag.color
      });
    });

    const mostUsedTags = Array.from(tagCounts.entries())
      .map(([name, data]) => ({ name, count: data.count, color: data.color }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Recently used tags
    const recentTagMap = new Map();
    recentActivity.forEach(activity => {
      const tagName = activity.metadata?.['tagName'] as string;
      if (tagName && !recentTagMap.has(tagName)) {
        recentTagMap.set(tagName, activity.createdAt);
      }
    });

    const recentlyUsed = Array.from(recentTagMap.entries())
      .map(([name, lastUsed]) => ({ name, lastUsed }))
      .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
      .slice(0, 10);

    // Tag growth over time
    const tagGrowth = this.calculateTagGrowth(tagUsage, days);

    // Color distribution
    const colorCounts = new Map();
    allTags.forEach(tag => {
      const color = tag.color || '#gray';
      colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
    });

    const colorDistribution = Array.from(colorCounts.entries())
      .map(([color, count]) => ({ color, count }))
      .sort((a, b) => b.count - a.count);

    // Tag relationships (co-occurrence analysis)
    const relationshipMap = await this.calculateTagRelationships(userId);

    return {
      totalTags: allTags.length,
      mostUsedTags,
      recentlyUsed,
      tagGrowth,
      colorDistribution,
      relationshipMap
    };
  }

  async suggestTags(noteId: string, userId: string, content: string): Promise<TagSuggestion[]> {
    const suggestions: TagSuggestion[] = [];

    // Get user's existing tags for pattern matching
    const userTags = await this.getUserTags(userId);
    const tagNames = userTags.map(t => t.name.toLowerCase());

    // Content-based suggestions
    const contentSuggestions = await this.generateContentBasedSuggestions(content, tagNames);
    suggestions.push(...contentSuggestions);

    // Pattern-based suggestions from user history
    const patternSuggestions = await this.generatePatternBasedSuggestions(userId, content);
    suggestions.push(...patternSuggestions);

    // Similar notes suggestions
    const similarSuggestions = await this.generateSimilarNotesSuggestions(noteId, userId);
    suggestions.push(...similarSuggestions);

    // Deduplicate and sort by confidence
    const uniqueSuggestions = this.deduplicateSuggestions(suggestions);
    
    return uniqueSuggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 8);
  }

  async bulkTagOperation(userId: string, operation: {
    type: 'assign' | 'remove' | 'replace';
    noteIds: string[];
    tagIds: string[];
    replacementTagId?: string;
  }) {
    let processedCount = 0;
    let errors: string[] = [];

    for (const noteId of operation.noteIds) {
      try {
        // Verify note ownership
        const note = await this.prisma.note.findFirst({
          where: { id: noteId, ownerId: userId }
        });

        if (!note) {
          errors.push(`Note ${noteId} not found or not owned by user`);
          continue;
        }

        switch (operation.type) {
          case 'assign':
            await this.assignTagsToNote(noteId, operation.tagIds);
            break;
          case 'remove':
            await this.removeTagsFromNote(noteId, operation.tagIds);
            break;
          case 'replace':
            if (operation.replacementTagId) {
              await this.replaceTagsOnNote(noteId, operation.tagIds, operation.replacementTagId);
            }
            break;
        }

        processedCount++;
      } catch (error) {
        errors.push(`Error processing note ${noteId}: ${error.message}`);
      }
    }

    // Track bulk operation
    await this.activitiesService.recordActivity({
      userId,
      action: 'TAG_BULK_OPERATION',
      metadata: {
        operation: operation.type,
        notesProcessed: processedCount,
        tagsInvolved: operation.tagIds.length,
        errors: errors.length
      }
    });

    return {
      success: errors.length === 0,
      processedCount,
      totalRequested: operation.noteIds.length,
      errors
    };
  }

  async getTagSuggestionHistory(userId: string, limit: number = 20) {
    const activities = await this.prisma.userActivity.findMany({
      where: {
        userId,
        action: 'TAG_SUGGESTION_APPLIED',
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return activities.map(activity => ({
      id: activity.id,
      suggestedTag: activity.metadata?.['suggestedTag'],
      confidence: activity.metadata?.['confidence'],
      appliedAt: activity.createdAt,
      noteId: activity.noteId
    }));
  }

  private generateContentBasedSuggestions(content: string, existingTags: string[]): TagSuggestion[] {
    const suggestions: TagSuggestion[] = [];
    const words = content.toLowerCase().split(/\s+/);
    
    // Common tag patterns based on content analysis
    const patterns = {
      'meeting': ['meeting', 'call', 'discussion', 'agenda'],
      'project': ['project', 'task', 'milestone', 'deadline'],
      'research': ['research', 'analysis', 'study', 'findings'],
      'idea': ['idea', 'brainstorm', 'concept', 'thought'],
      'tutorial': ['tutorial', 'guide', 'how-to', 'steps'],
      'reference': ['reference', 'documentation', 'manual', 'guide']
    };

    Object.entries(patterns).forEach(([tag, keywords]) => {
      if (existingTags.includes(tag)) {
        const matches = keywords.filter(keyword => 
          words.some(word => word.includes(keyword))
        );
        
        if (matches.length > 0) {
          suggestions.push({
            name: tag,
            confidence: Math.min(0.9, matches.length * 0.3),
            reason: 'content_based',
            relatedTags: []
          });
        }
      }
    });

    return suggestions;
  }

  private async generatePatternBasedSuggestions(userId: string, content: string): Promise<TagSuggestion[]> {
    // Get user's tag usage patterns
    const recentTaggedNotes = await this.prisma.note.findMany({
      where: {
        ownerId: userId,
        isDeleted: false,
        noteTags: {
          some: {}
        }
      },
      include: {
        noteTags: {
          include: {
            tag: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Analyze content similarity and suggest tags from similar notes
    const suggestions: TagSuggestion[] = [];
    const contentWords = new Set(content.toLowerCase().split(/\s+/));

    for (const note of recentTaggedNotes) {
      const noteWords = new Set(note.content.toLowerCase().split(/\s+/));
      const intersection = new Set([...contentWords].filter(x => noteWords.has(x)));
      const similarity = intersection.size / Math.max(contentWords.size, noteWords.size);

      if (similarity > 0.2) {
        note.noteTags.forEach(noteTag => {
          const existingSuggestion = suggestions.find(s => s.name === noteTag.tag.name);
          if (existingSuggestion) {
            existingSuggestion.confidence = Math.min(0.9, existingSuggestion.confidence + similarity * 0.3);
          } else {
            suggestions.push({
              name: noteTag.tag.name,
              confidence: similarity * 0.6,
              reason: 'pattern_based',
              relatedTags: []
            });
          }
        });
      }
    }

    return suggestions.filter(s => s.confidence > 0.3);
  }

  private async generateSimilarNotesSuggestions(noteId: string, userId: string): Promise<TagSuggestion[]> {
    // This would integrate with the semantic search to find similar notes
    // For now, return empty array as it requires vector search integration
    return [];
  }

  private deduplicateSuggestions(suggestions: TagSuggestion[]): TagSuggestion[] {
    const seen = new Map<string, TagSuggestion>();
    
    suggestions.forEach(suggestion => {
      const existing = seen.get(suggestion.name);
      if (!existing || suggestion.confidence > existing.confidence) {
        seen.set(suggestion.name, suggestion);
      }
    });

    return Array.from(seen.values());
  }

  private async assignTagsToNote(noteId: string, tagIds: string[]) {
    for (const tagId of tagIds) {
      try {
        await this.prisma.noteTag.create({
          data: { noteId, tagId }
        });
      } catch (error) {
        // Tag already assigned, ignore
      }
    }
  }

  private async removeTagsFromNote(noteId: string, tagIds: string[]) {
    await this.prisma.noteTag.deleteMany({
      where: {
        noteId,
        tagId: { in: tagIds }
      }
    });
  }

  private async replaceTagsOnNote(noteId: string, oldTagIds: string[], newTagId: string) {
    await this.removeTagsFromNote(noteId, oldTagIds);
    await this.assignTagsToNote(noteId, [newTagId]);
  }

  private calculateTagGrowth(tagUsage: any[], days: number) {
    const growthMap = new Map();
    
    // Initialize with zeros
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      growthMap.set(dateStr, 0);
    }

    // Count tag usage by day
    tagUsage.forEach(usage => {
      const dateStr = usage.note.createdAt.toISOString().split('T')[0];
      if (growthMap.has(dateStr)) {
        growthMap.set(dateStr, growthMap.get(dateStr) + 1);
      }
    });

    return Array.from(growthMap.entries()).map(([date, count]) => ({
      date,
      count
    }));
  }

  private async calculateTagRelationships(userId: string) {
    // Get notes with multiple tags to analyze co-occurrence
    const notesWithTags = await this.prisma.note.findMany({
      where: {
        ownerId: userId,
        isDeleted: false,
        noteTags: {
          some: {}
        }
      },
      include: {
        noteTags: {
          include: {
            tag: { select: { name: true } }
          }
        }
      }
    });

    const coOccurrences = new Map<string, number>();

    notesWithTags.forEach(note => {
      const tags = note.noteTags.map(nt => nt.tag.name);
      
      // Calculate co-occurrences
      for (let i = 0; i < tags.length; i++) {
        for (let j = i + 1; j < tags.length; j++) {
          const pair = [tags[i], tags[j]].sort().join('|');
          coOccurrences.set(pair, (coOccurrences.get(pair) || 0) + 1);
        }
      }
    });

    return Array.from(coOccurrences.entries())
      .map(([pair, count]) => {
        const [tag1, tag2] = pair.split('|');
        return { tag1, tag2, coOccurrences: count };
      })
      .sort((a, b) => b.coOccurrences - a.coOccurrences)
      .slice(0, 20);
  }

  private generateRandomColor(): string {
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
      '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
      '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
      '#ec4899', '#f43f5e'
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
