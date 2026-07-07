import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLostRequests } from '@/api/lost';
import { Button, FilterBar, LostRequestCard, Message } from '@/design-system';
import { useAuth } from '@/contexts/AuthContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import {
  CARD_GRID_STYLE,
  CITIES,
  LOST_TYPE_FILTER_OPTIONS,
  LOST_TYPE_VALUE_BY_LABEL,
  PAGE_HEADING_STYLE,
  PAGE_WRAPPER_STYLE,
  SURFACE_STYLE,
  formatDate,
  getMemoryExcerpt,
} from '@/pages/pageShared';

export function LostPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [city, setCity] = useState('');
  const [type, setType] = useState('');

  const fetchRequests = useCallback(
    () =>
      getLostRequests({
        city: city || undefined,
        type: type ? LOST_TYPE_VALUE_BY_LABEL[type] : undefined,
      }).then((response) => response.data),
    [city, type],
  );

  const { data, loading, error } = useAsyncData(fetchRequests, 'Не вдалося завантажити запити.');
  const requests = data ?? [];

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
          <h1 style={PAGE_HEADING_STYLE}>Загублені світлячки</h1>
          <p style={{ margin: '-var(--space-3) 0 0', fontFamily: 'var(--font-ui)', color: 'var(--text-secondary)' }}>
            Місце для пошуку шкільних, дворових і табірних фото та відео.
          </p>
        </div>
        <Button variant={user ? 'primary' : 'secondary'} onClick={() => navigate(user ? '/lost/new' : '/login')}>
          {user ? 'Залишити запит' : 'Увійти, щоб залишити запит'}
        </Button>
      </div>

      <div style={{ marginBottom: 'var(--space-6)' }}>
        <FilterBar
          city={city}
          onCityChange={(event) => setCity(event.target.value)}
          topic={type}
          onTopicChange={(event) => setType(event.target.value)}
          cities={CITIES}
          topics={LOST_TYPE_FILTER_OPTIONS}
          showSort={false}
        />
      </div>

      {error ? <Message tone="error">{error}</Message> : null}

      {loading ? (
        <div style={SURFACE_STYLE}>Завантажуємо запити…</div>
      ) : requests.length ? (
        <div style={CARD_GRID_STYLE}>
          {requests.map((request) => (
            <LostRequestCard
              key={request.id}
              city={request.city}
              type={request.type}
              years={request.years}
              description={getMemoryExcerpt(request.description)}
              author={request.authorName}
              date={formatDate(request.createdAt)}
              onClick={() => navigate(`/lost/${request.id}`)}
            />
          ))}
        </div>
      ) : (
        <div style={SURFACE_STYLE}>
          Поки немає запитів за цими фільтрами. Спробуйте інше місто або тип місця.
        </div>
      )}
    </div>
  );
}

