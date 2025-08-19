import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  notificationsService, 
  remindersService, 
  tasksService, 
  calendarService, 
  pomodoroService, 
  reviewService 
} from '../services/notifications.service';
import {
  CreateNotificationDto,
  UpdateNotificationDto,
  CreateReminderDto,
  UpdateReminderDto,
  ProductivityCreateTaskDto as CreateTaskDto,
  ProductivityUpdateTaskDto as UpdateTaskDto,
  ProductivityCreateCalendarEventDto as CreateCalendarEventDto,
  ProductivityUpdateCalendarEventDto as UpdateCalendarEventDto,
  CreatePomodoroSessionDto,
  UpdatePomodoroSessionDto,
  CreateReviewPromptDto,
  UpdateReviewPromptDto,
  AnswerReviewDto
} from '../types';

// Query Keys
export const productivityQueryKeys = {
  notifications: {
    all: ['notifications'] as const,
    list: (unreadOnly?: boolean, limit?: number) => [...productivityQueryKeys.notifications.all, 'list', { unreadOnly, limit }] as const,
    unreadCount: () => [...productivityQueryKeys.notifications.all, 'unread-count'] as const,
    detail: (id: string) => [...productivityQueryKeys.notifications.all, 'detail', id] as const,
  },
  reminders: {
    all: ['reminders'] as const,
    list: (status?: string, limit?: number) => [...productivityQueryKeys.reminders.all, 'list', { status, limit }] as const,
    due: () => [...productivityQueryKeys.reminders.all, 'due'] as const,
    upcoming: (days?: number) => [...productivityQueryKeys.reminders.all, 'upcoming', { days }] as const,
    stats: () => [...productivityQueryKeys.reminders.all, 'stats'] as const,
    detail: (id: string) => [...productivityQueryKeys.reminders.all, 'detail', id] as const,
  },
  tasks: {
    all: ['tasks'] as const,
    list: (status?: string, priority?: string, limit?: number) => [...productivityQueryKeys.tasks.all, 'list', { status, priority, limit }] as const,
    stats: () => [...productivityQueryKeys.tasks.all, 'stats'] as const,
    overdue: () => [...productivityQueryKeys.tasks.all, 'overdue'] as const,
    due: (days?: number) => [...productivityQueryKeys.tasks.all, 'due', { days }] as const,
    detail: (id: string) => [...productivityQueryKeys.tasks.all, 'detail', id] as const,
  },
  calendar: {
    all: ['calendar'] as const,
    list: (startDate?: string, endDate?: string) => [...productivityQueryKeys.calendar.all, 'list', { startDate, endDate }] as const,
    upcoming: (days?: number) => [...productivityQueryKeys.calendar.all, 'upcoming', { days }] as const,
    today: () => [...productivityQueryKeys.calendar.all, 'today'] as const,
    week: (startDate?: string) => [...productivityQueryKeys.calendar.all, 'week', { startDate }] as const,
    detail: (id: string) => [...productivityQueryKeys.calendar.all, 'detail', id] as const,
  },
  pomodoro: {
    all: ['pomodoro'] as const,
    list: (limit?: number) => [...productivityQueryKeys.pomodoro.all, 'list', { limit }] as const,
    active: () => [...productivityQueryKeys.pomodoro.all, 'active'] as const,
    stats: () => [...productivityQueryKeys.pomodoro.all, 'stats'] as const,
    todayStats: () => [...productivityQueryKeys.pomodoro.all, 'today-stats'] as const,
  },
  review: {
    all: ['review'] as const,
    list: () => [...productivityQueryKeys.review.all, 'list'] as const,
    due: () => [...productivityQueryKeys.review.all, 'due'] as const,
    stats: () => [...productivityQueryKeys.review.all, 'stats'] as const,
    detail: (id: string) => [...productivityQueryKeys.review.all, 'detail', id] as const,
  },
};

// Notifications Hooks
export const useNotifications = (unreadOnly?: boolean, limit?: number) => {
  return useQuery({
    queryKey: productivityQueryKeys.notifications.list(unreadOnly, limit),
    queryFn: () => notificationsService.getAll(unreadOnly, limit),
  });
};

export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: productivityQueryKeys.notifications.unreadCount(),
    queryFn: () => notificationsService.getUnreadCount(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useNotification = (id: string) => {
  return useQuery({
    queryKey: productivityQueryKeys.notifications.detail(id),
    queryFn: () => notificationsService.getById(id),
    enabled: !!id,
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateNotificationDto) => notificationsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.notifications.all });
    },
  });
};

export const useUpdateNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNotificationDto }) =>
      notificationsService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.notifications.detail(id) });
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.notifications.all });
    },
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.notifications.detail(id) });
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.notifications.unreadCount() });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.notifications.all });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => notificationsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.notifications.all });
    },
  });
};

// Reminders Hooks
export const useReminders = (status?: 'active' | 'completed', limit?: number) => {
  return useQuery({
    queryKey: productivityQueryKeys.reminders.list(status, limit),
    queryFn: () => remindersService.getAll(status, limit),
  });
};

export const useDueReminders = () => {
  return useQuery({
    queryKey: productivityQueryKeys.reminders.due(),
    queryFn: () => remindersService.getDue(),
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useUpcomingReminders = (days?: number) => {
  return useQuery({
    queryKey: productivityQueryKeys.reminders.upcoming(days),
    queryFn: () => remindersService.getUpcoming(days),
  });
};

export const useReminderStats = () => {
  return useQuery({
    queryKey: productivityQueryKeys.reminders.stats(),
    queryFn: () => remindersService.getStats(),
  });
};

export const useReminder = (id: string) => {
  return useQuery({
    queryKey: productivityQueryKeys.reminders.detail(id),
    queryFn: () => remindersService.getById(id),
    enabled: !!id,
  });
};

export const useCreateReminder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateReminderDto) => remindersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.reminders.all });
    },
  });
};

