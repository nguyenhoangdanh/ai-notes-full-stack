/**
 * Notes API Service
 */

import { apiClient } from '../lib/api-client';
import { 
  Note, 
  CreateNoteDto, 
  UpdateNoteDto, 
  SearchNotesDto, 
  NoteWithAnalytics,
  NoteVersion,
  ProcessRAGResponse,
  SearchResult
} from '../types/note.types';

export const noteService = {
  /**
   * Get all notes for user
   */
  async getAll(workspaceId?: string, limit?: number): Promise<Note[]> {
    return apiClient.get<Note[]>('/notes', { 
      query: { workspaceId, limit } 
    });
  },

  /**
   * Search notes by query
   */
  async search(params: SearchNotesDto): Promise<SearchResult[]> {
    return apiClient.get<SearchResult[]>('/notes/search', { query: params });
  },

  /**
   * Get note by ID
   */
  async getById(id: string): Promise<Note> {
    return apiClient.get<Note>(`/notes/${id}`);
  },

  /**
   * Get note with analytics
   */
  async getWithAnalytics(id: string): Promise<NoteWithAnalytics> {
    return apiClient.get<NoteWithAnalytics>(`/notes/${id}/analytics`);
  },

  /**
   * Create new note
   */
  async create(data: CreateNoteDto): Promise<Note> {
    return apiClient.post<Note>('/notes', { body: data });
  },

  /**
   * Update note
   */
  async update(id: string, data: UpdateNoteDto): Promise<Note> {
    return apiClient.patch<Note>(`/notes/${id}`, { body: data });
  },

  /**
   * Delete note
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/notes/${id}`);
  },

  /**
   * Process note for RAG (vector embeddings)
   */
  async processForRAG(id: string): Promise<ProcessRAGResponse> {
    return apiClient.post<ProcessRAGResponse>(`/notes/${id}/process-rag`);
  },

  /**
   * Get note versions
   */
  async getVersions(id: string): Promise<NoteVersion[]> {
    return apiClient.get<NoteVersion[]>(`/notes/${id}/versions`);
  },

  /**
   * Restore note version
   */
  async restoreVersion(id: string, version: number): Promise<Note> {
    return apiClient.post<Note>(`/notes/${id}/restore/${version}`);
  }
};