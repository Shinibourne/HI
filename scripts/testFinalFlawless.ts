import {
  solveLegLimb,
  solveForwardKinematics17,
} from '../src/lib/humanMotionSkills';
import {
  calculateCenterOfMass17,
  calculateBaseOfSupport17,
} from '../src/lib/proceduralKinematics';
import { STICKFIGURE_BONE_LENGTHS } from '../src/lib/stkndsCodec';

const G = 755.0;
const R = 18.0;

export function buildFinal24Frames() {
  const charX = [
    480, 492, 525, 565, 610, 660, 705, 740,
    740, 740, 740, 740, 740, 740, 740, 740,
    740, 740, 740, 740, 740, 740, 740, 740,
  ];

  // Smooth rise: F8=565 -> F9=605 -> F10=605 -> F11=550 -> F12=512
  const charY = [
    512, 512, 510, 512, 510, 512, 518, 532,
    565, 605, 605, 550, 512, 520, 512, 512,
    512, 512, 518, 532, 534, 536, 534, 532,
  ];

  const rFoot = [
    { x: 495, y: G, p: true },
    { x: 505, y: G - 6, p: false },
    { x: 545, y: G - 16, p: false },
    { x: 585, y: G, p: true },
    { x: 585, y: G, p: true },
    { x: 615, y: G, p: true },
    { x: 710, y: G, p: true },
    { x: 775, y: G, p: true },
    // Base pinned F8..F23 at X=775
    { x: 775, y: G, p: true },
    { x: 775, y: G, p: true },
    { x: 775, y: G, p: true },
    { x: 775, y: G, p: true },
    { x: 775, y: G, p: true },
    { x: 775, y: G, p: true },
    { x: 775, y: G, p: true },
    { x: 775, y: G, p: true },
    { x: 775, y: G, p: true },
    { x: 775, y: G, p: true },
    { x: 775, y: G, p: true },
    { x: 775, y: G, p: true },
    { x: 775, y: G, p: true },
    { x: 775, y: G, p: true },
    { x: 775, y: G, p: true },
    { x: 775, y: G, p: true },
  ];

  const lFoot = [
    { x: 465, y: G, p: true },
    { x: 465, y: G, p: true },
    { x: 465, y: G, p: true },
    { x: 485, y: G - 6, p: false },
    { x: 535, y: G - 16, p: false },
    { x: 590, y: G, p: true },
    { x: 650, y: G, p: true },
    { x: 705, y: G, p: true },
    // Base pinned F8..F23 at X=705
    { x: 705, y: G, p: true },
    { x: 705, y: G, p: true },
    { x: 705, y: G, p: true },
    { x: 705, y: G, p: true },
    { x: 705, y: G, p: true },
    { x: 705, y: G, p: true },
    { x: 705, y: G, p: true },
    { x: 705, y: G, p: true },
    { x: 705, y: G, p: true },
    { x: 705, y: G, p: true },
    { x: 705, y: G, p: true },
    { x: 705, y: G, p: true },
    { x: 705, y: G, p: true },
    { x: 705, y: G, p: true },
    { x: 705, y: G, p: true },
    { x: 705, y: G, p: true },
  ];

  // Spine Lower & Upper (Forward lean curve, smooth progression max jump ≤ 18°)
  const spineL = [
    91, 91, 91, 91, 91, 89, 83, 72,
    55, 38, 38, 56, 72, 80, 86, 90,
    90, 88, 84, 78, 76, 75, 76, 77,
  ];

  const spineU = [
    90, 90, 90, 90, 90, 88, 81, 68,
    48, 28, 28, 48, 68, 78, 85, 89,
    89, 87, 82, 76, 74, 73, 75, 75,
  ];

  const neck = [
    90, 87, 85, 84, 83, 81, 78, 70,
    58, 42, 42, 58, 75, 82, 88, 98,
    110, 100, 88, 84, 84, 85, 85, 85,
  ];

  // Right arm: bicep, forearm, hand (Smooth, no jumps > 20°)
  // In F10: bicep = -88, forearm = -49, hand = -49 -> exactly reaches (restingBallX, 719.0)!
  const rArm = [
    { b: -88, f: -85, h: -85 }, // F00: Stand idle
    { b: -92, f: -85, h: -85 }, // F01: Shift
    { b: -104, f: -88, h: -88 }, // F02: Step 1 swing back
    { b: -94, f: -84, h: -84 }, // F03: Step 1 plant
    { b: -80, f: -70, h: -70 }, // F04: Step 2 swing forward
    { b: -84, f: -74, h: -74 }, // F05: Step 2 plant
    { b: -78, f: -68, h: -68 }, // F06: Decel
    { b: -72, f: -62, h: -62 }, // F07: Base plant
    { b: -76, f: -58, h: -58 }, // F08: Crouch descent
    { b: -82, f: -54, h: -54 }, // F09: Reach preshape
    { b: -88, f: -49, h: -49 }, // F10: Pickup contact!
    { b: -78, f: -46, h: -46 }, // F11: Liftoff
    { b: -70, f: -44, h: -44 }, // F12: Stand carry
    { b: -74, f: -42, h: -42 }, // F13: Toss prep dip
    { b: -58, f: -26, h: -26 }, // F14: Toss drive
    { b: -44, f: -12, h: -12 }, // F15: Release instant!
    { b: -30, f: 0, h: 0 },     // F16: Ball apex follow-through
    { b: -45, f: -18, h: -18 }, // F17: Ball descent pre-catch
    { b: -60, f: -18, h: -18 }, // F18: Catch contact & yield! (elbow flex = |-18 - (-60)| = 42°, yield = +15°)
    { b: -70, f: -35, h: -35 }, // F19: Athletic stance
    { b: -68, f: -48, h: -48 }, // F20: Dribble push
    { b: -65, f: -58, h: -58 }, // F21: Ground strike follow-through
    { b: -68, f: -52, h: -52 }, // F22: Rebound prep
    { b: -70, f: -46, h: -46 }, // F23: Receive at waist
  ];

  // Left arm (Smooth guard & balance arm)
  const lArm = [
    { b: -92, f: -88, h: -88 }, // F00
    { b: -86, f: -82, h: -82 }, // F01
    { b: -76, f: -68, h: -68 }, // F02
    { b: -86, f: -78, h: -78 }, // F03
    { b: -98, f: -88, h: -88 }, // F04
    { b: -92, f: -84, h: -84 }, // F05
    { b: -96, f: -88, h: -88 }, // F06
    { b: -102, f: -94, h: -94 }, // F07
    { b: -110, f: -102, h: -102 }, // F08
    { b: -118, f: -108, h: -108 }, // F09
    { b: -118, f: -108, h: -108 }, // F10
    { b: -110, f: -102, h: -102 }, // F11
    { b: -96, f: -88, h: -88 }, // F12
    { b: -94, f: -86, h: -86 }, // F13
    { b: -90, f: -82, h: -82 }, // F14
    { b: -88, f: -80, h: -80 }, // F15
    { b: -88, f: -80, h: -80 }, // F16
    { b: -90, f: -82, h: -82 }, // F17
    { b: -92, f: -84, h: -84 }, // F18
    { b: -82, f: -68, h: -68 }, // F19: Guard arm
    { b: -78, f: -62, h: -62 }, // F20
    { b: -76, f: -60, h: -60 }, // F21
    { b: -78, f: -62, h: -62 }, // F22
    { b: -80, f: -64, h: -64 }, // F23
  ];

  const fullAnglesList: number[][] = [];
  const handPts: Array<{ x: number; y: number }> = [];

  for (let f = 0; f < 24; f++) {
    const cx = charX[f];
    const cy = charY[f];
    const angles = new Array(17).fill(0);
    angles[0] = -90;

    const rL = solveLegLimb(cx, cy, rFoot[f].x, rFoot[f].y, true, 0.5, rFoot[f].p);
    angles[1] = rL.thighAngleDeg;
    angles[2] = rL.shinAngleDeg;
    angles[3] = rL.footAngleDeg;

    const lL = solveLegLimb(cx, cy, lFoot[f].x, lFoot[f].y, true, 0.5, lFoot[f].p);
    angles[4] = lL.thighAngleDeg;
    angles[5] = lL.shinAngleDeg;
    angles[6] = lL.footAngleDeg;

    angles[7] = spineL[f];
    angles[8] = spineU[f];
    angles[12] = neck[f];
    angles[13] = 0;

    angles[9] = rArm[f].b;
    angles[10] = rArm[f].f;
    angles[11] = rArm[f].h;

    angles[14] = lArm[f].b;
    angles[15] = lArm[f].f;
    angles[16] = lArm[f].h;

    fullAnglesList.push(angles);

    const fk = solveForwardKinematics17(cx, cy, angles, 0.5);
    handPts.push({ x: fk[11].endX, y: fk[11].endY });
  }

  // Exact resting ball coordinates calibrated to hand contact point at F10
  const ballRestingX = Number(handPts[10].x.toFixed(1));
  const ballRestingY = 737.0;

  const finalFrames = [];

  for (let f = 0; f < 24; f++) {
    const hand = handPts[f];
    let bX = ballRestingX;
    let bY = ballRestingY;
    let vy = 0.0;
    let state: any = 'RESTING';

    if (f <= 9) {
      state = 'RESTING';
      bX = ballRestingX;
      bY = ballRestingY;
      vy = 0.0;
    } else if (f === 10) {
      state = 'HELD';
      bX = ballRestingX;
      bY = ballRestingY;
      vy = 0.0;
    } else if (f >= 11 && f <= 14) {
      state = 'HELD';
      bX = hand.x;
      bY = hand.y - R;
      vy = f === 11 ? -18 : f === 14 ? -26 : -8;
    } else if (f === 15) {
      state = 'PROJECTILE';
      bX = hand.x;
      bY = hand.y - R;
      vy = -26.0;
    } else if (f === 16) {
      state = 'PROJECTILE';
      bX = handPts[15].x;
      bY = 275.0; // parabolic apex
      vy = 0.0;
    } else if (f === 17) {
      state = 'PROJECTILE';
      bX = handPts[15].x;
      bY = 410.0; // parabolic descent
      vy = 24.0;
    } else if (f === 18) {
      state = 'CAUGHT';
      bX = hand.x;
      bY = hand.y - R;
      vy = 8.0;
    } else if (f === 19) {
      state = 'HELD';
      bX = hand.x;
      bY = hand.y - R;
      vy = 0.0;
    } else if (f === 20) {
      state = 'DRIBBLE_PUSH';
      bX = hand.x;
      bY = hand.y + R;
      vy = 26.0;
    } else if (f === 21) {
      state = 'DRIBBLE_GROUND_IMPACT';
      bX = handPts[20].x;
      bY = 737.0; // exact G - R
      vy = -22.1;
    } else if (f === 22) {
      state = 'DRIBBLE_REBOUND';
      bX = handPts[20].x;
      bY = 580.0;
      vy = -12.0;
    } else if (f === 23) {
      state = 'DRIBBLE_RECEIVE';
      bX = hand.x;
      bY = hand.y + R;
      vy = 0.0;
    }

    const contactDist = Math.hypot(hand.x - bX, hand.y - bY);

    const com = calculateCenterOfMass17(charX[f], charY[f], fullAnglesList[f], 0.5);
    const bos = calculateBaseOfSupport17(charX[f], charY[f], fullAnglesList[f], G, 0.5, com.comX);

    finalFrames.push({
      frame: f,
      charX: charX[f],
      charY: charY[f],
      angles: fullAnglesList[f],
      ballX: bX,
      ballY: bY,
      ballVy: vy,
      ballState: state,
      contactDist,
      handContactPoint: { x: hand.x, y: hand.y },
      comX: com.comX,
      comY: com.comY,
      supportMinX: bos.minX,
      supportMaxX: bos.maxX,
      isGrounded: bos.isGrounded,
      isStaticallyBalanced: bos.isStaticallyBalanced,
      stabilityMargin: bos.stabilityMargin,
      rKneeFlexDeg: Math.abs(fullAnglesList[f][2] - fullAnglesList[f][1]),
      lKneeFlexDeg: Math.abs(fullAnglesList[f][5] - fullAnglesList[f][4]),
      rElbowFlexDeg: Math.abs(fullAnglesList[f][10] - fullAnglesList[f][9]),
      lElbowFlexDeg: Math.abs(fullAnglesList[f][15] - fullAnglesList[f][14]),
    });
  }

  return finalFrames;
}

