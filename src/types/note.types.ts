/**
 * Note Types
 */

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  workspaceId: string;
  ownerId: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteDto {
  title: string;
  content: string;
  tags: string[];
  workspaceId: string;
}

export interface UpdateNoteDto {
  title?: string;
  content?: string;
  tags?: string[];
  workspaceId?: string;
}

export interface SearchNotesDto {
  q: string;
  limit?: number;
}

export interface NoteWithAnalytics extends Note {
  analytics?: NoteAnalytics;
}

export interface NoteAnalytics {
  id: string;
  noteId: string;
  viewCount: number;
  editCount: number;
  shareCount: number;
  lastViewed?: string;
  lastEdited?: string;
  readingTime?: number;
  wordCount: number;
  updatedAt: string;
}

export interface NoteVersion {
  id: string;
  noteId: string;
  version: number;
  title: string;
  content: string;
  changeLog?: string;
  createdBy: string;
  createdAt: string;
}

export interface Vector {
  id: string;
  noteId: string;
  chunkId: string;
  chunkContent: string;
  chunkIndex: number;
  heading?: string;
  embedding: number[];
  ownerId: string;
  createdAt: string;
}

export interface SearchResult {
  note: Note;
  relevanceScore: number;
  snippet: string;
  matchedChunks: string[];
}

export interface ProcessRAGResponse {
  message: string;
}