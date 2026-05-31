import { supabase } from '../lib/supabase';
import type { FeaturedLaurel } from './types';

// Pulls every award flagged `featured = true` across all films AND scripts,
// along with the title of its parent project, for display on the About page.
export async function getFeaturedLaurels(): Promise<FeaturedLaurel[]> {
  const { data, error } = await supabase
    .from('awards')
    .select(`
      id,
      name,
      category,
      year,
      laurelUrl:laurel_url,
      featured,
      writing:writing_projects ( title, status ),
      film:film_projects ( title, status )
    `)
    .eq('featured', true)
    .order('year', { ascending: false });

  if (error) throw error;

  type Row = {
    id: number;
    name: string;
    category: string | null;
    year: number | null;
    laurelUrl: string | null;
    writing: { title: string; status: string } | null;
    film:    { title: string; status: string } | null;
  };

  return ((data ?? []) as unknown as Row[])
    // Only surface laurels whose parent project is published
    .filter(r => (r.film?.status === 'published') || (r.writing?.status === 'published'))
    .map(r => ({
      id: r.id,
      name: r.name,
      category: r.category,
      year: r.year,
      laurelUrl: r.laurelUrl,
      projectTitle: r.film?.title ?? r.writing?.title ?? '',
    }));
}
