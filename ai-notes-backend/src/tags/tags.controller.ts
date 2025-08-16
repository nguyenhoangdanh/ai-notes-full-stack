import {
  Controller,
  Get,
  Post,
  Put,
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
import { TagsService } from './tags.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../types/user.types';
import { IsString, IsOptional, IsArray, IsEnum, IsBoolean } from 'class-validator';

export class CreateTagDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}

export class UpdateTagDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class DeleteTagDto {
  @IsOptional()
  @IsString()
  reassignTo?: string;

  @IsOptional()
  @IsBoolean()
  removeFromNotes?: boolean = false;
}

export class BulkTagOperationDto {
  @IsEnum(['assign', 'remove', 'replace'])
  type: 'assign' | 'remove' | 'replace';

  @IsArray()
  @IsString({ each: true })
  noteIds: string[];

  @IsArray()
  @IsString({ each: true })
  tagIds: string[];

  @IsOptional()
  @IsString()
  replacementTagId?: string;
}

@ApiTags('tags')
@ApiBearerAuth()
@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({ status: 201, description: 'Tag created successfully' })
  @ApiResponse({ status: 409, description: 'Tag already exists' })
  async createTag(
    @Body() data: CreateTagDto,
    @CurrentUser() user: User,
  ) {
    try {
      return await this.tagsService.createTag(user.id, data);
    } catch (error) {
      console.error('Create tag error:', error);
      return {
        success: false,
        message: error.message || 'Failed to create tag'
      };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all user tags' })
  @ApiResponse({ status: 200, description: 'Tags retrieved successfully' })
  async getUserTags(@CurrentUser() user: User) {
    try {
      const tags = await this.tagsService.getUserTags(user.id);
      
      return {
        success: true,
        tags,
        count: tags.length
      };
    } catch (error) {
      console.error('Get tags error:', error);
      return {
        success: false,
        tags: [],
        error: error.message
      };
    }
  }

  @Get('hierarchy')
  @ApiOperation({ summary: 'Get tag hierarchy' })
  @ApiResponse({ status: 200, description: 'Tag hierarchy retrieved successfully' })
  async getTagHierarchy(@CurrentUser() user: User) {
    try {
      const hierarchy = await this.tagsService.getTagHierarchy(user.id);
      
      return {
        success: true,
        hierarchy
      };
    } catch (error) {
      console.error('Get tag hierarchy error:', error);
      return {
        success: false,
        hierarchy: [],
        error: error.message
      };
    }
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get tag usage analytics' })
  @ApiResponse({ status: 200, description: 'Tag analytics retrieved successfully' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to analyze' })
  async getTagAnalytics(
    @CurrentUser() user: User,
    @Query('days') days?: string,
  ) {
    try {
      const daysValue = days ? parseInt(days) : 30;
      const analytics = await this.tagsService.getTagAnalytics(user.id, daysValue);
      
      return {
        success: true,
        analytics,
        period: {
          days: daysValue,
          startDate: new Date(Date.now() - daysValue * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Get tag analytics error:', error);
      return {
        success: false,
        analytics: null,
        error: error.message
      };
    }
  }

  @Put(':tagId')
  @ApiOperation({ summary: 'Update tag details' })
  @ApiResponse({ status: 200, description: 'Tag updated successfully' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async updateTag(
    @Param('tagId') tagId: string,
    @Body() data: UpdateTagDto,
    @CurrentUser() user: User,
  ) {
    try {
      return await this.tagsService.updateTag(tagId, user.id, data);
    } catch (error) {
      console.error('Update tag error:', error);
      return {
        success: false,
        message: error.message || 'Failed to update tag'
      };
    }
  }

  @Delete(':tagId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete tag' })
  @ApiResponse({ status: 200, description: 'Tag deleted successfully' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async deleteTag(
    @Param('tagId') tagId: string,
    @Body() options: DeleteTagDto,
    @CurrentUser() user: User,
  ) {
    try {
      return await this.tagsService.deleteTag(tagId, user.id, options);
    } catch (error) {
      console.error('Delete tag error:', error);
      throw error;
    }
  }

  @Post('suggest/:noteId')
  @ApiOperation({ summary: 'Get tag suggestions for a note' })
  @ApiResponse({ status: 200, description: 'Tag suggestions retrieved successfully' })
  async suggestTags(
    @Param('noteId') noteId: string,
    @Body() data: { content: string },
    @CurrentUser() user: User,
  ) {
    try {
      const suggestions = await this.tagsService.suggestTags(noteId, user.id, data.content);
      
      return {
        success: true,
        suggestions,
        count: suggestions.length
      };
    } catch (error) {
      console.error('Get tag suggestions error:', error);
      return {
        success: false,
        suggestions: [],
        error: error.message
      };
    }
  }

  @Post('bulk-operation')
  @ApiOperation({ summary: 'Perform bulk tag operations' })
  @ApiResponse({ status: 200, description: 'Bulk operation completed' })
  async bulkTagOperation(
    @Body() operation: BulkTagOperationDto,
    @CurrentUser() user: User,
  ) {
    try {
      return await this.tagsService.bulkTagOperation(user.id, operation);
    } catch (error) {
      console.error('Bulk tag operation error:', error);
      return {
        success: false,
        message: error.message || 'Failed to perform bulk operation'
      };
    }
  }

  @Get('suggestions/history')
  @ApiOperation({ summary: 'Get tag suggestion application history' })
  @ApiResponse({ status: 200, description: 'Suggestion history retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getSuggestionHistory(
    @CurrentUser() user: User,
    @Query('limit') limit?: string,
  ) {
    try {
      const limitValue = limit ? parseInt(limit) : 20;
      const history = await this.tagsService.getTagSuggestionHistory(user.id, limitValue);
      
      return {
        success: true,
        history,
        count: history.length
      };
    } catch (error) {
      console.error('Get suggestion history error:', error);
      return {
        success: false,
        history: [],
        error: error.message
      };
    }
  }

  @Get('export')
  @ApiOperation({ summary: 'Export tags data' })
  @ApiResponse({ status: 200, description: 'Tags exported successfully' })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv'] })
  async exportTags(
    @Query('format') format: 'json' | 'csv' = 'json',
    @CurrentUser() user: User,
  ) {
    try {
      const tags = await this.tagsService.getUserTags(user.id);
      
      if (format === 'csv') {
        const csvHeader = 'Name,Color,Description,Note Count,Created At\n';
        const csvData = tags.map(tag => 
          `"${tag.name}","${tag.color || ''}","${tag.description || ''}",${tag.noteCount},"${tag.createdAt.toISOString()}"`
        ).join('\n');
        
        return {
          success: true,
          data: csvHeader + csvData,
          format: 'csv',
          count: tags.length
        };
      }

      return {
        success: true,
        data: tags,
        format: 'json',
        count: tags.length
      };
    } catch (error) {
      console.error('Export tags error:', error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  }

  @Post('import')
  @ApiOperation({ summary: 'Import tags from external source' })
  @ApiResponse({ status: 201, description: 'Tags imported successfully' })
  async importTags(
    @Body() data: {
      tags: Array<{
        name: string;
        color?: string;
        description?: string;
      }>;
      mergeStrategy: 'skip' | 'overwrite' | 'merge';
    },
    @CurrentUser() user: User,
  ) {
    try {
      let imported = 0;
      let skipped = 0;
      let errors: string[] = [];

      for (const tagData of data.tags) {
        try {
          const existing = await this.tagsService['prisma'].tag.findFirst({
            where: {
              name: tagData.name,
              ownerId: user.id
            }
          });

          if (existing) {
            if (data.mergeStrategy === 'skip') {
              skipped++;
              continue;
            } else if (data.mergeStrategy === 'overwrite') {
              await this.tagsService.updateTag(existing.id, user.id, {
                color: tagData.color,
                description: tagData.description
              });
              imported++;
            } else if (data.mergeStrategy === 'merge') {
              await this.tagsService.updateTag(existing.id, user.id, {
                color: tagData.color || existing.color,
                description: tagData.description || existing.description
              });
              imported++;
            }
          } else {
            await this.tagsService.createTag(user.id, tagData);
            imported++;
          }
        } catch (error) {
          errors.push(`Failed to import tag "${tagData.name}": ${error.message}`);
        }
      }

      return {
        success: true,
        imported,
        skipped,
        errors,
        message: `Import completed: ${imported} imported, ${skipped} skipped`
      };
    } catch (error) {
      console.error('Import tags error:', error);
      return {
        success: false,
        message: error.message || 'Failed to import tags'
      };
    }
  }
}
