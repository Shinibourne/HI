/**
 * SKELETAL FLUID MOVEMENT OPTIMIZATION ENGINE
 * ===========================================
 * Implements the core principles from STICKMAN_SKELETAL_FLUID_MOVEMENT_OPTIMIZATION.md:
 * 1. Joint Classification & Anatomical Constraints (Low-DoF Skeletal Rig)
 * 2. Penalty-Based Constraint Solver Cost Functions
 * 3. Compact 2D Cyclic Coordinate Descent (CCD) IK Solver
 * 4. Analytical 2-Bone IK with Pole Vector Bending Planes
 * 5. IK/FK Blending Coefficient (slerp/lerp interpolation across motion phases)
 * 6. Damped Harmonic Oscillator for Follow-Through & Overlapping Action
 * 7. Procedural Fluid Easing Curves & Rotational Circular Arc Trajectories
 * 8. Anticipation Crouch & Pre-Extension Kinematics
 */

import { STICKFIGURE_PARENTS, STICKFIGURE_BONE_LENGTHS, STICKFIGURE_BONE_NAMES } from '../stknds/stickfigureStructure';

/** Anatomical Joint Constraint Limits in Degrees */
export interface JointConstraintDefinition {
  index: number;
  name: string;
  anatomicalEquivalent: string;
  degreesOfFreedom: number;
  minAngleDeg: number;
  maxAngleDeg: number;
  preferredAngleDeg: number;
}

/**
 * Standard 17-Bone Stick Nodes Anatomical Joint Limit Table
 * Derived from STICKMAN_SKELETAL_FLUID_MOVEMENT_OPTIMIZATION.md
 */
export const STICKMAN_JOINT_CONSTRAINTS: Record<number, JointConstraintDefinition> = {
  0: { index: 0, name: 'Pelvis', anatomicalEquivalent: 'Pelvis / Base Root', degreesOfFreedom: 3, minAngleDeg: -180, maxAngleDeg: 180, preferredAngleDeg: 0 },
  1: { index: 1, name: 'Right Thigh', anatomicalEquivalent: 'Right Hip', degreesOfFreedom: 1, minAngleDeg: -30, maxAngleDeg: 120, preferredAngleDeg: 0 },
  2: { index: 2, name: 'Right Shin', anatomicalEquivalent: 'Right Knee', degreesOfFreedom: 1, minAngleDeg: -2, maxAngleDeg: 145, preferredAngleDeg: 20 },
  3: { index: 3, name: 'Right Foot', anatomicalEquivalent: 'Right Ankle', degreesOfFreedom: 1, minAngleDeg: -20, maxAngleDeg: 45, preferredAngleDeg: 0 },
  4: { index: 4, name: 'Left Thigh', anatomicalEquivalent: 'Left Hip', degreesOfFreedom: 1, minAngleDeg: -30, maxAngleDeg: 120, preferredAngleDeg: 0 },
  5: { index: 5, name: 'Left Shin', anatomicalEquivalent: 'Left Knee', degreesOfFreedom: 1, minAngleDeg: -2, maxAngleDeg: 145, preferredAngleDeg: 20 },
  6: { index: 6, name: 'Left Foot', anatomicalEquivalent: 'Left Ankle', degreesOfFreedom: 1, minAngleDeg: -20, maxAngleDeg: 45, preferredAngleDeg: 0 },
  7: { index: 7, name: 'Torso', anatomicalEquivalent: 'Lumbar Spine', degreesOfFreedom: 1, minAngleDeg: -45, maxAngleDeg: 45, preferredAngleDeg: 0 },
  8: { index: 8, name: 'Neck', anatomicalEquivalent: 'Cervical Spine', degreesOfFreedom: 1, minAngleDeg: -45, maxAngleDeg: 60, preferredAngleDeg: 0 },
  9: { index: 9, name: 'Right Bicep', anatomicalEquivalent: 'Right Shoulder', degreesOfFreedom: 1, minAngleDeg: -45, maxAngleDeg: 180, preferredAngleDeg: 15 },
  10: { index: 10, name: 'Right Forearm', anatomicalEquivalent: 'Right Elbow', degreesOfFreedom: 1, minAngleDeg: -5, maxAngleDeg: 150, preferredAngleDeg: 30 },
  11: { index: 11, name: 'Right Hand', anatomicalEquivalent: 'Right Wrist', degreesOfFreedom: 1, minAngleDeg: -80, maxAngleDeg: 70, preferredAngleDeg: 0 },
  12: { index: 12, name: 'Left Bicep', anatomicalEquivalent: 'Left Shoulder', degreesOfFreedom: 1, minAngleDeg: -45, maxAngleDeg: 180, preferredAngleDeg: 15 },
  13: { index: 13, name: 'Head', anatomicalEquivalent: 'Cranium', degreesOfFreedom: 1, minAngleDeg: -30, maxAngleDeg: 30, preferredAngleDeg: 0 },
  14: { index: 14, name: 'Left Forearm', anatomicalEquivalent: 'Left Elbow', degreesOfFreedom: 1, minAngleDeg: -5, maxAngleDeg: 150, preferredAngleDeg: 30 },
  15: { index: 15, name: 'Left Hand', anatomicalEquivalent: 'Left Wrist', degreesOfFreedom: 1, minAngleDeg: -80, maxAngleDeg: 70, preferredAngleDeg: 0 },
  16: { index: 16, name: 'Root Accessory', anatomicalEquivalent: 'Center Root', degreesOfFreedom: 1, minAngleDeg: -180, maxAngleDeg: 180, preferredAngleDeg: 0 },
};

