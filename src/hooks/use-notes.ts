import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { noteService } from '../services'
import { queryKeys, invalidationHelpers } from './query-keys'
import type {
  Note,
  NoteWithRelations,
  CreateNoteDto,
  UpdateNoteDto,
  SearchNotesDto,
  SearchResult,
  NoteVersion,
  Collaboration,
  Permission,
  ShareLink,
  Attachment,
} from '../types'

// Note queries
export function useNotes(workspaceId?: string, limit?: number) {
  return useQuery({
    queryKey: queryKeys.notes.list(workspaceId, limit),
    queryFn: () => noteService.getNotes(workspaceId, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useNote(id: string) {
  return useQuery({
    queryKey: queryKeys.notes.detail(id),
    queryFn: () => noteService.getNote(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export function useSearchNotes(params: SearchNotesDto) {
  return useQuery({
    queryKey: queryKeys.notes.search(params.q, params),
    queryFn: () => noteService.searchNotes(params),
    enabled: !!params.q && params.q.length > 0,
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Infinite query for paginated notes
export function useInfiniteNotes(workspaceId?: string, limit = 20) {
  return useInfiniteQuery({
    queryKey: ['notes', 'infinite', { workspaceId, limit }],
    queryFn: ({ pageParam = 0 }) => 
      noteService.getNotes(workspaceId, limit),
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length < limit) return undefined
      return pages.length
    },
    staleTime: 2 * 60 * 1000,
  })
}

// Note versions
export function useNoteVersions(noteId: string) {
  return useQuery({
    queryKey: queryKeys.notes.versions(noteId),
    queryFn: () => noteService.getNoteVersions(noteId),
    enabled: !!noteId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useNoteVersion(versionId: string) {
  return useQuery({
    queryKey: queryKeys.notes.version(versionId),
    queryFn: () => noteService.getVersion(versionId),
    enabled: !!versionId,
    staleTime: 10 * 60 * 1000, // 10 minutes (versions don't change)
  })
}

// Collaboration
export function useNoteCollaborators(noteId: string) {
  return useQuery({
    queryKey: queryKeys.notes.collaborators(noteId),
    queryFn: () => noteService.getCollaborators(noteId),
    enabled: !!noteId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Share links
export function useNoteShareLinks(noteId: string) {
  return useQuery({
    queryKey: queryKeys.notes.shareLinks(noteId),
    queryFn: () => noteService.getShareLinks(noteId),
    enabled: !!noteId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Attachments
export function useNoteAttachments(noteId: string) {
  return useQuery({
    queryKey: queryKeys.notes.attachments(noteId),
    queryFn: () => noteService.getAttachments(noteId),
    enabled: !!noteId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Note mutations
export function useCreateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateNoteDto) => noteService.createNote(data),
    onSuccess: (newNote: Note) => {
      // Add to notes list
      queryClient.setQueryData(
        queryKeys.notes.list(newNote.workspaceId),
        (old: Note[] = []) => [newNote, ...old]
      )
      
      // Cache the individual note
      queryClient.setQueryData(queryKeys.notes.detail(newNote.id), newNote)
      
      // Invalidate all notes queries to ensure consistency
      invalidationHelpers.invalidateNotes(queryClient)
      
      toast.success(`Note "${newNote.title}" created successfully`)
    },
    onError: (error: any) => {
      const message = error.response?.message || 'Failed to create note'
      toast.error(message)
    },
  })
}

export function useUpdateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoteDto }) =>
      noteService.updateNote(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.notes.detail(id) })
      
      // Snapshot previous value
      const previousNote = queryClient.getQueryData(queryKeys.notes.detail(id))
      
      // Optimistically update
      queryClient.setQueryData(
        queryKeys.notes.detail(id),
        (old: Note) => old ? { ...old, ...data } : old
      )
      
      return { previousNote, id }
    },
    onError: (err, variables, context) => {
      // Rollback optimistic update
      if (context?.previousNote) {
        queryClient.setQueryData(
          queryKeys.notes.detail(context.id),
          context.previousNote
        )
      }
      
      const message = err instanceof Error ? err.message : 'Failed to update note'
      toast.error(message)
    },
    onSuccess: (updatedNote: Note) => {
      // Update individual note cache
      queryClient.setQueryData(queryKeys.notes.detail(updatedNote.id), updatedNote)
      
      // Update in notes lists
      queryClient.setQueryData(
        queryKeys.notes.list(updatedNote.workspaceId),
        (old: Note[] = []) =>
          old.map(note => note.id === updatedNote.id ? updatedNote : note)
      )
    },
    onSettled: (data, error, { id }) => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.detail(id) })
    },
  })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => noteService.deleteNote(id),
    onSuccess: (_, deletedId) => {
      // Remove from all notes lists
      invalidationHelpers.invalidateNotes(queryClient)
      
      // Remove individual note cache
      queryClient.removeQueries({ queryKey: queryKeys.notes.detail(deletedId) })
      
      toast.success('Note deleted successfully')
    },
    onError: (error: any) => {
      const message = error.response?.message || 'Failed to delete note'
      toast.error(message)
    },
  })
}

// RAG processing
export function useProcessNoteForRAG() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (noteId: string) => noteService.processForRAG(noteId),
    onSuccess: (_, noteId) => {
      toast.success('Note processing for AI search started')
      // The processing happens in background, so we don't need to update cache immediately
    },
    onError: (error: any) => {
      const message = error.response?.message || 'Failed to process note'
      toast.error(message)
    },
  })
}

// Version control mutations
export function useCreateNoteVersion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ noteId, changeLog }: { noteId: string; changeLog?: string }) =>
      noteService.createVersion(noteId, changeLog),
    onSuccess: (newVersion: NoteVersion) => {
      // Add to versions list
      queryClient.setQueryData(
        queryKeys.notes.versions(newVersion.noteId),
        (old: NoteVersion[] = []) => [newVersion, ...old]
      )
      
      toast.success(`Version ${newVersion.version} created`)
    },
    onError: (error: any) => {
      const message = error.response?.message || 'Failed to create version'
      toast.error(message)
    },
  })
}

