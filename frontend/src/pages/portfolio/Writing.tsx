import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getWritingProjects } from '../../api/writing';
import type { WritingProject } from '../../api/types';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

// Skeleton card for loading state
function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] bg-stone/20 rounded-none" />
      <div className="mt-3 h-5 bg-stone/20 w-3/4" />
      <div className="mt-2 h-3 bg-stone/10 w-1/2" />
    </div>
  );
}

function AwardPill({ name }: { name: string }) {
  return (
    <span
      className="inline-block font-body text-xs tracking-wide px-3 py-1 rounded-full mr-2 mt-2"
      style={{
        background: 'var(--color-accent-subtle)',
        color: 'var(--color-text-secondary)',
      }}
    >
      {name}
    </span>
  );
}

function PosterCard({ project }: { project: WritingProject }) {
  return (
    <motion.div
      className="cursor-pointer"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Poster image with hover overlay */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'var(--color-bg-warm-dark)' }}
      >
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
                background: 'linear-gradient(160deg, #3D2E22, #7A6E63 60%, #C1603A)',
                color: 'rgba(255,255,255,0.15)',
              }}
            >
              {project.title.charAt(0)}
            </div>
          )}

          {/* Slide-up overlay */}
          <div
            className="absolute inset-0 flex flex-col justify-end p-5 poster-overlay"
            style={{
              background: 'linear-gradient(to top, rgba(26,20,16,0.95) 0%, rgba(26,20,16,0) 60%)',
            }}
          >
            <div
              className="font-display text-xl font-semibold"
              style={{ color: 'var(--color-text-inverse)' }}
            >
              {project.title}
            </div>
            {project.logline && (
              <div
                className="font-display italic text-sm mt-1 mb-3 leading-snug"
                style={{ color: 'rgba(250,247,242,0.75)' }}
              >
                {project.logline}
              </div>
            )}
            <div
              className="font-body text-xs tracking-widest uppercase"
              style={{ color: 'var(--color-accent-light)' }}
            >
              View Project →
            </div>
          </div>
        </div>
      </div>

      {/* Below card */}
      <div className="pt-3">
        <div className="font-display text-lg font-semibold">{project.title}</div>
        {project.awards.map((a) => (
          <AwardPill key={a.id} name={a.name} />
        ))}
      </div>
    </motion.div>
  );
}

export default function Writing() {
  const [projects, setProjects] = useState<WritingProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getWritingProjects()
      .then(setProjects)
      .catch(() => setError('Could not load projects.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="pt-24"
    >
      <style>{`
        .poster-overlay {
          transform: translateY(60%);
          transition: transform 300ms ease-out;
        }
        .cursor-pointer:hover .poster-overlay {
          transform: translateY(0);
        }
        .cursor-pointer:hover img.portfolio {
          filter: none;
          transform: scale(1.03);
        }
        img.portfolio {
          transition: filter 400ms ease, transform 500ms ease;
        }
      `}</style>

      <div className="container mx-auto section">
        <div className="eyebrow">Writing</div>
        <h1 className="font-display text-4xl" style={{ color: 'var(--color-text-primary)' }}>
          My Scripts &amp;<br />Original Work
        </h1>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading && Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}

          {!loading && error && (
            <p className="col-span-3 font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {error}
            </p>
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
