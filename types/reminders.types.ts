/**
 * Reminders Module Types
 * Generated from backend analysis
 */

export interface GetRemindersResponse {
  // Define single item response
}

export interface CreateReminderRequest {
  // Define creation request body
}

export interface CreateReminderResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export interface UpdateReminderRequest {
  // Define update request body
}

export interface UpdateReminderResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export interface UpdateReminderParams {
  id: string;
}

export interface DeleteReminderResponse {
  success: boolean;
  message?: string;
}

export interface DeleteReminderParams {
  id: string;
}

export interface GetDueRemindersResponse {
  // Define single item response
}

export interface GetUpcomingRemindersResponse {
  // Define single item response
}

export interface CompleteReminderRequest {
}

export interface CompleteReminderResponse {
  success: boolean;
  message?: string;
}

export interface CompleteReminderParams {
  id: string;
}

export interface GetReminderStatsResponse {
  // Define single item response
}

