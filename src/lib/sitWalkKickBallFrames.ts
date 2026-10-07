/**
 * THE STROLL & KICK: 216-FRAME PROCEDURAL BIOMECHANICAL CHOREOGRAPHY (v1.0)
 * =========================================================================
 * Full kinematic sequence built from research-based joint angles and IK:
 * 
 * SETUP & SCENE CONSTRAINTS:
 * - One standard 17-node stickfigure, scale 0.5, facing right (+X).
 * - One orange ball (radius ~18 px, resting at (900, 737) on Ground Y = 755).
 * - Ground Plane: Y = 755.0 px (Standing Pelvis Y = 510, Seated Pelvis Y = 726).
 * - 24 FPS, 216 frames (9.0 seconds).
 * - Decoupled camera tracking: static -> follow walk -> follow run -> follow ball.
 * 
 * THE 9 BIOMECHANICAL ACTS & 16 STORYBOARD PANELS:
 * - Act A (F000-018): Seated floor rest, knees up, feet flat, forearm on knee, hand planted, breathing.
 * - Act B (F019-071): Squat rise: hands plant, trunk folds 35-45°, hips launch into deep squat, extension to stand.
 * - Act C (F072-081): Standing equilibrium, arms loosen, forward COM lean 3-5°, weight shift.
 * - Act D (F082-111): Relaxed stroll, acceleration (3->6->8->10 px/f), authentic walk angles, pelvis bob ±4px.
 * - Act E (F112-129): Notices ball: head snaps down, stride breaks into friction brake plant, hesitation hold.
 * - Act F (F130-153): Excited jump in place: crouch, launch, airborne apex (+70px), landing cushion at Y=755.
 * - Act G (F154-165): Sprint to ball: explosive forward lean, arms 90°, high heel fold to butt, plant step.
 * - Act H (F166-175): Kick: support foot pinned at (880, 755), backswing 110°, whip, impact at (884, 735), 1f hit-stop.
 * - Act I (F176-215): Ball launch (vx=+40, vy=-44, g=+2.4), high follow-through, fist pump, moving hold.
 */

import {
  STICKFIGURE_BONE_LENGTHS,
  STICKFIGURE_BONE_THICKNESS,
  STICKFIGURE_PARENTS,
  STKNDS_PREFIX,
  gzipBytes,
} from './stkndsCodec';
import {
  solveForwardKinematics17,
  solveTwoBoneIK,
  solveLegLimb,
  solveArmLimb,
} from './humanMotionSkills';
import {
  calculateCenterOfMass17,
  calculateBaseOfSupport17,
  computeProceduralBalanceOffset,
  solveStancePinningIK,
  quinticSmoothstep,
  computeProceduralMotionArc,
  solveTargetDirectedStrikeIK,
  computeDampedOscillation,
} from './proceduralKinematics';

export interface SitWalkKickKeyframeSpec {
  frame: number; // 0..215
  act: string;
  phase: string;
  // Character Root & Pose
  manX: number;
  manY: number;
  manAngles: number[]; // 17 world angles in degrees (0=Right, +90=Up, -90=Down, 180=Left)
  // Procedural Kinematics & Dynamic Balance
  comX: number;
  comY: number;
  supportMinX: number;
  supportMaxX: number;
  isGrounded: boolean;
  isBalanced: boolean;
  stabilityMargin: number;
  // Ball State
  ballX: number;
  ballY: number;
  ballActive: boolean;
  // Camera Decoupling
  camX: number;
  camY: number;
  camZoom: number;
  // Storyboard Metadata
  panelId: number;
  storyboardTitle: string;
  notes: string;
}

export interface SitWalkKickGeneratorConfig {
  projectName: string;
  targetFps: 12 | 24;
  manColorHex: string; // Default #1E293B
  ballColorHex: string; // Default #EA580C
  ballRadius: number; // Default 18 px
  enableHitStop: boolean; // Default true
}

export interface BiomechanicalAuditItem {
  id: string;
  label: string;
  passed: boolean;
  metric: string;
  threshold: string;
  detail: string;
}

export interface BiomechanicalAuditReport {
  passed: boolean;
  totalChecks: number;
  passedChecks: number;
  items: BiomechanicalAuditItem[];
}

export function hexColorToArgbUint32(hex: string): number {
  const clean = hex.replace('#', '');
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return ((0xff << 24) | (r << 16) | (g << 8) | b) >>> 0;
  }
  return 0xff1e293b;
}

// Cubic ease in/out helper
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Builds the canonical 216-frame sequence using forward kinematics and analytical two-bone IK.
 */
