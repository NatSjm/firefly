import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getFeed } from '@/api/feed';
import { Button, FilterBar, MemoryCard, Message } from '@/design-system';
import { useAsyncData } from '@/hooks/useAsyncData';
import {
  CARD_GRID_STYLE,
  EMPTY_STATE_STYLE,
  PAGE_HEADING_STYLE,
  PAGE_WRAPPER_STYLE,
  SURFACE_STYLE,
  formatYears,
  getCities,
  getMemoryExcerpt,
  getTopics,
  toPhotoUrl,
} from '@/pages/pageShared';

export function FeedPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [topic, setTopic] = useState('');
  const [sort, setSort] = useState<'new' | 'popular'>('new');
  const [page, setPage] = useState(0);

  const fetchFeed = useCallback(
    (signal: AbortSignal) =>
      getFeed(
        {
          city: city || undefined,
          topic: topic || undefined,
          sort,
          page,
        },
        signal,
      ).then((response) => response.data),
    [city, sort, topic, page],
  );

  const { data: feed, loading, error } = useAsyncData(fetchFeed, t('feed.error'));

  const handleFilterChange = (apply: () => void) => {
    setPage(0);
    apply();
  };

  return (
    <div style={PAGE_WRAPPER_STYLE}>
      <h1 style={{ ...PAGE_HEADING_STYLE, margin: '0 0 var(--space-2)' }}>{t('feed.title')}</h1>
      <p style={{ margin: '0 0 var(--space-6)', fontFamily: 'var(--font-ui)', color: 'var(--text-secondary)' }}>
        {t('feed.subtitle')}
      </p>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <FilterBar
          city={city}
          onCityChange={(event) => handleFilterChange(() => setCity(event.target.value))}
          topic={topic}
          onTopicChange={(event) => handleFilterChange(() => setTopic(event.target.value))}
          sort={sort}
          onSortChange={(value) => handleFilterChange(() => setSort(value))}
          cities={getCities()}
          topics={getTopics()}
        />
      </div>

      {error ? <Message tone="error">{error}</Message> : null}

      {loading ? (
        <div style={SURFACE_STYLE}>{t('feed.loading')}</div>
      ) : feed?.items.length ? (
        <>
          <p
            style={{
              margin: '0 0 var(--space-6)',
              fontFamily: 'var(--font-ui)',
              color: 'var(--text-secondary)',
            }}
          >
            {t('feed.found', { total: feed.total })}
          </p>
          <div style={CARD_GRID_STYLE}>
            {feed.items.map((memory) => (
              <MemoryCard
                key={memory.id}
                title={memory.title}
                excerpt={getMemoryExcerpt(memory.text)}
                author={memory.authorName}
                city={memory.city}
                topic={memory.topicSlug}
                photo={memory.mediaUrls.length > 0}
                photoUrl={memory.mediaUrls[0] ? toPhotoUrl(memory.mediaUrls[0]) : undefined}
                years={formatYears(memory.yearFrom, memory.yearTo)}
                kind={memory.type}
                warmth={memory.likesCount}
                comments={memory.commentsCount}
                onClick={() => navigate(`/memories/${memory.id}`)}
              />
            ))}
          </div>
          {feed.totalPages > 1 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-4)',
                marginTop: 'var(--space-6)',
              }}
            >
              <Button
                variant="ghost"
                disabled={feed.page <= 0}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
              >
                {t('feed.prevPage')}
              </Button>
              <span style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-secondary)' }}>
                {t('feed.pageIndicator', { page: feed.page + 1, totalPages: feed.totalPages })}
              </span>
              <Button
                variant="ghost"
                disabled={feed.page >= feed.totalPages - 1}
                onClick={() => setPage((current) => current + 1)}
              >
                {t('feed.nextPage')}
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <div style={EMPTY_STATE_STYLE}>{t('feed.empty')}</div>
      )}
    </div>
  );
}
