import { buildCanonicalCombatFrames } from '../src/lib/combatFrames';
import { solveForwardKinematics17 } from '../src/lib/skills/kinematicsSolvers';

const frames = buildCanonicalCombatFrames({ targetFps: 24 });
let maxPen = 0;
let maxVelY = 0;

for (let f = 0; f < frames.length; f++) {
  const spec = frames[f];
  let manY = spec.manY;
  const fkPreview = solveForwardKinematics17(spec.manX, manY, spec.manAngles, 0.5);
  const rFootMaxY = Math.max(fkPreview[3].startY, fkPreview[3].endY);
  const lFootMaxY = Math.max(fkPreview[6].startY, fkPreview[6].endY);
  const deepestFootY = Math.max(rFootMaxY, lFootMaxY);

  if (deepestFootY > 755.0) {
    const pen = deepestFootY - 755.0;
    manY -= pen;
  }

  const fkFinal = solveForwardKinematics17(spec.manX, manY, spec.manAngles, 0.5);
  const deepestFinal = Math.max(fkFinal[3].startY, fkFinal[3].endY, fkFinal[6].startY, fkFinal[6].endY);
  if (deepestFinal > 755.01) maxPen = Math.max(maxPen, deepestFinal - 755.0);

  if (f > 0) {
    const prevManY = frames[f - 1].manY;
    const velY = Math.abs(manY - prevManY);
    if (velY > maxVelY) maxVelY = velY;
  }
}

console.log(`Max foot penetration after ground enforcement: ${maxPen.toFixed(2)} px`);
console.log(`Max vertical root delta: ${maxVelY.toFixed(2)} px/frame (smooth limit is 35 px/f)`);
