import { solveForwardKinematics17 } from '../src/lib/humanMotionSkills';
import { STICKFIGURE_BONE_LENGTHS } from '../src/lib/stkndsCodec';

const armLen = (STICKFIGURE_BONE_LENGTHS[9] + STICKFIGURE_BONE_LENGTHS[10] + STICKFIGURE_BONE_LENGTHS[11]) * 0.5;

for (const cy of [630, 635, 640]) {
  for (const sL of [10, 15, 20, 25, 30]) {
    for (const sU of [0, 5, 10, 15, 20]) {
      const angles = new Array(17).fill(0);
      angles[7] = sL;
      angles[8] = sU;
      const fk0 = solveForwardKinematics17(740, cy, angles, 0.5);
      const shX = fk0[8].endX;
      const shY = fk0[8].endY;

      // Search b and f
      for (let b = -85; b <= -45; b += 1) {
        for (let f = -80; f <= -35; f += 1) {
          angles[9] = b;
          angles[10] = f;
          angles[11] = f;
          const fk = solveForwardKinematics17(740, cy, angles, 0.5);
          const handX = fk[11].endX;
          const handY = fk[11].endY;
          if (Math.abs(handY - 719.0) < 0.1) {
            const reachDist = Math.hypot(shX - handX, shY - (737.0 - 18.0));
            const reachRatio = reachDist / armLen;
            const elbowFlex = Math.abs(f - b);
            if (reachRatio >= 0.60 && reachRatio <= 0.88 && elbowFlex >= 15 && elbowFlex <= 45) {
              console.log(`MATCH: cy=${cy}, sL=${sL}, sU=${sU}, b=${b}, f=${f} -> hand=(${handX.toFixed(2)}, ${handY.toFixed(2)}), reachRatio=${(reachRatio*100).toFixed(1)}%, elbowFlex=${elbowFlex.toFixed(1)}°`);
              break;
            }
          }
        }
      }
    }
  }
}
