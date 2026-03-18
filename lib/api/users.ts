import apiClient from './client';
import { User } from '@/lib/types/auth';

export interface CreateUserRequest {
  name: string;
  email: string;
  role: string;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  role?: string;
  isActive?: boolean;
}

export interface UsersListResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getUsers(
  page = 1,
  pageSize = 25,
  search?: string
): Promise<UsersListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (search) params.append('search', search);

  const response = await apiClient.get<UsersListResponse>(`/users?${params}`);
  return response.data;
}

export async function getUser(id: string): Promise<User> {
  const response = await apiClient.get<User>(`/users/${id}`);
  return response.data;
}

export async function createUser(request: CreateUserRequest): Promise<User> {
  const response = await apiClient.post<User>('/users', request);
  return response.data;
}

export async function updateUser(id: string, request: UpdateUserRequest): Promise<User> {
  const response = await apiClient.patch<User>(`/users/${id}`, request);
  return response.data;
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}
