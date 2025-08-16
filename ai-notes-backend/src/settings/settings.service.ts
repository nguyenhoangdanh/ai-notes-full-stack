import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async findByUserId(userId: string) {
    return this.prisma.settings.findUnique({
      where: { ownerId: userId },
    });
  }

  async upsert(userId: string, data: {
    model?: string;
    maxTokens?: number;
    autoReembed?: boolean;
  }) {
    return this.prisma.settings.upsert({
      where: { ownerId: userId },
      update: data,
      create: {
        ownerId: userId,
        model: data.model || 'gemini-1.5-flash',
        maxTokens: data.maxTokens || 4000,
        autoReembed: data.autoReembed ?? true,
      },
    });
  }

  async getUsage(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateString = startDate.toISOString().split('T')[0];

    return this.prisma.usage.findMany({
      where: {
        ownerId: userId,
        date: {
          gte: startDateString,
        },
      },
      orderBy: { date: 'desc' },
    });
  }
}
