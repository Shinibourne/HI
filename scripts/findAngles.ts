import { solveForwardKinematics17 } from '../src/lib/humanMotionSkills';

for (let a9 = -85; a9 <= -70; a9++) {
  for (let a10 = -85; a10 <= -70; a10++) {
    const angles = new Array(17).fill(0);
    angles[7] = 35;
    angles[8] = 25;
    angles[9] = a9;
    angles[10] = a10;
    angles[11] = a10;
    const fk = solveForwardKinematics17(740, 630, angles, 0.5);
    const d = Math.hypot(fk[11].endX - 850, fk[11].endY - 737);
    if (Math.abs(d - 18) < 0.5) {
      console.log(`Found exact match! a9=${a9}, a10=${a10}, Hand: (${fk[11].endX.toFixed(2)}, ${fk[11].endY.toFixed(2)}), dist=${d.toFixed(3)}`);
      break;
    }
  }
}
