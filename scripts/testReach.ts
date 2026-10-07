import { solveForwardKinematics17 } from '../src/lib/humanMotionSkills';
import { STICKFIGURE_BONE_LENGTHS } from '../src/lib/stkndsCodec';

const angles = new Array(17).fill(0);
angles[7] = 20; // forward lean
angles[8] = 10; // forward lean
const fk = solveForwardKinematics17(730, 630, angles, 0.5);
console.log('Shoulder X, Y:', fk[8].endX, fk[8].endY);
const ballX = 800;
const ballContactY = 737 - 18; // 719
const dist = Math.hypot(fk[8].endX - ballX, fk[8].endY - ballContactY);
console.log('Dist to ball contact:', dist);
const maxArm = (STICKFIGURE_BONE_LENGTHS[9] + STICKFIGURE_BONE_LENGTHS[10] + STICKFIGURE_BONE_LENGTHS[11]) * 0.5;
console.log('Ratio:', dist / maxArm);
