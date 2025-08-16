import { getApiClient } from '../lib/api-client'
import type {
  ChatRequest,
  ChatResponse,
  ContentSuggestionRequest,
  ContentSuggestionResponse,
  ApplySuggestionRequest,
  ApplySuggestionResponse,
  AIConversation,
  ChatMessage,
  AISuggestion,
  DuplicateReport,
  DuplicateStatus,
  RelatedNote,
  AutoSummary,
  SemanticSearchRequest,
  SemanticSearchResult,
} from '../types'

export const aiService = {
  // Chat endpoints
  async streamChat(request: ChatRequest): Promise<ReadableStream<Uint8Array> | null> {
    return getApiClient().stream('/chat/stream', { body: request })
  },

  async completeChat(request: ChatRequest): Promise<ChatResponse> {
    return getApiClient().post<ChatResponse>('/chat/complete', { body: request })
  },

  // Content suggestions
  async generateSuggestion(request: ContentSuggestionRequest): Promise<ContentSuggestionResponse> {
    return getApiClient().post<ContentSuggestionResponse>('/chat/suggest', { body: request })
  },

  async applySuggestion(request: ApplySuggestionRequest): Promise<ApplySuggestionResponse> {
    return getApiClient().post<ApplySuggestionResponse>('/chat/apply-suggestion', { body: request })
  },

  // AI Conversations management
  async getConversations(): Promise<AIConversation[]> {
    return getApiClient().get<AIConversation[]>('/ai/conversations')
  },

  async getConversation(conversationId: string): Promise<AIConversation> {
    return getApiClient().get<AIConversation>(`/ai/conversations/${conversationId}`)
  },

  async createConversation(title: string, noteId?: string): Promise<AIConversation> {
    return getApiClient().post<AIConversation>('/ai/conversations', {
      body: { title, noteId }
    })
  },

  async updateConversation(conversationId: string, data: { title?: string }): Promise<AIConversation> {
    return getApiClient().patch<AIConversation>(`/ai/conversations/${conversationId}`, {
      body: data
    })
  },

  async deleteConversation(conversationId: string): Promise<void> {
    return getApiClient().delete<void>(`/ai/conversations/${conversationId}`)
  },

  async addMessageToConversation(conversationId: string, message: Omit<ChatMessage, 'timestamp'>): Promise<AIConversation> {
    return getApiClient().post<AIConversation>(`/ai/conversations/${conversationId}/messages`, {
      body: message
    })
  },

  // Smart features - Categories
  async getCategories(): Promise<any[]> {
    return getApiClient().get<any[]>('/smart/categories')
  },

  async createCategory(data: { name: string; description?: string; color?: string; keywords?: string[] }): Promise<any> {
    return getApiClient().post('/smart/categories', { body: data })
  },

  async updateCategory(categoryId: string, data: any): Promise<any> {
    return getApiClient().patch(`/smart/categories/${categoryId}`, { body: data })
  },

  async deleteCategory(categoryId: string): Promise<void> {
    return getApiClient().delete<void>(`/smart/categories/${categoryId}`)
  },

  async autoCategorizeNotes(): Promise<{ processed: number; categorized: number }> {
    return getApiClient().post('/smart/categories/auto-categorize')
  },

  // Smart features - Duplicates
  async getDuplicateReports(): Promise<DuplicateReport[]> {
    return getApiClient().get<DuplicateReport[]>('/smart/duplicates')
  },

  async detectDuplicates(): Promise<{ found: number; reports: DuplicateReport[] }> {
    return getApiClient().post('/smart/duplicates/detect')
  },

  async resolveDuplicate(reportId: string, status: DuplicateStatus): Promise<DuplicateReport> {
    return getApiClient().patch<DuplicateReport>(`/smart/duplicates/${reportId}`, {
      body: { status }
    })
  },

  async mergeDuplicates(reportId: string, keepOriginal: boolean): Promise<{ mergedNote: any }> {
    return getApiClient().post(`/smart/duplicates/${reportId}/merge`, {
      body: { keepOriginal }
    })
  },

  // Smart features - Relations
  async getRelatedNotes(noteId: string): Promise<RelatedNote[]> {
    return getApiClient().get<RelatedNote[]>(`/smart/relations/${noteId}`)
  },

  async discoverRelations(noteId?: string): Promise<{ discovered: number; relations: RelatedNote[] }> {
    return getApiClient().post('/smart/relations/discover', {
      body: noteId ? { noteId } : undefined
    })
  },

  async removeRelation(relationId: string): Promise<void> {
    return getApiClient().delete<void>(`/smart/relations/${relationId}`)
  },

  // Smart features - Summaries
  async getNoteSummary(noteId: string): Promise<AutoSummary> {
    return getApiClient().get<AutoSummary>(`/smart/summaries/${noteId}`)
  },

  async generateSummary(noteId: string, options?: { model?: string; maxLength?: number }): Promise<AutoSummary> {
    return getApiClient().post<AutoSummary>(`/smart/summaries/${noteId}`, {
      body: options
    })
  },

  async deleteSummary(noteId: string): Promise<void> {
    return getApiClient().delete<void>(`/smart/summaries/${noteId}`)
  },

  // Advanced search
  async semanticSearch(request: SemanticSearchRequest): Promise<SemanticSearchResult[]> {
    return getApiClient().post<SemanticSearchResult[]>('/search/semantic', { body: request })
  },

  async advancedSearch(query: {
    q?: string
    filters?: Record<string, any>
    sort?: { field: string; order: 'asc' | 'desc' }
    limit?: number
    offset?: number
  }): Promise<any[]> {
    return getApiClient().get('/search', { query })
  },

  // AI Suggestions
  async getNoteSuggestions(noteId: string): Promise<AISuggestion[]> {
    return getApiClient().get<AISuggestion[]>(`/ai/suggestions/notes/${noteId}`)
  },

  async acceptSuggestion(suggestionId: string): Promise<AISuggestion> {
    return getApiClient().post<AISuggestion>(`/ai/suggestions/${suggestionId}/accept`)
  },

  async rejectSuggestion(suggestionId: string): Promise<AISuggestion> {
    return getApiClient().post<AISuggestion>(`/ai/suggestions/${suggestionId}/reject`)
  },
}