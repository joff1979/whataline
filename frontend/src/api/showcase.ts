import { supabase } from '../lib/supabase';
import type { ShowcaseItem } from './types';

// Pulls featured + published films and scripts (posters) for the home page.
export async function getFeaturedShowcase(): Promise<ShowcaseItem[]> {
  const [films, writing] = await Promise.all([
    supabase
      .from('film_projects')
      .select('id, title, logline, posterUrl:poster_url, format, genre, filmUrl:film_url, trailerUrl:trailer_url, sortOrder:sort_order')
      .eq('status', 'published')
      .eq('featured', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('writing_projects')
      .select('id, title, logline, posterUrl:poster_url, format, genre, scriptUrl:script_url, sortOrder:sort_order')
      .eq('status', 'published')
      .eq('featured', true)
      .order('sort_order', { ascending: true }),
  ]);

  if (films.error) throw films.error;
  if (writing.error) throw writing.error;

  const filmItems: ShowcaseItem[] = (films.data ?? []).map((f: Record<string, unknown>) => ({
    id: f.id as number,
    kind: 'film',
    title: f.title as string,
    logline: (f.logline as string) ?? '',
    posterUrl: (f.posterUrl as string) ?? null,
    format: (f.format as string) ?? null,
    genre: (f.genre as string) ?? null,
    href: '/portfolio/films',
    linkUrl: (f.filmUrl as string) ?? (f.trailerUrl as string) ?? null,
  }));

  const writingItems: ShowcaseItem[] = (writing.data ?? []).map((w: Record<string, unknown>) => ({
    id: w.id as number,
    kind: 'writing',
    title: w.title as string,
    logline: (w.logline as string) ?? '',
    posterUrl: (w.posterUrl as string) ?? null,
    format: (w.format as string) ?? null,
    genre: (w.genre as string) ?? null,
    href: '/portfolio/writing',
    linkUrl: (w.scriptUrl as string) ?? null,
  }));

  return [...filmItems, ...writingItems];
}
