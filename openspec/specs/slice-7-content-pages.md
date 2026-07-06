# Spec: Slice 7 — Content Pages

**Status:** retrofitted  
**FRs covered:** FR-CONTENT-01, FR-CONTENT-02  
**Slice:** 1.6 (add-content-pages)

## Summary
Static informational pages: About the project (`/about`) and Community Rules (`/rules`).

## Frontend Routes

| Path | Component | FR |
|------|-----------|-----|
| `/about` | AboutPage | FR-CONTENT-01 |
| `/rules` | RulesPage | FR-CONTENT-02 |

## Acceptance Criteria
- FR-CONTENT-01: `/about` renders project description, purpose, and target audience in Ukrainian
- FR-CONTENT-02: `/rules` renders community rules (kindness, respect, no spam, no political conflicts)
- Both pages are accessible without authentication
- No console errors on either page
