import { Vector2D, BalanceStrategy, ObjectState, ConfigurablePhysicsParams } from './types';
import { JointWorldPose } from '../skills/kinematicsSolvers';
import { BaseOfSupportResult } from './contactSupportEngine';

export const RIG_SEGMENT_MASS_RATIOS: number[] = [
  0.22,  // 00: Pelvis
  0.10,  // 01: Right Thigh
  0.05,  // 02: Right Shin
  0.015, // 03: Right Foot
  0.10,  // 04: Left Thigh
  0.05,  // 05: Left Shin
  0.015, // 06: Left Foot
  0.28,  // 07: Spine / Torso
  0.03,  // 08: Upper Chest / Neck
  0.02,  // 09: Right Bicep
  0.012, // 10: Right Forearm
  0.003, // 11: Right Hand
  0.02,  // 12: Left Bicep
  0.07,  // 13: Head Circle
  0.012, // 14: Left Forearm
  0.003, // 15: Left Hand
  0.00,  // 16: Accessory
];

export interface DynamicBalanceResult {
  com: Vector2D;
  comVelocity: Vector2D;
  extrapolatedCoM: Vector2D;
  isBalanced: boolean;
  stabilityMargin: number; // positive = inside BoS, negative = tipped outside
  recommendedStrategy: BalanceStrategy;
  recommendedCounterLeanDeg: number;
}

/**
 * Calculates weighted Center of Mass including any carried objects
 */
export function calculateWeightedCenterOfMass(
  joints: JointWorldPose[],
  carriedObjects: ObjectState[],
  charMass: number
): Vector2D {
  let totalMass = 0;
  let weightedSumX = 0;
  let weightedSumY = 0;

  for (let i = 0; i < 17; i++) {
    const j = joints[i];
    if (!j) continue;
    const segMass = (RIG_SEGMENT_MASS_RATIOS[i] || 0.01) * charMass;
    const midX = (j.startX + j.endX) * 0.5;
    const midY = (j.startY + j.endY) * 0.5;

    weightedSumX += midX * segMass;
    weightedSumY += midY * segMass;
    totalMass += segMass;
  }

  // Add carried objects
  for (const obj of carriedObjects) {
    if (obj.contactState === 'HELD') {
      weightedSumX += obj.position.x * obj.mass;
      weightedSumY += obj.position.y * obj.mass;
      totalMass += obj.mass;
    }
  }

  return {
    x: totalMass > 0 ? weightedSumX / totalMass : joints[0]?.startX ?? 640,
    y: totalMass > 0 ? weightedSumY / totalMass : joints[0]?.startY ?? 512,
  };
}

/**
 * Evaluates dynamic balance using Hof Extrapolated Center of Mass
 */
export function evaluateDynamicBalance(
  com: Vector2D,
  comVelocity: Vector2D,
  bos: BaseOfSupportResult,
  legLength = 243.0,
  gravity = 980.0
): DynamicBalanceResult {
  // Natural inverted pendulum frequency: omega_0 = sqrt(g / L)
  const omega0 = Math.max(0.5, Math.sqrt(gravity / Math.max(50, legLength)));
  const xcomX = com.x + comVelocity.x / omega0;
  const xcomY = com.y + comVelocity.y / omega0;

  const distToLeftEdge = xcomX - bos.minX;
  const distToRightEdge = bos.maxX - xcomX;
  const stabilityMargin = Math.min(distToLeftEdge, distToRightEdge);

  const isBalanced = stabilityMargin >= -5.0; // small grace margin

  let strategy: BalanceStrategy = 'NONE';
  let counterLeanDeg = 0;

  if (stabilityMargin < -30.0) {
    strategy = 'STEPPING';
    counterLeanDeg = (xcomX > bos.centerX ? -1 : 1) * 14.0;
  } else if (stabilityMargin < -12.0) {
    strategy = 'HIP';
    counterLeanDeg = (xcomX > bos.centerX ? -1 : 1) * 9.0;
  } else if (stabilityMargin < 5.0) {
    strategy = 'ANKLE';
    counterLeanDeg = (xcomX > bos.centerX ? -1 : 1) * 4.0;
  } else if (Math.abs(comVelocity.x) > 10.0) {
    strategy = 'ARM_COUNTERBALANCE';
    counterLeanDeg = (comVelocity.x > 0 ? -1 : 1) * 5.0;
  }

  return {
    com,
    comVelocity,
    extrapolatedCoM: { x: xcomX, y: xcomY },
    isBalanced,
    stabilityMargin,
    recommendedStrategy: strategy,
    recommendedCounterLeanDeg: counterLeanDeg,
  };
}
