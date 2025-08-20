import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  categoriesService, 
  summariesService, 
  relationsService, 
  duplicatesService 
} from '../services/smart.service';
import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  GenerateSummaryDto,
  BatchSummaryDto,
  CreateDuplicateReportDto,
  MergeDuplicatesDto
} from '../types';

// Query Keys
export const smartQueryKeys = {
  categories: {
    all: ['categories'] as const,
    lists: () => [...smartQueryKeys.categories.all, 'list'] as const,
    list: (includeAuto?: boolean) => [...smartQueryKeys.categories.lists(), { includeAuto }] as const,
    details: () => [...smartQueryKeys.categories.all, 'detail'] as const,
    detail: (id: string) => [...smartQueryKeys.categories.details(), id] as const,
    noteCategories: (noteId: string) => [...smartQueryKeys.categories.all, 'note', noteId] as const,
  },
  summaries: {
    all: ['summaries'] as const,
    note: (noteId: string) => [...smartQueryKeys.summaries.all, 'note', noteId] as const,
    stats: () => [...smartQueryKeys.summaries.all, 'stats'] as const,
    templates: () => [...smartQueryKeys.summaries.all, 'templates'] as const,
    versions: (noteId: string) => [...smartQueryKeys.summaries.all, 'versions', noteId] as const,
  },
  relations: {
    all: ['relations'] as const,
    related: (noteId: string) => [...smartQueryKeys.relations.all, 'related', noteId] as const,
    stored: (noteId: string) => [...smartQueryKeys.relations.all, 'stored', noteId] as const,
    graph: (noteId: string) => [...smartQueryKeys.relations.all, 'graph', noteId] as const,
    stats: (userId: string) => [...smartQueryKeys.relations.all, 'stats', userId] as const,
  },
  duplicates: {
    all: ['duplicates'] as const,
    detect: () => [...smartQueryKeys.duplicates.all, 'detect'] as const,
    reports: () => [...smartQueryKeys.duplicates.all, 'reports'] as const,
    stats: () => [...smartQueryKeys.duplicates.all, 'stats'] as const,
  },
};

// Categories Hooks
export const useCategories = (includeAuto?: boolean) => {
  return useQuery({
    queryKey: smartQueryKeys.categories.list(includeAuto),
    queryFn: () => categoriesService.getAll(includeAuto),
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: smartQueryKeys.categories.detail(id),
    queryFn: () => categoriesService.getById(id),
    enabled: !!id,
  });
};

export const useNoteCategories = (noteId: string) => {
  return useQuery({
    queryKey: smartQueryKeys.categories.noteCategories(noteId),
    queryFn: () => categoriesService.getNoteCategories(noteId),
    enabled: !!noteId,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCategoryDto) => categoriesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smartQueryKeys.categories.all });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) => 
      categoriesService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: smartQueryKeys.categories.detail(id) });
      queryClient.invalidateQueries({ queryKey: smartQueryKeys.categories.all });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => categoriesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smartQueryKeys.categories.all });
    },
  });
};

export const useSuggestCategories = () => {
  return useMutation({
    mutationFn: (content: string) => categoriesService.suggest(content),
  });
};

export const useAutoCategorize = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ noteId, threshold }: { noteId: string; threshold?: number }) => 
      categoriesService.autoCategorize(noteId, threshold),
    onSuccess: (_, { noteId }) => {
      queryClient.invalidateQueries({ queryKey: smartQueryKeys.categories.noteCategories(noteId) });
    },
  });
};

export const useAssignCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ noteId, categoryId }: { noteId: string; categoryId: string }) => 
      categoriesService.assignCategory(noteId, categoryId),
    onSuccess: (_, { noteId }) => {
      queryClient.invalidateQueries({ queryKey: smartQueryKeys.categories.noteCategories(noteId) });
    },
  });
};

export const useUnassignCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ noteId, categoryId }: { noteId: string; categoryId: string }) => 
      categoriesService.unassignCategory(noteId, categoryId),
    onSuccess: (_, { noteId }) => {
      queryClient.invalidateQueries({ queryKey: smartQueryKeys.categories.noteCategories(noteId) });
    },
  });
};

// Hook to get notes by category - this is implemented as a filtered search
// since there's no direct backend endpoint for this
export const useCategoryNotes = (categoryId: string) => {
  return useQuery({
    queryKey: [...smartQueryKeys.categories.detail(categoryId), 'notes'] as const,
    queryFn: async () => {
      // For now, return empty array - this should be implemented properly
      // when backend provides an endpoint to get notes by category
      // Or we could use a search with category filter if available
      return [];
    },
    enabled: !!categoryId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Summaries Hooks
export const useNoteSummary = (noteId: string) => {
  return useQuery({
    queryKey: smartQueryKeys.summaries.note(noteId),
    queryFn: () => summariesService.getNoteSummary(noteId),
    enabled: !!noteId,
  });
};

export const useSummaryStats = () => {
  return useQuery({
    queryKey: smartQueryKeys.summaries.stats(),
    queryFn: () => summariesService.getUserStats(),
  });
};

export const useSummaryTemplates = () => {
  return useQuery({
    queryKey: smartQueryKeys.summaries.templates(),
    queryFn: async () => {
      try {
        const response = await summariesService.getTemplates();
        // Handle both array and object responses
        if (Array.isArray(response)) {
          return response;
        } else if (response && typeof response === 'object' && 'templates' in response) {
          return (response as any).templates || [];
        }
        return [];
      } catch (error) {
        console.error('Failed to fetch summary templates:', error);
        return [];
      }
    },
  });
};

export const useSummaryVersions = (noteId: string) => {
  return useQuery({
    queryKey: smartQueryKeys.summaries.versions(noteId),
    queryFn: () => summariesService.getVersions(noteId),
    enabled: !!noteId,
  });
};

export const useGenerateSummary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ noteId, options }: { noteId: string; options?: GenerateSummaryDto }) =>
      summariesService.generateSummary(noteId, options),
    onSuccess: (_, { noteId }) => {
      queryClient.invalidateQueries({ queryKey: smartQueryKeys.summaries.note(noteId) });
      queryClient.invalidateQueries({ queryKey: smartQueryKeys.summaries.stats() });
    },
  });
};

