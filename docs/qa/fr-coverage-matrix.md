# FR Coverage Matrix

**Automated demo recordings for Firefly MVP**

## Coverage Summary

- **Total FRs:** 37 (MVP scope)
- **Covered by clips:** 36
- **Clips:** 13
- **Pending:** 1 (FR-AUTH-04 — profile edit not yet implemented)

## FR → Clip Mapping

### Shell & Navigation (4 FRs)

| FR ID | Description | Clip(s) | Status |
|-------|-------------|---------|--------|
| FR-SHELL-01 | SPA with header + content | 01-auth-register | ✅ |
| FR-SHELL-02 | Responsive layout (768px, 1280px) | 12-responsive-mobile | ✅ |
| FR-SHELL-03 | Public pages no auth; protected require auth | 04-memory-dashboard, 13-auth-guard-negative | ✅ |
| FR-SHELL-04 | Header: logo left, nav center/right, user menu right | 01-auth-register | ✅ |

### Authentication & Profile (5 FRs)

| FR ID | Description | Clip(s) | Status |
|-------|-------------|---------|--------|
| FR-AUTH-01 | User registers with email, password, name | 01-auth-register | ✅ |
| FR-AUTH-02 | User logs in; JWT stored | 02-auth-login-logout | ✅ |
| FR-AUTH-03 | User logs out; session cleared | 02-auth-login-logout | ✅ |
| FR-AUTH-04 | User views/edits profile | — | ⚠️ Not implemented |
| FR-AUTH-05 | Unauthenticated users redirected to /login | 02-auth-login-logout, 10-admin-moderation, 13-auth-guard-negative | ✅ |

### Personal Archive (Memories) (6 FRs)

| FR ID | Description | Clip(s) | Status |
|-------|-------------|---------|--------|
| FR-MEM-01 | User creates story or recipe | 03-memory-create | ✅ |
| FR-MEM-02 | Memory has title, text, ingredients/steps, city, topic, year, photo | 03-memory-create | ✅ |
| FR-MEM-03 | User chooses visibility (private/public) | 03-memory-create | ✅ |
| FR-MEM-04 | Dashboard with filters (all/public/private) | 04-memory-dashboard | ✅ |
| FR-MEM-05 | User edits/deletes own memories | 05-memory-view-edit | ✅ |
| FR-MEM-06 | Single memory page shows full content + metadata | 05-memory-view-edit | ✅ |

### Public Feed & Community (7 FRs)

| FR ID | Description | Clip(s) | Status |
|-------|-------------|---------|--------|
| FR-FEED-01 | Public feed visible without login | 06-feed-browse | ✅ |
| FR-FEED-02 | Feed filterable by city and topic | 06-feed-browse | ✅ |
| FR-FEED-03 | Feed sortable (new/popular) | 06-feed-browse | ✅ |
| FR-FEED-04 | Card shows author, city, title, excerpt, photo, topic, likes, comments | 06-feed-browse | ✅ |
| FR-FEED-05 | Click card → detail page | 06-feed-browse | ✅ |
| FR-FEED-06 | Authenticated users toggle Warmth (like) | 07-social-like-comment | ✅ |
| FR-FEED-07 | Authenticated users comment | 07-social-like-comment | ✅ |

### Topics & Cities (4 FRs)

| FR ID | Description | Clip(s) | Status |
|-------|-------------|---------|--------|
| FR-TOPIC-01 | Predefined topic list | 03-memory-create, 06-feed-browse | ✅ |
| FR-TOPIC-02 | User selects topic from dropdown | 03-memory-create | ✅ |
| FR-CITY-01 | Memory has optional city (autocomplete) | 03-memory-create | ✅ |
| FR-CITY-02 | Feed filterable by city | 06-feed-browse | ✅ |

### Lost Fireflies (5 FRs)

