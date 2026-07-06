# Design System — Svitlyachok (Світлячок)

Svitlyachok is a Ukrainian-language web community for adults, dedicated to childhood, family, and kindness — a personal memory archive, a cozy community organized by topic and city, and a place to search for childhood photos/videos lost to war or relocation.

The design system lives in `firefly-fe/src/design-system/`. The source ZIP is archived at `docs/Svitlyachok design system.zip`.

---

## Quick start

```tsx
// 1. Import CSS tokens once in main.tsx (already done):
import './design-system/styles.css';

// 2. Import components anywhere:
import { Button, MemoryCard, Header } from './design-system';
```

---

## Directory layout

```
firefly-fe/src/design-system/
├── styles.css              ← global entry point (imports all tokens)
├── index.ts                ← barrel export for all components
├── tokens/
│   ├── fonts.css           ← Google Fonts: Literata + Manrope
│   ├── colors.css          ← full color palette + light/night semantic aliases
│   ├── typography.css      ← font-family, size, weight, line-height tokens
│   ├── spacing.css         ← 4px-base scale + layout constants
│   ├── effects.css         ← radii, shadows, glow, easing, duration
│   └── base.css            ← minimal reset (box-sizing, body, headings, focus)
└── components/
    ├── buttons/Button.tsx
    ├── inputs/Inputs.tsx        (Field, TextInput, Textarea, Select)
    ├── badges/Badge.tsx
    ├── cards/Cards.tsx          (MemoryCard, LostRequestCard)
    ├── navigation/Navigation.tsx (Header, Footer, MobileMenu)
    ├── filters/FilterBar.tsx
    └── feedback/Feedback.tsx    (Message, Modal)

public/design-system/assets/
├── firefly-mark.svg        ← abstract amber glow brand mark
└── placeholder-pattern.svg ← diagonal-stripe SVG for photo placeholders
```

---

## Visual foundations

### Color palette

The palette is built in `oklch()` for perceptual consistency. All accent families share lightness/chroma and vary only by hue.

| Role | Token | Description |
|------|-------|-------------|
| Primary | `--primary` | Amber/gold firefly glow (`--amber-600` in light, `--amber-400` in night) |
| Accent | `--accent` | Muted moss-green — nature, yards, gardens |
| Focus ring | `--focus-ring` | Dusk indigo (`--dusk-500`) |
| Page bg | `--bg-page` | Warm paper-cream (`--neutral-0`) |
| Text | `--text-primary` | Warm charcoal (`--neutral-800`) |

#### Semantic aliases (use these, never raw scale values)

```css
/* Backgrounds */
--bg-page, --bg-surface, --bg-surface-alt, --bg-sunken, --bg-inverse

/* Text */
--text-primary, --text-secondary, --text-tertiary, --text-on-primary, --text-link

/* Borders */
--border-subtle, --border-default, --border-strong

/* Primary actions */
--primary, --primary-hover, --primary-active, --primary-soft, --primary-soft-border

/* Accent */
--accent, --accent-soft, --accent-soft-border

/* Semantic */
--success, --success-strong, --success-bg
--warning, --warning-strong, --warning-bg
--error,   --error-strong,   --error-bg

/* Glow (Warmth action only) */
--glow-color, --shadow-glow-sm, --shadow-glow-md
```

### Night theme

Apply `data-theme="night"` to `<html>` to switch to the dark charcoal-dusk theme. The amber primary becomes brighter so it visually glows — echoing a real firefly. All token names stay the same; only values change.

```tsx
document.documentElement.setAttribute('data-theme', 'night');
document.documentElement.removeAttribute('data-theme'); // back to light
```

### Typography

| Family | Token | Use |
|--------|-------|-----|
| Literata (serif) | `--font-heading`, `--font-display` | Headings, display text |
| Manrope (sans) | `--font-body`, `--font-ui` | Body copy, all UI chrome |

Both fonts are loaded from Google Fonts CDN (`tokens/fonts.css`). Both include full Cyrillic support.

