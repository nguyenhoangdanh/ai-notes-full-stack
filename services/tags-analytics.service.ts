/**
 * Tags and Analytics API Services
 */

import { apiClient } from '../lib/api-client';

// Tags interfaces
export interface Tag {
  id: string;
  name: string;
  color?: string;
  description?: string;
  parentId?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagDto {
  name: string;
  color?: string;
  description?: string;
  parentId?: string;
}

export interface UpdateTagDto {
  name?: string;
  color?: string;
  description?: string;
  parentId?: string;
}

export interface TagHierarchy {
  id: string;
  name: string;
  color?: string;
  description?: string;
  children: TagHierarchy[];
  noteCount: number;
}

export interface TagAnalytics {
  totalTags: number;
  mostUsedTags: { tag: Tag; count: number }[];
  recentlyUsed: Tag[];
  hierarchyDepth: number;
}

export interface BulkTagOperation {
  action: 'merge' | 'delete' | 'rename';
  tagIds: string[];
  targetTagId?: string;
  newName?: string;
}

// Analytics interfaces
export interface AnalyticsOverview {
  totalNotes: number;
  totalWorkspaces: number;
  totalTags: number;
  totalCollaborations: number;
  recentActivity: number;
  storageUsed: number;
  aiQueries: number;
  collaborators: number;
}

export interface WorkspaceAnalytics {
  id: string;
  name: string;
  noteCount: number;
  lastActivity: string;
  collaboratorCount: number;
  storageUsed: number;
  growth: number;
}

export interface ContentAnalytics {
  wordCount: number;
  averageNoteLength: number;
  mostActiveCategories: { category: string; count: number }[];
  contentGrowth: { date: string; notes: number; words: number }[];
  languageDistribution: { language: string; percentage: number }[];
}

// Tags Service
export const tagsService = {
  /**
   * Create a new tag
   */
  async createTag(data: CreateTagDto): Promise<Tag> {
    return apiClient.post<Tag>('/tags', { body: data });
  },

  /**
   * Get all user tags
   */
  async getTags(): Promise<Tag[]> {
    return apiClient.get<Tag[]>('/tags');
  },

  /**
   * Get tag hierarchy
   */
  async getTagHierarchy(): Promise<TagHierarchy[]> {
    return apiClient.get<TagHierarchy[]>('/tags/hierarchy');
  },

  /**
   * Get tag analytics
   */
  async getTagAnalytics(): Promise<TagAnalytics> {
    return apiClient.get<TagAnalytics>('/tags/analytics');
  },

  /**
   * Update tag
   */
  async updateTag(tagId: string, data: UpdateTagDto): Promise<Tag> {
    return apiClient.put<Tag>(`/tags/${tagId}`, { body: data });
  },

  /**
   * Delete tag
   */
  async deleteTag(tagId: string): Promise<void> {
    return apiClient.delete<void>(`/tags/${tagId}`);
  },

  /**
   * Suggest tags for a note
   */
  async suggestTags(noteId: string): Promise<Tag[]> {
    return apiClient.post<Tag[]>(`/tags/suggest/${noteId}`);
  },

  /**
   * Bulk tag operations
   */
  async bulkOperation(operation: BulkTagOperation): Promise<void> {
    return apiClient.post<void>('/tags/bulk-operation', { body: operation });
  },

  /**
   * Get tag suggestion history
   */
  async getTagSuggestionHistory(): Promise<any[]> {
    return apiClient.get<any[]>('/tags/suggestions/history');
  },

  /**
   * Export tags
   */
  async exportTags(): Promise<Blob> {
    return apiClient.get<Blob>('/tags/export');
  },

  /**
   * Import tags
   */
  async importTags(file: File): Promise<{ imported: number; skipped: number }> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<{ imported: number; skipped: number }>('/tags/import', { 
      body: formData,
      headers: {} // Remove Content-Type to let browser set it for FormData
    });
  }
};

// Analytics Service
export const analyticsService = {
  /**
   * Get analytics overview
   */
  async getOverview(): Promise<AnalyticsOverview> {
    return apiClient.get<AnalyticsOverview>('/analytics/overview');
  },

  /**
   * Get workspace analytics
   */
  async getWorkspaceAnalytics(): Promise<WorkspaceAnalytics[]> {
    return apiClient.get<WorkspaceAnalytics[]>('/analytics/workspaces');
  },

  /**
   * Get content analytics
   */
  async getContentAnalytics(): Promise<ContentAnalytics> {
    return apiClient.get<ContentAnalytics>('/analytics/content');
  },

  /**
   * Track note action
   */
  async trackNoteAction(noteId: string, action: 'view' | 'edit' | 'share'): Promise<void> {
    return apiClient.post<void>(`/analytics/note/${noteId}/track`, { body: { action } });
  }
};