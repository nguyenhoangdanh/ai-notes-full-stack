/**
 * AI and Chat API Service
 */

import { apiClient } from '../lib/api-client';
import { 
  ChatQueryDto,
  GenerateSuggestionDto,
  ApplySuggestionDto,
  SemanticSearchDto,
  SemanticSearchResult
} from '../types/ai.types';

export const aiService = {
  /**
   * Stream chat response (returns a stream)
   */
  async streamChat(data: ChatQueryDto): Promise<ReadableStream> {
    // Note: This endpoint returns a stream, not JSON
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add auth headers here if needed
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to start chat stream');
    }
    
    return response.body!;
  },

  /**
   * Get complete chat response
   */
  async completeChat(data: ChatQueryDto): Promise<{ response: string }> {
    return apiClient.post<{ response: string }>('/chat/complete', { body: data });
  },

  /**
   * Generate content suggestions
   */
  async getSuggestions(data: GenerateSuggestionDto): Promise<{ suggestion: string }> {
    return apiClient.post<{ suggestion: string }>('/chat/suggest', { body: data });
  },

  /**
   * Apply content suggestion
   */
  async applySuggestion(data: ApplySuggestionDto): Promise<{ updatedContent: string }> {
    return apiClient.post<{ updatedContent: string }>('/chat/apply-suggestion', { body: data });
  },

  /**
   * Perform semantic search
   */
  async semanticSearch(data: SemanticSearchDto): Promise<SemanticSearchResult[]> {
    return apiClient.post<SemanticSearchResult[]>('/vectors/semantic-search', { body: data });
  },

  // Aliases for compatibility
  async generateSuggestion(
    content: string,
    selectedText?: string,
    suggestionType: string = 'improve',
    targetLanguage?: string
  ): Promise<{ suggestion: string }> {
    return this.getSuggestions({
      content,
      selectedText,
      suggestionType: suggestionType as any,
      targetLanguage
    });
  }
};