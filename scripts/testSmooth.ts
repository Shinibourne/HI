import { solveLegLimb, solveArmLimb, solveForwardKinematics17 } from '../src/lib/humanMotionSkills';
import { calculateCenterOfMass17, calculateBaseOfSupport17 } from '../src/lib/proceduralKinematics';

const G = 755.0;
const R = 18.0;

// Test complete smoothed sequence
function buildTestFrames() {
  const frames = [];

  // Frame definitions
  const defs = [
    // F00: Stand idle
    { charX: 520, charY: 512, rFoot: { x: 535, y: G, p: true }, lFoot: { x: 505, y: G, p: true }, spineL: 91, spineU: 90, neck: 90, rArm: { bicep: -88, forearm: -85, hand: -85 }, lArm: { bicep: -92, forearm: -88, hand: -88 }, ballX: 850, ballY: 737, ballVy: 0, state: 'RESTING' },
    // F01: Weight shift
    { charX: 530, charY: 512, rFoot: { x: 540, y: G - 6, p: false }, lFoot: { x: 505, y: G, p: true }, spineL: 92, spineU: 91, neck: 87, rArm: { bicep: -95, forearm: -85, hand: -85 }, lArm: { bicep: -85, forearm: -80, hand: -80 }, ballX: 850, ballY: 737, ballVy: 0, state: 'RESTING' },
    // F02: Step 1 Swing
    { charX: 570, charY: 508, rFoot: { x: 585, y: G - 18, p: false }, lFoot: { x: 505, y: G, p: true }, spineL: 93, spineU: 92, neck: 85, rArm: { bicep: -105, forearm: -88, hand: -88 }, lArm: { bicep: -76, forearm: -68, hand: -68 }, ballX: 850, ballY: 737, ballVy: 0, state: 'RESTING' },
    // F03: Step 1 Plant
    { charX: 620, charY: 512, rFoot: { x: 635, y: G, p: true }, lFoot: { x: 525, y: G, p: false }, spineL: 91, spineU: 90, neck: 84, rArm: { bicep: -95, forearm: -85, hand: -85 }, lArm: { bicep: -85, forearm: -78, hand: -78 }, ballX: 850, ballY: 737, ballVy: 0, state: 'RESTING' },
    // F04: Step 2 Swing
    { charX: 670, charY: 508, rFoot: { x: 635, y: G, p: true }, lFoot: { x: 680, y: G - 18, p: false }, spineL: 92, spineU: 91, neck: 83, rArm: { bicep: -78, forearm: -68, hand: -68 }, lArm: { bicep: -102, forearm: -88, hand: -88 }, ballX: 850, ballY: 737, ballVy: 0, state: 'RESTING' },
    // F05: Step 2 Plant
    { charX: 715, charY: 512, rFoot: { x: 650, y: G, p: true }, lFoot: { x: 730, y: G, p: true }, spineL: 90, spineU: 88, neck: 82, rArm: { bicep: -85, forearm: -75, hand: -75 }, lArm: { bicep: -94, forearm: -85, hand: -85 }, ballX: 850, ballY: 737, ballVy: 0, state: 'RESTING' },
    // F06: Approach Deceleration
    { charX: 745, charY: 518, rFoot: { x: 800, y: G, p: true }, lFoot: { x: 705, y: G, p: true }, spineL: 85, spineU: 83, neck: 78, rArm: { bicep: -80, forearm: -70, hand: -70 }, lArm: { bicep: -98, forearm: -90, hand: -90 }, ballX: 850, ballY: 737, ballVy: 0, state: 'RESTING' },
    // F07: Base Plant
    { charX: 760, charY: 535, rFoot: { x: 800, y: G, p: true }, lFoot: { x: 705, y: G, p: true }, spineL: 78, spineU: 75, neck: 74, rArm: { bicep: -72, forearm: -60, hand: -60 }, lArm: { bicep: -105, forearm: -98, hand: -98 }, ballX: 850, ballY: 737, ballVy: 0, state: 'RESTING' },
    // F08: Deep Crouch
    { charX: 755, charY: 605, rFoot: { x: 800, y: G, p: true }, lFoot: { x: 705, y: G, p: true }, spineL: 64, spineU: 60, neck: 68, rArmTarget: { x: 840, y: 705 }, lArm: { bicep: -118, forearm: -108, hand: -108 }, ballX: 850, ballY: 737, ballVy: 0, state: 'RESTING' },
    // F09: Hand Reach & Preshape
    { charX: 755, charY: 615, rFoot: { x: 800, y: G, p: true }, lFoot: { x: 705, y: G, p: true }, spineL: 55, spineU: 50, neck: 64, rArmTarget: { x: 848, y: 717 }, lArm: { bicep: -125, forearm: -115, hand: -115 }, ballX: 850, ballY: 737, ballVy: 0, state: 'RESTING' },
    // F10: Pickup Contact & Roll
    { charX: 755, charY: 615, rFoot: { x: 800, y: G, p: true }, lFoot: { x: 705, y: G, p: true }, spineL: 55, spineU: 50, neck: 64, rArmTarget: { x: 850, y: 719 }, lArm: { bicep: -125, forearm: -115, hand: -115 }, ballX: 850, ballY: 737, ballVy: 0, state: 'HELD' },
    // F11: Liftoff
    { charX: 758, charY: 565, rFoot: { x: 800, y: G, p: true }, lFoot: { x: 705, y: G, p: true }, spineL: 70, spineU: 66, neck: 72, rArmTarget: { x: 835, y: 683 }, lArm: { bicep: -115, forearm: -105, hand: -105 }, ballX: 835, ballY: 665, ballVy: -18, state: 'HELD' },
    // F12: Stand Extension
    { charX: 760, charY: 512, rFoot: { x: 800, y: G, p: true }, lFoot: { x: 705, y: G, p: true }, spineL: 84, spineU: 82, neck: 85, rArmTarget: { x: 820, y: 578 }, lArm: { bicep: -98, forearm: -90, hand: -90 }, ballX: 820, ballY: 560, ballVy: -8, state: 'HELD' },
    // F13: Toss Prep Dip
    { charX: 760, charY: 520, rFoot: { x: 800, y: G, p: true }, lFoot: { x: 705, y: G, p: true }, spineL: 85, spineU: 83, neck: 86, rArmTarget: { x: 820, y: 568 }, lArm: { bicep: -96, forearm: -88, hand: -88 }, ballX: 820, ballY: 550, ballVy: 0, state: 'HELD' },
    // F14: Toss Drive
    { charX: 760, charY: 508, rFoot: { x: 800, y: G, p: true }, lFoot: { x: 705, y: G, p: true }, spineL: 89, spineU: 88, neck: 92, rArmTarget: { x: 820, y: 468 }, lArm: { bicep: -92, forearm: -85, hand: -85 }, ballX: 820, ballY: 450, ballVy: -26, state: 'HELD' },
    // F15: Release
    { charX: 760, charY: 510, rFoot: { x: 800, y: G, p: true }, lFoot: { x: 705, y: G, p: true }, spineL: 90, spineU: 89, neck: 98, rArmTarget: { x: 820, y: 413 }, lArm: { bicep: -90, forearm: -84, hand: -84 }, ballX: 820, ballY: 395, ballVy: -26, state: 'PROJECTILE' },
    // F16: Ball Apex
    { charX: 760, charY: 512, rFoot: { x: 800, y: G, p: true }, lFoot: { x: 705, y: G, p: true }, spineL: 90, spineU: 89, neck: 114, rArmTarget: { x: 820, y: 450 }, lArm: { bicep: -90, forearm: -84, hand: -84 }, ballX: 820, ballY: 275, ballVy: 0, state: 'PROJECTILE' },
    // F17: Ball Descent
    { charX: 760, charY: 512, rFoot: { x: 800, y: G, p: true }, lFoot: { x: 705, y: G, p: true }, spineL: 88, spineU: 87, neck: 100, rArmTarget: { x: 820, y: 475 }, lArm: { bicep: -92, forearm: -86, hand: -86 }, ballX: 820, ballY: 410, ballVy: 24, state: 'PROJECTILE' },
    // F18: Catch Contact
    { charX: 760, charY: 518, rFoot: { x: 800, y: G, p: true }, lFoot: { x: 705, y: G, p: true }, spineL: 84, spineU: 82, neck: 88, rArmTarget: { x: 820, y: 498 }, lArm: { bicep: -94, forearm: -88, hand: -88 }, ballX: 820, ballY: 480, ballVy: 8, state: 'CAUGHT' },
    // F19: Athletic Stance Settle
    { charX: 760, charY: 535, rFoot: { x: 800, y: G, p: true }, lFoot: { x: 705, y: G, p: true }, spineL: 78, spineU: 76, neck: 84, rArmTarget: { x: 820, y: 578 }, lArm: { bicep: -78, forearm: -62, hand: -62 }, ballX: 820, ballY: 560, ballVy: 0, state: 'HELD' },
    // F20: Dribble Push
    { charX: 760, charY: 535, rFoot: { x: 800, y: G, p: true }, lFoot: { x: 705, y: G, p: true }, spineL: 76, spineU: 74, neck: 84, rArmTarget: { x: 820, y: 562 }, lArm: { bicep: -75, forearm: -58, hand: -58 }, ballX: 820, ballY: 580, ballVy: 26, state: 'DRIBBLE_PUSH' },
    // F21: Dribble Ground Strike
    { charX: 760, charY: 538, rFoot: { x: 800, y: G, p: true }, lFoot: { x: 705, y: G, p: true }, spineL: 75, spineU: 73, neck: 85, rArm: { bicep: -74, forearm: -65, hand: -65 }, lArm: { bicep: -74, forearm: -56, hand: -56 }, ballX: 820, ballY: 737, ballVy: -22.1, state: 'DRIBBLE_GROUND_IMPACT' },
    // F22: Dribble Rebound
    { charX: 760, charY: 535, rFoot: { x: 800, y: G, p: true }, lFoot: { x: 705, y: G, p: true }, spineL: 76, spineU: 75, neck: 85, rArmTarget: { x: 820, y: 562 }, lArm: { bicep: -75, forearm: -58, hand: -58 }, ballX: 820, ballY: 580, ballVy: -12, state: 'DRIBBLE_REBOUND' },
    // F23: Dribble Receive
    { charX: 760, charY: 535, rFoot: { x: 800, y: G, p: true }, lFoot: { x: 705, y: G, p: true }, spineL: 77, spineU: 75, neck: 85, rArmTarget: { x: 820, y: 547 }, lArm: { bicep: -76, forearm: -60, hand: -60 }, ballX: 820, ballY: 565, ballVy: 0, state: 'DRIBBLE_RECEIVE' },
  ];

  for (let f = 0; f < 24; f++) {
    const d = defs[f];
    const angles = new Array(17).fill(0);
    angles[0] = -90;

    const rLeg = solveLegLimb(d.charX, d.charY, d.rFoot.x, d.rFoot.y, true, 0.5, d.rFoot.p);
    angles[1] = rLeg.thighAngleDeg;
    angles[2] = rLeg.shinAngleDeg;
    angles[3] = rLeg.footAngleDeg;

    const lLeg = solveLegLimb(d.charX, d.charY, d.lFoot.x, d.lFoot.y, true, 0.5, d.lFoot.p);
    angles[4] = lLeg.thighAngleDeg;
    angles[5] = lLeg.shinAngleDeg;
    angles[6] = lLeg.footAngleDeg;

    angles[7] = d.spineL;
    angles[8] = d.spineU;
    angles[12] = d.neck;
    angles[13] = 0;

    const fkPart = solveForwardKinematics17(d.charX, d.charY, angles, 0.5);
    const shoulderX = fkPart[8].endX;
    const shoulderY = fkPart[8].endY;

    if (d.rArmTarget) {
      const rArm = solveArmLimb(shoulderX, shoulderY, d.rArmTarget.x, d.rArmTarget.y, true, 0.5);
      angles[9] = rArm.bicepAngleDeg;
      angles[10] = rArm.forearmAngleDeg;
      angles[11] = rArm.handAngleDeg;
    } else if (d.rArm) {
      angles[9] = d.rArm.bicep;
      angles[10] = d.rArm.forearm;
      angles[11] = d.rArm.hand;
    }

    if (d.lArmTarget) {
      const lArm = solveArmLimb(shoulderX, shoulderY, d.lArmTarget.x, d.lArmTarget.y, true, 0.5);
      angles[14] = lArm.bicepAngleDeg;
      angles[15] = lArm.forearmAngleDeg;
      angles[16] = lArm.handAngleDeg;
    } else if (d.lArm) {
      angles[14] = d.lArm.bicep;
      angles[15] = d.lArm.forearm;
      angles[16] = d.lArm.hand;
    }

    frames.push({
      frame: f,
      charX: d.charX,
      charY: d.charY,
      angles,
      ballX: d.ballX,
      ballY: d.ballY,
      ballVy: d.ballVy,
      ballState: d.state,
    });
  }

  return frames;
}

const frames = buildTestFrames();
console.log('Test frames built:', frames.length);

// Check max angle jumps
let maxJump = 0;
for (let i = 1; i < frames.length; i++) {
  for (let j = 0; j < 17; j++) {
    const diff = Math.abs(frames[i].angles[j] - frames[i - 1].angles[j]);
    if (diff > 25) {
      console.log(`Jump > 25 at F${i} Bone ${j}: diff=${diff.toFixed(1)}`);
    }
    if (diff > maxJump) maxJump = diff;
  }
}
console.log('Max angle jump overall:', maxJump.toFixed(2));
