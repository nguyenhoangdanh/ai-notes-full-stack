/**
 * AI and Chat Types
 */

import { SuggestionType } from './common.types';

export interface AIConversation {
  id: string;
  userId: string;
  noteId?: string;
  title: string;
  messages: AIMessage[];
  context: string[]; // Related note IDs
  totalTokens: number;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface CreateConversationDto {
  title: string;
  noteId?: string;
  context?: string[];
}

export interface SendMessageDto {
  content: string;
  context?: string[];
}

export interface ChatResponse {
  response: string;
  tokens: number;
  conversation: AIConversation;
}

export interface AISuggestion {
  id: string;
  noteId: string;
  type: SuggestionType;
  suggestion: string;
  confidence: number;
  isAccepted?: boolean;
  createdAt: string;
}

export interface AcceptSuggestionDto {
  isAccepted: boolean;
}

export interface GenerateSuggestionsDto {
  types?: SuggestionType[];
}

export interface EmbeddingResponse {
  success: boolean;
  message: string;
}

export interface SemanticSearchDto {
  query: string;
  limit?: number;
  threshold?: number;
  noteIds?: string[];
}

export interface SemanticSearchResult {
  note: {
    id: string;
    title: string;
    content: string;
    tags: string[];
    createdAt: string;
  };
  relevance: number;
  snippet: string;
  chunkContent: string;
  heading?: string;
}