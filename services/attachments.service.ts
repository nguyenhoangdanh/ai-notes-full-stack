import { apiClient } from '../lib/api-client';
import {
  UploadAttachmentResponse,
  UploadAttachmentRequest,
  UploadAttachmentParams,
  GetAttachmentsResponse,
  GetAttachmentsParams,
  DeleteAttachmentResponse,
  DeleteAttachmentParams,
  DownloadAttachmentResponse,
  DownloadAttachmentParams,
  SearchAttachmentsResponse,
  SearchAttachmentsParams,
  GetAttachmentAnalyticsResponse,
  RequestOCRResponse,
  RequestOCRRequest,
  RequestOCRParams,
  GetSupportedTypesResponse
} from '../types/attachments.types';

/**
 * Attachments Service
 * Generated from backend analysis
 */
export const attachmentsService = {
  /**
   * POST /attachments/:noteId/upload
   */
  async uploadAttachment(params: UploadAttachmentParams, data: UploadAttachmentRequest): Promise<UploadAttachmentResponse> {
    return apiClient.post(`/attachments/${params.noteId}/upload`, data);
  },

  /**
   * GET /attachments/:noteId
   */
  async getAttachments(params: GetAttachmentsParams): Promise<GetAttachmentsResponse> {
    return apiClient.get(`/attachments/${params.noteId}`);
  },

  /**
   * DELETE /attachments/:attachmentId
   */
  async deleteAttachment(params: DeleteAttachmentParams): Promise<DeleteAttachmentResponse> {
    return apiClient.delete(`/attachments/${params.attachmentId}`);
  },

  /**
   * GET /attachments/:attachmentId/download
   */
  async downloadAttachment(params: DownloadAttachmentParams): Promise<DownloadAttachmentResponse> {
    return apiClient.get(`/attachments/${params.attachmentId}/download`);
  },

  /**
   * GET /attachments/search/:query
   */
  async searchAttachments(params: SearchAttachmentsParams): Promise<SearchAttachmentsResponse> {
    return apiClient.get(`/attachments/search/${params.query}`);
  },

  /**
   * GET /attachments/analytics/overview
   */
  async getAttachmentAnalytics(): Promise<GetAttachmentAnalyticsResponse> {
    return apiClient.get(`/attachments/analytics/overview`);
  },

  /**
   * POST /attachments/:attachmentId/ocr
   */
  async requestOCR(params: RequestOCRParams, data: RequestOCRRequest): Promise<RequestOCRResponse> {
    return apiClient.post(`/attachments/${params.attachmentId}/ocr`, data);
  },

  /**
   * GET /attachments/types/supported
   */
  async getSupportedTypes(): Promise<GetSupportedTypesResponse> {
    return apiClient.get(`/attachments/types/supported`);
  }
};
