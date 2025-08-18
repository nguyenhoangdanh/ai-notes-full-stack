import { PomodoroType, SessionStatus, TaskStatus, TaskPriority, ReviewType } from './common.types'

interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

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