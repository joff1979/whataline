import { api } from './client';

export interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ContactRequest {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

// Public
export const submitContact = (data: ContactRequest) =>
  api.post<{ message: string }>('/api/contact', data).then(r => r.data);

// Admin
export const adminGetContacts = () =>
  api.get<ContactSubmission[]>('/api/admin/contact').then(r => r.data);

export const adminMarkRead = (id: number) =>
  api.patch(`/api/admin/contact/${id}/read`);

export const adminDeleteContact = (id: number) =>
  api.delete(`/api/admin/contact/${id}`);
