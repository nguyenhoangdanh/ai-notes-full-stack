/**
 * Notes React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { noteService } from '../services/note.service';
import { queryKeys } from './query-keys';
import { 
  CreateNoteDto, 
  UpdateNoteDto, 
  SearchNotesDto,
  Note 
} from '../types/note.types';

export function useNotes(workspaceId?: string, limit?: number) {
  return useQuery({
    queryKey: queryKeys.notes.all(workspaceId, limit),
    queryFn: () => noteService.getAll(workspaceId, limit),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useNote(id: string) {
  return useQuery({
    queryKey: queryKeys.notes.byId(id),
    queryFn: () => noteService.getById(id),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useNoteWithAnalytics(id: string) {
  return useQuery({
    queryKey: queryKeys.notes.withAnalytics(id),
    queryFn: () => noteService.getWithAnalytics(id),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useNoteVersions(id: string) {
  return useQuery({
    queryKey: queryKeys.notes.versions(id),
    queryFn: () => noteService.getVersions(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useSearchNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: SearchNotesDto) => noteService.search(params),
    onSuccess: (data, variables) => {
      // Cache search results
      queryClient.setQueryData(
        queryKeys.notes.search(variables),
        data
      );
    },
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: noteService.create,
    onSuccess: (newNote: Note) => {
      // Invalidate notes list
      queryClient.invalidateQueries({ 
        queryKey: ['notes'] 
      });
      
      // Set the new note in cache
      queryClient.setQueryData(
        queryKeys.notes.byId(newNote.id),
        newNote
      );
      
      toast.success('Note created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to create note');
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoteDto }) =>
      noteService.update(id, data),
    onSuccess: (updatedNote: Note) => {
      // Update the note in cache
      queryClient.setQueryData(
        queryKeys.notes.byId(updatedNote.id),
        updatedNote
      );
      
      // Invalidate notes list to reflect changes
      queryClient.invalidateQueries({ 
        queryKey: ['notes'] 
      });
      
      toast.success('Note updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to update note');
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: noteService.delete,
    onSuccess: (_, noteId) => {
      // Remove the note from cache
      queryClient.removeQueries({ 
        queryKey: queryKeys.notes.byId(noteId)
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['notes'] 
      });
      
      toast.success('Note deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to delete note');
    },
  });
}

export function useProcessNoteForRAG() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: noteService.processForRAG,
    onSuccess: (_, noteId) => {
      // Invalidate note to refresh processing status
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notes.byId(noteId)
      });
      
      toast.success('Note processing started for AI search');
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to process note');
    },
  });
}

export function useRestoreNoteVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) =>
      noteService.restoreVersion(id, version),
    onSuccess: (restoredNote: Note) => {
      // Update the note in cache
      queryClient.setQueryData(
        queryKeys.notes.byId(restoredNote.id),
        restoredNote
      );
      
      // Invalidate versions to show new version
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notes.versions(restoredNote.id)
      });
      
      toast.success('Note version restored successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to restore note version');
    },
  });
}