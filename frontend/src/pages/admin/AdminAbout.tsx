import { useEffect, useState } from 'react';
import {
  getAboutContent, adminSaveAboutContent,
  type AboutContent, type CreditGroup, type CreditItem,
  type PullQuote, type RecognitionItem, type EducationItem,
} from '../../api/about';

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputClass  = 'w-full border px-3 py-2 font-body text-sm outline-none rounded-none';
const inputStyle  = { borderColor: 'var(--color-border-strong)', background: 'white' };
const labelClass  = 'block font-body text-xs tracking-wide uppercase mb-1';
const labelStyle  = { color: 'var(--color-text-muted)' };
const addBtnClass = 'font-body text-xs tracking-wide uppercase rounded-none px-3 py-1';
const addBtnStyle = { color: 'var(--color-accent)', border: '1px solid var(--color-accent)' };
const rmBtnClass  = 'font-body text-xs text-red-400 px-2 py-1 rounded-none flex-shrink-0';

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8 p-5" style={{ background: 'var(--color-bg-elevated)' }}>
      <h2
        className="font-body text-xs tracking-widest uppercase mb-4 pb-3"
        style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-strong)' }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

// ── Bio editor ────────────────────────────────────────────────────────────────

function BioEditor({
  value, onChange,
}: { value: string[]; onChange: (v: string[]) => void }) {
  const update = (i: number, text: string) => onChange(value.map((p, j) => j === i ? text : p));
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  const add    = () => onChange([...value, '']);

  return (
    <SectionCard title="Bio">
      <p className="font-body text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
        Each paragraph appears in the dark hero section at the top of the About page.
      </p>
      {value.map((p, i) => (
        <div key={i} className="flex gap-2 mb-3">
          <textarea
            value={p}
            onChange={(e) => update(i, e.target.value)}
            rows={4}
            className={`${inputClass} resize-none flex-1`}
            style={inputStyle}
          />
          <button type="button" onClick={() => remove(i)} className={rmBtnClass}>✕</button>
        </div>
      ))}
      <button type="button" onClick={add} className={addBtnClass} style={addBtnStyle}>
        + Add Paragraph
      </button>
    </SectionCard>
  );
}

// ── Pull quotes editor ────────────────────────────────────────────────────────

function PullQuotesEditor({
  value, onChange,
}: { value: PullQuote[]; onChange: (v: PullQuote[]) => void }) {
  const update = (i: number, field: keyof PullQuote, text: string) =>
    onChange(value.map((q, j) => j === i ? { ...q, [field]: text } : q));
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  const add    = () => onChange([...value, { text: '', attr: '' }]);

  return (
    <SectionCard title="Pull Quotes (dusty-rose band on About page)">
      <p className="font-body text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
        These appear in the coloured section in the middle of the About page (not the Testimonials page).
      </p>
      {value.map((q, i) => (
        <div key={i} className="mb-4 p-4" style={{ background: 'rgba(0,64,64,0.04)', border: '1px solid var(--color-border-strong)' }}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <label className={labelClass} style={labelStyle}>Quote</label>
            <button type="button" onClick={() => remove(i)} className={rmBtnClass}>✕ Remove</button>
          </div>
          <textarea
            value={q.text}
            onChange={(e) => update(i, 'text', e.target.value)}
            rows={3}
            className={`${inputClass} resize-none mb-3`}
            style={inputStyle}
          />
          <label className={labelClass} style={labelStyle}>Attribution</label>
          <input
            value={q.attr}
            onChange={(e) => update(i, 'attr', e.target.value)}
            placeholder="e.g. Director, rocking horse media"
            className={inputClass}
            style={inputStyle}
          />
        </div>
      ))}
      <button type="button" onClick={add} className={addBtnClass} style={addBtnStyle}>
        + Add Quote
      </button>
    </SectionCard>
  );
}

// ── Credits editor ────────────────────────────────────────────────────────────

