export interface SearchRankingJobData {
  query: string;
  results: Array<{
    id: string;
    score: number;
    reasons: string[];
  }>;
  userId: string;
}

export interface AdvancedSearchFilters {
  workspaceId?: string;
  tags?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  hasAttachments?: boolean;
  wordCountRange?: {
    min: number;
    max: number;
  };
  categories?: string[];
  lastModifiedDays?: number;
  sortBy?: 'relevance' | 'created' | 'updated' | 'title' | 'size';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  score: number;
  highlights: string[];
  reasons: string[];
  workspace: {
    id: string;
    name: string;
  };
  tags: string[];
  categories: { name: string; color?: string }[];
  createdAt: Date;
  updatedAt: Date;
  wordCount: number;
  hasAttachments: boolean;
}