import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { TagsProcessor } from './tags.processor';
import { ActivitiesModule } from '../activities/activities.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'tag-processing',
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
    ActivitiesModule,
  ],
  controllers: [TagsController],
  providers: [TagsService, TagsProcessor],
  exports: [TagsService],
})
export class TagsModule {}