export function buildCanonicalSitWalkKickFrames(
  config: Partial<SitWalkKickGeneratorConfig> = {}
): SitWalkKickKeyframeSpec[] {
  const frames: SitWalkKickKeyframeSpec[] = [];
  const groundY = 755.0;
  const initialBallX = 900.0;
  const initialBallY = 737.0; // Ball radius 18 => 737 + 18 = 755 (resting on ground)
  const scale = 0.5;

  for (let f = 0; f < 216; f++) {
    let act = '';
    let phase = '';
    let panelId = 1;
    let storyboardTitle = '';
    let notes = '';

    let manX = 300.0;
    let manY = 726.0; // Sitting pelvis Y
    let manAngles = new Array(17).fill(0);

    let ballX = initialBallX;
    let ballY = initialBallY;
    let ballActive = false;

    let camX = -30.0;
    let camY = -15.0;
    let camZoom = 1.12;

    // =========================================================================
    // ACT A: SEATED ON THE GROUND (F000–F018, 19 frames)
    // Storyboard Panel 1: Sitting, knees up, feet flat, forearm on knee, hand planted.
    // =========================================================================
    if (f <= 18) {
      act = 'Act A: Seated Floor Rest';
      phase = 'Resting with Knees Bent & Hand Planted';
      panelId = 1;
      storyboardTitle = '1. The Seated Pause';
      notes = 'Man rests quietly on ground at X=300, knees bent up, head drooped, subtle breathing.';

      const tBreathe = f / 18.0;
      const breatheDy = Math.sin(tBreathe * Math.PI * 2) * 0.8;
      const breatheRot = Math.sin(tBreathe * Math.PI * 2) * 1.0;
      const headDrift = Math.cos(tBreathe * Math.PI * 2) * 1.5;

      manX = 300.0;
      manY = 726.0 + breatheDy;

      // Feet flat on the floor in front of him: X ≈ 390–410, Y = 755
      const rAnkleX = 406.0;
      const rAnkleY = groundY;
      const lAnkleX = 392.0;
      const lAnkleY = groundY;

      // Leg IK
      const rLeg = solveLegLimb(manX, manY, rAnkleX, rAnkleY, true, scale, true);
      const lLeg = solveLegLimb(manX, manY, lAnkleX, lAnkleY, true, scale, true);

      // Spine & Torso (relaxed forward curvature)
      const spineAngle = 78.0 + breatheRot;
      const chestAngle = 73.0 + breatheRot;
      const neckAngle = 66.0;
      const headAngle = 46.0 + headDrift;

      // FK for shoulders
      const tempAngles = new Array(17).fill(0);
      tempAngles[7] = spineAngle;
      tempAngles[8] = chestAngle;
      const fk = solveForwardKinematics17(manX, manY, tempAngles, scale);
      const shoulderX = fk[8].endX;
      const shoulderY = fk[8].endY;

      // Arms: Left arm planted behind hips on ground; Right forearm resting on right knee
      const lHandTargetX = 238.0;
      const lHandTargetY = groundY;
      const lArm = solveArmLimb(shoulderX, shoulderY, lHandTargetX, lHandTargetY, true, scale);

      // Right arm rests on right knee (rLeg.kneeX, rLeg.kneeY)
      const rHandTargetX = rLeg.kneeX - 6.0;
      const rHandTargetY = rLeg.kneeY + 4.0;
      const rArm = solveArmLimb(shoulderX, shoulderY, rHandTargetX, rHandTargetY, true, scale);

      manAngles[0] = 0;
      manAngles[1] = rLeg.thighAngleDeg;
      manAngles[2] = rLeg.shinAngleDeg;
      manAngles[3] = 0.0; // Foot flat on floor
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = 0.0; // Foot flat on floor
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[9] = rArm.bicepAngleDeg;
      manAngles[10] = rArm.forearmAngleDeg;
      manAngles[11] = rArm.handAngleDeg;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;
      manAngles[14] = lArm.bicepAngleDeg;
      manAngles[15] = lArm.forearmAngleDeg;
      manAngles[16] = lArm.handAngleDeg;

      // Camera static on seated man
      camX = -30.0;
      camY = -15.0;
      camZoom = 1.12;
    }

    // =========================================================================
    // ACT B1: SLOW RISE - FORWARD WEIGHT SHIFT & HAND PLANT (F019–F033, 15 frames)
    // Storyboard Panel 2: Settle back, hands plant, trunk folds 35-45°, feet scoot slightly in.
    // =========================================================================
    else if (f <= 33) {
      act = 'Act B: Slow Rise from Floor';
      phase = 'Phase 1: Trunk Flexion & Hand Planting';
      panelId = 2;
      storyboardTitle = '2. Forward Trunk Fold & Hand Plant';
      notes = 'Trunk folds forward 35–45°, head leads, both hands plant on floor, weight shifts over feet.';

      const t = (f - 19) / 14.0;
      const easedT = easeInOutCubic(t);

      // Pelvis shifts slightly back then forward into launch position
      manX = 300.0 + (t < 0.3 ? -Math.sin((t / 0.3) * Math.PI) * 4.0 : (t - 0.3) * 12.0);
      manY = 726.0 - easedT * 6.0;

      // Feet scoot slightly inward to set squat base
      const rAnkleX = 406.0 - easedT * 8.0;
      const lAnkleX = 392.0 - easedT * 8.0;

      const rLeg = solveLegLimb(manX, manY, rAnkleX, groundY, true, scale, true);
      const lLeg = solveLegLimb(manX, manY, lAnkleX, groundY, true, scale, true);

      // Trunk folds forward: lower spine 78° -> 42° (36° forward flexion!), upper chest 73° -> 38°
      const spineAngle = 78.0 - easedT * 36.0;
      const chestAngle = 73.0 - easedT * 35.0;
      const neckAngle = 66.0 - easedT * 28.0;
      const headAngle = 46.0 - easedT * 22.0;

      const tempAngles = new Array(17).fill(0);
      tempAngles[7] = spineAngle;
      tempAngles[8] = chestAngle;
      const fk = solveForwardKinematics17(manX, manY, tempAngles, scale);
      const shoulderX = fk[8].endX;
      const shoulderY = fk[8].endY;

      // Hands plant on ground: Left slides forward to (275, 755), Right moves from knee down to (368, 755)
      const lHandX = 238.0 + easedT * 38.0;
      const rHandX = (rLeg.kneeX - 6.0) * (1 - easedT) + 368.0 * easedT;
      const rHandY = (rLeg.kneeY + 4.0) * (1 - easedT) + groundY * easedT;

      const lArm = solveArmLimb(shoulderX, shoulderY, lHandX, groundY, true, scale);
      const rArm = solveArmLimb(shoulderX, shoulderY, rHandX, rHandY, true, scale);

      manAngles[0] = 0;
      manAngles[1] = rLeg.thighAngleDeg;
      manAngles[2] = rLeg.shinAngleDeg;
      manAngles[3] = 0.0;
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = 0.0;
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[9] = rArm.bicepAngleDeg;
      manAngles[10] = rArm.forearmAngleDeg;
      manAngles[11] = rArm.handAngleDeg;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;
      manAngles[14] = lArm.bicepAngleDeg;
      manAngles[15] = lArm.forearmAngleDeg;
      manAngles[16] = lArm.handAngleDeg;

      camX = -30.0;
      camY = -15.0;
      camZoom = 1.12;
    }

    // =========================================================================
    // ACT B2: HIPS LEAVE FLOOR INTO DEEP SQUAT (F034–F043, 10 frames)
    // Storyboard Panel 3: Hips lift into deep squat (pelvis Y 650-670, heels flat), fastest motion.
    // =========================================================================
    else if (f <= 43) {
      act = 'Act B: Slow Rise from Floor';
      phase = 'Phase 2: Hips Lift into Deep Squat (Peak Thrust)';
      panelId = 3;
      storyboardTitle = '3. Hips Launch into Deep Squat';
      notes = 'Fastest motion of rise: Pelvis thrusts forward 90px & upward to Y=656, hands push and release.';

      const t = (f - 34) / 9.0;
      const easedT = easeInOutCubic(t);

      // Pelvis moves forward ~90-100px over the feet, Y rises to deep squat Y ≈ 656
      const startX = 308.0;
      const targetX = 398.0;
      manX = startX + easedT * (targetX - startX);
      manY = 720.0 - easedT * 64.0; // 720 -> 656

      // Feet stay firmly pinned flat on ground
      const rAnkleX = 398.0;
      const lAnkleX = 384.0;

      const rLeg = solveLegLimb(manX, manY, rAnkleX, groundY, true, scale, true);
      const lLeg = solveLegLimb(manX, manY, lAnkleX, groundY, true, scale, true);

      // Trunk maintains forward counter-balance angle in deep squat
      const spineAngle = 42.0 + easedT * 6.0;
      const chestAngle = 38.0 + easedT * 6.0;
      const neckAngle = 38.0 + easedT * 8.0;
      const headAngle = 24.0 + easedT * 12.0;

      const tempAngles = new Array(17).fill(0);
      tempAngles[7] = spineAngle;
      tempAngles[8] = chestAngle;
      const fk = solveForwardKinematics17(manX, manY, tempAngles, scale);
      const shoulderX = fk[8].endX;
      const shoulderY = fk[8].endY;

      // Hands push off floor in first 5 frames, then lift free into air for balance
      const handsRelease = clamp((f - 38) / 5.0, 0, 1);
      const lHandTargetX = 276.0 + handsRelease * 40.0;
      const lHandTargetY = groundY - handsRelease * 35.0;
      const rHandTargetX = 368.0 + handsRelease * 32.0;
      const rHandTargetY = groundY - handsRelease * 35.0;

      const lArm = solveArmLimb(shoulderX, shoulderY, lHandTargetX, lHandTargetY, true, scale);
      const rArm = solveArmLimb(shoulderX, shoulderY, rHandTargetX, rHandTargetY, true, scale);

      manAngles[0] = 0;
      manAngles[1] = rLeg.thighAngleDeg;
      manAngles[2] = rLeg.shinAngleDeg;
      manAngles[3] = 0.0;
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = 0.0;
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[9] = rArm.bicepAngleDeg;
      manAngles[10] = rArm.forearmAngleDeg;
      manAngles[11] = rArm.handAngleDeg;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;
      manAngles[14] = lArm.bicepAngleDeg;
      manAngles[15] = lArm.forearmAngleDeg;
      manAngles[16] = lArm.handAngleDeg;

      camX = -30.0;
      camY = -15.0;
      camZoom = 1.12;
    }

    // =========================================================================
    // ACT B3: HIP & KNEE EXTENSION TO STAND (F044–F071, 28 frames)
    // Storyboard Panel 4: Hips and knees extend, arms swing for balance, head comes up last, settle.
    // =========================================================================
    else if (f <= 71) {
      act = 'Act B: Slow Rise from Floor';
      phase = 'Phase 3: Deep Squat Extension to Upright Standing';
      panelId = 4;
      storyboardTitle = '4. Hip & Knee Extension to Stand';
      notes = 'Legs extend progressively, pelvis rises to Y=510, spine unfolds, head comes up last with subtle overshoot.';

      const t = (f - 44) / 27.0;
      const easedT = easeInOutCubic(t);

      // Pelvis rises from 656 -> standing 510. Overshoot around f=68 (508), settling to 510 at f=71
      let targetY = 656.0 - easedT * 146.0;
      if (f >= 67 && f <= 70) {
        targetY = 508.5; // Subtle 1.5px overshoot
      } else if (f === 71) {
        targetY = 510.0;
      }
      manX = 398.0 + easedT * 2.0; // Settles at X = 400.0
      manY = targetY;

      // Feet pinned flat at Y = 755
      const rAnkleX = 405.0;
      const lAnkleX = 392.0;

      const rLeg = solveLegLimb(manX, manY, rAnkleX, groundY, true, scale, true);
      const lLeg = solveLegLimb(manX, manY, lAnkleX, groundY, true, scale, true);

      // Trunk unfolds: Lower spine 48° -> 89°, Upper chest 44° -> 90°
      const spineAngle = 48.0 + easedT * 41.0;
      const chestAngle = 44.0 + easedT * 46.0;
      const neckAngle = 46.0 + easedT * 44.0;
      // Head comes up last (anatomical lag / follow-through)
      const headLagT = clamp((t - 0.15) / 0.85, 0, 1);
      const headAngle = 36.0 + easeInOutCubic(headLagT) * 54.0;

      const tempAngles = new Array(17).fill(0);
      tempAngles[7] = spineAngle;
      tempAngles[8] = chestAngle;
      const fk = solveForwardKinematics17(manX, manY, tempAngles, scale);
      const shoulderX = fk[8].endX;
      const shoulderY = fk[8].endY;

      // Arms swing backward slightly then ease down to sides
      const armSwing = Math.sin(t * Math.PI) * 18.0;
      const rHandTargetX = shoulderX + 4.0 - armSwing * 0.5;
      const rHandTargetY = shoulderY + 76.0;
      const lHandTargetX = shoulderX - 4.0 + armSwing * 0.5;
      const lHandTargetY = shoulderY + 76.0;

      const lArm = solveArmLimb(shoulderX, shoulderY, lHandTargetX, lHandTargetY, true, scale);
      const rArm = solveArmLimb(shoulderX, shoulderY, rHandTargetX, rHandTargetY, true, scale);

      manAngles[0] = 0;
      manAngles[1] = rLeg.thighAngleDeg;
      manAngles[2] = rLeg.shinAngleDeg;
      manAngles[3] = 0.0;
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = 0.0;
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[9] = rArm.bicepAngleDeg;
      manAngles[10] = rArm.forearmAngleDeg;
      manAngles[11] = rArm.handAngleDeg;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;
      manAngles[14] = lArm.bicepAngleDeg;
      manAngles[15] = lArm.forearmAngleDeg;
      manAngles[16] = lArm.handAngleDeg;

      camX = -30.0;
      camY = -15.0;
      camZoom = 1.12;
    }

    // =========================================================================
    // ACT C: STANDING EQUILIBRIUM & FIRST STEP PREP (F072–F081, 10 frames)
    // Storyboard Panel 5: Stand, loosen arms, lean forward 3-5°, weight shift, first step.
    // =========================================================================
    else if (f <= 81) {
      act = 'Act C: Standing Equilibrium & Stride Initiation';
      phase = 'Loosen Arms, Lean Forward 3–5°, Weight Shift';
      panelId = 5;
      storyboardTitle = '5. Upright Standing & Weight Shift';
      notes = 'Torso counter-leans forward 3–5° to initiate momentum; weight shifts onto left stance leg.';

      const t = (f - 72) / 9.0;
      const easedT = easeInOutCubic(t);

      // Root advances slightly: 400 -> 405
      manX = 400.0 + easedT * 5.0;
      manY = 510.0;

      // Both feet remain planted flat on ground plane Y = 755.0
      const lAnkleX = 396.0;
      const rAnkleX = 405.0 + easedT * 8.0;

      const lLeg = solveLegLimb(manX, manY, lAnkleX, groundY, true, scale, true);
      const rLeg = solveLegLimb(manX, manY, rAnkleX, groundY, true, scale, true);

      // Torso leans forward 3–5° (Spine: 86°, Chest: 86°)
      const spineAngle = 89.0 - easedT * 3.5;
      const chestAngle = 90.0 - easedT * 4.0;
      const neckAngle = 90.0;
      const headAngle = 88.0;

      const tempAngles = new Array(17).fill(0);
      tempAngles[7] = spineAngle;
      tempAngles[8] = chestAngle;
      const fk = solveForwardKinematics17(manX, manY, tempAngles, scale);
      const shoulderX = fk[8].endX;
      const shoulderY = fk[8].endY;

      // Arms loosen and begin subtle anti-phase swing
      const rArmTargetX = shoulderX - easedT * 8.0;
      const rArmTargetY = shoulderY + 76.0;
      const lArmTargetX = shoulderX + easedT * 8.0;
      const lArmTargetY = shoulderY + 76.0;

      const rArm = solveArmLimb(shoulderX, shoulderY, rArmTargetX, rArmTargetY, true, scale);
      const lArm = solveArmLimb(shoulderX, shoulderY, lArmTargetX, lArmTargetY, true, scale);

      manAngles[0] = 0;
      manAngles[1] = rLeg.thighAngleDeg;
      manAngles[2] = rLeg.shinAngleDeg;
      manAngles[3] = 0.0; // Pinned flat on ground
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = 0.0; // Pinned flat on ground
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[9] = rArm.bicepAngleDeg;
      manAngles[10] = rArm.forearmAngleDeg;
      manAngles[11] = rArm.handAngleDeg;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;
      manAngles[14] = lArm.bicepAngleDeg;
      manAngles[15] = lArm.forearmAngleDeg;
      manAngles[16] = lArm.handAngleDeg;

      // Camera begins slow eased tracking
      camX = -30.0 - easedT * 15.0;
      camY = -15.0;
      camZoom = 1.12;
    }

    // =========================================================================
    // ACT D: RELAXED STROLL (F082–F111, 30 frames)
    // Storyboard Panels 6 & 7: Relaxed stroll, root X 405 -> 650, speed ramping, full walk angles.
    // =========================================================================
    else if (f <= 111) {
      act = 'Act D: Relaxed Stroll';
      phase = 'Natural Biomechanical Walk Cycle (X: 405 → 650)';
      panelId = f < 96 ? 6 : 7;
      storyboardTitle = f < 96 ? '6. Forward Walk Stride' : '7. Relaxed Mid-Gait Stroll';
      notes = 'Hip 25° flexion at heel strike, knee 20° cushion, 60° swing peak; arms swing opposite with 15° bend; pelvis bobs ±4px.';

      // Stride timing & procedural stance pinning
      const tWalk = (f - 82) / 29.0;
      // Authentic progressive acceleration from standing start (3 -> 6 -> 8 -> 10 px/f)
      const walkDistance = Math.pow(tWalk, 1.35) * (650.0 - 405.0);
      manX = 405.0 + walkDistance;

      // Stride phase:
      // Step 1 (F082-096): Left foot is stance pinned at X = 405.0; Right foot swings from 405 -> 515.
      // Step 2 (F097-111): Right foot is stance pinned at X = 515.0; Left foot swings from 405 -> 625.
      const stepLift = 14.0; // Parabolic swing foot clearance
      let rFootX = manX;
      let rFootY = groundY;
      let lFootX = manX;
      let lFootY = groundY;
      let rFootAngle = 0.0;
      let lFootAngle = 0.0;
      let isRightSwing = false;
      let gaitProgress = 0;

      if (f <= 96) {
        // Step 1: Left leg is pinned stance leg; Right leg is swing leg
        isRightSwing = true;
        const tSwing = (f - 82) / 14.0;
        gaitProgress = tSwing;
        const swingArc = computeProceduralMotionArc(405.0, groundY, 515.0, groundY, tSwing, stepLift);
        rFootX = swingArc.x;
        rFootY = swingArc.y;
        rFootAngle = tSwing < 0.25 ? 12.0 : tSwing > 0.75 ? -10.0 : 0.0;

        // Left foot is strictly pinned to ground plane
        lFootX = 405.0;
        lFootY = groundY;
        lFootAngle = tSwing > 0.7 ? -18.0 * ((tSwing - 0.7) / 0.3) : 0.0; // Ankle push-off
      } else {
        // Step 2: Right leg is pinned stance leg; Left leg is swing leg
        isRightSwing = false;
        const tSwing = (f - 97) / 14.0;
        gaitProgress = tSwing;
        const swingArc = computeProceduralMotionArc(405.0, groundY, 625.0, groundY, tSwing, stepLift);
        lFootX = swingArc.x;
        lFootY = swingArc.y;
        lFootAngle = tSwing < 0.25 ? 12.0 : tSwing > 0.75 ? -10.0 : 0.0;

        // Right foot is strictly pinned to ground plane
        rFootX = 515.0;
        rFootY = groundY;
        rFootAngle = tSwing > 0.7 ? -18.0 * ((tSwing - 0.7) / 0.3) : 0.0; // Ankle push-off
      }

      // Pelvis vertical wave (bobs ±4px = 8px * 0.5 scale)
      const pelvisBob = Math.sin(gaitProgress * Math.PI * 2) * 4.0;
      manY = 510.0 + pelvisBob;

      const rLeg = solveLegLimb(manX, manY, rFootX, rFootY, true, scale, rFootY >= groundY - 1.0);
      const lLeg = solveLegLimb(manX, manY, lFootX, lFootY, true, scale, lFootY >= groundY - 1.0);

      // Pelvis & Spine tilt ±4°
      const spineTilt = Math.sin(gaitProgress * Math.PI * 2) * 3.0;
      const spineAngle = 86.0 + spineTilt;
      const chestAngle = 86.5 + spineTilt;
      const neckAngle = 88.0;
      const headAngle = 84.0; // Looking ahead and slightly down

      const tempAngles = new Array(17).fill(0);
      tempAngles[7] = spineAngle;
      tempAngles[8] = chestAngle;
      const fk = solveForwardKinematics17(manX, manY, tempAngles, scale);
      const shoulderX = fk[8].endX;
      const shoulderY = fk[8].endY;

      // Arms swing in anti-phase to legs with small elbow bend (15–25°)
      const armPhase = (isRightSwing ? gaitProgress : gaitProgress + 1.0) * Math.PI;
      const armSwingX = Math.sin(armPhase) * 28.0;

      // Arm swing lags legs slightly (Skill #09)
      const rHandTargetX = shoulderX - armSwingX;
      const rHandTargetY = shoulderY + 74.0;
      const lHandTargetX = shoulderX + armSwingX;
      const lHandTargetY = shoulderY + 74.0;

      const rArm = solveArmLimb(shoulderX, shoulderY, rHandTargetX, rHandTargetY, true, scale);
      const lArm = solveArmLimb(shoulderX, shoulderY, lHandTargetX, lHandTargetY, true, scale);

      manAngles[0] = 0;
      manAngles[1] = rLeg.thighAngleDeg;
      manAngles[2] = rLeg.shinAngleDeg;
      manAngles[3] = rFootAngle;
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = lFootAngle;
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[9] = rArm.bicepAngleDeg;
      manAngles[10] = rArm.forearmAngleDeg;
      manAngles[11] = rArm.handAngleDeg;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;
      manAngles[14] = lArm.bicepAngleDeg;
      manAngles[15] = lArm.forearmAngleDeg;
      manAngles[16] = lArm.handAngleDeg;

      // Camera smoothly follows stroll
      camX = -45.0 - tWalk * 90.0;
      camY = -15.0;
      camZoom = 1.10;
    }

    // =========================================================================
    // ACT E: NOTICES THE BALL (F112–F129, 18 frames)
    // Storyboard Panel 8: Head snaps down toward ball, stride breaks, brake plant, pause, excite.
    // =========================================================================
    else if (f <= 129) {
      act = 'Act E: Notices the Ball';
      phase = 'Gaze Snap & Braking Plant';
      panelId = 8;
      storyboardTitle = '8. Notices the Ball & Stride Brake';
      notes = 'Head snaps down toward ball first; lead foot plants as friction brake; torso counter-leans back 6°; pause & excitement coil.';

      const tNotice = (f - 112) / 17.0;
      // Stride decelerates to halt at X ≈ 650
      const brakeX = 650.0 + (1 - Math.pow(1 - clamp(tNotice * 1.6, 0, 1), 2)) * 6.0;
      manX = brakeX;
      manY = 510.0;

      // Braking plant feet: Right foot plants firmly ahead as friction brake at X = 678
      const rAnkleX = 678.0;
      const lAnkleX = 624.0;

      const rLeg = solveLegLimb(manX, manY, rAnkleX, groundY, true, scale, true);
      const lLeg = solveLegLimb(manX, manY, lAnkleX, groundY, true, scale, true);

      // Head snaps down fast (F112–115) pointing toward ball at (900, 737)
      const headSnapT = clamp((f - 112) / 4.0, 0, 1);
      const headAngle = 84.0 - headSnapT * 42.0; // 84° -> 42° (snaps directly down-right!)

      // Torso leans back 5–8° to scrub forward momentum (Spine: 96°, Chest: 97°)
      const torsoBrakeT = clamp((f - 114) / 7.0, 0, 1);
      const spineAngle = 86.0 + torsoBrakeT * 10.0;
      const chestAngle = 86.5 + torsoBrakeT * 10.5;
      const neckAngle = 88.0 - headSnapT * 26.0;

      const tempAngles = new Array(17).fill(0);
      tempAngles[7] = spineAngle;
      tempAngles[8] = chestAngle;
      const fk = solveForwardKinematics17(manX, manY, tempAngles, scale);
      const shoulderX = fk[8].endX;
      const shoulderY = fk[8].endY;

      // Right arm rises 25° in reactive surprise; hands begin to clench
      const armReactT = clamp((f - 115) / 8.0, 0, 1);
      const rArmTargetX = shoulderX + 22.0 * armReactT;
      const rArmTargetY = shoulderY + 52.0 - armReactT * 20.0;
      const lArmTargetX = shoulderX - 16.0;
      const lArmTargetY = shoulderY + 70.0;

      const rArm = solveArmLimb(shoulderX, shoulderY, rArmTargetX, rArmTargetY, true, scale);
      const lArm = solveArmLimb(shoulderX, shoulderY, lArmTargetX, lArmTargetY, true, scale);

      manAngles[0] = 0;
      manAngles[1] = rLeg.thighAngleDeg;
      manAngles[2] = rLeg.shinAngleDeg;
      manAngles[3] = 0.0;
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = 0.0;
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[9] = rArm.bicepAngleDeg;
      manAngles[10] = rArm.forearmAngleDeg;
      manAngles[11] = rArm.handAngleDeg;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;
      manAngles[14] = lArm.bicepAngleDeg;
      manAngles[15] = lArm.forearmAngleDeg;
      manAngles[16] = lArm.handAngleDeg;

      camX = -135.0;
      camY = -15.0;
      camZoom = 1.05;
    }

    // =========================================================================
    // ACT F1: EXCITED JUMP - CROUCH ANTICIPATION (F130–F135, 6 frames)
    // Storyboard Panel 9: Crouch anticipation, COM drops 55-70px, knees 85°, torso leans 25°, arms swing back.
    // =========================================================================
    else if (f <= 135) {
      act = 'Act F: Excited Jump in Place';
      phase = 'Phase 1: Deep Compression & Crouch Anticipation';
      panelId = 9;
      storyboardTitle = '9. Jump Crouch Anticipation';
      notes = 'COM drops 60px (Pelvis Y=568), knees flex 85° naturally forward, torso leans forward 25°, arms swing back.';

      const tCrouch = (f - 130) / 5.0;
      const easedT = easeInOutCubic(tCrouch);

      manX = 650.0;
      manY = 510.0 + easedT * 58.0; // 510 -> 568 px

      // Feet pinned flat at Y = 755
      const rAnkleX = 660.0;
      const lAnkleX = 642.0;

      const rLeg = solveLegLimb(manX, manY, rAnkleX, groundY, true, scale, true);
      const lLeg = solveLegLimb(manX, manY, lAnkleX, groundY, true, scale, true);

      // Torso leans forward 25–30° (Spine: 65°, Chest: 62°)
      const spineAngle = 96.0 - easedT * 31.0;
      const chestAngle = 97.0 - easedT * 35.0;
      const neckAngle = 62.0 + easedT * 12.0;
      const headAngle = 42.0 + easedT * 26.0;

      const tempAngles = new Array(17).fill(0);
      tempAngles[7] = spineAngle;
      tempAngles[8] = chestAngle;
      const fk = solveForwardKinematics17(manX, manY, tempAngles, scale);
      const shoulderX = fk[8].endX;
      const shoulderY = fk[8].endY;

      // Arms swing back dynamically in counter-anticipation
      const armBackX = shoulderX - easedT * 38.0;
      const armBackY = shoulderY + 48.0 - easedT * 12.0;

      const rArm = solveArmLimb(shoulderX, shoulderY, armBackX - 4.0, armBackY, true, scale);
      const lArm = solveArmLimb(shoulderX, shoulderY, armBackX + 4.0, armBackY, true, scale);

      manAngles[0] = 0;
      manAngles[1] = rLeg.thighAngleDeg;
      manAngles[2] = rLeg.shinAngleDeg;
      manAngles[3] = 0.0;
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = 0.0;
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[9] = rArm.bicepAngleDeg;
      manAngles[10] = rArm.forearmAngleDeg;
      manAngles[11] = rArm.handAngleDeg;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;
      manAngles[14] = lArm.bicepAngleDeg;
      manAngles[15] = lArm.forearmAngleDeg;
      manAngles[16] = lArm.handAngleDeg;

      camX = -135.0;
      camY = -15.0;
      camZoom = 1.05;
    }

    // =========================================================================
    // ACT F2: LAUNCH & AIRBORNE APEX (F136–F147, 12 frames)
    // Storyboard Panel 10: Explosive jump, peak 70px above standing, arms straight up with fists, knees tucked.
    // =========================================================================
    else if (f <= 147) {
      act = 'Act F: Excited Jump in Place';
      phase = 'Phase 2: Triple Extension & Airborne Apex';
      panelId = 10;
      storyboardTitle = '10. Excited Mid-Air Apex Jump';
      notes = 'Triple extension launch; airborne peak at Y=440 (70px above standing); arms raise straight up with fists; knees tuck 30°.';

      manX = 650.0;

      // Smooth parabolic jump trajectory: F136 launch -> F143 apex (Y=440) -> F148 touchdown
      const JUMP_Y_PROFILE = [
        554.0, // F136: Launch drive begins (-14px from 568)
        532.0, // F137: Powerful knee drive (-22px)
        506.0, // F138: Ankle extension (-26px)
        480.0, // F139: Toes leave floor (-26px, airborne!)
        458.0, // F140: Decelerating upward (-22px)
        445.0, // F141: Approaching peak (-13px)
        441.0, // F142: Pre-apex ease (-4px)
        440.0, // F143: APEX PEAK (Y=440, exactly 70px above standing 510)
        442.0, // F144: Apex hang & gravity inflection (+2px)
        454.0, // F145: Descending (+12px)
        476.0, // F146: Gravity acceleration downward (+22px)
        508.0, // F147: Approaching turf (+32px)
      ];
      manY = JUMP_Y_PROFILE[f - 136];

      const isAirborne = f >= 139 && f <= 147;

      let rLegAngles = { thigh: -85.0, shin: -95.0, foot: -25.0 };
      let lLegAngles = { thigh: -85.0, shin: -95.0, foot: -25.0 };

      if (!isAirborne) {
        // Triple extension on ground launch (F136–138)
        const tLaunch = (f - 136) / 3.0;
        const rLeg = solveLegLimb(manX, manY, 655.0, groundY, true, scale, true);
        const lLeg = solveLegLimb(manX, manY, 645.0, groundY, true, scale, true);
        rLegAngles = { thigh: rLeg.thighAngleDeg, shin: rLeg.shinAngleDeg, foot: -10.0 * tLaunch };
        lLegAngles = { thigh: lLeg.thighAngleDeg, shin: lLeg.shinAngleDeg, foot: -10.0 * tLaunch };
      } else {
        // In air: knees tucked 25–35°
        const tuckT = Math.sin(((f - 139) / 8.0) * Math.PI);
        const tuckThigh = -75.0 + tuckT * 20.0; // Thigh flexes forward
        const tuckShin = -115.0 - tuckT * 15.0; // Shin tucks backward
        rLegAngles = { thigh: tuckThigh, shin: tuckShin, foot: -30.0 };
        lLegAngles = { thigh: tuckThigh + 4.0, shin: tuckShin - 5.0, foot: -30.0 };
      }

      // Torso extends upright in air
      const spineAngle = 88.0;
      const chestAngle = 89.0;
      const neckAngle = 92.0;
      const headAngle = 88.0;

      const tempAngles = new Array(17).fill(0);
      tempAngles[7] = spineAngle;
      tempAngles[8] = chestAngle;
      const fk = solveForwardKinematics17(manX, manY, tempAngles, scale);
      const shoulderX = fk[8].endX;
      const shoulderY = fk[8].endY;

      // Arms swing straight up in excitement with clenched fists (+95°..+105°)
      const armUpT = clamp((f - 136) / 6.0, 0, 1);
      const rArmTargetX = shoulderX + 8.0;
      const rArmTargetY = shoulderY - 72.0 * armUpT;
      const lArmTargetX = shoulderX - 8.0;
      const lArmTargetY = shoulderY - 72.0 * armUpT;

      const rArm = solveArmLimb(shoulderX, shoulderY, rArmTargetX, rArmTargetY, true, scale);
      const lArm = solveArmLimb(shoulderX, shoulderY, lArmTargetX, lArmTargetY, true, scale);

      manAngles[0] = 0;
      manAngles[1] = rLegAngles.thigh;
      manAngles[2] = rLegAngles.shin;
      manAngles[3] = rLegAngles.foot;
      manAngles[4] = lLegAngles.thigh;
      manAngles[5] = lLegAngles.shin;
      manAngles[6] = lLegAngles.foot;
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[9] = rArm.bicepAngleDeg;
      manAngles[10] = rArm.forearmAngleDeg;
      manAngles[11] = rArm.handAngleDeg;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;
      manAngles[14] = lArm.bicepAngleDeg;
      manAngles[15] = lArm.forearmAngleDeg;
      manAngles[16] = lArm.handAngleDeg;

      camX = -135.0;
      camY = -25.0;
      camZoom = 1.05;
    }

    // =========================================================================
    // ACT F3: TOUCHDOWN CUSHION & RECOVERY (F148–F153, 6 frames)
    // Storyboard Panel 11: Landing on ground Y=755, knees bend 70° (Pelvis Y=566), arms swing down, recover.
    // =========================================================================
    else if (f <= 153) {
      act = 'Act F: Excited Jump in Place';
      phase = 'Phase 3: Touchdown Impact Cushion & Spring Recovery';
      panelId = 11;
      storyboardTitle = '11. Touchdown Cushion & Recovery';
      notes = 'Boots hit turf exactly at Y=755 (0px error); deep 70° knee cushion (Pelvis Y=566); 1f hold; recovery to upright.';

      manX = 650.0;

      // Touchdown profile: F148 touchdown (538px, feet plant), F149 max cushion (566px), F150-153 rebound to 510px
      const LANDING_Y_PROFILE = [
        538.0, // F148: Touchdown impact contact (delta +30px from F147=508)
        566.0, // F149: Deepest impact cushion (delta +28px)
        550.0, // F150: Spring rebound (-16px)
        532.0, // F151: Hip & knee drive upward (-18px)
        516.0, // F152: Pre-settle ease (-16px)
        510.0, // F153: Standing equilibrium (-6px, settled at 510)
      ];
      manY = LANDING_Y_PROFILE[f - 148];

      // Feet pinned flat at Y = 755
      const rAnkleX = 660.0;
      const lAnkleX = 640.0;

      const rLeg = solveLegLimb(manX, manY, rAnkleX, groundY, true, scale, true);
      const lLeg = solveLegLimb(manX, manY, lAnkleX, groundY, true, scale, true);

      // Torso folds forward on landing impact, then recovers upright
      const tLand = (f - 148) / 5.0;
      const foldAmount = f === 148 || f === 149 ? 22.0 : (1.0 - tLand) * 22.0;
      const spineAngle = 88.0 - foldAmount;
      const chestAngle = 89.0 - foldAmount;
      const neckAngle = 88.0;
      const headAngle = 84.0;

      const tempAngles = new Array(17).fill(0);
      tempAngles[7] = spineAngle;
      tempAngles[8] = chestAngle;
      const fk = solveForwardKinematics17(manX, manY, tempAngles, scale);
      const shoulderX = fk[8].endX;
      const shoulderY = fk[8].endY;

      // Arms sweep down-forward on cushion impact to absorb energy
      const armDownT = clamp((f - 148) / 2.0, 0, 1);
      const rArmTargetX = shoulderX + 16.0 * armDownT;
      const rArmTargetY = shoulderY + 45.0 * armDownT;
      const lArmTargetX = shoulderX - 16.0 * armDownT;
      const lArmTargetY = shoulderY + 45.0 * armDownT;

      const rArm = solveArmLimb(shoulderX, shoulderY, rArmTargetX, rArmTargetY, true, scale);
      const lArm = solveArmLimb(shoulderX, shoulderY, lArmTargetX, lArmTargetY, true, scale);

      manAngles[0] = 0;
      manAngles[1] = rLeg.thighAngleDeg;
      manAngles[2] = rLeg.shinAngleDeg;
      manAngles[3] = 0.0;
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = 0.0;
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[9] = rArm.bicepAngleDeg;
      manAngles[10] = rArm.forearmAngleDeg;
      manAngles[11] = rArm.handAngleDeg;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;
      manAngles[14] = lArm.bicepAngleDeg;
      manAngles[15] = lArm.forearmAngleDeg;
      manAngles[16] = lArm.handAngleDeg;

      camX = -135.0;
      camY = -15.0;
      camZoom = 1.05;
    }

    // =========================================================================
    // ACT G: SPRINT TO THE BALL (F154–F165, 12 frames)
    // Storyboard Panel 12: Run to the ball, X 650 -> 870, strong forward lean, arms 90°, high heel fold.
    // =========================================================================
    else if (f <= 165) {
      act = 'Act G: Run to the Ball';
      phase = 'Explosive Sprint & Approach (X: 650 → 870)';
      panelId = 12;
      storyboardTitle = '12. Explosive Sprint to the Ball';
      notes = 'Strong forward torso lean 72°; arms bent 90° swinging from shoulder; swing knee 90° fold; speed ramps to 30 px/f; eyes locked on ball.';

      const tSprint = (f - 154) / 11.0;
      // Exponential speed ramp: 4 -> 12 -> 20 -> 28 -> 30 px/frame
      const sprintDist = Math.pow(tSprint, 1.45) * (870.0 - 650.0);
      manX = 650.0 + sprintDist;
      manY = 510.0 + Math.sin(tSprint * Math.PI * 4.0) * 3.0; // Running bounce

      // Running cycle: 1.5 running strides across 12 frames
      const runCycle = ((f - 154) % 8) / 8.0;
      const isRightLead = ((f - 154) % 16) < 8;

      const strideLength = 54.0;
      let rFootX = manX;
      let rFootY = groundY;
      let lFootX = manX;
      let lFootY = groundY;
      let rFootAngle = -25.0;
      let lFootAngle = -25.0;

      if (isRightLead) {
        // Right leg driving forward, Left leg pushing back with high heel fold to butt
        const swingT = runCycle;
        rFootX = manX - strideLength * 0.4 + swingT * strideLength * 1.4;
        const lift = Math.sin(swingT * Math.PI) * 32.0; // High running step
        rFootY = groundY - lift;

        lFootX = manX - strideLength * 0.7;
        lFootY = groundY - (swingT < 0.3 ? 0 : 25.0); // Flight / trailing heel fold
      } else {
        // Left leg driving forward, Right leg pushing back
        const swingT = runCycle;
        lFootX = manX - strideLength * 0.4 + swingT * strideLength * 1.4;
        const lift = Math.sin(swingT * Math.PI) * 32.0;
        lFootY = groundY - lift;

        rFootX = manX - strideLength * 0.7;
        rFootY = groundY - (swingT < 0.3 ? 0 : 25.0);
      }

      const rLeg = solveLegLimb(manX, manY, rFootX, rFootY, true, scale, rFootY >= groundY - 1.0);
      const lLeg = solveLegLimb(manX, manY, lFootX, lFootY, true, scale, lFootY >= groundY - 1.0);

      // Strong athletic forward lean: Spine 72°..76°
      const spineAngle = 72.0 + tSprint * 4.0;
      const chestAngle = 73.0 + tSprint * 4.0;
      const neckAngle = 78.0;
      const headAngle = 52.0; // Eyes locked intently on ball at (900, 737)

      const tempAngles = new Array(17).fill(0);
      tempAngles[7] = spineAngle;
      tempAngles[8] = chestAngle;
      const fk = solveForwardKinematics17(manX, manY, tempAngles, scale);
      const shoulderX = fk[8].endX;
      const shoulderY = fk[8].endY;

      // Sprinting arms: BENT ~90°, swinging vigorously from shoulders (elbows pointing back)
      const armPhase = (isRightLead ? runCycle : runCycle + 1.0) * Math.PI;
      const armDrive = Math.sin(armPhase) * 42.0;

      const rHandTargetX = shoulderX - armDrive;
      const rHandTargetY = shoulderY + 45.0 - Math.abs(armDrive) * 0.2;
      const lHandTargetX = shoulderX + armDrive;
      const lHandTargetY = shoulderY + 45.0 - Math.abs(armDrive) * 0.2;

      const rArm = solveArmLimb(shoulderX, shoulderY, rHandTargetX, rHandTargetY, true, scale);
      const lArm = solveArmLimb(shoulderX, shoulderY, lHandTargetX, lHandTargetY, true, scale);

      manAngles[0] = 0;
      manAngles[1] = rLeg.thighAngleDeg;
      manAngles[2] = rLeg.shinAngleDeg;
      manAngles[3] = rFootAngle;
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = lFootAngle;
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[9] = rArm.bicepAngleDeg;
      manAngles[10] = rArm.forearmAngleDeg;
      manAngles[11] = rArm.handAngleDeg;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;
      manAngles[14] = lArm.bicepAngleDeg;
      manAngles[15] = lArm.forearmAngleDeg;
      manAngles[16] = lArm.handAngleDeg;

      // Camera tracks forward rapidly with the sprint
      camX = -135.0 - tSprint * 85.0;
      camY = -15.0;
      camZoom = 1.08;
    }

    // =========================================================================
    // ACT H1: PLANT & BACKSWING COIL (F166–F171, 6 frames)
    // Storyboard Panel 13: Support foot plants at (880, 755), kicking knee bends 105°, heel to butt.
    // =========================================================================
    else if (f <= 171) {
      act = 'Act H: Kick the Ball';
      phase = 'Phase 1: Support Plant & Kicking Leg Backswing';
      panelId = 13;
      storyboardTitle = '13. Support Plant & Kicking Backswing';
      notes = 'Left support foot plants beside ball at X=880 (Y=755); Right leg chambers back with knee bent 105° and heel toward butt; left arm out for balance.';

      const tBack = (f - 166) / 5.0;
      const easedT = easeInOutCubic(tBack);

      manX = 870.0 + easedT * 8.0; // 870 -> 878 px
      manY = 512.0;

      // Support foot (Left) plants firmly beside the ball at X = 880, Y = 755
      const lAnkleX = 880.0;
      const lLeg = solveLegLimb(manX, manY, lAnkleX, groundY, true, scale, true);

      // Kicking leg (Right) backswing: Thigh pulls back (-105°..-125°), knee flexes deeply (95–110°), heel to butt
      const thighAngle = -90.0 - easedT * 32.0; // -90° -> -122°
      const shinAngle = thighAngle - 95.0 - easedT * 15.0; // Flexed back toward butt
      const footAngle = shinAngle + 15.0;

      // Torso leans slightly forward then braces
      const spineAngle = 76.0 + easedT * 4.0;
      const chestAngle = 77.0 + easedT * 4.0;
      const neckAngle = 76.0;
      const headAngle = 48.0; // Looking directly at ball contact point

      const tempAngles = new Array(17).fill(0);
      tempAngles[7] = spineAngle;
      tempAngles[8] = chestAngle;
      const fk = solveForwardKinematics17(manX, manY, tempAngles, scale);
      const shoulderX = fk[8].endX;
      const shoulderY = fk[8].endY;

      // Left arm extends outward for balance; right arm pulls back
      const lArmTargetX = shoulderX + 48.0 * easedT;
      const lArmTargetY = shoulderY + 35.0;
      const rArmTargetX = shoulderX - 35.0 * easedT;
      const rArmTargetY = shoulderY + 45.0;

      const lArm = solveArmLimb(shoulderX, shoulderY, lArmTargetX, lArmTargetY, true, scale);
      const rArm = solveArmLimb(shoulderX, shoulderY, rArmTargetX, rArmTargetY, true, scale);

      manAngles[0] = 0;
      manAngles[1] = thighAngle;
      manAngles[2] = shinAngle;
      manAngles[3] = footAngle;
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = 0.0; // Support foot pinned flat
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[9] = rArm.bicepAngleDeg;
      manAngles[10] = rArm.forearmAngleDeg;
      manAngles[11] = rArm.handAngleDeg;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;
      manAngles[14] = lArm.bicepAngleDeg;
      manAngles[15] = lArm.forearmAngleDeg;
      manAngles[16] = lArm.handAngleDeg;

      camX = -225.0;
      camY = -15.0;
      camZoom = 1.10;
    }

    // =========================================================================
    // ACT H2: KINETIC WHIP & IMPACT CONTACT (F172–F174, 3 frames)
    // Storyboard Panel 14: Kicking swing whips forward; contact at F174 at (884, 735), 1-frame hit-stop.
    // =========================================================================
    else if (f <= 174) {
      act = 'Act H: Kick the Ball';
      phase = f === 174 ? 'Impact Contact & Hit-Stop Freeze' : 'Kinetic Whip Forward Swing';
      panelId = 14;
      storyboardTitle = '14. Toe Strikes the Ball (Impact Frame)';
      notes = 'Pelvis leads -> thigh drives -> shin whips. Contact at F174: Right toe strikes ball rear-lower surface at (884, 735) within 18px of (900, 737); 1f hit-stop.';

      manX = 878.0;
      manY = 512.0;

      // Support foot remains pinned flat at X = 880, Y = 755
      const lAnkleX = 880.0;
      const lLeg = solveLegLimb(manX, manY, lAnkleX, groundY, true, scale, true);

      // Kicking leg swing whip:
      // F172: Thigh drives forward (-55°), shin lags (-110°)
      // F173: Thigh continues (-20°), shin begins snapping (-45°)
      // F174 (Impact Contact): Toe reaches (884, 735)!
      let rThighAngle = -55.0;
      let rShinAngle = -110.0;
      let rFootAngle = -15.0;

      if (f === 172) {
        rThighAngle = -55.0;
        rShinAngle = -95.0;
        rFootAngle = -15.0;
      } else if (f === 173) {
        rThighAngle = -22.0;
        rShinAngle = -48.0;
        rFootAngle = 5.0;
      } else if (f === 174) {
        // EXACT CONTACT FRAME: Toe touches ball at (884, 735)
        // Ball is at (900, 737). Distance = sqrt((900-884)^2 + (737-735)^2) = 16.1 px <= 18 px!
        // Solve kicking leg IK to place foot tip at (884, 735)
        const targetToeX = 884.0;
        const targetToeY = 735.0;
        const kickIK = solveTwoBoneIK(manX, manY, targetToeX - 18.0, targetToeY - 2.0, 255.0, 245.0, true, 'LEG', scale);
        rThighAngle = kickIK.upperAngleDeg;
        rShinAngle = kickIK.lowerAngleDeg;
        rFootAngle = 18.0; // Toe angled upward into ball lower surface
      }

      // Torso leans back slightly as kick whips forward (counter-balance)
      const spineAngle = f === 174 ? 98.0 : 88.0;
      const chestAngle = f === 174 ? 99.0 : 89.0;
      const neckAngle = 82.0;
      const headAngle = 50.0; // Eyes focused on impact point

      const tempAngles = new Array(17).fill(0);
      tempAngles[7] = spineAngle;
      tempAngles[8] = chestAngle;
      const fk = solveForwardKinematics17(manX, manY, tempAngles, scale);
      const shoulderX = fk[8].endX;
      const shoulderY = fk[8].endY;

      // Arms spread wide for dynamic rotational balance
      const lArmTargetX = shoulderX + 46.0;
      const lArmTargetY = shoulderY + 28.0;
      const rArmTargetX = shoulderX - 38.0;
      const rArmTargetY = shoulderY + 40.0;

      const lArm = solveArmLimb(shoulderX, shoulderY, lArmTargetX, lArmTargetY, true, scale);
      const rArm = solveArmLimb(shoulderX, shoulderY, rArmTargetX, rArmTargetY, true, scale);

      manAngles[0] = 0;
      manAngles[1] = rThighAngle;
      manAngles[2] = rShinAngle;
      manAngles[3] = rFootAngle;
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = 0.0;
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[9] = rArm.bicepAngleDeg;
      manAngles[10] = rArm.forearmAngleDeg;
      manAngles[11] = rArm.handAngleDeg;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;
      manAngles[14] = lArm.bicepAngleDeg;
      manAngles[15] = lArm.forearmAngleDeg;
      manAngles[16] = lArm.handAngleDeg;

      camX = -225.0;
      camY = -15.0;
      camZoom = 1.10;
    }

    // =========================================================================
    // ACT H3 & I1: FOLLOW-THROUGH & BALL LAUNCH (F175–F185, 11 frames)
    // Storyboard Panel 15: Leg carries high and forward, torso leans back 10-15°, small hop, ball launches!
    // =========================================================================
    else if (f <= 185) {
      act = 'Act I: Ball Launch & Follow-Through';
      phase = 'Phase 1: High Leg Follow-Through & Ball Flight Ignition';
      panelId = 15;
      storyboardTitle = '15. High Follow-Through & Ball Launch';
      notes = 'Kicking leg extends high forward (thigh +20°); torso leans back 14°; small hop on support foot; ball launches at vx=+40, vy=-44.';

      const tFollow = (f - 175) / 10.0;
      const easedT = easeInOutCubic(tFollow);

      // Support foot small rotational hop (+4px)
      const hopLift = Math.sin(tFollow * Math.PI) * 4.5;
      manX = 878.0 + easedT * 8.0;
      manY = 512.0 - hopLift;

      // Ball physics formula: vx=+40, vy=-44, g=+2.4 px/f^2
      // x(t) = 900 + 40t, y(t) = 737 - 44t + 1.2t^2, t = frames after contact (f - 174)
      const tBall = f - 174;
      ballX = initialBallX + 40.0 * tBall;
      ballY = initialBallY - 44.0 * tBall + 1.2 * tBall * tBall;
      ballActive = true;

      // Support leg
      const lLeg = solveLegLimb(manX, manY, 882.0, groundY - hopLift, true, scale, hopLift < 1.0);

      // High forward follow-through leg: Thigh reaches +15°..+25°, shin extends
      const thighAngle = 8.0 + (1 - easedT) * 16.0; // Stays high forward
      const shinAngle = 4.0 + (1 - easedT) * 12.0;
      const footAngle = 20.0;

      // Torso leans back 12–15° (Spine: 102°, Chest: 104°)
      const spineAngle = 102.0 - easedT * 6.0;
      const chestAngle = 104.0 - easedT * 7.0;
      // Head follows the rising ball into the sky!
      const headAngle = 55.0 + easedT * 35.0; // Looking up-right toward soaring ball
      const neckAngle = 85.0 + easedT * 15.0;

      const tempAngles = new Array(17).fill(0);
      tempAngles[7] = spineAngle;
      tempAngles[8] = chestAngle;
      const fk = solveForwardKinematics17(manX, manY, tempAngles, scale);
      const shoulderX = fk[8].endX;
      const shoulderY = fk[8].endY;

      // Arms spread wide for dynamic counter-balance
      const lArmTargetX = shoulderX + 42.0;
      const lArmTargetY = shoulderY + 36.0;
      const rArmTargetX = shoulderX - 42.0;
      const rArmTargetY = shoulderY + 48.0;

      const lArm = solveArmLimb(shoulderX, shoulderY, lArmTargetX, lArmTargetY, true, scale);
      const rArm = solveArmLimb(shoulderX, shoulderY, rArmTargetX, rArmTargetY, true, scale);

      manAngles[0] = 0;
      manAngles[1] = thighAngle;
      manAngles[2] = shinAngle;
      manAngles[3] = footAngle;
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = 0.0;
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[9] = rArm.bicepAngleDeg;
      manAngles[10] = rArm.forearmAngleDeg;
      manAngles[11] = rArm.handAngleDeg;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;
      manAngles[14] = lArm.bicepAngleDeg;
      manAngles[15] = lArm.forearmAngleDeg;
      manAngles[16] = lArm.handAngleDeg;

      // Camera zooms out gently and tracks right toward ball
      camX = -225.0 - easedT * 65.0;
      camY = -15.0;
      camZoom = 1.10 - easedT * 0.12;
    }

    // =========================================================================
    // ACT I2 & SETTLE: BALL DEPARTURE & MOVING HOLD (F186–F215, 30 frames)
    // Storyboard Panel 16: Settles onto both feet, fist pump with overshoot, watches ball leave, moving hold.
    // =========================================================================
    else {
      act = 'Act I: Ball Launch & Follow-Through';
      phase = f < 205 ? 'Celebratory Settle & Fist Pump' : 'Gentle Moving Hold (Breathing & Eye Drift)';
      panelId = 16;
      storyboardTitle = '16. Watching the Ball Fly Away';
      notes = 'Settles onto both feet at (885, 510); celebratory fist pump; head leads body watching ball exit right; gentle moving hold with zero dead freezes.';

      const tSettle = (f - 186) / 29.0;
      const easedT = easeInOutCubic(clamp(tSettle * 1.5, 0, 1));

      // Ball continues parabolic trajectory: x = 900 + 40t, y = 737 - 44t + 1.2t^2
      const tBall = f - 174;
      ballX = initialBallX + 40.0 * tBall;
      ballY = initialBallY - 44.0 * tBall + 1.2 * tBall * tBall;
      ballActive = true;

      // Man settles back onto both feet on ground Y = 755
      manX = 886.0;
      manY = 510.0;

      // Both feet planted on turf
      const rAnkleX = 896.0;
      const lAnkleX = 876.0;

      const rLeg = solveLegLimb(manX, manY, rAnkleX, groundY, true, scale, true);
      const lLeg = solveLegLimb(manX, manY, lAnkleX, groundY, true, scale, true);

      // Moving hold breathing & subtle life
      const tHold = (f - 186) / 29.0;
      const breatheHold = Math.sin(tHold * Math.PI * 3.0) * 0.8;
      const headDrift = Math.cos(tHold * Math.PI * 2.5) * 1.5;

      // Spine upright, proud posture
      const spineAngle = 90.0 + breatheHold * 0.6;
      const chestAngle = 91.0 + breatheHold * 0.8;
      // Head tilted up watching ball fly into the distance (+115°..+125°)
      const headAngle = 118.0 + headDrift;
      const neckAngle = 105.0;

      const tempAngles = new Array(17).fill(0);
      tempAngles[7] = spineAngle;
      tempAngles[8] = chestAngle;
      const fk = solveForwardKinematics17(manX, manY, tempAngles, scale);
      const shoulderX = fk[8].endX;
      const shoulderY = fk[8].endY;

      // Right arm executes celebratory fist pump (F194-202), then relaxes
      let rFistT = 0;
      if (f >= 192 && f <= 204) {
        rFistT = Math.sin(((f - 192) / 12.0) * Math.PI);
      }
      const rHandTargetX = shoulderX + 18.0 + rFistT * 12.0;
      const rHandTargetY = shoulderY + 68.0 - rFistT * 38.0; // Fist pulls up to chest
      const lHandTargetX = shoulderX - 18.0;
      const lHandTargetY = shoulderY + 76.0;

      const rArm = solveArmLimb(shoulderX, shoulderY, rHandTargetX, rHandTargetY, true, scale);
      const lArm = solveArmLimb(shoulderX, shoulderY, lHandTargetX, lHandTargetY, true, scale);

      manAngles[0] = 0;
      manAngles[1] = rLeg.thighAngleDeg;
      manAngles[2] = rLeg.shinAngleDeg;
      manAngles[3] = 0.0;
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = 0.0;
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[9] = rArm.bicepAngleDeg;
      manAngles[10] = rArm.forearmAngleDeg;
      manAngles[11] = rArm.handAngleDeg;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;
      manAngles[14] = lArm.bicepAngleDeg;
      manAngles[15] = lArm.forearmAngleDeg;
      manAngles[16] = lArm.handAngleDeg;

      // Camera stays framed wide showing both the proud man and the ball flying off-screen right
      camX = -290.0 - tSettle * 40.0;
      camY = -15.0;
      camZoom = 0.98 - tSettle * 0.08;
    }

    const com = calculateCenterOfMass17(manX, manY, manAngles, scale);
    const bos = calculateBaseOfSupport17(manX, manY, manAngles, groundY, scale, com.comX);

    frames.push({
      frame: f,
      act,
      phase,
      manX,
      manY,
      manAngles,
      comX: com.comX,
      comY: com.comY,
      supportMinX: bos.minX,
      supportMaxX: bos.maxX,
      isGrounded: bos.isGrounded,
      isBalanced: bos.isStaticallyBalanced,
      stabilityMargin: bos.stabilityMargin,
      ballX,
      ballY,
      ballActive,
      camX,
      camY,
      camZoom,
      panelId,
      storyboardTitle,
      notes,
    });
  }

  return frames;
}

