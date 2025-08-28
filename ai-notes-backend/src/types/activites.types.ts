export interface ActivityData {
  userId: string;
  action: ActivityAction;
  noteId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export type ActivityAction =
    | 'NOTE_CREATE' | 'NOTE_UPDATE' | 'NOTE_DELETE' | 'NOTE_VIEW'
    | 'SEARCH_QUERY' | 'SEARCH_CLICK'
    | 'COLLABORATION_JOIN' | 'COLLABORATION_INVITE' | 'COLLABORATION_EDIT'
    | 'SHARE_CREATE' | 'SHARE_VIEW' | 'SHARE_ACCESS'
    | 'VERSION_CREATE' | 'VERSION_RESTORE'
    | 'CATEGORY_CREATE' | 'CATEGORY_ASSIGN'
    | 'DUPLICATE_DETECT' | 'DUPLICATE_MERGE'
    | 'SUMMARY_GENERATE' | 'SUMMARY_VIEW'
    | 'CHAT_QUERY' | 'CHAT_RESPONSE'
    | 'LOGIN' | 'LOGOUT'
    | 'SETTINGS_UPDATE'
    | 'EXPORT_START' | 'EXPORT_COMPLETE'
    | 'TASK_CREATE' | 'TASK_COMPLETE'
    | 'POMODORO_START' | 'POMODORO_COMPLETE'
    | 'TAG_CREATE' | 'TAG_UPDATE' | 'TAG_DELETE' | 'TAG_BULK_OPERATION'
    | 'TEMPLATE_CREATE' | 'TEMPLATE_UPDATE' | 'TEMPLATE_DELETE' | 'TEMPLATE_DUPLICATE' | 'TEMPLATE_USE'
    | 'ATTACHMENT_UPLOAD' | 'ATTACHMENT_DELETE'

export interface ActivityInsights {
  totalActivities: number;
  activitiesByType: Record<string, number>;
  activitiesByDay: Array<{ date: string; count: number }>;
  topNotes: Array<{ noteId: string; title: string; activityCount: number }>;
  averageSessionDuration: number;
  mostActiveHours: Array<{ hour: number; count: number }>;
  productivityScore: number;
  weeklyTrends: Array<{ week: string; activities: number; trend: 'up' | 'down' | 'stable' }>;
}

