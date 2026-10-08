import { solveForwardKinematics17, JointWorldPose } from './kinematicsSolvers';

export const SKELETON_MASS_DISTRIBUTION: number[] = [
  0.14,  // 00: Pelvis
  0.10,  // 01: Right Thigh
  0.045, // 02: Right Shin
  0.015, // 03: Right Foot
  0.10,  // 04: Left Thigh
  0.045, // 05: Left Shin
  0.015, // 06: Left Foot
  0.14,  // 07: Lower Spine
  0.14,  // 08: Upper Chest
  0.03,  // 09: Right Bicep
  0.017, // 10: Right Forearm
  0.008, // 11: Right Hand
  0.02,  // 12: Neck
  0.08,  // 13: Head
  0.03,  // 14: Left Bicep
  0.017, // 15: Left Forearm
  0.008, // 16: Left Hand
];

export interface CenterOfMassReport {
  comX: number;
  comY: number;
  supportPolygonMinX: number;
  supportPolygonMaxX: number;
  isBalanced: boolean;
  stabilityMarginPx: number;
  groundContactY: number;
}

/**
 * Calculates whole-body weighted Center of Mass and checks balance against support polygon
 */
export function calculateCenterOfMass17(
  sceneX: number,
  sceneY: number,
  worldAngles: number[],
  scale = 0.5,
  groundY = 755
): CenterOfMassReport {
  const joints = solveForwardKinematics17(sceneX, sceneY, worldAngles, scale);

  let totalMass = 0;
  let weightedX = 0;
  let weightedY = 0;

  let minFootX = Infinity;
  let maxFootX = -Infinity;
  let hasGroundedFoot = false;

  for (let i = 0; i < 17; i++) {
    const m = SKELETON_MASS_DISTRIBUTION[i];
    totalMass += m;
    // Segment midpoint
    const midX = (joints[i].startX + joints[i].endX) * 0.5;
    const midY = (joints[i].startY + joints[i].endY) * 0.5;
    weightedX += midX * m;
    weightedY += midY * m;

    // Check foot contact (Node 3, Node 6)
    if (i === 3 || i === 6) {
      const footEndY = joints[i].endY;
      if (Math.abs(footEndY - groundY) <= 18) {
        hasGroundedFoot = true;
        const fx1 = joints[i].startX;
        const fx2 = joints[i].endX;
        minFootX = Math.min(minFootX, Math.min(fx1, fx2));
        maxFootX = Math.max(maxFootX, Math.max(fx1, fx2));
      }
    }
  }

  const comX = weightedX / totalMass;
  const comY = weightedY / totalMass;

  const supportMinX = hasGroundedFoot ? minFootX - 10 : sceneX - 25;
  const supportMaxX = hasGroundedFoot ? maxFootX + 10 : sceneX + 25;

  const isBalanced = comX >= supportMinX - 15 && comX <= supportMaxX + 15;
  const stabilityMarginPx = Math.min(comX - supportMinX, supportMaxX - comX);

  return {
    comX,
    comY,
    supportPolygonMinX: supportMinX,
    supportPolygonMaxX: supportMaxX,
    isBalanced,
    stabilityMarginPx,
    groundContactY: groundY,
  };
}

// =============================================================================
// PROCEDURAL 2D CHARACTER LOCOMOTION ENGINE (ik-proc-anim-2d)
// =============================================================================


export interface VerletPoint {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
  accelX: number;
  accelY: number;
}

/**
 * Step a single Verlet point forward with damping and gravity
 */
export function stepVerletPoint(
  p: VerletPoint,
  dt: number,
  damping = 0.96
): VerletPoint {
  const vx = (p.x - p.oldX) * damping;
  const vy = (p.y - p.oldY) * damping;

  const nextX = p.x + vx + p.accelX * dt * dt;
  const nextY = p.y + vy + p.accelY * dt * dt;

  return {
    x: nextX,
    y: nextY,
    oldX: p.x,
    oldY: p.y,
    accelX: 0,
    accelY: 0,
  };
}

/**
 * Damped harmonic oscillator response
 * Computes settle decay: x(t) = A * exp(-γ t) * cos(ω t)
 */
export function calculateDampedOscillation(
  initialAmplitude: number,
  dampingRatio: number, // 0..1 (under-damped e.g. 0.35)
  angularFreq: number,  // rad/s (e.g. 14)
  timeSec: number
): number {
  const gamma = dampingRatio * angularFreq;
  const dampedFreq = angularFreq * Math.sqrt(Math.max(0.001, 1 - dampingRatio * dampingRatio));
  return initialAmplitude * Math.exp(-gamma * timeSec) * Math.cos(dampedFreq * timeSec);
}

/**
 * Volume-preserving Squash & Stretch
 * Along velocity: s_parallel = 1 + λ * ||v||
 * Transverse: s_perp = 1 / sqrt(s_parallel)
 */
export function calculateSquashStretchFactors(
  velocityMag: number,
  maxVelocity = 40,
  maxStretchRatio = 1.35
): {
  stretchFactor: number;
  squashFactor: number;
} {
  const normVel = Math.min(1.0, velocityMag / maxVelocity);
  const stretchFactor = 1.0 + normVel * (maxStretchRatio - 1.0);
  const squashFactor = 1.0 / Math.sqrt(stretchFactor);
  return { stretchFactor, squashFactor };
}

// =============================================================================
// PROGRAMMATIC ANIMATION COMPOSITION (Manim-Inspired Pipeline)
// =============================================================================

export interface MotionPhaseDescriptor {
  name: string;
  startFrame: number;
  endFrame: number;
  easeType: 'EASE_IN' | 'EASE_OUT' | 'EASE_IN_OUT' | 'BALLISTIC' | 'HOLD';
  primarySkills: number[];
  description: string;
}

/**
 * Cubic Hermite interpolation ensuring C1 continuity at phase boundaries
 */
export function cubicHermiteInterpolate(
  p0: number,
  v0: number,
  p1: number,
  v1: number,
  t: number
): { position: number; velocity: number } {
  const t2 = t * t;
  const t3 = t2 * t;

  const h00 = 2 * t3 - 3 * t2 + 1;
  const h10 = t3 - 2 * t2 + t;
  const h01 = -2 * t3 + 3 * t2;
  const h11 = t3 - t2;

  const position = h00 * p0 + h10 * v0 + h01 * p1 + h11 * v1;

  const dh00 = 6 * t2 - 6 * t;
  const dh10 = 3 * t2 - 4 * t + 1;
  const dh01 = -6 * t2 + 6 * t;
  const dh11 = 3 * t2 - 2 * t;

  const velocity = dh00 * p0 + dh10 * v0 + dh01 * p1 + dh11 * v1;

  return { position, velocity };
}

// =============================================================================
// AUTOMATED 10-DOMAIN QUALITY-CONTROL & SILHOUETTE GATE (Skill #33)
// =============================================================================
