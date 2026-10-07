import { solveForwardKinematics17 } from '../src/lib/humanMotionSkills';
import { STICKFIGURE_BONE_LENGTHS } from '../src/lib/stkndsCodec';

const armLen = (STICKFIGURE_BONE_LENGTHS[9] + STICKFIGURE_BONE_LENGTHS[10] + STICKFIGURE_BONE_LENGTHS[11]) * 0.5;

const cy = 605;
const angles = new Array(17).fill(0);
angles[7] = 38;
angles[8] = 28;
const fk0 = solveForwardKinematics17(740, cy, angles, 0.5);
console.log('Shoulder joint at cy=605:', fk0[8].endX, fk0[8].endY);

let minDiff = 999;
let best = null;
for (let b = -95; b <= -40; b += 0.5) {
  for (let f = -95; f <= -30; f += 0.5) {
    angles[9] = b;
    angles[10] = f;
    angles[11] = f;
    const fk = solveForwardKinematics17(740, cy, angles, 0.5);
    const handX = fk[11].endX;
    const handY = fk[11].endY;
    const diff = Math.abs(handY - 719.0);
    if (diff < minDiff) {
      minDiff = diff;
      const reachDist = Math.hypot(fk0[8].endX - handX, fk0[8].endY - (737.0 - 18.0));
      best = { b, f, handX, handY, reachRatio: reachDist / armLen, diff };
    }
  }
}
console.log('Best match:', best);
