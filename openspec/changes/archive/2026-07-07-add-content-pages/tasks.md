# Tasks: add-content-pages

Retrospective task record (this slice was retrofitted from pre-existing code
into OpenSpec after the fact, so the checklist below documents what was
verified rather than a red→green build order).

- [x] Document `/about` and `/rules` as OpenSpec scenarios (FR-CONTENT-01, FR-CONTENT-02)
- [x] Confirm both pages render Ukrainian copy sourced from `locales/uk/common.json`
- [x] Confirm both pages are reachable without authentication
- [x] Confirm no exclamation marks anywhere in the rendered copy (BC-BRAND-01)
- [x] Add frontend render tests: `AboutPage.test.tsx` (6 tests), `RulesPage.test.tsx` (9 tests)
- [x] Validation battery green; `npx openspec validate --all --strict` pass
- [x] Archive
