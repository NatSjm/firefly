import client from './client';

export interface AuthResponse {
  token: string;
  userId: number;
  name: string;
  email: string;
  role: string;
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
