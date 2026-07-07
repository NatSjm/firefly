// evals/cases/index.ts
// Central export point for all eval cases

import { authEvalCases } from './auth.eval';
import { memoriesEvalCases } from './memories.eval';
import { feedEvalCases } from './feed.eval';
import { moderationEvalCases } from './moderation.eval';
import { lostFirefliesEvalCases } from './lost-fireflies.eval';

export interface EvalCase {
  id: string;
  trace: string[];
  dimension: string;
  capability: string;
  scenario: string;
  produce: () => Promise<string>;
  rubric: string[];
}

// Aggregate all cases for the eval-suite workflow
export const allEvalCases: EvalCase[] = [
  ...authEvalCases,
  ...memoriesEvalCases,
  ...feedEvalCases,
  ...moderationEvalCases,
  ...lostFirefliesEvalCases,
];

// Export individual domain arrays
export {
  authEvalCases,
  memoriesEvalCases,
  feedEvalCases,
  moderationEvalCases,
  lostFirefliesEvalCases,
};

// Dimension groups for selective execution
export const casesByDimension = {
  'error-clarity': allEvalCases.filter(c => c.dimension === 'error-clarity'),
  'empty-state-usability': allEvalCases.filter(c => c.dimension === 'empty-state-usability'),
  'copy-tone': allEvalCases.filter(c => c.dimension === 'copy-tone'),
  'auth-security': allEvalCases.filter(c => c.dimension === 'auth-security'),
};

// Capability groups for selective execution
export const casesByCapability = {
  'authentication': allEvalCases.filter(c => c.capability === 'authentication'),
  'memories': allEvalCases.filter(c => c.capability === 'memories'),
  'feed': allEvalCases.filter(c => c.capability === 'feed'),
  'moderation': allEvalCases.filter(c => c.capability === 'moderation'),
  'lost-fireflies': allEvalCases.filter(c => c.capability === 'lost-fireflies'),
};

// Quick stats
export const stats = {
  total: allEvalCases.length,
  byDimension: Object.fromEntries(
    Object.entries(casesByDimension).map(([dim, cases]) => [dim, cases.length])
  ),
  byCapability: Object.fromEntries(
    Object.entries(casesByCapability).map(([cap, cases]) => [cap, cases.length])
  ),
};
