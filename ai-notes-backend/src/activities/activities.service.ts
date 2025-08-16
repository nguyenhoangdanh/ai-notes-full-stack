import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

export interface ActivityData {
  userId: string;
  action: ActivityAction;
  noteId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export type ActivityAction =
    | 'NOTE_CREATE' | 'NOTE_UPDATE' | 'NOTE_DELETE' | 'NOTE_VIEW'
    | 'SEARCH_QUERY' | 'SEARCH_CLICK'
    | 'COLLABORATION_JOIN' | 'COLLABORATION_INVITE' | 'COLLABORATION_EDIT'
    | 'SHARE_CREATE' | 'SHARE_VIEW' | 'SHARE_ACCESS'
    | 'VERSION_CREATE' | 'VERSION_RESTORE'
    | 'CATEGORY_CREATE' | 'CATEGORY_ASSIGN'
    | 'DUPLICATE_DETECT' | 'DUPLICATE_MERGE'
    | 'SUMMARY_GENERATE' | 'SUMMARY_VIEW'
    | 'CHAT_QUERY' | 'CHAT_RESPONSE'
    | 'LOGIN' | 'LOGOUT'
    | 'SETTINGS_UPDATE'
    | 'EXPORT_START' | 'EXPORT_COMPLETE'
    | 'TASK_CREATE' | 'TASK_COMPLETE'
    | 'POMODORO_START' | 'POMODORO_COMPLETE'
    | 'TAG_CREATE' | 'TAG_UPDATE' | 'TAG_DELETE' | 'TAG_BULK_OPERATION'
    | 'TEMPLATE_CREATE' | 'TEMPLATE_UPDATE' | 'TEMPLATE_DELETE' | 'TEMPLATE_DUPLICATE' | 'TEMPLATE_USE'
    | 'ATTACHMENT_UPLOAD' | 'ATTACHMENT_DELETE'

export interface ActivityInsights {
  totalActivities: number;
  activitiesByType: Record<string, number>;
  activitiesByDay: Array<{ date: string; count: number }>;
  topNotes: Array<{ noteId: string; title: string; activityCount: number }>;
  averageSessionDuration: number;
  mostActiveHours: Array<{ hour: number; count: number }>;
  productivityScore: number;
  weeklyTrends: Array<{ week: string; activities: number; trend: 'up' | 'down' | 'stable' }>;
}

@Injectable()
export class ActivitiesService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('activity-analytics') private analyticsQueue: Queue,
  ) {}

  async recordActivity(data: ActivityData) {
    try {
      const activity = await this.prisma.userActivity.create({
        data: {
          userId: data.userId,
          action: data.action,
          noteId: data.noteId,
          metadata: data.metadata || {},
        }
      });

      // Queue analytics processing for heavy activities
      if (this.isSignificantActivity(data.action)) {
        await this.queueAnalyticsUpdate(data.userId, data.action);
      }

      return activity;
    } catch (error) {
      console.error('Failed to record activity:', error);
      // Don't throw error - activity tracking shouldn't break main flow
    }
  }

  async getActivities(userId: string, options: {
    action?: ActivityAction;
    noteId?: string;
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  } = {}) {
    const {
      action,
      noteId,
      limit = 50,
      offset = 0,
      startDate,
      endDate
    } = options;

    return this.prisma.userActivity.findMany({
      where: {
        userId,
        ...(action && { action }),
        ...(noteId && { noteId }),
        ...(startDate && endDate && {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        })
      },
      include: {
        note: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });
  }

  async getActivityInsights(userId: string, days: number = 30): Promise<ActivityInsights> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      activities,
      activitiesByType,
      activitiesByDay,
      topNotes
    ] = await Promise.all([
      // Total activities
      this.prisma.userActivity.count({
        where: {
          userId,
          createdAt: { gte: startDate }
        }
      }),

      // Activities by type
      this.prisma.userActivity.groupBy({
        by: ['action'],
        where: {
          userId,
          createdAt: { gte: startDate }
        },
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } }
      }),

      // Activities by day
      this.prisma.userActivity.groupBy({
        by: ['createdAt'],
        where: {
          userId,
          createdAt: { gte: startDate }
        },
        _count: { createdAt: true }
      }),

      // Top notes by activity
      this.prisma.userActivity.groupBy({
        by: ['noteId'],
        where: {
          userId,
          noteId: { not: null },
          createdAt: { gte: startDate }
        },
        _count: { noteId: true },
        orderBy: { _count: { noteId: 'desc' } },
        take: 10
      })
    ]);

    // Process activities by day
    const dayActivityMap = this.groupActivitiesByDay(activitiesByDay);
    
    // Get note titles for top notes
    const topNotesWithTitles = await this.enrichTopNotes(topNotes);

    // Calculate session metrics
    const sessionMetrics = await this.calculateSessionMetrics(userId, startDate);

    // Calculate productivity score
    const productivityScore = this.calculateProductivityScore(
      activitiesByType,
      activities,
      days
    );

    return {
      totalActivities: activities,
      activitiesByType: activitiesByType.reduce((acc, item) => {
        acc[item.action] = item._count.action;
        return acc;
      }, {} as Record<string, number>),
      activitiesByDay: dayActivityMap,
      topNotes: topNotesWithTitles,
      averageSessionDuration: sessionMetrics.averageSessionDuration,
      mostActiveHours: sessionMetrics.mostActiveHours,
      productivityScore,
      weeklyTrends: await this.calculateWeeklyTrends(userId, startDate)
    };
  }

  async getActivityFeed(userId: string, limit: number = 20) {
    const activities = await this.prisma.userActivity.findMany({
      where: { userId },
      include: {
        note: {
          select: { id: true, title: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return activities.map(activity => ({
      id: activity.id,
      action: activity.action,
      description: this.generateActivityDescription(activity),
      note: activity.note,
      metadata: activity.metadata,
      createdAt: activity.createdAt,
      icon: this.getActivityIcon(activity.action as ActivityAction), // Fix: cast to ActivityAction
      color: this.getActivityColor(activity.action as ActivityAction) // Fix: cast to ActivityAction
    }));
  }

  async getActivityStats(userId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [todayCount, weekCount, monthCount, totalCount] = await Promise.all([
      this.prisma.userActivity.count({
        where: {
          userId,
          createdAt: { gte: today }
        }
      }),
      this.prisma.userActivity.count({
        where: {
          userId,
          createdAt: { gte: weekAgo }
        }
      }),
      this.prisma.userActivity.count({
        where: {
          userId,
          createdAt: { gte: monthAgo }
        }
      }),
      this.prisma.userActivity.count({
        where: { userId }
      })
    ]);

    // Calculate streaks
    const streak = await this.calculateActivityStreak(userId);

    return {
      today: todayCount,
      thisWeek: weekCount,
      thisMonth: monthCount,
      total: totalCount,
      currentStreak: streak.current,
      longestStreak: streak.longest,
      averagePerDay: monthCount / 30
    };
  }

  async deleteOldActivities(olderThanDays: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const deleted = await this.prisma.userActivity.deleteMany({
      where: {
        createdAt: { lt: cutoffDate }
      }
    });

    return {
      deletedCount: deleted.count,
      cutoffDate
    };
  }

  // Track specific activity types with enhanced metadata
  async trackNoteActivity(
    userId: string, 
    action: 'NOTE_CREATE' | 'NOTE_UPDATE' | 'NOTE_DELETE' | 'NOTE_VIEW',
    noteId: string,
    metadata?: Record<string, any>
  ) {
    return this.recordActivity({
      userId,
      action,
      noteId,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString()
      }
    });
  }

  async trackSearchActivity(
    userId: string,
    action: 'SEARCH_QUERY' | 'SEARCH_CLICK',
    metadata: {
      query?: string;
      resultCount?: number;
      clickedNoteId?: string;
      filters?: any;
    }
  ) {
    return this.recordActivity({
      userId,
      action,
      noteId: metadata.clickedNoteId,
      metadata
    });
  }

  async trackCollaborationActivity(
    userId: string,
    action: 'COLLABORATION_JOIN' | 'COLLABORATION_INVITE' | 'COLLABORATION_EDIT',
    noteId: string,
    metadata: {
      collaboratorId?: string;
      permission?: string;
      action_type?: string;
    }
  ) {
    return this.recordActivity({
      userId,
      action,
      noteId,
      metadata
    });
  }

  private isSignificantActivity(action: ActivityAction): boolean {
    const significantActions = [
      'NOTE_CREATE', 'NOTE_DELETE', 'COLLABORATION_INVITE',
      'SHARE_CREATE', 'VERSION_RESTORE', 'EXPORT_COMPLETE'
    ];
    return significantActions.includes(action);
  }

  private async queueAnalyticsUpdate(userId: string, action: ActivityAction) {
    try {
      await this.analyticsQueue.add(
        'update-user-analytics',
        { userId, action: action as string }, // Fix: cast to string for queue
        {
          attempts: 2,
          priority: -1, // Low priority
        }
      );
    } catch (error) {
      console.error('Failed to queue analytics update:', error);
    }
  }

  private groupActivitiesByDay(activities: any[]): Array<{ date: string; count: number }> {
    const dayMap = new Map();
    
    // Initialize last 30 days with 0
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dayMap.set(dateStr, 0);
    }

    // Count actual activities
    activities.forEach(activity => {
      const date = new Date(activity.createdAt).toISOString().split('T')[0];
      if (dayMap.has(date)) {
        dayMap.set(date, dayMap.get(date) + activity._count.createdAt);
      }
    });

    return Array.from(dayMap.entries()).map(([date, count]) => ({
      date,
      count
    }));
  }

  private async enrichTopNotes(topNotes: any[]): Promise<Array<{ noteId: string; title: string; activityCount: number }>> {
    const noteIds = topNotes.map(n => n.noteId).filter(Boolean);
    
    if (noteIds.length === 0) return [];

    const notes = await this.prisma.note.findMany({
      where: { id: { in: noteIds } },
      select: { id: true, title: true }
    });

    return topNotes.map(topNote => {
      const note = notes.find(n => n.id === topNote.noteId);
      return {
        noteId: topNote.noteId,
        title: note?.title || 'Unknown Note',
        activityCount: topNote._count.noteId
      };
    });
  }

  private async calculateSessionMetrics(userId: string, startDate: Date) {
    const activities = await this.prisma.userActivity.findMany({
      where: {
        userId,
        createdAt: { gte: startDate }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group activities by hour
    const hourlyActivity = new Map();
    let sessions = [];
    let currentSession = null;

    for (const activity of activities) {
      const hour = activity.createdAt.getHours();
      hourlyActivity.set(hour, (hourlyActivity.get(hour) || 0) + 1);

      // Simple session detection: activities within 30 minutes are same session
      if (!currentSession || 
          activity.createdAt.getTime() - currentSession.lastActivity > 30 * 60 * 1000) {
        if (currentSession) sessions.push(currentSession);
        currentSession = {
          start: activity.createdAt,
          lastActivity: activity.createdAt.getTime(),
          activityCount: 1
        };
      } else {
        currentSession.lastActivity = activity.createdAt.getTime();
        currentSession.activityCount++;
      }
    }
    if (currentSession) sessions.push(currentSession);

    // Calculate average session duration
    const totalDuration = sessions.reduce((sum, session) => 
      sum + (session.lastActivity - session.start.getTime()), 0
    );
    const averageSessionDuration = sessions.length > 0 
      ? Math.round(totalDuration / sessions.length / 1000 / 60) // in minutes
      : 0;

    // Most active hours
    const mostActiveHours = Array.from(hourlyActivity.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return {
      averageSessionDuration,
      mostActiveHours
    };
  }

  private calculateProductivityScore(
    activitiesByType: any[],
    totalActivities: number,
    days: number
  ): number {
    if (totalActivities === 0) return 0;

    // Weight different activities
    const weights = {
      'NOTE_CREATE': 10,
      'NOTE_UPDATE': 8,
      'TASK_COMPLETE': 12,
      'POMODORO_COMPLETE': 15,
      'COLLABORATION_EDIT': 6,
      'SUMMARY_GENERATE': 5,
      'NOTE_VIEW': 2,
      'SEARCH_QUERY': 1
    };

    let weightedScore = 0;
    for (const activity of activitiesByType) {
      const weight = weights[activity.action] || 1;
      weightedScore += activity._count.action * weight;
    }

    // Normalize to 0-100 scale
    const averagePerDay = totalActivities / days;
    const productivityScore = Math.min(100, (weightedScore / totalActivities) * (averagePerDay / 10) * 100);
    
    return Math.round(productivityScore);
  }

  private async calculateWeeklyTrends(userId: string, startDate: Date) {
    const weeks = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() + (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekActivities = await this.prisma.userActivity.count({
        where: {
          userId,
          createdAt: {
            gte: weekStart,
            lte: weekEnd
          }
        }
      });

      weeks.push({
        week: `Week ${i + 1}`,
        activities: weekActivities,
        trend: i > 0 
          ? (weekActivities > weeks[i-1].activities ? 'up' : 
             weekActivities < weeks[i-1].activities ? 'down' : 'stable')
          : 'stable' as const
      });
    }

    return weeks;
  }

  private async calculateActivityStreak(userId: string) {
    const activities = await this.prisma.userActivity.findMany({
      where: { userId },
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' }
    });

    if (activities.length === 0) {
      return { current: 0, longest: 0 };
    }

    // Group by day
    const daySet = new Set();
    activities.forEach(activity => {
      const day = activity.createdAt.toISOString().split('T')[0];
      daySet.add(day);
    });

    const uniqueDays = Array.from(daySet).sort().reverse();
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    let checkDate = new Date();

    // Calculate current streak
    for (let i = 0; i < uniqueDays.length; i++) {
      const dayToCheck = checkDate.toISOString().split('T')[0];
      
      if (uniqueDays[i] === dayToCheck) {
        currentStreak++;
        tempStreak++;
      } else {
        break;
      }
      
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Calculate longest streak
    tempStreak = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
      const current = new Date(uniqueDays[i] as string); // Fix: cast to string
      const previous = new Date(uniqueDays[i-1] as string); // Fix: cast to string
      const diffTime = previous.getTime() - current.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return { current: currentStreak, longest: longestStreak };
  }

  private generateActivityDescription(activity: any): string {
    const descriptions: Record<string, string> = { // Fix: explicit type annotation
      'NOTE_CREATE': `Created note "${activity.note?.title || 'Unknown'}"`,
      'NOTE_UPDATE': `Updated note "${activity.note?.title || 'Unknown'}"`,
      'NOTE_DELETE': `Deleted note "${activity.note?.title || 'Unknown'}"`,
      'NOTE_VIEW': `Viewed note "${activity.note?.title || 'Unknown'}"`,
      'SEARCH_QUERY': `Searched for "${activity.metadata?.query || 'something'}"`,
      'SEARCH_CLICK': `Clicked search result`,
      'COLLABORATION_JOIN': 'Joined collaboration',
      'COLLABORATION_INVITE': 'Invited collaborator',
      'SHARE_CREATE': 'Created share link',
      'VERSION_CREATE': 'Created note version',
      'CATEGORY_ASSIGN': 'Assigned category',
      'SUMMARY_GENERATE': 'Generated summary',
      'CHAT_QUERY': 'Asked AI question',
      'TASK_CREATE': 'Created task',
      'TASK_COMPLETE': 'Completed task',
      'POMODORO_START': 'Started pomodoro session',
      'POMODORO_COMPLETE': 'Completed pomodoro session',
      'LOGIN': 'Logged in',
      'LOGOUT': 'Logged out'
    };

    return descriptions[activity.action as string] || activity.action; // Fix: cast to string
  }

  private getActivityIcon(action: ActivityAction): string {
    const icons: Record<string, string> = { // Fix: explicit type annotation
      'NOTE_CREATE': '📝',
      'NOTE_UPDATE': '✏️',
      'NOTE_DELETE': '🗑️',
      'NOTE_VIEW': '👁️',
      'SEARCH_QUERY': '🔍',
      'COLLABORATION_JOIN': '👥',
      'SHARE_CREATE': '🔗',
      'VERSION_CREATE': '📋',
      'SUMMARY_GENERATE': '📄',
      'CHAT_QUERY': '💬',
      'TASK_CREATE': '✅',
      'POMODORO_START': '🍅',
      'LOGIN': '🔐'
    };

    return icons[action as string] || '📊'; // Fix: cast to string
  }

  private getActivityColor(action: ActivityAction): string {
    const colors: Record<string, string> = { // Fix: explicit type annotation
      'NOTE_CREATE': '#10b981',
      'NOTE_UPDATE': '#3b82f6',
      'NOTE_DELETE': '#ef4444',
      'NOTE_VIEW': '#6b7280',
      'SEARCH_QUERY': '#8b5cf6',
      'COLLABORATION_JOIN': '#f59e0b',
      'SHARE_CREATE': '#06b6d4',
      'VERSION_CREATE': '#84cc16',
      'SUMMARY_GENERATE': '#ec4899',
      'CHAT_QUERY': '#f97316',
      'TASK_CREATE': '#10b981',
      'POMODORO_START': '#dc2626'
    };

    return colors[action as string] || '#6b7280'; // Fix: cast to string
  }
}
