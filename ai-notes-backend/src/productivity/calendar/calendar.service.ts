import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCalendarEventDto, UpdateCalendarEventDto } from './dto/calendar.dto';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, startDate?: Date, endDate?: Date) {
    const where: any = {
      ownerId: userId,
    };

    if (startDate && endDate) {
      where.OR = [
        // Events that start within the range
        {
          startTime: {
            gte: startDate,
            lte: endDate,
          },
        },
        // Events that end within the range
        {
          endTime: {
            gte: startDate,
            lte: endDate,
          },
        },
        // Events that span the entire range
        {
          AND: [
            { startTime: { lte: startDate } },
            { endTime: { gte: endDate } },
          ],
        },
      ];
    }

    return this.prisma.calendarEvent.findMany({
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
        startTime: 'asc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const event = await this.prisma.calendarEvent.findFirst({
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

    if (!event) {
      throw new NotFoundException('Calendar event not found');
    }

    return event;
  }

  async create(createCalendarEventDto: CreateCalendarEventDto, userId: string) {
    // Validate note ownership if noteId is provided
    if (createCalendarEventDto.noteId) {
      const note = await this.prisma.note.findFirst({
        where: {
          id: createCalendarEventDto.noteId,
          ownerId: userId,
          isDeleted: false,
        },
      });

      if (!note) {
        throw new NotFoundException('Note not found or not owned by user');
      }
    }

    const event = await this.prisma.calendarEvent.create({
      data: {
        ...createCalendarEventDto,
        ownerId: userId,
        startTime: new Date(createCalendarEventDto.startTime),
        endTime: new Date(createCalendarEventDto.endTime),
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

    return event;
  }

  async update(id: string, updateCalendarEventDto: UpdateCalendarEventDto, userId: string) {
    await this.findOne(id, userId); // Check existence and ownership

    // Validate note ownership if noteId is provided
    if (updateCalendarEventDto.noteId) {
      const note = await this.prisma.note.findFirst({
        where: {
          id: updateCalendarEventDto.noteId,
          ownerId: userId,
          isDeleted: false,
        },
      });

      if (!note) {
        throw new NotFoundException('Note not found or not owned by user');
      }
    }

    const updateData: any = { ...updateCalendarEventDto };

    if (updateCalendarEventDto.startTime) {
      updateData.startTime = new Date(updateCalendarEventDto.startTime);
    }

    if (updateCalendarEventDto.endTime) {
      updateData.endTime = new Date(updateCalendarEventDto.endTime);
    }

    const event = await this.prisma.calendarEvent.update({
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

    return event;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId); // Check existence and ownership

    await this.prisma.calendarEvent.delete({
      where: {
        id,
        ownerId: userId,
      },
    });
  }

  async getUpcomingEvents(userId: string, limit: number = 10) {
    const now = new Date();

    return this.prisma.calendarEvent.findMany({
      where: {
        ownerId: userId,
        startTime: {
          gte: now,
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
        startTime: 'asc',
      },
      take: limit,
    });
  }

  async getTodayEvents(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.findAll(userId, today, tomorrow);
  }

  async getEventsThisWeek(userId: string) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return this.findAll(userId, startOfWeek, endOfWeek);
  }
}