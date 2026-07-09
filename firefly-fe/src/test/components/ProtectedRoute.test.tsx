import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// @trace FR-SHELL-03, FR-AUTH-05, FR-MOD-03

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="pathname">{location.pathname}</div>;
}

const authMocks = vi.hoisted(() => ({
  user: null as { id: number; name: string; email: string; role: string } | null,
  loading: false,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: authMocks.user,
    loading: authMocks.loading,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
  }),
}));

function renderRoute(adminOnly = false) {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute adminOnly={adminOnly}>
              <div data-testid="content">Захищений контент</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LocationProbe />} />
        <Route path="/" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  // @trace FR-AUTH-05
  it('redirects an unauthenticated user to /login', () => {
    authMocks.user = null;
    renderRoute();

    expect(screen.getByTestId('pathname')).toHaveTextContent('/login');
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  it('renders children for an authenticated regular user on a non-admin route', () => {
    authMocks.user = { id: 1, name: 'Тест', email: 't@t.com', role: 'user' };
    renderRoute();

    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  // @trace FR-MOD-03
  it('redirects a non-admin user away from an adminOnly route to /', () => {
    authMocks.user = { id: 2, name: 'Звичайний', email: 'u@u.com', role: 'user' };
    renderRoute(true);

    expect(screen.getByTestId('pathname')).toHaveTextContent('/');
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  // @trace FR-MOD-03
  it('renders children for an admin user on an adminOnly route', () => {
    authMocks.user = { id: 3, name: 'Адмін', email: 'a@a.com', role: 'admin' };
    renderRoute(true);

    expect(screen.getByTestId('content')).toBeInTheDocument();
  });
});
