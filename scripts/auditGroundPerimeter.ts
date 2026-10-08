import { solveLegLimb, solveArmLimb, solveForwardKinematics17 } from '../src/lib/skills/kinematicsSolvers';
import { generateProceduralGaitPose } from '../src/lib/skills/proceduralGait';
import {
  IK_STUDIO_GROUND_Y,
  MASTER_CANVAS_GROUND_Y,
  GAIT_STUDIO_GROUND_Y,
  SPATIAL_ARENA_GROUND_Y,
  auditGroundPerimeterIntegrity,
  clampToGround,
} from '../src/lib/physics/groundPerimeterSystem';
import { buildCanonicalCombatFrames } from '../src/lib/combatFrames';
import { buildCanonicalParkourFrames } from '../src/lib/parkourAcrobatFrames';
import { buildCanonicalSitWalkKickFrames } from '../src/lib/sitWalkKickBallFrames';
import { buildCanonicalBasketballFrames } from '../src/lib/basketballChoreographyFrames';

console.log('================================================================');
console.log('     COMPREHENSIVE GROUND / FLOOR PERIMETER REGRESSION AUDIT     ');
console.log('================================================================\n');

let totalFailures = 0;

function assert(condition: boolean, testName: string, detail: string) {
  if (condition) {
    console.log(`  [PASS] ${testName}: ${detail}`);
  } else {
    console.error(`  [FAIL] ${testName}: ${detail}`);
    totalFailures++;
  }
}

// -----------------------------------------------------------------------------
// SUITE 1: Interactive Limb Solving Studio (Hip -> Knee -> Ankle -> Foot)
// -----------------------------------------------------------------------------
console.log('SUITE 1: Interactive Limb Solving Studio Ground Constraints (Y = 350.0 px)');

// Case 1A: Default Initial Load (Hip at 240, 110, target at 310, 350)
const defaultLeg = solveLegLimb(240, 110, 310, IK_STUDIO_GROUND_Y, true, 0.55, true, IK_STUDIO_GROUND_Y);
const defaultAudit = auditGroundPerimeterIntegrity(
  [
    { name: 'Thigh', startY: 110, endY: defaultLeg.kneeY },
    { name: 'Shin', startY: defaultLeg.kneeY, endY: defaultLeg.ankleY },
    { name: 'Foot', startY: defaultLeg.ankleY, endY: defaultLeg.footTipY },
  ],
  IK_STUDIO_GROUND_Y,
  0.01
);
assert(defaultAudit.passed, '1A. Initial Load Ground Integrity', `Max penetration = ${defaultAudit.maxPenetrationPx.toFixed(3)} px (Floor Y = ${IK_STUDIO_GROUND_Y})`);
assert(Math.abs(defaultLeg.footTipY - IK_STUDIO_GROUND_Y) <= 0.01, '1B. Foot Surface Alignment', `Foot tip sits exactly at Y = ${defaultLeg.footTipY.toFixed(2)} px`);

// Case 1B: Defense against legacy / corrupt Y = 755 input
const legacyUnclampedLeg = solveLegLimb(240, 110, 310, 755, true, 0.55, true, IK_STUDIO_GROUND_Y);
const legacyAudit = auditGroundPerimeterIntegrity(
  [
    { name: 'Thigh', startY: 110, endY: legacyUnclampedLeg.kneeY },
    { name: 'Shin', startY: legacyUnclampedLeg.kneeY, endY: legacyUnclampedLeg.ankleY },
    { name: 'Foot', startY: legacyUnclampedLeg.ankleY, endY: legacyUnclampedLeg.footTipY },
  ],
  IK_STUDIO_GROUND_Y,
  0.01
);
assert(legacyAudit.passed, '1C. Legacy Y=755 Clamping', `Solver clamped target to floor. Max penetration = ${legacyAudit.maxPenetrationPx.toFixed(3)} px`);

// Case 1C: Angled foot (unplanted toes pointing down) on floor
const angledLeg = solveLegLimb(240, 110, 310, IK_STUDIO_GROUND_Y, true, 0.55, false, IK_STUDIO_GROUND_Y);
const angledAudit = auditGroundPerimeterIntegrity(
  [
    { name: 'Thigh', startY: 110, endY: angledLeg.kneeY },
    { name: 'Shin', startY: angledLeg.kneeY, endY: angledLeg.ankleY },
    { name: 'Foot', startY: angledLeg.ankleY, endY: angledLeg.footTipY },
  ],
  IK_STUDIO_GROUND_Y,
  0.01
);
assert(angledAudit.passed, '1D. Angled Foot Floor Barrier', `Ankle elevated to ${angledLeg.ankleY.toFixed(2)} px; Foot tip touches floor at ${angledLeg.footTipY.toFixed(2)} px with 0.00 px penetration`);

