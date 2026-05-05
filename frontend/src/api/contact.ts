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
export async function submitContact(data: ContactRequest): Promise<{ message: string }> {
  // 1. Insert the row (anon RLS policy allows this)
  const { error } = await supabase.from('contact_submissions').insert({
    name: data.name,
    email: data.email,
    subject: data.subject ?? null,
    message: data.message,
  });
  if (error) throw error;

  // 2. Fire-and-forget the notification email — failure must not surface
  //    to the visitor (the row is already saved; Kat can read it in the inbox).
  try {
    await supabase.functions.invoke('contact-notify', { body: data });
  } catch (err) {
    console.warn('contact-notify edge function failed:', err);
  }

  return { message: 'Thank you — your message has been received.' };
}

// ── Admin ─────────────────────────────────────────────────────────────────
export async function adminGetContacts(): Promise<ContactSubmission[]> {
  const { data, error } = await supabase
    .from('contact_submissions')
    .select(SELECT)
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
