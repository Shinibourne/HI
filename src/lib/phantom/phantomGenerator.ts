import { PhantomShadowboxKeyframeSpec, PhantomShadowboxGeneratorConfig } from './phantomTypes';
import { STICKFIGURE_PARENTS, STICKFIGURE_BONE_LENGTHS } from '../stknds/stickfigureStructure';

function computeLocalFK(sceneX: number, sceneY: number, angles: number[]): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < 17; i++) {
    const p = STICKFIGURE_PARENTS[i];
    const len = STICKFIGURE_BONE_LENGTHS[i] * 0.5;
    const a = angles[i];
    if (p === -1) {
      pts.push({ x: sceneX, y: sceneY });
    } else {
      const rad = (a * Math.PI) / 180;
      pts.push({
        x: pts[p].x + Math.cos(rad) * len,
        y: pts[p].y - Math.sin(rad) * len,
      });
    }
  }
  return pts;
}

// Key Poses Calibrated for Ground Y=755.0 and Human Biomechanics
const POSE_FOCUS_STILL: number[] = [
  0,
  -86, -90, 0,
  -94, -90, 180,
  90, 90,
  -88, -90, -90,
  78, 65,
  -92, -90, -90,
];

const POSE_REAPPEAR_STANCE: number[] = [
  0,
  -75, -65, 0,
  -115, -105, 180,
  88, 92,
  -42, 72, 78,
  112, 118,
  142, 62, 68,
];

const POSE_JAB_SNAP: number[] = [
  0,
  -75, -65, 0,
  -115, -105, 180,
  92, 98,
  -45, 75, 80,
  115, 120,
  180, 180, 180,
];

const POSE_JAB_HOLD: number[] = [
  0,
  -75, -65, 0,
  -115, -105, 180,
  93, 100,
  -46, 76, 80,
  116, 120,
  180, 180, 180,
];

const POSE_CROSS_SNAP: number[] = [
  0,
  -70, -60, -30,
  -115, -105, 180,
  102, 112,
  180, 180, 180,
  114, 118,
  135, 58, 65,
];

const POSE_CROSS_HOLD: number[] = [
  0,
  -70, -60, -30,
  -115, -105, 180,
  103, 114,
  180, 180, 180,
  114, 118,
  135, 58, 65,
];

const POSE_UPPERCUT_DIP: number[] = [
  0,
  -80, -50, 0,
  -125, -95, 180,
  82, 85,
  -75, 18, 25,
  108, 112,
  118, 68, 75,
];

const POSE_UPPERCUT_LAUNCH_1: number[] = [
  0,
  -88, -80, -80,
  -96, -88, -80,
  94, 98,
  52, 86, 90,
  92, 94,
  105, 50, 55,
];

const POSE_UPPERCUT_LAUNCH_2: number[] = [
  0,
  -88, -80, -85,
  -94, -86, -85,
  93, 96,
  78, 88, 90,
  90, 90,
  -40, -10, -10,
];

const POSE_UPPERCUT_APEX: number[] = [
  0,
  -88, -80, -90,
  -94, -86, -90,
  92, 95,
  90, 90, 90,
  88, 85,
  -70, -40, -40,
];

const POSE_AERIAL_REAPPEAR: number[] = [
  0,
  85, 80, 80,
  25, -80, 180,
  5, 6,
  -160, -165, -165,
  8, 12,
  -155, -160, -160,
];

const POSE_AXE_APEX: number[] = [
  0,
  100, 92, 90,
  25, -95, 180,
  2, 3,
  -168, -172, -172,
  5, 8,
  -165, -170, -170,
];

const POSE_AXE_CHOP: number[] = [
  0,
  -84, -80, -10,
  20, -90, 180,
  -15, -24,
  165, 175, 175,
  -10, -5,
  160, 170, 170,
];

const POSE_AXE_DESCENT: number[] = [
  0,
  -82, -80, 0,
  15, -90, 180,
  35, 30,
  120, 140, 140,
  25, 30,
  110, 130, 130,
];

