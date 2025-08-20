import { apiClient } from '../lib/api-client';
import {
  CreateResponse,
  CreateRequest,
  FindAllResponse,
  GetStatsResponse,
  GetOverdueResponse,
  GetTasksByDueDateResponse,
  FindOneResponse,
  FindOneParams,
  UpdateResponse,
  UpdateRequest,
  UpdateParams,
  RemoveResponse,
  RemoveParams,
  StartSessionResponse,
  StartSessionRequest,
  PauseSessionResponse,
  PauseSessionRequest,
  CompleteSessionResponse,
  CompleteSessionRequest,
  GetActiveSessionResponse,
  GetHistoryResponse,
  UpdateSettingsResponse,
  UpdateSettingsRequest,
  GetEventsResponse,
  CreateEventResponse,
  CreateEventRequest,
  UpdateEventResponse,
  UpdateEventRequest,
  UpdateEventParams,
  DeleteEventResponse,
  DeleteEventParams,
  GetUpcomingEventsResponse,
  GetTodayEventsResponse,
  GetWeekEventsResponse,
  GetDueReviewsResponse,
  ReviewNoteResponse,
  ReviewNoteRequest,
  ReviewNoteParams,
  GetReviewStatsResponse,
  SetupSpacedRepetitionResponse,
  SetupSpacedRepetitionRequest,
  GetReviewScheduleResponse,
  GetReviewScheduleParams
} from '../types/productivity.types';

/**
 * Productivity Service
 * Generated from backend analysis
 */
