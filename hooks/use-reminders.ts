import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { remindersService } from '../services/reminders.service';
import { queryKeys } from './query-keys';

/**
 * Reminders Hooks
 * Generated from backend analysis
 */

export const useGetReminders = () => {
  return useQuery({
    queryKey: queryKeys.reminders.getReminders(),
    queryFn: () => remindersService.getReminders(),
  });
};

export const useCreateReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data: any }) => remindersService.createReminder(data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.reminders.all });
    },
  });
};

export const useUpdateReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ params: { id: string }, data: any }) => remindersService.updateReminder(params, data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.reminders.all });
    },
  });
};

export const useDeleteReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ params: { id: string } }) => remindersService.deleteReminder(params),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.reminders.all });
    },
  });
};

export const useGetDueReminders = () => {
  return useQuery({
    queryKey: queryKeys.reminders.getDueReminders(),
    queryFn: () => remindersService.getDueReminders(),
  });
};

export const useGetUpcomingReminders = () => {
  return useQuery({
    queryKey: queryKeys.reminders.getUpcomingReminders(),
    queryFn: () => remindersService.getUpcomingReminders(),
  });
};

export const useCompleteReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ params: { id: string }, data: any }) => remindersService.completeReminder(params, data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.reminders.all });
    },
  });
};

export const useGetReminderStats = () => {
  return useQuery({
    queryKey: queryKeys.reminders.getReminderStats(),
    queryFn: () => remindersService.getReminderStats(),
  });
};