const POSE_THREE_POINT_CROUCH: number[] = [
  0,
  -48, -112, 0,
  -120, -125, 180,
  -20, -25,
  -90, -90, -90,
  10, 15,
  50, 110, 110,
];

const POSE_CROUCH_BREATH: number[] = [
  0,
  -48, -112, 0,
  -120, -125, 180,
  -18, -23,
  -90, -90, -90,
  11, 16,
  52, 112, 112,
];

export function generate75Frames(): PhantomShadowboxKeyframeSpec[] {
  const frames: PhantomShadowboxKeyframeSpec[] = [];

  // PANEL 1: THE FOCUS (Frames 1-30, 0-indexed 0..29)
  for (let i = 0; i < 30; i++) {
    const frameNum = i;
    const str = String(i + 1).padStart(2, '0');
    frames.push({
      frame: frameNum,
      storyboardPanel: 1,
      storyboardLabel: '① THE FOCUS (Frames 1-30)',
      act: 'Act 1: The Focus',
      phase: `Rigid Stillness Stance (${str}/30)`,
      isTeleportBlank: false,
      sceneX: 640.0,
      sceneY: 505.3,
      worldAngles: POSE_FOCUS_STILL,
      facingDirection: 'center',
      contactGroundY: 755.0,
      notes: 'Center of frame. Absolute stillness held. Feet shoulder-width apart, arms straight down, chin tucked.',
    });
  }

  // PANEL 2: TELEPORT 1 (Frame 31, 0-indexed 30)
  frames.push({
    frame: 30,
    storyboardPanel: 2,
    storyboardLabel: '② TELEPORT 1 (Frame 31)',
    act: 'Act 2: Teleport 1 (The Blink)',
    phase: 'The Blink — Instant Vanish',
    isTeleportBlank: true,
    teleportEffect: 'boom',
    sceneX: -9999.0,
    sceneY: -9999.0,
    worldAngles: POSE_FOCUS_STILL,
    facingDirection: 'center',
    notes: 'BOOM flash burst! Character completely vanishes for exactly 1 blank frame.',
  });

  // PANEL 3: REAPPEARANCE & JAB (Frames 32-34, 0-indexed 31..33)
  frames.push({
    frame: 31,
    storyboardPanel: 3,
    storyboardLabel: '③ REAPPEARANCE & JAB (Frames 32-34)',
    act: 'Act 3: Reappearance & Jab',
    phase: 'Reappearance: Deep Stance & Knee Bent',
    isTeleportBlank: false,
    sceneX: 980.0,
    sceneY: 520.0,
    worldAngles: POSE_REAPPEAR_STANCE,
    facingDirection: 'left',
    contactGroundY: 755.0,
    notes: 'Instantly reappears far right in wide fighting stance, left knee bent forward, fists guarding chin.',
  });
  frames.push({
    frame: 32,
    storyboardPanel: 3,
    storyboardLabel: '③ REAPPEARANCE & JAB (Frames 32-34)',
    act: 'Act 3: Reappearance & Jab',
    phase: 'The Jab: Left Arm Snaps Laser-Straight',
    isTeleportBlank: false,
    actionSmear: 'punch_snap',
    sceneX: 980.0,
    sceneY: 520.0,
    worldAngles: POSE_JAB_SNAP,
    facingDirection: 'left',
    contactGroundY: 755.0,
    notes: 'Left arm snaps out perfectly straight at head-height (180° horizontal) with motion snap lines.',
  });
  frames.push({
    frame: 33,
    storyboardPanel: 3,
    storyboardLabel: '③ REAPPEARANCE & JAB (Frames 32-34)',
    act: 'Act 3: Reappearance & Jab',
    phase: 'The Jab: Impact Hold & Shockwave Pop',
    isTeleportBlank: false,
    sceneX: 978.0,
    sceneY: 520.0,
    worldAngles: POSE_JAB_HOLD,
    facingDirection: 'left',
    contactGroundY: 755.0,
    notes: 'Sharp punch lock against thin air selling phantom collision.',
  });

  // PANEL 4: THE CROSS (Frames 35-37, 0-indexed 34..36)
  frames.push({
    frame: 34,
    storyboardPanel: 4,
    storyboardLabel: '④ THE CROSS (Frames 35-37)',
    act: 'Act 4: The Cross',
    phase: 'Retract Left Arm & Violent Torso Twist',
    isTeleportBlank: false,
    sceneX: 976.0,
    sceneY: 520.0,
    worldAngles: POSE_CROSS_SNAP,
    facingDirection: 'left',
    contactGroundY: 755.0,
    notes: 'Retracts left arm to chin, twists torso violently left (112°), right punch snaps straight forward.',
  });
  frames.push({
    frame: 35,
    storyboardPanel: 4,
    storyboardLabel: '④ THE CROSS (Frames 35-37)',
    act: 'Act 4: The Cross',
    phase: 'Right Cross: Full Sharp Extension',
    isTeleportBlank: false,
    actionSmear: 'punch_snap',
    sceneX: 976.0,
    sceneY: 520.0,
    worldAngles: POSE_CROSS_HOLD,
    facingDirection: 'left',
    contactGroundY: 755.0,
    notes: 'Straight right punch extending fully forward (180°), rear foot pivoted on ball, shoulder driving forward.',
  });
  frames.push({
    frame: 36,
    storyboardPanel: 4,
    storyboardLabel: '⑤ RETRACT & TWIST (Frames 35-37)',
    act: 'Act 4: The Cross',
    phase: 'Retract & Twist: Prep for Uppercut',
    isTeleportBlank: false,
    sceneX: 976.0,
    sceneY: 520.0,
    worldAngles: POSE_CROSS_HOLD,
    facingDirection: 'left',
    contactGroundY: 755.0,
    notes: 'Prep for next combo; torque kinetic energy stored.',
  });

  // PANEL 6: UPPERCUT LAUNCH (Frames 38-41, 0-indexed 37..40)
  frames.push({
    frame: 37,
    storyboardPanel: 5,
    storyboardLabel: '⑥ UPPERCUT LAUNCH (Frames 38-41)',
    act: 'Act 5: Uppercut Launch',
    phase: 'Knees Bend Lower & Right Fist Drops into Chamber',
    isTeleportBlank: false,
    sceneX: 980.0,
    sceneY: 535.0,
    worldAngles: POSE_UPPERCUT_DIP,
    facingDirection: 'left',
    contactGroundY: 755.0,
    notes: 'Right arm drops, knees bend lower (Y=535), spring compression loaded.',
  });
  frames.push({
    frame: 38,
    storyboardPanel: 5,
    storyboardLabel: '⑥ UPPERCUT LAUNCH (Frames 38-41)',
    act: 'Act 5: Uppercut Launch',
    phase: 'Dynamic Upward Arc & Lifting onto Toes',
    isTeleportBlank: false,
    sceneX: 978.0,
    sceneY: 505.0,
    worldAngles: POSE_UPPERCUT_LAUNCH_1,
    facingDirection: 'left',
    notes: 'Right fist launches upward in vertical arc, character pushes up onto toes.',
  });
  frames.push({
    frame: 39,
    storyboardPanel: 5,
    storyboardLabel: '⑥ UPPERCUT LAUNCH (Frames 38-41)',
    act: 'Act 5: Uppercut Launch',
    phase: 'Explosive Vertical Momentum Liftoff',
    isTeleportBlank: false,
    sceneX: 976.0,
    sceneY: 470.0,
    worldAngles: POSE_UPPERCUT_LAUNCH_2,
    facingDirection: 'left',
    notes: 'Explosive upward momentum lifts figure airborne into the sky.',
  });
  frames.push({
    frame: 40,
    storyboardPanel: 5,
    storyboardLabel: '⑥ UPPERCUT LAUNCH (Frames 38-41)',
    act: 'Act 5: Uppercut Launch',
    phase: 'Peak Uppercut Apex (+90° Sky Rocket)',
    isTeleportBlank: false,
    sceneX: 974.0,
    sceneY: 440.0,
    worldAngles: POSE_UPPERCUT_APEX,
    facingDirection: 'left',
    notes: 'APEX: Right fist reaches absolute highest point (+90° vertical rocket), airborne suspension.',
  });

  // PANEL 7: TELEPORT 2 (Frame 42, 0-indexed 41)
  frames.push({
    frame: 41,
    storyboardPanel: 6,
    storyboardLabel: '⑦ TELEPORT 2 (Frame 42)',
    act: 'Act 6: Teleport 2 (Mid-Air Apex)',
    phase: 'Mid-Air Apex Vanish — Blank Frame',
    isTeleportBlank: true,
    teleportEffect: 'dissipation',
    sceneX: -9999.0,
    sceneY: -9999.0,
    worldAngles: POSE_UPPERCUT_APEX,
    facingDirection: 'left',
    notes: 'Vanishes mid-air apex! Exactly 1 blank frame with dissipation lines in upper right.',
  });

  // PANEL 8: AERIAL REAPPEARANCE (Frame 43, 0-indexed 42)
  frames.push({
    frame: 42,
    storyboardPanel: 7,
    storyboardLabel: '⑧ AERIAL REAPPEARANCE (Frame 43)',
    act: 'Act 7: Aerial Reappearance',
    phase: 'Torso Parallel to Ceiling & Right Leg High',
    isTeleportBlank: false,
    sceneX: 340.0,
    sceneY: 275.0,
    worldAngles: POSE_AERIAL_REAPPEAR,
    facingDirection: 'right',
    notes: 'High in the air on far left (X=340, Y=275). Torso horizontal (5° back parallel to ceiling). Right leg chambered high.',
  });

  // PANEL 9: AXE KICK DROP & SMEAR (Frames 44-46, 0-indexed 43..45)
  frames.push({
    frame: 43,
    storyboardPanel: 8,
    storyboardLabel: '⑨ AXE KICK DROP (Frames 44-46)',
    act: 'Act 8: Axe Kick Drop',
    phase: 'The Axe Kick: Maximum Chamber Apex (+102°)',
    isTeleportBlank: false,
    sceneX: 350.0,
    sceneY: 285.0,
    worldAngles: POSE_AXE_APEX,
    facingDirection: 'right',
    notes: 'Right leg whipped to absolute high point (+102°). Arms counter-balance heavy leg drop.',
  });
  frames.push({
    frame: 44,
    storyboardPanel: 8,
    storyboardLabel: '⑨ AXE KICK DROP & SMEAR (Frames 44-46)',
    act: 'Act 8: Axe Kick Drop',
    phase: 'R Leg Smear! Violent Downward Chop (-88°)',
    isTeleportBlank: false,
    actionSmear: 'axe_kick',
    sceneX: 360.0,
    sceneY: 380.0,
    worldAngles: POSE_AXE_CHOP,
    facingDirection: 'right',
    notes: 'VIOLENT CHOP: Right leg swings high and violently chops down in massive 190° arc with smear blur!',
  });
  frames.push({
    frame: 45,
    storyboardPanel: 8,
    storyboardLabel: '⑧ IMPACT (Heel Descent) (Frames 44-46)',
    act: 'Act 8: Axe Kick Drop',
    phase: 'Heel Descent: Speed Lines Toward Floor',
    isTeleportBlank: false,
    sceneX: 365.0,
    sceneY: 470.0,
    worldAngles: POSE_AXE_DESCENT,
    facingDirection: 'right',
    notes: 'Right leg locked straight, heel leading descent toward ground with speed lines.',
  });

  // PANEL 11: IMPACT & 3-POINT CROUCH (Frames 47-52, 0-indexed 46..51)
  frames.push({
    frame: 46,
    storyboardPanel: 9,
    storyboardLabel: '⑨ IMPACT (*SCREEN SHAKE*) (Frame 47)',
    act: 'Act 9: Impact & 3-Point Crouch',
    phase: 'IMPACT! Right Heel Slams Ground (*SCREEN SHAKE*)',
    isTeleportBlank: false,
    screenShake: true,
    sceneX: 370.0,
    sceneY: 544.0,
    worldAngles: POSE_THREE_POINT_CROUCH,
    facingDirection: 'right',
    contactGroundY: 755.0,
    notes: 'IMPACT SLAM! Right heel slams into ground, right fist impacts floor, *SCREEN SHAKE* triggered!',
  });
  frames.push({
    frame: 47,
    storyboardPanel: 9,
    storyboardLabel: '⑨ IMPACT (Frames 47-52)',
    act: 'Act 9: Impact & 3-Point Crouch',
    phase: 'Deep 3-Point Crouch Shock Absorption',
    isTeleportBlank: false,
    sceneX: 370.0,
    sceneY: 544.0,
    worldAngles: POSE_THREE_POINT_CROUCH,
    facingDirection: 'right',
    contactGroundY: 755.0,
    notes: 'Both feet wide, right fist punched into floor, left arm raised defensively.',
  });
  frames.push({
    frame: 48,
    storyboardPanel: 9,
    storyboardLabel: '⑨ IMPACT (Frames 47-52)',
    act: 'Act 9: Impact & 3-Point Crouch',
    phase: '3-Point Crouch Hold: Dissipation Freeze',
    isTeleportBlank: false,
    sceneX: 370.0,
    sceneY: 544.0,
    worldAngles: POSE_CROUCH_BREATH,
    facingDirection: 'right',
    contactGroundY: 755.0,
    notes: 'Holding deep crouch. Ground impact absorption.',
  });
  frames.push({
    frame: 49,
    storyboardPanel: 9,
    storyboardLabel: '⑨ IMPACT (Frames 47-52)',
    act: 'Act 9: Impact & 3-Point Crouch',
    phase: '3-Point Crouch Hold: Kinetic Energy Settle',
    isTeleportBlank: false,
    sceneX: 370.0,
    sceneY: 544.0,
    worldAngles: POSE_THREE_POINT_CROUCH,
    facingDirection: 'right',
    contactGroundY: 755.0,
    notes: 'Shock dissipates into the floor.',
  });
  frames.push({
    frame: 50,
    storyboardPanel: 9,
    storyboardLabel: '⑨ IMPACT (Frames 47-52)',
    act: 'Act 9: Impact & 3-Point Crouch',
    phase: '3-Point Crouch Hold: Breathing Expansion',
    isTeleportBlank: false,
    sceneX: 370.0,
    sceneY: 544.0,
    worldAngles: POSE_CROUCH_BREATH,
    facingDirection: 'right',
    contactGroundY: 755.0,
    notes: 'Subtle chest expansion breath.',
  });
  frames.push({
    frame: 51,
    storyboardPanel: 9,
    storyboardLabel: '⑨ IMPACT (Frames 47-52)',
    act: 'Act 9: Impact & 3-Point Crouch',
    phase: '3-Point Crouch Hold: Pre-Reset Equilibrium',
    isTeleportBlank: false,
    sceneX: 370.0,
    sceneY: 544.0,
    worldAngles: POSE_THREE_POINT_CROUCH,
    facingDirection: 'right',
    contactGroundY: 755.0,
    notes: 'Final frame of 6-frame crouch hold.',
  });

  // PANEL 12: THE RESET (SLOW MOTION) (Frames 53-75, 0-indexed 52..74, 23 Frames)
  // Cinematic ease-in curve transitioning smoothly back to P1 rigid focus pose!
  const resetCount = 23;
  for (let i = 0; i < resetCount; i++) {
    const t = i / (resetCount - 1);
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const angles = POSE_THREE_POINT_CROUCH.map((a, idx) => {
      const target = POSE_FOCUS_STILL[idx];
      return Number((a + (target - a) * ease).toFixed(1));
    });

    const basePelvisY = 544.0 + (505.3 - 544.0) * ease;
    const pts = computeLocalFK(370.0, basePelvisY, angles);
    const maxFootY = Math.max(pts[3].y, pts[6].y);
    const correctedPelvisY = Number((basePelvisY + (755.0 - maxFootY)).toFixed(1));

    let stageNote = 'Ease in: uncoiling weight, right fist lifts off turf.';
    if (t > 0.3 && t <= 0.6) {
      stageNote = 'Ease in: torso straightens, left guard arm gradually drops.';
    } else if (t > 0.6 && t <= 0.85) {
      stageNote = 'Ease in: legs straightening, arms falling naturally to sides.';
    } else if (t > 0.85) {
      stageNote = 'Ease in: spine erect, head tilts down, returning exactly to Step 1 pose.';
    }

    const resetStr = String(i + 1).padStart(2, '0');
    frames.push({
      frame: 52 + i,
      storyboardPanel: 10,
      storyboardLabel: '⑩ THE RESET (Slow Motion) (Frames 53-75)',
      act: 'Act 10: The Reset (Slow Motion)',
      phase: `The Reset: Ease-In Rise (${resetStr}/23)`,
      isTeleportBlank: false,
      sceneX: 370.0,
      sceneY: correctedPelvisY,
      worldAngles: angles,
      facingDirection: t >= 0.99 ? 'center' : 'right',
      contactGroundY: 755.0,
      notes: stageNote,
    });
  }

  return frames;
}


