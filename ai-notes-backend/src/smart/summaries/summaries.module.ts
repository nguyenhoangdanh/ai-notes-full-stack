import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SummariesService } from './summaries.service';
import { SummariesController } from './summaries.controller';
import { SummariesProcessor } from './summaries.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'auto-summary',
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
  ],
  controllers: [SummariesController],
  providers: [SummariesService, SummariesProcessor],
  exports: [SummariesService],
})
export class SummariesModule {}
