import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyMemories } from '@/api/memories';
import { Button, MemoryCard, Message } from '@/design-system';
import { useAsyncData } from '@/hooks/useAsyncData';
import { CARD_GRID_STYLE, PAGE_HEADING_STYLE, PAGE_WRAPPER_STYLE, SURFACE_STYLE, getMemoryExcerpt } from '@/pages/pageShared';

type FilterKey = 'all' | 'public' | 'private';

const FILTER_LABELS: Record<FilterKey, string> = {
  all: 'Всі',
  public: 'Публічні',
  private: 'Приватні',
};

export function DashboardPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterKey>('all');

  const fetchMemories = useCallback(
    () =>
      getMyMemories(filter === 'all' ? undefined : { isPublic: filter === 'public' }).then(
        (response) => response.data,
      ),
    [filter],
  );

  const { data, loading, error } = useAsyncData(fetchMemories, 'Не вдалося завантажити ваші спогади.');
  const memories = data ?? [];

  return (
    <div style={PAGE_WRAPPER_STYLE}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 'var(--space-4)',
          flexWrap: 'wrap',
          marginBottom: 'var(--space-6)',
        }}
      >
        <div>
          <h1 style={PAGE_HEADING_STYLE}>Мої світлячки</h1>
          <p
            style={{
              margin: '-var(--space-3) 0 0',
              fontFamily: 'var(--font-ui)',
              color: 'var(--text-secondary)',
            }}
          >
            Керуйте своїми історіями, рецептами та рівнем приватності.
          </p>
        </div>
        <Button onClick={() => navigate('/memories/new')}>Новий спогад</Button>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
        {(Object.keys(FILTER_LABELS) as FilterKey[]).map((key) => {
          const active = filter === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              style={{
                border: active ? '1px solid transparent' : '1px solid var(--border-default)',
                borderRadius: 'var(--radius-pill)',
                background: active ? 'var(--primary)' : 'var(--bg-surface)',
                color: active ? 'var(--text-on-primary)' : 'var(--text-secondary)',
                padding: 'var(--space-3) var(--space-5)',
                fontFamily: 'var(--font-ui)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {FILTER_LABELS[key]}
            </button>
          );
        })}
      </div>

      {error ? <Message tone="error">{error}</Message> : null}

      {loading ? (
        <div style={SURFACE_STYLE}>Завантажуємо ваші спогади…</div>
      ) : memories.length ? (
        <div style={CARD_GRID_STYLE}>
          {memories.map((memory) => (
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
              privacy={memory.isPublic ? 'public' : 'private'}
              onClick={() => navigate(`/memories/${memory.id}`)}
            />
          ))}
        </div>
      ) : (
        <div style={SURFACE_STYLE}>
          <h2
            style={{
              margin: '0 0 var(--space-3)',
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-primary)',
            }}
          >
            Тут поки тихо
          </h2>
          <p
            style={{
              margin: '0 0 var(--space-5)',
              fontFamily: 'var(--font-ui)',
              color: 'var(--text-secondary)',
              lineHeight: 'var(--lh-body)',
            }}
          >
            Створіть свій перший спогад і вирішіть, чи хочете ділитися ним зі спільнотою.
          </p>
          <Button onClick={() => navigate('/memories/new')}>Створити перший спогад</Button>
        </div>
      )}
    </div>
  );
}

