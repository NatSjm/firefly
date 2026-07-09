# Project: Свитлячок (Svitlyachok / Firefly)

**Single source of truth for OpenSpec.** Capability specs live in `openspec/specs/`.

## Overview

Svitlyachok is a Ukrainian-language childhood-memories platform. Adults (25-50+)
can preserve personal stories and recipes, share them publicly or keep them private,
browse a community feed filtered by city and topic, and post "Lost Fireflies" requests
to find former classmates or remembered places. The platform targets internally
displaced persons and others who may no longer be able to return to their hometowns.

## Stack

See `docs/adr/ADR-0001-stack.md`. Summary:
- Backend: Kotlin 2.3.21, Spring Boot 4.1.0, PostgreSQL 16, Flyway, JWT
- Frontend: React 19, Vite 8, TypeScript 6, React Router 7, react-i18next, Axios
- Deployment: Docker Compose, Nginx (static + proxy inside FE container)

## Capabilities (one spec per slice)

| # | Slice | Status |
|---|---|---|
| 1 | `add-identity-and-access` | retrofitted |
| 2 | `add-personal-archive` | retrofitted |
| 3 | `add-public-feed-and-social` | retrofitted |
| 4 | `add-lost-fireflies` | retrofitted |
| 5 | `add-moderation-and-admin` | retrofitted |
| 6 | `add-content-pages` | retrofitted |

