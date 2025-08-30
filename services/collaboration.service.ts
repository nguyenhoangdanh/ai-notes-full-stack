import { CollaborationResponse, GetCollaborationStatsResponse, GetPermissionResponse, InviteCollaboratorResponse, JoinCollaborationResponse, MyCollaborationResponse } from '@/types/collaboration.types';
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
  CollabCreateTagDto as CreateTagDto,
  UpdateTagDto,
  TagHierarchy,
  TagAnalytics,
  TagSuggestion,
  BulkTagOperationDto
} from '../types';
import { AccessSharedNoteDto, CheckShareLinkResponse, MyShareLinksResponse, RegenerateTokenResponse, ShareLinkAnalyticsResponse, ShareLinkResponse, StatsSummaryResponse } from '@/types/share.types';

// Collaboration Service
export const collaborationService = {
  // Collaboration management
  async inviteCollaborator(noteId: string, data: InviteCollaboratorDto): Promise<InviteCollaboratorResponse> {
    return await apiClient.post<InviteCollaboratorResponse>(`/collaboration/notes/${noteId}/invite`, { body: data });
  },

  async getCollaborators(noteId: string): Promise<CollaborationResponse> {
    return await apiClient.get<CollaborationResponse>(`/collaboration/notes/${noteId}/collaborators`);
  },

  async removeCollaborator(noteId: string, userId: string): Promise<{ success: boolean }> {
    return await apiClient.delete<{ success: boolean }>(`/collaboration/notes/${noteId}/collaborators/${userId}`);
  },

  async updatePermission(noteId: string, userId: string, data: UpdatePermissionDto): Promise<{
    success: boolean;
    message: any;
  }> {
    return await apiClient.patch<{ success: boolean; message: any }>(`/collaboration/notes/${noteId}/collaborators/${userId}/permission`, { body: data });
  },

  async getPermission(noteId: string): Promise<GetPermissionResponse> {
    return await apiClient.get<GetPermissionResponse>(`/collaboration/notes/${noteId}/permission`);
  },

  async getMyCollaborations(): Promise<MyCollaborationResponse> {
    return await apiClient.get<MyCollaborationResponse>('/collaboration/my-collaborations');
  },

  async getStats(): Promise<GetCollaborationStatsResponse> {
    return await apiClient.get<GetCollaborationStatsResponse>('/collaboration/stats');
  },

  async joinNote(noteId: string, data: { socketId: string }): Promise<JoinCollaborationResponse> {
    return await apiClient.post<JoinCollaborationResponse>(`/collaboration/notes/${noteId}/join`, { body: data });
  },

  async leaveNote(data: { socketId: string }): Promise<{ success: boolean }> {
    return await apiClient.post<{ success: boolean }>('/collaboration/leave', { body: data });
  },

  async updateCursor(data: CursorUpdate): Promise<{success: boolean}> {
    return await apiClient.post<{success: boolean}>('/collaboration/cursor-update', { body: data });
  },
};


// Share Service
export const shareService = {
  async createShareLink(noteId: string, data?: CreateShareLinkDto): Promise<ShareLinkResponse> {
    return await apiClient.post<ShareLinkResponse>(`/share/notes/${noteId}/create`, { body: data });
  },

  async updateShareLink(shareLinkId: string, data: UpdateShareLinkDto) : Promise<ShareLinkResponse> {
    return await apiClient.patch<ShareLinkResponse>(`/share/${shareLinkId}`, { body: data });
  },

  async deleteShareLink(shareLinkId: string): Promise<{success: boolean}> {
    return await apiClient.delete<{success: boolean}>(`/share/${shareLinkId}`);
  },

  async getMyShares(): Promise<MyShareLinksResponse> {
    return await apiClient.get<MyShareLinksResponse>('/share/my-shares');
  },


  //Note PREVIEW BACKEND 
  async accessSharedNote(token: string, data?: AccessSharedNoteDto) {
    return await apiClient.get<any>(`/share/${token}/access`);
  },

  async getAnalytics(shareLinkId: string): Promise<ShareLinkAnalyticsResponse> {
    return await apiClient.get<ShareLinkAnalyticsResponse>(`/share/${shareLinkId}/analytics`);
  },

  async toggleStatus(shareLinkId: string) : Promise<
  {success: boolean; isActive: boolean; message?: string}> {
    return await apiClient.patch<{
      success: boolean;
      isActive: boolean;
      message?: string;
    }>(`/share/${shareLinkId}/toggle-status`);
  },

  async regenerateToken(shareLinkId: string): Promise<RegenerateTokenResponse> {
    return await apiClient.post<RegenerateTokenResponse>(`/share/${shareLinkId}/regenerate-token`);
  },

  async getStatsSummary(): Promise<StatsSummaryResponse> {
    return await apiClient.get<StatsSummaryResponse>('/share/stats/summary');
  },

  async checkToken(token: string): Promise<CheckShareLinkResponse> {
    return await apiClient.get<CheckShareLinkResponse>(`/share/check/${token}`);
  },

};

