import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          removeOnComplete: 10,
          removeOnFail: 5,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: 'smart-categorization' },
      { name: 'duplicate-detection' },
      { name: 'related-notes' },
      { name: 'auto-summary' },
      { name: 'voice-transcription' },
      { name: 'ocr-processing' },
      { name: 'export-generation' },
      { name: 'email-notifications' },
      { name: 'data-cleanup' },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
