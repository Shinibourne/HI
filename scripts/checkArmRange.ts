import { solveForwardKinematics17 } from '../src/lib/humanMotionSkills';

const angles = new Array(17).fill(0);
angles[7] = 35;
angles[8] = 25;
const fk = solveForwardKinematics17(740, 620, angles, 0.5);
console.log('Shoulder joint:', fk[8].endX, fk[8].endY);

let minY = 999;
let maxY = -999;
for (let b = -180; b <= 180; b += 10) {
  for (let f = -180; f <= 180; f += 10) {
    angles[9] = b;
    angles[10] = f;
    angles[11] = f;
    const fkArm = solveForwardKinematics17(740, 620, angles, 0.5);
    const hy = fkArm[11].endY;
    if (hy < minY) minY = hy;
    if (hy > maxY) maxY = hy;
  }
}
console.log('Hand Y range:', minY, 'to', maxY);
