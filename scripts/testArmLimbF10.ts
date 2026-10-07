import { solveForwardKinematics17, solveArmLimb } from '../src/lib/humanMotionSkills';
import { STICKFIGURE_BONE_LENGTHS } from '../src/lib/stkndsCodec';

const armLen = (STICKFIGURE_BONE_LENGTHS[9] + STICKFIGURE_BONE_LENGTHS[10] + STICKFIGURE_BONE_LENGTHS[11]) * 0.5;

// Let's test charY = 630, spine lower = 25, upper = 15
const cy = 630;
const angles = new Array(17).fill(0);
angles[7] = 25;
angles[8] = 15;
const fk0 = solveForwardKinematics17(740, cy, angles, 0.5);
const shX = fk0[8].endX;
const shY = fk0[8].endY;
console.log(`Shoulder at cy=630: (${shX.toFixed(1)}, ${shY.toFixed(1)})`);

// Test target hand positions at Y = 719.0:
for (let targetX = 840; targetX <= 920; targetX += 5) {
  const arm = solveArmLimb(shX, shY, targetX, 719.0, false, 0.5);
  angles[9] = arm.bicepAngleDeg;
  angles[10] = arm.forearmAngleDeg;
  angles[11] = arm.handAngleDeg;

  const fk = solveForwardKinematics17(740, cy, angles, 0.5);
  const handX = fk[11].endX;
  const handY = fk[11].endY;
  const reachDist = Math.hypot(shX - handX, shY - (737.0 - 18.0));
  const reachRatio = reachDist / armLen;
  const elbowFlex = Math.abs(arm.forearmAngleDeg - arm.bicepAngleDeg);

  console.log(`targetX=${targetX}: b=${arm.bicepAngleDeg.toFixed(1)}, f=${arm.forearmAngleDeg.toFixed(1)}, hand=(${handX.toFixed(2)}, ${handY.toFixed(2)}), reachRatio=${(reachRatio*100).toFixed(1)}%, elbowFlex=${elbowFlex.toFixed(1)}°`);
}
