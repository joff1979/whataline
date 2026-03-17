import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../../api/auth';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/admin/writing';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch {
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--color-bg-dark)' }}
    >
      <div className="w-full max-w-sm" style={{ background: 'var(--color-bg-elevated)', padding: '2.5rem' }}>
        <h1 className="font-display text-2xl mb-6" style={{ color: 'var(--color-text-primary)' }}>
          Kat Rollinson<br />
          <span className="font-body text-xs tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>
            Admin
          </span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-body text-xs tracking-wide uppercase mb-1"
              style={{ color: 'var(--color-text-muted)' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="w-full border px-3 py-2 font-body text-sm outline-none rounded-none"
              style={{ borderColor: 'var(--color-border-strong)', background: 'white' }}
            />
          </div>
          <div>
            <label className="block font-body text-xs tracking-wide uppercase mb-1"
              style={{ color: 'var(--color-text-muted)' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full border px-3 py-2 font-body text-sm outline-none rounded-none"
              style={{ borderColor: 'var(--color-border-strong)', background: 'white' }}
            />
          </div>

          {error && (
            <p className="font-body text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full font-body text-xs tracking-widest uppercase px-8 py-3 rounded-none transition-colors duration-200"
            style={{ background: 'var(--color-accent)', color: 'white' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
