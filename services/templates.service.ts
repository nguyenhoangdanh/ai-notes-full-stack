/**
 * Templates API Service
 */

import { apiClient } from '../lib/api-client';

export interface Template {
  id: string;
  name: string;
  description?: string;
  content: string;
  tags: string[];
  isPublic: boolean;
  ownerId: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateDto {
  name: string;
  description?: string;
  content: string;
  tags?: string[];
  isPublic?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateTemplateDto {
  name?: string;
  description?: string;
  content?: string;
  tags?: string[];
  isPublic?: boolean;
  metadata?: Record<string, any>;
}

export interface TemplateSearchParams {
  query?: string;
  tags?: string[];
  isPublic?: boolean;
  category?: string;
}

export interface TemplateStats {
  totalUses: number;
  recentUses: number;
  avgRating: number;
  totalRatings: number;
}

export interface TemplatePreview {
  preview: string;
  wordCount: number;
  estimatedReadTime: number;
}

export const templatesService = {
  /**
   * Create a new template
   */
  async createTemplate(data: CreateTemplateDto): Promise<Template> {
    return apiClient.post<Template>('/templates', { body: data });
  },

  /**
   * Get user's templates
   */
  async getMyTemplates(): Promise<Template[]> {
    return apiClient.get<Template[]>('/templates/my-templates');
  },

  /**
   * Get public templates
   */
  async getPublicTemplates(): Promise<Template[]> {
    return apiClient.get<Template[]>('/templates/public');
  },

  /**
   * Get template categories
   */
  async getCategories(): Promise<string[]> {
    return apiClient.get<string[]>('/templates/categories');
  },

  /**
   * Get recommended templates
   */
  async getRecommendations(): Promise<Template[]> {
    return apiClient.get<Template[]>('/templates/recommendations');
  },

  /**
   * Search templates
   */
  async searchTemplates(params: TemplateSearchParams): Promise<Template[]> {
    return apiClient.get<Template[]>('/templates/search', { query: params });
  },

  /**
   * Get template by ID
   */
  async getTemplate(templateId: string): Promise<Template> {
    return apiClient.get<Template>(`/templates/${templateId}`);
  },

  /**
   * Update template
   */
  async updateTemplate(templateId: string, data: UpdateTemplateDto): Promise<Template> {
    return apiClient.put<Template>(`/templates/${templateId}`, { body: data });
  },

  /**
   * Delete template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    return apiClient.delete<void>(`/templates/${templateId}`);
  },

  /**
   * Process template with data
   */
  async processTemplate(templateId: string, data: Record<string, any>): Promise<any> {
    return apiClient.post<any>(`/templates/${templateId}/process`, { body: data });
  },

  /**
   * Duplicate template
   */
  async duplicateTemplate(templateId: string): Promise<Template> {
    return apiClient.post<Template>(`/templates/${templateId}/duplicate`);
  },

  /**
   * Get template statistics
   */
  async getTemplateStats(templateId: string): Promise<TemplateStats> {
    return apiClient.get<TemplateStats>(`/templates/${templateId}/stats`);
  },

  /**
   * Get template preview
   */
  async getTemplatePreview(templateId: string, data?: Record<string, any>): Promise<TemplatePreview> {
    return apiClient.get<TemplatePreview>(`/templates/${templateId}/preview`, { query: data });
  }
};