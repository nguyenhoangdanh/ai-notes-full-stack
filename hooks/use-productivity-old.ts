import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productivityService } from '../services/productivity.service';
import { queryKeys } from './query-keys';

/**
 * Productivity Hooks
 * Generated from backend analysis
 */

export const useCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data: any }) => productivityService.create(data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.productivity.all });
    },
  });
};

export const useFindAll = () => {
  return useQuery({
    queryKey: queryKeys.productivity.findAll(),
    queryFn: () => productivityService.findAll(),
  });
};

export const useGetStats = () => {
  return useQuery({
    queryKey: queryKeys.productivity.getStats(),
    queryFn: () => productivityService.getStats(),
  });
};

export const useGetOverdue = () => {
  return useQuery({
    queryKey: queryKeys.productivity.getOverdue(),
    queryFn: () => productivityService.getOverdue(),
  });
};

export const useGetTasksByDueDate = () => {
  return useQuery({
    queryKey: queryKeys.productivity.getTasksByDueDate(),
    queryFn: () => productivityService.getTasksByDueDate(),
  });
};

export const useFindOne = (params: { id: string }) => {
  return useQuery({
    queryKey: queryKeys.productivity.findOne(params.id),
    queryFn: () => productivityService.findOne(params),
  });
};

export const useUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ params: { id: string }, data: any }) => productivityService.update(params, data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.productivity.all });
    },
  });
};

export const useRemove = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ params: { id: string } }) => productivityService.remove(params),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.productivity.all });
    },
  });
};

export const useStartSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data: any }) => productivityService.startSession(data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.productivity.all });
    },
  });
};

export const usePauseSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data: any }) => productivityService.pauseSession(data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.productivity.all });
    },
  });
};

export const useCompleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data: any }) => productivityService.completeSession(data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.productivity.all });
    },
  });
};

export const useGetActiveSession = () => {
  return useQuery({
    queryKey: queryKeys.productivity.getActiveSession(),
    queryFn: () => productivityService.getActiveSession(),
  });
};

export const useGetStats = () => {
  return useQuery({
    queryKey: queryKeys.productivity.getStats(),
    queryFn: () => productivityService.getStats(),
  });
};

export const useGetHistory = () => {
  return useQuery({
    queryKey: queryKeys.productivity.getHistory(),
    queryFn: () => productivityService.getHistory(),
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data: any }) => productivityService.updateSettings(data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.productivity.all });
    },
  });
};

export const useGetEvents = () => {
  return useQuery({
    queryKey: queryKeys.productivity.getEvents(),
    queryFn: () => productivityService.getEvents(),
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data: any }) => productivityService.createEvent(data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.productivity.all });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ params: { id: string }, data: any }) => productivityService.updateEvent(params, data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.productivity.all });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ params: { id: string } }) => productivityService.deleteEvent(params),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.productivity.all });
    },
  });
};

export const useGetUpcomingEvents = () => {
  return useQuery({
    queryKey: queryKeys.productivity.getUpcomingEvents(),
    queryFn: () => productivityService.getUpcomingEvents(),
  });
};

export const useGetTodayEvents = () => {
  return useQuery({
    queryKey: queryKeys.productivity.getTodayEvents(),
    queryFn: () => productivityService.getTodayEvents(),
  });
};

export const useGetWeekEvents = () => {
  return useQuery({
    queryKey: queryKeys.productivity.getWeekEvents(),
    queryFn: () => productivityService.getWeekEvents(),
  });
};

export const useGetDueReviews = () => {
  return useQuery({
    queryKey: queryKeys.productivity.getDueReviews(),
    queryFn: () => productivityService.getDueReviews(),
  });
};

export const useReviewNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ params: { noteId: string }, data: any }) => productivityService.reviewNote(params, data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.productivity.all });
    },
  });
};

export const useGetReviewStats = () => {
  return useQuery({
    queryKey: queryKeys.productivity.getReviewStats(),
    queryFn: () => productivityService.getReviewStats(),
  });
};

export const useSetupSpacedRepetition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data: any }) => productivityService.setupSpacedRepetition(data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.productivity.all });
    },
  });
};

export const useGetReviewSchedule = (params: { noteId: string }) => {
  return useQuery({
    queryKey: queryKeys.productivity.getReviewSchedule(params.noteId),
    queryFn: () => productivityService.getReviewSchedule(params),
  });
};

