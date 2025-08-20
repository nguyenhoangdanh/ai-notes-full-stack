import { apiClient } from '../lib/api-client';
import {
  GetNotificationsResponse,
  CreateNotificationResponse,
  CreateNotificationRequest,
  UpdateNotificationResponse,
  UpdateNotificationRequest,
  UpdateNotificationParams,
  DeleteNotificationResponse,
  DeleteNotificationParams,
  GetUnreadCountResponse,
  MarkAsReadResponse,
  MarkAsReadRequest,
  MarkAsReadParams,
  MarkAllAsReadResponse,
  MarkAllAsReadRequest
} from '../types/notifications.types';

/**
 * Notifications Service
 * Generated from backend analysis
 */
export const notificationsService = {
  /**
   * GET /notifications
   */
  async getNotifications(): Promise<GetNotificationsResponse> {
    return apiClient.get(`/notifications`);
  },

  /**
   * POST /notifications
   */
  async createNotification(data: CreateNotificationRequest): Promise<CreateNotificationResponse> {
    return apiClient.post(`/notifications`, { body: data });
  },

  /**
   * PATCH /notifications/:id
   */
  async updateNotification(params: UpdateNotificationParams, data: UpdateNotificationRequest): Promise<UpdateNotificationResponse> {
    return apiClient.patch(`/notifications/${params.id}`, { body: data });
  },

  /**
   * DELETE /notifications/:id
   */
  async deleteNotification(params: DeleteNotificationParams): Promise<DeleteNotificationResponse> {
    return apiClient.delete(`/notifications/${params.id}`);
  },

  /**
   * GET /notifications/unread-count
   */
  async getUnreadCount(): Promise<GetUnreadCountResponse> {
    return apiClient.get(`/notifications/unread-count`);
  },

  /**
   * POST /notifications/:id/read
   */
  async markAsRead(params: MarkAsReadParams, data: MarkAsReadRequest): Promise<MarkAsReadResponse> {
    return apiClient.post(`/notifications/${params.id}/read`, { body: data });
  },

  /**
   * POST /notifications/read-all
   */
  async markAllAsRead(data: MarkAllAsReadRequest): Promise<MarkAllAsReadResponse> {
    return apiClient.post(`/notifications/read-all`, { body: data });
  }
};
