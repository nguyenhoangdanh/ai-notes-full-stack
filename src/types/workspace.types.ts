import { BaseEntity } from './common.types'

// Workspace entity
export interface Workspace extends BaseEntity {
  name: string
  ownerId: string
  isDefault: boolean
}

// Workspace DTOs
export interface CreateWorkspaceDto {
  name: string
}

export interface UpdateWorkspaceDto {
  name?: string
}