// Backwards compatibility alias

/**
 * Builds adjusted frames supporting 12 FPS and baked 24 FPS with blank frames preserved.
 */
export function buildAdjustedPhantomFrames(
  config: PhantomShadowboxGeneratorConfig
): PhantomShadowboxKeyframeSpec[] {
  const baseFrames = generate75Frames();

  if (config.targetFps === 24 && config.interpolate24FpsFrames) {
    const interpolated: PhantomShadowboxKeyframeSpec[] = [];
    let frameCounter = 0;

    for (let i = 0; i < baseFrames.length; i++) {
      const cur = baseFrames[i];
      interpolated.push({
        ...cur,
        frame: frameCounter++,
      });

      if (i < baseFrames.length - 1) {
        const next = baseFrames[i + 1];

        // CRITICAL TELEPORT INVARIANT:
        // If current or next frame is a teleport blank frame, DO NOT TWEEN!
        if (cur.isTeleportBlank || next.isTeleportBlank) {
          continue;
        }

        // Standard 24fps in-between
        const midAngles = cur.worldAngles.map((a, idx) =>
          Number(((a + next.worldAngles[idx]) * 0.5).toFixed(1))
        );
        interpolated.push({
          frame: frameCounter++,
          storyboardPanel: cur.storyboardPanel,
          storyboardLabel: cur.storyboardLabel,
          act: cur.act,
          phase: `${cur.phase} (24fps Tween)`,
          isTeleportBlank: false,
          sceneX: Number(((cur.sceneX + next.sceneX) * 0.5).toFixed(1)),
          sceneY: Number(((cur.sceneY + next.sceneY) * 0.5).toFixed(1)),
          worldAngles: midAngles,
          facingDirection: cur.facingDirection,
          contactGroundY: cur.contactGroundY,
          notes: `In-between frame smoothing ${cur.phase}`,
        });
      }
    }
    return interpolated;
  }

  return baseFrames;
}

/**
 * Synthesizes a valid Stick Nodes .stknds binary container for The Phantom Shadowbox.
 * Compatible with Stick Nodes v334.
 */
