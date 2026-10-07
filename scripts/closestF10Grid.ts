import { solveForwardKinematics17 } from '../src/lib/humanMotionSkills';
import { STICKFIGURE_BONE_LENGTHS } from '../src/lib/stkndsCodec';

const armLen = (STICKFIGURE_BONE_LENGTHS[9] + STICKFIGURE_BONE_LENGTHS[10] + STICKFIGURE_BONE_LENGTHS[11]) * 0.5;

const cy = 630;
const angles = new Array(17).fill(0);
angles[7] = 35;
angles[8] = 25;
const fk0 = solveForwardKinematics17(740, cy, angles, 0.5);
const shX = fk0[8].endX;
const shY = fk0[8].endY;

let best = null;
let minErr = 999;

for (let b = -120; b <= 0; b += 1) {
  for (let f = -120; f <= 0; f += 1) {
    angles[9] = b;
    angles[10] = f;
    angles[11] = f;
    const fk = solveForwardKinematics17(740, cy, angles, 0.5);
    const handX = fk[11].endX;
    const handY = fk[11].endY;
    const err = Math.abs(handY - 719.0);
    const reachDist = Math.hypot(shX - handX, shY - (737.0 - 18.0));
    const reachRatio = reachDist / armLen;

    if (err < minErr) {
      minErr = err;
      best = { b, f, handX, handY, reachRatio: (reachRatio * 100).toFixed(1) + '%' };
    }
  }
}
console.log('Closest F10:', best, 'minErr:', minErr);