// Versions Service
export const versionsService = {
  async createVersion(noteId: string, data?: CreateVersionDto) {
    return await apiClient.post<NoteVersion>(`/versions/notes/${noteId}/create`, { body: data });
  },

  async getHistory(noteId: string) {
    return await apiClient.get<NoteVersion[]>(`/versions/notes/${noteId}/history`);
  },

  async getVersion(versionId: string) {
    return await apiClient.get<NoteVersion>(`/versions/${versionId}`);
  },

  async compareVersions(noteId: string, fromVersion: string, toVersion: string) {
    return await apiClient.get<VersionComparison>(`/versions/notes/${noteId}/compare`, {
      query: { from: fromVersion, to: toVersion }
    });
  },

  async restoreVersion(versionId: string) {
    return await apiClient.post<any>(`/versions/${versionId}/restore`);
  },

  async deleteVersion(versionId: string) {
    return await apiClient.delete<void>(`/versions/${versionId}`);
  },

  async getStatistics(noteId: string) {
    return await apiClient.get<VersionStatistics>(`/versions/notes/${noteId}/statistics`);
  },

  async getRecent() {
    return await apiClient.get<NoteVersion[]>('/versions/recent');
  },

  async createAutoVersion(noteId: string) {
    return await apiClient.post<NoteVersion>(`/versions/notes/${noteId}/auto-version`);
  },

  async getTimeline(noteId: string) {
    return await apiClient.get<VersionTimeline>(`/versions/notes/${noteId}/timeline`);
  },
};

// Activities Service
export const activitiesService = {
  async getActivities(limit?: number, cursor?: string) {
    return await apiClient.get<ActivityFeed>('/activities', {
      query: { limit, cursor }
    });
  },

  async getInsights() {
    return await apiClient.get<ActivityInsights>('/activities/insights');
  },

  async getFeed(limit?: number, cursor?: string) {
    return await apiClient.get<ActivityFeed>('/activities/feed', {
      query: { limit, cursor }
    });
  },

  async getStats() {
    return await apiClient.get<ActivityStats>('/activities/stats');
  },

  async trackActivity(data: TrackActivityDto) {
    return await apiClient.post<void>('/activities/track', { body: data });
  },

  async cleanup(daysToKeep?: number) {
    return await apiClient.delete<{ deletedCount: number }>('/activities/cleanup', {
      query: daysToKeep ? { daysToKeep: daysToKeep.toString() } : {}
    });
  },

  async exportData(format?: 'json' | 'csv') {
    return await apiClient.get<any>('/activities/export', {
      query: format ? { format } : {}
    });
  },

  async getHeatmap(year?: number) {
    return await apiClient.get<ProductivityHeatmap[]>('/activities/heatmap', {
      query: year ? { year: year.toString() } : {}
    });
  },

  async getProductivityStats() {
    return await apiClient.get<any>('/activities/productivity');
  },
};

// Tags Service
export const tagsService = {
  async create(data: CreateTagDto) {
    return await apiClient.post<Tag>('/tags', { body: data });
  },

  async getAll() {
    return await apiClient.get<Tag[]>('/tags');
  },

  async getHierarchy() {
    return await apiClient.get<TagHierarchy[]>('/tags/hierarchy');
  },

  async getAnalytics() {
    return await apiClient.get<TagAnalytics>('/tags/analytics');
  },

  async update(tagId: string, data: UpdateTagDto) {
    return await apiClient.put<Tag>(`/tags/${tagId}`, { body: data });
  },

  async delete(tagId: string) {
    return await apiClient.delete<void>(`/tags/${tagId}`);
  },

  async getSuggestions(noteId: string) {
    return await apiClient.post<TagSuggestion[]>(`/tags/suggest/${noteId}`);
  },

  async bulkOperation(data: BulkTagOperationDto) {
    return await apiClient.post<any>('/tags/bulk-operation', { body: data });
  },

  async getSuggestionHistory() {
    return await apiClient.get<any[]>('/tags/suggestions/history');
  },

  async exportTags(format?: 'json' | 'csv') {
    return await apiClient.get<any>('/tags/export', {
      query: format ? { format } : {}
    });
  },

  async importTags(data: any) {
    return await apiClient.post<any>('/tags/import', { body: data });
  },
}