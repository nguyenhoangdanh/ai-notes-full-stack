/**
 * Workspace API Service
 */

import { apiClient } from '../lib/api-client';
import { 
  Workspace, 
  CreateWorkspaceDto, 
  UpdateWorkspaceDto, 
  WorkspaceWithStats 
} from '../types/workspace.types';

export const workspaceService = {
  /**
   * Get all workspaces for current user
   */
  async getAll(): Promise<WorkspaceWithStats[]> {
    return apiClient.get<WorkspaceWithStats[]>('/workspaces');
  },

  /**
   * Get workspace by ID
   */
  async getById(id: string): Promise<Workspace> {
    return apiClient.get<Workspace>(`/workspaces/${id}`);
  },

  /**
   * Create new workspace
   */
  async create(data: CreateWorkspaceDto): Promise<Workspace> {
    return apiClient.post<Workspace>('/workspaces', { body: data });
  },

  /**
   * Update workspace
   */
  async update(id: string, data: UpdateWorkspaceDto): Promise<Workspace> {
    return apiClient.patch<Workspace>(`/workspaces/${id}`, { body: data });
  },

  /**
   * Delete workspace
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/workspaces/${id}`);
  },

  /**
   * Set default workspace
   */
  async setDefault(id: string): Promise<Workspace> {
    return apiClient.patch<Workspace>(`/workspaces/${id}/default`);
  }
};