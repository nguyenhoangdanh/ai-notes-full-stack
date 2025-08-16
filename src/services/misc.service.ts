import { getApiClient } from '../lib/api-client'
import type {
  Notification,
  CreateNotificationDto,
  Reminder,
  CreateReminderDto,
  SearchHistory,
  SavedSearch,
  CreateSavedSearchDto,
  UserActivity,
  Template,
  CreateTemplateDto,
  UpdateTemplateDto,
  Tag,
} from '../types'

export const miscService = {
  // Notifications
  async getNotifications(): Promise<Notification[]> {
    return getApiClient().get<Notification[]>('/notifications')
  },

  async markNotificationAsRead(notificationId: string): Promise<Notification> {
    return getApiClient().patch<Notification>(`/notifications/${notificationId}/read`)
  },

  async deleteNotification(notificationId: string): Promise<void> {
    return getApiClient().delete<void>(`/notifications/${notificationId}`)
  },

  async markAllNotificationsAsRead(): Promise<{ updated: number }> {
    return getApiClient().post('/notifications/mark-all-read')
  },

  // Reminders
  async getReminders(): Promise<Reminder[]> {
    return getApiClient().get<Reminder[]>('/reminders')
  },

  async createReminder(data: CreateReminderDto): Promise<Reminder> {
    return getApiClient().post<Reminder>('/reminders', { body: data })
  },

  async updateReminder(reminderId: string, data: Partial<Reminder>): Promise<Reminder> {
    return getApiClient().patch<Reminder>(`/reminders/${reminderId}`, { body: data })
  },

  async deleteReminder(reminderId: string): Promise<void> {
    return getApiClient().delete<void>(`/reminders/${reminderId}`)
  },

  async markReminderComplete(reminderId: string): Promise<Reminder> {
    return getApiClient().patch<Reminder>(`/reminders/${reminderId}`, { body: { isComplete: true } })
  },

  // Search management
  async getSearchHistory(): Promise<SearchHistory[]> {
    return getApiClient().get<SearchHistory[]>('/search/history')
  },

  async getSavedSearches(): Promise<SavedSearch[]> {
    return getApiClient().get<SavedSearch[]>('/search/saved')
  },

  async createSavedSearch(data: CreateSavedSearchDto): Promise<SavedSearch> {
    return getApiClient().post<SavedSearch>('/search/save', { body: data })
  },

  async deleteSavedSearch(searchId: string): Promise<void> {
    return getApiClient().delete<void>(`/search/saved/${searchId}`)
  },

  async updateSavedSearch(searchId: string, data: Partial<SavedSearch>): Promise<SavedSearch> {
    return getApiClient().patch<SavedSearch>(`/search/saved/${searchId}`, { body: data })
  },

  // User activity
  async getUserActivity(filters?: { action?: string; noteId?: string; limit?: number }): Promise<UserActivity[]> {
    return getApiClient().get<UserActivity[]>('/analytics/activity', { query: filters })
  },

  // Templates
  async getTemplates(includePublic?: boolean): Promise<Template[]> {
    const endpoint = includePublic ? '/templates?includePublic=true' : '/templates'
    return getApiClient().get<Template[]>(endpoint)
  },

  async getPublicTemplates(): Promise<Template[]> {
    return getApiClient().get<Template[]>('/templates/public')
  },

  async getTemplate(templateId: string): Promise<Template> {
    return getApiClient().get<Template>(`/templates/${templateId}`)
  },

  async createTemplate(data: CreateTemplateDto): Promise<Template> {
    return getApiClient().post<Template>('/templates', { body: data })
  },

  async updateTemplate(templateId: string, data: UpdateTemplateDto): Promise<Template> {
    return getApiClient().patch<Template>(`/templates/${templateId}`, { body: data })
  },

  async deleteTemplate(templateId: string): Promise<void> {
    return getApiClient().delete<void>(`/templates/${templateId}`)
  },

  async useTemplate(templateId: string, workspaceId: string): Promise<any> {
    return getApiClient().post(`/templates/${templateId}/use`, { 
      body: { workspaceId } 
    })
  },

  // Tags
  async getTags(): Promise<Tag[]> {
    return getApiClient().get<Tag[]>('/tags')
  },

  async createTag(data: { name: string; color?: string; description?: string }): Promise<Tag> {
    return getApiClient().post<Tag>('/tags', { body: data })
  },

  async updateTag(tagId: string, data: Partial<Tag>): Promise<Tag> {
    return getApiClient().patch<Tag>(`/tags/${tagId}`, { body: data })
  },

  async deleteTag(tagId: string): Promise<void> {
    return getApiClient().delete<void>(`/tags/${tagId}`)
  },

  async getNotesWithTag(tagId: string): Promise<any[]> {
    return getApiClient().get(`/tags/${tagId}/notes`)
  },

  // Analytics
  async getDashboardAnalytics(): Promise<any> {
    return getApiClient().get('/analytics/dashboard')
  },

  async getUsageStatistics(): Promise<any> {
    return getApiClient().get('/analytics/usage')
  },
}