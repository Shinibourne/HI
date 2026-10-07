import { solveLegLimb, solveForwardKinematics17 } from '../src/lib/humanMotionSkills';
import { calculateCenterOfMass17, calculateBaseOfSupport17 } from '../src/lib/proceduralKinematics';
import { STICKFIGURE_BONE_LENGTHS } from '../src/lib/stkndsCodec';

const G = 755.0;
const R = 18.0;

function generate24Frames() {
  const frames = [];

  // Root Pelvis X trajectory (smooth ease-in and ease-out)
  const charXList = [
    520, 532, 560, 595, 635, 680, 715, 735,
    735, 735, 735, 738, 740, 740, 740, 740,
    740, 740, 740, 740, 740, 740, 740, 740
  ];

  // Root Pelvis Y trajectory
  const charYList = [
    512, 512, 508, 512, 508, 512, 518, 535,
    585, 625, 625, 575, 512, 520, 510, 512,
    512, 512, 518, 532, 534, 536, 534, 532
  ];

  // Feet targets (X, Y, planted)
  const rFootList = [
    { x: 535, y: G, p: true },
    { x: 545, y: G - 6, p: false },
    { x: 580, y: G - 16, p: false },
    { x: 625, y: G, p: true },
    { x: 625, y: G, p: true },
    { x: 650, y: G, p: true },
    { x: 730, y: G, p: true },
    { x: 780, y: G, p: true },
    // Base pinned: F8 to F23
    { x: 780, y: G, p: true },
    { x: 780, y: G, p: true },
    { x: 780, y: G, p: true },
    { x: 780, y: G, p: true },
    { x: 780, y: G, p: true },
    { x: 780, y: G, p: true },
    { x: 780, y: G, p: true },
    { x: 780, y: G, p: true },
    { x: 780, y: G, p: true },
    { x: 780, y: G, p: true },
    { x: 780, y: G, p: true },
    { x: 780, y: G, p: true },
    { x: 780, y: G, p: true },
    { x: 780, y: G, p: true },
    { x: 780, y: G, p: true },
    { x: 780, y: G, p: true },
  ];

  const lFootList = [
    { x: 505, y: G, p: true },
    { x: 505, y: G, p: true },
    { x: 505, y: G, p: true },
    { x: 525, y: G - 6, p: false },
    { x: 575, y: G - 16, p: false },
    { x: 635, y: G, p: true },
    { x: 670, y: G, p: true },
    { x: 700, y: G, p: true },
    // Base pinned: F8 to F23
    { x: 700, y: G, p: true },
    { x: 700, y: G, p: true },
    { x: 700, y: G, p: true },
    { x: 700, y: G, p: true },
    { x: 700, y: G, p: true },
    { x: 700, y: G, p: true },
    { x: 700, y: G, p: true },
    { x: 700, y: G, p: true },
    { x: 700, y: G, p: true },
    { x: 700, y: G, p: true },
    { x: 700, y: G, p: true },
    { x: 700, y: G, p: true },
    { x: 700, y: G, p: true },
    { x: 700, y: G, p: true },
    { x: 700, y: G, p: true },
    { x: 700, y: G, p: true },
  ];

  // Spine Lower & Upper (Forward lean curve)
  const spineLList = [
    91, 91, 92, 91, 91, 89, 84, 76,
    50, 25, 25, 55, 82, 84, 88, 90,
    90, 88, 84, 78, 76, 75, 76, 77
  ];
  const spineUList = [
    90, 90, 91, 90, 90, 87, 82, 73,
    44, 15, 15, 48, 80, 82, 87, 89,
    89, 87, 82, 76, 74, 73, 75, 75
  ];

  // Neck angle
  const neckList = [
    90, 87, 85, 84, 83, 81, 78, 72,
    58, 45, 45, 60, 84, 86, 92, 98,
    114, 100, 88, 84, 84, 85, 85, 85
  ];

  // Direct Arm angles for 100% smooth trajectory without IK baseline flips:
  // Right arm: bicep (9), forearm (10), hand (11)
  const rArmList = [
    { b: -88, f: -85, h: -85 }, // F00: Stand idle
    { b: -92, f: -85, h: -85 }, // F01: Shift
    { b: -102, f: -88, h: -88 }, // F02: Step 1 swing back
    { b: -95, f: -85, h: -85 }, // F03: Step 1 plant
    { b: -80, f: -70, h: -70 }, // F04: Step 2 swing forward
    { b: -84, f: -74, h: -74 }, // F05: Step 2 plant
    { b: -78, f: -68, h: -68 }, // F06: Decel
    { b: -72, f: -58, h: -58 }, // F07: Base plant
    { b: -58, f: -45, h: -45 }, // F08: Crouch descent
    { b: -45, f: -32, h: -32 }, // F09: Reach
    { b: -42, f: -28, h: -28 }, // F10: Pickup contact!
    { b: -60, f: -38, h: -38 }, // F11: Liftoff
    { b: -76, f: -34, h: -34 }, // F12: Stand carry
    { b: -80, f: -30, h: -30 }, // F13: Toss prep dip
    { b: -58, f: -8, h: -8 },   // F14: Toss drive
    { b: -38, f: 12, h: 12 },   // F15: Release instant!
    { b: -22, f: 26, h: 26 },   // F16: Ball apex follow-through
    { b: -42, f: 10, h: 10 },   // F17: Ball descent pre-catch
    { b: -62, f: -12, h: -12 }, // F18: Catch contact & yield!
    { b: -74, f: -34, h: -34 }, // F19: Athletic stance
    { b: -70, f: -44, h: -44 }, // F20: Dribble push
    { b: -66, f: -54, h: -54 }, // F21: Ground strike
    { b: -70, f: -44, h: -44 }, // F22: Rebound
    { b: -74, f: -34, h: -34 }, // F23: Receive
  ];

  // Left arm: bicep (14), forearm (15), hand (16)
  const lArmList = [
    { b: -92, f: -88, h: -88 }, // F00
    { b: -86, f: -82, h: -82 }, // F01
    { b: -76, f: -68, h: -68 }, // F02: Step 1 swing forward
    { b: -86, f: -78, h: -78 }, // F03
    { b: -100, f: -88, h: -88 }, // F04: Step 2 swing back
    { b: -94, f: -85, h: -85 }, // F05
    { b: -96, f: -88, h: -88 }, // F06
    { b: -104, f: -96, h: -96 }, // F07
    { b: -118, f: -108, h: -108 }, // F08: Counterbalance back
    { b: -125, f: -115, h: -115 }, // F09
    { b: -125, f: -115, h: -115 }, // F10
    { b: -115, f: -105, h: -105 }, // F11
    { b: -98, f: -90, h: -90 }, // F12
    { b: -96, f: -88, h: -88 }, // F13
    { b: -92, f: -85, h: -85 }, // F14
    { b: -90, f: -84, h: -84 }, // F15
    { b: -90, f: -84, h: -84 }, // F16
    { b: -92, f: -86, h: -86 }, // F17
    { b: -94, f: -88, h: -88 }, // F18
    { b: -78, f: -62, h: -62 }, // F19: Guard arm
    { b: -75, f: -58, h: -58 }, // F20
    { b: -74, f: -56, h: -56 }, // F21
    { b: -75, f: -58, h: -58 }, // F22
    { b: -76, f: -60, h: -60 }, // F23
  ];

  // We compute the hand contact position at F10 to place the ball resting position exactly!
  // Let's compute FK for F10 first
  const testAnglesF10 = new Array(17).fill(0);
  testAnglesF10[7] = spineLList[10];
  testAnglesF10[8] = spineUList[10];
  testAnglesF10[9] = rArmList[10].b;
  testAnglesF10[10] = rArmList[10].f;
  testAnglesF10[11] = rArmList[10].h;
  const fk10Test = solveForwardKinematics17(charXList[10], charYList[10], testAnglesF10, 0.5);
  const hand10X = fk10Test[11].endX;
  const hand10Y = fk10Test[11].endY;
  // Ball center resting at ground: Y = 737. Hand touches top of ball at Y = 719!
  // So resting ball X is hand10X!
  const restingBallX = Number(hand10X.toFixed(1));
  console.log('Resting ball position calibrated to hand contact:', restingBallX, 737, 'hand at:', hand10X.toFixed(1), hand10Y.toFixed(1));

  // Compute hand contact at other key moments (F12, F15, F18, F20, F23) to align ball
  const ballPosList = [
    { x: restingBallX, y: 737, vy: 0, s: 'RESTING' }, // F0
    { x: restingBallX, y: 737, vy: 0, s: 'RESTING' }, // F1
    { x: restingBallX, y: 737, vy: 0, s: 'RESTING' }, // F2
    { x: restingBallX, y: 737, vy: 0, s: 'RESTING' }, // F3
    { x: restingBallX, y: 737, vy: 0, s: 'RESTING' }, // F4
    { x: restingBallX, y: 737, vy: 0, s: 'RESTING' }, // F5
    { x: restingBallX, y: 737, vy: 0, s: 'RESTING' }, // F6
    { x: restingBallX, y: 737, vy: 0, s: 'RESTING' }, // F7
    { x: restingBallX, y: 737, vy: 0, s: 'RESTING' }, // F8
    { x: restingBallX, y: 737, vy: 0, s: 'RESTING' }, // F9
    { x: restingBallX, y: 737, vy: 0, s: 'HELD' },    // F10: Contact instant (dist=18px)
    { x: restingBallX - 10, y: 665, vy: -18, s: 'HELD' }, // F11: Liftoff
    { x: restingBallX - 25, y: 560, vy: -8, s: 'HELD' },  // F12: Carry
    { x: restingBallX - 25, y: 550, vy: 0, s: 'HELD' },   // F13: Toss prep dip
    { x: restingBallX - 25, y: 450, vy: -26, s: 'HELD' },  // F14: Toss drive
    { x: restingBallX - 25, y: 395, vy: -26, s: 'PROJECTILE' }, // F15: Release
    { x: restingBallX - 25, y: 275, vy: 0, s: 'PROJECTILE' },   // F16: Apex
    { x: restingBallX - 25, y: 410, vy: 24, s: 'PROJECTILE' },  // F17: Descent
    { x: restingBallX - 25, y: 480, vy: 8, s: 'CAUGHT' },       // F18: Catch
    { x: restingBallX - 25, y: 560, vy: 0, s: 'HELD' },         // F19: Stance
    { x: restingBallX - 25, y: 580, vy: 26, s: 'DRIBBLE_PUSH' }, // F20: Push
    { x: restingBallX - 25, y: 737, vy: -22.1, s: 'DRIBBLE_GROUND_IMPACT' }, // F21: Ground strike
    { x: restingBallX - 25, y: 580, vy: -12, s: 'DRIBBLE_REBOUND' }, // F22: Rebound
    { x: restingBallX - 25, y: 565, vy: 0, s: 'DRIBBLE_RECEIVE' },   // F23: Receive
  ];

  for (let f = 0; f < 24; f++) {
    const cx = charXList[f];
    const cy = charYList[f];
    const bp = ballPosList[f];

    const angles = new Array(17).fill(0);
    angles[0] = -90;

    const rLeg = solveLegLimb(cx, cy, rFootList[f].x, rFootList[f].y, true, 0.5, rFootList[f].p);
    angles[1] = rLeg.thighAngleDeg;
    angles[2] = rLeg.shinAngleDeg;
    angles[3] = rLeg.footAngleDeg;

    const lLeg = solveLegLimb(cx, cy, lFootList[f].x, lFootList[f].y, true, 0.5, lFootList[f].p);
    angles[4] = lLeg.thighAngleDeg;
    angles[5] = lLeg.shinAngleDeg;
    angles[6] = lLeg.footAngleDeg;

    angles[7] = spineLList[f];
    angles[8] = spineUList[f];
    angles[12] = neckList[f];
    angles[13] = 0;

    angles[9] = rArmList[f].b;
    angles[10] = rArmList[f].f;
    angles[11] = rArmList[f].h;

    angles[14] = lArmList[f].b;
    angles[15] = lArmList[f].f;
    angles[16] = lArmList[f].h;

    // Full FK to extract final metrics
    const fkFull = solveForwardKinematics17(cx, cy, angles, 0.5);
    const handX = fkFull[11].endX;
    const handY = fkFull[11].endY;
    const contactDist = Math.hypot(handX - bp.x, handY - bp.y);

    const com = calculateCenterOfMass17(cx, cy, angles, 0.5);
    const bos = calculateBaseOfSupport17(cx, cy, angles, G, 0.5, com.comX);

    const rKneeFlexDeg = Math.abs(angles[2] - angles[1]);
    const lKneeFlexDeg = Math.abs(angles[5] - angles[4]);
    const rElbowFlexDeg = Math.abs(angles[10] - angles[9]);
    const lElbowFlexDeg = Math.abs(angles[15] - angles[14]);

    frames.push({
      frame: f,
      charX: cx,
      charY: cy,
      angles,
      ballX: bp.x,
      ballY: bp.y,
      ballVy: bp.vy,
      ballState: bp.s,
      contactDist,
      handContactPoint: { x: handX, y: handY },
      comX: com.comX,
      comY: com.comY,
      supportMinX: bos.minX,
      supportMaxX: bos.maxX,
      isGrounded: bos.isGrounded,
      isStaticallyBalanced: bos.isStaticallyBalanced,
      stabilityMargin: bos.stabilityMargin,
      rKneeFlexDeg,
      lKneeFlexDeg,
      rElbowFlexDeg,
      lElbowFlexDeg,
    });
  }

  return frames;
}