// Case 1D: Continuous Dragging Simulation past the floor (Y = 350 -> 400 -> 600 -> 755)
let dragMaxPenetration = 0;
for (let dragY = 150; dragY <= 800; dragY += 25) {
  const clampedDragY = clampToGround(dragY, IK_STUDIO_GROUND_Y);
  const dragLeg = solveLegLimb(240, 110, 310, clampedDragY, true, 0.55, true, IK_STUDIO_GROUND_Y);
  const pen = Math.max(0, dragLeg.footTipY - IK_STUDIO_GROUND_Y, dragLeg.ankleY - IK_STUDIO_GROUND_Y, dragLeg.kneeY - IK_STUDIO_GROUND_Y);
  if (pen > dragMaxPenetration) dragMaxPenetration = pen;
}
assert(dragMaxPenetration <= 0.01, '1E. Interactive Drag Boundary', `Across range Y=150..800, max floor penetration = ${dragMaxPenetration.toFixed(3)} px`);

// Case 1E: Natural Knee Flexion as Foot Pushes Against Floor
const standLeg = solveLegLimb(240, 110, 240, IK_STUDIO_GROUND_Y, true, 0.55, true, IK_STUDIO_GROUND_Y);
const crouchLeg = solveLegLimb(240, 150, 240, IK_STUDIO_GROUND_Y, true, 0.55, true, IK_STUDIO_GROUND_Y);
assert(crouchLeg.ikResult.interiorAngleDeg < standLeg.ikResult.interiorAngleDeg, '1F. Natural Knee Response', `Knee flexes from ${standLeg.ikResult.interiorAngleDeg.toFixed(1)}° down to ${crouchLeg.ikResult.interiorAngleDeg.toFixed(1)}° as pelvis lowers without floor penetration`);

// -----------------------------------------------------------------------------
// SUITE 2: Procedural Locomotion Gait Studio (Y = 310.0 px)
// -----------------------------------------------------------------------------
console.log('\nSUITE 2: Procedural Locomotion Gait Studio (Ground Y = 310.0 px)');
let gaitMaxPen = 0;
for (let p = 0; p <= 100; p++) {
  const progress = p / 100;
  const pose = generateProceduralGaitPose({
    rootX: 320,
    groundY: GAIT_STUDIO_GROUND_Y,
    strideLength: 140,
    stepHeight: 36,
    gaitProgress: progress,
    isRightFacing: true,
    scale: 0.45,
  });
  const joints = solveForwardKinematics17(pose.pelvisX, pose.pelvisY, pose.worldAngles, 0.45);
  for (const j of joints) {
    if (j.endY > GAIT_STUDIO_GROUND_Y + 0.01) {
      const pen = j.endY - GAIT_STUDIO_GROUND_Y;
      if (pen > gaitMaxPen) gaitMaxPen = pen;
    }
  }
}
assert(gaitMaxPen <= 0.01, '2A. Full Gait Cycle (100 sample steps)', `Max joint penetration = ${gaitMaxPen.toFixed(3)} px vs Floor Y = ${GAIT_STUDIO_GROUND_Y}`);

// -----------------------------------------------------------------------------
// SUITE 3: Generated Master Animation Suites (Master Ground Y = 755.0 px)
// -----------------------------------------------------------------------------
console.log('\nSUITE 3: Master Animation Suites Ground Perimeter Invariance (Y = 755.0 px)');

// 3A: Combat Combos (120 frames @ 24fps)
const combatFrames = buildCanonicalCombatFrames({ targetFps: 24 });
let maxCombatFootPen = 0;
for (let f = 0; f < combatFrames.length; f++) {
  const spec = combatFrames[f];
  const joints = solveForwardKinematics17(spec.manX, spec.manY, spec.manAngles, 0.5);
  // Joint 3 (Right Foot), Joint 6 (Left Foot)
  const rFootDeep = Math.max(joints[3].startY, joints[3].endY);
  const lFootDeep = Math.max(joints[6].startY, joints[6].endY);
  if (rFootDeep > MASTER_CANVAS_GROUND_Y + 0.5) maxCombatFootPen = Math.max(maxCombatFootPen, rFootDeep - MASTER_CANVAS_GROUND_Y);
  if (lFootDeep > MASTER_CANVAS_GROUND_Y + 0.5) maxCombatFootPen = Math.max(maxCombatFootPen, lFootDeep - MASTER_CANVAS_GROUND_Y);
}
assert(maxCombatFootPen <= 0.5, '3A. Master Combat Combos (120 Frames)', `Max foot penetration = ${maxCombatFootPen.toFixed(2)} px vs Floor Y = ${MASTER_CANVAS_GROUND_Y}`);

