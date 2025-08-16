import { Module } from '@nestjs/common';
import { VoiceNotesService } from './voice-notes.service';
import { VoiceNotesController } from './voice-notes.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      dest: './uploads/voice-notes',
    }),
  ],
  controllers: [VoiceNotesController],
  providers: [VoiceNotesService],
  exports: [VoiceNotesService],
})
export class VoiceNotesModule {}