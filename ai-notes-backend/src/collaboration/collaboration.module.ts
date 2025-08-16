import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CollaborationService } from './collaboration.service';
import { CollaborationController } from './collaboration.controller';
import { CollaborationProcessor } from './collaboration.processor';
import { UsersModule } from '../users/users.module';
import { NotesModule } from '../notes/notes.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'collaboration',
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
      },
    }),
    UsersModule,
    NotesModule,
  ],
  controllers: [CollaborationController],
  providers: [CollaborationService, CollaborationProcessor],
  exports: [CollaborationService],
})
export class CollaborationModule {}
