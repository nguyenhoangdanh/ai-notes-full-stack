import { getApiClient } from '../lib/api-client'
import type {
  RegisterDto,
  LoginDto,
  AuthResponse,
  AuthVerifyResponse,
  User,
  UserSettings,
  Usage,
} from '../types'

export const authService = {
  // Authentication endpoints
  async register(data: RegisterDto): Promise<AuthResponse> {
    return getApiClient().post<AuthResponse>('/auth/register', { body: data })
  },

  async login(data: LoginDto): Promise<AuthResponse> {
    return getApiClient().post<AuthResponse>('/auth/login', { body: data })
  },

  async verify(): Promise<AuthVerifyResponse> {
    return getApiClient().get<AuthVerifyResponse>('/auth/verify')
  },

  async getProfile(): Promise<User> {
    return getApiClient().get<User>('/auth/me')
  },

  // OAuth endpoints (these return redirects, handled by browser)
  getGoogleAuthUrl(): string {
    return `${getApiClient()['config'].baseURL}/auth/google`
  },

  // Settings endpoints
  async getSettings(): Promise<UserSettings> {
    return getApiClient().get<UserSettings>('/settings')
  },

  async updateSettings(data: Partial<UserSettings>): Promise<UserSettings> {
    return getApiClient().patch<UserSettings>('/settings', { body: data })
  },

  async resetSettings(): Promise<UserSettings> {
    return getApiClient().post<UserSettings>('/settings/reset')
  },

  // Usage tracking
  async getUsage(): Promise<Usage[]> {
    return getApiClient().get<Usage[]>('/settings/usage')
  },
}