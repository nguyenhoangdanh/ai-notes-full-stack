/**
 * Authentication Types
 */

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
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

export interface TokenVerificationResponse {
  valid: boolean;
  user: User;
}