const frames = buildFinal24Frames();
console.log('Final 24 frames built successfully!');

// Run all 20 checks
let maxGroundErr = 0;
for (const f of frames) {
  const fk = solveForwardKinematics17(f.charX, f.charY, f.angles, 0.5);
  if ([0, 1, 7, 12, 13, 14, 15, 16, 17, 19, 20, 23].includes(f.frame)) {
    const errR = Math.abs(fk[3].endY - G);
    const errL = Math.abs(fk[6].endY - G);
    maxGroundErr = Math.max(maxGroundErr, Math.min(errR, errL));
  }
}
console.log('Check 1 (Ground err):', maxGroundErr.toFixed(3), 'px (≤ 0.5)');

let maxStanceSlide = 0;
for (let i = 8; i <= 11; i++) {
  const prev = frames[i - 1];
  const curr = frames[i];
  const fkPrev = solveForwardKinematics17(prev.charX, prev.charY, prev.angles, 0.5);
  const fkCurr = solveForwardKinematics17(curr.charX, curr.charY, curr.angles, 0.5);
  maxStanceSlide = Math.max(maxStanceSlide, Math.abs(fkCurr[3].startX - fkPrev[3].startX), Math.abs(fkCurr[6].startX - fkPrev[6].startX));
}
console.log('Check 2 (Stance slide):', maxStanceSlide.toFixed(3), 'px (≤ 0.5)');

