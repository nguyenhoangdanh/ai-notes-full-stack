import { Module, forwardRef } from '@nestjs/common';
import { NotesService } from './notes.service';
import { VectorsModule } from '../vectors/vectors.module';
import { CategoriesModule } from '../smart/categories/categories.module';
import { NotesController } from './notes.controller';
import { VersionsModule } from '../versions/versions.module';

@Module({
  imports: [
    VectorsModule, 
    CategoriesModule, 
    forwardRef(() => VersionsModule)
  ],
  controllers: [NotesController],
  providers: [NotesService],
  exports: [NotesService],
})
export class NotesModule {}
