import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesService } from '../services/activities.service';
import { queryKeys } from './query-keys';

/**
 * Activities Hooks
 * Generated from backend analysis
 */

export const useGetActivities = () => {
  return useQuery({
    queryKey: queryKeys.activities.getActivities(),
    queryFn: () => activitiesService.getActivities(),
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
    mutationFn: (data: any) => activitiesService.trackActivity(data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.all() });
    },
  });
};

export const useCleanupOldActivities = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => activitiesService.cleanupOldActivities(),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.all() });
    },
  });
};

export const useExportActivities = () => {
  return useQuery({
    queryKey: [...queryKeys.activities.all(), 'export'] as const,
    queryFn: () => activitiesService.exportActivities(),
  });
};

export const useGetActivityHeatmap = () => {
  return useQuery({
    queryKey: queryKeys.activities.getActivityHeatmap(),
    queryFn: () => activitiesService.getActivityHeatmap(),
  });
};

export const useGetProductivityMetrics = () => {
  return useQuery({
    queryKey: queryKeys.activities.getProductivityMetrics(),
    queryFn: () => activitiesService.getProductivityMetrics(),
  });
};

