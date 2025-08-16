import { getApiClient } from '../lib/api-client'
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
  ReviewPrompt,
} from '../types'

export const productivityService = {
  // Pomodoro sessions
  async getPomodoroSessions(): Promise<PomodoroSession[]> {
    return getApiClient().get<PomodoroSession[]>('/productivity/pomodoro/sessions')
  },

  async createPomodoroSession(data: CreatePomodoroSessionDto): Promise<PomodoroSession> {
    return getApiClient().post<PomodoroSession>('/productivity/pomodoro/sessions', { body: data })
  },

  async updatePomodoroSession(sessionId: string, data: UpdatePomodoroSessionDto): Promise<PomodoroSession> {
    return getApiClient().patch<PomodoroSession>(`/productivity/pomodoro/sessions/${sessionId}`, { body: data })
  },

  async cancelPomodoroSession(sessionId: string): Promise<void> {
    return getApiClient().delete<void>(`/productivity/pomodoro/sessions/${sessionId}`)
  },

  // Tasks
  async getTasks(filters?: { status?: string; priority?: string; noteId?: string }): Promise<Task[]> {
    return getApiClient().get<Task[]>('/productivity/tasks', { query: filters })
  },

  async getTask(taskId: string): Promise<Task> {
    return getApiClient().get<Task>(`/productivity/tasks/${taskId}`)
  },

  async createTask(data: CreateTaskDto): Promise<Task> {
    return getApiClient().post<Task>('/productivity/tasks', { body: data })
  },

  async updateTask(taskId: string, data: UpdateTaskDto): Promise<Task> {
    return getApiClient().patch<Task>(`/productivity/tasks/${taskId}`, { body: data })
  },

  async deleteTask(taskId: string): Promise<void> {
    return getApiClient().delete<void>(`/productivity/tasks/${taskId}`)
  },

  // Calendar events
  async getCalendarEvents(filters?: { 
    start?: string
    end?: string
    noteId?: string 
  }): Promise<CalendarEvent[]> {
    return getApiClient().get<CalendarEvent[]>('/productivity/calendar/events', { query: filters })
  },

  async getCalendarEvent(eventId: string): Promise<CalendarEvent> {
    return getApiClient().get<CalendarEvent>(`/productivity/calendar/events/${eventId}`)
  },

  async createCalendarEvent(data: CreateCalendarEventDto): Promise<CalendarEvent> {
    return getApiClient().post<CalendarEvent>('/productivity/calendar/events', { body: data })
  },

  async updateCalendarEvent(eventId: string, data: UpdateCalendarEventDto): Promise<CalendarEvent> {
    return getApiClient().patch<CalendarEvent>(`/productivity/calendar/events/${eventId}`, { body: data })
  },

  async deleteCalendarEvent(eventId: string): Promise<void> {
    return getApiClient().delete<void>(`/productivity/calendar/events/${eventId}`)
  },

  // Review prompts
  async getReviewPrompts(): Promise<ReviewPrompt[]> {
    return getApiClient().get<ReviewPrompt[]>('/productivity/review-prompts')
  },

  async createReviewPrompt(data: {
    type: string
    title: string
    questions: string[]
    frequency: string
  }): Promise<ReviewPrompt> {
    return getApiClient().post<ReviewPrompt>('/productivity/review-prompts', { body: data })
  },

  async updateReviewPrompt(promptId: string, data: Partial<ReviewPrompt>): Promise<ReviewPrompt> {
    return getApiClient().patch<ReviewPrompt>(`/productivity/review-prompts/${promptId}`, { body: data })
  },

  async deleteReviewPrompt(promptId: string): Promise<void> {
    return getApiClient().delete<void>(`/productivity/review-prompts/${promptId}`)
  },

  async markReviewPromptCompleted(promptId: string): Promise<ReviewPrompt> {
    return getApiClient().post<ReviewPrompt>(`/productivity/review-prompts/${promptId}/complete`)
  },
}