export function useRestoreNoteVersion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (versionId: string) => noteService.restoreVersion(versionId),
    onSuccess: (restoredNote: Note) => {
      // Update note cache
      queryClient.setQueryData(queryKeys.notes.detail(restoredNote.id), restoredNote)
      
      // Invalidate note to ensure fresh data
      invalidationHelpers.invalidateNote(queryClient, restoredNote.id)
      
      toast.success('Note restored to previous version')
    },
    onError: (error: any) => {
      const message = error.response?.message || 'Failed to restore version'
      toast.error(message)
    },
  })
}

// Collaboration mutations
export function useInviteCollaborator() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ noteId, email, permission }: { 
      noteId: string; 
      email: string; 
      permission: Permission 
    }) => noteService.inviteCollaborator(noteId, email, permission),
    onSuccess: (newCollaboration: Collaboration) => {
      // Add to collaborators list
      queryClient.setQueryData(
        queryKeys.notes.collaborators(newCollaboration.noteId),
        (old: Collaboration[] = []) => [...old, newCollaboration]
      )
      
      toast.success('Collaborator invited successfully')
    },
    onError: (error: any) => {
      const message = error.response?.message || 'Failed to invite collaborator'
      toast.error(message)
    },
  })
}

export function useUpdateCollaboratorPermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ collaborationId, permission }: { 
      collaborationId: string; 
      permission: Permission 
    }) => noteService.updateCollaboratorPermission(collaborationId, permission),
    onSuccess: (updatedCollaboration: Collaboration) => {
      // Update in collaborators list
      queryClient.setQueryData(
        queryKeys.notes.collaborators(updatedCollaboration.noteId),
        (old: Collaboration[] = []) =>
          old.map(collab =>
            collab.id === updatedCollaboration.id ? updatedCollaboration : collab
          )
      )
      
      toast.success('Collaborator permissions updated')
    },
    onError: (error: any) => {
      const message = error.response?.message || 'Failed to update permissions'
      toast.error(message)
    },
  })
}

export function useRemoveCollaborator() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (collaborationId: string) => noteService.removeCollaborator(collaborationId),
    onSuccess: (_, collaborationId) => {
      // We need to invalidate collaborators since we don't know which note this was for
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'notes' && 
          query.queryKey[2] === 'collaborators'
      })
      
      toast.success('Collaborator removed')
    },
    onError: (error: any) => {
      const message = error.response?.message || 'Failed to remove collaborator'
      toast.error(message)
    },
  })
}

// Share link mutations
export function useCreateShareLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ noteId, options }: { 
      noteId: string; 
      options: any 
    }) => noteService.createShareLink(noteId, options),
    onSuccess: (newLink: ShareLink) => {
      // Add to share links list
      queryClient.setQueryData(
        queryKeys.notes.shareLinks(newLink.noteId),
        (old: ShareLink[] = []) => [...old, newLink]
      )
      
      toast.success('Share link created')
    },
    onError: (error: any) => {
      const message = error.response?.message || 'Failed to create share link'
      toast.error(message)
    },
  })
}

// Attachment mutations
export function useUploadAttachment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ noteId, file }: { noteId: string; file: File }) =>
      noteService.uploadAttachment(noteId, file),
    onSuccess: (newAttachment: Attachment) => {
      // Add to attachments list
      queryClient.setQueryData(
        queryKeys.notes.attachments(newAttachment.noteId),
        (old: Attachment[] = []) => [...old, newAttachment]
      )
      
      toast.success(`File "${newAttachment.filename}" uploaded successfully`)
    },
    onError: (error: any) => {
      const message = error.response?.message || 'Failed to upload file'
      toast.error(message)
    },
  })
}