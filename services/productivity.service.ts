import { apiClient } from '../lib/api-client'
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
  ReviewPrompt,
} from '../types'

export const productivityService = {
  // Pomodoro sessions
  async getPomodoroSessions(): Promise<PomodoroSession[]> {
    return apiClient.get<PomodoroSession[]>('/pomodoro')
  },

  async getActivePomodoroSession(): Promise<PomodoroSession | null> {
    return apiClient.get<PomodoroSession | null>('/pomodoro/active')
  },

  async getPomodoroStats(): Promise<any> {
    return apiClient.get<any>('/pomodoro/stats')
  },

  async getTodayPomodoroStats(): Promise<any> {
    return apiClient.get<any>('/pomodoro/stats/today')
  },

  async createPomodoroSession(data: CreatePomodoroSessionDto): Promise<PomodoroSession> {
    return apiClient.post<PomodoroSession>('/pomodoro', { body: data })
  },

  async updatePomodoroSession(sessionId: string, data: UpdatePomodoroSessionDto): Promise<PomodoroSession> {
    return apiClient.patch<PomodoroSession>(`/pomodoro/${sessionId}`, { body: data })
  },

  async deletePomodoroSession(sessionId: string): Promise<void> {
    return apiClient.delete<void>(`/pomodoro/${sessionId}`)
  },

  // Tasks
  async getTasks(): Promise<Task[]> {
    return apiClient.get<Task[]>('/tasks')
  },

  async getTaskStats(): Promise<any> {
    return apiClient.get<any>('/tasks/stats')
  },

  async getOverdueTasks(): Promise<Task[]> {
    return apiClient.get<Task[]>('/tasks/overdue')
  },

  async getDueTasks(): Promise<Task[]> {
    return apiClient.get<Task[]>('/tasks/due')
  },

  async getTask(taskId: string): Promise<Task> {
    return apiClient.get<Task>(`/tasks/${taskId}`)
  },

  async createTask(data: CreateTaskDto): Promise<Task> {
    return apiClient.post<Task>('/tasks', { body: data })
  },

  async updateTask(taskId: string, data: UpdateTaskDto): Promise<Task> {
    return apiClient.patch<Task>(`/tasks/${taskId}`, { body: data })
  },

  async deleteTask(taskId: string): Promise<void> {
    return apiClient.delete<void>(`/tasks/${taskId}`)
  },

  // Calendar events
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    return apiClient.get<CalendarEvent[]>('/calendar')
  },

  async getUpcomingEvents(): Promise<CalendarEvent[]> {
    return apiClient.get<CalendarEvent[]>('/calendar/upcoming')
  },

  async getTodayEvents(): Promise<CalendarEvent[]> {
    return apiClient.get<CalendarEvent[]>('/calendar/today')
  },

  async getWeekEvents(): Promise<CalendarEvent[]> {
    return apiClient.get<CalendarEvent[]>('/calendar/week')
  },

  async getCalendarEvent(eventId: string): Promise<CalendarEvent> {
    return apiClient.get<CalendarEvent>(`/calendar/${eventId}`)
  },

  async createCalendarEvent(data: CreateCalendarEventDto): Promise<CalendarEvent> {
    return apiClient.post<CalendarEvent>('/calendar', { body: data })
  },

  async updateCalendarEvent(eventId: string, data: UpdateCalendarEventDto): Promise<CalendarEvent> {
    return apiClient.patch<CalendarEvent>(`/calendar/${eventId}`, { body: data })
  },

  async deleteCalendarEvent(eventId: string): Promise<void> {
    return apiClient.delete<void>(`/calendar/${eventId}`)
  },

  // Review prompts
  async getReviewPrompts(): Promise<ReviewPrompt[]> {
    return apiClient.get<ReviewPrompt[]>('/productivity/review-prompts')
  },

  async createReviewPrompt(data: {
    type: string
    title: string
    questions: string[]
    frequency: string
  }): Promise<ReviewPrompt> {
    return apiClient.post<ReviewPrompt>('/productivity/review-prompts', { body: data })
  },

  async updateReviewPrompt(promptId: string, data: Partial<ReviewPrompt>): Promise<ReviewPrompt> {
    return apiClient.patch<ReviewPrompt>(`/productivity/review-prompts/${promptId}`, { body: data })
  },

  async deleteReviewPrompt(promptId: string): Promise<void> {
    return apiClient.delete<void>(`/productivity/review-prompts/${promptId}`)
  },

  async markReviewPromptCompleted(promptId: string): Promise<ReviewPrompt> {
    return apiClient.post<ReviewPrompt>(`/productivity/review-prompts/${promptId}/complete`)
  },
}