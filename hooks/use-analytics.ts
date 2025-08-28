import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics.service';
import { queryKeys } from './query-keys';
import { TrackNoteActionRequest } from '@/types';

/**
 * Analytics Hooks
 * Generated from backend analysis
 */

export const useGetUserAnalytics = () => {
  return useQuery({
    queryKey: queryKeys.analytics.getUserAnalytics(),
    queryFn: () => analyticsService.getUserAnalytics(),
  });
};

export const useGetWorkspaceAnalytics = () => {
  return useQuery({
    queryKey: queryKeys.analytics.getWorkspaceAnalytics(),
    queryFn: () => analyticsService.getWorkspaceAnalytics(),
  });
};

export const useGetContentAnalytics = () => {
  return useQuery({
    queryKey: queryKeys.analytics.getContentAnalytics(),
    queryFn: () => analyticsService.getContentAnalytics(),
  });
};

export const useTrackNoteAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, data }: { noteId: string; data: TrackNoteActionRequest }) => 
      analyticsService.trackNoteAction({ noteId }, data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all() });
    },
  });
};

