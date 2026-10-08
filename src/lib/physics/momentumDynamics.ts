import { Vector2D } from './types';
import { RIG_SEGMENT_MASS_RATIOS } from './dynamicBalanceSolver';
import { JointWorldPose } from '../skills/kinematicsSolvers';

/**
 * Calculates whole-body moment of rotational inertia I = sum(m_i * r_i^2)
 */
export function calculateRotationalInertia(
  joints: JointWorldPose[],
  com: Vector2D,
  charMass = 100.0
): number {
  let inertia = 0;
  for (let i = 0; i < 17; i++) {
    const j = joints[i];
    if (!j) continue;
    const m = (RIG_SEGMENT_MASS_RATIOS[i] || 0.01) * charMass;
    const midX = (j.startX + j.endX) * 0.5;
    const midY = (j.startY + j.endY) * 0.5;
    const dx = midX - com.x;
    const dy = midY - com.y;
    const r2 = dx * dx + dy * dy;
    inertia += m * r2;
  }
  return inertia;
}

/**
 * Generates a physically plausible non-linear deceleration braking ramp (Section 14)
 * Returns array of velocities ramping from initial velocity down to 0 over `steps` frames
 */
export function generateBrakingDecelerationRamp(
  initialVelocity: number,
  steps = 4
): number[] {
  if (steps <= 1) return [0];
  // Natural braking deceleration curve weights (e.g. 10 : 6 : 3 : 1)
  const weights = [1.0, 0.60, 0.25, 0.08, 0.0];
  const result: number[] = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    // Smooth-step decay
    const factor = Math.max(0, 1 - (3 * t * t - 2 * t * t * t));
    result.push(initialVelocity * factor);
  }
  return result;
}

/**
 * Computes pelvic-thoracic counter-rotation angle to conserve angular momentum around vertical spine
 */
export function computeThoracicCounterRotation(
  pelvicYawDeg: number,
  couplingFactor = 0.45
): number {
  // Thorax counter-rotates in anti-phase to pelvis
  return -pelvicYawDeg * couplingFactor;
}

/**
 * Damped harmonic oscillator for secondary overshoot and settle
 * Returns offset value at normalized time t
 */
export function dampedHarmonicOscillation(
  amplitude: number,
  timeStep: number,
  dampingRatio = 0.35,
  naturalFrequency = 1.2
): number {
  const envelope = Math.exp(-dampingRatio * naturalFrequency * timeStep);
  const oscillation = Math.cos(naturalFrequency * Math.sqrt(Math.max(0, 1 - dampingRatio * dampingRatio)) * timeStep);
  return amplitude * envelope * oscillation;
}
