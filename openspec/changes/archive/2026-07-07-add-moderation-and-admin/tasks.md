# Tasks: add-moderation-and-admin

## 1. Schema

- [x] Confirm the `reports` table exists in the Flyway migrations with the fields the
      spec requires: `target_type`, `target_id`, `reporter_id`, `reason`, `created_at`.
- [x] Confirm the `users` table carries `role` (default `user`) and `is_banned`
      (default `false`) columns and the `User` entity maps them.

## 2. Tests

- [x] Add backend unit tests for `ReportService`: `create` persists a report stamped
      with the reporter's id, trimmed reason, and target type/id; a blank or absent
      reason is stored as null; an unknown `targetType` is rejected with a 400
      `ApiException` (new behavior, red first).
- [x] Add backend unit tests for `AdminService`: `reports` returns the repository rows;
      `users` maps entities to `AdminUserDto` without leaking password hashes.
- [x] Add backend unit tests for `AdminService.deleteMemory`: deletes the memory,
      removes its reports, cleans up photo files, and 404s on a missing id.
- [x] Add backend unit tests for `AdminService.deleteComment`: deletes the comment,
      removes its reports, and 404s on a missing id.
- [x] Add backend unit tests for `AdminService.toggleBan`: toggles ban on and off,
      refuses self-ban and admin-ban with 400, and 404s on a missing id.
- [x] Add frontend rendering coverage for `AdminPage`: reports table fields with the
      no-reason fallback, empty state, delete action removes the row and shows a
      confirmation, users table fields, ban toggle updates the row status, protected
      accounts (admins, self) have a disabled action, and the shared error state.
- [x] Add frontend coverage for the memory-detail report flow: the report button shows
      only for signed-in non-owners, the modal submits the report with a trimmed reason
      (or no reason when blank) and shows the confirmation message.
- [x] Add frontend coverage for the footer links: rules link navigates to `/rules` and
      the report-abuse link navigates to `/rules` (new behavior, red first — the link
      was previously dead).
- [x] Re-tag the moderation/admin integration tests from the stale `FR-ADMIN-*` ids to
      the canonical `FR-MOD-*` ids so the trace chain matches `docs/requirements.md`.

## 3. Backend endpoints

- [x] Confirm `POST /api/reports` requires authentication (401 anonymous) and returns
      201 with a persisted report for a valid body. Add the `targetType` whitelist
      (`memory` | `comment` → 400 otherwise).
- [x] Confirm `GET /api/admin/reports` and `GET /api/admin/users` are admin-only
      (401 anonymous, 403 non-admin) via `@PreAuthorize` + `JwtFilter` role authorities.
- [x] Confirm `DELETE /api/admin/memories/{id}` and `DELETE /api/admin/comments/{id}`
      return 204, cascade report cleanup (and photo files for memories), and 404 on a
      missing id.
- [x] Confirm `POST /api/admin/users/{id}/ban` toggles the ban state, blocks banned
      users from logging in and from authenticating existing tokens, and refuses
      self-ban/admin-ban.

## 4. FE pages

- [x] Confirm `/admin` is admin-gated in the SPA (`ProtectedRoute adminOnly` redirects
      non-admins) and renders the two-tab reports/users panel with loading, empty, and
      error states.
- [x] Confirm the memory detail page report modal posts via `createReport` and surfaces
      success/error feedback.
- [x] Wire the footer "Повідомити про порушення" link (previously dead) to navigate to
      `/rules` through the shared `onNavigate` callback.

## 5. Validation battery + review gate + archive

- [x] Run the frontend validation battery: `npm run lint`, `npm run test:run`,
      `npm run build`.
- [x] Run backend Maven validation with `JAVA_HOME=%USERPROFILE%\.jdks\openjdk-26.0.1`
      and Docker available (full suite including the moderation/admin integration
      tests against a real Testcontainers PostgreSQL instance — the real-DB smoke
      evidence for this slice).
- [x] Run the review gate (code review, security review, spec-compliance audit —
      maker≠checker) and fix confirmed findings; record `review-findings.json`.
- [x] Validate with `npx openspec validate 2026-07-07-add-moderation-and-admin --strict`
      and `npx openspec validate --all --strict`.
- [x] Update `docs/current-state.md` with the outcome of this pass.
- [x] Archive the change (`npx openspec archive 2026-07-07-add-moderation-and-admin --yes`).
