import { supabase } from '../lib/supabase';
import type { Service } from './types';

export interface UpsertServiceSample {
  title: string;
  description: string | null;
  fileUrl: string | null;
}

export interface UpsertService {
  title: string;
  description: string;
  sortOrder: number;
  published: boolean;
  samples: UpsertServiceSample[];
}

const SELECT = `
  id,
  title,
  description,
  sortOrder:sort_order,
  published,
  samples:service_samples!service_id (
    id,
    title,
    description,
    fileUrl:file_url,
    sortOrder:sort_order
  )
`;

// ── Public ────────────────────────────────────────────────────────────────
export async function getServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select(SELECT)
    .eq('published', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as Service[];
}

// ── Admin ─────────────────────────────────────────────────────────────────
export async function adminGetServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select(SELECT)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as Service[];
}

export async function adminCreateService(input: UpsertService): Promise<Service> {
  const { data, error } = await supabase
    .from('services')
    .insert({
      title: input.title,
      description: input.description,
      sort_order: input.sortOrder,
      published: input.published,
    })
    .select('id')
    .single();
  if (error) throw error;

  await syncSamples(data.id, input.samples);

  const { data: full, error: fetchErr } = await supabase
    .from('services')
    .select(SELECT)
    .eq('id', data.id)
    .single();
  if (fetchErr) throw fetchErr;
  return full as unknown as Service;
}

export async function adminUpdateService(id: number, input: UpsertService): Promise<void> {
  const { error } = await supabase
    .from('services')
    .update({
      title: input.title,
      description: input.description,
      sort_order: input.sortOrder,
      published: input.published,
    })
    .eq('id', id);
  if (error) throw error;

  await syncSamples(id, input.samples);
}

export async function adminDeleteService(id: number): Promise<void> {
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) throw error;
}

export async function adminReorderServices(items: { id: number; sortOrder: number }[]): Promise<void> {
  await Promise.all(
    items.map(({ id, sortOrder }) =>
      supabase.from('services').update({ sort_order: sortOrder }).eq('id', id)
    )
  );
}

async function syncSamples(serviceId: number, samples: UpsertServiceSample[]): Promise<void> {
  const { error: delError } = await supabase
    .from('service_samples')
    .delete()
    .eq('service_id', serviceId);
  if (delError) throw delError;

  if (samples.length === 0) return;

  const { error: insError } = await supabase.from('service_samples').insert(
    samples.map((s, idx) => ({
      service_id: serviceId,
      title: s.title,
      description: s.description,
      file_url: s.fileUrl,
      sort_order: idx,
    }))
  );
  if (insError) throw insError;
}
