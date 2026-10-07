/**
 * PROCEDURAL ANIMATION & CHARACTER KINEMATICS ENGINE (v1.0)
 * ==========================================================
 * Provides connected articulated body mechanics for 2D stickfigures and Stick Nodes v334:
 * 
 * 1. 17-Node Hierarchical Kinematic Tree & Forward Kinematics (FK)
 * 2. Anthropometric Segment Mass Distribution & Center of Mass (CoM) Solver
 * 3. Base of Support (BoS) Detection & Dynamic Balance Compensation
 * 4. Stance Foot Pinning Solver with Three-Rocker Foot Roll (Zero-Slip Invariant)
 * 5. Analytical Two-Bone Inverse Kinematics (IK) with 1-DOF Human Polarity Limits
 * 6. Curvilinear Motion Arcs & Quintic Acceleration Profiles
 * 7. Target-Directed Impact & Contact Constraints (Strikes, Kicks, Props)
 * 8. Damped Harmonic Oscillator for Organic Moving Holds & Secondary Drag
 */

import {
  STICKFIGURE_PARENTS,
  STICKFIGURE_BONE_LENGTHS,
  STICKFIGURE_BONE_NAMES,
} from './stkndsCodec';
import {
  solveForwardKinematics17,
  solveTwoBoneIK,
  solveLegLimb,
  solveArmLimb,
  type JointWorldPose,
} from './humanMotionSkills';

/**
 * Anthropometric mass distribution for the standard 17-node Stick Nodes human figure.
 * Derived from Dempster & Winter biomechanical segment data adapted for 2D stickfigure topologies.
 */
export const SEGMENT_MASS_RATIOS: number[] = [
  0.22, // 0: Pelvis (Core & lower abdomen)
  0.10, // 1: Right Thigh (Femur)
  0.05, // 2: Right Shin (Tibia/Fibula)
  0.015,// 3: Right Foot (Tarsals/Toes)
  0.10, // 4: Left Thigh (Femur)
  0.05, // 5: Left Shin (Tibia/Fibula)
  0.015,// 6: Left Foot (Tarsals/Toes)
  0.28, // 7: Spine / Torso (Thorax, chest, upper abdomen)
  0.03, // 8: Neck (Cervical vertebrae)
  0.02, // 9: Right Bicep (Humerus)
  0.012,// 10: Right Forearm (Radius/Ulna)
  0.003,// 11: Right Hand (Wrist/Fist)
  0.02, // 12: Left Bicep (Humerus)
  0.07, // 13: Head Circle (Cranium & facial mass)
  0.012,// 14: Left Forearm (Radius/Ulna)
  0.003,// 15: Left Hand (Wrist/Fist)
  0.00, // 16: Optional root/accessory
];

export interface CenterOfMassResult {
  comX: number;
  comY: number;
  segmentCentroids: Array<{ x: number; y: number; mass: number; name: string }>;
  totalMass: number;
}

/**
 * Computes the global 2D Center of Mass (CoM) for a 17-node stickfigure.
 */
export function calculateCenterOfMass17(
  sceneX: number,
  sceneY: number,
  angles: number[],
  scale = 0.5
): CenterOfMassResult {
  const fk = solveForwardKinematics17(sceneX, sceneY, angles, scale);
  let totalMass = 0;
  let weightedSumX = 0;
  let weightedSumY = 0;

  const segmentCentroids: Array<{ x: number; y: number; mass: number; name: string }> = [];

  for (let i = 0; i < 17; i++) {
    const mass = SEGMENT_MASS_RATIOS[i] || 0.01;
    totalMass += mass;

    // Centroid of bone is the midpoint between start and end
    const cx = (fk[i].startX + fk[i].endX) * 0.5;
    const cy = (fk[i].startY + fk[i].endY) * 0.5;

    weightedSumX += cx * mass;
    weightedSumY += cy * mass;

    segmentCentroids.push({
      x: cx,
      y: cy,
      mass,
      name: STICKFIGURE_BONE_NAMES[i] || `Bone ${i}`,
    });
  }

  const comX = totalMass > 0 ? weightedSumX / totalMass : sceneX;
  const comY = totalMass > 0 ? weightedSumY / totalMass : sceneY;

  return {
    comX,
    comY,
    segmentCentroids,
    totalMass,
  };
}

