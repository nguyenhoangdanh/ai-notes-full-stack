import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getUserAnalytics(userId: string) {
    const [
      noteCount,
      totalWordCount,
      averageNoteLength,
      notesByMonth,
      topTags,
      writingStreak,
      collaborationStats,
      taskStats,
      pomodoroStats,
      searchStats,
    ] = await Promise.all([
      this.getNoteCount(userId),
      this.getTotalWordCount(userId),
      this.getAverageNoteLength(userId),
      this.getNotesByMonth(userId),
      this.getTopTags(userId),
      this.getWritingStreak(userId),
      this.getCollaborationStats(userId),
      this.getTaskStats(userId),
      this.getPomodoroStats(userId),
      this.getSearchStats(userId),
    ]);

    return {
      overview: {
        noteCount,
        totalWordCount,
        averageNoteLength,
        writingStreak,
      },
      charts: {
        notesByMonth,
        topTags,
      },
      features: {
        collaboration: collaborationStats,
        tasks: taskStats,
        pomodoro: pomodoroStats,
        search: searchStats,
      },
    };
  }

  private async getNoteCount(userId: string) {
    return this.prisma.note.count({
      where: {
        ownerId: userId,
        isDeleted: false,
      },
    });
  }

  private async getTotalWordCount(userId: string) {
    const notes = await this.prisma.note.findMany({
      where: {
        ownerId: userId,
        isDeleted: false,
      },
      select: {
        content: true,
      },
    });

    return notes.reduce((total, note) => {
      const wordCount = note.content.split(/\s+/).length;
      return total + wordCount;
    }, 0);
  }

  private async getAverageNoteLength(userId: string) {
    const notes = await this.prisma.note.findMany({
      where: {
        ownerId: userId,
        isDeleted: false,
      },
      select: {
        content: true,
      },
    });

    if (notes.length === 0) return 0;

    const totalWords = notes.reduce((total, note) => {
      const wordCount = note.content.split(/\s+/).length;
      return total + wordCount;
    }, 0);

    return Math.round(totalWords / notes.length);
  }

  private async getNotesByMonth(userId: string, months: number = 12) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const notes = await this.prisma.note.findMany({
      where: {
        ownerId: userId,
        isDeleted: false,
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Group by month
    const monthlyData = new Map();
    
    for (let i = 0; i < months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData.set(key, 0);
    }

    notes.forEach(note => {
      const date = new Date(note.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData.has(key)) {
        monthlyData.set(key, monthlyData.get(key) + 1);
      }
    });

    return Array.from(monthlyData.entries())
      .map(([month, count]) => ({ month, count }))
      .reverse();
  }

  private async getTopTags(userId: string, limit: number = 10) {
    const notes = await this.prisma.note.findMany({
      where: {
        ownerId: userId,
        isDeleted: false,
      },
      select: {
        tags: true,
      },
    });

    const tagCounts = new Map();
    
    notes.forEach(note => {
      note.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  private async getWritingStreak(userId: string) {
    const notes = await this.prisma.note.findMany({
      where: {
        ownerId: userId,
        isDeleted: false,
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (notes.length === 0) return 0;

    // Calculate current streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const noteDates = notes.map(note => {
      const date = new Date(note.createdAt);
      date.setHours(0, 0, 0, 0);
      return date;
    });

    // Remove duplicates and sort
    const uniqueDates = [...new Set(noteDates.map(d => d.getTime()))]
      .map(t => new Date(t))
      .sort((a, b) => b.getTime() - a.getTime());

    let currentDate = new Date(today);
    
    for (const noteDate of uniqueDates) {
      if (noteDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (noteDate.getTime() < currentDate.getTime()) {
        break;
      }
    }

    return streak;
  }

  private async getCollaborationStats(userId: string) {
    const [sharedNotes, collaborations, shareLinks] = await Promise.all([
      this.prisma.collaboration.count({
        where: {
          note: {
            ownerId: userId,
          },
        },
      }),
      this.prisma.collaboration.count({
        where: {
          userId,
        },
      }),
      this.prisma.shareLink.count({
        where: {
          note: {
            ownerId: userId,
          },
        },
      }),
    ]);

    return {
      sharedNotes,
      collaborations,
      shareLinks,
    };
  }

  private async getTaskStats(userId: string) {
    const [total, completed, inProgress, overdue] = await Promise.all([
      this.prisma.task.count({
        where: { ownerId: userId },
      }),
      this.prisma.task.count({
        where: { ownerId: userId, status: 'COMPLETED' },
      }),
      this.prisma.task.count({
        where: { ownerId: userId, status: 'IN_PROGRESS' },
      }),
      this.prisma.task.count({
        where: {
          ownerId: userId,
          dueDate: { lt: new Date() },
          status: { not: 'COMPLETED' },
        },
      }),
    ]);

    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      completed,
      inProgress,
      overdue,
      completionRate: Math.round(completionRate),
    };
  }

  private async getPomodoroStats(userId: string) {
    const [totalSessions, totalDuration, todaySessions] = await Promise.all([
      this.prisma.pomodoroSession.count({
        where: { userId, status: 'COMPLETED' },
      }),
      this.prisma.pomodoroSession.aggregate({
        where: { userId, status: 'COMPLETED' },
        _sum: { duration: true },
      }),
      this.prisma.pomodoroSession.count({
        where: {
          userId,
          status: 'COMPLETED',
          completedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return {
      totalSessions,
      totalDurationMinutes: totalDuration._sum.duration || 0,
      todaySessions,
      averageSessionLength: totalSessions > 0 
        ? Math.round((totalDuration._sum.duration || 0) / totalSessions)
        : 0,
    };
  }

  private async getSearchStats(userId: string) {
    const [totalSearches, uniqueQueries, recentSearches] = await Promise.all([
      this.prisma.searchHistory.count({
        where: { userId },
      }),
      this.prisma.searchHistory.groupBy({
        by: ['query'],
        where: { userId },
        _count: { query: true },
      }),
      this.prisma.searchHistory.count({
        where: {
          userId,
          searchedAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7)),
          },
        },
      }),
    ]);

    const topQueries = uniqueQueries
      .sort((a, b) => b._count.query - a._count.query)
      .slice(0, 10)
      .map(item => ({
        query: item.query,
        count: item._count.query,
      }));

    return {
      totalSearches,
      uniqueQueries: uniqueQueries.length,
      recentSearches,
      topQueries,
    };
  }

  async getWorkspaceAnalytics(userId: string) {
    const workspaces = await this.prisma.workspace.findMany({
      where: {
        ownerId: userId,
      },
      include: {
        _count: {
          select: {
            notes: {
              where: {
                isDeleted: false,
              },
            },
          },
        },
      },
    });

    return workspaces.map(workspace => ({
      id: workspace.id,
      name: workspace.name,
      noteCount: workspace._count.notes,
      isDefault: workspace.isDefault,
      createdAt: workspace.createdAt,
    }));
  }

  async getContentAnalytics(userId: string) {
    const notes = await this.prisma.note.findMany({
      where: {
        ownerId: userId,
        isDeleted: false,
      },
      select: {
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Analyze content patterns
    const wordFrequency = new Map();
    let totalCharacters = 0;
    let totalSentences = 0;

    notes.forEach(note => {
      const content = note.content.toLowerCase();
      totalCharacters += content.length;
      
      // Count sentences (simple heuristic)
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
      totalSentences += sentences.length;

      // Count words
      const words = content.match(/\b\w+\b/g) || [];
      words.forEach(word => {
        if (word.length > 3) { // Filter out short words
          wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
        }
      });
    });

    const topWords = Array.from(wordFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }));

    return {
      totalCharacters,
      totalSentences,
      averageCharactersPerNote: notes.length > 0 ? Math.round(totalCharacters / notes.length) : 0,
      averageSentencesPerNote: notes.length > 0 ? Math.round(totalSentences / notes.length) : 0,
      topWords,
    };
  }

  async updateNoteAnalytics(noteId: string, action: 'view' | 'edit' | 'share') {
    const updateData: any = {};

    switch (action) {
      case 'view':
        updateData.viewCount = { increment: 1 };
        updateData.lastViewed = new Date();
        break;
      case 'edit':
        updateData.editCount = { increment: 1 };
        updateData.lastEdited = new Date();
        break;
      case 'share':
        updateData.shareCount = { increment: 1 };
        break;
    }

    await this.prisma.noteAnalytics.upsert({
      where: { noteId },
      create: {
        noteId,
        ...updateData,
      },
      update: updateData,
    });
  }
}