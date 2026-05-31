import { supabase } from '../lib/supabase';
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
  awards: {
    name: string;
    category: string | null;
    year: number | null;
    laurelUrl: string | null;
    featured: boolean;
  }[];
}

const SELECT = `
  id,
  title,
  logline,
  posterUrl:poster_url,
  genre,
  format,
  year,
  trailerUrl:trailer_url,
  filmUrl:film_url,
  status,
  featured,
  sortOrder:sort_order,
  awards (id, name, category, year, laurelUrl:laurel_url, featured)
`;

// ── Public ────────────────────────────────────────────────────────────────
export async function getFilmProjects(): Promise<FilmProject[]> {
  const { data, error } = await supabase
    .from('film_projects')
    .select(SELECT)
    .eq('status', 'published')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as FilmProject[];
}

// ── Admin ─────────────────────────────────────────────────────────────────
export async function adminGetFilmProjects(): Promise<FilmProject[]> {
  const { data, error } = await supabase
    .from('film_projects')
    .select(SELECT)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as FilmProject[];
}

export async function adminCreateFilmProject(input: UpsertFilmProject): Promise<FilmProject> {
  const { data, error } = await supabase
    .from('film_projects')
    .insert({
      title: input.title,
      logline: input.logline,
      poster_url: input.posterUrl,
      genre: input.genre,
      format: input.format,
      year: input.year,
      trailer_url: input.trailerUrl,
      film_url: input.filmUrl,
      status: input.status,
      featured: input.featured,
      sort_order: input.sortOrder,
    })
    .select('id')
    .single();
  if (error) throw error;

  await syncFilmAwards(data.id, input.awards);

  const { data: full, error: fetchErr } = await supabase
    .from('film_projects')
    .select(SELECT)
    .eq('id', data.id)
    .single();
  if (fetchErr) throw fetchErr;
  return full as unknown as FilmProject;
}

export async function adminUpdateFilmProject(id: number, input: UpsertFilmProject): Promise<void> {
  const { error } = await supabase
    .from('film_projects')
    .update({
      title: input.title,
      logline: input.logline,
      poster_url: input.posterUrl,
      genre: input.genre,
      format: input.format,
      year: input.year,
      trailer_url: input.trailerUrl,
      film_url: input.filmUrl,
      status: input.status,
      featured: input.featured,
      sort_order: input.sortOrder,
    })
    .eq('id', id);
  if (error) throw error;

  await syncFilmAwards(id, input.awards);
}

export async function adminDeleteFilmProject(id: number): Promise<void> {
  const { error } = await supabase.from('film_projects').delete().eq('id', id);
  if (error) throw error;
}

export async function adminReorderFilmProjects(items: { id: number; sortOrder: number }[]): Promise<void> {
  await Promise.all(
    items.map(({ id, sortOrder }) =>
      supabase.from('film_projects').update({ sort_order: sortOrder }).eq('id', id)
    )
  );
}

async function syncFilmAwards(
  filmProjectId: number,
  awards: UpsertFilmProject['awards']
): Promise<void> {
  const { error: delError } = await supabase
    .from('awards')
    .delete()
    .eq('film_project_id', filmProjectId);
  if (delError) throw delError;

  if (awards.length === 0) return;

  const { error: insError } = await supabase.from('awards').insert(
    awards.map(a => ({
      name: a.name,
      category: a.category,
      year: a.year,
      laurel_url: a.laurelUrl,
      featured: a.featured,
      film_project_id: filmProjectId,
    }))
  );
  if (insError) throw insError;
}
