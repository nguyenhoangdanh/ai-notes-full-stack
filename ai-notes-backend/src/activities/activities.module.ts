import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { ActivitiesProcessor } from './activities.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'activity-analytics',
      defaultJobOptions: {
        removeOnComplete: 5,
        removeOnFail: 3,
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    }),
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService, ActivitiesProcessor],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
