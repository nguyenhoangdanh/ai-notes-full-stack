import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exportService } from '../services/export.service';
import { queryKeys } from './query-keys';

/**
 * Export Hooks
 * Generated from backend analysis
 */

export const useDownload = (params: { id: string }) => {
  return useQuery({
    queryKey: [...queryKeys.export.all(), 'download', params.id] as const,
    queryFn: () => exportService.download(params),
  });
};

export const useCreateExport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => exportService.createExport(data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.export.all() });
    },
  });
};

export const useGetUserExports = () => {
  return useQuery({
    queryKey: queryKeys.export.getUserExports(),
    queryFn: () => exportService.getUserExports(),
  });
};

export const useDeleteExport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => exportService.deleteExport({ id }),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.export.all() });
    },
  });
};

export const useGetExportStats = () => {
  return useQuery({
    queryKey: queryKeys.export.getExportStats(),
    queryFn: () => exportService.getExportStats(),
  });
};

export const useQueueNoteExport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, data }: { noteId: string; data: any }) => 
      exportService.queueNoteExport({ noteId }, data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.export.all() });
    },
  });
};

