import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MemoryDetailPage } from '@/pages/MemoryDetailPage';
import type { Memory } from '@/api/memories';

const apiMocks = vi.hoisted(() => ({
  getMemory: vi.fn(),
  deleteMemory: vi.fn(),
  getComments: vi.fn(),
  addComment: vi.fn(),
  deleteComment: vi.fn(),
  toggleLike: vi.fn(),
  createReport: vi.fn(),
  adminDeleteComment: vi.fn(),
}));

const authState = vi.hoisted(() => ({
  user: null as { id: number; email: string; name: string; role: string } | null,
}));

vi.mock('@/api/memories', () => ({
  getMemory: apiMocks.getMemory,
  deleteMemory: apiMocks.deleteMemory,
}));

vi.mock('@/api/social', () => ({
  getComments: apiMocks.getComments,
  addComment: apiMocks.addComment,
  deleteComment: apiMocks.deleteComment,
  toggleLike: apiMocks.toggleLike,
  createReport: apiMocks.createReport,
}));

vi.mock('@/api/admin', () => ({
  adminDeleteComment: apiMocks.adminDeleteComment,
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

describe('MemoryDetailPage', () => {
  beforeEach(() => {
    Object.values(apiMocks).forEach((mock) => mock.mockReset());
    apiMocks.getComments.mockResolvedValue({ data: [] });
    apiMocks.getMemory.mockResolvedValue({ data: recipeFixture() });
    authState.user = null;
  });

  // @trace FR-MEM-06
  it('shows the full memory with photo and metadata', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Бабусин борщ' })).toBeInTheDocument();
    expect(screen.getByText('Найсмачніший у світі.')).toBeInTheDocument();
    expect(screen.getByText('Бабусині рецепти')).toBeInTheDocument();
    expect(screen.getByText('Львів')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Бабусин борщ' })).toHaveAttribute('src', '/uploads/borshch.jpg');
  });

  // @trace FR-MEM-01, FR-MEM-06
  it('shows the recipe ingredients and steps sections', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Інгредієнти' })).toBeInTheDocument();
    expect(screen.getByText('буряк, капуста')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Кроки' })).toBeInTheDocument();
    expect(screen.getByText('варити дві години')).toBeInTheDocument();
  });

  // @trace FR-MEM-05
  it('shows edit and delete actions to the owner', async () => {
    authState.user = { id: 7, email: 'olia@example.com', name: 'Оля', role: 'user' };

    renderPage();

    expect(await screen.findByRole('button', { name: 'Редагувати' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Видалити' })).toBeInTheDocument();
  });

  // @trace FR-MEM-05
  it('hides edit and delete actions from other users', async () => {
    authState.user = { id: 99, email: 'inna@example.com', name: 'Інна', role: 'user' };

    renderPage();

    await screen.findByRole('heading', { name: 'Бабусин борщ' });
    expect(screen.queryByRole('button', { name: 'Редагувати' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Поскаржитися' })).toBeInTheDocument();
  });

  // @trace FR-MOD-02
  it('hides the report button from the owner and from signed-out visitors', async () => {
    renderPage();
    await screen.findByRole('heading', { name: 'Бабусин борщ' });
    expect(screen.queryByRole('button', { name: 'Поскаржитися' })).not.toBeInTheDocument();

    authState.user = { id: 7, email: 'olia@example.com', name: 'Оля', role: 'user' };
    renderPage();
    await screen.findAllByRole('heading', { name: 'Бабусин борщ' });
    expect(screen.queryByRole('button', { name: 'Поскаржитися' })).not.toBeInTheDocument();
  });

  // @trace FR-MOD-02
  it('submits a report with the trimmed reason and confirms', async () => {
    const user = userEvent.setup();
    authState.user = { id: 99, email: 'inna@example.com', name: 'Інна', role: 'user' };
    apiMocks.createReport.mockResolvedValue({});

    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Поскаржитися' }));

    const modal = screen.getByRole('heading', { name: 'Поскаржитися на спогад' })
      .parentElement as HTMLElement;
    await user.type(within(modal).getByRole('textbox'), '  Спам  ');
    await user.click(within(modal).getByRole('button', { name: 'Надіслати' }));

    expect(apiMocks.createReport).toHaveBeenCalledWith('memory', 1, 'Спам');
    expect(await screen.findByText('Скаргу надіслано.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Поскаржитися на спогад' })).not.toBeInTheDocument();
  });

  // @trace FR-MOD-02
  it('submits a report without a reason when the field is left blank', async () => {
    const user = userEvent.setup();
    authState.user = { id: 99, email: 'inna@example.com', name: 'Інна', role: 'user' };
    apiMocks.createReport.mockResolvedValue({});

    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Поскаржитися' }));
    const modal = screen.getByRole('heading', { name: 'Поскаржитися на спогад' })
      .parentElement as HTMLElement;
    await user.click(within(modal).getByRole('button', { name: 'Надіслати' }));

    expect(apiMocks.createReport).toHaveBeenCalledWith('memory', 1, undefined);
  });

  // @trace FR-MOD-02
  it('surfaces an error when submitting the report fails', async () => {
    const user = userEvent.setup();
    authState.user = { id: 99, email: 'inna@example.com', name: 'Інна', role: 'user' };
    apiMocks.createReport.mockRejectedValue(new Error('boom'));

    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Поскаржитися' }));
    const modal = screen.getByRole('heading', { name: 'Поскаржитися на спогад' })
      .parentElement as HTMLElement;
    await user.click(within(modal).getByRole('button', { name: 'Надіслати' }));

    expect(await screen.findByText(/boom/i)).toBeInTheDocument();
  });
});

function recipeFixture(overrides: Partial<Memory> = {}): Memory {
  return {
    id: 1,
    userId: 7,
    authorName: 'Оля',
    type: 'recipe',
    title: 'Бабусин борщ',
    text: 'Найсмачніший у світі.',
    ingredients: 'буряк, капуста',
    steps: 'варити дві години',
    city: 'Львів',
    topicSlug: 'Бабусині рецепти',
    yearFrom: 1998,
    yearTo: 2004,
    isPublic: true,
    createdAt: '2026-07-01T10:00:00Z',
    mediaUrls: ['/uploads/borshch.jpg'],
    likesCount: 2,
    commentsCount: 0,
    likedByMe: false,
    ...overrides,
  };
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/memories/1']}>
      <Routes>
        <Route path="/memories/:id" element={<MemoryDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}
