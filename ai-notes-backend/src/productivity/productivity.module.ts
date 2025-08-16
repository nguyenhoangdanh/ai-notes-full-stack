import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { PomodoroModule } from './pomodoro/pomodoro.module';
import { CalendarModule } from './calendar/calendar.module';
import { ReviewModule } from './review/review.module';

@Module({
  imports: [
    TasksModule,
    PomodoroModule,
    CalendarModule,
    ReviewModule,
  ],
  exports: [
    TasksModule,
    PomodoroModule,
    CalendarModule,
    ReviewModule,
  ],
})
export class ProductivityModule {}