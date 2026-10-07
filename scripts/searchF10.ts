import { solveForwardKinematics17, solveLegLimb } from '../src/lib/humanMotionSkills';
import { STICKFIGURE_BONE_LENGTHS } from '../src/lib/stkndsCodec';

const G = 755.0;
const R = 18.0;
const armLen = (STICKFIGURE_BONE_LENGTHS[9] + STICKFIGURE_BONE_LENGTHS[10] + STICKFIGURE_BONE_LENGTHS[11]) * 0.5;

console.log('Testing spine angles and charY:');
for (const cy of [620, 625, 630, 635]) {
  for (const sL of [25, 30, 35, 40]) {
    for (const sU of [15, 20, 25, 30]) {
      const angles = new Array(17).fill(0);
      angles[7] = sL;
      angles[8] = sU;
      const fk = solveForwardKinematics17(740, cy, angles, 0.5);
      const shX = fk[8].endX;
      const shY = fk[8].endY;

      // Find an arm angle that puts hand at handY = 719.0
      // Let's sweep bicep and forearm
      for (let b = -90; b <= -40; b += 2) {
        for (let f = -80; f <= -30; f += 2) {
          angles[9] = b;
          angles[10] = f;
          angles[11] = f; // hand angle same as forearm
          const fkArm = solveForwardKinematics17(740, cy, angles, 0.5);
          const handX = fkArm[11].endX;
          const handY = fkArm[11].endY;

          if (Math.abs(handY - 719.0) < 0.2) {
            // Ball is at (handX, 737.0)
            const ballX = handX;
            const ballY = 737.0;
            // Contact dist to ball center:
            const contactDist = Math.hypot(handX - ballX, handY - ballY);
            // Reach ratio:
            const reachDist = Math.hypot(shX - ballX, shY - (ballY - R));
            const reachRatio = reachDist / armLen;

            if (reachRatio >= 0.50 && reachRatio <= 0.88) {
              console.log(`MATCH: cy=${cy}, sL=${sL}, sU=${sU}, b=${b}, f=${f} -> hand=(${handX.toFixed(1)}, ${handY.toFixed(1)}), reach=${(reachRatio*100).toFixed(1)}%, contactDist=${contactDist.toFixed(2)}`);
              break;
            }
          }
        }
      }
    }
  }
}
