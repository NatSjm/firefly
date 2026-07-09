# Tasks: add-public-feed-and-social

## 1. Schema

- [x] Confirm `likes` and `comments` tables exist in the Flyway migrations with the fields the spec requires.
- [x] Confirm entity models map user/memory FK relations, unique constraint on likes, and timestamp on comments.

## 2. Tests

- [x] Add backend unit tests for LikeService: toggle adds a like when none exists, toggle removes a like when one exists, count returns correct value after toggle.
- [x] Add backend unit tests for CommentService: list returns comments in ascending order, add persists comment, delete enforces ownership (owner can delete, non-owner gets 403).
- [x] Add backend unit tests for FeedService: only public memories returned, city filter narrows results, topic filter narrows results, popular sort calls popularity query.
- [x] Add frontend rendering coverage for `/feed` (filter bar rendered, memory cards with warmth and comment counts, empty state, error state).
- [x] Add frontend rendering coverage for `/memories/:id` social features (warmth button, comment list rendered, comment form for authenticated user, unauthenticated prompt for login).

## 3. Feed endpoints

- [x] Confirm `GET /api/feed` returns only public memories with city/topic/sort/page/size query params.
- [x] Confirm feed items include `likesCount` and `commentsCount`.
- [x] Confirm `popular` sort orders by like count descending.

## 4. Social endpoints

- [x] Confirm `POST /api/likes` toggles like and returns `{ liked, count }`.
- [x] Confirm `GET /api/memories/{id}/comments` returns comments list (public access).
- [x] Confirm `POST /api/memories/{id}/comments` requires auth and returns HTTP 201.
- [x] Confirm `DELETE /api/memories/{id}/comments/{commentId}` enforces ownership (owner or admin only).

## 5. FE pages

- [x] Confirm `/feed` renders with filter bar (city, topic, sort) and memory cards including warmth and comment counts.
- [x] Confirm `/memories/:id` renders warmth toggle button, comment list, and comment form for authenticated user.
- [x] Confirm unauthenticated user sees login prompt instead of comment form and warmth button is disabled.

## 6. Validation battery + archive

- [x] Run the frontend validation battery: `npm run lint`, `npm run test:run`, `npm run build`.
- [x] Run backend Maven validation and record the environment blocker when dependency resolution or DB access prevents the full suite.
- [x] Validate the repository with `npx openspec validate --all --strict`.
- [x] Archive the change and preserve inline review evidence.
