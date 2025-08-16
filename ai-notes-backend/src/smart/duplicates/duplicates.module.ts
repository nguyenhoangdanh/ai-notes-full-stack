import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DuplicatesService } from './duplicates.service';
import { DuplicatesController } from './duplicates.controller';
import { DuplicatesProcessor } from './duplicates.processor';
import { VectorsModule } from '../../vectors/vectors.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'duplicate-detection',
      defaultJobOptions: {
        removeOnComplete: 5,
        removeOnFail: 3,
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
      },
    }),
    VectorsModule,
  ],
  controllers: [DuplicatesController],
  providers: [DuplicatesService, DuplicatesProcessor],
  exports: [DuplicatesService],
})
export class DuplicatesModule {}
