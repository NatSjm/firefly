# Proposal: update-design-system-rebrand

Adopt the new first-party Svitlyachok design system («Політ світлячка» logo direction) delivered in `docs/New Logo and design system for Svitlyachok.zip`, replacing the previous visual language while keeping all existing functionality, component APIs, and behavior intact.

**FRs covered:** none added — this change is visual/brand only. It preserves BC-BRAND-01 (no exclamation marks) and NFR-A11Y-01/02 (focus indicator, WCAG AA contrast).

## Why

The customer delivered a finalized brand identity and design system: a new logo (firefly with flight trail), a new palette (warm cream paper, ink text, night-indigo primary action, firefly-amber accent), new typography (Alegreya / Alegreya Sans / Comfortaa), and component specifications. The current in-repo design system (Literata/Manrope, amber-primary, oklch palette) predates this and must be replaced so the product matches the approved brand.

## What Changes

- `firefly-fe/src/design-system/tokens/*` — token values replaced with the new palette, type scale, spacing, radii, shadows, and glow. New canonical token names (`--cream-*`, `--ink-*`, `--indigo-*`, `--amber-*`, `--surface-*`, `--action-primary`, …) are added; the legacy semantic alias names already referenced by app code (`--bg-page`, `--text-primary`, `--primary`, `--font-ui`, `--text-h3`, …) are kept and remapped so all pages re-skin without churn.
- Primary action color moves from amber to night indigo; amber becomes the accent (links, topic badges, Warmth, focus ring, active-nav underline).
- The night theme (`[data-theme="night"]`) is re-derived from the new palette (indigo night ground, cream text, amber-300 glow accents) — capability preserved even though the delivered system is light-first.
- Brand assets: new `logo-mark.svg`, `logo-mark-dark.svg`, `favicon.svg` replace the draft `firefly-mark.svg`; favicon updated.
- Design-system components restyled to the delivered spec (pill buttons with indigo primary and outlined calm danger, input chrome, badge variants, card shadows, night-indigo footer, amber active-nav underline) — **props and behavior unchanged**.
- A handful of page-level styles that used `--primary` as an amber accent (auth-page links, the Warmth button glow) are re-pointed at the correct accent tokens.
- `DESIGN.md` rewritten for the new system. UI copy is untouched except where tone rules require; no UI or documentation text may reference war.

### In scope
- Token, asset, and component-visual replacement in `firefly-fe/src/design-system/` and `firefly-fe/public/`.
- Page-level accent/token corrections; HomePage hero adopts the night-indigo brand surface.
- DESIGN.md rewrite; docs updated.

### Out of scope
- Any behavioral change (routing, forms, validation, API).
- New components (icon system adoption remains a flagged gap).
- Self-hosting fonts (still Google Fonts CDN, as delivered).
- Backend.
