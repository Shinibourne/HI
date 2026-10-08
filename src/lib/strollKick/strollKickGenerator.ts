import { SitWalkKickKeyframeSpec, SitWalkKickGeneratorConfig } from './strollKickTypes';
import { clampShoulderToHandTarget, setArm, computeFullArmAnglesForFrame } from './strollKickArmIK';
import { solveTwoBoneIK, solveLegLimb, solveArmLimb, solveForwardKinematics17 } from '../skills/kinematicsSolvers';
import { calculateCenterOfMass17 } from '../skills/biomechanicalPhysics';
import {
  calculateBaseOfSupport17,
  computeProceduralBalanceOffset,
  solveStancePinningIK,
  quinticSmoothstep,
  computeProceduralMotionArc,
  solveTargetDirectedStrikeIK,
  computeDampedOscillation,
} from '../proceduralKinematics';
import {
  solveReactiveSpineAndChest,
  solveMomentumDrivenArmSwing,
  solveReactiveVestibularHead,
  solveFullBodyKickChamber,
  solveFullBodyKickStrike,
  solveFullBodyKickFollowThrough,
} from '../fullBodyReactiveMotion';

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

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
      const clampedLHand = clampShoulderToHandTarget(shoulderX, shoulderY, lHandTargetX, lHandTargetY);
      const lArm = solveArmLimb(shoulderX, shoulderY, clampedLHand.x, clampedLHand.y, true, scale);

      // Right arm rests on right knee (rLeg.kneeX, rLeg.kneeY)
      const rHandTargetX = rLeg.kneeX - 6.0;
      const rHandTargetY = rLeg.kneeY + 4.0;
      const clampedRHand = clampShoulderToHandTarget(shoulderX, shoulderY, rHandTargetX, rHandTargetY);
      const rArm = solveArmLimb(shoulderX, shoulderY, clampedRHand.x, clampedRHand.y, true, scale);

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

      const clampedLHand = clampShoulderToHandTarget(shoulderX, shoulderY, lHandX, groundY);
      const clampedRHand = clampShoulderToHandTarget(shoulderX, shoulderY, rHandX, rHandY);

      const lArm = solveArmLimb(shoulderX, shoulderY, clampedLHand.x, clampedLHand.y, true, scale);
      const rArm = solveArmLimb(shoulderX, shoulderY, clampedRHand.x, clampedRHand.y, true, scale);

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

      manAngles[0] = 0;
      manAngles[1] = rLeg.thighAngleDeg;
      manAngles[2] = rLeg.shinAngleDeg;
      manAngles[3] = 0.0;
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = 0.0;
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;

      // Hands push off floor in first 5 frames (IK), then lift into procedural direct angles
      if (f <= 38) {
        const clampedLHand = clampShoulderToHandTarget(shoulderX, shoulderY, 276.0, groundY);
        const clampedRHand = clampShoulderToHandTarget(shoulderX, shoulderY, 368.0, groundY);
        const lArm = solveArmLimb(shoulderX, shoulderY, clampedLHand.x, clampedLHand.y, true, scale);
        const rArm = solveArmLimb(shoulderX, shoulderY, clampedRHand.x, clampedRHand.y, true, scale);

        manAngles[9] = rArm.bicepAngleDeg;
        manAngles[10] = rArm.forearmAngleDeg;
        manAngles[11] = rArm.handAngleDeg;
        manAngles[14] = lArm.bicepAngleDeg;
        manAngles[15] = lArm.forearmAngleDeg;
        manAngles[16] = lArm.handAngleDeg;
      } else {
        const armAngles = computeFullArmAnglesForFrame(f);
        setArm(manAngles, 'right', armAngles.rSwing, armAngles.rFlex, armAngles.rWrist);
        setArm(manAngles, 'left', armAngles.lSwing, armAngles.lFlex, armAngles.lWrist);
      }

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

      manAngles[0] = 0;
      manAngles[1] = rLeg.thighAngleDeg;
      manAngles[2] = rLeg.shinAngleDeg;
      manAngles[3] = 0.0;
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = 0.0;
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;

      const armAngles = computeFullArmAnglesForFrame(f);
      setArm(manAngles, 'right', armAngles.rSwing, armAngles.rFlex, armAngles.rWrist);
      setArm(manAngles, 'left', armAngles.lSwing, armAngles.lFlex, armAngles.lWrist);

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

      // Torso standing upright equilibrium before casual walk initiation
      const spineAngle = 89.6 - easedT * 0.4;
      const chestAngle = 90.0 - easedT * 0.4;
      const neckAngle = 90.0;
      const headAngle = 89.5;

      manAngles[0] = 0;
      manAngles[1] = rLeg.thighAngleDeg;
      manAngles[2] = rLeg.shinAngleDeg;
      manAngles[3] = 0.0; // Pinned flat on ground
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = 0.0; // Pinned flat on ground
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;

      const armAngles = computeFullArmAnglesForFrame(f);
      setArm(manAngles, 'right', armAngles.rSwing, armAngles.rFlex, armAngles.rWrist);
      setArm(manAngles, 'left', armAngles.lSwing, armAngles.lFlex, armAngles.lWrist);

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

      // Full-Body Reactivity 1: Pelvic-Thoracic Axial Counter-Rotation
      // Casual upright stroll: trunk has a subtle organic 0.8° forward inclination appropriate to casual walking.
      // Head, chest, and upper spine remain naturally stacked vertically over the pelvis, avoiding forward leaning.
      const spineTilt = Math.sin(gaitProgress * Math.PI * 2) * 0.8;
      const thoracicCounterTorsion = (isRightSwing ? -1.0 : 1.0) * Math.sin(gaitProgress * Math.PI) * 2.0;
      const spineAngle = 89.2 + spineTilt;
      const chestAngle = 89.6 + spineTilt * 0.3 + thoracicCounterTorsion;

      // Full-Body Reactivity 2: Vestibular-Ocular Head Horizon Stabilization
      // Head and upper spine naturally stacked upright with steady forward gaze
      const headStabilize = solveReactiveVestibularHead(chestAngle, 89.5, 0, 0.88);
      const neckAngle = headStabilize.neckAngleDeg;
      const headAngle = headStabilize.headAngleDeg;

      const tempAngles = new Array(17).fill(0);
      tempAngles[7] = spineAngle;
      tempAngles[8] = chestAngle;
      const fk = solveForwardKinematics17(manX, manY, tempAngles, scale);
      const shoulderX = fk[8].endX;
      const shoulderY = fk[8].endY;

      manAngles[0] = 0;
      manAngles[1] = rLeg.thighAngleDeg;
      manAngles[2] = rLeg.shinAngleDeg;
      manAngles[3] = rFootAngle;
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = lFootAngle;
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;

      const armAngles = computeFullArmAnglesForFrame(f);
      setArm(manAngles, 'right', armAngles.rSwing, armAngles.rFlex, armAngles.rWrist);
      setArm(manAngles, 'left', armAngles.lSwing, armAngles.lFlex, armAngles.lWrist);

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
      const headAngle = 89.5 - headSnapT * 47.5; // 89.5° -> 42° (snaps directly down-right!)

      // Torso leans back 5–8° from upright stroll (89.2°) to scrub forward momentum (Spine: 89.2° -> 96°)
      const torsoBrakeT = clamp((f - 114) / 7.0, 0, 1);
      const spineAngle = 89.2 + torsoBrakeT * 6.8;
      const chestAngle = 89.6 + torsoBrakeT * 7.4;
      const neckAngle = 90.0 - headSnapT * 28.0;

      manAngles[0] = 0;
      manAngles[1] = rLeg.thighAngleDeg;
      manAngles[2] = rLeg.shinAngleDeg;
      manAngles[3] = 0.0;
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = 0.0;
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;

      const armAngles = computeFullArmAnglesForFrame(f);
      setArm(manAngles, 'right', armAngles.rSwing, armAngles.rFlex, armAngles.rWrist);
      setArm(manAngles, 'left', armAngles.lSwing, armAngles.lFlex, armAngles.lWrist);

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

      manAngles[0] = 0;
      manAngles[1] = rLeg.thighAngleDeg;
      manAngles[2] = rLeg.shinAngleDeg;
      manAngles[3] = 0.0;
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = 0.0;
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;

      const armAngles = computeFullArmAnglesForFrame(f);
      setArm(manAngles, 'right', armAngles.rSwing, armAngles.rFlex, armAngles.rWrist);
      setArm(manAngles, 'left', armAngles.lSwing, armAngles.lFlex, armAngles.lWrist);

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

      manAngles[0] = 0;
      manAngles[1] = rLegAngles.thigh;
      manAngles[2] = rLegAngles.shin;
      manAngles[3] = rLegAngles.foot;
      manAngles[4] = lLegAngles.thigh;
      manAngles[5] = lLegAngles.shin;
      manAngles[6] = lLegAngles.foot;
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;

      const armAngles = computeFullArmAnglesForFrame(f);
      setArm(manAngles, 'right', armAngles.rSwing, armAngles.rFlex, armAngles.rWrist);
      setArm(manAngles, 'left', armAngles.lSwing, armAngles.lFlex, armAngles.lWrist);

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

      manAngles[0] = 0;
      manAngles[1] = rLeg.thighAngleDeg;
      manAngles[2] = rLeg.shinAngleDeg;
      manAngles[3] = 0.0;
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = 0.0;
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;

      const armAngles = computeFullArmAnglesForFrame(f);
      setArm(manAngles, 'right', armAngles.rSwing, armAngles.rFlex, armAngles.rWrist);
      setArm(manAngles, 'left', armAngles.lSwing, armAngles.lFlex, armAngles.lWrist);

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
      storyboardTitle = '12. Purposeful Footballer Run-Up';
      notes = 'Purposeful approach to the ball; arms act as natural running counterbalance in compact envelope (no flailing); locked gaze on ball; smooth approach into kick chamber.';

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

      // Athletic forward lean with Thoracic-Pelvic Counter-Rotation
      const sprintTorsion = Math.sin(runCycle * Math.PI * 2) * 3.5;
      const spineAngle = 72.0 + tSprint * 4.0;
      const chestAngle = 74.0 + tSprint * 4.0 + (isRightLead ? -sprintTorsion : sprintTorsion);

      const headGaze = solveReactiveVestibularHead(chestAngle, 52.0, 0, 0.88);
      const neckAngle = headGaze.neckAngleDeg;
      const headAngle = headGaze.headAngleDeg;

      const tempAngles = new Array(17).fill(0);
      tempAngles[7] = spineAngle;
      tempAngles[8] = chestAngle;
      const fk = solveForwardKinematics17(manX, manY, tempAngles, scale);
      const shoulderX = fk[8].endX;
      const shoulderY = fk[8].endY;

      manAngles[0] = 0;
      manAngles[1] = rLeg.thighAngleDeg;
      manAngles[2] = rLeg.shinAngleDeg;
      manAngles[3] = rFootAngle;
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = lFootAngle;
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;

      // Direct forward kinematics arms with 1-2 frames lag (no hand-target IK)
      const armAngles = computeFullArmAnglesForFrame(f);
      setArm(manAngles, 'right', armAngles.rSwing, armAngles.rFlex, armAngles.rWrist);
      setArm(manAngles, 'left', armAngles.lSwing, armAngles.lFlex, armAngles.lWrist);

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
      notes = 'Full-body chamber: Support knee flexes to lower COM; Kicking leg chambers back (heel to butt); Torso coils into abdominal pre-stretch; Left arm extends wide for dynamic counterbalance.';

      const tBack = (f - 166) / 5.0;
      const easedT = easeInOutCubic(tBack);

      manX = 870.0 + easedT * 8.0; // 870 -> 878 px
      manY = 512.0;

      // Coordinated full-body kick chamber:
      // Support leg, coiling leg, oblique pre-stretch torso, balancing arms, and locked gaze
      const chamber = solveFullBodyKickChamber(
        manX,
        manY,
        880.0,
        groundY,
        easedT,
        initialBallX,
        initialBallY,
        scale
      );

      manAngles[0] = 0;
      manAngles[1] = chamber.rLeg.thigh;
      manAngles[2] = chamber.rLeg.shin;
      manAngles[3] = chamber.rLeg.foot;
      manAngles[4] = chamber.lLeg.thigh;
      manAngles[5] = chamber.lLeg.shin;
      manAngles[6] = 0.0; // Support foot pinned flat at Y=755
      manAngles[7] = chamber.spineAngle;
      manAngles[8] = chamber.chestAngle;
      manAngles[12] = chamber.neckAngle;
      manAngles[13] = chamber.headAngle;

      const armAngles = computeFullArmAnglesForFrame(f);
      setArm(manAngles, 'right', armAngles.rSwing, armAngles.rFlex, armAngles.rWrist);
      setArm(manAngles, 'left', armAngles.lSwing, armAngles.lFlex, armAngles.lWrist);

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
      notes = 'Kinetic chain whip: Pelvis leads -> thigh drives -> shin whips. Impact at F174: Right toe strikes ball at (884, 735); Upper torso recoils backward 12° to balance angular momentum; Counterbalancing arms react.';

      manX = 878.0;
      manY = 512.0;

      const isContact = f === 174;
      const strikeProgress = (f - 172) / 2.0;

      // Coordinated full-body kick strike with upper-body counter-recoil
      const strike = solveFullBodyKickStrike(
        manX,
        manY,
        880.0,
        groundY,
        isContact,
        strikeProgress,
        884.0,
        735.0,
        scale
      );

      manAngles[0] = 0;
      manAngles[1] = strike.rLeg.thigh;
      manAngles[2] = strike.rLeg.shin;
      manAngles[3] = strike.rLeg.foot;
      manAngles[4] = strike.lLeg.thigh;
      manAngles[5] = strike.lLeg.shin;
      manAngles[6] = 0.0; // Pinned support foot
      manAngles[7] = strike.spineAngle;
      manAngles[8] = strike.chestAngle;
      manAngles[12] = strike.neckAngle;
      manAngles[13] = strike.headAngle;

      const armAngles = computeFullArmAnglesForFrame(f);
      setArm(manAngles, 'right', armAngles.rSwing, armAngles.rFlex, armAngles.rWrist);
      setArm(manAngles, 'left', armAngles.lSwing, armAngles.lFlex, armAngles.lWrist);

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
      notes = 'Kicking leg extends high forward (thigh +20°); torso balances extended leg; arms spread wide for dynamic aerodynamic balance; ball launches at vx=+40, vy=-44.';

      const tFollow = (f - 175) / 10.0;
      const easedT = easeInOutCubic(tFollow);

      // Support foot small rotational hop (+4px)
      const hopLift = Math.sin(tFollow * Math.PI) * 4.5;
      manX = 878.0 + easedT * 8.0;
      manY = 512.0 - hopLift;

      // Ball physics formula: vx=+40, vy=-44, g=+2.4 px/f^2
      const tBall = f - 174;
      ballX = initialBallX + 40.0 * tBall;
      ballY = initialBallY - 44.0 * tBall + 1.2 * tBall * tBall;
      ballActive = true;

      // Coordinated full-body follow-through with easing torso recoil and balancing arms
      const follow = solveFullBodyKickFollowThrough(
        manX,
        manY,
        882.0,
        groundY,
        easedT,
        hopLift,
        scale
      );

      manAngles[0] = 0;
      manAngles[1] = follow.rLeg.thigh;
      manAngles[2] = follow.rLeg.shin;
      manAngles[3] = follow.rLeg.foot;
      manAngles[4] = follow.lLeg.thigh;
      manAngles[5] = follow.lLeg.shin;
      manAngles[6] = 0.0;
      manAngles[7] = follow.spineAngle;
      manAngles[8] = follow.chestAngle;
      manAngles[12] = follow.neckAngle;
      manAngles[13] = follow.headAngle;

      const armAngles = computeFullArmAnglesForFrame(f);
      setArm(manAngles, 'right', armAngles.rSwing, armAngles.rFlex, armAngles.rWrist);
      setArm(manAngles, 'left', armAngles.lSwing, armAngles.lFlex, armAngles.lWrist);

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
      notes = 'Settles onto both feet at (885, 510); celebratory fist pump; head leads body watching ball exit right; residual momentum dissipates with damped harmonic settling.';

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

      // Damped harmonic momentum dissipation in arms and core
      const harmonicDamp = computeDampedOscillation(tSettle, 4.0, 1.8, 0.45);

      // Spine upright, proud posture reacting to fist pump
      const spineAngle = 90.0 + breatheHold * 0.6 + harmonicDamp * 0.4;
      const chestAngle = 91.0 + breatheHold * 0.8 - harmonicDamp * 0.3;
      // Head tilted up watching ball fly into the distance (+115°..+125°)
      const headAngle = 118.0 + headDrift;
      const neckAngle = 105.0;

      manAngles[0] = 0;
      manAngles[1] = rLeg.thighAngleDeg;
      manAngles[2] = rLeg.shinAngleDeg;
      manAngles[3] = 0.0;
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = 0.0;
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;

      const armAngles = computeFullArmAnglesForFrame(f);
      setArm(manAngles, 'right', armAngles.rSwing, armAngles.rFlex, armAngles.rWrist);
      setArm(manAngles, 'left', armAngles.lSwing, armAngles.lFlex, armAngles.lWrist);

      // Camera stays framed wide showing both the proud man and the ball flying off-screen right
      camX = -290.0 - tSettle * 40.0;
      camY = -15.0;
      camZoom = 0.98 - tSettle * 0.08;
    }

    // Environmental Ground Perimeter Enforcement:
    // Strictly prevent feet from penetrating below groundY (755.0 px)
    const fkPreview = solveForwardKinematics17(manX, manY, manAngles, scale);
    const rFootDeep = Math.max(fkPreview[3].startY, fkPreview[3].endY);
    const lFootDeep = Math.max(fkPreview[6].startY, fkPreview[6].endY);
    const deepestFootY = Math.max(rFootDeep, lFootDeep);
    if (deepestFootY > groundY) {
      manY -= (deepestFootY - groundY);
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
      thoracicTorsionDeg: Math.abs(manAngles[8] - manAngles[7]),
      armElbowFlexionDeg: Math.abs(manAngles[10] - manAngles[9]),
      kineticWhipRecoilDeg: Math.max(0, manAngles[7] - 90.0),
      headGazeStabilization: `${manAngles[13].toFixed(1)}° gaze`,
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
