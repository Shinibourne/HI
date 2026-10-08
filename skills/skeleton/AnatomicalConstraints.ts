/**
 * Human Anatomy & Joint Constraints System.
 * Enforces biological 1-DOF knee/elbow hinge polarity, ankle range limits, and spinal distribution.
 */

export interface JointConstraintRule {
  jointIndex: number;
  jointName: string;
  minRelAngleDeg: number;
  maxRelAngleDeg: number;
  description: string;
}

/**
 * Standard Anatomical Joint Limits for Stick Nodes 17-bone skeleton.
 */
export function getAnatomicalJointLimits(isRightFacing: boolean): Record<number, { minRel: number; maxRel: number }> {
  // Relative angles: child world angle - parent world angle
  return {
    // Knees (Nodes 2 & 5 relative to Thighs Nodes 1 & 4)
    // Kneecap points facing direction.
    // Facing Right (+X): Shin angle must be <= Thigh angle (rel angle <= 0, e.g. -140° to 0°).
    // Facing Left (-X): Shin angle must be >= Thigh angle (rel angle >= 0, e.g. 0° to +140°).
    2: isRightFacing ? { minRel: -145, maxRel: 0 } : { minRel: 0, maxRel: 145 },
    5: isRightFacing ? { minRel: -145, maxRel: 0 } : { minRel: 0, maxRel: 145 },

    // Elbows (Nodes 10 & 13 relative to Biceps Nodes 9 & 12)
    // Elbow flexes anteriorly.
    10: isRightFacing ? { minRel: 0, maxRel: 145 } : { minRel: -145, maxRel: 0 },
    13: isRightFacing ? { minRel: 0, maxRel: 145 } : { minRel: -145, maxRel: 0 },

    // Lower Spine (Node 7 relative to Pelvis Node 0)
    7: { minRel: -45, maxRel: 45 },

    // Upper Chest (Node 8 relative to Lower Spine Node 7)
    8: { minRel: -35, maxRel: 35 },

    // Neck (Node 15 relative to Upper Chest Node 8)
    15: { minRel: -30, maxRel: 30 },

    // Head (Node 16 relative to Neck Node 15)
    16: { minRel: -25, maxRel: 25 },
  };
}

/**
 * Enforces biological joint constraints on a set of 17 bone world angles.
 */
export function enforceAnatomicalConstraints17(
  worldAnglesDeg: number[],
  parents: number[],
  isRightFacing: boolean
): { constrainedAngles: number[]; violationsCount: number; report: string[] } {
  const result = [...worldAnglesDeg];
  const limits = getAnatomicalJointLimits(isRightFacing);
  let violationsCount = 0;
  const report: string[] = [];

  for (let i = 0; i < 17; i++) {
    const limit = limits[i];
    const parentIdx = parents[i];

    if (limit && parentIdx !== -1) {
      const parentAngle = result[parentIdx];
      let relAngle = result[i] - parentAngle;

      // Wrap relative angle to [-180, 180]
      relAngle = ((relAngle + 180) % 360) - 180;

      if (relAngle < limit.minRel || relAngle > limit.maxRel) {
        violationsCount++;
        const clampedRel = Math.max(limit.minRel, Math.min(limit.maxRel, relAngle));
        report.push(
          `Joint ${i} violation: relAngle ${relAngle.toFixed(1)}° out of bounds [${limit.minRel}°, ${limit.maxRel}°]. Clamped to ${clampedRel.toFixed(1)}°.`
        );
        result[i] = parentAngle + clampedRel;
      }
    }
  }

  return { constrainedAngles: result, violationsCount, report };
}
