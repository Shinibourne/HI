import { solveForwardKinematics17 } from '../src/lib/humanMotionSkills';
import { STICKFIGURE_BONE_LENGTHS } from '../src/lib/stkndsCodec';

const armLen = (STICKFIGURE_BONE_LENGTHS[9] + STICKFIGURE_BONE_LENGTHS[10] + STICKFIGURE_BONE_LENGTHS[11]) * 0.5;
const angles = new Array(17).fill(0);
angles[7] = 35;
angles[8] = 25;

const fk0 = solveForwardKinematics17(740, 620, angles, 0.5);
const shX = fk0[8].endX;
const shY = fk0[8].endY;
console.log('Shoulder:', shX, shY);

for (let b of [-90, -85, -80, -75, -70]) {
  for (let f of [-90, -85, -80, -75, -70, -65, -60]) {
    angles[9] = b;
    angles[10] = f;
    angles[11] = f;
    const fk = solveForwardKinematics17(740, 620, angles, 0.5);
    const handX = fk[11].endX;
    const handY = fk[11].endY;
    const reachDist = Math.hypot(shX - handX, shY - (737.0 - 18.0));
    console.log(`b=${b}, f=${f}: hand=(${handX.toFixed(1)}, ${handY.toFixed(1)}), reachRatio=${(reachDist/armLen*100).toFixed(1)}%`);
  }
}
