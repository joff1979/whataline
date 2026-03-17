import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

export default function Testimonials() {
  return (
    <motion.main variants={pageVariants} initial="initial" animate="animate" exit="exit"
      className="pt-24"
    >
      <div className="container mx-auto section">
        <div className="eyebrow">Testimonials</div>
        <h1 className="font-display text-4xl text-[--color-text-primary]">
          What People Say
        </h1>
        <p className="font-body text-base text-[--color-text-muted] mt-4">Coming in Phase 2.</p>
      </div>
    </motion.main>
  );
}
