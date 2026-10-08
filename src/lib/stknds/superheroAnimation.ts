import { SuperheroGeneratorConfig, StickfigureKeyframeSpec } from './stkndsCore';
import { STKNDS_PREFIX, gzipBytes, hexColorToArgbUint32 } from './stkndsCore';
import { STICKFIGURE_PARENTS, STICKFIGURE_BONE_LENGTHS, STICKFIGURE_BONE_THICKNESS } from './stickfigureStructure';

export const CANONICAL_27_SUPERHERO_FRAMES: StickfigureKeyframeSpec[] = [
  // ACT 1: WALK CYCLE (Frames 00..04) — Rebuilt with Heel-Strike, Flat Lock, Toe-Off & Pelvis Wave
  {
    frame: 0,
    act: 'Act 1: Walk Cycle',
    phase: 'Walk Stride Contact A (Heel Strike)',
    isFlightFrame: false,
    sceneX: 260.0,
    sceneY: 523.0,
    worldAngles: [0, -64, -78, 18, -112, -134, -42, 86, 82, -124, -92, -88, 84, 86, -56, -22, -16],
  },
  {
    frame: 1,
    act: 'Act 1: Walk Cycle',
    phase: 'Walk Passing Pose A (Weight Transfer)',
    isFlightFrame: false,
    sceneX: 325.0,
    sceneY: 511.0,
    worldAngles: [0, -88, -92, 0, -76, -130, -24, 88, 85, -92, -68, -64, 86, 88, -88, -60, -58],
  },
  {
    frame: 2,
    act: 'Act 1: Walk Cycle',
    phase: 'Walk Stride Contact B (Heel Strike)',
    isFlightFrame: false,
    sceneX: 390.0,
    sceneY: 523.0,
    worldAngles: [0, -112, -134, -42, -64, -78, 18, 86, 82, -56, -22, -16, 84, 86, -124, -92, -88],
  },
  {
    frame: 3,
    act: 'Act 1: Walk Cycle',
    phase: 'Walk Passing Pose B (Weight Transfer)',
    isFlightFrame: false,
    sceneX: 455.0,
    sceneY: 511.0,
    worldAngles: [0, -76, -130, -24, -88, -92, 0, 88, 85, -86, -58, -54, 86, 88, -92, -68, -64],
  },
  {
    frame: 4,
    act: 'Act 1: Walk Cycle',
    phase: 'Stop Walk & Plant Both Feet',
    isFlightFrame: false,
    sceneX: 515.0,
    sceneY: 515.0,
    worldAngles: [0, -82, -90, 0, -98, -100, 0, 90, 89, -78, -55, -50, 90, 90, -102, -85, -80],
  },

  // ACT 2: SCRATCHING HEAD (Frames 05..09)
  {
    frame: 5,
    act: 'Act 2: Head Scratch',
    phase: 'Raise Right Hand to Crown',
    isFlightFrame: false,
    sceneX: 520.0,
    sceneY: 518.0,
    worldAngles: [0, -83, -90, 0, -97, -93, 0, 91, 92, 18, 118, 138, 94, 96, -124, -46, -38],
  },
  {
    frame: 6,
    act: 'Act 2: Head Scratch',
    phase: 'Scratch Stroke 1 (Crown Up)',
    isFlightFrame: false,
    sceneX: 520.0,
    sceneY: 519.0,
    worldAngles: [0, -83, -90, 0, -97, -93, 0, 92, 95, 48, 144, 165, 98, 103, -128, -42, -35],
  },
  {
    frame: 7,
    act: 'Act 2: Head Scratch',
    phase: 'Scratch Stroke 2 (Temple Down)',
    isFlightFrame: false,
    sceneX: 520.0,
    sceneY: 521.0,
    worldAngles: [0, -83, -90, 0, -97, -93, 0, 91, 93, 38, 162, 178, 93, 95, -128, -42, -35],
  },
  {
    frame: 8,
    act: 'Act 2: Head Scratch',
    phase: 'Scratch Stroke 3 (Crown Up)',
    isFlightFrame: false,
    sceneX: 520.0,
    sceneY: 519.0,
    worldAngles: [0, -83, -90, 0, -97, -93, 0, 92, 96, 50, 142, 162, 99, 105, -128, -42, -35],
  },
  {
    frame: 9,
    act: 'Act 2: Head Scratch',
    phase: 'Scratch Stroke 4 & Gaze Up',
    isFlightFrame: false,
    sceneX: 520.0,
    sceneY: 517.0,
    worldAngles: [0, -80, -90, 0, -100, -95, 0, 90, 86, 36, 156, 172, 82, 76, -120, -55, -50],
  },

  // ACT 3 & 4: 12-FRAME SKY FLIGHT SEQUENCE (Frames 10..21)
  {
    frame: 10,
    act: 'Act 3: Sky Flight (12f)',
    phase: 'Flight 01/12: Zero-G Levitation Liftoff',
    isFlightFrame: true,
    flightStepIndex: 1,
    sceneX: 525.0,
    sceneY: 420.0,
    worldAngles: [0, -52, -108, -20, -92, -104, -15, 88, 86, -62, -45, -40, 84, 82, -118, -100, -95],
  },
  {
    frame: 11,
    act: 'Act 3: Sky Flight (12f)',
    phase: 'Flight 02/12: Mid-Air Hover Float',
    isFlightFrame: true,
    flightStepIndex: 2,
    sceneX: 530.0,
    sceneY: 330.0,
    worldAngles: [0, -42, -115, -25, -95, -110, -20, 86, 84, -55, -35, -30, 80, 76, -125, -108, -102],
  },
  {
    frame: 12,
    act: 'Act 3: Sky Flight (12f)',
    phase: 'Flight 03/12: Hover Sonic Ignition Coil',
    isFlightFrame: true,
    flightStepIndex: 3,
    sceneX: 540.0,
    sceneY: 265.0,
    worldAngles: [0, -65, -135, -40, -105, -130, -35, 64, 56, -125, -145, -150, 62, 58, -140, -155, -160],
  },
  {
    frame: 13,
    act: 'Act 4: Sky Flight (12f)',
    phase: 'Flight 04/12: Sonic Boom Pitch-Out',
    isFlightFrame: true,
    flightStepIndex: 4,
    sceneX: 610.0,
    sceneY: 195.0,
    worldAngles: [0, -158, -168, -82, -166, -174, -86, 14, 10, 8, 10, 12, 18, 22, -164, -172, -175],
  },
  {
    frame: 14,
    act: 'Act 4: Sky Flight (12f)',
    phase: 'Flight 05/12: Sky Corridor Cruise 1',
    isFlightFrame: true,
    flightStepIndex: 5,
    sceneX: 735.0,
    sceneY: 162.0,
    worldAngles: [0, -172, -176, -88, -176, -180, -90, 6, 4, 2, 4, 5, 14, 18, -172, -176, -178],
  },
  {
    frame: 15,
    act: 'Act 4: Sky Flight (12f)',
    phase: 'Flight 06/12: Sky Corridor Cruise 2',
    isFlightFrame: true,
    flightStepIndex: 6,
    sceneX: 875.0,
    sceneY: 152.0,
    worldAngles: [0, -175, -172, -84, -172, -177, -88, 4, 2, 0, 2, 3, 12, 16, -174, -178, -180],
  },
  {
    frame: 16,
    act: 'Act 4: Sky Flight (12f)',
    phase: 'Flight 07/12: Sky Corridor Cruise 3',
    isFlightFrame: true,
    flightStepIndex: 7,
    sceneX: 1015.0,
    sceneY: 146.0,
    worldAngles: [0, -171, -177, -89, -176, -173, -85, 5, 3, 1, 3, 4, 13, 17, -172, -175, -177],
  },
  {
    frame: 17,
    act: 'Act 4: Sky Flight (12f)',
    phase: 'Flight 08/12: Sky Corridor Cruise 4',
    isFlightFrame: true,
    flightStepIndex: 8,
    sceneX: 1155.0,
    sceneY: 144.0,
    worldAngles: [0, -176, -173, -85, -173, -178, -89, 4, 2, 0, 2, 3, 12, 16, -175, -178, -180],
  },
  {
    frame: 18,
    act: 'Act 4: Sky Flight (12f)',
    phase: 'Flight 09/12: Sky Corridor Cruise 5',
    isFlightFrame: true,
    flightStepIndex: 9,
    sceneX: 1295.0,
    sceneY: 146.0,
    worldAngles: [0, -172, -177, -88, -177, -174, -86, 5, 3, 1, 3, 4, 13, 17, -173, -176, -178],
  },
  {
    frame: 19,
    act: 'Act 4: Sky Flight (12f)',
    phase: 'Flight 10/12: Sky Corridor Cruise 6',
    isFlightFrame: true,
    flightStepIndex: 10,
    sceneX: 1415.0,
    sceneY: 154.0,
    worldAngles: [0, -168, -174, -86, -174, -178, -88, 2, 0, -2, 0, 2, 10, 14, -170, -174, -176],
  },
  {
    frame: 20,
    act: 'Act 4: Sky Flight (12f)',
    phase: 'Flight 11/12: High-Altitude Air Brake',
    isFlightFrame: true,
    flightStepIndex: 11,
    sceneX: 1490.0,
    sceneY: 180.0,
    worldAngles: [0, -125, -145, -60, -140, -155, -70, 38, 32, -35, -15, -10, 12, -8, 145, 130, 125],
  },
  {
    frame: 21,
    act: 'Act 4: Sky Flight (12f)',
    phase: 'Flight 12/12: Vertical Meteor Dive',
    isFlightFrame: true,
    flightStepIndex: 12,
    sceneX: 1525.0,
    sceneY: 385.0,
    worldAngles: [0, -102, -118, -45, -115, -132, -55, -52, -58, -76, -78, -80, -42, -35, 132, 120, 115],
  },

  // ACT 5: SUPERHERO 3-POINT LANDING (Frames 22..26)
  {
    frame: 22,
    act: 'Act 5: Superhero Landing',
    phase: 'Three-Point Ground Impact (Fist, Knee, Foot)',
    isFlightFrame: false,
    sceneX: 1540.0,
    sceneY: 634.0,
    worldAngles: [0, -2, -88, 0, -68, -174, -178, 28, 14, -84, -88, -90, 52, 65, 145, 132, 126],
  },
  {
    frame: 23,
    act: 'Act 5: Superhero Landing',
    phase: 'Impact Shockwave Absorption',
    isFlightFrame: false,
    sceneX: 1542.0,
    sceneY: 642.0,
    worldAngles: [0, 2, -88, 0, -64, -176, -179, 22, 8, -86, -90, -90, 46, 58, 152, 140, 134],
  },
  {
    frame: 24,
    act: 'Act 5: Superhero Landing',
    phase: 'Three-Point Brace Hold',
    isFlightFrame: false,
    sceneX: 1542.0,
    sceneY: 636.0,
    worldAngles: [0, 0, -88, 0, -66, -175, -178, 26, 12, -85, -89, -90, 62, 74, 148, 135, 128],
  },
  {
    frame: 25,
    act: 'Act 5: Superhero Landing',
    phase: 'Heroic Chin & Gaze Lift',
    isFlightFrame: false,
    sceneX: 1542.0,
    sceneY: 632.0,
    worldAngles: [0, -2, -88, 0, -68, -174, -178, 32, 18, -84, -88, -90, 76, 86, 144, 130, 124],
  },
  {
    frame: 26,
    act: 'Act 5: Superhero Landing',
    phase: 'Final Superhero Landing Settle',
    isFlightFrame: false,
    sceneX: 1542.0,
    sceneY: 630.0,
    worldAngles: [0, -2, -88, 0, -68, -174, -178, 34, 20, -84, -88, -90, 82, 90, 142, 128, 122],
  },
];

