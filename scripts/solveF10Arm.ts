import { solveForwardKinematics17 } from '../src/lib/humanMotionSkills';
import { STICKFIGURE_BONE_LENGTHS } from '../src/lib/stkndsCodec';

const armLen = (STICKFIGURE_BONE_LENGTHS[9] + STICKFIGURE_BONE_LENGTHS[10] + STICKFIGURE_BONE_LENGTHS[11]) * 0.5;

// Let's test charY = 630, spine lower = 35, upper = 25
const cy = 630;
const angles = new Array(17).fill(0);
angles[7] = 35;
angles[8] = 25;
const fk0 = solveForwardKinematics17(740, cy, angles, 0.5);
const shX = fk0[8].endX;
const shY = fk0[8].endY;

let best = null;
let minErr = 999;

for (let b = -85; b <= -40; b += 0.2) {
  for (let f = -85; f <= -30; f += 0.2) {
    angles[9] = b;
    angles[10] = f;
    angles[11] = f;
    const fk = solveForwardKinematics17(740, cy, angles, 0.5);
    const handX = fk[11].endX;
    const handY = fk[11].endY;
    const err = Math.abs(handY - 719.0);
    const reachDist = Math.hypot(shX - handX, shY - (737.0 - 18.0));
    const reachRatio = reachDist / armLen;

    if (err < 0.05 && reachRatio >= 0.70 && reachRatio <= 0.90) {
      console.log(`FOUND: b=${b.toFixed(1)}, f=${f.toFixed(1)} -> hand=(${handX.toFixed(2)}, ${handY.toFixed(2)}), err=${err.toFixed(3)}, reachRatio=${(reachRatio*100).toFixed(1)}%`);
      best = { b, f, handX, handY };
      break;
    }
  }
  if (best) break;
}
