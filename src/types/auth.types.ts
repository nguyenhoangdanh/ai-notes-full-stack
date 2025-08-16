import { BaseEntity } from './common.types'

// User entity and related types
export interface User extends BaseEntity {
  email: string
  name?: string
  image?: string
}

export interface UserProfile extends User {
  // Additional profile fields can be added here
}

export interface UserWithPassword extends User {
  password?: string
}

// Google OAuth user from backend
export interface GoogleOAuthUser {
  email: string
  firstName: string
  lastName: string
  picture: string
  accessToken: string
}

// JWT payload structure
export interface JwtPayload {
  email: string
  sub: string
  iat?: number
  exp?: number
}

// Auth request/response DTOs
export interface RegisterDto {
  email: string
  password: string
  name?: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  user: User
}

// Auth verification response
export interface AuthVerifyResponse {
  valid: boolean
  user: User
}

// User settings and preferences
export interface UserSettings extends BaseEntity {
  ownerId: string
  model: string
  maxTokens: number
  autoReembed: boolean
}

// User usage tracking
export interface Usage extends BaseEntity {
  ownerId: string
  date: string // YYYY-MM-DD format
  embeddingTokens: number
  chatTokens: number
}