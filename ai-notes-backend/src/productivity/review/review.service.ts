import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewPromptDto, UpdateReviewPromptDto, AnswerReviewDto } from './dto/review.dto';
import { ReviewType } from '@prisma/client';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, isActive?: boolean) {
    const where: any = {
      userId,
    };

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return this.prisma.reviewPrompt.findMany({
      where,
      orderBy: {
        nextDue: 'asc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const prompt = await this.prisma.reviewPrompt.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!prompt) {
      throw new NotFoundException('Review prompt not found');
    }

    return prompt;
  }

  async create(createReviewPromptDto: CreateReviewPromptDto, userId: string) {
    const prompt = await this.prisma.reviewPrompt.create({
      data: {
        ...createReviewPromptDto,
        userId,
        nextDue: new Date(createReviewPromptDto.nextDue),
      },
    });

    return prompt;
  }

  async update(id: string, updateReviewPromptDto: UpdateReviewPromptDto, userId: string) {
    await this.findOne(id, userId); // Check existence and ownership

    const updateData: any = { ...updateReviewPromptDto };

    if (updateReviewPromptDto.nextDue) {
      updateData.nextDue = new Date(updateReviewPromptDto.nextDue);
    }

    if (updateReviewPromptDto.lastAnswered) {
      updateData.lastAnswered = new Date(updateReviewPromptDto.lastAnswered);
    }

    const prompt = await this.prisma.reviewPrompt.update({
      where: {
        id,
        userId,
      },
      data: updateData,
    });

    return prompt;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId); // Check existence and ownership

    await this.prisma.reviewPrompt.delete({
      where: {
        id,
        userId,
      },
    });
  }

  async getDuePrompts(userId: string) {
    const now = new Date();

    return this.prisma.reviewPrompt.findMany({
      where: {
        userId,
        isActive: true,
        nextDue: {
          lte: now,
        },
      },
      orderBy: {
        nextDue: 'asc',
      },
    });
  }

  async answerPrompt(id: string, answerReviewDto: AnswerReviewDto, userId: string) {
    const prompt = await this.findOne(id, userId);

    const now = new Date();
    let nextDue: Date;

    // Calculate next due date based on frequency
    switch (prompt.frequency.toLowerCase()) {
      case 'daily':
        nextDue = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        nextDue = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        nextDue = new Date(now);
        nextDue.setMonth(nextDue.getMonth() + 1);
        break;
      default:
        // For custom frequencies, add 1 day by default
        nextDue = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }

    // Update the prompt with answer timestamp and next due date
    const updatedPrompt = await this.prisma.reviewPrompt.update({
      where: {
        id,
        userId,
      },
      data: {
        lastAnswered: now,
        nextDue,
      },
    });

    // Here you could store the answers in a separate table if needed
    // For now, we'll just return the updated prompt
    return {
      prompt: updatedPrompt,
      answers: answerReviewDto.answers,
      answeredAt: now,
    };
  }

  async getReviewStats(userId: string) {
    const [totalPrompts, activePrompts, duePrompts, answeredToday] = await Promise.all([
      this.prisma.reviewPrompt.count({
        where: { userId },
      }),
      this.prisma.reviewPrompt.count({
        where: { userId, isActive: true },
      }),
      this.prisma.reviewPrompt.count({
        where: {
          userId,
          isActive: true,
          nextDue: { lte: new Date() },
        },
      }),
      this.prisma.reviewPrompt.count({
        where: {
          userId,
          lastAnswered: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return {
      totalPrompts,
      activePrompts,
      duePrompts,
      answeredToday,
    };
  }

  async createDefaultPrompts(userId: string) {
    const defaultPrompts = [
      {
        type: ReviewType.DAILY,
        title: 'Daily Reflection',
        questions: [
          'What were the key insights from today?',
          'What did I learn that I want to remember?',
          'What could I improve tomorrow?',
        ],
        frequency: 'daily',
        nextDue: new Date(),
      },
      {
        type: ReviewType.WEEKLY,
        title: 'Weekly Review',
        questions: [
          'What were my biggest accomplishments this week?',
          'What patterns do I notice in my notes?',
          'What themes emerged in my thinking?',
          'What do I want to focus on next week?',
        ],
        frequency: 'weekly',
        nextDue: this.getNextWeekly(),
      },
      {
        type: ReviewType.MONTHLY,
        title: 'Monthly Deep Review',
        questions: [
          'How have my ideas evolved this month?',
          'What connections am I making between different topics?',
          'What knowledge gaps have I identified?',
          'What do I want to explore more deeply?',
        ],
        frequency: 'monthly',
        nextDue: this.getNextMonthly(),
      },
    ];

    const createdPrompts = [];
    for (const promptData of defaultPrompts) {
      const prompt = await this.prisma.reviewPrompt.create({
        data: {
          ...promptData,
          userId,
        },
      });
      createdPrompts.push(prompt);
    }

    return createdPrompts;
  }

  private getNextWeekly(): Date {
    const now = new Date();
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + (7 - now.getDay()));
    nextSunday.setHours(18, 0, 0, 0); // 6 PM on Sunday
    return nextSunday;
  }

  private getNextMonthly(): Date {
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    nextMonth.setHours(18, 0, 0, 0); // 6 PM on first of month
    return nextMonth;
  }
}