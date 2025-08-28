import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Body,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  getUserAnalytics(@CurrentUser() user: any) {
    return this.analyticsService.getUserAnalytics(user.id);
  }

  @Get('workspaces')
  getWorkspaceAnalytics(@CurrentUser() user: any) {
    return this.analyticsService.getWorkspaceAnalytics(user.id);
  }

  @Get('content')
  getContentAnalytics(@CurrentUser() user: any) {
    return this.analyticsService.getContentAnalytics(user.id);
  }

  @Post('note/:noteId/track')
  trackNoteAction(
    @Param('noteId') noteId: string,
    @Body() body: { action: 'view' | 'edit' | 'share' },
  ) {
    return this.analyticsService.updateNoteAnalytics(noteId, body.action);
  }
}