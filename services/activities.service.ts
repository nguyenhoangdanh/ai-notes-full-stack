import { apiClient, TQuery } from '../lib/api-client';
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
  GetProductivityMetricsResponse,
  ActivitiesDto,
  IExportToCSV,
  IExportToJSON
} from '../types/activities.types';

/**
 * Activities Service
 * Generated from backend analysis
 */
export const activitiesService = {
  /**
   * GET /activities
   */
  async getActivities(query?: ActivitiesDto): Promise<GetActivitiesResponse> {
    return apiClient.get(`/activities`, { query });
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
  async cleanupOldActivities(query?: { days?: string }): Promise<CleanupOldActivitiesResponse> {
    return apiClient.delete(`/activities/cleanup`, { query });
  },

  /**
   * GET /activities/export
   */
  async exportActivities(
    query?: { 
      format?: 'json' | 'csv' 
      days?: string
    }
  ): Promise<ExportActivitiesResponse> {
    const finalQuery = { format: 'json', ...query };
    return apiClient.get(`/activities/export`, { query: finalQuery })
  },

  /**
   * GET /activities/heatmap
   */
  async getActivityHeatmap(
    query?: { days?: string }
  ): Promise<GetActivityHeatmapResponse> {
    return apiClient.get(`/activities/heatmap`, { query });
  },

  /**
   * GET /activities/productivity
   */
  async getProductivityMetrics(): Promise<GetProductivityMetricsResponse> {
    return apiClient.get(`/activities/productivity`);
  }
};
