'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getUsers, createUser, updateUser, deleteUser } from '@/lib/api/users';
import { UsersListResponse, User, CreateUserRequest, UpdateUserRequest } from '@/lib/api/users';

export function useUsers(page = 1, pageSize = 25, search?: string) {
  return useQuery<UsersListResponse>({
    queryKey: ['users', page, pageSize, search],
    queryFn: () => getUsers(page, pageSize, search),
    staleTime: 30 * 1000,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateUserRequest) => createUser(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created', {
        description: 'The new user has been invited successfully.',
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to create user', {
        description: error.message,
      });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateUserRequest) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update user', {
        description: error.message,
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete user', {
        description: error.message,
      });
    },
  });
}
