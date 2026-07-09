# Eval Case Creation Checklist

**Status: ✅ COMPLETE**

---

## Deliverables

- [x] **5 eval case files** in `evals/cases/*.eval.ts`
  - [x] `auth.eval.ts` (4 cases)
  - [x] `memories.eval.ts` (3 cases)
  - [x] `feed.eval.ts` (2 cases)
  - [x] `moderation.eval.ts` (2 cases)
  - [x] `lost-fireflies.eval.ts` (3 cases)

- [x] **14 total cases** (exceeds 8-12 target)

- [x] **4 dimensions covered**
  - [x] error-clarity (8 cases)
  - [x] empty-state-usability (3 cases)
  - [x] copy-tone (1 case)
  - [x] auth-security (2 cases)

- [x] **Every case has:**
  - [x] Unique kebab-case id with dimension prefix
  - [x] trace: array with FR/NFR/BC IDs
  - [x] dimension: valid dimension string
  - [x] capability: domain string
  - [x] scenario: human-readable description
  - [x] produce: async function (placeholder OK for Phase 6)
  - [x] rubric: array of grading criteria
  - [x] At least 1 CRITICAL gate per case (14/14 have exactly 1)
  - [x] `// @trace` footer comment

- [x] **Documentation**
  - [x] `evals/cases/README.md` — detailed guide
  - [x] `evals/EVAL-CASES-SUMMARY.md` — generation report with coverage
  - [x] `evals/QUICK-REFERENCE.md` — quick lookup
  - [x] `evals/cases/index.ts` — TypeScript aggregator
  - [x] `evals/validate-cases.mjs` — structure validator

---

## Quality Checks

- [x] All cases validate BC-BRAND-01 (no exclamation marks)
- [x] All dimensions are valid (`error-clarity`, `empty-state-usability`, `copy-tone`, `auth-security`)
- [x] All trace fields match footer comments
- [x] All FR/NFR references are valid (cross-referenced with requirements.md)
- [x] All scenarios are real, high-traffic user paths
- [x] All rubrics are objective and gradable (not assertion-based)
- [x] All CRITICAL gates are marked consistently
- [x] All produce() functions have placeholder strings describing execution

---

## Validation Results

```
🔍 Validating eval cases...

✅ auth.eval.ts: 4 cases, 4 CRITICAL gates
✅ feed.eval.ts: 2 cases, 2 CRITICAL gates
✅ lost-fireflies.eval.ts: 3 cases, 3 CRITICAL gates
✅ memories.eval.ts: 3 cases, 3 CRITICAL gates
✅ moderation.eval.ts: 2 cases, 2 CRITICAL gates

📊 Summary:
   Total cases: 14
   Total CRITICAL gates: 14
   Average CRITICAL per case: 1.0

📐 Dimension breakdown:
   error-clarity: 8 cases
   empty-state-usability: 3 cases
   auth-security: 2 cases
   copy-tone: 1 cases

✅ All cases are well-formed!
```

---

## Coverage Report

### FR Coverage

- **FR-AUTH-01/02/05** (Authentication): 4 cases
- **FR-MEM-01/02/04** (Memories): 3 cases
- **FR-FEED-01/02/06** (Feed): 2 cases
- **FR-MOD-02/03** (Moderation): 2 cases
- **FR-LOST-01/02/03** (Lost Fireflies): 3 cases
- **FR-SHELL-03** (Protected routes): 1 case

**Total:** 27 FR trace entries across 14 cases

### NFR Coverage

- **BC-BRAND-01** (no exclamation marks): 14/14 cases (100%)
- **Error surface** (implied NFR): 8 error-clarity cases
- **Usability** (implied NFR): 3 empty-state cases
- **Security UX** (implied NFR): 2 auth-security cases

---

## Next Steps (Not in Scope)

The following steps are **NOT** part of this agent's task (defer to eval-suite workflow / QA phase):

- [ ] Run `eval-suite` workflow to grade cases
- [ ] Establish eval baseline: `node scripts/check-eval-ratchet.mjs --update`
- [ ] Wire `check:eval` into CI
- [ ] Link `docs/qa/eval-report.md` in QA pack
- [ ] Record representative cases (optional, for human illustration)

---

## File Summary

| File | Size | Purpose |
|------|------|---------|
| `evals/cases/auth.eval.ts` | 3.9 KB | 4 authentication cases |
| `evals/cases/memories.eval.ts` | 2.9 KB | 3 memory CRUD cases |
| `evals/cases/feed.eval.ts` | 2.2 KB | 2 feed cases |
| `evals/cases/moderation.eval.ts` | 2.2 KB | 2 moderation cases |
| `evals/cases/lost-fireflies.eval.ts` | 3.2 KB | 3 Lost Fireflies cases |
| `evals/cases/index.ts` | 2.1 KB | Aggregator + exports |
| `evals/cases/README.md` | 5.8 KB | Detailed guide |
| **Total** | **21.8 KB** | **7 files** |

Plus documentation:
- `evals/EVAL-CASES-SUMMARY.md` (8.1 KB)
- `evals/QUICK-REFERENCE.md` (3.0 KB)
- `evals/validate-cases.mjs` (2.5 KB)

**Grand Total:** 35.4 KB across 10 files

---

**Completion Time:** 2026-07-07T22:31:17+02:00  
**Agent:** eval-case-author  
**Phase:** Phase 6 QA proof pack  
**Status:** ✅ ALL DELIVERABLES COMPLETE
