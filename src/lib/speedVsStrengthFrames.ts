/**
 * SPEED VS STRENGTH: 36-FRAME CHOREOGRAPHIC ENGINE
 * =================================================
 * Concepts & Biomechanical Principles:
 * - Character A: Extremely fast, lightweight, evasive.
 * - Character B: Slower, heavier, powerful, grounded.
 * - Shared Ground Plane: Invariant Y = 755.0 px (Stick Nodes standard).
 * - True Physical Acceleration: Slow-out → progressive acceleration → burst.
 * - Zero Teleportation: Continuous Character Root trajectories with intermediate poses.
 * - Physical Arc Haymaker & Readable Duck/Slip Miss.
 * - Dynamic Counter Side Kick: Plant → Chamber → Extension → Impact Hit-Stop.
 * - Ballistic Launch: Originates from exact kick contact point (X=860, Y=525)
 *   following true parabolic arc into heavy touchdown and skid slide.
 * - Final Contrast: A remains standing untouched; B recovers heavily across the arena.
 */

import {
  STICKFIGURE_BONE_LENGTHS,
  STICKFIGURE_BONE_THICKNESS,
  STICKFIGURE_PARENTS,
} from './stkndsCodec';

export interface SpeedVsStrengthGeneratorConfig {
  projectName: string;
  targetFps: 12 | 24;
  interpolate24FpsFrames: boolean; // If true at 24 FPS, generates 71 frames; else 36 frames
  speedColorHex: string;   // Character A (e.g. #F59E0B Amber)
  strengthColorHex: string; // Character B (e.g. #1E293B Slate)
  cameraDynamicTrack: boolean;
}

export interface SpeedVsStrengthKeyframeSpec {
  frame: number;
  act: string;
  phase: string;
  camX: number;
  camY: number;
  camZoom: number;
  charAX: number;
  charAY: number;
  charAAngles: number[];
  charBX: number;
  charBY: number;
  charBAngles: number[];
}

const STKNDS_PREFIX = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]);

async function gzipBytes(raw: Uint8Array): Promise<Uint8Array> {
  const cs = new CompressionStream('gzip');
  const writer = cs.writable.getWriter();
  writer.write(raw);
  writer.close();
  const response = new Response(cs.readable);
  const ab = await response.arrayBuffer();
  return new Uint8Array(ab);
}

function hexColorToArgbUint32(hex: string): number {
  const clean = hex.replace('#', '');
  const rgb = parseInt(clean, 16) & 0xffffff;
  return ((0xff << 24) | rgb) >>> 0;
}

// =============================================================================
// POSE DICTIONARY: CHARACTER A (SPEED) & CHARACTER B (STRENGTH)
// =============================================================================

// Character A: Facing Right (+X) Stand & Sprint
const CHAR_A_STAND_R = [0, -74, -86, 0, -96, -102, 0, 86, 84, -65, -45, -40, 88, 88, -95, -75, -70];
const CHAR_A_BOUNCE_R = [0, -78, -92, 0, -94, -100, 0, 85, 83, -62, -42, -38, 88, 88, -98, -78, -72];
const CHAR_A_CROUCH_R = [0, -62, -114, 0, -106, -128, 0, 72, 68, -45, -20, -15, 84, 84, -125, -95, -90];
const CHAR_A_COIL_R = [0, -48, -128, 10, -118, -145, 0, 66, 62, -35, 15, 20, 82, 80, -135, -115, -110];
const CHAR_A_LAUNCH_R = [0, -32, -85, 15, -135, -165, -25, 78, 76, 35, 85, 90, 86, 86, -155, -135, -130];
const CHAR_A_SPRINT_R1 = [0, 18, -35, 0, -145, -170, -20, 82, 80, 55, 95, 100, 88, 88, -165, -145, -140];
const CHAR_A_SPRINT_R2 = [0, -145, -170, -20, 22, -38, 0, 84, 82, -165, -145, -140, 88, 88, 55, 95, 100];
const CHAR_A_PASS_R = [0, -155, -175, -30, 35, -45, 5, 86, 84, -170, -150, -145, 90, 90, 65, 105, 110];
const CHAR_A_BRAKE_R = [0, -55, -72, 18, -115, -138, -15, 96, 94, -115, -85, -80, 88, 88, -75, -45, -40];

