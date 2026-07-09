import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getLostRequests } from '@/api/lost';
import { Button, FilterBar, LostRequestCard, Message } from '@/design-system';
import { useAuth } from '@/contexts/AuthContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import {
  CARD_GRID_STYLE,
  PAGE_HEADING_STYLE,
  PAGE_WRAPPER_STYLE,
  SURFACE_STYLE,
  formatDate,
  getCities,
  getLostTypeOptions,
  getMemoryExcerpt,
} from '@/pages/pageShared';

export function LostPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [city, setCity] = useState('');
  const [type, setType] = useState('');

  // FilterBar works with plain labels, so keep a label<->value mapping around.
  const typeOptions = useMemo(() => getLostTypeOptions(), []);
  const typeLabels = useMemo(() => typeOptions.map((option) => option.label), [typeOptions]);
  const typeValueByLabel = useMemo(
    () => Object.fromEntries(typeOptions.map((option) => [option.label, option.value])) as Record<string, string>,
    [typeOptions],
  );

  const fetchRequests = useCallback(
    (signal: AbortSignal) =>
      getLostRequests(
        {
          city: city || undefined,
          type: type ? typeValueByLabel[type] : undefined,
        },
        signal,
      ).then((response) => response.data),
    [city, type, typeValueByLabel],
  );

  const { data, loading, error } = useAsyncData(fetchRequests, t('lost.listError'));
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
          <h1 style={PAGE_HEADING_STYLE}>{t('lost.title')}</h1>
          <p style={{ margin: '-var(--space-3) 0 0', fontFamily: 'var(--font-ui)', color: 'var(--text-secondary)' }}>
            {t('lost.subtitle')}
          </p>
        </div>
        <Button variant={user ? 'primary' : 'secondary'} onClick={() => navigate(user ? '/lost/new' : '/login')}>
          {user ? t('lost.ctaSignedIn') : t('lost.ctaSignedOut')}
        </Button>
      </div>

      <div style={{ marginBottom: 'var(--space-6)' }}>
        <FilterBar
          city={city}
          onCityChange={(event) => setCity(event.target.value)}
          topic={type}
          onTopicChange={(event) => setType(event.target.value)}
          cities={getCities()}
          topics={typeLabels}
          showSort={false}
        />
      </div>

      {error ? <Message tone="error">{error}</Message> : null}

      {loading ? (
        <div style={SURFACE_STYLE}>{t('lost.loading')}</div>
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
        <div style={SURFACE_STYLE}>{t('lost.empty')}</div>
      )}
    </div>
  );
}
