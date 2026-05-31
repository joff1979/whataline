import { useEffect, useState } from 'react';
import {
  adminGetSocialLinks, adminCreateSocialLink,
  adminUpdateSocialLink, adminDeleteSocialLink,
  type UpsertSocialLink,
} from '../../api/socials';
import { adminUpload } from '../../api/writing';
import type { SocialLink } from '../../api/types';
import SocialIcon, { KNOWN_PLATFORMS } from '../../components/ui/SocialIcon';

const inputCls = 'w-full border px-3 py-2 font-body text-sm outline-none rounded-none';
const inputSt  = { borderColor: 'var(--color-border-strong)', background: 'white' };
const labelCls = 'block font-body text-xs tracking-wide uppercase mb-1';
const labelSt  = { color: 'var(--color-text-muted)' };

interface RowProps {
  initial: UpsertSocialLink;
  isNew?: boolean;
  onSave: (data: UpsertSocialLink) => Promise<void>;
  onCancel?: () => void;
  onDelete?: () => Promise<void>;
}

function SocialForm({ initial, isNew, onSave, onCancel, onDelete }: RowProps) {
  const [form, setForm] = useState<UpsertSocialLink>(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const set = (field: keyof UpsertSocialLink, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }));

  const known = KNOWN_PLATFORMS.includes(form.platform.toLowerCase());

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      set('iconUrl', await adminUpload(file));
    } catch (err) {
      setUploadError(`Upload failed: ${String(err)}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  return (
    <div className="p-4 mb-3" style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-strong)' }}>
      <div className="grid sm:grid-cols-[10rem_1fr] gap-3">
        {/* Platform */}
        <div>
          <label className={labelCls} style={labelSt}>Platform</label>
          <input
            list="known-platforms"
            value={form.platform}
            onChange={(e) => set('platform', e.target.value)}
            placeholder="linkedin, imdb…"
            className={inputCls}
            style={inputSt}
          />
          <datalist id="known-platforms">
            {KNOWN_PLATFORMS.map((p) => <option key={p} value={p} />)}
          </datalist>
        </div>

        {/* URL */}
        <div>
          <label className={labelCls} style={labelSt}>URL</label>
          <input
            value={form.url}
            onChange={(e) => set('url', e.target.value)}
            placeholder="https://…"
            className={inputCls}
            style={inputSt}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-[10rem_1fr] gap-3 mt-3 items-end">
        {/* Label */}
        <div>
          <label className={labelCls} style={labelSt}>Label (optional)</label>
          <input
            value={form.label ?? ''}
            onChange={(e) => set('label', e.target.value || null)}
            placeholder="LinkedIn"
            className={inputCls}
            style={inputSt}
          />
        </div>

        {/* Icon preview / upload */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-body text-xs" style={{ color: 'var(--color-text-muted)' }}>Icon:</span>
            <span style={{ color: 'var(--color-text-secondary)' }}>
              {form.iconUrl ? (
                <img src={form.iconUrl} alt="" className="w-5 h-5 object-contain" />
              ) : (
                <SocialIcon platform={form.platform} size={20} />
              )}
            </span>
            {known && !form.iconUrl && (
              <span className="font-body text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                built-in
              </span>
            )}
          </div>
          <label className="font-body text-xs cursor-pointer" style={{ color: 'var(--color-accent)' }}>
            {uploading ? 'Uploading…' : 'Upload custom icon'}
            <input type="file" accept="image/*" onChange={handleIconUpload} className="hidden" disabled={uploading} />
          </label>
          {form.iconUrl && (
            <button type="button" onClick={() => set('iconUrl', null)}
              className="font-body text-xs text-red-400">remove</button>
          )}
        </div>
      </div>
      {uploadError && <p className="font-body text-xs text-red-600 mt-2">{uploadError}</p>}

      <div className="flex items-center gap-4 mt-4">
        <label className="flex items-center gap-2 font-body text-sm cursor-pointer">
          <input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} />
          Published
        </label>

        <div className="flex gap-2 ml-auto">
          <button type="button" onClick={handleSave} disabled={saving}
            className="font-body text-xs tracking-widest uppercase px-5 py-2 rounded-none"
            style={{ background: 'var(--color-accent)', color: 'white' }}>
            {saving ? 'Saving…' : isNew ? 'Add' : 'Save'}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel}
              className="font-body text-xs tracking-widest uppercase px-5 py-2 rounded-none border"
              style={{ borderColor: 'var(--color-border-strong)', color: 'var(--color-text-secondary)' }}>
              Cancel
            </button>
          )}
          {onDelete && (
            <button type="button" onClick={onDelete}
              className="font-body text-xs tracking-widest uppercase px-5 py-2 rounded-none border"
              style={{ borderColor: '#fecaca', color: '#dc2626' }}>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminSocials() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    adminGetSocialLinks().then(setLinks).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleCreate = async (data: UpsertSocialLink) => {
    await adminCreateSocialLink(data);
    setCreating(false);
    load();
  };

  const handleUpdate = async (id: number, data: UpsertSocialLink) => {
    await adminUpdateSocialLink(id, data);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this social link?')) return;
    await adminDeleteSocialLink(id);
    load();
  };

  const nextSort = links.length ? Math.max(...links.map((l) => l.sortOrder)) + 1 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl" style={{ color: 'var(--color-text-inverse)' }}>Social Links</h1>
        {!creating && (
          <button onClick={() => setCreating(true)}
            className="font-body text-xs tracking-widest uppercase px-5 py-2 rounded-none"
            style={{ background: 'var(--color-accent)', color: 'white' }}>
            + Add Link
          </button>
        )}
      </div>

      <p className="font-body text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
        These appear in the site footer. Known platforms (LinkedIn, IMDB, Instagram, YouTube,
        Facebook, TikTok, Vimeo, X) get an icon automatically — for anything else, upload a custom icon.
      </p>

      {creating && (
        <SocialForm
          isNew
          initial={{ platform: '', label: null, url: '', iconUrl: null, sortOrder: nextSort, published: true }}
          onSave={handleCreate}
          onCancel={() => setCreating(false)}
        />
      )}

      {loading && <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading…</p>}
      {!loading && links.length === 0 && !creating && (
        <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>
          No social links yet. Click "Add Link" to get started.
        </p>
      )}

      {links.map((l) => (
        <SocialForm
          key={l.id}
          initial={{
            platform: l.platform, label: l.label, url: l.url,
            iconUrl: l.iconUrl, sortOrder: l.sortOrder, published: l.published,
          }}
          onSave={(data) => handleUpdate(l.id, data)}
          onDelete={() => handleDelete(l.id)}
        />
      ))}
    </div>
  );
}
