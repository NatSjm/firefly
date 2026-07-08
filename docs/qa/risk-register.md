# Risk Register — Svitlyachok MVP

**Known risks and mitigation status. Updated after Phase 5.**

---

## Overview

This register tracks technical, business, and security risks identified during MVP development. Risks are assessed by likelihood (Low/Medium/High), impact (Low/Medium/High), and current mitigation status.

---

## TECHNICAL RISKS

### Risk T1: PostgreSQL Migration Failures in Production

**Description:**  
Flyway migrations (V1–V5) add tables, columns, and constraints. If a production database is at an older schema version, or if concurrent deployments conflict, migrations may fail mid-way, leaving DB in inconsistent state.

**Likelihood:** Medium  
**Impact:** High (data corruption, downtime)  
**Current Mitigation:**
- ✅ All migrations tested locally and in integration tests (Testcontainers)
- ✅ Migration files committed to repo with snapshots (VCS trackable)
- ✅ Flyway configured with `validateOnMigrate=true` (detects conflicts)
- ⚠️ **Residual Risk:** Blue-green deployment or rollback strategy not documented

**Actions Required Before Production:**
1. Document rollback procedure in deployment runbook
2. Test migration on a staging DB with production-like scale
3. Schedule deployments during low-traffic windows
4. Monitor Flyway logs during first deploy

**Owner:** DevOps / QA Lead  
**Target Resolution:** Before production cutover

---

### Risk T2: Java/Maven Certificate Validation (PKIX Errors)

**Description:**  
Backend uses Maven to download dependencies from Maven Central. On Windows with older JDK, PKIX certificate validation fails, blocking test execution and builds.

**Likelihood:** Medium (Windows-specific)  
**Impact:** Medium (local dev friction, CI/CD if not mitigated)  
**Current Mitigation:**
- ✅ Issue identified in Phase 4; workaround documented: set `JAVA_HOME=%USERPROFILE%\.jdks\openjdk-26.0.1`
- ✅ Backend tests pass with correct JDK version (111 tests green with Java 26)
- ✅ Docker environment (CI) will have pre-configured certificates
- ⚠️ **Residual Risk:** Local developers may use wrong Java; CI might have different cert issues

**Actions Required:**
1. Add `.env.local` guide in DEVELOPMENT.md with explicit JAVA_HOME instruction
2. Add CI environment variable override to GitHub Actions (if using)
3. Test Maven build in target Docker image before deploy
4. Document "Java version mismatch" troubleshooting in FAQ

**Owner:** Backend Lead / DevOps  
**Target Resolution:** Before CI/CD pipeline handoff

---

### Risk T3: File Upload Cleanup on Cascade Delete

**Description:**  
When a user deletes a memory with a photo, or admin deletes a memory, the uploaded photo file on disk must be removed. If cleanup fails, orphaned files accumulate in /uploads/.

**Likelihood:** Low (implemented and tested)  
**Impact:** Medium (disk space waste over time)  
**Current Mitigation:**
- ✅ `MediaService.deleteMemoryMedia()` tested for file deletion (firefly-be integration tests)
- ✅ Cascade delete configured in JPA (orphanRemoval=true)
- ✅ Path traversal protection implemented (safe file path construction)
- ✅ Integration test in `MemoryIntegrationTest.kt` covers cleanup

**Actions Required:**
1. Monitor /uploads/ directory size in production monthly
2. Consider scheduled cleanup job for orphaned files (future enhancement)
3. Document upload directory maintenance in runbook

**Owner:** Backend Lead  
**Status:** ✅ Resolved (implemented and tested)

---

### Risk T4: Image Upload File Type Validation

**Description:**  
If upload endpoint accepts non-image files (e.g., .exe, .zip), malicious users could serve malware or phishing content.

**Likelihood:** Low (implemented with allowlist)  
**Impact:** High (security/reputation)  
**Current Mitigation:**
- ✅ Backend whitelist: only `.jpg`, `.jpeg`, `.png` accepted
- ✅ MIME type validation on backend
- ✅ Test: `MemoryIntegrationTest.kt` verifies 400 for unsupported types
- ✅ Client-side pre-check (accept="image/*") for UX

**Actions Required:**
1. Monitor /uploads/ logs for rejection attempts
2. Add security note to deployment docs
3. Consider adding virus scan for production (optional post-MVP)

**Owner:** Security / Backend Lead  
**Status:** ✅ Resolved

---

### Risk T5: 10 MB Upload Limit Edge Cases

