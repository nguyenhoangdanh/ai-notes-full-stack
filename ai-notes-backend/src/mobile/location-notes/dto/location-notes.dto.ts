// Location Notes DTOs
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateLocationNoteDto {
  @IsString()
  noteId: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  placeName?: string;

  @IsOptional()
  @IsNumber()
  accuracy?: number; // GPS accuracy in meters
}

export class UpdateLocationNoteDto {
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  placeName?: string;

  @IsOptional()
  @IsNumber()
  accuracy?: number;
}