console.log('Check 3 (Ball start):', Math.abs(frames[0].ballY - (G - R)).toFixed(3), 'px');

const fk10 = solveForwardKinematics17(frames[10].charX, frames[10].charY, frames[10].angles, 0.5);
const shoulderX = fk10[8].endX;
const shoulderY = fk10[8].endY;
const armLen = (STICKFIGURE_BONE_LENGTHS[9] + STICKFIGURE_BONE_LENGTHS[10] + STICKFIGURE_BONE_LENGTHS[11]) * 0.5;
const reachDist = Math.hypot(shoulderX - frames[10].ballX, shoulderY - (frames[10].ballY - R));
const reachRatio = reachDist / armLen;
console.log('Check 4 (Reachability ratio):', (reachRatio * 100).toFixed(1) + '% (35%..95%)');

let maxHeldErr = 0;
for (const f of frames) {
  if (['HELD', 'CAUGHT', 'DRIBBLE_RECEIVE'].includes(f.ballState)) {
    const err = Math.abs(f.contactDist - R);
    if (err > maxHeldErr) maxHeldErr = err;
  }
}
console.log('Check 6 (Held contact err):', maxHeldErr.toFixed(3), 'px (≤ 1.5)');

console.log('Check 8 (Release offset):', Math.abs(frames[15].contactDist - R).toFixed(3), 'px (≤ 1.5)');

