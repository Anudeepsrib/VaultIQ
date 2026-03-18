'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { login, logout, getMe } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/authStore';
import { LoginRequest } from '@/lib/types/auth';

export function useLogin() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await login(credentials);
      return response;
    },
    onSuccess: (data) => {
      setAuth(data.user, {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      toast.success('Welcome back', {
        description: `Logged in as ${data.user.name}`,
      });
      router.push('/documents');
    },
    onError: (error: Error) => {
      toast.error('Login failed', {
        description: error.message,
      });
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const { clearAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      toast.success('Logged out successfully');
      router.push('/login');
    },
    onError: () => {
      // Even if logout fails on server, clear local state
      clearAuth();
      queryClient.clear();
      router.push('/login');
    },
  });
}

export function useCurrentUser() {
  const { user, isAuthenticated, isLoading, setAuth, clearAuth } = useAuthStore();

  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    enabled: isAuthenticated && !user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  // Sync query data with store
  if (query.data && !user) {
    setAuth(query.data, {
      accessToken: useAuthStore.getState().accessToken || '',
      refreshToken: '',
    });
  }

  if (query.error) {
    clearAuth();
  }

  return {
    user: user || query.data,
    isLoading: isLoading || query.isLoading,
    isAuthenticated,
    error: query.error,
  };
}
