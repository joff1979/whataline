import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getAboutContent, type AboutContent } from '../api/about';
import { getFeaturedLaurels } from '../api/laurels';
import type { FeaturedLaurel } from '../api/types';

// Behind-the-scenes gallery (images live in /public/photos)
const galleryPhotos = [
  { src: '/photos/bts-on-set-4.jpg',      caption: 'On set' },
  { src: '/photos/bts-on-set-3.jpg',      caption: 'On location' },
  { src: '/photos/bts-on-set-2.jpg',      caption: 'Behind the scenes' },
  { src: '/photos/bts-on-set.jpg',        caption: 'Script supervision' },
  { src: '/photos/southend-festival.jpg', caption: 'Southend-on-Sea Film Festival' },
  { src: '/photos/bts-screening.jpg',     caption: 'Screening event' },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
});

// Fallback content shown while DB loads (matches what's in the DB on first run)
const FALLBACK: AboutContent = {
  bioParagraphs: [
    'Kat is an award-winning multi-hyphenate filmmaker with experience across Script Supervision, Producing, Screenwriting and Directing, and a passion for crafting engaging stories.',
    'As a screenwriter, Kat specialises in poignant drama and romance, often with a twist of magical realism or a hint of wry humour. Her flair for creating quirky storylines and layered characters has resulted in incredible feedback, acknowledging her masterful storytelling and charming style. Kat laughs, cries and screams right alongside her characters — resulting in authentic, compelling scripts.',
    "Kat's years of Project Management experience outside of the film industry ideally place her to steer through the complexity of all phases of production with a unique blend of collaboration, structure, creativity and empathy — and she often gets invited back.",
  ],
  pullQuotes: [
    { text: 'Kat is the breath of fresh air you never expect to find, but always welcome, amongst the chaos of film and TV production.', attr: 'Director, rocking horse media' },
    { text: "If Kat was on Trip Advisor, I'd be giving her 5 stars!", attr: 'Producer' },
  ],
  credits: [
    {
      role: 'Script Supervisor',
      items: [
        { title: '"Holly and Ivy"',          company: 'rocking horse media', year: '2025–present' },
        { title: '"Too Soon"',                                                 year: '2025–present' },
        { title: '"Not One Or The Other"',                                     year: '2025' },
        { title: '"Cherry"',                                                   year: '2025' },
        { title: '"Cloud"',                                                    year: '2024' },
        { title: '"Henry House"',            company: 'rocking horse media', year: '2024' },
        { title: '"The Name Has A Price"',                                     year: '2022–2023' },
      ],
    },
    {
      role: 'Writer · Director · Producer',
      items: [
        { title: '"It\'s About Time"',  year: '2025–present' },
        { title: '"Do Unto Yourself"',  year: '2024–2025' },
      ],
    },
    {
      role: 'Screenwriter',
      items: [
        { title: '"Kat N Mouse" (feature rewrite)',    company: '1day edutainment', year: '2025–present' },
        { title: '"The Parent Club" (pilot rewrite)',  company: '1day edutainment', year: '2025–present' },
        { title: '12 original scripts',                company: 'What A Line',      year: '2021–present' },
      ],
    },
    {
      role: 'Producer',
      items: [
        { title: '"A Mind Game" (feature)', company: 'S.H.Y. Films', year: '2025–present' },
        { title: 'Screening Event — 3 short films',      year: '2024–2025' },
        { title: '"Defence Strategy" (co-producer)',     year: '2024' },
      ],
    },
  ],
  recognition: [
    { title: 'Award Winner', body: 'Top Film Awards',                       year: '2023' },
    { title: 'Award Winner', body: 'Indiefare International Film Festival', year: '2023' },
    { title: 'Accolade',     body: 'Creative Screenwriting — "Live Long"',  year: '2023' },
  ],
  education: [
    { school: 'London Film Academy',       course: 'Screenwriting Certificate',           year: '2022' },
    { school: 'Raindance Film School',     course: "Filmmakers' Foundation Certificate",  year: '2023' },
    { school: 'Stage 32',                  course: 'Script Supervision',                  year: '2022–present' },
    { school: 'City Academy',              course: 'Short Film Course',                   year: '2025' },
    { school: 'University of East Anglia', course: 'Introduction to Screenwriting',       year: '2021' },
  ],
};