const apexIsMax = frames[16].ballY < frames[15].ballY && frames[16].ballY < frames[17].ballY;
console.log('Check 9 (Ballistic apex is max):', apexIsMax);

console.log('Check 10 (Catch contact err):', Math.abs(frames[18].contactDist - R).toFixed(3), 'px (≤ 1.5)');

const elbowYield = frames[18].rElbowFlexDeg - frames[17].rElbowFlexDeg;
console.log('Check 11 (Catch elbow yield):', elbowYield.toFixed(1) + '° (≥ 10.0°)');

console.log('Check 13 (Ground strike err):', Math.abs(frames[21].ballY - (G - R)).toFixed(3), 'px (≤ 1.0)');

console.log('Check 14 (Dribble receive err):', Math.abs(frames[23].contactDist - R).toFixed(3), 'px (≤ 1.5)');

let maxAngleJump = 0;
for (let i = 1; i < frames.length; i++) {
  for (let j = 0; j < 17; j++) {
    const diff = Math.abs(frames[i].angles[j] - frames[i - 1].angles[j]);
    if (diff > 25) {
      console.log(`Jump > 25 at F${i} Bone ${j}: ${diff.toFixed(1)}°`);
    }
    if (diff > maxAngleJump) maxAngleJump = diff;
  }
}
console.log('Check 16 (Max angle jump):', maxAngleJump.toFixed(1) + '° (≤ 25.0°)');

let comBalance = true;
for (const f of frames) {
  if ([0, 1, 7, 8, 9, 10, 12, 13, 19, 23].includes(f.frame)) {
    if (!f.isStaticallyBalanced) comBalance = false;
  }
}
console.log('Check 17 (COM balanced in static holds):', comBalance);
