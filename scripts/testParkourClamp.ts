import { buildCanonicalParkourFrames } from '../src/lib/parkourAcrobatFrames';
import { solveForwardKinematics17 } from '../src/lib/skills/kinematicsSolvers';

const parkour = buildCanonicalParkourFrames({ targetFps: 24 });
let maxPen = 0;
for (let f = 0; f < parkour.length; f++) {
  const spec = parkour[f];
  let manY = spec.manY;
  const fk = solveForwardKinematics17(spec.manX, manY, spec.manAngles, 0.5);
  let deepest = -Infinity;
  for (const j of fk) {
    deepest = Math.max(deepest, j.startY, j.endY);
  }
  if (deepest > 755.0) {
    manY -= (deepest - 755.0);
  }
  const fkFinal = solveForwardKinematics17(spec.manX, manY, spec.manAngles, 0.5);
  for (const j of fkFinal) {
    const d = Math.max(j.startY, j.endY);
    if (d > 755.001) maxPen = Math.max(maxPen, d - 755.0);
  }
}
console.log(`With ground barrier enforcement across all joints: max penetration = ${maxPen.toFixed(2)} px`);
