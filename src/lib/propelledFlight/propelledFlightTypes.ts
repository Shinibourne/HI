import { StickfigureKeyframeSpec } from '../stknds/stkndsCore';

export interface PropelledFlightGeneratorConfig {
  projectName?: string;
  targetFps: 12 | 24;
  interpolate24FpsFrames?: boolean;
  launchAngleDeg?: number; // Ground launch direction vector angle
  flightApexY?: number; // Target sky altitude (scene Y coordinate)
  sprintMaxVelocityPx?: number; // Horizontal sprint speed prior to launch
  compressionDipPx?: number; // Deep loading crouch vertical drop
  launchPowerMult?: number; // Explosive kinetic extension multiplier
  primaryColorHex?: string;
  headColorHex?: string;
}

export interface PropelledFlightPhaseSpec {
  act: string;
  phase: string;
  frameIndex: number;
  isFlightFrame: boolean;
  flightStepIndex?: number;
  sfxTrigger?: string;
  cameraShakePx?: number;
  cameraZoom?: number;
}

export interface BiomechanicalPropelledFlightMetrics {
  passed: boolean;
  score: number;
  walkToRunVelocityAccel: boolean;
  strideFrequencyIncrease: boolean;
  kneeCompressionDepthPx: number;
  launchDisplacementPx: number;
  airborneCruisingSpeedPx: number;
  cameraAnticipationAndShake: boolean;
  sfxSyncCount: number;
  pelvicOscillationWave: boolean;
  maxJointDeltaDeg: number;
  violations: string[];
}
