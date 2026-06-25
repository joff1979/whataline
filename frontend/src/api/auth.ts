import { supabase } from '../lib/supabase';

// Email-based login (Supabase Auth). Kat is invited via the Supabase dashboard.
export async function login(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}


export async function changePassword(_currentPassword: string, newPassword: string): Promise<void> {
  // Supabase Auth doesn't require the current password to update —
  // the session token authorises it. The arg is kept for the existing form UX.
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}
