import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: '64px',
      background: 'rgba(10, 10, 10, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      padding: '0 24px',
      gap: '24px',
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <div style={{
          width: '32px', height: '32px',
          background: 'linear-gradient(135deg, #8b5cf6, #2563eb)',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', fontWeight: '700', color: '#fff',
        }}>G</div>
        <span style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.5px' }}>
          Gen<span style={{ color: 'var(--accent)' }}>TV</span>
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
        <NavLink to="/" active={location.pathname === '/'}>Home</NavLink>
        <NavLink to="/#series" active={false}>Series</NavLink>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {user ? (
          <>
            <Link
              to="/upload"
              style={{
                padding: '7px 16px',
                background: 'var(--accent)',
                color: '#fff',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
            >
              Upload
            </Link>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 12px',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  fontWeight: '500',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{
                  width: '22px', height: '22px',
                  background: 'linear-gradient(135deg, var(--accent), #2563eb)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: '700', color: '#fff',
                }}>
                  {user.username[0].toUpperCase()}
                </div>
                {user.username}
              </button>
              {menuOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  minWidth: '160px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600' }}>{user.username}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{user.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%', textAlign: 'left',
                      padding: '10px 16px',
                      background: 'none', border: 'none',
                      color: 'var(--error)',
                      fontSize: '13px',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link
              to="/login"
              style={{
                padding: '7px 16px',
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              Sign in
            </Link>
            <Link
              to="/register"
              style={{
                padding: '7px 16px',
                background: 'var(--accent)',
                borderRadius: 'var(--radius-sm)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
            >
              Join
            </Link>
          </>
        )}
      </div>

      {/* Close menu on outside click */}
      {menuOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: -1 }}
          onClick={() => setMenuOpen(false)}
        />
      )}
    </nav>
  );
}

function NavLink({ to, children, active }: { to: string; children: React.ReactNode; active: boolean }) {
  return (
    <Link
      to={to}
      style={{
        padding: '6px 12px',
        borderRadius: 'var(--radius-sm)',
        fontSize: '14px',
        fontWeight: active ? '600' : '400',
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        background: active ? 'var(--bg-card)' : 'none',
        transition: 'color 0.15s, background 0.15s',
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.background = 'var(--bg-card)';
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.background = 'none';
        }
      }}
    >
      {children}
    </Link>
  );
}
