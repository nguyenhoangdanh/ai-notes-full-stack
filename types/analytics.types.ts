/**
 * Analytics Module Types
 * Generated from backend analysis
 */

export interface UserAnalytics {
  totalNotes: number;
  totalWords: number;
  averageNoteLength: number;
  mostUsedTags: string[];
  activityScore: number;
}

export interface WorkspaceAnalytics {
  workspaceId: string;
  noteCount: number;
  totalSize: number;
  collaboratorCount: number;
}

export interface ContentAnalytics {
  averageReadingTime: number;
  mostViewedNotes: Array<{
    id: string;
    title: string;
    views: number;
  }>;
  categoryDistribution: Record<string, number>;
}

export interface GetUserAnalyticsResponse {
  // Define single item response
}

export interface GetWorkspaceAnalyticsResponse {
  // Define single item response
}

export interface GetContentAnalyticsResponse {
  // Define single item response
}

export interface TrackNoteActionRequest {
  action: string;
  metadata?: Record<string, any>;
}

export interface TrackNoteActionResponse {
  success: boolean;
  message?: string;
}

export interface TrackNoteActionParams {
  noteId: string;
}