const frames = generate24Frames();
console.log('Frames:', frames.length);

// Check ground plane on planted frames
let maxFootGroundErr = 0;
for (const f of frames) {
  const fk = solveForwardKinematics17(f.charX, f.charY, f.angles, 0.5);
  if ([0, 1, 7, 12, 13, 14, 15, 16, 17, 19, 20, 23].includes(f.frame)) {
    const errR = Math.abs(fk[3].endY - G);
    const errL = Math.abs(fk[6].endY - G);
    maxFootGroundErr = Math.max(maxFootGroundErr, Math.min(errR, errL));
  }
}
console.log('Check 1 (Ground plane err):', maxFootGroundErr.toFixed(3));

// Check reachability at F10
const fk10 = solveForwardKinematics17(frames[10].charX, frames[10].charY, frames[10].angles, 0.5);
const shoulderX = fk10[8].endX;
const shoulderY = fk10[8].endY;
const armLen = (STICKFIGURE_BONE_LENGTHS[9] + STICKFIGURE_BONE_LENGTHS[10] + STICKFIGURE_BONE_LENGTHS[11]) * 0.5;
const reachDist = Math.hypot(shoulderX - frames[10].ballX, shoulderY - (frames[10].ballY - R));
const reachRatio = reachDist / armLen;
console.log('Check 4 (Reachability ratio):', (reachRatio * 100).toFixed(1) + '%');

// Check F10 contact
console.log('F10 contact distance:', frames[10].contactDist.toFixed(2), 'vs R (18):', (frames[10].contactDist - R).toFixed(2));

// Check max angle jumps
let maxAngleJump = 0;
for (let i = 1; i < frames.length; i++) {
  for (let j = 0; j < 17; j++) {
    const diff = Math.abs(frames[i].angles[j] - frames[i - 1].angles[j]);
    if (diff > 25) {
      console.log(`Jump > 25° at F${i} Bone ${j}: ${diff.toFixed(1)}°`);
    }
    if (diff > maxAngleJump) maxAngleJump = diff;
  }
}
console.log('Check 16 (Max angle jump):', maxAngleJump.toFixed(1));
