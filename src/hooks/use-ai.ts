import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { aiService } from '../services'
import { queryKeys } from './query-keys'
import type {
  ChatRequest,
  ChatResponse,
  ContentSuggestionRequest,
  ContentSuggestionResponse,
  ApplySuggestionRequest,
  AIConversation,
  ChatMessage,
  DuplicateReport,
  DuplicateStatus,
  RelatedNote,
  AutoSummary,
  SemanticSearchRequest,
  SemanticSearchResult,
} from '../types'

// AI Chat hooks
export function useStreamChat() {
  return useMutation({
    mutationFn: async (request: ChatRequest): Promise<{
      stream: ReadableStream<Uint8Array>
      citations: any[]
    }> => {
      const stream = await aiService.streamChat(request)
      if (!stream) {
        throw new Error('No stream received')
      }
      
      // For now, return empty citations array
      // In a real implementation, citations would come from response headers
      return { stream, citations: [] }
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to start chat stream'
      toast.error(message)
    },
  })
}

export function useCompleteChat() {
  return useMutation({
    mutationFn: (request: ChatRequest) => aiService.completeChat(request),
    onError: (error: any) => {
      const message = error.response?.message || 'Failed to complete chat'
      toast.error(message)
    },
  })
}

// Content suggestions
export function useGenerateSuggestion() {
  return useMutation({
    mutationFn: (request: ContentSuggestionRequest) => aiService.generateSuggestion(request),
    onError: (error: any) => {
      const message = error.response?.message || 'Failed to generate suggestion'
      toast.error(message)
    },
  })
}

export function useApplySuggestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: ApplySuggestionRequest) => aiService.applySuggestion(request),
    onSuccess: (result, variables) => {
      // Invalidate the note to get fresh content
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notes.detail(variables.noteId) 
      })
      
      toast.success('Suggestion applied successfully')
    },
    onError: (error: any) => {
      const message = error.response?.message || 'Failed to apply suggestion'
      toast.error(message)
    },
  })
}

// AI Conversations
export function useAIConversations() {
  return useQuery({
    queryKey: queryKeys.ai.conversations(),
    queryFn: aiService.getConversations,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useAIConversation(conversationId: string) {
  return useQuery({
    queryKey: queryKeys.ai.conversation(conversationId),
    queryFn: () => aiService.getConversation(conversationId),
    enabled: !!conversationId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export function useCreateAIConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ title, noteId }: { title: string; noteId?: string }) =>
      aiService.createConversation(title, noteId),
    onSuccess: (newConversation: AIConversation) => {
      // Add to conversations list
      queryClient.setQueryData(
        queryKeys.ai.conversations(),
        (old: AIConversation[] = []) => [newConversation, ...old]
      )
      
      toast.success('New AI conversation created')
    },
    onError: (error: any) => {
      const message = error.response?.message || 'Failed to create conversation'
      toast.error(message)
    },
  })
}

export function useUpdateAIConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ conversationId, data }: { 
      conversationId: string
      data: { title?: string }
    }) => aiService.updateConversation(conversationId, data),
    onSuccess: (updatedConversation: AIConversation) => {
      // Update conversation cache
      queryClient.setQueryData(
        queryKeys.ai.conversation(updatedConversation.id),
        updatedConversation
      )
      
      // Update in conversations list
      queryClient.setQueryData(
        queryKeys.ai.conversations(),
        (old: AIConversation[] = []) =>
          old.map(conv =>
            conv.id === updatedConversation.id ? updatedConversation : conv
          )
      )
    },
    onError: (error: any) => {
      const message = error.response?.message || 'Failed to update conversation'
      toast.error(message)
    },
  })
}

export function useDeleteAIConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (conversationId: string) => aiService.deleteConversation(conversationId),
    onSuccess: (_, deletedId) => {
      // Remove from conversations list
      queryClient.setQueryData(
        queryKeys.ai.conversations(),
        (old: AIConversation[] = []) => old.filter(conv => conv.id !== deletedId)
      )
      
      // Remove individual conversation cache
      queryClient.removeQueries({ 
        queryKey: queryKeys.ai.conversation(deletedId) 
      })
      
      toast.success('Conversation deleted')
    },
    onError: (error: any) => {
      const message = error.response?.message || 'Failed to delete conversation'
      toast.error(message)
    },
  })
}

