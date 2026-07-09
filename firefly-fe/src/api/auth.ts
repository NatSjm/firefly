import client from './client';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  role: string;
  createdAt: string;
}

export const register = (email: string, password: string, name: string) =>
  client.post<AuthResponse>('/auth/register', { email, password, name });

export const login = (email: string, password: string) =>
  client.post<AuthResponse>('/auth/login', { email, password });

export const getMe = () => client.get<UserProfile>('/auth/me');

export const updateProfile = (data: { name?: string; bio?: string; avatarUrl?: string }) =>
  client.put<UserProfile>('/users/me', data);
