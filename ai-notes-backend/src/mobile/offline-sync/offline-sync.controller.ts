import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { OfflineSyncService } from './offline-sync.service';
import { CreateOfflineSyncDto, ProcessSyncDto } from './dto/offline-sync.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('offline-sync')
@UseGuards(JwtAuthGuard)
export class OfflineSyncController {
  constructor(private readonly offlineSyncService: OfflineSyncService) {}

  @Post('queue')
  queueSync(@Body() createOfflineSyncDto: CreateOfflineSyncDto, @CurrentUser() user: any) {
    return this.offlineSyncService.queueSync(createOfflineSyncDto, user.id);
  }

  @Get('pending')
  getPendingSync(@CurrentUser() user: any, @Query('deviceId') deviceId?: string) {
    return this.offlineSyncService.getPendingSync(user.id, deviceId);
  }

  @Post('process')
  processSync(@Body() processSyncDto: ProcessSyncDto, @CurrentUser() user: any) {
    return this.offlineSyncService.processSync(processSyncDto, user.id);
  }

  @Post('resolve-conflict/:syncId')
  resolveConflict(
    @Param('syncId') syncId: string,
    @Body() body: { resolution: 'keep_server' | 'keep_offline' },
    @CurrentUser() user: any,
  ) {
    return this.offlineSyncService.resolveConflict(syncId, body.resolution, user.id);
  }

  @Get('stats')
  getSyncStats(@CurrentUser() user: any) {
    return this.offlineSyncService.getSyncStats(user.id);
  }

  @Delete('history')
  clearSyncedHistory(
    @CurrentUser() user: any,
    @Query('olderThanDays') olderThanDays?: string,
  ) {
    const days = olderThanDays ? parseInt(olderThanDays, 10) : 30;
    return this.offlineSyncService.clearSyncedHistory(user.id, days);
  }
}