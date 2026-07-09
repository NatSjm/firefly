# Design: add-lost-fireflies

## Overview

This slice lets any visitor browse "Lost Fireflies" requests — posts from users trying to
reconnect with former classmates, kindergartens, camps, or neighborhoods — and lets
authenticated users create new requests. The implementation is retrofitted from the existing
Spring Boot backend and React SPA so the capability can pass Phase 4 with explicit test and
review evidence.

## Decisions

### Public read, authenticated write

- `GET /api/lost-requests` and `GET /api/lost-requests/{id}` are permitted to anonymous callers
  (`SecurityConfig` explicitly `permitAll()`s `GET /api/lost-requests/**`).
- `POST /api/lost-requests` requires authentication; the controller reads the current `User`
  from `Authentication.principal` and stamps it as the request author.
- This matches `docs/requirements.md` ASSUMPTION: "Lost requests are public (no auth required
  to read them)."

### City/type filtering

- `LostRequestRepository.findByFilters` accepts nullable `city`/`type` params and uses
  `(:param IS NULL OR field = :param)` so an absent filter is a no-op.
- `LostService.list` normalizes blank/whitespace-only query params to `null` before hitting the
  repository, so `?city=` and `?city=  ` behave identically to omitting the param.
- Filtering is exact-match on `city` (not case-insensitive, not partial); the frontend supplies
  values from a fixed `CITIES` list and a fixed type-label map, so exact match is sufficient for
  the values the UI can actually send.
- Results are always ordered `createdAt DESC` (newest first) — there is no separate sort
  parameter for Lost Fireflies, unlike the public feed's `new`/`popular` sort.

### Request fields and validation

- `LostRequestRequest` validates `city` (required, ≤120 chars), `type` (required, ≤30 chars),
  `years` (optional, ≤50 chars, free text such as "1998-2003"), `description` (required,
  ≤4000 chars), and `contactEmail` (required, `@Email` format).
- `LostService.create` trims all string fields and coerces a blank `years` to `null` before
  persisting.
- The frontend additionally guards on submit (`city`, `description`, `contactEmail` all
  non-blank) and pre-fills `contactEmail` from the logged-in user's profile email as a
  convenience default the user can still edit.

### contactEmail exposure limited to the detail endpoint

- `GET /api/lost-requests` returns `LostRequestSummaryDto` (no `contactEmail`); only
  `GET /api/lost-requests/{id}` returns the full `LostRequestDto` with `contactEmail`.
- This was corrected during the Phase 4 review gate: the initial retrofit returned
  `contactEmail` on every row of the public, unauthenticated, unpaginated list endpoint,
  which the security review flagged as a bulk PII-harvesting risk (a single request could
  scrape every user's email with no per-item enumeration needed). The MVP spec
  (`slice-5-lost.md`, "contact email visible on detail page") only ever required the detail
  endpoint to expose it, so restricting the list response does not remove functionality —
  the FE only ever read `contactEmail` for the mailto action on `/lost/:id`.
- Rate limiting on `POST` and `GET /api/lost-requests` is still not implemented; tracked as
  a follow-up before a public marketing push, not a blocker for this MVP slice.

### mailto behavior

- `LostDetailPage` renders a "Написати автору" (Write to author) button that sets
  `window.location.href = \`mailto:${request.contactEmail}\`` on click — a client-side-only
  action with no backend involvement, consistent with FR-LOST-05 ("mailto link").
- No email is sent by the platform itself; this is purely a convenience link to the visitor's
  own configured mail client.

### Frontend rendering

- `/lost` renders a header, a "leave a request" CTA (only enabled/routed for authenticated
  users; unauthenticated visitors are routed to `/login` instead), a `FilterBar` for city/type,
  and a card grid via `LostRequestCard`. Loading, error, and empty states are each handled
  explicitly.
- `/lost/new` is a controlled form (city select, type select, years free text, description
  textarea, contact email input) with required-field validation shown inline via `Message` and
  a disabled submit button while saving.
- `/lost/:id` renders city/type/years badges, full description, author + formatted date, and
  the contact section with the mailto button. Distinct branches exist for loading, error
  (fetch failed), and not-found (no error but no data) states.

## Trade-offs

- No rate limiting on `POST`/`GET /api/lost-requests` yet; acceptable for MVP traffic but
  should be added before a public marketing push, alongside pagination on the list endpoint.
- City filtering is exact string match with no normalization beyond trim; a user typing a city
  name with different capitalization or diacritics than the canonical `CITIES` list would get
  no results. Acceptable for MVP because the FE only ever sends values from the fixed list, but
  a future direct-API integration would need case-insensitive matching.
- There is no update or delete endpoint for lost requests (out of scope per
  `mvp-capability-plan.md` section 4.4: "Replies/threads on lost requests" are also
  out of scope). A user who makes a mistake in a request currently cannot self-correct or
  retract it; this is an accepted MVP gap, not a bug.
