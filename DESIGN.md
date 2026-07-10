# Design System — Svitlyachok (Світлячок), «Політ світлячка»

Svitlyachok is a Ukrainian-language web community for adults, dedicated to childhood, family, and kindness — a personal memory archive, a cozy community organized by topic and city, and a place to search for childhood photos and videos lost to moves and time.

The design system lives in `firefly-fe/src/design-system/`. The delivered source ZIP is archived at `docs/New Logo and design system for Svitlyachok.zip` (supersedes `docs/Svitlyachok design system.zip`).

**Metaphor: a small light in the dark.** Warm cream «paper» pages with one night-indigo surface per page (the home hero, and the footer on every page) where the amber firefly glows.

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
│   ├── fonts.css           ← Google Fonts: Alegreya + Alegreya Sans + Comfortaa
│   ├── colors.css          ← palette + light/night semantic aliases
│   ├── typography.css      ← families, 13→46px scale, line-heights
│   ├── spacing.css         ← 4px-base scale + layout constants
│   ├── effects.css         ← radii, shadows, firefly glow, easing
│   └── base.css            ← minimal reset (box-sizing, body, headings, focus)
└── components/             ← Button, Inputs, Badge, Cards, Navigation, FilterBar, Feedback

public/design-system/assets/
├── logo-mark.svg           ← firefly + flight trail, amber (light surfaces)
├── logo-mark-dark.svg      ← amber-glow variant for night-indigo surfaces
└── placeholder-pattern.svg ← diagonal-stripe SVG for photo placeholders

public/favicon.svg          ← indigo tile with the amber firefly
```

Token names come in two layers: the **canonical** names from the delivered
system (`--cream-100`, `--ink-900`, `--indigo-800`, `--surface-night`,
`--action-primary`, `--accent-text`, `--shadow-card`, `--glow-firefly`, …) and
the **legacy aliases** (`--bg-page`, `--text-primary`, `--primary`,
`--font-ui`, `--text-h1`, `--shadow-sm`, …) kept so pre-rebrand call sites
re-skin in place. New code should prefer the canonical names.

---

## Visual foundations

### Color

| Role | Token | Value |
|------|-------|-------|
| Page background | `--bg-page` (`--cream-100`) | #FAF6EE warm paper |
| Card surface | `--surface-card` (`--cream-50`) | #FFFDF8 |
| Sunken / hover | `--surface-sunken` (`--cream-200`) | #F3EDDF |
| Night surface | `--surface-night` (`--indigo-800`) | #232946 — hero/footer only |
| Text | `--text-primary/secondary/muted` (ink) | #2A2723 / #5C564A / #8B8577 |
| **Primary action** | `--action-primary` (`--indigo-800`) | night indigo, hover `--indigo-700` |
| **Accent** | `--amber-500` decor · `--amber-700` text · `--amber-300` glow on dark | firefly amber |
| Borders | `--border-default` #E3DCCB · `--border-strong` #CFC6AE | 1px always |
| Semantic | green #3E6B44 · gold #7A5A0E · red #A33A31 (+ pale washes) | calm, desaturated |

Rules that follow from the palette:

- **Amber is accent only.** `--amber-700` is the only amber that passes AA as text on cream; `--amber-500` is for icons/decor; `--amber-300` for accents on dark. Never amber-filled containers.
- **Text on indigo** is `#F5EFDF` (`--text-on-dark`); secondary is that at 70% alpha.
- All shipped text pairs meet WCAG AA (body ≥ 4.5:1, large/UI ≥ 3:1).

### Night theme

Apply `data-theme="night"` to `<html>`. Semantic aliases remap to the night
palette (indigo ground, cream text, amber-300 action/links/focus); component
code needs no changes. The delivered system is light-first — the night theme is
a repo-maintained derivation of the same palette.

```tsx
document.documentElement.setAttribute('data-theme', 'night');
document.documentElement.removeAttribute('data-theme'); // back to light
```

### Typography

| Family | Token | Use |
|--------|-------|-----|
| Alegreya (serif) | `--font-heading`, `--font-display` | headings, memory/story text |
| Alegreya Sans | `--font-body`, `--font-ui` | body copy, all UI chrome |
| Comfortaa | `--font-logo` | rare brand moments only |

