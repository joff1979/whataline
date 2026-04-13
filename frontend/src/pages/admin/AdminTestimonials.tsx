import { useEffect, useState, type FormEvent } from 'react';
import {
  adminGetTestimonials,
  adminCreateTestimonial,
  adminUpdateTestimonial,
  adminDeleteTestimonial,
  adminReorderTestimonials,
  type UpsertTestimonial,
} from '../../api/testimonials';
import type { Testimonial } from '../../api/types';

const emptyForm = (): UpsertTestimonial => ({
  quoteText: '', attributeName: '', attributeTitle: null, organisation: null,
  sortOrder: 0, published: true,
});

interface TestimonialFormProps {
  initial: UpsertTestimonial;
  onSave: (data: UpsertTestimonial) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
}

function TestimonialForm({ initial, onSave, onCancel, onDelete }: TestimonialFormProps) {
  const [form, setForm] = useState<UpsertTestimonial>(initial);
  const [saving, setSaving] = useState(false);

  const set = (field: keyof UpsertTestimonial, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  const inputStyle = { borderColor: 'var(--color-border-strong)', background: 'white' };
  const labelStyle = { color: 'var(--color-text-muted)' };
  const inputClass = "w-full border px-3 py-2 font-body text-sm outline-none rounded-none mb-3";
  const labelClass = "block font-body text-xs tracking-wide uppercase mb-1";

  return (
    <form onSubmit={handleSubmit} className="p-5 rounded-none" style={{ background: 'var(--color-bg-elevated)' }}>
      <h2 className="font-display text-xl mb-4">{initial.attributeName || 'New Testimonial'}</h2>

      <label className={labelClass} style={labelStyle}>Quote *</label>
      <textarea required value={form.quoteText} onChange={(e) => set('quoteText', e.target.value)}
        rows={5} className="w-full border px-3 py-2 font-body text-sm outline-none rounded-none mb-3 resize-none"
        style={inputStyle} />

      <label className={labelClass} style={labelStyle}>Name *</label>
      <input required value={form.attributeName} onChange={(e) => set('attributeName', e.target.value)}
        className={inputClass} style={inputStyle} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} style={labelStyle}>Title / Role</label>
          <input value={form.attributeTitle ?? ''} onChange={(e) => set('attributeTitle', e.target.value || null)}
            placeholder="e.g. Director" className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Organisation</label>
          <input value={form.organisation ?? ''} onChange={(e) => set('organisation', e.target.value || null)}
            className={inputClass} style={inputStyle} />
        </div>
      </div>

      <label className="flex items-center gap-2 font-body text-sm cursor-pointer mb-4">
        <input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} />
        Published
      </label>

      <div className="flex gap-3">
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

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [creating, setCreating] = useState(false);
  const [dragging, setDragging] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    adminGetTestimonials().then(setTestimonials).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (data: UpsertTestimonial) => {
    await adminCreateTestimonial(data);
    setCreating(false);
    load();
  };

  const handleUpdate = async (id: number, data: UpsertTestimonial) => {
    await adminUpdateTestimonial(id, data);
    setEditing(null);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this testimonial?')) return;
    await adminDeleteTestimonial(id);
    setEditing(null);
    load();
  };

  const handleDrop = async (targetId: number) => {
    if (dragging === null || dragging === targetId) return;
    const reordered = [...testimonials];
    const fromIdx = reordered.findIndex((t) => t.id === dragging);
    const toIdx   = reordered.findIndex((t) => t.id === targetId);
    const [item]  = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, item);
    const updated = reordered.map((t, i) => ({ ...t, sortOrder: i }));
    setTestimonials(updated);
    setDragging(null);
    await adminReorderTestimonials(updated.map((t) => ({ id: t.id, sortOrder: t.sortOrder })));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl" style={{ color: 'var(--color-text-inverse)' }}>Testimonials</h1>
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
          <TestimonialForm initial={emptyForm()} onSave={handleCreate} onCancel={() => setCreating(false)} />
        </div>
      )}

      {editing && (
        <div className="mb-6">
          <TestimonialForm
            initial={{
              quoteText: editing.quoteText, attributeName: editing.attributeName,
              attributeTitle: editing.attributeTitle, organisation: editing.organisation,
              sortOrder: editing.sortOrder, published: editing.published,
            }}
            onSave={(data) => handleUpdate(editing.id, data)}
            onCancel={() => setEditing(null)}
            onDelete={() => handleDelete(editing.id)}
          />
        </div>
      )}

      {loading && <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading…</p>}
      {!loading && testimonials.length === 0 && (
        <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>
          No testimonials yet. Click "Add New" to get started.
        </p>
      )}

      <div className="space-y-2">
        {testimonials.map((t) => (
          <div key={t.id} draggable
            onDragStart={() => setDragging(t.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(t.id)}
            className="flex items-start gap-4 p-4 cursor-grab active:cursor-grabbing"
            style={{
              background: 'var(--color-bg-elevated)',
              opacity: dragging === t.id ? 0.4 : 1,
              borderLeft: t.published ? '4px solid var(--color-accent)' : '4px solid transparent',
            }}
          >
            <span className="font-body text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>⠿</span>
            <div className="flex-1 min-w-0">
              <div className="font-display italic text-base truncate">&ldquo;{t.quoteText}&rdquo;</div>
              <div className="font-body text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                — {t.attributeName}
                {t.attributeTitle && `, ${t.attributeTitle}`}
                {t.organisation && `, ${t.organisation}`}
              </div>
            </div>
            <button onClick={() => { setCreating(false); setEditing(t); }}
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
