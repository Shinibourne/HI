import { solveForwardKinematics17 } from '../src/lib/humanMotionSkills';

const angles = new Array(17).fill(0);
// F20: charX = 740, charY = 534
// spineL = 76, spineU = 74
angles[7] = 76;
angles[8] = 74;

for (let b = -72; b <= -60; b += 2) {
  for (let f = -50; f <= -35; f += 2) {
    angles[9] = b;
    angles[10] = f;
    angles[11] = f;
    const fk = solveForwardKinematics17(740, 534, angles, 0.5);
    const handY = fk[11].endY;
    const ballY = handY + 18.0;
    if (Math.abs(ballY - 580.0) < 3.0) {
      console.log(`b=${b}, f=${f} -> handY=${handY.toFixed(1)}, ballY=${ballY.toFixed(1)}`);
    }
  }
}
