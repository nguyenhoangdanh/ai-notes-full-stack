import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { RelationsService } from './relations.service';
import { RelationsController } from './relations.controller';
import { RelationsProcessor } from './relations.processor';
import { VectorsModule } from '../../vectors/vectors.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'related-notes',
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
  controllers: [RelationsController],
  providers: [RelationsService, RelationsProcessor],
  exports: [RelationsService],
})
export class RelationsModule {}