Key size tokens: `--text-display` (56px), `--text-h1` (40px), `--text-h2` (32px), `--text-h3` (24px), `--text-body` (16px), `--text-caption` (13px).

### Spacing

4px base unit. Named by multiplier: `--space-1` (4px) → `--space-32` (128px).

Layout constants: `--content-max: 1200px`, `--content-narrow: 720px`, `--gutter: var(--space-6)`.

### Effects

```css
/* Radii — soft and cozy, nothing sharp */
--radius-sm: 8px  |  --radius-md: 12px  |  --radius-lg: 16px
--radius-xl: 24px  |  --radius-pill: 999px

/* Shadows — warm-tinted, diffuse, low elevation */
--shadow-sm  |  --shadow-md  |  --shadow-lg

/* Animation — calm only */
--ease-standard: cubic-bezier(0.3, 0, 0.2, 1)
--duration-fast: 120ms  |  --duration-base: 200ms  |  --duration-slow: 360ms
```

---

## Components

All components use inline styles bound to CSS custom properties — they adapt automatically to the active theme.

### Button

```tsx
import { Button } from './design-system';

<Button variant="primary">Зберегти спогад</Button>
<Button variant="secondary" size="sm">Скасувати</Button>
<Button variant="ghost">Редагувати</Button>
<Button variant="danger">Видалити</Button>          // outlined warning
<Button variant="danger-solid">Підтвердити</Button> // destructive confirm
<Button disabled>Недоступно</Button>
<Button fullWidth>На всю ширину</Button>
```

Props: `variant`, `size` (`md`|`sm`), `icon` (ReactNode), `disabled`, `fullWidth`, `onClick`, `type`.

### Field + TextInput / Textarea / Select

```tsx
import { Field, TextInput, Textarea, Select } from './design-system';

<Field label="Ім'я" required hint="Ваше справжнє ім'я або псевдонім">
  <TextInput placeholder="Іванка" value={name} onChange={setName} />
</Field>

<Field label="Пароль" error="Пароль надто короткий">
  <TextInput type="password" value={pw} onChange={setPw} error="Пароль надто короткий" />
</Field>

<Field label="Ваш спогад">
  <Textarea placeholder="Розкажіть про дитинство..." rows={6} value={text} onChange={setText} />
</Field>

<Select
  value={city}
  onChange={setCity}
  placeholder="Оберіть місто"
  options={[{ value: 'kyiv', label: 'Київ' }, ...]}
/>
```

### Badge

```tsx
import { Badge } from './design-system';

<Badge variant="topic" tone="amber">Дворові ігри</Badge>
<Badge variant="topic" tone="moss">Київ</Badge>
<Badge variant="privacy-public" />   // "Публічно"
<Badge variant="privacy-private" />  // "Тільки я"
<Badge variant="warmth">42</Badge>   // amber glow dot + count
```

### MemoryCard / LostRequestCard

```tsx
import { MemoryCard, LostRequestCard } from './design-system';

<MemoryCard
  title="Двір на Подолі"
  excerpt="Пам'ятаю, як ми грали у козаки-розбійники до темряви..."
  author="Іванка М."
  city="Київ"
  topic="Дворові ігри"
  warmth={14}
  comments={3}
  photo                  // shows placeholder pattern
  onClick={() => navigate('/memory/1')}
/>

<LostRequestCard
  city="Маріуполь"
  type="school"
  years="1994–2001"
  description="Шукаю фото класу, школа №17..."
  author="Олена В."
  date="3 липня 2026"
  onClick={() => navigate('/lost/5')}
/>
```

LostRequestCard `type` values: `kindergarten` | `school` | `camp` | `yard` | `other`.

### Header / Footer / MobileMenu

```tsx
import { Header, Footer, MobileMenu } from './design-system';

<Header
  loggedIn={isAuth}
  userName={user?.name}
  onNavigate={(key) => navigate(`/${key}`)}
  onLogin={openLoginModal}
  onMenuToggle={() => setMenuOpen(true)}
/>

<Footer onNavigate={(key) => navigate(`/${key}`)} />

<MobileMenu
  open={menuOpen}
  loggedIn={isAuth}
  onNavigate={(key) => navigate(`/${key}`)}
  onClose={() => setMenuOpen(false)}
  onLogin={openLoginModal}
/>
```

