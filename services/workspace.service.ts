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
    return apiClient.get<Workspace[]>('/workspaces');
  },

  /**
   * Get default workspace for current user
   */
  async getDefault(): Promise<Workspace> {
    return apiClient.get<Workspace>('/workspaces/default');
  },

  /**
   * Create new workspace
   */
  async create(data: CreateWorkspaceDto): Promise<Workspace> {
    return apiClient.post<Workspace>('/workspaces', { body: data });
  },

  // Aliases for compatibility
  async getWorkspaces(): Promise<Workspace[]> {
    return this.getAll();
  },

  async getDefaultWorkspace(): Promise<Workspace> {
    return this.getDefault();
  },

  async createWorkspace(data: CreateWorkspaceDto): Promise<Workspace> {
    return this.create(data);
  },
};