# Design: add-personal-archive

## Overview

This slice stores personal memories (stories and recipes) with an optional single photo in PostgreSQL, served by the Spring Boot backend and rendered by the React SPA. The implementation is retrofitted from existing code and documented here for Phase 4 evidence.

## Decisions

### Memory data model

- `memories` holds both types in one table: `type` is `story` or `recipe`, with `ingredients` and `steps` populated only for recipes.
- `media` is a separate table joined by `memory_id`, so a memory can later carry more than one asset without schema change; the MVP writes at most one image row.
- `is_public` defaults to `false` — a memory is private unless the author opts in.

### Multipart create and update

- `POST /api/memories` and `PUT /api/memories/{id}` accept multipart requests: a JSON `data` part validated with Jakarta constraints plus an optional `photo` file part.
- Uploaded files are stored on disk under the configured `UPLOAD_DIR` with a UUID filename and exposed at `/uploads/<name>`; replacing a photo deletes the previous media row.

### Ownership and visibility guards

- List endpoint returns only the authenticated user's memories; visibility filtering happens in the repository query.
- Single-memory reads allow anyone for public memories; private memories are limited to the owner or an admin (HTTP 403 otherwise).
- Updates are owner-only; deletes are owner-or-admin.

### Input normalization

- String fields are trimmed server-side; optional fields that trim to blank are stored as `NULL`, keeping filter queries and rendering consistent.
- Year fields are constrained to 1900–2100 by validation.

### Topics and cities

- The topic list and city suggestions are frontend constants (`pageShared.ts`), rendered as dropdowns on the memory form; the backend stores free-form `topic_slug` and `city` strings.

## Trade-offs

- Storing topic and city as free strings (not FK tables) keeps the MVP schema small, but renaming a topic later requires a data migration rather than a lookup-row update.
- Disk-based upload storage is simple and matches the single-node Docker deployment, but horizontal scaling would need shared or object storage.
- The list endpoint filters `type` in memory after the visibility query; acceptable at MVP data volumes, and the repository query can absorb it later if needed.
