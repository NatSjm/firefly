# Spec: Slice 1 — Base Architecture & Skeleton

**Status:** retrofitted  
**FRs covered:** FR-AUTH-01 (partial), FR-HEALTH-01  
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
- `GET /api/health` returns 200 with `{"status":"ok"}`
- Navigating to any stub route renders the correct page without a 404
- i18n namespace `common` loads for locale `uk`
- `docker compose up` brings all services healthy
