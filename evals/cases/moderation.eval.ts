// evals/cases/moderation.eval.ts
// Moderation error clarity and security eval cases

export interface EvalCase {
  id: string;
  trace: string[];
  dimension: string;
  capability: string;
  scenario: string;
  produce: () => Promise<string>;
  rubric: string[];
}

export const moderationEvalCases: EvalCase[] = [
  {
    id: 'eval-error-clarity-report-blank-reason',
    trace: ['FR-MOD-02', 'BC-BRAND-01'],
    dimension: 'error-clarity',
    capability: 'moderation',
    scenario: 'User submits a report for a memory with a completely blank reason field (if reason is required or strongly encouraged)',
    produce: async () => {
      return "placeholder: POST /api/reports with memory_id but empty reason field, capture validation or guidance message";
    },
    rubric: [
      'CRITICAL: if reason is required, error shown inline and form does not submit',
      'message is in Ukrainian',
      'message is specific (explains why reason is important for moderators)',
      'tone is constructive and community-focused, not punitive',
      'no exclamation marks (BC-BRAND-01)',
      'if reason is optional, a helpful prompt encourages user to add context (without blocking submission)',
    ],
  },
  {
    id: 'eval-auth-security-admin-panel-non-admin',
    trace: ['FR-MOD-03', 'FR-AUTH-05'],
    dimension: 'auth-security',
    capability: 'moderation',
    scenario: 'Authenticated non-admin user navigates directly to /admin',
    produce: async () => {
      return "placeholder: Navigate to /admin as authenticated user without admin role, capture redirect or 403 behavior";
    },
    rubric: [
      'CRITICAL: user is blocked (403 or redirect to safe page, not shown admin panel)',
      'if a message is shown, it is in Ukrainian and professional (e.g., "доступ обмежено")',
      'no flash of admin content before block',
      'redirect or message does not expose admin panel structure or sensitive info',
      'tone is neutral, not hostile',
      'no exclamation marks (BC-BRAND-01)',
    ],
  },
];

// @trace FR-MOD-02, FR-MOD-03, FR-AUTH-05, BC-BRAND-01
