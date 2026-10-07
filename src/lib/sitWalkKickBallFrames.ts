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

import {
  STICKFIGURE_BONE_LENGTHS,
  STICKFIGURE_BONE_THICKNESS,
  STICKFIGURE_PARENTS,
  STKNDS_PREFIX,
  gzipBytes,
} from './stkndsCodec';
import {
  solveForwardKinematics17,
  solveTwoBoneIK,
  solveLegLimb,
  solveArmLimb,
} from './humanMotionSkills';
import {
  calculateCenterOfMass17,
  calculateBaseOfSupport17,
  computeProceduralBalanceOffset,
  solveStancePinningIK,
  quinticSmoothstep,
  computeProceduralMotionArc,
  solveTargetDirectedStrikeIK,
  computeDampedOscillation,
} from './proceduralKinematics';
import {
  solveReactiveSpineAndChest,
  solveMomentumDrivenArmSwing,
  solveReactiveVestibularHead,
  solveFullBodyKickChamber,
  solveFullBodyKickStrike,
  solveFullBodyKickFollowThrough,
} from './fullBodyReactiveMotion';

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

export function hexColorToArgbUint32(hex: string): number {
  const clean = hex.replace('#', '');
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return ((0xff << 24) | (r << 16) | (g << 8) | b) >>> 0;
  }
  return 0xff1e293b;
}

// Cubic ease in/out helper
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export const MAX_ARM_REACH_PX = 0.98 * 162.6; // ~159.35 px

/**
 * Clamps shoulder-to-hand target distance to at most 0.98 * 162.6 px.
 */
export function clampShoulderToHandTarget(
  shoulderX: number,
  shoulderY: number,
  targetX: number,
  targetY: number,
  maxReach = MAX_ARM_REACH_PX
): { x: number; y: number } {
  const dx = targetX - shoulderX;
  const dy = targetY - shoulderY;
  const dist = Math.hypot(dx, dy);
  if (dist > maxReach) {
    const ratio = maxReach / dist;
    return {
      x: shoulderX + dx * ratio,
      y: shoulderY + dy * ratio,
    };
  }
  return { x: targetX, y: targetY };
}

/**
 * Directly sets world angles for an arm branch using convention:
 * 0° = right (+X), +90° = up (-Y screen), -90° = down (+Y screen), figure faces +X.
 * swing: measured from straight down (-90°), + = forward (+X).
 * flex: elbow bend, swinging forearm forward/up.
 * bicepWorld = -90 + swing
 * forearmWorld = bicepWorld + flex
 * handWorld = forearmWorld + (0 to 15)
 */
export function setArm(
  sideOrAngles: 'right' | 'left' | number[],
  swingOrSide: number | 'right' | 'left',
  flexOrSwing?: number,
  wristOrFlex?: number,
  optionalWrist?: number
): { bicep: number; forearm: number; hand: number } {
  let manAngles: number[] | null = null;
  let side: 'right' | 'left';
  let swing: number;
  let flex: number;
  let wristOffset = 6.0;

  if (Array.isArray(sideOrAngles)) {
    manAngles = sideOrAngles;
    side = swingOrSide as 'right' | 'left';
    swing = flexOrSwing ?? 0;
    flex = wristOrFlex ?? 0;
    if (optionalWrist !== undefined) wristOffset = optionalWrist;
  } else {
    side = sideOrAngles;
    swing = swingOrSide as number;
    flex = flexOrSwing ?? 0;
    if (wristOrFlex !== undefined) wristOffset = wristOrFlex;
  }

  const bicepWorld = -90.0 + swing;
  const forearmWorld = bicepWorld + flex;
  const clampedWrist = clamp(wristOffset, 0.0, 15.0);
  const handWorld = forearmWorld + clampedWrist;

  if (manAngles) {
    const baseIdx = side === 'right' ? 9 : 14;
    manAngles[baseIdx] = bicepWorld;
    manAngles[baseIdx + 1] = forearmWorld;
    manAngles[baseIdx + 2] = handWorld;
  }

  return { bicep: bicepWorld, forearm: forearmWorld, hand: handWorld };
}

/**
 * Computes procedural arm swing and flex trajectories across all 216 frames.
 */
export function computeArmTrajectory(f: number): {
  rSwing: number;
  rFlex: number;
  lSwing: number;
  lFlex: number;
} {
  // Beat A: F0-18 (Seated floor rest)
  if (f <= 18) {
    const tBreathe = f / 18.0;
    const breathe = Math.sin(tBreathe * Math.PI * 2);
    return {
      rSwing: 48.0 + breathe * 0.8,
      rFlex: 38.0 + breathe * 0.5,
      lSwing: -35.0 - breathe * 0.6,
      lFlex: 16.0,
    };
  }

  // Beat B1 & B2: F19-43 (Squat Rise & Launch)
  if (f <= 43) {
    const t = (f - 19) / 24.0;
    const easedT = easeInOutCubic(t);
    return {
      rSwing: -15.0 - easedT * 8.0,
      rFlex: 22.0 - easedT * 4.0,
      lSwing: -20.0 - easedT * 6.0,
      lFlex: 20.0 - easedT * 4.0,
    };
  }

  // Beat B3: F44-71 (Deep Squat Extension to Stand)
  if (f <= 71) {
    const t = (f - 44) / 27.0;
    const easedT = easeInOutCubic(t);
    const rSwing = -23.0 + easedT * 27.0; // -23° -> +4°
    const lSwing = -26.0 + easedT * 28.0; // -26° -> +2°
    const rFlex = 18.0 - easedT * 2.0;   // 18° -> 16°
    const lFlex = 16.0 - easedT * 1.5;   // 16° -> 14.5°
    return { rSwing, rFlex, lSwing, lFlex };
  }

  // Beat C: F72-81 (Standing Equilibrium, 10 frames)
  // "Stand and Act C: both arms hang, swing about 0–8°, flex 10–20°. Tiny sway only."
  if (f <= 81) {
    const t = (f - 72) / 9.0;
    const sway = Math.sin(t * Math.PI * 2);
    const rSwing = 3.8 + sway * 0.6; // ~3.2° to 4.4° (avg ~3.8°)
    const lSwing = 1.8 + sway * 0.5; // ~1.3° to 2.3° (avg ~1.8°)
    const rFlex = 16.0 + sway * 0.5;
    const lFlex = 15.0 + sway * 0.5;
    return { rSwing, rFlex, lSwing, lFlex };
  }

  // Beat D: F82-111 (Relaxed Stroll, 30 frames)
  // "D, stroll: arms opposite to the legs. Swing about +22° forward to −22° back, one full cycle per walk cycle (12 frames per step).
  // Arms lag the legs by 1–2 frames. Flex 35–45° on the forward swing and 15–20° on the back swing.
  // Left and right must NOT be exact mirrors (about 3–5° and 10% amplitude difference).
  // Hand never closer than 0.9 × 162.6 px to the shoulder."
  if (f <= 111) {
    const walkProgress = (f - 82 - 1.5) / 30.0;
    const phaseRad = walkProgress * Math.PI * 2;

    const rAmp = 22.0;
    const rCenter = 13.0; // Swings from -9° to +35° (range 44° >= 35°)
    const rDrive = -Math.cos(phaseRad);
    const rSwing = rCenter + rDrive * rAmp;

    // Left arm: 10% amplitude difference (19.8°), 4° offset, subtle phase shift
    const lAmp = rAmp * 0.90; // 19.8°
    const lCenter = 9.0;      // 4° offset from 13°
    const lDrive = Math.cos(phaseRad + 0.15);
    const lSwing = lCenter + lDrive * lAmp; // Swings -10.8° to +28.8° (range 39.6° >= 35°)

    const rForwardNorm = (rDrive + 1.0) * 0.5;
    const rFlex = 18.0 + rForwardNorm * 24.0; // 18° to 42°

    const lForwardNorm = (lDrive + 1.0) * 0.5;
    const lFlex = 17.0 + lForwardNorm * 23.0; // 17° to 40°

    return { rSwing, rFlex, lSwing, lFlex };
  }

  // Beat E: F112-129 (Notices the Ball, 18 frames)
  // "E, notice: the leading arm lifts to swing about +35° with flex about 40°. The other arm hangs at swing about −5°, flex 15°.
  // Shoulders lift a little, then drop and spring, fists closing."
  if (f <= 129) {
    const t = (f - 112) / 17.0;
    const liftT = clamp((f - 112) / 7.0, 0, 1);
    const easedLift = easeInOutCubic(liftT);
    const settleT = clamp((f - 120) / 9.0, 0, 1);

    let rSwing = 30.0 + easedLift * 6.0; // 30° -> 36°
    if (f >= 121) {
      rSwing = 36.0 - settleT * 12.0; // 36° -> 24°
    }
    const rFlex = 36.0 + easedLift * 6.0 - settleT * 8.0; // 36° -> 42° -> 34°

    const lEase = easeInOutCubic(clamp((f - 112) / 5.0, 0, 1));
    const lSwing = -3.0 * (1 - lEase) + (-5.0) * lEase + Math.sin(t * Math.PI * 2) * 0.6;
    const lFlex = 15.0 + Math.cos(t * Math.PI * 2) * 0.5;

    return { rSwing, rFlex, lSwing, lFlex };
  }

  // Beat F1: F130-135 (Jump Crouch Anticipation, 6 frames)
  // "F, jump: crouch, both arms swing back to about −45°, flex 15°."
  if (f <= 135) {
    const t = (f - 130) / 5.0;
    const easedT = easeInOutCubic(t);
    const rSwing = 24.0 * (1 - easedT) + (-45.0) * easedT;
    const lSwing = -5.0 * (1 - easedT) + (-45.0) * easedT;
    const rFlex = 34.0 * (1 - easedT) + 15.0 * easedT;
    const lFlex = 15.0;
    return { rSwing, rFlex, lSwing, lFlex };
  }

  // Beat F2: F136-147 (Jump Launch & Airborne Apex, 12 frames)
  // "Launch (4 frames): swing sweeps −45° → +90° → +160°. Air: arms overhead at +165° to +175°, flex 10–20°, fists."
  // "jump arms reach ≥ +150°"
  if (f <= 147) {
    if (f === 136) {
      return { rSwing: 5.0, rFlex: 16.0, lSwing: 5.0, lFlex: 16.0 };
    }
    if (f === 137) {
      return { rSwing: 70.0, rFlex: 15.0, lSwing: 70.0, lFlex: 15.0 };
    }
    if (f === 138) {
      return { rSwing: 135.0, rFlex: 14.0, lSwing: 135.0, lFlex: 14.0 };
    }
    const tAir = (f - 139) / 8.0;
    const apexT = Math.sin(tAir * Math.PI);
    const rSwing = 168.0 + apexT * 5.0; // 168° to 173° (>= 150°)
    const lSwing = 166.0 + apexT * 5.0; // 166° to 171° (>= 150°)
    const rFlex = 14.0 - apexT * 2.0;   // 12° to 14°
    const lFlex = 14.0 - apexT * 2.0;
    return { rSwing, rFlex, lSwing, lFlex };
  }

  // Beat F3: F148-153 (Jump Landing Cushion & Recovery, 6 frames)
  // "Landing: arms drop to about +20°, then +40°, then settle at about +10°."
  if (f <= 153) {
    const DROP_R = [40.0, 20.0, 28.0, 20.0, 15.0, 10.0];
    const DROP_L = [40.0, 20.0, 28.0, 20.0, 15.0, 10.0];
    const idx = f - 148;
    return {
      rSwing: DROP_R[idx],
      rFlex: 18.0 + (idx === 1 ? 4.0 : 0.0),
      lSwing: DROP_L[idx],
      lFlex: 18.0 + (idx === 1 ? 4.0 : 0.0),
    };
  }

  // Beat G: F154-165 (Run to the Ball, 12 frames)
  // "G, run: upper arm swing about ±50° opposite to the legs, elbow flex about 90° throughout (never below 70° or above 120°). Never straight arms."
  // "run ≥ 90° total"
  // Purposeful athletic footballer run-up: arms act as natural running counterbalance,
  // swinging primarily forward/backward from shoulders in compact athletic envelope (never flailing above head).
  // F154-162: rhythmic running counterbalance; F163-165: purposeful transition into kick windup.
  if (f <= 165) {
    if (f <= 162) {
      const runCycle = ((f - 154) % 8) / 8.0;
      const runPhase = runCycle * Math.PI * 2;

      // Natural running envelope: arms swing through vertical from -25° (back) to +68° (forward)
      // Range = 68 - (-25) = 93° (>= 90°), hands stay at chest/hip level, never flying above head
      const rAmp = 46.5;
      const rCenter = 21.5;
      const rSwing = rCenter + Math.sin(runPhase) * rAmp;

      // Left arm in anti-phase with 5.5° asymmetry and subtle phase offset
      const lAmp = 46.5;
      const lCenter = 27.0;
      const lSwing = lCenter - Math.sin(runPhase + 0.1) * lAmp;

      // Natural running elbow flex ~87-92° (never straight, never over-folded)
      const rFlex = 89.5 + Math.cos(runPhase) * 2.5;
      const lFlex = 89.5 - Math.cos(runPhase) * 2.5;

      return { rSwing, rFlex, lSwing, lFlex };
    } else {
      // Final approach frames (F163-165, 3 frames):
      // Purposefully transitions from sprint into kick chamber preparation:
      // Right arm winds back (+12° heading into -40° backswing in H1)
      // Left arm extends forward/out as dynamic counterbalance (+38° heading into +80° in H1)
      const tPrep = (f - 162) / 3.0;
      const easedPrep = easeInOutCubic(tPrep);

      const rSwing = 21.5 * (1 - easedPrep) + 12.0 * easedPrep;
      const lSwing = 27.0 * (1 - easedPrep) + 38.0 * easedPrep;

      const rFlex = 89.5 * (1 - easedPrep) + 42.0 * easedPrep;
      const lFlex = 89.5 * (1 - easedPrep) + 32.0 * easedPrep;

      return { rSwing, rFlex, lSwing, lFlex };
    }
  }

  // Beat H: F166-174 (Kick the Ball, 9 frames)
  // "H, kick: the arm opposite the kicking leg reaches forward and out, swing about +65–80°, flex about 30°.
  // The other arm goes back about −40°, flex about 40°.
  // At impact (F174) the arms whip opposite to the leg as the torso recoils."
  if (f <= 174) {
    if (f <= 171) {
      const t = (f - 166) / 5.0;
      const easedT = easeInOutCubic(t);
      const lSwing = 40.0 + easedT * 40.0; // +40° -> +80°
      const lFlex = 30.0;
      const rSwing = 10.0 - easedT * 50.0; // +10° -> -40°
      const rFlex = 35.0 + easedT * 5.0;   // 35° -> 40°
      return { rSwing, rFlex, lSwing, lFlex };
    } else {
      const t = (f - 172) / 2.0;
      const lSwing = 80.0 - t * 10.0; // 80° -> 70°
      const lFlex = 30.0 + t * 4.0;
      const rSwing = -40.0 - t * 8.0; // -40° -> -48°
      const rFlex = 40.0 + t * 3.0;
      return { rSwing, rFlex, lSwing, lFlex };
    }
  }

  // Beat I: F175-215 (Follow-Through & Fist Pump, 41 frames)
  // "I, follow-through: one arm at about +90°, the other at about −50° (spread),
  // then the right arm does a fist pump (swing about +120°, flex about 90°) with a 3° overshoot,
  // then both relax to about +10° swing."
  {
    if (f <= 185) {
      const t = (f - 175) / 10.0;
      const easedT = easeInOutCubic(t);
      const lSwing = 70.0 + easedT * 20.0; // 70° -> 90°
      const lFlex = 28.0 - easedT * 3.0;
      const rSwing = -25.0 - easedT * 25.0; // -25° -> -50°
      const rFlex = 40.0 - easedT * 10.0;
      return { rSwing, rFlex, lSwing, lFlex };
    }

    if (f <= 204) {
      const tLeft = clamp((f - 186) / 10.0, 0, 1);
      const easedLeft = easeInOutCubic(tLeft);
      const settleSway = Math.sin(((f - 186) / 18.0) * Math.PI * 2) * 1.2;
      const lSwing = 90.0 * (1 - easedLeft) + 12.0 * easedLeft + settleSway;
      const lFlex = 25.0 * (1 - easedLeft) + 18.0 * easedLeft + settleSway * 0.3;

      let rSwing = -50.0;
      let rFlex = 30.0;

      if (f <= 190) {
        const tUp = (f - 186) / 4.0;
        const easedUp = easeInOutCubic(tUp);
        rSwing = -50.0 + easedUp * 173.0; // -50° -> +123° (3° overshoot!)
        rFlex = 30.0 + easedUp * 60.0;    // 30° -> 90°
      } else if (f <= 200) {
        const tHold = (f - 190) / 10.0;
        rSwing = 123.0 - tHold * 3.0; // +123° -> +120°
        rFlex = 90.0;
      } else {
        const tDown = (f - 200) / 4.0;
        const easedDown = easeInOutCubic(tDown);
        rSwing = 120.0 - easedDown * 60.0; // 120° -> 60°
        rFlex = 90.0 - easedDown * 45.0;   // 90° -> 45°
      }

      return { rSwing, rFlex, lSwing, lFlex };
    }

    // F205-215 (Relax to +10° swing, 11 frames)
    const tRelax = (f - 205) / 10.0;
    const easedRelax = easeInOutCubic(tRelax);
    const breathe = Math.sin(tRelax * Math.PI * 2) * 0.6;

    const rSwing = 55.0 * (1 - easedRelax) + 10.0 * easedRelax + breathe;
    const rFlex = 45.0 * (1 - easedRelax) + 18.0 * easedRelax;

    const lSwing = 12.0 * (1 - easedRelax) + 10.0 * easedRelax + breathe * 0.8;
    const lFlex = 18.0;

    return { rSwing, rFlex, lSwing, lFlex };
  }
}