export const useUpdateReminder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReminderDto }) =>
      remindersService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.reminders.detail(id) });
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.reminders.all });
    },
  });
};

export const useCompleteReminder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => remindersService.complete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.reminders.detail(id) });
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.reminders.all });
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.reminders.stats() });
    },
  });
};

export const useDeleteReminder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => remindersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.reminders.all });
    },
  });
};

// Tasks Hooks
export const useTasks = (status?: string, priority?: string, limit?: number) => {
  return useQuery({
    queryKey: productivityQueryKeys.tasks.list(status, priority, limit),
    queryFn: () => tasksService.getAll(status, priority, limit),
  });
};

export const useTaskStats = () => {
  return useQuery({
    queryKey: productivityQueryKeys.tasks.stats(),
    queryFn: () => tasksService.getStats(),
  });
};

export const useOverdueTasks = () => {
  return useQuery({
    queryKey: productivityQueryKeys.tasks.overdue(),
    queryFn: () => tasksService.getOverdue(),
  });
};

export const useDueTasks = (days?: number) => {
  return useQuery({
    queryKey: productivityQueryKeys.tasks.due(days),
    queryFn: () => tasksService.getDue(days),
  });
};

export const useTask = (id: string) => {
  return useQuery({
    queryKey: productivityQueryKeys.tasks.detail(id),
    queryFn: () => tasksService.getById(id),
    enabled: !!id,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTaskDto) => tasksService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.tasks.all });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskDto }) =>
      tasksService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.tasks.detail(id) });
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.tasks.stats() });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => tasksService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.tasks.all });
    },
  });
};

// Calendar Hooks
export const useCalendarEvents = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: productivityQueryKeys.calendar.list(startDate, endDate),
    queryFn: () => calendarService.getAll(startDate, endDate),
  });
};

export const useUpcomingEvents = (days?: number) => {
  return useQuery({
    queryKey: productivityQueryKeys.calendar.upcoming(days),
    queryFn: () => calendarService.getUpcoming(days),
  });
};

export const useTodayEvents = () => {
  return useQuery({
    queryKey: productivityQueryKeys.calendar.today(),
    queryFn: () => calendarService.getToday(),
  });
};

export const useWeekEvents = (startDate?: string) => {
  return useQuery({
    queryKey: productivityQueryKeys.calendar.week(startDate),
    queryFn: () => calendarService.getWeek(startDate),
  });
};

export const useCalendarEvent = (id: string) => {
  return useQuery({
    queryKey: productivityQueryKeys.calendar.detail(id),
    queryFn: () => calendarService.getById(id),
    enabled: !!id,
  });
};

export const useCreateCalendarEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCalendarEventDto) => calendarService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.calendar.all });
    },
  });
};

export const useUpdateCalendarEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCalendarEventDto }) =>
      calendarService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.calendar.detail(id) });
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.calendar.all });
    },
  });
};

export const useDeleteCalendarEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => calendarService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.calendar.all });
    },
  });
};

// Pomodoro Hooks
export const usePomodoroSessions = (limit?: number) => {
  return useQuery({
    queryKey: productivityQueryKeys.pomodoro.list(limit),
    queryFn: () => pomodoroService.getAll(limit),
  });
};

export const useActivePomodoroSession = () => {
  return useQuery({
    queryKey: productivityQueryKeys.pomodoro.active(),
    queryFn: () => pomodoroService.getActive(),
    refetchInterval: 5000, // Refetch every 5 seconds for active session
  });
};

export const usePomodoroStats = () => {
  return useQuery({
    queryKey: productivityQueryKeys.pomodoro.stats(),
    queryFn: () => pomodoroService.getStats(),
  });
};

export const usePomodoroTodayStats = () => {
  return useQuery({
    queryKey: productivityQueryKeys.pomodoro.todayStats(),
    queryFn: () => pomodoroService.getTodayStats(),
  });
};

export const useCreatePomodoroSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePomodoroSessionDto) => pomodoroService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.pomodoro.all });
    },
  });
};

export const useUpdatePomodoroSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePomodoroSessionDto }) =>
      pomodoroService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.pomodoro.all });
    },
  });
};

export const useDeletePomodoroSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => pomodoroService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.pomodoro.all });
    },
  });
};

// Review Hooks
export const useReviews = () => {
  return useQuery({
    queryKey: productivityQueryKeys.review.list(),
    queryFn: () => reviewService.getAll(),
  });
};

export const useDueReviews = () => {
  return useQuery({
    queryKey: productivityQueryKeys.review.due(),
    queryFn: () => reviewService.getDue(),
  });
};

export const useReviewStats = () => {
  return useQuery({
    queryKey: productivityQueryKeys.review.stats(),
    queryFn: () => reviewService.getStats(),
  });
};

export const useReview = (id: string) => {
  return useQuery({
    queryKey: productivityQueryKeys.review.detail(id),
    queryFn: () => reviewService.getById(id),
    enabled: !!id,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateReviewPromptDto) => reviewService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.review.all });
    },
  });
};

export const useSetupDefaultReviews = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => reviewService.setupDefaults(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.review.all });
    },
  });
};

export const useAnswerReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AnswerReviewDto }) =>
      reviewService.answerReview(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.review.detail(id) });
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.review.due() });
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.review.stats() });
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReviewPromptDto }) =>
      reviewService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.review.detail(id) });
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.review.all });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => reviewService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productivityQueryKeys.review.all });
    },
  });
};