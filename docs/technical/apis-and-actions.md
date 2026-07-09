# APIs & Actions

Full REST surface, grouped by controller (`firefly-be/src/main/kotlin/com/firefly/fireflybe/*/*Controller.kt`).
Auth column matches the route pattern's entry in `auth-and-access.md`'s
matrix — service-layer guards (e.g. ownership checks) are noted separately
where they narrow a `permitAll` route.

## Auth — `auth/AuthController.kt`

| Route | Method | Auth | Request → Response |
|---|---|---|---|
| `/api/auth/register` | POST | public, rate-limited | `RegisterRequest{email, password≥8, name}` → 201 `AuthResponse{token, user: AuthUserDto}` |
| `/api/auth/login` | POST | public, rate-limited | `LoginRequest{email, password}` → 200 `AuthResponse` |
| `/api/auth/me` | GET | authenticated | → `UserDto` (current user, from JWT principal) |

## Users — `users/UserController.kt`

| Route | Method | Auth | Request → Response |
|---|---|---|---|
| `/api/users/me` | PUT | authenticated | `UpdateProfileRequest{name?, bio?, avatarUrl?}` → `UserDto` |

## Memories — `memories/MemoryController.kt`

| Route | Method | Auth | Request → Response |
|---|---|---|---|
| `/api/memories` | GET | authenticated (`getMyMemories`) | query `type?`, `isPublic?` → `List<MemoryDto>` (caller's own memories only) |
| `/api/memories` | POST | authenticated | multipart: `data` (`MemoryRequest` JSON) + `photo?` → 201 `MemoryDto` |
| `/api/memories/{id}` | GET | public (filter chain) + service guard | → `MemoryDto`; `ensureViewAllowed` 403/404s a private memory for non-owners |
| `/api/memories/{id}` | PUT | authenticated, owner-only | multipart `data` + `photo?` → `MemoryDto` |
| `/api/memories/{id}` | DELETE | authenticated, owner-only | → 204 |

`MemoryRequest`: `type` (≤20), `title` (required, ≤255), `text` (required,
≤20000), `ingredients?`/`steps?` (≤20000 each), `city?` (≤120), `topicSlug?`
(≤60), `yearFrom?`/`yearTo?` (1900–2100, cross-checked in the service — see
`domain-workflows.md`), `isPublic` (default false). `MemoryDto` adds
`authorName`, `mediaUrls`, `likesCount`, `commentsCount`, `likedByMe`.

## Feed — `feed/FeedController.kt`

| Route | Method | Auth | Request → Response |
|---|---|---|---|
| `/api/feed` | GET | public | query `city?`, `topic?`, `sort=new\|popular` (default `new`), `page` (default 0), `size` (default 20, clamped 1–100) → `FeedResponse{items: List<MemoryDto>, total, page, totalPages}` |

Only memories with `is_public = true` are ever returned; `likedByMe` is
populated from the optional current user.

## Comments — `comments/CommentController.kt`

| Route | Method | Auth | Request → Response |
|---|---|---|---|
| `/api/memories/{memoryId}/comments` | GET | public | → `List<CommentDto>` |
| `/api/memories/{memoryId}/comments` | POST | authenticated | `CommentRequest{text≤5000}` → 201 `CommentDto` |
| `/api/memories/{memoryId}/comments/{commentId}` | DELETE | authenticated, owner-only | → 204 |

## Likes — `likes/LikeController.kt`

| Route | Method | Auth | Request → Response |
|---|---|---|---|
| `/api/likes` | POST | authenticated | `{memoryId}` → `LikeToggleResult` (toggles; relies on the `likes` table's `UNIQUE(user_id, memory_id)` constraint) |

## Lost requests — `lost/LostController.kt`

| Route | Method | Auth | Request → Response |
|---|---|---|---|
| `/api/lost-requests` | GET | public | query `city?`, `type?` → `List<LostRequestSummaryDto>` (no `contactEmail` — PII protection) |
| `/api/lost-requests` | POST | authenticated | `LostRequestRequest{city, type, years?, description≤4000, contactEmail}` → 201 `LostRequestDto` (includes `contactEmail`) |
| `/api/lost-requests/{id}` | GET | public | → `LostRequestDto` (full detail, includes `contactEmail`) |

## Reports — `reports/ReportController.kt`

| Route | Method | Auth | Request → Response |
|---|---|---|---|
| `/api/reports` | POST | authenticated | `ReportRequest{targetType≤20, targetId≥1, reason?≤2000}` → 201 `{status: "ok"}`; 400 unknown `targetType`, 404 nonexistent target |

## Admin — `admin/AdminController.kt`

All routes require `ROLE_ADMIN` (filter-chain `hasRole("ADMIN")` +
controller-level `@PreAuthorize`).

| Route | Method | Request → Response |
|---|---|---|
| `/api/admin/reports` | GET | → `List<AdminReportDto>` (id, targetType, targetId, reason, createdAt, reporterId — a projection, never the raw entity) |
| `/api/admin/users` | GET | → `List<AdminUserDto>` (id, name, email, role, isBanned) |
| `/api/admin/memories/{id}` | DELETE | → 204 (cascades to media/likes/comments) |
| `/api/admin/comments/{id}` | DELETE | → 204 |
| `/api/admin/users/{id}/ban` | POST | → `{banned: Boolean}` (self-ban and admin-ban blocked in `AdminService.toggleBan`) |

## Health — `health/HealthController.kt`

| Route | Method | Auth | Response |
|---|---|---|---|
| `/api/health` | GET | public | `{status: "ok", service: "svitlyachok-be"}` |

## Related

- `auth-and-access.md` — the security matrix these routes obey.
- `data-model.md` — entities behind each DTO.
- `domain-workflows.md` — narrative walkthroughs grouping these calls by user journey.
