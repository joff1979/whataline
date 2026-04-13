import { api } from './client';
import type { FilmProject } from './types';

export interface UpsertFilmProject {
  title: string;
  logline: string;
  posterUrl: string | null;
  genre: string | null;
  format: string | null;
  year: number | null;
  trailerUrl: string | null;
  filmUrl: string | null;
  status: 'draft' | 'published';
  featured: boolean;
  sortOrder: number;
  awards: { name: string; category: string | null; year: number | null }[];
}

// Public
export const getFilmProjects = () =>
  api.get<FilmProject[]>('/api/films').then((r) => r.data);

// Admin
export const adminGetFilmProjects = () =>
  api.get<FilmProject[]>('/api/admin/films').then((r) => r.data);

export const adminCreateFilmProject = (data: UpsertFilmProject) =>
  api.post('/api/admin/films', data).then((r) => r.data);

export const adminUpdateFilmProject = (id: number, data: UpsertFilmProject) =>
  api.put(`/api/admin/films/${id}`, data);

export const adminDeleteFilmProject = (id: number) =>
  api.delete(`/api/admin/films/${id}`);

export const adminReorderFilmProjects = (items: { id: number; sortOrder: number }[]) =>
  api.patch('/api/admin/films/reorder', items);
