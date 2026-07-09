# Design: add-public-feed-and-social

## Overview

This slice exposes public memories through a filterable feed and adds lightweight social interactions through warmth toggles and comments. The implementation is retrofitted from the existing Spring Boot backend and React SPA so the capability can pass Phase 4 with explicit test and review evidence.

## Decisions

### Public-only feed query

- `GET /api/feed` reads from the memories table with `is_public = true`.
- Optional city and topic filters are normalized by trimming blanks to `null`.
- Sort supports `new` and `popular`; page size is clamped to 1..100.

### Feed enrichment

- Feed rows are mapped through `MemoryService.enrichDto`.
- Each DTO includes warmth count, comment count, and `likedByMe` for the current user when authenticated.

### Warmth toggle

- `POST /api/likes` is authenticated and acts as a toggle.
- The response returns both the new liked state and the authoritative count from the repository.

### Comments model

- Comments belong to both a memory and a user and are ordered oldest-first on read.
- Comment creation is authenticated and validated through `CommentRequest`.
- Comment deletion is limited to the author or an admin.

### Frontend rendering

- `/feed` renders the shared filter bar plus memory cards showing warmth and comment totals.
- `/memories/:id` renders the warmth button, comment list, and authenticated comment form.
- Signed-out users see a login prompt and cannot activate warmth.

## Trade-offs

- Feed enrichment currently performs per-item repository lookups for counts and liked state; acceptable for MVP traffic, but batch aggregation should replace it before scaling.
- Like toggling still relies on the database unique constraint for last-line duplicate protection; concurrent toggle normalization can be hardened later if production traffic demands it.
