import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { productivityService, mobileService, miscService } from '../services'
import { queryKeys } from './query-keys'
import type {
  PomodoroSession,
  CreatePomodoroSessionDto,
  UpdatePomodoroSessionDto,
  ProductivityTask as Task,
  ProductivityCreateTaskDto as CreateTaskDto,
  ProductivityUpdateTaskDto as UpdateTaskDto,
  CalendarEvent,
  ProductivityCreateCalendarEventDto as CreateCalendarEventDto,
  ProductivityUpdateCalendarEventDto as UpdateCalendarEventDto,
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
  AdvancedCreateTemplateDto as CreateTemplateDto,
  UpdateTemplateDto,
  Tag,
} from '../types'


// =============================================================================
// PRODUCTIVITY HOOKS
// =============================================================================

// Pomodoro Sessions
export function usePomodoroSessions() {
  return useQuery({
    queryKey: queryKeys.productivity.pomodoro(),
    queryFn: productivityService.getHistory,
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
export function useTasks() {
  return useQuery({
    queryKey: queryKeys.productivity.tasks(),
    queryFn: () => productivityService.getTasks(),
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
export function useCalendarEvents() {
  return useQuery({
    queryKey: queryKeys.productivity.calendarEvents(),
    queryFn: () => productivityService.getCalendarEvents(),
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
    queryFn: async () => {
      try {
        const { templatesService } = await import('../services/templates.service');
        return await templatesService.getTemplate(templateId);
      } catch (error) {
        console.error('Failed to fetch template:', error);
        return null;
      }
    },
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

// Categories
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all(),
    queryFn: async () => {
      try {
        const { categoriesService } = await import('../services/smart.service');
        return await categoriesService.getAll();
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCategory(categoryId: string) {
  return useQuery({
    queryKey: queryKeys.categories.byId(categoryId),
    queryFn: async () => {
      try {
        const { categoriesService } = await import('../services/smart.service');
        return await categoriesService.getById(categoryId);
      } catch (error) {
        console.error('Failed to fetch category:', error);
        return null;
      }
    },
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCategoryNotes(categoryId: string) {
  return useQuery({
    queryKey: ['category-notes', categoryId],
    queryFn: async () => {
      try {
        const { categoriesService } = await import('../services/smart.service');
        return await categoriesService.getNoteCategories(categoryId);
      } catch (error) {
        console.error('Failed to fetch category notes:', error);
        return [];
      }
    },
    enabled: !!categoryId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const { categoriesService } = await import('../services/smart.service');
      return await categoriesService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() })
      toast.success('Category created')
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to create category')
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { categoriesService } = await import('../services/smart.service');
      return await categoriesService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() })
      toast.success('Category updated')
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to update category')
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { categoriesService } = await import('../services/smart.service');
      return await categoriesService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() })
      toast.success('Category deleted')
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to delete category')
    },
  })
}

// Duplicates
export function useDuplicateDetection() {
  return useQuery({
    queryKey: ['duplicates'],
    queryFn: async () => {
      try {
        // Try to get real data from smart service
        const { duplicatesService } = await import('../services/smart.service');
        const response = await duplicatesService.detectDuplicates();
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error('Failed to detect duplicates, using fallback:', error);
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useSmartDuplicateReports() {
  return useQuery({
    queryKey: ['duplicate-reports'],
    queryFn: async () => {
      try {
        // Try to get real data from smart service
        const { duplicatesService } = await import('../services/smart.service');
        const response = await duplicatesService.getReports();
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error('Failed to fetch duplicate reports, using fallback:', error);
        return [];
      }
    },
    staleTime: 10 * 60 * 1000,
  })
}

export function useDuplicateStats() {
  return useQuery({
    queryKey: ['duplicate-stats'],
    queryFn: async () => {
      try {
        const { duplicatesService } = await import('../services/smart.service');
        return await duplicatesService.getStats();
      } catch (error) {
        console.error('Failed to fetch duplicate stats:', error);
        return {};
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useQueueDuplicateDetection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { duplicatesService } = await import('../services/smart.service');
      return await duplicatesService.queueDetection();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['duplicates'] })
      toast.success('Duplicate detection started')
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to start detection')
    },
  })
}

export function useMergeDuplicates() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const { duplicatesService } = await import('../services/smart.service');
      return await duplicatesService.mergeDuplicates(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['duplicates'] })
      toast.success('Duplicates merged')
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to merge duplicates')
    },
  })
}

// Relations
export function useRelationsStats(userId: string) {
  return useQuery({
    queryKey: ['relations-stats', userId],
    queryFn: async () => {
      try {
        const { relationsService } = await import('../services/smart.service');
        return await relationsService.getStats(userId);
      } catch (error) {
        console.error('Failed to fetch relations stats:', error);
        return {};
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

// Summaries
export function useSummaryStats() {
  return useQuery({
    queryKey: ['summary-stats'],
    queryFn: async () => {
      try {
        const { summariesService } = await import('../services/smart.service');
        return await summariesService.getUserStats();
      } catch (error) {
        console.error('Failed to fetch summary stats:', error);
        return {};
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useSummaryTemplates() {
  return useQuery({
    queryKey: ['summary-templates'],
    queryFn: async () => {
      try {
        // Try to get real data from smart service
        const { summariesService } = await import('../services/smart.service');
        const response = await summariesService.getTemplates();
        // Handle both array and object responses
        if (Array.isArray(response)) {
          return response;
        } else if (response && typeof response === 'object' && 'templates' in response) {
          return (response as any).templates || [];
        }
        return [];
      } catch (error) {
        console.error('Failed to fetch summary templates, using fallback:', error);
        // Return fallback data
        return [
          {
            id: 'executive',
            name: 'Executive Summary',
            description: 'Brief, high-level overview focusing on key decisions and outcomes',
            prompt: 'Create a brief executive summary highlighting key decisions, outcomes, and action items.'
          },
          {
            id: 'academic',
            name: 'Academic Summary',
            description: 'Structured summary with main arguments, evidence, and conclusions',
            prompt: 'Provide an academic-style summary with main arguments, supporting evidence, and conclusions.'
          },
          {
            id: 'meeting',
            name: 'Meeting Summary',
            description: 'Focus on decisions made, action items, and next steps',
            prompt: 'Summarize this meeting content focusing on decisions made, action items, and next steps.'
          }
        ];
      }
    },
    staleTime: 10 * 60 * 1000,
  })
}

export function useBatchGenerateSummaries() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const { summariesService } = await import('../services/smart.service');
      return await summariesService.batchGenerate(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['summary-stats'] })
      toast.success('Batch summary generation started')
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to generate summaries')
    },
  })
}