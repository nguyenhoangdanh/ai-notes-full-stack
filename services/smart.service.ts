import { apiClient } from '../lib/api-client';
import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  AutoCategorizeDto,
  CategorySuggestionDto,
  Summary,
  GenerateSummaryDto,
  BatchSummaryDto,
  SummaryResponseDto,
  NoteRelation,
  RelatedNote,
  NoteGraph,
  DuplicateDetectionReport,
  CreateDuplicateReportDto,
  MergeDuplicatesDto,
  DuplicateGroup
} from '../types';

// Categories Service
export const categoriesService = {
  // CRUD operations
  create: (data: CreateCategoryDto) =>
    apiClient.post<Category>('/categories', { body: data }),

  getAll: (includeAuto?: boolean) =>
    apiClient.get<Category[]>('/categories', { 
      query: includeAuto !== undefined ? { includeAuto: includeAuto.toString() } : {} 
    }),

  getById: (id: string) =>
    apiClient.get<Category>(`/categories/${id}`),

  update: (id: string, data: UpdateCategoryDto) =>
    apiClient.patch<Category>(`/categories/${id}`, { body: data }),

  delete: (id: string) =>
    apiClient.delete<void>(`/categories/${id}`),

  // AI features
  suggest: (content: string) =>
    apiClient.post<CategorySuggestionDto[]>('/categories/suggest', { 
      body: { content } 
    }),

  autoCategorize: (noteId: string, threshold?: number) =>
    apiClient.post<any>(`/categories/auto-categorize/${noteId}`, { 
      body: { threshold } 
    }),

  // Note-category operations
  getNoteCategories: (noteId: string) =>
    apiClient.get<Category[]>(`/categories/notes/${noteId}`),

  assignCategory: (noteId: string, categoryId: string) =>
    apiClient.post<void>(`/categories/notes/${noteId}/assign/${categoryId}`),

  unassignCategory: (noteId: string, categoryId: string) =>
    apiClient.delete<void>(`/categories/notes/${noteId}/assign/${categoryId}`),

  // Testing endpoints
  testSuggest: (content: string, userId?: string) =>
    apiClient.post<any>('/categories/test-suggest', { 
      body: { content, userId } 
    }),

  testAutoCategorize: (noteId: string, threshold?: number) =>
    apiClient.post<any>(`/categories/test-auto-categorize/${noteId}`, { 
      body: { threshold } 
    }),
};

// Summaries Service
export const summariesService = {
  getNoteSummary: (noteId: string) =>
    apiClient.get<Summary>(`/summaries/notes/${noteId}`),

  generateSummary: (noteId: string, options?: GenerateSummaryDto) =>
    apiClient.post<SummaryResponseDto>(`/summaries/notes/${noteId}/generate`, { 
      body: options 
    }),

  deleteSummary: (noteId: string) =>
    apiClient.delete<void>(`/summaries/notes/${noteId}`),

  batchGenerate: (data: BatchSummaryDto) =>
    apiClient.post<any>('/summaries/batch', { body: data }),

  queueGeneration: (noteId: string) =>
    apiClient.post<void>(`/summaries/notes/${noteId}/queue`),

  getUserStats: () =>
    apiClient.get<any>('/summaries/user/stats'),

  getTemplates: () =>
    apiClient.get<any[]>('/summaries/templates'),

  generateWithTemplate: (noteId: string, templateId: string) =>
    apiClient.post<SummaryResponseDto>(`/summaries/notes/${noteId}/template/${templateId}`),

  getVersions: (noteId: string) =>
    apiClient.get<Summary[]>(`/summaries/notes/${noteId}/versions`),
};

// Relations Service
export const relationsService = {
  getRelatedNotes: (noteId: string) =>
    apiClient.get<RelatedNote[]>(`/relations/notes/${noteId}/related`),

  getStoredRelations: (noteId: string) =>
    apiClient.get<NoteRelation[]>(`/relations/notes/${noteId}/stored`),

  saveRelation: (noteId: string, targetNoteId: string, relationshipType: string) =>
    apiClient.post<NoteRelation>(`/relations/notes/${noteId}/save-relation`, {
      body: { targetNoteId, relationshipType }
    }),

  analyzeRelations: (noteId: string) =>
    apiClient.post<any>(`/relations/notes/${noteId}/analyze`),

  getNoteGraph: (noteId: string) =>
    apiClient.get<NoteGraph>(`/relations/notes/${noteId}/graph`),

  getStats: (userId: string) =>
    apiClient.get<any>(`/relations/stats/${userId}`),

  deleteRelation: (sourceNoteId: string, targetNoteId: string) =>
    apiClient.delete<void>(`/relations/notes/${sourceNoteId}/relations/${targetNoteId}`),
};

// Duplicates Service
export const duplicatesService = {
  detectDuplicates: () =>
    apiClient.get<DuplicateDetectionReport[]>('/duplicates/detect'),

  getReports: () =>
    apiClient.get<DuplicateDetectionReport[]>('/duplicates/reports'),

  createReport: (data: CreateDuplicateReportDto) =>
    apiClient.post<DuplicateDetectionReport>('/duplicates/reports', { body: data }),

  updateReport: (id: string, data: Partial<DuplicateDetectionReport>) =>
    apiClient.patch<DuplicateDetectionReport>(`/duplicates/reports/${id}`, { body: data }),

  mergeDuplicates: (data: MergeDuplicatesDto) =>
    apiClient.post<any>('/duplicates/merge', { body: data }),

  queueDetection: () =>
    apiClient.post<void>('/duplicates/queue-detection'),

  getStats: () =>
    apiClient.get<any>('/duplicates/stats'),
};