// Character A: Facing Left (-X) Stance & Counter
const CHAR_A_PIVOT_L = [0, -105, -92, -179, -85, -80, -179, 88, 90, -85, -105, -110, 92, 92, -75, -55, -50];
const CHAR_A_STAND_L = [0, -106, -94, -179, -84, -78, -179, 90, 92, -95, -115, -120, 92, 92, -65, -45, -40];
const CHAR_A_SLIP_DIP = [0, -128, -75, -179, -68, -45, -179, 108, 114, -135, -155, -160, 98, 102, -45, -25, -20];
const CHAR_A_SLIP_DUCK = [0, -135, -65, -179, -58, -35, -179, 116, 122, -145, -165, -170, 105, 110, -35, -15, -10];
const CHAR_A_RISE_L = [0, -115, -85, -179, -75, -65, -179, 98, 102, -115, -135, -140, 94, 95, -55, -35, -30];
const CHAR_A_CHAMBER_KICK = [0, -95, -88, -179, 142, 48, -25, 68, 62, -45, -25, -20, 86, 88, -135, -115, -110];
const CHAR_A_SIDE_KICK = [0, -92, -86, -179, 172, 175, -170, 48, 42, -25, 0, 5, 84, 86, -145, -125, -120];
const CHAR_A_RETRACT_KICK = [0, -94, -88, -179, 135, 58, -45, 62, 58, -45, -25, -20, 86, 88, -125, -105, -100];
const CHAR_A_SETTLE_L = [0, -104, -92, -179, -86, -80, -179, 89, 91, -85, -105, -110, 92, 92, -75, -55, -50];

// Character B: Facing Left (-X) Heavy Power Stance
const CHAR_B_STAND_L = [0, -108, -94, -179, -76, -72, -179, 92, 94, -115, -140, -145, 94, 95, -65, -40, -35];
const CHAR_B_BREATH_L = [0, -106, -92, -179, -78, -74, -179, 94, 96, -118, -142, -148, 95, 96, -62, -38, -32];
const CHAR_B_BRACE_L = [0, -112, -88, -179, -72, -68, -179, 90, 92, -112, -136, -142, 92, 93, -68, -44, -38];
const CHAR_B_TRACK_L1 = [0, -110, -90, -179, -74, -70, -179, 91, 92, -110, -134, -140, 88, 86, -65, -42, -36];
const CHAR_B_TRACK_L2 = [0, -108, -92, -179, -76, -72, -179, 91, 92, -105, -128, -135, 82, 80, -62, -38, -32];
const CHAR_B_SNAP_HEAD = [0, -105, -94, -179, -78, -74, -179, 90, 90, -98, -120, -125, 75, 72, -58, -35, -30];

// Character B: Facing Right (+X) Staggered Heavy Turn & Haymaker Punch
const CHAR_B_PIVOT_R = [0, -78, -88, 0, -104, -108, 0, 86, 84, -75, -50, -45, 88, 88, -115, -90, -85];
const CHAR_B_TORSO_TWIST = [0, -74, -86, 0, -108, -112, 0, 82, 78, -65, -35, -30, 86, 85, -125, -105, -100];
const CHAR_B_COIL_PUNCH = [0, -72, -85, 0, -112, -116, 0, 96, 98, 160, 135, 130, 92, 92, -85, -55, -50];
const CHAR_B_LUNGE_PUNCH = [0, -68, -84, 0, -122, -130, 0, 76, 72, 110, 65, 58, 86, 85, -135, -115, -110];
const CHAR_B_EXTEND_PUNCH = [0, -62, -82, 0, -132, -145, 0, 68, 62, 18, 8, 0, 84, 82, -155, -135, -130];
const CHAR_B_MISS_OVEREXTEND = [0, -56, -80, 0, -142, -158, 0, 58, 52, -12, -18, -24, 78, 75, -165, -145, -140];

