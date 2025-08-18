/**
 * React Query Key Factories
 * Provides consistent cache key generation for all API queries
 */

export const queryKeys = {
  // Auth
  auth: {
    verify: () => ['auth', 'verify'] as const,
    profile: () => ['auth', 'profile'] as const,
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
  },

  // Notes
  notes: {
    all: (workspaceId?: string, limit?: number) => 
      ['notes', { workspaceId, limit }] as const,
    byId: (id: string) => ['notes', id] as const,
    withAnalytics: (id: string) => ['notes', id, 'analytics'] as const,
    versions: (id: string) => ['notes', id, 'versions'] as const,
    search: (params: any) => ['notes', 'search', params] as const,
  },

  // AI & Chat
  ai: {
    conversations: (noteId?: string) => 
      ['ai', 'conversations', { noteId }] as const,
    conversation: (id: string) => ['ai', 'conversations', id] as const,
    suggestions: (noteId: string) => ['ai', 'suggestions', noteId] as const,
    semanticSearch: (params: any) => ['ai', 'search', params] as const,
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
    tasks: () => ['productivity', 'tasks'] as const,
    calendar: () => ['productivity', 'calendar'] as const,
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
  }
};