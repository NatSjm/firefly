# Eval Cases Summary Report

**Generated:** 2026-07-07T22:31:17+02:00  
**Agent:** eval-case-author  
**Phase:** Phase 6 QA proof pack

---

## Overview

Created **14 eval cases** across **5 domain files**, covering **4 quality dimensions**.

### Files Created

1. `evals/cases/auth.eval.ts` — 4 cases (authentication)
2. `evals/cases/memories.eval.ts` — 3 cases (personal archive)
3. `evals/cases/feed.eval.ts` — 2 cases (public feed)
4. `evals/cases/moderation.eval.ts` — 2 cases (moderation)
5. `evals/cases/lost-fireflies.eval.ts` — 3 cases (lost fireflies)

---

## Dimension Breakdown

### 1. error-clarity (7 cases)

Validates that validation errors and exceptions are **specific, actionable, and blame-free**.

| Case ID | Capability | Scenario |
|---------|------------|----------|
| eval-error-clarity-login-invalid | authentication | Login with incorrect password |
| eval-error-clarity-register-weak-password | authentication | Register with password too short |
| eval-error-clarity-register-duplicate-email | authentication | Register with duplicate email |
| eval-error-clarity-memory-missing-title | memories | Create memory with empty title |
| eval-error-clarity-memory-title-too-long | memories | Create memory with oversized title |
| eval-error-clarity-report-blank-reason | moderation | Submit report with blank reason |
| eval-error-clarity-lost-request-invalid-year | lost-fireflies | Lost request with impossible year range |
| eval-error-clarity-lost-request-missing-description | lost-fireflies | Lost request with empty description |

**Total: 8 cases** (error-clarity dimension)

### 2. empty-state-usability (4 cases)

Validates that empty dashboards, lists, and filtered views have **clear CTAs and warm, inviting copy**.

| Case ID | Capability | Scenario |
|---------|------------|----------|
| eval-empty-state-dashboard-no-memories | memories | First-time dashboard visit (zero memories) |
| eval-empty-state-feed-no-results | feed | Feed filtered with no matching memories |
| eval-empty-state-lost-requests-no-results | lost-fireflies | Lost list filtered with no results |

**Total: 3 cases** (empty-state-usability dimension)

### 3. copy-tone (1 case)

Validates that Ukrainian UI copy follows **brand guidelines** (BC-BRAND-01: no exclamation marks, warm tone).

| Case ID | Capability | Scenario |
|---------|------------|----------|
| eval-copy-tone-like-prompt-unauthenticated | feed | Unauthenticated like button interaction |

**Total: 1 case** (copy-tone dimension)

### 4. auth-security (2 cases)

Validates that unauthenticated or unauthorized access is **handled gracefully with redirects, not errors**.

| Case ID | Capability | Scenario |
|---------|------------|----------|
| eval-auth-security-protected-route-unauthenticated | authentication | Unauthenticated access to /dashboard |
| eval-auth-security-admin-panel-non-admin | moderation | Non-admin access to /admin |

**Total: 2 cases** (auth-security dimension)

---

## FR/NFR Coverage

All cases are traced to at least one FR and BC-BRAND-01 (no exclamation marks). Key NFR coverage:

### NFR Coverage

- **BC-BRAND-01** (no exclamation marks in UI): **All 12 cases** validate this in their rubrics
- **NFR-ERROR-SURFACE** (implied): **8 error-clarity cases** grade the quality of validation/error messages
- **NFR-USABILITY** (implied): **3 empty-state cases** grade CTA clarity and user guidance

### FR Coverage (High-Level)

| FR Group | Cases | Coverage |
|----------|-------|----------|
| FR-AUTH (Authentication) | 4 | Login, register, password validation, duplicate email, protected routes |
| FR-MEM (Memories) | 3 | Create validations, empty dashboard |
| FR-FEED (Public Feed) | 2 | Empty filtered feed, unauthenticated social interactions |
| FR-MOD (Moderation) | 2 | Report validation, admin access control |
| FR-LOST (Lost Fireflies) | 3 | Create validations, empty filtered list |

**Total FR references:** 27 individual FR trace entries across 14 cases

### Specific FR Traces

