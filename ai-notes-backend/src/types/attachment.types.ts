export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface AttachmentMetadata {
  dimensions?: { width: number; height: number };
  duration?: number; // For audio/video files
  pages?: number; // For PDF files
  extractedText?: string; // For OCR results
  thumbnail?: string; // Thumbnail URL for preview
}

export interface AttachmentProcessingJobData {
  attachmentId: string;
  userId: string;
}



