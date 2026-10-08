import { STICKFIGURE_PARENTS, STICKFIGURE_BONE_LENGTHS, STICKFIGURE_BONE_NAMES } from '../stknds/stickfigureStructure';

export interface JointWorldPose {
  index: number;
  name: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  worldAngle: number;
  relAngle: number;
}

/**
 * Forward Kinematics (FK) for Stick Nodes 17-bone skeleton
 */
export function solveForwardKinematics17(
  sceneX: number,
  sceneY: number,
  worldAngles: number[],
  instanceScale = 0.5
): JointWorldPose[] {
  const joints: JointWorldPose[] = new Array(17);
  for (let i = 0; i < 17; i++) {
    const p = STICKFIGURE_PARENTS[i];
    const len = STICKFIGURE_BONE_LENGTHS[i];
    const wAng = worldAngles[i];
    const relAng = p === -1 ? wAng : wAng - worldAngles[p];

    if (p === -1) {
      joints[i] = {
        index: i,
        name: STICKFIGURE_BONE_NAMES[i],
        startX: sceneX,
        startY: sceneY,
        endX: sceneX,
        endY: sceneY,
        worldAngle: wAng,
        relAngle: relAng,
      };
    } else {
      const startX = joints[p].endX;
      const startY = joints[p].endY;
      const rad = (wAng * Math.PI) / 180;
      const endX = startX + Math.cos(rad) * len * instanceScale;
      const endY = startY - Math.sin(rad) * len * instanceScale;
      joints[i] = {
        index: i,
        name: STICKFIGURE_BONE_NAMES[i],
        startX,
        startY,
        endX,
        endY,
        worldAngle: wAng,
        relAngle: relAng,
      };
    }
  }
  return joints;
}

export interface TwoBoneIKResult {
  upperAngleDeg: number;
  lowerAngleDeg: number;
  midJointX: number;
  midJointY: number;
  endEffectorX: number;
  endEffectorY: number;
  reachable: boolean;
  distance: number;
  maxReach: number;
  interiorAngleDeg: number;
}

/**
 * Analytical Two-Bone Inverse Kinematics (IK) Solver
 * Solves upper and lower bone world angles to reach target (X, Y)
 * while strictly adhering to Knee and Elbow Hinge Polarity Laws!
 *
 * Coordinates: Stick Nodes world angles (0°=Right, 90°=Up, -90°=Down, 180°=Left)
 * Screen Y is inverted (higher Y is downward).
 */
export function solveTwoBoneIK(
  rootX: number,
  rootY: number,
  targetX: number,
  targetY: number,
  length1: number,
  length2: number,
  isRightFacing: boolean,
  limbType: 'LEG' | 'ARM',
  scale = 0.5
): TwoBoneIKResult {
  const l1 = length1 * scale;
  const l2 = length2 * scale;
  const maxReach = l1 + l2;
  const minReach = Math.abs(l1 - l2);

  // Mathematical displacement (Cartesian: mathY = -(screenY - rootY))
  const dx = targetX - rootX;
  const dyMath = -(targetY - rootY);
  const rawDist = Math.hypot(dx, dyMath);

  // Prevent degenerate singularity (keep subtle micro-flex at max reach)
  const reachable = rawDist <= maxReach - 1.0 && rawDist >= minReach + 1.0;
  const clampedDist = Math.max(
    minReach + 1.0,
    Math.min(maxReach * 0.998, rawDist)
  );

  // Target baseline angle in Cartesian degrees
  const baselineRad = Math.atan2(dyMath, dx);

  // Law of Cosines for upper bone angle α relative to baseline
  const cosAlpha = (l1 * l1 + clampedDist * clampedDist - l2 * l2) / (2 * l1 * clampedDist);
  const alphaRad = Math.acos(Math.max(-1, Math.min(1, cosAlpha)));

  // Law of Cosines for interior knee/elbow angle γ
  const cosGamma = (l1 * l1 + l2 * l2 - clampedDist * clampedDist) / (2 * l1 * l2);
  const gammaRad = Math.acos(Math.max(-1, Math.min(1, cosGamma)));
  const flexRad = Math.PI - gammaRad; // amount of bend from straight

  let upperRad: number;
  let lowerRad: number;

  if (limbType === 'LEG') {
    // Knee Hinge Polarity Law:
    // Kneecap points in facing direction.
    // Facing Right (+X): Knee bends forward/down; shin flexes backward (clockwise / more negative).
    // Facing Left (-X): Knee bends forward/down to Left; shin flexes to Right (counter-clockwise / more positive).
    if (isRightFacing) {
      upperRad = baselineRad + alphaRad;
      lowerRad = upperRad - flexRad;
    } else {
      upperRad = baselineRad - alphaRad;
      lowerRad = upperRad + flexRad;
    }
  } else {
    // Elbow Hinge Polarity Law:
    // Elbow bends anteriorly (toward the front/bicep crook).
    if (isRightFacing) {
      upperRad = baselineRad - alphaRad;
      lowerRad = upperRad + flexRad;
    } else {
      upperRad = baselineRad + alphaRad;
      lowerRad = upperRad - flexRad;
    }
  }

  const upperAngleDeg = (upperRad * 180) / Math.PI;
  const lowerAngleDeg = (lowerRad * 180) / Math.PI;

  const midJointX = rootX + Math.cos(upperRad) * l1;
  const midJointY = rootY - Math.sin(upperRad) * l1;

  const endEffectorX = midJointX + Math.cos(lowerRad) * l2;
  const endEffectorY = midJointY - Math.sin(lowerRad) * l2;

  return {
    upperAngleDeg,
    lowerAngleDeg,
    midJointX,
    midJointY,
    endEffectorX,
    endEffectorY,
    reachable,
    distance: rawDist,
    maxReach,
    interiorAngleDeg: (gammaRad * 180) / Math.PI,
  };
}

