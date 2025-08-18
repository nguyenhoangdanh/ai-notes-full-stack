import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { workspaceService } from '../services'
import { queryKeys } from './query-keys'
import type { Workspace, CreateWorkspaceDto, UpdateWorkspaceDto } from '../types'

// Workspace queries
export function useWorkspaces() {
  return useQuery({
    queryKey: queryKeys.workspaces.all(),
    queryFn: workspaceService.getWorkspaces,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useDefaultWorkspace() {
  return useQuery({
    queryKey: queryKeys.workspaces.default(),
    queryFn: workspaceService.getDefaultWorkspace,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useWorkspace(id: string) {
  return useQuery({
    queryKey: queryKeys.workspaces.detail(id),
    queryFn: () => workspaceService.getWorkspace(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Workspace mutations
export function useCreateWorkspace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateWorkspaceDto) => workspaceService.createWorkspace(data),
    onSuccess: (newWorkspace: Workspace) => {
      // Add to workspaces list
      queryClient.setQueryData(
        queryKeys.workspaces.all(),
        (old: Workspace[] = []) => [...old, newWorkspace]
      )
      
      // Cache the individual workspace
      queryClient.setQueryData(queryKeys.workspaces.detail(newWorkspace.id), newWorkspace)
      
      toast.success(`Workspace "${newWorkspace.name}" created successfully`)
    },
    onError: (error: any) => {
      const message = error.response?.message || 'Failed to create workspace'
      toast.error(message)
    },
  })
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkspaceDto }) =>
      workspaceService.updateWorkspace(id, data),
    onSuccess: (updatedWorkspace: Workspace) => {
      // Update in workspaces list
      queryClient.setQueryData(
        queryKeys.workspaces.all(),
        (old: Workspace[] = []) =>
          old.map(workspace =>
            workspace.id === updatedWorkspace.id ? updatedWorkspace : workspace
          )
      )
      
      // Update individual workspace cache
      queryClient.setQueryData(
        queryKeys.workspaces.detail(updatedWorkspace.id),
        updatedWorkspace
      )
      
      toast.success(`Workspace "${updatedWorkspace.name}" updated successfully`)
    },
    onError: (error: any) => {
      const message = error.response?.message || 'Failed to update workspace'
      toast.error(message)
    },
  })
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => workspaceService.deleteWorkspace(id),
    onSuccess: (_, deletedId) => {
      // Remove from workspaces list
      queryClient.setQueryData(
        queryKeys.workspaces.all(),
        (old: Workspace[] = []) => old.filter(workspace => workspace.id !== deletedId)
      )
      
      // Remove individual workspace cache
      queryClient.removeQueries({ queryKey: queryKeys.workspaces.detail(deletedId) })
      
      // Invalidate notes that might belong to this workspace
      invalidationHelpers.invalidateNotes(queryClient)
      
      toast.success('Workspace deleted successfully')
    },
    onError: (error: any) => {
      const message = error.response?.message || 'Failed to delete workspace'
      toast.error(message)
    },
  })
}