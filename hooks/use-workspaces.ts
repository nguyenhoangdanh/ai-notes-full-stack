import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { workspaceService } from '../services'
import { queryKeys, invalidationHelpers } from './query-keys'
import type { Workspace, CreateWorkspaceDto } from '../types'

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
      
      toast.success(`Workspace "${newWorkspace.name}" created successfully`)
    },
    onError: (error: any) => {
      const message = error.response?.message || 'Failed to create workspace'
      toast.error(message)
    },
  })
}

export function useWorkspace(workspaceId: string) {
  return useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => Promise.resolve({
      id: workspaceId,
      name: 'Sample Workspace',
      description: 'This is a sample workspace',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      members: []
    }),
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useWorkspaceNotes(workspaceId: string) {
  return useQuery({
    queryKey: ['workspace-notes', workspaceId],
    queryFn: () => Promise.resolve([]),
    enabled: !!workspaceId,
    staleTime: 2 * 60 * 1000,
  })
}