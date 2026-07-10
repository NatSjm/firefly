import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getFeed } from '@/api/feed';
import { MemoryCard } from '@/design-system';
import { useAuth } from '@/contexts/AuthContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { formatYears, getMemoryExcerpt, toPhotoUrl } from '@/pages/pageShared';

const heroButtonBase = {
  border: '1px solid transparent',
  borderRadius: 'var(--radius-pill)',
  padding: '12px 28px',
  fontFamily: 'var(--font-ui)',
  fontSize: 'var(--text-md)',
  fontWeight: 700,
  cursor: 'pointer',
} as const;

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchLatest = useCallback(
    (signal: AbortSignal) =>
      getFeed({ sort: 'new', page: 0, size: 3 }, signal).then((response) => response.data),
    [],
  );
  // The teaser section simply hides when the feed is unavailable — the hero
  // and lost-fireflies card must render for anonymous visitors regardless.
  const { data: latest } = useAsyncData(fetchLatest, '');

  return (
    <div>
      {/* Hero — the page's night-indigo surface, where the firefly glows */}
      <section style={{ background: 'var(--surface-night)', color: 'var(--text-on-dark)' }}>
        <div
          style={{
            maxWidth: 'var(--content-max)',
            margin: '0 auto',
            padding: 'var(--space-16) var(--gutter)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 'var(--space-5)',
          }}
        >
          <img src="/design-system/assets/logo-mark-dark.svg" width="84" height="84" alt="" />
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-4xl)',
              fontWeight: 600,
              lineHeight: 'var(--leading-tight)',
              color: 'inherit',
              margin: 0,
            }}
          >
            {t('app.name')}
          </h1>
          <p
            style={{
              margin: 0,
              color: 'rgba(245, 239, 223, 0.8)',
              fontFamily: 'var(--font-ui)',
              fontSize: 'var(--text-lg)',
              lineHeight: 'var(--leading-normal)',
              maxWidth: 560,
            }}
          >
            {t('home.subtitle')}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => navigate(user ? '/memories/new' : '/register')}
              style={{ ...heroButtonBase, background: 'var(--amber-300)', color: 'var(--indigo-900)' }}
            >
              {t('home.createFirst')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/feed')}
              style={{
                ...heroButtonBase,
                border: '1px solid rgba(245, 239, 223, 0.4)',
                background: 'transparent',
                color: 'var(--text-on-dark)',
              }}
            >
              {t('home.viewFeed')}
            </button>
          </div>
        </div>
      </section>

      {/* Latest public memories */}
      {latest?.items.length ? (
        <section style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: 'var(--space-12) var(--gutter) 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 600, color: 'var(--text-primary)' }}>
              {t('home.latest')}
            </h2>
            <a
              onClick={() => navigate('/feed')}
              style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-link)', cursor: 'pointer' }}
            >
              {t('home.allFeed')}
            </a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-5)' }}>
            {latest.items.slice(0, 3).map((memory) => (
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
        </section>
      ) : null}

      {/* Lost fireflies teaser */}
      <section style={{ maxWidth: 'var(--content-max)', margin: 'var(--space-12) auto 0', padding: '0 var(--gutter)' }}>
        <div
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-card)',
            padding: 'var(--space-8)',
            display: 'flex',
            gap: 'var(--space-8)',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: '1 1 380px', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 600, color: 'var(--text-primary)' }}>
              {t('home.lostTeaserTitle')}
            </h2>
            <p style={{ margin: 0, fontFamily: 'var(--font-ui)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-normal)' }}>
              {t('home.lostTeaserText')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/lost')}
            style={{
              ...heroButtonBase,
              background: 'transparent',
              color: 'var(--action-primary)',
              border: '1px solid var(--border-strong)',
            }}
          >
            {t('home.viewRequests')}
          </button>
        </div>
      </section>
    </div>
  );
}
