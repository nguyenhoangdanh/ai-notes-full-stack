export interface TagMaintenanceJobData {
  userId?: string;
  action: string;
}

export interface TagHierarchy {
  id: string;
  name: string;
  color?: string;
  description?: string;
  noteCount: number;
  children: TagHierarchy[];
  parent?: string;
}

export interface TagAnalytics {
  totalTags: number;
  mostUsedTags: Array<{ name: string; count: number; color?: string }>;
  recentlyUsed: Array<{ name: string; lastUsed: Date }>;
  tagGrowth: Array<{ date: string; count: number }>;
  colorDistribution: Array<{ color: string; count: number }>;
  relationshipMap: Array<{ tag1: string; tag2: string; coOccurrences: number }>;
}

export interface TagSuggestion {
  name: string;
  confidence: number;
  reason: 'content_based' | 'pattern_based' | 'similar_notes' | 'user_history';
  relatedTags: string[];
}

