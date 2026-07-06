import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryDetailPage } from '@/pages/MemoryDetailPage';

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
  user: null as { id: number; name: string; email: string; role: string } | null,
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

// @trace FR-FEED-07, FR-LIKE-01, FR-LIKE-02, FR-COMMENT-01, FR-COMMENT-02

const mockMemory = {
  id: 1,
  userId: 2,
  authorName: 'Олена',
  type: 'story',
  title: 'Перший день у школі',
  text: 'Текст спогаду',
  ingredients: undefined,
  steps: undefined,
  city: 'Київ',
  topicSlug: 'school',
  yearFrom: 1995,
  yearTo: undefined,
  isPublic: true,
  mediaUrls: [],
  likesCount: 5,
  commentsCount: 2,
  likedByMe: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: undefined,
};

const mockComments = [
  {
    id: 1,
    memoryId: 1,
    userId: 3,
    authorName: 'Іван',
    text: 'Чудовий спогад',
    createdAt: '2024-01-02T00:00:00Z',
  },
];

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/memories/1']}>
      <Routes>
        <Route path="/memories/:id" element={<MemoryDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('MemoryDetailPage social features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = null;
    apiMocks.getMemory.mockResolvedValue({ data: mockMemory });
    apiMocks.getComments.mockResolvedValue({ data: mockComments });
  });

  // @trace FR-LIKE-01, FR-LIKE-02
  it('shows the warmth button with current count', async () => {
    renderDetail();

    expect(await screen.findByRole('button', { name: /тепло · 5/i })).toBeInTheDocument();
  });

  // @trace FR-COMMENT-01
  it('shows the comment list', async () => {
    renderDetail();

    expect(await screen.findByText('Чудовий спогад')).toBeInTheDocument();
    expect(screen.getByText('Іван')).toBeInTheDocument();
  });

  // @trace FR-COMMENT-01
  it('shows comment form for authenticated user', async () => {
    authState.user = { id: 3, name: 'Іван', email: 'i@t.com', role: 'user' };

    renderDetail();

    expect(await screen.findByPlaceholderText(/напишіть теплий відгук або доповнення/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /додати коментар/i })).toBeInTheDocument();
  });

  // @trace FR-COMMENT-01, FR-LIKE-01
  it('shows login prompt for unauthenticated user instead of comment form', async () => {
    renderDetail();

    expect(await screen.findByText(/увійдіть, щоб залишити коментар або подарувати тепло/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/напишіть теплий відгук/i)).not.toBeInTheDocument();
  });

  // @trace FR-LIKE-01
  it('disables warmth button for unauthenticated user', async () => {
    renderDetail();

    const warmthButton = await screen.findByRole('button', { name: /тепло/i });
    expect(warmthButton).toBeDisabled();
  });
});
