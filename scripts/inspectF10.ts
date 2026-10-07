import { solveForwardKinematics17 } from '../src/lib/humanMotionSkills';

const angles = new Array(17).fill(0);
angles[7] = 35;
angles[8] = 25;

let best = null;
let minErr = 999;

for (let b = -90; b <= -40; b += 1) {
  for (let f = -90; f <= -40; f += 1) {
    angles[9] = b;
    angles[10] = f;
    angles[11] = f;
    const fk = solveForwardKinematics17(740, 624, angles, 0.5);
    const handY = fk[11].endY;
    const handX = fk[11].endX;
    const err = Math.abs(handY - 719.0);
    if (err < minErr) {
      minErr = err;
      best = { b, f, handX, handY };
    }
  }
}

console.log('Best match:', best, 'err:', minErr);
