import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ChatQueryDto {
  @ApiProperty({ description: 'Chat query text' })
  @IsString()
  query: string;

  @ApiProperty({ description: 'AI model to use', required: false })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ description: 'Maximum tokens for response', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(8000)
  maxTokens?: number;
}