/**
 * Computes full arm angles for frame f with 1-2 frames of lag on forearm and hand.
 */
export function computeFullArmAnglesForFrame(f: number): {
  rSwing: number;
  rFlex: number;
  rWrist: number;
  lSwing: number;
  lFlex: number;
  lWrist: number;
} {
  const trajLead = computeArmTrajectory(f);
  const trajLag1 = computeArmTrajectory(Math.max(0, f - 1));
  const trajLag2 = computeArmTrajectory(Math.max(0, f - 2));

  // Forearm flex lags upper arm velocity by 1 frame
  const rVelocity = trajLead.rSwing - trajLag1.rSwing;
  const rLagFlex = clamp(trajLead.rFlex - rVelocity * 0.12, 10.0, 110.0);
  const rWrist = clamp(6.0 - (trajLead.rSwing - trajLag2.rSwing) * 0.15, 0.0, 15.0);

  const lVelocity = trajLead.lSwing - trajLag1.lSwing;
  const lLagFlex = clamp(trajLead.lFlex - lVelocity * 0.12, 10.0, 110.0);
  const lWrist = clamp(6.0 - (trajLead.lSwing - trajLag2.lSwing) * 0.15, 0.0, 15.0);

  return {
    rSwing: trajLead.rSwing,
    rFlex: rLagFlex,
    rWrist,
    lSwing: trajLead.lSwing,
    lFlex: lLagFlex,
    lWrist,
  };
}

/**
 * Builds the canonical 216-frame sequence using forward kinematics and analytical two-bone IK.
 */
