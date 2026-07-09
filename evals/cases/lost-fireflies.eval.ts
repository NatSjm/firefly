// evals/cases/lost-fireflies.eval.ts
// Lost Fireflies error clarity and empty state eval cases

export interface EvalCase {
  id: string;
  trace: string[];
  dimension: string;
  capability: string;
  scenario: string;
  produce: () => Promise<string>;
  rubric: string[];
}

export const lostFirefliesEvalCases: EvalCase[] = [
  {
    id: 'eval-error-clarity-lost-request-invalid-year',
    trace: ['FR-LOST-02', 'BC-BRAND-01'],
    dimension: 'error-clarity',
    capability: 'lost-fireflies',
    scenario: 'User attempts to create a lost request with an invalid year range (e.g., yearFrom=2025, yearTo=1990)',
    produce: async () => {
      return "placeholder: POST /api/lost-requests with yearFrom > yearTo (impossible range), capture validation error";
    },
    rubric: [
      'CRITICAL: error shown inline at the year fields, form does not submit',
      'message is in Ukrainian',
      'message clearly explains the constraint (e.g., "рік початку має бути раніше за рік кінця")',
      'message is specific and actionable',
      'no exclamation marks (BC-BRAND-01)',
      'tone is helpful, not condescending',
    ],
  },
  {
    id: 'eval-empty-state-lost-requests-no-results',
    trace: ['FR-LOST-01', 'FR-LOST-03', 'BC-BRAND-01'],
    dimension: 'empty-state-usability',
    capability: 'lost-fireflies',
    scenario: 'Visitor filters the Lost Fireflies list by a city with no matching requests',
    produce: async () => {
      return "placeholder: Navigate to /lost-fireflies with filter ?city=Полтава when no requests match, capture empty state UI";
    },
    rubric: [
      'CRITICAL: empty state is shown with clear explanation (not just blank page)',
      'message is in Ukrainian',
      'message acknowledges the active filter (mentions the city selected)',
      'message suggests actionable next step (e.g., clear filter or create a request if authenticated)',
      'tone is warm and inviting, aligned with the emotional nature of "Lost Fireflies" feature',
      'no exclamation marks (BC-BRAND-01)',
      'UI feels intentional and supportive, not frustrating',
    ],
  },
  {
    id: 'eval-error-clarity-lost-request-missing-description',
    trace: ['FR-LOST-02', 'BC-BRAND-01'],
    dimension: 'error-clarity',
    capability: 'lost-fireflies',
    scenario: 'User submits Lost Fireflies form with empty description field (required field)',
    produce: async () => {
      return "placeholder: POST /api/lost-requests with all fields filled except description='', capture validation error";
    },
    rubric: [
      'CRITICAL: error shown inline on the description field, form does not submit',
      'message is in Ukrainian',
      'message clearly states that description is required',
      'message may provide gentle guidance on what to include (e.g., "опишіть, кого або що шукаєте")',
      'no exclamation marks (BC-BRAND-01)',
      'tone is warm and supportive, recognizing the emotional context of the feature',
    ],
  },
];

// @trace FR-LOST-01, FR-LOST-02, FR-LOST-03, BC-BRAND-01
