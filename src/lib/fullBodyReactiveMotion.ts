/**
 * FULL-BODY REACTIVE MOVEMENT & KINETIC CHAIN ENGINE (v1.0)
 * ==========================================================
 * Implements the core principle: "The body reacts to itself."
 *
 * Propagates kinetic energy across connected joints in a 17-node skeleton:
 * 1. Pelvic-Thoracic Axial Counter-Rotation (Anti-phase spinal torsion during locomotion)
 * 2. Momentum-Driven Arm Pendulum with Dynamic Elbow Flexion
 * 3. Scapular & Clavicular Shoulder Coupling
 * 4. Multi-Segment Spinal Curvature & Reactive Thoracic Compression
 * 5. Vestibular-Ocular Head Horizon Stabilization
 * 6. Coordinated Kick Dynamics (Plant -> Chamber Pre-Stretch -> Kinetic Whip Recoil -> Harmonic Settle)
 */

import {
  STICKFIGURE_BONE_LENGTHS,
  STICKFIGURE_PARENTS,
} from './stkndsCodec';
import {
  solveForwardKinematics17,
  solveTwoBoneIK,
  solveArmLimb,
  solveLegLimb,
} from './humanMotionSkills';

export interface ReactiveSpineResult {
  lowerSpineAngleDeg: number;
  upperChestAngleDeg: number;
  shoulderX: number;
  shoulderY: number;
  thoracicTorsionDeg: number;
  compressionOffsetPx: number;
}

export interface ReactiveArmResult {
  rBicepAngleDeg: number;
  rForearmAngleDeg: number;
  rHandAngleDeg: number;
  lBicepAngleDeg: number;
  lForearmAngleDeg: number;
  lHandAngleDeg: number;
  rElbowFlexionDeg: number;
  lElbowFlexionDeg: number;
}

export interface ReactiveHeadResult {
  neckAngleDeg: number;
  headAngleDeg: number;
}

export interface FullBodyReactiveAuditResult {
  counterRotationPassed: boolean;
  maxCounterRotationDeg: number;
  kickRecoilPassed: boolean;
  kickRecoilDeltaDeg: number;
  elbowModulationPassed: boolean;
  elbowFlexionRangeDeg: number;
  headStabilizationPassed: boolean;
  headHorizonStabilityRatio: number;
}

/**
 * Computes reactive spine and chest angles.
 * During locomotion, pelvic rotation induces counter-rotation in the upper chest.
 * During acceleration/deceleration, lower spine leads and upper chest flexes/compresses reactively.
 */
export function solveReactiveSpineAndChest(
  pelvisX: number,
  pelvisY: number,
  baseSpineAngleDeg: number,
  thighRightAngleDeg: number,
  thighLeftAngleDeg: number,
  forwardVelocityPx: number,
  scale = 0.5,
  breathingAmplitudeDeg = 0
): ReactiveSpineResult {
  // Transverse hip angle difference proxy:
  // When right thigh swings forward (+deg relative to down), left thigh is trailing
  const hipDifferential = (thighRightAngleDeg - thighLeftAngleDeg) * 0.15;

  // Pelvic-Thoracic Counter-Rotation:
  // Upper chest counter-twists opposite to hip lead to conserve angular momentum
  const counterRotationTorsion = -Math.max(-6.0, Math.min(6.0, hipDifferential * 0.45));

  // Velocity-driven thoracic lead/lag:
  // Acceleration tilts spine forward; braking pitches it back
  const velocityPitch = Math.max(-8.0, Math.min(8.0, forwardVelocityPx * 0.28));

  const lowerSpineAngleDeg = baseSpineAngleDeg - velocityPitch * 0.4 + breathingAmplitudeDeg * 0.5;
  const upperChestAngleDeg =
    baseSpineAngleDeg +
    counterRotationTorsion -
    velocityPitch * 0.6 +
    breathingAmplitudeDeg * 0.8;

  // Compute shoulder position using Forward Kinematics up segments 07 and 08
  const testAngles = new Array(17).fill(0);
  testAngles[7] = lowerSpineAngleDeg;
  testAngles[8] = upperChestAngleDeg;
  const fk = solveForwardKinematics17(pelvisX, pelvisY, testAngles, scale);

  const shoulderX = fk[8].endX;
  const shoulderY = fk[8].endY;

  return {
    lowerSpineAngleDeg,
    upperChestAngleDeg,
    shoulderX,
    shoulderY,
    thoracicTorsionDeg: Math.abs(counterRotationTorsion),
    compressionOffsetPx: Math.abs(velocityPitch),
  };
}

