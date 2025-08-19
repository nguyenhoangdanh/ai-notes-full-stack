// Notifications types
export interface CreateNotificationDto {
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  actionUrl?: string;
  actionLabel?: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH';
  scheduledFor?: string;
}

export interface UpdateNotificationDto {
  title?: string;
  message?: string;
  type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  actionUrl?: string;
  actionLabel?: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH';
  isRead?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  actionUrl?: string;
  actionLabel?: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  isRead: boolean;
  userId: string;
  scheduledFor?: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Reminders types
export interface CreateReminderDto {
  title: string;
  description?: string;
  noteId?: string;
  reminderDate: string;
  repeatInterval?: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  repeatUntil?: string;
  tags?: string[];
}

export interface UpdateReminderDto {
  title?: string;
  description?: string;
  noteId?: string;
  reminderDate?: string;
  repeatInterval?: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  repeatUntil?: string;
  tags?: string[];
  isCompleted?: boolean;
  completedAt?: string;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  noteId?: string;
  reminderDate: string;
  repeatInterval: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  repeatUntil?: string;
  tags: string[];
  isCompleted: boolean;
  completedAt?: string;
  userId: string;
  createdAt: string;
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

// Tasks types - Enhanced version
export interface CreateTaskDto {
  title: string;
  description?: string;
  noteId?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  tags?: string[];
  estimatedMinutes?: number;
  parentTaskId?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  noteId?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  completedAt?: string;
  tags?: string[];
  estimatedMinutes?: number;
  actualMinutes?: number;
  parentTaskId?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  noteId?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  completedAt?: string;
  tags: string[];
  estimatedMinutes?: number;
  actualMinutes?: number;
  parentTaskId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  note?: {
    id: string;
    title: string;
  };
  subtasks?: Task[];
  parent?: Task;
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

// Calendar types
export interface CreateCalendarEventDto {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  noteId?: string;
  tags?: string[];
  isAllDay?: boolean;
  reminderMinutes?: number[];
  attendees?: string[];
}

export interface UpdateCalendarEventDto {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  noteId?: string;
  tags?: string[];
  isAllDay?: boolean;
  reminderMinutes?: number[];
  attendees?: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  noteId?: string;
  tags: string[];
  isAllDay: boolean;
  reminderMinutes: number[];
  attendees: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
  note?: {
    id: string;
    title: string;
  };
}

// Pomodoro types
export interface CreatePomodoroSessionDto {
  noteId?: string;
  taskId?: string;
  duration?: number; // in minutes, default 25
  breakDuration?: number; // in minutes, default 5
  longBreakDuration?: number; // in minutes, default 15
  sessionsUntilLongBreak?: number; // default 4
}

export interface UpdatePomodoroSessionDto {
  completedAt?: string;
  actualDuration?: number;
  wasInterrupted?: boolean;
  notes?: string;
}

export interface PomodoroSession {
  id: string;
  noteId?: string;
  taskId?: string;
  duration: number;
  actualDuration?: number;
  startedAt: string;
  completedAt?: string;
  wasInterrupted: boolean;
  notes?: string;
  sessionNumber: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  note?: {
    id: string;
    title: string;
  };
  task?: {
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

// Review types
export interface CreateReviewDto {
  noteId: string;
  reviewType?: 'SPACED_REPETITION' | 'ACTIVE_RECALL' | 'COMPREHENSION';
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  interval?: number; // days until next review
}

export interface AnswerReviewDto {
  quality: 1 | 2 | 3 | 4 | 5; // 1=worst, 5=best
  timeSpent?: number; // seconds
  notes?: string;
}

export interface ReviewPrompt {
  id: string;
  noteId: string;
  reviewType: 'SPACED_REPETITION' | 'ACTIVE_RECALL' | 'COMPREHENSION';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  interval: number;
  nextReviewDate: string;
  repetitions: number;
  easinessFactor: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  lastReviewedAt?: string;
  note: {
    id: string;
    title: string;
    content: string;
  };
}

export interface ReviewSession {
  id: string;
  reviewPromptId: string;
  quality: number;
  timeSpent: number;
  notes?: string;
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