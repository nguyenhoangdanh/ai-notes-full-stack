import { getApiClient } from '../lib/api-client'
import type {
  Workspace,
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
} from '../types'

export const workspaceService = {
  // Get all workspaces for current user
  async getWorkspaces(): Promise<Workspace[]> {
    return getApiClient().get<Workspace[]>('/workspaces')
  },

  // Get default workspace
  async getDefaultWorkspace(): Promise<Workspace> {
    return getApiClient().get<Workspace>('/workspaces/default')
  },

  // Create new workspace
  async createWorkspace(data: CreateWorkspaceDto): Promise<Workspace> {
    return getApiClient().post<Workspace>('/workspaces', { body: data })
  },

  // Update workspace
  async updateWorkspace(id: string, data: UpdateWorkspaceDto): Promise<Workspace> {
    return getApiClient().patch<Workspace>(`/workspaces/${id}`, { body: data })
  },

  // Delete workspace
  async deleteWorkspace(id: string): Promise<void> {
    return getApiClient().delete<void>(`/workspaces/${id}`)
  },

  // Get workspace by ID
  async getWorkspace(id: string): Promise<Workspace> {
    return getApiClient().get<Workspace>(`/workspaces/${id}`)
  },
}