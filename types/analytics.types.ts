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
  success: boolean;
  data: {
    overview: {
      noteCount: number;
      totalWordCount: number;
      averageNoteLength: number;
      writingStreak: number;
    };
    charts: {
      notesByMonth: Array<{
        month: string; 
        count: number;
      }>;
      topTags: Array<{
        tag: string;
        count: number;
      }>;
    };
    features: {
      collaboration: {
        sharedNotes: number;
        collaborations: number;
        shareLinks: number;
      };
      tasks: {
        total: number;
        completed: number;
        inProgress: number;
        overdue: number;
        completionRate: number;
      };
      pomodoro: {
        totalSessions: number;
        totalDurationMinutes: number;
        todaySessions: number;
        averageSessionLength: number;
      };
      search: {
        totalSearches: number;
        uniqueQueries: number;
        recentSearches: number;
        topQueries: Array<{
          query: string;
          count: number;
        }>;
      };
    };
  };
  message?: string;
}

export interface GetWorkspaceAnalyticsResponse {
  // Define single item response
   id: string;
    name: string;
    noteCount: number;
    isDefault: boolean;
    createdAt: Date;
}

export interface GetContentAnalyticsResponse {
  // Define single item response
  totalCharacters: number;
    totalSentences: number;
    averageCharactersPerNote: number;
    averageSentencesPerNote: number;
    topWords: Array<{
        word: string;
        count: number;
    }>;
  }

export interface TrackNoteActionRequest {
  action: 'view' | 'edit' | 'share';
  // metadata?: Record<string, any>;
}

export interface TrackNoteActionResponse {
  success: boolean;
  message?: string;
}

export interface TrackNoteActionParams {
  noteId: string;
}

