import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { deleteMemory, getMyMemories, type Memory } from '@/api/memories';
import { Badge, Button, Message, Modal } from '@/design-system';
import { useAsyncData } from '@/hooks/useAsyncData';
import {
  EMPTY_STATE_STYLE,
  PAGE_HEADING_STYLE,
  PAGE_WRAPPER_STYLE,
  SURFACE_STYLE,
  formatYears,
  getErrorMessage,
} from '@/pages/pageShared';

type FilterKey = 'all' | 'public' | 'private';

const FILTER_KEYS: FilterKey[] = ['all', 'public', 'private'];

export function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [askDelete, setAskDelete] = useState<Memory | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

  const fetchMemories = useCallback(
    (signal: AbortSignal) =>
      getMyMemories(filter === 'all' ? undefined : { isPublic: filter === 'public' }, signal).then(
        (response) => response.data,
      ),
    [filter],
  );

  const { data, setData, loading, error } = useAsyncData(fetchMemories, t('dashboard.error'));
  const memories = data ?? [];

  const handleConfirmDelete = async () => {
    if (!askDelete) return;
    setDeleting(true);
    setActionError('');
    try {
      await deleteMemory(askDelete.id);
      setData((current) => (current ?? []).filter((memory) => memory.id !== askDelete.id));
      setAskDelete(null);
    } catch (deleteError) {
      setActionError(getErrorMessage(deleteError, t('memory.deleteModal.error')));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ ...PAGE_WRAPPER_STYLE, maxWidth: 840 }}>
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
          <h1 style={{ ...PAGE_HEADING_STYLE, margin: 0 }}>{t('dashboard.title')}</h1>
          <p
            style={{
              margin: 'var(--space-1) 0 0',
              fontFamily: 'var(--font-ui)',
              color: 'var(--text-secondary)',
            }}
          >
            {t('dashboard.subtitle')}
          </p>
        </div>
        <Button onClick={() => navigate('/memories/new')}>{t('nav.newMemory')}</Button>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
        {FILTER_KEYS.map((key) => (
          <Button
            key={key}
            size="sm"
            variant={filter === key ? 'secondary' : 'ghost'}
            onClick={() => setFilter(key)}
          >
            {t(`dashboard.filters.${key}`)}
          </Button>
        ))}
      </div>

      {error ? <Message tone="error">{error}</Message> : null}
      {actionError && !askDelete ? (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Message tone="error" onDismiss={() => setActionError('')}>
            {actionError}
          </Message>
        </div>
      ) : null}

      {loading ? (
        <div style={SURFACE_STYLE}>{t('dashboard.loading')}</div>
      ) : memories.length ? (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {memories.map((memory) => {
            const meta = [
              memory.type === 'recipe' ? t('memory.form.recipe') : t('memory.form.story'),
              memory.city,
              formatYears(memory.yearFrom, memory.yearTo),
            ]
              .filter(Boolean)
              .join(' · ');

            return (
              <div
                key={memory.id}
                style={{
                  background: 'var(--surface-card)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-card)',
                  padding: 'var(--space-4) var(--space-5)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4)',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: '1 1 260px', minWidth: 0 }}>
                  <a
                    onClick={() => navigate(`/memories/${memory.id}`)}
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'var(--text-lg)',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      textDecoration: 'none',
                    }}
                  >
                    {memory.title}
                  </a>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
                    {meta}
                  </div>
                </div>
                <Badge variant={memory.isPublic ? 'privacy-public' : 'privacy-private'} />
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/memories/${memory.id}/edit`)}>
                    {t('memory.edit')}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => { setActionError(''); setAskDelete(memory); }}>
                    {t('memory.delete')}
                  </Button>
                </div>
              </div>
            );
          })}
        </section>
      ) : (
        <div style={EMPTY_STATE_STYLE}>
          <h2
            style={{
              margin: '0 0 var(--space-3)',
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-primary)',
            }}
          >
            {t('dashboard.emptyTitle')}
          </h2>
          <p
            style={{
              margin: '0 0 var(--space-5)',
              fontFamily: 'var(--font-ui)',
              color: 'var(--text-secondary)',
              lineHeight: 'var(--leading-normal)',
            }}
          >
            {t('dashboard.emptyText')}
          </p>
          <Button onClick={() => navigate('/memories/new')}>{t('dashboard.createFirst')}</Button>
        </div>
      )}

      <Modal
        open={Boolean(askDelete)}
        title={t('memory.deleteModal.title')}
        onClose={() => setAskDelete(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setAskDelete(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger-solid" disabled={deleting} onClick={handleConfirmDelete}>
              {deleting ? t('memory.deleteModal.deleting') : t('memory.deleteModal.confirm')}
            </Button>
          </>
        }
      >
        {actionError ? (
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <Message tone="error">{actionError}</Message>
          </div>
        ) : null}
        {t('memory.deleteModal.body')}
      </Modal>
    </div>
  );
}
