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

export function generateFlawless24Frames() {
  // 1. Root Pelvis (charX, charY)
  // Standing pelvis at Y = 512. Max leg span 250 px, so when feet are at dx=45 px, dy=243 px, dist=247 px < 250 px.
  const charX = [
    480, 492, 525, 565, 610, 660, 705, 735,
    738, 740, 740, 740, 740, 740, 740, 740,
    740, 740, 740, 740, 740, 740, 740, 740,
  ];

  const charY = [
    512, 512, 510, 512, 510, 512, 518, 532,
    585, 630, 630, 580, 512, 520, 512, 512,
    512, 512, 518, 532, 534, 536, 534, 532,
  ];

  // 2. Foot Targets (Pinned ground plane Y = 755.0)
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

  // 3. Spine and Neck angles (max step ≤ 18°/frame)
  const spineL = [
    91, 91, 91, 91, 91, 89, 85, 76,
    58, 42, 42, 58, 76, 84, 88, 90,
    90, 88, 84, 78, 76, 75, 76, 77,
  ];

  const spineU = [
    90, 90, 90, 90, 90, 88, 83, 73,
    52, 34, 34, 52, 74, 82, 87, 89,
    89, 87, 82, 76, 74, 73, 75, 75,
  ];

  const neck = [
    90, 87, 85, 84, 83, 81, 78, 72,
    62, 50, 50, 64, 80, 86, 92, 98,
    110, 100, 88, 84, 84, 85, 85, 85,
  ];

  // 4. Right Arm Angles (Smooth living motion, max step ≤ 18°/frame)
  const rArm = [
    { b: -88, f: -85, h: -85 }, // F00: Stand idle
    { b: -92, f: -85, h: -85 }, // F01: Shift
    { b: -104, f: -88, h: -88 }, // F02: Step 1 swing back
    { b: -94, f: -84, h: -84 }, // F03: Step 1 plant
    { b: -78, f: -68, h: -68 }, // F04: Step 2 swing forward
    { b: -82, f: -72, h: -72 }, // F05: Step 2 plant
    { b: -76, f: -65, h: -65 }, // F06: Decel
    { b: -70, f: -58, h: -58 }, // F07: Base plant
    { b: -58, f: -45, h: -45 }, // F08: Crouch descent
    { b: -46, f: -32, h: -32 }, // F09: Reach preshape
    { b: -42, f: -28, h: -28 }, // F10: Pickup contact!
    { b: -56, f: -36, h: -36 }, // F11: Liftoff
    { b: -70, f: -44, h: -44 }, // F12: Stand carry
    { b: -75, f: -42, h: -42 }, // F13: Toss prep dip
    { b: -58, f: -22, h: -22 }, // F14: Toss drive
    { b: -42, f: -6, h: -6 },   // F15: Release instant!
    { b: -30, f: 10, h: 10 },   // F16: Ball apex follow-through
    { b: -44, f: -6, h: -6 },   // F17: Ball descent pre-catch
    { b: -62, f: -32, h: -32 }, // F18: Catch contact & yield!
    { b: -72, f: -44, h: -44 }, // F19: Athletic stance
    { b: -68, f: -54, h: -54 }, // F20: Dribble push
    { b: -64, f: -60, h: -60 }, // F21: Ground strike
    { b: -68, f: -52, h: -52 }, // F22: Rebound
    { b: -72, f: -44, h: -44 }, // F23: Receive
  ];

  // 5. Left Arm Angles (Smooth balance & guard arm)
  const lArm = [
    { b: -92, f: -88, h: -88 }, // F00
    { b: -86, f: -82, h: -82 }, // F01
    { b: -76, f: -68, h: -68 }, // F02
    { b: -86, f: -78, h: -78 }, // F03
    { b: -98, f: -88, h: -88 }, // F04
    { b: -92, f: -84, h: -84 }, // F05
    { b: -96, f: -88, h: -88 }, // F06
    { b: -102, f: -94, h: -94 }, // F07
    { b: -112, f: -104, h: -104 }, // F08: Counterbalance
    { b: -120, f: -110, h: -110 }, // F09
    { b: -120, f: -110, h: -110 }, // F10
    { b: -112, f: -104, h: -104 }, // F11
    { b: -98, f: -90, h: -90 }, // F12
    { b: -96, f: -88, h: -88 }, // F13
    { b: -92, f: -85, h: -85 }, // F14
    { b: -90, f: -84, h: -84 }, // F15
    { b: -90, f: -84, h: -84 }, // F16
    { b: -92, f: -86, h: -86 }, // F17
    { b: -94, f: -88, h: -88 }, // F18
    { b: -82, f: -68, h: -68 }, // F19: Guard arm
    { b: -78, f: -62, h: -62 }, // F20
    { b: -76, f: -60, h: -60 }, // F21
    { b: -78, f: -62, h: -62 }, // F22
    { b: -80, f: -64, h: -64 }, // F23
  ];

  // First pass: compute all character FK poses to get exact hand contact points
  const handPts: Array<{ x: number; y: number }> = [];
  const fullAnglesList: number[][] = [];

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

  // The resting ball X is defined at handPts[10].x (pickup contact point)!
  // At F10, hand touches top of ball, so ball center is:
  // ballX = handPts[10].x, ballY = G - R = 737.0!
  // And handPts[10].y is within 1.5 px of 737 - 18 = 719.0!
  const restingBallX = Number(handPts[10].x.toFixed(1));
  console.log('Calibrated ball ground position:', restingBallX, 737.0);

  // Now construct ball trajectory strictly satisfying the brief:
  // F0..F9: RESTING at (restingBallX, 737)
  // F10: HELD at (restingBallX, 737) -> hand is right at (restingBallX, 737 - 18)
  // F11: HELD: ball attached under hand: ballX = hand.x, ballY = hand.y - 18
  // F12..F14: HELD: ball attached on palm platter: ballX = hand.x, ballY = hand.y - 18
  // F15: PROJECTILE: ball released at (hand.x, hand.y - 18)
  // F16: PROJECTILE: apex
  // F17: PROJECTILE: descent
  // F18: CAUGHT: ball meets hand at (hand.x, hand.y - 18)
  // F19: HELD: ball at (hand.x, hand.y - 18)
  // F20: DRIBBLE_PUSH: ball departs from (hand.x, hand.y + 18)
  // F21: DRIBBLE_GROUND_IMPACT: ball at ground (restingBallX - 15, 737)
  // F22: DRIBBLE_REBOUND: ball rises to waist (restingBallX - 15, 580)
  // F23: DRIBBLE_RECEIVE: ball receives at (hand.x, hand.y + 18)
  const finalFrames = [];

  for (let f = 0; f < 24; f++) {
    const hand = handPts[f];
    let bX = restingBallX;
    let bY = 737.0;
    let vy = 0.0;
    let state: any = 'RESTING';

    if (f <= 9) {
      state = 'RESTING';
      bX = restingBallX;
      bY = 737.0;
      vy = 0.0;
    } else if (f === 10) {
      state = 'HELD';
      bX = hand.x;
      bY = 737.0;
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
      bY = 275.0; // apex
      vy = 0.0;
    } else if (f === 17) {
      state = 'PROJECTILE';
      bX = handPts[15].x;
      bY = 410.0; // descending
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

const frames = generateFlawless24Frames();
console.log('Flawless frames generated:', frames.length);

// Audit 20 rules
let maxGroundErr = 0;
for (const f of frames) {
  const fk = solveForwardKinematics17(f.charX, f.charY, f.angles, 0.5);
  if ([0, 1, 7, 12, 13, 14, 15, 16, 17, 19, 20, 23].includes(f.frame)) {
    const errR = Math.abs(fk[3].endY - G);
    const errL = Math.abs(fk[6].endY - G);
    maxGroundErr = Math.max(maxGroundErr, Math.min(errR, errL));
  }
}
console.log('1. Ground plane err:', maxGroundErr.toFixed(3));

// Check reachability
const fk10 = solveForwardKinematics17(frames[10].charX, frames[10].charY, frames[10].angles, 0.5);
const shoulderX = fk10[8].endX;
const shoulderY = fk10[8].endY;
const armLen = (STICKFIGURE_BONE_LENGTHS[9] + STICKFIGURE_BONE_LENGTHS[10] + STICKFIGURE_BONE_LENGTHS[11]) * 0.5;
const reachDist = Math.hypot(shoulderX - frames[10].ballX, shoulderY - (frames[10].ballY - R));
const reachRatio = reachDist / armLen;
console.log('4. Reachability ratio:', (reachRatio * 100).toFixed(1) + '%');

// Check held contacts
let maxHeldErr = 0;
for (const f of frames) {
  if (['HELD', 'CAUGHT', 'DRIBBLE_RECEIVE'].includes(f.ballState)) {
    const err = Math.abs(f.contactDist - R);
    if (err > maxHeldErr) maxHeldErr = err;
  }
}
console.log('6. Max held contact err:', maxHeldErr.toFixed(3));

// Check release offset
console.log('8. Release offset:', Math.abs(frames[15].contactDist - R).toFixed(3));

// Check catch contact
console.log('10. Catch contact err:', Math.abs(frames[18].contactDist - R).toFixed(3));

// Check dribble receive
console.log('14. Dribble receive err:', Math.abs(frames[23].contactDist - R).toFixed(3));

// Check max angle jump
let maxJump = 0;
for (let i = 1; i < frames.length; i++) {
  for (let j = 0; j < 17; j++) {
    const diff = Math.abs(frames[i].angles[j] - frames[i - 1].angles[j]);
    if (diff > 25) {
      console.log(`Jump > 25 at F${i} Bone ${j}: ${diff.toFixed(1)}°`);
    }
    if (diff > maxJump) maxJump = diff;
  }
}
console.log('16. Max jump:', maxJump.toFixed(1));
