# Operations

## Environment variables

| Var | Consumed by | Default (application.properties / docker-compose.yml) | Must override before real deploy |
|---|---|---|---|
| `DB_URL` | `spring.datasource.url` | `jdbc:postgresql://localhost:5432/firefly` | yes, point at real DB host |
| `DB_USER` | `spring.datasource.username` | `firefly` | yes |
| `DB_PASSWORD` | `spring.datasource.password` | `firefly` | **yes — plaintext dev default** |
| `JWT_SECRET` | `app.jwt.secret` (`config/JwtService.kt`) | `svitlyachok-secret-key-change-in-production-min-32-chars` (or `svitlyachok-local-dev-secret-change-in-prod` in `docker-compose.yml`) | **yes — critical.** Both defaults are known placeholders; `JwtService.warnIfSecretIsInsecure()` logs an `ERROR` at boot if left unset. See `auth-and-access.md`. |
| `UPLOAD_DIR` | `app.upload.dir` (`config/AppProperties.kt`) | `./uploads` (host) / `/app/uploads` (Docker, backed by the `uploads_data` named volume) | only if you need a different disk path |

No other env vars exist in the app — do not invent `EMAIL_*`, `SMTP_*`, or
similar; there is no email integration (`integrations.md`).

## Running locally

**DB-only (recommended for active development):**
```
docker compose up
```
Starts only `postgres:16-alpine` on `5432` with a healthcheck
(`pg_isready`). Then run the backend from your IDE / `mvnw` and the frontend
via `pnpm dev` (Vite proxies `/api` to `localhost:8080`) separately — this is
the fast inner loop.

**Full stack in Docker:**
```
docker compose --profile full up --build
```
Builds and starts `postgres`, `backend` (`firefly-be/Dockerfile`, port
`8080`), and `frontend` (`firefly-fe/Dockerfile`, nginx on port `80`,
proxying `/api` and `/uploads` to `backend`, `client_max_body_size 10m` for
photo uploads). NFR-DX-01 (`docs/requirements.md`) requires this to finish in
under 120s on a clean checkout.

## Migrations

Flyway (`spring.flyway.enabled=true`, `classpath:db/migration`) runs
automatically on every backend boot, applying any new
`V<n>__*.sql` file in `firefly-be/src/main/resources/db/migration/` in
order. `spring.jpa.hibernate.ddl-auto=validate` means Hibernate will refuse
to start if the JPA entity mappings don't match the migrated schema — it
never generates DDL itself. To add a schema change: write a new
`V6__description.sql`, never edit an already-applied migration file. See
`data-model.md` for the current schema (`V1`–`V5`).

## Health check

`GET /api/health` (`health/HealthController.kt`, public, no auth) returns
`{"status": "ok", "service": "svitlyachok-be"}`. Use this for container
orchestration liveness/readiness probes — no separate `/actuator/health` is
exposed (Spring Boot Actuator is not on the classpath).

## Seeding an admin user

**There is no wired `db:seed-admin` (or equivalent) script.** Neither the
root `package.json` nor `firefly-fe/package.json` defines one, and no such
script file exists under `scripts/`. To create the first admin today:
register a normal user via `/register`, then manually update that row —
`UPDATE users SET role = 'admin' WHERE email = '...';` — directly against
the Postgres instance. This is a real operational gap: document it in the
deployment runbook and consider adding an idempotent seed script (e.g. a
`scripts/seed-admin.mjs` reading `ADMIN_EMAIL`/`ADMIN_PASSWORD` and calling
`POST /api/auth/register` + the SQL update, or a Flyway
repeatable-migration `R__seed_admin.sql` gated behind an env check) before
onboarding a real ops team. See `docs/qa/risk-register.md` Risk S7 (admin
account management) for the related security note.

## Logs to check after any deploy

- Startup log must NOT contain `SECURITY WARNING: JWT_SECRET is not set to
  a real secret` (`JwtService`) — if present, `JWT_SECRET` was not
  overridden; forge-able admin tokens are possible. Fix before allowing
  any untrusted traffic.
- Flyway logs each migration applied (`o.f.core.internal.command.DbMigrate`)
  — confirm all `V1`–`V5` (or later) applied cleanly on first boot against a
  fresh database.

## Related

- `architecture.md` — component diagram this operates.
- `auth-and-access.md` — why the JWT-secret warning isn't fail-fast.
- `docs/qa/risk-register.md` — T1 (migration rollback), T2 (Java/Maven
  PKIX on Windows), S1 (HTTPS), S2 (JWT secret), S7 (admin account).
- `docs/current-state.md` — current environment/deployment facts as of the
  last handoff.
