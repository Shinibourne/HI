/**
 * GENERAL-PURPOSE BIOMECHANICAL & PHYSICAL PRIMITIVES
 * ====================================================
 * Medium-independent state definitions, physical parameters, support states,
 * and frame representations for procedural animation.
 */

import { JointWorldPose } from '../skills/kinematicsSolvers';

export type SupportState =
  | 'SWING'
  | 'APPROACH'
  | 'CONTACT'
  | 'LOAD'
  | 'PLANT'
  | 'UNLOAD'
  | 'RELEASE';

export type ContactType =
  | 'VISUAL'
  | 'ACTUAL_SUPPORT'
  | 'WEIGHT_BEARING'
  | 'LIGHT_TOUCH'
  | 'SLIDING'
  | 'PIVOTING'
  | 'TOE'
  | 'HEEL'
  | 'AIRBORNE'
  | 'UNSTABLE';

export type BalanceStrategy =
  | 'ANKLE'
  | 'HIP'
  | 'ARM_COUNTERBALANCE'
  | 'STEPPING'
  | 'NONE';

export interface Vector2D {
  x: number;
  y: number;
}

export interface ForceVector {
  source: string;
  targetJointIndex: number;
  force: Vector2D; // Newtons or normalized force units
  torque: number; // Lever-arm moment
}

export interface SupportPoint {
  id: string;
  name: string;
  jointIndex: number;
  position: Vector2D;
  state: SupportState;
  contactType: ContactType;
  normalForceFraction: number; // 0.0 to 1.0 (fraction of total weight borne)
  isPlanted: boolean;
}

export interface ObjectState {
  id: string;
  name: string;
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  mass: number;
  relativeMass: number; // mass / characterMass
  radius: number;
  orientation: number; // degrees
  angularVelocity: number; // deg / frame
  rotationalInertia: number;
  contactState: 'FREE' | 'HELD' | 'RESTING' | 'IMPACTING' | 'SLIDING';
  attachedTo: {
    characterId: string;
    jointIndex: number;
    gripOffset: Vector2D;
  } | null;
  contactPoint: Vector2D | null;
}

export interface MotionIntent {
  action:
    | 'LIFT'
    | 'CARRY'
    | 'PUSH'
    | 'PULL'
    | 'CATCH'
    | 'THROW'
    | 'STRIKE'
    | 'LOCOMOTION'
    | 'BALANCE_RECOVERY';
  targetObjectId?: string;
  targetPosition?: Vector2D;
  effortLevel: number; // 0.0 to 1.0
  style: 'NATURAL' | 'MARTIAL' | 'EXAGGERATED';
}

export interface ConfigurablePhysicsParams {
  gravity: number; // Default 980 px/s^2 or 9.8 normalized
  characterMass: number; // Default 100.0
  objectMass: number; // Configurable (e.g. 5 to 60)
  scale: number; // Default 0.5
  groundPlane: number; // Default 755.0 px
  friction: number; // Default 0.70
  contactThreshold: number; // Default 12.0 px
  balanceThreshold: number; // Default 25.0 px
  forceCoefficients: {
    muscle: number;
    damping: number;
    spring: number;
  };
  damping: number; // Default 0.85
  restitution: number; // Default 0.60
  worldDimensions: {
    width: number;
    height: number;
  };
}

export const DEFAULT_PHYSICS_PARAMS: ConfigurablePhysicsParams = {
  gravity: 980.0,
  characterMass: 100.0,
  objectMass: 35.0,
  scale: 0.5,
  groundPlane: 755.0,
  friction: 0.70,
  contactThreshold: 12.0,
  balanceThreshold: 25.0,
  forceCoefficients: {
    muscle: 1.0,
    damping: 0.85,
    spring: 0.75,
  },
  damping: 0.85,
  restitution: 0.60,
  worldDimensions: {
    width: 1280,
    height: 960,
  },
};

/**
 * Universal FrameState Representation (Section 27)
 * Captures full biomechanical, kinematic, dynamic, and contact state per frame.
 */
export interface FrameState {
  time: number;
  frameIndex: number;
  rootPosition: Vector2D;
  rootVelocity: Vector2D;
  rootAcceleration: Vector2D;
  jointPositions: JointWorldPose[];
  jointAngles: number[]; // 17 angles in degrees
  jointVelocities: number[];
  jointAngularVelocities: number[];
  centerOfMass: Vector2D;
  centerOfMassVelocity: Vector2D;
  extrapolatedCoM: Vector2D;
  supportPoints: SupportPoint[];
  contactStates: Record<string, SupportState>;
  activeForces: ForceVector[];
  externalForces: ForceVector[];
  externalTorques: { jointIndex: number; torque: number; momentArm: number }[];
  carriedObjects: string[];
  objectStates: ObjectState[];
  momentum: Vector2D;
  angularMomentum: number;
  balanceMargin: number;
  balanceStrategy: BalanceStrategy;
  motionPhase: string;
  intent: MotionIntent;
  notes: string;
}

export interface GeneralPhysicsKeyframeSpec {
  frame: number;
  act: string;
  phaseName: string;
  charX: number;
  charY: number;
  angles: number[];
  objPresent: boolean;
  objX: number;
  objY: number;
  objState: 'FREE' | 'HELD' | 'RESTING' | 'IMPACTING';
  objMass: number;
  leverArmPx: number;
  torqueDemand: number;
  comX: number;
  comY: number;
  isBalanced: boolean;
  supportMargin: number;
  activeForceChain: string;
  notes: string;
}

export interface QualityDomainResult {
  domain: string;
  skillsChecked: string;
  passed: boolean;
  score: number;
  summary: string;
  technicalProof: string;
}

export interface BiomechanicalAuditReport {
  overallVerdict: 'PASS' | 'WARNING' | 'FAIL';
  overallScore: number;
  frameCount: number;
  domains: QualityDomainResult[];
  failureDiagnostics: string[];
}
