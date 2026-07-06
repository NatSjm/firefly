import { PAGE_HEADING_STYLE, PAGE_WRAPPER_STYLE, SURFACE_STYLE } from '@/pages/pageShared';

const RULES = [
  'Поважайте одне одного. Ніяких образ, приниження чи цькування.',
  'Публікуйте тільки свої спогади або ті, на публікацію яких ви маєте дозвіл.',
  'Не поширюйте особисті дані інших людей без їхньої згоди.',
  'Ніяких політичних баталій — це місце для дитинства, не для суперечок.',
  'Ніякого спаму, реклами та беззмістовного контенту.',
  'Якщо бачите порушення — скористайтесь кнопкою «Поскаржитися».',
];

export function RulesPage() {
  return (
    <div style={PAGE_WRAPPER_STYLE}>
      <h1 style={PAGE_HEADING_STYLE}>Правила спільноти</h1>
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
          {RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}

