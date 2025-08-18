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
  CalendarEvent 
} from './productivity.types'

export type { 
  VoiceRecording, 
  OfflineAction, 
  LocationNote, 
  ExportRecord 
} from './mobile.types'

export type { 
  Notification, 
  Reminder, 
  SavedSearch, 
  Template, 
  Tag, 
  Analytics, 
  Activity 
} from './misc.types'