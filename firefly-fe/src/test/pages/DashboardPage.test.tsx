import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from '@/pages/DashboardPage';
import type { Memory } from '@/api/memories';

const apiMocks = vi.hoisted(() => ({
  getMyMemories: vi.fn(),
}));

vi.mock('@/api/memories', () => ({
  getMyMemories: apiMocks.getMyMemories,
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    apiMocks.getMyMemories.mockReset();
    apiMocks.getMyMemories.mockResolvedValue({ data: [] });
  });

  // @trace FR-MEM-04
  it('renders the all/public/private filter tabs', async () => {
    renderPage();

    expect(screen.getByRole('button', { name: 'Всі' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Публічні' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Приватні' })).toBeInTheDocument();
    expect(await screen.findByText('Тут поки тихо')).toBeInTheDocument();
  });

  // @trace FR-MEM-04
  it('renders the memories returned by the API', async () => {
    apiMocks.getMyMemories.mockResolvedValue({
      data: [memoryFixture({ id: 1, title: 'Двір на Оболоні' }), memoryFixture({ id: 2, title: 'Бабусин борщ' })],
    });

    renderPage();

    expect(await screen.findByText('Двір на Оболоні')).toBeInTheDocument();
    expect(screen.getByText('Бабусин борщ')).toBeInTheDocument();
  });

  // @trace FR-MEM-04
  it('shows the empty state when there are no memories', async () => {
    renderPage();

    expect(await screen.findByText('Тут поки тихо')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Створити перший спогад' })).toBeInTheDocument();
  });

  // @trace FR-MEM-03, FR-MEM-04
  it('requests only private memories when the private filter is selected', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Тут поки тихо');

    await user.click(screen.getByRole('button', { name: 'Приватні' }));

    expect(apiMocks.getMyMemories).toHaveBeenLastCalledWith({ isPublic: false }, expect.any(AbortSignal));
  });

  // @trace FR-MEM-04
  it('shows an error message when loading fails', async () => {
    apiMocks.getMyMemories.mockRejectedValue(new Error('Мережа недоступна'));

    renderPage();

    expect(await screen.findByText('Мережа недоступна')).toBeInTheDocument();
  });
});

function memoryFixture(overrides: Partial<Memory> = {}): Memory {
  return {
    id: 1,
    userId: 7,
    authorName: 'Оля',
    type: 'story',
    title: 'Спогад',
    text: 'Текст спогаду.',
    isPublic: true,
    createdAt: '2026-07-01T10:00:00Z',
    mediaUrls: [],
    likesCount: 0,
    commentsCount: 0,
    likedByMe: false,
    ...overrides,
  };
}

function renderPage() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
}
