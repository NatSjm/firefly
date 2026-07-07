# Current State

> Persistent handoff file for future agent windows. A quick map, not a
> replacement for source-of-truth artifacts. Always verify with OpenSpec,
> tests, and the repo.

## Last Updated

- **Date and time:** 2026-07-07 06:40:00 (UTC+02:00)
- **Current phase:** **Phase 4 — slice 4 complete, proceeding to slice 5**
- **Active change:** none (slice `add-lost-fireflies` archived)
- **Progress:** Slice 4 `add-lost-fireflies` completed the Phase 4 loop. New backend unit coverage landed for `LostService` (8 tests: create/trim/blank-years, list with no/city/type filters, blank-filter normalization, get-by-id, get-404). New frontend render coverage landed for `LostPage` (8 tests), `LostNewPage` (5 tests), and `LostDetailPage` (4 tests). Review-gate (code, security, spec-compliance, run in parallel) found two real defects fixed in this pass: (1) security-major — `GET /api/lost-requests` returned every row's raw `contactEmail`, enabling bulk PII scraping from the public, unauthenticated, unpaginated list endpoint; fixed by splitting the DTO into `LostRequestSummaryDto` (list, no email) vs `LostRequestDto` (detail, with email) — only the detail endpoint exposes contact email now. (2) spec-major — lost-request cards on `/lost` rendered the full untruncated description instead of an excerpt as FR-LOST-04 requires; fixed by applying `getMemoryExcerpt` before passing `description` to `LostRequestCard`. Also added a server-side `@Size(max = 4000)` cap on `description` (previously unbounded `TEXT`), and deduplicated the type-label map that existed separately in `pageShared.ts` and `design-system/components/cards/Cards.tsx` into a single `design-system/components/cards/lostTypeLabels.ts` source.
- **Progress (cont.):** Validation is fully green: `firefly-fe` lint passed with 1 pre-existing warning (unrelated `AuthContext.tsx`), tests passed (10 files / 47 tests), build passed; `firefly-be` `mvnw test` passed with 93 tests green (including `LostAndReportIntegrationTest` against a real Testcontainers PostgreSQL instance, serving as the real-DB smoke evidence for this slice); `npx openspec validate --all --strict` passed with the archived slice 4 change and accepted `lost-fireflies` spec.
- **Progress (FE refactor):** A behavior-preserving frontend architecture pass landed between slices: the duplicated page fetch pattern (manual `active` flag + loading/error state, 7 pages) is now a shared `src/hooks/useAsyncData.ts` hook; auth was split into `contexts/AuthContext.ts` (context + `useAuth`, fixing the long-standing fast-refresh lint warning) and `contexts/AuthProvider.tsx` (memoized value, stable callbacks); token storage is centralized in `src/api/token.ts` and the axios client now clears a stale token and signs the user out on 401; `getErrorMessage` moved to `src/lib/errors.ts` (re-exported from `pageShared`); `LostRequestCard` accepts any backend `type` string (removing an unsafe cast in `LostPage`); routes are code-split via `React.lazy`. `MemoryFormPage` intentionally keeps its manual fetch effect because it hydrates editable form state. Lint is now expected to pass with **zero** warnings; all 47 FE tests and the build stay green.
- **Next task:** Continue Phase 4 with slice 5 `add-moderation-and-admin`. Remaining backend backlog carried forward from prior reviews: enum-typed roles/types, feed enrichment N+1 fix (batch count queries), LAZY fetching + entity graphs, CORS/JWT-secret hardening, like-toggle race, magic-byte photo validation, no rate limiting on `POST`/`GET /api/lost-requests` (flagged minor, tracked before public marketing push), backend `type` field on lost requests still accepts any string with no server-side enum/whitelist (flagged minor by code review).

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
- `2026-07-06-add-lost-fireflies` — Phase 4 retrofit validation completed and archived; review gate found and fixed a real PII-exposure bug (contactEmail on the public list endpoint) and a spec-compliance gap (missing description excerpt on cards).

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

### 4. `add-lost-fireflies`

Status: archived.
Implemented:
- Existing lost-fireflies slice documented in OpenSpec for FR-LOST-01–05 (new `lost-fireflies` accepted spec).
- Backend unit coverage added for `LostService`: create (trims fields, coerces blank years to null, stamps authenticated author), list (no filters newest-first, city filter, type filter, blank-filter normalization), get (existing id, 404 for missing id).
- Frontend render coverage added for `/lost` (filter bar, card fields, empty state, error state, signed-in/out CTA, filter re-fetch), `/lost/new` (all fields render, required-field validation, trimmed submit), and `/lost/:id` (full description + contact email + mailto button, error state, not-found state).
- Review-gate (code, security, spec-compliance, run in parallel) fixed two real findings: `GET /api/lost-requests` no longer returns `contactEmail` in bulk on the public list endpoint (split into `LostRequestSummaryDto` vs the detail-only `LostRequestDto`, closing a PII-scraping vector), and list cards now render a truncated description excerpt instead of the full text, matching FR-LOST-04. Also added a 4000-char server-side cap on `description` and deduplicated the type-label map shared between `pageShared.ts` and the design system's `LostRequestCard`.
Smoke test:
- Frontend validation battery passed locally.
- Backend Maven suite passed locally (93 tests, 0 failures) with Docker available and `JAVA_HOME=%USERPROFILE%\.jdks\openjdk-26.0.1`; `LostAndReportIntegrationTest` runs against a real Testcontainers PostgreSQL instance and serves as this slice's real-DB smoke evidence.
Latest checks:
- `firefly-fe`: lint passed with 1 pre-existing unrelated warning, tests passed (10 files / 47 tests), build passed.
- `firefly-be`: `.\mvnw.cmd test` passed (93 tests green) with Docker available and `JAVA_HOME=%USERPROFILE%\.jdks\openjdk-26.0.1`.

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