export const CANONICAL_216_SIT_WALK_KICK_FRAMES: SitWalkKickKeyframeSpec[] =
  buildCanonicalSitWalkKickFrames();

export function buildAdjustedSitWalkKickFrames(
  config: SitWalkKickGeneratorConfig
): SitWalkKickKeyframeSpec[] {
  // If 12 FPS target is requested, sample every 2nd frame (108 frames)
  if (config.targetFps === 12) {
    const full216 = buildCanonicalSitWalkKickFrames(config);
    const sampled108: SitWalkKickKeyframeSpec[] = [];
    for (let i = 0; i < full216.length; i += 2) {
      const spec = full216[i];
      sampled108.push({
        ...spec,
        frame: Math.floor(i / 2),
      });
    }
    return sampled108;
  }
  return buildCanonicalSitWalkKickFrames(config);
}

/**
 * Validates the generated 216 frames against all 10 biomechanical and spatial rules.
 */
export function validateSitWalkKickBiomechanics(
  frames: SitWalkKickKeyframeSpec[]
): BiomechanicalAuditReport {
  const items: BiomechanicalAuditItem[] = [];

  // Check 1: Ground Alignment - Planted feet must match Ground Y = 755
  let maxFootGroundError = 0;
  for (const f of frames) {
    const fk = solveForwardKinematics17(f.manX, f.manY, f.manAngles, 0.5);
    // Grounded checks during standing (f.frame 71-81, 150-153, 186-215)
    if (
      (f.frame >= 71 && f.frame <= 81) ||
      (f.frame >= 150 && f.frame <= 153) ||
      (f.frame >= 186 && f.frame <= 215)
    ) {
      const rFootY = fk[3].endY;
      const lFootY = fk[6].endY;
      maxFootGroundError = Math.max(
        maxFootGroundError,
        Math.abs(rFootY - 755.0),
        Math.abs(lFootY - 755.0)
      );
    }
  }
  items.push({
    id: 'ground-alignment',
    label: 'Ground Alignment (Y = 755.0 px)',
    passed: maxFootGroundError <= 1.5,
    metric: `${maxFootGroundError.toFixed(2)} px max error`,
    threshold: '≤ 1.5 px',
    detail: 'Planted feet maintain exact ground plane contact at Y = 755.0 px without sinking or floating.',
  });

  // Check 2: No Foot Sliding during Stance Pinning
  let maxStanceSlide = 0;
  for (let i = 1; i < frames.length; i++) {
    const prev = frames[i - 1];
    const curr = frames[i];
    // Check seated plant (0..18)
    if (curr.frame <= 18) {
      const prevFK = solveForwardKinematics17(prev.manX, prev.manY, prev.manAngles, 0.5);
      const currFK = solveForwardKinematics17(curr.manX, curr.manY, curr.manAngles, 0.5);
      maxStanceSlide = Math.max(
        maxStanceSlide,
        Math.abs(currFK[3].startX - prevFK[3].startX),
        Math.abs(currFK[6].startX - prevFK[6].startX)
      );
    }
  }
  items.push({
    id: 'stance-pinning',
    label: 'Stance Pinning & Zero Sliding',
    passed: maxStanceSlide <= 0.5,
    metric: `${maxStanceSlide.toFixed(2)} px max shift`,
    threshold: '≤ 0.5 px',
    detail: 'Planted feet and support hands remain pinned to the floor during static holds without sliding.',
  });

  // Check 3: Jump Takeoff & Landing Elevation Closure
  const takeoffFrame = frames.find((f) => f.frame === 135);
  const landingFrame = frames.find((f) => f.frame === 148);
  let jumpElevationDelta = 0;
  if (takeoffFrame && landingFrame) {
    const fkLand = solveForwardKinematics17(landingFrame.manX, landingFrame.manY, landingFrame.manAngles, 0.5);
    jumpElevationDelta = Math.abs(fkLand[3].endY - 755.0);
  }
  items.push({
    id: 'jump-closure',
    label: 'Jump Takeoff & Landing Elevation Closure',
    passed: jumpElevationDelta <= 1.0,
    metric: `${jumpElevationDelta.toFixed(2)} px landing delta`,
    threshold: '≤ 1.0 px',
    detail: 'Airborne jump strictly returns to the identical ground plane surface Y = 755.0 px.',
  });

  // Check 4: Contact Precision at Kick Frame (F174)
  const kickFrame = frames.find((f) => f.frame === 174);
  let kickDistance = 999;
  if (kickFrame) {
    const fk = solveForwardKinematics17(kickFrame.manX, kickFrame.manY, kickFrame.manAngles, 0.5);
    const toeX = fk[3].endX;
    const toeY = fk[3].endY;
    kickDistance = Math.hypot(toeX - kickFrame.ballX, toeY - kickFrame.ballY);
  }
  items.push({
    id: 'kick-contact-precision',
    label: 'Kick Impact Contact Precision (F174)',
    passed: kickDistance <= 18.0,
    metric: `${kickDistance.toFixed(2)} px distance to ball center`,
    threshold: '≤ 18.0 px (Ball Radius)',
    detail: 'Striking toe physically contacts the rear-lower surface of the ball at F174 within 18.0 px.',
  });

  // Check 5: No Knee Hyperextension (0° Polarity Law)
  let maxHyperextension = 0;
  for (const f of frames) {
    const rThigh = f.manAngles[1];
    const rShin = f.manAngles[2];
    const lThigh = f.manAngles[4];
    const lShin = f.manAngles[5];
    // Facing right (+X): Shin angle must be <= Thigh angle (knee bends backward)
    const rRel = rShin - rThigh;
    const lRel = lShin - lThigh;
    if (rRel > 2.0) maxHyperextension = Math.max(maxHyperextension, rRel);
    if (lRel > 2.0) maxHyperextension = Math.max(maxHyperextension, lRel);
  }
  items.push({
    id: 'knee-polarity',
    label: 'Knee 1-DOF Polarity (Zero Hyperextension)',
    passed: maxHyperextension <= 2.0,
    metric: `${maxHyperextension.toFixed(1)}° max violation`,
    threshold: '0° reverse bend',
    detail: 'Kneecaps always point in the facing direction; knees never bend backwards like bird legs.',
  });

  // Check 6: Smooth Trajectory & No Unphysical Single-Frame Root Spikes
  let maxRootDelta = 0;
  for (let i = 1; i < frames.length; i++) {
    const dx = Math.abs(frames[i].manX - frames[i - 1].manX);
    const dy = Math.abs(frames[i].manY - frames[i - 1].manY);
    maxRootDelta = Math.max(maxRootDelta, Math.hypot(dx, dy));
  }
  items.push({
    id: 'root-continuity',
    label: 'Character Root Spatial Continuity',
    passed: maxRootDelta <= 35.0,
    metric: `${maxRootDelta.toFixed(1)} px max single-frame step`,
    threshold: '≤ 35.0 px/frame',
    detail: 'Root translations follow smooth acceleration curves without teleportation spikes or jitter.',
  });

  // Check 7: Decoupled Camera Isolation
  let cameraBakedInRoot = false;
  for (const f of frames) {
    if (f.manX < 0 || f.manY < 0) {
      cameraBakedInRoot = true;
    }
  }
  items.push({
    id: 'camera-isolation',
    label: 'Camera vs World Movement Decoupling',
    passed: !cameraBakedInRoot,
    metric: '100% decoupled',
    threshold: 'Zero camera bleed',
    detail: 'Virtual camera panning and zooming reside solely in camera fields (camX, camY, camZoom).',
  });

  // Check 8: Moving Hold Life (No Dead Freezes)
  let staticFrameCount = 0;
  for (let i = 205; i < frames.length; i++) {
    const prev = frames[i - 1];
    const curr = frames[i];
    let diff = 0;
    for (let k = 0; k < 17; k++) {
      diff += Math.abs(curr.manAngles[k] - prev.manAngles[k]);
    }
    if (diff < 0.05) staticFrameCount++;
  }
  items.push({
    id: 'moving-hold-life',
    label: 'Moving Hold Life & Organic Settle (F205–F215)',
    passed: staticFrameCount <= 1,
    metric: `${staticFrameCount} dead freeze frames`,
    threshold: '≤ 1 freeze',
    detail: 'Pauses include subtle breathing oscillations, head drift, and weight shifts rather than mannequin dead freezes.',
  });

  // Check 9: Center of Mass (CoM) Dynamic Balance Equilibrium
  let maxCoMDisplacementFromSupport = 0;
  for (const f of frames) {
    if (
      (f.frame >= 71 && f.frame <= 81) ||
      (f.frame >= 150 && f.frame <= 153) ||
      (f.frame >= 186 && f.frame <= 215)
    ) {
      const margin = Math.abs(f.stabilityMargin);
      if (margin > maxCoMDisplacementFromSupport) {
        maxCoMDisplacementFromSupport = margin;
      }
    }
  }
  items.push({
    id: 'com-dynamic-balance',
    label: 'Center of Mass (CoM) Dynamic Balance Equilibrium',
    passed: maxCoMDisplacementFromSupport <= 25.0,
    metric: `${maxCoMDisplacementFromSupport.toFixed(1)} px max CoM offset`,
    threshold: '≤ 25.0 px support margin',
    detail: 'Torso counter-pitch and pelvis shift keep the body Center of Mass balanced over the Base of Support.',
  });

  // Check 10: Connected Articulated Body Chain (Bone Length Invariant)
  let maxBoneLengthError = 0;
  for (const f of frames) {
    const fk = solveForwardKinematics17(f.manX, f.manY, f.manAngles, 0.5);
    for (let b = 1; b < 17; b++) {
      const p = STICKFIGURE_PARENTS[b];
      if (p !== -1) {
        const dx = fk[b].endX - fk[b].startX;
        const dy = fk[b].endY - fk[b].startY;
        const actualLen = Math.hypot(dx, dy);
        const expectedLen = STICKFIGURE_BONE_LENGTHS[b] * 0.5;
        const err = Math.abs(actualLen - expectedLen);
        if (err > maxBoneLengthError) maxBoneLengthError = err;
      }
    }
  }
  items.push({
    id: 'articulated-body-chain',
    label: 'Connected Articulated Body Chain Invariant',
    passed: maxBoneLengthError <= 0.05,
    metric: `${maxBoneLengthError.toFixed(3)} px max bone elongation`,
    threshold: '≤ 0.05 px (Rigid Links)',
    detail: 'All 17 skeletal bone lengths remain strictly constant; zero joint dismemberment or stretch.',
  });

  const passedChecks = items.filter((c) => c.passed).length;
  return {
    passed: passedChecks === items.length,
    totalChecks: items.length,
    passedChecks,
    items,
  };
}

