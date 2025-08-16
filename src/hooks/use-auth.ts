import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authService } from '../services'
import { queryKeys } from './query-keys'
import type {
  RegisterDto,
  LoginDto,
  AuthResponse,
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
    queryFn: authService.getUsage,
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