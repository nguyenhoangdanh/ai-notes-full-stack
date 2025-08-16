import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificationDto, UpdateNotificationDto } from './dto/notifications.dto';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, isRead?: boolean, limit?: number) {
    const where: any = {
      userId,
    };

    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    return this.prisma.notification.findMany({
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
        createdAt: 'desc',
      },
      ...(limit && { take: limit }),
    });
  }

  async findOne(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
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

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async create(createNotificationDto: CreateNotificationDto, userId: string) {
    // Validate note exists if noteId is provided
    if (createNotificationDto.noteId) {
      const note = await this.prisma.note.findFirst({
        where: {
          id: createNotificationDto.noteId,
          ownerId: userId,
          isDeleted: false,
        },
      });

      if (!note) {
        throw new NotFoundException('Note not found');
      }
    }

    const notification = await this.prisma.notification.create({
      data: {
        ...createNotificationDto,
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

    return notification;
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto, userId: string) {
    await this.findOne(id, userId); // Check existence and ownership

    const notification = await this.prisma.notification.update({
      where: {
        id,
        userId,
      },
      data: updateNotificationDto,
      include: {
        note: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return notification;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId); // Check existence and ownership

    await this.prisma.notification.delete({
      where: {
        id,
        userId,
      },
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.update(id, { isRead: true }, userId);
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return { message: 'All notifications marked as read' };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return { count };
  }

  async createSystemNotification(userId: string, title: string, message: string, noteId?: string) {
    return this.create({
      title,
      message,
      type: NotificationType.SYSTEM,
      noteId,
    }, userId);
  }

  async createReminderNotification(userId: string, title: string, message: string, noteId?: string) {
    return this.create({
      title,
      message,
      type: NotificationType.REMINDER,
      noteId,
    }, userId);
  }

  async createCollaborationNotification(userId: string, title: string, message: string, noteId?: string) {
    return this.create({
      title,
      message,
      type: NotificationType.COLLABORATION,
      noteId,
    }, userId);
  }

  async createAISuggestionNotification(userId: string, title: string, message: string, noteId?: string) {
    return this.create({
      title,
      message,
      type: NotificationType.AI_SUGGESTION,
      noteId,
    }, userId);
  }

  async deleteOldNotifications(olderThanDays: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
        isRead: true,
      },
    });

    return { deletedCount: result.count };
  }
}