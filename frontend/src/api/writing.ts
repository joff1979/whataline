import { api } from './client';
import type { WritingProject, UpsertWritingProject } from './types';

// Public
export const getWritingProjects = () =>
  api.get<WritingProject[]>('/api/writing').then((r) => r.data);

export const getWritingProject = (id: number) =>
  api.get<WritingProject>(`/api/writing/${id}`).then((r) => r.data);

// Admin
export const adminGetWritingProjects = () =>
  api.get<WritingProject[]>('/api/admin/writing').then((r) => r.data);

export const adminCreateWritingProject = (data: UpsertWritingProject) =>
  api.post('/api/admin/writing', data).then((r) => r.data);

export const adminUpdateWritingProject = (id: number, data: UpsertWritingProject) =>
  api.put(`/api/admin/writing/${id}`, data);

export const adminDeleteWritingProject = (id: number) =>
  api.delete(`/api/admin/writing/${id}`);

export const adminReorderWritingProjects = (items: { id: number; sortOrder: number }[]) =>
  api.patch('/api/admin/writing/reorder', items);

export const adminUpload = (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return api.post<{ url: string }>('/api/admin/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data.url);
};
