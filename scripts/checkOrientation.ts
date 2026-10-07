import { solveForwardKinematics17 } from '../src/lib/humanMotionSkills';

const angles = new Array(17).fill(0);
// Root is at (0, 0)
// Bone 1: Right thigh.
// Let's test bone 9: Right bicep
for (const ang of [0, 90, -90, 180, -180]) {
  angles[9] = ang;
  angles[10] = ang;
  angles[11] = ang;
  const fk = solveForwardKinematics17(500, 500, angles, 0.5);
  console.log(`angle ${ang}: endX=${fk[9].endX.toFixed(1)}, endY=${fk[9].endY.toFixed(1)} (from ${fk[8].endX.toFixed(1)}, ${fk[8].endY.toFixed(1)})`);
}
