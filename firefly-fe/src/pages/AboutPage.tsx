import { PAGE_HEADING_STYLE, PAGE_WRAPPER_STYLE, SURFACE_STYLE } from '@/pages/pageShared';

export function AboutPage() {
  const sections = [
    {
      title: 'Що таке Світлячок',
      text: 'Світлячок — це українська спільнота для дорослих, які хочуть зберігати теплі спогади про дитинство, ділитися ними з іншими та повертати втрачені фрагменти сімейної пам’яті.',
    },
    {
      title: 'Для кого цей простір',
      text: 'Для тих, хто хоче записати родинні історії, зібрати улюблені рецепти, зберегти дворові легенди, знайти фото зі школи, табору чи дитсадка та підтримати інших добрим словом.',
    },
    {
      title: 'Що тут можна робити',
      text: 'Створювати приватні та публічні спогади, читати стрічку, дарувати тепло історіям, коментувати, редагувати свій профіль і залишати запити в розділі загублених світлячків.',
    },
  ];

  return (
    <div style={PAGE_WRAPPER_STYLE}>
      <h1 style={PAGE_HEADING_STYLE}>Про проєкт</h1>
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

