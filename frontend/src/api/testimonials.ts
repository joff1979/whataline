import { api } from './client';
import type { Testimonial } from './types';

export interface UpsertTestimonial {
  quoteText: string;
  attributeName: string;
  attributeTitle: string | null;
  organisation: string | null;
  sortOrder: number;
  published: boolean;
}

// Public
export const getTestimonials = () =>
  api.get<Testimonial[]>('/api/testimonials').then((r) => r.data);

// Admin
export const adminGetTestimonials = () =>
  api.get<Testimonial[]>('/api/admin/testimonials').then((r) => r.data);

export const adminCreateTestimonial = (data: UpsertTestimonial) =>
  api.post('/api/admin/testimonials', data).then((r) => r.data);

export const adminUpdateTestimonial = (id: number, data: UpsertTestimonial) =>
  api.put(`/api/admin/testimonials/${id}`, data);

export const adminDeleteTestimonial = (id: number) =>
  api.delete(`/api/admin/testimonials/${id}`);

export const adminReorderTestimonials = (items: { id: number; sortOrder: number }[]) =>
  api.patch('/api/admin/testimonials/reorder', items);
