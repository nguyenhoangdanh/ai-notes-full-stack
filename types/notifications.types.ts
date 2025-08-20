/**
 * Notifications Module Types
 * Generated from backend analysis
 */

export interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetNotificationsResponse {
  data: NotificationResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateNotificationRequest {
  title: string;
  message: string;
  type?: string;
  userId?: string;
}

export interface CreateNotificationResponse {
  success: boolean;
  data: NotificationResponse;
  message?: string;
}

export interface UpdateNotificationRequest {
  title?: string;
  message?: string;
  type?: string;
  isRead?: boolean;
}

export interface UpdateNotificationResponse {
  success: boolean;
  data: NotificationResponse;
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
  count: number;
}

export interface MarkAsReadRequest {
  [key: string]: unknown;
}

export interface MarkAsReadResponse {
  success: boolean;
  data: NotificationResponse;
  message?: string;
}

export interface MarkAsReadParams {
  id: string;
}

export interface MarkAllAsReadRequest {
  [key: string]: unknown;
}

export interface MarkAllAsReadResponse {
  success: boolean;
  message?: string;
}

