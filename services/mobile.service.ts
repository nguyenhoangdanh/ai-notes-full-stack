import { apiClient } from '../lib/api-client';
import type {
  VoiceNote,
  CreateVoiceNoteDto,
  LocationNote,
  CreateLocationNoteDto,
  SyncOperationDto,
  ConflictResolutionDto,
  OfflineSync,
  ExportHistory,
  AdvancedCreateExportDto as CreateExportDto,
} from '../types';

/**
 * Mobile Service
 * Generated from backend analysis
 */
export const mobileService = {
  /**
   * POST /voice-notes/record
   */
  async startRecording(data: any): Promise<any> {
    return apiClient.post(`/voice-notes/record`, { body: data });
  },

  /**
   * POST /voice-notes/stop
   */
  async stopRecording(data: any): Promise<any> {
    return apiClient.post(`/voice-notes/stop`, { body: data });
  },

  /**
   * GET /voice-notes
   */
  async getVoiceNotes(): Promise<VoiceNote[]> {
    return apiClient.get(`/voice-notes`);
  },

  /**
   * POST /voice-notes/:id/transcribe
   */
  async transcribeVoiceNote(params: { id: string }, data: any): Promise<any> {
    return apiClient.post(`/voice-notes/${params.id}/transcribe`, { body: data });
  },

  /**
   * POST /location-notes
   */
  async createLocationNote(data: CreateLocationNoteDto): Promise<LocationNote> {
    return apiClient.post(`/location-notes`, { body: data });
  },

  /**
   * GET /location-notes/nearby
   */
  async getNearbyNotes(): Promise<LocationNote[]> {
    return apiClient.get(`/location-notes/nearby`);
  },

  /**
   * POST /offline-sync/sync
   */
  async syncOfflineData(data: SyncOperationDto): Promise<any> {
    return apiClient.post(`/offline-sync/sync`, { body: data });
  },

  /**
   * GET /offline-sync/status
   */
  async getSyncStatus(): Promise<any> {
    return apiClient.get(`/offline-sync/status`);
  },

  // Additional methods needed by hooks
  /**
   * POST /voice-notes (alias for creating voice notes with audio file)
   */
  async createVoiceNote(data: any, audioFile?: File): Promise<any> {
    // This would normally handle file upload
    const formData = new FormData();
    if (audioFile) {
      formData.append('audio', audioFile);
    }
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    return apiClient.post(`/voice-notes`, { body: formData });
  },

  /**
   * GET /notes/:noteId/location
   */
  async getNoteLocation(noteId: string): Promise<any> {
    return apiClient.get(`/notes/${noteId}/location`);
  },

  /**
   * POST /notes/:noteId/location
   */
  async addLocationToNote(noteId: string, data: any): Promise<any> {
    return apiClient.post(`/notes/${noteId}/location`, data);
  },

  /**
   * GET /exports/history
   */
  async getExportHistory(): Promise<any> {
    return apiClient.get(`/exports/history`);
  },

  /**
   * POST /exports
   */
  async createExport(data: any): Promise<any> {
    return apiClient.post(`/exports`, data);
  }
};
