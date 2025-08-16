import { IsString, IsArray, IsOptional, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateSummaryDto {
  @ApiProperty({ description: 'Minimum words required for summary generation', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(50)
  @Max(500)
  minWords?: number = 100;

  @ApiProperty({ description: 'Maximum length of generated summary', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(100)
  @Max(1000)
  maxSummaryLength?: number = 300;

  @ApiProperty({ description: 'Include key points in summary', required: false })
  @IsOptional()
  @IsBoolean()
  includeKeyPoints?: boolean = true;

  @ApiProperty({ description: 'AI model to use for generation', required: false })
  @IsOptional()
  @IsString()
  model?: string;
}

export class BatchSummaryDto {
  @ApiProperty({ description: 'Array of note IDs to generate summaries for' })
  @IsArray()
  @IsString({ each: true })
  noteIds: string[];

  @ApiProperty({ description: 'Minimum words required', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(50)
  minWords?: number = 100;

  @ApiProperty({ description: 'Skip notes that already have summaries', required: false })
  @IsOptional()
  @IsBoolean()
  skipExisting?: boolean = false;
}

export class SummaryResponseDto {
  @ApiProperty({ description: 'Generated summary text' })
  summary: string;

  @ApiProperty({ description: 'Key points extracted from content' })
  keyPoints: string[];

  @ApiProperty({ description: 'Word count of original content' })
  wordCount: number;

  @ApiProperty({ description: 'Estimated reading time in minutes' })
  readingTime: number;

  @ApiProperty({ description: 'AI model used for generation' })
  model: string;
}
