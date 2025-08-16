import { Module } from '@nestjs/common';
import { NotificationsModule } from './notifications/notifications.module';
import { RemindersModule } from './reminders/reminders.module';

@Module({
  imports: [
    NotificationsModule,
    RemindersModule,
  ],
  exports: [
    NotificationsModule,
    RemindersModule,
  ],
})
export class NotificationModule {}