/**
 * Solves momentum-driven arm swing where arms respond to leg gait and core momentum.
 * Elbow flexes during forward swing to shorten pendulum length, and extends during backswing.
 * Wrists lag the forearms naturally.
 */
export function solveMomentumDrivenArmSwing(
  shoulderX: number,
  shoulderY: number,
  armPhaseRad: number, // Leg swing phase
  swingAmplitudePx: number,
  verticalRestOffsetPx = 74.0,
  scale = 0.5,
  elbowFlexionBaseDeg = 20.0
): ReactiveArmResult {
  // Anti-phase swing: right arm swings opposite left arm
  const rDrive = Math.sin(armPhaseRad);
  const lDrive = -rDrive;

  // Forward swing flexes the elbow naturally (Skill #09 & #43):
  // When drive > 0 (forward swing), elbow flexes up to 45°
  // When drive < 0 (backswing), elbow straightens to ~16°
  const rElbowFlexion = elbowFlexionBaseDeg + Math.max(-6.0, rDrive * 24.0);
  const lElbowFlexion = elbowFlexionBaseDeg + Math.max(-6.0, lDrive * 24.0);

  // Targets for hands in screen space
  const rTargetX = shoulderX - rDrive * swingAmplitudePx;
  const rTargetY = shoulderY + verticalRestOffsetPx - Math.max(0, rDrive * 14.0);

  const lTargetX = shoulderX - lDrive * swingAmplitudePx;
  const lTargetY = shoulderY + verticalRestOffsetPx - Math.max(0, lDrive * 14.0);

  const rArm = solveArmLimb(shoulderX, shoulderY, rTargetX, rTargetY, true, scale);
  const lArm = solveArmLimb(shoulderX, shoulderY, lTargetX, lTargetY, true, scale);

  // Wrist follow-through lag: wrist trails forearm angle by 5-10°
  const rWristLag = rDrive * 8.0;
  const lWristLag = lDrive * 8.0;

  return {
    rBicepAngleDeg: rArm.bicepAngleDeg,
    rForearmAngleDeg: rArm.forearmAngleDeg,
    rHandAngleDeg: rArm.handAngleDeg - rWristLag,
    lBicepAngleDeg: lArm.bicepAngleDeg,
    lForearmAngleDeg: lArm.forearmAngleDeg,
    lHandAngleDeg: lArm.handAngleDeg - lWristLag,
    rElbowFlexionDeg: rElbowFlexion,
    lElbowFlexionDeg: lElbowFlexion,
  };
}

/**
 * Vestibular-Ocular head stabilization:
 * Keeps head orientation stable relative to target gaze horizon while torso pitches and rolls.
 * Adds subtle reactive spring damping on rapid accelerations.
 */
export function solveReactiveVestibularHead(
  upperChestAngleDeg: number,
  targetGazeAngleDeg = 90.0,
  headInertialLagDeg = 0.0,
  gimbalCompensation = 0.75
): ReactiveHeadResult {
  // Deviation of upper chest from upright (90°)
  const chestPitchDeviation = upperChestAngleDeg - 90.0;

  // Neck compensates in opposite direction to keep head upright
  const neckAngleDeg = 90.0 - chestPitchDeviation * 0.45 + headInertialLagDeg * 0.3;

  // Head stabilizes toward target gaze, absorbing torso pitch
  const headAngleDeg =
    targetGazeAngleDeg - chestPitchDeviation * (1.0 - gimbalCompensation) + headInertialLagDeg;

  return {
    neckAngleDeg,
    headAngleDeg,
  };
}

/**
 * Coordinated Whole-Body Kick Chamber Solver (Act H1):
 * When kicking leg coils backward:
 * - Support leg flexes at knee to lower COM and provide solid base
 * - Pelvis tilts slightly back
 * - Torso executes abdominal pre-stretch (chest rotates away from kick)
 * - Contralateral arm spreads wide forward/up to counterbalance
 * - Ipsilateral arm pulls backward with chambering leg
 */
