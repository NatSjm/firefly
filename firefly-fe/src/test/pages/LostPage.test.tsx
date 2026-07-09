import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as lostApi from '@/api/lost';
import { LostPage } from '@/pages/LostPage';

// @trace FR-LOST-01, FR-LOST-03, FR-LOST-04

vi.mock('@/api/lost');

const authState = vi.hoisted(() => ({
  user: null as { id: number; name: string; email: string; role: string } | null,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: authState.user,
    loading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
  }),
}));

const mockGetLostRequests = vi.mocked(lostApi.getLostRequests);

function renderLostPage() {
  return render(
    <MemoryRouter>
      <LostPage />
    </MemoryRouter>,
  );
}

const lostRequestFixture = (overrides: Partial<lostApi.LostRequest> = {}): lostApi.LostRequest => ({
  id: 1,
  userId: 2,
  authorName: 'Марина',
  city: 'Маріуполь',
  type: 'school',
  years: '1998-2003',
  description: 'Шукаю однокласників зі школи №5',
  contactEmail: 'marina@example.com',
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('LostPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = null;
  });

  // @trace FR-LOST-03
  it('renders the filter bar with city and type controls', async () => {
    mockGetLostRequests.mockResolvedValue({ data: [] } as never);

    renderLostPage();

    expect(await screen.findByRole('combobox', { name: 'Місто' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Тема' })).toBeInTheDocument();
  });

  // @trace FR-LOST-04
  it('renders a card with city, type, years, description, author, and date', async () => {
    mockGetLostRequests.mockResolvedValue({ data: [lostRequestFixture()] } as never);

    renderLostPage();

    const description = await screen.findByText('Шукаю однокласників зі школи №5');
    const card = description.closest('article');
    expect(card).not.toBeNull();
    const scoped = within(card as HTMLElement);
    expect(scoped.getByText('Маріуполь')).toBeInTheDocument();
    expect(scoped.getByText('Школа')).toBeInTheDocument();
    expect(scoped.getByText('1998-2003')).toBeInTheDocument();
    expect(scoped.getByText('Марина')).toBeInTheDocument();
  });

  // @trace FR-LOST-04
  it('omits the years badge/text when years is not provided', async () => {
    mockGetLostRequests.mockResolvedValue({ data: [lostRequestFixture({ years: undefined })] } as never);

    renderLostPage();

    const description = await screen.findByText('Шукаю однокласників зі школи №5');
    const card = description.closest('article');
    expect(within(card as HTMLElement).queryByText('1998-2003')).not.toBeInTheDocument();
  });

  // @trace FR-LOST-01, FR-LOST-03
  it('shows the empty state when there are no matching requests', async () => {
    mockGetLostRequests.mockResolvedValue({ data: [] } as never);

    renderLostPage();

    expect(
      await screen.findByText(/поки немає запитів за цими фільтрами/i),
    ).toBeInTheDocument();
  });

  // @trace FR-LOST-01
  it('shows an error message when loading fails', async () => {
    mockGetLostRequests.mockRejectedValue(new Error('Network error'));

    renderLostPage();

    expect(await screen.findByText(/network error/i)).toBeInTheDocument();
  });

  // @trace FR-LOST-01
  it('shows the sign-in CTA for a signed-out visitor', async () => {
    authState.user = null;
    mockGetLostRequests.mockResolvedValue({ data: [] } as never);

    renderLostPage();

    expect(await screen.findByRole('button', { name: 'Увійти, щоб залишити запит' })).toBeInTheDocument();
  });

  // @trace FR-LOST-02
  it('shows the "leave a request" CTA for a signed-in user', async () => {
    authState.user = { id: 1, name: 'Марина', email: 'marina@example.com', role: 'user' };
    mockGetLostRequests.mockResolvedValue({ data: [] } as never);

    renderLostPage();

    expect(await screen.findByRole('button', { name: 'Залишити запит' })).toBeInTheDocument();
  });

  // @trace FR-LOST-03
  it('re-fetches with the selected city and type filters', async () => {
    const user = userEvent.setup();
    mockGetLostRequests.mockResolvedValue({ data: [] } as never);

    renderLostPage();
    await screen.findByRole('combobox', { name: 'Місто' });

    await user.selectOptions(screen.getByRole('combobox', { name: 'Місто' }), 'Маріуполь');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Тема' }), 'Школа');

    expect(mockGetLostRequests).toHaveBeenLastCalledWith(
      { city: 'Маріуполь', type: 'school' },
      expect.any(AbortSignal),
    );
  });
});
