import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ExportService } from './export.service';
import { CreateExportDto } from './dto/export.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import * as path from 'path';

@Controller('export')
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post()
  create(@Body() createExportDto: CreateExportDto, @CurrentUser() user: any) {
    return this.exportService.create(createExportDto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.exportService.findAll(user.id);
  }

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.exportService.getExportStats(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.exportService.findOne(id, user.id);
  }

  @Get(':id/download')
  async download(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const downloadInfo = await this.exportService.getDownloadUrl(id, user.id);
    const filePath = path.join('./exports', path.basename(downloadInfo.downloadUrl));
    
    res.setHeader('Content-Disposition', `attachment; filename="${downloadInfo.filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.sendFile(path.resolve(filePath));
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.exportService.remove(id, user.id);
  }
}