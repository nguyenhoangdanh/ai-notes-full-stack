import { Module } from '@nestjs/common';
import { OfflineSyncService } from './offline-sync.service';
import { OfflineSyncController } from './offline-sync.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotesModule } from '../../notes/notes.module';

@Module({
  imports: [PrismaModule, NotesModule],
  controllers: [OfflineSyncController],
  providers: [OfflineSyncService],
  exports: [OfflineSyncService],
})
export class OfflineSyncModule {}