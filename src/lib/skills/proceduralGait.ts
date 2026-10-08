import { calculateCenterOfMass17, CenterOfMassReport } from './biomechanicalPhysics';
import { solveLegLimb, solveArmLimb, solveForwardKinematics17, JointWorldPose } from './kinematicsSolvers';

export interface ProceduralGaitConfig {
  rootX: number;
  groundY: number;
  strideLength: number;
  stepHeight: number;
  gaitProgress: number; // 0..1 (0=Contact, 0.25=Down, 0.5=Passing, 0.75=Up)
  isRightFacing: boolean;
  scale?: number;
}

export interface ProceduralGaitPose {
  pelvisX: number;
  pelvisY: number;
  worldAngles: number[];
  leftLegGrounded: boolean;
  rightLegGrounded: boolean;
  comReport: CenterOfMassReport;
}

/**
 * Derives dynamic body pose from high-level locomotion parameters:
 * Computes pelvis wave, stance leg ground-locking, swing leg trajectory,
 * spine counter-lean, and opposite arm swings!
 */
export function generateProceduralGaitPose(
  config: ProceduralGaitConfig
): ProceduralGaitPose {
  const {
    rootX,
    groundY,
    strideLength,
    stepHeight,
    gaitProgress,
    isRightFacing,
    scale = 0.5,
  } = config;

  // Pelvis vertical wave: dips during weight acceptance, rises during passing
  // Nominally pelvis stands at groundY - (legLength * 0.96)
  const nominalPelvisY = groundY - 245;
  const pelvisWaveDelta = Math.sin(gaitProgress * Math.PI * 2) * 8;
  const pelvisY = nominalPelvisY + pelvisWaveDelta;
  const pelvisX = rootX;

  // Phase analysis (Right leg leading in phase 0..0.5, Left leg leading 0.5..1.0)
  const cycleHalf = gaitProgress < 0.5;
  const halfProgress = cycleHalf ? gaitProgress * 2 : (gaitProgress - 0.5) * 2;

  // Stance vs Swing foot placement
  const stanceOffset = (0.5 - halfProgress) * strideLength * 0.6;
  const swingOffset = (-0.5 + halfProgress) * strideLength * 0.6;
  const swingLift = Math.sin(halfProgress * Math.PI) * stepHeight;

  let rFootX: number;
  let rFootY: number;
  let lFootX: number;
  let lFootY: number;
  let rGrounded: boolean;
  let lGrounded: boolean;

  if (cycleHalf) {
    // Right leg is swing leg, Left leg is stance leg
    rFootX = pelvisX + swingOffset * (isRightFacing ? 1 : -1);
    rFootY = groundY - swingLift;
    lFootX = pelvisX + stanceOffset * (isRightFacing ? 1 : -1);
    lFootY = groundY;
    rGrounded = swingLift < 2;
    lGrounded = true;
  } else {
    // Left leg is swing leg, Right leg is stance leg
    lFootX = pelvisX + swingOffset * (isRightFacing ? 1 : -1);
    lFootY = groundY - swingLift;
    rFootX = pelvisX + stanceOffset * (isRightFacing ? 1 : -1);
    rFootY = groundY;
    lGrounded = swingLift < 2;
    rGrounded = true;
  }

  // Solve Leg Kinematics using coupled 2-bone IK
  const rLeg = solveLegLimb(pelvisX, pelvisY, rFootX, rFootY, isRightFacing, scale, rGrounded);
  const lLeg = solveLegLimb(pelvisX, pelvisY, lFootX, lFootY, isRightFacing, scale, lGrounded);

  // Torso counter-lean: leans slightly forward in facing direction, counter-flexes swing
  const spineLean = isRightFacing ? 88 : 92;
  const chestLean = isRightFacing ? 89 : 91;

  // Chest origin via FK for shoulders
  const chestRad = (chestLean * Math.PI) / 180;
  const shoulderX = pelvisX + Math.cos(chestRad) * 100 * scale;
  const shoulderY = pelvisY - Math.sin(chestRad) * 100 * scale;

  // Arm counter-swing (anti-phase to legs)
  const armSwingAmp = 28;
  const armPhase = (gaitProgress - 0.25) * Math.PI * 2;
  const rArmAngle = (isRightFacing ? -90 : -90) + Math.sin(armPhase) * armSwingAmp;
  const lArmAngle = (isRightFacing ? -90 : -90) - Math.sin(armPhase) * armSwingAmp;

  // Hand targets
  const rHandX = shoulderX + (isRightFacing ? 1 : -1) * Math.sin(armPhase) * 60;
  const rHandY = shoulderY + 80 + Math.cos(armPhase) * 15;
  const lHandX = shoulderX - (isRightFacing ? 1 : -1) * Math.sin(armPhase) * 60;
  const lHandY = shoulderY + 80 - Math.cos(armPhase) * 15;

  const rArm = solveArmLimb(shoulderX, shoulderY, rHandX, rHandY, isRightFacing, scale);
  const lArm = solveArmLimb(shoulderX, shoulderY, lHandX, lHandY, isRightFacing, scale);

  const worldAngles = new Array(17).fill(0);
  worldAngles[0] = 0; // Pelvis
  worldAngles[1] = rLeg.thighAngleDeg;
  worldAngles[2] = rLeg.shinAngleDeg;
  worldAngles[3] = rLeg.footAngleDeg;
  worldAngles[4] = lLeg.thighAngleDeg;
  worldAngles[5] = lLeg.shinAngleDeg;
  worldAngles[6] = lLeg.footAngleDeg;
  worldAngles[7] = spineLean;
  worldAngles[8] = chestLean;
  worldAngles[9] = rArm.bicepAngleDeg;
  worldAngles[10] = rArm.forearmAngleDeg;
  worldAngles[11] = rArm.handAngleDeg;
  worldAngles[12] = isRightFacing ? 90 : 90; // Neck
  worldAngles[13] = isRightFacing ? 90 : 90; // Head
  worldAngles[14] = lArm.bicepAngleDeg;
  worldAngles[15] = lArm.forearmAngleDeg;
  worldAngles[16] = lArm.handAngleDeg;

  const comReport = calculateCenterOfMass17(pelvisX, pelvisY, worldAngles, scale, groundY);

  return {
    pelvisX,
    pelvisY,
    worldAngles,
    leftLegGrounded: lGrounded,
    rightLegGrounded: rGrounded,
    comReport,
  };
}

// =============================================================================
// VERLET INTEGRATION & DAMPED HARMONIC SECONDARY MOTION
// =============================================================================
