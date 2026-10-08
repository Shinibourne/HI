import { EpicSneezeGeneratorConfig, StickfigureKeyframeSpec } from './stkndsCore';
import { STKNDS_PREFIX, gzipBytes, hexColorToArgbUint32 } from './stkndsCore';
import { STICKFIGURE_PARENTS, STICKFIGURE_BONE_LENGTHS, STICKFIGURE_BONE_THICKNESS } from './stickfigureStructure';

export const CANONICAL_36_SNEEZE_FRAMES: StickfigureKeyframeSpec[] = [
  // ACT 1: THE BUILD-UP (Frames 00..05) — Both Feet Grounded & Facing Forward
  {
    frame: 0,
    act: 'Act 1: The Build-Up',
    phase: '01. Standing Perfectly Still',
    isFlightFrame: false,
    sceneX: 1120.0,
    sceneY: 509.0,
    worldAngles: [0, -84, -90, 0, -96, -98, 0, 90, 90, -86, -78, -75, 90, 90, -94, -82, -78],
  },
  {
    frame: 1,
    act: 'Act 1: The Build-Up',
    phase: '02. Standing Still (Calm Hold)',
    isFlightFrame: false,
    sceneX: 1120.0,
    sceneY: 509.0,
    worldAngles: [0, -84, -90, 0, -96, -98, 0, 90, 90, -86, -78, -75, 90, 90, -94, -82, -78],
  },
  {
    frame: 2,
    act: 'Act 1: The Build-Up',
    phase: '03. Sudden Tickle (Head Tilts Back)',
    isFlightFrame: false,
    sceneX: 1119.0,
    sceneY: 510.0,
    worldAngles: [0, -83, -90, 0, -97, -99, 0, 93, 96, -72, -25, -15, 102, 108, -108, -35, -25],
  },
  {
    frame: 3,
    act: 'Act 1: The Build-Up',
    phase: '04. Inhale 1 (Shoulders Rise, Arms Lift)',
    isFlightFrame: false,
    sceneX: 1117.0,
    sceneY: 511.0,
    worldAngles: [0, -81, -90, 0, -99, -101, 0, 97, 103, -52, 45, 60, 112, 120, -122, 35, 50],
  },
  {
    frame: 4,
    act: 'Act 1: The Build-Up',
    phase: '05. Inhale 2 (Elbows Bent at Chest)',
    isFlightFrame: false,
    sceneX: 1115.0,
    sceneY: 513.0,
    worldAngles: [0, -79, -91, 0, -101, -103, 0, 103, 112, -38, 82, 95, 122, 132, -135, 74, 88],
  },
  {
    frame: 5,
    act: 'Act 1: The Build-Up',
    phase: '06. Massive Breath Peak (Chest Expanded)',
    isFlightFrame: false,
    sceneX: 1113.0,
    sceneY: 516.0,
    worldAngles: [0, -77, -92, 0, -103, -105, 0, 108, 120, -28, 105, 118, 130, 142, -144, 98, 112],
  },

  // ACT 2: THE HOLD (Frames 06..10)
  {
    frame: 6,
    act: 'Act 2: The Hold',
    phase: '07. Sneeze Stuck! Extreme Arch Back',
    isFlightFrame: false,
    sceneX: 1108.0,
    sceneY: 521.0,
    worldAngles: [0, -68, -95, 5, -104, -108, 2, 118, 136, -15, 118, 130, 146, 160, -155, 112, 125],
  },
  {
    frame: 7,
    act: 'Act 2: The Hold',
    phase: '08. Extreme Hold + Tension Tremble A',
    isFlightFrame: false,
    sceneX: 1106.0,
    sceneY: 522.0,
    worldAngles: [0, -65, -98, 8, -102, -110, 4, 122, 142, -11, 124, 136, 152, 166, -151, 118, 132],
  },
  {
    frame: 8,
    act: 'Act 2: The Hold',
    phase: '09. Extreme Hold + Tension Tremble B',
    isFlightFrame: false,
    sceneX: 1109.0,
    sceneY: 520.0,
    worldAngles: [0, -70, -93, 4, -106, -108, 1, 120, 139, -18, 115, 126, 149, 162, -158, 109, 121],
  },
  {
    frame: 9,
    act: 'Act 2: The Hold',
    phase: '10. Extreme Hold + Tension Tremble C',
    isFlightFrame: false,
    sceneX: 1105.0,
    sceneY: 523.0,
    worldAngles: [0, -64, -99, 9, -101, -111, 5, 124, 145, -9, 126, 138, 155, 169, -149, 121, 135],
  },
  {
    frame: 10,
    act: 'Act 2: The Hold',
    phase: '11. Pre-Blast Maximum Coil (Peak Shake)',
    isFlightFrame: false,
    sceneX: 1107.0,
    sceneY: 521.0,
    worldAngles: [0, -67, -96, 6, -104, -109, 3, 126, 148, -14, 122, 134, 158, 172, -154, 116, 129],
  },

  // ACT 3: THE EXPLOSION (Frames 11..12)
  {
    frame: 11,
    act: 'Act 3: The Explosion',
    phase: '12. EXPLOSION 1 (Violent Forward Whip)',
    isFlightFrame: false,
    sceneX: 1114.0,
    sceneY: 540.0,
    worldAngles: [0, -48, -122, 0, -72, -125, -4, -24, -68, 158, 162, 165, -96, -118, 166, 170, 172],
  },
  {
    frame: 12,
    act: 'Act 3: The Explosion',
    phase: '13. EXPLOSION 2 (Head Past Knees, Arms Thrown Back)',
    isFlightFrame: false,
    sceneX: 1104.0,
    sceneY: 558.0,
    worldAngles: [0, -34, -132, -10, -54, -135, -12, -48, -96, 168, 170, 172, -132, -152, 174, 176, 178],
  },

  // ACT 4: THE RECOIL (Frames 13..21 - Airborne Messy Backflip)
  {
    frame: 13,
    act: 'Act 4: The Recoil',
    phase: '14. Thruster Liftoff! Feet Rip Off Ground',
    isFlightFrame: true,
    flightStepIndex: 1,
    sceneX: 1045.0,
    sceneY: 445.0,
    worldAngles: [0, -12, -75, 20, -32, -95, 10, 8, -28, 152, 142, 135, -55, -72, 162, 150, 142],
  },
  {
    frame: 14,
    act: 'Act 4: The Recoil',
    phase: '15. Backflip Ascent 1 (Pitching Up/Back)',
    isFlightFrame: true,
    flightStepIndex: 2,
    sceneX: 975.0,
    sceneY: 345.0,
    worldAngles: [0, 48, -8, 65, 22, -35, 45, 68, 45, 118, 95, 85, 25, 10, 135, 110, 100],
  },
  {
    frame: 15,
    act: 'Act 4: The Recoil',
    phase: '16. Backflip Ascent 2 (Inverted Flail)',
    isFlightFrame: true,
    flightStepIndex: 3,
    sceneX: 900.0,
    sceneY: 268.0,
    worldAngles: [0, 108, 55, 120, 78, 25, 95, 128, 112, 65, 32, 20, 95, 82, 85, 52, 40],
  },
  {
    frame: 16,
    act: 'Act 4: The Recoil',
    phase: '17. Backflip Apex (Upside-Down Messy Spin)',
    isFlightFrame: true,
    flightStepIndex: 4,
    sceneX: 825.0,
    sceneY: 225.0,
    worldAngles: [0, 162, 115, 175, 135, 85, 145, 185, 172, 12, -25, -35, 160, 148, 32, -5, -15],
  },
  {
    frame: 17,
    act: 'Act 4: The Recoil',
    phase: '18. Backflip Whip-Over (Past Inverted)',
    isFlightFrame: true,
    flightStepIndex: 5,
    sceneX: 750.0,
    sceneY: 218.0,
    worldAngles: [0, 215, 168, 225, 188, 140, 195, 242, 228, -42, -78, -88, 218, 205, -22, -58, -68],
  },
  {
    frame: 18,
    act: 'Act 4: The Recoil',
    phase: '19. Backflip Descent 1 (Tumbling Down)',
    isFlightFrame: true,
    flightStepIndex: 6,
    sceneX: 678.0,
    sceneY: 248.0,
    worldAngles: [0, 268, 222, 280, 242, 195, 250, 298, 285, -95, -132, -142, 275, 262, -75, -112, -122],
  },
  {
    frame: 19,
    act: 'Act 4: The Recoil',
    phase: '20. Backflip Descent 2 (Flailing Drop)',
    isFlightFrame: true,
    flightStepIndex: 7,
    sceneX: 612.0,
    sceneY: 315.0,
    worldAngles: [0, 315, 275, 330, 292, 248, 305, 348, 338, -145, -175, -182, 328, 318, -128, -158, -165],
  },
  {
    frame: 20,
    act: 'Act 4: The Recoil',
    phase: '21. Pre-Crash Freefall (Back Facing Floor)',
    isFlightFrame: true,
    flightStepIndex: 8,
    sceneX: 555.0,
    sceneY: 425.0,
    worldAngles: [0, 18, -22, 65, -5, -42, 45, 392, 382, 165, 135, 125, 375, 368, 178, 148, 138],
  },
  {
    frame: 21,
    act: 'Act 4: The Recoil',
    phase: '22. High-Velocity Approach to Ground',
    isFlightFrame: true,
    flightStepIndex: 9,
    sceneX: 512.0,
    sceneY: 575.0,
    worldAngles: [0, 28, -8, 75, 12, -25, 60, 468, 458, 142, 112, 102, 450, 442, 155, 125, 115],
  },

  // ACT 5: THE LANDING (Frames 22..26)
  {
    frame: 22,
    act: 'Act 5: The Landing',
    phase: '23. CRASH! Flat on Back Impact',
    isFlightFrame: false,
    sceneX: 485.0,
    sceneY: 744.0,
    worldAngles: [0, 12, -6, 82, 6, -10, 78, 536, 538, 158, 128, 118, 532, 528, 165, 138, 128],
  },
  {
    frame: 23,
    act: 'Act 5: The Landing',
    phase: '24. Impact Bounce Up 1 (Arms & Legs Whip Up)',
    isFlightFrame: false,
    sceneX: 482.0,
    sceneY: 736.0,
    worldAngles: [0, 48, 18, 98, 38, 10, 92, 542, 545, 118, 78, 65, 552, 558, 126, 86, 72],
  },
  {
    frame: 24,
    act: 'Act 5: The Landing',
    phase: '25. Impact Bounce Peak (Limbs Flung Skyward)',
    isFlightFrame: false,
    sceneX: 482.0,
    sceneY: 740.0,
    worldAngles: [0, 56, 24, 104, 44, 15, 96, 540, 542, 110, 68, 55, 546, 550, 118, 75, 62],
  },
  {
    frame: 25,
    act: 'Act 5: The Landing',
    phase: '26. Gravity Drop (Limbs Falling Back Down)',
    isFlightFrame: false,
    sceneX: 482.0,
    sceneY: 746.0,
    worldAngles: [0, 22, -2, 86, 16, -5, 82, 538, 539, 152, 138, 132, 538, 536, 158, 144, 138],
  },
  {
    frame: 26,
    act: 'Act 5: The Landing',
    phase: '27. Limbs Drop Flat on Floor',
    isFlightFrame: false,
    sceneX: 482.0,
    sceneY: 748.0,
    worldAngles: [0, 2, -2, 84, 0, -3, 82, 538, 539, 178, 176, 175, 539, 539, 180, 178, 177],
  },

  // ACT 6: THE AFTERMATH (Frames 27..35)
  {
    frame: 27,
    act: 'Act 6: The Aftermath',
    phase: '28. Dead Still 1 (0.17s Rest)',
    isFlightFrame: false,
    sceneX: 482.0,
    sceneY: 748.0,
    worldAngles: [0, 2, -2, 84, 0, -3, 82, 538, 539, 178, 176, 175, 539, 539, 180, 178, 177],
  },
  {
    frame: 28,
    act: 'Act 6: The Aftermath',
    phase: '29. Dead Still 2 (0.33s Rest)',
    isFlightFrame: false,
    sceneX: 482.0,
    sceneY: 748.0,
    worldAngles: [0, 2, -2, 84, 0, -3, 82, 538, 539, 178, 176, 175, 539, 539, 180, 178, 177],
  },
  {
    frame: 29,
    act: 'Act 6: The Aftermath',
    phase: '30. Dead Still 3 (0.50s Rest)',
    isFlightFrame: false,
    sceneX: 482.0,
    sceneY: 748.0,
    worldAngles: [0, 2, -2, 84, 0, -3, 82, 538, 539, 178, 176, 175, 539, 539, 180, 178, 177],
  },
  {
    frame: 30,
    act: 'Act 6: The Aftermath',
    phase: '31. Dead Still 4 (0.67s Rest)',
    isFlightFrame: false,
    sceneX: 482.0,
    sceneY: 748.0,
    worldAngles: [0, 2, -2, 84, 0, -3, 82, 538, 539, 178, 176, 175, 539, 539, 180, 178, 177],
  },
  {
    frame: 31,
    act: 'Act 6: The Aftermath',
    phase: '32. Dead Still 5 (0.83s Rest)',
    isFlightFrame: false,
    sceneX: 482.0,
    sceneY: 748.0,
    worldAngles: [0, 2, -2, 84, 0, -3, 82, 538, 539, 178, 176, 175, 539, 539, 180, 178, 177],
  },
  {
    frame: 32,
    act: 'Act 6: The Aftermath',
    phase: '33. Dead Still 6 (1.00s Full Pause)',
    isFlightFrame: false,
    sceneX: 482.0,
    sceneY: 748.0,
    worldAngles: [0, 2, -2, 84, 0, -3, 82, 538, 539, 178, 176, 175, 539, 539, 180, 178, 177],
  },
  {
    frame: 33,
    act: 'Act 6: The Aftermath',
    phase: '34. Slow Leg Twitch 1 (Right Knee Lifts)',
    isFlightFrame: false,
    sceneX: 482.0,
    sceneY: 748.0,
    worldAngles: [0, 16, -24, 68, 0, -3, 82, 538, 539, 178, 176, 175, 539, 539, 180, 178, 177],
  },
  {
    frame: 34,
    act: 'Act 6: The Aftermath',
    phase: '35. Slow Leg Twitch 2 (Peak Alive Twitch)',
    isFlightFrame: false,
    sceneX: 482.0,
    sceneY: 748.0,
    worldAngles: [0, 28, -46, 52, 0, -3, 82, 538, 539, 178, 176, 175, 539, 539, 180, 178, 177],
  },
  {
    frame: 35,
    act: 'Act 6: The Aftermath',
    phase: '36. Slow Leg Twitch 3 (Settles Alive)',
    isFlightFrame: false,
    sceneX: 482.0,
    sceneY: 748.0,
    worldAngles: [0, 8, -12, 78, 0, -3, 82, 538, 539, 178, 176, 175, 539, 539, 180, 178, 177],
  },
];


