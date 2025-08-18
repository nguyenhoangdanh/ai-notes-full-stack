import { apiClient } from '../lib/api-client'
import type {
  Notification,
  CreateNotificationDto,
  Reminder,
  CreateReminderDto,
  SearchHistory,
  SavedSearch,
  CreateSavedSearchDto,
  Activity,
  Template,
  CreateTemplateDto,
  UpdateTemplateDto,
  Tag,
} from '../types'

export const miscService = {
  // Notifications
  async getNotifications(): Promise<Notification[]> {
    return apiClient.get<Notification[]>('/notifications')
  },

  async markNotificationAsRead(notificationId: string): Promise<Notification> {
    return apiClient.patch<Notification>(`/notifications/${notificationId}/read`)
  },

  async deleteNotification(notificationId: string): Promise<void> {
    return apiClient.delete<void>(`/notifications/${notificationId}`)
  },

  async markAllNotificationsAsRead(): Promise<{ updated: number }> {
    return apiClient.post('/notifications/mark-all-read')
  },

  // Reminders
  async getReminders(): Promise<Reminder[]> {
    return apiClient.get<Reminder[]>('/reminders')
  },

  async createReminder(data: CreateReminderDto): Promise<Reminder> {
    return apiClient.post<Reminder>('/reminders', { body: data })
  },

  async updateReminder(reminderId: string, data: Partial<Reminder>): Promise<Reminder> {
    return apiClient.patch<Reminder>(`/reminders/${reminderId}`, { body: data })
  },

  async deleteReminder(reminderId: string): Promise<void> {
    return apiClient.delete<void>(`/reminders/${reminderId}`)
  },

  async markReminderComplete(reminderId: string): Promise<Reminder> {
    return apiClient.patch<Reminder>(`/reminders/${reminderId}`, { body: { isComplete: true } })
  },

  // Search management
  async getSearchHistory(): Promise<SearchHistory[]> {
    return apiClient.get<SearchHistory[]>('/search/history')
  },

  async getSavedSearches(): Promise<SavedSearch[]> {
    return apiClient.get<SavedSearch[]>('/search/saved')
  },

  async createSavedSearch(data: CreateSavedSearchDto): Promise<SavedSearch> {
    return apiClient.post<SavedSearch>('/search/save', { body: data })
  },

  async deleteSavedSearch(searchId: string): Promise<void> {
    return apiClient.delete<void>(`/search/saved/${searchId}`)
  },

  async updateSavedSearch(searchId: string, data: Partial<SavedSearch>): Promise<SavedSearch> {
    return apiClient.patch<SavedSearch>(`/search/saved/${searchId}`, { body: data })
  },

  // User activity
  async getUserActivity(filters?: { action?: string; noteId?: string; limit?: number }): Promise<Activity[]> {
    return apiClient.get<Activity[]>('/analytics/activity', { query: filters })
  },

  // Templates
  async getTemplates(includePublic?: boolean): Promise<Template[]> {
    const endpoint = includePublic ? '/templates?includePublic=true' : '/templates'
    return apiClient.get<Template[]>(endpoint)
  },

  async getPublicTemplates(): Promise<Template[]> {
    return apiClient.get<Template[]>('/templates/public')
  },

  async getTemplate(templateId: string): Promise<Template> {
    return apiClient.get<Template>(`/templates/${templateId}`)
  },

  async createTemplate(data: CreateTemplateDto): Promise<Template> {
    return apiClient.post<Template>('/templates', { body: data })
  },

  async updateTemplate(templateId: string, data: UpdateTemplateDto): Promise<Template> {
    return apiClient.patch<Template>(`/templates/${templateId}`, { body: data })
  },

  async deleteTemplate(templateId: string): Promise<void> {
    return apiClient.delete<void>(`/templates/${templateId}`)
  },

  async useTemplate(templateId: string, workspaceId: string): Promise<any> {
    return apiClient.post(`/templates/${templateId}/use`, { 
      body: { workspaceId } 
    })
  },

  // Tags
  async getTags(): Promise<Tag[]> {
    return apiClient.get<Tag[]>('/tags')
  },

  async createTag(data: { name: string; color?: string; description?: string }): Promise<Tag> {
    return apiClient.post<Tag>('/tags', { body: data })
  },

  async updateTag(tagId: string, data: Partial<Tag>): Promise<Tag> {
    return apiClient.patch<Tag>(`/tags/${tagId}`, { body: data })
  },

  async deleteTag(tagId: string): Promise<void> {
    return apiClient.delete<void>(`/tags/${tagId}`)
  },

  async getNotesWithTag(tagId: string): Promise<any[]> {
    return apiClient.get(`/tags/${tagId}/notes`)
  },

  // Analytics
  async getDashboardAnalytics(): Promise<any> {
    return apiClient.get('/analytics/dashboard')
  },

  async getUsageStatistics(): Promise<any> {
    return apiClient.get('/analytics/usage')
  },
}