export function solveFullBodyKickChamber(
  manX: number,
  manY: number,
  supportAnkleX: number,
  groundY: number,
  tChamber: number, // 0..1
  targetBallX: number,
  targetBallY: number,
  scale = 0.5
) {
  // Support leg cushions slightly as weight centers over it
  const supportLeg = solveLegLimb(manX, manY, supportAnkleX, groundY, true, scale, true);

  // Kicking leg chambers back: Thigh extends back, knee flexes deeply with heel toward butt
  const rThighAngle = -90.0 - tChamber * 32.0; // -90° -> -122°
  const rShinAngle = rThighAngle - 96.0 - tChamber * 14.0;
  const rFootAngle = rShinAngle + 16.0;

  // Torso counter-coiling (abdominal oblique pre-stretch):
  // Lower spine tilts slightly forward, upper chest coils to load elastic core
  const spineAngle = 76.0 + tChamber * 4.0;
  const chestAngle = 75.0 + tChamber * 3.5;

  const tempAngles = new Array(17).fill(0);
  tempAngles[7] = spineAngle;
  tempAngles[8] = chestAngle;
  const fk = solveForwardKinematics17(manX, manY, tempAngles, scale);
  const shoulderX = fk[8].endX;
  const shoulderY = fk[8].endY;

  // Counterbalance arms:
  // Contralateral (left) arm reaches outward/upward for balance
  // Ipsilateral (right) arm retracts backward with chambered leg
  const lTargetX = shoulderX + 46.0 * tChamber;
  const lTargetY = shoulderY + 32.0 - tChamber * 6.0;
  const rTargetX = shoulderX - 36.0 * tChamber;
  const rTargetY = shoulderY + 48.0;

  const lArm = solveArmLimb(shoulderX, shoulderY, lTargetX, lTargetY, true, scale);
  const rArm = solveArmLimb(shoulderX, shoulderY, rTargetX, rTargetY, true, scale);

  // Vestibular gaze locked intently on ball
  const headGaze = solveReactiveVestibularHead(chestAngle, 48.0, 0, 0.85);

  return {
    rLeg: { thigh: rThighAngle, shin: rShinAngle, foot: rFootAngle },
    lLeg: {
      thigh: supportLeg.thighAngleDeg,
      shin: supportLeg.shinAngleDeg,
      foot: supportLeg.footAngleDeg,
    },
    spineAngle,
    chestAngle,
    shoulderX,
    shoulderY,
    rArm: {
      bicep: rArm.bicepAngleDeg,
      forearm: rArm.forearmAngleDeg,
      hand: rArm.handAngleDeg,
    },
    lArm: {
      bicep: lArm.bicepAngleDeg,
      forearm: lArm.forearmAngleDeg,
      hand: lArm.handAngleDeg,
    },
    neckAngle: headGaze.neckAngleDeg,
    headAngle: headGaze.headAngleDeg,
  };
}

/**
 * Coordinated Kinetic Whip & Impact Solver (Act H2):
 * As kicking leg whips forward into contact with ball at (884, 735):
 * - Conservation of angular momentum triggers upper torso backward recoil (Spine 98-102°, Chest 100-104°)
 * - Shoulders react: contralateral arm whips down/in, ipsilateral arm pulls back/down
 * - Support leg remains locked to Ground Y=755
 * - Head maintains contact gaze focus
 */
export function solveFullBodyKickStrike(
  manX: number,
  manY: number,
  supportAnkleX: number,
  groundY: number,
  isContactImpact: boolean,
  strikeProgress: number, // 0..1
  targetToeX: number,
  targetToeY: number,
  scale = 0.5
) {
  // Support leg pinned
  const supportLeg = solveLegLimb(manX, manY, supportAnkleX, groundY, true, scale, true);

  // Kicking leg whip
  let rThighAngle: number;
  let rShinAngle: number;
  let rFootAngle: number;

  if (isContactImpact) {
    // Physical contact at (884, 735)
    const kickIK = solveTwoBoneIK(
      manX,
      manY,
      targetToeX - 18.0,
      targetToeY - 2.0,
      255.0,
      245.0,
      true,
      'LEG',
      scale
    );
    rThighAngle = kickIK.upperAngleDeg;
    rShinAngle = kickIK.lowerAngleDeg;
    rFootAngle = 18.0;
  } else {
    // Forward acceleration whip
    rThighAngle = -55.0 + strikeProgress * 33.0;
    rShinAngle = -95.0 + strikeProgress * 47.0;
    rFootAngle = -15.0 + strikeProgress * 20.0;
  }

  // Upper Torso Backward Recoil:
  // Leg acceleration forward forces core and upper body to counter-recoil backward!
  const recoilBackDeg = isContactImpact ? 14.0 : strikeProgress * 10.0;
  const spineAngle = 88.0 + recoilBackDeg;
  const chestAngle = 89.0 + recoilBackDeg * 1.15;

  const tempAngles = new Array(17).fill(0);
  tempAngles[7] = spineAngle;
  tempAngles[8] = chestAngle;
  const fk = solveForwardKinematics17(manX, manY, tempAngles, scale);
  const shoulderX = fk[8].endX;
  const shoulderY = fk[8].endY;

  // Counterbalancing arms:
  // Contralateral arm whips down and across; ipsilateral arm pulls back
  const lTargetX = shoulderX + 44.0 - (isContactImpact ? 8.0 : 0);
  const lTargetY = shoulderY + 28.0 + (isContactImpact ? 12.0 : 0);
  const rTargetX = shoulderX - 38.0;
  const rTargetY = shoulderY + 42.0;

  const lArm = solveArmLimb(shoulderX, shoulderY, lTargetX, lTargetY, true, scale);
  const rArm = solveArmLimb(shoulderX, shoulderY, rTargetX, rTargetY, true, scale);

  const headGaze = solveReactiveVestibularHead(chestAngle, 50.0, 0, 0.85);

  return {
    rLeg: { thigh: rThighAngle, shin: rShinAngle, foot: rFootAngle },
    lLeg: {
      thigh: supportLeg.thighAngleDeg,
      shin: supportLeg.shinAngleDeg,
      foot: supportLeg.footAngleDeg,
    },
    spineAngle,
    chestAngle,
    shoulderX,
    shoulderY,
    rArm: {
      bicep: rArm.bicepAngleDeg,
      forearm: rArm.forearmAngleDeg,
      hand: rArm.handAngleDeg,
    },
    lArm: {
      bicep: lArm.bicepAngleDeg,
      forearm: lArm.forearmAngleDeg,
      hand: lArm.handAngleDeg,
    },
    neckAngle: headGaze.neckAngleDeg,
    headAngle: headGaze.headAngleDeg,
  };
}

