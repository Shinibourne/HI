export interface CombatKeyframeSpec {
  frame: number; // 0..119 (24 FPS) or 0..59 (12 FPS)
  act: string;
  technique: string;
  phase: string;

  // Character Root & Pose (17-bone kinetic hierarchy)
  manX: number;
  manY: number;
  bodyRotationDeg: number;
  manAngles: number[]; // 17 world angles in degrees (0=Right, 90=Up, -90=Down, 180=Left)

  // Combat Target & Hit Impact Telemetry
  targetX: number;
  targetY: number;
  isHitFrame: boolean;
  hitType: 'none' | 'jab' | 'cross' | 'liver-hook' | 'uppercut' | 'back-kick' | 'flying-knee' | 'elbow';
  hitIntensity: number; // 0.0 .. 1.0

  // Center of Mass & Dynamic Equilibrium
  comX: number;
  comY: number;
  supportMinX: number;
  supportMaxX: number;
  isGrounded: boolean;
  isBalanced: boolean;
  stabilityMargin: number;

  // Biomechanical & Kinetic Telemetry
  kineticVelocityX: number;
  kineticVelocityY: number;
  strikeSpeedPxPerFrame: number;
  leadShoulderElevation: number;
  torsoCounterRotationDeg: number;
  angularVelocityDegPerFrame: number;

  // Virtual Camera
  camX: number;
  camY: number;
  camZoom: number;

  // Storyboard Metadata
  panelId: number;
  storyboardTitle: string;
  notes: string;
  activeForces: string[];
  kineticChainDesc: string;
}

export interface CombatGeneratorConfig {
  projectName: string;
  targetFps: 12 | 24;
  fighterColorHex: string; // Default #0F172A
  accentColorHex: string; // Default #EF4444 (Crimson strike accent)
  groundY: number; // Default 755.0
  enableHitSparks: boolean;
  enableSpeedTrails: boolean;
  showTargetDummy: boolean;
}

export interface CombatStoryboardPanel {
  panelNumber: number;
  title: string;
  startFrame: number;
  endFrame: number;
  frameRangeStr: string;
  technique: string;
  actionSummary: string;
  biomechanicalPhase: string;
  keyPrinciples: string[];
}
