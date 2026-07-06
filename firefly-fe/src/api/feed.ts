import client from './client';
import type { Memory } from './memories';

export interface FeedResponse {
  items: Memory[];
  total: number;
  page: number;
  totalPages: number;
}

export const getFeed = (params?: { city?: string; topic?: string; sort?: string; page?: number; size?: number }) =>
  client.get<FeedResponse>('/feed', { params });
