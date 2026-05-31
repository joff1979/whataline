import { useState } from 'react';
import { adminUpload } from '../../api/writing';

export interface AwardInput {
  name: string;
  category: string | null;
  year: number | null;
  laurelUrl: string | null;
  featured: boolean;
}

interface Props {
  awards: AwardInput[];
  onChange: (awards: AwardInput[]) => void;
}

export default function AwardEditor({ awards, onChange }: Props) {
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const add = () =>
    onChange([...awards, { name: '', category: null, year: null, laurelUrl: null, featured: false }]);
  const remove = (i: number) => onChange(awards.filter((_, idx) => idx !== i));
  const update = (i: number, patch: Partial<AwardInput>) =>
    onChange(awards.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));

  const handleLaurelUpload = async (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIdx(i);
    setUploadError(null);
    try {
      const url = await adminUpload(file);
      update(i, { laurelUrl: url });
    } catch (err) {
      setUploadError(`Upload failed: ${String(err)}`);
    } finally {
      setUploadingIdx(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="font-body text-xs tracking-wide uppercase" style={{ color: 'var(--color-text-muted)' }}>
          Awards / Laurels
        </span>
        <button type="button" onClick={add}
          className="font-body text-xs tracking-wide uppercase rounded-none px-3 py-1"
          style={{ color: 'var(--color-accent)', border: '1px solid var(--color-accent)' }}>
          + Add
        </button>
      </div>

      {awards.map((a, i) => (
        <div key={i} className="p-3" style={{ background: 'rgba(0,128,128,0.04)', border: '1px solid var(--color-border-strong)' }}>
          {/* Name / Festival / Year / remove */}
          <div className="grid grid-cols-[1fr_1fr_5rem_auto] gap-2 items-center">
            <input value={a.name} onChange={(e) => update(i, { name: e.target.value })}
              placeholder="Award (e.g. Winner)"
              className="border px-2 py-1 font-body text-sm outline-none rounded-none"
              style={{ borderColor: 'var(--color-border-strong)' }} />
            <input value={a.category ?? ''} onChange={(e) => update(i, { category: e.target.value || null })}
              placeholder="Festival"
              className="border px-2 py-1 font-body text-sm outline-none rounded-none"
              style={{ borderColor: 'var(--color-border-strong)' }} />
            <input value={a.year ?? ''} onChange={(e) => update(i, { year: e.target.value ? Number(e.target.value) : null })}
              placeholder="Year" type="number"
              className="border px-2 py-1 font-body text-sm outline-none rounded-none"
              style={{ borderColor: 'var(--color-border-strong)' }} />
            <button type="button" onClick={() => remove(i)}
              className="font-body text-xs text-red-500 rounded-none px-2">✕</button>
          </div>

          {/* Laurel + feature controls */}
          <div className="flex flex-wrap items-center gap-4 mt-2">
            {/* Laurel preview / upload */}
            <div className="flex items-center gap-2">
              {a.laurelUrl ? (
                <img src={a.laurelUrl} alt="Laurel" className="h-10 object-contain"
                  style={{ filter: 'none' }} />
              ) : (
                <span className="font-body text-[11px]" style={{ color: 'var(--color-text-muted)' }}>No laurel</span>
              )}
              <label className="font-body text-xs cursor-pointer" style={{ color: 'var(--color-accent)' }}>
                {uploadingIdx === i ? 'Uploading…' : a.laurelUrl ? 'Replace laurel' : 'Upload laurel'}
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => handleLaurelUpload(i, e)} disabled={uploadingIdx === i} />
              </label>
              {a.laurelUrl && (
                <button type="button" onClick={() => update(i, { laurelUrl: null })}
                  className="font-body text-xs text-red-400">remove</button>
              )}
            </div>

            {/* Feature on About */}
            <label className="flex items-center gap-2 font-body text-xs cursor-pointer ml-auto"
              style={{ color: 'var(--color-text-secondary)' }}>
              <input type="checkbox" checked={a.featured}
                onChange={(e) => update(i, { featured: e.target.checked })} />
              Feature on About page
            </label>
          </div>
        </div>
      ))}

      {uploadError && <p className="font-body text-xs text-red-600">{uploadError}</p>}
    </div>
  );
}
