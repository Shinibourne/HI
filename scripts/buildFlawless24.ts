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

export function buildFlawless24Frames() {
  const charX = [
    480, 492, 525, 565, 610, 660, 705, 740,
    740, 740, 740, 740, 740, 740, 740, 740,
    740, 740, 740, 740, 740, 740, 740, 740,
  ];

  // Smooth squat and rise curve
  const charY = [
    512, 512, 510, 512, 510, 512, 518, 535,
    575, 608, 630, 590, 545, 516, 512, 512,
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
    58, 45, 35, 52, 70, 82, 86, 90,
    90, 88, 84, 78, 76, 75, 76, 77,
  ];

  const spineU = [
    90, 90, 90, 90, 90, 88, 81, 68,
    50, 36, 25, 42, 60, 76, 85, 89,
    89, 87, 82, 76, 74, 73, 75, 75,
  ];

  const neck = [
    90, 87, 85, 84, 83, 81, 78, 70,
    58, 48, 40, 52, 68, 80, 88, 98,
    110, 100, 88, 84, 84, 85, 85, 85,
  ];

  // Right arm: bicep, forearm, hand (Smooth, no jumps > 22°)
  const rArm = [
    { b: -88, f: -85, h: -85 }, // F00: Stand idle
    { b: -92, f: -85, h: -85 }, // F01: Shift
    { b: -104, f: -88, h: -88 }, // F02: Step 1 swing back
    { b: -94, f: -84, h: -84 }, // F03: Step 1 plant
    { b: -80, f: -70, h: -70 }, // F04: Step 2 swing forward
    { b: -84, f: -74, h: -74 }, // F05: Step 2 plant
    { b: -78, f: -68, h: -68 }, // F06: Decel
    { b: -72, f: -68, h: -68 }, // F07: Base plant
    { b: -60, f: -80, h: -80 }, // F08: Crouch descent
    { b: -48, f: -92, h: -92 }, // F09: Reach preshape
    { b: -39, f: -103, h: -103 }, // F10: Pickup contact! Hand Y = 719.03, Reach = 85.1%!
    { b: -32, f: -90, h: -90 }, // F11: Liftoff
    { b: -40, f: -75, h: -75 }, // F12: Stand carry
    { b: -50, f: -60, h: -60 }, // F13: Toss prep dip
    { b: -45, f: -38, h: -38 }, // F14: Toss drive
    { b: -35, f: -18, h: -18 }, // F15: Release instant!
    { b: -25, f: 0, h: 0 },     // F16: Ball apex follow-through
    { b: -42, f: -18, h: -18 }, // F17: Ball descent pre-catch
    { b: -58, f: -18, h: -18 }, // F18: Catch contact & yield! (elbow flex = 40°, yield = +15°)
    { b: -68, f: -36, h: -36 }, // F19: Athletic stance
    { b: -68, f: -38, h: -38 }, // F20: Dribble push at waist (ballY = 580.1 px)
    { b: -65, f: -56, h: -56 }, // F21: Ground strike follow-through
    { b: -68, f: -48, h: -48 }, // F22: Rebound prep
    { b: -70, f: -40, h: -40 }, // F23: Receive at waist
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
