import { SupportPoint, SupportState, ContactType, Vector2D, ConfigurablePhysicsParams } from './types';
import { JointWorldPose } from '../skills/kinematicsSolvers';

export interface BaseOfSupportResult {
  minX: number;
  maxX: number;
  centerX: number;
  width: number;
  hasGroundedSupport: boolean;
  activeSupportPoints: SupportPoint[];
}

/**
 * Evaluates foot-ground contact state based on elevation, velocity, and pressure
 */
export function determineSupportState(
  footY: number,
  footVy: number,
  groundY: number,
  weightFraction: number,
  threshold = 2.0
): { state: SupportState; type: ContactType; isPlanted: boolean } {
  const distToGround = footY - groundY;

  // Airborne
  if (distToGround < -16.0) {
    return { state: 'SWING', type: 'AIRBORNE', isPlanted: false };
  }

  // Approaching ground
  if (distToGround < -threshold && footVy > 0.5) {
    return { state: 'APPROACH', type: 'AIRBORNE', isPlanted: false };
  }

  // Close to or at ground
  if (Math.abs(distToGround) <= threshold) {
    if (weightFraction > 0.4) {
      return { state: 'PLANT', type: 'WEIGHT_BEARING', isPlanted: true };
    } else if (weightFraction > 0.1) {
      return { state: 'LOAD', type: 'ACTUAL_SUPPORT', isPlanted: true };
    } else {
      return { state: 'CONTACT', type: 'LIGHT_TOUCH', isPlanted: false };
    }
  }

  // Releasing / toe-off
  if (footVy < -0.5 && weightFraction < 0.2) {
    return { state: 'RELEASE', type: 'LIGHT_TOUCH', isPlanted: false };
  }

  // Unloading
  if (weightFraction <= 0.15 && Math.abs(distToGround) <= threshold + 2) {
    return { state: 'UNLOAD', type: 'ACTUAL_SUPPORT', isPlanted: false };
  }

  return { state: 'SWING', type: 'AIRBORNE', isPlanted: false };
}

/**
 * Computes the Base of Support (BOS) polygon from grounded support joints
 */
export function computeBaseOfSupport(
  joints: JointWorldPose[],
  groundY: number,
  threshold = 18.0
): BaseOfSupportResult {
  const activeSupportPoints: SupportPoint[] = [];
  let minX = Infinity;
  let maxX = -Infinity;

  // Node 3 (Right Foot) and Node 6 (Left Foot)
  const candidateIndices = [3, 6];

  for (const idx of candidateIndices) {
    const j = joints[idx];
    if (!j) continue;
    const footEndY = j.endY;
    const distToGround = Math.abs(footEndY - groundY);

    if (distToGround <= threshold) {
      const p1X = j.startX;
      const p2X = j.endX;
      const footMinX = Math.min(p1X, p2X) - 8;
      const footMaxX = Math.max(p1X, p2X) + 8;

      minX = Math.min(minX, footMinX);
      maxX = Math.max(maxX, footMaxX);

      activeSupportPoints.push({
        id: idx === 3 ? 'right_foot' : 'left_foot',
        name: j.name,
        jointIndex: idx,
        position: { x: (p1X + p2X) * 0.5, y: footEndY },
        state: 'PLANT',
        contactType: 'WEIGHT_BEARING',
        normalForceFraction: 0.5,
        isPlanted: true,
      });
    }
  }

  const hasGroundedSupport = activeSupportPoints.length > 0;
  if (!hasGroundedSupport) {
    // If airborne, virtual base around pelvis
    const rootX = joints[0]?.startX ?? 640;
    minX = rootX - 25;
    maxX = rootX + 25;
  }

  // Distribute normal force based on position if multiple feet
  if (activeSupportPoints.length === 2) {
    activeSupportPoints[0].normalForceFraction = 0.5;
    activeSupportPoints[1].normalForceFraction = 0.5;
  } else if (activeSupportPoints.length === 1) {
    activeSupportPoints[0].normalForceFraction = 1.0;
  }

  return {
    minX,
    maxX,
    centerX: (minX + maxX) * 0.5,
    width: maxX - minX,
    hasGroundedSupport,
    activeSupportPoints,
  };
}
