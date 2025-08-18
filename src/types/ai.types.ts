/**
 * AI and Chat Types
 */

import { SuggestionType, DuplicateStatus } from './common.types';

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
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  noteContext?: {
    id: string;
    title: string;
  };
}

// Alias for backward compatibility
export interface ChatMessage extends AIMessage {}

export interface CreateConversationDto {
  title: string;
  noteId?: string;
  context?: string[];
}

// Chat related types
export interface ChatRequest {
  conversationId: string;
  message: string;
  context?: string[];
}

export interface ContentSuggestionRequest {
  noteId: string;
  content: string;
  type?: SuggestionType;
}

export interface ContentSuggestionResponse {
  suggestions: AISuggestion[];
  metadata?: any;
}

export interface ApplySuggestionRequest {
  suggestionId: string;
  noteId: string;
}

// Duplicates
export interface DuplicateReport {
  id: string;
  noteId: string;
  duplicateNoteId: string;
  similarity: number;
  status: DuplicateStatus;
  type: 'CONTENT' | 'TITLE' | 'SEMANTIC';
  createdAt: string;
}

// Relations
export interface RelatedNote {
  noteId: string;
  similarity: number;
  type: 'SEMANTIC' | 'CONTEXTUAL' | 'TEMPORAL' | 'REFERENCE';
  note: {
    id: string;
    title: string;
    content: string;
    tags: string[];
  };
}

// Summaries
export interface AutoSummary {
  id: string;
  noteId: string;
  summary: string;
  keyPoints: string[];
  generatedAt: string;
}

// Search
export interface SemanticSearchRequest {
  query: string;
  limit?: number;
  threshold?: number;
  noteIds?: string[];
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