export type BallState =
  | 'RESTING'
  | 'HELD'
  | 'PROJECTILE'
  | 'CAUGHT'
  | 'DRIBBLE_PUSH'
  | 'DRIBBLE_GROUND_IMPACT'
  | 'DRIBBLE_REBOUND'
  | 'DRIBBLE_RECEIVE';

export interface BasketballKeyframeSpec {
  frame: number; // 0..23 (Total 24 frames)
  timeSeconds: number; // Seconds (0.00 to 0.96s)
  phaseIndex: number; // 0..9
  phaseName: string;
  subEventName: string;
  ballState: BallState;

  // Character Root & 17 World Angles (degrees: 0=Right, +90=Up, -90=Down, 180=Left)
  charX: number;
  charY: number;
  angles: number[];

  // Ball State & Coordinates
  ballX: number;
  ballY: number;
  ballVy: number;
  contactDist: number; // Distance between hand contact point and ball center (px)
  handContactPoint: { x: number; y: number };

  // Biomechanics & Dynamic Balance Telemetry
  comX: number;
  comY: number;
  supportMinX: number;
  supportMaxX: number;
  isGrounded: boolean;
  isStaticallyBalanced: boolean;
  stabilityMargin: number;

  // Joint Angles & Kinematic Audit Metrics
  rKneeFlexDeg: number;
  lKneeFlexDeg: number;
  rElbowFlexDeg: number;
  lElbowFlexDeg: number;
  torsoLeanDeg: number;
  neckAngleDeg: number;

  // Virtual Camera
  camX: number;
  camY: number;
  camZoom: number;

  // Documentation notes
  notes: string;
}

export interface BasketballGeneratorConfig {
  projectName: string;
  targetFps: 12 | 24;
  charColorHex: string; // Default #0F172A
  ballColorHex: string; // Default #EA580C
  ballRadius: number; // Default 18 px (diameter 36 px)
  groundY: number; // Default 755 px
}

export interface BasketballAuditItem {
  id: string;
  ruleNumber: number;
  label: string;
  passed: boolean;
  metric: string;
  threshold: string;
  detail: string;
}

export interface BasketballAuditReport {
  passed: boolean;
  totalChecks: number;
  passedChecks: number;
  items: BasketballAuditItem[];
}

export interface RigInventoryEntry {
  partName: string;
  nodeIndex: number;
  parentIndex: number;
  lengthPx: number;
  lengthMeters: number;
  thickness: number;
  drawOrder: number;
  role: string;
}

export interface ScaleDefinition {
  groundY: number;
  humanHeightMeters: number;
  humanStandingHeightPx: number;
  pxPerMeter: number;
  ballDiameterMeters: number;
  ballDiameterPx: number;
  ballRadiusPx: number;
  gravityMetersPerSec2: number;
  gravityPxPerFrame2: number;
  restitutionCoeff: number;
}


export interface EventTimelineEntry {
  frame: number;
  timeSec: number;
  phaseId: number;
  phaseLabel: string;
  eventName: string;
  ballState: BallState;
  biomechanicalAction: string;
}
