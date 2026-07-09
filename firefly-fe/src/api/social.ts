import client from './client';

export interface Comment {
  id: number;
  memoryId: number;
  userId: number;
  authorName: string;
  text: string;
  createdAt: string;
}

export const getComments = (memoryId: number, signal?: AbortSignal) =>
  client.get<Comment[]>(`/memories/${memoryId}/comments`, { signal });

export const addComment = (memoryId: number, text: string) =>
  client.post<Comment>(`/memories/${memoryId}/comments`, { text });

export const deleteComment = (memoryId: number, commentId: number) =>
  client.delete(`/memories/${memoryId}/comments/${commentId}`);

export const toggleLike = (memoryId: number) =>
  client.post<{ liked: boolean; count: number }>('/likes', { memoryId });

export const createReport = (targetType: string, targetId: number, reason?: string) =>
  client.post('/reports', { targetType, targetId, reason });
