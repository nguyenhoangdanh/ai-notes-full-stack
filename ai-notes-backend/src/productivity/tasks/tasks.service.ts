import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/tasks.dto';
import { TaskStatus, TaskPriority } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, status?: TaskStatus, priority?: TaskPriority) {
    const where: any = {
      ownerId: userId,
    };

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    return this.prisma.task.findMany({
      where,
      include: {
        note: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(id: string, userId: string) {
    const task = await this.prisma.task.findFirst({
      where: {
        id,
        ownerId: userId,
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

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async create(createTaskDto: CreateTaskDto, userId: string) {
    // Validate note ownership if noteId is provided
    if (createTaskDto.noteId) {
      const note = await this.prisma.note.findFirst({
        where: {
          id: createTaskDto.noteId,
          ownerId: userId,
          isDeleted: false,
        },
      });

      if (!note) {
        throw new NotFoundException('Note not found or not owned by user');
      }
    }

    const task = await this.prisma.task.create({
      data: {
        ...createTaskDto,
        ownerId: userId,
        dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
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

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    const existingTask = await this.findOne(id, userId);

    // Validate note ownership if noteId is provided
    if (updateTaskDto.noteId) {
      const note = await this.prisma.note.findFirst({
        where: {
          id: updateTaskDto.noteId,
          ownerId: userId,
          isDeleted: false,
        },
      });

      if (!note) {
        throw new NotFoundException('Note not found or not owned by user');
      }
    }

    // Auto-set completedAt when status changes to COMPLETED
    const updateData: any = {
      ...updateTaskDto,
    };

    if (updateTaskDto.dueDate) {
      updateData.dueDate = new Date(updateTaskDto.dueDate);
    }

    if (updateTaskDto.status === TaskStatus.COMPLETED && existingTask.status !== TaskStatus.COMPLETED) {
      updateData.completedAt = new Date();
    } else if (updateTaskDto.status !== TaskStatus.COMPLETED && updateTaskDto.status !== undefined) {
      updateData.completedAt = null;
    }

    const task = await this.prisma.task.update({
      where: {
        id,
        ownerId: userId,
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

    return task;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId); // Check existence and ownership

    await this.prisma.task.delete({
      where: {
        id,
        ownerId: userId,
      },
    });
  }

  async getTasksByDueDate(userId: string, startDate: Date, endDate: Date) {
    return this.prisma.task.findMany({
      where: {
        ownerId: userId,
        dueDate: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          not: TaskStatus.COMPLETED,
        },
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
        dueDate: 'asc',
      },
    });
  }

  async getOverdueTasks(userId: string) {
    return this.prisma.task.findMany({
      where: {
        ownerId: userId,
        dueDate: {
          lt: new Date(),
        },
        status: {
          not: TaskStatus.COMPLETED,
        },
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
        dueDate: 'desc',
      },
    });
  }

  async getTaskStats(userId: string) {
    const [total, completed, inProgress, overdue] = await Promise.all([
      this.prisma.task.count({
        where: { ownerId: userId },
      }),
      this.prisma.task.count({
        where: { ownerId: userId, status: TaskStatus.COMPLETED },
      }),
      this.prisma.task.count({
        where: { ownerId: userId, status: TaskStatus.IN_PROGRESS },
      }),
      this.prisma.task.count({
        where: {
          ownerId: userId,
          dueDate: { lt: new Date() },
          status: { not: TaskStatus.COMPLETED },
        },
      }),
    ]);

    return {
      total,
      completed,
      inProgress,
      overdue,
      todo: total - completed - inProgress,
    };
  }
}