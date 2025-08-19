import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  templatesService, 
  attachmentsService, 
  searchService, 
  analyticsService, 
  exportService 
} from '../services/advanced.service';
import {
  AdvancedCreateTemplateDto as CreateTemplateDto,
  UpdateTemplateDto,
  ProcessTemplateDto,
  AdvancedSearchDto,
  QuickSearchDto,
  TrackNoteViewDto,
  AdvancedCreateExportDto as CreateExportDto
} from '../types';

// Query Keys
export const advancedQueryKeys = {
  templates: {
    all: ['templates'] as const,
    my: () => [...advancedQueryKeys.templates.all, 'my'] as const,
    public: () => [...advancedQueryKeys.templates.all, 'public'] as const,
    categories: () => [...advancedQueryKeys.templates.all, 'categories'] as const,
    recommendations: () => [...advancedQueryKeys.templates.all, 'recommendations'] as const,
    detail: (id: string) => [...advancedQueryKeys.templates.all, 'detail', id] as const,
    stats: (id: string) => [...advancedQueryKeys.templates.all, 'stats', id] as const,
    search: (query: string, category?: string) => [...advancedQueryKeys.templates.all, 'search', { query, category }] as const,
  },
  attachments: {
    all: ['attachments'] as const,
    note: (noteId: string) => [...advancedQueryKeys.attachments.all, 'note', noteId] as const,
    analytics: () => [...advancedQueryKeys.attachments.all, 'analytics'] as const,
    supportedTypes: () => [...advancedQueryKeys.attachments.all, 'supported-types'] as const,
    search: (query: string) => [...advancedQueryKeys.attachments.all, 'search', query] as const,
  },
  search: {
    all: ['search'] as const,
    history: () => [...advancedQueryKeys.search.all, 'history'] as const,
    popular: () => [...advancedQueryKeys.search.all, 'popular'] as const,
    saved: () => [...advancedQueryKeys.search.all, 'saved'] as const,
    analytics: () => [...advancedQueryKeys.search.all, 'analytics'] as const,
    suggestions: (query: string) => [...advancedQueryKeys.search.all, 'suggestions', query] as const,
  },
  analytics: {
    all: ['analytics'] as const,
    overview: () => [...advancedQueryKeys.analytics.all, 'overview'] as const,
    workspaces: () => [...advancedQueryKeys.analytics.all, 'workspaces'] as const,
    content: () => [...advancedQueryKeys.analytics.all, 'content'] as const,
  },
  export: {
    all: ['export'] as const,
    list: (status?: string, limit?: number) => [...advancedQueryKeys.export.all, 'list', { status, limit }] as const,
    stats: () => [...advancedQueryKeys.export.all, 'stats'] as const,
    detail: (id: string) => [...advancedQueryKeys.export.all, 'detail', id] as const,
  },
};

// Templates Hooks
export const useMyTemplates = () => {
  return useQuery({
    queryKey: advancedQueryKeys.templates.my(),
    queryFn: () => templatesService.getMyTemplates(),
  });
};

export const usePublicTemplates = () => {
  return useQuery({
    queryKey: advancedQueryKeys.templates.public(),
    queryFn: () => templatesService.getPublicTemplates(),
  });
};

export const useTemplateCategories = () => {
  return useQuery({
    queryKey: advancedQueryKeys.templates.categories(),
    queryFn: () => templatesService.getCategories(),
  });
};

export const useTemplateRecommendations = () => {
  return useQuery({
    queryKey: advancedQueryKeys.templates.recommendations(),
    queryFn: () => templatesService.getRecommendations(),
  });
};

export const useTemplate = (templateId: string) => {
  return useQuery({
    queryKey: advancedQueryKeys.templates.detail(templateId),
    queryFn: () => templatesService.getById(templateId),
    enabled: !!templateId,
  });
};

export const useTemplateStats = (templateId: string) => {
  return useQuery({
    queryKey: advancedQueryKeys.templates.stats(templateId),
    queryFn: () => templatesService.getStats(templateId),
    enabled: !!templateId,
  });
};

export const useSearchTemplates = (query: string, category?: string) => {
  return useQuery({
    queryKey: advancedQueryKeys.templates.search(query, category),
    queryFn: () => templatesService.search(query, category),
    enabled: !!query,
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTemplateDto) => templatesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: advancedQueryKeys.templates.my() });
      queryClient.invalidateQueries({ queryKey: advancedQueryKeys.templates.public() });
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: UpdateTemplateDto }) =>
      templatesService.update(templateId, data),
    onSuccess: (_, { templateId }) => {
      queryClient.invalidateQueries({ queryKey: advancedQueryKeys.templates.detail(templateId) });
      queryClient.invalidateQueries({ queryKey: advancedQueryKeys.templates.my() });
    },
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (templateId: string) => templatesService.delete(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: advancedQueryKeys.templates.all });
    },
  });
};

export const useProcessTemplate = () => {
  return useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: ProcessTemplateDto }) =>
      templatesService.process(templateId, data),
  });
};

export const useDuplicateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (templateId: string) => templatesService.duplicate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: advancedQueryKeys.templates.my() });
    },
  });
};

