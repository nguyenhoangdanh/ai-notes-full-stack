// Smart features types: Categories, Summaries, Relations, Duplicates
export interface CreateCategoryDto {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  keywords: string[];
  isAuto?: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  keywords?: string[];
  isAuto?: boolean;
}

export interface AutoCategorizeDto {
  threshold?: number;
}

export interface CategorySuggestionDto {
  name: string;
  confidence: number;
  matchingKeywords: string[];
  exists: boolean;
  existingCategoryId?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  keywords: string[];
  isAuto: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    notes: number;
  };
}

// Summaries
export interface GenerateSummaryDto {
  minWords?: number;
  maxSummaryLength?: number;
  includeKeyPoints?: boolean;
  model?: string;
}

export interface BatchSummaryDto {
  noteIds: string[];
  minWords?: number;
  skipExisting?: boolean;
}

export interface SummaryResponseDto {
  summary: string;
  keyPoints: string[];
  wordCount: number;
  readingTime: number;
  model: string;
}

export interface Summary {
  id: string;
  noteId: string;
  summary: string;
  keyPoints: string[];
  wordCount: number;
  readingTime: number;
  model: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  note?: {
    id: string;
    title: string;
  };
}

// Relations
export interface NoteRelation {
  id: string;
  sourceNoteId: string;
  targetNoteId: string;
  relationshipType: 'SIMILAR' | 'REFERENCES' | 'FOLLOWS' | 'CONTRADICTS' | 'ELABORATES';
  confidence: number;
  keywords: string[];
  context?: string;
  isManual: boolean;
  createdAt: string;
  sourceNote: {
    id: string;
    title: string;
  };
  targetNote: {
    id: string;
    title: string;
  };
}

export interface RelatedNote {
  id: string;
  title: string;
  content: string;
  similarity: number;
  relationshipType: string;
  keywords: string[];
}

export interface NoteGraph {
  nodes: Array<{
    id: string;
    title: string;
    x: number;
    y: number;
    connections: number;
  }>;
  edges: Array<{
    source: string;
    target: string;
    relationshipType: string;
    confidence: number;
  }>;
}

// Duplicates
export interface DuplicateDetectionReport {
  id: string;
  ownerId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  duplicateGroups: DuplicateGroup[];
  totalNotes: number;
  duplicatesFound: number;
  similarityThreshold: number;
  createdAt: string;
  completedAt?: string;
}

export interface DuplicateGroup {
  id: string;
  reportId: string;
  notes: Array<{
    id: string;
    title: string;
    similarity: number;
  }>;
  averageSimilarity: number;
  status: 'PENDING' | 'REVIEWED' | 'MERGED' | 'IGNORED';
}

export interface CreateDuplicateReportDto {
  similarityThreshold?: number;
  workspaceId?: string;
  includeTags?: boolean;
}

export interface MergeDuplicatesDto {
  primaryNoteId: string;
  duplicateNoteIds: string[];
  mergeStrategy: 'APPEND' | 'REPLACE' | 'MANUAL';
  keepTags?: boolean;
  keepCategories?: boolean;
}