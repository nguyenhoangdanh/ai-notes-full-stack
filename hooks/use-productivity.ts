import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productivityService } from '../services/productivity.service';
import { queryKeys } from './query-keys';

/**
 * Productivity Hooks
 * Complete mapping with backend productivity features
 */

// Task Hooks
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => productivityService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productivity.tasks() });
    },
  });
};

export const useTasks = (status?: string, priority?: string) => {
  return useQuery({
    queryKey: queryKeys.productivity.getTasks(status, priority),
    queryFn: () => productivityService.getTasks(status, priority),
  });
};

export const useTaskStats = () => {
  return useQuery({
    queryKey: queryKeys.productivity.getTaskStats(),
    queryFn: () => productivityService.getTaskStats(),
  });
};

export const useOverdueTasks = () => {
  return useQuery({
    queryKey: queryKeys.productivity.getOverdueTasks(),
    queryFn: () => productivityService.getOverdueTasks(),
  });
};

export const useTasksByDueDate = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: queryKeys.productivity.getTasksByDueDate(startDate, endDate),
    queryFn: () => productivityService.getTasksByDueDate(startDate, endDate),
  });
};

export const useTask = (id: string) => {
  return useQuery({
    queryKey: ['productivity', 'task', id],
    queryFn: () => productivityService.getTask(id),
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      productivityService.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productivity.tasks() });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productivityService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productivity.tasks() });
    },
  });
};

// Pomodoro Hooks
export const useStartPomodoroSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId?: string) => productivityService.startPomodoroSession(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productivity.pomodoro() });
    },
  });
};

export const usePausePomodoroSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => productivityService.pausePomodoroSession(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productivity.pomodoro() });
    },
  });
};

export const useCompletePomodoroSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => productivityService.completePomodoroSession(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productivity.pomodoro() });
    },
  });
};

export const useActivePomodoroSession = () => {
  return useQuery({
    queryKey: queryKeys.productivity.getActivePomodoroSession(),
    queryFn: () => productivityService.getActivePomodoroSession(),
    refetchInterval: 1000, // Refresh every second for active session
  });
};

export const usePomodoroStats = () => {
  return useQuery({
    queryKey: queryKeys.productivity.getPomodoroStats(),
    queryFn: () => productivityService.getPomodoroStats(),
  });
};

export const usePomodoroHistory = (limit?: number) => {
  return useQuery({
    queryKey: queryKeys.productivity.getPomodoroHistory(limit),
    queryFn: () => productivityService.getPomodoroHistory(limit),
  });
};

export const useUpdatePomodoroSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: any) => productivityService.updatePomodoroSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productivity.pomodoro() });
    },
  });
};

// Calendar Hooks
export const useCalendarEvents = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: queryKeys.productivity.getCalendarEvents(startDate, endDate),
    queryFn: () => productivityService.getCalendarEvents(startDate, endDate),
  });
};

export const useCreateCalendarEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => productivityService.createCalendarEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productivity.calendar() });
    },
  });
};

export const useUpdateCalendarEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      productivityService.updateCalendarEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productivity.calendar() });
    },
  });
};

export const useDeleteCalendarEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productivityService.deleteCalendarEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productivity.calendar() });
    },
  });
};

export const useUpcomingEvents = (days: number = 7) => {
  return useQuery({
    queryKey: queryKeys.productivity.getUpcomingEvents(days),
    queryFn: () => productivityService.getUpcomingEvents(days),
  });
};

export const useTodayEvents = () => {
  return useQuery({
    queryKey: queryKeys.productivity.getTodayEvents(),
    queryFn: () => productivityService.getTodayEvents(),
  });
};

export const useWeekEvents = () => {
  return useQuery({
    queryKey: queryKeys.productivity.getWeekEvents(),
    queryFn: () => productivityService.getWeekEvents(),
  });
};

// Review System Hooks
export const useDueReviews = () => {
  return useQuery({
    queryKey: queryKeys.productivity.getDueReviews(),
    queryFn: () => productivityService.getDueReviews(),
  });
};

export const useReviewNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, difficulty }: { noteId: string; difficulty: 'EASY' | 'MEDIUM' | 'HARD' }) => 
      productivityService.reviewNote(noteId, difficulty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productivity.review() });
    },
  });
};

export const useReviewStats = () => {
  return useQuery({
    queryKey: queryKeys.productivity.getReviewStats(),
    queryFn: () => productivityService.getReviewStats(),
  });
};

export const useSetupSpacedRepetition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, settings }: { noteId: string; settings?: any }) => 
      productivityService.setupSpacedRepetition(noteId, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productivity.review() });
    },
  });
};

export const useReviewSchedule = (noteId: string) => {
  return useQuery({
    queryKey: queryKeys.productivity.getReviewSchedule(noteId),
    queryFn: () => productivityService.getReviewSchedule(noteId),
  });
};