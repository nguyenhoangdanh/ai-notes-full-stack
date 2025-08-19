// Notifications types - Updated to match backend exactly
export type NotificationType = 'MENTION' | 'COMMENT' | 'SHARE' | 'REMINDER' | 'SYSTEM' | 'UPDATE';

export interface CreateNotificationDto {
  title: string;
  message: string;
  type: NotificationType;
  noteId?: string;
}

export interface UpdateNotificationDto {
  isRead?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  noteId?: string;
  isRead: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Reminders types - Updated to match backend exactly  
export interface CreateReminderDto {
  noteId: string;
  title: string;
  remindAt: string;
  recurrence?: string; // daily, weekly, monthly
}

export interface UpdateReminderDto {
  title?: string;
  remindAt?: string;
  isComplete?: boolean;
  recurrence?: string;
}

export interface Reminder {
  id: string;
  noteId: string;
  title: string;
  remindAt: string;
  recurrence?: string;
  isComplete: boolean;
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
  description?: string;
  noteId?: string;
  status: TaskStatus;
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