// Character B: Impact, Ballistic Launch, Skid & Heavy Recovery
const CHAR_B_IMPACT_SQUASH = [0, -45, -88, 0, -125, -142, 0, 114, 126, -35, -55, -60, 108, 114, -145, -135, -130];
const CHAR_B_LAUNCH_RISE = [0, 8, -45, 25, -65, -115, 0, 124, 135, 45, 15, 8, 115, 120, -115, -95, -90];
const CHAR_B_AIR_APEX = [0, 32, -22, 45, -35, -85, 15, 136, 148, 85, 55, 48, 125, 130, -75, -55, -50];
const CHAR_B_AIR_DESCENT = [0, 18, -35, 30, -55, -105, 5, 128, 138, 65, 35, 28, 118, 122, -95, -75, -70];
const CHAR_B_TOUCHDOWN_SKID = [0, -52, -118, 0, -98, -138, 0, 95, 92, -65, -45, -40, 92, 92, -115, -95, -90];
const CHAR_B_SLIDE_BRACE = [0, -42, -128, 10, -112, -148, 0, 78, 72, -45, 12, 18, 86, 85, -135, -115, -110];
const CHAR_B_RECOVER_GROUND = [0, -38, -132, 12, -118, -152, 0, 72, 66, -35, 18, 24, 82, 80, -142, -122, -118];

// =============================================================================
// CANONICAL 36-FRAME CHOREOGRAPHY: SPEED VS STRENGTH
// =============================================================================

