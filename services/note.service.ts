/**
 * Notes API Service
 */

import { apiClient } from '../lib/api-client';
import { demoModeService } from './demo.service';
import { 
  Note, 
  CreateNoteDto, 
  UpdateNoteDto, 
  SearchNotesDto,
  SearchResult
} from '../types/note.types';

export const noteService = {
  /**
   * Get all notes for user
   */
  async getAll(workspaceId?: string, limit?: number): Promise<Note[]> {
    if (demoModeService.isDemoMode()) {
      const notes = demoModeService.getDemoNotes();
      return limit ? notes.slice(0, limit) : notes;
    }
    return apiClient.get<Note[]>('/notes', { 
      query: { workspaceId, limit } 
    });
  },

  /**
   * Search notes by query
   */
  async search(params: SearchNotesDto): Promise<SearchResult[]> {
    if (demoModeService.isDemoMode()) {
      const notes = demoModeService.searchDemoNotes(params.q || '');
      return notes.map(note => ({
        note,
        relevanceScore: 1.0,
        snippet: note.content.substring(0, 200) + (note.content.length > 200 ? '...' : ''),
        matchedChunks: []
      }));
    }
    return apiClient.get<SearchResult[]>('/notes/search', { query: params });
  },

  /**
   * Get note by ID
   */
  async getById(id: string): Promise<Note> {
    if (demoModeService.isDemoMode()) {
      return demoModeService.getDemoNote(id);
    }
    return apiClient.get<Note>(`/notes/${id}`);
  },

  /**
   * Create new note
   */
  async create(data: CreateNoteDto): Promise<Note> {
    if (demoModeService.isDemoMode()) {
      return demoModeService.createDemoNote(data);
    }
    return apiClient.post<Note>('/notes', { body: data });
  },

  /**
   * Update note
   */
  async update(id: string, data: UpdateNoteDto): Promise<Note> {
    if (demoModeService.isDemoMode()) {
      return demoModeService.updateDemoNote(id, data);
    }
    return apiClient.patch<Note>(`/notes/${id}`, { body: data });
  },

  /**
   * Delete note
   */
  async delete(id: string): Promise<void> {
    if (demoModeService.isDemoMode()) {
      return demoModeService.deleteDemoNote(id);
    }
    return apiClient.delete<void>(`/notes/${id}`);
  },

  /**
   * Process note for RAG (vector embeddings)
   */
  async processRAG(id: string): Promise<{ message: string }> {
    if (demoModeService.isDemoMode()) {
      return { message: 'Processing started (demo mode)' };
    }
    return apiClient.post<{ message: string }>(`/notes/${id}/process-rag`);
  },

  // Aliases for compatibility
  async getNotes(workspaceId?: string, limit?: number): Promise<Note[]> {
    return this.getAll(workspaceId, limit);
  },

  async getNote(id: string): Promise<Note> {
    return this.getById(id);
  },

  async searchNotes(params: SearchNotesDto): Promise<SearchResult[]> {
    return this.search(params);
  },

  async createNote(data: CreateNoteDto): Promise<Note> {
    return this.create(data);
  },

  async updateNote(id: string, data: UpdateNoteDto): Promise<Note> {
    return this.update(id, data);
  },

  async deleteNote(id: string): Promise<void> {
    return this.delete(id);
  },

  async processForRAG(id: string): Promise<{ message: string }> {
    return this.processRAG(id);
  }
};