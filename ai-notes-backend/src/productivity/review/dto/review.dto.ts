// Review DTOs
import { IsString, IsOptional, IsEnum, IsDateString, IsBoolean, IsArray } from 'class-validator';
import { ReviewType } from '@prisma/client';

export class CreateReviewPromptDto {
  @IsEnum(ReviewType)
  type: ReviewType;

  @IsString()
  title: string;

  @IsArray()
  @IsString({ each: true })
  questions: string[];

  @IsString()
  frequency: string; // daily, weekly, monthly

  @IsDateString()
  nextDue: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateReviewPromptDto {
  @IsOptional()
  @IsEnum(ReviewType)
  type?: ReviewType;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  questions?: string[];

  @IsOptional()
  @IsString()
  frequency?: string;

  @IsOptional()
  @IsDateString()
  nextDue?: string;

  @IsOptional()
  @IsDateString()
  lastAnswered?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AnswerReviewDto {
  @IsArray()
  @IsString({ each: true })
  answers: string[];
}