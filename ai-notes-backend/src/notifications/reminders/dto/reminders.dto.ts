// Reminders DTOs
import { IsString, IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class CreateReminderDto {
  @IsString()
  noteId: string;

  @IsString()
  title: string;

  @IsDateString()
  remindAt: string;

  @IsOptional()
  @IsString()
  recurrence?: string; // daily, weekly, monthly
}

export class UpdateReminderDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsDateString()
  remindAt?: string;

  @IsOptional()
  @IsBoolean()
  isComplete?: boolean;

  @IsOptional()
  @IsString()
  recurrence?: string;
}