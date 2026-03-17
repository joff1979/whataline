import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { logout } from '../../api/auth';

const navItems = [
  { to: '/admin/writing',      label: 'Writing'      },
  { to: '/admin/films',        label: 'Films'        },
  { to: '/admin/services',     label: 'Services'     },
  { to: '/admin/testimonials', label: 'Testimonials' },
  { to: '/admin/settings',     label: 'Site Settings'},
];

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-bg-warm-dark)' }}>
      {/* Sidebar */}
      <aside
        className="w-52 flex-shrink-0 flex flex-col"
        style={{ background: 'var(--color-bg-dark)' }}
      >
        <div
          className="font-display text-sm px-5 py-5 border-b"
          style={{ color: 'var(--color-text-inverse)', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          Kat Rollinson Admin
        </div>
        <nav className="flex-1 py-2">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `block px-5 py-2 font-body text-xs tracking-wide transition-colors duration-200 ${
                  isActive
                    ? 'text-[--color-accent]'
                    : 'text-[--color-text-muted] hover:text-[--color-accent]'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="px-5 py-3 font-body text-xs tracking-wide text-left transition-colors duration-200 rounded-none"
          style={{ color: 'var(--color-text-muted)', borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          Sign Out
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
