import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
      {/* Hero — the page's one night-indigo surface, where the firefly glows */}
      <section
        style={{
          background: 'var(--surface-night)',
          color: 'var(--text-on-dark)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-12) var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 'var(--space-5)',
          marginBottom: 'var(--space-10)',
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
          {t('home.title')}
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
            onClick={() => navigate('/feed')}
            style={{
              border: '1px solid transparent',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--amber-300)',
              color: 'var(--indigo-900)',
              padding: '12px 28px',
              fontFamily: 'var(--font-ui)',
              fontSize: 'var(--text-md)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {t('home.viewFeed')}
          </button>
          <button
            type="button"
            onClick={() => navigate(user ? '/memories/new' : '/register')}
            style={{
              border: '1px solid rgba(245, 239, 223, 0.4)',
              borderRadius: 'var(--radius-pill)',
              background: 'transparent',
              color: 'var(--text-on-dark)',
              padding: '12px 28px',
              fontFamily: 'var(--font-ui)',
              fontSize: 'var(--text-md)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {user ? t('nav.newMemory') : t('home.join')}
          </button>
        </div>
      </section>

      <section
        style={{
          display: 'grid',
          gap: 'var(--space-5)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          marginBottom: 'var(--space-8)',
        }}
      >
        {features.map((item) => (
          <div
            key={item.title}
            style={{
              background: 'var(--surface-card)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-card)',
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
                lineHeight: 'var(--leading-normal)',
              }}
            >
              {item.text}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
