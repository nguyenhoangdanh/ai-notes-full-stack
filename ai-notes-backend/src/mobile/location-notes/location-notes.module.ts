import { Module } from '@nestjs/common';
import { LocationNotesService } from './location-notes.service';
import { LocationNotesController } from './location-notes.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LocationNotesController],
  providers: [LocationNotesService],
  exports: [LocationNotesService],
})
export class LocationNotesModule {}