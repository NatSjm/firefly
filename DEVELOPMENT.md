# Svitlyachok — Local Development Guide

## Stack
- **Backend** — Kotlin / Spring Boot 4.1, runs in IntelliJ
- **Database** — PostgreSQL 16, runs in Docker
- **Frontend** — React 19 / Vite, runs with pnpm

---

## 1. Start the database

```bash
# from repo root — starts only PostgreSQL (exposes port 5432)
docker compose up -d postgres
```

To stop: `docker compose down`  
Data is persisted in the `postgres_data` Docker volume.

---

## 2. Run the backend (IntelliJ)

Open `firefly-be/` as a Maven project in IntelliJ IDEA.

Run configuration:
- **Main class:** `com.firefly.fireflybe.FireflyBeApplication`
- **Environment variables** (set in Run → Edit Configurations → Environment):

```
DB_URL=jdbc:postgresql://localhost:5432/firefly
DB_USER=firefly
DB_PASSWORD=firefly
JWT_SECRET=svitlyachok-local-dev-secret-change-in-prod
UPLOAD_DIR=./uploads
```

> If you don't set these, the defaults in `application.properties` already match the Docker DB, so it works without any env vars too.

Flyway runs automatically on startup and applies all migrations from `src/main/resources/db/migration/`.

Verify the backend is up: `curl http://localhost:8080/api/health` → `{"status":"ok"}`

---

## 3. Run the frontend

```bash
cd firefly-fe
pnpm install   # first time only
pnpm run dev
```

Frontend opens at **http://localhost:5173**

The Vite dev proxy forwards `/api/**` → `http://localhost:8080`, so no CORS config needed.

---

## 4. Full stack in Docker (optional)

```bash
docker compose --profile full up --build
```

- Frontend: http://localhost:80
- Backend: http://localhost:8080
- DB: localhost:5432

---

## Quick reference

| Command | What it does |
|---------|-------------|
| `docker compose up -d postgres` | Start DB only |
| `docker compose down` | Stop all containers |
| `pnpm run dev` | Start FE dev server (http://localhost:5173) |
| `pnpm run build` | Production build |
| `pnpm run lint` | Lint FE code |
| `curl http://localhost:8080/api/health` | Check BE is alive |
