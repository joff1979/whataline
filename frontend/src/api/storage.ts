import { supabase } from '../lib/supabase';

export async function adminUpload(file: File): Promise<string> {
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from('media')
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from('media').getPublicUrl(path);
  return data.publicUrl;
}
