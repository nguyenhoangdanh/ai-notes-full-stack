/**
 * Attachments Module Types
 * Generated from backend analysis
 */

export interface Attachment {
  id: string;
  noteId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AttachmentAnalytics {
  totalSize: number;
  totalCount: number;
  typeDistribution: Record<string, number>;
  largestFiles: Attachment[];
}

export interface SupportedFileTypes {
  [category: string]: {
    mimeTypes: string[];
    maxSize: string;
    description: string;
  };
}

export interface UploadAttachmentRequest {
}

export interface UploadAttachmentResponse {
  success: boolean;
  message?: string;
}

export interface UploadAttachmentParams {
  noteId: string;
}

export interface GetAttachmentsResponse {
  // Define single item response
}

export interface GetAttachmentsParams {
  noteId: string;
}

export interface DeleteAttachmentResponse {
  success: boolean;
  message?: string;
}

export interface DeleteAttachmentParams {
  attachmentId: string;
}

export interface DownloadAttachmentResponse {
  success: boolean;
  message?: string;
}

export interface DownloadAttachmentParams {
  attachmentId: string;
}

export interface SearchAttachmentsResponse {
  success: boolean;
  message?: string;
}

export interface SearchAttachmentsParams {
  query: string;
}

export interface GetAttachmentAnalyticsResponse {
  // Define single item response
}

export interface RequestOCRRequest {
}

export interface RequestOCRResponse {
  success: boolean;
  message?: string;
}

export interface RequestOCRParams {
  attachmentId: string;
}

export interface GetSupportedTypesResponse {
  // Define single item response
}

