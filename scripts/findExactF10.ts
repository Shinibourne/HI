import { solveForwardKinematics17 } from '../src/lib/humanMotionSkills';

const angles = new Array(17).fill(0);
angles[7] = 35;
angles[8] = 25;

for (let b = -80; b <= -65; b += 0.5) {
  for (let f = -85; f <= -65; f += 0.5) {
    angles[9] = b;
    angles[10] = f;
    angles[11] = f;
    const fk = solveForwardKinematics17(740, 624, angles, 0.5);
    const handY = fk[11].endY;
    if (Math.abs(handY - 719.0) < 0.2) {
      console.log(`Found! b=${b}, f=${f}, handX=${fk[11].endX.toFixed(2)}, handY=${fk[11].endY.toFixed(2)}`);
      break;
    }
  }
}
