import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { to: '/about',              label: 'About'        },
  { to: '/portfolio/writing',  label: 'Writing'      },
  { to: '/portfolio/films',    label: 'Films'        },
  { to: '/portfolio/services', label: 'Services'     },
  { to: '/testimonials',       label: 'Testimonials' },
  { to: '/contact',            label: 'Contact'      },
];

// Pages that open with a full-width dark hero — nav can be transparent there
const DARK_HERO_ROUTES = ['/', '/about', '/portfolio/writing', '/contact'];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const hasDarkHero = DARK_HERO_ROUTES.includes(location.pathname);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `font-body text-xs tracking-widest uppercase transition-colors duration-200 ${
      isActive
        ? 'text-[--color-accent] underline underline-offset-4'
        : 'text-[--color-text-secondary] hover:text-[--color-accent]'
    }`;

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={
          scrolled || !hasDarkHero
            ? { background: 'rgba(244,238,239,0.95)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(0,64,64,0.08)' }
            : { background: 'transparent' }
        }
      >
        <div className="container mx-auto flex items-center justify-between py-5">
          {/* Logo */}
          <NavLink to="/" aria-label="What A Line — home">
            <img
              src="/logo.png"
              alt="What A Line"
              className="h-10 w-auto transition-all duration-300"
              style={{
                filter: scrolled || !hasDarkHero
                  ? 'none'
                  : 'brightness(0) invert(1)',
                mixBlendMode: scrolled || !hasDarkHero ? 'multiply' : 'normal',
              }}
            />
          </NavLink>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-10" aria-label="Main navigation">
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} className={linkClass}
                style={({ isActive }) =>
                  !isActive && !scrolled && hasDarkHero
                    ? { color: 'rgba(250,247,248,0.8)' }
                    : {}
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-none"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span
              className="block w-5 h-px transition-all duration-300 origin-center"
              style={{
                background: scrolled || !hasDarkHero ? 'var(--color-text-primary)' : 'var(--color-text-inverse)',
                transform: mobileOpen ? 'translateY(5px) rotate(45deg)' : '',
              }}
            />
            <span
              className="block w-5 h-px transition-all duration-300"
              style={{
                background: scrolled || !hasDarkHero ? 'var(--color-text-primary)' : 'var(--color-text-inverse)',
                opacity: mobileOpen ? 0 : 1,
              }}
            />
            <span
              className="block w-5 h-px transition-all duration-300 origin-center"
              style={{
                background: scrolled || !hasDarkHero ? 'var(--color-text-primary)' : 'var(--color-text-inverse)',
                transform: mobileOpen ? 'translateY(-5px) rotate(-45deg)' : '',
              }}
            />
          </button>
        </div>
      </header>

      {/* Mobile fullscreen overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col items-center justify-center"
            style={{ background: 'var(--color-bg-dark)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <nav className="flex flex-col items-center gap-8" aria-label="Mobile navigation">
              {navLinks.map(({ to, label }, i) => (
                <motion.div
                  key={to}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.3 }}
                >
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `font-display text-3xl font-light transition-colors duration-200 ${
                        isActive ? 'text-[--color-accent]' : 'text-[--color-text-inverse] hover:text-[--color-accent]'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