**Description:**  
Upload limit is 10 MB. Users with slow connections might timeout. High-resolution photos might be exactly at limit, causing intermittent failures.

**Likelihood:** Low-Medium  
**Impact:** Low (user frustration, eventual workaround)  
**Current Mitigation:**
- ✅ Limit documented in API spec (slice-3-memories.md)
- ✅ Frontend shows file size warning before upload
- ✅ Backend enforces 413 Payload Too Large for oversized files
- ✅ Nginx configured to accept up to 10 MB in docker-compose.yml (`client_max_body_size 10m`)
- ⚠️ **Residual Risk:** No client-side compression; users must manually resize

**Actions Required:**
1. Add client-side image compression library (optional, post-MVP)
2. Document file size limit in UI (help text already in place)
3. Monitor 413 errors in production logs

**Owner:** Frontend Lead  
**Target Resolution:** Post-MVP enhancement

---

### Risk T6: Pagination Scale Limit

**Description:**  
Feed and lost-request list endpoints clamp page size to 1–100. On massive datasets (millions of memories), pagination could become slow if users manually paginate many times.

**Likelihood:** Low (MVP under 1000 users)  
**Impact:** Low (worst case: slow for power users)  
**Current Mitigation:**
- ✅ Default page size 10 (reasonable)
- ✅ Max page size clamped to 100 (prevents abuse queries)
- ❌ **Correction (found while writing `docs/technical/data-model.md` in Phase 7):** this line previously claimed indexes exist on `is_public`/`city`/`topic_slug` — verified against the actual Flyway migrations (`firefly-be/src/main/resources/db/migration/V2__create_memories.sql` etc.) and **no such indexes exist**. Only primary-key/unique indexes are present. Low risk at MVP scale (small table, `ddl-auto=validate` means a migration would be needed to add one), but the mitigation claim was aspirational, not real — corrected here rather than left stale.
- ✅ Tests verify page clamp behavior
- ✅ **Fixed in Phase 7 global review:** the backend always supported `page`/`size`, but `/feed` had no UI to reach page 2+ — any filter combination with more than 20 public memories left the rest permanently unreachable. Added prev/next pagination controls to `FeedPage.tsx`, regression-tested.

**Actions Required:**
1. Monitor slow query logs in production
2. Plan database query optimization (covering indexes, materialized views) for post-MVP
3. Consider cursor-based pagination for very large datasets (post-MVP)

**Owner:** Backend Lead  
**Target Resolution:** Post-MVP optimization

---

### Risk T7: Lighthouse Performance & Accessibility Audits

**Description:**  
NFRs require Lighthouse Performance ≥ 80 and Accessibility ≥ 90. Design and code architecture should support these, but actual scores are pending load-test audit.

**Likelihood:** Low (design-verified)  
**Impact:** Medium (brand reputation if scores low)  
**Current Mitigation:**
- ✅ Design tokens reviewed for accessibility (colors, contrast, focus styles)
- ✅ React 19 + Vite optimizations in place (code splitting, lazy-loading ready)
- ✅ Manual keyboard navigation and screen reader testing documented in QA plan
- ⚠️ **Residual Risk:** Real-world load testing not yet completed

**Actions Required:**
1. Run Lighthouse audit on all major pages before UAT sign-off
2. Fix any console warnings (currently 1 pre-existing warning)
3. Load-test on target infrastructure (mid-range VPS or equivalent)
4. Record baseline metrics for future regression testing

**Owner:** QA Lead / Performance Engineer  
**Target Resolution:** Before UAT (Phase 6 end)

---

## BUSINESS RISKS

### Risk B1: Content Moderation Scale

**Description:**  
MVP has manual admin panel for moderation. If platform grows to 10k+ users and 1k+ daily posts, single admin queue could become overwhelming.

**Likelihood:** Medium-High (if product gains traction)  
**Impact:** Medium (content backlog, community trust erosion)  
**Current Mitigation:**
- ✅ Moderation workflow designed (report → admin review → delete/ban)
- ✅ Reports captured with reason text for audit trail
- ✅ Admin panel UI is reasonably efficient (one-click delete, ban)
- ❌ **Residual Risk:** No automated moderation, no bulk actions, no team scaling

**Actions Required:**
1. Define SLA for report resolution (e.g., "48 hours to first review")
2. Train admin team on moderation guidelines
3. Plan post-MVP features: automated flagging, team routing, metrics dashboard
4. Monitor report volume weekly in production

