/**
 * FABRIK (Forward And Backward Reaching Inverse Kinematics) Solver for 2D Kinematic Chains.
 * Solves N-bone chains (e.g. spine, multi-segment limbs, appendages) with joint constraints.
 */

export interface ChainJoint {
  x: number;
  y: number;
  length: number; // distance to next joint
  minAngleDeg?: number;
  maxAngleDeg?: number;
  preferredBendSign?: number;
}

export interface FabrikResult {
  positions: Array<{ x: number; y: number }>;
  anglesDeg: number[];
  reached: boolean;
  iterations: number;
  finalError: number;
}

export function solveFabrik2D(
  joints: ChainJoint[],
  targetX: number,
  targetY: number,
  maxIterations = 20,
  tolerance = 0.5,
  groundY?: number
): FabrikResult {
  const numSegments = joints.length;
  if (numSegments === 0) {
    return { positions: [], anglesDeg: [], reached: false, iterations: 0, finalError: 0 };
  }

  // Construct N+1 joint positions from segment origins and lengths
  const p: Array<{ x: number; y: number }> = [];
  const lengths: number[] = joints.map((j) => j.length);
  const totalLength = lengths.reduce((sum, l) => sum + l, 0);

  let curX = joints[0].x;
  let curY = joints[0].y;
  p.push({ x: curX, y: curY });

  for (let i = 0; i < numSegments; i++) {
    curX += joints[i].length; // initial horizontal layout
    p.push({ x: curX, y: curY });
  }

  const numPoints = p.length; // N+1
  const rootX = p[0].x;
  const rootY = p[0].y;

  const distToTarget = Math.hypot(targetX - rootX, targetY - rootY);

  // Unreachable case
  if (distToTarget >= totalLength) {
    const dirX = (targetX - rootX) / distToTarget;
    const dirY = (targetY - rootY) / distToTarget;

    for (let i = 0; i < numSegments; i++) {
      let nextY = p[i].y + dirY * lengths[i];
      if (groundY !== undefined) {
        nextY = Math.min(groundY, nextY);
      }
      p[i + 1] = {
        x: p[i].x + dirX * lengths[i],
        y: nextY,
      };
    }

    const angles = computeAnglesFromPositions(p);
    return {
      positions: p,
      anglesDeg: angles,
      reached: false,
      iterations: 1,
      finalError: Math.hypot(targetX - p[numPoints - 1].x, targetY - p[numPoints - 1].y),
    };
  }

  // Reachable case
  let iter = 0;
  let diff = Math.hypot(targetX - p[numPoints - 1].x, targetY - p[numPoints - 1].y);

  while (diff > tolerance && iter < maxIterations) {
    iter++;

    // STAGE 1: FORWARD REACHING (from end-effector back to root)
    p[numPoints - 1] = { x: targetX, y: targetY };
    for (let i = numPoints - 2; i >= 0; i--) {
      const cur = p[i + 1];
      const prev = p[i];
      const r = Math.hypot(cur.x - prev.x, cur.y - prev.y);
      const lambda = r > 1e-6 ? lengths[i] / r : 0;
      p[i] = {
        x: (1 - lambda) * cur.x + lambda * prev.x,
        y: (1 - lambda) * cur.y + lambda * prev.y,
      };
    }

    // STAGE 2: BACKWARD REACHING (from root forward to end-effector)
    p[0] = { x: rootX, y: rootY };
    for (let i = 0; i < numSegments; i++) {
      const cur = p[i];
      const next = p[i + 1];
      const r = Math.hypot(next.x - cur.x, next.y - cur.y);
      const lambda = r > 1e-6 ? lengths[i] / r : 0;
      let newY = (1 - lambda) * cur.y + lambda * next.y;
      if (groundY !== undefined) {
        newY = Math.min(groundY, newY);
      }
      p[i + 1] = {
        x: (1 - lambda) * cur.x + lambda * next.x,
        y: newY,
      };
    }

    diff = Math.hypot(targetX - p[numPoints - 1].x, targetY - p[numPoints - 1].y);
  }

  const angles = computeAnglesFromPositions(p);

  return {
    positions: p,
    anglesDeg: angles,
    reached: diff <= tolerance,
    iterations: iter,
    finalError: diff,
  };
}

function computeAnglesFromPositions(p: Array<{ x: number; y: number }>): number[] {
  const angles: number[] = [];
  for (let i = 0; i < p.length - 1; i++) {
    const dx = p[i + 1].x - p[i].x;
    const dyMath = -(p[i + 1].y - p[i].y);
    const rad = Math.atan2(dyMath, dx);
    angles.push((rad * 180) / Math.PI);
  }
  return angles;
}
