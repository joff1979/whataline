import { supabase } from '../lib/supabase';

// Email-based login (Supabase Auth). Kat is invited via the Supabase dashboard.
export async function login(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

// Synchronous "is authenticated" check kept for backwards compatibility with
// the original RequireAuth component. Components added going forward should
// use the reactive `useAuth()` hook in src/hooks/useAuth.ts instead.
export function isAuthenticated(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = (supabase.auth as any).currentSession ?? null;
  return session !== null && session.expires_at * 1000 > Date.now();
}

export async function changePassword(_currentPassword: string, newPassword: string): Promise<void> {
  // Supabase Auth doesn't require the current password to update —
  // the session token authorises it. The arg is kept for the existing form UX.
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}
