/**
 * Productivity Module Types
 * Complete mapping with backend productivity features
 */

// Tasks Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  noteId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  noteId?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  byPriority: Record<string, number>;
  byStatus: Record<string, number>;
}

// Pomodoro Types
export interface PomodoroSession {
  id: string;
  userId: string;
  noteId?: string;
  duration: number; // in minutes
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  startedAt: string;
  completedAt?: string;
  pausedAt?: string;
  type: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';
}

export interface PomodoroStats {
  totalSessions: number;
  totalWorkTime: number; // in minutes
  totalBreakTime: number;
  streakDays: number;
  averageSessionLength: number;
  productivity: number; // percentage
}

export interface PomodoroSettings {
  workDuration: number; // 25 minutes default
  shortBreakDuration: number; // 5 minutes default
  longBreakDuration: number; // 15 minutes default
  sessionsUntilLongBreak: number; // 4 sessions default
  autoStartBreaks: boolean;
  notifications: boolean;
}

// Calendar Types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  noteId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCalendarEventDto {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  noteId?: string;
}

export interface UpdateCalendarEventDto {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
}

// Review Types (Spaced Repetition)
export interface ReviewItem {
  id: string;
  noteId: string;
  userId: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  interval: number; // days until next review
  repetitions: number;
  easeFactor: number;
  nextReview: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  totalReviews: number;
  dueToday: number;
  overdue: number;
  retentionRate: number;
  averageEaseFactor: number;
}

export interface SpacedRepetitionSettings {
  initialInterval: number; // 1 day default
  easeFactor: number; // 2.5 default
  minimumEaseFactor: number; // 1.3 default
  maximumInterval: number; // 365 days default
  updatedAt: string;
  note?: {
    id: string;
    title: string;
  };
}

export interface ReminderStats {
  totalReminders: number;
  completedReminders: number;
  overdueReminders: number;
  dueTodayReminders: number;
  upcomingReminders: number;
  averageCompletionTime: number;
}

// Tasks types - Updated to match backend exactly
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface CreateTaskDto {
  title: string;
  description?: string;
  noteId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  tags?: string[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  noteId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  completedAt?: string;
  tags?: string[];
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  description?: string;
  noteId?: string;
  priority: TaskPriority;
  dueDate?: string;
  completedAt?: string;
  tags: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
  note?: {
    id: string;
    title: string;
  };
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  dueTodayTasks: number;
  inProgressTasks: number;
  averageCompletionTime: number;
  completionRate: number;
  productivityScore: number;
}

// Calendar types - Updated to match backend exactly
export interface CreateCalendarEventDto {
  title: string;
  description?: string;
  noteId?: string;
  startTime: string;
  endTime: string;
  location?: string;
  isAllDay?: boolean;
  recurrence?: string; // RRULE format
}

export interface UpdateCalendarEventDto {
  title?: string;
  description?: string;
  noteId?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  isAllDay?: boolean;
  recurrence?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  noteId?: string;
  startTime: string;
  endTime: string;
  location?: string;
  isAllDay: boolean;
  recurrence?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  note?: {
    id: string;
    title: string;
  };
}

// Pomodoro types - Updated to match backend exactly
export type PomodoroType = 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';

export interface CreatePomodoroSessionDto {
  noteId?: string;
  duration: number; // in minutes
  type?: PomodoroType;
  startedAt: string;
}

export interface UpdatePomodoroSessionDto {
  completedAt?: string;
  status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
}

export interface PomodoroSession {
  id: string;
  noteId?: string;
  duration: number;
  type: PomodoroType;
  startedAt: string;
  completedAt?: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  userId: string;
  createdAt: string;
  updatedAt: string;
  note?: {
    id: string;
    title: string;
  };
}

export interface PomodoroStats {
  totalSessions: number;
  completedSessions: number;
  totalFocusTime: number; // in minutes
  averageSessionLength: number;
  longestStreak: number;
  currentStreak: number;
  todaysSessions: number;
  weeklyGoal: number;
  weeklyProgress: number;
  dailyDistribution: Array<{
    date: string;
    sessions: number;
    focusTime: number;
  }>;
}

// Review types - Updated to match backend exactly
export type ReviewType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';

export interface CreateReviewPromptDto {
  type: ReviewType;
  title: string;
  questions: string[];
  frequency: string; // daily, weekly, monthly
  nextDue: string;
  isActive?: boolean;
}

export interface UpdateReviewPromptDto {
  type?: ReviewType;
  title?: string;
  questions?: string[];
  frequency?: string;
  nextDue?: string;
  lastAnswered?: string;
  isActive?: boolean;
}

export interface AnswerReviewDto {
  answers: string[];
}

export interface ReviewPrompt {
  id: string;
  type: ReviewType;
  title: string;
  questions: string[];
  frequency: string;
  nextDue: string;
  lastAnswered?: string;
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSession {
  id: string;
  reviewPromptId: string;
  answers: string[];
  createdAt: string;
}

export interface ReviewStats {
  totalReviews: number;
  dueReviews: number;
  completedToday: number;
  averageQuality: number;
  totalTimeSpent: number;
  streakDays: number;
  retentionRate: number;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
}