### FilterBar

```tsx
import { FilterBar } from './design-system';

<FilterBar
  city={city} onCityChange={(e) => setCity(e.target.value)}
  topic={topic} onTopicChange={(e) => setTopic(e.target.value)}
  sort={sort} onSortChange={setSort}
  cities={['Київ', 'Львів', 'Одеса']}
  topics={['Дворові ігри', 'Бабусині рецепти']}
/>
```

### Message / Modal

```tsx
import { Message, Modal } from './design-system';

<Message tone="success" onDismiss={() => setMsg(null)}>
  Спогад збережено
</Message>
<Message tone="error">Не вдалося зберегти. Спробуйте ще раз.</Message>

<Modal
  open={deleteOpen}
  title="Видалити спогад?"
  onClose={() => setDeleteOpen(false)}
  footer={
    <>
      <Button variant="ghost" onClick={() => setDeleteOpen(false)}>Скасувати</Button>
      <Button variant="danger-solid" onClick={confirmDelete}>Видалити</Button>
    </>
  }
>
  Цю дію не можна скасувати.
</Modal>
```

---

## Brand guidelines

### Tone & copy

- **Language:** Ukrainian only (MVP). No hardcoded English in UI surfaces.
- **Tone:** calm, practical, warm — **no exclamation marks** anywhere in UI copy.
- **Person:** direct second person for CTAs ("Розкажіть про дитинство"), first person plural for community voice ("Ми не женемося за лайками").
- **"Likes" are "Тепло" (Warmth)** — reframed as leaving warmth, not scoring points.
- **Errors are calm and actionable:** "Не вдалося зберегти. Спробуйте ще раз" — never "Error!".
- **Empty states are gentle invitations**, not guilt: "Ще немає жодного спогаду. Почніть із простої історії."
- **No engagement-bait:** never "Не пропустіть", "Приєднуйтесь зараз", streaks, or urgency copy.

### Visual rules

- **Glow effect** (`--shadow-glow-sm/md`) is reserved exclusively for the Warmth badge/button and the brand mark. Never use it on ordinary buttons, cards, or decorative elements.
- **Hover states:** background one step darker within the same token family. Never a hue change.
- **Press state:** `scale(0.98)` only.
- **Disabled state:** 50% opacity + `not-allowed` cursor. No other change.
- **Cards:** hover = deeper shadow + `translateY(-2px)`. No border-color swap or scale-up.
- **Motion:** 120–200ms ease-standard transitions on hover/press only. No bouncing, no auto-playing animation.
- **Borders:** hairline 1px warm-neutral — `--border-subtle` for section dividers, `--border-default` for card/input outlines.
- **Radii:** always at least `--radius-sm` (8px). No sharp (0px) corners anywhere.

### Accessibility

- Contrast target: body text ≥ 4.5:1, large text/UI ≥ 3:1 (WCAG AA).
- Verify any new color pairing before shipping (`NFR-A11Y-02`).
- Focus indicator: `outline: 2px solid var(--focus-ring); outline-offset: 2px` (applied globally via `tokens/base.css`).

### Icons

No icon system is included. Structural marks (privacy dot, Warmth glow-dot) are CSS circles. Two emoji stand-ins (💬 comments, 🔥 Warmth action) are placeholders — swap for a real icon set (e.g., Lucide, Heroicons) once one is chosen.

### Brand mark

`/design-system/assets/firefly-mark.svg` — an abstract glow: radial-gradient halo behind a solid dot with one highlight. It is an original minimal first draft; replace or refine once a real brand asset exists.

---

## Open questions / known gaps

| Topic | Status |
|-------|--------|
| Icon system | Placeholder emoji; adopt Lucide/Heroicons before build |
| Self-hosted fonts | Currently CDN (Google Fonts); self-host before production |
| Brand mark | First draft; replace with finalized asset |
| Additional components | Avatar, Tooltip, Toast not yet included — add if brief requires |
