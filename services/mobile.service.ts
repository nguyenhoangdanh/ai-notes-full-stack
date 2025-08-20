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
  }
};
