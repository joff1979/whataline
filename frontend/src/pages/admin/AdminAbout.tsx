import { useEffect, useState } from 'react';
import {
  getAboutContent, adminSaveAboutContent,
  type AboutContent, type CreditGroup, type CreditItem,
  type PullQuote, type RecognitionItem, type EducationItem,
} from '../../api/about';

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputCls  = 'w-full border px-3 py-2 font-body text-sm outline-none rounded-none';
const inputSt   = { borderColor: 'var(--color-border-strong)', background: 'white' };
const labelCls  = 'block font-body text-xs tracking-wide uppercase mb-1';
const labelSt   = { color: 'var(--color-text-muted)' };
const addBtnCls = 'font-body text-xs tracking-wide uppercase rounded-none px-3 py-1';
const addBtnSt  = { color: 'var(--color-accent)', border: '1px solid var(--color-accent)' };
const rmBtnCls  = 'font-body text-xs text-red-400 px-2 py-1 rounded-none flex-shrink-0';

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
            className={`${inputCls} resize-none flex-1`}
            style={inputSt}
          />
          <button type="button" onClick={() => remove(i)} className={rmBtnCls}>✕</button>
        </div>
      ))}
      <button type="button" onClick={add} className={addBtnCls} style={addBtnSt}>
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
            <label className={labelCls} style={labelSt}>Quote</label>
            <button type="button" onClick={() => remove(i)} className={rmBtnCls}>✕ Remove</button>
          </div>
          <textarea
            value={q.text}
            onChange={(e) => update(i, 'text', e.target.value)}
            rows={3}
            className={`${inputCls} resize-none mb-3`}
            style={inputSt}
          />
          <label className={labelCls} style={labelSt}>Attribution</label>
          <input
            value={q.attr}
            onChange={(e) => update(i, 'attr', e.target.value)}
            placeholder="e.g. Director, rocking horse media"
            className={inputCls}
            style={inputSt}
          />
        </div>
      ))}
      <button type="button" onClick={add} className={addBtnCls} style={addBtnSt}>
        + Add Quote
      </button>
    </SectionCard>
  );
}

// ── Credits editor ────────────────────────────────────────────────────────────

function CreditItemRow({
  item, onChange, onRemove,
}: { item: CreditItem; onChange: (v: CreditItem) => void; onRemove: () => void }) {
  return (
    <div className="grid grid-cols-[1fr_1fr_5rem_auto] gap-2 items-center mb-2">
      <input value={item.title} onChange={(e) => onChange({ ...item, title: e.target.value })}
        placeholder="Title" className={inputCls} style={inputSt} />
      <input value={item.company ?? ''} onChange={(e) => onChange({ ...item, company: e.target.value || undefined })}
        placeholder="Company (optional)" className={inputCls} style={inputSt} />
      <input value={item.year ?? ''} onChange={(e) => onChange({ ...item, year: e.target.value || undefined })}
        placeholder="Year" className={inputCls} style={inputSt} />
      <button type="button" onClick={onRemove} className={rmBtnCls}>✕</button>
    </div>
  );
}

function CreditsEditor({
  value, onChange,
}: { value: CreditGroup[]; onChange: (v: CreditGroup[]) => void }) {
  const updateGroup = (i: number, g: CreditGroup) =>
    onChange(value.map((v, j) => j === i ? g : v));
  const removeGroup = (i: number) => onChange(value.filter((_, j) => j !== i));
  const addGroup    = () => onChange([...value, { role: '', items: [] }]);

  const updateItem = (gi: number, ii: number, item: CreditItem) =>
    updateGroup(gi, { ...value[gi], items: value[gi].items.map((it, j) => j === ii ? item : it) });
  const removeItem = (gi: number, ii: number) =>
    updateGroup(gi, { ...value[gi], items: value[gi].items.filter((_, j) => j !== ii) });
  const addItem    = (gi: number) =>
    updateGroup(gi, { ...value[gi], items: [...value[gi].items, { title: '' }] });

  return (
    <SectionCard title="Selected Credits">
      {value.map((group, gi) => (
        <div key={gi} className="mb-6 p-4" style={{ background: 'rgba(0,64,64,0.04)', border: '1px solid var(--color-border-strong)' }}>
          <div className="flex items-center gap-3 mb-3">
            <input
              value={group.role}
              onChange={(e) => updateGroup(gi, { ...group, role: e.target.value })}
              placeholder="Role (e.g. Script Supervisor)"
              className="flex-1 border px-3 py-2 font-body text-sm font-medium outline-none rounded-none"
              style={{ ...inputSt, borderColor: 'var(--color-accent)', borderWidth: '1px' }}
            />
            <button type="button" onClick={() => removeGroup(gi)}
              className="font-body text-xs text-red-400 px-3 py-2 rounded-none border border-red-200">
              Remove Role
            </button>
          </div>

          <div className="ml-2">
            <div className="grid grid-cols-[1fr_1fr_5rem_auto] gap-2 mb-1">
              <span className={`${labelCls} !mb-0`} style={labelSt}>Title</span>
              <span className={`${labelCls} !mb-0`} style={labelSt}>Company</span>
              <span className={`${labelCls} !mb-0`} style={labelSt}>Year</span>
              <span />
            </div>
            {group.items.map((item, ii) => (
              <CreditItemRow
                key={ii}
                item={item}
                onChange={(v) => updateItem(gi, ii, v)}
                onRemove={() => removeItem(gi, ii)}
              />
            ))}
            <button type="button" onClick={() => addItem(gi)} className={`${addBtnCls} mt-1`} style={addBtnSt}>
              + Add Credit
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={addGroup} className={addBtnCls} style={addBtnSt}>
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
            placeholder="e.g. Award Winner" className={inputCls} style={inputSt} />
          <input value={r.body} onChange={(e) => update(i, 'body', e.target.value)}
            placeholder="Festival / body" className={inputCls} style={inputSt} />
          <input value={r.year} onChange={(e) => update(i, 'year', e.target.value)}
            placeholder="Year" className={inputCls} style={inputSt} />
          <button type="button" onClick={() => remove(i)} className={rmBtnCls}>✕</button>
        </div>
      ))}
      <button type="button" onClick={add} className={`${addBtnCls} mt-2`} style={addBtnSt}>
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
            placeholder="Course / qualification" className={inputCls} style={inputSt} />
          <input value={e.school} onChange={(ev) => update(i, 'school', ev.target.value)}
            placeholder="School / provider" className={inputCls} style={inputSt} />
          <input value={e.year} onChange={(ev) => update(i, 'year', ev.target.value)}
            placeholder="Year" className={inputCls} style={inputSt} />
          <button type="button" onClick={() => remove(i)} className={rmBtnCls}>✕</button>
        </div>
      ))}
      <button type="button" onClick={add} className={`${addBtnCls} mt-2`} style={addBtnSt}>
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
