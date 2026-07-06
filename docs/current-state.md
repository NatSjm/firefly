# Current State

> Persistent handoff file for future agent windows. A quick map, not a
> replacement for source-of-truth artifacts. Always verify with OpenSpec,
> tests, and the repo.

## Last Updated

- **Date and time:** 2026-07-06 17:40:00 (UTC+02:00)
- **Current phase:** **Phase 4 — slice 2 complete, proceeding to slice 3**
- **Active change:** none (slice `add-personal-archive` archived)
- **Progress:** Phase 4 retrofit evidence for slice 2 is in place: OpenSpec change docs, backend unit tests for memory validation/entity defaults/view guard/photo storage, frontend render tests for `/dashboard`, the memory form, and the memory detail page, and inline review evidence with four fixed findings (untransacted photo replacement, unrestricted upload file types, orphaned upload files on delete, duplicated visibility guard). Frontend battery passes locally. Backend Maven validation remains blocked in this environment by Maven Central PKIX certificate resolution before Spring or PostgreSQL startup.
- **Next task:** Continue Phase 4 with slice 3 `add-public-feed-and-social`, carrying forward the same review → validation → archive flow.

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

Archived changes:

- `2026-07-06-add-identity-and-access` — Phase 4 retrofit validation completed and archived.
- `2026-07-06-add-personal-archive` — Phase 4 retrofit validation completed and archived.

## Completed Changes

### 1. `add-identity-and-access`

Status: archived.
Implemented:
- Existing auth slice documented in OpenSpec for FR-AUTH-01–05 and FR-SHELL-01–04.
- Backend unit coverage added for JWT generation/expiry, registration DTO validation, and user entity defaults.
- Frontend render coverage added for `/login` and `/register`.
- Inline review completed; permissive CORS credentials setting removed from the backend security config.
Smoke test:
- Frontend validation battery passed locally.
- Backend Maven test execution is blocked here by PKIX dependency-resolution failures against Maven Central, so real-DB smoke must run in a repaired Java/Maven environment or Docker image with trusted certificates.
Latest checks:
- `firefly-fe`: lint passed with 1 existing warning, tests passed (2 files / 5 tests), build passed.
- `firefly-be`: `.\mvnw.cmd test` and targeted unit-test execution both blocked by PKIX certificate validation before dependency download.

### 2. `add-personal-archive`

Status: archived.
Implemented:
- Existing memory-archive slice documented in OpenSpec for FR-MEM-01–06, FR-TOPIC-01–02, and FR-CITY-01 (new `personal-archive` baseline spec).
- Backend unit coverage added for memory request validation, entity defaults, DTO mapping, the private-memory view guard, photo storage, and upload-file cleanup.
- Frontend render coverage added for `/dashboard` (filters, empty state, error state), the memory form (topic/city dropdowns, recipe fields, validation), and the memory detail page (metadata, recipe sections, owner actions).
- Inline review fixed four findings: photo replacement ran a derived delete without a transaction (now `@Transactional` with cascade/orphanRemoval, `MediaRepository` removed), uploads accepted any file type (now an image-extension allowlist returning HTTP 400), deleted memories orphaned upload files on disk (now cleaned up, path-traversal safe), and `GET /api/memories/{id}` duplicated the visibility guard (now delegates to `MemoryService.ensureViewAllowed`).
Smoke test:
- Frontend validation battery passed locally (lint with 1 pre-existing warning, 20 tests across 5 files, build, `openspec validate --all --strict`).
- Backend Maven test execution re-attempted 2026-07-06 and still blocked by PKIX dependency-resolution failures against Maven Central; the new memory unit tests must run in a repaired Java/Maven environment or CI.
Latest checks:
- `firefly-fe`: lint passed with 1 existing warning, tests passed (5 files / 20 tests), build passed.
- `firefly-be`: `.\mvnw.cmd test "-Dtest=Memory*Test"` blocked by PKIX certificate validation before dependency download.

## Validation Commands

```bash
npm run lint
npm run test:run
npm run test:integration
npm run test:e2e
npm run build
npx openspec validate --all --strict
```

Current test expectation: `firefly-fe` test/lint/build are green locally. `firefly-be` now has committed auth unit tests, but Maven execution remains blocked in this environment until certificate trust is repaired.

## Environment / Deployment

- `firefly-be` expects PostgreSQL via `DB_URL`, `DB_USER`, `DB_PASSWORD`, uploads via `UPLOAD_DIR`, and JWT via `JWT_SECRET`.
- Frontend Docker deployment now expects nginx on port `80`, proxies `/api` and `/uploads` to the `backend` service, and allows request bodies up to `10m` for memory photo uploads.
- {{Secrets live in .env.local — never print or commit}}

## Agent Rules / Gotchas

- `firefly-be` targets Spring Boot 4.1.0, Kotlin 2.3.21, Java 25, and Jakarta namespaces (`jakarta.*` only).
- Maven dependency resolution currently fails with `PKIX path building failed` against Maven Central in this environment.
- Backend validation therefore cannot yet reach Spring context startup or PostgreSQL-dependent tests from this shell.
- {{OS/shell quirks}}
- Do not archive OpenSpec changes before implementation and smoke test.
