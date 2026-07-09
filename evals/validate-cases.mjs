// evals/validate-cases.mjs
// Quick validation script for eval case structure

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const CASES_DIR = './evals/cases';
const REQUIRED_FIELDS = ['id', 'trace', 'dimension', 'capability', 'scenario', 'produce', 'rubric'];
const VALID_DIMENSIONS = ['error-clarity', 'empty-state-usability', 'copy-tone', 'auth-security'];

console.log('🔍 Validating eval cases...\n');

const files = readdirSync(CASES_DIR).filter(f => f.endsWith('.eval.ts'));
let totalCases = 0;
let totalCritical = 0;
const dimensionCounts = {};
const errors = [];

for (const file of files) {
  const content = readFileSync(join(CASES_DIR, file), 'utf8');
  
  // Count cases (rough heuristic: count { id: 'eval- patterns)
  const caseMatches = content.match(/id:\s*['"]eval-/g);
  const caseCount = caseMatches ? caseMatches.length : 0;
  totalCases += caseCount;
  
  // Count CRITICAL rubric items
  const criticalMatches = content.match(/CRITICAL:/g);
  const criticalCount = criticalMatches ? criticalMatches.length : 0;
  totalCritical += criticalCount;
  
  // Check @trace footer
  if (!content.includes('// @trace')) {
    errors.push(`❌ ${file}: Missing // @trace footer comment`);
  }
  
  // Check BC-BRAND-01 reference (should be in all cases)
  if (!content.includes('BC-BRAND-01')) {
    errors.push(`⚠️  ${file}: No BC-BRAND-01 trace (expected for brand compliance)`);
  }
  
  // Extract dimensions
  const dimMatches = content.matchAll(/dimension:\s*['"]([^'"]+)['"]/g);
  for (const match of dimMatches) {
    const dim = match[1];
    dimensionCounts[dim] = (dimensionCounts[dim] || 0) + 1;
    if (!VALID_DIMENSIONS.includes(dim)) {
      errors.push(`❌ ${file}: Invalid dimension "${dim}"`);
    }
  }
  
  console.log(`✅ ${file}: ${caseCount} cases, ${criticalCount} CRITICAL gates`);
}

console.log('\n📊 Summary:');
console.log(`   Total cases: ${totalCases}`);
console.log(`   Total CRITICAL gates: ${totalCritical}`);
console.log(`   Average CRITICAL per case: ${(totalCritical / totalCases).toFixed(1)}`);

console.log('\n📐 Dimension breakdown:');
for (const [dim, count] of Object.entries(dimensionCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`   ${dim}: ${count} cases`);
}

if (errors.length > 0) {
  console.log('\n⚠️  Issues:');
  errors.forEach(e => console.log(`   ${e}`));
} else {
  console.log('\n✅ All cases are well-formed!');
}

console.log('\n✨ Validation complete.\n');
