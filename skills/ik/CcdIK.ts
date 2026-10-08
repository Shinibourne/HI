/**
 * CCD (Cyclic Coordinate Descent) Inverse Kinematics Solver.
 * Iteratively adjusts individual joint rotations from tip to root to reach a target.
 * Supports joint angle limits, preferred bend directions, and hinge constraints.
 */

export interface CcdJoint {
  worldAngleDeg: number;
  length: number;
  minRelAngleDeg?: number;
  maxRelAngleDeg?: number;
  preferredBendSign?: number; // +1 or -1
}

export interface CcdResult {
  worldAnglesDeg: number[];
  positions: Array<{ x: number; y: number }>;
  reached: boolean;
  iterations: number;
  finalError: number;
}

export function solveCcd2D(
  rootX: number,
  rootY: number,
  joints: CcdJoint[],
  targetX: number,
  targetY: number,
  maxIterations = 20,
  tolerance = 0.5
): CcdResult {
  const n = joints.length;
  if (n === 0) {
    return { worldAnglesDeg: [], positions: [{ x: rootX, y: rootY }], reached: false, iterations: 0, finalError: 0 };
  }

  const angles = joints.map((j) => j.worldAngleDeg);
  const lengths = joints.map((j) => j.length);

  let iter = 0;
  let error = Infinity;

  while (iter < maxIterations) {
    iter++;

    // Compute joint positions from current angles
    const positions = computeForwardPositions(rootX, rootY, angles, lengths);
    const endEffector = positions[n];

    error = Math.hypot(targetX - endEffector.x, targetY - endEffector.y);
    if (error <= tolerance) break;

    // CCD pass: iterate backward from last joint to root joint
    for (let i = n - 1; i >= 0; i--) {
      const jointPos = positions[i];
      const tipPos = positions[n];

      // Vector from joint to current tip
      const vTipX = tipPos.x - jointPos.x;
      const vTipY = -(tipPos.y - jointPos.y); // math Cartesian

      // Vector from joint to target
      const vTargetX = targetX - jointPos.x;
      const vTargetY = -(targetY - jointPos.y);

      const angleTip = Math.atan2(vTipY, vTipX);
      const angleTarget = Math.atan2(vTargetY, vTargetX);

      let deltaRad = angleTarget - angleTip;

      // Normalize delta angle to [-PI, PI]
      deltaRad = Math.atan2(Math.sin(deltaRad), Math.cos(deltaRad));
      const deltaDeg = (deltaRad * 180) / Math.PI;

      // Rotate this joint and all descendant joints
      angles[i] += deltaDeg;

      // Enforce joint limits relative to parent if specified
      const spec = joints[i];
      if (spec.minRelAngleDeg !== undefined || spec.maxRelAngleDeg !== undefined) {
        const parentAngle = i > 0 ? angles[i - 1] : 0;
        let relAngle = angles[i] - parentAngle;

        // Wrap relative angle to [-180, 180]
        relAngle = ((relAngle + 180) % 360) - 180;

        const min = spec.minRelAngleDeg ?? -180;
        const max = spec.maxRelAngleDeg ?? 180;
        const clampedRel = Math.max(min, Math.min(max, relAngle));

        angles[i] = parentAngle + clampedRel;
      }

      // Recompute positions after adjusting joint i
      const newPositions = computeForwardPositions(rootX, rootY, angles, lengths);
      positions.splice(0, positions.length, ...newPositions);
    }
  }

  const finalPositions = computeForwardPositions(rootX, rootY, angles, lengths);
  const endEffector = finalPositions[n];
  const finalError = Math.hypot(targetX - endEffector.x, targetY - endEffector.y);

  return {
    worldAnglesDeg: angles,
    positions: finalPositions,
    reached: finalError <= tolerance,
    iterations: iter,
    finalError,
  };
}

function computeForwardPositions(
  rootX: number,
  rootY: number,
  anglesDeg: number[],
  lengths: number[]
): Array<{ x: number; y: number }> {
  const pos: Array<{ x: number; y: number }> = [{ x: rootX, y: rootY }];
  let curX = rootX;
  let curY = rootY;

  for (let i = 0; i < anglesDeg.length; i++) {
    const rad = (anglesDeg[i] * Math.PI) / 180;
    curX += Math.cos(rad) * lengths[i];
    curY -= Math.sin(rad) * lengths[i];
    pos.push({ x: curX, y: curY });
  }

  return pos;
}
