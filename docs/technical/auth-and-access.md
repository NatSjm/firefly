# Auth & Access

Stateless JWT bearer-token auth. No sessions, no server-side token store, no
refresh-token endpoint in the MVP.

## Token lifecycle (`config/JwtService.kt`)

- **Issuance**: `AuthService.register`/`login` call `JwtService.generateToken(userId, email)`
  after `BCryptPasswordEncoder` verifies (or creates) the password hash.
  HMAC256-signed, `sub` = user id, `email` claim, `iat`, `exp` = now +
  `app.jwt.expiration-ms` (default 86 400 000 ms = 24h).
- **Validation**: `config/JwtFilter.kt` (a `OncePerRequestFilter` registered
  before `UsernamePasswordAuthenticationFilter`) reads the `Authorization:
  Bearer <token>` header, calls `JwtService.validateToken` (verifies
  signature + expiry, extracts user id), loads the `User` row, and — if the
  user exists **and is not banned** — sets a
  `UsernamePasswordAuthenticationToken(user, null, [ROLE_<role>])` into the
  `SecurityContext`. A banned or deleted user's still-valid-by-expiry token
  is silently treated as unauthenticated (no explicit 401 message
  distinguishing "banned" from "never logged in").
- **No revocation / refresh**: once issued, a token is valid until its `exp`
  regardless of password change, ban, or logout. Logout is a client-side-only
  token clear (`api/token.ts` `clearToken()`); the same token replayed from
  another client remains valid until expiry.
- **Startup warning** (`JwtService.warnIfSecretIsInsecure`, `@PostConstruct`):
  logs `ERROR` at boot if `app.jwt.secret` is blank or equals one of the two
  known placeholder strings shipped in `application.properties` /
  `docker-compose.yml`. This is a **warning, not a fail-fast** — the app has
  no Spring profile mechanism to distinguish dev/test/CI from production, and
  all of those currently boot on the same default. **Operational rule:
  before any real deployment, check the startup log is clean (no JWT
  security warning) — see `operations.md`.**

## Password hashing

`SecurityConfig.passwordEncoder()` = `BCryptPasswordEncoder()` (default
strength 10). `AuthService` hashes on register, verifies via
`passwordEncoder.matches` on login. Satisfies NFR-SEC-01
(`docs/requirements.md`).

## Rate limiting (`config/RateLimitFilter.kt`)

In-memory per-IP-per-path sliding window, registered **before** `JwtFilter`
in the chain. Applies only to `POST /api/auth/login` and `POST
/api/auth/register`: default 20 requests / 60 000 ms per
`X-Forwarded-For`-or-`remoteAddr` key (configurable via
`app.rate-limit.enabled|max-requests|window-ms`). Over the limit → `429` with
a Ukrainian JSON body. Disabled in the integration-test suite
(`IntegrationTestBase`'s `@DynamicPropertySource`) since those tests
legitimately register far more than 20 users/minute. Mitigates
credential-stuffing and bcrypt-cost CPU exhaustion — added in the Phase 7
global security review (`docs/current-state.md`).

## Security filter chain & route authorization matrix (`config/SecurityConfig.kt`)

CSRF disabled (stateless bearer tokens, not cookies — see Risk S5 in
`docs/qa/risk-register.md` for why this is acceptable here). Session policy
`STATELESS`. CORS: all origins/methods/headers permitted, credentials
**not** allowed (`allowCredentials = false`) — safe only because auth doesn't
use cookies.

| Route pattern | Method | Access |
|---|---|---|
| `/api/auth/register`, `/api/auth/login` | POST | public (rate-limited) |
| `/api/health` | GET | public |
| `/api/feed` | GET | public |
| `/api/memories/{id}` | GET | public* (service enforces private-memory ownership, see below) |
| `/api/memories/{memoryId}/comments` | GET | public (comments on public memories are public by design) |
| `/api/lost-requests/**` | GET | public |
| `/uploads/**` | GET | public, unauthenticated static files — **see Risk S9 below** |
| `/api/admin/**` | any | `ROLE_ADMIN` only (`.hasRole("ADMIN")`, reinforced by `@PreAuthorize("hasRole('ADMIN')")` on `AdminController`) |
| everything else | any | any authenticated user (`anyRequest().authenticated()`) |

Note the matcher is deliberately `GET /api/memories/{id}` (path variable),
**not** `GET /api/memories/**` — a global-review fix
(`docs/current-state.md`) after the wildcard form also matched the bare `GET
/api/memories` (list-my-memories), letting an anonymous request hit
`MemoryController.getMyMemories`'s unguarded `authentication.principal as
User` cast and 500 instead of 401. `GlobalExceptionHandler`'s catch-all
(`common/GlobalExceptionHandler.kt`) is the second line of defense — any
future unmapped exception returns a safe Ukrainian 500 message rather than a
raw stack trace.

"Public but service-guarded" routes: `GET /api/memories/{id}` is matched
`permitAll` at the filter-chain level (so anonymous visitors can view
*public* memories), but `MemoryService.ensureViewAllowed` inside the
controller still 403/404s a private memory viewed by anyone but its owner.
This split (filter chain vs. service-layer authorization) means the security
config alone does not tell you who can see what — always check the owning
service for private-resource rules. See `domain-workflows.md`.

## Known residual risks (not fixed, documented)

- **S9 — private memory photos reachable via `/uploads/**`.** The JSON
  metadata for a private memory is correctly guarded
  (`ensureViewAllowed`), but its photo file sits in the same public,
  unauthenticated static directory as public memories' photos — protected
  only by an unguessable UUID filename, not an ownership check. Full detail
  and proposed fix (an authenticated `/api/memories/{id}/photo` proxy
  endpoint) in `docs/qa/risk-register.md` Risk S9.
- **S10 — JWT stored in `localStorage`, not an httpOnly cookie**
  (`firefly-fe/src/api/token.ts`). No known XSS vector exists today (no
  `dangerouslySetInnerHTML` anywhere in `firefly-fe/src`), but any future XSS
  bug would allow full token exfiltration where an httpOnly-cookie design
  would not. Full detail in `docs/qa/risk-register.md` Risk S10.

## Related

- `architecture.md` — where the filter chain sits relative to nginx/Docker.
- `data-model.md` — `users.role`, `users.is_banned` columns.
- `apis-and-actions.md` — per-controller auth requirement (mirrors this
  table at the endpoint level).
- `docs/qa/risk-register.md` — S1–S10 (this page covers S2, S5, S6, S9, S10
  directly).
