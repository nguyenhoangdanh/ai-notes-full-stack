import { Controller, Get, Patch, Body, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SettingsService } from './settings.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../types/user.types';

interface UpdateSettingsDto {
  model?: string;
  maxTokens?: number;
  autoReembed?: boolean;
}

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  async getSettings(@CurrentUser() user: User) {
    return this.settingsService.findByUserId(user.id);
  }

  @Patch()
  async updateSettings(
    @Body() data: UpdateSettingsDto,
    @CurrentUser() user: User,
  ) {
    return this.settingsService.upsert(user.id, data);
  }

  @Get('usage')
  async getUsage(
    @Query('days') days: string,
    @CurrentUser() user: User,
  ) {
    return this.settingsService.getUsage(user.id, parseInt(days) || 30);
  }
}
