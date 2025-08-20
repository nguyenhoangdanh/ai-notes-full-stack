/**
 * Notifications Module Types
 * Generated from backend analysis
 */

export interface GetNotificationsResponse {
  // Define single item response
}

export interface CreateNotificationRequest {
  // Define creation request body
}

export interface CreateNotificationResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export interface UpdateNotificationRequest {
  // Define update request body
}

export interface UpdateNotificationResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export interface UpdateNotificationParams {
  id: string;
}

export interface DeleteNotificationResponse {
  success: boolean;
  message?: string;
}

export interface DeleteNotificationParams {
  id: string;
}

export interface GetUnreadCountResponse {
  // Define single item response
}

export interface MarkAsReadRequest {
}

export interface MarkAsReadResponse {
  success: boolean;
  message?: string;
}

export interface MarkAsReadParams {
  id: string;
}

export interface MarkAllAsReadRequest {
}

export interface MarkAllAsReadResponse {
  success: boolean;
  message?: string;
}