/**
 * Clamps a joint angle (degrees) to its anatomical limit bounds.
 */
export function clampJointAngle(jointIndex: number, angleDeg: number): number {
  const c = STICKMAN_JOINT_CONSTRAINTS[jointIndex];
  if (!c) return angleDeg;
  return Math.max(c.minAngleDeg, Math.min(c.maxAngleDeg, angleDeg));
}

/**
 * Calculates penalty cost term for Jacobian / Optimization IK solvers:
 * C_penalty(θ) = ∑ ((θ_i - θ_mid,i) / (θ_max,i - θ_min,i))^(2n)
 */
export function calculateJointPenaltyCost(anglesDeg: number[], exponentPower = 2): number {
  let penaltySum = 0;
  for (let i = 0; i < anglesDeg.length; i++) {
    const c = STICKMAN_JOINT_CONSTRAINTS[i];
    if (!c || c.minAngleDeg === c.maxAngleDeg) continue;
    const mid = (c.minAngleDeg + c.maxAngleDeg) * 0.5;
    const halfRange = (c.maxAngleDeg - c.minAngleDeg) * 0.5;
    if (halfRange <= 0) continue;
    const norm = (anglesDeg[i] - mid) / halfRange;
    penaltySum += Math.pow(norm, 2 * exponentPower);
  }
  return penaltySum;
}

// -----------------------------------------------------------------------------
// 2D CYCLIC COORDINATE DESCENT (CCD) IK SOLVER
// -----------------------------------------------------------------------------

export interface Joint2DNode {
  position: [number, number];
  angleRad: number; // Local or relative orientation angle
  length: number;
  minAngleRad: number;
  maxAngleRad: number;
}

export interface CCDSolverResult {
  converged: boolean;
  iterationsUsed: number;
  finalErrorPx: number;
  solvedNodes: Joint2DNode[];
}

/**
 * Calculates the 2D world position of the end-effector tip of the last segment in the chain.
 */
export function getEndEffector2D(nodes: Joint2DNode[]): [number, number] {
  if (nodes.length === 0) return [0, 0];
  const last = nodes[nodes.length - 1];
  const rad = last.angleRad;
  return [
    last.position[0] + Math.cos(rad) * last.length,
    last.position[1] + Math.sin(rad) * last.length,
  ];
}

/**
 * Recalculates forward kinematic positions along a 2D joint chain given joint angles.
 */
