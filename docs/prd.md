# PRD — Svitlyachok (Firefly)

Last updated: 2026-07-05

This document is the **single source of truth** for what the product does and
what constraints govern it. Every requirement has a stable ID. Specs, tests,
PRs, and recordings reference these IDs to keep traceability intact.

Refer to [docs/product-brief.md](product-brief.md) for narrative context.

## ID conventions

| Prefix   | Meaning                  | Example                                      |
| -------- | ------------------------ | -------------------------------------------- |
| FR-*     | Functional Requirement   | `FR-AUTH-01` — user registers with email     |
| NFR-*    | Non-Functional Requirement | `NFR-PERF-01` — TTFB < 500 ms              |
| TC-*     | Technical Constraint     | `TC-STACK-01` — Kotlin + React              |
| BC-*     | Business / UX Constraint | `BC-PRIVACY-01` — no public data without consent |

Status values: `proposed` · `accepted` · `shipped` · `dropped`.

## Functional requirements

### Shell & navigation

| ID          | Description                                                                                           | Status     |
| ----------- | ----------------------------------------------------------------------------------------------------- | ---------- |
| FR-SHELL-01 | Single-page app with a top bar (logo "Svitlyachok", navigation links) and a main content area         | proposed   |
| FR-SHELL-02 | Layout adapts at 768 px and 1280 px breakpoints; mobile single-column, tablet two-column, desktop up to three-column | proposed   |
| FR-SHELL-03 | Public pages (home, feed, lost, about, rules) are accessible without login; create/edit actions require login | proposed   |
| FR-SHELL-04 | Header shows "Svitlyachok" logo on the left, navigation in the center/right, and user menu / login button on the right | proposed   |

### Authentication & profile

| ID          | Description                                                                                           | Status     |
| ----------- | ----------------------------------------------------------------------------------------------------- | ---------- |
| FR-AUTH-01  | User can register with email, password, and display name                                              | proposed   |
| FR-AUTH-02  | User can log in with email and password; session is stored client-side (token or cookie)              | proposed   |
| FR-AUTH-03  | User can log out; session is cleared on logout                                                        | proposed   |
| FR-AUTH-04  | Logged-in user can view and edit basic profile: name, short bio, optional avatar URL                  | proposed   |
| FR-AUTH-05  | Unauthenticated users see login prompts when trying to access protected routes (dashboard, create)    | proposed   |

### Personal archive (memories)

| ID            | Description                                                                                              | Status     |
| ------------- | -------------------------------------------------------------------------------------------------------- | ---------- |
| FR-MEM-01     | Authenticated user can create a memory of type `story` or `recipe`                                      | proposed   |
| FR-MEM-02     | Memory includes: title, text, optional ingredients & steps (for recipe), optional city, topic, year range, one optional photo | proposed   |
| FR-MEM-03     | User can choose memory visibility: `private` (only me) or `public` (visible in feed)                    | proposed   |
| FR-MEM-04     | User can view a list of their own memories in dashboard, with filters: all / public / private           | proposed   |
| FR-MEM-05     | User can edit and delete their own memories                                                             | proposed   |
| FR-MEM-06     | User can view a single memory page (full text, photo, metadata); private memories are visible only to owner | proposed   |

### Public feed & community

| ID            | Description                                                                                              | Status     |
| ------------- | -------------------------------------------------------------------------------------------------------- | ---------- |
| FR-FEED-01    | Any visitor can view a public feed of memories marked as public                                         | proposed   |
| FR-FEED-02    | Feed supports filtering by city (nullable) and topic (nullable)                                         | proposed   |
| FR-FEED-03    | Feed supports sorting: `new` (by created_at) and `popular` (by likes count)                             | proposed   |
| FR-FEED-04    | Each memory card in feed shows: author name, optional city, title, text excerpt, optional photo, topic, likes count, comments count | proposed   |
| FR-FEED-05    | Clicking a memory card navigates to the full memory page                                                | proposed   |
| FR-FEED-06    | Authenticated users can toggle a like ("Warmth") on a public memory                                      | proposed   |
| FR-FEED-07    | Authenticated users can view and post comments on a public memory                                       | proposed   |

### Topics & cities

| ID            | Description                                                                                              | Status     |
| ------------- | -------------------------------------------------------------------------------------------------------- | ---------- |
| FR-TOPIC-01   | System supports a predefined list of topics (e.g. "Okean Elzy", "Grandma's Recipes", "Computer Games", "Tamagotchi") | proposed   |
| FR-TOPIC-02   | When creating/editing a memory, user selects one topic from a dropdown                                  | proposed   |
| FR-TOPIC-03   | Topic pages exist at `/topic/:slug` and show a filtered feed for that topic                             | proposed   |
| FR-CITY-01    | Memory can have an optional city (free text, suggested from a small predefined list for MVP)            | proposed   |
| FR-CITY-02    | Feed supports filtering by city via a dropdown selector                                                 | proposed   |
| FR-CITY-03    | City pages exist at `/city/:name` and show a filtered feed for that city                                | proposed   |

### Lost & Found ("Загублені світлячки")

