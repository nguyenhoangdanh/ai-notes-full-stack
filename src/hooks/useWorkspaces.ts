/**
 * Workspaces React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { workspaceService } from '../services/workspace.service';
import { queryKeys } from './query-keys';
import { 
  CreateWorkspaceDto, 
  UpdateWorkspaceDto,
  Workspace 
} from '../types/workspace.types';

export function useWorkspaces() {
  return useQuery({
    queryKey: queryKeys.workspaces.all(),
    queryFn: workspaceService.getAll,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useWorkspace(id: string) {
  return useQuery({
    queryKey: queryKeys.workspaces.byId(id),
    queryFn: () => workspaceService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workspaceService.create,
    onSuccess: (newWorkspace: Workspace) => {
      // Invalidate workspaces list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.workspaces.all()
      });
      
      // Set the new workspace in cache
      queryClient.setQueryData(
        queryKeys.workspaces.byId(newWorkspace.id),
        newWorkspace
      );
      
      toast.success('Workspace created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to create workspace');
    },
  });
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkspaceDto }) =>
      workspaceService.update(id, data),
    onSuccess: (updatedWorkspace: Workspace) => {
      // Update the workspace in cache
      queryClient.setQueryData(
        queryKeys.workspaces.byId(updatedWorkspace.id),
        updatedWorkspace
      );
      
      // Invalidate workspaces list to reflect changes
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.workspaces.all()
      });
      
      toast.success('Workspace updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to update workspace');
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workspaceService.delete,
    onSuccess: (_, workspaceId) => {
      // Remove the workspace from cache
      queryClient.removeQueries({ 
        queryKey: queryKeys.workspaces.byId(workspaceId)
      });
      
      // Invalidate workspaces list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.workspaces.all()
      });
      
      // Invalidate notes that might belong to this workspace
      queryClient.invalidateQueries({ 
        queryKey: ['notes']
      });
      
      toast.success('Workspace deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to delete workspace');
    },
  });
}

export function useSetDefaultWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workspaceService.setDefault,
    onSuccess: (updatedWorkspace: Workspace) => {
      // Update the workspace in cache
      queryClient.setQueryData(
        queryKeys.workspaces.byId(updatedWorkspace.id),
        updatedWorkspace
      );
      
      // Invalidate all workspaces to update default status
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.workspaces.all()
      });
      
      toast.success('Default workspace updated!');
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Failed to set default workspace');
    },
  });
}