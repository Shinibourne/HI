import { buildFlawless24Frames } from './buildFlawless24';
import { validateBasketballBiomechanics } from '../src/lib/basketballChoreographyFrames';

const frames = buildFlawless24Frames();
const audit = validateBasketballBiomechanics(frames as any);

console.log(`Audited: ${audit.passedChecks}/${audit.totalChecks} passed. Overall passed: ${audit.passed}`);
for (const item of audit.items) {
  const status = item.passed ? '✓ PASS' : '✗ FAIL';
  console.log(`[${status}] #${item.ruleNumber} ${item.label} -> ${item.metric}`);
}
