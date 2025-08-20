import { apiClient } from '../lib/api-client';
import {
  GetActivitiesResponse,
  GetActivityInsightsResponse,
  GetActivityFeedResponse,
  GetActivityStatsResponse,
  TrackActivityResponse,
  TrackActivityRequest,
  CleanupOldActivitiesResponse,
  ExportActivitiesResponse,
  GetActivityHeatmapResponse,
  GetProductivityMetricsResponse
} from '../types/activities.types';

/**
 * Activities Service
 * Generated from backend analysis
 */
export const activitiesService = {
  /**
   * GET /activities
   */
  async getActivities(): Promise<GetActivitiesResponse> {
    return apiClient.get(`/activities`);
  },

  /**
   * GET /activities/insights
   */
  async getActivityInsights(): Promise<GetActivityInsightsResponse> {
    return apiClient.get(`/activities/insights`);
  },

  /**
   * GET /activities/feed
   */
  async getActivityFeed(): Promise<GetActivityFeedResponse> {
    return apiClient.get(`/activities/feed`);
  },

  /**
   * GET /activities/stats
   */
  async getActivityStats(): Promise<GetActivityStatsResponse> {
    return apiClient.get(`/activities/stats`);
  },

  /**
   * POST /activities/track
   */
  async trackActivity(data: TrackActivityRequest): Promise<TrackActivityResponse> {
    return apiClient.post(`/activities/track`, { body: data });
  },

  /**
   * DELETE /activities/cleanup
   */
  async cleanupOldActivities(): Promise<CleanupOldActivitiesResponse> {
    return apiClient.delete(`/activities/cleanup`);
  },

  /**
   * GET /activities/export
   */
  async exportActivities(): Promise<ExportActivitiesResponse> {
    return apiClient.get(`/activities/export`);
  },

  /**
   * GET /activities/heatmap
   */
  async getActivityHeatmap(): Promise<GetActivityHeatmapResponse> {
    return apiClient.get(`/activities/heatmap`);
  },

  /**
   * GET /activities/productivity
   */
  async getProductivityMetrics(): Promise<GetProductivityMetricsResponse> {
    return apiClient.get(`/activities/productivity`);
  }
};
