import { api } from './client';
import type { Service } from './types';

export interface UpsertServiceSample {
  title: string;
  description: string | null;
  fileUrl: string | null;
}

export interface UpsertService {
  title: string;
  description: string;
  sortOrder: number;
  published: boolean;
  samples: UpsertServiceSample[];
}

// Public
export const getServices = () =>
  api.get<Service[]>('/api/services').then((r) => r.data);

// Admin
export const adminGetServices = () =>
  api.get<Service[]>('/api/admin/services').then((r) => r.data);

export const adminCreateService = (data: UpsertService) =>
  api.post('/api/admin/services', data).then((r) => r.data);

export const adminUpdateService = (id: number, data: UpsertService) =>
  api.put(`/api/admin/services/${id}`, data);

export const adminDeleteService = (id: number) =>
  api.delete(`/api/admin/services/${id}`);

export const adminReorderServices = (items: { id: number; sortOrder: number }[]) =>
  api.patch('/api/admin/services/reorder', items);