| FR ID | Description | Clip(s) | Status |
|-------|-------------|---------|--------|
| FR-LOST-01 | Any visitor views lost requests | 08-lost-browse-create | ✅ |
| FR-LOST-02 | Authenticated user creates lost request | 08-lost-browse-create | ✅ |
| FR-LOST-03 | Lost list filterable by city and type | 08-lost-browse-create | ✅ |
| FR-LOST-04 | Lost card shows city, type, years, description, author, date | 08-lost-browse-create | ✅ |
| FR-LOST-05 | Lost detail shows full description + contact email (mailto) | 08-lost-browse-create | ✅ |

### Moderation & Rules (5 FRs)

| FR ID | Description | Clip(s) | Status |
|-------|-------------|---------|--------|
| FR-MOD-01 | /rules page with community guidelines | 11-content-pages | ✅ |
| FR-MOD-02 | Authenticated users report memories/comments | 09-moderation-report | ✅ |
| FR-MOD-03 | Admin views reports at /admin | 10-admin-moderation, 13-auth-guard-negative | ✅ |
| FR-MOD-04 | Admin deletes content and bans users | 10-admin-moderation | ✅ |
| FR-MOD-05 | Public pages show report + rules links | 09-moderation-report | ✅ |

### Content Pages (2 FRs)

| FR ID | Description | Clip(s) | Status |
|-------|-------------|---------|--------|
| FR-CONTENT-01 | /about page describes project | 11-content-pages | ✅ |
| FR-CONTENT-02 | /rules page with guidelines | 11-content-pages | ✅ |

---

## Clip → FR Mapping

| Clip ID | Title | FRs Proven | Count |
|---------|-------|------------|-------|
| 01-auth-register | User registration | FR-AUTH-01, FR-SHELL-01, FR-SHELL-04 | 3 |
| 02-auth-login-logout | Login and logout | FR-AUTH-02, FR-AUTH-03, FR-AUTH-05 | 3 |
| 03-memory-create | Create recipe memory | FR-MEM-01, FR-MEM-02, FR-MEM-03, FR-TOPIC-02, FR-CITY-01 | 5 |
| 04-memory-dashboard | Dashboard filters | FR-MEM-04, FR-SHELL-03 | 2 |
| 05-memory-view-edit | View and edit memory | FR-MEM-05, FR-MEM-06 | 2 |
| 06-feed-browse | Public feed | FR-FEED-01, FR-FEED-02, FR-FEED-03, FR-FEED-04, FR-FEED-05, FR-CITY-02 | 6 |
| 07-social-like-comment | Like and comment | FR-FEED-06, FR-FEED-07 | 2 |
| 08-lost-browse-create | Lost fireflies | FR-LOST-01, FR-LOST-02, FR-LOST-03, FR-LOST-04, FR-LOST-05 | 5 |
| 09-moderation-report | Report content | FR-MOD-02, FR-MOD-05 | 2 |
| 10-admin-moderation | Admin panel | FR-MOD-03, FR-MOD-04, FR-AUTH-05 | 3 |
| 11-content-pages | Static pages | FR-CONTENT-01, FR-CONTENT-02, FR-MOD-01 | 3 |
| 12-responsive-mobile | Mobile viewport | FR-SHELL-02 | 1 |
| 13-auth-guard-negative | Security negative | FR-AUTH-05, FR-SHELL-03, FR-MOD-03 | 3 |

**Total assertions:** 40 (some FRs proven by multiple clips)

---

## Notes

### Redundancy for Critical FRs

Some FRs are proven by multiple clips for robustness:

- **FR-AUTH-05** (auth redirect): clips 02, 10, 13
- **FR-SHELL-03** (public vs protected): clips 04, 13
- **FR-MOD-03** (admin access): clips 10, 13

### Deferred (Post-MVP)

- **FR-AUTH-04** (profile edit): Not yet implemented in the UI. Clip placeholder exists but will pass gracefully.

### Test Data

All clips use deterministic test users:

```
demo@firefly.test / Demo1234! / Demo User
admin@firefly.test / Admin1234! / Admin User
```

---

**Last updated:** 2026-07-07 22:22 UTC+02:00  
**Source:** `scripts/record-demos.mjs`
