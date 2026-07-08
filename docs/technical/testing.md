# Testing

Four layers, matching `AGENTS.md`'s validation cadence. Counts below are from
the latest full run recorded in `docs/qa/automated-verification-latest.md`
(2026-07-08) and `docs/current-state.md` — re-run the commands yourself
before trusting a stale number.

## 1. Frontend unit tests (Vitest)

**Location:** `firefly-fe/src/test/{pages,components}/*.test.tsx`,
`firefly-fe/src/test/setup.ts`. **Run:** `npm run test:run` (root) or
`pnpm --filter firefly-fe run test:run`. **Current count:** 88 tests across
15 files, all passing, 0 lint warnings
(`docs/qa/automated-verification-latest.md`). Render coverage exists for
every route page (Feed, Dashboard, Lost*, Admin, Memory*, Login, Register,
About, Rules) plus shared components (`ProtectedRoute`, footer links).
Assertions use React Testing Library against real rendered DOM, not
snapshot-only checks — e.g. `MemoryFormPage.test.tsx` asserts specific
inline per-field error text, not just "an error appeared."

## 2. Backend unit + real-DB integration tests (JUnit 5 + Testcontainers)

**Location:** `firefly-be/src/test/kotlin/com/firefly/fireflybe/` — unit
tests colocated per domain package (`auth/`, `memories/`, `feed/`,
`comments/`, `likes/`, `lost/`, `reports/`, `admin/`, `users/`), integration
tests under `integration/*IntegrationTest.kt` (`AdminIntegrationTest`,
`AuthIntegrationTest`, `FeedIntegrationTest`,
`LostAndReportIntegrationTest`, `MemoryIntegrationTest`,
`SocialIntegrationTest`), sharing `IntegrationTestBase` (spins up a real
`postgres:16-alpine` Testcontainer, runs the actual Flyway migrations, and
disables `RateLimitFilter` via `@DynamicPropertySource` since these tests
legitimately exceed the 20-req/60s auth throttle).

**Run:**
- `npm run test:run` in `firefly-be` is not the pattern — use
  `.\mvnw.cmd test` for the full suite (unit + integration), or
  `npm run test:integration` (root — `cd firefly-be && .\mvnw.cmd test
  -Dtest=*IntegrationTest`) for the Testcontainers layer only. Requires
  Docker running.
- **Windows gotcha**: the shell default Java is too old for the current
  Surefire/JUnit stack — set `JAVA_HOME=%USERPROFILE%\.jdks\openjdk-26.0.1`
  first, or Maven fails before any test runs (`UnsupportedClassVersionError`).

**Current count:** 116 tests total (78 unit + 38 integration), all passing
(`docs/current-state.md`, `docs/qa/automated-verification-latest.md`'s
`db-integration-tests` section shows the 38-test `*IntegrationTest` subset
specifically: 5 Admin, 6 Auth, 5 Feed, 6 LostAndReport, 10 Memory, 6 Social).
Integration tests are the real-DB smoke evidence gate required before
archiving any OpenSpec change (`AGENTS.md`) — they exercise actual SQL
against actual Postgres via Testcontainers, not mocks.

## 3. Playwright E2E (`e2e/*.spec.ts`)

**Location:** `e2e/auth.spec.ts`, `e2e/core-flow.spec.ts`,
`e2e/rbac.spec.ts`, `e2e/responsive.spec.ts`. **Run:** `npm run test:e2e`
(root, `playwright.config.ts`) — requires both backend (`:8080`) and
frontend (`:5173` or the built app) running against a real Postgres.
**Current count:** 14 tests, 13 passing, 1 skipped by design (the admin RBAC
test requires `TEST_ADMIN_EMAIL`, not configured for local runs —
`docs/current-state.md`). Covers registration/login/logout, the full
register→create-memory→view-feed→like journey, dashboard/feed filtering,
non-admin denial at `/admin`, and three responsive viewports (360/768/1280px).
**Windows gotcha**: a stale Vite dev server from a different checkout can
silently occupy `:5173` and cause opaque timeouts — check `netstat` for
what's actually serving that port before re-diagnosing the app
(`docs/current-state.md`).

## 4. Evals (graded quality, `evals/cases/*.eval.ts`)

**Location:** `evals/cases/auth.eval.ts`, `feed.eval.ts`,
`lost-fireflies.eval.ts`, `memories.eval.ts`, `moderation.eval.ts`. Each case
has a `produce()` that drives the real running app (Playwright + direct API
calls — not descriptions), a rubric, and `@trace` FR/BC ids. Graded by a
fresh `eval-judge` agent (maker≠checker) against 4 dimensions:
`error-clarity`, `empty-state-usability`, `copy-tone`, `auth-security`.
**Run:** `node scripts/check-eval-ratchet.mjs` (guards the committed
baseline in `quality/eval-baseline.json`, no API key needed for the ratchet
check itself — grading requires the `eval-suite` workflow with judge access).
**Current result:** 14/14 cases pass (pass mark 70/100 per case; a CRITICAL
rubric miss fails a case outright regardless of score). Per-dimension scores:
`error-clarity` 86.0, `empty-state-usability` 83.0, `copy-tone` 78.0,
`auth-security` 86.0. Full report: `docs/qa/eval-report.md`; raw results:
`evals/results/latest.json` + `evals/results/manifest.json`. Recordings
*illustrate* these cases for humans — the eval report is what decides
pass/fail; cite the eval verdict, not just a clip, in any customer-facing
report.

## Running everything before/after a substantial change

```bash
npm run lint
npm run test:run
npm run test:integration
npm run test:e2e
npm run build
npx openspec validate --all --strict
node scripts/check-eval-ratchet.mjs
```

Or the single aggregate: `npm run qa:verify` (`scripts/qa-verify.mjs`),
which runs all of the above plus `check-traceability.mjs`,
`check-trajectory.mjs`, and `check-recordings.mjs`, and (re)writes
`docs/qa/automated-verification-latest.md`.

## Related

- `docs/qa/manual-test-plan.md` — the human-executable complement to
  automated coverage (non-developer, Chrome).
- `docs/qa/requirements-traceability-matrix.md` — FR/NFR → test mapping.
- `docs/qa/eval-report.md` — full per-case eval verdicts and notes.
- `docs/current-state.md` — latest pass/fail counts as of the last handoff
  (verify against a fresh run before trusting).