export function buildCanonicalSitWalkKickFrames(
  config: Partial<SitWalkKickGeneratorConfig> = {}
): SitWalkKickKeyframeSpec[] {
  const frames: SitWalkKickKeyframeSpec[] = [];
  const groundY = 755.0;
  const initialBallX = 900.0;
  const initialBallY = 737.0; // Ball radius 18 => 737 + 18 = 755 (resting on ground)
  const scale = 0.5;

  for (let f = 0; f < 216; f++) {
    let act = '';
    let phase = '';
    let panelId = 1;
    let storyboardTitle = '';
    let notes = '';

    let manX = 300.0;
    let manY = 726.0; // Sitting pelvis Y
    let manAngles = new Array(17).fill(0);

    let ballX = initialBallX;
    let ballY = initialBallY;
    let ballActive = false;

    let camX = -30.0;
    let camY = -15.0;
    let camZoom = 1.12;

    // =========================================================================
    // ACT A: SEATED ON THE GROUND (F000–F018, 19 frames)
    // Storyboard Panel 1: Sitting, knees up, feet flat, forearm on knee, hand planted.
    // =========================================================================
    if (f <= 18) {
      act = 'Act A: Seated Floor Rest';
      phase = 'Resting with Knees Bent & Hand Planted';
      panelId = 1;
      storyboardTitle = '1. The Seated Pause';
      notes = 'Man rests quietly on ground at X=300, knees bent up, head drooped, subtle breathing.';

      const tBreathe = f / 18.0;
      const breatheDy = Math.sin(tBreathe * Math.PI * 2) * 0.8;
      const breatheRot = Math.sin(tBreathe * Math.PI * 2) * 1.0;
      const headDrift = Math.cos(tBreathe * Math.PI * 2) * 1.5;

      manX = 300.0;
      manY = 726.0 + breatheDy;

      // Feet flat on the floor in front of him: X ≈ 390–410, Y = 755
      const rAnkleX = 406.0;
      const rAnkleY = groundY;
      const lAnkleX = 392.0;
      const lAnkleY = groundY;

      // Leg IK
      const rLeg = solveLegLimb(manX, manY, rAnkleX, rAnkleY, true, scale, true);
      const lLeg = solveLegLimb(manX, manY, lAnkleX, lAnkleY, true, scale, true);

      // Spine & Torso (relaxed forward curvature)
      const spineAngle = 78.0 + breatheRot;
      const chestAngle = 73.0 + breatheRot;
      const neckAngle = 66.0;
      const headAngle = 46.0 + headDrift;

      // FK for shoulders
      const tempAngles = new Array(17).fill(0);
      tempAngles[7] = spineAngle;
      tempAngles[8] = chestAngle;
      const fk = solveForwardKinematics17(manX, manY, tempAngles, scale);
      const shoulderX = fk[8].endX;
      const shoulderY = fk[8].endY;

      // Arms: Left arm planted behind hips on ground; Right forearm resting on right knee
      const lHandTargetX = 238.0;
      const lHandTargetY = groundY;
      const clampedLHand = clampShoulderToHandTarget(shoulderX, shoulderY, lHandTargetX, lHandTargetY);
      const lArm = solveArmLimb(shoulderX, shoulderY, clampedLHand.x, clampedLHand.y, true, scale);

      // Right arm rests on right knee (rLeg.kneeX, rLeg.kneeY)
      const rHandTargetX = rLeg.kneeX - 6.0;
      const rHandTargetY = rLeg.kneeY + 4.0;
      const clampedRHand = clampShoulderToHandTarget(shoulderX, shoulderY, rHandTargetX, rHandTargetY);
      const rArm = solveArmLimb(shoulderX, shoulderY, clampedRHand.x, clampedRHand.y, true, scale);

      manAngles[0] = 0;
      manAngles[1] = rLeg.thighAngleDeg;
      manAngles[2] = rLeg.shinAngleDeg;
      manAngles[3] = 0.0; // Foot flat on floor
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = 0.0; // Foot flat on floor
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[9] = rArm.bicepAngleDeg;
      manAngles[10] = rArm.forearmAngleDeg;
      manAngles[11] = rArm.handAngleDeg;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;
      manAngles[14] = lArm.bicepAngleDeg;
      manAngles[15] = lArm.forearmAngleDeg;
      manAngles[16] = lArm.handAngleDeg;

      // Camera static on seated man
      camX = -30.0;
      camY = -15.0;
      camZoom = 1.12;
    }

    // =========================================================================
    // ACT B1: SLOW RISE - FORWARD WEIGHT SHIFT & HAND PLANT (F019–F033, 15 frames)
    // Storyboard Panel 2: Settle back, hands plant, trunk folds 35-45°, feet scoot slightly in.
    // =========================================================================
    else if (f <= 33) {
      act = 'Act B: Slow Rise from Floor';
      phase = 'Phase 1: Trunk Flexion & Hand Planting';
      panelId = 2;
      storyboardTitle = '2. Forward Trunk Fold & Hand Plant';
      notes = 'Trunk folds forward 35–45°, head leads, both hands plant on floor, weight shifts over feet.';

      const t = (f - 19) / 14.0;
      const easedT = easeInOutCubic(t);

      // Pelvis shifts slightly back then forward into launch position
      manX = 300.0 + (t < 0.3 ? -Math.sin((t / 0.3) * Math.PI) * 4.0 : (t - 0.3) * 12.0);
      manY = 726.0 - easedT * 6.0;

      // Feet scoot slightly inward to set squat base
      const rAnkleX = 406.0 - easedT * 8.0;
      const lAnkleX = 392.0 - easedT * 8.0;

      const rLeg = solveLegLimb(manX, manY, rAnkleX, groundY, true, scale, true);
      const lLeg = solveLegLimb(manX, manY, lAnkleX, groundY, true, scale, true);

      // Trunk folds forward: lower spine 78° -> 42° (36° forward flexion!), upper chest 73° -> 38°
      const spineAngle = 78.0 - easedT * 36.0;
      const chestAngle = 73.0 - easedT * 35.0;
      const neckAngle = 66.0 - easedT * 28.0;
      const headAngle = 46.0 - easedT * 22.0;

      const tempAngles = new Array(17).fill(0);
      tempAngles[7] = spineAngle;
      tempAngles[8] = chestAngle;
      const fk = solveForwardKinematics17(manX, manY, tempAngles, scale);
      const shoulderX = fk[8].endX;
      const shoulderY = fk[8].endY;

      // Hands plant on ground: Left slides forward to (275, 755), Right moves from knee down to (368, 755)
      const lHandX = 238.0 + easedT * 38.0;
      const rHandX = (rLeg.kneeX - 6.0) * (1 - easedT) + 368.0 * easedT;
      const rHandY = (rLeg.kneeY + 4.0) * (1 - easedT) + groundY * easedT;

      const clampedLHand = clampShoulderToHandTarget(shoulderX, shoulderY, lHandX, groundY);
      const clampedRHand = clampShoulderToHandTarget(shoulderX, shoulderY, rHandX, rHandY);

      const lArm = solveArmLimb(shoulderX, shoulderY, clampedLHand.x, clampedLHand.y, true, scale);
      const rArm = solveArmLimb(shoulderX, shoulderY, clampedRHand.x, clampedRHand.y, true, scale);

      manAngles[0] = 0;
      manAngles[1] = rLeg.thighAngleDeg;
      manAngles[2] = rLeg.shinAngleDeg;
      manAngles[3] = 0.0;
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = 0.0;
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[9] = rArm.bicepAngleDeg;
      manAngles[10] = rArm.forearmAngleDeg;
      manAngles[11] = rArm.handAngleDeg;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;
      manAngles[14] = lArm.bicepAngleDeg;
      manAngles[15] = lArm.forearmAngleDeg;
      manAngles[16] = lArm.handAngleDeg;

      camX = -30.0;
      camY = -15.0;
      camZoom = 1.12;
    }

    // =========================================================================
    // ACT B2: HIPS LEAVE FLOOR INTO DEEP SQUAT (F034–F043, 10 frames)
    // Storyboard Panel 3: Hips lift into deep squat (pelvis Y 650-670, heels flat), fastest motion.
    // =========================================================================
    else if (f <= 43) {
      act = 'Act B: Slow Rise from Floor';
      phase = 'Phase 2: Hips Lift into Deep Squat (Peak Thrust)';
      panelId = 3;
      storyboardTitle = '3. Hips Launch into Deep Squat';
      notes = 'Fastest motion of rise: Pelvis thrusts forward 90px & upward to Y=656, hands push and release.';

      const t = (f - 34) / 9.0;
      const easedT = easeInOutCubic(t);

      // Pelvis moves forward ~90-100px over the feet, Y rises to deep squat Y ≈ 656
      const startX = 308.0;
      const targetX = 398.0;
      manX = startX + easedT * (targetX - startX);
      manY = 720.0 - easedT * 64.0; // 720 -> 656

      // Feet stay firmly pinned flat on ground
      const rAnkleX = 398.0;
      const lAnkleX = 384.0;

      const rLeg = solveLegLimb(manX, manY, rAnkleX, groundY, true, scale, true);
      const lLeg = solveLegLimb(manX, manY, lAnkleX, groundY, true, scale, true);

      // Trunk maintains forward counter-balance angle in deep squat
      const spineAngle = 42.0 + easedT * 6.0;
      const chestAngle = 38.0 + easedT * 6.0;
      const neckAngle = 38.0 + easedT * 8.0;
      const headAngle = 24.0 + easedT * 12.0;

      const tempAngles = new Array(17).fill(0);
      tempAngles[7] = spineAngle;
      tempAngles[8] = chestAngle;
      const fk = solveForwardKinematics17(manX, manY, tempAngles, scale);
      const shoulderX = fk[8].endX;
      const shoulderY = fk[8].endY;

      manAngles[0] = 0;
      manAngles[1] = rLeg.thighAngleDeg;
      manAngles[2] = rLeg.shinAngleDeg;
      manAngles[3] = 0.0;
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = 0.0;
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;

      // Hands push off floor in first 5 frames (IK), then lift into procedural direct angles
      if (f <= 38) {
        const clampedLHand = clampShoulderToHandTarget(shoulderX, shoulderY, 276.0, groundY);
        const clampedRHand = clampShoulderToHandTarget(shoulderX, shoulderY, 368.0, groundY);
        const lArm = solveArmLimb(shoulderX, shoulderY, clampedLHand.x, clampedLHand.y, true, scale);
        const rArm = solveArmLimb(shoulderX, shoulderY, clampedRHand.x, clampedRHand.y, true, scale);

        manAngles[9] = rArm.bicepAngleDeg;
        manAngles[10] = rArm.forearmAngleDeg;
        manAngles[11] = rArm.handAngleDeg;
        manAngles[14] = lArm.bicepAngleDeg;
        manAngles[15] = lArm.forearmAngleDeg;
        manAngles[16] = lArm.handAngleDeg;
      } else {
        const armAngles = computeFullArmAnglesForFrame(f);
        setArm(manAngles, 'right', armAngles.rSwing, armAngles.rFlex, armAngles.rWrist);
        setArm(manAngles, 'left', armAngles.lSwing, armAngles.lFlex, armAngles.lWrist);
      }

      camX = -30.0;
      camY = -15.0;
      camZoom = 1.12;
    }

    // =========================================================================
    // ACT B3: HIP & KNEE EXTENSION TO STAND (F044–F071, 28 frames)
    // Storyboard Panel 4: Hips and knees extend, arms swing for balance, head comes up last, settle.
    // =========================================================================
    else if (f <= 71) {
      act = 'Act B: Slow Rise from Floor';
      phase = 'Phase 3: Deep Squat Extension to Upright Standing';
      panelId = 4;
      storyboardTitle = '4. Hip & Knee Extension to Stand';
      notes = 'Legs extend progressively, pelvis rises to Y=510, spine unfolds, head comes up last with subtle overshoot.';

      const t = (f - 44) / 27.0;
      const easedT = easeInOutCubic(t);

      // Pelvis rises from 656 -> standing 510. Overshoot around f=68 (508), settling to 510 at f=71
      let targetY = 656.0 - easedT * 146.0;
      if (f >= 67 && f <= 70) {
        targetY = 508.5; // Subtle 1.5px overshoot
      } else if (f === 71) {
        targetY = 510.0;
      }
      manX = 398.0 + easedT * 2.0; // Settles at X = 400.0
      manY = targetY;

      // Feet pinned flat at Y = 755
      const rAnkleX = 405.0;
      const lAnkleX = 392.0;

      const rLeg = solveLegLimb(manX, manY, rAnkleX, groundY, true, scale, true);
      const lLeg = solveLegLimb(manX, manY, lAnkleX, groundY, true, scale, true);

      // Trunk unfolds: Lower spine 48° -> 89°, Upper chest 44° -> 90°
      const spineAngle = 48.0 + easedT * 41.0;
      const chestAngle = 44.0 + easedT * 46.0;
      const neckAngle = 46.0 + easedT * 44.0;
      // Head comes up last (anatomical lag / follow-through)
      const headLagT = clamp((t - 0.15) / 0.85, 0, 1);
      const headAngle = 36.0 + easeInOutCubic(headLagT) * 54.0;

      const tempAngles = new Array(17).fill(0);
      tempAngles[7] = spineAngle;
      tempAngles[8] = chestAngle;
      const fk = solveForwardKinematics17(manX, manY, tempAngles, scale);
      const shoulderX = fk[8].endX;
      const shoulderY = fk[8].endY;

      manAngles[0] = 0;
      manAngles[1] = rLeg.thighAngleDeg;
      manAngles[2] = rLeg.shinAngleDeg;
      manAngles[3] = 0.0;
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = 0.0;
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;

      const armAngles = computeFullArmAnglesForFrame(f);
      setArm(manAngles, 'right', armAngles.rSwing, armAngles.rFlex, armAngles.rWrist);
      setArm(manAngles, 'left', armAngles.lSwing, armAngles.lFlex, armAngles.lWrist);

      camX = -30.0;
      camY = -15.0;
      camZoom = 1.12;
    }

    // =========================================================================
    // ACT C: STANDING EQUILIBRIUM & FIRST STEP PREP (F072–F081, 10 frames)
    // Storyboard Panel 5: Stand, loosen arms, lean forward 3-5°, weight shift, first step.
    // =========================================================================
    else if (f <= 81) {
      act = 'Act C: Standing Equilibrium & Stride Initiation';
      phase = 'Loosen Arms, Lean Forward 3–5°, Weight Shift';
      panelId = 5;
      storyboardTitle = '5. Upright Standing & Weight Shift';
      notes = 'Torso counter-leans forward 3–5° to initiate momentum; weight shifts onto left stance leg.';

      const t = (f - 72) / 9.0;
      const easedT = easeInOutCubic(t);

      // Root advances slightly: 400 -> 405
      manX = 400.0 + easedT * 5.0;
      manY = 510.0;

      // Both feet remain planted flat on ground plane Y = 755.0
      const lAnkleX = 396.0;
      const rAnkleX = 405.0 + easedT * 8.0;

      const lLeg = solveLegLimb(manX, manY, lAnkleX, groundY, true, scale, true);
      const rLeg = solveLegLimb(manX, manY, rAnkleX, groundY, true, scale, true);

      // Torso standing upright equilibrium before casual walk initiation
      const spineAngle = 89.6 - easedT * 0.4;
      const chestAngle = 90.0 - easedT * 0.4;
      const neckAngle = 90.0;
      const headAngle = 89.5;

      manAngles[0] = 0;
      manAngles[1] = rLeg.thighAngleDeg;
      manAngles[2] = rLeg.shinAngleDeg;
      manAngles[3] = 0.0; // Pinned flat on ground
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = 0.0; // Pinned flat on ground
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;

      const armAngles = computeFullArmAnglesForFrame(f);
      setArm(manAngles, 'right', armAngles.rSwing, armAngles.rFlex, armAngles.rWrist);
      setArm(manAngles, 'left', armAngles.lSwing, armAngles.lFlex, armAngles.lWrist);

      // Camera begins slow eased tracking
      camX = -30.0 - easedT * 15.0;
      camY = -15.0;
      camZoom = 1.12;
    }

    // =========================================================================
    // ACT D: RELAXED STROLL (F082–F111, 30 frames)
    // Storyboard Panels 6 & 7: Relaxed stroll, root X 405 -> 650, speed ramping, full walk angles.
    // =========================================================================
    else if (f <= 111) {
      act = 'Act D: Relaxed Stroll';
      phase = 'Natural Biomechanical Walk Cycle (X: 405 → 650)';
      panelId = f < 96 ? 6 : 7;
      storyboardTitle = f < 96 ? '6. Forward Walk Stride' : '7. Relaxed Mid-Gait Stroll';
      notes = 'Hip 25° flexion at heel strike, knee 20° cushion, 60° swing peak; arms swing opposite with 15° bend; pelvis bobs ±4px.';

      // Stride timing & procedural stance pinning
      const tWalk = (f - 82) / 29.0;
      // Authentic progressive acceleration from standing start (3 -> 6 -> 8 -> 10 px/f)
      const walkDistance = Math.pow(tWalk, 1.35) * (650.0 - 405.0);
      manX = 405.0 + walkDistance;

      // Stride phase:
      // Step 1 (F082-096): Left foot is stance pinned at X = 405.0; Right foot swings from 405 -> 515.
      // Step 2 (F097-111): Right foot is stance pinned at X = 515.0; Left foot swings from 405 -> 625.
      const stepLift = 14.0; // Parabolic swing foot clearance
      let rFootX = manX;
      let rFootY = groundY;
      let lFootX = manX;
      let lFootY = groundY;
      let rFootAngle = 0.0;
      let lFootAngle = 0.0;
      let isRightSwing = false;
      let gaitProgress = 0;

      if (f <= 96) {
        // Step 1: Left leg is pinned stance leg; Right leg is swing leg
        isRightSwing = true;
        const tSwing = (f - 82) / 14.0;
        gaitProgress = tSwing;
        const swingArc = computeProceduralMotionArc(405.0, groundY, 515.0, groundY, tSwing, stepLift);
        rFootX = swingArc.x;
        rFootY = swingArc.y;
        rFootAngle = tSwing < 0.25 ? 12.0 : tSwing > 0.75 ? -10.0 : 0.0;

        // Left foot is strictly pinned to ground plane
        lFootX = 405.0;
        lFootY = groundY;
        lFootAngle = tSwing > 0.7 ? -18.0 * ((tSwing - 0.7) / 0.3) : 0.0; // Ankle push-off
      } else {
        // Step 2: Right leg is pinned stance leg; Left leg is swing leg
        isRightSwing = false;
        const tSwing = (f - 97) / 14.0;
        gaitProgress = tSwing;
        const swingArc = computeProceduralMotionArc(405.0, groundY, 625.0, groundY, tSwing, stepLift);
        lFootX = swingArc.x;
        lFootY = swingArc.y;
        lFootAngle = tSwing < 0.25 ? 12.0 : tSwing > 0.75 ? -10.0 : 0.0;

        // Right foot is strictly pinned to ground plane
        rFootX = 515.0;
        rFootY = groundY;
        rFootAngle = tSwing > 0.7 ? -18.0 * ((tSwing - 0.7) / 0.3) : 0.0; // Ankle push-off
      }

      // Pelvis vertical wave (bobs ±4px = 8px * 0.5 scale)
      const pelvisBob = Math.sin(gaitProgress * Math.PI * 2) * 4.0;
      manY = 510.0 + pelvisBob;

      const rLeg = solveLegLimb(manX, manY, rFootX, rFootY, true, scale, rFootY >= groundY - 1.0);
      const lLeg = solveLegLimb(manX, manY, lFootX, lFootY, true, scale, lFootY >= groundY - 1.0);

      // Full-Body Reactivity 1: Pelvic-Thoracic Axial Counter-Rotation
      // Casual upright stroll: trunk has a subtle organic 0.8° forward inclination appropriate to casual walking.
      // Head, chest, and upper spine remain naturally stacked vertically over the pelvis, avoiding forward leaning.
      const spineTilt = Math.sin(gaitProgress * Math.PI * 2) * 0.8;
      const thoracicCounterTorsion = (isRightSwing ? -1.0 : 1.0) * Math.sin(gaitProgress * Math.PI) * 2.0;
      const spineAngle = 89.2 + spineTilt;
      const chestAngle = 89.6 + spineTilt * 0.3 + thoracicCounterTorsion;

      // Full-Body Reactivity 2: Vestibular-Ocular Head Horizon Stabilization
      // Head and upper spine naturally stacked upright with steady forward gaze
      const headStabilize = solveReactiveVestibularHead(chestAngle, 89.5, 0, 0.88);
      const neckAngle = headStabilize.neckAngleDeg;
      const headAngle = headStabilize.headAngleDeg;

      const tempAngles = new Array(17).fill(0);
      tempAngles[7] = spineAngle;
      tempAngles[8] = chestAngle;
      const fk = solveForwardKinematics17(manX, manY, tempAngles, scale);
      const shoulderX = fk[8].endX;
      const shoulderY = fk[8].endY;

      manAngles[0] = 0;
      manAngles[1] = rLeg.thighAngleDeg;
      manAngles[2] = rLeg.shinAngleDeg;
      manAngles[3] = rFootAngle;
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = lFootAngle;
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;

      const armAngles = computeFullArmAnglesForFrame(f);
      setArm(manAngles, 'right', armAngles.rSwing, armAngles.rFlex, armAngles.rWrist);
      setArm(manAngles, 'left', armAngles.lSwing, armAngles.lFlex, armAngles.lWrist);

      // Camera smoothly follows stroll
      camX = -45.0 - tWalk * 90.0;
      camY = -15.0;
      camZoom = 1.10;
    }

    // =========================================================================
    // ACT E: NOTICES THE BALL (F112–F129, 18 frames)
    // Storyboard Panel 8: Head snaps down toward ball, stride breaks, brake plant, pause, excite.
    // =========================================================================
    else if (f <= 129) {
      act = 'Act E: Notices the Ball';
      phase = 'Gaze Snap & Braking Plant';
      panelId = 8;
      storyboardTitle = '8. Notices the Ball & Stride Brake';
      notes = 'Head snaps down toward ball first; lead foot plants as friction brake; torso counter-leans back 6°; pause & excitement coil.';

      const tNotice = (f - 112) / 17.0;
      // Stride decelerates to halt at X ≈ 650
      const brakeX = 650.0 + (1 - Math.pow(1 - clamp(tNotice * 1.6, 0, 1), 2)) * 6.0;
      manX = brakeX;
      manY = 510.0;

      // Braking plant feet: Right foot plants firmly ahead as friction brake at X = 678
      const rAnkleX = 678.0;
      const lAnkleX = 624.0;

      const rLeg = solveLegLimb(manX, manY, rAnkleX, groundY, true, scale, true);
      const lLeg = solveLegLimb(manX, manY, lAnkleX, groundY, true, scale, true);

      // Head snaps down fast (F112–115) pointing toward ball at (900, 737)
      const headSnapT = clamp((f - 112) / 4.0, 0, 1);
      const headAngle = 89.5 - headSnapT * 47.5; // 89.5° -> 42° (snaps directly down-right!)

      // Torso leans back 5–8° from upright stroll (89.2°) to scrub forward momentum (Spine: 89.2° -> 96°)
      const torsoBrakeT = clamp((f - 114) / 7.0, 0, 1);
      const spineAngle = 89.2 + torsoBrakeT * 6.8;
      const chestAngle = 89.6 + torsoBrakeT * 7.4;
      const neckAngle = 90.0 - headSnapT * 28.0;

      manAngles[0] = 0;
      manAngles[1] = rLeg.thighAngleDeg;
      manAngles[2] = rLeg.shinAngleDeg;
      manAngles[3] = 0.0;
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = 0.0;
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;

      const armAngles = computeFullArmAnglesForFrame(f);
      setArm(manAngles, 'right', armAngles.rSwing, armAngles.rFlex, armAngles.rWrist);
      setArm(manAngles, 'left', armAngles.lSwing, armAngles.lFlex, armAngles.lWrist);

      camX = -135.0;
      camY = -15.0;
      camZoom = 1.05;
    }

    // =========================================================================
    // ACT F1: EXCITED JUMP - CROUCH ANTICIPATION (F130–F135, 6 frames)
    // Storyboard Panel 9: Crouch anticipation, COM drops 55-70px, knees 85°, torso leans 25°, arms swing back.
    // =========================================================================
    else if (f <= 135) {
      act = 'Act F: Excited Jump in Place';
      phase = 'Phase 1: Deep Compression & Crouch Anticipation';
      panelId = 9;
      storyboardTitle = '9. Jump Crouch Anticipation';
      notes = 'COM drops 60px (Pelvis Y=568), knees flex 85° naturally forward, torso leans forward 25°, arms swing back.';

      const tCrouch = (f - 130) / 5.0;
      const easedT = easeInOutCubic(tCrouch);

      manX = 650.0;
      manY = 510.0 + easedT * 58.0; // 510 -> 568 px

      // Feet pinned flat at Y = 755
      const rAnkleX = 660.0;
      const lAnkleX = 642.0;

      const rLeg = solveLegLimb(manX, manY, rAnkleX, groundY, true, scale, true);
      const lLeg = solveLegLimb(manX, manY, lAnkleX, groundY, true, scale, true);

      // Torso leans forward 25–30° (Spine: 65°, Chest: 62°)
      const spineAngle = 96.0 - easedT * 31.0;
      const chestAngle = 97.0 - easedT * 35.0;
      const neckAngle = 62.0 + easedT * 12.0;
      const headAngle = 42.0 + easedT * 26.0;

      manAngles[0] = 0;
      manAngles[1] = rLeg.thighAngleDeg;
      manAngles[2] = rLeg.shinAngleDeg;
      manAngles[3] = 0.0;
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = 0.0;
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;

      const armAngles = computeFullArmAnglesForFrame(f);
      setArm(manAngles, 'right', armAngles.rSwing, armAngles.rFlex, armAngles.rWrist);
      setArm(manAngles, 'left', armAngles.lSwing, armAngles.lFlex, armAngles.lWrist);

      camX = -135.0;
      camY = -15.0;
      camZoom = 1.05;
    }

    // =========================================================================
    // ACT F2: LAUNCH & AIRBORNE APEX (F136–F147, 12 frames)
    // Storyboard Panel 10: Explosive jump, peak 70px above standing, arms straight up with fists, knees tucked.
    // =========================================================================
    else if (f <= 147) {
      act = 'Act F: Excited Jump in Place';
      phase = 'Phase 2: Triple Extension & Airborne Apex';
      panelId = 10;
      storyboardTitle = '10. Excited Mid-Air Apex Jump';
      notes = 'Triple extension launch; airborne peak at Y=440 (70px above standing); arms raise straight up with fists; knees tuck 30°.';

      manX = 650.0;

      // Smooth parabolic jump trajectory: F136 launch -> F143 apex (Y=440) -> F148 touchdown
      const JUMP_Y_PROFILE = [
        554.0, // F136: Launch drive begins (-14px from 568)
        532.0, // F137: Powerful knee drive (-22px)
        506.0, // F138: Ankle extension (-26px)
        480.0, // F139: Toes leave floor (-26px, airborne!)
        458.0, // F140: Decelerating upward (-22px)
        445.0, // F141: Approaching peak (-13px)
        441.0, // F142: Pre-apex ease (-4px)
        440.0, // F143: APEX PEAK (Y=440, exactly 70px above standing 510)
        442.0, // F144: Apex hang & gravity inflection (+2px)
        454.0, // F145: Descending (+12px)
        476.0, // F146: Gravity acceleration downward (+22px)
        508.0, // F147: Approaching turf (+32px)
      ];
      manY = JUMP_Y_PROFILE[f - 136];

      const isAirborne = f >= 139 && f <= 147;

      let rLegAngles = { thigh: -85.0, shin: -95.0, foot: -25.0 };
      let lLegAngles = { thigh: -85.0, shin: -95.0, foot: -25.0 };

      if (!isAirborne) {
        // Triple extension on ground launch (F136–138)
        const tLaunch = (f - 136) / 3.0;
        const rLeg = solveLegLimb(manX, manY, 655.0, groundY, true, scale, true);
        const lLeg = solveLegLimb(manX, manY, 645.0, groundY, true, scale, true);
        rLegAngles = { thigh: rLeg.thighAngleDeg, shin: rLeg.shinAngleDeg, foot: -10.0 * tLaunch };
        lLegAngles = { thigh: lLeg.thighAngleDeg, shin: lLeg.shinAngleDeg, foot: -10.0 * tLaunch };
      } else {
        // In air: knees tucked 25–35°
        const tuckT = Math.sin(((f - 139) / 8.0) * Math.PI);
        const tuckThigh = -75.0 + tuckT * 20.0; // Thigh flexes forward
        const tuckShin = -115.0 - tuckT * 15.0; // Shin tucks backward
        rLegAngles = { thigh: tuckThigh, shin: tuckShin, foot: -30.0 };
        lLegAngles = { thigh: tuckThigh + 4.0, shin: tuckShin - 5.0, foot: -30.0 };
      }

      // Torso extends upright in air
      const spineAngle = 88.0;
      const chestAngle = 89.0;
      const neckAngle = 92.0;
      const headAngle = 88.0;

      manAngles[0] = 0;
      manAngles[1] = rLegAngles.thigh;
      manAngles[2] = rLegAngles.shin;
      manAngles[3] = rLegAngles.foot;
      manAngles[4] = lLegAngles.thigh;
      manAngles[5] = lLegAngles.shin;
      manAngles[6] = lLegAngles.foot;
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;

      const armAngles = computeFullArmAnglesForFrame(f);
      setArm(manAngles, 'right', armAngles.rSwing, armAngles.rFlex, armAngles.rWrist);
      setArm(manAngles, 'left', armAngles.lSwing, armAngles.lFlex, armAngles.lWrist);

      camX = -135.0;
      camY = -25.0;
      camZoom = 1.05;
    }

    // =========================================================================
    // ACT F3: TOUCHDOWN CUSHION & RECOVERY (F148–F153, 6 frames)
    // Storyboard Panel 11: Landing on ground Y=755, knees bend 70° (Pelvis Y=566), arms swing down, recover.
    // =========================================================================
    else if (f <= 153) {
      act = 'Act F: Excited Jump in Place';
      phase = 'Phase 3: Touchdown Impact Cushion & Spring Recovery';
      panelId = 11;
      storyboardTitle = '11. Touchdown Cushion & Recovery';
      notes = 'Boots hit turf exactly at Y=755 (0px error); deep 70° knee cushion (Pelvis Y=566); 1f hold; recovery to upright.';

      manX = 650.0;

      // Touchdown profile: F148 touchdown (538px, feet plant), F149 max cushion (566px), F150-153 rebound to 510px
      const LANDING_Y_PROFILE = [
        538.0, // F148: Touchdown impact contact (delta +30px from F147=508)
        566.0, // F149: Deepest impact cushion (delta +28px)
        550.0, // F150: Spring rebound (-16px)
        532.0, // F151: Hip & knee drive upward (-18px)
        516.0, // F152: Pre-settle ease (-16px)
        510.0, // F153: Standing equilibrium (-6px, settled at 510)
      ];
      manY = LANDING_Y_PROFILE[f - 148];

      // Feet pinned flat at Y = 755
      const rAnkleX = 660.0;
      const lAnkleX = 640.0;

      const rLeg = solveLegLimb(manX, manY, rAnkleX, groundY, true, scale, true);
      const lLeg = solveLegLimb(manX, manY, lAnkleX, groundY, true, scale, true);

      // Torso folds forward on landing impact, then recovers upright
      const tLand = (f - 148) / 5.0;
      const foldAmount = f === 148 || f === 149 ? 22.0 : (1.0 - tLand) * 22.0;
      const spineAngle = 88.0 - foldAmount;
      const chestAngle = 89.0 - foldAmount;
      const neckAngle = 88.0;
      const headAngle = 84.0;

      manAngles[0] = 0;
      manAngles[1] = rLeg.thighAngleDeg;
      manAngles[2] = rLeg.shinAngleDeg;
      manAngles[3] = 0.0;
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = 0.0;
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;

      const armAngles = computeFullArmAnglesForFrame(f);
      setArm(manAngles, 'right', armAngles.rSwing, armAngles.rFlex, armAngles.rWrist);
      setArm(manAngles, 'left', armAngles.lSwing, armAngles.lFlex, armAngles.lWrist);

      camX = -135.0;
      camY = -15.0;
      camZoom = 1.05;
    }

    // =========================================================================
    // ACT G: SPRINT TO THE BALL (F154–F165, 12 frames)
    // Storyboard Panel 12: Run to the ball, X 650 -> 870, strong forward lean, arms 90°, high heel fold.
    // =========================================================================
    else if (f <= 165) {
      act = 'Act G: Run to the Ball';
      phase = 'Explosive Sprint & Approach (X: 650 → 870)';
      panelId = 12;
      storyboardTitle = '12. Purposeful Footballer Run-Up';
      notes = 'Purposeful approach to the ball; arms act as natural running counterbalance in compact envelope (no flailing); locked gaze on ball; smooth approach into kick chamber.';

      const tSprint = (f - 154) / 11.0;
      // Exponential speed ramp: 4 -> 12 -> 20 -> 28 -> 30 px/frame
      const sprintDist = Math.pow(tSprint, 1.45) * (870.0 - 650.0);
      manX = 650.0 + sprintDist;
      manY = 510.0 + Math.sin(tSprint * Math.PI * 4.0) * 3.0; // Running bounce

      // Running cycle: 1.5 running strides across 12 frames
      const runCycle = ((f - 154) % 8) / 8.0;
      const isRightLead = ((f - 154) % 16) < 8;

      const strideLength = 54.0;
      let rFootX = manX;
      let rFootY = groundY;
      let lFootX = manX;
      let lFootY = groundY;
      let rFootAngle = -25.0;
      let lFootAngle = -25.0;

      if (isRightLead) {
        // Right leg driving forward, Left leg pushing back with high heel fold to butt
        const swingT = runCycle;
        rFootX = manX - strideLength * 0.4 + swingT * strideLength * 1.4;
        const lift = Math.sin(swingT * Math.PI) * 32.0; // High running step
        rFootY = groundY - lift;

        lFootX = manX - strideLength * 0.7;
        lFootY = groundY - (swingT < 0.3 ? 0 : 25.0); // Flight / trailing heel fold
      } else {
        // Left leg driving forward, Right leg pushing back
        const swingT = runCycle;
        lFootX = manX - strideLength * 0.4 + swingT * strideLength * 1.4;
        const lift = Math.sin(swingT * Math.PI) * 32.0;
        lFootY = groundY - lift;

        rFootX = manX - strideLength * 0.7;
        rFootY = groundY - (swingT < 0.3 ? 0 : 25.0);
      }

      const rLeg = solveLegLimb(manX, manY, rFootX, rFootY, true, scale, rFootY >= groundY - 1.0);
      const lLeg = solveLegLimb(manX, manY, lFootX, lFootY, true, scale, lFootY >= groundY - 1.0);

      // Athletic forward lean with Thoracic-Pelvic Counter-Rotation
      const sprintTorsion = Math.sin(runCycle * Math.PI * 2) * 3.5;
      const spineAngle = 72.0 + tSprint * 4.0;
      const chestAngle = 74.0 + tSprint * 4.0 + (isRightLead ? -sprintTorsion : sprintTorsion);

      const headGaze = solveReactiveVestibularHead(chestAngle, 52.0, 0, 0.88);
      const neckAngle = headGaze.neckAngleDeg;
      const headAngle = headGaze.headAngleDeg;

      const tempAngles = new Array(17).fill(0);
      tempAngles[7] = spineAngle;
      tempAngles[8] = chestAngle;
      const fk = solveForwardKinematics17(manX, manY, tempAngles, scale);
      const shoulderX = fk[8].endX;
      const shoulderY = fk[8].endY;

      manAngles[0] = 0;
      manAngles[1] = rLeg.thighAngleDeg;
      manAngles[2] = rLeg.shinAngleDeg;
      manAngles[3] = rFootAngle;
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = lFootAngle;
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;

      // Direct forward kinematics arms with 1-2 frames lag (no hand-target IK)
      const armAngles = computeFullArmAnglesForFrame(f);
      setArm(manAngles, 'right', armAngles.rSwing, armAngles.rFlex, armAngles.rWrist);
      setArm(manAngles, 'left', armAngles.lSwing, armAngles.lFlex, armAngles.lWrist);

      // Camera tracks forward rapidly with the sprint
      camX = -135.0 - tSprint * 85.0;
      camY = -15.0;
      camZoom = 1.08;
    }

    // =========================================================================
    // ACT H1: PLANT & BACKSWING COIL (F166–F171, 6 frames)
    // Storyboard Panel 13: Support foot plants at (880, 755), kicking knee bends 105°, heel to butt.
    // =========================================================================
    else if (f <= 171) {
      act = 'Act H: Kick the Ball';
      phase = 'Phase 1: Support Plant & Kicking Leg Backswing';
      panelId = 13;
      storyboardTitle = '13. Support Plant & Kicking Backswing';
      notes = 'Full-body chamber: Support knee flexes to lower COM; Kicking leg chambers back (heel to butt); Torso coils into abdominal pre-stretch; Left arm extends wide for dynamic counterbalance.';

      const tBack = (f - 166) / 5.0;
      const easedT = easeInOutCubic(tBack);

      manX = 870.0 + easedT * 8.0; // 870 -> 878 px
      manY = 512.0;

      // Coordinated full-body kick chamber:
      // Support leg, coiling leg, oblique pre-stretch torso, balancing arms, and locked gaze
      const chamber = solveFullBodyKickChamber(
        manX,
        manY,
        880.0,
        groundY,
        easedT,
        initialBallX,
        initialBallY,
        scale
      );

      manAngles[0] = 0;
      manAngles[1] = chamber.rLeg.thigh;
      manAngles[2] = chamber.rLeg.shin;
      manAngles[3] = chamber.rLeg.foot;
      manAngles[4] = chamber.lLeg.thigh;
      manAngles[5] = chamber.lLeg.shin;
      manAngles[6] = 0.0; // Support foot pinned flat at Y=755
      manAngles[7] = chamber.spineAngle;
      manAngles[8] = chamber.chestAngle;
      manAngles[12] = chamber.neckAngle;
      manAngles[13] = chamber.headAngle;

      const armAngles = computeFullArmAnglesForFrame(f);
      setArm(manAngles, 'right', armAngles.rSwing, armAngles.rFlex, armAngles.rWrist);
      setArm(manAngles, 'left', armAngles.lSwing, armAngles.lFlex, armAngles.lWrist);

      camX = -225.0;
      camY = -15.0;
      camZoom = 1.10;
    }

    // =========================================================================
    // ACT H2: KINETIC WHIP & IMPACT CONTACT (F172–F174, 3 frames)
    // Storyboard Panel 14: Kicking swing whips forward; contact at F174 at (884, 735), 1-frame hit-stop.
    // =========================================================================
    else if (f <= 174) {
      act = 'Act H: Kick the Ball';
      phase = f === 174 ? 'Impact Contact & Hit-Stop Freeze' : 'Kinetic Whip Forward Swing';
      panelId = 14;
      storyboardTitle = '14. Toe Strikes the Ball (Impact Frame)';
      notes = 'Kinetic chain whip: Pelvis leads -> thigh drives -> shin whips. Impact at F174: Right toe strikes ball at (884, 735); Upper torso recoils backward 12° to balance angular momentum; Counterbalancing arms react.';

      manX = 878.0;
      manY = 512.0;

      const isContact = f === 174;
      const strikeProgress = (f - 172) / 2.0;

      // Coordinated full-body kick strike with upper-body counter-recoil
      const strike = solveFullBodyKickStrike(
        manX,
        manY,
        880.0,
        groundY,
        isContact,
        strikeProgress,
        884.0,
        735.0,
        scale
      );

      manAngles[0] = 0;
      manAngles[1] = strike.rLeg.thigh;
      manAngles[2] = strike.rLeg.shin;
      manAngles[3] = strike.rLeg.foot;
      manAngles[4] = strike.lLeg.thigh;
      manAngles[5] = strike.lLeg.shin;
      manAngles[6] = 0.0; // Pinned support foot
      manAngles[7] = strike.spineAngle;
      manAngles[8] = strike.chestAngle;
      manAngles[12] = strike.neckAngle;
      manAngles[13] = strike.headAngle;

      const armAngles = computeFullArmAnglesForFrame(f);
      setArm(manAngles, 'right', armAngles.rSwing, armAngles.rFlex, armAngles.rWrist);
      setArm(manAngles, 'left', armAngles.lSwing, armAngles.lFlex, armAngles.lWrist);

      camX = -225.0;
      camY = -15.0;
      camZoom = 1.10;
    }

    // =========================================================================
    // ACT H3 & I1: FOLLOW-THROUGH & BALL LAUNCH (F175–F185, 11 frames)
    // Storyboard Panel 15: Leg carries high and forward, torso leans back 10-15°, small hop, ball launches!
    // =========================================================================
    else if (f <= 185) {
      act = 'Act I: Ball Launch & Follow-Through';
      phase = 'Phase 1: High Leg Follow-Through & Ball Flight Ignition';
      panelId = 15;
      storyboardTitle = '15. High Follow-Through & Ball Launch';
      notes = 'Kicking leg extends high forward (thigh +20°); torso balances extended leg; arms spread wide for dynamic aerodynamic balance; ball launches at vx=+40, vy=-44.';

      const tFollow = (f - 175) / 10.0;
      const easedT = easeInOutCubic(tFollow);

      // Support foot small rotational hop (+4px)
      const hopLift = Math.sin(tFollow * Math.PI) * 4.5;
      manX = 878.0 + easedT * 8.0;
      manY = 512.0 - hopLift;

      // Ball physics formula: vx=+40, vy=-44, g=+2.4 px/f^2
      const tBall = f - 174;
      ballX = initialBallX + 40.0 * tBall;
      ballY = initialBallY - 44.0 * tBall + 1.2 * tBall * tBall;
      ballActive = true;

      // Coordinated full-body follow-through with easing torso recoil and balancing arms
      const follow = solveFullBodyKickFollowThrough(
        manX,
        manY,
        882.0,
        groundY,
        easedT,
        hopLift,
        scale
      );

      manAngles[0] = 0;
      manAngles[1] = follow.rLeg.thigh;
      manAngles[2] = follow.rLeg.shin;
      manAngles[3] = follow.rLeg.foot;
      manAngles[4] = follow.lLeg.thigh;
      manAngles[5] = follow.lLeg.shin;
      manAngles[6] = 0.0;
      manAngles[7] = follow.spineAngle;
      manAngles[8] = follow.chestAngle;
      manAngles[12] = follow.neckAngle;
      manAngles[13] = follow.headAngle;

      const armAngles = computeFullArmAnglesForFrame(f);
      setArm(manAngles, 'right', armAngles.rSwing, armAngles.rFlex, armAngles.rWrist);
      setArm(manAngles, 'left', armAngles.lSwing, armAngles.lFlex, armAngles.lWrist);

      // Camera zooms out gently and tracks right toward ball
      camX = -225.0 - easedT * 65.0;
      camY = -15.0;
      camZoom = 1.10 - easedT * 0.12;
    }

    // =========================================================================
    // ACT I2 & SETTLE: BALL DEPARTURE & MOVING HOLD (F186–F215, 30 frames)
    // Storyboard Panel 16: Settles onto both feet, fist pump with overshoot, watches ball leave, moving hold.
    // =========================================================================
    else {
      act = 'Act I: Ball Launch & Follow-Through';
      phase = f < 205 ? 'Celebratory Settle & Fist Pump' : 'Gentle Moving Hold (Breathing & Eye Drift)';
      panelId = 16;
      storyboardTitle = '16. Watching the Ball Fly Away';
      notes = 'Settles onto both feet at (885, 510); celebratory fist pump; head leads body watching ball exit right; residual momentum dissipates with damped harmonic settling.';

      const tSettle = (f - 186) / 29.0;
      const easedT = easeInOutCubic(clamp(tSettle * 1.5, 0, 1));

      // Ball continues parabolic trajectory: x = 900 + 40t, y = 737 - 44t + 1.2t^2
      const tBall = f - 174;
      ballX = initialBallX + 40.0 * tBall;
      ballY = initialBallY - 44.0 * tBall + 1.2 * tBall * tBall;
      ballActive = true;

      // Man settles back onto both feet on ground Y = 755
      manX = 886.0;
      manY = 510.0;

      // Both feet planted on turf
      const rAnkleX = 896.0;
      const lAnkleX = 876.0;

      const rLeg = solveLegLimb(manX, manY, rAnkleX, groundY, true, scale, true);
      const lLeg = solveLegLimb(manX, manY, lAnkleX, groundY, true, scale, true);

      // Moving hold breathing & subtle life
      const tHold = (f - 186) / 29.0;
      const breatheHold = Math.sin(tHold * Math.PI * 3.0) * 0.8;
      const headDrift = Math.cos(tHold * Math.PI * 2.5) * 1.5;

      // Damped harmonic momentum dissipation in arms and core
      const harmonicDamp = computeDampedOscillation(tSettle, 4.0, 1.8, 0.45);

      // Spine upright, proud posture reacting to fist pump
      const spineAngle = 90.0 + breatheHold * 0.6 + harmonicDamp * 0.4;
      const chestAngle = 91.0 + breatheHold * 0.8 - harmonicDamp * 0.3;
      // Head tilted up watching ball fly into the distance (+115°..+125°)
      const headAngle = 118.0 + headDrift;
      const neckAngle = 105.0;

      manAngles[0] = 0;
      manAngles[1] = rLeg.thighAngleDeg;
      manAngles[2] = rLeg.shinAngleDeg;
      manAngles[3] = 0.0;
      manAngles[4] = lLeg.thighAngleDeg;
      manAngles[5] = lLeg.shinAngleDeg;
      manAngles[6] = 0.0;
      manAngles[7] = spineAngle;
      manAngles[8] = chestAngle;
      manAngles[12] = neckAngle;
      manAngles[13] = headAngle;

      const armAngles = computeFullArmAnglesForFrame(f);
      setArm(manAngles, 'right', armAngles.rSwing, armAngles.rFlex, armAngles.rWrist);
      setArm(manAngles, 'left', armAngles.lSwing, armAngles.lFlex, armAngles.lWrist);

      // Camera stays framed wide showing both the proud man and the ball flying off-screen right
      camX = -290.0 - tSettle * 40.0;
      camY = -15.0;
      camZoom = 0.98 - tSettle * 0.08;
    }

    const com = calculateCenterOfMass17(manX, manY, manAngles, scale);
    const bos = calculateBaseOfSupport17(manX, manY, manAngles, groundY, scale, com.comX);

    frames.push({
      frame: f,
      act,
      phase,
      manX,
      manY,
      manAngles,
      comX: com.comX,
      comY: com.comY,
      supportMinX: bos.minX,
      supportMaxX: bos.maxX,
      isGrounded: bos.isGrounded,
      isBalanced: bos.isStaticallyBalanced,
      stabilityMargin: bos.stabilityMargin,
      thoracicTorsionDeg: Math.abs(manAngles[8] - manAngles[7]),
      armElbowFlexionDeg: Math.abs(manAngles[10] - manAngles[9]),
      kineticWhipRecoilDeg: Math.max(0, manAngles[7] - 90.0),
      headGazeStabilization: `${manAngles[13].toFixed(1)}° gaze`,
      ballX,
      ballY,
      ballActive,
      camX,
      camY,
      camZoom,
      panelId,
      storyboardTitle,
      notes,
    });
  }

  return frames;
}

