import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface RequireAuthProps {
  children: React.ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation();
  const { loading, isAuthenticated } = useAuth();

  // While the initial session check is in flight, don't redirect — avoids a
  // flash of the login screen on hard refresh of an admin page.
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--color-bg-dark)' }}
      >
        <p
          className="font-body text-xs tracking-widest uppercase"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Loading…
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
