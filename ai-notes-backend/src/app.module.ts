import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { NotesModule } from './notes/notes.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { ChatModule } from './chat/chat.module';
import { VectorsModule } from './vectors/vectors.module';
import { SettingsModule } from './settings/settings.module';
import { PrismaModule } from './prisma/prisma.module';

// Smart Features
import { QueueModule } from './shared/queue/queue.module';
import { CategoriesModule } from './smart/categories/categories.module';
import { DuplicatesModule } from './smart/duplicates/duplicates.module';
import { RelationsModule } from './smart/relations/relations.module';
import { SummariesModule } from './smart/summaries/summaries.module';
import { SearchModule } from './search/search.module';

// Collaboration Features
import { CollaborationModule } from './collaboration/collaboration.module';
import { ShareModule } from './share/share.module';
import { VersionsModule } from './versions/versions.module';
import { ActivitiesModule } from './activities/activities.module';

// Advanced Content Features
import { TagsModule } from './tags/tags.module';
import { TemplatesModule } from './templates/templates.module';
import { AttachmentsModule } from './attachments/attachments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute
    }]),
    
    // Scheduling for cron jobs
    ScheduleModule.forRoot(),
    
    // Core modules
    PrismaModule,
    AuthModule,
    UsersModule,
    NotesModule,
    WorkspacesModule,
    ChatModule,
    VectorsModule,
    SettingsModule,
    
    // Queue system
    QueueModule,
    
    // Smart Features
    CategoriesModule,
    DuplicatesModule,
    RelationsModule,
    SummariesModule,
    SearchModule,
    
    // Collaboration Features
    CollaborationModule,
    ShareModule,
    VersionsModule,
    ActivitiesModule,
    
    // Advanced Content Features
    TagsModule,
    TemplatesModule,
    AttachmentsModule,
  ],
})
export class AppModule {}
