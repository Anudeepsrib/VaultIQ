export type Role = 'admin' | 'analyst' | 'auditor' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse extends AuthTokens {
  user: User;
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: Role;
  exp: number;
}