// Smart Features - Categories
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all(),
    queryFn: () => aiService.getCategories(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { 
      name: string
      description?: string
      color?: string
      keywords?: string[]
    }) => aiService.createCategory(data),
    onSuccess: (newCategory) => {
      // Add to categories list
      queryClient.setQueryData(
        queryKeys.ai.categories(),
        (old: any[] = []) => [...old, newCategory]
      )
      
      toast.success(`Category "${newCategory.name}" created`)
    },
    onError: (error: any) => {
      const message = error.response?.message || 'Failed to create category'
      toast.error(message)
    },
  })
}

export function useAutoCategorizeNotes() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: aiService.autoCategorizeNotes,
    onSuccess: (result) => {
      // Invalidate notes and categories to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.ai.categories() })
      
      toast.success(`Categorized ${result.categorized} of ${result.processed} notes`)
    },
    onError: (error: any) => {
      const message = error.response?.message || 'Failed to auto-categorize notes'
      toast.error(message)
    },
  })
}

// Smart Features - Duplicates
export function useDuplicateReports() {
  return useQuery({
    queryKey: queryKeys.ai.duplicates(),
    queryFn: aiService.getDuplicateReports,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useDetectDuplicates() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: aiService.detectDuplicates,
    onSuccess: (result) => {
      // Update duplicates cache
      queryClient.setQueryData(queryKeys.ai.duplicates(), result.reports)
      
      toast.success(`Found ${result.found} potential duplicates`)
    },
    onError: (error: any) => {
      const message = error.response?.message || 'Failed to detect duplicates'
      toast.error(message)
    },
  })
}

export function useResolveDuplicate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reportId, status }: { 
      reportId: string
      status: DuplicateStatus 
    }) => aiService.resolveDuplicate(reportId, status),
    onSuccess: (updatedReport: DuplicateReport) => {
      // Update in duplicates list
      queryClient.setQueryData(
        queryKeys.ai.duplicates(),
        (old: DuplicateReport[] = []) =>
          old.map(report =>
            report.id === updatedReport.id ? updatedReport : report
          )
      )
      
      toast.success('Duplicate report resolved')
    },
    onError: (error: any) => {
      const message = error.response?.message || 'Failed to resolve duplicate'
      toast.error(message)
    },
  })
}

// Smart Features - Relations
export function useRelatedNotes(noteId: string) {
  return useQuery({
    queryKey: queryKeys.ai.relations(noteId),
    queryFn: () => aiService.getRelatedNotes(noteId),
    enabled: !!noteId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useDiscoverRelations() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (noteId?: string) => aiService.discoverRelations(noteId),
    onSuccess: (result) => {
      // Invalidate all relations to refresh data
      queryClient.invalidateQueries({ 
        predicate: (query) =>
          query.queryKey[0] === 'ai' && query.queryKey[1] === 'relations'
      })
      
      toast.success(`Discovered ${result.discovered} new relations`)
    },
    onError: (error: any) => {
      const message = error.response?.message || 'Failed to discover relations'
      toast.error(message)
    },
  })
}

// Smart Features - Summaries
export function useNoteSummary(noteId: string) {
  return useQuery({
    queryKey: queryKeys.ai.summary(noteId),
    queryFn: () => aiService.getNoteSummary(noteId),
    enabled: !!noteId,
    staleTime: 30 * 60 * 1000, // 30 minutes (summaries are relatively stable)
    retry: false, // Don't retry if summary doesn't exist
  })
}

export function useGenerateSummary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ noteId, options }: { 
      noteId: string
      options?: { model?: string; maxLength?: number }
    }) => aiService.generateSummary(noteId, options),
    onSuccess: (summary: AutoSummary) => {
      // Cache the summary
      queryClient.setQueryData(queryKeys.ai.summary(summary.noteId), summary)
      
      toast.success('Summary generated successfully')
    },
    onError: (error: any) => {
      const message = error.response?.message || 'Failed to generate summary'
      toast.error(message)
    },
  })
}

// Semantic Search
export function useSemanticSearch() {
  return useMutation({
    mutationFn: (request: SemanticSearchRequest) => aiService.semanticSearch(request),
    onError: (error: any) => {
      const message = error.response?.message || 'Failed to perform semantic search'
      toast.error(message)
    },
  })
}

export function useAdvancedSearch() {
  return useMutation({
    mutationFn: (query: any) => aiService.advancedSearch(query),
    onError: (error: any) => {
      const message = error.response?.message || 'Failed to perform advanced search'
      toast.error(message)
    },
  })
}