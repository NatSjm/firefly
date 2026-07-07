import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/design-system';
import { useAuth } from '@/contexts/AuthContext';
import { PAGE_WRAPPER_STYLE } from '@/pages/pageShared';

interface HomeFeature {
  title: string;
  text: string;
}

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const features = t('home.features', { returnObjects: true }) as HomeFeature[];

  return (
    <div style={PAGE_WRAPPER_STYLE}>
      <section
        style={{
          display: 'grid',
          gap: 'var(--space-8)',
          alignItems: 'center',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          marginBottom: 'var(--space-8)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              width: 'fit-content',
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--accent-soft)',
              color: 'var(--accent)',
              fontFamily: 'var(--font-ui)',
              fontSize: 'var(--text-caption)',
              fontWeight: 600,
            }}
          >
            {t('app.name')}
          </span>
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-display)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: '0 0 var(--space-4)',
              }}
            >
              {t('home.title')}
            </h1>
            <p
              style={{
                margin: 0,
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-ui)',
                fontSize: 'var(--text-body)',
                lineHeight: 'var(--lh-body)',
                maxWidth: '56ch',
              }}
            >
              {t('home.subtitle')}
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <Button onClick={() => navigate('/feed')}>{t('home.viewFeed')}</Button>
            <Button variant="secondary" onClick={() => navigate(user ? '/memories/new' : '/register')}>
              {user ? t('nav.newMemory') : t('home.join')}
            </Button>
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
            padding: 'var(--space-6)',
            display: 'grid',
            gap: 'var(--space-4)',
          }}
        >
          {features.map((item) => (
            <div
              key={item.title}
              style={{
                background: 'var(--bg-surface-alt)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-5)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <h2
                style={{
                  margin: '0 0 var(--space-3)',
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--text-h3)',
                  color: 'var(--text-primary)',
                }}
              >
                {item.title}
              </h2>
              <p
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-ui)',
                  color: 'var(--text-secondary)',
                  lineHeight: 'var(--lh-body)',
                }}
              >
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
