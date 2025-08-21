// Export all services for easy importing
export { authService } from './auth.service'
export { workspaceService } from './workspace.service'
export { noteService } from './note.service'
export { aiService } from './ai.service'
export { userService } from './user.service'

// Smart Features
export { 
  categoriesService, 
  summariesService, 
  relationsService, 
  duplicatesService 
} from './smart.service'

// Collaboration Features
export { 
  collaborationService, 
  shareService, 
  versionsService, 
  activitiesService, 
  tagsService 
} from './collaboration.service'

// Advanced Features
export { 
  templatesService, 
  attachmentsService, 
  searchService, 
  analyticsService, 
  exportService 
} from './advanced.service'

// Templates (new dedicated service)
export { templatesService as newTemplatesService } from './templates.service'

// Voice Notes (new mobile feature)  
export { voiceNotesService } from './voice-notes.service'

// Tags and Analytics (new comprehensive services)
export { tagsService, analyticsService } from './tags-analytics.service'

// Productivity & Notifications
export { 
  notificationsService, 
  remindersService, 
  tasksService, 
  calendarService, 
  pomodoroService, 
  reviewService 
} from './notifications.service'

// Legacy exports for backward compatibility
export { productivityService } from './productivity.service'
export { mobileService } from './mobile.service'
export { miscService } from './misc.service'