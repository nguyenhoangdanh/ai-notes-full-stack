// Re-export all types for easy importing
export * from './common.types'
export * from './workspace.types'
export * from './note.types'
export * from './ai.types'

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
  Activity,
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
  // Attachments
  Attachment,
  AttachmentAnalytics,
  OCRResult,
  // Search
  AdvancedSearchDto,
  SearchResult,
  SearchSuggestion,
  SavedSearch as AdvancedSavedSearch,
  SearchAnalytics,
  QuickSearchDto,
  // Analytics
  AnalyticsOverview,
  WorkspaceAnalytics,
  ContentAnalytics,
  TrackNoteViewDto,
  // Export
  ExportJob,
  CreateExportDto as AdvancedCreateExportDto,
  ExportStats,
  ExportSettings
} from './advanced.types'

// Export Enhanced Productivity types
export type { 
  // Notifications
  Notification,
  CreateNotificationDto,
  UpdateNotificationDto,
  // Reminders  
  Reminder,
  CreateReminderDto,
  UpdateReminderDto,
  ReminderStats,
  // Tasks - avoid conflicts
  Task as ProductivityTask, 
  CreateTaskDto as ProductivityCreateTaskDto,
  UpdateTaskDto as ProductivityUpdateTaskDto,
  TaskStats,
  // Calendar
  CalendarEvent,
  CreateCalendarEventDto as ProductivityCreateCalendarEventDto,
  UpdateCalendarEventDto as ProductivityUpdateCalendarEventDto,
  // Pomodoro
  PomodoroSession,
  CreatePomodoroSessionDto,
  UpdatePomodoroSessionDto,
  PomodoroStats,
  // Review
  ReviewPrompt,
  CreateReviewPromptDto,
  UpdateReviewPromptDto,
  AnswerReviewDto,
  ReviewSession
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