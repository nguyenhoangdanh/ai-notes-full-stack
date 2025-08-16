// Pomodoro DTOs
import { IsString, IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { PomodoroType } from '@prisma/client';

export class CreatePomodoroSessionDto {
  @IsOptional()
  @IsString()
  noteId?: string;

  @IsNumber()
  duration: number; // in minutes

  @IsOptional()
  @IsEnum(PomodoroType)
  type?: PomodoroType;

  @IsDateString()
  startedAt: string;
}

export class UpdatePomodoroSessionDto {
  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'])
  status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
}