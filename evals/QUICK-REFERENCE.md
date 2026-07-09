# Eval Cases Quick Reference

**14 cases · 4 dimensions · 5 domain files**

---

## By Dimension

```
error-clarity (8 cases)
├─ auth: login invalid, register weak password, register duplicate email
├─ memories: missing title, title too long
├─ moderation: report blank reason
└─ lost-fireflies: invalid year range, missing description

empty-state-usability (3 cases)
├─ memories: dashboard no memories
├─ feed: feed no results
└─ lost-fireflies: lost list no results

copy-tone (1 case)
└─ feed: like prompt unauthenticated

auth-security (2 cases)
├─ auth: protected route unauthenticated
└─ moderation: admin panel non-admin
```

---

## By Capability

```
authentication (4 cases)
├─ error-clarity: login invalid, register weak password, register duplicate email
└─ auth-security: protected route unauthenticated

memories (3 cases)
├─ error-clarity: missing title, title too long
└─ empty-state-usability: dashboard no memories

feed (2 cases)
├─ empty-state-usability: feed no results
└─ copy-tone: like prompt unauthenticated

moderation (2 cases)
├─ error-clarity: report blank reason
└─ auth-security: admin panel non-admin

lost-fireflies (3 cases)
├─ error-clarity: invalid year range, missing description
└─ empty-state-usability: lost list no results
```

---

## Critical Gates

**Every case has at least 1 CRITICAL gate** — unmet = fail (score ≤ 49).

Common criticals:
- Errors shown inline (not 500)
- Messages in Ukrainian
- Redirects for auth blocks (not 403 pages)
- Empty states with explanation (not blank)

---

## Brand Compliance

**All 14 cases validate BC-BRAND-01**: no exclamation marks in Ukrainian UI copy.

---

## Import Patterns

```typescript
// All cases
import { allEvalCases } from './evals/cases';

// By dimension
import { casesByDimension } from './evals/cases';
const errorCases = casesByDimension['error-clarity'];

// By capability
import { casesByCapability } from './evals/cases';
const authCases = casesByCapability['authentication'];

// Individual domains
import { authEvalCases } from './evals/cases/auth.eval';
import { memoriesEvalCases } from './evals/cases/memories.eval';
import { feedEvalCases } from './evals/cases/feed.eval';
import { moderationEvalCases } from './evals/cases/moderation.eval';
import { lostFirefliesEvalCases } from './evals/cases/lost-fireflies.eval';
```

---

## Next Steps

1. ✅ Cases created (this step)
2. ⏳ Run `eval-suite` workflow (drives app, grades with judge agent)
3. ⏳ Establish baseline: `node scripts/check-eval-ratchet.mjs --update`
4. ⏳ Wire `check:eval` gate into CI
5. ⏳ Document in QA pack: link `docs/qa/eval-report.md`

---

**Files:**
- `evals/cases/*.eval.ts` — 5 domain files
- `evals/cases/index.ts` — aggregator
- `evals/cases/README.md` — detailed guide
- `evals/validate-cases.mjs` — structure validator
- `evals/EVAL-CASES-SUMMARY.md` — generation report
