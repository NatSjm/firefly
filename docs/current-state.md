# Current State

> Persistent handoff file for future agent windows. A quick map, not a
> replacement for source-of-truth artifacts. Always verify with OpenSpec,
> tests, and the repo.

## Last Updated

- **Date and time:** 2026-07-06 21:14:00 (UTC+02:00)
- **Current phase:** **Phase 4 — slice 3 complete, proceeding to slice 4**
- **Active change:** none (slice `add-public-feed-and-social` archived)
- **Progress:** Slice 3 `add-public-feed-and-social` completed the Phase 4 loop. New backend unit coverage landed for `FeedService` (6 tests), `LikeService` (3 tests), and `CommentService` (5 tests); new frontend render coverage landed for `/feed` (5 tests) and `/memories/:id` social behavior (5 tests). Review findings were recorded inline, `FeedService` now clamps feed page size to `1..100`, and the shared filter selects now expose accessible names for city and topic.
- **Progress (cont.):** Validation is fully green in this environment when the backend uses the modern local JDK (`JAVA_HOME=%USERPROFILE%\.jdks\openjdk-26.0.1`). Latest successful checks: `firefly-fe` lint passed with 1 pre-existing warning, tests passed (7 files / 30 tests), build passed; `firefly-be` `mvnw test` passed with 85 tests green; `npx openspec validate --all --strict` passed with the archived slice 3 change and accepted `public-feed-and-social` spec.
- **Next task:** Continue Phase 4 with slice 4 `add-lost-fireflies`. Remaining backend backlog from 2026-07-06 review: enum-typed roles/types, feed enrichment N+1 fix (batch count queries), LAZY fetching + entity graphs, CORS/JWT-secret hardening, like-toggle race, magic-byte photo validation, contactEmail exposure on public lost-requests list.

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
- `2026-07-06-add-public-feed-and-social` — Phase 4 retrofit validation completed and archived.

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

### 3. `add-public-feed-and-social`

Status: archived.
Implemented:
- Existing public-feed slice documented in OpenSpec for FR-FEED-01–07, FR-LIKE-01–02, FR-COMMENT-01–02, and FR-CITY-02 (new `public-feed-and-social` accepted spec).
- Backend unit coverage added for feed filtering/sort routing, like toggling/counts, and comment listing/creation/deletion ownership checks.
- Frontend render coverage added for `/feed` and `/memories/:id` social features, including signed-out behavior.
- Inline review fixed two findings: uncapped feed page size is now clamped to `1..100`, and the feed filter selects now have accessible names.
Smoke test:
- Frontend validation battery passed locally.
- Backend Maven suite passed locally after setting `JAVA_HOME=%USERPROFILE%\.jdks\openjdk-26.0.1` so Surefire runs on a modern JDK.
Latest checks:
- `firefly-fe`: lint passed with 1 existing warning, tests passed (7 files / 30 tests), build passed.
- `firefly-be`: `.\mvnw.cmd test` passed (85 tests green) with Docker available and `JAVA_HOME=%USERPROFILE%\.jdks\openjdk-26.0.1`.

## Validation Commands

```bash
npm run lint
npm run test:run
npm run test:integration
npm run test:e2e
npm run build
npx openspec validate --all --strict
```

Current test expectation: `firefly-fe` test/lint/build are green locally. `firefly-be` `mvnw test` is green when run with Docker available and `JAVA_HOME=%USERPROFILE%\.jdks\openjdk-26.0.1`; the shell default Java is too old and fails Surefire before tests start.

## Environment / Deployment

- `firefly-be` expects PostgreSQL via `DB_URL`, `DB_USER`, `DB_PASSWORD`, uploads via `UPLOAD_DIR`, and JWT via `JWT_SECRET`.
- Frontend Docker deployment now expects nginx on port `80`, proxies `/api` and `/uploads` to the `backend` service, and allows request bodies up to `10m` for memory photo uploads.
- {{Secrets live in .env.local — never print or commit}}

## Agent Rules / Gotchas

- `firefly-be` targets Spring Boot 4.1.0, Kotlin 2.3.21, Java 25, and Jakarta namespaces (`jakarta.*` only).
- The shell default Java runtime is too old for the current JUnit Platform/Surefire stack (`UnsupportedClassVersionError` on class file version 61). Set `JAVA_HOME=%USERPROFILE%\.jdks\openjdk-26.0.1` before running backend Maven commands from this shell.
- With the modern JDK and Docker available, backend validation reaches full Spring context startup and PostgreSQL-backed integration tests successfully.
- {{OS/shell quirks}}
- Do not archive OpenSpec changes before implementation and smoke test.
