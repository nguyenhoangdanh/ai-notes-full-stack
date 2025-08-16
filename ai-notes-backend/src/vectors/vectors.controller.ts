import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VectorsService } from './vectors.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../types/user.types';

interface SemanticSearchDto {
  query: string;
  limit?: number;
}

@Controller('vectors')
@UseGuards(JwtAuthGuard)
export class VectorsController {
  constructor(private vectorsService: VectorsService) {}

  @Post('semantic-search')
  async semanticSearch(
    @Body() data: SemanticSearchDto,
    @CurrentUser() user: User,
  ) {
    return this.vectorsService.semanticSearch(data.query, user.id, data.limit);
  }
}
