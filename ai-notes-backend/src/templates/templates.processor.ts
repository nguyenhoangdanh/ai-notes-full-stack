import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

interface TemplateAnalysisJobData {
  templateId: string;
  userId: string;
}

@Injectable()
@Processor('template-processing')
export class TemplatesProcessor extends WorkerHost {
  private readonly logger = new Logger(TemplatesProcessor.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'analyze-template':
        return this.handleAnalyzeTemplate(job);
      case 'optimize-template-performance':
        return this.handleOptimizeTemplatePerformance(job);
      case 'generate-template-suggestions':
        return this.handleGenerateTemplateSuggestions(job);
      case 'cleanup-unused-templates':
        return this.handleCleanupUnusedTemplates(job);
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async handleAnalyzeTemplate(job: Job<TemplateAnalysisJobData>) {
    const { templateId, userId } = job.data;
    
    this.logger.log(`Analyzing template ${templateId}`);
    
    try {
      const template = await this.prisma.template.findUnique({
        where: { id: templateId }
      });

      if (!template) {
        throw new Error('Template not found');
      }

      // Analyze template structure
      const analysis = {
        variableCount: (template.content.match(/{{/g) || []).length,
        wordCount: template.content.split(' ').length,
        lineCount: template.content.split('\n').length,
        complexity: this.calculateComplexity(template.content),
        categories: this.detectCategories(template.content),
        estimatedTime: this.estimateCompletionTime(template.content),
        qualityScore: this.assessQuality(template.content)
      };

      // Update template metadata with analysis
      await this.prisma.template.update({
        where: { id: templateId },
        data: {
          metadata: {
            ...template.metadata as any,
            analysis,
            lastAnalyzed: new Date().toISOString()
          }
        }
      });

      this.logger.log(`Template analysis completed for ${templateId}`);

      return {
        templateId,
        analysis,
        recommendations: this.generateRecommendations(analysis)
      };

    } catch (error) {
      this.logger.error(`Template analysis failed for ${templateId}:`, error);
      throw error;
    }
  }

  private async handleOptimizeTemplatePerformance(job: Job) {
    this.logger.log('Optimizing template performance system-wide');
    
    try {
      // Find templates with poor performance indicators
      const templates = await this.prisma.template.findMany({
        select: {
          id: true,
          name: true,
          content: true,
          metadata: true,
          createdAt: true,
          ownerId: true
        }
      });

      let optimizedCount = 0;
      const recommendations = [];

      for (const template of templates) {
        const content = template.content;
        const issues = [];

        // Check for performance issues
        if (content.length > 10000) {
          issues.push('Template content is very long');
        }

        if ((content.match(/{{/g) || []).length > 20) {
          issues.push('Too many variables may confuse users');
        }

        // Check for unused variables
        const definedVariables = this.extractVariableNames(content);
        const referencedVariables = this.findReferencedVariables(content);
        const unusedVariables = definedVariables.filter(v => !referencedVariables.has(v));

        if (unusedVariables.length > 0) {
          issues.push(`Unused variables: ${unusedVariables.join(', ')}`);
        }

        if (issues.length > 0) {
          recommendations.push({
            templateId: template.id,
            templateName: template.name,
            issues,
            priority: issues.length > 2 ? 'high' : 'medium'
          });
          optimizedCount++;
        }
      }

      this.logger.log(`Performance optimization completed. Found ${optimizedCount} templates needing attention`);

      return {
        analyzedTemplates: templates.length,
        templatesNeedingOptimization: optimizedCount,
        recommendations
      };

    } catch (error) {
      this.logger.error('Template performance optimization failed:', error);
      throw error;
    }
  }

  private async handleGenerateTemplateSuggestions(job: Job) {
    const { userId } = job.data;
    
    this.logger.log(`Generating template suggestions for user ${userId}`);
    
    try {
      // Analyze user's note patterns
      const userNotes = await this.prisma.note.findMany({
        where: { ownerId: userId },
        select: { title: true, content: true, tags: true },
        orderBy: { createdAt: 'desc' },
        take: 50
      });

      // Analyze common patterns
      const patterns = this.analyzeNotePatterns(userNotes);
      const suggestions = this.generateTemplateSuggestionsFromPatterns(patterns);

      this.logger.log(`Generated ${suggestions.length} template suggestions for user ${userId}`);

      return {
        userId,
        patterns,
        suggestions,
        count: suggestions.length
      };

    } catch (error) {
      this.logger.error(`Template suggestion generation failed for user ${userId}:`, error);
      throw error;
    }
  }

  private async handleCleanupUnusedTemplates(job: Job) {
    const { olderThanDays = 90 } = job.data;
    
    this.logger.log(`Cleaning up unused templates older than ${olderThanDays} days`);
    
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      // Find templates that haven't been used recently
      // In a real implementation, you'd check a usage tracking table
      const unusedTemplates = await this.prisma.template.findMany({
        where: {
          createdAt: { lt: cutoffDate },
          isPublic: false // Only cleanup private templates
          // AND no recent usage (would check usage table)
        }
      });

      let deletedCount = 0;
      const deletedTemplates = [];

      for (const template of unusedTemplates) {
        // Additional checks before deletion
        if (this.shouldDeleteTemplate(template)) {
          await this.prisma.template.delete({
            where: { id: template.id }
          });
          
          deletedTemplates.push({
            id: template.id,
            name: template.name,
            owner: template.ownerId
          });
          
          deletedCount++;
        }
      }

      this.logger.log(`Cleanup completed. Deleted ${deletedCount} unused templates`);

      return {
        deletedCount,
        deletedTemplates,
        cutoffDate
      };

    } catch (error) {
      this.logger.error('Template cleanup failed:', error);
      throw error;
    }
  }

  private calculateComplexity(content: string): 'low' | 'medium' | 'high' {
    const variableCount = (content.match(/{{/g) || []).length;
    const conditionalCount = (content.match(/{{#if|{{#each/g) || []).length;
    const lineCount = content.split('\n').length;
    
    const complexityScore = variableCount + (conditionalCount * 2) + (lineCount / 10);
    
    if (complexityScore > 30) return 'high';
    if (complexityScore > 10) return 'medium';
    return 'low';
  }

  private detectCategories(content: string): string[] {
    const categoryKeywords = {
      'meeting': ['agenda', 'attendees', 'action items', 'minutes'],
      'project': ['milestone', 'deadline', 'requirements', 'deliverables'],
      'planning': ['goals', 'objectives', 'timeline', 'schedule'],
      'documentation': ['overview', 'specification', 'guide', 'manual'],
      'personal': ['reflection', 'journal', 'thoughts', 'diary'],
      'research': ['hypothesis', 'methodology', 'findings', 'analysis']
    };

    const contentLower = content.toLowerCase();
    const detectedCategories = [];

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const matchCount = keywords.filter(keyword => contentLower.includes(keyword)).length;
      if (matchCount >= 2) {
        detectedCategories.push(category);
      }
    }

    return detectedCategories;
  }

  private estimateCompletionTime(content: string): number {
    const variableCount = (content.match(/{{/g) || []).length;
    const wordCount = content.split(' ').length;
    
    // Base time: 1 minute per variable + reading time
    const baseTime = variableCount * 1;
    const readingTime = Math.ceil(wordCount / 200); // 200 words per minute reading
    
    return Math.max(5, baseTime + readingTime);
  }

  private assessQuality(content: string): number {
    let score = 100;
    
    // Deduct points for potential issues
    if (content.length < 50) score -= 20; // Too short
    if (content.length > 5000) score -= 10; // Too long
    
    const variableCount = (content.match(/{{/g) || []).length;
    if (variableCount === 0) score -= 30; // No variables
    if (variableCount > 15) score -= 15; // Too many variables
    
    // Check for good practices
    if (content.includes('#')) score += 10; // Has headings
    if (content.includes('- ') || content.includes('* ')) score += 5; // Has lists
    
    return Math.max(0, Math.min(100, score));
  }

  private generateRecommendations(analysis: any): string[] {
    const recommendations = [];
    
    if (analysis.qualityScore < 70) {
      recommendations.push('Consider improving template structure and clarity');
    }
    
    if (analysis.variableCount > 15) {
      recommendations.push('Reduce number of variables to improve usability');
    }
    
    if (analysis.complexity === 'high') {
      recommendations.push('Simplify template structure for better user experience');
    }
    
    if (analysis.estimatedTime > 30) {
      recommendations.push('Consider breaking down into smaller templates');
    }
    
    return recommendations;
  }

  private extractVariableNames(content: string): string[] {
    const matches = content.match(/{{(\w+)/g);
    return matches ? matches.map(match => match.replace('{{', '')) : [];
  }

  private findReferencedVariables(content: string): Set<string> {
    const references = new Set<string>();
    const variableRegex = /{{(\w+)}}/g;
    let match;
    
    while ((match = variableRegex.exec(content)) !== null) {
      references.add(match[1]);
    }
    
    return references;
  }

  private analyzeNotePatterns(notes: any[]) {
    const patterns = {
      commonTitles: new Map<string, number>(),
      commonStructures: new Map<string, number>(),
      commonTags: new Map<string, number>(),
      repeatingElements: []
    };

    notes.forEach(note => {
      // Analyze title patterns
      const titleWords = note.title.toLowerCase().split(' ');
      titleWords.forEach(word => {
        if (word.length > 3) {
          patterns.commonTitles.set(word, (patterns.commonTitles.get(word) || 0) + 1);
        }
      });

      // Analyze tags
      note.tags?.forEach(tag => {
        patterns.commonTags.set(tag, (patterns.commonTags.get(tag) || 0) + 1);
      });

      // Analyze structure patterns (headings, lists, etc.)
      const lines = note.content.split('\n');
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('#')) {
          const structure = `heading-${trimmed.split(' ')[0].length}`;
          patterns.commonStructures.set(structure, (patterns.commonStructures.get(structure) || 0) + 1);
        } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          patterns.commonStructures.set('list', (patterns.commonStructures.get('list') || 0) + 1);
        }
      });
    });

    return patterns;
  }

  private generateTemplateSuggestionsFromPatterns(patterns: any) {
    const suggestions = [];

    // Generate suggestions based on common patterns
    const topTitles = Array.from(patterns.commonTitles.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const topTags = Array.from(patterns.commonTags.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    topTitles.forEach(([titleWord, frequency]) => {
      if (frequency >= 3) {
        suggestions.push({
          name: `${titleWord.charAt(0).toUpperCase() + titleWord.slice(1)} Template`,
          description: `Auto-generated template based on your frequent use of "${titleWord}"`,
          category: 'auto-generated',
          confidence: frequency / patterns.commonTitles.size,
          suggestedContent: this.generateContentFromPattern(titleWord, topTags.map(([tag]) => tag))
        });
      }
    });

    return suggestions;
  }

  private generateContentFromPattern(titleWord: string, commonTags: string[]): string {
    const templates = {
      'meeting': `# {{meeting_title}} Meeting
Date: {{date}}
Attendees: {{attendees}}

## Agenda
{{agenda}}

## Discussion
{{discussion}}

## Action Items
- {{action_item_1}}
- {{action_item_2}}

## Next Steps
{{next_steps}}`,

      'project': `# {{project_name}} Project
Status: {{status}}
Due Date: {{due_date}}

## Objectives
{{objectives}}

## Progress
{{progress}}

## Challenges
{{challenges}}

## Next Steps
{{next_steps}}`,

      'weekly': `# Weekly Review - {{week_of}}

## Accomplishments
{{accomplishments}}

## Challenges
{{challenges}}

## Goals for Next Week
{{next_week_goals}}

## Notes
{{additional_notes}}`
    };

    return templates[titleWord] || `# {{title}}

## Overview
{{overview}}

## Details
{{details}}

## Notes
{{notes}}`;
  }

  private shouldDeleteTemplate(template: any): boolean {
    // Don't delete if template has been shared publicly
    if (template.isPublic) return false;
    
    // Don't delete if template is very recent
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (template.createdAt > dayAgo) return false;
    
    // Don't delete if template has complex structure (likely valuable)
    const variableCount = (template.content.match(/{{/g) || []).length;
    if (variableCount > 10) return false;
    
    return true;
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`✅ Template processing job ${job.id} (${job.name}) completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`❌ Template processing job ${job.id} (${job.name}) failed:`, error);
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job, progress: number) {
    if (progress % 25 === 0) {
      this.logger.log(`📊 Template processing job ${job.id} progress: ${progress}%`);
    }
  }
}
