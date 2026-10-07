import { solveForwardKinematics17 } from '../src/lib/humanMotionSkills';
import { STICKFIGURE_BONE_LENGTHS } from '../src/lib/stkndsCodec';

const angles = new Array(17).fill(0);
angles[7] = 35;
angles[8] = 25;
angles[9] = -80;
angles[10] = -58;
angles[11] = -58;
const fk = solveForwardKinematics17(740, 624, angles, 0.5);
console.log('Hand:', fk[11].endX.toFixed(2), fk[11].endY.toFixed(2));
const shoulder = { x: fk[8].endX, y: fk[8].endY };
const armLen = (STICKFIGURE_BONE_LENGTHS[9] + STICKFIGURE_BONE_LENGTHS[10] + STICKFIGURE_BONE_LENGTHS[11]) * 0.5;
const reach = Math.hypot(shoulder.x - fk[11].endX, shoulder.y - (737 - 18));
console.log('Reach ratio:', (reach / armLen * 100).toFixed(1) + '%');
console.log('Dist to ball center (handX, 737):', Math.hypot(fk[11].endX - fk[11].endX, fk[11].endY - 737).toFixed(2));
