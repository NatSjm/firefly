import client from './client';

export interface Memory {
  id: number;
  userId: number;
  authorName: string;
  type: string;
  title: string;
  text: string;
  ingredients?: string;
  steps?: string;
  city?: string;
  topicSlug?: string;
  yearFrom?: number;
  yearTo?: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt?: string;
  mediaUrls: string[];
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean;
}

export interface MemoryRequest {
  type: string;
  title: string;
  text: string;
  ingredients?: string;
  steps?: string;
  city?: string;
  topicSlug?: string;
  yearFrom?: number;
  yearTo?: number;
  isPublic: boolean;
}

export const getMyMemories = (params?: { type?: string; isPublic?: boolean }) =>
  client.get<Memory[]>('/memories', { params });

export const getMemory = (id: number) => client.get<Memory>(`/memories/${id}`);

export const createMemory = (data: MemoryRequest, photo?: File) => {
  const formData = new FormData();
  formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
  if (photo) {
    formData.append('photo', photo);
  }
  return client.post<Memory>('/memories', formData);
};

export const updateMemory = (id: number, data: MemoryRequest, photo?: File) => {
  const formData = new FormData();
  formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
  if (photo) {
    formData.append('photo', photo);
  }
  return client.put<Memory>(`/memories/${id}`, formData);
};

export const deleteMemory = (id: number) => client.delete(`/memories/${id}`);
