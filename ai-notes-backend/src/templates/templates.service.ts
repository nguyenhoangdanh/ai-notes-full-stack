import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { ActivitiesService } from '../activities/activities.service';

export interface TemplateVariable {
  name: string;
  type: 'text' | 'date' | 'number' | 'select' | 'textarea';
  label: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  options?: string[]; // For select type
}

export interface TemplateMetadata {
  variables: TemplateVariable[];
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: number; // minutes to fill
  useCase: string;
}

export interface ProcessedTemplate {
  id: string;
  name: string;
  description?: string;
  content: string;
  processedContent: string;
  variables: Record<string, any>;
  metadata: TemplateMetadata;
  createdAt: Date;
  author?: {
    name: string;
    image?: string;
  };
}

export interface TemplateUsageStats {
  totalUses: number;
  uniqueUsers: number;
  averageRating: number;
  usageByCategory: Record<string, number>;
  popularVariables: Array<{ name: string; frequency: number }>;
  timeToComplete: number; // average minutes
}

@Injectable()
export class TemplatesService {
  constructor(
    private prisma: PrismaService,
    private activitiesService: ActivitiesService,
    @InjectQueue('template-processing') private templateQueue: Queue,
  ) {}

  async createTemplate(userId: string, data: {
    name: string;
    description?: string;
    content: string;
    tags?: string[];
    isPublic?: boolean;
    metadata?: Partial<TemplateMetadata>;
  }) {
    // Extract template variables from content
    const variables = this.extractVariables(data.content);
    const processedMetadata = {
      variables,
      category: this.inferCategory(data.content, data.tags),
      difficulty: this.inferDifficulty(data.content),
      useCase: this.inferUseCase(data.content),
      ...data.metadata
    } as any; // Fix: Cast to any for JSON compatibility

    const template = await this.prisma.template.create({
      data: {
        name: data.name,
        description: data.description,
        content: data.content,
        tags: data.tags || [],
        isPublic: data.isPublic || false,
        ownerId: userId,
        metadata: processedMetadata,
      },
      include: {
        owner: {
          select: { id: true, name: true, image: true }
        }
      }
    });

    // Track activity
    await this.activitiesService.recordActivity({
      userId,
      action: 'TEMPLATE_CREATE',
      metadata: {
        templateName: data.name,
        isPublic: data.isPublic,
        variableCount: variables.length
      }
    });

    // Queue template analysis
    await this.queueTemplateAnalysis(template.id, userId);

    return {
      success: true,
      template: this.formatTemplate(template),
      message: 'Template created successfully'
    };
  }

  async updateTemplate(templateId: string, userId: string, data: {
    name?: string;
    description?: string;
    content?: string;
    tags?: string[];
    isPublic?: boolean;
    metadata?: Partial<TemplateMetadata>;
  }) {
    // Verify ownership
    const template = await this.prisma.template.findFirst({
      where: { id: templateId, ownerId: userId }
    });

    if (!template) {
      throw new NotFoundException('Template not found or not owned by user');
    }

    // Update variables if content changed
    let updatedMetadata = template.metadata as any;
    if (data.content) {
      const variables = this.extractVariables(data.content);
      updatedMetadata = {
        ...updatedMetadata,
        variables,
        category: this.inferCategory(data.content, data.tags || template.tags),
        difficulty: this.inferDifficulty(data.content),
        ...(data.metadata || {})
      };
    } else if (data.metadata) {
      updatedMetadata = { ...updatedMetadata, ...data.metadata };
    }

    const updated = await this.prisma.template.update({
      where: { id: templateId },
      data: {
        ...data,
        metadata: updatedMetadata
      },
      include: {
        owner: {
          select: { id: true, name: true, image: true }
        }
      }
    });

    // Track activity
    await this.activitiesService.recordActivity({
      userId,
      action: 'TEMPLATE_UPDATE',
      metadata: {
        templateName: updated.name,
        changes: Object.keys(data)
      }
    });

    return {
      success: true,
      template: this.formatTemplate(updated),
      message: 'Template updated successfully'
    };
  }

  async deleteTemplate(templateId: string, userId: string) {
    const template = await this.prisma.template.findFirst({
      where: { id: templateId, ownerId: userId }
    });

    if (!template) {
      throw new NotFoundException('Template not found or not owned by user');
    }

    await this.prisma.template.delete({
      where: { id: templateId }
    });

    // Track activity
    await this.activitiesService.recordActivity({
      userId,
      action: 'TEMPLATE_DELETE',
      metadata: {
        templateName: template.name,
        wasPublic: template.isPublic
      }
    });

    return {
      success: true,
      message: `Template "${template.name}" deleted successfully`
    };
  }

