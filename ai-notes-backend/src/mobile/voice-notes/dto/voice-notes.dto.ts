// Voice Notes DTOs
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateVoiceNoteDto {
  @IsOptional()
  @IsString()
  noteId?: string;

  @IsString()
  filename: string;

  @IsString()
  filepath: string;

  @IsNumber()
  duration: number; // in seconds

  @IsOptional()
  @IsString()
  language?: string;
}

export class UpdateVoiceNoteDto {
  @IsOptional()
  @IsString()
  transcription?: string;

  @IsOptional()
  @IsNumber()
  quality?: number;

  @IsOptional()
  @IsString()
  status?: 'PROCESSING' | 'COMPLETED' | 'FAILED';
}