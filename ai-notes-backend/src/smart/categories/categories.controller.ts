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
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CategoriesService } from './categories.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CreateCategoryDto, UpdateCategoryDto, AutoCategorizeDto } from './dto/categories.dto';
import { User } from '../../types/user.types';

@ApiTags('categories')
@ApiBearerAuth()
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser() user: User,
  ) {
    return this.categoriesService.create(createCategoryDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories for user' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  async findAll(
    @CurrentUser() user: User,
    @Query('includeAuto') includeAuto?: string,
  ) {
    return this.categoriesService.findAll(user.id, includeAuto === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.categoriesService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update category by ID' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentUser() user: User,
  ) {
    return this.categoriesService.update(id, updateCategoryDto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete category by ID' })
  @ApiResponse({ status: 204, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.categoriesService.remove(id, user.id);
  }

  @Post('suggest')
  @ApiOperation({ summary: 'Get category suggestions for content' })
  @ApiResponse({ status: 200, description: 'Category suggestions generated' })
  async suggestCategories(
    @Body() data: { content: string },
    @CurrentUser() user: User,
  ) {
    return this.categoriesService.suggestCategories(data.content, user.id);
  }

  @Post('auto-categorize/:noteId')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Auto-categorize a note using AI' })
  @ApiResponse({ status: 202, description: 'Auto-categorization started' })
  async autoCategorizeNote(
    @Param('noteId') noteId: string,
    @Body() autoCategorizeDto: AutoCategorizeDto,
    @CurrentUser() user: User,
  ) {
    return this.categoriesService.autoCategorizeNote(
      noteId,
      user.id,
      autoCategorizeDto.threshold,
    );
  }

  @Get('notes/:noteId')
  @ApiOperation({ summary: 'Get categories for a note' })
  @ApiResponse({ status: 200, description: 'Note categories retrieved' })
  async getNoteCategories(@Param('noteId') noteId: string, @CurrentUser() user: User) {
    return this.categoriesService.getNoteCategories(noteId, user.id);
  }

  @Post('notes/:noteId/assign/:categoryId')
  @ApiOperation({ summary: 'Assign category to note' })
  @ApiResponse({ status: 201, description: 'Category assigned to note' })
  async assignCategory(
    @Param('noteId') noteId: string,
    @Param('categoryId') categoryId: string,
    @CurrentUser() user: User,
  ) {
    return this.categoriesService.assignCategory(noteId, categoryId, user.id);
  }

  @Delete('notes/:noteId/assign/:categoryId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unassign category from note' })
  @ApiResponse({ status: 204, description: 'Category unassigned from note' })
  async unassignCategory(
    @Param('noteId') noteId: string,
    @Param('categoryId') categoryId: string,
    @CurrentUser() user: User,
  ) {
    return this.categoriesService.unassignCategory(noteId, categoryId, user.id);
  }

  @Post('test-suggest')
  @ApiOperation({ summary: 'Test category suggestions (debug)' })
  async testSuggestCategories(
    @Body() data: { content: string; userId?: string },
    @CurrentUser() user: User,
  ) {
    const suggestions = await this.categoriesService.suggestCategories(
      data.content, 
      data.userId || user.id
    );
    
    return {
      success: true,
      content: data.content.substring(0, 200) + '...',
      suggestions,
      debug: {
        suggestionsCount: suggestions.length,
        highConfidence: suggestions.filter(s => s.confidence >= 0.7).length,
        mediumConfidence: suggestions.filter(s => s.confidence >= 0.5 && s.confidence < 0.7).length,
        lowConfidence: suggestions.filter(s => s.confidence < 0.5).length,
        existingCategories: suggestions.filter(s => s.exists).length,
        newSuggestions: suggestions.filter(s => !s.exists).length
      }
    };
  }

  @Post('test-auto-categorize/:noteId')
  @ApiOperation({ summary: 'Test auto-categorization with custom threshold' })
  async testAutoCategorization(
    @Param('noteId') noteId: string,
    @Body() data: { threshold?: number },
    @CurrentUser() user: User,
  ) {
    const threshold = data.threshold || 0.5;
    const results = await this.categoriesService.autoCategorizeNote(noteId, user.id, threshold);
    
    return {
      success: true,
      noteId,
      threshold,
      results,
      summary: {
        totalSuggestions: results.length,
        assigned: results.filter(r => r.assigned).length,
        skipped: results.filter(r => !r.assigned).length
      }
    };
  }
}
