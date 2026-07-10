# Design: update-design-system-rebrand

## Strategy: re-skin via token remap, not component replacement

The delivered ZIP ships its own JSX components (`sv-*` class based), but the app
already has TypeScript components with richer APIs (error props, i18n, `name`
attr pass-through) that 88 unit tests and the E2E suite depend on. Replacing
them wholesale would churn every page for zero functional gain.

Instead:

1. **Token values are replaced; token names are additive.** The new canonical
   names from the ZIP (`--cream-100`, `--ink-900`, `--indigo-800`,
   `--surface-card`, `--action-primary`, `--shadow-card`, `--glow-firefly`, …)
   are added, and every legacy alias the app already references is kept and
   remapped onto them. App pages re-skin automatically.
2. **Components keep their APIs**, only their visual constants change to match
   the ZIP's `tokens/components.css` and component JSX.

## Key mapping decisions

| Legacy token | New value | Note |
|---|---|---|
| `--primary` family | night indigo (`--indigo-800/700/900`, soft `--indigo-100`) | primary action is indigo now |
| `--accent` family | firefly amber (`--amber-500/700/100`) | was moss green; amber is THE accent |
| `--focus-ring` | `--amber-500` | was dusk indigo |
| `--text-link` | `--amber-700` | only amber that passes AA on cream |
| `--bg-page` / `--bg-surface` / `--bg-sunken` | cream 100 / 50 / 200 | |
| `--bg-inverse` | `--indigo-800` | the "one night surface per page" |
| `--shadow-sm/md/lg` | `--shadow-card/raised/modal` | warm-tinted, softer |
| `--glow-color`, `--shadow-glow-*` | derived from `--amber-300` | Warmth + brand mark only |
| `--font-heading/display` | Alegreya | was Literata |
| `--font-body/ui` | Alegreya Sans | was Manrope |
| `--text-h1/h2/h3` | 36 / 28 / 22 px | new 13→46 px scale |
| `--content-max` | 1120px | was 1200px |

Places where the legacy token was semantically wrong after the remap (amber
accent expressed as `--primary`) are corrected at the call site:
`LoginPage`/`RegisterPage` link → `--text-link`; `MemoryDetailPage` Warmth
button → accent tokens + glow; header avatar chip → indigo-100/indigo-800.

## Night theme

The ZIP is light-first (night indigo is a *surface*, not a theme). The repo,
however, ships a `[data-theme="night"]` capability gated by a11y checks. It is
re-derived from the new palette: page `#161A33`, surfaces `--indigo-800/700`,
text `#F5EFDF` (+70%/55% alpha steps), links/focus/primary-action
`--amber-300` with dark ink text on amber. Semantic states get lightened
variants that keep AA on the indigo ground.

## Danger buttons

The brand brief says danger is "outlined, never a loud red fill". `danger`
becomes transparent with a red outline (hover: red wash). `danger-solid`
(committed destructive confirm) keeps a distinct, stronger treatment — red wash
fill + red border — without being an alarm-red fill.

## Assets

`public/design-system/assets/` gains `logo-mark.svg` (amber, for light
surfaces) and `logo-mark-dark.svg` (amber-300, for the night-indigo footer);
`public/favicon.svg` is replaced with the delivered indigo-tile favicon.
`firefly-mark.svg` (draft) is deleted; all references updated.
`placeholder-pattern.svg` stays (the ZIP keeps the striped placeholder idea).
