import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePomodoroSessionDto, UpdatePomodoroSessionDto } from './dto/pomodoro.dto';
import { SessionStatus, PomodoroType } from '@prisma/client';

@Injectable()
export class PomodoroService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, limit?: number) {
    return this.prisma.pomodoroSession.findMany({
      where: {
        userId,
      },
      include: {
        note: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
      ...(limit && { take: limit }),
    });
  }

  async findActive(userId: string) {
    return this.prisma.pomodoroSession.findFirst({
      where: {
        userId,
        status: SessionStatus.ACTIVE,
      },
      include: {
        note: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async create(createPomodoroDto: CreatePomodoroSessionDto, userId: string) {
    // Validate note ownership if noteId is provided
    if (createPomodoroDto.noteId) {
      const note = await this.prisma.note.findFirst({
        where: {
          id: createPomodoroDto.noteId,
          ownerId: userId,
          isDeleted: false,
        },
      });

      if (!note) {
        throw new NotFoundException('Note not found or not owned by user');
      }
    }

    // Check if there's already an active session
    const activeSession = await this.findActive(userId);
    if (activeSession) {
      // Auto-complete the previous session
      await this.update(activeSession.id, { status: 'COMPLETED' }, userId);
    }

    const session = await this.prisma.pomodoroSession.create({
      data: {
        ...createPomodoroDto,
        userId,
        startedAt: new Date(createPomodoroDto.startedAt),
        status: SessionStatus.ACTIVE,
      },
      include: {
        note: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return session;
  }

  async update(id: string, updatePomodoroDto: UpdatePomodoroSessionDto, userId: string) {
    const session = await this.prisma.pomodoroSession.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!session) {
      throw new NotFoundException('Pomodoro session not found');
    }

    const updateData: any = {
      status: updatePomodoroDto.status,
    };

    if (updatePomodoroDto.completedAt) {
      updateData.completedAt = new Date(updatePomodoroDto.completedAt);
    }

    // Auto-set completedAt if status is COMPLETED
    if (updatePomodoroDto.status === 'COMPLETED' && !updatePomodoroDto.completedAt) {
      updateData.completedAt = new Date();
    }

    return this.prisma.pomodoroSession.update({
      where: {
        id,
        userId,
      },
      data: updateData,
      include: {
        note: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const session = await this.prisma.pomodoroSession.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!session) {
      throw new NotFoundException('Pomodoro session not found');
    }

    await this.prisma.pomodoroSession.delete({
      where: {
        id,
        userId,
      },
    });
  }

  async getStats(userId: string, startDate?: Date, endDate?: Date) {
    const where: any = {
      userId,
      status: SessionStatus.COMPLETED,
    };

    if (startDate && endDate) {
      where.completedAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    const sessions = await this.prisma.pomodoroSession.findMany({
      where,
      select: {
        duration: true,
        type: true,
        completedAt: true,
      },
    });

    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0);
    const workSessions = sessions.filter(s => s.type === PomodoroType.WORK).length;
    const breakSessions = sessions.filter(s => s.type !== PomodoroType.WORK).length;

    return {
      totalSessions,
      totalDuration,
      workSessions,
      breakSessions,
      averageSessionLength: totalSessions > 0 ? totalDuration / totalSessions : 0,
    };
  }

  async getTodayStats(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getStats(userId, today, tomorrow);
  }
}