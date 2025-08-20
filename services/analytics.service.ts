import { apiClient } from '../lib/api-client';
import {
  GetUserAnalyticsResponse,
  GetWorkspaceAnalyticsResponse,
  GetContentAnalyticsResponse,
  TrackNoteActionResponse,
  TrackNoteActionRequest,
  TrackNoteActionParams
} from '../types/analytics.types';

/**
 * Analytics Service
 * Generated from backend analysis
 */
export const analyticsService = {
  /**
   * GET /analytics/overview
   */
  async getUserAnalytics(): Promise<GetUserAnalyticsResponse> {
    return apiClient.get(`/analytics/overview`);
  },

  /**
   * GET /analytics/workspaces
   */
  async getWorkspaceAnalytics(): Promise<GetWorkspaceAnalyticsResponse> {
    return apiClient.get(`/analytics/workspaces`);
  },

  /**
   * GET /analytics/content
   */
  async getContentAnalytics(): Promise<GetContentAnalyticsResponse> {
    return apiClient.get(`/analytics/content`);
  },

  /**
   * POST /analytics/note/:noteId/track
   */
  async trackNoteAction(params: TrackNoteActionParams, data: TrackNoteActionRequest): Promise<TrackNoteActionResponse> {
    return apiClient.post(`/analytics/note/${params.noteId}/track`, { body: data });
  }
};
