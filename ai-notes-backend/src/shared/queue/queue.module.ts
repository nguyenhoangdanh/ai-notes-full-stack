import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          url: configService.get('REDIS_URL'),
          tls: {
            rejectUnauthorized: false,
          },
          maxRetriesPerRequest: null,
          retryDelayOnFailover: 100,
          enableReadyCheck: false,
          maxLoadingTimeout: 5000,
          lazyConnect: true,
          keepAlive: 30000,
          connectTimeout: 20000,
          commandTimeout: 10000,
          family: 4,
          reconnectOnError: (err) => {
            const targetError = 'READONLY';
            return err.message.includes(targetError);
          },
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