export const CANONICAL_36_SPEED_VS_STRENGTH_FRAMES: SpeedVsStrengthKeyframeSpec[] = [
  // ACT 1: STANDOFF & SIZING UP (Frames 00..04) — Same Ground Plane (Y = 755 px)
  {
    frame: 0,
    act: 'Act 1: Standoff & Sizing Up',
    phase: 'Both Fighters Face Off (A Agile Left X=380, B Heavy Right X=780)',
    camX: -120.0,
    camY: 0.0,
    camZoom: 1.15,
    charAX: 380.0,
    charAY: 510.0,
    charAAngles: CHAR_A_STAND_R,
    charBX: 780.0,
    charBY: 512.0,
    charBAngles: CHAR_B_STAND_L,
  },
  {
    frame: 1,
    act: 'Act 1: Standoff & Sizing Up',
    phase: 'Subtle Idle Shift (A Weight Forward, B Grounded Chest Expansion)',
    camX: -120.0,
    camY: 0.0,
    camZoom: 1.15,
    charAX: 380.0,
    charAY: 509.0,
    charAAngles: CHAR_A_BOUNCE_R,
    charBX: 780.0,
    charBY: 511.0,
    charBAngles: CHAR_B_BREATH_L,
  },
  {
    frame: 2,
    act: 'Act 1: Standoff & Sizing Up',
    phase: 'Tension Build (B Sinks into Knee Brace, A Rocks on Balls of Feet)',
    camX: -120.0,
    camY: 0.0,
    camZoom: 1.15,
    charAX: 380.0,
    charAY: 511.0,
    charAAngles: CHAR_A_STAND_R,
    charBX: 780.0,
    charBY: 513.0,
    charBAngles: CHAR_B_BRACE_L,
  },
  {
    frame: 3,
    act: 'Act 1: Standoff & Sizing Up',
    phase: 'A Subtly Lowers Center of Gravity (Eye Contact Locked)',
    camX: -120.0,
    camY: 0.0,
    camZoom: 1.16,
    charAX: 380.0,
    charAY: 514.0,
    charAAngles: CHAR_A_CROUCH_R,
    charBX: 780.0,
    charBY: 512.0,
    charBAngles: CHAR_B_STAND_L,
  },
  {
    frame: 4,
    act: 'Act 1: Standoff & Sizing Up',
    phase: 'Micro-Stillness Before the Twitch (Neither Character Frozen)',
    camX: -120.0,
    camY: 0.0,
    camZoom: 1.16,
    charAX: 380.0,
    charAY: 515.0,
    charAAngles: CHAR_A_CROUCH_R,
    charBX: 780.0,
    charBY: 512.0,
    charBAngles: CHAR_B_BRACE_L,
  },

  // ACT 2: A LAUNCHES — PROGRESSIVE ACCELERATION (Frames 05..08)
  {
    frame: 5,
    act: 'Act 2: The Launch',
    phase: 'A Anticipation 1: Crouch & Rear Leg Loads Deeply',
    camX: -125.0,
    camY: 0.0,
    camZoom: 1.18,
    charAX: 380.0,
    charAY: 518.0,
    charAAngles: CHAR_A_COIL_R,
    charBX: 780.0,
    charBY: 512.0,
    charBAngles: CHAR_B_BRACE_L,
  },
  {
    frame: 6,
    act: 'Act 2: The Launch',
    phase: 'A Anticipation 2: Torso Leans Forward & Arms Counterbalance',
    camX: -130.0,
    camY: 0.0,
    camZoom: 1.20,
    charAX: 395.0,
    charAY: 516.0,
    charAAngles: CHAR_A_COIL_R,
    charBX: 780.0,
    charBY: 512.0,
    charBAngles: CHAR_B_TRACK_L1,
  },
  {
    frame: 7,
    act: 'Act 2: The Launch',
    phase: 'A Explodes Forward (Slow-Out Drive, Tight Spacing +40px)',
    camX: -140.0,
    camY: 0.0,
    camZoom: 1.22,
    charAX: 435.0,
    charAY: 512.0,
    charAAngles: CHAR_A_LAUNCH_R,
    charBX: 780.0,
    charBY: 512.0,
    charBAngles: CHAR_B_TRACK_L1,
  },
  {
    frame: 8,
    act: 'Act 2: The Launch',
    phase: 'A Progressive Acceleration (+85px Spacing, Sprinting Stride)',
    camX: -155.0,
    camY: 0.0,
    camZoom: 1.24,
    charAX: 520.0,
    charAY: 506.0,
    charAAngles: CHAR_A_SPRINT_R1,
    charBX: 780.0,
    charBY: 512.0,
    charBAngles: CHAR_B_TRACK_L2,
  },

  // ACT 3: SPEED BURST — A SHOOTS PAST B (Frames 09..12) — NO TELEPORTING
  {
    frame: 9,
    act: 'Act 3: Speed Burst',
    phase: 'A Streamlined Torpedo Sprint (+125px Spacing, Approaching B)',
    camX: -175.0,
    camY: 0.0,
    camZoom: 1.26,
    charAX: 645.0,
    charAY: 506.0,
    charAAngles: CHAR_A_SPRINT_R2,
    charBX: 780.0,
    charBY: 512.0,
    charBAngles: CHAR_B_TRACK_L2,
  },
  {
    frame: 10,
    act: 'Act 3: Speed Burst',
    phase: 'THE FLASH PASS: A Shoots Directly Beside B (X=765, Rapid Leg Cycle)',
    camX: -195.0,
    camY: 0.0,
    camZoom: 1.28,
    charAX: 765.0,
    charAY: 508.0,
    charAAngles: CHAR_A_PASS_R,
    charBX: 780.0,
    charBY: 512.0,
    charBAngles: CHAR_B_SNAP_HEAD,
  },
  {
    frame: 11,
    act: 'Act 3: Speed Burst',
    phase: 'A Shoots Past B (+120px Spacing, B Head Snaps Right Looking Over Shoulder)',
    camX: -215.0,
    camY: 0.0,
    camZoom: 1.30,
    charAX: 885.0,
    charAY: 510.0,
    charAAngles: CHAR_A_SPRINT_R1,
    charBX: 780.0,
    charBY: 512.0,
    charBAngles: CHAR_B_SNAP_HEAD,
  },
  {
    frame: 12,
    act: 'Act 3: Speed Burst',
    phase: 'A High-Speed Brake & Deceleration Plant (Right Foot Digs on Y=755)',
    camX: -230.0,
    camY: 0.0,
    camZoom: 1.32,
    charAX: 965.0,
    charAY: 514.0,
    charAAngles: CHAR_A_BRAKE_R,
    charBX: 780.0,
    charBY: 512.0,
    charBAngles: CHAR_B_SNAP_HEAD,
  },

  // ACT 4: B REACTS & STAGGERED HEAVY TURN (Frames 13..16) — Weight & Mass Contrast
  {
    frame: 13,
    act: 'Act 4: B Reacts & Pivots',
    phase: 'B Feet Plant Heavily; A Performs Instant Agile 180° Pivot',
    camX: -235.0,
    camY: 0.0,
    camZoom: 1.34,
    charAX: 970.0,
    charAY: 512.0,
    charAAngles: CHAR_A_PIVOT_L,
    charBX: 780.0,
    charBY: 514.0,
    charBAngles: CHAR_B_BRACE_L,
  },
  {
    frame: 14,
    act: 'Act 4: B Reacts & Pivots',
    phase: 'B Hips Rotate 180° (Feet Lead, Mass Lagging, A in Light Stance)',
    camX: -240.0,
    camY: 0.0,
    camZoom: 1.35,
    charAX: 970.0,
    charAY: 510.0,
    charAAngles: CHAR_A_STAND_L,
    charBX: 785.0,
    charBY: 515.0,
    charBAngles: CHAR_B_PIVOT_R,
  },
  {
    frame: 15,
    act: 'Act 4: B Reacts & Pivots',
    phase: 'B Torso Follows Hips (Heavy Spine Twists Toward A)',
    camX: -240.0,
    camY: 0.0,
    camZoom: 1.35,
    charAX: 970.0,
    charAY: 510.0,
    charAAngles: CHAR_A_STAND_L,
    charBX: 790.0,
    charBY: 515.0,
    charBAngles: CHAR_B_TORSO_TWIST,
  },
  {
    frame: 16,
    act: 'Act 4: B Reacts & Pivots',
    phase: 'B Punching Arm Retracts; Rear Foot Digs into Floor (Massive Anticipation)',
    camX: -242.0,
    camY: 0.0,
    camZoom: 1.36,
    charAX: 970.0,
    charAY: 510.0,
    charAAngles: CHAR_A_STAND_L,
    charBX: 792.0,
    charBY: 515.0,
    charBAngles: CHAR_B_COIL_PUNCH,
  },

  // ACT 5: THE PUNCH & THE SLIP (Frames 17..20) — Visible Miss & Over-extension
  {
    frame: 17,
    act: 'Act 5: The Punch & The Slip',
    phase: 'B Maximum Punch Wind-Up Coil; A Senses Strike & Lowers Stance',
    camX: -245.0,
    camY: 10.0,
    camZoom: 1.38,
    charAX: 970.0,
    charAY: 516.0,
    charAAngles: CHAR_A_STAND_L,
    charBX: 795.0,
    charBY: 515.0,
    charBAngles: CHAR_B_COIL_PUNCH,
  },
  {
    frame: 18,
    act: 'Act 5: The Punch & The Slip',
    phase: 'B Unleashes Powerful Punch Along Arc; A Initiates Slip Dip',
    camX: -248.0,
    camY: 15.0,
    camZoom: 1.40,
    charAX: 970.0,
    charAY: 532.0,
    charAAngles: CHAR_A_SLIP_DIP,
    charBX: 820.0,
    charBY: 516.0,
    charBAngles: CHAR_B_LUNGE_PUNCH,
  },
  {
    frame: 19,
    act: 'Act 5: The Punch & The Slip',
    phase: 'B Punch Whips at Chest Height (Y=460); A Ducks Underneath (Head Y=492)',
    camX: -250.0,
    camY: 20.0,
    camZoom: 1.42,
    charAX: 970.0,
    charAY: 542.0,
    charAAngles: CHAR_A_SLIP_DUCK,
    charBX: 855.0,
    charBY: 517.0,
    charBAngles: CHAR_B_EXTEND_PUNCH,
  },
  {
    frame: 20,
    act: 'Act 5: The Punch & The Slip',
    phase: 'THE MISS: Fist Whips Through Empty Air! B Over-Extends Off-Balance',
    camX: -248.0,
    camY: 18.0,
    camZoom: 1.40,
    charAX: 970.0,
    charAY: 530.0,
    charAAngles: CHAR_A_RISE_L,
    charBX: 870.0,
    charBY: 518.0,
    charBAngles: CHAR_B_MISS_OVEREXTEND,
  },

  // ACT 6: A COUNTERS — PLANT, CHAMBER, KICK & IMPACT (Frames 21..24)
  {
    frame: 21,
    act: 'Act 6: A Counters',
    phase: 'A Recognizes Opening & Plants Stance Foot; B Struggles to Brake',
    camX: -244.0,
    camY: 15.0,
    camZoom: 1.38,
    charAX: 970.0,
    charAY: 515.0,
    charAAngles: CHAR_A_STAND_L,
    charBX: 870.0,
    charBY: 518.0,
    charBAngles: CHAR_B_MISS_OVEREXTEND,
  },
  {
    frame: 22,
    act: 'Act 6: A Counters',
    phase: 'A Torques Hips & Chambers Knee High (Thigh +142°, Shin +48°)',
    camX: -242.0,
    camY: 12.0,
    camZoom: 1.38,
    charAX: 970.0,
    charAY: 512.0,
    charAAngles: CHAR_A_CHAMBER_KICK,
    charBX: 870.0,
    charBY: 518.0,
    charBAngles: CHAR_B_MISS_OVEREXTEND,
  },
  {
    frame: 23,
    act: 'Act 6: A Counters',
    phase: 'A Whips Fast Side Kick Toward B Exposed Ribs',
    camX: -240.0,
    camY: 10.0,
    camZoom: 1.38,
    charAX: 970.0,
    charAY: 510.0,
    charAAngles: CHAR_A_SIDE_KICK,
    charBX: 865.0,
    charBY: 518.0,
    charBAngles: CHAR_B_MISS_OVEREXTEND,
  },
  {
    frame: 24,
    act: 'Act 6: A Counters',
    phase: 'IMPACT CLASH! A Foot Strikes B Torso at X=860 (Compression & Hit-Stop)',
    camX: -238.0,
    camY: 10.0,
    camZoom: 1.40,
    charAX: 970.0,
    charAY: 510.0,
    charAAngles: CHAR_A_SIDE_KICK,
    charBX: 860.0,
    charBY: 520.0,
    charBAngles: CHAR_B_IMPACT_SQUASH,
  },

  // ACT 7: B GETS KICKED AWAY — PARABOLIC LAUNCH & SKID (Frames 25..31)
  {
    frame: 25,
    act: 'Act 7: Ballistic Launch',
    phase: 'Impulse Launch: B Torso Bends from Impact, Feet Leave Ground',
    camX: -220.0,
    camY: 5.0,
    camZoom: 1.35,
    charAX: 965.0,
    charAY: 510.0,
    charAAngles: CHAR_A_SIDE_KICK,
    charBX: 840.0,
    charBY: 508.0,
    charBAngles: CHAR_B_LAUNCH_RISE,
  },
  {
    frame: 26,
    act: 'Act 7: Ballistic Launch',
    phase: 'B Airborne Ascent: Body Travels Backward (X=775, Y=465), Legs Trail',
    camX: -190.0,
    camY: 0.0,
    camZoom: 1.30,
    charAX: 960.0,
    charAY: 510.0,
    charAAngles: CHAR_A_RETRACT_KICK,
    charBX: 775.0,
    charBY: 465.0,
    charBAngles: CHAR_B_LAUNCH_RISE,
  },
  {
    frame: 27,
    act: 'Act 7: Ballistic Launch',
    phase: 'B Flight Apex: Peak Parabolic Altitude (X=675, Y=430), Arms React Independently',
    camX: -150.0,
    camY: 0.0,
    camZoom: 1.25,
    charAX: 955.0,
    charAY: 510.0,
    charAAngles: CHAR_A_RETRACT_KICK,
    charBX: 675.0,
    charBY: 430.0,
    charBAngles: CHAR_B_AIR_APEX,
  },
  {
    frame: 28,
    act: 'Act 7: Ballistic Launch',
    phase: 'B Ballistic Descent: Gravity Pulls B Down & Back (X=555, Y=475)',
    camX: -110.0,
    camY: 0.0,
    camZoom: 1.20,
    charAX: 950.0,
    charAY: 510.0,
    charAAngles: CHAR_A_SETTLE_L,
    charBX: 555.0,
    charBY: 475.0,
    charBAngles: CHAR_B_AIR_DESCENT,
  },
  {
    frame: 29,
    act: 'Act 7: Ballistic Launch',
    phase: 'B Low Touchdown Approach (X=435, Y=580, Boots Reaching for Floor)',
    camX: -70.0,
    camY: 0.0,
    camZoom: 1.15,
    charAX: 950.0,
    charAY: 510.0,
    charAAngles: CHAR_A_SETTLE_L,
    charBX: 435.0,
    charBY: 580.0,
    charBAngles: CHAR_B_AIR_DESCENT,
  },
  {
    frame: 30,
    act: 'Act 7: Ballistic Launch',
    phase: 'B Heavy Touchdown: Boots Strike Ground Plane Y=755, Knees Compress (X=335)',
    camX: -40.0,
    camY: 0.0,
    camZoom: 1.12,
    charAX: 950.0,
    charAY: 510.0,
    charAAngles: CHAR_A_SETTLE_L,
    charBX: 335.0,
    charBY: 542.0,
    charBAngles: CHAR_B_TOUCHDOWN_SKID,
  },
  {
    frame: 31,
    act: 'Act 7: Ballistic Launch',
    phase: 'B Skid Slide: Braced Slide Along Ground Plane to X=265, Knee & Hand Down',
    camX: -20.0,
    camY: 0.0,
    camZoom: 1.10,
    charAX: 950.0,
    charAY: 510.0,
    charAAngles: CHAR_A_SETTLE_L,
    charBX: 265.0,
    charBY: 540.0,
    charBAngles: CHAR_B_SLIDE_BRACE,
  },

  // ACT 8: CONTRAST & SETTLE (Frames 32..35) — "B Had The Power. A Had The Speed."
  {
    frame: 32,
    act: 'Act 8: Contrast & Settle',
    phase: 'B Halted in 3-Point Floor Brace (X=250); A Settles in Agile Ready Guard (X=950)',
    camX: 0.0,
    camY: 0.0,
    camZoom: 1.05,
    charAX: 950.0,
    charAY: 510.0,
    charAAngles: CHAR_A_SETTLE_L,
    charBX: 250.0,
    charBY: 540.0,
    charBAngles: CHAR_B_RECOVER_GROUND,
  },
  {
    frame: 33,
    act: 'Act 8: Contrast & Settle',
    phase: 'B Slowly Lifts Bruised Head; A Light on Feet, Breathing Easily',
    camX: 0.0,
    camY: 0.0,
    camZoom: 1.05,
    charAX: 950.0,
    charAY: 510.0,
    charAAngles: CHAR_A_STAND_L,
    charBX: 250.0,
    charBY: 538.0,
    charBAngles: CHAR_B_RECOVER_GROUND,
  },
  {
    frame: 34,
    act: 'Act 8: Contrast & Settle',
    phase: 'Standoff Settle: A Untouched & Pristine, B Grounded Across Arena',
    camX: 0.0,
    camY: 0.0,
    camZoom: 1.05,
    charAX: 950.0,
    charAY: 510.0,
    charAAngles: CHAR_A_STAND_L,
    charBX: 250.0,
    charBY: 538.0,
    charBAngles: CHAR_B_RECOVER_GROUND,
  },
  {
    frame: 35,
    act: 'Act 8: Contrast & Settle',
    phase: 'Resolution: B Had Power, A Had Speed. A Was Simply Impossible to Catch.',
    camX: 0.0,
    camY: 0.0,
    camZoom: 1.05,
    charAX: 950.0,
    charAY: 510.0,
    charAAngles: CHAR_A_STAND_L,
    charBX: 250.0,
    charBY: 538.0,
    charBAngles: CHAR_B_RECOVER_GROUND,
  },
];

