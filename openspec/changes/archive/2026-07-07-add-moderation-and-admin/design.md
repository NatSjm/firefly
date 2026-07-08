# Design: add-moderation-and-admin

## Overview

This slice lets authenticated users report a memory or a comment (with an optional
free-text reason), and gives admins a panel at `/admin` to review reports, delete the
reported content, and ban/unban users. The implementation is retrofitted from the
existing Spring Boot backend and React SPA so the capability can pass Phase 4 with
explicit test and review evidence.

## Decisions

### Reports are fire-and-forget for the reporter

- `POST /api/reports` requires authentication and returns `201 { "status": "ok" }` —
  the reporter never sees the report queue or its resolution. This matches the MVP
  scope (no notifications, no report status tracking).
- `ReportService.create` trims `targetType` and `reason`, coerces a blank reason to
  `null`, and stamps the authenticated user's id as `reporterId` so admins can follow
  up on abuse of the reporting feature itself.
- `targetType` is validated server-side against the closed set `memory` | `comment`
  (400 otherwise). Before this slice any ≤20-char string was accepted, which produced
  rows the admin panel could not act on (its delete action only understands the two
  known types and surfaces "unknown target" as an error).
- The report references its target by `(targetType, targetId)` without a FK. A report
  can therefore outlive its target (e.g. the author self-deletes the memory); admins
  see a delete action that 404s in that case. Accepted MVP trade-off — the admin
  deletes the report's target, gets "not found", and the row stays until the target
  type/id is cleaned up by a matching admin delete. Reports for a target are removed
  when an admin deletes that target through the admin endpoints.

### Admin access is role-gated at three layers

- `JwtFilter` grants `ROLE_<role uppercased>` authorities from the persisted user row
  (never from token claims), and refuses authentication entirely for banned users.
- `AdminController` is annotated `@PreAuthorize("hasRole('ADMIN')")` — anonymous
  callers get 401, authenticated non-admins get 403.
- The SPA wraps `/admin` in `ProtectedRoute adminOnly` (non-admins are redirected
  to `/`), and the admin nav link renders only for `role === 'admin'`. The SPA layer
  is UX only; authorization is enforced server-side.

### Admin deletion cascades reports and files

- `DELETE /api/admin/memories/{id}` deletes the memory (media rows cascade via the
  entity mapping), then deletes all reports targeting it, then removes the photo
  files from the uploads directory — file cleanup runs last so a failed DB
  transaction never orphans the DB row while the file is already gone.
- `DELETE /api/admin/comments/{id}` deletes the comment and all reports targeting it.
- Both return 204 on success and 404 for a missing id.

### Ban is a reversible toggle with guardrails

- `POST /api/admin/users/{id}/ban` toggles `isBanned` and returns the new state as
  `{ "banned": boolean }` — one endpoint serves ban and unban, and the FE renders
  the label from the response instead of guessing.
- Admins cannot ban themselves or other admins (400). Demoting an admin is out of
  scope for MVP; there is no role-change endpoint.
- A banned user's credentials still verify but login is refused, and `JwtFilter`
  re-reads `isBanned` from the DB on every request, so existing tokens die
  immediately on ban with no token revocation machinery.

### Report entry points on public pages (FR-MOD-05)

- The memory detail page shows a «Поскаржитися» button to signed-in non-owners; it
  opens a modal with an optional reason textarea and posts the report.
- The global footer (rendered by `Layout` on every page) shows links to the
  community rules and to "Повідомити про порушення". The report-abuse link navigates
  to `/rules`, whose final rule tells the reader to use the per-content
  «Поскаржитися» button — reporting is always anchored to a concrete memory or
  comment, so there is no standalone "report abuse" form to link to. Before this
  slice the footer link was rendered with no handler (a dead link); it is now wired
  through the same `onNavigate` callback as the rules link.

### Admin panel rendering

- `/admin` is a two-tab page (Скарги / Користувачі) fed by one parallel fetch of
  `GET /api/admin/reports` + `GET /api/admin/users`, with shared loading/error
  states via `useAsyncData`.
- The reports tab is a table (type, target id, reason with an explicit "no reason"
  fallback, date, delete action). A successful delete removes the row optimistically
  from local state and shows a success message; unknown target types surface an
  error instead of a dead button.
- The users tab is a table (name, email, role, status, ban/unban action). The action
  button is disabled with a "protected" label for admins and for the signed-in
  admin's own row, mirroring the server guardrails.

## Trade-offs

- Reports carry no target snapshot (title/excerpt), so admins judge a report by
  target id and must open the content manually; acceptable at MVP report volume.
- No pagination on `/api/admin/reports` or `/api/admin/users`; acceptable for MVP
  user counts, revisit alongside the feed pagination backlog.
- Deleting content from the admin panel removes all reports on that target rather
  than marking them resolved — there is no moderation audit trail in MVP.
- `GET /api/admin/users` returns every user's email; this is admin-only by role and
  consistent with the moderation duty, but any future non-admin staff role must get
  a narrower DTO.
- No rate limiting on `POST /api/reports`; a hostile authenticated user can flood
  the queue. Tracked with the existing pre-marketing rate-limiting backlog item.
