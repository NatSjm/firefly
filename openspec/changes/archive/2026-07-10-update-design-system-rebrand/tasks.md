# Tasks: update-design-system-rebrand

Visual re-skin: the existing unit/E2E suites are the regression bar (they must
stay green untouched); new assertions are added only where the change itself is
observable (brand asset paths, token presence).

- [x] 1. Tokens: rewrite `fonts/colors/typography/spacing/effects/base.css` to the new palette, type, shadows, glow; keep every legacy alias name remapped; re-derive `[data-theme="night"]`
- [x] 2. Assets: add `logo-mark.svg`, `logo-mark-dark.svg`, new `favicon.svg`; remove draft `firefly-mark.svg`; update `index.html`
- [x] 3. Components: restyle Button (indigo primary, pill, outlined danger), Inputs (border-strong chrome, amber focus), Badge (topic=amber, city=indigo, public=green, warmth=amber+glow), Cards, Navigation (sticky cream header, amber active underline, indigo avatar chip, night-indigo footer), FilterBar, Feedback (alert washes, modal shadow) — no prop/API changes
- [x] 4. Pages: re-point amber-as-`--primary` call sites (auth links, Warmth button, avatar chips); HomePage hero → night-indigo brand surface
- [x] 5. Texts: verify no war references anywhere in UI copy or DESIGN.md; keep BC-BRAND-01 (no exclamation marks)
- [x] 6. DESIGN.md rewritten for the new system
- [x] 7. Validation battery: FE lint, unit tests, build, `openspec validate --all --strict`
- [x] 8. Visual verification: dev server, light + night, screenshot evidence
- [x] 9. Update `docs/current-state.md`; archive this change
