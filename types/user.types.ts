/**
 * User Types
 */

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  avatar?: string; // Add avatar alias for image
  role?: string; // Add role property
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileDto {
  name?: string;
  image?: string;
}

// Alias for compatibility
export interface UpdateUserDto extends UpdateProfileDto {}

export interface UserSettings {
  id: string;
  ownerId: string;
  model: string;
  maxTokens: number;
  autoReembed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsDto {
  model?: string;
  maxTokens?: number;
  autoReembed?: boolean;
}

export interface UserUsage {
  id: string;
  ownerId: string;
  date: string; // YYYY-MM-DD format
  embeddingTokens: number;
  chatTokens: number;
  createdAt: string;
  updatedAt: string;
}

export interface UsageStats {
  totalEmbeddingTokens: number;
  totalChatTokens: number;
  dailyStats: UserUsage[];
}