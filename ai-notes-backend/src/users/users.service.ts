import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserWithPassword } from '../types/user.types';

interface CreateUserData {
  email: string;
  name?: string;
  image?: string;
  password?: string;
}

interface UpdateUserData {
  name?: string;
  image?: string;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string, includePassword = false): Promise<User | UserWithPassword | null> {
    if (includePassword) {
      // Return full user object including password
      return this.prisma.user.findUnique({
        where: { email },
      }) as Promise<UserWithPassword | null>;
    } else {
      // Return user without password
      return this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          // Exclude password from selection
        },
      }) as Promise<User | null>;
    }
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password from selection
      },
    }) as Promise<User | null>;
  }

  async create(data: CreateUserData): Promise<User> {
    const user = await this.prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password from response
      },
    }) as User;

    // Create default workspace
    await this.prisma.workspace.create({
      data: {
        name: 'My Workspace',
        ownerId: user.id,
        isDefault: true,
      },
    });

    // Create default settings
    await this.prisma.settings.create({
      data: {
        ownerId: user.id,
        model: 'gemini-1.5-flash',
        maxTokens: 4000,
        autoReembed: true,
      },
    });

    return user;
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password from response
      },
    }) as Promise<User>;
  }
}
