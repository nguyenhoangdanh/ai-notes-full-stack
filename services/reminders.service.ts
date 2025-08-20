import { apiClient } from '../lib/api-client';
import {
  GetRemindersResponse,
  CreateReminderResponse,
  CreateReminderRequest,
  UpdateReminderResponse,
  UpdateReminderRequest,
  UpdateReminderParams,
  DeleteReminderResponse,
  DeleteReminderParams,
  GetDueRemindersResponse,
  GetUpcomingRemindersResponse,
  CompleteReminderResponse,
  CompleteReminderRequest,
  CompleteReminderParams,
  GetReminderStatsResponse
} from '../types/reminders.types';

/**
 * Reminders Service
 * Generated from backend analysis
 */
export const remindersService = {
  /**
   * GET /reminders
   */
  async getReminders(): Promise<GetRemindersResponse> {
    return apiClient.get(`/reminders`);
  },

  /**
   * POST /reminders
   */
  async createReminder(data: CreateReminderRequest): Promise<CreateReminderResponse> {
    return apiClient.post(`/reminders`, data);
  },

  /**
   * PATCH /reminders/:id
   */
  async updateReminder(params: UpdateReminderParams, data: UpdateReminderRequest): Promise<UpdateReminderResponse> {
    return apiClient.patch(`/reminders/${params.id}`, data);
  },

  /**
   * DELETE /reminders/:id
   */
  async deleteReminder(params: DeleteReminderParams): Promise<DeleteReminderResponse> {
    return apiClient.delete(`/reminders/${params.id}`);
  },

  /**
   * GET /reminders/due
   */
  async getDueReminders(): Promise<GetDueRemindersResponse> {
    return apiClient.get(`/reminders/due`);
  },

  /**
   * GET /reminders/upcoming
   */
  async getUpcomingReminders(): Promise<GetUpcomingRemindersResponse> {
    return apiClient.get(`/reminders/upcoming`);
  },

  /**
   * POST /reminders/:id/complete
   */
  async completeReminder(params: CompleteReminderParams, data: CompleteReminderRequest): Promise<CompleteReminderResponse> {
    return apiClient.post(`/reminders/${params.id}/complete`, data);
  },

  /**
   * GET /reminders/stats
   */
  async getReminderStats(): Promise<GetReminderStatsResponse> {
    return apiClient.get(`/reminders/stats`);
  }
};