/**
 * Builds keyframes with optional 24fps interpolation
 */
export function buildAdjustedSpeedStrengthFrames(
  config: SpeedVsStrengthGeneratorConfig
): SpeedVsStrengthKeyframeSpec[] {
  const base36 = CANONICAL_36_SPEED_VS_STRENGTH_FRAMES;

  if (config.targetFps === 24 && config.interpolate24FpsFrames) {
    const interpolated: SpeedVsStrengthKeyframeSpec[] = [];
    for (let i = 0; i < base36.length; i++) {
      const curr = base36[i];
      interpolated.push({
        ...curr,
        frame: interpolated.length,
      });

      if (i < base36.length - 1) {
        const next = base36[i + 1];
        // Don't blend across the impact clash frame (F24) to preserve hit-stop freeze density
        if (curr.frame === 24) {
          interpolated.push({
            ...curr,
            frame: interpolated.length,
            phase: `${curr.phase} (Hit-Stop Freeze)`,
          });
        } else {
          interpolated.push({
            frame: interpolated.length,
            act: curr.act,
            phase: `${curr.phase} (24fps In-Between)`,
            camX: Number(((curr.camX + next.camX) * 0.5).toFixed(1)),
            camY: Number(((curr.camY + next.camY) * 0.5).toFixed(1)),
            camZoom: Number(((curr.camZoom + next.camZoom) * 0.5).toFixed(2)),
            charAX: Number(((curr.charAX + next.charAX) * 0.5).toFixed(1)),
            charAY: Number(((curr.charAY + next.charAY) * 0.5).toFixed(1)),
            charAAngles: curr.charAAngles.map((a, idx) =>
              Number(((a + next.charAAngles[idx]) * 0.5).toFixed(1))
            ),
            charBX: Number(((curr.charBX + next.charBX) * 0.5).toFixed(1)),
            charBY: Number(((curr.charBY + next.charBY) * 0.5).toFixed(1)),
            charBAngles: curr.charBAngles.map((a, idx) =>
              Number(((a + next.charBAngles[idx]) * 0.5).toFixed(1))
            ),
          });
        }
      }
    }
    return interpolated;
  }

  return base36;
}

