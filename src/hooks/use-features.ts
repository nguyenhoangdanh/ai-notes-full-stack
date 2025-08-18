import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { productivityService, mobileService, miscService } from '../services'
import { queryKeys } from './query-keys'
import type {
  PomodoroSession,
  CreatePomodoroSessionDto,
  UpdatePomodoroSessionDto,
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  CalendarEvent,
  CreateCalendarEventDto,
  UpdateCalendarEventDto,
  VoiceNote,
  CreateVoiceNoteDto,
  LocationNote,
  CreateLocationNoteDto,
  Notification,
  Reminder,
  CreateReminderDto,
  SavedSearch,
  CreateSavedSearchDto,
  Template,
  CreateTemplateDto,
  UpdateTemplateDto,
  Tag,
} from '../types'

// =============================================================================
// PRODUCTIVITY HOOKS
// =============================================================================

// Pomodoro Sessions
export function usePomodoroSessions() {
  return useQuery({
    queryKey: queryKeys.productivity.pomodoroSessions(),
    queryFn: productivityService.getPomodoroSessions,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export function useCreatePomodoroSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePomodoroSessionDto) => 
      productivityService.createPomodoroSession(data),
    onSuccess: (newSession: PomodoroSession) => {
      queryClient.setQueryData(
        queryKeys.productivity.pomodoroSessions(),
        (old: PomodoroSession[] = []) => [newSession, ...old]
      )
      toast.success('Pomodoro session started')
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to start pomodoro session')
    },
  })
}

export function useUpdatePomodoroSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, data }: { 
      sessionId: string
      data: UpdatePomodoroSessionDto 
    }) => productivityService.updatePomodoroSession(sessionId, data),
    onSuccess: (updatedSession: PomodoroSession) => {
      queryClient.setQueryData(
        queryKeys.productivity.pomodoroSessions(),
        (old: PomodoroSession[] = []) =>
          old.map(session =>
            session.id === updatedSession.id ? updatedSession : session
          )
      )
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to update pomodoro session')
    },
  })
}

// Tasks
export function useTasks(filters?: any) {
  return useQuery({
    queryKey: queryKeys.productivity.tasks(),
    queryFn: () => productivityService.getTasks(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: queryKeys.productivity.task(taskId),
    queryFn: () => productivityService.getTask(taskId),
    enabled: !!taskId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTaskDto) => productivityService.createTask(data),
    onSuccess: (newTask: Task) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.productivity.tasks() 
      })
      toast.success(`Task "${newTask.title}" created`)
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to create task')
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskDto }) =>
      productivityService.updateTask(taskId, data),
    onSuccess: (updatedTask: Task) => {
      queryClient.setQueryData(queryKeys.productivity.task(updatedTask.id), updatedTask)
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.productivity.tasks() 
      })
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to update task')
    },
  })
}

// Calendar Events
export function useCalendarEvents(filters?: any) {
  return useQuery({
    queryKey: queryKeys.productivity.calendarEvents(filters),
    queryFn: () => productivityService.getCalendarEvents(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCalendarEventDto) => 
      productivityService.createCalendarEvent(data),
    onSuccess: (newEvent: CalendarEvent) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.productivity.calendarEvents() 
      })
      toast.success(`Event "${newEvent.title}" created`)
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to create calendar event')
    },
  })
}

// =============================================================================
// MOBILE HOOKS
// =============================================================================

// Voice Notes
export function useVoiceNotes() {
  return useQuery({
    queryKey: queryKeys.mobile.voiceNotes(),
    queryFn: mobileService.getVoiceNotes,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useCreateVoiceNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ data, audioFile }: { 
      data: CreateVoiceNoteDto
      audioFile: File 
    }) => mobileService.createVoiceNote(data, audioFile),
    onSuccess: (newVoiceNote: VoiceNote) => {
      queryClient.setQueryData(
        queryKeys.mobile.voiceNotes(),
        (old: VoiceNote[] = []) => [newVoiceNote, ...old]
      )
      toast.success('Voice note uploaded')
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to upload voice note')
    },
  })
}

// Location Notes
export function useNoteLocation(noteId: string) {
  return useQuery({
    queryKey: queryKeys.mobile.location(noteId),
    queryFn: () => mobileService.getNoteLocation(noteId),
    enabled: !!noteId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Don't retry if location doesn't exist
  })
}

