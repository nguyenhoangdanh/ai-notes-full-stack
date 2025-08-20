/**
 * Activities Module Types
 * Generated from backend analysis
 */

export interface Activity {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ActivityInsights {
  totalActivities: number;
  mostActiveHour: number;
  mostActiveDay: string;
  activityTrends: Array<{
    date: string;
    count: number;
  }>;
}

export interface ActivityStats {
  totalToday: number;
  totalWeek: number;
  totalMonth: number;
  byType: Record<string, number>;
}

export interface GetActivitiesResponse {
  // Define single item response
}

export interface GetActivityInsightsResponse {
  // Define single item response
}

export interface GetActivityFeedResponse {
  // Define single item response
}

export interface GetActivityStatsResponse {
  // Define single item response
}

export interface TrackActivityRequest {
  action: string;
  metadata?: Record<string, any>;
}

export interface TrackActivityResponse {
  success: boolean;
  message?: string;
}

export interface CleanupOldActivitiesResponse {
  success: boolean;
  message?: string;
}

export interface ExportActivitiesResponse {
  success: boolean;
  message?: string;
}

export interface GetActivityHeatmapResponse {
  // Define single item response
}

export interface GetProductivityMetricsResponse {
  // Define single item response
}

