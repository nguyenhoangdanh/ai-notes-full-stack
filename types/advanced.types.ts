// Templates types
export interface CreateTemplateDto {
  name: string;
  description?: string;
  content: string;
  tags?: string[];
  isPublic?: boolean;
  category?: string;
  variables?: TemplateVariable[];
}

export interface UpdateTemplateDto {
  name?: string;
  description?: string;
  content?: string;
  tags?: string[];
  isPublic?: boolean;
  category?: string;
  variables?: TemplateVariable[];
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  label: string;
  description?: string;
  required?: boolean;
  defaultValue?: string;
  options?: string[]; // For select type
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  content: string;
  tags: string[];
  isPublic: boolean;
  category?: string;
  variables: TemplateVariable[];
  ownerId: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name?: string;
    email: string;
  };
}

export interface ProcessTemplateDto {
  variables: Record<string, any>;
  workspaceId: string;
  title?: string;
}

export interface TemplateStats {
  totalUsage: number;
  recentUsage: number;
  averageRating: number;
  topUsers: Array<{
    user: { name?: string; email: string };
    usage: number;
  }>;
}

export interface TemplatePreview {
  content: string;
  processedContent: string;
  variables: TemplateVariable[];
}

// Attachments types
export interface AttachmentUploadDto {
  file: File;
  description?: string;
}

export interface Attachment {
  id: string;
  noteId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  ocrText?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AttachmentAnalytics {
  totalAttachments: number;
  totalSize: number;
  byType: Array<{
    mimeType: string;
    count: number;
    size: number;
  }>;
  recentUploads: number;
  popularFiles: Array<{
    filename: string;
    downloads: number;
  }>;
}

export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  regions: Array<{
    text: string;
    confidence: number;
    boundingBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
}

// Search types
export interface AdvancedSearchDto {
  query: string;
  workspaceId?: string;
  tags?: string[];
  categories?: string[];
  dateFrom?: string;
  dateTo?: string;
  contentType?: 'text' | 'markdown' | 'all';
  sortBy?: 'relevance' | 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  score: number;
  highlights: Array<{
    field: string;
    fragments: string[];
  }>;
  tags: string[];
  categories: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SearchSuggestion {
  text: string;
  type: 'query' | 'tag' | 'category' | 'title';
  score: number;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: AdvancedSearchDto;
  ownerId: string;
  isAlert?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchAnalytics {
  totalSearches: number;
  uniqueQueries: number;
  averageResultsPerSearch: number;
  topQueries: Array<{
    query: string;
    count: number;
    avgResults: number;
  }>;
  noResultQueries: Array<{
    query: string;
    count: number;
  }>;
  searchTrends: Array<{
    date: string;
    searches: number;
  }>;
}

export interface QuickSearchDto {
  query: string;
  limit?: number;
}

// Analytics types
export interface AnalyticsOverview {
  totalNotes: number;
  totalWords: number;
  totalWorkspaces: number;
  averageNoteLength: number;
  notesCreatedThisWeek: number;
  notesCreatedThisMonth: number;
  mostActiveDay: string;
  mostActiveHour: number;
  writingStreak: number;
}

export interface WorkspaceAnalytics {
  workspaceId: string;
  workspaceName: string;
  noteCount: number;
  totalWords: number;
  averageNoteLength: number;
  lastActivity: string;
  growth: Array<{
    date: string;
    noteCount: number;
    wordCount: number;
  }>;
}

export interface ContentAnalytics {
  wordFrequency: Array<{
    word: string;
    count: number;
  }>;
  topicDistribution: Array<{
    topic: string;
    percentage: number;
  }>;
  readingTime: {
    total: number;
    average: number;
    byNote: Array<{
      noteId: string;
      title: string;
      readingTime: number;
    }>;
  };
}

export interface TrackNoteViewDto {
  duration?: number;
  scrollPercentage?: number;
  interactionType?: 'view' | 'edit' | 'share';
}

// Export types
export interface CreateExportDto {
  type: 'SINGLE_NOTE' | 'MULTIPLE_NOTES' | 'WORKSPACE' | 'ALL_NOTES';
  format: 'PDF' | 'MARKDOWN' | 'HTML' | 'DOCX' | 'JSON';
  noteIds: string[];
  filename?: string;
  settings?: ExportSettings;
}

export interface ExportSettings {
  includeMetadata?: boolean;
  includeTags?: boolean;
  includeImages?: boolean;
  includeAttachments?: boolean;
  formatOptions?: {
    fontSize?: number;
    fontFamily?: string;
    margins?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  };
}

export interface ExportJob {
  id: string;
  type: CreateExportDto['type'];
  format: CreateExportDto['format'];
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  filename: string;
  downloadUrl?: string;
  progress: number;
  error?: string;
  settings: ExportSettings;
  ownerId: string;
  createdAt: string;
  completedAt?: string;
  expiresAt: string;
}

export interface ExportStats {
  totalExports: number;
  completedExports: number;
  failedExports: number;
  popularFormats: Array<{
    format: string;
    count: number;
  }>;
  averageProcessingTime: number;
}