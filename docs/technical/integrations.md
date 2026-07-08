# Integrations

**There are no third-party integrations in the MVP.** No email provider, no
payment processor, no external API, no analytics/tracking service (the
latter is an explicit product constraint — `BC-PRIVACY-03` in
`docs/requirements.md`). This is deliberate, not an oversight — do not add
one without an OpenSpec change documenting why.

## The one "integration-like" surface: file uploads

Memory photos are the only place the app writes/serves files outside the
database, so it's worth documenting like an integration even though it's
local disk, not a third party:

- **Write path**: `MemoryService.create`/`update` accept an optional
  multipart `photo` part, validate the extension against an image allowlist
  (`.jpg`, `.jpeg`, `.png` — HTTP 400 otherwise, see `docs/qa/risk-register.md`
  Risk T4), and write the bytes to `app.upload.dir` (env var `UPLOAD_DIR`,
  default `./uploads`) under a random UUID filename.
- **Read path**: `config/WebConfig.kt` registers `/uploads/**` as a Spring
  static resource handler pointed at that same directory — **fully public,
  unauthenticated**, for every memory regardless of its `is_public` flag.
  This is the residual risk documented in `docs/qa/risk-register.md` Risk S9
  and `auth-and-access.md` — a private memory's JSON is guarded, its photo
  bytes are not.
- **Cleanup**: deleting a memory (owner or admin) or replacing its photo
  removes both the `media` row (JPA `orphanRemoval`) and the file on disk
  (`MemoryService.deletePhotoFiles`, path-traversal-safe — constructs paths
  only from the stored UUID filename, never from user input directly).
- **Size limit**: 10 MB per upload, enforced by Spring's multipart config and
  by nginx's `client_max_body_size 10m` in the `full` Docker profile — see
  `docs/qa/risk-register.md` Risk T5.
- **No CDN, no object storage (S3-equivalent), no image resizing/thumbnailing
  pipeline** — photos are served at original resolution directly from the
  backend's local disk (or the `uploads_data` Docker volume in the `full`
  profile). This is a real scaling limit for a multi-instance deployment
  (each backend instance would need the same shared volume) — see
  `operations.md`.

## What's explicitly NOT here (and why it matters for onboarding)

- **Email**: no transactional email (no verification email, no password
  reset email, no notification email). `Lost Fireflies` contact happens via
  a `mailto:` link the browser opens directly (`LostDetailPage.tsx`) — the
  backend never sends mail on the user's behalf. If email is added later,
  budget for sandbox-sender limitations (e.g. `resend.dev`-style providers
  only deliver to the account owner until a domain is verified) — see
  `AGENTS.md`'s environment notes.
- **Payments**: none; the product has no paid tier.
- **Auth providers (OAuth/social login)**: none; only email+password.
- **Search**: the feed and lost-request filters are plain SQL `WHERE`
  clauses (`MemoryRepository`, `LostRepository`) with no full-text search
  index — see `data-model.md`'s note on missing indexes.

## Related

- `architecture.md` — where `/uploads/**` sits relative to nginx.
- `auth-and-access.md` — Risk S9 in full.
- `operations.md` — `UPLOAD_DIR` env var and the Docker volume that backs it.
