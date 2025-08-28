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

export interface IMulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  stream: NodeJS.ReadableStream;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
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
  file: IMulterFile;
}

export interface UploadAttachmentResponse {
  success: boolean;
  attachment: {
        id: string;
        filename: string;
        fileType: string;
        fileSize: number;
        fileUrl: string;
        uploadedAt: Date;
        category: string;
    };
  message?: any;
}

export interface UploadAttachmentParams {
  noteId: string;
}

export interface IGetAttachmentError { 
success: boolean;
    attachments: any[];
    error: any;
    count?: undefined;
}

export interface IGetAttchmentSuccess {
  success: boolean;
    attachments: {
        id: string;
        filename: string;
        fileType: string;
        fileSize: number;
        fileUrl: string;
        uploadedAt: Date;
        category: string;
        ocrText: string;
        ocrConfidence: number;
    }[];
    count: number;
    error?: undefined;
}

export type GetAttachmentsResponse = IGetAttchmentSuccess | IGetAttachmentError;

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

export type DownloadAttachmentResponse =  NodeJS.ReadableStream | {
    success: boolean;
    downloadUrl: string;
    filename: string;
}

export interface DownloadAttachmentParams {
  attachmentId: string;
}

export interface ISearchAttachmentsError {
 success: boolean;
    results: any[];
    error: any;
    count?: undefined;
    query?: undefined;
}

export interface ISearchAttchmentSuccess {
  success: boolean;
    results: {
        id: string;
        filename: string;
        fileType: string;
        fileUrl: string;
        note: {
            id: string;
            title: string;
        };
        ocrText: string;
        relevance: number;
    }[];
    count: number;
    query: string;
    error?: undefined;
}

export type SearchAttachmentsResponse = ISearchAttchmentSuccess | ISearchAttachmentsError;

export interface SearchAttachmentsParams {
  query: string;
  limit?: number;
}

export interface IGetAttachmentAnalyticsError {
  success: boolean;
    analytics: any;
    error: any;
    period?: undefined;
}

export interface IGetAttachmentAnalyticsSuccess {
  success: boolean;
    analytics: {
        totalAttachments: number;
        totalStorageUsed: number;
        averageFileSize: number;
        typeDistribution: {
            fileType: string;
            count: number;
            category: string;
        }[];
        recentUploads: ({
            note: {
                id: string;
                title: string;
            };
        } & {
            id: string;
            noteId: string;
            filename: string;
            filepath: string;
            fileType: string;
            fileSize: number;
            uploadedBy: string;
            createdAt: Date;
        })[];
        totalRecentUploads: number;
    };
    period: {
        days: number;
        startDate: string;
        endDate: string;
    };
    error?: undefined;
}

export type GetAttachmentAnalyticsResponse = IGetAttachmentAnalyticsSuccess | IGetAttachmentAnalyticsError;

export interface RequestOCRRequest {
}

export interface IRequestOCRError {
  success: boolean;
    message: any;
    attachmentId?: undefined;
    note?: undefined;
}

export interface IRequestOCRSuccess {
success: boolean;
    message: string;
    attachmentId: string;
    note: string;
}

export type RequestOCRResponse = IRequestOCRSuccess | IRequestOCRError;

export interface RequestOCRParams {
  attachmentId: string;
}

export interface GetSupportedTypesResponse {
  // Define single item response
  success: boolean;
    supportedTypes: {
        image: {
            mimeTypes: string[];
            maxSize: string;
            description: string;
        };
        document: {
            mimeTypes: string[];
            maxSize: string;
            description: string;
        };
        audio: {
            mimeTypes: string[];
            maxSize: string;
            description: string;
        };
        video: {
            mimeTypes: string[];
            maxSize: string;
            description: string;
        };
        archive: {
            mimeTypes: string[];
            maxSize: string;
            description: string;
        };
    };
    totalTypes: number;
}

