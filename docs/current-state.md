# Current State

> Persistent handoff file for future agent windows. A quick map, not a
> replacement for source-of-truth artifacts. Always verify with OpenSpec,
> tests, and the repo.

## Last Updated

- **Date and time:** 2026-07-10 09:05:00 (UTC+02:00)
- **Current phase:** **Post-Phase-7 rebrand: «Політ світлячка» design system implemented and archived (`2026-07-10-update-design-system-rebrand`); deployment still deferred by the user — Gate G7 (push+deploy) remains intentionally open**
- **Active change:** none
- **Progress (design-export alignment, 2026-07-10 later session):** The customer exported the Claude-designed app mockup to `docs/newDesign.html` (4.9MB self-contained HTML, same tokens as the ZIP) and asked to match it. Verified the token layer was already identical (grepped the export's CSS custom properties) — the gaps were screen-level. Aligned, keeping every existing test string/role intact (88/88 unit tests untouched and green): **Home** rebuilt to the design (full-bleed night-indigo hero with brand H1 + new subtitle, «Останні спогади» section fetching the 3 newest public memories via `getFeed({size:3})`, lost-fireflies teaser card with **war-free copy** — the export's text mentioned war and was deliberately rewritten, features grid removed with `home.title/join/features` locale keys); **MemoryCard** matched to spec (photo inside padding via new `photoUrl` prop, `years` + `kind` («Рецепт» chip) props, WarmthIcon meta row); **LostRequestCard** (indigo city + neutral type chips, `author · date`, «Відгукнутися» button, new `lost.respond` key, `kindergarten` label → «Дитячий садок»); **Badge** gained `city`/`neutral` variants (legacy `tone="moss"` maps to city); **Header** (ghost «Увійти» + secondary «Зареєструватися» via new `nav.register` key, nav without rules — rules stays in footer per FR-MOD-05); **Footer** (two nav columns per design); **Dashboard** converted to the design's row list with per-row «Редагувати»/«Видалити» (new confirm-modal + `deleteMemory` wiring — additive functionality) and small-button filters; **Lost** page single-column at 840px; **MemoryDetail** narrowed to 720px flat article (serif 19px/1.65 story text, border-top warmth row with WarmthIcon button + new `memory.warmthHint` caption, underlined report link, comment cards `author · date`, form after the list). Shared `EMPTY_STATE_STYLE` (sunken, centered) + page headings to `--text-3xl`/600. Validation: lint 0 warnings, 88/88 tests, build green; visually compared against the export in-browser (home hero/cards/teaser/footer, feed, lost all match; no console errors). Temp `firefly-fe/public/__design-ref.html` removed. **Uncommitted** — awaiting commit instruction.
- **Progress (design-system rebrand, this session):** Implemented the customer-delivered design system from `docs/New Logo and design system for Svitlyachok.zip` as OpenSpec change `update-design-system-rebrand` (proposal/design/tasks + a new `design-system` capability spec, all validated `--strict`, archived after implementation + live smoke). Strategy: **re-skin via token remap, not component replacement** — token VALUES replaced (cream/ink/night-indigo/amber palette in hex, Alegreya + Alegreya Sans + Comfortaa, new warm shadows, 1120px content max), canonical token names from the ZIP added, and every legacy alias (`--bg-page`, `--primary`, `--font-ui`, `--text-h1`, `--shadow-sm`, …) kept and remapped so all pages re-skinned in place with zero API churn. Key semantic shift: **primary action is now night indigo; amber is accent only** (links `--amber-700`, focus ring, active-nav underline, Warmth glow). Night theme (`[data-theme="night"]`) re-derived from the new palette (the delivered system is light-first) — verified in-browser. New brand assets: `logo-mark.svg` / `logo-mark-dark.svg` / indigo-tile `favicon.svg` (draft `firefly-mark.svg` deleted). Components restyled (pill indigo buttons, outlined calm danger, amber input focus, indigo city chips, green public badge, night-indigo footer with new `footer.tagline` i18n key, amber active-underline header via new optional `active` prop wired from `Layout` by route). Page-level accent fixes where `--primary` had meant amber: auth-page links → `--text-link`, `MemoryDetailPage` Warmth button → amber accent + glow dot (also dropped the 🔥 emoji from `memory.warmth` per the no-emoji brand rule), Profile/Header avatar chips → indigo, HomePage hero → the page's one night-indigo brand surface. `DESIGN.md` rewritten; AGENTS.md design bullets updated. **Texts contain no war references** (verified repo-wide) and still zero exclamation marks (BC-BRAND-01). **Validation: FE lint 0 warnings, 88/88 unit tests (untouched — they are the regression bar), build green, `openspec validate --all --strict` 7/7, E2E 13 passed / 1 skipped-by-design against the live backend (unchanged baseline), visual verification in-browser (light + night, home/login/feed with real data).** Not committed — awaiting user's commit/push instruction.
- **Progress (commit + deploy decision, this session):** User asked for all Phase 7 work in one commit (not chunked) — committed as `0f339d0 feat(phase-7): global review-gate, trajectory evals, technical docs, delivery report` (42 files, pre-commit hooks — traceability + trajectory checks — ran clean, non-release mode). **Not pushed** (no push approval requested or given). User explicitly chose to **skip deployment for now** rather than provide a target/secrets — this is a deliberate scope decision, not an oversight. Gate G7 (per `.project-factory/MASTER-PROMPT.md`: "commit + push + deploy, smoke-check the live URL") is therefore **intentionally left open**. Next session should ask the user again before assuming deploy is wanted, rather than proceeding unprompted.
- **Local environment note:** a local Postgres container (`docker compose up -d postgres`) and a backend (`mvnw spring-boot:run`, port 8080) were started this session to run the E2E suite live — both may still be running depending on session lifecycle; check `docker ps` / port 8080 before assuming either is up, and stop them if no longer needed (`docker compose down`).
- **Progress (Phase 7 step 2 — technical docs, estimation, delivery report, this session):** Delegated to two parallel `qa-documenter` agents (mechanical documentation work, per the framework's cost-tiering guidance), then spot-checked their factual claims myself before accepting.
  - **`docs/technical/`** (8 pages, all ≤150 lines): `architecture.md`, `data-model.md`, `auth-and-access.md`, `domain-workflows.md`, `apis-and-actions.md`, `integrations.md`, `operations.md`, `testing.md`. Two real gaps were found while writing these (verified by me, not just trusted): **no database indexes exist** on `is_public`/`city`/`topic_slug` despite `docs/qa/risk-register.md` Risk T6 previously claiming they did (corrected the stale claim in the risk register) — confirmed by grepping the actual Flyway migrations; and **no `db:seed-admin` script exists** anywhere in the repo despite being listed as a planned `package.json` script in the Project Factory template (documented as a manual-SQL workaround in `operations.md` rather than inventing a script).
  - **`docs/estimation.md`**: from-scratch engineering estimate (40.5 engineer-days) based on actual line/file/test counts, with an explicit methodology note distinguishing it from the delivery report's real, git-timestamp-derived effort log (different questions, don't conflate).
  - **`docs/qa/delivery-report.md`**: stakeholder-facing delivery report — executive summary, capability-by-capability FR/test evidence, quality evidence (eval suite 14/14, trajectory eval 17/24 with the retrofit finding stated plainly in its own "honest characterization" section), the 7 Phase-7 hardening fixes, the top 4 residual risks in plain language, an effort log built from real `git log` timestamps clustered into 10 sessions, ops actions required before production, and next steps. No fabricated numbers — every count traces to a command I or the agent actually ran.
  - Re-ran `npx openspec validate --all --strict` after the doc changes: still 6/6 pass (docs-only changes, no code touched this step).
