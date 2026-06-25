import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitContact, type ContactRequest } from '../api/contact';
import { pageVariants } from '../lib/pageVariants';
import { usePageTitle } from '../hooks/usePageTitle';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
});

const inputBase =
  'w-full font-body text-sm px-4 py-3 outline-none transition-colors duration-200 bg-white border focus:border-[--color-accent]';

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function Contact() {
  usePageTitle('Contact');
  const [form, setForm] = useState<ContactRequest>({
    name: '', email: '', subject: '', message: '',
  });
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const set = (field: keyof ContactRequest) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      await submitContact(form);
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setStatus('error');
      setErrorMsg('Something went wrong — please try again or email directly.');
    }
  };

  return (
    <motion.main id="main-content" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <section
        className="pt-32 pb-20 px-6"
        style={{ background: 'var(--color-bg-dark)' }}
      >
        <div className="container mx-auto max-w-2xl">
          <motion.div {...fadeUp(0)} className="eyebrow"
            style={{ color: 'var(--color-accent-light)', opacity: 0.7 }}>
            Contact
          </motion.div>
          <motion.h1
            {...fadeUp(0.1)}
            className="font-display font-light text-5xl md:text-6xl text-[--color-text-inverse] mt-3 leading-tight"
          >
            Let's work<br />together.
          </motion.h1>
          <motion.p
            {...fadeUp(0.2)}
            className="font-body text-base font-light mt-6 leading-relaxed"
            style={{ color: 'rgba(250,247,242,0.7)' }}
          >
            Whether you're looking for a script supervisor, a screenwriter, or a
            collaborator — get in touch and let's talk.
          </motion.p>
        </div>
      </section>

      {/* ── Form ────────────────────────────────────────────────────────────── */}
      <section className="px-6 pt-16 pb-20" style={{ background: 'var(--color-bg-cream)' }}>
        <div className="container mx-auto max-w-2xl">
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-16 text-center space-y-4"
              >
                <div
                  className="text-4xl"
                  style={{ color: 'var(--color-accent)' }}
                >
                  ✓
                </div>
                <h2
                  className="font-display text-2xl font-light"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Message received.
                </h2>
                <p
                  className="font-body text-sm font-light"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Thank you for reaching out — Kat will be in touch soon.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-4 font-body text-xs tracking-widest uppercase underline underline-offset-4"
                  style={{ color: 'var(--color-accent)' }}
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Name + Email row */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="name"
                      className="font-body text-[11px] tracking-[0.18em] uppercase"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      Name <span style={{ color: 'var(--color-accent)' }}>*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={set('name')}
                      placeholder="Your name"
                      className={inputBase}
                      style={{ borderColor: 'rgba(0,64,64,0.2)', color: 'var(--color-text-primary)' }}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="email"
                      className="font-body text-[11px] tracking-[0.18em] uppercase"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      Email <span style={{ color: 'var(--color-accent)' }}>*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={set('email')}
                      placeholder="your@email.com"
                      className={inputBase}
                      style={{ borderColor: 'rgba(0,64,64,0.2)', color: 'var(--color-text-primary)' }}
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="subject"
                    className="font-body text-[11px] tracking-[0.18em] uppercase"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Subject
                  </label>
                  <input
                    id="subject"
                    type="text"
                    value={form.subject ?? ''}
                    onChange={set('subject')}
                    placeholder="What's this about?"
                    className={inputBase}
                    style={{ borderColor: 'rgba(0,64,64,0.2)', color: 'var(--color-text-primary)' }}
                  />
                </div>

                {/* Message */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="message"
                    className="font-body text-[11px] tracking-[0.18em] uppercase"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Message <span style={{ color: 'var(--color-accent)' }}>*</span>
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={7}
                    value={form.message}
                    onChange={set('message')}
                    placeholder="Tell Kat what you have in mind…"
                    className={inputBase + ' resize-none'}
                    style={{ borderColor: 'rgba(0,64,64,0.2)', color: 'var(--color-text-primary)' }}
                  />
                </div>

                {/* Error */}
                {status === 'error' && (
                  <p className="font-body text-sm" style={{ color: '#c0392b' }}>
                    {errorMsg}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="font-body text-xs tracking-widest uppercase px-10 py-3 transition-all duration-200 disabled:opacity-50"
                  style={{
                    background: 'var(--color-accent)',
                    color: 'var(--color-text-inverse)',
                  }}
                >
                  {status === 'sending' ? 'Sending…' : 'Send Message'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>
    </motion.main>
  );
}
