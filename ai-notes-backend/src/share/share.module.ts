import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ShareService } from './share.service';
import { ShareController } from './share.controller';
import { ShareProcessor } from './share.processor';
import { NotesModule } from '../notes/notes.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'share-analytics',
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
      },
    }),
    NotesModule,
  ],
  controllers: [ShareController],
  providers: [ShareService, ShareProcessor],
  exports: [ShareService],
})
export class ShareModule {}
