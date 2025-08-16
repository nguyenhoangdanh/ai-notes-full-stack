import { IsString, IsArray, IsOptional, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Category name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Category description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Category color (hex code)', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ description: 'Category icon name', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: 'Keywords for auto-categorization', type: [String] })
  @IsArray()
  @IsString({ each: true })
  keywords: string[];

  @ApiProperty({ description: 'Is auto-generated category', required: false })
  @IsOptional()
  @IsBoolean()
  isAuto?: boolean;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

export class AutoCategorizeDto {
  @ApiProperty({ description: 'Confidence threshold (0-1)', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  threshold?: number = 0.7;
}

export class CategorySuggestionDto {
  @ApiProperty({ description: 'Suggested category name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Confidence score' })
  @IsNumber()
  confidence: number;

  @ApiProperty({ description: 'Matching keywords' })
  @IsArray()
  @IsString({ each: true })
  matchingKeywords: string[];

  @ApiProperty({ description: 'Category exists in user categories' })
  @IsBoolean()
  exists: boolean;

  @ApiProperty({ description: 'Existing category ID if exists', required: false })
  @IsOptional()
  @IsString()
  existingCategoryId?: string;
}
