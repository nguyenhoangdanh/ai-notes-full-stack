import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VectorsService } from './vectors.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../types/user.types';
import { SemanticSearchDto } from './dto/vectors.dto';

@ApiTags('vectors')
@ApiBearerAuth()
@Controller('vectors')
@UseGuards(JwtAuthGuard)
export class VectorsController {
  constructor(private vectorsService: VectorsService) {}

  @Post('semantic-search')
  @ApiOperation({ summary: 'Perform semantic search on notes' })
  @ApiResponse({ status: 200, description: 'Search results returned' })
  async semanticSearch(
    @Body() data: SemanticSearchDto,
    @CurrentUser() user: User,
  ) {
    return this.vectorsService.semanticSearch(data.query, user.id, data.limit);
  }
}
