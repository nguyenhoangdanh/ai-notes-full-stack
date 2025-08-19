import { apiClient } from '../lib/api-client';
import {
  Collaborator,
  InviteCollaboratorDto,
  UpdatePermissionDto,
  CollaborationStats,
  CursorUpdate,
  ShareLink,
  CreateShareLinkDto,
  UpdateShareLinkDto,
  ShareAnalytics,
  ShareStats,
  NoteVersion,
  CreateVersionDto,
  VersionComparison,
  VersionStatistics,
  VersionTimeline,
  Activity,
  ActivityInsights,
  ActivityFeed,
  ActivityStats,
  TrackActivityDto,
  ProductivityHeatmap,
  Tag,
  CreateTagDto,
  UpdateTagDto,
  TagHierarchy,
  TagAnalytics,
  TagSuggestion,
  BulkTagOperationDto
} from '../types';

// Collaboration Service
export const collaborationService = {
  // Collaboration management
  inviteCollaborator: (noteId: string, data: InviteCollaboratorDto) =>
    apiClient.post<Collaborator>(`/collaboration/notes/${noteId}/invite`, { body: data }),

  getCollaborators: (noteId: string) =>
    apiClient.get<Collaborator[]>(`/collaboration/notes/${noteId}/collaborators`),

  removeCollaborator: (noteId: string, userId: string) =>
    apiClient.delete<void>(`/collaboration/notes/${noteId}/collaborators/${userId}`),

  updatePermission: (noteId: string, userId: string, data: UpdatePermissionDto) =>
    apiClient.patch<Collaborator>(`/collaboration/notes/${noteId}/collaborators/${userId}/permission`, { body: data }),

  getPermission: (noteId: string) =>
    apiClient.get<{ permission: string }>(`/collaboration/notes/${noteId}/permission`),

  getMyCollaborations: () =>
    apiClient.get<any[]>('/collaboration/my-collaborations'),

  getStats: () =>
    apiClient.get<CollaborationStats>('/collaboration/stats'),

  joinNote: (noteId: string) =>
    apiClient.post<void>(`/collaboration/notes/${noteId}/join`),

  leave: () =>
    apiClient.post<void>('/collaboration/leave'),

  updateCursor: (data: CursorUpdate) =>
    apiClient.post<void>('/collaboration/cursor-update', { body: data }),
};

// Share Service
export const shareService = {
  createShareLink: (noteId: string, data?: CreateShareLinkDto) =>
    apiClient.post<ShareLink>(`/share/notes/${noteId}/create`, { body: data }),

  updateShareLink: (shareLinkId: string, data: UpdateShareLinkDto) =>
    apiClient.patch<ShareLink>(`/share/${shareLinkId}`, { body: data }),

  deleteShareLink: (shareLinkId: string) =>
    apiClient.delete<void>(`/share/${shareLinkId}`),

  getMyShares: () =>
    apiClient.get<ShareLink[]>('/share/my-shares'),

  accessSharedNote: (token: string) =>
    apiClient.get<any>(`/share/${token}/access`),

  getAnalytics: (shareLinkId: string) =>
    apiClient.get<ShareAnalytics>(`/share/${shareLinkId}/analytics`),

  toggleStatus: (shareLinkId: string) =>
    apiClient.patch<ShareLink>(`/share/${shareLinkId}/toggle-status`),

  regenerateToken: (shareLinkId: string) =>
    apiClient.post<ShareLink>(`/share/${shareLinkId}/regenerate-token`),

  getStatsSummary: () =>
    apiClient.get<ShareStats>('/share/stats/summary'),

  checkToken: (token: string) =>
    apiClient.get<any>(`/share/check/${token}`),
};

// Versions Service
export const versionsService = {
  createVersion: (noteId: string, data?: CreateVersionDto) =>
    apiClient.post<NoteVersion>(`/versions/notes/${noteId}/create`, { body: data }),

  getHistory: (noteId: string) =>
    apiClient.get<NoteVersion[]>(`/versions/notes/${noteId}/history`),

  getVersion: (versionId: string) =>
    apiClient.get<NoteVersion>(`/versions/${versionId}`),

  compareVersions: (noteId: string, fromVersion: string, toVersion: string) =>
    apiClient.get<VersionComparison>(`/versions/notes/${noteId}/compare`, {
      query: { from: fromVersion, to: toVersion }
    }),

  restoreVersion: (versionId: string) =>
    apiClient.post<any>(`/versions/${versionId}/restore`),

  deleteVersion: (versionId: string) =>
    apiClient.delete<void>(`/versions/${versionId}`),

  getStatistics: (noteId: string) =>
    apiClient.get<VersionStatistics>(`/versions/notes/${noteId}/statistics`),

  getRecent: () =>
    apiClient.get<NoteVersion[]>('/versions/recent'),

  createAutoVersion: (noteId: string) =>
    apiClient.post<NoteVersion>(`/versions/notes/${noteId}/auto-version`),

  getTimeline: (noteId: string) =>
    apiClient.get<VersionTimeline>(`/versions/notes/${noteId}/timeline`),
};

// Activities Service
export const activitiesService = {
  getActivities: (limit?: number, cursor?: string) =>
    apiClient.get<ActivityFeed>('/activities', {
      query: { limit, cursor }
    }),

  getInsights: () =>
    apiClient.get<ActivityInsights>('/activities/insights'),

  getFeed: (limit?: number, cursor?: string) =>
    apiClient.get<ActivityFeed>('/activities/feed', {
      query: { limit, cursor }
    }),

  getStats: () =>
    apiClient.get<ActivityStats>('/activities/stats'),

  trackActivity: (data: TrackActivityDto) =>
    apiClient.post<void>('/activities/track', { body: data }),

  cleanup: (daysToKeep?: number) =>
    apiClient.delete<{ deletedCount: number }>('/activities/cleanup', {
      query: daysToKeep ? { daysToKeep: daysToKeep.toString() } : {}
    }),

  exportData: (format?: 'json' | 'csv') =>
    apiClient.get<any>('/activities/export', {
      query: format ? { format } : {}
    }),

  getHeatmap: (year?: number) =>
    apiClient.get<ProductivityHeatmap[]>('/activities/heatmap', {
      query: year ? { year: year.toString() } : {}
    }),

  getProductivityStats: () =>
    apiClient.get<any>('/activities/productivity'),
};

// Tags Service
export const tagsService = {
  create: (data: CreateTagDto) =>
    apiClient.post<Tag>('/tags', { body: data }),

  getAll: () =>
    apiClient.get<Tag[]>('/tags'),

  getHierarchy: () =>
    apiClient.get<TagHierarchy[]>('/tags/hierarchy'),

  getAnalytics: () =>
    apiClient.get<TagAnalytics>('/tags/analytics'),

  update: (tagId: string, data: UpdateTagDto) =>
    apiClient.put<Tag>(`/tags/${tagId}`, { body: data }),

  delete: (tagId: string) =>
    apiClient.delete<void>(`/tags/${tagId}`),

  getSuggestions: (noteId: string) =>
    apiClient.post<TagSuggestion[]>(`/tags/suggest/${noteId}`),

  bulkOperation: (data: BulkTagOperationDto) =>
    apiClient.post<any>('/tags/bulk-operation', { body: data }),

  getSuggestionHistory: () =>
    apiClient.get<any[]>('/tags/suggestions/history'),

  exportTags: (format?: 'json' | 'csv') =>
    apiClient.get<any>('/tags/export', {
      query: format ? { format } : {}
    }),

  importTags: (data: any) =>
    apiClient.post<any>('/tags/import', { body: data }),
};