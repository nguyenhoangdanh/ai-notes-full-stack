import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateVersionDto {
  @IsOptional()
  @IsString()
  changeLog?: string;

  @IsOptional()
  @IsEnum(['major', 'minor', 'patch'])
  changeType?: 'major' | 'minor' | 'patch';

  @IsOptional()
  @IsString()
  isAutomatic?: boolean = false;
}

