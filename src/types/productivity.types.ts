import { BaseEntity } from './common.types'

// Productivity features
export interface PomodoroSession extends BaseEntity {
  noteId?: string
  userId: string
  duration: number // in minutes
  type: PomodoroType
  status: SessionStatus
  startedAt: string
  completedAt?: string
}

export enum PomodoroType {
  WORK = 'WORK',
  SHORT_BREAK = 'SHORT_BREAK',
  LONG_BREAK = 'LONG_BREAK'
}

export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Task extends BaseEntity {
  noteId?: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  completedAt?: string
  ownerId: string
  tags: string[]
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface CalendarEvent extends BaseEntity {
  noteId?: string
  title: string
  description?: string
  startTime: string
  endTime: string
  location?: string
  ownerId: string
  isAllDay: boolean
  recurrence?: string // RRULE format
}

export interface ReviewPrompt extends BaseEntity {
  userId: string
  type: ReviewType
  title: string
  questions: string[]
  frequency: string // daily, weekly, monthly
  nextDue: string
  lastAnswered?: string
  isActive: boolean
}

export enum ReviewType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  CUSTOM = 'CUSTOM'
}

// DTOs for productivity features
export interface CreatePomodoroSessionDto {
  noteId?: string
  duration: number
  type: PomodoroType
}

export interface UpdatePomodoroSessionDto {
  status?: SessionStatus
  completedAt?: string
}

export interface CreateTaskDto {
  noteId?: string
  title: string
  description?: string
  priority?: TaskPriority
  dueDate?: string
  tags?: string[]
}

export interface UpdateTaskDto {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string
  tags?: string[]
}

export interface CreateCalendarEventDto {
  noteId?: string
  title: string
  description?: string
  startTime: string
  endTime: string
  location?: string
  isAllDay?: boolean
  recurrence?: string
}

export interface UpdateCalendarEventDto {
  title?: string
  description?: string
  startTime?: string
  endTime?: string
  location?: string
  isAllDay?: boolean
  recurrence?: string
}