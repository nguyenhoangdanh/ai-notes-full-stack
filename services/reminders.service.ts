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
  async updateReminder(id: string, data: any): Promise<any> {
    return apiClient.patch(`/reminders/${id}`, { body: data });
  },

  /**
   * DELETE /reminders/:id
   */
  async deleteReminder(id: string): Promise<void> {
    return apiClient.delete(`/reminders/${id}`);
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
  async completeReminder(id: string, data: any): Promise<any> {
    return apiClient.post(`/reminders/${id}/complete`, { body: data });
  },

  /**
   * GET /reminders/stats
   */
  async getReminderStats(): Promise<GetReminderStatsResponse> {
    return apiClient.get(`/reminders/stats`);
  }
};
