/**
 * Authentication React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authService } from '../services/auth.service';
import { queryKeys } from './query-keys';
import { setAuthToken, clearAuthToken } from '../lib/api-config';
import { 
  LoginDto, 
  RegisterDto, 
  AuthResponseDto,
  User 
} from '../types/auth.types';

export function useAuth() {
  const queryClient = useQueryClient();

  // Get current user profile
  const {
    data: user,
    isLoading,
    error
  } = useQuery({
    queryKey: queryKeys.auth.profile(),
    queryFn: authService.getProfile,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data: AuthResponseDto) => {
      setAuthToken(data.access_token);
      queryClient.setQueryData(queryKeys.auth.profile(), data.user);
      toast.success('Account created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Registration failed');
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data: AuthResponseDto) => {
      setAuthToken(data.access_token);
      queryClient.setQueryData(queryKeys.auth.profile(), data.user);
      toast.success('Logged in successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.message || 'Login failed');
    },
  });

  // Logout function
  const logout = () => {
    clearAuthToken();
    queryClient.clear();
    queryClient.removeQueries();
    toast.success('Logged out successfully');
  };

  // Google login
  const googleLogin = () => {
    authService.googleLogin();
  };

  // Verify token mutation
  const verifyTokenMutation = useMutation({
    mutationFn: authService.verifyToken,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.profile(), data.user);
    },
    onError: () => {
      logout();
    },
  });

  return {
    user,
    isLoading,
    error,
    register: registerMutation.mutate,
    login: loginMutation.mutate,
    logout,
    googleLogin,
    verifyToken: verifyTokenMutation.mutate,
    isRegistering: registerMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    isVerifying: verifyTokenMutation.isPending,
  };
}

export function useTokenVerification() {
  return useQuery({
    queryKey: queryKeys.auth.verify(),
    queryFn: authService.verifyToken,
    retry: false,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}