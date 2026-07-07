import { useTranslation } from 'react-i18next';
import { PAGE_HEADING_STYLE, PAGE_WRAPPER_STYLE, SURFACE_STYLE } from '@/pages/pageShared';

interface AboutSection {
  title: string;
  text: string;
}

export function AboutPage() {
  const { t } = useTranslation();
  const sections = t('about.sections', { returnObjects: true }) as AboutSection[];

  return (
    <div style={PAGE_WRAPPER_STYLE}>
      <h1 style={PAGE_HEADING_STYLE}>{t('about.title')}</h1>
      <div style={{ display: 'grid', gap: 'var(--space-5)' }}>
        {sections.map((section) => (
          <section key={section.title} style={SURFACE_STYLE}>
            <h2
              style={{
                margin: '0 0 var(--space-4)',
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-h3)',
                color: 'var(--text-primary)',
              }}
            >
              {section.title}
            </h2>
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-ui)',
                fontSize: 'var(--text-body)',
                color: 'var(--text-secondary)',
                lineHeight: 'var(--lh-body)',
              }}
            >
              {section.text}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
