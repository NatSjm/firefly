# ADR-0001 — Adopt existing stack as-is

**Date:** 2026-07-06  
**Status:** Accepted  
**Context:** Onboarding an existing codebase into project-factory governance.

## Decision

Adopt the stack already initialised in the repository without migration.

| Layer | Technology | Version |
|---|---|---|
| Backend language | Kotlin | 2.3.21 |
| Backend framework | Spring Boot | 4.1.0 |
| Backend ORM | Spring Data JPA / Hibernate | (BOM-managed) |
| DB migrations | Flyway | (BOM-managed) |
| Auth | JWT via auth0/java-jwt | 4.4.0 |
| Database | PostgreSQL | 16 (Docker), 15+ (prod target) |
| Frontend framework | React | 19 |
| Frontend build | Vite | 8 |
| Frontend language | TypeScript | 6 |
| Frontend routing | React Router | 7 |
| Frontend i18n | react-i18next + i18next | latest |
| Frontend HTTP | Axios | latest |
| Frontend lint | oxlint | latest |
| Package manager (FE) | pnpm | workspace |
| Container | Docker / Docker Compose | v2 |
| Reverse proxy | Nginx (inside FE container) | alpine |
| Monorepo root | pnpm workspace | — |

## Project layout

```
firefly/
  firefly-be/   — Spring Boot Kotlin backend
  firefly-fe/   — React/Vite frontend (with design system in src/design-system/)
  docs/         — PRD, requirements, ADRs, QA proof
  openspec/     — OpenSpec specs and project manifest
  scripts/      — deterministic check-* scripts and hooks
  .githooks/    — git hooks (pre-commit, commit-msg)
  .claude/      — agents and workflows
```

## Rationale

- Stack was chosen by the project owner before onboarding; migration costs exceed
  any theoretical gain.
- Spring Boot 4 + Jakarta EE namespaces; Java 21 used for Docker builds (Java 25
  local target — see application.properties).
- Existing design system (Svitlyachok) is a first-party component library inside
  `firefly-fe/src/design-system/`; no external UI library is adopted.
- Ukrainian-only for MVP (NFR-I18N-01), i18next structure supports future expansion.

## Consequences

- All feature work targets Kotlin/Spring Boot backend + React/Vite frontend.
- Docker Compose is the sole local and production deployment mechanism for MVP.
- No server-side rendering; SPA with Nginx as the production static server.
- AGENTS.md rule: use `jakarta.*` namespace, never `javax.*`.
