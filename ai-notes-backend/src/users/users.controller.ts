import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../types/user.types';

interface UpdateProfileDto {
  name?: string;
  image?: string;
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getCurrentUser(@CurrentUser() user: User): Promise<User> {
    return user;
  }

  @Patch('me')
  async updateProfile(
    @CurrentUser() user: User,
    @Body() data: UpdateProfileDto,
  ): Promise<User> {
    return this.usersService.update(user.id, data);
  }
}