Scale: 13→46px in 8 steps — `--text-xs/sm/md/lg/xl/2xl/3xl/4xl`
(13/15/17/19/22/28/36/46). Memory reading text is 19px at `--leading-loose`
(1.65). All families have full Cyrillic.

### Spacing, radii, borders, shadows

- 4px scale `--space-1`…`--space-16` (+ larger legacy steps); content max-width `--content-max: 1120px`; card padding 20px; section gaps 48–64px.
- Radii 8 / 12 / 16 px (`--radius-sm/md/lg`); **buttons and badges are always pills** (`--radius-pill`).
- Shadows are warm-tinted and very soft: `--shadow-card/raised/modal`.
- **The amber glow (`--glow-firefly`, `--shadow-glow-sm/md`) is reserved for the logo mark and the Warmth (Тепло) control — never containers or decoration.**
- No gradients, no textures, no animation beyond ~150ms color transitions. Hover = one step darker/sunken; cards lift one shadow step. Focus = 2px amber outline, offset 2px (NFR-A11Y-01).

---

## Components

APIs are unchanged from the previous system — see the barrel `design-system/index.ts`. Visual spec highlights:

- **Button** — pill; `primary` night-indigo fill; `secondary` outlined (border-strong, indigo text); `ghost` quiet; `danger` calm outlined red (never an alarm-red fill); `danger-solid` red-wash fill for the committed destructive confirm. Weight 700, disabled 45% opacity.
- **Field / TextInput / Textarea / Select** — card-white ground, `--border-strong` border, radius-md, 16px text; focus = amber border + soft amber ring; error = red border + red helper text.
- **Badge** — `topic` amber wash + amber-700 text; `tone="moss"` (legacy name) is the **city** chip: indigo-100 + indigo-800; `privacy-public` green wash; `privacy-private` sunken + border; `warmth` outlined with the glowing amber dot.
- **MemoryCard / LostRequestCard** — cream card, sand border, `--shadow-card`, hover lifts to `--shadow-raised`; serif titles at `--text-xl`.
- **Header** — sticky cream bar, logo mark + serif wordmark, active nav link gets a 2px amber underline (`active` prop, wired from `Layout`), indigo avatar chip.
- **Footer** — the one night-indigo surface on every page: dark logo variant, tagline, rules/report links.
- **Message / Modal** — semantic washes with thin-line icons; modal on an indigo-tinted overlay with `--shadow-modal`.

---

## Brand guidelines

### Tone & copy

- **Ukrainian-first.** All UI copy lives in `locales/uk/common.json` (NFR-I18N-01).
- **Calm, warm, practical. No exclamation marks** (BC-BRAND-01). No hype, no clickbait, no gamification.
- Address the user as «ви». Verbs are quiet imperatives: «Створити спогад», «Зберегти».
- Vocabulary: memories are «світлячки», a like is «Тепло», search requests are «Загублені світлячки» — photos lost to moves and time that people want back.
- Empty states are gentle invitations; errors are factual and kind («Не вдалося зберегти. Спробуйте ще раз»).
- **No emoji in UI copy.** No engagement-bait, streaks, or urgency.
- **Copy must not reference war or conflict.**

### Iconography

Minimal by design: the firefly logo marks, the glowing Warmth dot, and
thin-line icons inside `Message`. One legacy emoji stand-in remains (💬 for
comments in `MemoryCard` meta) — swap for Lucide (1.5px stroke, rounded caps)
if an icon set is adopted; note it here when that happens.

### Imagery

User photos only; until provided, use the striped `placeholder-pattern.svg`. Never SVG-drawn illustration.

---

## Open questions / known gaps

| Topic | Status |
|-------|--------|
| Icon system | 💬 emoji placeholder in MemoryCard; adopt Lucide/Heroicons before scaling |
| Self-hosted fonts | Currently CDN (Google Fonts); self-host before production (NFR-PERF) |
| Night theme | Repo-derived from the light-first delivered system; revisit if the brand ships an official dark mode |
