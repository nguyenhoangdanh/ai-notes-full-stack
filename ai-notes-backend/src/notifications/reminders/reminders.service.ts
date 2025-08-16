import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReminderDto, UpdateReminderDto } from './dto/reminders.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class RemindersService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(userId: string, isComplete?: boolean) {
    const where: any = {
      userId,
    };

    if (isComplete !== undefined) {
      where.isComplete = isComplete;
    }

    return this.prisma.reminder.findMany({
      where,
      include: {
        note: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        remindAt: 'asc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const reminder = await this.prisma.reminder.findFirst({
      where: {
        id,
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
    });

    if (!reminder) {
      throw new NotFoundException('Reminder not found');
    }

    return reminder;
  }

  async create(createReminderDto: CreateReminderDto, userId: string) {
    // Validate note ownership
    const note = await this.prisma.note.findFirst({
      where: {
        id: createReminderDto.noteId,
        ownerId: userId,
        isDeleted: false,
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found or not owned by user');
    }

    const reminder = await this.prisma.reminder.create({
      data: {
        ...createReminderDto,
        userId,
        remindAt: new Date(createReminderDto.remindAt),
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

    return reminder;
  }

  async update(id: string, updateReminderDto: UpdateReminderDto, userId: string) {
    await this.findOne(id, userId); // Check existence and ownership

    const updateData: any = { ...updateReminderDto };

    if (updateReminderDto.remindAt) {
      updateData.remindAt = new Date(updateReminderDto.remindAt);
    }

    const reminder = await this.prisma.reminder.update({
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

    return reminder;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId); // Check existence and ownership

    await this.prisma.reminder.delete({
      where: {
        id,
        userId,
      },
    });
  }

  async markComplete(id: string, userId: string) {
    const reminder = await this.update(id, { isComplete: true }, userId);

    // If it's a recurring reminder, create the next occurrence
    if (reminder.recurrence && !reminder.isComplete) {
      await this.createNextRecurrence(reminder);
    }

    return reminder;
  }

  async getDueReminders(userId: string) {
    const now = new Date();

    return this.prisma.reminder.findMany({
      where: {
        userId,
        isComplete: false,
        remindAt: {
          lte: now,
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
        remindAt: 'asc',
      },
    });
  }

  async getUpcomingReminders(userId: string, limit: number = 10) {
    const now = new Date();

    return this.prisma.reminder.findMany({
      where: {
        userId,
        isComplete: false,
        remindAt: {
          gt: now,
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
        remindAt: 'asc',
      },
      take: limit,
    });
  }

  // Run every minute to check for due reminders
  @Cron(CronExpression.EVERY_MINUTE)
  async processDueReminders() {
    try {
      // Get all due reminders
      const dueReminders = await this.prisma.reminder.findMany({
        where: {
          isComplete: false,
          remindAt: {
            lte: new Date(),
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
      });

      // Create notifications for due reminders
      for (const reminder of dueReminders) {
        await this.notificationsService.createReminderNotification(
          reminder.userId,
          `Reminder: ${reminder.title}`,
          `Don't forget about "${reminder.note.title}"`,
          reminder.noteId,
        );

        // If it's a recurring reminder, create the next occurrence
        if (reminder.recurrence) {
          await this.createNextRecurrence(reminder);
        }

        // Mark the current reminder as complete
        await this.prisma.reminder.update({
          where: { id: reminder.id },
          data: { isComplete: true },
        });
      }

      if (dueReminders.length > 0) {
        console.log(`Processed ${dueReminders.length} due reminders`);
      }
    } catch (error) {
      console.error('Error processing due reminders:', error);
    }
  }

  private async createNextRecurrence(reminder: any) {
    if (!reminder.recurrence) return;

    const now = new Date();
    let nextRemindAt: Date;

    switch (reminder.recurrence.toLowerCase()) {
      case 'daily':
        nextRemindAt = new Date(reminder.remindAt.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        nextRemindAt = new Date(reminder.remindAt.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        nextRemindAt = new Date(reminder.remindAt);
        nextRemindAt.setMonth(nextRemindAt.getMonth() + 1);
        break;
      default:
        return; // Unknown recurrence pattern
    }

    // Only create next occurrence if it's in the future
    if (nextRemindAt > now) {
      await this.prisma.reminder.create({
        data: {
          noteId: reminder.noteId,
          userId: reminder.userId,
          title: reminder.title,
          remindAt: nextRemindAt,
          recurrence: reminder.recurrence,
          isComplete: false,
        },
      });
    }
  }

  async getReminderStats(userId: string) {
    const [total, completed, upcoming, overdue] = await Promise.all([
      this.prisma.reminder.count({
        where: { userId },
      }),
      this.prisma.reminder.count({
        where: { userId, isComplete: true },
      }),
      this.prisma.reminder.count({
        where: {
          userId,
          isComplete: false,
          remindAt: { gt: new Date() },
        },
      }),
      this.prisma.reminder.count({
        where: {
          userId,
          isComplete: false,
          remindAt: { lte: new Date() },
        },
      }),
    ]);

    return {
      total,
      completed,
      upcoming,
      overdue,
    };
  }
}