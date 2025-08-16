import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { SearchProcessor } from './search.processor';
import { VectorsModule } from '../vectors/vectors.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'search-ranking',
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    }),
    VectorsModule,
  ],
  controllers: [SearchController],
  providers: [SearchService, SearchProcessor],
  exports: [SearchService],
})
export class SearchModule {}
