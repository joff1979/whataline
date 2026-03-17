import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

export default function About() {
  return (
    <motion.main variants={pageVariants} initial="initial" animate="animate" exit="exit"
      className="pt-24"
    >
      <div className="container mx-auto section">
        <div className="eyebrow">About</div>
        <h1 className="font-display text-4xl text-[--color-text-primary]">
          Screenwriter.<br />Filmmaker.<br />Script Supervisor.
        </h1>
        <p className="font-body text-base text-[--color-text-primary] mt-8 max-w-2xl font-light">
          Biography and CV content coming soon.
        </p>
      </div>
    </motion.main>
  );
}