/**
 * Coordinated Follow-Through & Momentum Dissipation (Act H3 & I):
 * After ball leaves:
 * - Kicking leg carries high forward
 * - Upper torso balances extended leg, then eases back toward upright
 * - Arms spread like wings for aerodynamic balance
 * - Head tracks soaring ball upward
 * - Harmonic settling dissipates residual kinetic energy
 */
export function solveFullBodyKickFollowThrough(
  manX: number,
  manY: number,
  supportAnkleX: number,
  groundY: number,
  tFollow: number, // 0..1
  hopLiftPx: number,
  scale = 0.5
) {
  const supportLeg = solveLegLimb(
    manX,
    manY,
    supportAnkleX,
    groundY - hopLiftPx,
    true,
    scale,
    hopLiftPx < 1.0
  );

  // Kicking leg carries high forward, then gradually drops
  const thighAngle = 8.0 + (1.0 - tFollow) * 16.0;
  const shinAngle = 4.0 + (1.0 - tFollow) * 12.0;
  const footAngle = 20.0;

  // Torso eases from recoil back toward upright (102° -> 92°)
  const spineAngle = 102.0 - tFollow * 10.0;
  const chestAngle = 104.0 - tFollow * 12.0;

  const tempAngles = new Array(17).fill(0);
  tempAngles[7] = spineAngle;
  tempAngles[8] = chestAngle;
  const fk = solveForwardKinematics17(manX, manY, tempAngles, scale);
  const shoulderX = fk[8].endX;
  const shoulderY = fk[8].endY;

  // Balancing arms spread wide
  const lTargetX = shoulderX + 42.0 - tFollow * 6.0;
  const lTargetY = shoulderY + 36.0 + tFollow * 10.0;
  const rTargetX = shoulderX - 42.0 + tFollow * 6.0;
  const rTargetY = shoulderY + 48.0 + tFollow * 8.0;

  const lArm = solveArmLimb(shoulderX, shoulderY, lTargetX, lTargetY, true, scale);
  const rArm = solveArmLimb(shoulderX, shoulderY, rTargetX, rTargetY, true, scale);

  // Head tracks rising ball up into sky
  const headAngle = 55.0 + tFollow * 45.0;
  const neckAngle = 85.0 + tFollow * 18.0;

  return {
    rLeg: { thigh: thighAngle, shin: shinAngle, foot: footAngle },
    lLeg: {
      thigh: supportLeg.thighAngleDeg,
      shin: supportLeg.shinAngleDeg,
      foot: supportLeg.footAngleDeg,
    },
    spineAngle,
    chestAngle,
    shoulderX,
    shoulderY,
    rArm: {
      bicep: rArm.bicepAngleDeg,
      forearm: rArm.forearmAngleDeg,
      hand: rArm.handAngleDeg,
    },
    lArm: {
      bicep: lArm.bicepAngleDeg,
      forearm: lArm.forearmAngleDeg,
      hand: lArm.handAngleDeg,
    },
    neckAngle,
    headAngle,
  };
}
