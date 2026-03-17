import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

export default function Home() {
  return (
    <motion.main variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {/* Hero — placeholder; full video hero in Phase 2 */}
      <section
        className="relative h-screen flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1A1410 0%, #3D2E22 60%, #251E18 100%)' }}
      >
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(26,20,16,0.3) 0%, rgba(26,20,16,0.65) 100%)' }}
        />
        <div className="relative z-10 text-center px-6">
          <motion.span
            className="font-display font-light text-hero tracking-tight text-[--color-text-inverse] block"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            Kat Rollinson
          </motion.span>
          <motion.span
            className="font-body text-xs tracking-[0.2em] uppercase text-[rgba(250,247,242,0.65)] mt-4 block"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            Screenwriter / Filmmaker / Script Supervisor
          </motion.span>
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <a
              href="/portfolio/writing"
              className="inline-block font-body text-xs tracking-widest uppercase px-8 py-3 border rounded-none transition-colors duration-200"
              style={{ borderColor: 'var(--color-accent-light)', color: 'var(--color-accent-light)' }}
            >
              Explore My Work
            </a>
          </motion.div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[rgba(250,247,242,0.4)] text-xl animate-bounce">
          ↓
        </div>
      </section>
    </motion.main>
  );
}
