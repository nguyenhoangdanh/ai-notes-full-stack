/**
 * Authentication API Service
 */

import { apiClient } from '../lib/api-client';
import { 
  AuthResponseDto, 
  LoginDto, 
  RegisterDto, 
  TokenVerificationResponse, 
  User 
} from '../types/auth.types';

export const authService = {
  /**
   * Register a new user with email and password
   */
  async register(data: RegisterDto): Promise<AuthResponseDto> {
    return apiClient.post<AuthResponseDto>('/auth/register', { body: data });
  },

  /**
   * Login with email and password
   */
  async login(data: LoginDto): Promise<AuthResponseDto> {
    return apiClient.post<AuthResponseDto>('/auth/login', { body: data });
  },

  /**
   * Initiate Google OAuth login
   */
  async googleLogin(): Promise<void> {
    // This will redirect to Google OAuth
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/auth/google`;
  },

  /**
   * Verify current JWT token
   */
  async verifyToken(): Promise<TokenVerificationResponse> {
    return apiClient.get<TokenVerificationResponse>('/auth/verify');
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  }
};