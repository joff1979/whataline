import { useEffect, useState, type FormEvent } from 'react';
import {
  adminGetFilmProjects,
  adminCreateFilmProject,
  adminUpdateFilmProject,
  adminDeleteFilmProject,
  adminReorderFilmProjects,
  type UpsertFilmProject,
} from '../../api/films';
import { adminUpload } from '../../api/storage';
import AwardEditor from '../../components/admin/AwardEditor';
import type { FilmProject } from '../../api/types';

const emptyForm = (): UpsertFilmProject => ({
  title: '', logline: '', posterUrl: null, genre: null, format: null,
  year: null, trailerUrl: null, filmUrl: null, status: 'draft',
  featured: false, sortOrder: 0, awards: [],
});

interface ProjectFormProps {
  initial: UpsertFilmProject;
  onSave: (data: UpsertFilmProject) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
}

function ProjectForm({ initial, onSave, onCancel, onDelete }: ProjectFormProps) {
  const [form, setForm] = useState<UpsertFilmProject>(initial);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (field: keyof UpsertFilmProject, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const url = await adminUpload(file);
      set('posterUrl', url);
    } catch (err) {
      setUploadError(`Upload failed: ${String(err)}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  const inputClass = "w-full border px-3 py-2 font-body text-sm outline-none rounded-none mb-3";
  const inputStyle = { borderColor: 'var(--color-border-strong)', background: 'white' };
  const labelClass = "block font-body text-xs tracking-wide uppercase mb-1";
  const labelStyle = { color: 'var(--color-text-muted)' };

  return (
    <form onSubmit={handleSubmit} className="p-5 rounded-none" style={{ background: 'var(--color-bg-elevated)' }}>
      <h2 className="font-display text-xl mb-4">{initial.title || 'New Film Project'}</h2>

      <label className={labelClass} style={labelStyle}>Title *</label>
      <input required value={form.title} onChange={(e) => set('title', e.target.value)}
        className={inputClass} style={inputStyle} />

      <label className={labelClass} style={labelStyle}>Logline</label>
      <textarea value={form.logline} onChange={(e) => set('logline', e.target.value)}
        rows={3} className="w-full border px-3 py-2 font-body text-sm outline-none rounded-none mb-3 resize-none"
        style={inputStyle} />

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <label className={labelClass} style={labelStyle}>Genre</label>
          <input value={form.genre ?? ''} onChange={(e) => set('genre', e.target.value || null)}
            className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Format</label>
          <input value={form.format ?? ''} onChange={(e) => set('format', e.target.value || null)}
            placeholder="Feature, Short…" className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Year</label>
          <input type="number" value={form.year ?? ''} onChange={(e) => set('year', e.target.value ? Number(e.target.value) : null)}
            className={inputClass} style={inputStyle} />
        </div>
      </div>

      <label className={labelClass} style={labelStyle}>Trailer URL</label>
      <input value={form.trailerUrl ?? ''} onChange={(e) => set('trailerUrl', e.target.value || null)}
        className={inputClass} style={inputStyle} />

      <label className={labelClass} style={labelStyle}>Film URL</label>
      <input value={form.filmUrl ?? ''} onChange={(e) => set('filmUrl', e.target.value || null)}
        className={inputClass} style={inputStyle} />

      <label className={labelClass} style={labelStyle}>Poster</label>
      {form.posterUrl && <img src={form.posterUrl} alt="Poster" className="w-24 mb-2 object-cover aspect-[2/3]" />}
      <input type="file" accept="image/*" onChange={handlePosterUpload}
        className="block font-body text-sm mb-3" disabled={uploading} />
      {uploading && <p className="font-body text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>Uploading…</p>}
      {uploadError && <p className="font-body text-xs mb-2 text-red-600">{uploadError}</p>}

      <div className="flex gap-4 mb-3">
        <div>
          <label className={labelClass} style={labelStyle}>Status</label>
          <select value={form.status} onChange={(e) => set('status', e.target.value as 'draft' | 'published')}
            className="border px-3 py-2 font-body text-sm outline-none rounded-none" style={inputStyle}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="flex items-end mb-3">
          <label className="flex items-center gap-2 font-body text-sm cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} />
            Featured
          </label>
        </div>
      </div>

      <AwardEditor awards={form.awards} onChange={(a) => set('awards', a)} />

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

export default function AdminFilms() {
  const [projects, setProjects] = useState<FilmProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FilmProject | null>(null);
  const [creating, setCreating] = useState(false);
  const [dragging, setDragging] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    adminGetFilmProjects().then(setProjects).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (data: UpsertFilmProject) => {
    await adminCreateFilmProject(data);
    setCreating(false);
    load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdate = async (id: number, data: UpsertFilmProject) => {
    await adminUpdateFilmProject(id, data);
    setEditing(null);
    load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this project?')) return;
    await adminDeleteFilmProject(id);
    setEditing(null);
    load();
  };

  const handleDrop = async (targetId: number) => {
    if (dragging === null || dragging === targetId) return;
    const reordered = [...projects];
    const fromIdx = reordered.findIndex((p) => p.id === dragging);
    const toIdx   = reordered.findIndex((p) => p.id === targetId);
    const [item]  = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, item);
    const updated = reordered.map((p, i) => ({ ...p, sortOrder: i }));
    setProjects(updated);
    setDragging(null);
    await adminReorderFilmProjects(updated.map((p) => ({ id: p.id, sortOrder: p.sortOrder })));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl" style={{ color: 'var(--color-text-inverse)' }}>Film Projects</h1>
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
          <ProjectForm initial={emptyForm()} onSave={handleCreate} onCancel={() => setCreating(false)} />
        </div>
      )}

      {editing && (
        <div className="mb-6">
          <ProjectForm
            initial={{
              title: editing.title, logline: editing.logline, posterUrl: editing.posterUrl,
              genre: editing.genre, format: editing.format, year: editing.year,
              trailerUrl: editing.trailerUrl, filmUrl: editing.filmUrl,
              status: editing.status, featured: editing.featured, sortOrder: editing.sortOrder,
              awards: editing.awards.map(({ name, category, year, laurelUrl, featured }) =>
                ({ name, category, year, laurelUrl, featured })),
            }}
            onSave={(data) => handleUpdate(editing.id, data)}
            onCancel={() => setEditing(null)}
            onDelete={() => handleDelete(editing.id)}
          />
        </div>
      )}

      {loading && <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading…</p>}
      {!loading && projects.length === 0 && (
        <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>
          No projects yet. Click "Add New" to get started.
        </p>
      )}

      <div className="space-y-3">
        {projects.map((p) => (
          <div key={p.id} draggable
            onDragStart={() => setDragging(p.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(p.id)}
            className="flex gap-4 p-4 cursor-grab active:cursor-grabbing transition-opacity"
            style={{
              background: 'var(--color-bg-elevated)',
              opacity: dragging === p.id ? 0.4 : 1,
              borderLeft: p.featured ? '4px solid var(--color-accent)' : '4px solid transparent',
            }}
          >
            {/* Drag handle */}
            <span className="font-body text-sm mt-1 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>⠿</span>

            {/* Poster thumbnail */}
            {p.posterUrl
              ? <img src={p.posterUrl} alt={p.title} className="w-14 object-cover aspect-[2/3] flex-shrink-0" />
              : <div className="w-14 aspect-[2/3] flex-shrink-0 flex items-center justify-center font-display text-xl"
                  style={{ background: 'linear-gradient(135deg, #008080, #C9A9A6)', color: 'rgba(250,247,248,0.6)' }}>
                  {p.title.charAt(0)}
                </div>
            }

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {p.format && (
                  <span className="font-body text-[10px] tracking-widest uppercase px-2 py-0.5"
                    style={{ background: 'var(--color-bg-dark)', color: 'var(--color-text-inverse)' }}>
                    {p.format}
                  </span>
                )}
                <span className="font-body text-[10px] tracking-wide uppercase px-2 py-0.5"
                  style={{
                    background: p.status === 'published' ? 'rgba(0,128,128,0.12)' : 'rgba(0,64,64,0.07)',
                    color: p.status === 'published' ? 'var(--color-text-secondary)' : 'var(--color-text-muted)',
                  }}>
                  {p.status}
                </span>
                {p.featured && (
                  <span className="font-body text-[10px]" style={{ color: 'var(--color-accent)' }}>★ Featured</span>
                )}
              </div>
              <div className="font-display text-base" style={{ color: 'var(--color-text-primary)' }}>{p.title}</div>
              {p.logline && (
                <p className="font-body text-xs italic mt-1 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  {p.logline}
                </p>
              )}
              {p.awards.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {p.awards.map((a, i) => (
                    <span key={i} className="font-body text-[10px] px-2 py-0.5"
                      style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>
                      {a.name}{a.category ? ` · ${a.category}` : ''}{a.year ? ` · ${a.year}` : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => { setCreating(false); setEditing(p); }}
              className="font-body text-xs tracking-wide uppercase px-3 py-1.5 rounded-none border transition-colors duration-200 flex-shrink-0 self-start"
              style={{ borderColor: 'var(--color-border-strong)', color: 'var(--color-text-secondary)' }}>
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
