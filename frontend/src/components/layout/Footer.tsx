import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSocialLinks } from '../../api/socials';
import type { SocialLink } from '../../api/types';
import SocialIcon from '../ui/SocialIcon';

const footerLinks = [
  { to: '/about',              label: 'About'        },
  { to: '/portfolio/writing',  label: 'Writing'      },
  { to: '/portfolio/films',    label: 'Films'        },
  { to: '/portfolio/services', label: 'Services'     },
  { to: '/testimonials',       label: 'Testimonials' },
  { to: '/contact',            label: 'Contact'      },
];

export default function Footer() {
  const [socials, setSocials] = useState<SocialLink[]>([]);

  useEffect(() => {
    getSocialLinks().then(setSocials).catch(() => setSocials([]));
  }, []);

  return (
    <footer style={{ background: 'var(--color-bg-dark)' }}>
      <div className="container mx-auto px-6 py-14">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          {/* Brand */}
          <div className="max-w-xs">
            <img
              src="/logo.png"
              alt="What A Line"
              className="h-10 w-auto mb-4"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <p className="font-body text-sm font-light leading-relaxed"
              style={{ color: 'rgba(250,247,248,0.6)' }}>
              Screenwriter, filmmaker &amp; script supervisor — crafting engaging,
              character-led stories.
            </p>
          </div>

          {/* Nav columns */}
          <nav className="grid grid-cols-2 gap-x-12 gap-y-3" aria-label="Footer navigation">
            {footerLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="font-body text-xs tracking-[0.18em] uppercase transition-colors duration-200"
                style={{ color: 'rgba(250,247,248,0.7)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-accent-light)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250,247,248,0.7)')}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Socials + copyright */}
        <div
          className="mt-12 pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
          style={{ borderTop: '1px solid rgba(250,247,248,0.12)' }}
        >
          {socials.length > 0 && (
            <div className="flex items-center gap-5">
              {socials.map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label ?? s.platform}
                  className="transition-colors duration-200"
                  style={{ color: 'rgba(250,247,248,0.75)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-accent-light)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250,247,248,0.75)')}
                >
                  {s.iconUrl ? (
                    <img src={s.iconUrl} alt={s.label ?? s.platform} className="w-5 h-5 object-contain"
                      style={{ filter: 'brightness(0) invert(1)', opacity: 0.85 }} />
                  ) : (
                    <SocialIcon platform={s.platform} size={20} />
                  )}
                </a>
              ))}
            </div>
          )}

          <p className="font-body text-[11px] tracking-wide"
            style={{ color: 'rgba(250,247,248,0.4)' }}>
            © {new Date().getFullYear()} Kat Rollinson · What A Line
          </p>
        </div>
      </div>
    </footer>
  );
}
