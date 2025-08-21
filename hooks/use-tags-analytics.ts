import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { tagsService, analyticsService } from '../services';
import { queryKeys } from './query-keys';
import type {
  Tag,
  CreateTagDto,
  UpdateTagDto,
  TagHierarchy,
  TagAnalytics,
  BulkTagOperation,
  AnalyticsOverview,
  WorkspaceAnalytics,
  ContentAnalytics,
} from '../types';

// Tags Hooks
export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => tagsService.getTags(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTagHierarchy() {
  return useQuery({
    queryKey: ['tags', 'hierarchy'],
    queryFn: () => tagsService.getTagHierarchy(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useTagAnalytics() {
  return useQuery({
    queryKey: ['tags', 'analytics'],
    queryFn: () => tagsService.getTagAnalytics(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useTagSuggestions(noteId: string) {
  return useQuery({
    queryKey: ['tags', 'suggestions', noteId],
    queryFn: () => tagsService.suggestTags(noteId),
    enabled: !!noteId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useTagSuggestionHistory() {
  return useQuery({
    queryKey: ['tags', 'suggestions', 'history'],
    queryFn: () => tagsService.getTagSuggestionHistory(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Tags Mutations
export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTagDto) => tagsService.createTag(data),
    onSuccess: (newTag: Tag) => {
      // Add to tags list
      queryClient.setQueryData(['tags'], (old: Tag[] = []) => [newTag, ...old]);
      
      // Invalidate hierarchy to update parent-child relationships
      queryClient.invalidateQueries({ queryKey: ['tags', 'hierarchy'] });
      queryClient.invalidateQueries({ queryKey: ['tags', 'analytics'] });
      
      toast.success(`Tag "${newTag.name}" created successfully`);
    },
    onError: (error: any) => {
      const message = error?.response?.message || 'Failed to create tag';
      toast.error(message);
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tagId, data }: { tagId: string; data: UpdateTagDto }) =>
      tagsService.updateTag(tagId, data),
    onSuccess: (updatedTag: Tag) => {
      // Update in tags list
      queryClient.setQueryData(['tags'], (old: Tag[] = []) =>
        old.map(tag => tag.id === updatedTag.id ? updatedTag : tag)
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['tags', 'hierarchy'] });
      queryClient.invalidateQueries({ queryKey: ['tags', 'analytics'] });
      
      toast.success(`Tag "${updatedTag.name}" updated successfully`);
    },
    onError: (error: any) => {
      const message = error?.response?.message || 'Failed to update tag';
      toast.error(message);
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tagId: string) => tagsService.deleteTag(tagId),
    onSuccess: (_, deletedId) => {
      // Remove from tags list
      queryClient.setQueryData(['tags'], (old: Tag[] = []) =>
        old.filter(tag => tag.id !== deletedId)
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['tags', 'hierarchy'] });
      queryClient.invalidateQueries({ queryKey: ['tags', 'analytics'] });
      
      toast.success('Tag deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.message || 'Failed to delete tag';
      toast.error(message);
    },
  });
}

export function useBulkTagOperation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (operation: BulkTagOperation) => tagsService.bulkOperation(operation),
    onSuccess: (_, operation) => {
      // Invalidate all tag-related queries
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      
      const actionMessage = {
        merge: 'Tags merged successfully',
        delete: 'Tags deleted successfully',
        rename: 'Tags renamed successfully'
      }[operation.action];
      
      toast.success(actionMessage);
    },
    onError: (error: any) => {
      const message = error?.response?.message || 'Bulk operation failed';
      toast.error(message);
    },
  });
}

export function useExportTags() {
  return useMutation({
    mutationFn: () => tagsService.exportTags(),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `tags-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Tags exported successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.message || 'Failed to export tags';
      toast.error(message);
    },
  });
}

export function useImportTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => tagsService.importTags(file),
    onSuccess: (result) => {
      // Invalidate all tag-related queries
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      
      toast.success(`Imported ${result.imported} tags${result.skipped > 0 ? `, skipped ${result.skipped}` : ''}`);
    },
    onError: (error: any) => {
      const message = error?.response?.message || 'Failed to import tags';
      toast.error(message);
    },
  });
}

// Analytics Hooks
export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => analyticsService.getOverview(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useWorkspaceAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'workspaces'],
    queryFn: () => analyticsService.getWorkspaceAnalytics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useContentAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'content'],
    queryFn: () => analyticsService.getContentAnalytics(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useTrackNoteAction() {
  return useMutation({
    mutationFn: ({ noteId, action }: { noteId: string; action: 'view' | 'edit' | 'share' }) =>
      analyticsService.trackNoteAction(noteId, action),
    // No success/error toasts for tracking actions as they should be silent
  });
}