function CreditsEditor({
  value, onChange,
}: { value: CreditGroup[]; onChange: (v: CreditGroup[]) => void }) {
  const [draggingGroup, setDraggingGroup] = useState<number | null>(null);
  const [draggingItem,  setDraggingItem]  = useState<{ gi: number; ii: number } | null>(null);

  // ── Group helpers ────────────────────────────────────────────────────────
  const updateGroup = (i: number, g: CreditGroup) =>
    onChange(value.map((v, j) => j === i ? g : v));
  const removeGroup = (i: number) => onChange(value.filter((_, j) => j !== i));
  const addGroup    = () => onChange([...value, { role: '', items: [] }]);

  const handleGroupDrop = (targetIdx: number) => {
    if (draggingGroup === null || draggingGroup === targetIdx) { setDraggingGroup(null); return; }
    const arr = [...value];
    const [moved] = arr.splice(draggingGroup, 1);
    arr.splice(targetIdx, 0, moved);
    onChange(arr);
    setDraggingGroup(null);
  };

  // ── Item helpers ─────────────────────────────────────────────────────────
  const updateItem = (gi: number, ii: number, item: CreditItem) =>
    updateGroup(gi, { ...value[gi], items: value[gi].items.map((it, j) => j === ii ? item : it) });
  const removeItem = (gi: number, ii: number) =>
    updateGroup(gi, { ...value[gi], items: value[gi].items.filter((_, j) => j !== ii) });
  const addItem    = (gi: number) =>
    updateGroup(gi, { ...value[gi], items: [...value[gi].items, { title: '' }] });

  const handleItemDrop = (gi: number, targetIdx: number) => {
    if (!draggingItem || draggingItem.gi !== gi || draggingItem.ii === targetIdx) {
      setDraggingItem(null); return;
    }
    const items = [...value[gi].items];
    const [moved] = items.splice(draggingItem.ii, 1);
    items.splice(targetIdx, 0, moved);
    updateGroup(gi, { ...value[gi], items });
    setDraggingItem(null);
  };

  return (
    <SectionCard title="Selected Credits">
      <p className="font-body text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
        Drag the <strong>⠿</strong> handle to reorder role groups or individual credits.
      </p>

      {value.map((group, gi) => (
        <div
          key={gi}
          draggable
          onDragStart={(e) => { e.stopPropagation(); setDraggingGroup(gi); }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.stopPropagation(); handleGroupDrop(gi); }}
          onDragEnd={() => setDraggingGroup(null)}
          className="mb-6 p-4 transition-opacity"
          style={{
            background: 'rgba(0,64,64,0.04)',
            border: '1px solid var(--color-border-strong)',
            opacity: draggingGroup === gi ? 0.4 : 1,
            cursor: 'grab',
          }}
        >
          {/* Role row */}
          <div className="flex items-center gap-3 mb-3">
            <span className="font-body text-sm flex-shrink-0" style={{ color: 'var(--color-text-muted)', cursor: 'grab' }}>⠿</span>
            <input
              value={group.role}
              onChange={(e) => updateGroup(gi, { ...group, role: e.target.value })}
              placeholder="Role (e.g. Script Supervisor)"
              className="flex-1 border px-3 py-2 font-body text-sm font-medium outline-none rounded-none"
              style={{ ...inputStyle, borderColor: 'var(--color-accent)' }}
            />
            <button type="button" onClick={() => removeGroup(gi)}
              className="font-body text-xs text-red-400 px-3 py-2 rounded-none border border-red-200 flex-shrink-0">
              Remove Role
            </button>
          </div>

          {/* Items */}
          <div className="ml-6">
            <div className="grid grid-cols-[1.5rem_1fr_1fr_5rem_auto] gap-2 mb-1">
              <span />
              <span className={`${labelClass} !mb-0`} style={labelStyle}>Title</span>
              <span className={`${labelClass} !mb-0`} style={labelStyle}>Company</span>
              <span className={`${labelClass} !mb-0`} style={labelStyle}>Year</span>
              <span />
            </div>

            {group.items.map((item, ii) => (
              <div
                key={ii}
                draggable
                onDragStart={(e) => { e.stopPropagation(); setDraggingItem({ gi, ii }); }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.stopPropagation(); handleItemDrop(gi, ii); }}
                onDragEnd={() => setDraggingItem(null)}
                className="grid grid-cols-[1.5rem_1fr_1fr_5rem_auto] gap-2 items-center mb-2 transition-opacity"
                style={{ opacity: draggingItem?.gi === gi && draggingItem?.ii === ii ? 0.4 : 1 }}
              >
                <span className="font-body text-sm text-center" style={{ color: 'var(--color-text-muted)', cursor: 'grab' }}>⠿</span>
                <input value={item.title} onChange={(e) => updateItem(gi, ii, { ...item, title: e.target.value })}
                  placeholder="Title" className={inputClass} style={inputStyle} />
                <input value={item.company ?? ''} onChange={(e) => updateItem(gi, ii, { ...item, company: e.target.value || undefined })}
                  placeholder="Company (optional)" className={inputClass} style={inputStyle} />
                <input value={item.year ?? ''} onChange={(e) => updateItem(gi, ii, { ...item, year: e.target.value || undefined })}
                  placeholder="Year" className={inputClass} style={inputStyle} />
                <button type="button" onClick={() => removeItem(gi, ii)} className={rmBtnClass}>✕</button>
              </div>
            ))}

            <button type="button" onClick={() => addItem(gi)} className={`${addBtnClass} mt-1`} style={addBtnStyle}>
              + Add Credit
            </button>
          </div>
        </div>
      ))}

      <button type="button" onClick={addGroup} className={addBtnClass} style={addBtnStyle}>
        + Add Role Group
      </button>
    </SectionCard>
  );
}

