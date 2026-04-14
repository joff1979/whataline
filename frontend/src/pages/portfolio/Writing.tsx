import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getWritingProjects } from '../../api/writing';
import type { WritingProject } from '../../api/types';

// ── Format badge colours ───────────────────────────────────────────────────────
const formatColour: Record<string, string> = {
  feature:  '#B8756A',
  short:    '#5A8080',
  pilot:    '#2D5C5C',
  series:   '#2D5C5C',
  default:  '#5A8080',
};

function formatBg(format: string | null) {
  const key = (format ?? '').toLowerCase();
  return Object.keys(formatColour).find(k => key.includes(k))
    ? formatColour[Object.keys(formatColour).find(k => key.includes(k))!]
    : formatColour.default;
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="animate-pulse py-8 border-b" style={{ borderColor: 'rgba(23,41,41,0.1)' }}>
      <div className="h-3 w-16 rounded-full mb-3" style={{ background: 'rgba(23,41,41,0.12)' }} />
      <div className="h-6 w-1/3 mb-2" style={{ background: 'rgba(23,41,41,0.12)' }} />
      <div className="h-4 w-2/3" style={{ background: 'rgba(23,41,41,0.08)' }} />
    </div>
  );
}

// ── Script card ────────────────────────────────────────────────────────────────
function ScriptCard({ project, index }: { project: WritingProject; index: number }) {

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="py-8 border-b group"
      style={{ borderColor: 'rgba(23,41,41,0.1)' }}
    >
      {/* Top row: format + genre + awards */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {project.format && (
          <span
            className="font-body text-[10px] tracking-[0.2em] uppercase px-2.5 py-1"
            style={{
              background: formatBg(project.format),
              color: 'rgba(250,247,242,0.95)',
            }}
          >
            {project.format}
          </span>
        )}
        {project.genre && (
          <span
            className="font-body text-[10px] tracking-[0.15em] uppercase"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {project.genre}
          </span>
        )}
        {project.featured && (
          <span
            className="font-body text-[10px] tracking-[0.15em] uppercase ml-auto"
            style={{ color: 'var(--color-accent)' }}
          >
            ★ Featured
          </span>
        )}
      </div>

      {/* Title */}
      <h2
        className="font-display text-2xl md:text-3xl font-light mb-3 group-hover:text-[--color-accent] transition-colors duration-200"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {project.title}
      </h2>

      {/* Logline */}
      {project.logline && (
        <p
          className="font-body text-base font-light italic leading-relaxed max-w-3xl"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {project.logline}
        </p>
      )}

      {/* Awards */}
      {project.awards.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {project.awards.map(a => (
            <span
              key={a.id}
              className="font-body text-[11px] tracking-wide px-3 py-1"
              style={{
                background: 'var(--color-accent-subtle)',
                color: 'var(--color-accent)',
                border: '1px solid var(--color-accent-light)',
              }}
            >
              {a.name}{a.year ? ` · ${a.year}` : ''}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      {project.scriptUrl && (
        <div className="mt-4">
          <a
            href={project.scriptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-xs tracking-widest uppercase transition-colors duration-200"
            style={{ color: 'var(--color-accent)', textDecoration: 'underline', textUnderlineOffset: '4px' }}
          >
            Read Script →
          </a>
        </div>
      )}
    </motion.article>
  );
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

  const visible = filter === ALL
    ? projects
    : projects.filter(p => p.format === filter);

  // Featured script(s) at top, rest below
  const featured = visible.filter(p => p.featured);
  const rest     = visible.filter(p => !p.featured);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.4 } }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <section
        className="pt-32 pb-20 px-6"
        style={{ background: 'var(--color-bg-dark)' }}
      >
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="eyebrow"
            style={{ color: 'var(--color-accent-light)', opacity: 0.7 }}
          >
            Writing Portfolio
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display font-light text-5xl md:text-6xl text-[--color-text-inverse] mt-3 leading-tight"
          >
            Scripts &amp;<br />Original Work
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-body text-base font-light mt-6 leading-relaxed max-w-xl"
            style={{ color: 'rgba(250,247,242,0.7)' }}
          >
            Drama, romance and comedy — often a combination — with a twist of
            magical realism and a sprinkle of cheekiness.
          </motion.p>
        </div>
      </section>

      {/* ── Filter pills ────────────────────────────────────────────────────── */}
      {!loading && formats.length > 2 && (
        <section
          className="py-6 px-6 sticky top-[64px] z-30"
          style={{ background: 'rgba(250,247,242,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(23,41,41,0.08)' }}
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
                    : { border: '1px solid rgba(23,41,41,0.2)', color: 'var(--color-text-secondary)' }
                }
              >
                {f}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Script list ─────────────────────────────────────────────────────── */}
      <section className="px-6 pb-24" style={{ background: 'var(--color-bg-cream)' }}>
        <div className="container mx-auto max-w-4xl">

          {loading && (
            <div className="pt-8">
              {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          )}

          {!loading && error && (
            <p className="pt-16 font-body text-sm text-center"
               style={{ color: 'var(--color-text-muted)' }}>
              {error}
            </p>
          )}

          {!loading && !error && visible.length === 0 && (
            <p className="pt-16 font-body text-sm text-center"
               style={{ color: 'var(--color-text-muted)' }}>
              No scripts published yet — check back soon.
            </p>
          )}

          {/* Featured */}
          <AnimatePresence mode="wait">
            {featured.length > 0 && (
              <motion.div
                key={`featured-${filter}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div
                  className="mt-10 mb-2 font-body text-[10px] tracking-[0.2em] uppercase"
                  style={{ color: 'var(--color-accent)' }}
                >
                  Featured
                </div>
                {featured.map((p, i) => (
                  <ScriptCard key={p.id} project={p} index={i} />
                ))}
                {rest.length > 0 && (
                  <div
                    className="mt-10 mb-2 font-body text-[10px] tracking-[0.2em] uppercase"
                    style={{ color: 'var(--color-text-secondary)', opacity: 0.6 }}
                  >
                    More Work
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rest */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`list-${filter}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {rest.map((p, i) => (
                <ScriptCard key={p.id} project={p} index={featured.length + i} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </motion.main>
  );
}