/**
 * 36-Frame Master Choreography for "The Epic Sneeze" (Governed by NATURAL_MOVEMENT_SKILL.md):
 * - Act 1: The Build-Up (Frames 00..05): Standing perfectly still, then head tilts back, shoulders rise, arms come up to chest bent at elbows.
 * - Act 2: The Hold (Frames 06..10): Sneeze gets stuck! Spine arched completely backward, held for 5 frames with high-tension tremble on arms and legs.
 * - Act 3: The Explosion (Frames 11..12): In 1–2 frames, snap character entirely forward! Head whips down past knees, spine curls into a tight ball, arms throw violently straight backward behind them.
 * - Act 4: The Recoil (Frames 13..21): Sneeze force acts like a thruster! Feet rip off the ground and character flies backward in a messy, uncontrolled mid-air backflip.
 * - Act 5: The Landing (Frames 22..26): Crashes flat on back! Arms and legs bounce up once upon impact, then drop flat.
 * - Act 6: The Aftermath (Frames 27..35): Lies perfectly still for 1 full second (6 frames), before slowly twitching one leg to show they are still alive.
 */

export function buildAdjustedSuperheroFrames(
  config: SuperheroGeneratorConfig
): StickfigureKeyframeSpec[] {
  const apexShift = config.flightApexY - 144.0;
  const scratchDelta = config.scratchAmplitudeDeg - 18.0;
  const landingDipDelta = config.landingCompressionPx - 12.0;

  const adjusted27: StickfigureKeyframeSpec[] = CANONICAL_27_SUPERHERO_FRAMES.map((spec) => {
    const angles = [...spec.worldAngles];
    let sy = spec.sceneY;

    // Shift sky corridor flight altitude when in Flight 04..11
    if (spec.isFlightFrame && (spec.flightStepIndex ?? 0) >= 4 && (spec.flightStepIndex ?? 0) <= 11) {
      sy = Math.max(95, sy + apexShift);
    }

    // Adjust head-scratch oscillation amplitude during Act 2 strokes
    if (spec.phase.includes('Scratch Stroke')) {
      const isUpStroke = spec.phase.includes('Up');
      angles[10] += isUpStroke ? -scratchDelta * 0.5 : scratchDelta * 0.5;
      angles[13] += isUpStroke ? scratchDelta * 0.25 : -scratchDelta * 0.25;
    }

    // Adjust shockwave compression on Superhero Landing impact
    if (spec.phase.includes('Shockwave')) {
      sy += landingDipDelta;
    }

    return {
      ...spec,
      sceneY: sy,
      worldAngles: angles,
    };
  });

  // If 24 FPS with full in-between baking is enabled, generate 53 frames (24 flight frames)
  if (config.targetFps === 24 && config.interpolate24FpsFrames) {
    const interpolated: StickfigureKeyframeSpec[] = [];
    let fCounter = 0;
    let flightCounter = 0;

    for (let i = 0; i < adjusted27.length; i++) {
      const cur = adjusted27[i];
      if (cur.isFlightFrame) flightCounter++;
      interpolated.push({
        ...cur,
        frame: fCounter++,
        flightStepIndex: cur.isFlightFrame ? flightCounter : undefined,
        phase: cur.isFlightFrame
          ? cur.phase.replace(/Flight \d+\/12/, `Flight ${flightCounter.toString().padStart(2, '0')}/24`)
          : cur.phase,
      });

      if (i < adjusted27.length - 1) {
        const nxt = adjusted27[i + 1];
        const midIsFlight = cur.isFlightFrame && nxt.isFlightFrame;
        if (midIsFlight) flightCounter++;
        const midAngles = cur.worldAngles.map((a: number, idx: number) => 0.5 * (a + nxt.worldAngles[idx]));
        interpolated.push({
          frame: fCounter++,
          act: cur.act,
          phase: midIsFlight
            ? `Flight ${flightCounter.toString().padStart(2, '0')}/24: Sky In-Between`
            : `${cur.phase} (24fps Tween)`,
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

  return adjusted27;
}

export async function synthesizeSuperheroStknds(
  baseDecompressed27: Uint8Array,
  config: SuperheroGeneratorConfig
): Promise<Uint8Array> {
  const framesSpec = buildAdjustedSuperheroFrames(config);
  const nFrames = framesSpec.length;

  // Build exact-sized buffer: 2594 header + nFrames * 1197 + 41 trailer
  const totalByteLength = 2594 + nFrames * 1197 + 41;
  const buf = new Uint8Array(totalByteLength);
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  // Copy 0..2594 from baseDecompressed27
  buf.set(baseDecompressed27.slice(0, 2594), 0);

  // Set target FPS (12 or 24) at byte 30 and frame count at 2587
  buf[30] = config.targetFps;
  dv.setInt32(2587, nFrames, false);

  const primaryArgb = hexColorToArgbUint32(config.primaryColorHex);
  const headArgb = hexColorToArgbUint32(config.headColorHex);

  // Update figure node colors in figure library (offset 1135 + 12)
  const figOff = 1135;
  for (let i = 0; i < 17; i++) {
    const nOff = figOff + 12 + i * 84;
    const c = i === 13 ? headArgb : primaryArgb;
    dv.setUint32(nOff + 68, c, false);
  }

  // Extract Frame 0 template (1197 B) and default node a2, a3 from baseDecompressed27
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

    // Set figure instance scale = 0.5f at +126, sceneX at +130, sceneY at +134
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

    // Set frame footer continuation bytes (+1194..+1197): 01 01 00 for 0..N-2, 00 00 00 for N-1
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

  // Copy 41-byte trailer from end of baseDecompressed27
  const trailer41 = baseDecompressed27.slice(2594 + 27 * 1197);
  buf.set(trailer41, 2594 + nFrames * 1197);

  const compressedPayload = await gzipBytes(buf);
  const finalStknds = new Uint8Array(STKNDS_PREFIX.length + compressedPayload.length);
  finalStknds.set(STKNDS_PREFIX, 0);
  finalStknds.set(compressedPayload, STKNDS_PREFIX.length);
  return finalStknds;
}
