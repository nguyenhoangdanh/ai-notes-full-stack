import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { 
  tagsService, 
  analyticsService,
  type Tag,
  type CreateTagDto,
  type UpdateTagDto,
  type TagHierarchy,
  type TagAnalytics,
  type BulkTagOperation
} from '../services/tags-analytics.service'
import { queryKeys } from './query-keys'
import type {
  AdvancedAnalyticsOverview as AnalyticsOverview,
  AdvancedWorkspaceAnalytics as WorkspaceAnalytics,
  AdvancedContentAnalytics as ContentAnalytics
} from '../types'
import type { TrackNoteActionDto } from '../types/misc.types'

// =============================================================================
// TAGS HOOKS
// =============================================================================

/**
 * Get all user tags
 */
export function useTags() {
  return useQuery({
    queryKey: queryKeys.tags.all(),
    queryFn: tagsService.getTags,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get tag hierarchy
 */
export function useTagHierarchy() {
  return useQuery({
    queryKey: queryKeys.tags.hierarchy(),
    queryFn: tagsService.getTagHierarchy,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Get tag analytics
 */
export function useTagAnalytics() {
  return useQuery({
    queryKey: queryKeys.tags.analytics(),
    queryFn: tagsService.getTagAnalytics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get tag suggestion history
 */
export function useTagSuggestionHistory() {
  return useQuery({
    queryKey: queryKeys.tags.suggestionHistory(),
    queryFn: tagsService.getTagSuggestionHistory,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Suggest tags for a note
 */
export function useTagSuggestions(noteId: string) {
  return useQuery({
    queryKey: queryKeys.tags.suggestions(noteId),
    queryFn: () => tagsService.suggestTags(noteId),
    enabled: !!noteId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Create a new tag
 */
export function useCreateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTagDto) => tagsService.createTag(data),
    onSuccess: (newTag: Tag) => {
      queryClient.setQueryData(
        queryKeys.tags.all(),
        (old: Tag[] = []) => [...old, newTag]
      )
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.hierarchy() })
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.analytics() })
      toast.success(`Tag "${newTag.name}" created`)
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to create tag')
    },
  })
}

/**
 * Update tag
 */
export function useUpdateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tagId, data }: { tagId: string; data: UpdateTagDto }) =>
      tagsService.updateTag(tagId, data),
    onSuccess: (updatedTag: Tag) => {
      queryClient.setQueryData(
        queryKeys.tags.all(),
        (old: Tag[] = []) =>
          old.map(tag => tag.id === updatedTag.id ? updatedTag : tag)
      )
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.hierarchy() })
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.analytics() })
      toast.success('Tag updated')
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to update tag')
    },
  })
}

/**
 * Delete tag
 */
export function useDeleteTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (tagId: string) => tagsService.deleteTag(tagId),
    onSuccess: (_: any, tagId: string) => {
      queryClient.setQueryData(
        queryKeys.tags.all(),
        (old: Tag[] = []) => old.filter(tag => tag.id !== tagId)
      )
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.hierarchy() })
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.analytics() })
      toast.success('Tag deleted')
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to delete tag')
    },
  })
}

/**
 * Bulk tag operations
 */
export function useBulkTagOperation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (operation: BulkTagOperation) => tagsService.bulkOperation(operation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.hierarchy() })
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.analytics() })
      toast.success('Bulk operation completed')
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to complete bulk operation')
    },
  })
}

// =============================================================================
// ANALYTICS HOOKS
// =============================================================================

/**
 * Get analytics overview
 */
export function useAnalyticsOverview() {
  return useQuery({
    queryKey: queryKeys.analytics.getUserAnalytics(),
    queryFn: analyticsService.getOverview,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Get workspace analytics
 */
export function useWorkspaceAnalytics() {
  return useQuery({
    queryKey: queryKeys.analytics.getWorkspaceAnalytics(),
    queryFn: analyticsService.getWorkspaceAnalytics,
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

/**
 * Get content analytics
 */
export function useContentAnalytics() {
  return useQuery({
    queryKey: queryKeys.analytics.getContentAnalytics(),
    queryFn: analyticsService.getContentAnalytics,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Track note action
 */
export function useTrackNoteAction() {
  return useMutation({
    mutationFn: ({ noteId, data }: { noteId: string; data: TrackNoteActionDto }) =>
      analyticsService.trackNoteAction(noteId, data),
    onError: (error: any) => {
      // Silent fail for analytics tracking
      console.warn('Failed to track note action:', error)
    },
  })
}