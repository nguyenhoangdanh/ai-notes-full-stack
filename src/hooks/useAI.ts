/**
 * AI and Chat React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { aiService } from '../services/ai.service';
import { queryKeys } from './query-keys';
import { 
  CreateConversationDto, 
  SendMessageDto, 
  GenerateSuggestionsDto,
  AcceptSuggestionDto,
  SemanticSearchDto,
  AIConversation,
  AISuggestion
} from '../types/ai.types';

export function useConversations(noteId?: string) {
  return useQuery({
    queryKey: queryKeys.ai.conversations(noteId),
    queryFn: () => aiService.getConversations(noteId),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: queryKeys.ai.conversation(id),
    queryFn: () => aiService.getConversation(id),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: aiService.createConversation,
    onSuccess: (newConversation: AIConversation) => {
      // Add to conversations list cache
      queryClient.invalidateQueries({ 
        queryKey: ['ai', 'conversations'] 
      });
      
      // Set the new conversation in cache
      queryClient.setQueryData(
        queryKeys.ai.conversation(newConversation.id),
        newConversation
      );
      
      toast.success('Conversation created!');
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to create conversation');
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, data }: { 
      conversationId: string; 
      data: SendMessageDto 
    }) => aiService.sendMessage(conversationId, data),
    onSuccess: (response, { conversationId }) => {
      // Update the conversation with new messages
      queryClient.setQueryData(
        queryKeys.ai.conversation(conversationId),
        response.conversation
      );
      
      // Refresh conversations list to update last message
      queryClient.invalidateQueries({ 
        queryKey: ['ai', 'conversations'] 
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to send message');
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: aiService.deleteConversation,
    onSuccess: (_, conversationId) => {
      // Remove conversation from cache
      queryClient.removeQueries({ 
        queryKey: queryKeys.ai.conversation(conversationId)
      });
      
      // Refresh conversations list
      queryClient.invalidateQueries({ 
        queryKey: ['ai', 'conversations'] 
      });
      
      toast.success('Conversation deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to delete conversation');
    },
  });
}

export function useSuggestions(noteId: string) {
  return useQuery({
    queryKey: queryKeys.ai.suggestions(noteId),
    queryFn: () => aiService.getSuggestions(noteId),
    enabled: !!noteId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useGenerateSuggestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, data }: { 
      noteId: string; 
      data: GenerateSuggestionsDto 
    }) => aiService.generateSuggestions(noteId, data),
    onSuccess: (suggestions: AISuggestion[], { noteId }) => {
      // Update suggestions cache
      queryClient.setQueryData(
        queryKeys.ai.suggestions(noteId),
        suggestions
      );
      
      toast.success('New suggestions generated!');
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to generate suggestions');
    },
  });
}

export function useUpdateSuggestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: AcceptSuggestionDto 
    }) => aiService.updateSuggestion(id, data),
    onSuccess: (updatedSuggestion: AISuggestion) => {
      // Update suggestions cache
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.ai.suggestions(updatedSuggestion.noteId)
      });
      
      const action = updatedSuggestion.isAccepted ? 'accepted' : 'rejected';
      toast.success(`Suggestion ${action}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to update suggestion');
    },
  });
}

export function useProcessEmbeddings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: aiService.processEmbeddings,
    onSuccess: (_, noteId) => {
      // Invalidate note to refresh embedding status
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notes.byId(noteId)
      });
      
      toast.success('Embeddings processing started');
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to process embeddings');
    },
  });
}

export function useSemanticSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SemanticSearchDto) => aiService.semanticSearch(data),
    onSuccess: (results, variables) => {
      // Cache search results
      queryClient.setQueryData(
        queryKeys.ai.semanticSearch(variables),
        results
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Semantic search failed');
    },
  });
}