/**
 * THE STROLL & KICK: 216-FRAME PROCEDURAL BIOMECHANICAL CHOREOGRAPHY (v1.0)
 * =========================================================================
 * Full kinematic sequence built from research-based joint angles and IK:
 *
 * SETUP & SCENE CONSTRAINTS:
 * - One standard 17-node stickfigure, scale 0.5, facing right (+X).
 * - One orange ball (radius ~18 px, resting at (900, 737) on Ground Y = 755).
 * - Ground Plane: Y = 755.0 px (Standing Pelvis Y = 510, Seated Pelvis Y = 726).
 * - 24 FPS, 216 frames (9.0 seconds).
 * - Decoupled camera tracking: static -> follow walk -> follow run -> follow ball.
 *
 * THE 9 BIOMECHANICAL ACTS & 16 STORYBOARD PANELS:
 * - Act A (F000-018): Seated floor rest, knees up, feet flat, forearm on knee, hand planted, breathing.
 * - Act B (F019-071): Squat rise: hands plant, trunk folds 35-45°, hips launch into deep squat, extension to stand.
 * - Act C (F072-081): Standing equilibrium, arms loosen, forward COM lean 3-5°, weight shift.
 * - Act D (F082-111): Relaxed stroll, acceleration (3->6->8->10 px/f), authentic walk angles, pelvis bob ±4px.
 * - Act E (F112-129): Notices ball: head snaps down, stride breaks into friction brake plant, hesitation hold.
 * - Act F (F130-153): Excited jump in place: crouch, launch, airborne apex (+70px), landing cushion at Y=755.
 * - Act G (F154-165): Sprint to ball: explosive forward lean, arms 90°, high heel fold to butt, plant step.
 * - Act H (F166-175): Kick: support foot pinned at (880, 755), backswing 110°, whip, impact at (884, 735), 1f hit-stop.
 * - Act I (F176-215): Ball launch (vx=+40, vy=-44, g=+2.4), high follow-through, fist pump, moving hold.
 */


export interface SitWalkKickKeyframeSpec {
  frame: number; // 0..215
  act: string;
  phase: string;
  // Character Root & Pose
  manX: number;
  manY: number;
  manAngles: number[]; // 17 world angles in degrees (0=Right, +90=Up, -90=Down, 180=Left)
  // Procedural Kinematics & Dynamic Balance
  comX: number;
  comY: number;
  supportMinX: number;
  supportMaxX: number;
  isGrounded: boolean;
  isBalanced: boolean;
  stabilityMargin: number;
  // Full-Body Reactivity Telemetry
  thoracicTorsionDeg?: number;
  armElbowFlexionDeg?: number;
  kineticWhipRecoilDeg?: number;
  headGazeStabilization?: string;
  // Ball State
  ballX: number;
  ballY: number;
  ballActive: boolean;
  // Camera Decoupling
  camX: number;
  camY: number;
  camZoom: number;
  // Storyboard Metadata
  panelId: number;
  storyboardTitle: string;
  notes: string;
}

export interface SitWalkKickGeneratorConfig {
  projectName: string;
  targetFps: 12 | 24;
  manColorHex: string; // Default #1E293B
  ballColorHex: string; // Default #EA580C
  ballRadius: number; // Default 18 px
  enableHitStop: boolean; // Default true
}

export interface BiomechanicalAuditItem {
  id: string;
  label: string;
  passed: boolean;
  metric: string;
  threshold: string;
  detail: string;
}

export interface BiomechanicalAuditReport {
  passed: boolean;
  totalChecks: number;
  passedChecks: number;
  items: BiomechanicalAuditItem[];
}


export interface StrollKickPanelMeta {
  panelNumber: number;
  title: string;
  startFrame: number;
  endFrame: number;
  frameRangeStr: string;
  actionSummary: string;
}
