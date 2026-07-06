import { useNavigate } from 'react-router-dom';
import { Button } from '@/design-system';
import { useAuth } from '@/contexts/AuthContext';
import { PAGE_WRAPPER_STYLE } from '@/pages/pageShared';

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

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
            Світлячок
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
              Збережи світло свого дитинства
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
              Простір для теплих історій, рецептів, дворів і загублених світлин, які хочеться повернути собі та близьким.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <Button onClick={() => navigate('/feed')}>Переглянути стрічку</Button>
            <Button variant="secondary" onClick={() => navigate(user ? '/memories/new' : '/register')}>
              {user ? 'Новий спогад' : 'Приєднатися'}
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
          {[
            {
              title: 'Пам’ять по темах',
              text: 'Збирайте спогади про музику, рецепти, ігри та міста, що формували дитинство.',
            },
            {
              title: 'Тепла стрічка',
              text: 'Читайте публічні історії інших людей, додавайте коментарі й даруйте тепло.',
            },
            {
              title: 'Загублені світлячки',
              text: 'Залишайте запити на фото й відео, що загубилися.',
            },
          ].map((item) => (
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

