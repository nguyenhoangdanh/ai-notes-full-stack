/**
 * Common API Types and Response Interfaces
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
  pagination?: PaginationResponse;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface SortQuery {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchQuery extends PaginationQuery, SortQuery {
  q?: string;
  filters?: Record<string, any>;
}

// Common Enums
export enum Permission {
  READ = 'READ',
  WRITE = 'WRITE',
  ADMIN = 'ADMIN'
}

export enum NotificationType {
  REMINDER = 'REMINDER',
  COLLABORATION = 'COLLABORATION',
  SYSTEM = 'SYSTEM',
  AI_SUGGESTION = 'AI_SUGGESTION'
}

export enum SuggestionType {
  TAG = 'TAG',
  TITLE = 'TITLE',
  SUMMARY = 'SUMMARY',
  LINK = 'LINK',
  IMPROVEMENT = 'IMPROVEMENT'
}

export enum DuplicateType {
  CONTENT = 'CONTENT',
  TITLE = 'TITLE',
  SEMANTIC = 'SEMANTIC'
}

export enum DuplicateStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DISMISSED = 'DISMISSED',
  MERGED = 'MERGED'
}

export enum RelationType {
  SEMANTIC = 'SEMANTIC',
  CONTEXTUAL = 'CONTEXTUAL',
  TEMPORAL = 'TEMPORAL',
  REFERENCE = 'REFERENCE'
}

export enum PomodoroType {
  WORK = 'WORK',
  SHORT_BREAK = 'SHORT_BREAK',
  LONG_BREAK = 'LONG_BREAK'
}

export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum ExportType {
  SINGLE_NOTE = 'SINGLE_NOTE',
  MULTIPLE_NOTES = 'MULTIPLE_NOTES',
  WORKSPACE = 'WORKSPACE',
  FULL_BACKUP = 'FULL_BACKUP'
}

export enum ExportFormat {
  MARKDOWN = 'MARKDOWN',
  PDF = 'PDF',
  EPUB = 'EPUB',
  HTML = 'HTML',
  DOCX = 'DOCX',
  NOTION = 'NOTION',
  OBSIDIAN = 'OBSIDIAN'
}

export enum ExportStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum TranscriptionStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum SyncAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}

export enum ReviewType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  CUSTOM = 'CUSTOM'
}