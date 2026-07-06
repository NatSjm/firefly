# Spec: Slice 4 — Public Feed, Likes & Comments

**Status:** retrofitted  
**FRs covered:** FR-FEED-01, FR-FEED-02, FR-FEED-03, FR-LIKE-01, FR-LIKE-02, FR-COMMENT-01, FR-COMMENT-02  
**Slice:** 1.4

## Summary
Public feed of memories with city/topic/sort filters, warmth (likes), and comments.

## Data Model

```sql
CREATE TABLE likes (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  memory_id INT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  UNIQUE (user_id, memory_id)
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  memory_id INT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Endpoints

### GET /api/feed
- **Auth:** none (public)
- **Query:** `city`, `topic`, `sort` (new|popular), `page`, `size`
- **Response 200:** `{ items: [...], total, page, totalPages }`
- Only `is_public = true` memories returned

### POST /api/likes
- **Auth:** Bearer JWT
- **Body:** `{ memoryId }`
- **Response 200:** `{ liked: boolean, count: number }` (toggle)

### GET /api/memories/{id}/comments
- **Auth:** none
- **Response 200:** array of comment objects

### POST /api/memories/{id}/comments
- **Auth:** Bearer JWT
- **Body:** `{ text }`
- **Response 201:** created comment

## Frontend
- `/feed` — filter bar (city, topic, sort); memory cards with warmth count + comment count
- `/memories/:id` — warmth button (toggle); comment list + add-comment form (auth required)

## Acceptance Criteria
- Feed shows only public memories
- Filter by city narrows results
- Filter by topic narrows results
- Sort by "popular" orders by like count desc
- Like button toggles; count updates immediately (optimistic)
- Unauthenticated user cannot like or comment (prompt to login)
- Comment appears in list after submission
