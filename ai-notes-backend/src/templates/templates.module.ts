import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';
import { TemplatesProcessor } from './templates.processor';
import { ActivitiesModule } from '../activities/activities.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'template-processing',
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
    ActivitiesModule,
  ],
  controllers: [TemplatesController],
  providers: [TemplatesService, TemplatesProcessor],
  exports: [TemplatesService],
})
export class TemplatesModule {}
