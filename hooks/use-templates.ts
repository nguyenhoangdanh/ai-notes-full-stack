import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { newTemplatesService, voiceNotesService } from '../services';
import { queryKeys } from './query-keys';
import type {
  Template,
  CreateTemplateDto,
  UpdateTemplateDto,
  TemplateSearchParams,
  VoiceNote,
  CreateVoiceNoteDto,
  UpdateVoiceNoteDto,
} from '../types';

// Template hooks
export function useTemplates() {
  return useQuery({
    queryKey: queryKeys.templates?.list() || ['templates'],
    queryFn: () => newTemplatesService.getMyTemplates(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePublicTemplates() {
  return useQuery({
    queryKey: queryKeys.templates?.public() || ['templates', 'public'],
    queryFn: () => newTemplatesService.getPublicTemplates(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useTemplateCategories() {
  return useQuery({
    queryKey: queryKeys.templates?.categories() || ['templates', 'categories'],
    queryFn: () => newTemplatesService.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useTemplateRecommendations() {
  return useQuery({
    queryKey: queryKeys.templates?.recommendations() || ['templates', 'recommendations'],
    queryFn: () => newTemplatesService.getRecommendations(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useSearchTemplates(params: TemplateSearchParams) {
  return useQuery({
    queryKey: ['templates', 'search', params],
    queryFn: () => newTemplatesService.searchTemplates(params),
    enabled: !!params.query,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useTemplate(templateId: string) {
  return useQuery({
    queryKey: queryKeys.templates?.detail(templateId) || ['templates', templateId],
    queryFn: () => newTemplatesService.getTemplate(templateId),
    enabled: !!templateId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTemplateStats(templateId: string) {
  return useQuery({
    queryKey: ['templates', templateId, 'stats'],
    queryFn: () => newTemplatesService.getTemplateStats(templateId),
    enabled: !!templateId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useTemplatePreview(templateId: string, data?: Record<string, any>) {
  return useQuery({
    queryKey: ['templates', templateId, 'preview', data],
    queryFn: () => newTemplatesService.getTemplatePreview(templateId, data),
    enabled: !!templateId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Template mutations
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTemplateDto) => newTemplatesService.createTemplate(data),
    onSuccess: (newTemplate: Template) => {
      // Add to templates list
      queryClient.setQueryData(
        queryKeys.templates?.list() || ['templates'],
        (old: Template[] = []) => [newTemplate, ...old]
      );
      
      toast.success(`Template "${newTemplate.name}" created successfully`);
    },
    onError: (error: any) => {
      const message = error?.response?.message || 'Failed to create template';
      toast.error(message);
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: UpdateTemplateDto }) =>
      newTemplatesService.updateTemplate(templateId, data),
    onSuccess: (updatedTemplate: Template) => {
      // Update individual template cache
      queryClient.setQueryData(
        queryKeys.templates?.detail(updatedTemplate.id) || ['templates', updatedTemplate.id],
        updatedTemplate
      );
      
      // Update in templates lists
      queryClient.setQueryData(
        queryKeys.templates?.list() || ['templates'],
        (old: Template[] = []) =>
          old.map(template => template.id === updatedTemplate.id ? updatedTemplate : template)
      );
      
      toast.success(`Template "${updatedTemplate.name}" updated successfully`);
    },
    onError: (error: any) => {
      const message = error?.response?.message || 'Failed to update template';
      toast.error(message);
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) => newTemplatesService.deleteTemplate(templateId),
    onSuccess: (_, deletedId) => {
      // Remove from templates lists
      queryClient.setQueryData(
        queryKeys.templates?.list() || ['templates'],
        (old: Template[] = []) => old.filter(template => template.id !== deletedId)
      );
      
      // Remove individual template cache
      queryClient.removeQueries({ 
        queryKey: queryKeys.templates?.detail(deletedId) || ['templates', deletedId] 
      });
      
      toast.success('Template deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.message || 'Failed to delete template';
      toast.error(message);
    },
  });
}

export function useDuplicateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) => newTemplatesService.duplicateTemplate(templateId),
    onSuccess: (duplicatedTemplate: Template) => {
      // Add to templates list
      queryClient.setQueryData(
        queryKeys.templates?.list() || ['templates'],
        (old: Template[] = []) => [duplicatedTemplate, ...old]
      );
      
      toast.success(`Template duplicated as "${duplicatedTemplate.name}"`);
    },
    onError: (error: any) => {
      const message = error?.response?.message || 'Failed to duplicate template';
      toast.error(message);
    },
  });
}

export function useProcessTemplate() {
  return useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: Record<string, any> }) =>
      newTemplatesService.processTemplate(templateId, data),
    onSuccess: () => {
      toast.success('Template processed successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.message || 'Failed to process template';
      toast.error(message);
    },
  });
}

// Voice Notes hooks
export function useVoiceNotes() {
  return useQuery({
    queryKey: ['voice-notes'],
    queryFn: () => voiceNotesService.getVoiceNotes(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useVoiceNote(id: string) {
  return useQuery({
    queryKey: ['voice-notes', id],
    queryFn: () => voiceNotesService.getVoiceNote(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useVoiceNoteStats() {
  return useQuery({
    queryKey: ['voice-notes', 'stats'],
    queryFn: () => voiceNotesService.getVoiceNoteStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useVoiceNoteTranscription(id: string) {
  return useQuery({
    queryKey: ['voice-notes', id, 'transcription'],
    queryFn: () => voiceNotesService.getTranscription(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000, // 30 minutes (transcriptions don't change)
  });
}

// Voice Notes mutations
export function useUploadVoiceNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, data }: { file: File; data?: CreateVoiceNoteDto }) =>
      voiceNotesService.uploadVoiceNote(file, data),
    onSuccess: (newVoiceNote: VoiceNote) => {
      // Add to voice notes list
      queryClient.setQueryData(
        ['voice-notes'],
        (old: VoiceNote[] = []) => [newVoiceNote, ...old]
      );
      
      toast.success(`Voice note "${newVoiceNote.filename}" uploaded successfully`);
    },
    onError: (error: any) => {
      const message = error?.response?.message || 'Failed to upload voice note';
      toast.error(message);
    },
  });
}

export function useCreateVoiceNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVoiceNoteDto) => voiceNotesService.createVoiceNote(data),
    onSuccess: (newVoiceNote: VoiceNote) => {
      // Add to voice notes list
      queryClient.setQueryData(
        ['voice-notes'],
        (old: VoiceNote[] = []) => [newVoiceNote, ...old]
      );
      
      toast.success('Voice note created successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.message || 'Failed to create voice note';
      toast.error(message);
    },
  });
}

export function useUpdateVoiceNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVoiceNoteDto }) =>
      voiceNotesService.updateVoiceNote(id, data),
    onSuccess: (updatedVoiceNote: VoiceNote) => {
      // Update individual voice note cache
      queryClient.setQueryData(['voice-notes', updatedVoiceNote.id], updatedVoiceNote);
      
      // Update in voice notes list
      queryClient.setQueryData(
        ['voice-notes'],
        (old: VoiceNote[] = []) =>
          old.map(note => note.id === updatedVoiceNote.id ? updatedVoiceNote : note)
      );
      
      toast.success('Voice note updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.message || 'Failed to update voice note';
      toast.error(message);
    },
  });
}

export function useDeleteVoiceNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => voiceNotesService.deleteVoiceNote(id),
    onSuccess: (_, deletedId) => {
      // Remove from voice notes list
      queryClient.setQueryData(
        ['voice-notes'],
        (old: VoiceNote[] = []) => old.filter(note => note.id !== deletedId)
      );
      
      // Remove individual voice note cache
      queryClient.removeQueries({ queryKey: ['voice-notes', deletedId] });
      
      toast.success('Voice note deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.message || 'Failed to delete voice note';
      toast.error(message);
    },
  });
}

export function useRetryTranscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => voiceNotesService.retryTranscription(id),
    onSuccess: (updatedVoiceNote: VoiceNote) => {
      // Update individual voice note cache
      queryClient.setQueryData(['voice-notes', updatedVoiceNote.id], updatedVoiceNote);
      
      toast.success('Transcription retry started');
    },
    onError: (error: any) => {
      const message = error?.response?.message || 'Failed to retry transcription';
      toast.error(message);
    },
  });
}