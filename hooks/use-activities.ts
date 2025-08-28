import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesService } from '../services/activities.service';
import { queryKeys } from './query-keys';
import { ActivitiesDto, TrackActivityRequest } from '@/types';

/**
 * Activities Hooks
 * Generated from backend analysis
 */

export const useGetActivities = (query?: ActivitiesDto) => {
  return useQuery({
    queryKey: queryKeys.activities.getActivities(query),
    queryFn: () => activitiesService.getActivities(query),
  });
};

export const useGetActivityInsights = () => {
  return useQuery({
    queryKey: queryKeys.activities.getActivityInsights(),
    queryFn: () => activitiesService.getActivityInsights(),
  });
};

export const useGetActivityFeed = () => {
  return useQuery({
    queryKey: queryKeys.activities.getActivityFeed(),
    queryFn: () => activitiesService.getActivityFeed(),
  });
};

export const useGetActivityStats = () => {
  return useQuery({
    queryKey: queryKeys.activities.getActivityStats(),
    queryFn: () => activitiesService.getActivityStats(),
  });
};

export const useTrackActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TrackActivityRequest) => activitiesService.trackActivity(data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.all() });
    },
  });
};

export const useCleanupOldActivities = (query?: { days?: string }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => activitiesService.cleanupOldActivities(query),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.all() });
    },
  });
};

export const useExportActivities = ( query?: { 
      format?: 'json' | 'csv' 
      days?: string
    }) => {
  return useQuery({
    queryKey: [...queryKeys.activities.all(), 'export', query] as const,
    queryFn: () => activitiesService.exportActivities(query),
  });
};

export const useGetActivityHeatmap = (query?: { days?: string }) => {
  return useQuery({
    queryKey: queryKeys.activities.getActivityHeatmap(query),
    queryFn: () => activitiesService.getActivityHeatmap(query),
  });
};

export const useGetProductivityMetrics = () => {
  return useQuery({
    queryKey: queryKeys.activities.getProductivityMetrics(),
    queryFn: () => activitiesService.getProductivityMetrics(),
  });
};

