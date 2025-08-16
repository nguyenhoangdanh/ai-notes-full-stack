import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VoiceNotesService } from './voice-notes.service';
import { CreateVoiceNoteDto, UpdateVoiceNoteDto } from './dto/voice-notes.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('voice-notes')
@UseGuards(JwtAuthGuard)
export class VoiceNotesController {
  constructor(private readonly voiceNotesService: VoiceNotesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('audio', {
    storage: diskStorage({
      destination: './uploads/voice-notes',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `voice-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('audio/')) {
        cb(null, true);
      } else {
        cb(new Error('Only audio files are allowed'), false);
      }
    },
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB limit
    },
  }))
  uploadVoiceNote(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @CurrentUser() user: any,
  ) {
    if (!file) {
      throw new Error('No audio file provided');
    }

    const createVoiceNoteDto: CreateVoiceNoteDto = {
      noteId: body.noteId,
      filename: file.originalname,
      filepath: file.path,
      duration: parseInt(body.duration) || 0,
      language: body.language,
    };

    return this.voiceNotesService.create(createVoiceNoteDto, user.id);
  }

  @Post()
  create(@Body() createVoiceNoteDto: CreateVoiceNoteDto, @CurrentUser() user: any) {
    return this.voiceNotesService.create(createVoiceNoteDto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query('noteId') noteId?: string) {
    return this.voiceNotesService.findAll(user.id, noteId);
  }

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.voiceNotesService.getVoiceNoteStats(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.voiceNotesService.findOne(id, user.id);
  }

  @Get(':id/transcription')
  getTranscriptionStatus(@Param('id') id: string, @CurrentUser() user: any) {
    return this.voiceNotesService.getTranscriptionStatus(id, user.id);
  }

  @Post(':id/retry-transcription')
  retryTranscription(@Param('id') id: string, @CurrentUser() user: any) {
    return this.voiceNotesService.retryTranscription(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateVoiceNoteDto: UpdateVoiceNoteDto,
    @CurrentUser() user: any,
  ) {
    return this.voiceNotesService.update(id, updateVoiceNoteDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.voiceNotesService.remove(id, user.id);
  }
}