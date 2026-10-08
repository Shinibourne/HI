import { buildCanonicalCombatFrames } from '../src/lib/combatFrames';
import { solveForwardKinematics17 } from '../src/lib/skills/kinematicsSolvers';

const frames = buildCanonicalCombatFrames({ targetFps: 24 });
console.log(`Checking ${frames.length} combat frames...`);
for (let f = 0; f < frames.length; f++) {
  const spec = frames[f];
  const joints = solveForwardKinematics17(spec.manX, spec.manY, spec.manAngles, 0.5);
  const rFoot = Math.max(joints[3].startY, joints[3].endY);
  const lFoot = Math.max(joints[6].startY, joints[6].endY);
  if (rFoot > 755.05 || lFoot > 755.05) {
    console.log(`Frame ${f} (${spec.technique} - ${spec.phase}): rFoot=${rFoot.toFixed(2)}, lFoot=${lFoot.toFixed(2)}, manY=${spec.manY}`);
  }
}
