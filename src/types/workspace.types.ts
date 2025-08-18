/**
 * Workspace Types
 */

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkspaceDto {
  name: string;
  isDefault?: boolean;
}

export interface UpdateWorkspaceDto {
  name?: string;
  isDefault?: boolean;
}

export interface WorkspaceWithStats {
  id: string;
  name: string;
  ownerId: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  noteCount: number;
  lastActivity?: string;
}