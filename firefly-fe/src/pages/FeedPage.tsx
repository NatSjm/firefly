import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getFeed } from '@/api/feed';
import { FilterBar, MemoryCard, Message } from '@/design-system';
import { useAsyncData } from '@/hooks/useAsyncData';
import {
  CARD_GRID_STYLE,
  PAGE_HEADING_STYLE,
  PAGE_WRAPPER_STYLE,
  SURFACE_STYLE,
  getCities,
  getMemoryExcerpt,
  getTopics,
} from '@/pages/pageShared';

export function FeedPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [topic, setTopic] = useState('');
  const [sort, setSort] = useState<'new' | 'popular'>('new');

  const fetchFeed = useCallback(
    (signal: AbortSignal) =>
      getFeed(
        {
          city: city || undefined,
          topic: topic || undefined,
          sort,
        },
        signal,
      ).then((response) => response.data),
    [city, sort, topic],
  );

  const { data: feed, loading, error } = useAsyncData(fetchFeed, t('feed.error'));

  return (
    <div style={PAGE_WRAPPER_STYLE}>
      <h1 style={PAGE_HEADING_STYLE}>{t('feed.title')}</h1>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <FilterBar
          city={city}
          onCityChange={(event) => setCity(event.target.value)}
          topic={topic}
          onTopicChange={(event) => setTopic(event.target.value)}
          sort={sort}
          onSortChange={setSort}
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
                warmth={memory.likesCount}
                comments={memory.commentsCount}
                onClick={() => navigate(`/memories/${memory.id}`)}
              />
            ))}
          </div>
        </>
      ) : (
        <div style={SURFACE_STYLE}>{t('feed.empty')}</div>
      )}
    </div>
  );
}
