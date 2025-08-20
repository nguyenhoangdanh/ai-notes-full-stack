import { apiClient } from '../lib/api-client';
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
} from '../types';

/**
 * Productivity Service
 * Generated from backend analysis
 */
export const productivityService = {
  /**
   * POST /tasks
   */
  async create(data: CreateTaskDto): Promise<Task> {
    return apiClient.post(`/tasks`, { body: data });
  },

  // Alias for create - used by hooks
  async createTask(data: CreateTaskDto): Promise<Task> {
    return this.create(data);
  },

  /**
   * GET /tasks
   */
  async findAll(): Promise<Task[]> {
    return apiClient.get(`/tasks`);
  },

  // Alias for findAll - used by hooks
  async getTasks(filters?: any): Promise<Task[]> {
    return this.findAll();
  },

  /**
   * GET /tasks/stats
   */
  async getStats(): Promise<any> {
    return apiClient.get(`/tasks/stats`);
  },

  /**
   * GET /tasks/overdue
   */
  async getOverdue(): Promise<Task[]> {
    return apiClient.get(`/tasks/overdue`);
  },

  /**
   * GET /tasks/due
   */
  async getTasksByDueDate(): Promise<Task[]> {
    return apiClient.get(`/tasks/due`);
  },

  /**
   * GET /tasks/:id
   */
  async findOne(params: { id: string }): Promise<Task> {
    return apiClient.get(`/tasks/${params.id}`);
  },

  // Alias for findOne - used by hooks
  async getTask(taskId: string): Promise<Task> {
    return this.findOne({ id: taskId });
  },

  /**
   * PATCH /tasks/:id
   */
  async update(params: { id: string }, data: UpdateTaskDto): Promise<Task> {
    return apiClient.patch(`/tasks/${params.id}`, { body: data });
  },

  // Alias for update - used by hooks
  async updateTask(taskId: string, data: UpdateTaskDto): Promise<Task> {
    return this.update({ id: taskId }, data);
  },

  // Alias for getStats - used by hooks
  async getTaskStats(): Promise<any> {
    return this.getStats();
  },

  // Alias for getOverdue - used by hooks
  async getOverdueTasks(): Promise<Task[]> {
    return this.getOverdue();
  },

  /**
   * DELETE /tasks/:id
   */
  async remove(params: { id: string }): Promise<void> {
    return apiClient.delete(`/tasks/${params.id}`);
  },

  // Alias for remove - used by hooks
  async deleteTask(taskId: string): Promise<void> {
    return this.remove({ id: taskId });
  },

  /**
   * POST /pomodoro/start
   */
  async startSession(data: CreatePomodoroSessionDto): Promise<PomodoroSession> {
    return apiClient.post(`/pomodoro/start`, { body: data });
  },

  // Alias for startSession - used by hooks
  async createPomodoroSession(data: CreatePomodoroSessionDto): Promise<PomodoroSession> {
    return this.startSession(data);
  },

  // Alias for startSession - used by hooks
  async startPomodoroSession(data: CreatePomodoroSessionDto): Promise<PomodoroSession> {
    return this.startSession(data);
  },

  /**
   * POST /pomodoro/pause
   */
  async pauseSession(data: UpdatePomodoroSessionDto): Promise<PomodoroSession> {
    return apiClient.post(`/pomodoro/pause`, { body: data });
  },

  // Alias for pauseSession - used by hooks
  async pausePomodoroSession(data: UpdatePomodoroSessionDto): Promise<PomodoroSession> {
    return this.pauseSession(data);
  },

  /**
   * POST /pomodoro/complete
   */
  async completeSession(data: UpdatePomodoroSessionDto): Promise<PomodoroSession> {
    return apiClient.post(`/pomodoro/complete`, { body: data });
  },

  // Alias for completeSession - used by hooks
  async completePomodoroSession(data: UpdatePomodoroSessionDto): Promise<PomodoroSession> {
    return this.completeSession(data);
  },

  // Alias for completeSession - used by hooks
  async updatePomodoroSession(sessionId: string, data: UpdatePomodoroSessionDto): Promise<PomodoroSession> {
    return this.completeSession(data);
  },

  /**
   * GET /pomodoro/active
   */
  async getActiveSession(): Promise<PomodoroSession | null> {
    return apiClient.get(`/pomodoro/active`);
  },

  // Alias for getActiveSession - used by hooks
  async getActivePomodoroSession(): Promise<PomodoroSession | null> {
    return this.getActiveSession();
  },

  /**
   * GET /pomodoro/stats
   */
  async getPomodoroStatsData(): Promise<any> {
    return apiClient.get(`/pomodoro/stats`);
  },

  // Alias for getStats - used by hooks (pomodoro stats)
  async getPomodoroStats(): Promise<any> {
    return apiClient.get(`/pomodoro/stats`);
  },

  /**
   * GET /pomodoro/history
   */
  async getHistory(): Promise<PomodoroSession[]> {
    return apiClient.get(`/pomodoro/history`);
  },

  // Alias for getHistory - used by hooks
  async getPomodoroHistory(): Promise<PomodoroSession[]> {
    return this.getHistory();
  },

  /**
   * POST /pomodoro/settings
   */
  async updateSettings(data: any): Promise<any> {
    return apiClient.post(`/pomodoro/settings`, { body: data });
  },

  // Alias for updateSettings - used by hooks
  async updatePomodoroSettings(data: any): Promise<any> {
    return this.updateSettings(data);
  },

  /**
   * GET /calendar/events
   */
  async getEvents(): Promise<CalendarEvent[]> {
    return apiClient.get(`/calendar/events`);
  },

  // Alias for getEvents - used by hooks
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    return this.getEvents();
  },

  /**
   * POST /calendar/events
   */
  async createEvent(data: CreateCalendarEventDto): Promise<CalendarEvent> {
    return apiClient.post(`/calendar/events`, { body: data });
  },

  // Alias for createEvent - used by hooks
  async createCalendarEvent(data: CreateCalendarEventDto): Promise<CalendarEvent> {
    return this.createEvent(data);
  },

  /**
   * PATCH /calendar/events/:id
   */
  async updateEvent(params: { id: string }, data: UpdateCalendarEventDto): Promise<CalendarEvent> {
    return apiClient.patch(`/calendar/events/${params.id}`, { body: data });
  },

  // Alias for updateEvent - used by hooks
  async updateCalendarEvent(eventId: string, data: UpdateCalendarEventDto): Promise<CalendarEvent> {
    return this.updateEvent({ id: eventId }, data);
  },

  /**
   * DELETE /calendar/events/:id
   */
  async deleteEvent(params: { id: string }): Promise<void> {
    return apiClient.delete(`/calendar/events/${params.id}`);
  },

  // Alias for deleteEvent - used by hooks
  async deleteCalendarEvent(eventId: string): Promise<void> {
    return this.deleteEvent({ id: eventId });
  },

  /**
   * GET /calendar/events/upcoming
   */
  async getUpcomingEvents(): Promise<CalendarEvent[]> {
    return apiClient.get(`/calendar/events/upcoming`);
  },

  /**
   * GET /calendar/events/today
   */
  async getTodayEvents(): Promise<CalendarEvent[]> {
    return apiClient.get(`/calendar/events/today`);
  },

  /**
   * GET /calendar/events/week
   */
  async getWeekEvents(): Promise<CalendarEvent[]> {
    return apiClient.get(`/calendar/events/week`);
  },

  /**
   * GET /review/due
   */
  async getDueReviews(): Promise<any[]> {
    return apiClient.get(`/review/due`);
  },

  /**
   * POST /review/:noteId/review
   */
  async reviewNote(params: { noteId: string }, data: any): Promise<any> {
    return apiClient.post(`/review/${params.noteId}/review`, { body: data });
  },

  /**
   * GET /review/stats
   */
  async getReviewStats(): Promise<any> {
    return apiClient.get(`/review/stats`);
  },

  /**
   * POST /review/setup
   */
  async setupSpacedRepetition(data: any): Promise<any> {
    return apiClient.post(`/review/setup`, { body: data });
  },

  /**
   * GET /review/schedule/:noteId
   */
  async getReviewSchedule(params: { noteId: string }): Promise<any> {
    return apiClient.get(`/review/schedule/${params.noteId}`);
  }
};
