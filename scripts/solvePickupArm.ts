import { solveForwardKinematics17 } from '../src/lib/humanMotionSkills';
import { STICKFIGURE_BONE_LENGTHS } from '../src/lib/stkndsCodec';

// We want F10 to reach handY = 719.0 px exactly (737 - 18 = 719.0)
// And we want shoulder to (handX, 719) reachRatio between 0.35 and 0.95!
// Arm length = (73.8 + 88.9 + 8.1) * 0.5 = 170.8 px * 0.5 = 85.4 px?
// Wait! Let's check STICKFIGURE_BONE_LENGTHS:
console.log('Bone 9 length:', STICKFIGURE_BONE_LENGTHS[9]);
console.log('Bone 10 length:', STICKFIGURE_BONE_LENGTHS[10]);
console.log('Bone 11 length:', STICKFIGURE_BONE_LENGTHS[11]);
const armLen = (STICKFIGURE_BONE_LENGTHS[9] + STICKFIGURE_BONE_LENGTHS[10] + STICKFIGURE_BONE_LENGTHS[11]) * 0.5;
console.log('Arm length at scale 0.5:', armLen);

// In FK, bone 8 is upper spine. fk[8].endX, fk[8].endY is the neck base/shoulder joint!
const angles = new Array(17).fill(0);
angles[7] = 35; // lower spine
angles[8] = 25; // upper spine

// Test different charY (e.g. 610, 620, 625, 630)
for (const cy of [610, 615, 620, 625, 630]) {
  const fk = solveForwardKinematics17(740, cy, angles, 0.5);
  const shX = fk[8].endX;
  const shY = fk[8].endY;
  console.log(`cy=${cy}: shoulder=(${shX.toFixed(1)}, ${shY.toFixed(1)})`);
  // Vertical distance from shoulder to 719.0:
  const dy = 719.0 - shY;
  console.log(`  dy to 719: ${dy.toFixed(1)} px. Max reach is ${armLen} px.`);
}