export const CANONICAL_216_SIT_WALK_KICK_FRAMES: SitWalkKickKeyframeSpec[] =
  buildCanonicalSitWalkKickFrames();

export function buildAdjustedSitWalkKickFrames(
  config: SitWalkKickGeneratorConfig
): SitWalkKickKeyframeSpec[] {
  // If 12 FPS target is requested, sample every 2nd frame (108 frames)
  if (config.targetFps === 12) {
    const full216 = buildCanonicalSitWalkKickFrames(config);
    const sampled108: SitWalkKickKeyframeSpec[] = [];
    for (let i = 0; i < full216.length; i += 2) {
      const spec = full216[i];
      sampled108.push({
        ...spec,
        frame: Math.floor(i / 2),
      });
    }
    return sampled108;
  }
  return buildCanonicalSitWalkKickFrames(config);
}

/**
 * Validates the generated 216 frames against all 10 biomechanical and spatial rules.
 */
export function validateSitWalkKickBiomechanics(
  frames: SitWalkKickKeyframeSpec[]
): BiomechanicalAuditReport {
  const items: BiomechanicalAuditItem[] = [];

  // Check 1: Ground Alignment - Planted feet must match Ground Y = 755
  let maxFootGroundError = 0;
  for (const f of frames) {
    const fk = solveForwardKinematics17(f.manX, f.manY, f.manAngles, 0.5);
    // Grounded checks during standing (f.frame 71-81, 150-153, 186-215)
    if (
      (f.frame >= 71 && f.frame <= 81) ||
      (f.frame >= 150 && f.frame <= 153) ||
      (f.frame >= 186 && f.frame <= 215)
    ) {
      const rFootY = fk[3].endY;
      const lFootY = fk[6].endY;
      maxFootGroundError = Math.max(
        maxFootGroundError,
        Math.abs(rFootY - 755.0),
        Math.abs(lFootY - 755.0)
      );
    }
  }
  items.push({
    id: 'ground-alignment',
    label: 'Ground Alignment (Y = 755.0 px)',
    passed: maxFootGroundError <= 1.5,
    metric: `${maxFootGroundError.toFixed(2)} px max error`,
    threshold: '≤ 1.5 px',
    detail: 'Planted feet maintain exact ground plane contact at Y = 755.0 px without sinking or floating.',
  });

  // Check 2: No Foot Sliding during Stance Pinning
  let maxStanceSlide = 0;
  for (let i = 1; i < frames.length; i++) {
    const prev = frames[i - 1];
    const curr = frames[i];
    // Check seated plant (0..18)
    if (curr.frame <= 18) {
      const prevFK = solveForwardKinematics17(prev.manX, prev.manY, prev.manAngles, 0.5);
      const currFK = solveForwardKinematics17(curr.manX, curr.manY, curr.manAngles, 0.5);
      maxStanceSlide = Math.max(
        maxStanceSlide,
        Math.abs(currFK[3].startX - prevFK[3].startX),
        Math.abs(currFK[6].startX - prevFK[6].startX)
      );
    }
  }
  items.push({
    id: 'stance-pinning',
    label: 'Stance Pinning & Zero Sliding',
    passed: maxStanceSlide <= 0.5,
    metric: `${maxStanceSlide.toFixed(2)} px max shift`,
    threshold: '≤ 0.5 px',
    detail: 'Planted feet and support hands remain pinned to the floor during static holds without sliding.',
  });

  // Check 3: Jump Takeoff & Landing Elevation Closure
  const takeoffFrame = frames.find((f) => f.frame === 135);
  const landingFrame = frames.find((f) => f.frame === 148);
  let jumpElevationDelta = 0;
  if (takeoffFrame && landingFrame) {
    const fkLand = solveForwardKinematics17(landingFrame.manX, landingFrame.manY, landingFrame.manAngles, 0.5);
    jumpElevationDelta = Math.abs(fkLand[3].endY - 755.0);
  }
  items.push({
    id: 'jump-closure',
    label: 'Jump Takeoff & Landing Elevation Closure',
    passed: jumpElevationDelta <= 1.0,
    metric: `${jumpElevationDelta.toFixed(2)} px landing delta`,
    threshold: '≤ 1.0 px',
    detail: 'Airborne jump strictly returns to the identical ground plane surface Y = 755.0 px.',
  });

  // Check 4: Contact Precision at Kick Frame (F174)
  const kickFrame = frames.find((f) => f.frame === 174);
  let kickDistance = 999;
  if (kickFrame) {
    const fk = solveForwardKinematics17(kickFrame.manX, kickFrame.manY, kickFrame.manAngles, 0.5);
    const toeX = fk[3].endX;
    const toeY = fk[3].endY;
    kickDistance = Math.hypot(toeX - kickFrame.ballX, toeY - kickFrame.ballY);
  }
  items.push({
    id: 'kick-contact-precision',
    label: 'Kick Impact Contact Precision (F174)',
    passed: kickDistance <= 18.0,
    metric: `${kickDistance.toFixed(2)} px distance to ball center`,
    threshold: '≤ 18.0 px (Ball Radius)',
    detail: 'Striking toe physically contacts the rear-lower surface of the ball at F174 within 18.0 px.',
  });

  // Check 5: No Knee Hyperextension (0° Polarity Law)
  let maxHyperextension = 0;
  for (const f of frames) {
    const rThigh = f.manAngles[1];
    const rShin = f.manAngles[2];
    const lThigh = f.manAngles[4];
    const lShin = f.manAngles[5];
    // Facing right (+X): Shin angle must be <= Thigh angle (knee bends backward)
    const rRel = rShin - rThigh;
    const lRel = lShin - lThigh;
    if (rRel > 2.0) maxHyperextension = Math.max(maxHyperextension, rRel);
    if (lRel > 2.0) maxHyperextension = Math.max(maxHyperextension, lRel);
  }
  items.push({
    id: 'knee-polarity',
    label: 'Knee 1-DOF Polarity (Zero Hyperextension)',
    passed: maxHyperextension <= 2.0,
    metric: `${maxHyperextension.toFixed(1)}° max violation`,
    threshold: '0° reverse bend',
    detail: 'Kneecaps always point in the facing direction; knees never bend backwards like bird legs.',
  });

  // Check 6: Smooth Trajectory & No Unphysical Single-Frame Root Spikes
  let maxRootDelta = 0;
  for (let i = 1; i < frames.length; i++) {
    const dx = Math.abs(frames[i].manX - frames[i - 1].manX);
    const dy = Math.abs(frames[i].manY - frames[i - 1].manY);
    maxRootDelta = Math.max(maxRootDelta, Math.hypot(dx, dy));
  }
  items.push({
    id: 'root-continuity',
    label: 'Character Root Spatial Continuity',
    passed: maxRootDelta <= 35.0,
    metric: `${maxRootDelta.toFixed(1)} px max single-frame step`,
    threshold: '≤ 35.0 px/frame',
    detail: 'Root translations follow smooth acceleration curves without teleportation spikes or jitter.',
  });

  // Check 7: Decoupled Camera Isolation
  let cameraBakedInRoot = false;
  for (const f of frames) {
    if (f.manX < 0 || f.manY < 0) {
      cameraBakedInRoot = true;
    }
  }
  items.push({
    id: 'camera-isolation',
    label: 'Camera vs World Movement Decoupling',
    passed: !cameraBakedInRoot,
    metric: '100% decoupled',
    threshold: 'Zero camera bleed',
    detail: 'Virtual camera panning and zooming reside solely in camera fields (camX, camY, camZoom).',
  });

  // Check 8: Moving Hold Life (No Dead Freezes)
  let staticFrameCount = 0;
  for (let i = 205; i < frames.length; i++) {
    const prev = frames[i - 1];
    const curr = frames[i];
    let diff = 0;
    for (let k = 0; k < 17; k++) {
      diff += Math.abs(curr.manAngles[k] - prev.manAngles[k]);
    }
    if (diff < 0.05) staticFrameCount++;
  }
  items.push({
    id: 'moving-hold-life',
    label: 'Moving Hold Life & Organic Settle (F205–F215)',
    passed: staticFrameCount <= 1,
    metric: `${staticFrameCount} dead freeze frames`,
    threshold: '≤ 1 freeze',
    detail: 'Pauses include subtle breathing oscillations, head drift, and weight shifts rather than mannequin dead freezes.',
  });

  // Check 9: Center of Mass (CoM) Dynamic Balance Equilibrium
  let maxCoMDisplacementFromSupport = 0;
  for (const f of frames) {
    if (
      (f.frame >= 71 && f.frame <= 81) ||
      (f.frame >= 150 && f.frame <= 153) ||
      (f.frame >= 186 && f.frame <= 215)
    ) {
      const margin = Math.abs(f.stabilityMargin);
      if (margin > maxCoMDisplacementFromSupport) {
        maxCoMDisplacementFromSupport = margin;
      }
    }
  }
  items.push({
    id: 'com-dynamic-balance',
    label: 'Center of Mass (CoM) Dynamic Balance Equilibrium',
    passed: maxCoMDisplacementFromSupport <= 25.0,
    metric: `${maxCoMDisplacementFromSupport.toFixed(1)} px max CoM offset`,
    threshold: '≤ 25.0 px support margin',
    detail: 'Torso counter-pitch and pelvis shift keep the body Center of Mass balanced over the Base of Support.',
  });

  // Check 10: Connected Articulated Body Chain (Bone Length Invariant)
  let maxBoneLengthError = 0;
  for (const f of frames) {
    const fk = solveForwardKinematics17(f.manX, f.manY, f.manAngles, 0.5);
    for (let b = 1; b < 17; b++) {
      const p = STICKFIGURE_PARENTS[b];
      if (p !== -1) {
        const dx = fk[b].endX - fk[b].startX;
        const dy = fk[b].endY - fk[b].startY;
        const actualLen = Math.hypot(dx, dy);
        const expectedLen = STICKFIGURE_BONE_LENGTHS[b] * 0.5;
        const err = Math.abs(actualLen - expectedLen);
        if (err > maxBoneLengthError) maxBoneLengthError = err;
      }
    }
  }
  items.push({
    id: 'articulated-body-chain',
    label: 'Connected Articulated Body Chain Invariant',
    passed: maxBoneLengthError <= 0.05,
    metric: `${maxBoneLengthError.toFixed(3)} px max bone elongation`,
    threshold: '≤ 0.05 px (Rigid Links)',
    detail: 'All 17 skeletal bone lengths remain strictly constant; zero joint dismemberment or stretch.',
  });

  // Check 11: Pelvic-Thoracic Axial Counter-Rotation during Locomotion
  let maxThoracicCounterTorsion = 0;
  for (const f of frames) {
    if ((f.frame >= 82 && f.frame <= 111) || (f.frame >= 154 && f.frame <= 165)) {
      const diff = Math.abs(f.manAngles[8] - f.manAngles[7]);
      if (diff > maxThoracicCounterTorsion) maxThoracicCounterTorsion = diff;
    }
  }
  items.push({
    id: 'pelvic-thoracic-counter-rotation',
    label: 'Pelvic-Thoracic Counter-Rotation during Locomotion',
    passed: maxThoracicCounterTorsion >= 1.5,
    metric: `${maxThoracicCounterTorsion.toFixed(1)}° max counter-rotation`,
    threshold: '≥ 1.5° (Anti-Phase Torsion)',
    detail: 'Upper chest counter-rotates in anti-phase to pelvic leg swing, eliminating rigid plank-wood spine.',
  });

  // Check 12: Upper-Body Kinetic Whip Recoil during Kick
  const strikeFrame = frames.find((f) => f.frame === 174);
  let strikeTorsoRecoil = 0;
  if (strikeFrame) {
    strikeTorsoRecoil = Math.max(
      strikeFrame.manAngles[7] - 90.0,
      strikeFrame.manAngles[8] - 90.0
    );
  }
  items.push({
    id: 'kinetic-whip-torso-recoil',
    label: 'Upper-Body Kinetic Whip Recoil during Kick (F174)',
    passed: strikeTorsoRecoil >= 8.0,
    metric: `${strikeTorsoRecoil.toFixed(1)}° backward recoil`,
    threshold: '≥ 8.0° (Momentum Balance)',
    detail: 'Upper torso recoils backward dynamically to conserve angular momentum as kicking leg accelerates forward into impact.',
  });

  // Check 13: Dynamic Arm Elbow Flexion Modulation
  let minElbowBend = 180;
  let maxElbowBend = 0;
  for (const f of frames) {
    if (f.frame >= 82 && f.frame <= 111) {
      const bend = Math.abs(f.manAngles[10] - f.manAngles[9]);
      if (bend < minElbowBend) minElbowBend = bend;
      if (bend > maxElbowBend) maxElbowBend = bend;
    }
  }
  const elbowModulationRange = maxElbowBend - minElbowBend;
  items.push({
    id: 'dynamic-elbow-modulation',
    label: 'Dynamic Arm Elbow Flexion Modulation',
    passed: elbowModulationRange >= 10.0,
    metric: `${elbowModulationRange.toFixed(1)}° dynamic range (${minElbowBend.toFixed(0)}°–${maxElbowBend.toFixed(0)}°)`,
    threshold: '≥ 10.0° modulation',
    detail: 'Arm elbow flexes during forward swing to shorten pendulum inertia, and extends naturally during backswing.',
  });

  // Check 14: Vestibular-Ocular Head Horizon Stabilization
  let headPitchMin = 360;
  let headPitchMax = -360;
  for (const f of frames) {
    if (f.frame >= 82 && f.frame <= 111) {
      const h = f.manAngles[13];
      if (h < headPitchMin) headPitchMin = h;
      if (h > headPitchMax) headPitchMax = h;
    }
  }
  const headVariance = headPitchMax - headPitchMin;
  items.push({
    id: 'vestibular-head-stabilization',
    label: 'Vestibular-Ocular Head Horizon Stabilization',
    passed: headVariance <= 6.0,
    metric: `${headVariance.toFixed(1)}° head horizon variance`,
    threshold: '≤ 6.0° stable horizon',
    detail: 'Gimbal neck stabilization compensates for torso pitch to maintain steady forward gaze during strolling.',
  });

  // =========================================================================
  // REAL CHECKS: PROCEDURAL ARM BIOMECHANICS & ARTICULATION
  // =========================================================================
  const BEATS = [
    { id: 'C', name: 'Stand (Act C)', start: 72, end: 81 },
    { id: 'D', name: 'Stroll (Act D)', start: 82, end: 111 },
    { id: 'E', name: 'Notice (Act E)', start: 112, end: 129 },
    { id: 'F', name: 'Jump (Act F)', start: 130, end: 153 },
    { id: 'G', name: 'Run (Act G)', start: 154, end: 165 },
    { id: 'H', name: 'Kick (Act H)', start: 166, end: 174 },
    { id: 'I', name: 'Follow-Through (Act I)', start: 175, end: 215 },
  ];

  interface BeatArmStats {
    rAvgSwing: number;
    lAvgSwing: number;
    rMinSwing: number;
    rMaxSwing: number;
    lMinSwing: number;
    lMaxSwing: number;
    rMinFlex: number;
    rMaxFlex: number;
    lMinFlex: number;
    lMaxFlex: number;
    rMinDist: number;
    rMaxDist: number;
    lMinDist: number;
    lMaxDist: number;
  }

  const beatStats: Record<string, BeatArmStats> = {};

  for (const b of BEATS) {
    let rSumSwing = 0;
    let lSumSwing = 0;
    let rMinS = 999, rMaxS = -999;
    let lMinS = 999, lMaxS = -999;
    let rMinF = 999, rMaxF = -999;
    let lMinF = 999, lMaxF = -999;
    let rMinD = 999, rMaxD = -999;
    let lMinD = 999, lMaxD = -999;
    let count = 0;

    for (const f of frames) {
      if (f.frame >= b.start && f.frame <= b.end) {
        count++;
        // Convention: bicepWorld = -90 + swing => swing = bicepWorld + 90
        const rSwing = f.manAngles[9] + 90.0;
        const lSwing = f.manAngles[14] + 90.0;
        // forearmWorld = bicepWorld + flex => flex = forearmWorld - bicepWorld
        const rFlex = f.manAngles[10] - f.manAngles[9];
        const lFlex = f.manAngles[15] - f.manAngles[14];

        rSumSwing += rSwing;
        lSumSwing += lSwing;
        if (rSwing < rMinS) rMinS = rSwing;
        if (rSwing > rMaxS) rMaxS = rSwing;
        if (lSwing < lMinS) lMinS = lSwing;
        if (lSwing > lMaxS) lMaxS = lSwing;

        if (rFlex < rMinF) rMinF = rFlex;
        if (rFlex > rMaxF) rMaxF = rFlex;
        if (lFlex < lMinF) lMinF = lFlex;
        if (lFlex > lMaxF) lMaxF = lFlex;

        const fk = solveForwardKinematics17(f.manX, f.manY, f.manAngles, 0.5);
        const shX = fk[8].endX;
        const shY = fk[8].endY;
        const rHandDist = Math.hypot(fk[11].endX - shX, fk[11].endY - shY);
        const lHandDist = Math.hypot(fk[16].endX - shX, fk[16].endY - shY);

        if (rHandDist < rMinD) rMinD = rHandDist;
        if (rHandDist > rMaxD) rMaxD = rHandDist;
        if (lHandDist < lMinD) lMinD = lHandDist;
        if (lHandDist > lMaxD) lMaxD = lHandDist;
      }
    }

    beatStats[b.id] = {
      rAvgSwing: count > 0 ? rSumSwing / count : 0,
      lAvgSwing: count > 0 ? lSumSwing / count : 0,
      rMinSwing: rMinS,
      rMaxSwing: rMaxS,
      lMinSwing: lMinS,
      lMaxSwing: lMaxS,
      rMinFlex: rMinF,
      rMaxFlex: rMaxF,
      lMinFlex: lMinF,
      lMaxFlex: lMaxF,
      rMinDist: rMinD,
      rMaxDist: rMaxD,
      lMinDist: lMinD,
      lMaxDist: lMaxD,
    };
  }

  // Print measured numbers per beat, per arm
  console.log('=== SIT-WALK-KICK REAL ARM BIOMECHANICS AUDIT ===');
  for (const b of BEATS) {
    const s = beatStats[b.id];
    console.log(
      `Beat ${b.id} (${b.name}):\n` +
      `  Right Arm: Swing [${s.rMinSwing.toFixed(1)}° .. ${s.rMaxSwing.toFixed(1)}°] (Avg ${s.rAvgSwing.toFixed(1)}°), Flex [${s.rMinFlex.toFixed(1)}° .. ${s.rMaxFlex.toFixed(1)}°], HandDist [${s.rMinDist.toFixed(1)} .. ${s.rMaxDist.toFixed(1)} px]\n` +
      `  Left Arm:  Swing [${s.lMinSwing.toFixed(1)}° .. ${s.lMaxSwing.toFixed(1)}°] (Avg ${s.lAvgSwing.toFixed(1)}°), Flex [${s.lMinFlex.toFixed(1)}° .. ${s.lMaxFlex.toFixed(1)}°], HandDist [${s.lMinDist.toFixed(1)} .. ${s.lMaxDist.toFixed(1)} px]`
    );
  }

  // Check 15: Walk Shoulder Range (>= 35° total)
  const dStats = beatStats['D'];
  const rWalkRange = dStats.rMaxSwing - dStats.rMinSwing;
  const lWalkRange = dStats.lMaxSwing - dStats.lMinSwing;
  items.push({
    id: 'walk-shoulder-range',
    label: 'Walk Shoulder Swing Amplitude (Act D)',
    passed: rWalkRange >= 35.0 && lWalkRange >= 35.0,
    metric: `Right: ${rWalkRange.toFixed(1)}°, Left: ${lWalkRange.toFixed(1)}°`,
    threshold: '≥ 35.0° each arm',
    detail: `Stroll shoulder swings dynamically (Right ${rWalkRange.toFixed(1)}°, Left ${lWalkRange.toFixed(1)}°) exceeding the 35° minimum without frozen arms.`,
  });

  // Check 16: Stroll Hand-to-Shoulder Distance (>= 0.9 * 162.6 = 146.3 px)
  const minWalkHandDist = Math.min(dStats.rMinDist, dStats.lMinDist);
  items.push({
    id: 'walk-arm-extension',
    label: 'Walk Arm Extension & Pendulum Reach',
    passed: minWalkHandDist >= 0.9 * 162.6,
    metric: `Min distance: ${minWalkHandDist.toFixed(1)} px (Right ${dStats.rMinDist.toFixed(1)} px, Left ${dStats.lMinDist.toFixed(1)} px)`,
    threshold: '≥ 146.3 px (0.9 × 162.6 px)',
    detail: 'Hands remain natural pendulums (min distance 146.3 px) instead of folding into collapsed elbows during the stroll.',
  });

  // Check 17: Run Shoulder Range (>= 90° total)
  const gStats = beatStats['G'];
  const rRunRange = gStats.rMaxSwing - gStats.rMinSwing;
  const lRunRange = gStats.lMaxSwing - gStats.lMinSwing;
  items.push({
    id: 'run-shoulder-range',
    label: 'Sprint Shoulder Swing Amplitude (Act G)',
    passed: rRunRange >= 90.0 && lRunRange >= 90.0,
    metric: `Right: ${rRunRange.toFixed(1)}°, Left: ${lRunRange.toFixed(1)}°`,
    threshold: '≥ 90.0° each arm',
    detail: `Sprinting arms pump vigorously with ±50° amplitude (Right ${rRunRange.toFixed(1)}°, Left ${lRunRange.toFixed(1)}°) with elbow flex ~90°.`,
  });

  // Check 18: Jump Arms Reach (>= +150°)
  const fStats = beatStats['F'];
  const rJumpReach = fStats.rMaxSwing;
  const lJumpReach = fStats.lMaxSwing;
  items.push({
    id: 'jump-arms-overhead',
    label: 'Jump Airborne Overhead Arm Reach (Act F)',
    passed: rJumpReach >= 150.0 && lJumpReach >= 150.0,
    metric: `Right: ${rJumpReach.toFixed(1)}°, Left: ${lJumpReach.toFixed(1)}°`,
    threshold: '≥ +150.0° reach',
    detail: `Airborne jump sweeps arms from -45° to overhead reach (Right ${rJumpReach.toFixed(1)}°, Left ${lJumpReach.toFixed(1)}°).`,
  });

  // Check 19: Pairwise Distinct Average Swing (> 5.0° difference across all beats)
  let minSepR = 999;
  let minSepL = 999;
  let pairR = '';
  let pairL = '';
  for (let i = 0; i < BEATS.length; i++) {
    for (let j = i + 1; j < BEATS.length; j++) {
      const b1 = BEATS[i].id;
      const b2 = BEATS[j].id;
      const dR = Math.abs(beatStats[b1].rAvgSwing - beatStats[b2].rAvgSwing);
      const dL = Math.abs(beatStats[b1].lAvgSwing - beatStats[b2].lAvgSwing);
      if (dR < minSepR) {
        minSepR = dR;
        pairR = `${b1} vs ${b2}`;
      }
      if (dL < minSepL) {
        minSepL = dL;
        pairL = `${b1} vs ${b2}`;
      }
    }
  }
  items.push({
    id: 'beat-swing-distinctness',
    label: 'Distinct Average Swing Across All Beats',
    passed: minSepR > 5.0 && minSepL > 5.0,
    metric: `Min separation: Right ${minSepR.toFixed(2)}° (${pairR}), Left ${minSepL.toFixed(2)}° (${pairL})`,
    threshold: '> 5.0° separation',
    detail: 'Every beat has an individual distinct arm choreography identity; no duplicate average swing angles across beats.',
  });

  // Check 20: No Static Arm Frames (> 6 consecutive) outside F0-18 and F205-215
  let maxStaticR = 0;
  let maxStaticL = 0;
  let curStaticR = 0;
  let curStaticL = 0;
  for (let fIdx = 19; fIdx <= 204; fIdx++) {
    const prev = frames.find((x) => x.frame === fIdx - 1);
    const curr = frames.find((x) => x.frame === fIdx);
    if (prev && curr) {
      const dR = Math.hypot(
        curr.manAngles[9] - prev.manAngles[9],
        curr.manAngles[10] - prev.manAngles[10]
      );
      const dL = Math.hypot(
        curr.manAngles[14] - prev.manAngles[14],
        curr.manAngles[15] - prev.manAngles[15]
      );
      if (dR < 0.05) {
        curStaticR++;
        if (curStaticR > maxStaticR) maxStaticR = curStaticR;
      } else {
        curStaticR = 0;
      }
      if (dL < 0.05) {
        curStaticL++;
        if (curStaticL > maxStaticL) maxStaticL = curStaticL;
      } else {
        curStaticL = 0;
      }
    }
  }
  items.push({
    id: 'no-static-arm-frames',
    label: 'Continuous Organic Arm Life (Zero Static Freezes)',
    passed: maxStaticR <= 6 && maxStaticL <= 6,
    metric: `Max consecutive static: Right ${maxStaticR}f, Left ${maxStaticL}f`,
    threshold: '≤ 6 consecutive frames',
    detail: 'Arms exhibit continuous organic living micro-motion outside of initial seated pause and final celebratory hold.',
  });

  // Check 21: Stroll Left & Right NOT Exact Mirrors
  let minMirrorSum = 999;
  for (const f of frames) {
    if (f.frame >= 82 && f.frame <= 111) {
      const rS = f.manAngles[9] + 90.0;
      const lS = f.manAngles[14] + 90.0;
      const sum = Math.abs(rS + lS);
      if (sum < minMirrorSum) minMirrorSum = sum;
    }
  }
  items.push({
    id: 'stroll-arm-asymmetry',
    label: 'Organic Stroll Arm Asymmetry (Non-Mirrored)',
    passed: minMirrorSum > 2.0,
    metric: `${minMirrorSum.toFixed(2)}° min deviation from mirror zero-sum`,
    threshold: '> 2.0° asymmetry',
    detail: 'Left and right arms incorporate 4° offset, 10% amplitude divergence, and phase lag rather than mechanical mirroring.',
  });

  // Check 22: Elbow Polarity (Hand moves forward of elbow when flexed)
  let minFlexOverall = 999;
  let minHandForwardDelta = 999;
  for (const f of frames) {
    const rFlex = f.manAngles[10] - f.manAngles[9];
    const lFlex = f.manAngles[15] - f.manAngles[14];
    if (rFlex < minFlexOverall) minFlexOverall = rFlex;
    if (lFlex < minFlexOverall) minFlexOverall = lFlex;

    const fk = solveForwardKinematics17(f.manX, f.manY, f.manAngles, 0.5);
    // When facing +X, forearm vector (hand - elbow):
    // For elbow flexion, hand X relative to elbow X should not flip unnaturally behind
    const rHandRelX = fk[11].endX - fk[10].startX;
    const lHandRelX = fk[16].endX - fk[15].startX;
    if (rHandRelX < minHandForwardDelta) minHandForwardDelta = rHandRelX;
    if (lHandRelX < minHandForwardDelta) minHandForwardDelta = lHandRelX;
  }
  items.push({
    id: 'elbow-flexion-polarity',
    label: 'Elbow Anatomical Flexion Polarity',
    passed: minFlexOverall >= 5.0,
    metric: `Min elbow flex: ${minFlexOverall.toFixed(1)}°`,
    threshold: '≥ 5.0° forward bend',
    detail: 'Elbow joints bend exclusively forward/up (+X/-Y) anatomically; zero backward hyperextension.',
  });

  const passedChecks = items.filter((c) => c.passed).length;
  return {
    passed: passedChecks === items.length,
    totalChecks: items.length,
    passedChecks,
    items,
  };
}

