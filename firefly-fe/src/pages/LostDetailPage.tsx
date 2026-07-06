import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getLostRequest, type LostRequest } from '@/api/lost';
import { Badge, Button, Message } from '@/design-system';
import { PAGE_WRAPPER_STYLE, SURFACE_STYLE, formatDate, getErrorMessage, getLostTypeLabel } from '@/pages/pageShared';

export function LostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState<LostRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id || Number.isNaN(Number(id))) {
      setError('Некоректний ідентифікатор запиту.');
      setLoading(false);
      return;
    }

    let active = true;

    const loadRequest = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getLostRequest(Number(id));
        if (active) {
          setRequest(response.data);
        }
      } catch (loadError) {
        if (active) {
          setError(getErrorMessage(loadError, 'Не вдалося завантажити запит.'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadRequest();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <div style={PAGE_WRAPPER_STYLE}>Завантажуємо запит…</div>;
  }

  if (error && !request) {
    return (
      <div style={PAGE_WRAPPER_STYLE}>
        <Message tone="error">{error}</Message>
      </div>
    );
  }

  if (!request) {
    return (
      <div style={PAGE_WRAPPER_STYLE}>
        <div style={SURFACE_STYLE}>Запит не знайдено.</div>
      </div>
    );
  }

  return (
    <div style={PAGE_WRAPPER_STYLE}>
      <button
        type="button"
        onClick={() => navigate('/lost')}
        style={{
          border: 'none',
          background: 'none',
          padding: 0,
          marginBottom: 'var(--space-6)',
          fontFamily: 'var(--font-ui)',
          color: 'var(--primary)',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        ← До списку запитів
      </button>

      <div style={SURFACE_STYLE}>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-5)' }}>
          <Badge variant="topic" tone="moss">
            {request.city}
          </Badge>
          <Badge variant="topic" tone="amber">
            {getLostTypeLabel(request.type)}
          </Badge>
          {request.years ? (
            <Badge variant="topic" tone="moss">
              {request.years}
            </Badge>
          ) : null}
        </div>

        <h1
          style={{
            margin: '0 0 var(--space-4)',
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-h1)',
            color: 'var(--text-primary)',
          }}
        >
          Запит на пошук спогадів
        </h1>

        <p style={{ margin: '0 0 var(--space-5)', color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>
          {request.authorName} • {formatDate(request.createdAt)}
        </p>

        <div
          style={{
            whiteSpace: 'pre-wrap',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-ui)',
            lineHeight: 'var(--lh-body)',
            marginBottom: 'var(--space-6)',
          }}
        >
          {request.description}
        </div>

        <section
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: 'var(--space-5)',
            display: 'grid',
            gap: 'var(--space-4)',
          }}
        >
          <div>
            <h2
              style={{
                margin: '0 0 var(--space-2)',
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-h3)',
                color: 'var(--text-primary)',
              }}
            >
              Контакт
            </h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>{request.contactEmail}</p>
          </div>
          <div>
            <Button type="button" onClick={() => (window.location.href = `mailto:${request.contactEmail}`)}>
              Написати автору
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

