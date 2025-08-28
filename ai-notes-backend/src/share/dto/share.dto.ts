import { IsString, IsBoolean, IsOptional, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateShareLinkDto {
  @IsBoolean()
  isPublic: boolean;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsBoolean()
  allowComments?: boolean = false;

  @IsOptional()
  @IsBoolean()
  requireAuth?: boolean = false;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100000)
  maxViews?: number;

  @IsOptional()
  @IsString()
  password?: string;
}

export class AccessSharedNoteDto {
  @IsOptional()
  @IsString()
  password?: string;
}

