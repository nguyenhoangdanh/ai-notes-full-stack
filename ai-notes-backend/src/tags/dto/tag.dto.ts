import { IsString, IsOptional, IsArray, IsEnum, IsBoolean } from 'class-validator';

export class CreateTagDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}

export class UpdateTagDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class DeleteTagDto {
  @IsOptional()
  @IsString()
  reassignTo?: string;

  @IsOptional()
  @IsBoolean()
  removeFromNotes?: boolean = false;
}

export class BulkTagOperationDto {
  @IsEnum(['assign', 'remove', 'replace'])
  type: 'assign' | 'remove' | 'replace';

  @IsArray()
  @IsString({ each: true })
  noteIds: string[];

  @IsArray()
  @IsString({ each: true })
  tagIds: string[];

  @IsOptional()
  @IsString()
  replacementTagId?: string;
}