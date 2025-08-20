import { apiClient } from '../lib/api-client';
import {
  StartRecordingResponse,
  StartRecordingRequest,
  StopRecordingResponse,
  StopRecordingRequest,
  GetVoiceNotesResponse,
  TranscribeVoiceNoteResponse,
  TranscribeVoiceNoteRequest,
  TranscribeVoiceNoteParams,
  CreateLocationNoteResponse,
  CreateLocationNoteRequest,
  GetNearbyNotesResponse,
  SyncOfflineDataResponse,
  SyncOfflineDataRequest,
  GetSyncStatusResponse
} from '../types/mobile.types';

/**
 * Mobile Service
 * Generated from backend analysis
 */
export const mobileService = {
  /**
   * POST /voice-notes/record
   */
  async startRecording(data: StartRecordingRequest): Promise<StartRecordingResponse> {
    return apiClient.post(`/voice-notes/record`, data);
  },

  /**
   * POST /voice-notes/stop
   */
  async stopRecording(data: StopRecordingRequest): Promise<StopRecordingResponse> {
    return apiClient.post(`/voice-notes/stop`, data);
  },

  /**
   * GET /voice-notes
   */
  async getVoiceNotes(): Promise<GetVoiceNotesResponse> {
    return apiClient.get(`/voice-notes`);
  },

  /**
   * POST /voice-notes/:id/transcribe
   */
  async transcribeVoiceNote(params: TranscribeVoiceNoteParams, data: TranscribeVoiceNoteRequest): Promise<TranscribeVoiceNoteResponse> {
    return apiClient.post(`/voice-notes/${params.id}/transcribe`, data);
  },

  /**
   * POST /location-notes
   */
  async createLocationNote(data: CreateLocationNoteRequest): Promise<CreateLocationNoteResponse> {
    return apiClient.post(`/location-notes`, data);
  },

  /**
   * GET /location-notes/nearby
   */
  async getNearbyNotes(): Promise<GetNearbyNotesResponse> {
    return apiClient.get(`/location-notes/nearby`);
  },

  /**
   * POST /offline-sync/sync
   */
  async syncOfflineData(data: SyncOfflineDataRequest): Promise<SyncOfflineDataResponse> {
    return apiClient.post(`/offline-sync/sync`, data);
  },

  /**
   * GET /offline-sync/status
   */
  async getSyncStatus(): Promise<GetSyncStatusResponse> {
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
    return apiClient.post(`/voice-notes`, formData);
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