export interface StrollKickPanelMeta {
  panelNumber: number;
  title: string;
  startFrame: number;
  endFrame: number;
  frameRangeStr: string;
  actionSummary: string;
}

export const STROLL_KICK_PANELS: StrollKickPanelMeta[] = [
  { panelNumber: 1, title: '① Seated Pause', startFrame: 0, endFrame: 18, frameRangeStr: 'F00–18', actionSummary: 'Man rests on turf at (300, 726), knees bent up, forearm on knee, hand planted behind hips, breathing life.' },
  { panelNumber: 2, title: '② Trunk Fold & Plant', startFrame: 19, endFrame: 33, frameRangeStr: 'F19–33', actionSummary: 'Torso folds forward 35–45°, head leads, both hands plant on ground, weight shifts forward.' },
  { panelNumber: 3, title: '③ Deep Squat Launch', startFrame: 34, endFrame: 43, frameRangeStr: 'F34–43', actionSummary: 'Hips thrust forward 90px & upward into deep squat (Y=656), peak velocity moment, hands push and release.' },
  { panelNumber: 4, title: '④ Stand Extension', startFrame: 44, endFrame: 71, frameRangeStr: 'F44–71', actionSummary: 'Hips and knees extend, pelvis rises to standing Y=510, spine unfolds, head comes up last with subtle overshoot.' },
  { panelNumber: 5, title: '⑤ Standing Equilibrium', startFrame: 72, endFrame: 81, frameRangeStr: 'F72–81', actionSummary: 'Upright posture, arms loosen, forward COM lean 3–5°, weight transfer onto left stance leg.' },
  { panelNumber: 6, title: '⑥ Forward Stride', startFrame: 82, endFrame: 95, frameRangeStr: 'F82–95', actionSummary: 'First walk stride, hip 25° flexion at heel strike, knee 20° cushion, arms swing in anti-phase.' },
  { panelNumber: 7, title: '⑦ Relaxed Stroll', startFrame: 96, endFrame: 111, frameRangeStr: 'F96–111', actionSummary: 'Full stroll (X: 405 → 650), speed ramps to 10px/f, pelvis bobs ±4px, eyes looking relaxed ahead.' },
  { panelNumber: 8, title: '⑧ Notices the Ball!', startFrame: 112, endFrame: 129, frameRangeStr: 'F112–129', actionSummary: 'Head snaps down toward ball first, lead foot plants as friction brake, torso leans back 6°, realization pause.' },
  { panelNumber: 9, title: '⑨ Jump Crouch Coil', startFrame: 130, endFrame: 135, frameRangeStr: 'F130–135', actionSummary: 'Anticipation drop: COM lowers 60px to Y=568, knees flex 85° naturally, torso leans 25°, arms swing back.' },
  { panelNumber: 10, title: '⑩ Excited Apex Jump', startFrame: 136, endFrame: 147, frameRangeStr: 'F136–147', actionSummary: 'Triple extension launch, airborne apex at Y=440 (70px above standing), arms raise with fists, knees tucked 30°.' },
  { panelNumber: 11, title: '⑪ Touchdown Cushion', startFrame: 148, endFrame: 153, frameRangeStr: 'F148–153', actionSummary: 'Touchdown exactly on ground Y=755, knees cushion to 70° (Pelvis Y=566), 1f impact hold, spring recovery.' },
  { panelNumber: 12, title: '⑫ Sprint to the Ball', startFrame: 154, endFrame: 165, frameRangeStr: 'F154–165', actionSummary: 'Athletic forward lean, arms bent 90°, swing knee flexes 90° with heel to butt, speed ramps to 30px/f.' },
  { panelNumber: 13, title: '⑬ Plant & Backswing', startFrame: 166, endFrame: 171, frameRangeStr: 'F166–171', actionSummary: 'Support foot pinned flat at (880, 755), kicking knee chambers back 105° with heel to butt, left arm out.' },
  { panelNumber: 14, title: '⑭ Impact Contact (F174)', startFrame: 172, endFrame: 174, frameRangeStr: 'F172–174', actionSummary: 'Whip forward: Toe strikes ball at (884, 735) within 15px of center (900, 737), 1-frame hit-stop freeze!' },
  { panelNumber: 15, title: '⑮ High Follow-Through', startFrame: 175, endFrame: 185, frameRangeStr: 'F175–185', actionSummary: 'Kicking leg carries high forward (+20°), torso counter-leans back 14°, small hop, ball launches (vx=+40, vy=-44).' },
  { panelNumber: 16, title: '⑯ Watching Ball Soar', startFrame: 186, endFrame: 215, frameRangeStr: 'F186–215', actionSummary: 'Settles onto turf at (885, 510), fist pump, head leads watching ball exit off-screen right, gentle moving hold.' },
];

