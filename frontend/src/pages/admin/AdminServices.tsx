import { useEffect, useState, type FormEvent } from 'react';
import {
  adminGetServices,
  adminCreateService,
  adminUpdateService,
  adminDeleteService,
  adminReorderServices,
  type UpsertService,
  type UpsertServiceSample,
} from '../../api/services';
import type { Service } from '../../api/types';
import { adminUpload } from '../../api/writing';

const emptyForm = (): UpsertService => ({
  title: '', description: '', sortOrder: 0, published: true, samples: [],
});

interface SamplesEditorProps {
  samples: UpsertServiceSample[];
  onChange: (samples: UpsertServiceSample[]) => void;
}

function SamplesEditor({ samples, onChange }: SamplesEditorProps) {
  const [uploading, setUploading] = useState<number | null>(null);

  const add = () => onChange([...samples, { title: '', description: null, fileUrl: null }]);
  const remove = (i: number) => onChange(samples.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof UpsertServiceSample, value: string | null) =>
    onChange(samples.map((s, idx) => idx === i ? { ...s, [field]: value } : s));

  const handleUpload = async (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(i);
    try { update(i, 'fileUrl', await adminUpload(file)); }
    finally { setUploading(null); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="font-body text-xs tracking-wide uppercase" style={{ color: 'var(--color-text-muted)' }}>
          Work Samples
        </span>
        <button type="button" onClick={add}
          className="font-body text-xs tracking-wide uppercase rounded-none px-3 py-1"
          style={{ color: 'var(--color-accent)', border: '1px solid var(--color-accent)' }}>
          + Add Sample
        </button>
      </div>
      {samples.map((s, i) => (
        <div key={i} className="border rounded-none p-3 mb-2 space-y-2"
          style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex gap-2">
            <input value={s.title} onChange={(e) => update(i, 'title', e.target.value)}
              placeholder="Sample title"
              className="flex-1 border px-2 py-1 font-body text-sm outline-none rounded-none"
              style={{ borderColor: 'var(--color-border-strong)' }} />
            <button type="button" onClick={() => remove(i)}
              className="font-body text-xs text-red-500 px-2">✕</button>
          </div>
          <input value={s.description ?? ''} onChange={(e) => update(i, 'description', e.target.value || null)}
            placeholder="Description (optional)"
            className="w-full border px-2 py-1 font-body text-sm outline-none rounded-none"
            style={{ borderColor: 'var(--color-border-strong)' }} />
          <div className="flex items-center gap-2">
            {s.fileUrl ? (
              <a href={s.fileUrl} target="_blank" rel="noopener noreferrer"
                className="font-body text-xs" style={{ color: 'var(--color-accent)' }}>
                File uploaded ↗
              </a>
            ) : (
              <span className="font-body text-xs" style={{ color: 'var(--color-text-muted)' }}>No file</span>
            )}
            <input type="file" onChange={(e) => handleUpload(i, e)}
              className="font-body text-xs" disabled={uploading === i} />
            {uploading === i && <span className="font-body text-xs" style={{ color: 'var(--color-text-muted)' }}>Uploading…</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

interface ServiceFormProps {
  initial: UpsertService;
  onSave: (data: UpsertService) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
}

function ServiceForm({ initial, onSave, onCancel, onDelete }: ServiceFormProps) {
  const [form, setForm] = useState<UpsertService>(initial);
  const [saving, setSaving] = useState(false);

  const set = (field: keyof UpsertService, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  const inputStyle = { borderColor: 'var(--color-border-strong)', background: 'white' };
  const labelStyle = { color: 'var(--color-text-muted)' };

  return (
    <form onSubmit={handleSubmit} className="p-5 rounded-none" style={{ background: 'var(--color-bg-elevated)' }}>
      <h2 className="font-display text-xl mb-4">{initial.title || 'New Service'}</h2>

      <label className="block font-body text-xs tracking-wide uppercase mb-1" style={labelStyle}>Title *</label>
      <input required value={form.title} onChange={(e) => set('title', e.target.value)}
        className="w-full border px-3 py-2 font-body text-sm outline-none rounded-none mb-3" style={inputStyle} />

      <label className="block font-body text-xs tracking-wide uppercase mb-1" style={labelStyle}>Description *</label>
      <textarea required value={form.description} onChange={(e) => set('description', e.target.value)}
        rows={4} className="w-full border px-3 py-2 font-body text-sm outline-none rounded-none mb-3 resize-none"
        style={inputStyle} />

      <div className="flex items-center gap-4 mb-4">
        <label className="flex items-center gap-2 font-body text-sm cursor-pointer">
          <input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} />
          Published
        </label>
      </div>

      <SamplesEditor samples={form.samples} onChange={(s) => set('samples', s)} />

      <div className="flex gap-3 mt-6">
        <button type="submit" disabled={saving}
          className="font-body text-xs tracking-widest uppercase px-6 py-2 rounded-none transition-colors duration-200"
          style={{ background: 'var(--color-accent)', color: 'white' }}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        <button type="button" onClick={onCancel}
          className="font-body text-xs tracking-widest uppercase px-6 py-2 rounded-none border transition-colors duration-200"
          style={{ borderColor: 'var(--color-border-strong)', color: 'var(--color-text-secondary)' }}>
          Cancel
        </button>
        {onDelete && (
          <button type="button" onClick={onDelete}
            className="ml-auto font-body text-xs tracking-widest uppercase px-6 py-2 rounded-none border transition-colors duration-200"
            style={{ borderColor: '#fecaca', color: '#dc2626' }}>
            Delete
          </button>
        )}
      </div>
    </form>
  );
}

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Service | null>(null);
  const [creating, setCreating] = useState(false);
  const [dragging, setDragging] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    adminGetServices().then(setServices).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (data: UpsertService) => {
    await adminCreateService(data);
    setCreating(false);
    load();
  };

  const handleUpdate = async (id: number, data: UpsertService) => {
    await adminUpdateService(id, data);
    setEditing(null);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this service?')) return;
    await adminDeleteService(id);
    setEditing(null);
    load();
  };

  const handleDrop = async (targetId: number) => {
    if (dragging === null || dragging === targetId) return;
    const reordered = [...services];
    const fromIdx = reordered.findIndex((s) => s.id === dragging);
    const toIdx   = reordered.findIndex((s) => s.id === targetId);
    const [item]  = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, item);
    const updated = reordered.map((s, i) => ({ ...s, sortOrder: i }));
    setServices(updated);
    setDragging(null);
    await adminReorderServices(updated.map((s) => ({ id: s.id, sortOrder: s.sortOrder })));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl" style={{ color: 'var(--color-text-inverse)' }}>Services</h1>
        {!creating && !editing && (
          <button onClick={() => setCreating(true)}
            className="font-body text-xs tracking-widest uppercase px-5 py-2 rounded-none transition-colors duration-200"
            style={{ background: 'var(--color-accent)', color: 'white' }}>
            + Add New
          </button>
        )}
      </div>

      {creating && (
        <div className="mb-6">
          <ServiceForm initial={emptyForm()} onSave={handleCreate} onCancel={() => setCreating(false)} />
        </div>
      )}

      {editing && (
        <div className="mb-6">
          <ServiceForm
            initial={{
              title: editing.title, description: editing.description,
              sortOrder: editing.sortOrder, published: editing.published,
              samples: editing.samples.map(({ title, description, fileUrl }) => ({ title, description, fileUrl })),
            }}
            onSave={(data) => handleUpdate(editing.id, data)}
            onCancel={() => setEditing(null)}
            onDelete={() => handleDelete(editing.id)}
          />
        </div>
      )}

      {loading && <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading…</p>}
      {!loading && services.length === 0 && (
        <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>
          No services yet. Click "Add New" to get started.
        </p>
      )}

      <div className="space-y-2">
        {services.map((s) => (
          <div key={s.id} draggable
            onDragStart={() => setDragging(s.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(s.id)}
            className="flex items-center gap-4 p-4 cursor-grab active:cursor-grabbing"
            style={{
              background: 'var(--color-bg-elevated)',
              opacity: dragging === s.id ? 0.4 : 1,
              borderLeft: s.published ? '4px solid var(--color-accent)' : '4px solid transparent',
            }}
          >
            <span className="font-body text-xs" style={{ color: 'var(--color-text-muted)' }}>⠿</span>
            <div className="flex-1 min-w-0">
              <div className="font-display text-base truncate">{s.title}</div>
              <div className="font-body text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                {s.samples.length} sample{s.samples.length !== 1 ? 's' : ''} · {s.published ? 'Published' : 'Draft'}
              </div>
            </div>
            <button onClick={() => { setCreating(false); setEditing(s); }}
              className="font-body text-xs tracking-wide uppercase px-3 py-1.5 rounded-none border flex-shrink-0"
              style={{ borderColor: 'var(--color-border-strong)', color: 'var(--color-text-secondary)' }}>
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
