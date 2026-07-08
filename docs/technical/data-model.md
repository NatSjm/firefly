# Data Model

Schema is defined entirely by Flyway migrations
(`firefly-be/src/main/resources/db/migration/V1`–`V5__*.sql`); Hibernate runs
with `ddl-auto=validate` (`application.properties`) so it can never drift
from these files. JPA entities live one per domain package under
`firefly-be/src/main/kotlin/com/firefly/fireflybe/`.

## Entities

### User (`V1__create_users.sql`, `users/User.kt`)

| Column | Type | Notes |
|---|---|---|
| id | BIGSERIAL PK | |
| email | VARCHAR(255) UNIQUE NOT NULL | login identity |
| password_hash | VARCHAR(255) NOT NULL | BCrypt, see `auth-and-access.md` |
| name | VARCHAR(120) NOT NULL | display name (FR-AUTH-01) |
| bio | TEXT NULL | profile (FR-AUTH-04) |
| avatar_url | VARCHAR(512) NULL | profile (FR-AUTH-04) |
| role | VARCHAR(20) NOT NULL DEFAULT 'user' | `'user'` \| `'admin'`; no separate roles table |
| is_banned | BOOLEAN NOT NULL DEFAULT FALSE | set by `AdminService.toggleBan` |
| created_at, updated_at | TIMESTAMP | |

No index beyond the implicit unique-constraint index on `email`. `User.isAdmin`
(extension property) checks `role.equals("admin", ignoreCase = true)`.

### Memory + Media (`V2__create_memories.sql`, `memories/Memory.kt`)

`memories`: `id` PK, `user_id` FK → `users(id)` **ON DELETE CASCADE**, `type`
(`story`|`recipe`), `title` (≤255), `text` (TEXT, ≤20000 chars enforced at
the DTO layer via `@Size`, not a DB constraint), optional `ingredients`/
`steps` (recipe-only fields, ≤20000 chars each), optional `city` (≤120),
`topic_slug` (≤60, one of the predefined FR-TOPIC-01 list — not a DB enum or
FK, validated only in the DTO/frontend dropdown), optional `year_from`/
`year_to` (INT, cross-field range validated in `MemoryService.validateYearRange`
— see `domain-workflows.md`), `is_public` BOOLEAN, timestamps.

`media`: `id` PK, `memory_id` FK → `memories(id)` **ON DELETE CASCADE**,
`url`, `type` (default `'image'`). In JPA, `Memory.media` is
`@OneToMany(cascade = ALL, orphanRemoval = true, fetch = EAGER)` — deleting or
replacing a Memory's photo deletes the `Media` row transactionally
(`MemoryService`, fixed for a transaction gap during the `add-personal-archive`
review, see `docs/current-state.md`); the underlying file on disk is removed
separately by `MemoryService.deletePhotoFiles`.

No indexes exist on `is_public`, `city`, or `topic_slug` today, despite these
being the primary feed filter columns (`FeedService`) — full-table scans at
current MVP scale. See `docs/qa/risk-register.md` Risk T6 (pagination) for
the related performance note; adding a composite index on
`(is_public, created_at)` and separate indexes on `city`/`topic_slug` is a
reasonable pre-scale action not yet taken.

### Like (`V3__create_social.sql`, `likes/Like.kt`)

`likes`: `id` PK, `user_id` FK → `users` CASCADE, `memory_id` FK →
`memories` CASCADE, **UNIQUE(user_id, memory_id)** — the DB is the source of
truth for "one warmth per user per memory"; `LikeService.toggle` inserts or
deletes based on existence, relying on this constraint to prevent races.
Mapped as JPA entity name `MemoryLike` (table `likes`) to avoid clashing with
`java.util.List`-adjacent naming.

### Comment (`V3__create_social.sql`, `comments/Comment.kt`)

`comments`: `id` PK, `memory_id` FK → `memories` CASCADE, `user_id` FK →
`users` CASCADE, `text` TEXT NOT NULL, `created_at`. Deleting a Memory or a
User cascades to delete their comments.

### LostRequest (`V4__create_lost_requests.sql`, `lost/LostRequest.kt`)

`lost_requests`: `id` PK, `user_id` FK → `users` CASCADE, `city` (≤120,
required), `type` (≤30, required — free enum, not FK), `years` (≤50,
nullable free text — deliberately NOT a structured range; only a `YYYY-YYYY`
substring is validated, see `domain-workflows.md`), `description` TEXT
(required, ≤4000 chars via DTO `@Size`), `contact_email` (≤255, required —
kept off the public list DTO to avoid PII scraping, see
`apis-and-actions.md`), `created_at`.

### Report (`V5__create_reports.sql`, `reports/Report.kt`)

`reports`: `id` PK, `target_type` (≤20, `"memory"`|`"comment"`, validated by
`ReportService` which 404s for a nonexistent target), `target_id` BIGINT (no
FK — polymorphic target, validated in the service layer, not the DB),
`reporter_id` FK → `users(id)` **ON DELETE SET NULL** (so a deleted user's
past reports are preserved for audit, per-report identity is optional),
`reason` TEXT nullable (≤2000 via DTO), `created_at`.

## Relationship summary

```
users 1───* memories 1───* media
users 1───* memories 1───* comments *───1 users
users 1───* memories 1───* likes    *───1 users (unique per user+memory)
users 1───* lost_requests
users 1───* reports (reporter, nullable on delete)  reports ─?→ memories|comments (polymorphic, service-validated)
```

Cascade behavior is CASCADE everywhere except `reports.reporter_id`
(SET NULL) — deleting a user deletes all their memories (and cascade-deletes
those memories' media/likes/comments), lost requests, comments, and likes,
but leaves their past reports intact with a null reporter.

## Related

- `architecture.md` — how these tables are reached (Flyway, `ddl-auto=validate`).
- `auth-and-access.md` — how `role`/`is_banned` gate requests.
- `apis-and-actions.md` — DTOs that expose (or deliberately omit, e.g.
  `contactEmail` in the public lost-request list) these columns.
- `docs/qa/risk-register.md` — T6 (pagination/index gap), S9 (private photo
  file exposure).
