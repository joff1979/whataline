import { supabase } from '../lib/supabase';
import type { WritingProject, UpsertWritingProject } from './types';

const SELECT = `
  id,
  title,
  logline,
  posterUrl:poster_url,
  genre,
  format,
  scriptUrl:script_url,
  status,
  featured,
  sortOrder:sort_order,
  awards (id, name, category, year, laurelUrl:laurel_url, featured)
`;

// ── Public ────────────────────────────────────────────────────────────────
export async function getWritingProjects(): Promise<WritingProject[]> {
  const { data, error } = await supabase
    .from('writing_projects')
    .select(SELECT)
    .eq('status', 'published')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as WritingProject[];
}

export async function getWritingProject(id: number): Promise<WritingProject> {
  const { data, error } = await supabase
    .from('writing_projects')
    .select(SELECT)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as unknown as WritingProject;
}

// ── Admin ─────────────────────────────────────────────────────────────────
export async function adminGetWritingProjects(): Promise<WritingProject[]> {
  const { data, error } = await supabase
    .from('writing_projects')
    .select(SELECT)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as WritingProject[];
}

export async function adminCreateWritingProject(input: UpsertWritingProject): Promise<WritingProject> {
  const { data, error } = await supabase
    .from('writing_projects')
    .insert({
      title: input.title,
      logline: input.logline,
      poster_url: input.posterUrl,
      genre: input.genre,
      format: input.format,
      script_url: input.scriptUrl,
      status: input.status,
      featured: input.featured,
      sort_order: input.sortOrder,
    })
    .select('id')
    .single();
  if (error) throw error;

  await syncWritingAwards(data.id, input.awards);
  return getWritingProject(data.id);
}

export async function adminUpdateWritingProject(id: number, input: UpsertWritingProject): Promise<void> {
  const { error } = await supabase
    .from('writing_projects')
    .update({
      title: input.title,
      logline: input.logline,
      poster_url: input.posterUrl,
      genre: input.genre,
      format: input.format,
      script_url: input.scriptUrl,
      status: input.status,
      featured: input.featured,
      sort_order: input.sortOrder,
    })
    .eq('id', id);
  if (error) throw error;

  await syncWritingAwards(id, input.awards);
}

export async function adminDeleteWritingProject(id: number): Promise<void> {
  const { error } = await supabase.from('writing_projects').delete().eq('id', id);
  if (error) throw error;
}

export async function adminReorderWritingProjects(items: { id: number; sortOrder: number }[]): Promise<void> {
  // Run updates in parallel — small list, no need for an RPC
  await Promise.all(
    items.map(({ id, sortOrder }) =>
      supabase.from('writing_projects').update({ sort_order: sortOrder }).eq('id', id)
    )
  );
}

// ── Awards (polymorphic) ──────────────────────────────────────────────────
async function syncWritingAwards(
  writingProjectId: number,
  awards: UpsertWritingProject['awards']
): Promise<void> {
  // Reset & insert — list is small (single-digit count)
  const { error: delError } = await supabase
    .from('awards')
    .delete()
    .eq('writing_project_id', writingProjectId);
  if (delError) throw delError;

  if (awards.length === 0) return;

  const { error: insError } = await supabase.from('awards').insert(
    awards.map(a => ({
      name: a.name,
      category: a.category,
      year: a.year,
      laurel_url: a.laurelUrl,
      featured: a.featured,
      writing_project_id: writingProjectId,
    }))
  );
  if (insError) throw insError;
}