export function buildAdjustedSneezeFrames(
  config: EpicSneezeGeneratorConfig
): StickfigureKeyframeSpec[] {
  const trembleScale = config.holdTrembleDeg / 6.0;
  const apexShift = config.recoilApexY - 218.0;
  const bounceScale = config.limbBounceDeg / 36.0;
  const twitchDelta = config.twitchAngleDeg - 28.0;

  const adjusted36: StickfigureKeyframeSpec[] = CANONICAL_36_SNEEZE_FRAMES.map((spec) => {
    const angles = [...spec.worldAngles];
    let sy = spec.sceneY;

    // Adjust high-tension tremble amplitude during Act 2 Hold (frames 7, 8, 9, 10)
    if (spec.frame >= 7 && spec.frame <= 10) {
      const sign = spec.frame % 2 === 1 ? 1 : -1;
      const delta = (trembleScale - 1.0) * 4.0 * sign;
      angles[9] += delta;
      angles[10] += delta;
      angles[14] += delta;
      angles[15] += delta;
      angles[1] += delta * 0.6;
      angles[4] -= delta * 0.6;
    }

    // Shift mid-air backflip peak altitude during Act 4 Recoil
    if (spec.isFlightFrame) {
      const weight =
        spec.frame >= 15 && spec.frame <= 18
          ? 1.0
          : spec.frame === 14 || spec.frame === 19
          ? 0.65
          : 0.3;
      sy = Math.max(110, sy + apexShift * weight);
    }

    // Adjust secondary bounce of arms & legs upon back crash (frames 23, 24)
    if (spec.frame === 23 || spec.frame === 24) {
      const extraLeg = (bounceScale - 1.0) * 22.0;
      const extraArm = (bounceScale - 1.0) * 26.0;
      angles[1] += extraLeg;
      angles[2] += extraLeg * 0.6;
      angles[4] += extraLeg;
      angles[5] += extraLeg * 0.6;
      angles[9] -= extraArm;
      angles[10] -= extraArm;
      angles[14] -= extraArm;
      angles[15] -= extraArm;
    }

    // Adjust final slow leg twitch in Act 6 (frames 33, 34)
    if (spec.frame === 33 || spec.frame === 34) {
      const factor = spec.frame === 34 ? 1.0 : 0.55;
      angles[1] += twitchDelta * factor;
      angles[2] -= twitchDelta * 1.2 * factor;
    }

    return {
      ...spec,
      sceneY: sy,
      worldAngles: angles,
    };
  });

  if (config.targetFps === 24 && config.interpolate24FpsFrames) {
    const interpolated: StickfigureKeyframeSpec[] = [];
    let fCounter = 0;
    let flightCounter = 0;

    for (let i = 0; i < adjusted36.length; i++) {
      const cur = adjusted36[i];
      if (cur.isFlightFrame) flightCounter++;
      interpolated.push({
        ...cur,
        frame: fCounter++,
        flightStepIndex: cur.isFlightFrame ? flightCounter : undefined,
      });

      if (i < adjusted36.length - 1) {
        const nxt = adjusted36[i + 1];
        const midIsFlight = cur.isFlightFrame && nxt.isFlightFrame;
        if (midIsFlight) flightCounter++;
        const midAngles = cur.worldAngles.map((a: number, idx: number) => 0.5 * (a + nxt.worldAngles[idx]));
        interpolated.push({
          frame: fCounter++,
          act: cur.act,
          phase: `${cur.phase} (24fps Tween)`,
          isFlightFrame: midIsFlight,
          flightStepIndex: midIsFlight ? flightCounter : undefined,
          sceneX: 0.5 * (cur.sceneX + nxt.sceneX),
          sceneY: 0.5 * (cur.sceneY + nxt.sceneY),
          worldAngles: midAngles,
        });
      }
    }
    return interpolated;
  }

  return adjusted36;
}

