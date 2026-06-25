import { useState, type FormEvent } from 'react';
import { changePassword } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';

type Status = 'idle' | 'saving' | 'success' | 'error';

const inputClass =
  'w-full border px-3 py-2 font-body text-sm outline-none rounded-none transition-colors duration-200 focus:border-[--color-accent]';
const inputStyle = { borderColor: 'rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: 'rgba(250,247,242,0.9)' };
const labelClass = 'block font-body text-[11px] tracking-[0.18em] uppercase mb-1.5';
const labelStyle = { color: 'var(--color-text-muted)' };

export default function AdminSettings() {
  const { session } = useAuth();
  const [current, setCurrent]   = useState('');
  const [next, setNext]         = useState('');
  const [confirm, setConfirm]   = useState('');
  const [status, setStatus]     = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (next.length < 8) {
      setErrorMsg('New password must be at least 8 characters.');
      return;
    }
    if (next !== confirm) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    setStatus('saving');
    try {
      await changePassword(current, next);
      setStatus('success');
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (err: unknown) {
      setStatus('error');
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setErrorMsg(msg);
    }
  };

  return (
    <div className="max-w-md">
      <h1 className="font-display text-2xl mb-1" style={{ color: 'var(--color-text-inverse)' }}>
        Settings
      </h1>
      <p className="font-body text-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>
        Manage your admin account.
      </p>

      {/* ── Change password ─────────────────────────────────────────────────── */}
      <section
        className="p-6 rounded-none"
        style={{ background: 'var(--color-bg-elevated)' }}
      >
        <h2
          className="font-display text-lg mb-5"
          style={{ color: 'var(--color-text-inverse)' }}
        >
          Change Password
        </h2>

        {status === 'success' && (
          <div
            className="mb-5 px-4 py-3 font-body text-sm"
            style={{
              background: 'rgba(61,107,94,0.3)',
              border: '1px solid rgba(61,107,94,0.5)',
              color: '#7ecab8',
            }}
          >
            ✓ Password updated successfully.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass} style={labelStyle}>
              Current Password
            </label>
            <input
              type="password"
              required
              value={current}
              onChange={e => setCurrent(e.target.value)}
              className={inputClass}
              style={inputStyle}
              autoComplete="current-password"
            />
          </div>

          <div
            className="pt-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="mb-5">
              <label className={labelClass} style={labelStyle}>
                New Password
              </label>
              <input
                type="password"
                required
                value={next}
                onChange={e => { setNext(e.target.value); setStatus('idle'); }}
                className={inputClass}
                style={inputStyle}
                autoComplete="new-password"
              />
              <p
                className="mt-1 font-body text-[11px]"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Minimum 8 characters.
              </p>
            </div>

            <div>
              <label className={labelClass} style={labelStyle}>
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setStatus('idle'); }}
                className={inputClass}
                style={{
                  ...inputStyle,
                  borderColor:
                    confirm && next && confirm !== next
                      ? '#ef4444'
                      : confirm && next && confirm === next
                      ? 'rgba(61,107,94,0.7)'
                      : inputStyle.borderColor,
                }}
                autoComplete="new-password"
              />
              {confirm && next && confirm !== next && (
                <p className="mt-1 font-body text-[11px]" style={{ color: '#ef4444' }}>
                  Passwords do not match.
                </p>
              )}
            </div>
          </div>

          {errorMsg && status === 'error' && (
            <p
              className="font-body text-sm px-4 py-3"
              style={{
                background: 'rgba(220,38,38,0.15)',
                border: '1px solid rgba(220,38,38,0.3)',
                color: '#fca5a5',
              }}
            >
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'saving'}
            className="font-body text-xs tracking-widest uppercase px-8 py-2.5 transition-all duration-200 disabled:opacity-50"
            style={{ background: 'var(--color-accent)', color: 'white' }}
          >
            {status === 'saving' ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </section>

      {/* ── Account info ────────────────────────────────────────────────────── */}
      <section
        className="mt-4 p-6 rounded-none"
        style={{ background: 'var(--color-bg-elevated)' }}
      >
        <h2
          className="font-display text-lg mb-4"
          style={{ color: 'var(--color-text-inverse)' }}
        >
          Account
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-body text-sm" style={{ color: 'var(--color-text-inverse)' }}>
              Signed in as{' '}
              <span style={{ color: 'var(--color-accent-light)' }}>
                {session?.user.email ?? '…'}
              </span>
            </p>
            <p className="font-body text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Administrator
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