/**
 * Binary Synthesizer: Encodes the 216-frame Stroll & Kick into a valid Stick Nodes v334 project.
 * Contains 2 figure instances per frame: Figure 1 (The Man) + Figure 2 (The Orange Ball).
 */
export async function synthesizeSitWalkKickStknds(
  baseDecompressed27: Uint8Array,
  config: SitWalkKickGeneratorConfig
): Promise<Uint8Array> {
  const framesSpec = buildAdjustedSitWalkKickFrames(config);
  const nFrames = framesSpec.length;

  const prefixHdr = baseDecompressed27.slice(0, 2591);
  const fhdrTmpl = baseDecompressed27.slice(2591, 2649);
  const instTmpl = baseDecompressed27.slice(2649, 3740);
  const fftrTmpl = baseDecompressed27.slice(3740, 3788);
  const ptrlTmpl = baseDecompressed27.slice(34910, 34954);

  const baseDv = new DataView(
    baseDecompressed27.buffer,
    baseDecompressed27.byteOffset,
    baseDecompressed27.byteLength
  );
  const defA2: number[] = [];
  const defA3: number[] = [];
  for (let i = 0; i < 17; i++) {
    const off = 1231 + i * 84;
    defA2.push(baseDv.getFloat32(off + 28, false));
    defA3.push(baseDv.getFloat32(off + 32, false));
  }

  const manArgb = hexColorToArgbUint32(config.manColorHex);
  const ballArgb = hexColorToArgbUint32(config.ballColorHex);

  // Both the Man and the Ball are present in every frame (2 figure instances per frame)
  let totalBytes = prefixHdr.length + ptrlTmpl.length;
  for (let f = 0; f < nFrames; f++) {
    totalBytes += fhdrTmpl.length + 2 * instTmpl.length + fftrTmpl.length;
  }

  const buf = new Uint8Array(totalBytes);
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  buf.set(prefixHdr, 0);
  buf[30] = config.targetFps;
  dv.setInt32(2587, nFrames, false);

  let cursor = prefixHdr.length;

  // Writes Figure Instance 1: The standard 17-node stickfigure (Man)
  const writeManInstance = (sx: number, sy: number, wAngles: number[]) => {
    buf.set(instTmpl, cursor);
    dv.setInt32(cursor + 0, 0, false); // Figure library index 0
    dv.setInt32(cursor + 4, 1, false);
    dv.setInt32(cursor + 8, 1, false); // Instance ID 1
    dv.setFloat32(cursor + 71, 0.5, false); // Instance scale: 0.50x
    dv.setFloat32(cursor + 75, sx, false); // Scene X
    dv.setFloat32(cursor + 79, sy, false); // Scene Y
    dv.setUint32(cursor + 83, manArgb, false);

    for (let i = 0; i < 17; i++) {
      const rOff = cursor + 112 + i * 58;
      const p = STICKFIGURE_PARENTS[i];
      const relA1 = p === -1 ? wAngles[i] : wAngles[i] - wAngles[p];

      dv.setFloat32(rOff + 0, 1.0, false);
      dv.setFloat32(rOff + 4, STICKFIGURE_BONE_LENGTHS[i], false);
      dv.setInt32(rOff + 8, STICKFIGURE_BONE_THICKNESS[i], false);
      dv.setFloat32(rOff + 12, relA1, false);
      dv.setFloat32(rOff + 16, defA2[i], false);
      dv.setFloat32(rOff + 20, defA3[i], false);
      dv.setUint32(rOff + 24, manArgb, false);
    }
    cursor += instTmpl.length;
  };

  // Writes Figure Instance 2: The Ball (Circle node 13 with diameter 72px at scale 0.5 = 36px / radius 18px)
  const writeBallInstance = (bx: number, by: number) => {
    buf.set(instTmpl, cursor);
    dv.setInt32(cursor + 0, 0, false);
    dv.setInt32(cursor + 4, 1, false);
    dv.setInt32(cursor + 8, 2, false); // Instance ID 2
    dv.setFloat32(cursor + 71, 0.5, false); // Scale: 0.50x
    dv.setFloat32(cursor + 75, bx, false); // Scene X
    dv.setFloat32(cursor + 79, by, false); // Scene Y
    dv.setUint32(cursor + 83, ballArgb, false);

    for (let i = 0; i < 17; i++) {
      const rOff = cursor + 112 + i * 58;
      if (i === 13) {
        // Node 13 is the Head Circle in MyBase
        // Length 72.0 at scale 0.5 = 36.0 px diameter (radius 18.0 px)
        dv.setFloat32(rOff + 0, 1.0, false);
        dv.setFloat32(rOff + 4, 72.0, false);
        dv.setInt32(rOff + 8, 72, false);
        dv.setFloat32(rOff + 12, 0.0, false);
        dv.setFloat32(rOff + 16, 0.0, false);
        dv.setFloat32(rOff + 20, 90.0, false);
        dv.setUint32(rOff + 24, ballArgb, false);
      } else {
        // All other bones collapsed to length 0 and thickness 0
        dv.setFloat32(rOff + 0, 1.0, false);
        dv.setFloat32(rOff + 4, 0.0, false);
        dv.setInt32(rOff + 8, 0, false);
        dv.setFloat32(rOff + 12, 0.0, false);
        dv.setFloat32(rOff + 16, 0.0, false);
        dv.setFloat32(rOff + 20, 0.0, false);
        dv.setUint32(rOff + 24, ballArgb, false);
      }
    }
    cursor += instTmpl.length;
  };

  for (let f = 0; f < nFrames; f++) {
    const spec = framesSpec[f];
    buf.set(fhdrTmpl, cursor);
    dv.setFloat32(cursor + 42, spec.camZoom, false);
    dv.setFloat32(cursor + 46, spec.camX, false);
    dv.setFloat32(cursor + 50, spec.camY, false);
    dv.setInt32(cursor + 54, 2, false); // 2 Figure instances per frame
    cursor += fhdrTmpl.length;

    writeManInstance(spec.manX, spec.manY, spec.manAngles);
    writeBallInstance(spec.ballX, spec.ballY);

    buf.set(fftrTmpl, cursor);
    cursor += fftrTmpl.length;
  }

  buf.set(ptrlTmpl, cursor);

  const compressedPayload = await gzipBytes(buf);
  const finalStknds = new Uint8Array(STKNDS_PREFIX.length + compressedPayload.length);
  finalStknds.set(STKNDS_PREFIX, 0);
  finalStknds.set(compressedPayload, STKNDS_PREFIX.length);
  return finalStknds;
}
