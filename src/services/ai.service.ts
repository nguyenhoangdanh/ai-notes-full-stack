/**
 * AI and Chat API Service
 */

import { apiClient } from '../lib/api-client';
import { 
  AIConversation,
  CreateConversationDto,
  SendMessageDto,
  ChatResponse,
  AISuggestion,
  AcceptSuggestionDto,
  GenerateSuggestionsDto,
  EmbeddingResponse,
  SemanticSearchDto,
  SemanticSearchResult
} from '../types/ai.types';

export const aiService = {
  /**
   * Get all conversations for user
   */
  async getConversations(noteId?: string): Promise<AIConversation[]> {
    return apiClient.get<AIConversation[]>('/chat/conversations', {
      query: noteId ? { noteId } : undefined
    });
  },

  /**
   * Get conversation by ID
   */
  async getConversation(id: string): Promise<AIConversation> {
    return apiClient.get<AIConversation>(`/chat/conversations/${id}`);
  },

  /**
   * Create new conversation
   */
  async createConversation(data: CreateConversationDto): Promise<AIConversation> {
    return apiClient.post<AIConversation>('/chat/conversations', { body: data });
  },

  /**
   * Send message to conversation
   */
  async sendMessage(conversationId: string, data: SendMessageDto): Promise<ChatResponse> {
    return apiClient.post<ChatResponse>(`/chat/conversations/${conversationId}/messages`, { body: data });
  },

  /**
   * Delete conversation
   */
  async deleteConversation(id: string): Promise<void> {
    return apiClient.delete<void>(`/chat/conversations/${id}`);
  },

  /**
   * Get AI suggestions for note
   */
  async getSuggestions(noteId: string): Promise<AISuggestion[]> {
    return apiClient.get<AISuggestion[]>(`/chat/suggestions/${noteId}`);
  },

  /**
   * Generate new suggestions for note
   */
  async generateSuggestions(noteId: string, data: GenerateSuggestionsDto): Promise<AISuggestion[]> {
    return apiClient.post<AISuggestion[]>(`/chat/suggestions/${noteId}`, { body: data });
  },

  /**
   * Accept or reject suggestion
   */
  async updateSuggestion(id: string, data: AcceptSuggestionDto): Promise<AISuggestion> {
    return apiClient.patch<AISuggestion>(`/chat/suggestions/${id}`, { body: data });
  },

  /**
   * Process embeddings for note
   */
  async processEmbeddings(noteId: string): Promise<EmbeddingResponse> {
    return apiClient.post<EmbeddingResponse>(`/chat/embeddings/${noteId}`);
  },

  /**
   * Perform semantic search
   */
  async semanticSearch(data: SemanticSearchDto): Promise<SemanticSearchResult[]> {
    return apiClient.post<SemanticSearchResult[]>('/search/semantic', { body: data });
  }
};