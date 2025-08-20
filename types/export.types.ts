/**
 * Export Module Types
 * Generated from backend analysis
 */

export interface DownloadResponse {
  success: boolean;
  message?: string;
}

export interface DownloadParams {
  id: string;
}

export interface CreateExportRequest {
  // Define creation request body
}

export interface CreateExportResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export interface GetUserExportsResponse {
  // Define single item response
}

export interface DeleteExportResponse {
  success: boolean;
  message?: string;
}

export interface DeleteExportParams {
  id: string;
}

export interface GetExportStatsResponse {
  // Define single item response
}

export interface QueueNoteExportRequest {
}

export interface QueueNoteExportResponse {
  success: boolean;
  message?: string;
}

export interface QueueNoteExportParams {
  noteId: string;
}

