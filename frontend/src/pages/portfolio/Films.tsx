import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getFilmProjects } from '../../api/films';
import type { FilmProject } from '../../api/types';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] bg-stone/20 rounded-none" />
      <div className="mt-3 h-5 bg-stone/20 w-3/4" />
      <div className="mt-2 h-3 bg-stone/10 w-1/2" />
    </div>
  );
}

function AwardPill({ award }: { award: import('../../api/types').Award }) {
  const label = [award.name, award.category, award.year].filter(Boolean).join(' · ');
  return (
    <span
      className="inline-block font-body text-[10px] tracking-wide px-2 py-0.5 mr-1 mt-1"
      style={{
        background: 'var(--color-accent-subtle)',
        color: 'var(--color-accent)',
        border: '1px solid var(--color-accent-light)',
      }}
    >
      {label}
    </span>
  );
}

function PosterCard({ project }: { project: FilmProject }) {
  const linkUrl = project.filmUrl || project.trailerUrl || null;

  const inner = (
    <motion.div
      className={linkUrl ? 'cursor-pointer' : ''}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative overflow-hidden" style={{ background: 'var(--color-bg-warm-dark)' }}>
        <div className="aspect-[2/3] relative overflow-hidden">
          {project.posterUrl ? (
            <img
              src={project.posterUrl}
              alt={project.title}
              loading="lazy"
              className="portfolio w-full h-full object-cover"
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

          {linkUrl && (
            <div
              className="absolute inset-0 flex flex-col justify-end p-5 poster-overlay"
              style={{ background: 'linear-gradient(to top, rgba(0,64,64,0.95) 0%, rgba(0,64,64,0) 60%)' }}
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
              {project.year && (
                <div className="font-body text-xs mb-1" style={{ color: 'rgba(250,247,242,0.5)' }}>
                  {project.year}
                </div>
              )}
              <div className="font-body text-xs tracking-widest uppercase"
                style={{ color: 'var(--color-accent-light)' }}>
                {project.filmUrl ? 'Watch Film →' : 'Watch Trailer →'}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-3">
        <div className="font-display text-lg font-semibold">{project.title}</div>
        {(project.format || project.year) && (
          <div className="font-body text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {[project.format, project.year].filter(Boolean).join(' · ')}
          </div>
        )}
        {project.awards.map((a) => <AwardPill key={a.id} award={a} />)}
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

export default function Films() {
  const [projects, setProjects] = useState<FilmProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFilmProjects()
      .then(setProjects)
      .catch(() => setError('Could not load projects.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.main variants={pageVariants} initial="initial" animate="animate" exit="exit" className="pt-24">
      <style>{`
        .poster-overlay { transform: translateY(60%); transition: transform 300ms ease-out; }
        .cursor-pointer:hover .poster-overlay { transform: translateY(0); }
        .cursor-pointer:hover img.portfolio { filter: none; transform: scale(1.03); }
        img.portfolio { transition: filter 400ms ease, transform 500ms ease; }
      `}</style>

      <div className="container mx-auto" style={{ padding: 'clamp(4rem,8vw,8rem) clamp(1.5rem,5vw,5rem)' }}>
        <div className="eyebrow">Films</div>
        <h1 className="font-display text-4xl" style={{ color: 'var(--color-text-primary)' }}>
          Film &amp;<br />Directorial Work
        </h1>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading && Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}

          {!loading && error && (
            <p className="col-span-3 font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>{error}</p>
          )}

          {!loading && !error && projects.length === 0 && (
            <p className="col-span-3 font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>
              No projects published yet.
            </p>
          )}

          {!loading && projects.map((p) => <PosterCard key={p.id} project={p} />)}
        </div>
      </div>
    </motion.main>
  );
}
