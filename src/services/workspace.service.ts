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
  },

  /**
   * Get all workspaces (alias for getAll)
   */
  async getWorkspaces(): Promise<WorkspaceWithStats[]> {
    return this.getAll();
  },

  /**
   * Get workspace by ID (alias for getById)
   */
  async getWorkspace(id: string): Promise<Workspace> {
    return this.getById(id);
  },

  /**
   * Get default workspace
   */
  async getDefaultWorkspace(): Promise<Workspace> {
    return apiClient.get<Workspace>('/workspaces/default');
  },

  /**
   * Create workspace (alias for create)
   */
  async createWorkspace(data: CreateWorkspaceDto): Promise<Workspace> {
    return this.create(data);
  },

  /**
   * Update workspace (alias for update)
   */
  async updateWorkspace(id: string, data: UpdateWorkspaceDto): Promise<Workspace> {
    return this.update(id, data);
  },

  /**
   * Delete workspace (alias for delete)
   */
  async deleteWorkspace(id: string): Promise<void> {
    return this.delete(id);
  }
};