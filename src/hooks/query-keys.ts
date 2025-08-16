// Query key factory for consistent cache keys
export const queryKeys = {
  // Auth
  auth: {
    profile: () => ['auth', 'profile'] as const,
    verify: () => ['auth', 'verify'] as const,
    settings: () => ['auth', 'settings'] as const,
    usage: () => ['auth', 'usage'] as const,
  },

  // Workspaces
  workspaces: {
    all: () => ['workspaces'] as const,
    default: () => ['workspaces', 'default'] as const,
    detail: (id: string) => ['workspaces', id] as const,
  },

  // Notes
  notes: {
    all: () => ['notes'] as const,
    lists: () => ['notes', 'list'] as const,
    list: (workspaceId?: string, limit?: number) => 
      ['notes', 'list', { workspaceId, limit }] as const,
    detail: (id: string) => ['notes', id] as const,
    search: (query: string, params?: any) => 
      ['notes', 'search', { query, ...params }] as const,
    versions: (noteId: string) => ['notes', noteId, 'versions'] as const,
    version: (versionId: string) => ['notes', 'version', versionId] as const,
    collaborators: (noteId: string) => ['notes', noteId, 'collaborators'] as const,
    shareLinks: (noteId: string) => ['notes', noteId, 'shareLinks'] as const,
    analytics: (noteId: string) => ['notes', noteId, 'analytics'] as const,
    attachments: (noteId: string) => ['notes', noteId, 'attachments'] as const,
  },

  // AI Features
  ai: {
    conversations: () => ['ai', 'conversations'] as const,
    conversation: (id: string) => ['ai', 'conversations', id] as const,
    suggestions: (noteId: string) => ['ai', 'suggestions', noteId] as const,
    categories: () => ['ai', 'categories'] as const,
    duplicates: () => ['ai', 'duplicates'] as const,
    relations: (noteId: string) => ['ai', 'relations', noteId] as const,
    summary: (noteId: string) => ['ai', 'summary', noteId] as const,
    semanticSearch: (query: string, params?: any) => 
      ['ai', 'semanticSearch', { query, ...params }] as const,
  },

  // Productivity
  productivity: {
    pomodoroSessions: () => ['productivity', 'pomodoro'] as const,
    tasks: (filters?: any) => ['productivity', 'tasks', filters] as const,
    task: (id: string) => ['productivity', 'tasks', id] as const,
    calendarEvents: (filters?: any) => ['productivity', 'calendar', filters] as const,
    calendarEvent: (id: string) => ['productivity', 'calendar', id] as const,
    reviewPrompts: () => ['productivity', 'reviewPrompts'] as const,
  },

  // Mobile
  mobile: {
    voiceNotes: () => ['mobile', 'voiceNotes'] as const,
    voiceNote: (id: string) => ['mobile', 'voiceNotes', id] as const,
    location: (noteId: string) => ['mobile', 'location', noteId] as const,
    syncOperations: () => ['mobile', 'sync'] as const,
    exports: () => ['mobile', 'exports'] as const,
  },

  // Misc
  misc: {
    notifications: () => ['misc', 'notifications'] as const,
    reminders: () => ['misc', 'reminders'] as const,
    searchHistory: () => ['misc', 'searchHistory'] as const,
    savedSearches: () => ['misc', 'savedSearches'] as const,
    templates: (includePublic?: boolean) => 
      ['misc', 'templates', { includePublic }] as const,
    template: (id: string) => ['misc', 'templates', id] as const,
    tags: () => ['misc', 'tags'] as const,
    tagNotes: (tagId: string) => ['misc', 'tags', tagId, 'notes'] as const,
    analytics: () => ['misc', 'analytics'] as const,
    usage: () => ['misc', 'usage'] as const,
    activity: (filters?: any) => ['misc', 'activity', filters] as const,
  },
} as const

// Helper functions for query invalidation
export const invalidationHelpers = {
  // Invalidate all notes-related queries
  invalidateNotes: (queryClient: any) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notes.all() })
  },

  // Invalidate specific note and related queries
  invalidateNote: (queryClient: any, noteId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notes.detail(noteId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.notes.lists() })
    queryClient.invalidateQueries({ queryKey: queryKeys.ai.relations(noteId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.ai.summary(noteId) })
  },

  // Invalidate workspace-related queries
  invalidateWorkspaces: (queryClient: any) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all() })
  },

  // Invalidate AI-related queries
  invalidateAI: (queryClient: any) => {
    queryClient.invalidateQueries({ queryKey: ['ai'] })
  },
}