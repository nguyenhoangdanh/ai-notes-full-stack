// Re-export all types for easy importing
export * from './common.types'
export * from './workspace.types'
export * from './note.types'
export * from './ai.types'

// Export new module types
export * from './activities.types'
export * from './analytics.types'
export * from './attachments.types'
export * from './export.types'
export * from './notifications.types'
export * from './reminders.types'

// Export specific items from auth to avoid conflicts with user.types
export type { 
  GoogleOAuthUser,
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  AuthResponse,
  TokenVerificationResponse,
  Usage  // Add Usage from auth types
} from './auth.types'

// Export specific items from user.types to resolve conflicts
export type { 
  User,
  UserProfile,
  UpdateUserDto,
  UserSettings,
  UpdateSettingsDto,
  UserUsage,
  UsageStats
} from './user.types'

// Export Smart Features types - avoid conflicts
export type {
  // Categories
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  AutoCategorizeDto,
  CategorySuggestionDto,
  // Summaries  
  Summary,
  GenerateSummaryDto,
  BatchSummaryDto,
  SummaryResponseDto,
  // Relations - prefix to avoid conflicts
  NoteRelation,
  RelatedNote as SmartRelatedNote,
  NoteGraph,
  // Duplicates
  DuplicateDetectionReport,
  DuplicateGroup,
  CreateDuplicateReportDto,
  MergeDuplicatesDto
} from './smart.types'

// Export Collaboration types
export type {
  // Collaboration
  Collaborator,
  InviteCollaboratorDto,
  UpdatePermissionDto,
  CollaborationStats,
  CursorUpdate,
  // Share
  ShareLink,
  CreateShareLinkDto,
  UpdateShareLinkDto,
  ShareAnalytics,
  ShareStats,
  // Versions
  NoteVersion,
  CreateVersionDto,
  VersionComparison,
  VersionStatistics,
  VersionTimeline,
  // Activities
  Activity as CollabActivity,
  ActivityInsights,
  ActivityFeed,
  ActivityStats,
  TrackActivityDto,
  ProductivityHeatmap,
  // Tags - avoid conflicts
  Tag,
  CreateTagDto as CollabCreateTagDto,
  UpdateTagDto,
  TagHierarchy,
  TagAnalytics,
  TagSuggestion,
  BulkTagOperationDto
} from './collaboration.types'

// Export Advanced Features types
export type {
  // Templates
  Template,
  CreateTemplateDto as AdvancedCreateTemplateDto,
  UpdateTemplateDto,
  ProcessTemplateDto,
  TemplateStats,
  TemplatePreview,
  TemplateVariable,
  // Attachments - use alias to avoid conflict with new module
  Attachment as AdvancedAttachment,
  AttachmentAnalytics as AdvancedAttachmentAnalytics,
  OCRResult,
  // Search
  AdvancedSearchDto,
  SearchResult,
  SearchSuggestion,
  SavedSearch as AdvancedSavedSearch,
  SearchAnalytics,
  QuickSearchDto,
  // Analytics - use alias to avoid conflict
  AnalyticsOverview as AdvancedAnalyticsOverview,
  WorkspaceAnalytics as AdvancedWorkspaceAnalytics,
  ContentAnalytics as AdvancedContentAnalytics,
  TrackNoteViewDto,
  // Export - use alias to avoid conflict
  ExportJob,
  CreateExportDto as AdvancedCreateExportDto,
  ExportStats as AdvancedExportStats,
  ExportSettings
} from './advanced.types'

// Export Enhanced Productivity types
export type { 
  // Tasks, Pomodoro, Calendar, Review
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskStats,
  PomodoroSession,
  PomodoroStats,
  PomodoroSettings,
  CalendarEvent,
  CreateCalendarEventDto,
  UpdateCalendarEventDto,
  ReviewItem,
  ReviewStats,
  SpacedRepetitionSettings
} from './productivity.types'

// Export specific items from mobile to avoid conflicts  
export type { 
  VoiceRecording, 
  OfflineAction, 
  LocationNote, 
  ExportRecord,
  VoiceNote,
  CreateVoiceNoteDto,
  CreateLocationNoteDto,
  SyncOperationDto,
  ConflictResolutionDto,
  OfflineSync,
  ExportHistory
} from './mobile.types'

// Export specific items from misc to avoid conflicts
export type { 
  SavedSearch, 
  CreateSavedSearchDto,
  SearchHistory,
  Analytics,
  Activity as MiscActivity
} from './misc.types'