// 3B: Parkour Acrobat (108 frames @ 24fps)
const parkourFrames = buildCanonicalParkourFrames({ targetFps: 24 });
let maxParkourFootPen = 0;
for (let f = 0; f < parkourFrames.length; f++) {
  const spec = parkourFrames[f];
  const joints = solveForwardKinematics17(spec.manX, spec.manY, spec.manAngles, 0.5);
  const rFootDeep = Math.max(joints[3].startY, joints[3].endY);
  const lFootDeep = Math.max(joints[6].startY, joints[6].endY);
  if (rFootDeep > MASTER_CANVAS_GROUND_Y + 0.5) maxParkourFootPen = Math.max(maxParkourFootPen, rFootDeep - MASTER_CANVAS_GROUND_Y);
  if (lFootDeep > MASTER_CANVAS_GROUND_Y + 0.5) maxParkourFootPen = Math.max(maxParkourFootPen, lFootDeep - MASTER_CANVAS_GROUND_Y);
}
assert(maxParkourFootPen <= 0.5, '3B. Parkour Acrobat (108 Frames)', `Max foot penetration = ${maxParkourFootPen.toFixed(2)} px vs Floor Y = ${MASTER_CANVAS_GROUND_Y}`);

// 3C: Sit Walk Kick (216 frames @ 24fps)
const strollFrames = buildCanonicalSitWalkKickFrames({ targetFps: 24 });
let maxStrollFootPen = 0;
for (let f = 0; f < strollFrames.length; f++) {
  const spec = strollFrames[f];
  const joints = solveForwardKinematics17(spec.manX, spec.manY, spec.manAngles, 0.5);
  const rFootDeep = Math.max(joints[3].startY, joints[3].endY);
  const lFootDeep = Math.max(joints[6].startY, joints[6].endY);
  if (rFootDeep > MASTER_CANVAS_GROUND_Y + 0.5) maxStrollFootPen = Math.max(maxStrollFootPen, rFootDeep - MASTER_CANVAS_GROUND_Y);
  if (lFootDeep > MASTER_CANVAS_GROUND_Y + 0.5) maxStrollFootPen = Math.max(maxStrollFootPen, lFootDeep - MASTER_CANVAS_GROUND_Y);
}
assert(maxStrollFootPen <= 0.5, '3C. Sit Walk Kick Ball (216 Frames)', `Max foot penetration = ${maxStrollFootPen.toFixed(2)} px vs Floor Y = ${MASTER_CANVAS_GROUND_Y}`);

// 3D: Basketball Pickup & Dribble (24 frames @ 24fps)
const basketballFrames = buildCanonicalBasketballFrames({ targetFps: 24 });
let maxBballFootPen = 0;
for (let f = 0; f < basketballFrames.length; f++) {
  const spec = basketballFrames[f];
  const joints = solveForwardKinematics17(spec.charX, spec.charY, spec.angles, 0.5);
  const rFootDeep = Math.max(joints[3].startY, joints[3].endY);
  const lFootDeep = Math.max(joints[6].startY, joints[6].endY);
  if (rFootDeep > MASTER_CANVAS_GROUND_Y + 0.5) maxBballFootPen = Math.max(maxBballFootPen, rFootDeep - MASTER_CANVAS_GROUND_Y);
  if (lFootDeep > MASTER_CANVAS_GROUND_Y + 0.5) maxBballFootPen = Math.max(maxBballFootPen, lFootDeep - MASTER_CANVAS_GROUND_Y);
}
assert(maxBballFootPen <= 0.5, '3D. Basketball Walk & Dribble (24 Frames)', `Max foot penetration = ${maxBballFootPen.toFixed(2)} px vs Floor Y = ${MASTER_CANVAS_GROUND_Y}`);

console.log('\n================================================================');
if (totalFailures === 0) {
  console.log('  ALL AUDITS PASSED: ZERO GROUND BARRIER VIOLATIONS DETECTED!');
} else {
  console.error(`  TOTAL AUDIT FAILURES: ${totalFailures}`);
  process.exit(1);
}
console.log('================================================================\n');
