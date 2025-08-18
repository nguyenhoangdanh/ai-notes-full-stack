// Re-export all types for easy importing
export * from './common.types'
export * from './auth.types'
export * from './workspace.types'
export * from './note.types'
export * from './ai.types'

// Export specific items from productivity and mobile to avoid conflicts
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
  UserActivity
} from './misc.types'

// Type aliases for backward compatibility
export type { UserActivity as Activity } from './misc.types'