// Export all services for easy importing
export { authService } from './auth.service'
export { workspaceService } from './workspace.service'
export { noteService } from './note.service'
export { aiService } from './ai.service'
export { userService } from './user.service'

// New comprehensive services for expanded modules
export { activitiesService } from './activities.service'
export { analyticsService } from './analytics.service'
export { attachmentsService } from './attachments.service'
export { exportService } from './export.service'
export { notificationsService } from './notifications.service'
export { remindersService } from './reminders.service'
export { productivityService } from './productivity.service'
export { mobileService } from './mobile.service'

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
  versionsService
} from './collaboration.service'

// Advanced Features (legacy - use specific services above for new features)
export { 
  templatesService, 
  searchService
} from './advanced.service'

// Templates (new dedicated service)
export { templatesService as newTemplatesService } from './templates.service'

// Voice Notes (new mobile feature)  
export { voiceNotesService } from './voice-notes.service'

// Tags and Analytics (new comprehensive services)
export { tagsService } from './tags-analytics.service'

// Legacy compatibility
export { miscService } from './misc.service'