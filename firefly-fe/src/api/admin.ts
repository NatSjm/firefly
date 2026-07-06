import client from './client';

export interface AdminReport {
  id: number;
  targetType: 'memory' | 'comment' | string;
  targetId: number;
  reason?: string;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  isBanned: boolean;
}

export interface BanUserResponse {
  banned: boolean;
}

export const getReports = () => client.get<AdminReport[]>('/admin/reports');
export const getAdminUsers = () => client.get<AdminUser[]>('/admin/users');
export const adminDeleteMemory = (id: number) => client.delete(`/admin/memories/${id}`);
export const adminDeleteComment = (id: number) => client.delete(`/admin/comments/${id}`);
export const banUser = (id: number) => client.post<BanUserResponse>(`/admin/users/${id}/ban`);