export const productivityService = {
  /**
   * POST /tasks
   */
  async create(data: CreateRequest): Promise<CreateResponse> {
    return apiClient.post(`/tasks`, data);
  },

  // Alias for create - used by hooks
  async createTask(data: CreateRequest): Promise<CreateResponse> {
    return this.create(data);
  },

  /**
   * GET /tasks
   */
  async findAll(): Promise<FindAllResponse> {
    return apiClient.get(`/tasks`);
  },

  // Alias for findAll - used by hooks
  async getTasks(filters?: any): Promise<FindAllResponse> {
    return this.findAll();
  },

  /**
   * GET /tasks/stats
   */
  async getStats(): Promise<GetStatsResponse> {
    return apiClient.get(`/tasks/stats`);
  },

  /**
   * GET /tasks/overdue
   */
  async getOverdue(): Promise<GetOverdueResponse> {
    return apiClient.get(`/tasks/overdue`);
  },

  /**
   * GET /tasks/due
   */
  async getTasksByDueDate(): Promise<GetTasksByDueDateResponse> {
    return apiClient.get(`/tasks/due`);
  },

  /**
   * GET /tasks/:id
   */
  async findOne(params: FindOneParams): Promise<FindOneResponse> {
    return apiClient.get(`/tasks/${params.id}`);
  },

  // Alias for findOne - used by hooks
  async getTask(taskId: string): Promise<FindOneResponse> {
    return this.findOne({ id: taskId });
  },

  /**
   * PATCH /tasks/:id
   */
  async update(params: UpdateParams, data: UpdateRequest): Promise<UpdateResponse> {
    return apiClient.patch(`/tasks/${params.id}`, data);
  },

  // Alias for update - used by hooks
  async updateTask(taskId: string, data: UpdateRequest): Promise<UpdateResponse> {
    return this.update({ id: taskId }, data);
  },

  // Alias for getStats - used by hooks
  async getTaskStats(): Promise<GetStatsResponse> {
    return this.getStats();
  },

  // Alias for getOverdue - used by hooks
  async getOverdueTasks(): Promise<GetOverdueResponse> {
    return this.getOverdue();
  },

  /**
   * DELETE /tasks/:id
   */
  async remove(params: RemoveParams): Promise<RemoveResponse> {
    return apiClient.delete(`/tasks/${params.id}`);
  },

  // Alias for remove - used by hooks
  async deleteTask(taskId: string): Promise<RemoveResponse> {
    return this.remove({ id: taskId });
  },

  /**
   * POST /pomodoro/start
   */
  async startSession(data: StartSessionRequest): Promise<StartSessionResponse> {
    return apiClient.post(`/pomodoro/start`, data);
  },

  // Alias for startSession - used by hooks
  async createPomodoroSession(data: StartSessionRequest): Promise<StartSessionResponse> {
    return this.startSession(data);
  },

  // Alias for startSession - used by hooks
  async startPomodoroSession(data: StartSessionRequest): Promise<StartSessionResponse> {
    return this.startSession(data);
  },

  /**
   * POST /pomodoro/pause
   */
  async pauseSession(data: PauseSessionRequest): Promise<PauseSessionResponse> {
    return apiClient.post(`/pomodoro/pause`, data);
  },

  // Alias for pauseSession - used by hooks
  async pausePomodoroSession(data: PauseSessionRequest): Promise<PauseSessionResponse> {
    return this.pauseSession(data);
  },

  /**
   * POST /pomodoro/complete
   */
  async completeSession(data: CompleteSessionRequest): Promise<CompleteSessionResponse> {
    return apiClient.post(`/pomodoro/complete`, data);
  },

  // Alias for completeSession - used by hooks
  async completePomodoroSession(data: CompleteSessionRequest): Promise<CompleteSessionResponse> {
    return this.completeSession(data);
  },

  // Alias for completeSession - used by hooks
  async updatePomodoroSession(sessionId: string, data: CompleteSessionRequest): Promise<CompleteSessionResponse> {
    return this.completeSession(data);
  },

  /**
   * GET /pomodoro/active
   */
  async getActiveSession(): Promise<GetActiveSessionResponse> {
    return apiClient.get(`/pomodoro/active`);
  },

  // Alias for getActiveSession - used by hooks
  async getActivePomodoroSession(): Promise<GetActiveSessionResponse> {
    return this.getActiveSession();
  },

  /**
   * GET /pomodoro/stats
   */
  async getStats(): Promise<GetStatsResponse> {
    return apiClient.get(`/pomodoro/stats`);
  },

  // Alias for getStats - used by hooks (pomodoro stats)
  async getPomodoroStats(): Promise<GetStatsResponse> {
    return apiClient.get(`/pomodoro/stats`);
  },

  /**
   * GET /pomodoro/history
   */
  async getHistory(): Promise<GetHistoryResponse> {
    return apiClient.get(`/pomodoro/history`);
  },

  // Alias for getHistory - used by hooks
  async getPomodoroHistory(): Promise<GetHistoryResponse> {
    return this.getHistory();
  },

  /**
   * POST /pomodoro/settings
   */
  async updateSettings(data: UpdateSettingsRequest): Promise<UpdateSettingsResponse> {
    return apiClient.post(`/pomodoro/settings`, data);
  },

  // Alias for updateSettings - used by hooks
  async updatePomodoroSettings(data: UpdateSettingsRequest): Promise<UpdateSettingsResponse> {
    return this.updateSettings(data);
  },

  /**
   * GET /calendar/events
   */
  async getEvents(): Promise<GetEventsResponse> {
    return apiClient.get(`/calendar/events`);
  },

  // Alias for getEvents - used by hooks
  async getCalendarEvents(): Promise<GetEventsResponse> {
    return this.getEvents();
  },

  /**
   * POST /calendar/events
   */
  async createEvent(data: CreateEventRequest): Promise<CreateEventResponse> {
    return apiClient.post(`/calendar/events`, data);
  },

  // Alias for createEvent - used by hooks
  async createCalendarEvent(data: CreateEventRequest): Promise<CreateEventResponse> {
    return this.createEvent(data);
  },

  /**
   * PATCH /calendar/events/:id
   */
  async updateEvent(params: UpdateEventParams, data: UpdateEventRequest): Promise<UpdateEventResponse> {
    return apiClient.patch(`/calendar/events/${params.id}`, data);
  },

  // Alias for updateEvent - used by hooks
  async updateCalendarEvent(eventId: string, data: UpdateEventRequest): Promise<UpdateEventResponse> {
    return this.updateEvent({ id: eventId }, data);
  },

  /**
   * DELETE /calendar/events/:id
   */
  async deleteEvent(params: DeleteEventParams): Promise<DeleteEventResponse> {
    return apiClient.delete(`/calendar/events/${params.id}`);
  },

  // Alias for deleteEvent - used by hooks
  async deleteCalendarEvent(eventId: string): Promise<DeleteEventResponse> {
    return this.deleteEvent({ id: eventId });
  },

  /**
   * GET /calendar/events/upcoming
   */
  async getUpcomingEvents(): Promise<GetUpcomingEventsResponse> {
    return apiClient.get(`/calendar/events/upcoming`);
  },

  /**
   * GET /calendar/events/today
   */
  async getTodayEvents(): Promise<GetTodayEventsResponse> {
    return apiClient.get(`/calendar/events/today`);
  },

  /**
   * GET /calendar/events/week
   */
  async getWeekEvents(): Promise<GetWeekEventsResponse> {
    return apiClient.get(`/calendar/events/week`);
  },

  /**
   * GET /review/due
   */
  async getDueReviews(): Promise<GetDueReviewsResponse> {
    return apiClient.get(`/review/due`);
  },

  /**
   * POST /review/:noteId/review
   */
  async reviewNote(params: ReviewNoteParams, data: ReviewNoteRequest): Promise<ReviewNoteResponse> {
    return apiClient.post(`/review/${params.noteId}/review`, data);
  },

  /**
   * GET /review/stats
   */
  async getReviewStats(): Promise<GetReviewStatsResponse> {
    return apiClient.get(`/review/stats`);
  },

  /**
   * POST /review/setup
   */
  async setupSpacedRepetition(data: SetupSpacedRepetitionRequest): Promise<SetupSpacedRepetitionResponse> {
    return apiClient.post(`/review/setup`, data);
  },

  /**
   * GET /review/schedule/:noteId
   */
  async getReviewSchedule(params: GetReviewScheduleParams): Promise<GetReviewScheduleResponse> {
    return apiClient.get(`/review/schedule/${params.noteId}`);
  }
};
