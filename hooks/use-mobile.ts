import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { mobileService } from '../services/mobile.service';
import { queryKeys } from './query-keys';

/**
 * Mobile Hooks
 * Generated from backend analysis
 */

// Mobile detection hook
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const userAgent = navigator.userAgent;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      return mobileRegex.test(userAgent) || window.innerWidth < 768;
    };

    setIsMobile(checkIsMobile());

    const handleResize = () => {
      setIsMobile(checkIsMobile());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

export const useStartRecording = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data: any }) => mobileService.startRecording(data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.mobile.all() });
    },
  });
};

export const useStopRecording = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data: any }) => mobileService.stopRecording(data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.mobile.all() });
    },
  });
};

export const useGetVoiceNotes = () => {
  return useQuery({
    queryKey: queryKeys.mobile.getVoiceNotes(),
    queryFn: () => mobileService.getVoiceNotes(),
  });
};

export const useTranscribeVoiceNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ params: { id: string }, data: any }) => mobileService.transcribeVoiceNote(params, data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.mobile.all() });
    },
  });
};

export const useCreateLocationNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data: any }) => mobileService.createLocationNote(data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.mobile.all() });
    },
  });
};

export const useGetNearbyNotes = () => {
  return useQuery({
    queryKey: queryKeys.mobile.getNearbyNotes(),
    queryFn: () => mobileService.getNearbyNotes(),
  });
};

export const useSyncOfflineData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data: any }) => mobileService.syncOfflineData(data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.mobile.all() });
    },
  });
};

export const useGetSyncStatus = () => {
  return useQuery({
    queryKey: queryKeys.mobile.getSyncStatus(),
    queryFn: () => mobileService.getSyncStatus(),
  });
};

