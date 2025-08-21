/**
 * Voice Notes API Service
 */

import { apiClient } from '../lib/api-client';

export interface VoiceNote {
  id: string;
  noteId?: string;
  filename: string;
  duration: number;
  transcription?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVoiceNoteDto {
  noteId?: string;
  title?: string;
  description?: string;
}

export interface UpdateVoiceNoteDto {
  noteId?: string;
  title?: string;
  description?: string;
}

export interface VoiceNoteStats {
  totalNotes: number;
  totalDuration: number;
  transcribedNotes: number;
  recentNotes: number;
}

export const voiceNotesService = {
  /**
   * Upload voice note
   */
  async uploadVoiceNote(file: File, data?: CreateVoiceNoteDto): Promise<VoiceNote> {
    const formData = new FormData();
    formData.append('audio', file);
    if (data?.noteId) formData.append('noteId', data.noteId);
    if (data?.title) formData.append('title', data.title);
    if (data?.description) formData.append('description', data.description);

    return apiClient.post<VoiceNote>('/mobile/voice-notes/upload', { 
      body: formData,
      headers: {} // Remove Content-Type to let browser set it for FormData
    });
  },

  /**
   * Create voice note (metadata only)
   */
  async createVoiceNote(data: CreateVoiceNoteDto): Promise<VoiceNote> {
    return apiClient.post<VoiceNote>('/mobile/voice-notes', { body: data });
  },

  /**
   * Get all voice notes
   */
  async getVoiceNotes(): Promise<VoiceNote[]> {
    return apiClient.get<VoiceNote[]>('/mobile/voice-notes');
  },

  /**
   * Get voice note statistics
   */
  async getVoiceNoteStats(): Promise<VoiceNoteStats> {
    return apiClient.get<VoiceNoteStats>('/mobile/voice-notes/stats');
  },

  /**
   * Get voice note by ID
   */
  async getVoiceNote(id: string): Promise<VoiceNote> {
    return apiClient.get<VoiceNote>(`/mobile/voice-notes/${id}`);
  },

  /**
   * Get transcription for voice note
   */
  async getTranscription(id: string): Promise<{ transcription: string }> {
    return apiClient.get<{ transcription: string }>(`/mobile/voice-notes/${id}/transcription`);
  },

  /**
   * Retry transcription
   */
  async retryTranscription(id: string): Promise<VoiceNote> {
    return apiClient.post<VoiceNote>(`/mobile/voice-notes/${id}/retry-transcription`);
  },

  /**
   * Update voice note
   */
  async updateVoiceNote(id: string, data: UpdateVoiceNoteDto): Promise<VoiceNote> {
    return apiClient.patch<VoiceNote>(`/mobile/voice-notes/${id}`, { body: data });
  },

  /**
   * Delete voice note
   */
  async deleteVoiceNote(id: string): Promise<void> {
    return apiClient.delete<void>(`/mobile/voice-notes/${id}`);
  }
};