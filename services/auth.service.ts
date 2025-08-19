/**
 * Authentication API Service
 */

import { apiClient } from '../lib/api-client';
import { demoModeService } from './demo.service';
import { 
  AuthResponseDto, 
  LoginDto, 
  RegisterDto, 
  TokenVerificationResponse, 
  User,
  UserSettings,
  UpdateSettingsDto,
  Usage
} from '../types/auth.types';

export const authService = {
  /**
   * Register a new user with email and password
   */
  async register(data: RegisterDto): Promise<AuthResponseDto> {
    // In demo mode, just simulate registration
    if (demoModeService.isDemoMode()) {
      return demoModeService.demoLogin();
    }
    return apiClient.post<AuthResponseDto>('/auth/register', { body: data });
  },

  /**
   * Login with email and password
   */
  async login(data: LoginDto): Promise<AuthResponseDto> {
    // In demo mode, just simulate login
    if (demoModeService.isDemoMode()) {
      return demoModeService.demoLogin();
    }
    return apiClient.post<AuthResponseDto>('/auth/login', { body: data });
  },

  /**
   * Demo login - enables demo mode and returns mock user
   */
  async demoLogin(): Promise<AuthResponseDto> {
    return demoModeService.demoLogin();
  },

  /**
   * Initiate Google OAuth login
   */
  async googleLogin(): Promise<void> {
    // Demo mode doesn't support OAuth, just enable demo mode
    if (demoModeService.isDemoMode()) {
      return;
    }
    // This will redirect to Google OAuth
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'}/auth/google`;
  },

  /**
   * Verify current JWT token
   */
  async verifyToken(): Promise<TokenVerificationResponse> {
    if (demoModeService.isDemoMode()) {
      return {
        valid: true,
        user: demoModeService.getDemoUser()
      };
    }
    return apiClient.get<TokenVerificationResponse>('/auth/verify');
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    if (demoModeService.isDemoMode()) {
      return demoModeService.getDemoUser();
    }
    return apiClient.get<User>('/auth/me');
  },

  /**
   * Verify current JWT token
   */
  async verify(): Promise<TokenVerificationResponse> {
    return apiClient.get<TokenVerificationResponse>('/auth/verify');
  },

  /**
   * Get user settings
   */
  async getSettings(): Promise<UserSettings> {
    return apiClient.get<UserSettings>('/settings');
  },

  /**
   * Update user settings
   */
  async updateSettings(data: UpdateSettingsDto): Promise<UserSettings> {
    return apiClient.patch<UserSettings>('/settings', { body: data });
  },

  /**
   * Reset user settings to defaults
   */
  async resetSettings(): Promise<UserSettings> {
    return apiClient.patch<UserSettings>('/settings', { body: { model: 'gemini-1.5-flash', maxTokens: 4000, autoReembed: true } });
  },

  /**
   * Get usage statistics
   */
  async getUsage(days: number = 30): Promise<Usage[]> {
    return apiClient.get<Usage[]>('/settings/usage', { query: { days: days.toString() } });
  },

  /**
   * Logout user (clears server-side cookie)
   */
  async logout(): Promise<{ message: string }> {
    return apiClient.post('/auth/logout');
  }
};