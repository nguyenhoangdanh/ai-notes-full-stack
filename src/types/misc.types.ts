import { BaseEntity } from './common.types'

// Notifications
export interface Notification extends BaseEntity {
  userId: string
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  noteId?: string
}

export enum NotificationType {
  REMINDER = 'REMINDER',
  COLLABORATION = 'COLLABORATION',
  SYSTEM = 'SYSTEM',
  AI_SUGGESTION = 'AI_SUGGESTION'
}

export interface Reminder extends BaseEntity {
  noteId: string
  userId: string
  title: string
  remindAt: string
  isComplete: boolean
  recurrence?: string // daily, weekly, monthly
}

// Search and analytics
export interface SearchHistory extends BaseEntity {
  userId: string
  query: string
  filters?: Record<string, any>
  resultCount: number
  searchedAt: string
}

export interface SavedSearch extends BaseEntity {
  userId: string
  name: string
  query: string
  filters?: Record<string, any>
  isDefault: boolean
}

export interface SearchRanking extends BaseEntity {
  noteId: string
  query: string
  score: number
  factors: Record<string, any>
}

// User activity tracking
export interface UserActivity extends BaseEntity {
  userId: string
  action: string // CREATE, UPDATE, DELETE, VIEW, SEARCH
  noteId?: string
  metadata?: Record<string, any>
}

// Templates
export interface Template extends BaseEntity {
  name: string
  description?: string
  content: string
  tags: string[]
  isPublic: boolean
  ownerId: string
  metadata?: Record<string, any>
}

// DTOs
export interface CreateNotificationDto {
  title: string
  message: string
  type: NotificationType
  noteId?: string
}

export interface CreateReminderDto {
  noteId: string
  title: string
  remindAt: string
  recurrence?: string
}

export interface CreateSavedSearchDto {
  name: string
  query: string
  filters?: Record<string, any>
  isDefault?: boolean
}

export interface CreateTemplateDto {
  name: string
  description?: string
  content: string
  tags?: string[]
  isPublic?: boolean
  metadata?: Record<string, any>
}

export interface UpdateTemplateDto {
  name?: string
  description?: string
  content?: string
  tags?: string[]
  isPublic?: boolean
  metadata?: Record<string, any>
}