export async function synthesizeSneezeStknds(
  baseDecompressed27: Uint8Array,
  config: EpicSneezeGeneratorConfig
): Promise<Uint8Array> {
  const framesSpec = buildAdjustedSneezeFrames(config);
  const nFrames = framesSpec.length;

  const totalByteLength = 2594 + nFrames * 1197 + 41;
  const buf = new Uint8Array(totalByteLength);
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  buf.set(baseDecompressed27.slice(0, 2594), 0);
  buf[30] = config.targetFps;
  dv.setInt32(2587, nFrames, false);

  const primaryArgb = hexColorToArgbUint32(config.primaryColorHex);
  const headArgb = hexColorToArgbUint32(config.headColorHex);

  const figOff = 1135;
  for (let i = 0; i < 17; i++) {
    const nOff = figOff + 12 + i * 84;
    const c = i === 13 ? headArgb : primaryArgb;
    dv.setUint32(nOff + 68, c, false);
  }

  const frame0Template = baseDecompressed27.slice(2594, 2594 + 1197);
  const baseDv = new DataView(
    baseDecompressed27.buffer,
    baseDecompressed27.byteOffset,
    baseDecompressed27.byteLength
  );
  const defA2: number[] = [];
  const defA3: number[] = [];
  for (let i = 0; i < 17; i++) {
    const rOff0 = 2594 + 167 + i * 58;
    defA2.push(baseDv.getFloat32(rOff0 + 16, false));
    defA3.push(baseDv.getFloat32(rOff0 + 20, false));
  }

  for (let f = 0; f < nFrames; f++) {
    const spec = framesSpec[f];
    const fOff = 2594 + f * 1197;
    buf.set(frame0Template, fOff);

    dv.setFloat32(fOff + 126, 0.5, false);
    dv.setFloat32(fOff + 130, spec.sceneX, false);
    dv.setFloat32(fOff + 134, spec.sceneY, false);

    for (let i = 0; i < 17; i++) {
      const rOff = fOff + 167 + i * 58;
      const p = STICKFIGURE_PARENTS[i];
      const relA1 =
        p === -1 ? spec.worldAngles[i] : spec.worldAngles[i] - spec.worldAngles[p];
      const nodeColor = i === 13 ? headArgb : primaryArgb;

      dv.setFloat32(rOff + 0, 1.0, false);
      dv.setFloat32(rOff + 4, STICKFIGURE_BONE_LENGTHS[i], false);
      dv.setInt32(rOff + 8, STICKFIGURE_BONE_THICKNESS[i], false);
      dv.setFloat32(rOff + 12, relA1, false);
      dv.setFloat32(rOff + 16, defA2[i], false);
      dv.setFloat32(rOff + 20, defA3[i], false);
      dv.setUint32(rOff + 24, nodeColor, false);
    }

    if (f < nFrames - 1) {
      buf[fOff + 1194] = 1;
      buf[fOff + 1195] = 1;
      buf[fOff + 1196] = 0;
    } else {
      buf[fOff + 1194] = 0;
      buf[fOff + 1195] = 0;
      buf[fOff + 1196] = 0;
    }
  }

  const trailer41 = baseDecompressed27.slice(2594 + 27 * 1197);
  buf.set(trailer41, 2594 + nFrames * 1197);

  const compressedPayload = await gzipBytes(buf);
  const finalStknds = new Uint8Array(STKNDS_PREFIX.length + compressedPayload.length);
  finalStknds.set(STKNDS_PREFIX, 0);
  finalStknds.set(compressedPayload, STKNDS_PREFIX.length);
  return finalStknds;
}

