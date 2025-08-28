export interface TemplateAnalysisJobData {
  templateId: string;
  userId: string;
}

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

