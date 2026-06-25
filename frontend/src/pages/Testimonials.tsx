import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getTestimonials } from '../api/testimonials';
import type { Testimonial } from '../api/types';
import { pageVariants } from '../lib/pageVariants';

function PullQuote({ testimonial }: { testimonial: Testimonial }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-16"
    >
      <div
        className="font-display leading-none mb-4 select-none"
        style={{ fontSize: '5rem', color: 'var(--color-accent)', lineHeight: 1 }}
        aria-hidden="true"
      >
        &ldquo;
      </div>
      <blockquote className="font-display italic text-2xl leading-relaxed space-y-4"
        style={{ color: 'var(--color-text-secondary)' }}>
        {testimonial.quoteText.split('\n').filter(Boolean).map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </blockquote>
      <div className="mt-6">
        <div className="font-body text-xs tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>
          — {testimonial.attributeName}
          {testimonial.attributeTitle && `, ${testimonial.attributeTitle}`}
          {testimonial.organisation && `, ${testimonial.organisation}`}
        </div>
      </div>
    </motion.div>
  );
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTestimonials()
      .then(setTestimonials)
      .catch(() => setError('Could not load testimonials.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.main variants={pageVariants} initial="initial" animate="animate" exit="exit" className="pt-24">
      <div className="container mx-auto" style={{ padding: 'clamp(4rem,8vw,8rem) clamp(1.5rem,5vw,5rem)' }}>
        <div className="eyebrow">Testimonials</div>
        <h1 className="font-display text-4xl mb-16" style={{ color: 'var(--color-text-primary)' }}>
          What People Say
        </h1>

        {loading && (
          <div className="space-y-12 max-w-2xl">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="h-8 bg-stone/20 w-12" />
                <div className="h-5 bg-stone/15 w-full" />
                <div className="h-5 bg-stone/15 w-4/5" />
                <div className="h-3 bg-stone/10 w-1/3 mt-4" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>{error}</p>
        )}

        {!loading && !error && testimonials.length === 0 && (
          <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>No testimonials yet.</p>
        )}

        <div className="max-w-2xl">
          {!loading && testimonials.map((t) => <PullQuote key={t.id} testimonial={t} />)}
        </div>
      </div>
    </motion.main>
  );
}
