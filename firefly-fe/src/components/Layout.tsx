import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer, Header, MobileMenu } from '@/design-system';
import { useAuth } from '@/contexts/AuthContext';

const ACCOUNT_LINKS = [
  { key: 'dashboard', label: 'Мої світлячки' },
  { key: 'profile', label: 'Профіль' },
] as const;

export function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigate = (key: string) => {
    setMenuOpen(false);

    const routes = {
      home: '/',
      feed: '/feed',
      lost: '/lost',
      about: '/about',
      rules: '/rules',
      dashboard: '/dashboard',
      create: '/memories/new',
      profile: '/profile',
      admin: '/admin',
    } as const;

    if (key === 'logout') {
      logout();
      navigate('/');
      return;
    }

    const route = routes[key as keyof typeof routes];
    if (route) {
      navigate(route);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)' }}>
      <Header
        loggedIn={Boolean(user)}
        userName={user?.name}
        onNavigate={handleNavigate}
        onLogin={() => navigate('/login')}
        onMenuToggle={() => setMenuOpen(true)}
      />
      <MobileMenu
        open={menuOpen}
        loggedIn={Boolean(user)}
        onNavigate={handleNavigate}
        onClose={() => setMenuOpen(false)}
        onLogin={() => {
          setMenuOpen(false);
          navigate('/login');
        }}
      />
      {user && (
        <div style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
          <div
            style={{
              maxWidth: 'var(--content-max)',
              margin: '0 auto',
              padding: 'var(--space-3) var(--gutter)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-3)',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {ACCOUNT_LINKS.map((link) => (
                <button
                  key={link.key}
                  type="button"
                  onClick={() => handleNavigate(link.key)}
                  style={{
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--bg-page)',
                    color: 'var(--text-secondary)',
                    padding: 'var(--space-2) var(--space-4)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 'var(--text-caption)',
                    cursor: 'pointer',
                  }}
                >
                  {link.label}
                </button>
              ))}
              {user.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => handleNavigate('admin')}
                  style={{
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--bg-page)',
                    color: 'var(--text-secondary)',
                    padding: 'var(--space-2) var(--space-4)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 'var(--text-caption)',
                    cursor: 'pointer',
                  }}
                >
                  Адмін-панель
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleNavigate('logout')}
              style={{
                border: 'none',
                background: 'none',
                color: 'var(--text-link)',
                cursor: 'pointer',
                fontFamily: 'var(--font-ui)',
                fontSize: 'var(--text-caption)',
                fontWeight: 600,
              }}
            >
              Вийти
            </button>
          </div>
        </div>
      )}
      <main style={{ flex: 1 }}>{children}</main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
