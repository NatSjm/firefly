import { useTranslation } from 'react-i18next';
import { PAGE_HEADING_STYLE, PAGE_WRAPPER_STYLE, SURFACE_STYLE } from '@/pages/pageShared';

export function RulesPage() {
  const { t } = useTranslation();
  const rules = t('rules.items', { returnObjects: true }) as string[];

  return (
    <div style={PAGE_WRAPPER_STYLE}>
      <h1 style={PAGE_HEADING_STYLE}>{t('rules.title')}</h1>
      <section style={SURFACE_STYLE}>
        <ol
          style={{
            margin: 0,
            paddingLeft: 'var(--space-6)',
            display: 'grid',
            gap: 'var(--space-4)',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-ui)',
            lineHeight: 'var(--lh-body)',
          }}
        >
          {rules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
