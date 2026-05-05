import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getServices } from '../../api/services';
import type { Service } from '../../api/types';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

function ServiceCard({ service }: { service: Service }) {
  const [samplesOpen, setSamplesOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-6"
      style={{
        background: 'var(--color-bg-elevated)',
        borderLeft: '4px solid var(--color-accent)',
        padding: '2rem',
      }}
    >
      <h2 className="font-display text-2xl mb-3" style={{ color: 'var(--color-text-primary)' }}>
        {service.title}
      </h2>
      <p className="font-body text-base" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.65' }}>
        {service.description}
      </p>

      {service.samples.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setSamplesOpen((v) => !v)}
            className="font-body text-sm tracking-wide rounded-none transition-colors duration-200"
            style={{ color: 'var(--color-accent)' }}
          >
            {samplesOpen ? '− Hide Samples' : '+ View Samples'}
          </button>

          <AnimatePresence>
            {samplesOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-3 border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
                  {service.samples.map((s) => (
                    <div key={s.id} className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="font-body text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {s.title}
                        </div>
                        {s.description && (
                          <div className="font-body text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                            {s.description}
                          </div>
                        )}
                      </div>
                      {s.fileUrl && (
                        <a href={s.fileUrl} target="_blank" rel="noopener noreferrer"
                          className="font-body text-xs tracking-wide uppercase rounded-none flex-shrink-0"
                          style={{ color: 'var(--color-accent)' }}>
                          View →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getServices()
      .then(setServices)
      .catch(() => setError('Could not load services.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.main variants={pageVariants} initial="initial" animate="animate" exit="exit" className="pt-24">
      <div className="container mx-auto" style={{ padding: 'clamp(4rem,8vw,8rem) clamp(1.5rem,5vw,5rem)' }}>
        <div className="eyebrow">Services</div>
        <h1 className="font-display text-4xl mb-12" style={{ color: 'var(--color-text-primary)' }}>
          What I Offer
        </h1>

        <div className="max-w-3xl">
          {loading && (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse h-32"
                  style={{ background: 'var(--color-bg-elevated)', borderLeft: '4px solid var(--color-border)' }} />
              ))}
            </div>
          )}

          {!loading && error && (
            <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>{error}</p>
          )}

          {!loading && !error && services.length === 0 && (
            <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>No services listed yet.</p>
          )}

          {!loading && services.map((s) => <ServiceCard key={s.id} service={s} />)}
        </div>
      </div>
    </motion.main>
  );
}
