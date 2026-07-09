# Firefly (Світлячок) — MVP Engineering Estimate

**Purpose:** what it would cost a team unfamiliar with this codebase to build the
delivered MVP scope **from scratch** — spec-first, with the same test depth and
review rigor now on record. This is **not** a measurement of how long this
session's AI-assisted delivery took; that number (an actual, git-timestamp-derived
effort log) is in `docs/qa/delivery-report.md`'s Effort Log section. The two
numbers measure different things and should never be quoted interchangeably.

## Methodology

- Basis: actual delivered code size (files, lines) and test counts, read directly
  from the repository at commit `c56c0fc` (2026-07-08), not guessed.
- Effort/day rates are informed by typical full-stack (Kotlin/Spring Boot +
  React/TypeScript) delivery velocity for a mid-level engineer working alone,
  including: reading requirements, designing the DB schema/API, writing
  frontend + backend code, writing the accompanying unit/integration tests
  (this project's actual test density is used as the target, not padded),
  fixing defects found in review, and basic manual verification. It excludes:
  UAT/stakeholder sign-off cycles, infra/deploy setup (counted separately),
  and design system creation (Firefly ships a first-party design system,
  `DESIGN.md` + `firefly-fe/src/design-system` — 771 lines — which is treated
  as a shared foundation cost, not per-capability cost; see "Shared
  foundation" below).
- Effort-day = one focused engineer-day (~6 productive hours), single
  contributor, no parallelism assumed (a from-scratch team would typically
  run capabilities in the dependency order in `docs/mvp-capability-plan.md`
  §3, not fully parallel, since slices 3 and 5 depend on 1/2).
- Counts below come from: `find <dir> -name "*.kt"/"*.ts*" | wc -l` and
  `wc -l` (2026-07-08), and the test file/case counts in
  `docs/qa/automated-verification-latest.md` (88 FE unit tests / 15 files,
  38 BE integration tests, 116 BE tests total including unit) and
  `docs/current-state.md`'s per-slice "Latest checks" notes.

## Shared foundation (amortized, not double-counted per capability)

| Item | Basis | Estimate |
|---|---|---|
| Design system (tokens, components, `DESIGN.md` brief) | 771 lines TS/TSX under `firefly-fe/src/design-system`, plus CSS tokens | 4 engineer-days |
| Project scaffolding (Spring Boot + Kotlin build, Vite + React + TS build, Docker Compose, CI wiring, i18n framework, Flyway setup) | `docker-compose.yml`, `.github/workflows/`, `pnpm-workspace.yaml`, 5 Flyway migrations, `react-i18next` wiring | 3 engineer-days |
| **Subtotal (shared foundation)** | | **7 engineer-days** |

## Per-capability estimate

| # | Capability | Scope (one line) | FR/NFR owned | Basis (code + tests) | Effort (eng-days) |
|---|---|---|---|---|---|
| 1 | `add-identity-and-access` | Registration, login/logout, JWT auth, profile view/edit, protected routes, shared shell/header | FR-SHELL-01–04, FR-AUTH-01–05 (9 FRs) + cross-cutting NFR-SEC-01 | Auth/user domain backend (entity, controller, service, JWT filter, security config, rate limiter — part of ~45 BE main files), `LoginPage`/`RegisterPage`/`ProfilePage`/`Header`/`ProtectedRoute` FE (5 test files, 14 tests: Login 3, Register 2, ProtectedRoute 4, plus header/shell coverage) | **6** |
| 2 | `add-personal-archive` | Memory CRUD (story/recipe), single-photo upload, dashboard filters, single memory page, owner edit/delete | FR-MEM-01–06, FR-TOPIC-01–02, FR-CITY-01 (9 FRs) | Memory domain backend (entity, DTOs, service incl. transactional photo replace + cleanup + year-range validation, controller, `MediaService`), FE `DashboardPage`/`MemoryFormPage`/`MemoryDetailPage` (3 test files, 21 tests: Dashboard 5, MemoryForm 8, MemoryDetail 8) | **8** |
| 3 | `add-public-feed-and-social` | Public feed w/ city/topic/sort filters + pagination, likes (Warmth), comments | FR-FEED-01–07, FR-TOPIC-02, FR-CITY-02 (9 FRs) | `FeedService`/`LikeService`/`CommentService` backend, `FeedIntegrationTest`/`SocialIntegrationTest` (11 integration tests), FE `FeedPage` (7 tests incl. pagination) + `FeedSocialPage` (5 tests) | **7** |
| 4 | `add-lost-fireflies` | Lost-request CRUD (public read, auth create), city/type filters, detail w/ mailto, PII-safe list DTO | FR-LOST-01–05 (5 FRs) | `LostService`/`LostRequestSummaryDto` vs detail DTO split, `LostAndReportIntegrationTest`, FE `LostPage` (8 tests) + `LostNewPage` (6 tests incl. per-field + backwards-year validation) + `LostDetailPage` (4 tests) | **5** |
| 5 | `add-moderation-and-admin` | Report creation (memory/comment), admin panel (list reports, delete content, ban users), role-gated access | FR-MOD-02–05 (4 FRs) | `ReportService`/`AdminService`/`AdminReportDto`, `AdminIntegrationTest`, FE `AdminPage` (11 tests) + report-modal UI in `MemoryDetailPage` | **6** |
| 6 | `add-content-pages` | Static `/about` and `/rules` pages, Ukrainian content, no exclamation marks (BC-BRAND-01) | FR-CONTENT-01–02 (2 FRs) | FE `AboutPage` (6 tests) + `RulesPage` (9 tests), i18n content only, no backend | **1.5** |

**Total FR count: 38** (37 MVP FRs per `docs/mvp-capability-plan.md` §5, +1 — FR-MOD-01 "page /rules with community guidelines" is owned by slice 6 per the FR-coverage table despite being numbered under the "Moderation & Rules" section; both slice 5 and 6 collectively cover all `FR-MOD-*` and `FR-CONTENT-*` IDs with no gaps, confirmed by `docs/mvp-capability-plan.md` §5 and the 0-failure `check-traceability.mjs` run in `docs/qa/automated-verification-latest.md`).

## Total

| Component | Effort (eng-days) |
|---|---|
| Shared foundation | 7 |
| 1. Identity & access | 6 |
| 2. Personal archive | 8 |
| 3. Public feed & social | 7 |
| 4. Lost Fireflies | 5 |
| 5. Moderation & admin | 6 |
| 6. Content pages | 1.5 |
| **Total (from-scratch build)** | **40.5 engineer-days** (≈ 8 working weeks for one engineer, or ~4 weeks for a two-person team on the dependency-respecting path in `docs/mvp-capability-plan.md` §3) |

This total does **not** include: Phase 7 global hardening pass (security/correctness
review that found and fixed 7 issues — see `docs/qa/delivery-report.md`), the eval
suite (14 graded-quality cases + judge grading), demo recording production (13
clips), or deployment/ops setup — those are accounted separately in the delivery
report as they are not part of "build the FRs" scope, though a from-scratch estimate
for a comparably rigorous QA pass would reasonably add another 8-12 engineer-days
(review-gate cycles, eval authoring/grading, recording production, documentation).

## What this number is NOT

This is a **hypothetical from-scratch estimate for a capability of this shape and
size**, calibrated against the actual delivered line/test counts. It is not a
reconstruction of how long the AI-assisted sessions that actually produced this
codebase took — that is a fundamentally different kind of work (a single operator
directing an AI agent through a retrofit-then-harden loop, not a team writing code
by hand across ~8 weeks). See `docs/qa/delivery-report.md`'s Effort Log for the real,
git-timestamp-derived session history.