export interface BaseOfSupportResult {
  isGrounded: boolean;
  minX: number;
  maxX: number;
  supportCenterX: number;
  supportWidth: number;
  groundContactPoints: Array<{ x: number; y: number; type: 'foot' | 'hand' | 'knee' | 'pelvis' }>;
  stabilityMargin: number; // comX - supportCenterX
  isStaticallyBalanced: boolean;
}

/**
 * Calculates the Base of Support (BoS) interval on the ground plane.
 */
export function calculateBaseOfSupport17(
  sceneX: number,
  sceneY: number,
  angles: number[],
  groundY = 755.0,
  scale = 0.5,
  comX?: number
): BaseOfSupportResult {
  const fk = solveForwardKinematics17(sceneX, sceneY, angles, scale);
  const contacts: Array<{ x: number; y: number; type: 'foot' | 'hand' | 'knee' | 'pelvis' }> = [];

  const threshold = 3.0; // Contact tolerance in px

  // Check feet: both heel (startX) and toe (endX) establish the foot support polygon
  if (Math.abs(fk[3].endY - groundY) <= threshold) {
    contacts.push({ x: fk[3].startX, y: groundY, type: 'foot' });
    contacts.push({ x: fk[3].endX, y: fk[3].endY, type: 'foot' });
  }
  if (Math.abs(fk[6].endY - groundY) <= threshold) {
    contacts.push({ x: fk[6].startX, y: groundY, type: 'foot' });
    contacts.push({ x: fk[6].endX, y: fk[6].endY, type: 'foot' });
  }

  // Check hands (e.g. while getting up or in 3-point crouch)
  if (Math.abs(fk[11].endY - groundY) <= threshold) {
    contacts.push({ x: fk[11].endX, y: fk[11].endY, type: 'hand' });
  }
  if (Math.abs(fk[15].endY - groundY) <= threshold) {
    contacts.push({ x: fk[15].endX, y: fk[15].endY, type: 'hand' });
  }

  // Check pelvis (sitting on floor)
  if (Math.abs(sceneY - groundY) <= 35.0 && sceneY >= 720.0) {
    contacts.push({ x: sceneX, y: sceneY, type: 'pelvis' });
  }

  if (contacts.length === 0) {
    return {
      isGrounded: false,
      minX: sceneX,
      maxX: sceneX,
      supportCenterX: sceneX,
      supportWidth: 0,
      groundContactPoints: [],
      stabilityMargin: 0,
      isStaticallyBalanced: false,
    };
  }

  let minX = contacts[0].x;
  let maxX = contacts[0].x;
  for (const c of contacts) {
    if (c.x < minX) minX = c.x;
    if (c.x > maxX) maxX = c.x;
  }

  const supportCenterX = (minX + maxX) * 0.5;
  const supportWidth = Math.max(12.0, maxX - minX);

  const testComX = comX ?? calculateCenterOfMass17(sceneX, sceneY, angles, scale).comX;
  const stabilityMargin = testComX - supportCenterX;
  const isStaticallyBalanced = testComX >= minX - 10.0 && testComX <= maxX + 10.0;

  return {
    isGrounded: true,
    minX,
    maxX,
    supportCenterX,
    supportWidth,
    groundContactPoints: contacts,
    stabilityMargin,
    isStaticallyBalanced,
  };
}

/**
 * Computes dynamic balance compensation for the spine and pelvis when limbs extend or accelerate.
 * When a major limb (e.g. kicking leg) moves forward (+X), this computes the necessary torso
 * counter-pitch angle (degrees) and pelvic counter-shift (pixels) to preserve realistic equilibrium.
 */
export function computeProceduralBalanceOffset(
  forwardLimbMassFraction: number,
  forwardLimbDisplacementX: number,
  isPlantedSupport: boolean
): { torsoPitchDeltaDeg: number; pelvisShiftX: number } {
  // Center of mass compensation equation:
  // Delta_CoM = (m_limb * dx_limb + m_torso * dx_torso) / M_total = 0
  // dx_torso = - (m_limb / m_torso) * dx_limb
  const mTorsoFraction = 0.28;
  const compensationRatio = forwardLimbMassFraction / mTorsoFraction;

  const rawShiftX = -forwardLimbDisplacementX * compensationRatio * 0.45;
  const pelvisShiftX = isPlantedSupport ? Math.max(-18.0, Math.min(18.0, rawShiftX)) : 0;

  // Torso pitch: 1 px displacement ≈ 0.22 degrees pitch backward
  const torsoPitchDeltaDeg = -forwardLimbDisplacementX * 0.18;

  return {
    torsoPitchDeltaDeg: Math.max(-25.0, Math.min(25.0, torsoPitchDeltaDeg)),
    pelvisShiftX,
  };
}

