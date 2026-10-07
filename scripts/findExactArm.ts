import { solveForwardKinematics17 } from '../src/lib/humanMotionSkills';
import { STICKFIGURE_BONE_LENGTHS } from '../src/lib/stkndsCodec';

const G = 755.0;
const R = 18.0;
const armLen = (STICKFIGURE_BONE_LENGTHS[9] + STICKFIGURE_BONE_LENGTHS[10] + STICKFIGURE_BONE_LENGTHS[11]) * 0.5;

const angles = new Array(17).fill(0);
// Let's test charY = 620, sL = 35, sU = 25
angles[7] = 35;
angles[8] = 25;

const fk0 = solveForwardKinematics17(740, 620, angles, 0.5);
const shX = fk0[8].endX;
const shY = fk0[8].endY;

for (let b = -100; b <= -60; b += 0.5) {
  for (let f = -100; f <= -40; f += 0.5) {
    angles[9] = b;
    angles[10] = f;
    angles[11] = f;
    const fk = solveForwardKinematics17(740, 620, angles, 0.5);
    const handX = fk[11].endX;
    const handY = fk[11].endY;

    if (Math.abs(handY - 719.0) < 0.05) {
      // Ball at (handX, 737.0)
      const ballX = handX;
      const ballY = 737.0;
      // Reach ratio from shoulder to top of ball:
      const reachDist = Math.hypot(shX - ballX, shY - (ballY - R));
      const reachRatio = reachDist / armLen;
      // Also check elbow flexion = |f - b|
      const elbowFlex = Math.abs(f - b);
      if (reachRatio >= 0.50 && reachRatio <= 0.90 && elbowFlex >= 15 && elbowFlex <= 45) {
        console.log(`b=${b.toFixed(1)}, f=${f.toFixed(1)} -> hand=(${handX.toFixed(1)}, ${handY.toFixed(1)}), reachRatio=${(reachRatio*100).toFixed(1)}%, elbowFlex=${elbowFlex.toFixed(1)}°`);
      }
    }
  }
}
