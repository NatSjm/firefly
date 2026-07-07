# Current State

> Persistent handoff file for future agent windows. A quick map, not a
> replacement for source-of-truth artifacts. Always verify with OpenSpec,
> tests, and the repo.

## Last Updated

- **Date and time:** 2026-07-07 21:47:00 (UTC+02:00)
- **Current phase:** **Phase 5 — Cross-cutting hardening complete**
- **Active change:** none
- **Progress:** Phase 5 complete. Integration test layer already exists in backend (7 IntegrationTest classes using Testcontainers PostgreSQL). Added E2E test layer with Playwright: 4 spec files (auth.spec.ts, rbac.spec.ts, core-flow.spec.ts, responsive.spec.ts) covering authentication, RBAC, core user journey, and responsive breakpoints. Created seed helper (e2e/helpers/seed-demo-data.ts) with deterministic IDs and idempotent upserts. Wired test:integration and test:e2e scripts. Full validation battery passed: lint 0 warnings, 83/83 unit tests, build green, OpenSpec 6/6 passed.

Previous slice 5 `add-moderation-and-admin` progress: The three parallel reviewers (code, security, spec-compliance) found 5 majors and overlapping minors; all confirmed fixes were applied in one pass:
  - **FE — AdminPage:** Stale sibling report rows after cascade delete now properly removed (filter by targetType+targetId, not just clicked row id). Per-row `pendingIds` set prevents double-submit on delete and ban-toggle race. Cross-cleared banners: success clears error and vice versa.
  - **FE — MemoryDetailPage report modal:** `submittingReport` state added; error displayed inside the modal; submit button disabled while in-flight; `aria-label` and `maxLength=500` on the reason Textarea; separate `commentReportTarget` state and a second report modal added so users can report individual comments (closes FR-MOD-02's comment half, the only missing UI entry point).
  - **BE — AdminReportDto:** `GET /api/admin/reports` now returns `AdminReportDto` (id, targetType, targetId, reason, createdAt, reporterId) instead of the raw `Report` entity — prevents leaking internal JPA internals.
  - **BE — ReportService:** `create()` now validates that the target exists (memory or comment) before saving; returns 404 for nonexistent targets, eliminating junk reports polluting the queue.
  - **FE — errors.ts:** `getErrorMessage` for AxiosErrors no longer falls through to the raw `error.message` (which produced English "Request failed with status code …" strings); now returns the server Ukrainian message if present, or the Ukrainian fallback.
  - **Tests added:** FE 68 tests (was 62, +6: ProtectedRoute.test.tsx 4, AdminPage sibling-rows/pending/banner-clear 3, AdminPage original count rechecked). BE 111 tests (was 107, +4: ReportServiceTest 404-memory/comment 2, LostAndReportIntegrationTest 400-unknown-targetType + 404-nonexistent-memory 2).
- **Validation:** FE lint 0 warnings, 68/68 tests, build green. BE 111/111 tests (all integration tests including Testcontainers pass). `npx openspec validate --all --strict` 5/5 pass.

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
- `2026-07-07-add-lost-fireflies` — Phase 4 retrofit validation completed and archived.
- `2026-07-07-add-moderation-and-admin` — Phase 4 retrofit validation completed and archived; review gate found and fixed: stale sibling report rows in AdminPage, per-row pending guards, cross-cleared banners, report modal error visibility + double-submit guard + accessibility, per-comment report action (FR-MOD-02 comment half), AdminReportDto replacing raw entity serialization, ReportService 404 for nonexistent targets, errors.ts Ukrainian fallback, ProtectedRoute adminOnly test.
- `2026-07-07-add-content-pages` — Phase 4 retrofit validation completed and archived; static content pages `/about` and `/rules` documented in OpenSpec (FR-CONTENT-01, FR-CONTENT-02), unit tests added (15 new: 6 AboutPage, 9 RulesPage), validated Ukrainian content with design tokens and BC-BRAND-01 compliance (no exclamation marks).

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

### 6. `add-content-pages`

Status: archived.
Implemented:
- Existing content-pages slice documented in OpenSpec for FR-CONTENT-01 and FR-CONTENT-02 (new `content-pages` accepted spec).
- Frontend unit tests added for `/about` and `/rules` pages (15 new tests: 6 AboutPage, 9 RulesPage).
- Validation confirmed: both pages render Ukrainian content from i18n, use design tokens, contain no exclamation marks (BC-BRAND-01), are publicly accessible (no auth required), and match product brief tone.
Smoke test:
- Frontend validation battery passed locally.
Latest checks:
- `firefly-fe`: lint passed with 0 warnings, tests passed (15 files / 83 tests), build passed.
- `firefly-be`: not applicable (no backend changes for static content pages).

Status: archived.
Implemented:
- Moderation & Admin slice documented in OpenSpec for FR-MOD-02–05 (new `moderation-and-admin` accepted spec).
- Backend unit coverage added for `ReportService` (6 tests: create/trim, absent reason, whitespace reason, bad targetType 400, nonexistent memory 404, nonexistent comment 404) and `AdminService` (8 tests: reports list, users DTO, deleteMemory cascades, deleteMemory 404, deleteComment, deleteComment 404, toggleBan, ban self/admin guard, 404).
- Frontend render coverage added for `AdminPage` (11 tests: report row render, fallback no-reason, empty state, load error, cascade delete removes sibling rows, comment routing, delete error, pending guard, user ban/unban, protected accounts, banner cross-clear) and `ProtectedRoute` (4 tests: unauthenticated redirect, auth pass, adminOnly redirect, admin pass). Footer link tests already existed.
- Review-gate (code, security, spec-compliance) confirmed fixes applied: stale sibling report rows, per-row pending guards, cross-cleared banners, report modal error inside + double-submit guard + aria-label/maxLength, per-comment report action (closes FR-MOD-02 comment half), `AdminReportDto` replacing raw entity serialization, `ReportService.create()` 404 for nonexistent targets, `errors.ts` Ukrainian fallback replacing raw axios message.
- Integration test gaps closed: 400 for unknown targetType (HTTP layer), 404 for nonexistent memory target.
Smoke test:
- Frontend validation battery passed locally.
- Backend Maven suite passed locally (111 tests, 0 failures) with Docker available and `JAVA_HOME=%USERPROFILE%\.jdks\openjdk-26.0.1`.
Latest checks:
- `firefly-fe`: lint 0 warnings, tests passed (13 files / 68 tests), build passed.
- `firefly-be`: `.\mvnw.cmd test` passed (111 tests green) with Docker available and `JAVA_HOME=%USERPROFILE%\.jdks\openjdk-26.0.1`.

## Validation Commands

```bash
npm run lint
npm run test:run
npm run test:integration
npm run test:e2e
npm run build
npx openspec validate --all --strict
```

Current test expectation: `firefly-fe` test/lint/build are green locally (0 warnings, 83/83 tests). `firefly-be` `mvnw test` is green when run with Docker available and `JAVA_HOME=%USERPROFILE%\.jdks\openjdk-26.0.1`; the shell default Java is too old and fails Surefire before tests start. `test:integration` runs backend IntegrationTest classes via mvnw. `test:e2e` runs Playwright E2E tests (requires both backend and frontend running).

## Next Task

Phase 5 complete. Next: **Phase 6 — QA proof pack + demo recordings + evals**. Tasks: 1) Author QA documentation pack (README, traceability matrix, test plan, demo script, risk register, acceptance report) from templates. 2) Add @trace FR-XX annotations to all test files to close 76 traceability warnings. 3) Create headless Playwright recording harness for demo recordings (one clip per capability with FR assertions). 4) Run eval-suite workflow over eval cases and establish baseline. 5) Run qa:verify to regenerate automated-verification-latest.md. Gate G6 checkpoint.

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
