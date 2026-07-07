// evals/cases/memories.eval.ts
// Memories CRUD error clarity and empty state eval cases

export interface EvalCase {
  id: string;
  trace: string[];
  dimension: string;
  capability: string;
  scenario: string;
  produce: () => Promise<string>;
  rubric: string[];
}

export const memoriesEvalCases: EvalCase[] = [
  {
    id: 'eval-error-clarity-memory-missing-title',
    trace: ['FR-MEM-01', 'FR-MEM-02', 'BC-BRAND-01'],
    dimension: 'error-clarity',
    capability: 'memories',
    scenario: 'User submits the memory creation form with empty title field',
    produce: async () => {
      return "placeholder: POST /api/memories with all fields filled except title='', capture validation error";
    },
    rubric: [
      'CRITICAL: error shown inline on the title field, form does not submit',
      'message is in Ukrainian',
      'message clearly states that title is required (e.g., "назва обов\'язкова" or similar)',
      'no exclamation marks (BC-BRAND-01)',
      'tone is neutral and professional',
    ],
  },
  {
    id: 'eval-empty-state-dashboard-no-memories',
    trace: ['FR-MEM-04', 'BC-BRAND-01'],
    dimension: 'empty-state-usability',
    capability: 'memories',
    scenario: 'Authenticated user visits /dashboard for the first time (no memories created yet)',
    produce: async () => {
      return "placeholder: Navigate to /dashboard with authenticated user who has zero memories, capture rendered empty state UI";
    },
    rubric: [
      'CRITICAL: empty state is shown with clear explanation (not just blank page or "no results")',
      'message is in Ukrainian',
      'message has a clear call-to-action (e.g., button or link to create first memory)',
      'tone is warm and inviting, consistent with Firefly brand (Світлячок)',
      'no exclamation marks (BC-BRAND-01)',
      'UI includes visual indicator (e.g., icon or illustration) to make empty state feel intentional',
    ],
  },
  {
    id: 'eval-error-clarity-memory-title-too-long',
    trace: ['FR-MEM-02', 'BC-BRAND-01'],
    dimension: 'error-clarity',
    capability: 'memories',
    scenario: 'User attempts to create a memory with a title exceeding the maximum length (e.g., 300+ characters)',
    produce: async () => {
      return "placeholder: POST /api/memories with title field containing 350 characters, capture validation error";
    },
    rubric: [
      'CRITICAL: error shown inline on the title field, form does not submit',
      'message is in Ukrainian',
      'message states the specific constraint (e.g., "максимум 200 символів" or similar)',
      'message shows current count vs limit (e.g., "350/200" or "на 150 символів більше")',
      'no exclamation marks (BC-BRAND-01)',
      'tone is neutral, helps user correct the issue',
    ],
  },
];

// @trace FR-MEM-01, FR-MEM-02, FR-MEM-04, BC-BRAND-01
