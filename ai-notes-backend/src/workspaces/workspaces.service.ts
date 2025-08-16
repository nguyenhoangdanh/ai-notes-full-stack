import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.workspace.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findDefault(userId: string) {
    return this.prisma.workspace.findFirst({
      where: {
        ownerId: userId,
        isDefault: true,
      },
    });
  }

  async create(data: { name: string }, userId: string) {
    return this.prisma.workspace.create({
      data: {
        ...data,
        ownerId: userId,
        isDefault: false,
      },
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.workspace.findFirst({
      where: {
        id,
        ownerId: userId,
      },
    });
  }
}
