# Domain Workflows

Each workflow below is owned by one accepted OpenSpec capability under
`openspec/specs/<capability>/spec.md` — that spec is the source of truth for
exact acceptance scenarios; this page is an orientation map, not a
replacement.

## Register / login / logout

**Capability:** `openspec/specs/identity-and-access/spec.md` (FR-AUTH-01–05,
FR-SHELL-01–04). A visitor registers with email + password (≥8 chars) +
display name (`RegisterPage.tsx` → `POST /api/auth/register`), or logs in
(`LoginPage.tsx` → `POST /api/auth/login`); both return a JWT + user object
(`AuthResponse`), stored client-side via `api/token.ts`. Logout clears the
token and returns the header to its signed-out state. Protected routes
(`ProtectedRoute.tsx`) redirect unauthenticated visitors to `/login`
(FR-AUTH-05) — note there is currently no `returnTo` redirect back to the
originally-requested page after login (a known, documented gap, see
`docs/qa/eval-report.md`'s `eval-auth-security-protected-route-unauthenticated`
case).

## Create / edit a memory (private vs public)

**Capability:** `openspec/specs/personal-archive/spec.md` (FR-MEM-01–06,
FR-TOPIC-01–02, FR-CITY-01). An authenticated user creates a `story` or
`recipe` memory (`MemoryFormPage.tsx` → multipart `POST /api/memories` —
`data` JSON part + optional `photo` part) with title/text required,
recipe-only `ingredients`/`steps`, optional city/topic/year range, and an
`isPublic` toggle. `MemoryService.validateYearRange` rejects a backwards
`yearFrom > yearTo` range with a 400 before touching the repository (client
mirrors this with inline per-field errors). Editing (`PUT
/api/memories/{id}`) and deleting (`DELETE /api/memories/{id}`) are
owner-only; the dashboard (`DashboardPage.tsx` → `GET /api/memories`) filters
by type and public/private. A private memory's JSON is guarded server-side
(`MemoryService.ensureViewAllowed`) but its photo file is not — see
`auth-and-access.md` Risk S9.

## Browse the public feed (filters + pagination)

**Capability:** `openspec/specs/public-feed-and-social/spec.md`
(FR-FEED-01–07, FR-CITY-02). Any visitor sees `GET /api/feed` (city + topic
filters, `sort=new|popular`, `page`/`size`, clamped to `1..100`) rendered by
`FeedPage.tsx`. Prev/next pagination controls were added in the Phase 7
global review (previously the backend supported paging but the UI had no way
to reach page 2+ — see `docs/current-state.md`); changing a filter resets to
page 0. Each card shows author, city, title, excerpt, photo, topic, likes,
comments (FR-FEED-04) and links to `MemoryDetailPage.tsx` (FR-FEED-05).

## Warmth (like) + comment

**Capability:** `openspec/specs/public-feed-and-social/spec.md`
(FR-FEED-06–07). An authenticated user toggles a "Тепло" (warmth) like via
`POST /api/likes` (`LikeService.toggle`, backed by the `likes` table's
`UNIQUE(user_id, memory_id)` constraint — see `data-model.md`); an
unauthenticated visitor sees a visible sign-in prompt rather than a
hover-only tooltip (fixed in the Phase 7 review). Comments are listed via
`GET /api/memories/{memoryId}/comments` (public — comments on a public
memory are themselves public) and posted/deleted via authenticated `POST`/
`DELETE` on the same resource, with ownership enforced in `CommentService`.

## Lost Fireflies requests

**Capability:** `openspec/specs/lost-fireflies/spec.md` (FR-LOST-01–05). Any
visitor browses `GET /api/lost-requests` (city/type filters,
`LostPage.tsx`) — the list DTO deliberately omits `contactEmail` (only
`LostRequestSummaryDto`, not the full `LostRequestDto`) to prevent
PII-scraping from the public list endpoint. An authenticated user creates a
request (`LostNewPage.tsx` → `POST /api/lost-requests`, required city,
description, contactEmail; `years` is free text with only a `YYYY-YYYY`
backwards-range format specifically rejected, both client- and server-side —
see `data-model.md`'s LostRequest entity). The detail page
(`LostDetailPage.tsx` → `GET /api/lost-requests/{id}`) shows the full
description and a `mailto:` link to the contact email (FR-LOST-05).

## Moderation reports + admin actions

**Capability:** `openspec/specs/moderation-and-admin/spec.md`
(FR-MOD-02–05). An authenticated user reports a memory or an individual
comment with an optional reason (`POST /api/reports` — `ReportService`
validates the target exists, 404 for a nonexistent memory/comment, 400 for
an unknown `targetType`). `/admin` (`AdminPage.tsx`, `ROLE_ADMIN`-guarded
both at the route level via `ProtectedRoute` and at the API level via
`SecurityConfig`/`@PreAuthorize`) lists reports (`AdminReportDto` — a
projection, not the raw `Report` entity, to avoid leaking JPA internals) and
users, and lets an admin delete a memory/comment (cascade-aware, see
`data-model.md`) or toggle a user's ban (self-ban and admin-ban are guarded
against in `AdminService.toggleBan`). `/rules` (FR-MOD-01,
`openspec/specs/content-pages/spec.md`) and a visible "report abuse" /
"rules" link (FR-MOD-05) are static, unauthenticated pages.

## Related

- `apis-and-actions.md` — exact request/response shapes per route.
- `auth-and-access.md` — who can reach which route.
- `data-model.md` — entities backing each workflow.
- `docs/qa/manual-test-plan.md` / `docs/qa/demo-script.md` — step-by-step
  walkthroughs of these same workflows for a human tester.