/**
 * Unified Leg Limb Solver (HIP → KNEE → ANKLE → FOOT)
 * Solves Thigh, Shin, and Foot as one connected system.
 */
export function solveLegLimb(
  pelvisX: number,
  pelvisY: number,
  targetFootX: number,
  targetFootY: number,
  isRightFacing: boolean,
  scale = 0.5,
  isPlantedOnGround = true
): {
  thighAngleDeg: number;
  shinAngleDeg: number;
  footAngleDeg: number;
  kneeX: number;
  kneeY: number;
  ankleX: number;
  ankleY: number;
  footTipX: number;
  footTipY: number;
  ikResult: TwoBoneIKResult;
} {
  const thighLen = STICKFIGURE_BONE_LENGTHS[1]; // 255.0
  const shinLen = STICKFIGURE_BONE_LENGTHS[2];  // 245.0
  const footLen = STICKFIGURE_BONE_LENGTHS[3];  // 53.5

  // Foot offset: foot extends horizontally from ankle
  const footAngleDeg = isPlantedOnGround
    ? (isRightFacing ? 0 : -180)
    : (isRightFacing ? -25 : -155);

  // Solve ankle target position
  const ankleTargetX = targetFootX;
  const ankleTargetY = targetFootY;

  const ik = solveTwoBoneIK(
    pelvisX,
    pelvisY,
    ankleTargetX,
    ankleTargetY,
    thighLen,
    shinLen,
    isRightFacing,
    'LEG',
    scale
  );

  const footRad = (footAngleDeg * Math.PI) / 180;
  const footTipX = ik.endEffectorX + Math.cos(footRad) * footLen * scale;
  const footTipY = ik.endEffectorY - Math.sin(footRad) * footLen * scale;

  return {
    thighAngleDeg: ik.upperAngleDeg,
    shinAngleDeg: ik.lowerAngleDeg,
    footAngleDeg,
    kneeX: ik.midJointX,
    kneeY: ik.midJointY,
    ankleX: ik.endEffectorX,
    ankleY: ik.endEffectorY,
    footTipX,
    footTipY,
    ikResult: ik,
  };
}

/**
 * Unified Arm Limb Solver (SHOULDER → ELBOW → WRIST → HAND)
 * Solves Bicep, Forearm, and Hand as one connected system.
 */
export function solveArmLimb(
  shoulderX: number,
  shoulderY: number,
  targetHandX: number,
  targetHandY: number,
  isRightFacing: boolean,
  scale = 0.5,
  handWorldAngle?: number
): {
  bicepAngleDeg: number;
  forearmAngleDeg: number;
  handAngleDeg: number;
  elbowX: number;
  elbowY: number;
  wristX: number;
  wristY: number;
  handTipX: number;
  handTipY: number;
  ikResult: TwoBoneIKResult;
} {
  const bicepLen = STICKFIGURE_BONE_LENGTHS[9];  // 147.5
  const forearmLen = STICKFIGURE_BONE_LENGTHS[10]; // 177.8
  const handLen = STICKFIGURE_BONE_LENGTHS[11]; // 16.2

  const ik = solveTwoBoneIK(
    shoulderX,
    shoulderY,
    targetHandX,
    targetHandY,
    bicepLen,
    forearmLen,
    isRightFacing,
    'ARM',
    scale
  );

  const handAngle = handWorldAngle !== undefined ? handWorldAngle : ik.lowerAngleDeg;
  const handRad = (handAngle * Math.PI) / 180;
  const handTipX = ik.endEffectorX + Math.cos(handRad) * handLen * scale;
  const handTipY = ik.endEffectorY - Math.sin(handRad) * handLen * scale;

  return {
    bicepAngleDeg: ik.upperAngleDeg,
    forearmAngleDeg: ik.lowerAngleDeg,
    handAngleDeg: handAngle,
    elbowX: ik.midJointX,
    elbowY: ik.midJointY,
    wristX: ik.endEffectorX,
    wristY: ik.endEffectorY,
    handTipX,
    handTipY,
    ikResult: ik,
  };
}

// =============================================================================
// OPENPOSE-INSPIRED CENTER OF MASS (COM) & SKELETAL MASS MAPPING
// =============================================================================

/**
 * Segment mass proportions calibrated against human biomechanics (Winter / Dempster)
 * Total sum = 1.00
 */
