import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchService, AdvancedSearchFilters } from './search.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../types/user.types';
import { IsString, IsArray, IsOptional, IsBoolean, IsNumber, IsEnum, IsDateString, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class DateRangeDto {
  @IsDateString()
  from: string;

  @IsDateString()
  to: string;
}

export class WordCountRangeDto {
  @IsNumber()
  @Type(() => Number)
  min: number;

  @IsNumber()
  @Type(() => Number)
  max: number;
}

export class AdvancedSearchDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsString()
  workspaceId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: DateRangeDto;

  @IsOptional()
  @IsBoolean()
  hasAttachments?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => WordCountRangeDto)
  wordCountRange?: WordCountRangeDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lastModifiedDays?: number;

  @IsOptional()
  @IsEnum(['relevance', 'created', 'updated', 'title', 'size'])
  sortBy?: 'relevance' | 'created' | 'updated' | 'title' | 'size';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 20;
}

export class SaveSearchDto {
  @IsString()
  name: string;

  @IsString()
  query: string;

  @IsOptional()
  filters?: AdvancedSearchFilters;
}

@ApiTags('search')
@ApiBearerAuth()
@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post('advanced')
  @ApiOperation({ summary: 'Perform advanced search with filters' })
  @ApiResponse({ status: 200, description: 'Search results with facets' })
  async advancedSearch(
    @Body() searchDto: AdvancedSearchDto,
    @CurrentUser() user: User,
  ) {
    try {
      const filters: AdvancedSearchFilters = {
        workspaceId: searchDto.workspaceId,
        tags: searchDto.tags,
        dateRange: searchDto.dateRange ? {
          from: new Date(searchDto.dateRange.from),
          to: new Date(searchDto.dateRange.to)
        } : undefined,
        hasAttachments: searchDto.hasAttachments,
        wordCountRange: searchDto.wordCountRange,
        categories: searchDto.categories,
        lastModifiedDays: searchDto.lastModifiedDays,
        sortBy: searchDto.sortBy,
        sortOrder: searchDto.sortOrder,
      };

      const results = await this.searchService.advancedSearch(
        searchDto.query,
        user.id,
        filters,
        searchDto.limit
      );

      return {
        success: true,
        query: searchDto.query,
        ...results
      };
    } catch (error) {
      console.error('Advanced search error:', error);
      return {
        success: false,
        message: 'Failed to perform advanced search',
        error: error.message
      };
    }
  }

  @Get('history')
  @ApiOperation({ summary: 'Get user search history' })
  @ApiResponse({ status: 200, description: 'Search history retrieved' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getSearchHistory(
    @CurrentUser() user: User,
    @Query('limit') limit?: string,
  ) {
    try {
      const limitValue = limit ? parseInt(limit) : 20;
      const history = await this.searchService.getSearchHistory(user.id, limitValue);

      return {
        success: true,
        history,
        count: history.length
      };
    } catch (error) {
      console.error('Get search history error:', error);
      return {
        success: false,
        history: [],
        error: error.message
      };
    }
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular search queries' })
  @ApiResponse({ status: 200, description: 'Popular searches retrieved' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPopularSearches(
    @CurrentUser() user: User,
    @Query('limit') limit?: string,
  ) {
    try {
      const limitValue = limit ? parseInt(limit) : 10;
      const popular = await this.searchService.getPopularSearches(user.id, limitValue);

      return {
        success: true,
        searches: popular
      };
    } catch (error) {
      console.error('Get popular searches error:', error);
      return {
        success: false,
        searches: [],
        error: error.message
      };
    }
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get search suggestions' })
  @ApiResponse({ status: 200, description: 'Search suggestions retrieved' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query prefix' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getSearchSuggestions(
      @Query('q') query: string,
        @CurrentUser() user: User,
    @Query('limit') limit?: string,
  ) {
    try {
      if (!query || query.trim().length === 0) {
        return {
          success: false,
          suggestions: [],
          message: 'Query parameter is required'
        };
      }

      const limitValue = limit ? parseInt(limit) : 5;
      const suggestions = await this.searchService.getSearchSuggestions(
        user.id, 
        query.trim(), 
        limitValue
      );

      return {
        success: true,
        suggestions,
        query: query.trim()
      };
    } catch (error) {
      console.error('Get search suggestions error:', error);
      return {
        success: false,
        suggestions: [],
        error: error.message
      };
    }
  }

  @Post('save')
  @ApiOperation({ summary: 'Save a search query for reuse' })
  @ApiResponse({ status: 201, description: 'Search saved successfully' })
  async saveSearch(
    @Body() saveSearchDto: SaveSearchDto,
    @CurrentUser() user: User,
  ) {
    try {
      const savedSearch = await this.searchService.saveSearch(
        user.id,
        saveSearchDto.name,
        saveSearchDto.query,
        saveSearchDto.filters || {}
      );

      return {
        success: true,
        savedSearch,
        message: 'Search saved successfully'
      };
    } catch (error) {
      console.error('Save search error:', error);
      return {
        success: false,
        message: 'Failed to save search',
        error: error.message
      };
    }
  }

  @Get('saved')
  @ApiOperation({ summary: 'Get saved searches' })
  @ApiResponse({ status: 200, description: 'Saved searches retrieved' })
  async getSavedSearches(@CurrentUser() user: User) {
    try {
      const savedSearches = await this.searchService.getSavedSearches(user.id);

      return {
        success: true,
        savedSearches,
        count: savedSearches.length
      };
    } catch (error) {
      console.error('Get saved searches error:', error);
      return {
        success: false,
        savedSearches: [],
        error: error.message
      };
    }
  }

  @Delete('saved/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a saved search' })
  @ApiResponse({ status: 204, description: 'Saved search deleted' })
  async deleteSavedSearch(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    try {
      await this.searchService.deleteSavedSearch(id, user.id);
      return { success: true };
    } catch (error) {
      console.error('Delete saved search error:', error);
      throw error;
    }
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get search analytics' })
  @ApiResponse({ status: 200, description: 'Search analytics retrieved' })
  async getSearchAnalytics(@CurrentUser() user: User) {
    try {
      const [history, popular, saved] = await Promise.all([
        this.searchService.getSearchHistory(user.id, 100),
        this.searchService.getPopularSearches(user.id, 20),
        this.searchService.getSavedSearches(user.id)
      ]);

      // Calculate analytics
      const totalSearches = history.length;
      const uniqueQueries = new Set(history.map(h => h.query)).size;
      const avgResultsPerSearch = history.length > 0 
        ? history.reduce((sum, h) => sum + h.resultCount, 0) / history.length 
        : 0;

      const searchesByDay = history.reduce((acc, search) => {
        const date = search.searchedAt.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topQueries = popular.slice(0, 10);

      return {
        success: true,
        analytics: {
          totalSearches,
          uniqueQueries,
          avgResultsPerSearch: Math.round(avgResultsPerSearch * 100) / 100,
          totalSavedSearches: saved.length,
          searchesByDay,
          topQueries,
          searchTrends: {
            last7Days: history.filter(h => 
              h.searchedAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            ).length,
            last30Days: history.filter(h => 
              h.searchedAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            ).length
          }
        }
      };
    } catch (error) {
      console.error('Get search analytics error:', error);
      return {
        success: false,
        analytics: null,
        error: error.message
      };
    }
  }

  @Post('quick')
  @ApiOperation({ summary: 'Quick search (simplified)' })
  @ApiResponse({ status: 200, description: 'Quick search results' })
  async quickSearch(
    @Body() data: { query: string; limit?: number },
    @CurrentUser() user: User,
  ) {
    try {
      if (!data.query || data.query.trim().length === 0) {
        return {
          success: false,
          message: 'Query is required'
        };
      }

      const results = await this.searchService.advancedSearch(
        data.query.trim(),
        user.id,
        { sortBy: 'relevance', sortOrder: 'desc' },
        data.limit || 10
      );

      return {
        success: true,
        query: data.query.trim(),
        results: results.results.map(result => ({
          id: result.id,
          title: result.title,
          excerpt: result.excerpt,
          score: result.score,
          highlights: result.highlights,
          workspace: result.workspace,
          updatedAt: result.updatedAt
        })),
        total: results.total
      };
    } catch (error) {
      console.error('Quick search error:', error);
      return {
        success: false,
        message: 'Failed to perform quick search',
        error: error.message
      };
    }
  }
}
