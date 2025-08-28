import { IsString, IsArray, IsOptional, IsBoolean, IsNumber, IsEnum, IsDateString, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { AdvancedSearchFilters } from '@/types/search.types';

export class DateRangeDto {
  @IsDateString()
  from: string;

  @IsDateString()
  to: string;
}

export class WordCountRangeDto {
  @IsNumber()
  @Type(() => Number)
  min: number;

  @IsNumber()
  @Type(() => Number)
  max: number;
}

export class AdvancedSearchDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsString()
  workspaceId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: DateRangeDto;

  @IsOptional()
  @IsBoolean()
  hasAttachments?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => WordCountRangeDto)
  wordCountRange?: WordCountRangeDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lastModifiedDays?: number;

  @IsOptional()
  @IsEnum(['relevance', 'created', 'updated', 'title', 'size'])
  sortBy?: 'relevance' | 'created' | 'updated' | 'title' | 'size';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 20;
}

export class SaveSearchDto {
  @IsString()
  name: string;

  @IsString()
  query: string;

  @IsOptional()
  filters?: AdvancedSearchFilters;
}