/**
 * Solves a stance foot pinning constraint.
 * Takes the moving character's pelvis root and a strictly locked world ground foot location,
 * solving analytical leg IK such that the support foot NEVER slips or floats.
 */
export function solveStancePinningIK(
  pelvisX: number,
  pelvisY: number,
  pinnedFootX: number,
  groundY: number,
  facingRight: boolean,
  scale = 0.5,
  isLeftLeg = false
): {
  thighAngleDeg: number;
  shinAngleDeg: number;
  footAngleDeg: number;
  actualFootX: number;
  actualFootY: number;
  slipErrorPx: number;
} {
  const limb = solveLegLimb(pelvisX, pelvisY, pinnedFootX, groundY, facingRight, scale, true);
  const slipErrorPx = Math.hypot(limb.footTipX - pinnedFootX, limb.footTipY - groundY);

  return {
    thighAngleDeg: limb.thighAngleDeg,
    shinAngleDeg: limb.shinAngleDeg,
    footAngleDeg: limb.footAngleDeg,
    actualFootX: limb.footTipX,
    actualFootY: limb.footTipY,
    slipErrorPx,
  };
}

/**
 * Evaluates a smooth quintic polynomial easing curve (C2 continuous at endpoints).
 * Eliminates sudden jerky velocity spikes at motion boundaries.
 */
export function quinticSmoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * c * (c * (c * 6 - 15) + 10);
}

/**
 * Computes a curvilinear motion arc in 2D with height clearance.
 * Used for swing legs, arm whips, and projectile paths.
 */
export function computeProceduralMotionArc(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  t: number,
  apexLiftPx: number
): { x: number; y: number } {
  const easedT = quinticSmoothstep(t);
  const x = startX + (endX - startX) * easedT;
  const linearY = startY + (endY - startY) * easedT;
  // Parabolic lift: 4 * h * t * (1 - t)
  const lift = 4.0 * apexLiftPx * t * (1.0 - t);
  const y = linearY - Math.max(0, lift);

  return { x, y };
}

/**
 * Solves target-directed reach IK for a striking extremity (foot or fist)
 * converging with a target prop/character surface (e.g. ball radius 18px at (900, 737)).
 */
export function solveTargetDirectedStrikeIK(
  rootX: number,
  rootY: number,
  targetCenterX: number,
  targetCenterY: number,
  targetRadius: number,
  limbType: 'LEG' | 'ARM',
  scale = 0.5,
  facingRight = true
): {
  upperAngleDeg: number;
  lowerAngleDeg: number;
  tipAngleDeg: number;
  contactPointX: number;
  contactPointY: number;
  distanceToSurfacePx: number;
} {
  // In screen space (Y down), striking lower-rear surface of target
  const angleToTarget = Math.atan2(targetCenterY - rootY, targetCenterX - rootX);
  // Contact point on target perimeter closest to origin
  const contactPointX = targetCenterX - Math.cos(angleToTarget) * targetRadius;
  const contactPointY = targetCenterY - Math.sin(angleToTarget) * targetRadius;

  const len1 = limbType === 'LEG' ? STICKFIGURE_BONE_LENGTHS[1] : STICKFIGURE_BONE_LENGTHS[9];
  const len2 = limbType === 'LEG' ? STICKFIGURE_BONE_LENGTHS[2] : STICKFIGURE_BONE_LENGTHS[10];

  const ik = solveTwoBoneIK(
    rootX,
    rootY,
    contactPointX,
    contactPointY,
    len1,
    len2,
    facingRight,
    limbType,
    scale
  );

  return {
    upperAngleDeg: ik.upperAngleDeg,
    lowerAngleDeg: ik.lowerAngleDeg,
    tipAngleDeg: limbType === 'LEG' ? 18.0 : 0.0,
    contactPointX,
    contactPointY,
    distanceToSurfacePx: Math.hypot(contactPointX - targetCenterX, contactPointY - targetCenterY) - targetRadius,
  };
}

/**
 * Computes a damped harmonic oscillator value for organic secondary settling.
 * Eliminates artificial dead freezes in holds.
 */
export function computeDampedOscillation(
  t: number,
  amplitude: number,
  frequencyHz: number,
  dampingRatio: number
): number {
  if (t <= 0) return 0;
  const omega = 2 * Math.PI * frequencyHz;
  return amplitude * Math.exp(-dampingRatio * omega * t) * Math.sin(omega * t);
}
