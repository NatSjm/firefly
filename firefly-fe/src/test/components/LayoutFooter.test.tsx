import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Layout } from '@/components/Layout';

// @trace FR-MOD-05

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
  }),
}));

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="pathname">{location.pathname}</div>;
}

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route
          path="*"
          element={
            <Layout>
              <LocationProbe />
            </Layout>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Layout footer links', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // @trace FR-MOD-05
  it('shows a visible rules link that navigates to /rules', async () => {
    const user = userEvent.setup();
    renderLayout();

    const footer = screen.getByRole('contentinfo');
    await user.click(within(footer).getByText('Правила спільноти'));

    expect(screen.getByTestId('pathname')).toHaveTextContent('/rules');
  });

  // @trace FR-MOD-05
  it('shows a visible report-abuse link that leads to the reporting instructions', async () => {
    const user = userEvent.setup();
    renderLayout();

    const footer = screen.getByRole('contentinfo');
    await user.click(within(footer).getByText('Повідомити про порушення'));

    expect(screen.getByTestId('pathname')).toHaveTextContent('/rules');
  });
});
