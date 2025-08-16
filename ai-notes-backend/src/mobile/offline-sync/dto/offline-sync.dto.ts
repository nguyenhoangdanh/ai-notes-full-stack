// Offline Sync DTOs
import { IsString, IsEnum, IsDateString, IsObject } from 'class-validator';
import { SyncAction } from '@prisma/client';

export class CreateOfflineSyncDto {
  @IsString()
  deviceId: string;

  @IsString()
  noteId: string;

  @IsEnum(SyncAction)
  action: SyncAction;

  @IsObject()
  data: any;

  @IsDateString()
  timestamp: string;
}

export class ProcessSyncDto {
  @IsString()
  deviceId: string;
}