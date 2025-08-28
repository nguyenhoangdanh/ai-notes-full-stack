/**
 * Activities Module Types
 * Generated from backend analysis
 */

import { IPeriod, JsonValue } from ".";

export enum Enum_ActivityAction {
  NOTE_CREATE = "NOTE_CREATE",
  NOTE_UPDATE = "NOTE_UPDATE",
  NOTE_DELETE = "NOTE_DELETE",
  NOTE_VIEW = "NOTE_VIEW",
  SEARCH_QUERY = "SEARCH_QUERY",
  SEARCH_CLICK = "SEARCH_CLICK",
  COLLABORATION_JOIN = "COLLABORATION_JOIN",
  COLLABORATION_INVITE = "COLLABORATION_INVITE",
  COLLABORATION_EDIT = "COLLABORATION_EDIT",
  SHARE_CREATE = "SHARE_CREATE",
  SHARE_VIEW = "SHARE_VIEW",
  SHARE_ACCESS = "SHARE_ACCESS",
  VERSION_CREATE = "VERSION_CREATE",
  VERSION_RESTORE = "VERSION_RESTORE",
  CATEGORY_CREATE = "CATEGORY_CREATE",
  CATEGORY_ASSIGN = "CATEGORY_ASSIGN",
  DUPLICATE_DETECT = "DUPLICATE_DETECT",
  DUPLICATE_MERGE = "DUPLICATE_MERGE",
  SUMMARY_GENERATE = "SUMMARY_GENERATE",
  SUMMARY_VIEW = "SUMMARY_VIEW",
  CHAT_QUERY = "CHAT_QUERY",
  CHAT_RESPONSE = "CHAT_RESPONSE",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  SETTINGS_UPDATE = "SETTINGS_UPDATE",
  EXPORT_START = "EXPORT_START",
  EXPORT_COMPLETE = "EXPORT_COMPLETE",
  TASK_CREATE = "TASK_CREATE",
  TASK_COMPLETE = "TASK_COMPLETE",
  POMODORO_START = "POMODORO_START",
  POMODORO_COMPLETE = "POMODORO_COMPLETE",
}

export type ActivityAction =
  | "NOTE_CREATE"
  | "NOTE_UPDATE"
  | "NOTE_DELETE"
  | "NOTE_VIEW"
  | "SEARCH_QUERY"
  | "SEARCH_CLICK"
  | "COLLABORATION_JOIN"
  | "COLLABORATION_INVITE"
  | "COLLABORATION_EDIT"
  | "SHARE_CREATE"
  | "SHARE_VIEW"
  | "SHARE_ACCESS"
  | "VERSION_CREATE"
  | "VERSION_RESTORE"
  | "CATEGORY_CREATE"
  | "CATEGORY_ASSIGN"
  | "DUPLICATE_DETECT"
  | "DUPLICATE_MERGE"
  | "SUMMARY_GENERATE"
  | "SUMMARY_VIEW"
  | "CHAT_QUERY"
  | "CHAT_RESPONSE"
  | "LOGIN"
  | "LOGOUT"
  | "SETTINGS_UPDATE"
  | "EXPORT_START"
  | "EXPORT_COMPLETE"
  | "TASK_CREATE"
  | "TASK_COMPLETE"
  | "POMODORO_START"
  | "POMODORO_COMPLETE"
  | "TAG_CREATE"
  | "TAG_UPDATE"
  | "TAG_DELETE"
  | "TAG_BULK_OPERATION"
  | "TEMPLATE_CREATE"
  | "TEMPLATE_UPDATE"
  | "TEMPLATE_DELETE"
  | "TEMPLATE_DUPLICATE"
  | "TEMPLATE_USE"
  | "ATTACHMENT_UPLOAD"
  | "ATTACHMENT_DELETE";

export interface ActivitiesDto {
  action?: Enum_ActivityAction;
  nodeId?: string;
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}

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
  activitiesByType: Record<string, number>;
  activitiesByDay: Array<{ date: string; count: number }>;
  topNotes: Array<{ noteId: string; title: string; activityCount: number }>;
  averageSessionDuration: number;
  mostActiveHours: Array<{ hour: number; count: number }>;
  productivityScore: number;
  weeklyTrends: Array<{
    week: string;
    activities: number;
    trend: "up" | "down" | "stable";
  }>;
}

export interface ActivityStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
  currentStreak: number;
  longestStreak: number;
  averagePerDay: number;
}

export interface ActivityFeed {
  id: string;
  action: string;
  description: string;
  note: {
    id: string;
    title: string;
  };
  metadata: JsonValue;
  icon: string;
  color: string;
}

export interface GetActivitiesResponse {
  // Define single item response
  success: boolean;
  activities: Activity[];
  count: number;
  filter: ActivitiesDto;
}

export interface GetActivityInsightsResponse {
  // Define single item response
  success: boolean;
  insights: ActivityInsights;
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
}

export interface GetActivityFeedResponse {
  // Define single item response
  success: boolean;
  feed: ActivityFeed[];
  count: number;
}

export interface GetActivityStatsResponse {
  // Define single item response
  success: boolean;
  stats: ActivityStats;
}

export interface TrackActivityRequest {
  action: ActivityAction;
  nodeId?: string;
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

export interface IExportToCSV {
  success: boolean;
  data: string;
  format: "csv";
  count: number;
}

export interface IExportToJSON {
  success: boolean;
  data: {
    note: {
      id: string;
      title: string;
    } & {
      id: string;
      action: string;
      metadata: JsonValue | null;
      createdAt: Date;
      userId: string;
      noteId: string | null;
    }[];
  };
  format: "json";
  count: number;
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
}

export type ExportActivitiesResponse = IExportToCSV | IExportToJSON;

export interface HeatmapItem {
  date: string; // hoặc Date nếu backend trả ISO date string
  hour: number;
  count: number;
}

export interface ActivityHeatmapSuccess {
  success: true;
  heatmap: HeatmapItem[];
  period: IPeriod;
  error?: undefined;
}

// error case
export interface ActivityHeatmapError {
  success: false;
  heatmap: any[];
  error: string; // hoặc unknown nếu BE trả nhiều loại error
  period?: undefined;
}

export type GetActivityHeatmapResponse  = ActivityHeatmapSuccess | ActivityHeatmapError;

// metrics item
export interface MostActiveHour {
  hour: number;
  count: number;
}

export interface WeeklyTrend {
  week: string;
  activities: number;
  trend: "up" | "down" | "stable"; // literal union
}

export interface ProductivityMetrics {
  productivityScore: number;
  productivityRatio: number;
  productiveActivities: number;
  totalActivities: number;
  averageSessionDuration: number;
  mostActiveHours: MostActiveHour[];
  weeklyTrends: WeeklyTrend[];
}

// success case
export interface ProductivityMetricsSuccess {
  success: true;
  metrics: ProductivityMetrics;
  error?: undefined;
}

// error case
export interface ProductivityMetricsError {
  success: false;
  metrics: any;
  error: string | unknown;
}

// union type
export type GetProductivityMetricsResponse =
  | ProductivityMetricsSuccess
  | ProductivityMetricsError;
