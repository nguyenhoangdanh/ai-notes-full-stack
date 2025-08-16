import { IsString, IsArray, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateNoteDto {
  @ApiProperty({ description: 'Note title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Note content in markdown' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Tags for the note', type: [String] })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiProperty({ description: 'Workspace ID where the note belongs' })
  @IsString()
  workspaceId: string;
}

export class UpdateNoteDto extends PartialType(CreateNoteDto) {}

export class SearchNotesDto {
  @ApiProperty({ description: 'Search query' })
  @IsString()
  q: string;

  @ApiProperty({ description: 'Maximum number of results', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