export const useTemplatePreview = () => {
  return useMutation({
    mutationFn: ({ templateId, variables }: { templateId: string; variables?: Record<string, any> }) =>
      templatesService.getPreview(templateId, variables),
  });
};

// Attachments Hooks
export const useNoteAttachments = (noteId: string) => {
  return useQuery({
    queryKey: advancedQueryKeys.attachments.note(noteId),
    queryFn: () => attachmentsService.getByNote(noteId),
    enabled: !!noteId,
  });
};

export const useAttachmentAnalytics = () => {
  return useQuery({
    queryKey: advancedQueryKeys.attachments.analytics(),
    queryFn: () => attachmentsService.getAnalytics(),
  });
};

export const useSupportedAttachmentTypes = () => {
  return useQuery({
    queryKey: advancedQueryKeys.attachments.supportedTypes(),
    queryFn: () => attachmentsService.getSupportedTypes(),
  });
};

export const useSearchAttachments = (query: string) => {
  return useQuery({
    queryKey: advancedQueryKeys.attachments.search(query),
    queryFn: () => attachmentsService.search(query),
    enabled: !!query,
  });
};

export const useUploadAttachment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ noteId, file, description }: { noteId: string; file: File; description?: string }) =>
      attachmentsService.upload(noteId, file, description),
    onSuccess: (_, { noteId }) => {
      queryClient.invalidateQueries({ queryKey: advancedQueryKeys.attachments.note(noteId) });
      queryClient.invalidateQueries({ queryKey: advancedQueryKeys.attachments.analytics() });
    },
  });
};

export const useDeleteAttachment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (attachmentId: string) => attachmentsService.delete(attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: advancedQueryKeys.attachments.all });
    },
  });
};

export const usePerformOCR = () => {
  return useMutation({
    mutationFn: (attachmentId: string) => attachmentsService.performOCR(attachmentId),
  });
};

// Search Hooks
export const useSearchHistory = () => {
  return useQuery({
    queryKey: advancedQueryKeys.search.history(),
    queryFn: () => searchService.getHistory(),
  });
};

export const usePopularSearches = () => {
  return useQuery({
    queryKey: advancedQueryKeys.search.popular(),
    queryFn: () => searchService.getPopular(),
  });
};

export const useSavedSearches = () => {
  return useQuery({
    queryKey: advancedQueryKeys.search.saved(),
    queryFn: () => searchService.getSavedSearches(),
  });
};

export const useSearchAnalytics = () => {
  return useQuery({
    queryKey: advancedQueryKeys.search.analytics(),
    queryFn: () => searchService.getAnalytics(),
  });
};

export const useSearchSuggestions = (query: string) => {
  return useQuery({
    queryKey: advancedQueryKeys.search.suggestions(query),
    queryFn: () => searchService.getSuggestions(query),
    enabled: !!query && query.length > 2,
  });
};

export const useAdvancedSearch = () => {
  return useMutation({
    mutationFn: (data: AdvancedSearchDto) => searchService.advancedSearch(data),
  });
};

export const useQuickSearch = () => {
  return useMutation({
    mutationFn: (data: QuickSearchDto) => searchService.quickSearch(data),
  });
};

export const useSaveSearch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ name, query, isAlert }: { name: string; query: AdvancedSearchDto; isAlert?: boolean }) =>
      searchService.saveSearch(name, query, isAlert),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: advancedQueryKeys.search.saved() });
    },
  });
};

export const useDeleteSavedSearch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => searchService.deleteSavedSearch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: advancedQueryKeys.search.saved() });
    },
  });
};

// Analytics Hooks
export const useAnalyticsOverview = () => {
  return useQuery({
    queryKey: advancedQueryKeys.analytics.overview(),
    queryFn: () => analyticsService.getOverview(),
  });
};

export const useWorkspaceAnalytics = () => {
  return useQuery({
    queryKey: advancedQueryKeys.analytics.workspaces(),
    queryFn: () => analyticsService.getWorkspaces(),
  });
};

export const useContentAnalytics = () => {
  return useQuery({
    queryKey: advancedQueryKeys.analytics.content(),
    queryFn: () => analyticsService.getContent(),
  });
};

export const useTrackNoteView = () => {
  return useMutation({
    mutationFn: ({ noteId, data }: { noteId: string; data?: TrackNoteViewDto }) =>
      analyticsService.trackNoteView(noteId, data),
  });
};

// Export Hooks
export const useExports = (status?: string, limit?: number) => {
  return useQuery({
    queryKey: advancedQueryKeys.export.list(status, limit),
    queryFn: () => exportService.getExports(status, limit),
  });
};

export const useExportStats = () => {
  return useQuery({
    queryKey: advancedQueryKeys.export.stats(),
    queryFn: () => exportService.getStats(),
  });
};

export const useExport = (id: string) => {
  return useQuery({
    queryKey: advancedQueryKeys.export.detail(id),
    queryFn: () => exportService.getExport(id),
    enabled: !!id,
  });
};

export const useCreateExport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateExportDto) => exportService.createExport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: advancedQueryKeys.export.all });
    },
  });
};

export const useDeleteExport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => exportService.deleteExport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: advancedQueryKeys.export.all });
    },
  });
};

export const useDownloadExport = () => {
  return useMutation({
    mutationFn: (id: string) => exportService.downloadExport(id),
  });
};