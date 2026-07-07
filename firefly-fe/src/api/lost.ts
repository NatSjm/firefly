import client from './client';

export interface LostRequestSummary {
  id: number;
  userId: number;
  authorName: string;
  city: string;
  type: string;
  years?: string;
  description: string;
  createdAt: string;
}

export interface LostRequest extends LostRequestSummary {
  contactEmail: string;
}

export interface LostRequestCreate {
  city: string;
  type: string;
  years?: string;
  description: string;
  contactEmail: string;
}

export const getLostRequests = (params?: { city?: string; type?: string }) =>
  client.get<LostRequestSummary[]>('/lost-requests', { params });

export const getLostRequest = (id: number) => client.get<LostRequest>(`/lost-requests/${id}`);

export const createLostRequest = (data: LostRequestCreate) =>
  client.post<LostRequest>('/lost-requests', data);
