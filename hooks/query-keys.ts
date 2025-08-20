/**
 * React Query Key Factories
 * Provides consistent cache key generation for all API queries
 */

export const queryKeys = {
  // Auth
  auth: {
    verify: () => ['auth', 'verify'] as const,
    profile: () => ['auth', 'profile'] as const,
    settings: () => ['auth', 'settings'] as const,
    usage: () => ['auth', 'usage'] as const,
  },

  // Users
  users: {
    profile: () => ['users', 'profile'] as const,
    settings: () => ['users', 'settings'] as const,
    usage: (days?: number) => ['users', 'usage', { days }] as const,
  },

  // Workspaces
  workspaces: {
    all: () => ['workspaces'] as const,
    byId: (id: string) => ['workspaces', id] as const,
    default: () => ['workspaces', 'default'] as const,
    detail: (id: string) => ['workspaces', 'detail', id] as const,
  },

  // Notes
  notes: {
    all: (workspaceId?: string, limit?: number) => 
      ['notes', { workspaceId, limit }] as const,
    byId: (id: string) => ['notes', id] as const,
    list: (workspaceId?: string, limit?: number) => 
      ['notes', 'list', { workspaceId, limit }] as const,
    detail: (id: string) => ['notes', 'detail', id] as const,
    withAnalytics: (id: string) => ['notes', id, 'analytics'] as const,
    versions: (id: string) => ['notes', id, 'versions'] as const,
    version: (versionId: string) => ['notes', 'version', versionId] as const,
    search: (params: any) => ['notes', 'search', params] as const,
    collaborators: (noteId: string) => ['notes', noteId, 'collaborators'] as const,
    shareLinks: (noteId: string) => ['notes', noteId, 'shareLinks'] as const,
    attachments: (noteId: string) => ['notes', noteId, 'attachments'] as const,
  },

  // AI & Chat
  ai: {
    conversations: (noteId?: string) => 
      ['ai', 'conversations', { noteId }] as const,
    conversation: (id: string) => ['ai', 'conversations', id] as const,
    suggestions: (noteId: string) => ['ai', 'suggestions', noteId] as const,
    semanticSearch: (params: any) => ['ai', 'search', params] as const,
    categories: () => ['ai', 'categories'] as const,
    duplicates: () => ['ai', 'duplicates'] as const,
    relations: (noteId: string) => ['ai', 'relations', noteId] as const,
    summary: (noteId: string) => ['ai', 'summary', noteId] as const,
    advancedSearch: (query: any) => ['ai', 'advancedSearch', query] as const,
  },

  // Activities
  activities: {
    all: () => ['activities'] as const,
    getActivities: () => ['activities', 'list'] as const,
    getActivityInsights: () => ['activities', 'insights'] as const,
    getActivityFeed: () => ['activities', 'feed'] as const,
    getActivityStats: () => ['activities', 'stats'] as const,
    getActivityHeatmap: () => ['activities', 'heatmap'] as const,
    getProductivityMetrics: () => ['activities', 'productivity'] as const,
  },

  // Analytics  
  analytics: {
    all: () => ['analytics'] as const,
    getUserAnalytics: () => ['analytics', 'overview'] as const,
    getWorkspaceAnalytics: () => ['analytics', 'workspaces'] as const,
    getContentAnalytics: () => ['analytics', 'content'] as const,
    trends: () => ['analytics', 'trends'] as const,
    wordcloud: () => ['analytics', 'wordcloud'] as const,
  },

  // Attachments
  attachments: {
    all: () => ['attachments'] as const,
    getAttachments: (noteId: string) => ['attachments', noteId] as const,
    getAttachmentAnalytics: () => ['attachments', 'analytics'] as const,
    getSupportedTypes: () => ['attachments', 'types'] as const,
    searchAttachments: (query: string) => ['attachments', 'search', query] as const,
  },

  // Export
  export: {
    all: () => ['export'] as const,
    getUserExports: () => ['export', 'list'] as const,
    getExportStats: () => ['export', 'stats'] as const,
    history: () => ['export', 'history'] as const,
  },

  // Notifications
  notifications: {
    all: () => ['notifications'] as const,
    getNotifications: () => ['notifications', 'list'] as const,
    getUnreadCount: () => ['notifications', 'unread-count'] as const,
    unread: () => ['notifications', 'unread'] as const,
  },

  // Reminders
  reminders: {
    all: () => ['reminders'] as const,
    getReminders: () => ['reminders', 'list'] as const,
    getDueReminders: () => ['reminders', 'due'] as const,
    getUpcomingReminders: () => ['reminders', 'upcoming'] as const,
    getReminderStats: () => ['reminders', 'stats'] as const,
  },

  // Productivity
  productivity: {
    all: () => ['productivity'] as const,
    // Tasks
    tasks: () => ['productivity', 'tasks'] as const,
    getTasks: (status?: string, priority?: string) => 
      ['productivity', 'tasks', { status, priority }] as const,
    getTaskStats: () => ['productivity', 'tasks', 'stats'] as const,
    getOverdueTasks: () => ['productivity', 'tasks', 'overdue'] as const,
    getTasksByDueDate: (start: string, end: string) => 
      ['productivity', 'tasks', 'due', { start, end }] as const,
    // Pomodoro
    pomodoro: () => ['productivity', 'pomodoro'] as const,
    getActivePomodoroSession: () => ['productivity', 'pomodoro', 'active'] as const,
    getPomodoroStats: () => ['productivity', 'pomodoro', 'stats'] as const,
    getPomodoroHistory: (limit?: number) => 
      ['productivity', 'pomodoro', 'history', { limit }] as const,
    // Calendar
    calendar: () => ['productivity', 'calendar'] as const,
    getCalendarEvents: (start?: string, end?: string) => 
      ['productivity', 'calendar', 'events', { start, end }] as const,
    getUpcomingEvents: (days?: number) => 
      ['productivity', 'calendar', 'upcoming', { days }] as const,
    getTodayEvents: () => ['productivity', 'calendar', 'today'] as const,
    getWeekEvents: () => ['productivity', 'calendar', 'week'] as const,
    // Review
    review: () => ['productivity', 'review'] as const,
    getDueReviews: () => ['productivity', 'review', 'due'] as const,
    getReviewStats: () => ['productivity', 'review', 'stats'] as const,
    getReviewSchedule: (noteId: string) => 
      ['productivity', 'review', 'schedule', noteId] as const,
  },

  // Mobile
  mobile: {
    all: () => ['mobile'] as const,
    voiceNotes: () => ['mobile', 'voice-notes'] as const,
    offlineSync: () => ['mobile', 'offline-sync'] as const,
    location: (noteId: string) => ['mobile', 'location', noteId] as const,
    exports: () => ['mobile', 'exports'] as const,
  },

  // Tags (Enhanced)
  tags: {
    all: () => ['tags'] as const,
    byId: (id: string) => ['tags', id] as const,
    popular: () => ['tags', 'popular'] as const,
    hierarchy: () => ['tags', 'hierarchy'] as const,
    analytics: () => ['tags', 'analytics'] as const,
    suggestions: (noteId: string) => ['tags', 'suggestions', noteId] as const,
    suggestionHistory: () => ['tags', 'suggestions', 'history'] as const,
  },

  // Categories
  categories: {
    all: () => ['categories'] as const,
    byId: (id: string) => ['categories', id] as const,
    auto: () => ['categories', 'auto'] as const,
  },

  // Templates (Enhanced)
  templates: {
    all: () => ['templates'] as const,
    myTemplates: () => ['templates', 'my'] as const,
    publicTemplates: () => ['templates', 'public'] as const,
    template: (id: string) => ['templates', id] as const,
    categories: () => ['templates', 'categories'] as const,
    search: (params: any) => ['templates', 'search', params] as const,
    stats: (id: string) => ['templates', 'stats', id] as const,
    preview: (id: string, data?: any) => ['templates', 'preview', id, data] as const,
  },

  // Voice Notes
  voiceNotes: {
    all: () => ['voiceNotes'] as const,
    byId: (id: string) => ['voiceNotes', id] as const,
    stats: () => ['voiceNotes', 'stats'] as const,
    transcription: (id: string) => ['voiceNotes', 'transcription', id] as const,
  },

  // Smart Features
  smart: {
    duplicates: () => ['smart', 'duplicates'] as const,
    related: (noteId: string) => ['smart', 'related', noteId] as const,
    summaries: (noteId: string) => ['smart', 'summaries', noteId] as const,
  },

  // Misc features
  misc: {
    notifications: () => ['misc', 'notifications'] as const,
    reminders: () => ['misc', 'reminders'] as const,
    savedSearches: () => ['misc', 'savedSearches'] as const,
    templates: (includePublic?: boolean) => ['misc', 'templates', { includePublic }] as const,
    template: (templateId: string) => ['misc', 'template', templateId] as const,
    tags: () => ['misc', 'tags'] as const,
    analytics: () => ['misc', 'analytics'] as const,
    activity: (filters?: any) => ['misc', 'activity', filters] as const,
  }
};

// Invalidation helpers for complex cache management
export const invalidationHelpers = {
  invalidateNotes: (queryClient: any) => {
    queryClient.invalidateQueries({ queryKey: ['notes'] });
  },
  
  invalidateNote: (queryClient: any, noteId: string) => {
    queryClient.invalidateQueries({ queryKey: ['notes', 'detail', noteId] });
    queryClient.invalidateQueries({ queryKey: ['notes'] });
  },

  invalidateWorkspaces: (queryClient: any) => {
    queryClient.invalidateQueries({ queryKey: ['workspaces'] });
  },

  invalidateAI: (queryClient: any) => {
    queryClient.invalidateQueries({ queryKey: ['ai'] });
  }
};