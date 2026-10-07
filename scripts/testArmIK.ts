import { solveArmLimb, solveForwardKinematics17 } from '../src/lib/humanMotionSkills';

// Test shoulder and targets
const shoulderX = 780;
const shoulderY = 430;

const targets = [
  { f: 12, x: 785, y: 578 },
  { f: 13, x: 785, y: 568 },
  { f: 14, x: 785, y: 468 },
  { f: 15, x: 785, y: 413 },
  { f: 16, x: 785, y: 440 },
  { f: 17, x: 785, y: 465 },
  { f: 18, x: 785, y: 498 },
  { f: 19, x: 785, y: 578 },
];

for (const t of targets) {
  const arm = solveArmLimb(shoulderX, shoulderY, t.x, t.y, true, 0.5);
  console.log(`F${t.f}: bicep=${arm.bicepAngleDeg.toFixed(1)}, forearm=${arm.forearmAngleDeg.toFixed(1)}`);
}
