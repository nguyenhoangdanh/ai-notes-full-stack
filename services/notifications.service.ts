import { apiClient } from '../lib/api-client';
import {
  Notification,
  CreateNotificationDto,
  UpdateNotificationDto,
  Reminder,
  CreateReminderDto,
  UpdateReminderDto,
  ReminderStats,
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskStats,
  CalendarEvent,
  CreateCalendarEventDto,
  UpdateCalendarEventDto,
  PomodoroSession,
  CreatePomodoroSessionDto,
  UpdatePomodoroSessionDto,
  PomodoroStats,
  ReviewPrompt,
  CreateReviewDto,
  AnswerReviewDto,
  ReviewStats
} from '../types';

// Notifications Service
export const notificationsService = {
  create: (data: CreateNotificationDto) =>
    apiClient.post<Notification>('/notifications', { body: data }),

  getAll: (unreadOnly?: boolean, limit?: number) =>
    apiClient.get<Notification[]>('/notifications', {
      query: { unreadOnly: unreadOnly?.toString(), limit: limit?.toString() }
    }),

  getUnreadCount: () =>
    apiClient.get<{ count: number }>('/notifications/unread-count'),

  markAllRead: () =>
    apiClient.post<void>('/notifications/mark-all-read'),

  getById: (id: string) =>
    apiClient.get<Notification>(`/notifications/${id}`),

  update: (id: string, data: UpdateNotificationDto) =>
    apiClient.patch<Notification>(`/notifications/${id}`, { body: data }),

  markRead: (id: string) =>
    apiClient.post<void>(`/notifications/${id}/read`),

  delete: (id: string) =>
    apiClient.delete<void>(`/notifications/${id}`),
};

// Reminders Service
export const remindersService = {
  create: (data: CreateReminderDto) =>
    apiClient.post<Reminder>('/reminders', { body: data }),

  getAll: (status?: 'active' | 'completed', limit?: number) =>
    apiClient.get<Reminder[]>('/reminders', {
      query: { status, limit: limit?.toString() }
    }),

  getDue: () =>
    apiClient.get<Reminder[]>('/reminders/due'),

  getUpcoming: (days?: number) =>
    apiClient.get<Reminder[]>('/reminders/upcoming', {
      query: days ? { days: days.toString() } : {}
    }),

  getStats: () =>
    apiClient.get<ReminderStats>('/reminders/stats'),

  getById: (id: string) =>
    apiClient.get<Reminder>(`/reminders/${id}`),

  complete: (id: string) =>
    apiClient.post<Reminder>(`/reminders/${id}/complete`),

  update: (id: string, data: UpdateReminderDto) =>
    apiClient.patch<Reminder>(`/reminders/${id}`, { body: data }),

  delete: (id: string) =>
    apiClient.delete<void>(`/reminders/${id}`),
};

// Tasks Service - Enhanced version
export const tasksService = {
  create: (data: CreateTaskDto) =>
    apiClient.post<Task>('/tasks', { body: data }),

  getAll: (status?: string, priority?: string, limit?: number) =>
    apiClient.get<Task[]>('/tasks', {
      query: { status, priority, limit: limit?.toString() }
    }),

  getStats: () =>
    apiClient.get<TaskStats>('/tasks/stats'),

  getOverdue: () =>
    apiClient.get<Task[]>('/tasks/overdue'),

  getDue: (days?: number) =>
    apiClient.get<Task[]>('/tasks/due', {
      query: days ? { days: days.toString() } : {}
    }),

  getById: (id: string) =>
    apiClient.get<Task>(`/tasks/${id}`),

  update: (id: string, data: UpdateTaskDto) =>
    apiClient.patch<Task>(`/tasks/${id}`, { body: data }),

  delete: (id: string) =>
    apiClient.delete<void>(`/tasks/${id}`),
};

// Calendar Service
export const calendarService = {
  create: (data: CreateCalendarEventDto) =>
    apiClient.post<CalendarEvent>('/calendar', { body: data }),

  getAll: (startDate?: string, endDate?: string) =>
    apiClient.get<CalendarEvent[]>('/calendar', {
      query: { startDate, endDate }
    }),

  getUpcoming: (days?: number) =>
    apiClient.get<CalendarEvent[]>('/calendar/upcoming', {
      query: days ? { days: days.toString() } : {}
    }),

  getToday: () =>
    apiClient.get<CalendarEvent[]>('/calendar/today'),

  getWeek: (startDate?: string) =>
    apiClient.get<CalendarEvent[]>('/calendar/week', {
      query: startDate ? { startDate } : {}
    }),

  getById: (id: string) =>
    apiClient.get<CalendarEvent>(`/calendar/${id}`),

  update: (id: string, data: UpdateCalendarEventDto) =>
    apiClient.patch<CalendarEvent>(`/calendar/${id}`, { body: data }),

  delete: (id: string) =>
    apiClient.delete<void>(`/calendar/${id}`),
};

// Pomodoro Service
export const pomodoroService = {
  create: (data: CreatePomodoroSessionDto) =>
    apiClient.post<PomodoroSession>('/pomodoro', { body: data }),

  getAll: (limit?: number) =>
    apiClient.get<PomodoroSession[]>('/pomodoro', {
      query: limit ? { limit: limit.toString() } : {}
    }),

  getActive: () =>
    apiClient.get<PomodoroSession | null>('/pomodoro/active'),

  getStats: () =>
    apiClient.get<PomodoroStats>('/pomodoro/stats'),

  getTodayStats: () =>
    apiClient.get<any>('/pomodoro/stats/today'),

  update: (id: string, data: UpdatePomodoroSessionDto) =>
    apiClient.patch<PomodoroSession>(`/pomodoro/${id}`, { body: data }),

  delete: (id: string) =>
    apiClient.delete<void>(`/pomodoro/${id}`),
};

// Review Service
export const reviewService = {
  create: (data: CreateReviewDto) =>
    apiClient.post<ReviewPrompt>('/review', { body: data }),

  setupDefaults: () =>
    apiClient.post<void>('/review/setup-defaults'),

  answerReview: (id: string, data: AnswerReviewDto) =>
    apiClient.post<any>(`/review/${id}/answer`, { body: data }),

  getAll: () =>
    apiClient.get<ReviewPrompt[]>('/review'),

  getDue: () =>
    apiClient.get<ReviewPrompt[]>('/review/due'),

  getStats: () =>
    apiClient.get<ReviewStats>('/review/stats'),

  getById: (id: string) =>
    apiClient.get<ReviewPrompt>(`/review/${id}`),

  update: (id: string, data: Partial<CreateReviewDto>) =>
    apiClient.patch<ReviewPrompt>(`/review/${id}`, { body: data }),

  delete: (id: string) =>
    apiClient.delete<void>(`/review/${id}`),
};