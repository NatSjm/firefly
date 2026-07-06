import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as feedApi from '@/api/feed';
import { FeedPage } from '@/pages/FeedPage';

// @trace FR-FEED-01, FR-FEED-02, FR-FEED-03, FR-FEED-05, FR-FEED-06

vi.mock('@/api/feed');

const mockFeed = vi.mocked(feedApi.getFeed);

function renderFeed() {
  return render(
    <MemoryRouter>
      <FeedPage />
    </MemoryRouter>,
  );
}

const emptyFeedResponse = {
  data: { items: [], total: 0, page: 0, totalPages: 0 },
};

const feedWithOneItem = {
  data: {
    items: [
      {
        id: 1,
        userId: 2,
        authorName: 'Олена',
        type: 'story',
        title: 'Перший день у школі',
        text: 'Довгий текст спогаду про школу...',
        ingredients: undefined,
        steps: undefined,
        city: 'Київ',
        topicSlug: 'school',
        yearFrom: 1995,
        yearTo: undefined,
        isPublic: true,
        mediaUrls: [],
        likesCount: 7,
        commentsCount: 3,
        likedByMe: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: undefined,
      },
    ],
    total: 1,
    page: 0,
    totalPages: 1,
  },
};

describe('FeedPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // @trace FR-FEED-02, FR-FEED-03, FR-FEED-05
  it('renders the filter bar with city, topic, and sort controls', async () => {
    mockFeed.mockResolvedValue(emptyFeedResponse as never);

    renderFeed();

    expect(await screen.findByRole('combobox', { name: 'Місто' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Тема' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Нові' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Популярні' })).toBeInTheDocument();
  });

  // @trace FR-FEED-01, FR-FEED-06, FR-FEED-07
  it('renders memory cards with warmth count and comment count', async () => {
    mockFeed.mockResolvedValue(feedWithOneItem as never);

    renderFeed();

    const cardHeading = await screen.findByRole('heading', { name: 'Перший день у школі' });
    const card = cardHeading.closest('article');
    expect(card).not.toBeNull();
    const scoped = within(card as HTMLElement);
    expect(scoped.getByText('Олена')).toBeInTheDocument();
    expect(scoped.getByText('7')).toBeInTheDocument();
    expect(scoped.getByText('💬 3')).toBeInTheDocument();
  });

  // @trace FR-FEED-01
  it('shows the empty state when there are no memories', async () => {
    mockFeed.mockResolvedValue(emptyFeedResponse as never);

    renderFeed();

    expect(await screen.findByText(/поки немає публічних спогадів за цими фільтрами/i)).toBeInTheDocument();
  });

  // @trace FR-FEED-01
  it('shows an error message when loading fails', async () => {
    mockFeed.mockRejectedValue(new Error('Network error'));

    renderFeed();

    expect(await screen.findByText(/network error/i)).toBeInTheDocument();
  });

  // @trace FR-FEED-06
  it('shows total count of found memories', async () => {
    mockFeed.mockResolvedValue(feedWithOneItem as never);

    renderFeed();

    expect(await screen.findByText('Знайдено 1 спогадів')).toBeInTheDocument();
  });
});
