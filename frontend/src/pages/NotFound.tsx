import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageVariants } from '../lib/pageVariants';
import { usePageTitle } from '../hooks/usePageTitle';

export default function NotFound() {
  usePageTitle('404');
  return (
    <motion.main
      id="main-content"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="pt-24 min-h-screen flex items-center justify-center px-6"
      style={{ background: 'var(--color-bg-cream)' }}
    >
      <div className="text-center">
        <div
          className="font-display text-[8rem] leading-none font-light"
          style={{ color: 'var(--color-accent-light)' }}
        >
          404
        </div>
        <h1
          className="font-display text-2xl font-light mt-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Page not found
        </h1>
        <p
          className="font-body text-sm mt-3"
          style={{ color: 'var(--color-text-muted)' }}
        >
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="inline-block mt-8 font-body text-xs tracking-widest uppercase underline underline-offset-4"
          style={{ color: 'var(--color-accent)' }}
        >
          Back to home
        </Link>
      </div>
    </motion.main>
  );
}
