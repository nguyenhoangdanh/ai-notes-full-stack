import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { VersionsService } from './versions.service';
import { VersionsController } from './versions.controller';
import { VersionsProcessor } from './versions.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'version-control',
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    }),
  ],
  controllers: [VersionsController],
  providers: [VersionsService, VersionsProcessor],
  exports: [VersionsService],
})
export class VersionsModule {}