- **Progress (Phase 7 step 1b — trajectory evals, this session):** Ran `node scripts/check-trajectory.mjs --release` (9 deterministic failures across the 6 archived slices — see below) then the LLM trajectory-eval half: one fresh `eval-judge` agent per archived slice (6 agents), each independently grading all 4 rubric dimensions (process-order, test-integrity, in-scope, craft) from real evidence (git log, archive folder contents, direct file reads, spec spot-checks). Full report: `docs/qa/trajectory-eval-report.md`; raw results: `evals/results/trajectory-latest.json` + `trajectory-manifest.json`.
  - **Headline finding:** 5 of 6 slices FAIL `process-order` (mean 38.8/100). This is not judge noise — the `add-public-feed-and-social` judge read the archived `proposal.md` directly and found it **self-declares** the retrofit: *"This change captures the already-implemented public memory feed... so the slice can move through Phase 4 with explicit tests, review evidence, and archive history."* This matches the git history (`9aaa89a chore: /project-factory:onboard — retrofit all 6 MVP slices`): the app existed before Project Factory was onboarded onto it, so specs/tests/reviews were documented onto pre-existing code, not derived from specs before implementation. This is expected for an `/project-factory:onboard` retrofit (vs `/project-factory:init` on an empty repo) and should NOT be fixed by rewriting git history (fabricating a red-phase or backdated trailers) — that trades an honest record for a dishonest one. **Decision: left as-is, disclosed in the report; all NEW work should follow the full spec→red→green→review→archive loop from here forward** (which the Phase 7 global review this session already did, using the structured multi-agent review-gate format).
  - Two related gaps: `review-findings.json` is missing or informal (pre-dates the structured review-gate schema) for 5 of 6 slices — the review *substance* is real in every case (documented in this file's prose per slice) but wasn't persisted as a gate-checkable artifact. Two slices also fail `in-scope`: `add-public-feed-and-social` (an untracked service-layer refactor touched `FeedService`) and `add-lost-fireflies` (whose own commit message admits "architecture refactor" bundled into a UI-polish commit, plus a separate cross-cutting AbortSignal/i18n sweep).
  - **What's solid:** `test-integrity` (mean 79.3) and `craft` (mean 82.7) pass on all 6 slices — every judge who inspected actual test files found real, specific assertions, not tautological stubs; two judges independently re-verified claims by direct inspection (grep, reading test files) rather than trusting prose. `add-personal-archive` is the strongest slice (72/78/88/74) — its review record shows 4 real defects (missing `@Transactional`, unrestricted upload type, orphaned files, duplicated guard) found and fixed before archive.
  - **Deterministic `check-trajectory.mjs --release`** (9 failures, unchanged in kind from before this session, one folder-name fix applied): missing/unclean `review-findings.json` for all 6 slices (by the deterministic script's strict `clean:true` requirement — the 3 that do have a file use the informal pre-Phase-7 schema, which the script correctly treats as "unclean"); `add-content-pages` still missing `design.md` (genuinely didn't need one — static content pages, not fabricating one) and a `Slice:` trailer; `add-moderation-and-admin` missing a `Slice:` trailer. Not fixed — same rationale as above (no history rewriting, no fabricated artifacts).
  - **Full recommendation set** in `docs/qa/trajectory-eval-report.md`'s closing section (a lightweight retrofit-disclosure note per archive folder, going forward process discipline) — a scope decision left for the user, not auto-applied.
- **Progress (Phase 7 step 1 — global review-gate, this session):** Ran the three-dimension review-gate (code-reviewer, security-reviewer, spec-compliance-auditor, run in parallel as fresh agents) over the WHOLE codebase (not a single slice). Verified each finding directly against the code before fixing (read the actual file/line, confirmed the mechanism) rather than trusting the raw agent output. Findings and disposition:
  - **Fixed — critical:** `application.properties` ships a real-looking default `JWT_SECRET` placeholder; anyone reading the repo could forge a valid (including admin) token on a deployment that forgot to override it. Added `JwtService.warnIfSecretIsInsecure()` (loud `ERROR` log at startup if the secret is still a known placeholder or blank) — a hard fail-fast was rejected because the app has no Spring profile mechanism to distinguish dev/test/CI from prod, and all of those currently run on the default. Documented in `docs/qa/risk-register.md` Risk S2.
  - **Fixed — major:** `SecurityConfig`'s `GET /api/memories/**` matcher also matched the bare `/api/memories` (Spring's `/**` gotcha), so an anonymous request hit `MemoryController.getMyMemories`'s unguarded `authentication.principal as User` cast → 500 instead of 401. Narrowed to `GET /api/memories/{id}` + `GET /api/memories/{memoryId}/comments` (comments are intentionally public, guarded server-side by the service). Added `GlobalExceptionHandler` catch-alls (`MethodArgumentTypeMismatchException` → 400, generic `Exception` → safe Ukrainian 500) so no future unmapped exception leaks a raw stack trace either. Regression test: `MemoryIntegrationTest` "anonymous request for my memories is rejected with 401, not 500".
  - **Fixed — major:** no rate limiting on `/api/auth/login`/`register` (credential-stuffing + bcrypt-cost CPU-exhaustion vector). Added `RateLimitFilter` (in-memory per-IP sliding window, 20 req/60s, configurable via `app.rate-limit.*`, disabled in the integration-test suite via `IntegrationTestBase`'s `@DynamicPropertySource` since those tests legitimately register far more than that).
  - **Fixed — major:** `/feed` had no pagination UI — the backend always supported `page`/`size`, but any filter combination with more than 20 public memories left the rest permanently unreachable. Added prev/next controls to `FeedPage.tsx` (`feed.prevPage`/`nextPage`/`pageIndicator` i18n keys), filter changes now reset to page 0. Regression tests added.
  - **Fixed — minor:** `MemoryRequest.yearFrom`/`yearTo` accepted backwards ranges (e.g. 2020–1990) with no cross-field check (the same class of bug already fixed for `LostRequestRequest.years` in a prior session, never mirrored to memories). Added `MemoryService.validateYearRange` (400 before the repository is touched) plus client-side numeric + range validation with inline per-field errors in `MemoryFormPage.tsx` (mirroring the existing per-field error pattern), and a `Number(id)` NaN guard on the edit-load path (matching `MemoryDetailPage.tsx`'s existing guard). Regression tests added both sides.
  - **Fixed — minor:** `text`/`ingredients`/`steps` had no size cap (only the 20MB multipart ceiling) — added `@Size(max = 20000)` to each.
  - **Fixed — minor:** the warmth (❤️) button's signed-out prompt was a hover-only `title` tooltip, invisible to a non-hovering sighted visitor (the comment section already had a visible prompt). Added a visible caption with distinct copy (`memory.warmthSignInPrompt`) — reusing the comment section's exact string caused a duplicate-text test failure, so gave it its own key.
  - **Fixed — doc/process (minor):** archived folder `2026-07-07-2026-07-07-add-moderation-and-admin` had a duplicated date prefix (renamed); `openspec/specs/content-pages/spec.md` had mojibake-corrupted Ukrainian scenario text from a non-UTF-8 write (re-derived from `locales/uk/common.json` and fixed); `2026-07-07-add-content-pages` archive had no `tasks.md` (added a retrospective one); a stale "returnTo redirect-preservation not fixed" bullet in this file was actually already implemented (`ProtectedRoute.tsx`/`LoginPage.tsx`) — corrected.
  - **Deferred, documented as accepted risk (not fixed — architecture-scale change, low likelihood):** private memory photos are reachable via the public `/uploads/**` static file route if the URL leaks (no ownership check at the file-serving layer, only an unguessable UUID filename) — `docs/qa/risk-register.md` Risk S9. Auth JWT stored in `localStorage` rather than an httpOnly cookie (no current XSS vector, but a future one would be catastrophic) — Risk S10.
  - **Regression tests added:** `MemoryServiceTest` (+2: backwards-range rejected in create/update), `MemoryIntegrationTest` (+1: anonymous GET 401), `FeedPage.test.tsx` (+2: pagination hidden at 1 page, next-page refetch), `MemoryFormPage.test.tsx` (+2: backwards range, non-numeric year). FE 88/88 tests (was 84), BE 116/116 (was 113).
  - **Full battery re-run and green:** FE lint 0 warnings, FE 88/88, BE 116/116 (incl. all `*IntegrationTest` classes via Testcontainers), build green, `npx openspec validate --all --strict` 6/6, E2E 13/14 pass + 1 skipped by design (unchanged from baseline), `npm run qa:verify` regenerated `docs/qa/automated-verification-latest.md`.
  - **Not yet done:** full interactive browser visual verification of the new FeedPage pagination / warmth prompt was blocked by an environment port conflict (another session's dev server already holds :5173 for this same repo, and Vite doesn't honor the preview tool's reassigned port without a config change not otherwise warranted) — relied on React Testing Library render assertions (which do exercise real DOM) + the full Playwright E2E pass instead. Revisit with a real browser pass if the port frees up.
- **Progress (eval remediation, prior session):** G6 explicitly requires "every eval case passes its rubric (failures fixed, never waived)" — the previous session left 4/14 failing, so the phase was not actually done despite the stale handoff note below saying otherwise. Fixed the underlying bugs (not just the eval capture) and had a **fresh `eval-judge` agent** (maker≠checker) re-grade against the rubric, verified live in a browser against a freshly-started backend + Postgres (not the stale process left running from an earlier session — killed it and restarted to make sure the server-side fix was actually exercised, then confirmed both the 400 rejection and the 201 success cases directly via curl against the live API):
  - **`MemoryFormPage.tsx`** and **`LostNewPage.tsx`**: replaced the single combined-banner validation (`missingFields`) with per-field inline errors using the design system's existing `Field`/`TextInput`/`Textarea` `error` prop (previously unused for this purpose) — each field shows its own message, cleared on change. Fixes `eval-error-clarity-memory-missing-title` (40→90) and `eval-error-clarity-lost-request-missing-description` (45→88).
  - **`LostNewPage.tsx` (client) + `LostService.kt` (server, new)**: `years` was a free-text field with zero validation — a backwards range like "2025-1990" was silently accepted (HTTP 201). Added a regex-based backwards-range check (`YYYY-YYYY` pattern only; other free text like "приблизно 1999" is left untouched — deliberately kept `years` as free text, not a structured field) on both the client (inline error, blocks submit) and server (400 ApiException, defense-in-depth against direct API use). Fixes `eval-error-clarity-lost-request-invalid-year` (5→92). Verified via curl directly against the API: backwards range → 400 with the Ukrainian message, forward range → 201.
  - **`eval-error-clarity-register-weak-password`**: re-captured only (no code change) with a clean accessibility-tree read; confirmed the distinct error banner ("Пароль має містити щонайменше 8 символів.") was genuinely there all along, separate from the static hint — the prior 40/FAIL was a capture-methodology false negative, not a real bug (40→82).
  - **Regression tests added**: `MemoryFormPage.test.tsx` (per-field messages), `LostNewPage.test.tsx` (per-field messages + new backwards-year-range test), `LostServiceTest.kt` (2 new: backwards-range 400, forward-range/free-text pass-through). FE 84/84 tests (was 83), BE 113/113 tests (was 111).
  - **Eval baseline ratcheted**: `error-clarity` 58.25 → 86.0 (others unchanged: empty-state-usability 83, copy-tone 78, auth-security 86) via `node scripts/check-eval-ratchet.mjs --update`. `docs/qa/eval-report.md`, `evals/results/latest.json`, `evals/results/manifest.json` all updated to 14/14 pass.
  - Full battery re-run and green: FE lint 0 warnings, FE 84/84 tests, BE 113/113 tests, build green, `npx openspec validate --all --strict` 6/6 pass, `npm run qa:verify` (includes E2E: 13 passed/1 skipped-by-design) all green, `check-traceability.mjs` 0 failures (3 pre-existing warnings unrelated to this session).
- **Dependency hygiene (2026-07-08):** frontend supply-chain audit ran clean (`pnpm audit` 0 vulns, registry-only resolutions, store integrity verified, no dependency lifecycle scripts executed — pnpm 10 blocks them and no `onlyBuiltDependencies` allowlist exists). All versions in `firefly-fe/package.json` and root `package.json` are now pinned exactly (no `^`/`~`) to the lockfile-resolved versions; stale npm `package-lock.json` removed (pnpm-lock.yaml is the only lockfile). `.github/dependabot.yml` added: weekly, 14-day cooldown on newly published releases, grouped minor/patch PRs, `versioning-strategy: increase` so update PRs keep exact pins.
- **Progress (E2E fix, this session):** Fixed the Playwright E2E suite (`e2e/*.spec.ts`), which had never run successfully before. Root causes: (1) `TextInput`/`Select` usages in `RegisterPage.tsx`, `LoginPage.tsx`, `MemoryFormPage.tsx` never set a `name` attribute, so `page.fill('input[name="..."]', ...)` timed out — added `name` attrs (they pass through via `...rest` spread, no design-system change needed); (2) several strict-mode locator violations where ambiguous `text=` locators matched 2+ elements (wordmark in header+footer, memory titles duplicated across seeded runs) — added `.first()`; (3) `auth.spec.ts` asserted the user's full display name appears in the header after login/register, but the `Header` component (`design-system/components/navigation/Navigation.tsx:60`) only ever renders an avatar-initial letter, never the full name, and no spec requirement (`openspec/specs/identity-and-access/spec.md`) calls for it — changed those 3 assertions to check for the "Вийти" (logout) button instead, which is a true signal of authenticated header state. Result: **13/14 pass, 1 skipped by design** (`rbac.spec.ts` admin test requires `TEST_ADMIN_EMAIL` env, not configured for local runs). FE lint 0 warnings, 83/83 unit tests still pass. Note: local dev often has a stale Vite server running from the non-worktree checkout (`C:\firefly\firefly-fe`) also bound to :5173 — if `npm run test:e2e` times out on `input[name="email"]` again, check `netstat` for what's actually serving :5173 before re-diagnosing the app.
- **Progress (prior):** Executed the two Phase 6 steps that required a running app; both committed (`e721dd8`, `57836a5`).
  - **Demo recordings**: fixed real bugs in `scripts/record-demos.mjs` (wrong `<select>` selectors, a page-lifecycle crash in the mobile clip, shared-DB idempotency issues) and ran it for real. All 13 clips pass `check-recordings` AND a `vision-judge` pass. Vision-verify caught a genuine mobile CSS bug (header nav overlapped the wordmark below 720px, no breakpoint existed at all) — fixed in `firefly-fe/src/design-system/tokens/base.css` + `Navigation.tsx` (`.ds-header-nav`/`.ds-header-menu-btn`).
  - **Eval suite**: all 14 `evals/cases/*.eval.ts` `produce()` functions were unimplemented placeholders (literally description strings, not real output). Drove the real app (Playwright + direct API calls) to capture genuine output, graded by fresh `eval-judge` agents. Result: **10/14 pass** (started at 8/14; 2 more fixed and re-verified after a backend restart). `docs/qa/eval-report.md` + `evals/results/latest.json` + `evals/results/manifest.json` written; baseline ratcheted via `check-eval-ratchet.mjs --update` (error-clarity 58.25, empty-state-usability 83, copy-tone 78, auth-security 86).
  - **Real bugs found and fixed this session, all verified**: (1) mobile header overlap (above); (2) disabled warmth/like button had no tooltip explaining why for anonymous users; (3) report-reason textarea had no encouraging placeholder; (4) memory title >255 chars returned an English (not Ukrainian) validation detail the frontend never surfaced — fixed `MemoryDtos.kt` + `GlobalExceptionHandler.kt`, confirmed live after backend restart.
  - **Known gaps found, NOT fixed (documented in eval-report.md as follow-up candidates)**: no per-field inline validation on `MemoryFormPage.tsx`/`LostNewPage.tsx` (both use one combined banner instead of attaching errors to the specific field, affects 2 failing eval cases — **fixed in a later session, see eval-remediation entry above**); `LostRequestRequest.years` is unvalidated free text (no way to reject an impossible/backwards range, the failing eval case's original scenario doesn't even match the real schema — **also fixed, see eval-remediation entry**); `eval-error-clarity-register-weak-password` (40, fail) may be a capture-methodology false negative, needs a re-run with a longer settle before trusting the score either way. (Note: `returnTo` redirect-preservation after `/login` was listed here as a gap in an earlier draft of this note — the Phase 7 global spec-compliance audit found it was actually already implemented in `ProtectedRoute.tsx`/`LoginPage.tsx`; that line was stale and has been corrected.)
  - **Two unrelated pre-existing bugs found and fixed while running the full validation battery**: `package.json`'s `test:integration` script had a wrong relative path (`..\mvnw.cmd` should be `.\mvnw.cmd`) — fixed, 37/37 backend integration tests now pass; `e2e/helpers/seed-demo-data.ts` imports `axios` but `e2e/` isn't a pnpm workspace member so it couldn't resolve — fixed by adding `axios` to root `devDependencies`.
  - **Resolved in a later session**: the Playwright E2E suite gap noted below was fixed — see "Progress (this session)" above. 13/14 pass, 1 skipped by design.
  - `npm run qa:verify` was run and regenerated `docs/qa/automated-verification-latest.md`.

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
- `2026-07-10-update-design-system-rebrand` — «Політ світлячка» design-system rebrand implemented (token remap keeping legacy alias names, new brand assets, component restyle, night theme re-derived), new `design-system` capability spec merged, full battery + E2E + in-browser visual smoke green, archived.

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

**Phase 7 steps 1, 1b, and 2 are done and committed** (`0f339d0`) — see the Phase 7 progress entries above. Remaining for **Phase 7 — Global review, docs, release**:
1. ~~Run the `review-gate` workflow once over the WHOLE codebase, security emphasis~~ — **done this session.**
2. ~~`node scripts/check-trajectory.mjs --release` then the `trajectory-eval` workflow over all archived slices~~ — **done this session; see `docs/qa/trajectory-eval-report.md`.**
3. ~~Write `docs/technical/`, `docs/estimation.md`, and a stakeholder delivery report~~ — **done this session; see `docs/technical/`, `docs/estimation.md`, `docs/qa/delivery-report.md`.**
4. **Deploy — explicitly deferred by the user this session, not started.** When resumed: needs user-provided env/secrets (`JWT_SECRET`, DB credentials for the target environment) and explicit approval for the deploy target and for pushing. Then smoke-check the live URL (HTTP 200, no localhost leakage in HTML, clean startup/error logs — specifically confirm the JWT security warning is ABSENT, see `docs/qa/delivery-report.md` §8) and record deployment facts here. **Do not assume deploy is wanted just because this doc says "next" — ask again**, since the user deferred it once already.
Gate G7 → commit (done, `0f339d0`) + push + deploy (both pending user decision — do not push or deploy without asking first, even though the commit itself is already made).

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
