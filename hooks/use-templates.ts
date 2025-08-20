import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { 
  templatesService,
  type Template,
  type CreateTemplateDto,
  type UpdateTemplateDto,
  type TemplateSearchParams
} from '../services/templates.service'
import { 
  voiceNotesService,
  type VoiceNote,
  type CreateVoiceNoteDto,
  type VoiceNoteStats
} from '../services/voice-notes.service'
import { queryKeys } from './query-keys'

// =============================================================================
// TEMPLATE HOOKS
// =============================================================================

/**
 * Get user's templates
 */
export function useTemplates() {
  return useQuery({
    queryKey: queryKeys.templates.myTemplates(),
    queryFn: templatesService.getMyTemplates,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get public templates
 */
export function usePublicTemplates() {
  return useQuery({
    queryKey: queryKeys.templates.publicTemplates(),
    queryFn: templatesService.getPublicTemplates,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Get template categories
 */
export function useTemplateCategories() {
  return useQuery({
    queryKey: queryKeys.templates.categories(),
    queryFn: templatesService.getCategories,
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

/**
 * Get template by ID
 */
export function useTemplate(templateId: string) {
  return useQuery({
    queryKey: queryKeys.templates.template(templateId),
    queryFn: () => templatesService.getTemplate(templateId),
    enabled: !!templateId,
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Search templates
 */
export function useSearchTemplates(params: TemplateSearchParams) {
  return useQuery({
    queryKey: queryKeys.templates.search(params),
    queryFn: () => templatesService.searchTemplates(params),
    enabled: !!(params.query || params.tags?.length || params.category),
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Create a new template
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTemplateDto) => templatesService.createTemplate(data),
    onSuccess: (newTemplate: Template) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.myTemplates() })
      if (newTemplate.isPublic) {
        queryClient.invalidateQueries({ queryKey: queryKeys.templates.publicTemplates() })
      }
      toast.success(`Template "${newTemplate.name}" created`)
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to create template')
    },
  })
}

/**
 * Update template
 */
export function useUpdateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: UpdateTemplateDto }) =>
      templatesService.updateTemplate(templateId, data),
    onSuccess: (updatedTemplate: Template) => {
      queryClient.setQueryData(
        queryKeys.templates.template(updatedTemplate.id),
        updatedTemplate
      )
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.myTemplates() })
      if (updatedTemplate.isPublic) {
        queryClient.invalidateQueries({ queryKey: queryKeys.templates.publicTemplates() })
      }
      toast.success('Template updated')
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to update template')
    },
  })
}

/**
 * Delete template
 */
export function useDeleteTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (templateId: string) => templatesService.deleteTemplate(templateId),
    onSuccess: (_, templateId) => {
      queryClient.removeQueries({ queryKey: queryKeys.templates.template(templateId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.myTemplates() })
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.publicTemplates() })
      toast.success('Template deleted')
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to delete template')
    },
  })
}

// =============================================================================
// VOICE NOTE HOOKS
// =============================================================================

/**
 * Get all voice notes
 */
export function useVoiceNotes() {
  return useQuery({
    queryKey: queryKeys.voiceNotes.all(),
    queryFn: voiceNotesService.getVoiceNotes,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Get voice note statistics
 */
export function useVoiceNoteStats() {
  return useQuery({
    queryKey: queryKeys.voiceNotes.stats(),
    queryFn: voiceNotesService.getVoiceNoteStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Upload voice note
 */
export function useUploadVoiceNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ file, data }: { file: File; data?: CreateVoiceNoteDto }) =>
      voiceNotesService.uploadVoiceNote(file, data),
    onSuccess: (newVoiceNote: VoiceNote) => {
      queryClient.setQueryData(
        queryKeys.voiceNotes.all(),
        (old: VoiceNote[] = []) => [newVoiceNote, ...old]
      )
      queryClient.invalidateQueries({ queryKey: queryKeys.voiceNotes.stats() })
      toast.success('Voice note uploaded successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to upload voice note')
    },
  })
}

/**
 * Delete voice note
 */
export function useDeleteVoiceNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (voiceNoteId: string) => voiceNotesService.deleteVoiceNote(voiceNoteId),
    onSuccess: (_, voiceNoteId) => {
      queryClient.setQueryData(
        queryKeys.voiceNotes.all(),
        (old: VoiceNote[] = []) => old.filter(note => note.id !== voiceNoteId)
      )
      queryClient.invalidateQueries({ queryKey: queryKeys.voiceNotes.stats() })
      toast.success('Voice note deleted')
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to delete voice note')
    },
  })
}