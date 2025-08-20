import { apiClient } from '../lib/api-client';
import {
  AdvancedTemplate as Template,
  AdvancedCreateTemplateDto as CreateTemplateDto,
  AdvancedUpdateTemplateDto as UpdateTemplateDto,
  ProcessTemplateDto,
  TemplateStats,
  TemplatePreview,
  AdvancedAttachment as Attachment,
  AdvancedAttachmentAnalytics as AttachmentAnalytics,
  OCRResult,
  AdvancedSearchDto,
  SearchResult,
  SearchSuggestion,
  SavedSearch,
  SearchAnalytics,
  QuickSearchDto,
  AdvancedAnalyticsOverview as AnalyticsOverview,
  AdvancedWorkspaceAnalytics as WorkspaceAnalytics,
  AdvancedContentAnalytics as ContentAnalytics,
  TrackNoteViewDto,
  ExportJob,
  AdvancedCreateExportDto as CreateExportDto,
  AdvancedExportStats as ExportStats
} from '../types';

// Templates Service
export const templatesService = {
  create: (data: CreateTemplateDto) =>
    apiClient.post<Template>('/templates', { body: data }),

  getMyTemplates: () =>
    apiClient.get<Template[]>('/templates/my-templates'),

  getPublicTemplates: () =>
    apiClient.get<Template[]>('/templates/public'),

  getCategories: () =>
    apiClient.get<string[]>('/templates/categories'),

  getRecommendations: () =>
    apiClient.get<Template[]>('/templates/recommendations'),

  search: (query: string, category?: string) =>
    apiClient.get<Template[]>('/templates/search', {
      query: { q: query, category }
    }),

  getById: (templateId: string) =>
    apiClient.get<Template>(`/templates/${templateId}`),

  update: (templateId: string, data: UpdateTemplateDto) =>
    apiClient.put<Template>(`/templates/${templateId}`, { body: data }),

  delete: (templateId: string) =>
    apiClient.delete<void>(`/templates/${templateId}`),

  process: (templateId: string, data: ProcessTemplateDto) =>
    apiClient.post<any>(`/templates/${templateId}/process`, { body: data }),

  duplicate: (templateId: string) =>
    apiClient.post<Template>(`/templates/${templateId}/duplicate`),

  getStats: (templateId: string) =>
    apiClient.get<TemplateStats>(`/templates/${templateId}/stats`),

  getPreview: (templateId: string, variables?: Record<string, any>) =>
    apiClient.get<TemplatePreview>(`/templates/${templateId}/preview`, {
      query: variables ? { variables: JSON.stringify(variables) } : {}
    }),
};

// Attachments Service
export const attachmentsService = {
  upload: (noteId: string, file: File, description?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);
    
    return apiClient.post<Attachment>(`/attachments/${noteId}/upload`, {
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    });
  },

  getByNote: (noteId: string) =>
    apiClient.get<Attachment[]>(`/attachments/${noteId}`),

  delete: (attachmentId: string) =>
    apiClient.delete<void>(`/attachments/${attachmentId}`),

  download: (attachmentId: string) =>
    apiClient.get<Blob>(`/attachments/${attachmentId}/download`),

  search: (query: string) =>
    apiClient.get<Attachment[]>(`/attachments/search/${query}`),

  getAnalytics: () =>
    apiClient.get<AttachmentAnalytics>('/attachments/analytics/overview'),

  performOCR: (attachmentId: string) =>
    apiClient.post<OCRResult>(`/attachments/${attachmentId}/ocr`),

  getSupportedTypes: () =>
    apiClient.get<string[]>('/attachments/types/supported'),
};

// Search Service
export const searchService = {
  advancedSearch: (data: AdvancedSearchDto) =>
    apiClient.post<SearchResult[]>('/search/advanced', { body: data }),

  getHistory: () =>
    apiClient.get<any[]>('/search/history'),

  getPopular: () =>
    apiClient.get<any[]>('/search/popular'),

  getSuggestions: (query: string) =>
    apiClient.get<SearchSuggestion[]>('/search/suggestions', {
      query: { q: query }
    }),

  saveSearch: (name: string, query: AdvancedSearchDto, isAlert?: boolean) =>
    apiClient.post<SavedSearch>('/search/save', {
      body: { name, query, isAlert }
    }),

  getSavedSearches: () =>
    apiClient.get<SavedSearch[]>('/search/saved'),

  deleteSavedSearch: (id: string) =>
    apiClient.delete<void>(`/search/saved/${id}`),

  getAnalytics: () =>
    apiClient.get<SearchAnalytics>('/search/analytics'),

  quickSearch: (data: QuickSearchDto) =>
    apiClient.post<SearchResult[]>('/search/quick', { body: data }),
};

// Analytics Service
export const analyticsService = {
  getOverview: () =>
    apiClient.get<AnalyticsOverview>('/analytics/overview'),

  getWorkspaces: () =>
    apiClient.get<WorkspaceAnalytics[]>('/analytics/workspaces'),

  getContent: () =>
    apiClient.get<ContentAnalytics>('/analytics/content'),

  trackNoteView: (noteId: string, data?: TrackNoteViewDto) =>
    apiClient.post<void>(`/analytics/note/${noteId}/track`, { body: data }),
};

// Export Service
export const exportService = {
  createExport: (data: CreateExportDto) =>
    apiClient.post<ExportJob>('/export', { body: data }),

  getExports: (status?: string, limit?: number) =>
    apiClient.get<ExportJob[]>('/export', {
      query: { status, limit: limit?.toString() }
    }),

  getStats: () =>
    apiClient.get<ExportStats>('/export/stats'),

  getExport: (id: string) =>
    apiClient.get<ExportJob>(`/export/${id}`),

  downloadExport: (id: string) =>
    apiClient.get<Blob>(`/export/${id}/download`),

  deleteExport: (id: string) =>
    apiClient.delete<void>(`/export/${id}`),
};