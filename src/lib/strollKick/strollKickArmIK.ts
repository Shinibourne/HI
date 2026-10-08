import { solveTwoBoneIK } from '../skills/kinematicsSolvers';
import { SitWalkKickKeyframeSpec } from './strollKickTypes';

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
