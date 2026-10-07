import { solveLegLimb, solveForwardKinematics17 } from '../src/lib/humanMotionSkills';

const charX = 480;
const charY = 510;
const targetX = 490;
const targetY = 755;

const rLeg = solveLegLimb(charX, charY, targetX, targetY, true, 0.5, true);
console.log('rLeg.ankleX, ankleY:', rLeg.ankleX, rLeg.ankleY);
console.log('rLeg.footTipX, footTipY:', rLeg.footTipX, rLeg.footTipY);
console.log('thighAngle:', rLeg.thighAngleDeg, 'shinAngle:', rLeg.shinAngleDeg, 'footAngle:', rLeg.footAngleDeg);

const angles = new Array(17).fill(0);
angles[1] = rLeg.thighAngleDeg;
angles[2] = rLeg.shinAngleDeg;
angles[3] = rLeg.footAngleDeg;

const fk = solveForwardKinematics17(charX, charY, angles, 0.5);
console.log('fk[1].endX, endY (Knee):', fk[1].endX, fk[1].endY);
console.log('fk[2].endX, endY (Ankle):', fk[2].endX, fk[2].endY);
console.log('fk[3].endX, endY (Foot tip):', fk[3].endX, fk[3].endY);