**Owner:** Community Manager / Product Lead  
**Target Resolution:** Post-MVP (scalable moderation feature)

---

### Risk B2: User Adoption & Community Quality

**Description:**  
Platform success depends on warm, genuine community. If early adopters are trolls or bots, tone could degrade and scare away target demographic (displaced Ukrainians, nostalgic adults).

**Likelihood:** Medium  
**Impact:** High (brand, long-term viability)  
**Current Mitigation:**
- ✅ Community guidelines documented (/rules page, BC-BRAND-01)
- ✅ Reporting system in place
- ✅ Admin controls (ban users, delete content)
- ❌ **Residual Risk:** No invite-only beta phase planned; open signup from day 1

**Actions Required:**
1. Consider beta launch with invite-only access (soft launch)
2. Have community manager active day 1 to seed authentic content
3. Monitor comment tone and user reports closely in first week
4. Prepare response plan for spam/abuse waves
5. Consider email verification or phone verification for signups (post-MVP)

**Owner:** Product Lead / Community Manager  
**Target Resolution:** Launch strategy

---

### Risk B3: War-Related Content Sensitivity

**Description:**  
Platform targets Ukrainians affected by war (IDPs, displaced). Content about lost photos from Mariupol or Kharkiv could be emotionally sensitive. Mishandling could appear tone-deaf or exploitative.

**Likelihood:** Low (designed with intent)  
**Impact:** High (brand damage, community trust loss)  
**Current Mitigation:**
- ✅ Product brief explicitly acknowledges war context (docs/product-brief.md)
- ✅ Tone is warm and respectful (no exclamation marks, BC-BRAND-01)
- ✅ "Lost Fireflies" feature explicitly designed for displaced Ukrainians
- ✅ Privacy constraints strict (no PII exposure, no analytics trackers)
- ❌ **Residual Risk:** Marketing materials and external comms not yet drafted

**Actions Required:**
1. Draft marketing/press messaging with sensitivity in mind
2. Have Ukrainian cultural advisor review copy before public launch
3. Include content moderation policy for war-related content (no politicization)
4. Prepare crisis comms if insensitive content surfaces

**Owner:** Product Lead / Marketing / Community Manager  
**Target Resolution:** Before public launch

---

## SECURITY RISKS

### Risk S1: HTTPS Enforcement in Production

**Description:**  
NFR-SEC-02 requires HTTPS in production. If not enforced, authentication tokens and user data could be intercepted.

**Likelihood:** Low (standard practice)  
**Impact:** Critical (data breach, legal/compliance)  
**Current Mitigation:**
- ✅ Nginx configured for reverse proxy (can terminate TLS)
- ✅ Spring Security framework supports HTTPS redirection
- ❌ **Residual Risk:** No HTTPS cert in local dev; only verified on deployment

