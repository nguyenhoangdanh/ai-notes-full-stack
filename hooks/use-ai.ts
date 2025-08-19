import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { aiService } from '../services'
import { queryKeys } from './query-keys'
import type {
  ChatRequest,
  ContentSuggestionRequest,
  ApplySuggestionRequest,
  SemanticSearchDto,
  SemanticSearchResult
} from '../types'

// AI Chat hooks
export function useStreamChat() {
  return useMutation({
    mutationFn: async (request: ChatRequest): Promise<{
      stream: ReadableStream<Uint8Array>
      citations: any[]
    }> => {
      const stream = await aiService.streamChat({
        query: request.message,
        // Note: conversationId and context are not supported by current backend
      })
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
    mutationFn: (request: ChatRequest) => aiService.completeChat({
      query: request.message,
      // Note: conversationId and context are not supported by current backend  
    }),
    onError: (error: any) => {
      const message = error.response?.message || 'Failed to complete chat'
      toast.error(message)
    },
  })
}

export function useGenerateSuggestion() {
  return useMutation({
    mutationFn: (request: ContentSuggestionRequest) => aiService.getSuggestions({
      content: request.content,
      suggestionType: request.type as any || 'improve',
      targetLanguage: undefined // Not supported in current frontend request type
    }),
    onError: (error: any) => {
      const message = error.response?.message || 'Failed to generate suggestion'
      toast.error(message)
    },
  })
}

export function useApplySuggestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: ApplySuggestionRequest): Promise<{ updatedContent: string }> => {
      // The frontend and backend use different APIs for this functionality
      // For now, throw an error indicating this needs to be implemented
      throw new Error('Apply suggestion feature needs to be updated to match backend API');
    },
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

// Semantic Search
export function useSemanticSearch() {
  return useMutation({
    mutationFn: (params: SemanticSearchDto): Promise<SemanticSearchResult[]> => 
      aiService.semanticSearch(params),
    onError: (error: any) => {
      const message = error.response?.message || 'Search failed'
      toast.error(message)
    },
  })
}