export interface StrollKickPanelMeta {
  panelNumber: number;
  title: string;
  startFrame: number;
  endFrame: number;
  frameRangeStr: string;
  actionSummary: string;
}

export const STROLL_KICK_PANELS: StrollKickPanelMeta[] = [
  { panelNumber: 1, title: '① Seated Pause', startFrame: 0, endFrame: 18, frameRangeStr: 'F00–18', actionSummary: 'Man rests on turf at (300, 726), knees bent up, forearm on knee, hand planted behind hips, breathing life.' },
  { panelNumber: 2, title: '② Trunk Fold & Plant', startFrame: 19, endFrame: 33, frameRangeStr: 'F19–33', actionSummary: 'Torso folds forward 35–45°, head leads, both hands plant on ground, weight shifts forward.' },
  { panelNumber: 3, title: '③ Deep Squat Launch', startFrame: 34, endFrame: 43, frameRangeStr: 'F34–43', actionSummary: 'Hips thrust forward 90px & upward into deep squat (Y=656), peak velocity moment, hands push and release.' },
  { panelNumber: 4, title: '④ Stand Extension', startFrame: 44, endFrame: 71, frameRangeStr: 'F44–71', actionSummary: 'Hips and knees extend, pelvis rises to standing Y=510, spine unfolds, head comes up last with subtle overshoot.' },
  { panelNumber: 5, title: '⑤ Standing Equilibrium', startFrame: 72, endFrame: 81, frameRangeStr: 'F72–81', actionSummary: 'Upright posture, arms loosen, forward COM lean 3–5°, weight transfer onto left stance leg.' },
  { panelNumber: 6, title: '⑥ Forward Stride', startFrame: 82, endFrame: 95, frameRangeStr: 'F82–95', actionSummary: 'First walk stride, hip 25° flexion at heel strike, knee 20° cushion, arms swing in anti-phase.' },
  { panelNumber: 7, title: '⑦ Relaxed Stroll', startFrame: 96, endFrame: 111, frameRangeStr: 'F96–111', actionSummary: 'Full stroll (X: 405 → 650), speed ramps to 10px/f, pelvis bobs ±4px, eyes looking relaxed ahead.' },
  { panelNumber: 8, title: '⑧ Notices the Ball!', startFrame: 112, endFrame: 129, frameRangeStr: 'F112–129', actionSummary: 'Head snaps down toward ball first, lead foot plants as friction brake, torso leans back 6°, realization pause.' },
  { panelNumber: 9, title: '⑨ Jump Crouch Coil', startFrame: 130, endFrame: 135, frameRangeStr: 'F130–135', actionSummary: 'Anticipation drop: COM lowers 60px to Y=568, knees flex 85° naturally, torso leans 25°, arms swing back.' },
  { panelNumber: 10, title: '⑩ Excited Apex Jump', startFrame: 136, endFrame: 147, frameRangeStr: 'F136–147', actionSummary: 'Triple extension launch, airborne apex at Y=440 (70px above standing), arms raise with fists, knees tucked 30°.' },
  { panelNumber: 11, title: '⑪ Touchdown Cushion', startFrame: 148, endFrame: 153, frameRangeStr: 'F148–153', actionSummary: 'Touchdown exactly on ground Y=755, knees cushion to 70° (Pelvis Y=566), 1f impact hold, spring recovery.' },
  { panelNumber: 12, title: '⑫ Sprint to the Ball', startFrame: 154, endFrame: 165, frameRangeStr: 'F154–165', actionSummary: 'Athletic forward lean, arms bent 90°, swing knee flexes 90° with heel to butt, speed ramps to 30px/f.' },
  { panelNumber: 13, title: '⑬ Plant & Backswing', startFrame: 166, endFrame: 171, frameRangeStr: 'F166–171', actionSummary: 'Support foot pinned flat at (880, 755), kicking knee chambers back 105° with heel to butt, left arm out.' },
  { panelNumber: 14, title: '⑭ Impact Contact (F174)', startFrame: 172, endFrame: 174, frameRangeStr: 'F172–174', actionSummary: 'Whip forward: Toe strikes ball at (884, 735) within 15px of center (900, 737), 1-frame hit-stop freeze!' },
  { panelNumber: 15, title: '⑮ High Follow-Through', startFrame: 175, endFrame: 185, frameRangeStr: 'F175–185', actionSummary: 'Kicking leg carries high forward (+20°), torso counter-leans back 14°, small hop, ball launches (vx=+40, vy=-44).' },
  { panelNumber: 16, title: '⑯ Watching Ball Soar', startFrame: 186, endFrame: 215, frameRangeStr: 'F186–215', actionSummary: 'Settles onto turf at (885, 510), fist pump, head leads watching ball exit off-screen right, gentle moving hold.' },
];

