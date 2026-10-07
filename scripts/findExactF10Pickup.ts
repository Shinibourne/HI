import { solveForwardKinematics17 } from '../src/lib/humanMotionSkills';
import { STICKFIGURE_BONE_LENGTHS } from '../src/lib/stkndsCodec';

const armLen = (STICKFIGURE_BONE_LENGTHS[9] + STICKFIGURE_BONE_LENGTHS[10] + STICKFIGURE_BONE_LENGTHS[11]) * 0.5;

for (const cy of [600, 602, 604, 605, 606, 608, 610]) {
  for (const sL of [35, 40, 45, 50, 52]) {
    const sU = sL - 10;
    const angles = new Array(17).fill(0);
    angles[7] = sL;
    angles[8] = sU;
    const fk0 = solveForwardKinematics17(740, cy, angles, 0.5);
    const shX = fk0[8].endX;
    const shY = fk0[8].endY;

    for (let b = -95; b <= -60; b += 1) {
      for (let f = -80; f <= -30; f += 1) {
        angles[9] = b;
        angles[10] = f;
        angles[11] = f;
        const fk = solveForwardKinematics17(740, cy, angles, 0.5);
        const handX = fk[11].endX;
        const handY = fk[11].endY;
        if (Math.abs(handY - 719.0) < 0.2) {
          const reachDist = Math.hypot(shX - handX, shY - (737.0 - 18.0));
          const reachRatio = reachDist / armLen;
          if (reachRatio >= 0.60 && reachRatio <= 0.90) {
            console.log(`cy=${cy}, sL=${sL}, sU=${sU}, b=${b}, f=${f}: hand=(${handX.toFixed(2)}, ${handY.toFixed(2)}), reachRatio=${(reachRatio*100).toFixed(1)}%`);
          }
        }
      }
    }
  }
}