/**
 * Binary synthesizer encoding Speed vs Strength into valid Stick Nodes v334 project
 */
export async function synthesizeSpeedStrengthStknds(
  baseDecompressed27: Uint8Array,
  config: SpeedVsStrengthGeneratorConfig
): Promise<Uint8Array> {
  const framesSpec = buildAdjustedSpeedStrengthFrames(config);
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

  const speedArgb = hexColorToArgbUint32(config.speedColorHex);
  const strengthArgb = hexColorToArgbUint32(config.strengthColorHex);

  // Both characters present in every single frame (2 figures per frame)
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

  const writeFigureInstance = (
    instId: number,
    sx: number,
    sy: number,
    colorArgb: number,
    wAngles: number[]
  ) => {
    buf.set(instTmpl, cursor);
    dv.setInt32(cursor + 0, 0, false);
    dv.setInt32(cursor + 4, 1, false);
    dv.setInt32(cursor + 8, instId, false);
    dv.setFloat32(cursor + 71, 0.5, false); // Instance Scale: 0.50x
    dv.setFloat32(cursor + 75, sx, false);   // Scene X
    dv.setFloat32(cursor + 79, sy, false);   // Scene Y
    dv.setUint32(cursor + 83, colorArgb, false);

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
      dv.setUint32(rOff + 24, colorArgb, false);
    }
    cursor += instTmpl.length;
  };

  for (let f = 0; f < nFrames; f++) {
    const spec = framesSpec[f];
    buf.set(fhdrTmpl, cursor);
    dv.setFloat32(cursor + 42, spec.camZoom, false);
    dv.setFloat32(cursor + 46, spec.camX, false);
    dv.setFloat32(cursor + 50, spec.camY, false);
    dv.setInt32(cursor + 54, 2, false); // Exactly 2 figures per frame
    cursor += fhdrTmpl.length;

    // Instance 1: Character A (Speed, Gold/Amber)
    writeFigureInstance(1, spec.charAX, spec.charAY, speedArgb, spec.charAAngles);
    // Instance 2: Character B (Strength, Dark Slate)
    writeFigureInstance(2, spec.charBX, spec.charBY, strengthArgb, spec.charBAngles);

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
