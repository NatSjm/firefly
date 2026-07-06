# Spec: Slice 3 — Personal Memory Archive

**Status:** retrofitted  
**FRs covered:** FR-MEM-01, FR-MEM-02, FR-MEM-03, FR-MEM-04, FR-MEM-05, FR-MEM-06, FR-MEM-07, FR-MEM-08  
**Slice:** 1.3

## Summary
CRUD for personal memories (stories and recipes), with optional photo upload and privacy toggle.

## Data Model

```sql
CREATE TABLE memories (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,       -- 'story' | 'recipe'
  title VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  ingredients TEXT,
  steps TEXT,
  city VARCHAR(120),
  topic_slug VARCHAR(60),
  year_from INT,
  year_to INT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP
);

CREATE TABLE media (
  id SERIAL PRIMARY KEY,
  memory_id INT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  url VARCHAR(512) NOT NULL,
  type VARCHAR(20) NOT NULL        -- 'image' | 'video'
);
```

## Endpoints

### GET /api/memories
- **Auth:** Bearer JWT (own memories only)
- **Query:** `type`, `isPublic`
- **Response 200:** paginated list of memory objects

### POST /api/memories
- **Auth:** Bearer JWT
- **Body:** multipart — `data` (JSON blob) + optional `photo` (file ≤ 10 MB)
- **Response 201:** created memory object

### GET /api/memories/{id}
- **Auth:** Bearer JWT (required for private; public accessible without auth)
- **Response 200:** memory object with media
- **Response 403:** private memory accessed by non-owner

### PUT /api/memories/{id}
- **Auth:** Bearer JWT (owner only)
- **Body:** multipart — `data` (JSON blob) + optional `photo`
- **Response 200:** updated memory object

### DELETE /api/memories/{id}
- **Auth:** Bearer JWT (owner only)
- **Response 204**

## Frontend
- `/dashboard` — grid of own memories; filter tabs (All/Public/Private); "Create" button
- `/memories/new` — form: type, title, text (recipe: ingredients + steps), city, topic, years, privacy, photo
- `/memories/:id` — full view; owner sees Edit/Delete buttons
- `/memories/:id/edit` — same form pre-filled

## Acceptance Criteria
- Create story → appears on /dashboard
- Create recipe with ingredients/steps → fields preserved
- Upload photo → thumbnail visible on memory detail page
- Private memory not visible to other users
- Owner can edit and delete their memory
- Delete removes media records and uploaded file
