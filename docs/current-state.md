# Current State

> Persistent handoff file for future agent windows. A quick map, not a
> replacement for source-of-truth artifacts. Always verify with OpenSpec,
> tests, and the repo.

## Last Updated

- **Date and time:** 2026-07-06 13:03:00 (UTC+02:00)
- **Current phase:** **Post-onboard — ready for gated new work**
- **Active change:** none (all 6 MVP slices retrofitted and baseline signed off)
- **Progress:** `/project-factory:onboard` completed. All 6 MVP capability slices are implemented, documented, and retrofitted into the spec chain. Baseline requirements + specs approved by user. Local dev workflow validated: `docker compose up -d postgres` → IntelliJ BE → `pnpm run dev` FE at http://localhost:5173.
- **Next task:** Any NEW capability or bugfix slice runs the full gated loop: spec → tests(red) → implement(green) → review-gate → archive → commit with `Slice:` / `Refs:` trailers.

## Source Of Truth

1. `AGENTS.md` — project agent rules.
2. `docs/current-state.md` — this handoff.
3. `docs/requirements.md` — canonical FR/NFR/TC/BC requirements.
4. `docs/product-brief.md` — product narrative.
5. `docs/mvp-capability-plan.md` — change sequence and scope.
6. `openspec/project.md` + `openspec/specs/` — accepted behavior.
7. `docs/adr/` — architecture decisions.
8. `docs/qa/` — QA proof pack and recordings.

## OpenSpec Status

```bash
npx openspec validate --all --strict   # expected: all pass
npx openspec list                      # expected: No active changes (between slices)
```

Archived changes: {{list as they accumulate}}

## Completed Changes

### {{n}}. `add-<capability>`

Status: {{planned / in progress / implemented / validated / archived}}.
Implemented: {{bullets}}.
Smoke test: {{what was exercised on a real DB}}.
Latest checks: {{battery results}}.

## Validation Commands

```bash
npm run lint
npm run test:run
npm run test:integration
npm run test:e2e
npm run build
npx openspec validate --all --strict
```

Current test expectation: `firefly-be` has no committed tests yet; compile/test validation is pending environment repair.

## Environment / Deployment

- `firefly-be` expects PostgreSQL via `DB_URL`, `DB_USER`, `DB_PASSWORD`, uploads via `UPLOAD_DIR`, and JWT via `JWT_SECRET`.
- Frontend Docker deployment now expects nginx on port `80`, proxies `/api` and `/uploads` to the `backend` service, and allows request bodies up to `10m` for memory photo uploads.
- {{Secrets live in .env.local — never print or commit}}

## Agent Rules / Gotchas

- `firefly-be` targets Spring Boot 4.1.0, Kotlin 2.3.21, Java 25, and Jakarta namespaces (`jakarta.*` only).
- Maven dependency resolution currently fails with `PKIX path building failed` against Maven Central in this environment.
- The local runtime also reports Java 8-era class support during test startup, which is below project requirements.
- {{OS/shell quirks}}
- Do not archive OpenSpec changes before implementation and smoke test.
