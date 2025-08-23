import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { authService } from '../services'
import { queryKeys } from './query-keys'
import { setAuthToken, clearAuthToken, getAuthToken } from '../lib/api-config'
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
    enabled: !!getAuthToken(), // Only run when we have a token
  })
}

export function useAuthVerify() {
  return useQuery({
    queryKey: queryKeys.auth.verify(),
    queryFn: authService.verify,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: false,
    enabled: !!getAuthToken(), // Only run when we have a token
  })
}

export function useUserSettings() {
  return useQuery({
    queryKey: queryKeys.auth.settings(),
    queryFn: authService.getSettings,
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!getAuthToken(), // Only run when we have a token
  })
}

export function useUsage() {
  return useQuery({
    queryKey: queryKeys.auth.usage(),
    queryFn: () => authService.getUsage(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!getAuthToken(), // Only run when we have a token
  })
}

// Authentication mutations
export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RegisterDto) => authService.register(data),
    onSuccess: (response: AuthResponseDto) => {
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
    onSuccess: (response: AuthResponseDto) => {
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
      // Set user data in cache and invalidate queries to refetch with new token
      queryClient.setQueryData(queryKeys.auth.profile(), response.user)
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() })
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
      // Set user data in cache and invalidate queries to refetch with new token
      queryClient.setQueryData(queryKeys.auth.profile(), response.user)
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() })
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
      try {
        // Call server logout endpoint to clear server-side cookie
        await authService.logout()
      } catch (error) {
        // Continue with client-side cleanup even if server call fails
        console.warn('Server logout failed, proceeding with client-side cleanup:', error)
      }
      // Clear client-side storage
      clearAuthToken()
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.clear()
      toast.success('Logged out successfully')
    },
    onError: (error: any) => {
      // Even if logout fails, clear client-side data
      clearAuthToken()
      queryClient.clear()
      const message = error?.response?.message || 'Logout completed locally'
      toast.success(message)
    },
  })

  // Verify token mutation
  const verifyMutation = useMutation({
    mutationFn: authService.verify,
    onSuccess: (response) => {
      if (response.valid && response.user) {
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

  // Memoize stable function references
  const login = useCallback((data: LoginDto) => {
    loginMutation.mutate(data)
  }, [loginMutation.mutate])

  const register = useCallback((data: RegisterDto) => {
    registerMutation.mutate(data)
  }, [registerMutation.mutate])

  const logout = useCallback(() => {
    logoutMutation.mutate()
  }, [logoutMutation.mutate])

  const verifyToken = useCallback(() => {
    verifyMutation.mutate()
  }, [verifyMutation.mutate])

  // Memoize the return object to prevent recreation on every render
  return useMemo(() => ({
    // State
    user: profileQuery.data || null,
    isLoading: profileQuery.isLoading || verifyMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingIn: loginMutation.isPending,

    // Actions
    login,
    register,
    logout,
    verifyToken,
    googleLogin: authService.googleLogin,
  }), [
    profileQuery.data?.id, // Only re-create when user ID changes
    profileQuery.data?.email, // Or email changes
    profileQuery.isLoading,
    verifyMutation.isPending,
    registerMutation.isPending,
    loginMutation.isPending,
    login,
    register,
    logout,
    verifyToken
  ])
}
