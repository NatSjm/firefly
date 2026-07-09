// evals/cases/auth.eval.ts
// Authentication error clarity and security eval cases

export interface EvalCase {
  id: string;
  trace: string[];
  dimension: string;
  capability: string;
  scenario: string;
  produce: () => Promise<string>;
  rubric: string[];
}

export const authEvalCases: EvalCase[] = [
  {
    id: 'eval-error-clarity-login-invalid',
    trace: ['FR-AUTH-02', 'BC-BRAND-01'],
    dimension: 'error-clarity',
    capability: 'authentication',
    scenario: 'User submits login form with incorrect password for an existing account',
    produce: async () => {
      return "placeholder: POST /api/auth/login with valid email but wrong password, capture the user-visible error message";
    },
    rubric: [
      'CRITICAL: error shown inline at form level, never a generic 500 or blank page',
      'message is in Ukrainian',
      'message does not blame the user (no "ви помилилися" or similar accusatory tone)',
      'message is specific (not just "помилка" or "щось пішло не так")',
      'no exclamation marks (BC-BRAND-01)',
      'message is actionable (suggests what to try next, e.g., password reset)',
    ],
  },
  {
    id: 'eval-error-clarity-register-weak-password',
    trace: ['FR-AUTH-01', 'BC-BRAND-01'],
    dimension: 'error-clarity',
    capability: 'authentication',
    scenario: 'User attempts to register with a password that is too short (e.g., "123")',
    produce: async () => {
      return "placeholder: POST /api/auth/register with valid email/name but password='123', capture validation error";
    },
    rubric: [
      'CRITICAL: error shown inline on the password field, form does not submit',
      'message is in Ukrainian',
      'message explains the requirement (e.g., "мінімум 8 символів" or similar)',
      'message is specific about what is wrong AND what is acceptable',
      'no exclamation marks (BC-BRAND-01)',
      'tone is neutral and professional, not scolding',
    ],
  },
  {
    id: 'eval-auth-security-protected-route-unauthenticated',
    trace: ['FR-AUTH-05', 'FR-SHELL-03'],
    dimension: 'auth-security',
    capability: 'authentication',
    scenario: 'Unauthenticated user navigates directly to /dashboard (protected route)',
    produce: async () => {
      return "placeholder: Navigate to /dashboard without JWT token, capture redirect behavior and any message shown";
    },
    rubric: [
      'CRITICAL: user is redirected to /login (or similar public auth page), not shown a 403 error page',
      'redirect preserves the intended destination (returnTo param or similar) so user can continue after login',
      'no flash of protected content before redirect',
      'if a message is shown, it is in Ukrainian and explains why (e.g., "необхідно увійти")',
      'no exclamation marks in any message',
    ],
  },
  {
    id: 'eval-error-clarity-register-duplicate-email',
    trace: ['FR-AUTH-01', 'BC-BRAND-01'],
    dimension: 'error-clarity',
    capability: 'authentication',
    scenario: 'User attempts to register with an email that is already registered',
    produce: async () => {
      return "placeholder: POST /api/auth/register with email that already exists in DB, capture error message";
    },
    rubric: [
      'CRITICAL: error shown inline at form level, not a 500 or database error',
      'message is in Ukrainian',
      'message is specific (mentions email is already in use)',
      'message does not leak sensitive info (e.g., does not confirm the email exists in DB for security)',
      'message suggests actionable next step (e.g., login or password reset)',
      'no exclamation marks (BC-BRAND-01)',
      'tone is helpful, not accusatory',
    ],
  },
];

// @trace FR-AUTH-01, FR-AUTH-02, FR-AUTH-05, FR-SHELL-03, BC-BRAND-01
