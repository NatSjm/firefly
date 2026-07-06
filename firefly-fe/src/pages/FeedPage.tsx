import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFeed, type FeedResponse } from '@/api/feed';
import { FilterBar, MemoryCard, Message } from '@/design-system';
import { CARD_GRID_STYLE, CITIES, PAGE_HEADING_STYLE, PAGE_WRAPPER_STYLE, SURFACE_STYLE, TOPICS, getErrorMessage, getMemoryExcerpt } from '@/pages/pageShared';

export function FeedPage() {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [topic, setTopic] = useState('');
  const [sort, setSort] = useState<'new' | 'popular'>('new');
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadFeed = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getFeed({
          city: city || undefined,
          topic: topic || undefined,
          sort,
        });

        if (active) {
          setFeed(response.data);
        }
      } catch (loadError) {
        if (active) {
          setError(getErrorMessage(loadError, 'Не вдалося завантажити стрічку.'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadFeed();

    return () => {
      active = false;
    };
  }, [city, sort, topic]);

  return (
    <div style={PAGE_WRAPPER_STYLE}>
      <h1 style={PAGE_HEADING_STYLE}>Стрічка спогадів</h1>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <FilterBar
          city={city}
          onCityChange={(event) => setCity(event.target.value)}
          topic={topic}
          onTopicChange={(event) => setTopic(event.target.value)}
          sort={sort}
          onSortChange={setSort}
          cities={CITIES}
          topics={TOPICS}
        />
      </div>

      {error ? <Message tone="error">{error}</Message> : null}

      {loading ? (
        <div style={SURFACE_STYLE}>Завантажуємо стрічку…</div>
      ) : feed?.items.length ? (
        <>
          <p
            style={{
              margin: '0 0 var(--space-6)',
              fontFamily: 'var(--font-ui)',
              color: 'var(--text-secondary)',
            }}
          >
            Знайдено {feed.total} спогадів
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
        <div style={SURFACE_STYLE}>
          Поки немає публічних спогадів за цими фільтрами. Спробуйте інше місто, тему або спосіб сортування.
        </div>
      )}
    </div>
  );
}

