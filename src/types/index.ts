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

// Export specific items from productivity to avoid conflicts
export type { 
  Task, 
  PomodoroSession, 
  CalendarEvent,
  ReviewPrompt,
  CreatePomodoroSessionDto,
  UpdatePomodoroSessionDto,
  CreateTaskDto,
  UpdateTaskDto,
  CreateCalendarEventDto,
  UpdateCalendarEventDto
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
  ExportHistory,
  CreateExportDto
} from './mobile.types'

// Export specific items from misc to avoid conflicts
export type { 
  Notification, 
  Reminder, 
  SavedSearch, 
  Template, 
  Tag, 
  CreateNotificationDto,
  CreateReminderDto,
  CreateSavedSearchDto,
  CreateTemplateDto,
  UpdateTemplateDto,
  SearchHistory,
  Analytics,
  Activity
} from './misc.types'