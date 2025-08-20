import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '../services/notifications.service';
import { queryKeys } from './query-keys';

/**
 * Notifications Hooks
 * Generated from backend analysis
 */

export const useGetNotifications = () => {
  return useQuery({
    queryKey: queryKeys.notifications.getNotifications(),
    queryFn: () => notificationsService.getNotifications(),
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data: any }) => notificationsService.createNotification(data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
    },
  });
};

export const useUpdateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ params: { id: string }, data: any }) => notificationsService.updateNotification(params, data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ params: { id: string } }) => notificationsService.deleteNotification(params),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
    },
  });
};

export const useGetUnreadCount = () => {
  return useQuery({
    queryKey: queryKeys.notifications.getUnreadCount(),
    queryFn: () => notificationsService.getUnreadCount(),
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ params: { id: string }, data: any }) => notificationsService.markAsRead(params, data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data: any }) => notificationsService.markAllAsRead(data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
    },
  });
};

