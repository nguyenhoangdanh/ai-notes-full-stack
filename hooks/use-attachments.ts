import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attachmentsService } from '../services/attachments.service';
import { queryKeys } from './query-keys';

/**
 * Attachments Hooks
 * Generated from backend analysis
 */

export const useUploadNoteAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ params, data }: { params: { noteId: string }, data: any }) => attachmentsService.uploadAttachment(params, data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.attachments.all });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.attachments.all });
    },
  });
};

export const useDownloadAttachment = (params: { attachmentId: string }) => {
  return useQuery({
    queryKey: queryKeys.attachments.downloadAttachment(params.attachmentId),
    queryFn: () => attachmentsService.downloadAttachment(params),
  });
};

export const useSearchAttachments = (params: { query: string }) => {
  return useQuery({
    queryKey: queryKeys.attachments.searchAttachments(params.query),
    queryFn: () => attachmentsService.searchAttachments(params),
  });
};

export const useGetAttachmentAnalytics = () => {
  return useQuery({
    queryKey: queryKeys.attachments.getAttachmentAnalytics(),
    queryFn: () => attachmentsService.getAttachmentAnalytics(),
  });
};

export const useRequestOCR = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ params: { attachmentId: string }, data: any }) => attachmentsService.requestOCR(params, data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.attachments.all });
    },
  });
};

export const useGetSupportedTypes = () => {
  return useQuery({
    queryKey: queryKeys.attachments.getSupportedTypes(),
    queryFn: () => attachmentsService.getSupportedTypes(),
  });
};

