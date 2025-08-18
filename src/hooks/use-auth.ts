import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authService } from '../services'
import { queryKeys } from './query-keys'
import { setAuthToken, clearAuthToken } from '../lib/api-config'
import type {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  User,
  UserSettings,
  Usage,
} from '../types'

// Authentication queries
export function useAuthProfile() {
  return useQuery({
    queryKey: queryKeys.auth.profile(),
    queryFn: authService.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry auth failures
  })
}

export function useAuthVerify() {
  return useQuery({
    queryKey: queryKeys.auth.verify(),
    queryFn: authService.verify,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: false,
  })
}

export function useUserSettings() {
  return useQuery({
    queryKey: queryKeys.auth.settings(),
    queryFn: authService.getSettings,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useUsage() {
  return useQuery({
    queryKey: queryKeys.auth.usage(),
    queryFn: () => authService.getUsage(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Authentication mutations
export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RegisterDto) => authService.register(data),
    onSuccess: (response: AuthResponse) => {
      // Update auth cache
      queryClient.setQueryData(queryKeys.auth.profile(), response.user)
      toast.success('Account created successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.message || 'Registration failed'
      toast.error(message)
    },
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LoginDto) => authService.login(data),
    onSuccess: (response: AuthResponse) => {
      // Update auth cache
      queryClient.setQueryData(queryKeys.auth.profile(), response.user)
      toast.success('Logged in successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.message || 'Login failed'
      toast.error(message)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      // No backend call needed for logout, just clear local state
      return Promise.resolve()
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear()
      toast.success('Logged out successfully')
    },
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<UserSettings>) => authService.updateSettings(data),
    onSuccess: (updatedSettings: UserSettings) => {
      // Update settings cache
      queryClient.setQueryData(queryKeys.auth.settings(), updatedSettings)
      toast.success('Settings updated successfully')
    },
    onError: (error: any) => {
      const message = error.response?.message || 'Failed to update settings'
      toast.error(message)
    },
  })
}

export function useResetSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.resetSettings,
    onSuccess: (resetSettings: UserSettings) => {
      // Update settings cache
      queryClient.setQueryData(queryKeys.auth.settings(), resetSettings)
      toast.success('Settings reset to defaults')
    },
    onError: (error: any) => {
      const message = error.response?.message || 'Failed to reset settings'
      toast.error(message)
    },
  })
}

// Main useAuth hook that combines all auth functionality
export function useAuth() {
  const queryClient = useQueryClient()
  
  // Get current user from profile query
  const profileQuery = useAuthProfile()
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginDto) => authService.login(data),
    onSuccess: (response: AuthResponseDto) => {
      setAuthToken(response.access_token)
      queryClient.setQueryData(queryKeys.auth.profile(), response.user)
      toast.success('Logged in successfully!')
    },
    onError: (error: any) => {
      const message = error?.response?.message || 'Login failed'
      toast.error(message)
    },
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterDto) => authService.register(data),
    onSuccess: (response: AuthResponseDto) => {
      setAuthToken(response.access_token)
      queryClient.setQueryData(queryKeys.auth.profile(), response.user)
      toast.success('Account created successfully!')
    },
    onError: (error: any) => {
      const message = error?.response?.message || 'Registration failed'
      toast.error(message)
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      clearAuthToken()
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.clear()
      toast.success('Logged out successfully')
    },
  })

  // Verify token mutation
  const verifyMutation = useMutation({
    mutationFn: authService.verify,
    onSuccess: (response) => {
      if (response.valid) {
        queryClient.setQueryData(queryKeys.auth.profile(), response.user)
      } else {
        clearAuthToken()
        queryClient.clear()
      }
    },
    onError: () => {
      clearAuthToken()
      queryClient.clear()
    },
  })

  return {
    // State
    user: profileQuery.data || null,
    isLoading: profileQuery.isLoading || verifyMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    
    // Actions
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    verifyToken: verifyMutation.mutate,
    googleLogin: authService.googleLogin,
  }
}