| ID            | Description                                                                                              | Status     |
| ------------- | -------------------------------------------------------------------------------------------------------- | ---------- |
| FR-LOST-01    | Any visitor can view a list of lost requests                                                            | proposed   |
| FR-LOST-02    | Authenticated user can create a lost request with: city (required), type (kindergarten/school/camp/yard/other), years (text), description, contact email | proposed   |
| FR-LOST-03    | Lost request list supports filtering by city and type                                                   | proposed   |
| FR-LOST-04    | Each lost request card shows: city, type, years, short description, author name, created date           | proposed   |
| FR-LOST-05    | Lost request detail page shows full description and contact email; clicking email opens mailto link     | proposed   |

### Moderation & rules

| ID            | Description                                                                                              | Status     |
| ------------- | -------------------------------------------------------------------------------------------------------- | ---------- |
| FR-MOD-01     | System has a page `/rules` with community guidelines (kindness, respect, no hate, no spam)              | proposed   |
| FR-MOD-02     | Authenticated users can report a memory or comment (reason is optional)                                 | proposed   |
| FR-MOD-03     | Admin user can view a list of reports in `/admin`                                                       | proposed   |
| FR-MOD-04     | Admin can delete memories and comments, and ban users                                                   | proposed   |
| FR-MOD-05     | Public pages show a visible link to report abuse and to rules                                           | proposed   |

### Content pages

| ID            | Description                                                                                              | Status     |
| ------------- | -------------------------------------------------------------------------------------------------------- | ---------- |
| FR-CONTENT-01 | Public page `/about` describes what Svitlyachok is, for whom, and key ideas                               | proposed   |
| FR-CONTENT-02 | Public page `/rules` contains community guidelines and basic privacy / safety notes                     | proposed   |

## Non-functional requirements

| ID            | Description                                                                                                            | Status     |
| ------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------- |
| NFR-PERF-01   | TTFB ≤ 500 ms on p75 for primary pages (home, feed, memory detail) on a mid-range VPS                                | proposed   |
| NFR-PERF-02   | Lighthouse Performance ≥ 80 on production URL (mobile + desktop)                                                       | proposed   |
| NFR-A11Y-01   | Lighthouse Accessibility ≥ 90; all interactive elements have visible focus styles and accessible names                | proposed   |
| NFR-A11Y-02   | Color palette meets WCAG AA contrast ratio for normal text and UI components                                          | proposed   |
| NFR-SEC-01    | Passwords are hashed with a strong algorithm (e.g. bcrypt) before storage                                             | proposed   |
| NFR-SEC-02    | All connections use HTTPS in production                                                                                | proposed   |
| NFR-I18N-01   | Product UI strings centralised in `locales/uk/*.json` using `react-i18next`; no hardcoded Ukrainian strings in components | proposed   |
| NFR-I18N-02   | Architecture supports adding more languages later without major refactoring                                            | proposed   |
| NFR-OBS-01    | Console is silent at runtime (no warnings, no errors) on a healthy session                                             | proposed   |
| NFR-DX-01     | `docker compose up --build` finishes in < 120 s on a clean checkout; backend and frontend start without manual steps  | proposed   |

## Technical constraints

| ID            | Description                                                                                                                            | Status     |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| TC-STACK-01   | Backend: Kotlin (Ktor or Spring Boot); REST API; PostgreSQL                                                                             | accepted   |
| TC-STACK-02   | Frontend: React (with TypeScript optional); react-i18next for i18n; React Router                                                       | accepted   |
| TC-STACK-03   | Database: PostgreSQL 15+                                                                                                               | accepted   |
| TC-STACK-04   | File storage: S3-compatible or simple server storage for images; images served over HTTPS                                              | accepted   |
| TC-DEPLOY-01  | Single VPS with Docker / Docker Compose; Nginx as reverse proxy and TLS terminator                                                     | accepted   |
| TC-API-01     | All API paths under `/api/**`; Nginx proxies `/api/**` to backend, `/` to frontend static files                                        | accepted   |
| TC-DATA-01    | All user-generated content (memories, comments, lost requests) is stored in PostgreSQL; no third-party storage for structured data    | accepted   |
| TC-PURE-01    | `lib/` (if any) on backend is free of framework-specific globals where possible; core logic is testable                               | proposed   |

## Business / UX constraints

| ID             | Description                                                                                                          | Status     |
| -------------- | -------------------------------------------------------------------------------------------------------------------- | ---------- |
| BC-BRAND-01    | Visual identity is warm, calm, Ukrainian-first; tone is practical, no exclamation marks                             | accepted   |
| BC-BRAND-02    | Name "Svitlyachok" is used consistently in UI and metadata; logo includes a firefly or light metaphor                 | accepted   |
| BC-PRIVACY-01  | Public feed shows only memories explicitly marked as public; private memories are never exposed in public APIs       | accepted   |
| BC-PRIVACY-02  | Lost requests show only the provided contact email; no hidden personal data is exposed                               | accepted   |
| BC-PRIVACY-03  | No third-party analytics or trackers in MVP                                                                          | accepted   |
| BC-DEMO-01     | The repo and live URL are the primary artifacts; every requirement is publicly demonstrable                          | accepted   |
| BC-MOD-01      | Community is focused on kindness, childhood, and warmth; political battles and hate are not allowed                  | accepted   |

## Out of scope (MVP)

- Voice input (telling stories by voice, saving as text)
- Expanded access circles (family, friends, custom lists)
- Export to PDF / photo books
- Legacy settings (archive heirs)
- Additional languages beyond Ukrainian
- Native mobile apps
- Complex social features (messenger, notifications, subscriptions)