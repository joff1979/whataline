import { supabase } from '../lib/supabase';

// Email-based login (Supabase Auth). Kat is invited via the Supabase dashboard.
export async function login(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}


export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user?.email) throw new Error('Not authenticated');

  // Re-authenticate to verify the current password before allowing the change
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (signInError) throw new Error('Current password is incorrect.');

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}