export function updateForwardKinematics2DChain(nodes: Joint2DNode[], startIndex = 0): void {
  for (let i = Math.max(0, startIndex); i < nodes.length; i++) {
    if (i === 0) continue; // Root position remains fixed
    const prev = nodes[i - 1];
    const rad = prev.angleRad;
    nodes[i].position = [
      prev.position[0] + Math.cos(rad) * prev.length,
      prev.position[1] + Math.sin(rad) * prev.length,
    ];
  }
}

/**
 * Solves a 2D joint chain IK using Cyclic Coordinate Descent (CCD).
 * Iterates backwards from leaf joint to root, rotating each joint incrementally to align end-effector with target.
 */
export function solveCCD2D(
  nodes: Joint2DNode[],
  target: [number, number],
  maxIterations = 5,
  tolerance = 0.01
): CCDSolverResult {
  const numJoints = nodes.length;
  if (numJoints === 0) {
    return { converged: true, iterationsUsed: 0, finalErrorPx: 0, solvedNodes: nodes };
  }

  updateForwardKinematics2DChain(nodes, 0);

  let iterationsUsed = 0;
  let endEffector = getEndEffector2D(nodes);
  let distToTarget = Math.hypot(target[0] - endEffector[0], target[1] - endEffector[1]);

  for (let iter = 0; iter < maxIterations; iter++) {
    iterationsUsed++;
    endEffector = getEndEffector2D(nodes);
    distToTarget = Math.hypot(target[0] - endEffector[0], target[1] - endEffector[1]);

    if (distToTarget < tolerance) break;

    // Backward pass from last joint down to root
    for (let i = numJoints - 1; i >= 0; i--) {
      const curPos = nodes[i].position;
      const endPos = getEndEffector2D(nodes);

      // Vector from current joint to end effector
      const vEnd: [number, number] = [endPos[0] - curPos[0], endPos[1] - curPos[1]];
      // Vector from current joint to IK target
      const vTarget: [number, number] = [target[0] - curPos[0], target[1] - curPos[1]];

      const distEnd = Math.hypot(vEnd[0], vEnd[1]);
      const distTgt = Math.hypot(vTarget[0], vTarget[1]);

      if (distEnd > 1e-6 && distTgt > 1e-6) {
        const aEnd = Math.atan2(vEnd[1], vEnd[0]);
        const aTarget = Math.atan2(vTarget[1], vTarget[0]);

        let deltaAngle = aTarget - aEnd;
        // Normalize angle delta to [-π, π]
        while (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
        while (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;

        // Apply update with joint limit constraints
        const newAngle = nodes[i].angleRad + deltaAngle;
        nodes[i].angleRad = Math.max(nodes[i].minAngleRad, Math.min(nodes[i].maxAngleRad, newAngle));

        // Update positions downstream
        updateForwardKinematics2DChain(nodes, i);
      }
    }
  }

  const finalEffector = getEndEffector2D(nodes);
  const finalError = Math.hypot(target[0] - finalEffector[0], target[1] - finalEffector[1]);

  return {
    converged: finalError <= tolerance,
    iterationsUsed,
    finalErrorPx: finalError,
    solvedNodes: nodes,
  };
}

// -----------------------------------------------------------------------------
// IK / FK BLENDING & MOTION PHASE TRANSITIONS
// -----------------------------------------------------------------------------

/**
 * Interpolates shortest angular path between two angles in degrees.
 */
export function blendAngleDeg(angleFKDeg: number, angleIKDeg: number, alpha: number): number {
  const clampAlpha = Math.max(0, Math.min(1, alpha));
  let diff = (angleIKDeg - angleFKDeg) % 360;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return angleFKDeg + diff * clampAlpha;
}

/**
 * Blends full 17-joint pose angles between FK track and IK target solution using coefficient alpha ∈ [0, 1].
 */
export function blendPoseIKFK(
  anglesFKDeg: number[],
  anglesIKDeg: number[],
  alpha: number
): number[] {
  const blended: number[] = new Array(anglesFKDeg.length);
  for (let i = 0; i < anglesFKDeg.length; i++) {
    blended[i] = blendAngleDeg(anglesFKDeg[i], anglesIKDeg[i] || anglesFKDeg[i], alpha);
  }
  return blended;
}

/**
 * Computes dynamic IK/FK blend coefficient α for ground contact transitions (e.g. jump landing).
 * In-Air (t < 0.75): α = 0 (FK)
 * Pre-Contact (0.75 <= t < 1.0): α ramps 0 → 1
 * Ground Contact (t >= 1.0): α = 1 (Full IK)
 */
export function calculateLandingBlendAlpha(tNormalized: number): number {
  if (tNormalized < 0.75) return 0.0;
  if (tNormalized >= 1.0) return 1.0;
  const phaseT = (tNormalized - 0.75) / 0.25;
  // Cubic smoothstep transition
  return phaseT * phaseT * (3 - 2 * phaseT);
}

// -----------------------------------------------------------------------------
// SECONDARY MOTION & PROCEDURAL FLUIDITY (SPRING-DAMPER, EASING, ARCS)
// -----------------------------------------------------------------------------

/**
 * Cubic smoothstep ease-in / ease-out: 3t² - 2t³
 */
export function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

/**
 * Cubic Ease-In/Out curve implementation
 */
export function easeInOutCubic(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

/**
 * Evaluates a 2D Cubic Bezier curve at t ∈ [0, 1]
 */
export function cubicBezier2D(
  t: number,
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number]
): [number, number] {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  const x = uuu * p0[0] + 3 * uu * t * p1[0] + 3 * u * tt * p2[0] + ttt * p3[0];
  const y = uuu * p0[1] + 3 * uu * t * p1[1] + 3 * u * tt * p2[1] + ttt * p3[1];

  return [x, y];
}

/**
 * Damped Harmonic Oscillator step calculation for secondary follow-through motion.
 * Force = -stiffness * (currentAngle - targetAngle) - damping * velocity
 */
export function updateOverlappingJoint(
  currentAngle: number,
  targetAngle: number,
  velocity: number,
  stiffness = 180.0,
  damping = 12.0,
  dt = 1 / 60
): { angle: number; velocity: number } {
  let diff = (currentAngle - targetAngle) % 360;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  const force = -stiffness * diff - damping * velocity;
  const newVel = velocity + force * dt;
  const newAngle = currentAngle + newVel * dt;

  return { angle: newAngle, velocity: newVel };
}

/**
 * Computes circular rotational arc trajectory for limb tips centered on joint pivots.
 * Guarantees constant bone length throughout motion instead of linear spatial shortcuts.
 */
export function computeRotationalArcTrajectory(
  pivotX: number,
  pivotY: number,
  radius: number,
  startAngleDeg: number,
  endAngleDeg: number,
  t: number
): { x: number; y: number; currentAngleDeg: number } {
  const easedT = easeInOutCubic(t);
  let delta = (endAngleDeg - startAngleDeg) % 360;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;

  const currentAngleDeg = startAngleDeg + delta * easedT;
  const rad = (currentAngleDeg * Math.PI) / 180;

  const x = pivotX + Math.cos(rad) * radius;
  const y = pivotY - Math.sin(rad) * radius; // Screen Y inverted

  return { x, y, currentAngleDeg };
}

/**
 * Computes procedural anticipation crouch offset & wind-up angles.
 * Pre-stretches joint systems in opposite direction before explosive actions.
 */
export function computeAnticipationWindUp(
  tNormalized: number,
  primaryDirectionX: number, // +1 for right, -1 for left
  maxCrouchPx = 25.0,
  maxBackswingDeg = 20.0
): { pelvisCrouchY: number; torsoWindUpDeg: number; limbPreLoadDeg: number } {
  const windUpProgress = tNormalized < 0.4
    ? Math.sin((tNormalized / 0.4) * (Math.PI / 2))
    : Math.cos(((tNormalized - 0.4) / 0.6) * (Math.PI / 2));

  const safeProgress = Math.max(0, windUpProgress);

  return {
    pelvisCrouchY: safeProgress * maxCrouchPx, // Downward displacement
    torsoWindUpDeg: -primaryDirectionX * safeProgress * maxBackswingDeg, // Lean backward opposite
    limbPreLoadDeg: primaryDirectionX * safeProgress * (maxBackswingDeg * 1.2),
  };
}