- **FR-AUTH-01:** Register validations (2 cases)
- **FR-AUTH-02:** Login error clarity (1 case)
- **FR-AUTH-05:** Protected route security (2 cases)
- **FR-MEM-01, FR-MEM-02:** Memory creation validations (3 cases)
- **FR-MEM-04:** Dashboard empty state (1 case)
- **FR-FEED-01, FR-FEED-02:** Feed empty state (1 case)
- **FR-FEED-06:** Like button copy tone (1 case)
- **FR-MOD-02:** Report validation (1 case)
- **FR-MOD-03:** Admin panel security (1 case)
- **FR-LOST-01, FR-LOST-02, FR-LOST-03:** Lost request validations and empty state (3 cases)

---

## Case Structure

Each case follows the standard eval framework structure:

```typescript
{
  id: string;              // kebab-case, dimension-prefixed
  trace: string[];          // FR/NFR/BC IDs (matches footer comment)
  dimension: string;        // error-clarity | empty-state-usability | copy-tone | auth-security
  capability: string;       // authentication | memories | feed | moderation | lost-fireflies
  scenario: string;         // human-readable scenario description
  produce: () => Promise<string>;  // placeholder for Phase 6 (real execution in eval-suite workflow)
  rubric: string[];         // objective grading criteria, CRITICAL items are gates
}
```

**Placeholder `produce()` Functions:**  
All produce functions return placeholder strings describing what to execute. The `eval-suite` workflow will drive the real app and capture actual user-visible output. This is the Phase 6 retrofit pattern.

---

## Next Steps

1. **Validate structure:** Ensure TypeScript compiles without errors
2. **Run eval-suite workflow:** Drive the app and grade each case with the `eval-judge` agent
3. **Establish baseline:** `node scripts/check-eval-ratchet.mjs --update` to commit initial scores
4. **Wire into CI:** Ensure `check:eval` gate is in `package.json` and called in CI/gates

---

## Rubric Quality Guidelines Followed

- ✅ **Objective criteria:** Rubrics are grading-friendly, not assertion-based
- ✅ **CRITICAL gates:** Key criteria marked CRITICAL (unmet = fail)
- ✅ **BC-BRAND-01:** Every case validates "no exclamation marks"
- ✅ **Trace discipline:** Every case has both `trace:` field and `// @trace` footer
- ✅ **Dimension grouping:** Cases grouped by quality concern (will be averaged separately in ratchet)

---

## Design Rationale

### Why These Dimensions?

1. **error-clarity** — The most testable usability concern; unit tests can't grade "is this error message actionable?"
2. **empty-state-usability** — Critical for first-time user experience; missed empty states are a top frustration driver
3. **copy-tone** — Brand compliance (BC-BRAND-01) and emotional resonance for Ukrainian users
4. **auth-security** — User experience of security blocks (redirect vs 403, message clarity)

### Why These Scenarios?

Selected scenarios that:
- Cover high-traffic user paths (login, register, create memory, browse feed)
- Exercise validation rules that unit tests already check (but can't grade quality)
- Surface brand-critical copy (warm, no exclamation marks)
- Validate graceful security (redirects, not crashes)

### Missing Dimensions (Deferred)

Not included in Phase 6 retrofit (can be added later):
- **performance** — Lighthouse scores, TTFB (covered by manual audit, not eval)
- **accessibility** — ARIA, contrast (covered by axe + manual audit)
- **i18n-quality** — Translation completeness, pluralization (single-language MVP)

---

## Files Summary

| File | Cases | Dimensions Covered | Total Rubric Criteria |
|------|-------|-------------------|---------------------|
| auth.eval.ts | 4 | error-clarity (3), auth-security (1) | 24 |
| memories.eval.ts | 3 | error-clarity (2), empty-state-usability (1) | 15 |
| feed.eval.ts | 2 | empty-state-usability (1), copy-tone (1) | 12 |
| moderation.eval.ts | 2 | error-clarity (1), auth-security (1) | 12 |
| lost-fireflies.eval.ts | 3 | error-clarity (2), empty-state-usability (1) | 17 |

**Total:** 5 files, 14 cases, 88 rubric criteria (avg 6.3 per case)

---

**End of Report**
