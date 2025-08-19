import { IsString, IsOptional, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateSettingsDto {
  @ApiProperty({ description: 'AI model to use', required: false })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ description: 'Maximum tokens per request', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(100)
  @Max(8000)
  maxTokens?: number;

  @ApiProperty({ description: 'Auto re-embed notes on update', required: false })
  @IsOptional()
  @IsBoolean()
  autoReembed?: boolean;
}