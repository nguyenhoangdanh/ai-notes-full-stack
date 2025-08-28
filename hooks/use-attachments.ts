import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attachmentsService } from '../services/attachments.service';
import { queryKeys } from './query-keys';
import { UploadAttachmentRequest } from '@/types/attachments.types';

/**
 * Attachments Hooks
 * Generated from backend analysis
 */

export const useUploadNoteAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, data }: { noteId: string; data: UploadAttachmentRequest }) => 
      attachmentsService.uploadAttachment({ noteId }, data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.attachments.all() });
    },
  });
};

export const useGetNoteAttachments = (params: { noteId: string }) => {
  return useQuery({
    queryKey: queryKeys.attachments.getAttachments(params.noteId),
    queryFn: () => attachmentsService.getAttachments(params),
  });
};

export const useDeleteNoteAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { attachmentId: string }) => attachmentsService.deleteAttachment(params),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.attachments.all() });
    },
  });
};

export const useDownloadAttachment = (params: { attachmentId: string }) => {
  return useQuery({
    queryKey: [...queryKeys.attachments.all(), 'download', params.attachmentId] as const,
    queryFn: () => attachmentsService.downloadAttachment(params),
  });
};

export const useSearchAttachments = (params: { query: string }) => {
  return useQuery({
    queryKey: queryKeys.attachments.searchAttachments(params.query),
    queryFn: () => attachmentsService.searchAttachments(params),
  });
};

export const useGetAttachmentAnalytics = (query?: { days?: string }) => {
  return useQuery({
    queryKey: queryKeys.attachments.getAttachmentAnalytics(query),
    queryFn: () => attachmentsService.getAttachmentAnalytics(query),
  });
};

export const useRequestOCR = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ attachmentId, data }: { attachmentId: string; data: any }) => 
      attachmentsService.requestOCR({ attachmentId }, data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.attachments.all() });
    },
  });
};

export const useGetSupportedTypes = () => {
  return useQuery({
    queryKey: queryKeys.attachments.getSupportedTypes(),
    queryFn: () => attachmentsService.getSupportedTypes(),
  });
};