export const useBatchGenerateSummaries = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: BatchSummaryDto) => summariesService.batchGenerate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smartQueryKeys.summaries.all });
    },
  });
};

export const useDeleteSummary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (noteId: string) => summariesService.deleteSummary(noteId),
    onSuccess: (_, noteId) => {
      queryClient.invalidateQueries({ queryKey: smartQueryKeys.summaries.note(noteId) });
    },
  });
};

// Relations Hooks
export const useRelatedNotes = (noteId: string) => {
  return useQuery({
    queryKey: smartQueryKeys.relations.related(noteId),
    queryFn: async () => {
      try {
        const response = await relationsService.getRelatedNotes(noteId);
        // Ensure we always return an array
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error('Failed to fetch related notes:', error);
        return [];
      }
    },
    enabled: !!noteId,
  });
};

export const useStoredRelations = (noteId: string) => {
  return useQuery({
    queryKey: smartQueryKeys.relations.stored(noteId),
    queryFn: async () => {
      try {
        const response = await relationsService.getStoredRelations(noteId);
        // Ensure we always return an array
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error('Failed to fetch stored relations:', error);
        return [];
      }
    },
    enabled: !!noteId,
  });
};

export const useNoteGraph = (noteId: string) => {
  return useQuery({
    queryKey: smartQueryKeys.relations.graph(noteId),
    queryFn: () => relationsService.getNoteGraph(noteId),
    enabled: !!noteId,
  });
};

export const useRelationsStats = (userId: string) => {
  return useQuery({
    queryKey: smartQueryKeys.relations.stats(userId),
    queryFn: () => relationsService.getStats(userId),
    enabled: !!userId,
  });
};

export const useSaveRelation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ noteId, targetNoteId, relationshipType }: { 
      noteId: string; 
      targetNoteId: string; 
      relationshipType: string 
    }) => relationsService.saveRelation(noteId, targetNoteId, relationshipType),
    onSuccess: (_, { noteId }) => {
      queryClient.invalidateQueries({ queryKey: smartQueryKeys.relations.stored(noteId) });
      queryClient.invalidateQueries({ queryKey: smartQueryKeys.relations.graph(noteId) });
    },
  });
};

export const useAnalyzeRelations = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (noteId: string) => relationsService.analyzeRelations(noteId),
    onSuccess: (_, noteId) => {
      queryClient.invalidateQueries({ queryKey: smartQueryKeys.relations.related(noteId) });
    },
  });
};

export const useDeleteRelation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sourceNoteId, targetNoteId }: { sourceNoteId: string; targetNoteId: string }) =>
      relationsService.deleteRelation(sourceNoteId, targetNoteId),
    onSuccess: (_, { sourceNoteId }) => {
      queryClient.invalidateQueries({ queryKey: smartQueryKeys.relations.stored(sourceNoteId) });
      queryClient.invalidateQueries({ queryKey: smartQueryKeys.relations.graph(sourceNoteId) });
    },
  });
};

// Duplicates Hooks
export const useDuplicateDetection = () => {
  return useQuery({
    queryKey: smartQueryKeys.duplicates.detect(),
    queryFn: async () => {
      try {
        const response = await duplicatesService.detectDuplicates();
        // Ensure we always return an array
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error('Failed to detect duplicates:', error);
        return [];
      }
    },
  });
};

export const useDuplicateReports = () => {
  return useQuery({
    queryKey: smartQueryKeys.duplicates.reports(),
    queryFn: async () => {
      try {
        const response = await duplicatesService.getReports();
        // Ensure we always return an array
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error('Failed to fetch duplicate reports:', error);
        return [];
      }
    },
  });
};

export const useDuplicateStats = () => {
  return useQuery({
    queryKey: smartQueryKeys.duplicates.stats(),
    queryFn: () => duplicatesService.getStats(),
  });
};

export const useCreateDuplicateReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateDuplicateReportDto) => duplicatesService.createReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smartQueryKeys.duplicates.reports() });
    },
  });
};

export const useMergeDuplicates = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: MergeDuplicatesDto) => duplicatesService.mergeDuplicates(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smartQueryKeys.duplicates.all });
      queryClient.invalidateQueries({ queryKey: ['notes'] }); // Also invalidate notes
    },
  });
};

export const useQueueDuplicateDetection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => duplicatesService.queueDetection(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smartQueryKeys.duplicates.reports() });
    },
  });
};