// ── Recognition editor ────────────────────────────────────────────────────────

function RecognitionEditor({
  value, onChange,
}: { value: RecognitionItem[]; onChange: (v: RecognitionItem[]) => void }) {
  const update = (i: number, field: keyof RecognitionItem, text: string) =>
    onChange(value.map((r, j) => j === i ? { ...r, [field]: text } : r));
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  const add    = () => onChange([...value, { title: '', body: '', year: '' }]);

  return (
    <SectionCard title="Awards & Recognition">
      {value.map((r, i) => (
        <div key={i} className="grid grid-cols-[6rem_1fr_5rem_auto] gap-2 items-center mb-2">
          <input value={r.title} onChange={(e) => update(i, 'title', e.target.value)}
            placeholder="e.g. Award Winner" className={inputClass} style={inputStyle} />
          <input value={r.body} onChange={(e) => update(i, 'body', e.target.value)}
            placeholder="Festival / body" className={inputClass} style={inputStyle} />
          <input value={r.year} onChange={(e) => update(i, 'year', e.target.value)}
            placeholder="Year" className={inputClass} style={inputStyle} />
          <button type="button" onClick={() => remove(i)} className={rmBtnClass}>✕</button>
        </div>
      ))}
      <button type="button" onClick={add} className={`${addBtnClass} mt-2`} style={addBtnStyle}>
        + Add Award
      </button>
    </SectionCard>
  );
}

// ── Education editor ──────────────────────────────────────────────────────────

function EducationEditor({
  value, onChange,
}: { value: EducationItem[]; onChange: (v: EducationItem[]) => void }) {
  const update = (i: number, field: keyof EducationItem, text: string) =>
    onChange(value.map((e, j) => j === i ? { ...e, [field]: text } : e));
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  const add    = () => onChange([...value, { school: '', course: '', year: '' }]);

  return (
    <SectionCard title="Education & Training">
      {value.map((e, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_5rem_auto] gap-2 items-center mb-2">
          <input value={e.course} onChange={(ev) => update(i, 'course', ev.target.value)}
            placeholder="Course / qualification" className={inputClass} style={inputStyle} />
          <input value={e.school} onChange={(ev) => update(i, 'school', ev.target.value)}
            placeholder="School / provider" className={inputClass} style={inputStyle} />
          <input value={e.year} onChange={(ev) => update(i, 'year', ev.target.value)}
            placeholder="Year" className={inputClass} style={inputStyle} />
          <button type="button" onClick={() => remove(i)} className={rmBtnClass}>✕</button>
        </div>
      ))}
      <button type="button" onClick={add} className={`${addBtnClass} mt-2`} style={addBtnStyle}>
        + Add Course
      </button>
    </SectionCard>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminAbout() {
  const [content, setContent] = useState<AboutContent>({
    bioParagraphs: [],
    pullQuotes: [],
    credits: [],
    recognition: [],
    education: [],
  });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saveMsg, setSaveMsg]   = useState<string | null>(null);

  useEffect(() => {
    getAboutContent().then(setContent).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      await adminSaveAboutContent(content);
      setSaveMsg('Saved ✓');
      setTimeout(() => setSaveMsg(null), 3000);
    } catch {
      setSaveMsg('Save failed — check console');
    } finally {
      setSaving(false);
    }
  };

  const update = <K extends keyof AboutContent>(key: K, val: AboutContent[K]) =>
    setContent(c => ({ ...c, [key]: val }));

  if (loading) {
    return (
      <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading…</p>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl" style={{ color: 'var(--color-text-inverse)' }}>
          About Page
        </h1>
        <div className="flex items-center gap-4">
          {saveMsg && (
            <span
              className="font-body text-xs"
              style={{ color: saveMsg.startsWith('Saved') ? 'var(--color-text-secondary)' : '#dc2626' }}
            >
              {saveMsg}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="font-body text-xs tracking-widest uppercase px-6 py-2 rounded-none transition-colors duration-200"
            style={{ background: 'var(--color-accent)', color: 'white', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      <BioEditor
        value={content.bioParagraphs}
        onChange={(v) => update('bioParagraphs', v)}
      />

      <PullQuotesEditor
        value={content.pullQuotes}
        onChange={(v) => update('pullQuotes', v)}
      />

      <CreditsEditor
        value={content.credits}
        onChange={(v) => update('credits', v)}
      />

      <RecognitionEditor
        value={content.recognition}
        onChange={(v) => update('recognition', v)}
      />

      <EducationEditor
        value={content.education}
        onChange={(v) => update('education', v)}
      />

      {/* Bottom save button */}
      <div className="flex justify-end mt-2 mb-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="font-body text-xs tracking-widest uppercase px-8 py-3 rounded-none transition-colors duration-200"
          style={{ background: 'var(--color-accent)', color: 'white', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
