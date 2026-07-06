# Tasks: add-personal-archive

## 1. Schema

- [x] Confirm `memories` and `media` tables exist in the V2 Flyway migration with the fields the spec requires.
- [x] Confirm the entity model maps type, visibility, city, topic, year range, and media relations.

## 2. Tests

- [x] Add memory request validation coverage for required fields, size limits, and year bounds with Jakarta validation.
- [x] Add memory entity default-value coverage for visibility and media list.
- [x] Add memory service coverage for the private-memory view guard.
- [x] Add frontend rendering coverage for `/dashboard` (filters, empty state, memory grid).
- [x] Add frontend rendering coverage for the memory form (story vs recipe fields, topic and city dropdowns, validation message).
- [x] Add frontend rendering coverage for the memory detail page (metadata, recipe sections, owner actions).

## 3. Memory endpoints

- [x] Confirm `GET /api/memories` returns only the authenticated user's memories with visibility filtering.
- [x] Confirm `POST /api/memories` accepts multipart data plus optional photo and returns HTTP 201.
- [x] Confirm `GET /api/memories/{id}` allows public access and guards private memories with HTTP 403.
- [x] Confirm `PUT /api/memories/{id}` is owner-only and replaces the photo when a new one is attached.
- [x] Confirm `DELETE /api/memories/{id}` is owner-or-admin and removes media records.

## 4. FE pages

- [x] Confirm `/dashboard` renders the memory grid with all/public/private filters and an empty state.
- [x] Confirm `/memories/new` and `/memories/:id/edit` render the form with recipe fields, topic and city dropdowns, photo input, and visibility toggle.
- [x] Confirm `/memories/:id` renders full text, photo, metadata, and owner edit/delete actions.

## 5. Validation battery + archive

- [x] Run the frontend validation battery: `pnpm run lint`, `pnpm run test:run`, `pnpm run build`.
- [x] Run backend Maven validation and record the environment blocker when dependency resolution or DB access prevents the full suite.
- [x] Validate the change with `npx openspec validate add-personal-archive --strict`.
- [x] Validate the repository with `npx openspec validate --all --strict`.
- [x] Archive the change and preserve inline review evidence.
