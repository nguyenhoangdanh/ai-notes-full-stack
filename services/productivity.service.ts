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

  /**
   * GET /tasks
   */
  async findAll(): Promise<FindAllResponse> {
    return apiClient.get(`/tasks`);
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

  /**
   * PATCH /tasks/:id
   */
  async update(params: UpdateParams, data: UpdateRequest): Promise<UpdateResponse> {
    return apiClient.patch(`/tasks/${params.id}`, data);
  },

  /**
   * DELETE /tasks/:id
   */
  async remove(params: RemoveParams): Promise<RemoveResponse> {
    return apiClient.delete(`/tasks/${params.id}`);
  },

  /**
   * POST /pomodoro/start
   */
  async startSession(data: StartSessionRequest): Promise<StartSessionResponse> {
    return apiClient.post(`/pomodoro/start`, data);
  },

  /**
   * POST /pomodoro/pause
   */
  async pauseSession(data: PauseSessionRequest): Promise<PauseSessionResponse> {
    return apiClient.post(`/pomodoro/pause`, data);
  },

  /**
   * POST /pomodoro/complete
   */
  async completeSession(data: CompleteSessionRequest): Promise<CompleteSessionResponse> {
    return apiClient.post(`/pomodoro/complete`, data);
  },

  /**
   * GET /pomodoro/active
   */
  async getActiveSession(): Promise<GetActiveSessionResponse> {
    return apiClient.get(`/pomodoro/active`);
  },

  /**
   * GET /pomodoro/stats
   */
  async getStats(): Promise<GetStatsResponse> {
    return apiClient.get(`/pomodoro/stats`);
  },

  /**
   * GET /pomodoro/history
   */
  async getHistory(): Promise<GetHistoryResponse> {
    return apiClient.get(`/pomodoro/history`);
  },

  /**
   * POST /pomodoro/settings
   */
  async updateSettings(data: UpdateSettingsRequest): Promise<UpdateSettingsResponse> {
    return apiClient.post(`/pomodoro/settings`, data);
  },

  /**
   * GET /calendar/events
   */
  async getEvents(): Promise<GetEventsResponse> {
    return apiClient.get(`/calendar/events`);
  },

  /**
   * POST /calendar/events
   */
  async createEvent(data: CreateEventRequest): Promise<CreateEventResponse> {
    return apiClient.post(`/calendar/events`, data);
  },

  /**
   * PATCH /calendar/events/:id
   */
  async updateEvent(params: UpdateEventParams, data: UpdateEventRequest): Promise<UpdateEventResponse> {
    return apiClient.patch(`/calendar/events/${params.id}`, data);
  },

  /**
   * DELETE /calendar/events/:id
   */
  async deleteEvent(params: DeleteEventParams): Promise<DeleteEventResponse> {
    return apiClient.delete(`/calendar/events/${params.id}`);
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
