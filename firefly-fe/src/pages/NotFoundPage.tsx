import { useNavigate } from 'react-router-dom';
import { Button } from '@/design-system';
import { PAGE_WRAPPER_STYLE, SURFACE_STYLE } from '@/pages/pageShared';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={PAGE_WRAPPER_STYLE}>
      <div style={{ ...SURFACE_STYLE, textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
        <h1
          style={{
            margin: '0 0 var(--space-4)',
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-h1)',
            color: 'var(--text-primary)',
          }}
        >
          404
        </h1>
        <p
          style={{
            margin: '0 0 var(--space-6)',
            fontFamily: 'var(--font-ui)',
            color: 'var(--text-secondary)',
            lineHeight: 'var(--lh-body)',
          }}
        >
          Сторінку не знайдено. Можливо, посилання застаріло або сторінку вже перенесено.
        </p>
        <Button onClick={() => navigate('/')}>На головну</Button>
      </div>
    </div>
  );
}

