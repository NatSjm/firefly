# Requirements Document

**Свитлячок (Svitlyachok)**

*Derived from `docs/prd.md` (2026-07-05). IDs are stable and never renumbered.
Rows marked ASSUMPTION are inferred from existing code; all others are stated in the PRD.*

## 1 Company Business Overview

Svitlyachok ("Firefly") is a Ukrainian childhood-memories platform for adults aged 25-50+.
Users preserve personal stories and recipes from their childhoods, share them publicly or
keep them private, discover community memories filtered by city and topic, and post
"Lost Fireflies" requests to reconnect with former classmates or find remembered places.

The primary audience includes internally displaced persons from cities affected by the war
(Mariupol, Kharkiv, etc.) who may no longer be able to return to their hometowns. The platform
tone is warm, calm, and Ukrainian-first — no exclamation marks, no hype.

MVP boundary: core memories CRUD, public feed with likes/comments, Lost Fireflies requests,
basic moderation and an admin panel, static content pages (About, Rules). Out of scope for
MVP: voice input, export, access circles, additional languages, native apps, notifications.

## 2 Functional Requirements (FR)

### 2.1 Shell & Navigation

| ID | Phase | Area | Description |
|---|---|---|---|
| FR-SHELL-01 | MVP | Shell | Single-page app with top bar (logo, nav links) and main content area |
| FR-SHELL-02 | MVP | Shell | Layout adapts at 768px and 1280px breakpoints |
| FR-SHELL-03 | MVP | Shell | Public pages accessible without login; create/edit actions require login |
| FR-SHELL-04 | MVP | Shell | Header: logo left, nav center/right, user menu / login button right |

### 2.2 Authentication & Profile

| ID | Phase | Area | Description |
|---|---|---|---|
| FR-AUTH-01 | MVP | Auth | User registers with email, password, and display name |
| FR-AUTH-02 | MVP | Auth | User logs in with email/password; token stored client-side |
| FR-AUTH-03 | MVP | Auth | User can log out; session cleared on logout |
| FR-AUTH-04 | MVP | Auth | Logged-in user can view and edit profile: name, bio, avatar URL |
| FR-AUTH-05 | MVP | Auth | Unauthenticated users redirected to /login for protected routes |

### 2.3 Personal Archive (Memories)

| ID | Phase | Area | Description |
|---|---|---|---|
| FR-MEM-01 | MVP | Memories | Authenticated user creates a memory of type `story` or `recipe` |
| FR-MEM-02 | MVP | Memories | Memory includes: title, text, optional ingredients/steps, city, topic, year range, one photo |
| FR-MEM-03 | MVP | Memories | User chooses visibility: private (only me) or public (visible in feed) |
| FR-MEM-04 | MVP | Memories | User views their memories in dashboard with filters: all / public / private |
| FR-MEM-05 | MVP | Memories | User can edit and delete their own memories |
| FR-MEM-06 | MVP | Memories | Single memory page shows full text + photo + metadata; private only to owner |

### 2.4 Public Feed & Community

| ID | Phase | Area | Description |
|---|---|---|---|
| FR-FEED-01 | MVP | Feed | Any visitor sees public feed of memories marked public |
| FR-FEED-02 | MVP | Feed | Feed filterable by city and topic |
| FR-FEED-03 | MVP | Feed | Feed sortable: new (by created_at) and popular (by likes count) |
| FR-FEED-04 | MVP | Feed | Memory card shows: author, city, title, excerpt, photo, topic, likes, comments count |
| FR-FEED-05 | MVP | Feed | Clicking a card navigates to the full memory page |
| FR-FEED-06 | MVP | Feed | Authenticated users toggle a "Warmth" (Тепло) like on a public memory |
| FR-FEED-07 | MVP | Feed | Authenticated users view and post comments on a public memory |

### 2.5 Topics & Cities

| ID | Phase | Area | Description |
|---|---|---|---|
| FR-TOPIC-01 | MVP | Topics | Predefined topic list: "Океан Ельзи", "Бабусині рецепти", "Комп'ютерні ігри", "Тамагочі", "Дворові ігри" |
| FR-TOPIC-02 | MVP | Topics | Memory creation: user selects one topic from dropdown |
| FR-CITY-01 | MVP | Cities | Memory has optional city (free text, suggested from predefined list) |
| FR-CITY-02 | MVP | Cities | Feed filterable by city via dropdown |

