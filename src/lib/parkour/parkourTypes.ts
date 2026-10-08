/**
 * PARKOUR ACROBAT: RUN ➔ JUMP ➔ ROLL ➔ BACKFLIP (v1.0)
 * =========================================================================
 * Full procedural biomechanical choreography built from physics skills:
 *
 * THE 6 BIOMECHANICAL ACTS & 10 STORYBOARD PANELS:
 * - Act I   (F00-F23): Athletic Sprint Acceleration (anti-phase arms, forward torso lean, ground pinning)
 * - Act II  (F24-F37): Hurdle Dive Jump (lead foot punch, airborne cat dive parabolic arc, arm reach)
 * - Act III (F38-F55): Parkour Shoulder Roll (hands yield at ground, chin tucks, scapular roll, hip sweep exit)
 * - Act IV  (F56-F65): Rebound Plant & Squat Block (feet pin, deep knee compression, arms backswing preload)
 * - Act V   (F66-F83): Explosive Backflip 360° (upward arm whip, tight mid-air tuck, inverted apex, aerial rotation)
 * - Act VI  (F84-F95): Landing Cushion & Heroic Equilibrium (toes contact ground, deep knee shock absorption, upright settle)
 */

export interface ParkourKeyframeSpec {
  frame: number; // 0..95 (24 FPS) or 0..47 (12 FPS)
  act: string;
  phase: string;
  
  // Character Root & Pose
  manX: number;
  manY: number;
  bodyRotationDeg: number;
  manAngles: number[]; // 17 world angles in Stick Nodes standard (0=Right, 90=Up, -90=Down, 180=Left)
  
  // Kinematics & Dynamic Balance
  comX: number;
  comY: number;
  supportMinX: number;
  supportMaxX: number;
  isGrounded: boolean;
  isBalanced: boolean;
  stabilityMargin: number;
  
  // Biomechanical Telemetry
  kineticVelocityX: number;
  kineticVelocityY: number;
  angularVelocityDegPerFrame: number;
  kneeFlexionDeg: number;
  landingCompressionPx: number;
  
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

export interface ParkourGeneratorConfig {
  projectName: string;
  targetFps: 12 | 24;
  manColorHex: string; // Default #0F172A
  accentColorHex: string; // Default #0284C7
  groundY: number; // Default 755.0
  jumpApexY: number; // Default 590.0
  backflipApexY: number; // Default 390.0
  enableMotionTrails: boolean;
}

export interface ParkourStoryboardPanel {
  panelNumber: number;
  title: string;
  startFrame: number;
  endFrame: number;
  frameRangeStr: string;
  actionSummary: string;
  biomechanicalPhase: string;
  keyPrinciples: string[];
}
