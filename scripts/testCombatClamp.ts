import { buildCanonicalCombatFrames } from '../src/lib/combatFrames';
import { solveForwardKinematics17 } from '../src/lib/skills/kinematicsSolvers';

const frames = buildCanonicalCombatFrames({ targetFps: 24 });
let maxPenBefore = 0;
let maxPenAfter = 0;

for (let f = 0; f < frames.length; f++) {
  const spec = frames[f];
  const jointsBefore = solveForwardKinematics17(spec.manX, spec.manY, spec.manAngles, 0.5);
  const rFootB = Math.max(jointsBefore[3].startY, jointsBefore[3].endY);
  const lFootB = Math.max(jointsBefore[6].startY, jointsBefore[6].endY);
  const deepestB = Math.max(rFootB, lFootB);
  if (deepestB > 755.0) {
    maxPenBefore = Math.max(maxPenBefore, deepestB - 755.0);
  }

  // If grounded and penetrates, adjust manY so foot sits on ground
  let adjManY = spec.manY;
  if (spec.isGrounded && deepestB > 755.0) {
    adjManY = spec.manY - (deepestB - 755.0);
  }
  const jointsAfter = solveForwardKinematics17(spec.manX, adjManY, spec.manAngles, 0.5);
  const rFootA = Math.max(jointsAfter[3].startY, jointsAfter[3].endY);
  const lFootA = Math.max(jointsAfter[6].startY, jointsAfter[6].endY);
  const deepestA = Math.max(rFootA, lFootA);
  if (deepestA > 755.0) {
    maxPenAfter = Math.max(maxPenAfter, deepestA - 755.0);
  }
}

console.log(`Max foot penetration before ground clamping: ${maxPenBefore.toFixed(2)} px`);
console.log(`Max foot penetration after ground clamping: ${maxPenAfter.toFixed(2)} px`);
