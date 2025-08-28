/**
 * AI and Chat Types
 */

import { SuggestionType, DuplicateStatus } from "./common.types";

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
  role: "user" | "assistant" | "system";
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

// Chat DTOs to match backend
export interface ChatQueryDto {
  query: string;
  model?: string;
  maxTokens?: number;
}

export interface GenerateSuggestionDto {
  content: string;
  selectedText?: string;
  suggestionType:
    | "improve"
    | "expand"
    | "summarize"
    | "restructure"
    | "examples"
    | "grammar"
    | "translate";
  targetLanguage?: string;
}

export interface GenerateSuggestionResponse {
  originalText: string;
  suggestion: string;
  type: string;
  hasSelection: boolean;
}

export interface ApplySuggestionDto {
  noteId: string;
  originalContent: string;
  suggestion: string;
  selectedText?: string;
  applyType: "replace" | "append" | "insert";
  position?: number;
}

export interface ApplySuggestionResponse {
  newContent: string;
  applied: boolean;
  type: "replace" | "append" | "insert";
}

export interface ChatRequest {
  conversationId: string;
  message: string;
  context?: string[];
}

export interface ContentSuggestionRequest {
  noteId: string;
  content: string;
  type?: SuggestionType;
  context?: {
    noteId: string;
    title: string;
    tags: string[];
  };
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
  type: "CONTENT" | "TITLE" | "SEMANTIC";
  createdAt: string;
}

// Relations
export interface RelatedNote {
  noteId: string;
  similarity: number;
  type: "SEMANTIC" | "CONTEXTUAL" | "TEMPORAL" | "REFERENCE";
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

// Search - add the missing alias
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
}

export interface SemanticSearchResult {
  id: string;
  noteId: string;
  chunkId: string;
  chunkContent: string;
  chunkIndex: number;
  heading: string;
  embedding: number[];
  ownerId: string;
  createdAt: Date;
  noteTitle: string;
  similarity: number;
}