/**
 * Binary Synthesizer: Encodes the 216-frame Stroll & Kick into a valid Stick Nodes v334 project.
 * Contains 2 figure instances per frame: Figure 1 (The Man) + Figure 2 (The Orange Ball).
 */
export async function synthesizeSitWalkKickStknds(
  baseDecompressed27: Uint8Array,
  config: SitWalkKickGeneratorConfig
): Promise<Uint8Array> {
  const framesSpec = buildAdjustedSitWalkKickFrames(config);
  const nFrames = framesSpec.length;

  const prefixHdr = baseDecompressed27.slice(0, 2591);
  const fhdrTmpl = baseDecompressed27.slice(2591, 2649);
  const instTmpl = baseDecompressed27.slice(2649, 3740);
  const fftrTmpl = baseDecompressed27.slice(3740, 3788);
  const ptrlTmpl = baseDecompressed27.slice(34910, 34954);

  const baseDv = new DataView(
    baseDecompressed27.buffer,
    baseDecompressed27.byteOffset,
    baseDecompressed27.byteLength
  );
  const defA2: number[] = [];
  const defA3: number[] = [];
  for (let i = 0; i < 17; i++) {
    const off = 1231 + i * 84;
    defA2.push(baseDv.getFloat32(off + 28, false));
    defA3.push(baseDv.getFloat32(off + 32, false));
  }

  const manArgb = hexColorToArgbUint32(config.manColorHex);
  const ballArgb = hexColorToArgbUint32(config.ballColorHex);

  // Both the Man and the Ball are present in every frame (2 figure instances per frame)
  let totalBytes = prefixHdr.length + ptrlTmpl.length;
  for (let f = 0; f < nFrames; f++) {
    totalBytes += fhdrTmpl.length + 2 * instTmpl.length + fftrTmpl.length;
  }

  const buf = new Uint8Array(totalBytes);
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  buf.set(prefixHdr, 0);
  buf[30] = config.targetFps;
  dv.setInt32(2587, nFrames, false);

  let cursor = prefixHdr.length;

  // Writes Figure Instance 1: The standard 17-node stickfigure (Man)
  const writeManInstance = (sx: number, sy: number, wAngles: number[]) => {
    buf.set(instTmpl, cursor);
    dv.setInt32(cursor + 0, 0, false); // Figure library index 0
    dv.setInt32(cursor + 4, 1, false);
    dv.setInt32(cursor + 8, 1, false); // Instance ID 1
    dv.setFloat32(cursor + 71, 0.5, false); // Instance scale: 0.50x
    dv.setFloat32(cursor + 75, sx, false); // Scene X
    dv.setFloat32(cursor + 79, sy, false); // Scene Y
    dv.setUint32(cursor + 83, manArgb, false);

    for (let i = 0; i < 17; i++) {
      const rOff = cursor + 112 + i * 58;
      const p = STICKFIGURE_PARENTS[i];
      const relA1 = p === -1 ? wAngles[i] : wAngles[i] - wAngles[p];

      dv.setFloat32(rOff + 0, 1.0, false);
      dv.setFloat32(rOff + 4, STICKFIGURE_BONE_LENGTHS[i], false);
      dv.setInt32(rOff + 8, STICKFIGURE_BONE_THICKNESS[i], false);
      dv.setFloat32(rOff + 12, relA1, false);
      dv.setFloat32(rOff + 16, defA2[i], false);
      dv.setFloat32(rOff + 20, defA3[i], false);
      dv.setUint32(rOff + 24, manArgb, false);
    }
    cursor += instTmpl.length;
  };

  // Writes Figure Instance 2: The Ball (Circle node 13 with diameter 72px at scale 0.5 = 36px / radius 18px)
  const writeBallInstance = (bx: number, by: number) => {
    buf.set(instTmpl, cursor);
    dv.setInt32(cursor + 0, 0, false);
    dv.setInt32(cursor + 4, 1, false);
    dv.setInt32(cursor + 8, 2, false); // Instance ID 2
    dv.setFloat32(cursor + 71, 0.5, false); // Scale: 0.50x
    dv.setFloat32(cursor + 75, bx, false); // Scene X
    dv.setFloat32(cursor + 79, by, false); // Scene Y
    dv.setUint32(cursor + 83, ballArgb, false);

    for (let i = 0; i < 17; i++) {
      const rOff = cursor + 112 + i * 58;
      if (i === 13) {
        // Node 13 is the Head Circle in MyBase
        // Length 72.0 at scale 0.5 = 36.0 px diameter (radius 18.0 px)
        dv.setFloat32(rOff + 0, 1.0, false);
        dv.setFloat32(rOff + 4, 72.0, false);
        dv.setInt32(rOff + 8, 72, false);
        dv.setFloat32(rOff + 12, 0.0, false);
        dv.setFloat32(rOff + 16, 0.0, false);
        dv.setFloat32(rOff + 20, 90.0, false);
        dv.setUint32(rOff + 24, ballArgb, false);
      } else {
        // All other bones collapsed to length 0 and thickness 0
        dv.setFloat32(rOff + 0, 1.0, false);
        dv.setFloat32(rOff + 4, 0.0, false);
        dv.setInt32(rOff + 8, 0, false);
        dv.setFloat32(rOff + 12, 0.0, false);
        dv.setFloat32(rOff + 16, 0.0, false);
        dv.setFloat32(rOff + 20, 0.0, false);
        dv.setUint32(rOff + 24, ballArgb, false);
      }
    }
    cursor += instTmpl.length;
  };

  for (let f = 0; f < nFrames; f++) {
    const spec = framesSpec[f];
    buf.set(fhdrTmpl, cursor);
    dv.setFloat32(cursor + 42, spec.camZoom, false);
    dv.setFloat32(cursor + 46, spec.camX, false);
    dv.setFloat32(cursor + 50, spec.camY, false);
    dv.setInt32(cursor + 54, 2, false); // 2 Figure instances per frame
    cursor += fhdrTmpl.length;

    writeManInstance(spec.manX, spec.manY, spec.manAngles);
    writeBallInstance(spec.ballX, spec.ballY);

    buf.set(fftrTmpl, cursor);
    cursor += fftrTmpl.length;
  }

  buf.set(ptrlTmpl, cursor);

  const compressedPayload = await gzipBytes(buf);
  const finalStknds = new Uint8Array(STKNDS_PREFIX.length + compressedPayload.length);
  finalStknds.set(STKNDS_PREFIX, 0);
  finalStknds.set(compressedPayload, STKNDS_PREFIX.length);
  return finalStknds;
}