  async getUserTemplates(userId: string, options: {
    includePublic?: boolean;
    category?: string;
    tags?: string[];
    limit?: number;
  } = {}) {
    const where = {
      OR: [
        { ownerId: userId },
        ...(options.includePublic ? [{ isPublic: true }] : [])
      ],
      ...(options.category && {
        metadata: {
          path: ['category'],
          equals: options.category
        }
      }),
      ...(options.tags?.length && {
        tags: {
          hasEvery: options.tags
        }
      })
    };

    const templates = await this.prisma.template.findMany({
      where,
      include: {
        owner: {
          select: { id: true, name: true, image: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: options.limit || 50
    });

    return templates.map(template => this.formatTemplate(template));
  }

  async getPublicTemplates(options: {
    category?: string;
    tags?: string[];
    difficulty?: string;
    limit?: number;
    search?: string;
  } = {}) {
    const where = {
      isPublic: true,
      ...(options.category && {
        metadata: {
          path: ['category'],
          equals: options.category
        }
      }),
      ...(options.difficulty && {
        metadata: {
          path: ['difficulty'],
          equals: options.difficulty
        }
      }),
      ...(options.tags?.length && {
        tags: {
          hasEvery: options.tags
        }
      }),
      ...(options.search && {
        OR: [
          { name: { contains: options.search, mode: 'insensitive' as const } },
          { description: { contains: options.search, mode: 'insensitive' as const } }
        ]
      })
    };

    const templates = await this.prisma.template.findMany({
      where,
      include: {
        owner: {
          select: { id: true, name: true, image: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: options.limit || 20
    });

    return templates.map(template => this.formatTemplate(template));
  }

  async getTemplate(templateId: string, userId?: string) {
    const template = await this.prisma.template.findFirst({
      where: {
        id: templateId,
        OR: [
          { ownerId: userId },
          { isPublic: true }
        ]
      },
      include: {
        owner: {
          select: { id: true, name: true, image: true }
        }
      }
    });

    if (!template) {
      throw new NotFoundException('Template not found or not accessible');
    }

    return this.formatTemplate(template);
  }

  async processTemplate(templateId: string, variables: Record<string, any>, userId: string): Promise<ProcessedTemplate> {
    const template = await this.getTemplate(templateId, userId);
    
    // Process template content with variables
    let processedContent = template.content;
    const templateVariables = (template.metadata as any)?.variables || [];

    // Replace variables in content
    templateVariables.forEach((variable: TemplateVariable) => {
      const value = variables[variable.name] || variable.defaultValue || '';
      const placeholder = `{{${variable.name}}}`;
      
      // Handle different variable types
      let processedValue = value;
      if (variable.type === 'date' && value) {
        processedValue = new Date(value).toLocaleDateString();
      } else if (variable.type === 'number' && value) {
        processedValue = Number(value).toString();
      }

      processedContent = processedContent.replace(new RegExp(placeholder, 'g'), processedValue);
    });

    // Replace dynamic variables (date, time, user name)
    processedContent = await this.processDynamicVariables(processedContent, userId);

    // Track template usage
    await this.trackTemplateUsage(templateId, userId, variables);

    return {
      id: template.id,
      name: template.name,
      description: template.description,
      content: template.content,
      processedContent,
      variables,
      metadata: template.metadata as TemplateMetadata,
      createdAt: template.createdAt,
      author: template.author
    };
  }

  async getTemplateCategories(userId?: string) {
    const where = userId ? {
      OR: [
        { ownerId: userId },
        { isPublic: true }
      ]
    } : { isPublic: true };

    const templates = await this.prisma.template.findMany({
      where,
      select: { metadata: true }
    });

    const categories = new Map<string, number>();
    templates.forEach(template => {
      const category = (template.metadata as any)?.category || 'Other';
      categories.set(category, (categories.get(category) || 0) + 1);
    });

    return Array.from(categories.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  async getTemplateUsageStats(templateId: string, userId: string): Promise<TemplateUsageStats> {
    // Verify ownership or public access
    const template = await this.getTemplate(templateId, userId);
    
    // In a real implementation, you'd track usage in a separate table
    // For now, we'll use activity data as a proxy
    const usageActivities = await this.prisma.userActivity.findMany({
      where: {
        action: 'TEMPLATE_USE',
        metadata: {
          path: ['templateId'],
          equals: templateId
        }
      }
    });

    const totalUses = usageActivities.length;
    const uniqueUsers = new Set(usageActivities.map(a => a.userId)).size;
    const averageRating = 4.2; // Mock - would come from rating system
    
    const usageByCategory = {};
    const popularVariables = this.analyzeVariableUsage(usageActivities);
    const timeToComplete = (template.metadata as any)?.estimatedTime || 15;

    return {
      totalUses,
      uniqueUsers,
      averageRating,
      usageByCategory,
      popularVariables,
      timeToComplete
    };
  }

  async duplicateTemplate(templateId: string, userId: string, newName?: string) {
    const template = await this.getTemplate(templateId, userId);
    
    const duplicated = await this.prisma.template.create({
      data: {
        name: newName || `${template.name} (Copy)`,
        description: template.description,
        content: template.content,
        tags: template.tags,
        isPublic: false, // Always private by default
        ownerId: userId,
        metadata: template.metadata as any
      },
      include: {
        owner: {
          select: { id: true, name: true, image: true }
        }
      }
    });

    // Track activity
    await this.activitiesService.recordActivity({
      userId,
      action: 'TEMPLATE_DUPLICATE',
      metadata: {
        originalTemplateId: templateId,
        newTemplateName: duplicated.name
      }
    });

    return {
      success: true,
      template: this.formatTemplate(duplicated),
      message: 'Template duplicated successfully'
    };
  }

  async searchTemplates(query: string, userId?: string, options: {
    includePublic?: boolean;
    limit?: number;
  } = {}) {
    const where = {
      OR: [
        ...(userId ? [{ ownerId: userId }] : []),
        ...(options.includePublic ? [{ isPublic: true }] : [])
      ],
      AND: {
        OR: [
          { name: { contains: query, mode: 'insensitive' as const } },
          { description: { contains: query, mode: 'insensitive' as const } },
          { content: { contains: query, mode: 'insensitive' as const } },
          { tags: { has: query } }
        ]
      }
    };

    const templates = await this.prisma.template.findMany({
      where,
      include: {
        owner: {
          select: { id: true, name: true, image: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: options.limit || 20
    });

    return templates.map(template => this.formatTemplate(template));
  }

  private extractVariables(content: string): TemplateVariable[] {
    const variableRegex = /{{(\w+)(?::([^}]+))?}}/g;
    const variables: TemplateVariable[] = [];
    const seen = new Set();

    let match;
    while ((match = variableRegex.exec(content)) !== null) {
      const [, name, options] = match;
      
      if (seen.has(name)) continue;
      seen.add(name);

      // Parse options (e.g., {{name:text:required}} or {{date:date:Today}})
      const optionsParts = options ? options.split(':') : [];
      const type = optionsParts[0] as TemplateVariable['type'] || 'text';
      const defaultValue = optionsParts[1];
      const required = optionsParts.includes('required');

      variables.push({
        name,
        type,
        label: this.humanize(name),
        placeholder: this.generatePlaceholder(name, type),
        defaultValue,
        required
      });
    }

    return variables;
  }

  private inferCategory(content: string, tags: string[] = []): string {
    const categoryKeywords = {
      'Meeting': ['meeting', 'agenda', 'minutes', 'discussion', 'attendees'],
      'Project': ['project', 'milestone', 'deadline', 'task', 'requirements'],
      'Personal': ['diary', 'journal', 'reflection', 'personal', 'thoughts'],
      'Research': ['research', 'analysis', 'findings', 'study', 'data'],
      'Planning': ['plan', 'schedule', 'timeline', 'strategy', 'roadmap'],
      'Documentation': ['documentation', 'guide', 'manual', 'specification', 'reference'],
      'Creative': ['idea', 'creative', 'brainstorm', 'concept', 'design'],
      'Education': ['lesson', 'learning', 'course', 'tutorial', 'education']
    };

    const contentLower = content.toLowerCase();
    const allText = [...tags, contentLower].join(' ').toLowerCase();

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const matchCount = keywords.filter(keyword => allText.includes(keyword)).length;
      if (matchCount >= 2) {
        return category;
      }
    }

    return 'General';
  }

  private inferDifficulty(content: string): 'beginner' | 'intermediate' | 'advanced' {
    const variableCount = (content.match(/{{/g) || []).length;
    const lineCount = content.split('\n').length;
    const wordCount = content.split(' ').length;

    if (variableCount >= 10 || lineCount >= 50 || wordCount >= 500) {
      return 'advanced';
    } else if (variableCount >= 5 || lineCount >= 20 || wordCount >= 200) {
      return 'intermediate';
    }
    
    return 'beginner';
  }

  private inferUseCase(content: string): string {
    const useCaseKeywords = {
      'Daily standup': ['standup', 'daily', 'yesterday', 'today', 'blockers'],
      'Project planning': ['objectives', 'deliverables', 'timeline', 'resources'],
      'Meeting notes': ['agenda', 'action items', 'decisions', 'attendees'],
      'Weekly review': ['accomplishments', 'goals', 'next week', 'review'],
      'Research notes': ['hypothesis', 'methodology', 'results', 'conclusion'],
      'Bug report': ['bug', 'reproduce', 'expected', 'actual', 'severity'],
      'Feature specification': ['feature', 'requirements', 'acceptance criteria']
    };

    const contentLower = content.toLowerCase();
    
    for (const [useCase, keywords] of Object.entries(useCaseKeywords)) {
      const matchCount = keywords.filter(keyword => contentLower.includes(keyword)).length;
      if (matchCount >= 2) {
        return useCase;
      }
    }

    return 'General purpose';
  }

  private async processDynamicVariables(content: string, userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    });

    const now = new Date();
    const dynamicVariables = {
      '{{today}}': now.toLocaleDateString(),
      '{{now}}': now.toLocaleString(),
      '{{user_name}}': user?.name || user?.email || 'User',
      '{{user_email}}': user?.email || '',
      '{{year}}': now.getFullYear().toString(),
      '{{month}}': (now.getMonth() + 1).toString().padStart(2, '0'),
      '{{day}}': now.getDate().toString().padStart(2, '0')
    };

    let processedContent = content;
    Object.entries(dynamicVariables).forEach(([placeholder, value]) => {
      processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value);
    });

    return processedContent;
  }

  private async trackTemplateUsage(templateId: string, userId: string, variables: Record<string, any>) {
    await this.activitiesService.recordActivity({
      userId,
      action: 'TEMPLATE_USE',
      metadata: {
        templateId,
        variablesUsed: Object.keys(variables).length,
        variables: variables
      }
    });
  }

  private analyzeVariableUsage(activities: any[]): Array<{ name: string; frequency: number }> {
    const variableFrequency = new Map<string, number>();
    
    activities.forEach(activity => {
      const variables = activity.metadata?.variables || {};
      Object.keys(variables).forEach(variableName => {
        variableFrequency.set(variableName, (variableFrequency.get(variableName) || 0) + 1);
      });
    });

    return Array.from(variableFrequency.entries())
      .map(([name, frequency]) => ({ name, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }

  private formatTemplate(template: any) {
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      content: template.content,
      tags: template.tags,
      isPublic: template.isPublic,
      metadata: template.metadata,
      createdAt: template.createdAt,
      author: template.owner ? {
        id: template.owner.id,
        name: template.owner.name,
        image: template.owner.image
      } : null,
      isOwned: template.ownerId
    };
  }

  private humanize(str: string): string {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/^\w/, c => c.toUpperCase());
  }

  private generatePlaceholder(name: string, type: TemplateVariable['type']): string {
    const placeholders = {
      text: `Enter ${this.humanize(name).toLowerCase()}`,
      textarea: `Enter detailed ${this.humanize(name).toLowerCase()}`,
      date: 'Select date',
      number: 'Enter number',
      select: 'Select option'
    };
    
    return placeholders[type] || placeholders.text;
  }

  private async queueTemplateAnalysis(templateId: string, userId: string) {
    try {
      await this.templateQueue.add(
        'analyze-template',
        { templateId, userId },
        {
          attempts: 2,
          priority: -1
        }
      );
    } catch (error) {
      console.error('Failed to queue template analysis:', error);
    }
  }

  async getRecommendedTemplates(userId: string, limit: number = 5) {
    // Get user's recent activities to understand preferences
    const recentActivities = await this.prisma.userActivity.findMany({
      where: {
        userId,
        action: { in: ['NOTE_CREATE', 'TEMPLATE_USE'] }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Get user's existing templates to understand their style
    const userTemplates = await this.prisma.template.findMany({
      where: { ownerId: userId },
      select: { tags: true, metadata: true }
    });

    // Analyze user preferences
    const preferredCategories = this.extractPreferredCategories(userTemplates);
    const preferredTags = this.extractPreferredTags(userTemplates);

    // Find matching public templates - Fix: Use direct where conditions
    const recommendations = await this.prisma.template.findMany({
      where: {
        isPublic: true,
        ownerId: { not: userId },
        OR: [
          // Category match using JSON path
          ...(preferredCategories.length > 0 ? preferredCategories.map(category => ({
            metadata: {
              path: ['category'],
              equals: category
            }
          })) : []),
          // Tag match
          ...(preferredTags.length > 0 ? [{
            tags: {
              hasSome: preferredTags
            }
          }] : [])
        ]
      },
      include: {
        owner: {
          select: { id: true, name: true, image: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return recommendations.map(template => this.formatTemplate(template));
  }

  private extractPreferredCategories(templates: any[]): string[] {
    const categoryFreq = new Map<string, number>();
    
    templates.forEach(template => {
      const category = template.metadata?.category;
      if (category) {
        categoryFreq.set(category, (categoryFreq.get(category) || 0) + 1);
      }
    });

    return Array.from(categoryFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);
  }

  private extractPreferredTags(templates: any[]): string[] {
    const tagFreq = new Map<string, number>();
    
    templates.forEach(template => {
      template.tags?.forEach((tag: string) => {
        tagFreq.set(tag, (tagFreq.get(tag) || 0) + 1);
      });
    });

    return Array.from(tagFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);
  }
}
