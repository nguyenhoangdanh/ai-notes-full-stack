// Export DTOs
import { IsEnum, IsArray, IsString, IsOptional, IsObject } from 'class-validator';
import { ExportType, ExportFormat } from '@prisma/client';

export class CreateExportDto {
  @IsEnum(ExportType)
  type: ExportType;

  @IsEnum(ExportFormat)
  format: ExportFormat;

  @IsArray()
  @IsString({ each: true })
  noteIds: string[];

  @IsOptional()
  @IsString()
  filename?: string;

  @IsOptional()
  @IsObject()
  settings?: any; // Export-specific settings
}

export class ExportSettingsDto {
  @IsOptional()
  includeMetadata?: boolean;

  @IsOptional()
  includeTags?: boolean;

  @IsOptional()
  includeImages?: boolean;

  @IsOptional()
  includeAttachments?: boolean;

  @IsOptional()
  formatOptions?: {
    fontSize?: number;
    fontFamily?: string;
    margins?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  };
}