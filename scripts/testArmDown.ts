import { solveForwardKinematics17 } from '../src/lib/humanMotionSkills';
import { STICKFIGURE_BONE_LENGTHS } from '../src/lib/stkndsCodec';

// In F10: charX = 740, charY = 630
// Lower spine = 35°, Upper spine = 25°
const angles = new Array(17).fill(0);
angles[7] = 35;
angles[8] = 25;
// Arm hanging down to reach (850, 719)
angles[9] = -72;
angles[10] = -65;
angles[11] = -65;

const fk = solveForwardKinematics17(740, 630, angles, 0.5);
console.log('Shoulder:', fk[8].endX.toFixed(1), fk[8].endY.toFixed(1));
console.log('Hand:', fk[11].endX.toFixed(1), fk[11].endY.toFixed(1));
const ballX = 850;
const ballY = 737;
const distToBallCenter = Math.hypot(fk[11].endX - ballX, fk[11].endY - ballY);
console.log('Dist to ball center (850, 737):', distToBallCenter.toFixed(2), 'vs R=18:', (distToBallCenter - 18).toFixed(2));
const armLen = (STICKFIGURE_BONE_LENGTHS[9] + STICKFIGURE_BONE_LENGTHS[10] + STICKFIGURE_BONE_LENGTHS[11]) * 0.5;
const reachDist = Math.hypot(fk[8].endX - ballX, fk[8].endY - (ballY - 18));
console.log('Reach ratio:', ((reachDist / armLen) * 100).toFixed(1) + '%');
