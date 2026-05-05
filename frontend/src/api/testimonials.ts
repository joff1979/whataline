import { supabase } from '../lib/supabase';
import type { Testimonial } from './types';

export interface UpsertTestimonial {
  quoteText: string;
  attributeName: string;
  attributeTitle: string | null;
  organisation: string | null;
  sortOrder: number;
  published: boolean;
}

const SELECT = `
  id,
  quoteText:quote_text,
  attributeName:attribute_name,
  attributeTitle:attribute_title,
  organisation,
  sortOrder:sort_order,
  published
`;

// ── Public ────────────────────────────────────────────────────────────────
export async function getTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select(SELECT)
    .eq('published', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as Testimonial[];
}

// ── Admin ─────────────────────────────────────────────────────────────────
export async function adminGetTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select(SELECT)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as Testimonial[];
}

export async function adminCreateTestimonial(input: UpsertTestimonial): Promise<Testimonial> {
  const { data, error } = await supabase
    .from('testimonials')
    .insert({
      quote_text: input.quoteText,
      attribute_name: input.attributeName,
      attribute_title: input.attributeTitle,
      organisation: input.organisation,
      sort_order: input.sortOrder,
      published: input.published,
    })
    .select(SELECT)
    .single();
  if (error) throw error;
  return data as unknown as Testimonial;
}

export async function adminUpdateTestimonial(id: number, input: UpsertTestimonial): Promise<void> {
  const { error } = await supabase
    .from('testimonials')
    .update({
      quote_text: input.quoteText,
      attribute_name: input.attributeName,
      attribute_title: input.attributeTitle,
      organisation: input.organisation,
      sort_order: input.sortOrder,
      published: input.published,
    })
    .eq('id', id);
  if (error) throw error;
}

export async function adminDeleteTestimonial(id: number): Promise<void> {
  const { error } = await supabase.from('testimonials').delete().eq('id', id);
  if (error) throw error;
}

export async function adminReorderTestimonials(items: { id: number; sortOrder: number }[]): Promise<void> {
  await Promise.all(
    items.map(({ id, sortOrder }) =>
      supabase.from('testimonials').update({ sort_order: sortOrder }).eq('id', id)
    )
  );
}
