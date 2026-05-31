import { supabase } from '../lib/supabase';
import type { SocialLink } from './types';

export interface UpsertSocialLink {
  platform: string;
  label: string | null;
  url: string;
  iconUrl: string | null;
  sortOrder: number;
  published: boolean;
}

const SELECT = `
  id,
  platform,
  label,
  url,
  iconUrl:icon_url,
  sortOrder:sort_order,
  published
`;

// ── Public ────────────────────────────────────────────────────────────────
export async function getSocialLinks(): Promise<SocialLink[]> {
  const { data, error } = await supabase
    .from('social_links')
    .select(SELECT)
    .eq('published', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as SocialLink[];
}

// ── Admin ─────────────────────────────────────────────────────────────────
export async function adminGetSocialLinks(): Promise<SocialLink[]> {
  const { data, error } = await supabase
    .from('social_links')
    .select(SELECT)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as SocialLink[];
}

export async function adminCreateSocialLink(input: UpsertSocialLink): Promise<void> {
  const { error } = await supabase.from('social_links').insert({
    platform: input.platform,
    label: input.label,
    url: input.url,
    icon_url: input.iconUrl,
    sort_order: input.sortOrder,
    published: input.published,
  });
  if (error) throw error;
}

export async function adminUpdateSocialLink(id: number, input: UpsertSocialLink): Promise<void> {
  const { error } = await supabase
    .from('social_links')
    .update({
      platform: input.platform,
      label: input.label,
      url: input.url,
      icon_url: input.iconUrl,
      sort_order: input.sortOrder,
      published: input.published,
    })
    .eq('id', id);
  if (error) throw error;
}

export async function adminDeleteSocialLink(id: number): Promise<void> {
  const { error } = await supabase.from('social_links').delete().eq('id', id);
  if (error) throw error;
}