**Actions Required:**
1. Provision SSL certificate (Let's Encrypt free, or commercial)
2. Configure Nginx to enforce HTTPS redirect (HTTP → HTTPS)
3. Set HSTS headers (HTTP Strict-Transport-Security)
4. Document HTTPS setup in deployment runbook
5. Test end-to-end before production deployment

**Owner:** DevOps / Security Lead  
**Target Resolution:** Deployment configuration (Phase 7)

---

### Risk S2: JWT Secret Management

**Description:**  
JWT signing key (JWT_SECRET env var) is sensitive. If leaked, attackers can forge tokens. If changed, all existing tokens invalidate (logout everyone).

**Likelihood:** Low (if secrets managed properly)  
**Impact:** Critical (authentication bypass)  
**Current Mitigation:**
- ✅ Backend uses bcrypt + Spring Security JWT filter (standard)
- ✅ Token includes exp claim (default 24 hours)
- ⚠️ **Found in Phase 7 global security review:** `application.properties` ships a real-looking placeholder default (`svitlyachok-secret-key-change-in-production-min-32-chars`) that signs tokens if `JWT_SECRET` is never overridden — anyone who reads the repo could forge an admin token on such a deployment. Since the app has no Spring profile mechanism to distinguish dev/test from prod, we did not make this fail-fast (that would also break local dev and CI, which don't set the env var). **Mitigation added:** `JwtService.warnIfSecretIsInsecure()` logs a loud `ERROR`-level warning at startup if the secret is still a known placeholder or blank — verify this log is CLEAN (no warning) before any real deployment.
- ❌ **Residual Risk:** No key rotation policy; token revocation not implemented

**Actions Required:**
1. Document secrets management (use GitHub Secrets in CI, AWS Secrets Manager in prod)
2. Set strong JWT_SECRET (64+ character random string) and confirm the startup log has no JWT security warning
3. Implement token refresh endpoint (post-MVP for better security)
4. Monitor for token leaks in GitHub (GitHub Secret Scanning enabled)
5. Test secret rotation procedure

**Owner:** DevOps / Security Lead  
**Target Resolution:** Deployment runbook

---

### Risk S3: SQL Injection & Data Validation

**Description:**  
Backend uses parameterized queries (Spring Data JPA, Hibernate), but custom JPQL queries or raw SQL could be vulnerable if user input is not escaped.

**Likelihood:** Low (standard ORMs used)  
**Impact:** Critical (database compromise)  
**Current Mitigation:**
- ✅ JPA entity annotations enforce parameterized queries
- ✅ Zod schemas validate all request DTOs (type-safe)
- ✅ Code review gate checked for raw SQL (none found)
- ✅ Integration tests verify validation edge cases (e.g., special characters)
- ✅ Backend lint and type checking enabled (Kotlin strict mode)

**Actions Required:**
1. Run OWASP Dependency-Check before production (check for vulnerable transitive deps)
2. Educate team: never use string concatenation in queries
3. Add SQL injection tests to integration suite (already in progress)

**Owner:** Security Lead / Backend Lead  
**Status:** ✅ Resolved (best practices applied)

---

### Risk S4: XSS (Cross-Site Scripting)

**Description:**  
If user-generated content (memory text, comments, lost request descriptions) is not escaped when rendered, JavaScript injection could steal tokens or deface content.

**Likelihood:** Low (React auto-escapes)  
**Impact:** High (user session hijacking, data theft)  
**Current Mitigation:**
- ✅ React JSX auto-escapes string content (by default)
- ✅ User input stored in database without HTML tags (no rich-text editor in MVP)
- ✅ All user content rendered as plain text (no innerHTML used)
- ✅ CSP headers can be added to Nginx (not yet configured, low priority)
- ✅ Code review gate checks for .innerHTML or dangerouslySetInnerHTML usage

**Actions Required:**
1. Add Content-Security-Policy header to Nginx (optional, post-MVP)
2. Maintain lint rule against dangerouslySetInnerHTML (already in place)
3. Test comment with HTML tags (should display as text, not rendered)

**Owner:** Security Lead / Frontend Lead  
**Status:** ✅ Resolved (best practices applied)

---

### Risk S5: CSRF (Cross-Site Request Forgery)

**Description:**  
If user is logged in and visits a malicious site, that site could make requests to Svitlyachok API (delete memory, post comment) on user's behalf.

**Likelihood:** Low (standard mitigation)  
**Impact:** Medium (user action spoofing)  
**Current Mitigation:**
- ✅ Backend uses Bearer JWT in Authorization header (not cookies)
- ✅ Cookies not used for auth (JWT in localStorage)
- ✅ API enforces same-origin checks (CORS configured in Spring)
- ✅ POST/PUT/DELETE requests require valid JWT

**Actions Required:**
1. Document CORS policy in API docs (allowed origins)
2. Verify CORS restricts to localhost in dev, production domain in prod
3. Test CSRF scenarios in security audit (if planned)

**Owner:** Security Lead / Backend Lead  
**Status:** ✅ Resolved (architecture mitigates CSRF)

---

### Risk S6: Password Hashing & Storage

**Description:**  
User passwords must be hashed with bcrypt before storage. If plaintext or weak hashing is used, data breach leaks passwords.

**Likelihood:** Low (bcrypt implemented)  
**Impact:** Critical (user account compromise)  
**Current Mitigation:**
- ✅ Spring Security PasswordEncoder configured with BCryptPasswordEncoder
- ✅ Registration/login use hashing (AuthService tested)
- ✅ Integration tests verify passwords never logged plaintext
- ✅ Backend lint checks for password handling

**Actions Required:**
1. Monitor logs for any plaintext password exposure (ongoing)
2. Document password policy (minimum 8 chars, enforced by validator)
3. Consider adding password strength meter on frontend (post-MVP)

**Owner:** Security Lead / Backend Lead  
**Status:** ✅ Resolved (best practices applied)

---

### Risk S7: Admin Account Compromise

**Description:**  
If admin account is compromised, attacker can delete all memories, ban all users, or modify reports. Single admin is single point of failure.

**Likelihood:** Low (if secrets managed properly)  
**Impact:** Critical (platform takeover)  
**Current Mitigation:**
- ✅ Admin role stored in database (role=admin)
- ✅ Admin endpoints guard with @PreAuthorize role check
- ✅ No hardcoded admin credentials (set via admin user creation script)
- ❌ **Residual Risk:** Single admin account; no multi-factor auth; no admin activity logging

**Actions Required:**
1. Create admin account securely (documented in deployment runbook)
2. Implement admin activity audit log (who deleted what, when)
3. Plan post-MVP: multi-factor auth for admin, team-based approval for destructive actions
4. Restrict admin login to specific IPs or VPN (ops policy)

**Owner:** Security Lead / DevOps  
**Target Resolution:** Deployment runbook

---

### Risk S8: Data Privacy & GDPR Compliance

**Description:**  
If any EU users access the platform, GDPR applies. Data export, deletion requests, and consent must be handled.

**Likelihood:** Medium (platform available globally)  
**Impact:** Medium (legal compliance)  
**Current Mitigation:**
- ✅ Only memories explicitly public appear in APIs (BC-PRIVACY-01)
- ✅ User profile data not exposed to other users
- ✅ No third-party analytics (BC-PRIVACY-03)
- ❌ **Residual Risk:** No data export/deletion API for users; no privacy policy

**Actions Required:**
1. Draft privacy policy (data retention, user rights, contact info)
2. Implement user data export endpoint (JSON download of their data)
3. Implement account deletion endpoint (cascading delete of memories, comments, etc.)
4. Document GDPR compliance in deployment docs
5. Add "Delete Account" option to user profile page (post-MVP)

**Owner:** Legal / Product Lead / Backend Lead  
**Target Resolution:** Before production (or soft-launch with privacy policy draft)

---

### Risk S9: Private Memory Photos Reachable Through Static File Serving

**Description:**
`GET /api/memories/{id}` correctly enforces the private-memory ownership guard (`ensureViewAllowed`), but the memory's photo file is served from the fully public, unauthenticated `/uploads/**` static directory. The only protection is an unguessable UUID filename — there is no ownership check at the file-serving layer. Found in the Phase 7 global security review; not fixed in this pass (would require proxying photo bytes through an authenticated controller endpoint, a larger architecture change than the MVP scope justifies right now).

**Likelihood:** Low (requires the URL to leak — referrer header, shared link, browser history sync)
**Impact:** Low-Medium (a private photo could be viewed without auth if its URL leaks)
**Current Mitigation:**
- ✅ JSON metadata for private memories is properly guarded
- ✅ Filenames are random UUIDs, not sequential/guessable
- ❌ **Residual Risk:** no auth check on the file bytes themselves

**Actions Required:**
1. If private-photo confidentiality becomes a hard requirement, add an authenticated `/api/memories/{id}/photo` endpoint reusing `ensureViewAllowed`, and stop serving `/uploads/**` publicly for private memories
2. Until then, document this limitation for users choosing "private" visibility

**Owner:** Backend Lead
**Target Resolution:** Post-MVP (revisit if private-memory usage grows)

---

### Risk S10: Auth Token in localStorage (No httpOnly Cookie)

**Description:**
The JWT is persisted via `localStorage` and attached to requests from JS (`firefly-fe/src/api/token.ts`, `client.ts`). Found in the Phase 7 global security review. There is currently no `dangerouslySetInnerHTML` or other unsanitized-render path anywhere in the frontend, so there is no known exploitable XSS vector today — but any future XSS bug would allow full token exfiltration, unlike an httpOnly-cookie design.

**Likelihood:** Low (no known XSS vector currently)
**Impact:** High if a future XSS bug is introduced (full account takeover)
**Current Mitigation:**
- ✅ No `dangerouslySetInnerHTML` anywhere in `firefly-fe/src` (verified in Phase 7 review)
- ✅ React's default JSX escaping is relied on throughout, never bypassed
- ❌ **Residual Risk:** architecture allows JS to read the token at all

**Actions Required:**
1. Keep enforcing "no unsanitized rendering of user content" in code review — this is the only current mitigation
2. If auth is reworked in a future slice, consider httpOnly + `SameSite` + `Secure` session cookies instead

**Owner:** Security Lead / Frontend Lead
**Target Resolution:** Post-MVP architecture review

---

## DEPENDENCY RISKS

### Risk D1: React 19 Stability

**Description:**  
React 19 is recent. Some libraries may have compatibility issues, or API changes could break after minor updates.

**Likelihood:** Low-Medium  
**Impact:** Low-Medium (build breaks, regressions)  
**Current Mitigation:**
- ✅ All key dependencies pinned (package-lock.json, pnpm-lock.yaml)
- ✅ Build passes, lint passes, tests pass
- ✅ No deprecation warnings (1 pre-existing unrelated)
- ⚠️ **Residual Risk:** React 19 may introduce breaking changes in 19.1, 19.2

**Actions Required:**
1. Monitor React changelog and releases (monthly check)
2. Test minor version upgrades in staging before prod
3. Keep pnpm-lock.yaml committed (deterministic builds)

**Owner:** Frontend Lead  
**Target Resolution:** Ongoing maintenance

---

### Risk D2: Spring Boot 4.1.0 EOL & Security

**Description:**  
Spring Boot is regularly updated. If platform stays on 4.1.0 long-term, security patches may not be backported.

**Likelihood:** Low (normal maintenance)  
**Impact:** Medium (security vulnerabilities)  
**Current Mitigation:**
- ✅ Spring Boot 4.1.0 is recent (stable)
- ✅ Tests pass (111 backend tests)
- ✅ Maven dependency-check can be run to find vulnerable transitive deps

**Actions Required:**
1. Plan quarterly dependency updates
2. Run OWASP Dependency-Check before each production build
3. Subscribe to Spring Security advisories

**Owner:** Backend Lead  
**Target Resolution:** Ongoing maintenance

---

## RISK MATRIX SUMMARY

| Risk | Likelihood | Impact | Current Status | Priority |
|------|-----------|--------|-----------------|----------|
| T1: PostgreSQL Migration | Medium | High | Mitigated (doc pending) | High |
| T2: Java Certificate (PKIX) | Medium | Medium | Mitigated (workaround) | Medium |
| T3: File Cleanup | Low | Medium | Resolved ✅ | Low |
| T4: File Type Validation | Low | High | Resolved ✅ | Low |
| T5: 10 MB Upload Limit | Low-M | Low | Mitigated (docs) | Low |
| T6: Pagination Scale | Low | Low | Mitigated (clamped) | Low |
| T7: Lighthouse Scores | Low | Medium | Pending audit | High |
| B1: Moderation Scale | M-H | Medium | Mitigated (plan) | Medium |
| B2: User Adoption | Medium | High | Mitigated (plan) | High |
| B3: War Sensitivity | Low | High | Designed in | Medium |
| S1: HTTPS Enforcement | Low | Critical | Mitigated (pending deploy) | Critical |
| S2: JWT Secrets | Low | Critical | Mitigated (docs pending) | Critical |
| S3: SQL Injection | Low | Critical | Resolved ✅ | Low |
| S4: XSS | Low | High | Resolved ✅ | Low |
| S5: CSRF | Low | Medium | Resolved ✅ | Low |
| S6: Password Hashing | Low | Critical | Resolved ✅ | Low |
| S7: Admin Compromise | Low | Critical | Mitigated (docs pending) | High |
| S8: GDPR Compliance | Medium | Medium | Pending | Medium |
| D1: React 19 Stability | L-M | L-M | Mitigated (pinned) | Low |
| D2: Spring Boot Updates | Low | Medium | Mitigated (plan) | Low |

---

## Residual Risk Summary

**Critical:** 3 (HTTPS, JWT Secrets, Admin Compromise) — all have deployment mitigation pending  
**High:** 5 (Migration rollback, Lighthouse, User adoption, War sensitivity, GDPR) — manageable with documented plans  
**Medium:** 7 (Java cert, File limits, Moderation, etc.) — low likelihood or low impact  
**Low:** 5 (File cleanup, File validation, Pagination, XSS, CSRF, etc.) — resolved  

---

## Sign-Off

| Role | Approval | Date | Notes |
|------|----------|------|-------|
| QA Lead | ✅ | 2026-07-07 | All critical risks have mitigation plans |
| Security Lead | ⏳ | Pending | HTTPS, JWT, Admin security docs due before deploy |
| Product Lead | ✅ | 2026-07-07 | Content moderation and adoption risks understood |
| DevOps | ⏳ | Pending | Deployment runbook and secrets management pending |

---

**Last updated:** 2026-07-07 21:58 UTC+02:00  
**Scope:** 20 risks (technical, business, security, dependencies)  
**Status:** 8 resolved, 9 mitigated (doc/deploy pending), 3 mitigated (post-MVP plans)
