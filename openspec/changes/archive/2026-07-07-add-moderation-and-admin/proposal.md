# Proposal: add-moderation-and-admin

Introduce the Moderation & Admin slice as a tracked retrofitted OpenSpec change for the existing reporting and admin-panel capability.

This change captures the already-implemented moderation feature set (authenticated abuse reports on memories and comments, the admin-only reports/users panel at `/admin`, admin content deletion, and user banning) so the slice can move through Phase 4 with explicit tests, review evidence, and archive history. It also closes two gaps found while specifying: the footer's "report abuse" link was rendered but dead (FR-MOD-05), and `POST /api/reports` accepted any `targetType` string instead of the spec'd `memory`/`comment` pair.

**FRs covered:** FR-MOD-02, FR-MOD-03, FR-MOD-04, FR-MOD-05.

(FR-MOD-01, the `/rules` content page, is owned by slice 6 `add-content-pages` per the coverage table in `docs/mvp-capability-plan.md`.)
