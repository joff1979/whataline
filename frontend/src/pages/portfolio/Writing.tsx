import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getWritingProjects } from '../../api/writing';
import type { WritingProject } from '../../api/types';

// ── Format badge colour ────────────────────────────────────────────────────────
const formatColour: Record<string, string> = {
  feature: '#C9A9A6',
  short:   '#008080',
  pilot:   '#005555',
  series:  '#005555',
  default: '#008080',
};
function formatBg(format: string | null) {
  const key = (format ?? '').toLowerCase();
  const match = Object.keys(formatColour).find(k => key.includes(k));
  return match ? formatColour[match] : formatColour.default;
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] rounded-none" style={{ background: 'rgba(0,64,64,0.12)' }} />
      <div className="mt-3 h-5 w-3/4" style={{ background: 'rgba(0,64,64,0.12)' }} />
      <div className="mt-2 h-3 w-1/2" style={{ background: 'rgba(0,64,64,0.08)' }} />
    </div>
  );
}

// ── Poster card ────────────────────────────────────────────────────────────────
function PosterCard({ project }: { project: WritingProject }) {
  const linkUrl = project.scriptUrl ?? null;
  const [imgError, setImgError] = useState(false);

  const inner = (
    <motion.div
      className={linkUrl ? 'cursor-pointer' : ''}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Poster */}
      <div className="relative overflow-hidden" style={{ background: 'var(--color-bg-warm-dark)' }}>
        <div className="aspect-[2/3] relative overflow-hidden">
          {project.posterUrl && !imgError ? (
            <img
              src={project.posterUrl}
              alt={project.title}
              loading="lazy"
              className="portfolio w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center font-display italic text-6xl"
              style={{
                background: 'linear-gradient(160deg, #004040, #008080 60%, #C9A9A6)',
                color: 'rgba(255,255,255,0.15)',
              }}
            >
              {project.title.charAt(0)}
            </div>
          )}

          {/* Hover overlay — only shown when there's a script link */}
          {linkUrl && (
            <div
              className="absolute inset-0 flex flex-col justify-end p-5 poster-overlay"
              style={{ background: 'linear-gradient(to top, rgba(0,40,40,0.95) 0%, rgba(0,40,40,0) 60%)' }}
            >
              <div className="font-display text-xl font-semibold" style={{ color: 'var(--color-text-inverse)' }}>
                {project.title}
              </div>
              {project.logline && (
                <div className="font-display italic text-sm mt-1 mb-3 leading-snug"
                  style={{ color: 'rgba(250,247,242,0.75)' }}>
                  {project.logline}
                </div>
              )}
              <div className="font-body text-xs tracking-widest uppercase"
                style={{ color: 'var(--color-accent-light)' }}>
                Read Script →
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Below poster */}
      <div className="pt-3">
        <div className="font-display text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {project.title}
        </div>

        {/* Format + Genre row */}
        <div className="flex flex-wrap items-center gap-2 mt-1 mb-2">
          {project.format && (
            <span
              className="font-body text-[10px] tracking-[0.2em] uppercase px-2.5 py-1"
              style={{ background: formatBg(project.format), color: 'rgba(250,247,242,0.95)' }}
            >
              {project.format}
            </span>
          )}
          {project.genre && (
            <span className="font-body text-[10px] tracking-[0.15em] uppercase"
              style={{ color: 'var(--color-text-secondary)' }}>
              {project.genre}
            </span>
          )}
          {project.featured && (
            <span className="font-body text-[10px] ml-auto" style={{ color: 'var(--color-accent)' }}>
              ★ Featured
            </span>
          )}
        </div>

        {/* Award laurels / pills */}
        {project.awards.length > 0 && (
          <div className="flex flex-wrap items-end gap-2">
            {project.awards.map(a => {
              const festivalLine = [a.category, a.year].filter(Boolean).join(' · ');
              const fullLabel = [a.name, a.category, a.year].filter(Boolean).join(' · ');
              return a.laurelUrl ? (
                <span key={a.id} className="inline-flex flex-col items-center text-center gap-1">
                  <img
                    src={a.laurelUrl}
                    alt={fullLabel}
                    className="h-12 w-auto object-contain"
                  />
                  {festivalLine && (
                    <span className="font-body text-[9px] tracking-wide leading-tight max-w-[6rem]"
                      style={{ color: 'var(--color-text-muted)' }}>
                      {festivalLine}
                    </span>
                  )}
                </span>
              ) : (
                <span
                  key={a.id}
                  className="font-body text-[10px] tracking-wide px-2 py-0.5"
                  style={{
                    background: 'var(--color-accent-subtle)',
                    color: 'var(--color-accent)',
                    border: '1px solid var(--color-accent-light)',
                  }}
                >
                  {fullLabel}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );

  if (linkUrl) {
    return (
      <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="block no-underline">
        {inner}
      </a>
    );
  }
  return inner;
}

// ── Filters ────────────────────────────────────────────────────────────────────
const ALL = 'All';
function getFormats(projects: WritingProject[]) {
  const seen = new Set<string>();
  projects.forEach(p => { if (p.format) seen.add(p.format); });
  return [ALL, ...Array.from(seen).sort()];
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function Writing() {
  const [projects, setProjects] = useState<WritingProject[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [filter, setFilter]     = useState(ALL);

  useEffect(() => {
    getWritingProjects()
      .then(setProjects)
      .catch(() => setError('Could not load projects.'))
      .finally(() => setLoading(false));
  }, []);

  const formats = getFormats(projects);
  const visible = filter === ALL ? projects : projects.filter(p => p.format === filter);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.4 } }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      <style>{`
        .poster-overlay { transform: translateY(60%); transition: transform 300ms ease-out; }
        .cursor-pointer:hover .poster-overlay { transform: translateY(0); }
        .cursor-pointer:hover img.portfolio { filter: none; transform: scale(1.03); }
        img.portfolio { transition: filter 400ms ease, transform 500ms ease; }
      `}</style>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6" style={{ background: 'var(--color-bg-dark)' }}>
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="eyebrow" style={{ color: 'var(--color-accent-light)', opacity: 0.7 }}
          >
            Writing Portfolio
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display font-light text-5xl md:text-6xl text-[--color-text-inverse] mt-3 leading-tight"
          >
            Scripts &amp;<br />Original Work
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="font-body text-base font-light mt-6 leading-relaxed max-w-xl"
            style={{ color: 'rgba(250,247,242,0.7)' }}
          >
            Drama, romance and comedy — often a combination — with a twist of
            magical realism and a sprinkle of cheekiness.
          </motion.p>
        </div>
      </section>

      {/* ── Format filter pills ──────────────────────────────────────────────── */}
      {!loading && formats.length > 2 && (
        <section
          className="py-6 px-6 sticky top-[64px] z-30"
          style={{ background: 'rgba(250,247,242,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(0,64,64,0.08)' }}
        >
          <div className="container mx-auto flex flex-wrap gap-2">
            {formats.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="font-body text-[11px] tracking-[0.18em] uppercase px-4 py-1.5 transition-all duration-200"
                style={
                  filter === f
                    ? { background: 'var(--color-accent)', color: 'white' }
                    : { border: '1px solid rgba(0,64,64,0.2)', color: 'var(--color-text-secondary)' }
                }
              >
                {f}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Poster grid ──────────────────────────────────────────────────────── */}
      <section className="px-6 pb-24" style={{ background: 'var(--color-bg-cream)' }}>
        <div className="container mx-auto" style={{ padding: 'clamp(3rem,6vw,6rem) clamp(1.5rem,5vw,5rem)' }}>

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {!loading && error && (
            <p className="font-body text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>{error}</p>
          )}

          {!loading && !error && visible.length === 0 && (
            <p className="font-body text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
              No scripts published yet — check back soon.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {visible.map(p => <PosterCard key={p.id} project={p} />)}
          </div>
        </div>
      </section>
    </motion.main>
  );
}
