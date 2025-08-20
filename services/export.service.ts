import { apiClient } from '../lib/api-client';
import {
  DownloadResponse,
  DownloadParams,
  CreateExportResponse,
  CreateExportRequest,
  GetUserExportsResponse,
  DeleteExportResponse,
  DeleteExportParams,
  GetExportStatsResponse,
  QueueNoteExportResponse,
  QueueNoteExportRequest,
  QueueNoteExportParams
} from '../types/export.types';

/**
 * Export Service
 * Generated from backend analysis
 */
export const exportService = {
  /**
   * GET /export/:id/download
   */
  async download(params: DownloadParams): Promise<DownloadResponse> {
    return apiClient.get(`/export/${params.id}/download`);
  },

  /**
   * POST /export
   */
  async createExport(data: CreateExportRequest): Promise<CreateExportResponse> {
    return apiClient.post(`/export`, data);
  },

  /**
   * GET /export
   */
  async getUserExports(): Promise<GetUserExportsResponse> {
    return apiClient.get(`/export`);
  },

  /**
   * DELETE /export/:id
   */
  async deleteExport(params: DeleteExportParams): Promise<DeleteExportResponse> {
    return apiClient.delete(`/export/${params.id}`);
  },

  /**
   * GET /export/stats
   */
  async getExportStats(): Promise<GetExportStatsResponse> {
    return apiClient.get(`/export/stats`);
  },

  /**
   * POST /export/queue/:noteId
   */
  async queueNoteExport(params: QueueNoteExportParams, data: QueueNoteExportRequest): Promise<QueueNoteExportResponse> {
    return apiClient.post(`/export/queue/${params.noteId}`, data);
  }
};
