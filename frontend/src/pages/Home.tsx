import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// ── YouTube IFrame API types ───────────────────────────────────────────────────
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string | HTMLElement,
        options: YTPlayerOptions
      ) => YTPlayer;
      PlayerState: { ENDED: number; PLAYING: number; PAUSED: number; BUFFERING: number };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}
interface YTPlayerOptions {
  videoId: string;
  playerVars?: Record<string, string | number>;
  events?: {
    onReady?: (e: { target: YTPlayer }) => void;
    onStateChange?: (e: { data: number }) => void;
  };
}
interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  mute(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  destroy(): void;
}

const VIDEO_ID  = 'xEwiNa7_mvA';
const CLIP_END  = 30; // loop back after this many seconds

const quickLinks = [
  { to: '/portfolio/writing', label: 'Writing'  },
  { to: '/portfolio/films',   label: 'Films'    },
  { to: '/portfolio/services',label: 'Services' },
  { to: '/contact',           label: 'Contact'  },
];

export default function Home() {
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load the IFrame API script once
    const scriptId = 'yt-iframe-api';
    if (!document.getElementById(scriptId)) {
      const tag = document.createElement('script');
      tag.id  = scriptId;
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }

    const initPlayer = () => {
      if (!containerRef.current) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: VIDEO_ID,
        playerVars: {
          autoplay:       1,
          mute:           1,
          controls:       0,
          disablekb:      1,
          fs:             0,
          iv_load_policy: 3,
          loop:           0,          // we handle the loop manually
          modestbranding: 1,
          rel:            0,
          showinfo:       0,
          start:          0,
          end:            CLIP_END,
          playsinline:    1,
        },
        events: {
          onReady: (e) => {
            e.target.mute();
            e.target.playVideo();
          },
          onStateChange: (e) => {
            // YT.PlayerState.ENDED = 0
            if (e.data === 0) {
              playerRef.current?.seekTo(0, true);
              playerRef.current?.playVideo();
            }
          },
        },
      });
    };

    if (window.YT?.Player) {
      // API already loaded (navigated back to page)
      initPlayer();
    } else {
      // API not ready yet — set the global callback
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prev) prev();
        initPlayer();
      };
    }

    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, []);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.5 } }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      {/* ── Video Hero ──────────────────────────────────────────────────────── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-[#172929]">

        {/* YouTube iframe — stretched & centred, pointer-events off */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          aria-hidden="true"
        >
          {/*
            The iframe needs to be bigger than the viewport so the letterbox
            bars are hidden. We use a 16:9 aspect trick:
            - if viewport is wider  → base on width:  width=100vw, height=56.25vw
            - if viewport is taller → base on height: height=100vh, width=177.78vh
            We apply both and let the larger one win via min constraints.
          */}
          <div
            ref={containerRef}
            className="w-[max(100vw,177.78vh)] h-[max(56.25vw,100vh)]"
            style={{ opacity: 0.7 }}
          />
        </div>

        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, rgba(23,41,41,0.45) 0%, rgba(23,41,41,0.55) 60%, rgba(23,41,41,0.75) 100%)',
          }}
        />

        {/* Hero copy */}
        <div className="relative z-10 text-center px-6 max-w-3xl">
          <motion.h1
            className="font-display font-light text-hero tracking-tight text-[--color-text-inverse] leading-none"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            Kat Rollinson
          </motion.h1>

          <motion.p
            className="font-body text-xs tracking-[0.22em] uppercase text-[rgba(250,247,242,0.7)] mt-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            Screenwriter&nbsp;&nbsp;/&nbsp;&nbsp;Filmmaker&nbsp;&nbsp;/&nbsp;&nbsp;Script Supervisor
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <Link
              to="/portfolio/writing"
              className="font-body text-xs tracking-widest uppercase px-8 py-3 transition-colors duration-200"
              style={{
                border: '1px solid var(--color-accent-light)',
                color: 'var(--color-accent-light)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'var(--color-accent-light)';
                (e.currentTarget as HTMLAnchorElement).style.color     = 'var(--color-bg-dark)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                (e.currentTarget as HTMLAnchorElement).style.color     = 'var(--color-accent-light)';
              }}
            >
              Explore My Work
            </Link>
            <Link
              to="/contact"
              className="font-body text-xs tracking-widest uppercase px-8 py-3 transition-colors duration-200 text-[rgba(250,247,242,0.6)] hover:text-[rgba(250,247,242,0.9)]"
            >
              Get in Touch →
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          <span className="font-body text-[10px] tracking-[0.2em] uppercase text-[rgba(250,247,242,0.4)]">
            Scroll
          </span>
          <motion.div
            className="w-px h-10 origin-top"
            style={{ background: 'rgba(250,247,242,0.3)' }}
            animate={{ scaleY: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          />
        </motion.div>
      </section>

      {/* ── Quick-nav strip ─────────────────────────────────────────────────── */}
      <section
        className="py-16 px-6"
        style={{ background: 'var(--color-bg-cream)' }}
      >
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {quickLinks.map(({ to, label }, i) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                to={to}
                className="group flex flex-col items-center gap-3 text-center"
              >
                <span
                  className="w-12 h-px transition-all duration-300 group-hover:w-16"
                  style={{ background: 'var(--color-accent)' }}
                />
                <span
                  className="font-body text-xs tracking-[0.18em] uppercase transition-colors duration-200"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.main>
  );
}
