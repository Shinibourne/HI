/**
 * Mass, Weight Transfer, Momentum & Verlet Secondary Motion Physics Engine.
 */

import { STICKFIGURE_BONE_LENGTHS, STICKFIGURE_PARENTS } from '../../src/lib/stkndsCodec';
import { solveForwardKinematics17, JointWorldPose } from '../ik/kinematicsSolvers';

/**
 * Standard human segment mass distribution ratios (Winter/Dempster model). Total = 1.00
 */
export const SEGMENT_MASS_WEIGHTS_17: number[] = [
  0.22, // Node 0: Pelvis
  0.10, // Node 1: Right Thigh
  0.046,// Node 2: Right Shin
  0.014,// Node 3: Right Foot
  0.10, // Node 4: Left Thigh
  0.046,// Node 5: Left Shin
  0.014,// Node 6: Left Foot
  0.16, // Node 7: Lower Spine
  0.12, // Node 8: Upper Chest
  0.028,// Node 9: Right Bicep
  0.016,// Node 10: Right Forearm
  0.006,// Node 11: Right Hand
  0.028,// Node 12: Left Bicep
  0.016,// Node 13: Left Forearm
  0.006,// Node 14: Left Hand
  0.025,// Node 15: Neck
  0.055,// Node 16: Head
];

export interface CenterOfMassResult {
  comX: number;
  comY: number;
  totalMass: number;
  jointCentroids: Array<{ x: number; y: number; weight: number }>;
}

/**
 * Calculates weighted Center of Mass (CoM) across the 17-bone skeleton.
 */
export function calculateCenterOfMass17(
  pelvisX: number,
  pelvisY: number,
  worldAnglesDeg: number[],
  scale = 0.5
): CenterOfMassResult {
  const poses: JointWorldPose[] = solveForwardKinematics17(pelvisX, pelvisY, worldAnglesDeg, scale);

  let sumX = 0;
  let sumY = 0;
  let sumWeight = 0;
  const jointCentroids: Array<{ x: number; y: number; weight: number }> = [];

  for (let i = 0; i < 17; i++) {
    const p = poses[i];
    const w = SEGMENT_MASS_WEIGHTS_17[i];
    const midX = (p.startX + p.endX) / 2;
    const midY = (p.startY + p.endY) / 2;

    sumX += midX * w;
    sumY += midY * w;
    sumWeight += w;
    jointCentroids.push({ x: midX, y: midY, weight: w });
  }

  return {
    comX: sumX / sumWeight,
    comY: sumY / sumWeight,
    totalMass: sumWeight,
    jointCentroids,
  };
}

/**
 * Verlet secondary particle integration for loose apparel, hair, or secondary limb follow-through.
 */
export interface VerletParticle {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
  accelX: number;
  accelY: number;
  pinned: boolean;
}

export function updateVerletParticle(
  p: VerletParticle,
  damping = 0.95,
  gravityY = 0.5,
  dt = 1.0
): VerletParticle {
  if (p.pinned) return { ...p };

  const vx = (p.x - p.oldX) * damping;
  const vy = (p.y - p.oldY) * damping;

  const newX = p.x + vx + p.accelX * dt * dt;
  const newY = p.y + vy + (p.accelY + gravityY) * dt * dt;

  return {
    x: newX,
    y: newY,
    oldX: p.x,
    oldY: p.y,
    accelX: 0,
    accelY: 0,
    pinned: false,
  };
}

/**
 * Applies damped spring oscillation to smooth joint follow-through.
 * x_new = x + v, v_new = (v + (target - x) * stiffness) * damping
 */
export function solveSpringDampedFollowThrough(
  currentVal: number,
  currentVel: number,
  targetVal: number,
  stiffness = 0.15,
  damping = 0.85
): { newPos: number; newVel: number } {
  const force = (targetVal - currentVal) * stiffness;
  const newVel = (currentVel + force) * damping;
  const newPos = currentVal + newVel;
  return { newPos, newVel };
}
