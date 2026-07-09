// evals/cases/feed.eval.ts
// Public feed empty state and copy tone eval cases

export interface EvalCase {
  id: string;
  trace: string[];
  dimension: string;
  capability: string;
  scenario: string;
  produce: () => Promise<string>;
  rubric: string[];
}

export const feedEvalCases: EvalCase[] = [
  {
    id: 'eval-empty-state-feed-no-results',
    trace: ['FR-FEED-01', 'FR-FEED-02', 'BC-BRAND-01'],
    dimension: 'empty-state-usability',
    capability: 'feed',
    scenario: 'Visitor filters the public feed by a city/topic combination with no matching memories',
    produce: async () => {
      return "placeholder: Navigate to /feed with filters ?city=Львів&topic=Тамагочі when no memories match, capture empty state UI";
    },
    rubric: [
      'CRITICAL: empty state is shown with clear explanation (not just blank page)',
      'message is in Ukrainian',
      'message acknowledges the active filters (e.g., mentions the city/topic selected)',
      'message suggests actionable next step (e.g., clear filters, try different filters, or create first memory if authenticated)',
      'tone is warm and inviting, not frustrating',
      'no exclamation marks (BC-BRAND-01)',
    ],
  },
  {
    id: 'eval-copy-tone-like-prompt-unauthenticated',
    trace: ['FR-FEED-06', 'BC-BRAND-01'],
    dimension: 'copy-tone',
    capability: 'feed',
    scenario: 'Unauthenticated visitor hovers or clicks the "Warmth" (Тепло) like button on a memory card',
    produce: async () => {
      return "placeholder: As unauthenticated user, interact with like button on /feed, capture tooltip or prompt message";
    },
    rubric: [
      'CRITICAL: message is shown (tooltip or prompt) explaining that login is required',
      'message is in Ukrainian',
      'message is warm and inviting (e.g., "увійдіть, щоб поділитися теплом" or similar), not cold or blocking',
      'no exclamation marks (BC-BRAND-01)',
      'tone aligns with Firefly brand (Світлячок) — calm, kind, community-focused',
      'message includes a clear CTA (e.g., link to /login)',
    ],
  },
];

// @trace FR-FEED-01, FR-FEED-02, FR-FEED-06, BC-BRAND-01
