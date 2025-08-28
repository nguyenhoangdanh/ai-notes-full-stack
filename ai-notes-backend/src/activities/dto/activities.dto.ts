import { IsString, IsOptional, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ActivityAction } from '@/types/activites.types';

export class GetActivitiesDto {
  @IsOptional()
  @IsEnum([
    'NOTE_CREATE', 'NOTE_UPDATE', 'NOTE_DELETE', 'NOTE_VIEW',
    'SEARCH_QUERY', 'SEARCH_CLICK',
    'COLLABORATION_JOIN', 'COLLABORATION_INVITE', 'COLLABORATION_EDIT',
    'SHARE_CREATE', 'SHARE_VIEW', 'SHARE_ACCESS',
    'VERSION_CREATE', 'VERSION_RESTORE',
    'CATEGORY_CREATE', 'CATEGORY_ASSIGN',
    'DUPLICATE_DETECT', 'DUPLICATE_MERGE',
    'SUMMARY_GENERATE', 'SUMMARY_VIEW',
    'CHAT_QUERY', 'CHAT_RESPONSE',
    'LOGIN', 'LOGOUT',
    'SETTINGS_UPDATE',
    'EXPORT_START', 'EXPORT_COMPLETE',
    'TASK_CREATE', 'TASK_COMPLETE',
    'POMODORO_START', 'POMODORO_COMPLETE'
  ])
  action?: ActivityAction;

  @IsOptional()
  @IsString()
  noteId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

