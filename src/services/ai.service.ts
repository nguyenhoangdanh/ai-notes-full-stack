/**
 * AI and Smart Features API Service
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
  },

  /**
   * Auto-categorize notes with AI
   */
  async categorizeNotes(noteId?: string): Promise<any> {
    return apiClient.post('/categories/auto-categorize' + (noteId ? `/${noteId}` : ''), {
      body: { threshold: 0.7 }
    });
  },

  /**
   * Get duplicate detection reports
   */
  async getDuplicateReports(): Promise<any[]> {
    return apiClient.get('/duplicates/reports');
  },

  /**
   * Detect duplicates
   */
  async detectDuplicates(noteId?: string): Promise<any> {
    return apiClient.get('/duplicates/detect', {
      query: noteId ? { noteId, threshold: 0.7 } : { threshold: 0.7 }
    });
  },

  /**
   * Resolve duplicate report
   */
  async resolveDuplicate(reportId: string, status: 'CONFIRMED' | 'DISMISSED' | 'MERGED'): Promise<any> {
    return apiClient.patch(`/duplicates/reports/${reportId}`, {
      body: { status }
    });
  },

  /**
   * Get related notes
   */
  async getRelatedNotes(noteId: string): Promise<any[]> {
    return apiClient.get(`/relations/notes/${noteId}`);
  },

  /**
   * Discover note relations
   */
  async discoverRelations(noteId?: string): Promise<any> {
    return apiClient.post('/relations/discover', {
      body: noteId ? { noteId } : {}
    });
  },

  /**
   * Get note summary
   */
  async getNoteSummary(noteId: string): Promise<any> {
    return apiClient.get(`/summaries/notes/${noteId}`);
  },

  /**
   * Generate summary for note
   */
  async generateSummary(noteId: string, options: any = {}): Promise<any> {
    return apiClient.post(`/summaries/notes/${noteId}`, { body: options });
  },

  /**
   * Advanced search with AI
   */
  async advancedSearch(query: any): Promise<any> {
    return apiClient.post('/search/advanced', { body: query });
  },

  /**
   * Stream chat response
   */
  async streamChat(request: any): Promise<ReadableStream> {
    // This would return a ReadableStream for streaming responses
    throw new Error('Streaming not implemented in this demo');
  },

  /**
   * Complete chat (non-streaming)
   */
  async completeChat(request: any): Promise<any> {
    return apiClient.post('/chat/complete', { body: request });
  },

  /**
   * Generate single suggestion
   */
  async generateSuggestion(request: any): Promise<any> {
    return this.generateSuggestions(request.noteId, request);
  },

  /**
   * Apply AI suggestion
   */
  async applySuggestion(request: any): Promise<any> {
    return apiClient.post('/suggestions/apply', { body: request });
  },

  /**
   * Update conversation
   */
  async updateConversation(conversationId: string, data: any): Promise<any> {
    return apiClient.patch(`/conversations/${conversationId}`, { body: data });
  },

  /**
   * Get categories for auto-categorization
   */
  async getCategories(): Promise<any[]> {
    return apiClient.get('/categories');
  },

  /**
   * Create new category
   */
  async createCategory(data: any): Promise<any> {
    return apiClient.post('/categories', { body: data });
  },

  /**
   * Auto-categorize notes (alias for categorizeNotes)
   */
  async autoCategorizeNotes(noteId?: string): Promise<any> {
    return this.categorizeNotes(noteId);
  }
};