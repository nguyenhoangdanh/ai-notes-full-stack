/**
 * Workspace API Service
 */

import { apiClient } from '../lib/api-client';
import { 
  Workspace, 
  CreateWorkspaceDto
} from '../types/workspace.types';

export const workspaceService = {
  /**
   * Get all workspaces for current user
   */
  async getAll(): Promise<Workspace[]> {
    return await apiClient.get<Workspace[]>('/workspaces');
  },

  /**
   * Get default workspace for current user
   */
  async getDefault(): Promise<Workspace> {
    return await apiClient.get<Workspace>('/workspaces/default');
  },

  /**
   * Create new workspace
   */
  async create(data: CreateWorkspaceDto): Promise<Workspace> {
    return await apiClient.post<Workspace>('/workspaces', { body: data });
  },

  // Aliases for compatibility
  async getWorkspaces(): Promise<Workspace[]> {
    // return this.getAll();
    const rs = await apiClient.get<Workspace[]>('/workspaces');
    return rs;
  },

  async getDefaultWorkspace(): Promise<Workspace> {
   return await apiClient.get<Workspace>('/workspaces/default');
  },

  async createWorkspace(data: CreateWorkspaceDto): Promise<Workspace> {
    return await apiClient.post<Workspace>('/workspaces', { body: data });
  },
};