/**
 * REBUILT VIA THE 33-SKILL HUMAN MOTION & BIOMECHANICS FRAMEWORK:
 * ================================================================
 * CHARACTER RED (Figure #1 — Seated Martial Artist at X=440, Y=726):
 * - Grounded asymmetrical seated guard: Right knee comfortably raised (+16° thigh, -32° shin,
 *   +14° ankle resting heel on ground Y=755), Left leg folded flat along floor (-11° thigh,
 *   -176° shin, -178° foot) as a wide triangle of support.
 * - Natural spinal C-curve: LowerSpine (+88°), UpperChest (+85°), Neck (+84°), Head (+82°).
 * - In Acts 4–6, Red's eyes/head lead the turn (+104°..+108°), his Left Arm plants behind his
 *   hip on the floor as a rear structural strut (-62°/-84°), and his Right Arm sweeps continuously
 *   (-38° -> -78° -> -118° -> -148° -> -156°, zero ±180° seam flip!) to raise a vertical
 *   Muay-Thai forearm shield (+102°) that catches Blue's shin dead-center at (356, 578).
 * - On impact (Frames 24–26), momentum transfers into Red (+5.5px braced pelvis slide to X=445.5,
 *   +1.5px compression, and -5° forearm shock absorption).
 *
 * CHARACTER BLUE (Figure #2 — Approach Walk Facing Left, Ambush Strike Facing Right):
 * - Act 1 Walk (Frames 0–9, Facing Left): Strict Left-facing Knee Hinge Polarity (shin >= thigh
 *   on every frame — zero reverse flamingo knees!). Full foot cycle: Heel Strike (-154°), Flat
 *   Plant (-179° with world X pinned), Weight Acceptance knee flexion (+6px pelvis dip), Passing
 *   swing clearance (52° knee bend), Toe-Off (-128°), opposite arm counter-swing, and braking stop.
 * - Acts 4–6 Ambush Kick (Frames 19–25, Facing Right): Strict Right-facing Knee Hinge Polarity
 *   (shin <= thigh on every frame!). Blue shifts weight forward onto his pinned Left support leg
 *   (X=195..204, Y=755), drops his pelvis, chambers his Right knee tightly (-44° thigh, -136° shin),
 *   counter-leans his torso (+106°/+112°), counter-whips his right arm (-150°), and whips his
 *   Right Shin (-10° thigh, -14° shin, -20° pointed instep) into Red's forearm shield.
 */
