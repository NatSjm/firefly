# Tasks: add-lost-fireflies

## 1. Schema

- [x] Confirm the `lost_requests` table exists in the Flyway migrations (V4) with the fields
      the spec requires: `user_id` FK, `city`, `type`, `years`, `description`,
      `contact_email`, `created_at`.
- [x] Confirm the `LostRequest` entity maps the FK relation to `User` and the column
      constraints (`NOT NULL` on city/type/description/contact_email; nullable `years`).

## 2. Tests

- [x] Add backend unit tests for `LostService`: `create` persists a trimmed, correctly
      authored record and returns its DTO.
- [x] Add backend unit tests for `LostService`: `list` with no filters returns all requests
      ordered newest-first.
- [x] Add backend unit tests for `LostService`: `list` with a `city` filter narrows results
      to matching city only.
- [x] Add backend unit tests for `LostService`: `list` with a `type` filter narrows results
      to matching type only.
- [x] Add backend unit tests for `LostService`: `list` normalizes blank/whitespace-only
      filter params to "no filter".
- [x] Add backend unit tests for `LostService`: `get` returns the DTO for an existing id.
- [x] Add backend unit tests for `LostService`: `get` throws a 404 `ApiException` for a
      non-existent id.
- [x] Add frontend rendering coverage for `LostPage`: renders the filter bar (city, type),
      renders cards with city/type/years/description/author/date, shows the empty state
      when no results, shows an error state when the fetch fails, and shows the correct
      CTA text/target for signed-in vs signed-out users.
- [x] Add frontend rendering coverage for `LostNewPage`: renders all form fields, blocks
      submission and shows an inline message when city/description/contactEmail are blank,
      and calls `createLostRequest` with trimmed values on valid submit.
- [x] Add frontend rendering coverage for `LostDetailPage`: renders full description,
      contact email, and mailto button on success; renders the error state on fetch
      failure; renders the not-found state when no request is returned.

## 3. Lost request endpoints

- [x] Confirm `GET /api/lost-requests` is public (no auth required). Reviewed and hardened
      during the Phase 4 review gate: it now returns a `LostRequestSummaryDto` (no
      `contactEmail`) instead of the full DTO, closing a bulk PII-harvesting exposure found
      by security review; only the detail endpoint returns `contactEmail`.
- [x] Confirm `GET /api/lost-requests?city=&type=` narrows results by exact match on both
      params, independently and combined. Covered by `LostServiceTest` and
      `LostAndReportIntegrationTest`.
- [x] Confirm `POST /api/lost-requests` requires authentication (401 without a valid
      token), validates required fields (400 on missing/invalid input, including a new
      4000-char cap on `description` added during review), and returns 201 with the
      created record on success. Covered by `LostAndReportIntegrationTest`.
- [x] Confirm `GET /api/lost-requests/{id}` returns 200 with full detail (including
      `contactEmail`) for an existing id and 404 for a non-existent id. Covered by
      `LostServiceTest` and `LostAndReportIntegrationTest`.

## 4. FE pages

- [x] Confirm `/lost` renders the filter bar (city, type) and lost request cards, with
      distinct loading/empty/error states. Cards now show a truncated description excerpt
      (matching FR-LOST-04's "description excerpt" wording) instead of the full text.
      Covered by `LostPage.test.tsx`.
- [x] Confirm `/lost/new` is reachable only meaningfully for authenticated users (CTA on
      `/lost` routes signed-out visitors to `/login` instead) and validates required
      fields before submitting. Covered by `LostPage.test.tsx` and `LostNewPage.test.tsx`.
- [x] Confirm `/lost/:id` renders the full description, contact email, and a working
      mailto button, with distinct error/not-found states. Covered by
      `LostDetailPage.test.tsx`.

## 5. Validation battery + archive

- [x] Run the frontend validation battery: `npm run lint` (1 pre-existing warning),
      `npm run test:run` (10 files / 47 tests, all green), `npm run build` (green).
- [x] Run backend Maven validation with `JAVA_HOME=%USERPROFILE%\.jdks\openjdk-26.0.1` and
      Docker available: full suite green (93 tests, 0 failures), including
      `LostAndReportIntegrationTest` against a real Testcontainers PostgreSQL instance —
      this is the real-DB smoke evidence for this slice.
- [x] Validate the change with `npx openspec validate 2026-07-06-add-lost-fireflies --strict`
      (pass).
- [x] Validate the repository with `npx openspec validate --all --strict` (4 passed, 0
      failed).
- [x] Update `docs/current-state.md` with the outcome of this pass.
- [x] Archive the change (`npx openspec archive 2026-07-06-add-lost-fireflies --yes`).
