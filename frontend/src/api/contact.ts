import { supabase } from '../lib/supabase';

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

interface SubmitContactPayload extends ContactRequest {
  companyWebsite: string;
  dwellMs: number;
  token: string;
}

const SELECT = `
  id,
  name,
  email,
  subject,
  message,
  isRead:is_read,
  createdAt:created_at
`;

// ── Public ────────────────────────────────────────────────────────────────
// All spam/bot checks run server-side in the contact-submit Edge Function
// (service_role, bypasses RLS) — it is the only thing allowed to write to
// contact_submissions. See supabase/functions/contact-submit/index.ts.
export async function submitContact(data: SubmitContactPayload): Promise<{ message: string }> {
  const { data: res, error } = await supabase.functions.invoke('contact-submit', { body: data });
  if (error) throw error;
  return res as { message: string };
}

// Mints the short-lived submission token required by submitContact(). Call
// once when the contact page mounts.
export async function fetchFormToken(): Promise<string> {
  const { data, error } = await supabase.functions.invoke('contact-token');
  if (error) throw error;
  return (data as { token: string }).token;
}

// ── Admin ─────────────────────────────────────────────────────────────────
export async function adminGetContacts(): Promise<ContactSubmission[]> {
  const { data, error } = await supabase
    .from('contact_submissions')
    .select(SELECT)
    .in('status', ['clean', 'quarantine'])
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ContactSubmission[];
}

export async function adminMarkRead(id: number): Promise<void> {
  const { error } = await supabase
    .from('contact_submissions')
    .update({ is_read: true })
    .eq('id', id);
  if (error) throw error;
}

export async function adminDeleteContact(id: number): Promise<void> {
  const { error } = await supabase.from('contact_submissions').delete().eq('id', id);
  if (error) throw error;
}
