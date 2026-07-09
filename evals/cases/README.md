# Eval Cases

**Quality-grading scenarios for Firefly (Світлячок)**

This directory contains **14 eval cases** across **4 quality dimensions** that grade aspects of the application that unit tests cannot assess — error clarity, empty-state usability, copy tone, and authentication security.

---

## Quick Start

```typescript
import { allEvalCases, casesByDimension, stats } from './cases/index';

console.log(`Total cases: ${stats.total}`);
// => Total cases: 14

// Run all cases
for (const evalCase of allEvalCases) {
  const output = await evalCase.produce();
  // ... grade against evalCase.rubric
}

// Run only error-clarity cases
for (const evalCase of casesByDimension['error-clarity']) {
  // ...
}
```

---

## Files

| File | Cases | Dimensions | Description |
|------|-------|-----------|-------------|
| **auth.eval.ts** | 4 | error-clarity (3), auth-security (1) | Login/register validation, protected route security |
| **memories.eval.ts** | 3 | error-clarity (2), empty-state-usability (1) | Memory CRUD validation, empty dashboard |
| **feed.eval.ts** | 2 | empty-state-usability (1), copy-tone (1) | Empty filtered feed, unauthenticated like prompt |
| **moderation.eval.ts** | 2 | error-clarity (1), auth-security (1) | Report validation, admin panel security |
| **lost-fireflies.eval.ts** | 3 | error-clarity (2), empty-state-usability (1) | Lost request validation, empty list |

---

## Dimensions

### 1. error-clarity (8 cases)

Grades whether validation errors and exceptions are:
- Specific (not generic "помилка")
- Actionable (suggests what to do)
- Blame-free (no "ви помилилися")
- In Ukrainian
- Brand-compliant (no `!` per BC-BRAND-01)

### 2. empty-state-usability (3 cases)

Grades whether empty dashboards, lists, and filtered views have:
- Clear explanation (not blank page)
- Actionable CTA (create, clear filter)
- Warm, inviting tone
- Filter acknowledgment (when applicable)

### 3. copy-tone (1 case)

Grades whether UI copy follows brand guidelines:
- No exclamation marks (BC-BRAND-01)
- Warm, calm, professional tone
- Community-focused language

### 4. auth-security (2 cases)

Grades whether unauthenticated/unauthorized access is handled gracefully:
- Redirects to login (not 403 page)
- Preserves intent (returnTo param)
- No flash of protected content
- Clear, professional messaging

---

## Case Structure

```typescript
{
  id: 'eval-error-clarity-login-invalid',
  trace: ['FR-AUTH-02', 'BC-BRAND-01'],
  dimension: 'error-clarity',
  capability: 'authentication',
  scenario: 'User submits login form with incorrect password',
  produce: async () => {
    // For Phase 6 retrofit: placeholder string
    // eval-suite workflow will drive the real app
    return "placeholder: POST /api/auth/login with bad password";
  },
  rubric: [
    'CRITICAL: error shown inline, never generic 500',
    'message is in Ukrainian',
    'message does not blame the user',
    'message is specific',
    'no exclamation marks (BC-BRAND-01)',
  ],
}
```

**CRITICAL items** are gates — if unmet, the case fails (score ≤ 49) regardless of other criteria.

---

## Execution Flow

1. **eval-suite workflow** collects cases from this directory
2. **eval-judge agent** (fresh context, maker≠checker) grades each against its rubric
3. **Aggregate** scores by dimension → `docs/qa/eval-report.md` + `evals/results/latest.json`
4. **Ratchet script** (`check-eval-ratchet.mjs`) compares to `quality/eval-baseline.json` (fails on drop)

---

## Coverage

### FR/NFR Traced

- **BC-BRAND-01** (no exclamation marks): All 14 cases
- **FR-AUTH-01/02/05**: Authentication validations + security (4 cases)
- **FR-MEM-01/02/04**: Memory CRUD + dashboard (3 cases)
- **FR-FEED-01/02/06**: Feed empty state + social interactions (2 cases)
- **FR-MOD-02/03**: Moderation validation + admin security (2 cases)
- **FR-LOST-01/02/03**: Lost Fireflies validation + empty state (3 cases)

### Quality Aspects

- ✅ Error surface (8 validation/exception cases)
- ✅ Empty states (3 first-run/no-results cases)
- ✅ Brand compliance (all cases check BC-BRAND-01)
- ✅ Security UX (2 access-control cases)

---

## Maintenance

### Adding a Case

1. Add to the appropriate `*.eval.ts` file (or create a new one)
2. Follow the structure: id, trace, dimension, capability, scenario, produce, rubric
3. Mark critical criteria with `CRITICAL:`
4. Add `// @trace FR-XX, NFR-YY` footer comment
5. Run `node evals/validate-cases.mjs` to check structure
6. Re-run `eval-suite` workflow to grade new case
7. Update baseline: `node scripts/check-eval-ratchet.mjs --update`

### Changing a Rubric

If the rubric changes meaningfully (new CRITICAL, removed criterion):
- The next eval run will produce a new score
- If the dimension score drops, `check-eval-ratchet.mjs` will fail
- Decide: is the drop acceptable? If yes, `--update` the baseline

---

## Validation

Run the validation script to check case structure:

```bash
node evals/validate-cases.mjs
```

Checks:
- All files have `// @trace` footer
- All dimensions are valid
- Cases have well-formed ids
- BC-BRAND-01 is referenced (brand compliance)

---

## Related Files

- **`evals/README.md`** — eval framework overview
- **`evals/validate-cases.mjs`** — case structure validator
- **`evals/EVAL-CASES-SUMMARY.md`** — detailed generation report
- **`scripts/check-eval-ratchet.mjs`** — CI-safe ratchet gate
- **`.claude/workflows/eval-suite.js`** — orchestration workflow (grading)

---

**Created:** 2026-07-07T22:31:17+02:00  
**Agent:** eval-case-author  
**Phase:** Phase 6 QA proof pack
