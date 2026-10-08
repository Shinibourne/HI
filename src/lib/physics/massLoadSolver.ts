import { Vector2D, ObjectState, ConfigurablePhysicsParams, ForceVector } from './types';
import { JointWorldPose } from '../skills/kinematicsSolvers';

export interface LoadLeverageReport {
  objectMass: number;
  characterMass: number;
  relativeMass: number;
  leverArmX: number; // distance from spine / CoM
  leverArmY: number;
  torqueDemand: number; // load magnitude * lever arm
  requiredTorsoCounterLeanDeg: number;
  requiredPelvicShiftX: number;
  requiredContralateralArmAbductionDeg: number;
  posturalDifficulty: 'TRIVIAL' | 'MODERATE' | 'SEVERE';
}

export interface LiftingPhasesSolverResult {
  currentPhase: 'PREPARATION' | 'CONTACT' | 'LIFT' | 'STABILIZE';
  pelvisY: number;
  pelvisX: number;
  torsoAngleDeg: number;
  leftKneeFlexDeg: number;
  rightKneeFlexDeg: number;
  armExtensionProgress: number;
  gripAttached: boolean;
  notes: string;
}

export interface CatchYieldReport {
  incomingVelocity: Vector2D;
  incomingMass: number;
  impulseMagnitude: number;
  yieldingElbowFlexionDeg: number;
  torsoBackwardCompressionDeg: number;
  pelvisBackwardShiftPx: number;
}

/**
 * Calculates rotational demand (Torque) and postural compensations for carried or held loads
 */
export function calculateLoadLeverage(
  charMass: number,
  objMass: number,
  charSpineX: number,
  objX: number,
  objY: number,
  spineTopY: number,
  gravity = 9.8
): LoadLeverageReport {
  const relMass = objMass / Math.max(1, charMass);
  const leverArmX = objX - charSpineX;
  const leverArmY = objY - spineTopY;

  // Normalized torque demand: leverArmX (px) * (objMass / 100)
  const torqueDemand = leverArmX * relMass * (gravity / 9.8);

  // Biological counter-lean: proportional to torque demand
  // Positive lever arm (object in front/right) requires negative torso lean (lean backward/left)
  const leanScale = 0.22; // deg per unit torque
  const rawLean = -torqueDemand * leanScale;
  const requiredTorsoCounterLeanDeg = Math.max(-22.0, Math.min(22.0, rawLean));

  // Pelvis shifts opposite to the object to balance system COM
  const requiredPelvicShiftX = -Math.sign(leverArmX) * Math.min(28.0, Math.abs(leverArmX) * relMass * 0.45);

  // Contralateral arm abducts outward as an inertial counterbalance
  const requiredContralateralArmAbductionDeg = Math.min(65.0, Math.abs(torqueDemand) * 0.9);

  const absTorque = Math.abs(torqueDemand);
  const posturalDifficulty =
    absTorque > 40.0 ? 'SEVERE' : absTorque > 15.0 ? 'MODERATE' : 'TRIVIAL';

  return {
    objectMass: objMass,
    characterMass: charMass,
    relativeMass: relMass,
    leverArmX,
    leverArmY,
    torqueDemand,
    requiredTorsoCounterLeanDeg,
    requiredPelvicShiftX,
    requiredContralateralArmAbductionDeg,
    posturalDifficulty,
  };
}

/**
 * Solves compliant arm yield on catching an incoming projectile
 */
export function solveCatchMomentumYield(
  objMass: number,
  objVelocity: Vector2D,
  charMass: number
): CatchYieldReport {
  const speed = Math.sqrt(objVelocity.x * objVelocity.x + objVelocity.y * objVelocity.y);
  const impulse = (objMass * speed) / 10.0;

  // Arms flex to absorb momentum over contact time
  const yieldingElbowFlexionDeg = Math.min(48.0, 10.0 + impulse * 0.85);
  const torsoBackwardCompressionDeg = Math.min(18.0, impulse * 0.35);
  const pelvisBackwardShiftPx = Math.min(20.0, impulse * 0.4);

  return {
    incomingVelocity: objVelocity,
    incomingMass: objMass,
    impulseMagnitude: impulse,
    yieldingElbowFlexionDeg,
    torsoBackwardCompressionDeg,
    pelvisBackwardShiftPx,
  };
}

/**
 * Solves collision impulse and recoil when striking an object
 */
export function solveStrikingOutcome(
  limbMass: number,
  limbVelocity: Vector2D,
  objMass: number,
  restitution = 0.5
): {
  objVelocityAfter: Vector2D;
  charRecoilVelocity: Vector2D;
  hitStopFrames: number;
} {
  const totalM = limbMass + objMass;
  const factor = (1 + restitution) / totalM;

  const objVx = factor * limbMass * limbVelocity.x;
  const objVy = factor * limbMass * limbVelocity.y;

  // Character limb recoil is proportional to the object mass resisting the strike
  const recoilFactor = (objMass / totalM) * 0.55;
  const charRecoilVx = -limbVelocity.x * recoilFactor;
  const charRecoilVy = -limbVelocity.y * recoilFactor;

  const hitStopFrames = objMass > 30.0 ? 2 : 1;

  return {
    objVelocityAfter: { x: objVx, y: objVy },
    charRecoilVelocity: { x: charRecoilVx, y: charRecoilVy },
    hitStopFrames,
  };
}
