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
import { TemplatesService, TemplateMetadata } from './templates.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../types/user.types';
import { IsString, IsOptional, IsArray, IsBoolean, IsObject } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = false;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>; // Fix: use generic object instead of Partial<TemplateMetadata>
}

export class UpdateTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>; // Fix: use generic object instead of Partial<TemplateMetadata>
}

export class ProcessTemplateDto {
  @IsObject()
  variables: Record<string, any>;
}

@ApiTags('templates')
@ApiBearerAuth()
@Controller('templates')
@UseGuards(JwtAuthGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  async createTemplate(
    @Body() data: CreateTemplateDto,
    @CurrentUser() user: User,
  ) {
    try {
      // Convert DTO to service interface
      const templateData = {
        name: data.name,
        description: data.description,
        content: data.content,
        tags: data.tags,
        isPublic: data.isPublic,
        metadata: data.metadata as Partial<TemplateMetadata> // Cast to expected type
      };

      return await this.templatesService.createTemplate(user.id, templateData);
    } catch (error) {
      console.error('Create template error:', error);
      return {
        success: false,
        message: error.message || 'Failed to create template'
      };
    }
  }

  @Get('my-templates')
  @ApiOperation({ summary: 'Get user templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  @ApiQuery({ name: 'includePublic', required: false, type: Boolean })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getUserTemplates(
    @CurrentUser() user: User,
    @Query('includePublic') includePublic?: string,
    @Query('category') category?: string,
    @Query('tags') tags?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const options = {
        includePublic: includePublic === 'true',
        category,
        tags: tags ? tags.split(',') : undefined,
        limit: limit ? parseInt(limit) : undefined
      };

      const templates = await this.templatesService.getUserTemplates(user.id, options);
      
      return {
        success: true,
        templates,
        count: templates.length
      };
    } catch (error) {
      console.error('Get user templates error:', error);
      return {
        success: false,
        templates: [],
        error: error.message
      };
    }
  }

  @Get('public')
  @ApiOperation({ summary: 'Get public templates marketplace' })
  @ApiResponse({ status: 200, description: 'Public templates retrieved successfully' })
  async getPublicTemplates(
    @Query('category') category?: string,
    @Query('tags') tags?: string,
    @Query('difficulty') difficulty?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const options = {
        category,
        tags: tags ? tags.split(',') : undefined,
        difficulty,
        search,
        limit: limit ? parseInt(limit) : undefined
      };

      const templates = await this.templatesService.getPublicTemplates(options);
      
      return {
        success: true,
        templates,
        count: templates.length,
        filters: {
          category,
          tags: tags?.split(','),
          difficulty,
          search
        }
      };
    } catch (error) {
      console.error('Get public templates error:', error);
      return {
        success: false,
        templates: [],
        error: error.message
      };
    }
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get template categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  async getTemplateCategories(@CurrentUser() user: User) {
    try {
      const categories = await this.templatesService.getTemplateCategories(user.id);
      
      return {
        success: true,
        categories
      };
    } catch (error) {
      console.error('Get template categories error:', error);
      return {
        success: false,
        categories: [],
        error: error.message
      };
    }
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Get recommended templates' })
  @ApiResponse({ status: 200, description: 'Recommendations retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecommendedTemplates(
    @CurrentUser() user: User,
    @Query('limit') limit?: string,
  ) {
    try {
      const limitValue = limit ? parseInt(limit) : 5;
      const recommendations = await this.templatesService.getRecommendedTemplates(user.id, limitValue);
      
      return {
        success: true,
        recommendations,
        count: recommendations.length
      };
    } catch (error) {
      console.error('Get recommendations error:', error);
      return {
        success: false,
        recommendations: [],
        error: error.message
      };
    }
  }

  @Get('search')
  @ApiOperation({ summary: 'Search templates' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'includePublic', required: false, type: Boolean })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async searchTemplates(
      @Query('q') query: string,
    @CurrentUser() user: User,
    @Query('includePublic') includePublic?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const options = {
        includePublic: includePublic === 'true',
        limit: limit ? parseInt(limit) : undefined
      };

      const templates = await this.templatesService.searchTemplates(query, user.id, options);
      
      return {
        success: true,
        templates,
        count: templates.length,
        query
      };
    } catch (error) {
      console.error('Search templates error:', error);
      return {
        success: false,
        templates: [],
        error: error.message
      };
    }
  }

  @Get(':templateId')
  @ApiOperation({ summary: 'Get template by ID' })
  @ApiResponse({ status: 200, description: 'Template retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async getTemplate(
    @Param('templateId') templateId: string,
    @CurrentUser() user: User,
  ) {
    try {
      const template = await this.templatesService.getTemplate(templateId, user.id);
      
      return {
        success: true,
        template
      };
    } catch (error) {
      console.error('Get template error:', error);
      return {
        success: false,
        template: null,
        error: error.message
      };
    }
  }

  @Put(':templateId')
  @ApiOperation({ summary: 'Update template' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async updateTemplate(
    @Param('templateId') templateId: string,
    @Body() data: UpdateTemplateDto,
    @CurrentUser() user: User,
  ) {
    try {
      return await this.templatesService.updateTemplate(templateId, user.id, data);
    } catch (error) {
      console.error('Update template error:', error);
      return {
        success: false,
        message: error.message || 'Failed to update template'
      };
    }
  }

  @Delete(':templateId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete template' })
  @ApiResponse({ status: 200, description: 'Template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async deleteTemplate(
    @Param('templateId') templateId: string,
    @CurrentUser() user: User,
  ) {
    try {
      return await this.templatesService.deleteTemplate(templateId, user.id);
    } catch (error) {
      console.error('Delete template error:', error);
      throw error;
    }
  }

  @Post(':templateId/process')
  @ApiOperation({ summary: 'Process template with variables' })
  @ApiResponse({ status: 200, description: 'Template processed successfully' })
  async processTemplate(
    @Param('templateId') templateId: string,
    @Body() data: ProcessTemplateDto,
    @CurrentUser() user: User,
  ) {
    try {
      const processed = await this.templatesService.processTemplate(templateId, data.variables, user.id);
      
      return {
        success: true,
        processed,
        message: 'Template processed successfully'
      };
    } catch (error) {
      console.error('Process template error:', error);
      return {
        success: false,
        message: error.message || 'Failed to process template'
      };
    }
  }

  @Post(':templateId/duplicate')
  @ApiOperation({ summary: 'Duplicate template' })
  @ApiResponse({ status: 201, description: 'Template duplicated successfully' })
  async duplicateTemplate(
    @Param('templateId') templateId: string,
    @Body() data: { newName?: string },
    @CurrentUser() user: User,
  ) {
    try {
      return await this.templatesService.duplicateTemplate(templateId, user.id, data.newName);
    } catch (error) {
      console.error('Duplicate template error:', error);
      return {
        success: false,
        message: error.message || 'Failed to duplicate template'
      };
    }
  }

  @Get(':templateId/stats')
  @ApiOperation({ summary: 'Get template usage statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getTemplateStats(
    @Param('templateId') templateId: string,
    @CurrentUser() user: User,
  ) {
    try {
      const stats = await this.templatesService.getTemplateUsageStats(templateId, user.id);
      
      return {
        success: true,
        stats
      };
    } catch (error) {
      console.error('Get template stats error:', error);
      return {
        success: false,
        stats: null,
        error: error.message
      };
    }
  }

  @Get(':templateId/preview')
  @ApiOperation({ summary: 'Preview template with sample variables' })
  @ApiResponse({ status: 200, description: 'Template preview generated' })
  async previewTemplate(
    @Param('templateId') templateId: string,
    @CurrentUser() user: User,
  ) {
    try {
      const template = await this.templatesService.getTemplate(templateId, user.id);
      const variables = (template.metadata as any)?.variables || [];
      
      // Generate sample variables for preview
      const sampleVariables = {};
      variables.forEach((variable: any) => {
        switch (variable.type) {
          case 'text':
            sampleVariables[variable.name] = `Sample ${variable.label}`;
            break;
          case 'textarea':
            sampleVariables[variable.name] = `This is a sample ${variable.label.toLowerCase()} with multiple lines.\n\nIt shows how the template will look with real content.`;
            break;
          case 'date':
            sampleVariables[variable.name] = new Date().toLocaleDateString();
            break;
          case 'number':
            sampleVariables[variable.name] = '42';
            break;
          case 'select':
            sampleVariables[variable.name] = variable.options?.[0] || 'Option 1';
            break;
          default:
            sampleVariables[variable.name] = variable.defaultValue || 'Sample Value';
        }
      });

      const processed = await this.templatesService.processTemplate(templateId, sampleVariables, user.id);
      
      return {
        success: true,
        preview: {
          ...processed,
          isSample: true
        }
      };
    } catch (error) {
      console.error('Preview template error:', error);
      return {
        success: false,
        message: error.message || 'Failed to generate preview'
      };
    }
  }
}
