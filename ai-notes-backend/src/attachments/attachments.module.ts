import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { BullModule } from '@nestjs/bullmq';
import { AttachmentsService } from './attachments.service';
import { AttachmentsController } from './attachments.controller';
import { AttachmentsProcessor } from './attachments.processor';
import { CloudflareR2Service } from '../common/r2.service';
import { ActivitiesModule } from '../activities/activities.module';
import { EnvironmentConfig } from '../config/config.environment';

@Module({
  imports: [
    // Configure Multer for file uploads
    MulterModule.register({
      limits: {
        fileSize: 500 * 1024 * 1024, // 500MB max file size
        files: 10, // Max 10 files per request
      },
      fileFilter: (req, file, callback) => {
        // File type validation will be done in the service
        callback(null, true);
      },
    }),
    
    BullModule.registerQueue({
      name: 'attachment-processing',
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
  controllers: [AttachmentsController],
  providers: [
    AttachmentsService, 
    AttachmentsProcessor,
    CloudflareR2Service,
    EnvironmentConfig,
  ],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}
