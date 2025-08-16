import { Module } from '@nestjs/common';
import { VectorsModule } from '../vectors/vectors.module';
import { SettingsModule } from '../settings/settings.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [VectorsModule, SettingsModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