export default function About() {
  const [content, setContent] = useState<AboutContent>(FALLBACK);
  const [laurels, setLaurels] = useState<FeaturedLaurel[]>([]);

  useEffect(() => {
    getAboutContent().then((data) => {
      // Only replace fallback if DB has real content
      if (data.bioParagraphs.length > 0 || data.credits.length > 0) {
        setContent(data);
      }
    });
    getFeaturedLaurels().then(setLaurels).catch(() => setLaurels([]));
  }, []);

  const { bioParagraphs, pullQuotes, credits, recognition, education } = content;

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.4 } }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6" style={{ background: 'var(--color-bg-dark)' }}>
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-[auto_1fr] gap-10 md:gap-14 items-start">
            {/* Profile photo — left column */}
            <motion.div
              {...fadeUp(0.1)}
              className="w-44 sm:w-52 md:w-60 flex-shrink-0 mx-auto md:mx-0"
            >
              <img
                src="/photos/profile.jpg"
                alt="Kat Rollinson"
                className="w-full aspect-[3/4] object-cover"
                style={{ border: '1px solid rgba(250,247,248,0.15)' }}
              />
            </motion.div>

            {/* Text column — right */}
            <div>
              <motion.div {...fadeUp(0)} className="eyebrow" style={{ color: 'rgba(250,247,248,0.55)' }}>
                About
              </motion.div>
              <motion.h1
                {...fadeUp(0.1)}
                className="font-display font-light text-5xl md:text-6xl text-[--color-text-inverse] mt-3 leading-tight"
              >
                Multi-hyphenate<br />filmmaker.
              </motion.h1>

              {bioParagraphs.length > 0 && (
                <motion.div {...fadeUp(0.25)} className="mt-6 space-y-4">
                  {bioParagraphs.map((p, i) => (
                    <p key={i} className="font-body text-base font-light leading-relaxed"
                      style={{ color: 'rgba(250,247,242,0.8)' }}>
                      {p}
                    </p>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pull quotes ─────────────────────────────────────────────────────── */}
      {pullQuotes.length > 0 && (
        <section className="py-16 px-6" style={{ background: 'var(--color-accent)' }}>
          <div className="container mx-auto max-w-4xl grid md:grid-cols-2 gap-10">
            {pullQuotes.map(({ text, attr }, i) => (
              <motion.blockquote key={i} {...fadeUp(i * 0.15)} className="flex flex-col gap-4">
                <span
                  className="font-display text-3xl leading-none"
                  style={{ color: 'rgba(250,247,242,0.25)' }}
                  aria-hidden
                >
                  "
                </span>
                <p className="font-body text-base font-light italic leading-relaxed -mt-4"
                  style={{ color: 'var(--color-text-inverse)' }}>
                  {text}
                </p>
                <footer className="font-body text-[11px] tracking-[0.18em] uppercase"
                  style={{ color: 'rgba(250,247,242,0.6)' }}>
                  — {attr}
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </section>
      )}

      {/* ── Selected credits ────────────────────────────────────────────────── */}
      {credits.length > 0 && (
        <section className="section px-6" style={{ background: 'var(--color-bg-cream)' }}>
          <div className="container mx-auto max-w-4xl">
            <motion.div {...fadeUp(0)} className="eyebrow">Selected Credits</motion.div>
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {credits.map(({ role, items }, ci) => (
                <motion.div key={role} {...fadeUp(ci * 0.08)}>
                  <h3
                    className="font-body text-[11px] tracking-[0.18em] uppercase pb-3 mb-4"
                    style={{ color: 'var(--color-accent)', borderBottom: '1px solid var(--color-accent)' }}
                  >
                    {role}
                  </h3>
                  <ul className="space-y-3">
                    {items.map(({ title, company, year }, ii) => (
                      <li key={ii} className="flex flex-col gap-0.5">
                        <span className="font-body text-sm font-normal"
                          style={{ color: 'var(--color-text-primary)' }}>
                          {title}
                        </span>
                        {company && (
                          <span className="font-body text-[11px]"
                            style={{ color: 'var(--color-text-secondary)' }}>
                            {company}
                          </span>
                        )}
                        {year && (
                          <span className="font-body text-[11px]"
                            style={{ color: 'var(--color-text-secondary)', opacity: 0.7 }}>
                            {year}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Recognition ─────────────────────────────────────────────────────── */}
      {/* Driven by laurels flagged "Feature on About page" in Films/Writing.   */}
      {/* Falls back to the manually-entered recognition list if none exist.    */}
      {(laurels.length > 0 || recognition.length > 0) && (
        <section className="py-16 px-6" style={{ background: 'var(--color-bg-dark)' }}>
          <div className="container mx-auto max-w-4xl">
            <motion.div {...fadeUp(0)} className="eyebrow" style={{ color: 'rgba(250,247,248,0.55)' }}>
              {laurels.length > 0 ? 'Awards & Laurels' : 'Recognition'}
            </motion.div>

            {laurels.length > 0 ? (
              <div className="mt-10 flex flex-wrap items-end gap-x-10 gap-y-8">
                {laurels.map((l, i) => {
                  const sub = [l.category, l.year].filter(Boolean).join(' · ');
                  return (
                    <motion.div key={l.id} {...fadeUp(i * 0.08)} className="flex flex-col items-center text-center gap-3">
                      {l.laurelUrl ? (
                        <img src={l.laurelUrl} alt={l.name} className="h-24 w-auto object-contain invert" />
                      ) : (
                        <div className="flex flex-col gap-1 px-6 py-3"
                          style={{ border: '1px solid rgba(250,247,248,0.25)' }}>
                          <span className="font-display text-lg" style={{ color: 'var(--color-text-inverse)' }}>
                            {l.name}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col gap-0.5 max-w-[12rem]">
                        <span className="font-body text-[11px] tracking-wide"
                          style={{ color: 'rgba(250,247,248,0.85)' }}>
                          {l.name}
                        </span>
                        {sub && (
                          <span className="font-body text-[10px] tracking-wide"
                            style={{ color: 'rgba(250,247,248,0.5)' }}>
                            {sub}
                          </span>
                        )}
                        <span className="font-body text-[10px] italic"
                          style={{ color: 'rgba(201,169,166,0.85)' }}>
                          {l.projectTitle}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-8 grid sm:grid-cols-3 gap-8">
                {recognition.map(({ title, body, year }, i) => (
                  <motion.div key={i} {...fadeUp(i * 0.1)} className="flex flex-col gap-2 pl-4"
                    style={{ borderLeft: '2px solid rgba(250,247,248,0.35)' }}>
                    <span className="font-body text-[10px] tracking-[0.18em] uppercase"
                      style={{ color: 'rgba(250,247,248,0.6)' }}>
                      {title} · {year}
                    </span>
                    <span className="font-body text-sm font-light"
                      style={{ color: 'rgba(250,247,242,0.9)' }}>
                      {body}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Education & Training ─────────────────────────────────────────────── */}
      {education.length > 0 && (
        <section className="section px-6" style={{ background: 'var(--color-bg-cream)' }}>
          <div className="container mx-auto max-w-4xl">
            <motion.div {...fadeUp(0)} className="eyebrow">Education &amp; Training</motion.div>
            <div className="mt-8 divide-y" style={{ borderColor: 'rgba(0,64,64,0.1)' }}>
              {education.map(({ school, course, year }, i) => (
                <motion.div key={i} {...fadeUp(i * 0.07)}
                  className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between py-4 gap-1">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-body text-sm font-normal"
                      style={{ color: 'var(--color-text-primary)' }}>
                      {course}
                    </span>
                    <span className="font-body text-[11px]"
                      style={{ color: 'var(--color-text-secondary)' }}>
                      {school}
                    </span>
                  </div>
                  <span className="font-body text-[11px] tracking-wider"
                    style={{ color: 'var(--color-text-secondary)', opacity: 0.7 }}>
                    {year}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Behind the scenes gallery ───────────────────────────────────────── */}
      <section className="section px-6" style={{ background: 'var(--color-bg-dark)' }}>
        <div className="container mx-auto max-w-4xl">
          <motion.div {...fadeUp(0)} className="eyebrow" style={{ color: 'rgba(250,247,248,0.55)' }}>Behind the Scenes</motion.div>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryPhotos.map((photo, i) => (
              <motion.figure
                key={photo.src}
                {...fadeUp(i * 0.06)}
                className="group relative overflow-hidden"
                style={{ background: 'var(--color-bg-dark)' }}
              >
                <img
                  src={photo.src}
                  alt={photo.caption}
                  loading="lazy"
                  className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <figcaption
                  className="absolute inset-x-0 bottom-0 px-3 py-2 font-body text-[11px] tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    color: 'var(--color-text-inverse)',
                    background: 'linear-gradient(to top, rgba(0,40,40,0.85), rgba(0,40,40,0))',
                  }}
                >
                  {photo.caption}
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 text-center" style={{ background: 'var(--color-bg-cream)' }}>
        <motion.div {...fadeUp(0)} className="space-y-6">
          <p className="font-display text-2xl font-light" style={{ color: 'var(--color-text-primary)' }}>
            Interested in working together?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/contact"
              className="font-body text-xs tracking-widest uppercase px-8 py-3 transition-colors duration-200"
              style={{ background: 'var(--color-accent)', color: 'var(--color-text-inverse)' }}>
              Get in Touch
            </Link>
            <Link to="/portfolio/writing"
              className="font-body text-xs tracking-widest uppercase px-8 py-3 transition-colors duration-200"
              style={{ border: '1px solid var(--color-accent)', color: 'var(--color-accent)' }}>
              View Writing Portfolio
            </Link>
          </div>
        </motion.div>
      </section>
    </motion.main>
  );
}
