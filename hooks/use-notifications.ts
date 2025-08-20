import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { notificationsService } from '../services/notifications.service';
import { queryKeys } from './query-keys';

/**
 * Notifications Hooks
 * Generated from backend analysis
 */

// Types for better type safety (should be moved to types/ directory later)
interface NotificationCreateData {
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  userId?: string;
}

interface NotificationUpdateData {
  title?: string;
  message?: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  isRead?: boolean;
}

interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UnreadCountResponse {
  count: number;
}

export const useGetNotifications = (options?: Omit<UseQueryOptions<NotificationResponse[]>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: queryKeys.notifications.getNotifications(),
    queryFn: async () => {
      const response = await notificationsService.getNotifications();
      return response.data || [];
    },
    ...options,
  });
};

export const useCreateNotification = (options?: UseMutationOptions<NotificationResponse, Error, NotificationCreateData>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: NotificationCreateData) => {
      const response = await notificationsService.createNotification(data);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
      options?.onSuccess?.(data, data as NotificationCreateData, undefined);
    },
    onError: options?.onError,
    ...options,
  });
};

export const useUpdateNotification = (options?: UseMutationOptions<NotificationResponse, Error, { id: string; data: NotificationUpdateData }>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: NotificationUpdateData }) => {
      const response = await notificationsService.updateNotification({ id }, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
      // Update specific notification in cache
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.getNotifications() });
      options?.onSuccess?.(data, variables, undefined);
    },
    onError: options?.onError,
    ...options,
  });
};

export const useDeleteNotification = (options?: UseMutationOptions<void, Error, { id: string }>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string }) => {
      await notificationsService.deleteNotification(params);
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
      options?.onSuccess?.(data, variables, undefined);
    },
    onError: options?.onError,
    ...options,
  });
};

export const useGetUnreadCount = (options?: Omit<UseQueryOptions<UnreadCountResponse>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: queryKeys.notifications.getUnreadCount(),
    queryFn: () => notificationsService.getUnreadCount(),
    ...options,
  });
};

export const useMarkAsRead = (options?: UseMutationOptions<NotificationResponse, Error, { id: string; data?: Record<string, unknown> }>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data = {} }: { id: string; data?: Record<string, unknown> }) => {
      const response = await notificationsService.markAsRead({ id }, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.getUnreadCount() });
      options?.onSuccess?.(data, variables, undefined);
    },
    onError: options?.onError,
    ...options,
  });
};

export const useMarkAllAsRead = (options?: UseMutationOptions<void, Error, Record<string, unknown>>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown> = {}) => {
      await notificationsService.markAllAsRead(data);
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.getUnreadCount() });
      options?.onSuccess?.(data, variables, undefined);
    },
    onError: options?.onError,
    ...options,
  });
};

