import { Module } from '@nestjs/common';
import { VoiceNotesModule } from './voice-notes/voice-notes.module';
import { LocationNotesModule } from './location-notes/location-notes.module';
import { OfflineSyncModule } from './offline-sync/offline-sync.module';

@Module({
  imports: [
    VoiceNotesModule,
    LocationNotesModule,
    OfflineSyncModule,
  ],
  exports: [
    VoiceNotesModule,
    LocationNotesModule,
    OfflineSyncModule,
  ],
})
export class MobileModule {}