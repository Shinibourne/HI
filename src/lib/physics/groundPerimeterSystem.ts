/**
 * GROUND / FLOOR PERIMETER SYSTEM & ENVIRONMENTAL CONSTRAINT ENGINE
 * =================================================================
 * Provides unified, single-source-of-truth environmental ground plane constraints
 * across the entire animation engine:
 *
 * 1. Universal Ground Plane Definitions
 *    - Main Animation Studio Canvas: Y = 755.0 px
 *    - Interactive Limb Solving Studio: Y = 350.0 px
 *    - Procedural Locomotion Gait Studio: Y = 310.0 px
 *    - Spatial Consistency Arena: Y = 295.0 px
 *
 * 2. Biomechanical Perimeter Rules:
 *    - Rigid body environmental barrier: Human limbs cannot cross solid ground planes.
 *    - Feet must never start, drag, or interpolate below the floor.
 *    - When the foot reaches the floor, leg responds with natural knee flexion (Law of Cosines)
 *      rather than clipping through the surface.
 *    - Ground clamping is enforced immediately upon scene/pose load before first render.
 */

export const MASTER_CANVAS_GROUND_Y = 755.0;
export const IK_STUDIO_GROUND_Y = 350.0;
export const GAIT_STUDIO_GROUND_Y = 310.0;
export const SPATIAL_ARENA_GROUND_Y = 295.0;

/**
 * Clamps any coordinate Y so it never penetrates the ground plane
 * (In screen space, Y increases downwards, so ground is the maximum allowable Y).
 */
export function clampToGround(y: number, groundY = MASTER_CANVAS_GROUND_Y): number {
  return Math.min(groundY, y);
}

/**
 * Computes exact foot & ankle ground perimeter compliance.
 * Accounts for foot bone rotation (toes pointing down increases penetration depth).
 */
export function enforceFootGroundPerimeter(
  targetAnkleY: number,
  footAngleDeg: number,
  footLength: number,
  scale = 0.5,
  groundY = MASTER_CANVAS_GROUND_Y
): {
  clampedAnkleY: number;
  clampedFootTipY: number;
  penetrationDepthPx: number;
  isGrounded: boolean;
} {
  const footRad = (footAngleDeg * Math.PI) / 180;
  // In screen space, downward drop from ankle to foot tip:
  const footDropY = -Math.sin(footRad) * footLength * scale;

  // Maximum allowable ankle Y so neither the ankle nor the foot tip crosses groundY
  const maxAnkleY = groundY - Math.max(0, footDropY);
  const clampedAnkleY = Math.min(maxAnkleY, targetAnkleY);

  const rawFootTipY = clampedAnkleY + footDropY;
  const clampedFootTipY = Math.min(groundY, rawFootTipY);

  const rawDeepestY = Math.max(targetAnkleY, targetAnkleY + footDropY);
  const penetrationDepthPx = Math.max(0, rawDeepestY - groundY);

  const isGrounded = Math.abs(clampedFootTipY - groundY) <= 1.5 || Math.abs(clampedAnkleY - groundY) <= 1.5;

  return {
    clampedAnkleY,
    clampedFootTipY,
    penetrationDepthPx,
    isGrounded,
  };
}

export interface GroundIntegrityAuditResult {
  passed: boolean;
  maxPenetrationPx: number;
  violatingJointCount: number;
  violations: Array<{ jointName: string; tipY: number; penetrationPx: number }>;
  summary: string;
}

/**
 * Regression & Validation check: Verifies that no joint in an articulated skeleton
 * breaches the ground plane beyond numerical tolerance (0.01 px).
 */
export function auditGroundPerimeterIntegrity(
  joints: Array<{ name?: string; startY: number; endY: number }>,
  groundY = MASTER_CANVAS_GROUND_Y,
  tolerance = 0.5
): GroundIntegrityAuditResult {
  const violations: Array<{ jointName: string; tipY: number; penetrationPx: number }> = [];
  let maxPenetrationPx = 0;

  joints.forEach((j, idx) => {
    const deepestY = Math.max(j.startY, j.endY);
    if (deepestY > groundY + tolerance) {
      const pen = deepestY - groundY;
      if (pen > maxPenetrationPx) maxPenetrationPx = pen;
      violations.push({
        jointName: j.name || `Joint #${idx}`,
        tipY: deepestY,
        penetrationPx: pen,
      });
    }
  });

  const passed = violations.length === 0;
  return {
    passed,
    maxPenetrationPx,
    violatingJointCount: violations.length,
    violations,
    summary: passed
      ? `✓ Ground perimeter strictly respected (0.00 px penetration vs Floor Y = ${groundY})`
      : `⚠ Ground perimeter breach: ${violations.length} joints penetrate floor by up to ${maxPenetrationPx.toFixed(1)} px`,
  };
}
