# Spec: Slice 1 — Base Architecture & Skeleton

**Status:** retrofitted  
**FRs covered:** FR-SHELL-01, FR-SHELL-02, FR-SHELL-03, FR-SHELL-04  
**Slice:** 1.1

## Summary
Base project skeleton: Spring Boot backend with health endpoint, React frontend with routing and i18n, Nginx reverse proxy config, Docker Compose orchestration.

## Endpoints

### GET /api/health
- **Auth:** none
- **Response 200:** `{ "status": "ok" }`

## Frontend Routes (stubs)
| Path | Component |
|------|-----------|
| `/` | HomePage |
| `/about` | AboutPage |
| `/rules` | RulesPage |
| `/login` | LoginPage |
| `/register` | RegisterPage |
| `/dashboard` | DashboardPage |
| `/feed` | FeedPage |
| `/lost` | LostPage |

## Acceptance Criteria
- FR-SHELL-01: application is reachable via browser at the root URL
- FR-SHELL-02: navigation between all stub routes works without 404
- FR-SHELL-03: `GET /api/health` returns 200 with `{"status":"ok"}`
- FR-SHELL-04: i18n namespace `common` loads for locale `uk`
- `docker compose up` brings all services healthy
