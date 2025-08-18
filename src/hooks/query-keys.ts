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

  // Tags
  tags: {
    all: () => ['tags'] as const,
    byId: (id: string) => ['tags', id] as const,
    popular: () => ['tags', 'popular'] as const,
  },

  // Categories
  categories: {
    all: () => ['categories'] as const,
    byId: (id: string) => ['categories', id] as const,
    auto: () => ['categories', 'auto'] as const,
  },

  // Templates
  templates: {
    all: () => ['templates'] as const,
    byId: (id: string) => ['templates', id] as const,
    public: () => ['templates', 'public'] as const,
  },

  // Notifications
  notifications: {
    all: () => ['notifications'] as const,
    unread: () => ['notifications', 'unread'] as const,
  },

  // Smart Features
  smart: {
    duplicates: () => ['smart', 'duplicates'] as const,
    related: (noteId: string) => ['smart', 'related', noteId] as const,
    summaries: (noteId: string) => ['smart', 'summaries', noteId] as const,
  },

  // Productivity
  productivity: {
    pomodoro: () => ['productivity', 'pomodoro'] as const,
    pomodoroSessions: () => ['productivity', 'pomodoro', 'sessions'] as const,
    tasks: () => ['productivity', 'tasks'] as const,
    tasksWithFilters: (filters?: any) => ['productivity', 'tasks', filters] as const,
    task: (taskId: string) => ['productivity', 'task', taskId] as const,
    calendar: () => ['productivity', 'calendar'] as const,
    calendarEvents: (filters?: any) => ['productivity', 'calendar', 'events', filters] as const,
  },

  // Analytics
  analytics: {
    overview: () => ['analytics', 'overview'] as const,
    trends: () => ['analytics', 'trends'] as const,
    wordcloud: () => ['analytics', 'wordcloud'] as const,
  },

  // Export
  export: {
    history: () => ['export', 'history'] as const,
    stats: () => ['export', 'stats'] as const,
  },

  // Mobile
  mobile: {
    voiceNotes: () => ['mobile', 'voice-notes'] as const,
    offlineSync: () => ['mobile', 'offline-sync'] as const,
    location: (noteId: string) => ['mobile', 'location', noteId] as const,
    exports: () => ['mobile', 'exports'] as const,
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