### 2.6 Lost Fireflies

| ID | Phase | Area | Description |
|---|---|---|---|
| FR-LOST-01 | MVP | Lost | Any visitor views the list of lost requests |
| FR-LOST-02 | MVP | Lost | Authenticated user creates a lost request: city*, type, years, description*, contactEmail* |
| FR-LOST-03 | MVP | Lost | Lost list filterable by city and type |
| FR-LOST-04 | MVP | Lost | Lost card shows: city, type, years, description excerpt, author, date |
| FR-LOST-05 | MVP | Lost | Lost detail shows full description and contact email (mailto link) |

### 2.7 Moderation & Rules

| ID | Phase | Area | Description |
|---|---|---|---|
| FR-MOD-01 | MVP | Moderation | Page /rules with community guidelines |
| FR-MOD-02 | MVP | Moderation | Authenticated users report a memory or comment (reason optional) |
| FR-MOD-03 | MVP | Moderation | Admin user views reports list at /admin |
| FR-MOD-04 | MVP | Moderation | Admin can delete memories/comments and ban users |
| FR-MOD-05 | MVP | Moderation | Public pages show visible link to report abuse and to rules |

### 2.8 Content Pages

| ID | Phase | Area | Description |
|---|---|---|---|
| FR-CONTENT-01 | MVP | Content | Public page /about describes the project |
| FR-CONTENT-02 | MVP | Content | Public page /rules contains community guidelines |

## 3 Non-Functional Requirements (NFR)

| ID | Category | Description |
|---|---|---|
| NFR-PERF-01 | Performance | TTFB ≤ 500ms p75 for primary pages on mid-range VPS |
| NFR-PERF-02 | Performance | Lighthouse Performance ≥ 80 (mobile + desktop) |
| NFR-A11Y-01 | Accessibility | Lighthouse Accessibility ≥ 90; visible focus styles; accessible names |
| NFR-A11Y-02 | Accessibility | WCAG AA contrast ratio for normal text and UI components |
| NFR-SEC-01 | Security | Passwords hashed with bcrypt before storage |
| NFR-SEC-02 | Security | All connections use HTTPS in production |
| NFR-I18N-01 | i18n | UI strings in `locales/uk/*.json` via react-i18next; no hardcoded Ukrainian strings |
| NFR-I18N-02 | i18n | Architecture supports adding languages later without major refactoring |
| NFR-OBS-01 | Observability | Console silent at runtime (no warnings/errors) on healthy session |
| NFR-DX-01 | DX | `docker compose up --build` finishes < 120s on clean checkout |

## 4 Constraints

### 4.1 Technical Constraints

| ID | Description |
|---|---|
| TC-STACK-01 | Backend: Kotlin (Spring Boot); REST API; PostgreSQL |
| TC-STACK-02 | Frontend: React + TypeScript; react-i18next; React Router |
| TC-STACK-03 | Database: PostgreSQL 15+ |
| TC-STACK-04 | File storage: server storage for images; served via /uploads |
| TC-DEPLOY-01 | Docker Compose; Nginx as reverse proxy and static server |
| TC-API-01 | All API paths under /api/**; Nginx proxies /api → backend, / → FE static |
| TC-DATA-01 | All UGC in PostgreSQL; no third-party structured data storage |

### 4.2 Business Constraints

| ID | Description |
|---|---|
| BC-BRAND-01 | Warm, calm, Ukrainian-first; no exclamation marks in UI copy |
| BC-BRAND-02 | Name "Свитлячок" used consistently; logo includes firefly/light metaphor |
| BC-PRIVACY-01 | Only memories explicitly marked public appear in public APIs |
| BC-PRIVACY-02 | Lost requests show only the provided contact email |
| BC-PRIVACY-03 | No third-party analytics or trackers in MVP |
| BC-MOD-01 | Community focused on kindness; no political battles or hate content |

## 5 Assumptions & Notes

- ASSUMPTION: `topic_slug` column stores Ukrainian display names (not slugs) for MVP simplicity.
- ASSUMPTION: Photo upload for memories is single-file, stored on local filesystem under /uploads.
- ASSUMPTION: Email confirmation on registration is deferred to post-MVP.
- ASSUMPTION: Lost requests are public (no auth required to read them).
- MVP scope: 37 FRs across 6 capability slices. Future phase: voice, export, access circles, native apps, notifications.

