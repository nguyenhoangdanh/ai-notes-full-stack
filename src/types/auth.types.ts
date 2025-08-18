/**
 * Authentication Types
 */

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoogleOAuthUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

// Request DTOs
export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

// Response DTOs
export interface AuthResponseDto {
  access_token: string;
  user: {
    id: string;
    email: string;
    name?: string;
    image?: string;
  };
}

// Alias for compatibility
export interface AuthResponse extends AuthResponseDto {}

export interface TokenVerificationResponse {
  valid: boolean;
  user: User;
}

export interface UserSettings {
  id: string;
  ownerId: string;
  model: string;
  maxTokens: number;
  autoReembed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Usage {
  id: string;
  ownerId: string;
  date: string;
  embeddingTokens: number;
  chatTokens: number;
  createdAt: string;
  updatedAt: string;
}