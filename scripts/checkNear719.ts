import { solveForwardKinematics17 } from '../src/lib/humanMotionSkills';
import { STICKFIGURE_BONE_LENGTHS } from '../src/lib/stkndsCodec';

const armLen = (STICKFIGURE_BONE_LENGTHS[9] + STICKFIGURE_BONE_LENGTHS[10] + STICKFIGURE_BONE_LENGTHS[11]) * 0.5;

const cy = 630;
const sL = 25;
const sU = 15;
const angles = new Array(17).fill(0);
angles[7] = sL;
angles[8] = sU;
const fk0 = solveForwardKinematics17(740, cy, angles, 0.5);
const shX = fk0[8].endX;
const shY = fk0[8].endY;
console.log('Shoulder at cy=630:', shX, shY);

for (let b = -85; b <= -45; b += 1) {
  for (let f = -80; f <= -35; f += 1) {
    angles[9] = b;
    angles[10] = f;
    angles[11] = f;
    const fk = solveForwardKinematics17(740, cy, angles, 0.5);
    const handX = fk[11].endX;
    const handY = fk[11].endY;
    if (Math.abs(handY - 719.0) < 1.0) {
      const reachDist = Math.hypot(shX - handX, shY - (737.0 - 18.0));
      const reachRatio = reachDist / armLen;
      const elbowFlex = Math.abs(f - b);
      console.log(`b=${b}, f=${f}: hand=(${handX.toFixed(2)}, ${handY.toFixed(2)}), reachRatio=${(reachRatio*100).toFixed(1)}%, elbowFlex=${elbowFlex.toFixed(1)}°`);
    }
  }
}
