import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { CategoriesProcessor } from './categories.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'smart-categorization',
    }),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesProcessor],
  exports: [CategoriesService],
})
export class CategoriesModule {}
