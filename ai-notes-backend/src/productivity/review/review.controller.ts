import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewPromptDto, UpdateReviewPromptDto, AnswerReviewDto } from './dto/review.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('review')
@UseGuards(JwtAuthGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  create(@Body() createReviewPromptDto: CreateReviewPromptDto, @CurrentUser() user: any) {
    return this.reviewService.create(createReviewPromptDto, user.id);
  }

  @Post('setup-defaults')
  setupDefaults(@CurrentUser() user: any) {
    return this.reviewService.createDefaultPrompts(user.id);
  }

  @Post(':id/answer')
  answerPrompt(
    @Param('id') id: string,
    @Body() answerReviewDto: AnswerReviewDto,
    @CurrentUser() user: any,
  ) {
    return this.reviewService.answerPrompt(id, answerReviewDto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query('active') isActive?: string) {
    const active = isActive ? isActive === 'true' : undefined;
    return this.reviewService.findAll(user.id, active);
  }

  @Get('due')
  getDuePrompts(@CurrentUser() user: any) {
    return this.reviewService.getDuePrompts(user.id);
  }

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.reviewService.getReviewStats(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.reviewService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReviewPromptDto: UpdateReviewPromptDto,
    @CurrentUser() user: any,
  ) {
    return this.reviewService.update(id, updateReviewPromptDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.reviewService.remove(id, user.id);
  }
}