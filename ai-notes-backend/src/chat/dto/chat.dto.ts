import { IsString, IsOptional, IsNumber, Min, Max, IsEnum } from 'class-validator';
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

export class GenerateSuggestionDto {
  @ApiProperty({ description: 'Content to generate suggestions for' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Selected text portion', required: false })
  @IsOptional()
  @IsString()
  selectedText?: string;

  @ApiProperty({ 
    description: 'Type of suggestion to generate',
    enum: ['improve', 'expand', 'summarize', 'restructure', 'examples', 'grammar', 'translate']
  })
  @IsEnum(['improve', 'expand', 'summarize', 'restructure', 'examples', 'grammar', 'translate'])
  suggestionType: 'improve' | 'expand' | 'summarize' | 'restructure' | 'examples' | 'grammar' | 'translate';

  @ApiProperty({ description: 'Target language for translation', required: false })
  @IsOptional()
  @IsString()
  targetLanguage?: string;
}

export class ApplySuggestionDto {
  @ApiProperty({ description: 'Note ID to apply suggestion to' })
  @IsString()
  noteId: string;

  @ApiProperty({ description: 'Original content of the note' })
  @IsString()
  originalContent: string;

  @ApiProperty({ description: 'Suggestion to apply' })
  @IsString()
  suggestion: string;

  @ApiProperty({ description: 'Selected text to replace', required: false })
  @IsOptional()
  @IsString()
  selectedText?: string;

  @ApiProperty({ 
    description: 'How to apply the suggestion',
    enum: ['replace', 'append', 'insert']
  })
  @IsEnum(['replace', 'append', 'insert'])
  applyType: 'replace' | 'append' | 'insert';

  @ApiProperty({ description: 'Position to insert at', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  position?: number;
}