export function useAddLocationToNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ noteId, data }: { 
      noteId: string
      data: CreateLocationNoteDto 
    }) => mobileService.addLocationToNote(noteId, data),
    onSuccess: (locationNote: LocationNote) => {
      queryClient.setQueryData(
        queryKeys.mobile.location(locationNote.noteId),
        locationNote
      )
      toast.success('Location added to note')
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to add location')
    },
  })
}

// Export
export function useExportHistory() {
  return useQuery({
    queryKey: queryKeys.mobile.exports(),
    queryFn: mobileService.getExportHistory,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateExport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => mobileService.createExport(data),
    onSuccess: (exportRecord: any) => {
      queryClient.setQueryData(
        queryKeys.mobile.exports(),
        (old: any[] = []) => [exportRecord, ...old]
      )
      toast.success('Export started')
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to start export')
    },
  })
}

// =============================================================================
// MISCELLANEOUS HOOKS
// =============================================================================

// Notifications
export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.misc.notifications(),
    queryFn: miscService.getNotifications,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) => 
      miscService.markNotificationAsRead(notificationId),
    onSuccess: (updatedNotification: Notification) => {
      queryClient.setQueryData(
        queryKeys.misc.notifications(),
        (old: Notification[] = []) =>
          old.map(notif =>
            notif.id === updatedNotification.id ? updatedNotification : notif
          )
      )
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to mark notification as read')
    },
  })
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: miscService.markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.misc.notifications() 
      })
      toast.success('All notifications marked as read')
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to mark all notifications as read')
    },
  })
}

// Reminders
export function useReminders() {
  return useQuery({
    queryKey: queryKeys.misc.reminders(),
    queryFn: miscService.getReminders,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useCreateReminder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateReminderDto) => miscService.createReminder(data),
    onSuccess: (newReminder: Reminder) => {
      queryClient.setQueryData(
        queryKeys.misc.reminders(),
        (old: Reminder[] = []) => [...old, newReminder]
      )
      toast.success('Reminder created')
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to create reminder')
    },
  })
}

// Saved Searches
export function useSavedSearches() {
  return useQuery({
    queryKey: queryKeys.misc.savedSearches(),
    queryFn: miscService.getSavedSearches,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateSavedSearch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSavedSearchDto) => miscService.createSavedSearch(data),
    onSuccess: (newSearch: SavedSearch) => {
      queryClient.setQueryData(
        queryKeys.misc.savedSearches(),
        (old: SavedSearch[] = []) => [...old, newSearch]
      )
      toast.success(`Search "${newSearch.name}" saved`)
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to save search')
    },
  })
}

// Templates
export function useTemplates(includePublic?: boolean) {
  return useQuery({
    queryKey: queryKeys.misc.templates(includePublic),
    queryFn: () => miscService.getTemplates(includePublic),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useTemplate(templateId: string) {
  return useQuery({
    queryKey: queryKeys.misc.template(templateId),
    queryFn: () => miscService.getTemplate(templateId),
    enabled: !!templateId,
    staleTime: 10 * 60 * 1000,
  })
}

export function useCreateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTemplateDto) => miscService.createTemplate(data),
    onSuccess: (newTemplate: Template) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.misc.templates() 
      })
      toast.success(`Template "${newTemplate.name}" created`)
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to create template')
    },
  })
}

export function useUseTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ templateId, workspaceId }: { 
      templateId: string
      workspaceId: string 
    }) => miscService.useTemplate(templateId, workspaceId),
    onSuccess: (newNote: any) => {
      // Invalidate notes to show the new note created from template
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notes.all() 
      })
      toast.success(`Note created from template`)
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to use template')
    },
  })
}

// Tags
export function useTags() {
  return useQuery({
    queryKey: queryKeys.misc.tags(),
    queryFn: miscService.getTags,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string; color?: string; description?: string }) =>
      miscService.createTag(data),
    onSuccess: (newTag: Tag) => {
      queryClient.setQueryData(
        queryKeys.misc.tags(),
        (old: Tag[] = []) => [...old, newTag]
      )
      toast.success(`Tag "${newTag.name}" created`)
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to create tag')
    },
  })
}

// Analytics
export function useDashboardAnalytics() {
  return useQuery({
    queryKey: queryKeys.misc.analytics(),
    queryFn: miscService.getDashboardAnalytics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUserActivity(filters?: any) {
  return useQuery({
    queryKey: queryKeys.misc.activity(filters),
    queryFn: () => miscService.getUserActivity(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}