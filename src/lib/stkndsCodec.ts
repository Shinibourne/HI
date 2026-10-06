export interface StkndsFigureNode {
  index: number;
  uid: number;
  nodeType: number;
  nodeTypeName: string;
  localX: number;
  localY: number;
  scale: number;
  length: number;
  defaultLength: number;
  thickness: number;
  defaultThickness: number;
  localAngle1: number;
  localAngle2: number;
  worldAngle: number;
  colorHex: string;
  childCount: number;
}

export interface StkndsFrameNodePose {
  index: number;
  scale: number;
  length: number;
  thickness: number;
  angleDelta: number;
  localAngle: number;
  worldAngle: number;
  colorHex: string;
}

export interface StkndsFrameRecord {
  frameIndex: number;
  instanceScale: number;
  sceneX: number;
  sceneY: number;
  instanceColorHex: string;
  nodes: StkndsFrameNodePose[];
}

export interface StkndsInspectionResult {
  fileName: string;
  compressedSize: number;
  decompressedSize: number;
  sha256: string;
  prefixValid: boolean;
  version: number;
  projectName: string;
  fps: number;
  tweenedFrames: number;
  figureName?: string;
  figureOffset?: number;
  figureNodes: StkndsFigureNode[];
  frameCount: number;
  frameTableOffset?: number;
  frames: StkndsFrameRecord[];
  semanticChecks: {
    label: string;
    passed: boolean;
    detail: string;
  }[];
  rawDecompressed?: Uint8Array;
}

export interface BounceGeneratorConfig {
  projectName: string;
  targetFps: 12 | 24;
  nodeType: 4 | 2;
  ballDiameter: number;
  ballThickness: number;
  primaryApexHeight: number;
  secondaryApexHeight: number;
  groundY: number;
  centerX: number;
  enableSquashStretch: boolean;
  squashIntensity: number;
  ballColorHex: string;
}

export interface SuperheroGeneratorConfig {
  projectName: string;
  targetFps: 12 | 24;
  interpolate24FpsFrames: boolean; // If true at 24 FPS, generates 53 frames (24 flight frames); else 27 frames (12 flight frames)
  flightApexY: number; // Default 148 (smaller Y is higher in sky corridor)
  scratchAmplitudeDeg: number; // Default 18 deg forearm oscillation
  landingCompressionPx: number; // Default 12 px shockwave dip
  primaryColorHex: string;
  headColorHex: string;
}

export interface EpicSneezeGeneratorConfig {
  projectName: string;
  targetFps: 12 | 24;
  interpolate24FpsFrames: boolean; // If true at 24 FPS, generates 71 frames; else 36 frames
  holdTrembleDeg: number; // Default 6 deg high-tension tremble during Act 2 Hold
  recoilApexY: number; // Default 218 px mid-air backflip peak altitude
  limbBounceDeg: number; // Default 36 deg secondary bounce of arms & legs on back impact
  twitchAngleDeg: number; // Default 28 deg slow leg twitch at the end
  primaryColorHex: string;
  headColorHex: string;
}

export interface TeleportAmbushGeneratorConfig {
  projectName: string;
  targetFps: 12 | 24;
  interpolate24FpsFrames: boolean; // If true at 24 FPS, generates 71 frames; else 36 frames
  closeUpZoom: number; // Default 2.35x camera zoom on Red's face during Act 2
  whipPanOffsetX: number; // Default 124 px camera whip-pan right offset to empty spot
  screenShakeAmplitudePx: number; // Default 20 px violent screen shake amplitude on impact
  redColorHex: string; // Default #DC2626
  blueColorHex: string; // Default #2563EB
}

export interface TeleportAmbushKeyframeSpec {
  frame: number;
  act: string;
  phase: string;
  camX: number;
  camY: number;
  camZoom: number;
  redX: number;
  redY: number;
  redAngles: number[];
  bluePresent: boolean;
  blueX: number;
  blueY: number;
  blueAngles: number[];
}

export interface StickfigureKeyframeSpec {
  frame: number;
  act: string;
  phase: string;
  isFlightFrame: boolean;
  flightStepIndex?: number; // 1..12 (or 1..24 in 24fps interpolated)
  sceneX: number;
  sceneY: number;
  worldAngles: number[]; // 17 world angles in degrees (0=Right, +90=Up, -90=Down, 180=Left)
}

export const STICKFIGURE_PARENTS: number[] = [
  -1, 0, 1, 2, 0, 4, 5, 0, 7, 8, 9, 10, 8, 12, 8, 14, 15,
];

export const STICKFIGURE_BONE_NAMES: string[] = [
  '00: Root (Pelvis)',
  '01: Right Thigh',
  '02: Right Shin',
  '03: Right Foot',
  '04: Left Thigh',
  '05: Left Shin',
  '06: Left Foot',
  '07: Lower Spine',
  '08: Upper Chest',
  '09: Right Bicep',
  '10: Right Forearm',
  '11: Right Hand',
  '12: Neck',
  '13: Head (Circle)',
  '14: Left Bicep',
  '15: Left Forearm',
  '16: Left Hand',
];

export const STICKFIGURE_BONE_LENGTHS: number[] = [
  0.0, 255.0, 245.0, 53.5, 255.0, 245.0, 53.5, 107.7, 99.4, 147.5, 177.8, 16.2,
  24.0, 155.0, 152.0, 178.0, 16.2,
];

export const STICKFIGURE_BONE_THICKNESS: number[] = [
  32, 60, 60, 48, 60, 60, 48, 62, 60, 60, 60, 47, 18, 2, 60, 60, 47,
];

/**
 * 27-Frame Master Choreography featuring a full 12-FRAME SKY FLIGHT SEQUENCE (Frames 10..21):
 * - Act 1 (Frames 00..04, 5 frames): Walk Cycle (X: 260 -> 515)
 * - Act 2 (Frames 05..09, 5 frames): Stop & Scratch Head (X: 520)
 * - Act 3 & 4 (Frames 10..21, 12 FULL FRAMES OF SKY FLIGHT):
 *     * F10 (Flight 01/12): Zero-G Levitation Liftoff (vertical anti-gravity hover rise, knee bent)
 *     * F11 (Flight 02/12): Mid-Air Hover Suspension (levitating at Y=330, looking up at sky)
 *     * F12 (Flight 03/12): Hover Sonic Ignition Coil (coiling arms at Y=265 before horizontal blast)
 *     * F13 (Flight 04/12): Sonic Boom Pitch-Out (snapping horizontal at Y=195, lead arm punching forward)
 *     * F14 (Flight 05/12): High-Sky Corridor Cruise 1 (horizontal flight at Y=162, X=735, wind flutter A)
 *     * F15 (Flight 06/12): High-Sky Corridor Cruise 2 (horizontal flight at Y=152, X=875, wind flutter B)
 *     * F16 (Flight 07/12): High-Sky Corridor Cruise 3 (horizontal flight at Y=146, X=1015, wind flutter A)
 *     * F17 (Flight 08/12): High-Sky Corridor Cruise 4 (horizontal flight at Y=144, X=1155, wind flutter B)
 *     * F18 (Flight 09/12): High-Sky Corridor Cruise 5 (horizontal flight at Y=146, X=1295, wind flutter A)
 *     * F19 (Flight 10/12): High-Sky Corridor Cruise 6 (horizontal flight at Y=154, X=1415, wind flutter B)
 *     * F20 (Flight 11/12): High-Altitude Air Brake (flaring torso & arms at X=1490, Y=180, target lock)
 *     * F21 (Flight 12/12): Supersonic Vertical Meteor Dive (diving steeply toward X=1525, Y=385)
 * - Act 5 (Frames 22..26, 5 frames): Three-Point Superhero Landing (Fist, Left Knee, Right Foot on Y~754)
 */
export const CANONICAL_27_SUPERHERO_FRAMES: StickfigureKeyframeSpec[] = [
  // ACT 1: WALK CYCLE (Frames 00..04)
  {
    frame: 0,
    act: 'Act 1: Walk Cycle',
    phase: 'Walk Stride Contact A',
    isFlightFrame: false,
    sceneX: 260.0,
    sceneY: 522.0,
    worldAngles: [0, -62, -88, 0, -115, -135, -35, 86, 82, -125, -95, -90, 84, 86, -55, -20, -15],
  },
  {
    frame: 1,
    act: 'Act 1: Walk Cycle',
    phase: 'Walk Passing Pose A',
    isFlightFrame: false,
    sceneX: 325.0,
    sceneY: 514.0,
    worldAngles: [0, -88, -94, 0, -78, -132, -30, 88, 85, -92, -70, -65, 86, 88, -88, -62, -60],
  },
  {
    frame: 2,
    act: 'Act 1: Walk Cycle',
    phase: 'Walk Stride Contact B',
    isFlightFrame: false,
    sceneX: 390.0,
    sceneY: 522.0,
    worldAngles: [0, -116, -136, -35, -64, -88, 0, 86, 82, -55, -20, -15, 84, 86, -125, -95, -90],
  },
  {
    frame: 3,
    act: 'Act 1: Walk Cycle',
    phase: 'Walk Passing Pose B',
    isFlightFrame: false,
    sceneX: 455.0,
    sceneY: 514.0,
    worldAngles: [0, -78, -130, -25, -88, -92, 0, 88, 85, -85, -60, -55, 86, 88, -92, -70, -65],
  },
  {
    frame: 4,
    act: 'Act 1: Walk Cycle',
    phase: 'Stop Walk & Plant Feet',
    isFlightFrame: false,
    sceneX: 515.0,
    sceneY: 518.0,
    worldAngles: [0, -82, -90, 0, -98, -94, 0, 90, 89, -78, -55, -50, 90, 90, -102, -85, -80],
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
export const CANONICAL_36_SNEEZE_FRAMES: StickfigureKeyframeSpec[] = [
  // ACT 1: THE BUILD-UP (Frames 00..05)
  {
    frame: 0,
    act: 'Act 1: The Build-Up',
    phase: '01. Standing Perfectly Still',
    isFlightFrame: false,
    sceneX: 1120.0,
    sceneY: 509.0,
    worldAngles: [0, -84, -90, 0, -96, -90, 180, 90, 90, -86, -78, -75, 90, 90, -94, -102, -105],
  },
  {
    frame: 1,
    act: 'Act 1: The Build-Up',
    phase: '02. Standing Still (Calm Hold)',
    isFlightFrame: false,
    sceneX: 1120.0,
    sceneY: 509.0,
    worldAngles: [0, -84, -90, 0, -96, -90, 180, 90, 90, -86, -78, -75, 90, 90, -94, -102, -105],
  },
  {
    frame: 2,
    act: 'Act 1: The Build-Up',
    phase: '03. Sudden Tickle (Head Tilts Back)',
    isFlightFrame: false,
    sceneX: 1119.0,
    sceneY: 510.0,
    worldAngles: [0, -83, -90, 0, -97, -90, 180, 93, 96, -72, -25, -15, 102, 108, -108, -35, -25],
  },
  {
    frame: 3,
    act: 'Act 1: The Build-Up',
    phase: '04. Inhale 1 (Shoulders Rise, Arms Lift)',
    isFlightFrame: false,
    sceneX: 1117.0,
    sceneY: 511.0,
    worldAngles: [0, -81, -90, 0, -99, -90, 180, 97, 103, -52, 45, 60, 112, 120, -122, 35, 50],
  },
  {
    frame: 4,
    act: 'Act 1: The Build-Up',
    phase: '05. Inhale 2 (Elbows Bent at Chest)',
    isFlightFrame: false,
    sceneX: 1115.0,
    sceneY: 513.0,
    worldAngles: [0, -79, -91, 0, -101, -90, 180, 103, 112, -38, 82, 95, 122, 132, -135, 74, 88],
  },
  {
    frame: 5,
    act: 'Act 1: The Build-Up',
    phase: '06. Massive Breath Peak (Chest Expanded)',
    isFlightFrame: false,
    sceneX: 1113.0,
    sceneY: 516.0,
    worldAngles: [0, -77, -92, 0, -103, -90, 180, 108, 120, -28, 105, 118, 130, 142, -144, 98, 112],
  },

  // ACT 2: THE HOLD (Frames 06..10)
  {
    frame: 6,
    act: 'Act 2: The Hold',
    phase: '07. Sneeze Stuck! Extreme Arch Back',
    isFlightFrame: false,
    sceneX: 1108.0,
    sceneY: 521.0,
    worldAngles: [0, -68, -95, 5, -108, -94, 175, 118, 136, -15, 118, 130, 146, 160, -155, 112, 125],
  },
  {
    frame: 7,
    act: 'Act 2: The Hold',
    phase: '08. Extreme Hold + Tension Tremble A',
    isFlightFrame: false,
    sceneX: 1106.0,
    sceneY: 522.0,
    worldAngles: [0, -65, -98, 8, -105, -97, 172, 122, 142, -11, 124, 136, 152, 166, -151, 118, 132],
  },
  {
    frame: 8,
    act: 'Act 2: The Hold',
    phase: '09. Extreme Hold + Tension Tremble B',
    isFlightFrame: false,
    sceneX: 1109.0,
    sceneY: 520.0,
    worldAngles: [0, -70, -93, 4, -110, -92, 176, 120, 139, -18, 115, 126, 149, 162, -158, 109, 121],
  },
  {
    frame: 9,
    act: 'Act 2: The Hold',
    phase: '10. Extreme Hold + Tension Tremble C',
    isFlightFrame: false,
    sceneX: 1105.0,
    sceneY: 523.0,
    worldAngles: [0, -64, -99, 9, -104, -98, 171, 124, 145, -9, 126, 138, 155, 169, -149, 121, 135],
  },
  {
    frame: 10,
    act: 'Act 2: The Hold',
    phase: '11. Pre-Blast Maximum Coil (Peak Shake)',
    isFlightFrame: false,
    sceneX: 1107.0,
    sceneY: 521.0,
    worldAngles: [0, -67, -96, 6, -107, -95, 174, 126, 148, -14, 122, 134, 158, 172, -154, 116, 129],
  },

  // ACT 3: THE EXPLOSION (Frames 11..12)
  {
    frame: 11,
    act: 'Act 3: The Explosion',
    phase: '12. EXPLOSION 1 (Violent Forward Whip)',
    isFlightFrame: false,
    sceneX: 1114.0,
    sceneY: 540.0,
    worldAngles: [0, -48, -122, 0, -72, -125, 180, -24, -68, 158, 162, 165, -96, -118, 166, 170, 172],
  },
  {
    frame: 12,
    act: 'Act 3: The Explosion',
    phase: '13. EXPLOSION 2 (Head Past Knees, Arms Thrown Back)',
    isFlightFrame: false,
    sceneX: 1104.0,
    sceneY: 558.0,
    worldAngles: [0, -34, -132, -10, -54, -135, 170, -48, -96, 168, 170, 172, -132, -152, 174, 176, 178],
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

const NODE_TYPE_NAMES: Record<number, string> = {
  255: 'Root Anchor (255)',
  0: 'Rounded Segment (0)',
  1: 'Segment (1)',
  2: 'Circle Ring / Head (2)',
  3: 'Triangle / Polygon (3)',
  4: 'Filled Circle / Ball (4)',
  5: 'Smart Elastic Circle (5)',
  6: 'Curved Limb Segment (6)',
};

export const CANONICAL_22_FRAME_PHASES: {
  frame: number;
  normY: number;
  phase: string;
  squashFactor: number;
}[] = [
  { frame: 0, normY: 0, phase: 'Phase 1: Contact (Ground)', squashFactor: 0.80 },
  { frame: 1, normY: -18, phase: 'Phase 2: Launch Impulse', squashFactor: 1.15 },
  { frame: 2, normY: -42, phase: 'Phase 2: Launch Acceleration', squashFactor: 1.11 },
  { frame: 3, normY: -70, phase: 'Phase 3: Primary Ascent', squashFactor: 1.06 },
  { frame: 4, normY: -96, phase: 'Phase 3: Primary Ascent', squashFactor: 1.02 },
  { frame: 5, normY: -115, phase: 'Phase 3: Decelerating Ascent', squashFactor: 1.00 },
  { frame: 6, normY: -126, phase: 'Phase 4: Primary Apex Approach', squashFactor: 0.99 },
  { frame: 7, normY: -130, phase: 'Phase 4: Primary Apex Peak', squashFactor: 1.00 },
  { frame: 8, normY: -126, phase: 'Phase 4: Primary Apex Hang', squashFactor: 1.00 },
  { frame: 9, normY: -112, phase: 'Phase 5: Primary Descent', squashFactor: 1.02 },
  { frame: 10, normY: -90, phase: 'Phase 5: Primary Descent', squashFactor: 1.05 },
  { frame: 11, normY: -62, phase: 'Phase 5: Accelerating Fall', squashFactor: 1.10 },
  { frame: 12, normY: -30, phase: 'Phase 5: Pre-Impact Stretch', squashFactor: 1.16 },
  { frame: 13, normY: 0, phase: 'Phase 6: Ground Impact Squash', squashFactor: 0.76 },
  { frame: 14, normY: -42, phase: 'Phase 7: Secondary Rebound Launch', squashFactor: 1.13 },
  { frame: 15, normY: -70, phase: 'Phase 7: Secondary Ascent', squashFactor: 1.05 },
  { frame: 16, normY: -84, phase: 'Phase 7: Secondary Apex Approach', squashFactor: 1.01 },
  { frame: 17, normY: -88, phase: 'Phase 7: Secondary Apex Peak', squashFactor: 1.00 },
  { frame: 18, normY: -82, phase: 'Phase 7: Secondary Descent', squashFactor: 1.01 },
  { frame: 19, normY: -64, phase: 'Phase 7: Secondary Fall', squashFactor: 1.05 },
  { frame: 20, normY: -34, phase: 'Phase 7: Pre-Settle Fall', squashFactor: 1.09 },
  { frame: 21, normY: 0, phase: 'Phase 8: Final Contact Settle', squashFactor: 1.00 },
];

const STKNDS_PREFIX = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]);

async function computeSha256Hex(bytes: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function gunzipBytes(compressed: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream('gzip');
  const writer = ds.writable.getWriter();
  writer.write(compressed);
  writer.close();
  const response = new Response(ds.readable);
  const ab = await response.arrayBuffer();
  return new Uint8Array(ab);
}

async function gzipBytes(raw: Uint8Array): Promise<Uint8Array> {
  const cs = new CompressionStream('gzip');
  const writer = cs.writable.getWriter();
  writer.write(raw);
  writer.close();
  const response = new Response(cs.readable);
  const ab = await response.arrayBuffer();
  return new Uint8Array(ab);
}

function uint32ToHexColor(val: number): string {
  const r = (val >>> 16) & 0xff;
  const g = (val >>> 8) & 0xff;
  const b = val & 0xff;
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function hexColorToArgbUint32(hex: string): number {
  const clean = hex.replace('#', '');
  const rgb = parseInt(clean, 16) & 0xffffff;
  return ((0xff << 24) | rgb) >>> 0;
}

export async function inspectStkndsBuffer(
  fileName: string,
  rawBuffer: ArrayBuffer
): Promise<StkndsInspectionResult> {
  const raw = new Uint8Array(rawBuffer);
  const sha256 = await computeSha256Hex(raw);

  let prefixValid = raw.length > 9;
  for (let i = 0; i < 9 && prefixValid; i++) {
    if (raw[i] !== i + 1) prefixValid = false;
  }

  if (!prefixValid) {
    return {
      fileName,
      compressedSize: raw.length,
      decompressedSize: 0,
      sha256,
      prefixValid: false,
      version: 0,
      projectName: 'Invalid Prefix',
      fps: 0,
      tweenedFrames: 0,
      figureNodes: [],
      frameCount: 0,
      frames: [],
      semanticChecks: [
        {
          label: '9-Byte Outer Magic Prefix (01..09)',
          passed: false,
          detail: 'File does not start with 01 02 03 04 05 06 07 08 09.',
        },
      ],
    };
  }

  const decompressed = await gunzipBytes(raw.slice(9));
  const dv = new DataView(decompressed.buffer, decompressed.byteOffset, decompressed.byteLength);

  const version = dv.getInt32(0, false);
  const nameLen = dv.getInt32(4, false);
  const projectName = new TextDecoder().decode(decompressed.slice(8, 8 + nameLen));

  const headerBase = 8 + nameLen;
  const fps = headerBase + 15 <= decompressed.length ? decompressed[headerBase + 14] : 24;
  const tweenedFrames = headerBase + 19 <= decompressed.length ? decompressed[headerBase + 18] : 5;

  const figureOffsets: number[] = [];
  for (let i = 20; i < decompressed.length - 12; i++) {
    if (
      decompressed[i] === 0x00 &&
      decompressed[i + 1] === 0x00 &&
      decompressed[i + 2] === 0x01 &&
      decompressed[i + 3] === 0x4e &&
      decompressed[i + 4] === 0x3f &&
      decompressed[i + 5] === 0x80 &&
      decompressed[i + 6] === 0x00 &&
      decompressed[i + 7] === 0x00
    ) {
      figureOffsets.push(i);
    }
  }

  const targetFigOffset = figureOffsets.length > 1 ? figureOffsets[1] : figureOffsets[0];
  let figureName = 'Embedded Figure';
  const figureNodes: StkndsFigureNode[] = [];

  if (targetFigOffset !== undefined) {
    if (targetFigOffset >= 4) {
      for (let back = 4; back <= 36; back++) {
        if (targetFigOffset - back >= 4) {
          const candidateLen = dv.getInt32(targetFigOffset - back - 4, false);
          if (candidateLen === back) {
            figureName = new TextDecoder().decode(
              decompressed.slice(targetFigOffset - back, targetFigOffset)
            );
            break;
          }
        }
      }
    }

    let cur = targetFigOffset + 12;
    let idx = 0;
    while (cur + 84 <= decompressed.length && idx < 64) {
      const nodeType = decompressed[cur];
      const scale = dv.getFloat32(cur + 22, false);
      if (
        ![255, 0, 1, 2, 3, 4, 5, 6].includes(nodeType) ||
        !Number.isFinite(scale) ||
        Math.abs(scale - 1.0) > 0.5
      ) {
        break;
      }
      const uid = dv.getInt32(cur + 1, false);
      const localX = dv.getFloat32(cur + 14, false);
      const localY = dv.getFloat32(cur + 18, false);
      const length = dv.getFloat32(cur + 26, false);
      const defaultLength = dv.getFloat32(cur + 30, false);
      const thickness = dv.getInt32(cur + 34, false);
      const defaultThickness = dv.getInt32(cur + 38, false);
      const localAngle1 = dv.getFloat32(cur + 56, false);
      const localAngle2 = dv.getFloat32(cur + 60, false);
      const worldAngle = dv.getFloat32(cur + 64, false);
      const colorUint = dv.getUint32(cur + 68, false);
      const childCount = dv.getInt32(cur + 80, false);

      figureNodes.push({
        index: idx,
        uid,
        nodeType,
        nodeTypeName: NODE_TYPE_NAMES[nodeType] ?? `Type (${nodeType})`,
        localX,
        localY,
        scale,
        length,
        defaultLength,
        thickness,
        defaultThickness,
        localAngle1,
        localAngle2,
        worldAngle,
        colorHex: uint32ToHexColor(colorUint),
        childCount,
      });

      cur += 84;
      idx++;
    }
  }

  const frames: StkndsFrameRecord[] = [];
  let frameCount = 0;
  let frameTableOffset: number | undefined = undefined;

  if (targetFigOffset !== undefined && figureNodes.length > 0) {
    const afterFigure = targetFigOffset + 12 + figureNodes.length * 84 + 12;
    if (afterFigure + 4 <= decompressed.length) {
      const candidateFrameCount = dv.getInt32(afterFigure, false);
      const fTableStart = afterFigure + 4;
      const instSize = 112 + figureNodes.length * 58;

      if (candidateFrameCount > 0 && candidateFrameCount < 500) {
        let cursor = fTableStart;
        const parsedFrames: StkndsFrameRecord[] = [];
        let validMulti = true;

        for (let f = 0; f < candidateFrameCount; f++) {
          if (cursor + 58 > decompressed.length) {
            validMulti = false;
            break;
          }
          const figCnt = dv.getInt32(cursor + 54, false);
          if (figCnt < 1 || figCnt > 32) {
            validMulti = false;
            break;
          }
          const frameBytes = 58 + figCnt * instSize + 48;
          if (cursor + frameBytes > decompressed.length) {
            validMulti = false;
            break;
          }

          const firstInstOff = cursor + 58;
          const instanceScale = dv.getFloat32(firstInstOff + 71, false);
          const sceneX = dv.getFloat32(firstInstOff + 75, false);
          const sceneY = dv.getFloat32(firstInstOff + 79, false);
          const instanceColorHex = uint32ToHexColor(dv.getUint32(firstInstOff + 83, false));

          const nodes: StkndsFrameNodePose[] = [];
          for (let n = 0; n < figureNodes.length; n++) {
            const rOff = firstInstOff + 112 + n * 58;
            nodes.push({
              index: n,
              scale: dv.getFloat32(rOff + 0, false),
              length: dv.getFloat32(rOff + 4, false),
              thickness: dv.getInt32(rOff + 8, false),
              angleDelta: dv.getFloat32(rOff + 12, false),
              localAngle: dv.getFloat32(rOff + 16, false),
              worldAngle: dv.getFloat32(rOff + 20, false),
              colorHex: uint32ToHexColor(dv.getUint32(rOff + 24, false)),
            });
          }

          parsedFrames.push({
            frameIndex: f,
            instanceScale,
            sceneX,
            sceneY,
            instanceColorHex,
            nodes,
          });

          cursor += frameBytes;
        }

        if (validMulti && parsedFrames.length === candidateFrameCount) {
          frameCount = candidateFrameCount;
          frameTableOffset = fTableStart + 3;
          frames.push(...parsedFrames);
        }
      }
    }
  }

  if (frameCount === 0 && targetFigOffset !== undefined) {
    frameCount = Math.max(1, Math.round((decompressed.length - targetFigOffset) / 1197));
  }

  const totalChildSum = figureNodes.reduce((acc, n) => acc + n.childCount, 0);
  const hierarchyConsistent =
    figureNodes.length > 0 && totalChildSum === figureNodes.length - 1;

  const semanticChecks = [
    {
      label: 'Container Prefix & GZIP Stream',
      passed: prefixValid && decompressed.length > 0,
      detail: `9-byte magic header verified; GZIP inflated ${raw.length.toLocaleString()} B → ${decompressed.length.toLocaleString()} B`,
    },
    {
      label: 'Stick Nodes v334 Header & FPS Setting',
      passed: version === 334,
      detail: `Big-endian int32 version = ${version}, project name = "${projectName}", rate = ${fps} FPS (@byte 30)`,
    },
    {
      label: 'Recursive Node Tree Invariant (∑ children = N - 1)',
      passed: hierarchyConsistent,
      detail: hierarchyConsistent
        ? `${figureNodes.length} nodes parsed (84 B stride); child sum = ${totalChildSum} matches N - 1`
        : `Parsed ${figureNodes.length} nodes from first figure library entry`,
    },
    {
      label: 'Frame Pose Traversal Alignment',
      passed: frames.length > 0 && frames[0].nodes.length === figureNodes.length,
      detail:
        frames.length > 0
          ? `${frames.length} frames verified (1,197 B stride = 167 B header + 17 × 58 B node records + 44 B footer)`
          : `Multi-figure scene layout (${figureOffsets.length} embedded v334 figure headers detected)`,
    },
  ];

  return {
    fileName,
    compressedSize: raw.length,
    decompressedSize: decompressed.length,
    sha256,
    prefixValid,
    version,
    projectName,
    fps,
    tweenedFrames,
    figureName,
    figureOffset: targetFigOffset,
    figureNodes,
    frameCount,
    frameTableOffset,
    frames,
    semanticChecks,
    rawDecompressed: decompressed,
  };
}

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
        const midAngles = cur.worldAngles.map((a, idx) => 0.5 * (a + nxt.worldAngles[idx]));
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

export async function synthesizeBounceStknds(
  baseDecompressed: Uint8Array,
  config: BounceGeneratorConfig
): Promise<Uint8Array> {
  const buf = new Uint8Array(baseDecompressed);
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  // Set target FPS (12 or 24) at byte 30
  buf[30] = config.targetFps;

  const figOff = 1135;
  const argbColor = hexColorToArgbUint32(config.ballColorHex);

  for (let i = 0; i < 17; i++) {
    const nOff = figOff + 12 + i * 84;
    if (i === 13) {
      buf[nOff] = config.nodeType;
      dv.setFloat32(nOff + 14, 0.0, false);
      dv.setFloat32(nOff + 18, 0.0, false);
      dv.setFloat32(nOff + 22, 1.0, false);
      dv.setFloat32(nOff + 26, config.ballDiameter, false);
      dv.setFloat32(nOff + 30, config.ballDiameter, false);
      dv.setInt32(nOff + 34, config.ballThickness, false);
      dv.setInt32(nOff + 38, config.ballThickness, false);
      dv.setFloat32(nOff + 56, 0.0, false);
      dv.setFloat32(nOff + 60, 0.0, false);
      dv.setFloat32(nOff + 64, 90.0, false);
      dv.setUint32(nOff + 68, argbColor, false);
      dv.setUint32(nOff + 72, argbColor, false);
      dv.setUint32(nOff + 76, argbColor, false);
    } else {
      if (i !== 0) {
        buf[nOff] = 0;
      }
      dv.setFloat32(nOff + 14, 0.0, false);
      dv.setFloat32(nOff + 18, 0.0, false);
      dv.setFloat32(nOff + 22, 1.0, false);
      dv.setFloat32(nOff + 26, 0.0, false);
      dv.setFloat32(nOff + 30, 0.0, false);
      dv.setInt32(nOff + 34, 0, false);
      dv.setInt32(nOff + 38, 0, false);
      dv.setFloat32(nOff + 56, 0.0, false);
      dv.setFloat32(nOff + 60, 0.0, false);
      dv.setFloat32(nOff + 64, 0.0, false);
    }
  }

  for (let f = 0; f < 22; f++) {
    const fOff = 2594 + f * 1197;
    const phaseInfo = CANONICAL_22_FRAME_PHASES[f];
    const isSecondBounce = f >= 14 && f <= 20;
    const normPeak = isSecondBounce ? 88 : 130;
    const targetApex = isSecondBounce ? config.secondaryApexHeight : config.primaryApexHeight;

    const verticalOffset = (phaseInfo.normY / normPeak) * targetApex;
    const sceneY = config.groundY + verticalOffset;

    dv.setFloat32(fOff + 126, 1.0, false);
    dv.setFloat32(fOff + 130, config.centerX, false);
    dv.setFloat32(fOff + 134, sceneY, false);

    for (let i = 0; i < 17; i++) {
      const rOff = fOff + 167 + i * 58;
      if (i === 13) {
        const rawSq = phaseInfo.squashFactor;
        const blendedSq = config.enableSquashStretch
          ? 1.0 + (rawSq - 1.0) * config.squashIntensity
          : 1.0;
        const frameDiameter = config.ballDiameter * blendedSq;
        const frameThickness = Math.max(2, Math.round(config.ballThickness / blendedSq));

        dv.setFloat32(rOff + 0, 1.0, false);
        dv.setFloat32(rOff + 4, frameDiameter, false);
        dv.setInt32(rOff + 8, frameThickness, false);
        dv.setFloat32(rOff + 12, 0.0, false);
        dv.setFloat32(rOff + 16, 0.0, false);
        dv.setFloat32(rOff + 20, 90.0, false);
        dv.setUint32(rOff + 24, argbColor, false);
        dv.setUint32(rOff + 28, argbColor, false);
        dv.setUint32(rOff + 32, argbColor, false);
      } else {
        dv.setFloat32(rOff + 0, 1.0, false);
        dv.setFloat32(rOff + 4, 0.0, false);
        dv.setInt32(rOff + 8, 0, false);
        dv.setFloat32(rOff + 12, 0.0, false);
        dv.setFloat32(rOff + 16, 0.0, false);
        dv.setFloat32(rOff + 20, 0.0, false);
      }
    }
  }

  const compressedPayload = await gzipBytes(buf);
  const finalStknds = new Uint8Array(STKNDS_PREFIX.length + compressedPayload.length);
  finalStknds.set(STKNDS_PREFIX, 0);
  finalStknds.set(compressedPayload, STKNDS_PREFIX.length);
  return finalStknds;
}

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
        const midAngles = cur.worldAngles.map((a, idx) => 0.5 * (a + nxt.worldAngles[idx]));
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

const RED_SIT_IDLE = [0, 34, -43, -2, 44, -56, 0, 84, 80, -48, 12, 8, 76, 74, -36, 22, 16];
const RED_SIT_BREATH = [0, 34, -43, -2, 44, -56, 0, 85, 81, -47, 13, 9, 77, 75, -35, 23, 17];
const RED_NOTICE_1 = [0, 34, -43, -2, 44, -56, 0, 86, 83, -46, 14, 10, 82, 83, -34, 24, 18];
const RED_NOTICE_2 = [0, 34, -43, -2, 44, -56, 0, 87, 85, -45, 16, 12, 88, 92, -33, 26, 20];
const RED_NOTICE_3 = [0, 34, -43, -2, 44, -56, 0, 88, 86, -44, 17, 13, 91, 96, -32, 27, 21];
const RED_NOTICE_HOLD = [0, 34, -43, -2, 44, -56, 0, 88, 86, -44, 17, 13, 92, 97, -32, 27, 21];
const RED_SENSE_AMB = [0, 33, -43, -2, 44, -56, 0, 90, 90, -56, -4, -6, 98, 106, -30, 28, 22];
const RED_TWIST_1 = [0, 32, -44, -2, 44, -56, 0, 95, 100, -112, -62, -58, 114, 124, -26, 32, 30];
const RED_TWIST_2 = [0, 31, -44, -2, 44, -56, 0, 100, 108, 178, -104, -100, 126, 138, -24, 34, 38];
const RED_BLOCK_LOCK = [0, 30, -44, -2, 44, -56, 0, 102, 112, 172, -124, -120, 132, 144, -22, 36, 42];
const RED_BLOCK_SHK1 = [0, 30, -44, -2, 44, -56, 0, 103, 113, 173, -125, -121, 133, 145, -21, 37, 43];
const RED_BLOCK_SHK2 = [0, 30, -44, -2, 44, -56, 0, 102, 112, 172, -124, -120, 132, 144, -22, 36, 42];

const BLUE_WALK_0 = [0, -108, -82, -168, -68, -96, -178, 95, 97, -64, -108, -114, 98, 100, -114, -136, -140];
const BLUE_WALK_1 = [0, -98, -86, -174, -76, -110, -162, 94, 96, -72, -112, -118, 97, 99, -104, -128, -132];
const BLUE_WALK_2 = [0, -86, -90, -180, -88, -124, -148, 94, 95, -84, -118, -122, 96, 98, -92, -120, -124];
const BLUE_WALK_3 = [0, -74, -94, -178, -102, -88, -166, 95, 97, -98, -124, -128, 98, 100, -76, -112, -116];
const BLUE_WALK_4 = [0, -68, -96, -178, -110, -82, -172, 96, 98, -112, -134, -138, 99, 101, -64, -106, -110];
const BLUE_WALK_5 = [0, -78, -112, -160, -96, -86, -176, 94, 96, -102, -126, -130, 97, 99, -74, -110, -114];
const BLUE_WALK_6 = [0, -90, -126, -146, -84, -90, -180, 94, 95, -88, -120, -124, 96, 98, -86, -118, -122];
const BLUE_WALK_7 = [0, -104, -88, -168, -72, -94, -178, 95, 97, -74, -112, -116, 98, 100, -100, -126, -130];
const BLUE_WALK_8 = [0, -100, -88, -176, -78, -92, -178, 93, 94, -80, -114, -118, 95, 97, -96, -122, -126];
const BLUE_STAND = [0, -96, -90, -178, -82, -90, -178, 92, 93, -84, -116, -120, 94, 96, -92, -118, -122];

const BLUE_AMB_0 = [0, -72, -94, 4, -102, -88, -6, 84, 82, -122, -96, -90, 86, 84, -52, -32, -26];
const BLUE_AMB_1 = [0, -68, -98, 6, -96, -92, -4, 82, 78, -128, -102, -96, 84, 80, -48, -28, -22];
const BLUE_DROP_1 = [0, -112, -148, -110, -68, -118, -2, 96, 102, -136, -108, -102, 92, 86, -18, 12, 18];
const BLUE_DROP_2 = [0, -64, -118, -68, -52, -134, 0, 110, 118, -142, -114, -106, 100, 92, 8, 36, 42];
const BLUE_SWEEP = [0, -32, -28, 34, -49, -142, 0, 118, 128, -146, -116, -108, 104, 96, 22, 48, 54];
const BLUE_CLASH = [0, -18, -4, 68, -48, -146, 0, 122, 134, -148, -118, -110, 108, 98, 28, 56, 62];
const BLUE_CLASH_S = [0, -17, -3, 69, -48, -146, 0, 123, 135, -149, -119, -111, 109, 99, 29, 57, 63];

export const CANONICAL_36_TELEPORT_FRAMES: TeleportAmbushKeyframeSpec[] = [
  {
    frame: 0,
    act: 'Act 1: The Approach',
    phase: 'Wide Shot — Red Seated, Blue Enters Right',
    camX: 0.0,
    camY: 0.0,
    camZoom: 1.0,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_SIT_IDLE,
    bluePresent: true,
    blueX: 960.0,
    blueY: 517.0,
    blueAngles: BLUE_WALK_0,
  },
  {
    frame: 1,
    act: 'Act 1: The Approach',
    phase: 'Blue Casual Step 1 (Contact)',
    camX: 0.0,
    camY: 0.0,
    camZoom: 1.0,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_SIT_IDLE,
    bluePresent: true,
    blueX: 936.0,
    blueY: 519.0,
    blueAngles: BLUE_WALK_1,
  },
  {
    frame: 2,
    act: 'Act 1: The Approach',
    phase: 'Blue Casual Step 1 (Down/Weight)',
    camX: 0.0,
    camY: 0.0,
    camZoom: 1.0,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_SIT_BREATH,
    bluePresent: true,
    blueX: 910.0,
    blueY: 521.0,
    blueAngles: BLUE_WALK_2,
  },
  {
    frame: 3,
    act: 'Act 1: The Approach',
    phase: 'Blue Casual Step 1 (Passing)',
    camX: 0.0,
    camY: 0.0,
    camZoom: 1.0,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_SIT_BREATH,
    bluePresent: true,
    blueX: 882.0,
    blueY: 517.0,
    blueAngles: BLUE_WALK_3,
  },
  {
    frame: 4,
    act: 'Act 1: The Approach',
    phase: 'Blue Casual Step 2 (Reach)',
    camX: 0.0,
    camY: 0.0,
    camZoom: 1.0,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_SIT_IDLE,
    bluePresent: true,
    blueX: 854.0,
    blueY: 516.0,
    blueAngles: BLUE_WALK_4,
  },
  {
    frame: 5,
    act: 'Act 1: The Approach',
    phase: 'Blue Casual Step 2 (Down/Weight)',
    camX: 0.0,
    camY: 0.0,
    camZoom: 1.0,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_SIT_IDLE,
    bluePresent: true,
    blueX: 826.0,
    blueY: 520.0,
    blueAngles: BLUE_WALK_5,
  },
  {
    frame: 6,
    act: 'Act 1: The Approach',
    phase: 'Blue Casual Step 2 (Passing)',
    camX: 0.0,
    camY: 0.0,
    camZoom: 1.0,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_SIT_BREATH,
    bluePresent: true,
    blueX: 798.0,
    blueY: 517.0,
    blueAngles: BLUE_WALK_6,
  },
  {
    frame: 7,
    act: 'Act 1: The Approach',
    phase: 'Blue Casual Step 3 (Plant)',
    camX: 0.0,
    camY: 0.0,
    camZoom: 1.0,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_SIT_BREATH,
    bluePresent: true,
    blueX: 774.0,
    blueY: 518.0,
    blueAngles: BLUE_WALK_7,
  },
  {
    frame: 8,
    act: 'Act 1: The Approach',
    phase: 'Blue Settles Into Stance',
    camX: 0.0,
    camY: 0.0,
    camZoom: 1.0,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_SIT_IDLE,
    bluePresent: true,
    blueX: 760.0,
    blueY: 517.5,
    blueAngles: BLUE_WALK_8,
  },
  {
    frame: 9,
    act: 'Act 1: The Approach',
    phase: 'Standoff Pause Before Close-Up',
    camX: 0.0,
    camY: 0.0,
    camZoom: 1.0,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_SIT_IDLE,
    bluePresent: true,
    blueX: 756.0,
    blueY: 517.0,
    blueAngles: BLUE_STAND,
  },
  {
    frame: 10,
    act: 'Act 2: The Close-Up',
    phase: 'Fast Camera Zoom-In On Red (1/2)',
    camX: -108.0,
    camY: 22.0,
    camZoom: 1.55,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_NOTICE_1,
    bluePresent: true,
    blueX: 756.0,
    blueY: 517.0,
    blueAngles: BLUE_STAND,
  },
  {
    frame: 11,
    act: 'Act 2: The Close-Up',
    phase: 'Fast Camera Zoom-In On Red Face (2/2)',
    camX: -152.0,
    camY: 46.0,
    camZoom: 2.25,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_NOTICE_2,
    bluePresent: true,
    blueX: 756.0,
    blueY: 517.0,
    blueAngles: BLUE_STAND,
  },
  {
    frame: 12,
    act: 'Act 2: The Close-Up',
    phase: 'Red Tilts Head Up Noticing Blue',
    camX: -158.0,
    camY: 52.0,
    camZoom: 2.35,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_NOTICE_3,
    bluePresent: true,
    blueX: 756.0,
    blueY: 517.0,
    blueAngles: BLUE_STAND,
  },
  {
    frame: 13,
    act: 'Act 2: The Close-Up',
    phase: 'Close-Up Tension Hold (1/2)',
    camX: -158.0,
    camY: 52.0,
    camZoom: 2.35,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_NOTICE_HOLD,
    bluePresent: true,
    blueX: 756.0,
    blueY: 517.0,
    blueAngles: BLUE_STAND,
  },
  {
    frame: 14,
    act: 'Act 2: The Close-Up',
    phase: 'Close-Up Tension Hold (2/2)',
    camX: -158.0,
    camY: 52.0,
    camZoom: 2.35,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_NOTICE_HOLD,
    bluePresent: true,
    blueX: 756.0,
    blueY: 517.0,
    blueAngles: BLUE_STAND,
  },
  {
    frame: 15,
    act: 'Act 3: The Swish (Whip Pan)',
    phase: 'Whip Pan Violently Right (Frame 1/2)',
    camX: -12.0,
    camY: 18.0,
    camZoom: 2.05,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_NOTICE_HOLD,
    bluePresent: false,
    blueX: 756.0,
    blueY: 517.0,
    blueAngles: BLUE_STAND,
  },
  {
    frame: 16,
    act: 'Act 3: The Swish (Whip Pan)',
    phase: 'Whip Pan Lands On Empty Spot (2/2)',
    camX: 118.0,
    camY: -14.0,
    camZoom: 1.85,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_NOTICE_HOLD,
    bluePresent: false,
    blueX: 756.0,
    blueY: 517.0,
    blueAngles: BLUE_STAND,
  },
  {
    frame: 17,
    act: 'Act 3: The Swish (Whip Pan)',
    phase: 'Empty Space Hold — Blue Is Gone (1/2)',
    camX: 124.0,
    camY: -14.0,
    camZoom: 1.85,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_NOTICE_HOLD,
    bluePresent: false,
    blueX: 756.0,
    blueY: 517.0,
    blueAngles: BLUE_STAND,
  },
  {
    frame: 18,
    act: 'Act 3: The Swish (Whip Pan)',
    phase: 'Empty Space Hold — Blue Is Gone (2/2)',
    camX: 124.0,
    camY: -14.0,
    camZoom: 1.85,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_SENSE_AMB,
    bluePresent: false,
    blueX: 756.0,
    blueY: 517.0,
    blueAngles: BLUE_STAND,
  },
  {
    frame: 19,
    act: 'Act 4: The Ambush',
    phase: 'Camera Snaps Back — Blue Behind Red!',
    camX: -220.0,
    camY: 48.0,
    camZoom: 1.28,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_SENSE_AMB,
    bluePresent: true,
    blueX: 194.0,
    blueY: 517.0,
    blueAngles: BLUE_AMB_0,
  },
  {
    frame: 20,
    act: 'Act 4: The Ambush',
    phase: 'Ambush Realization Beat',
    camX: -220.0,
    camY: 48.0,
    camZoom: 1.28,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_SENSE_AMB,
    bluePresent: true,
    blueX: 192.0,
    blueY: 522.0,
    blueAngles: BLUE_AMB_1,
  },
  {
    frame: 21,
    act: 'Act 5: The Strike',
    phase: 'Blue Drops Weight & Chambers Kick',
    camX: -224.0,
    camY: 54.0,
    camZoom: 1.32,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_TWIST_1,
    bluePresent: true,
    blueX: 182.0,
    blueY: 556.0,
    blueAngles: BLUE_DROP_1,
  },
  {
    frame: 22,
    act: 'Act 5: The Strike',
    phase: 'Blue Coils Hip & Begins Low Sweep',
    camX: -228.0,
    camY: 58.0,
    camZoom: 1.35,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_TWIST_2,
    bluePresent: true,
    blueX: 174.0,
    blueY: 580.0,
    blueAngles: BLUE_DROP_2,
  },
  {
    frame: 23,
    act: 'Act 5: The Strike',
    phase: 'Blue Whips Heavy Sweeping Kick Forward',
    camX: -230.0,
    camY: 62.0,
    camZoom: 1.38,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_TWIST_2,
    bluePresent: true,
    blueX: 170.0,
    blueY: 590.0,
    blueAngles: BLUE_SWEEP,
  },
  {
    frame: 24,
    act: 'Act 6: The Block & Impact',
    phase: 'CLASH! Red Rigid Forearm Catches Blue Shin',
    camX: -232.0,
    camY: 64.0,
    camZoom: 1.42,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_BLOCK_LOCK,
    bluePresent: true,
    blueX: 168.0,
    blueY: 594.0,
    blueAngles: BLUE_CLASH,
  },
  {
    frame: 25,
    act: 'Act 6: The Block & Impact',
    phase: 'Hit-Stop Freeze On Heavy Impact',
    camX: -232.0,
    camY: 64.0,
    camZoom: 1.42,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_BLOCK_LOCK,
    bluePresent: true,
    blueX: 168.0,
    blueY: 594.0,
    blueAngles: BLUE_CLASH,
  },
  {
    frame: 26,
    act: 'Act 7: The Screen Shake',
    phase: 'Violent Screen Shake 1 (Up-Left)',
    camX: -252.0,
    camY: 46.0,
    camZoom: 1.45,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_BLOCK_SHK1,
    bluePresent: true,
    blueX: 168.0,
    blueY: 594.0,
    blueAngles: BLUE_CLASH_S,
  },
  {
    frame: 27,
    act: 'Act 7: The Screen Shake',
    phase: 'Violent Screen Shake 2 (Down-Right)',
    camX: -212.0,
    camY: 82.0,
    camZoom: 1.45,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_BLOCK_SHK2,
    bluePresent: true,
    blueX: 168.0,
    blueY: 594.0,
    blueAngles: BLUE_CLASH,
  },
  {
    frame: 28,
    act: 'Act 7: The Screen Shake',
    phase: 'Violent Screen Shake 3 (Up-Right)',
    camX: -216.0,
    camY: 48.0,
    camZoom: 1.44,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_BLOCK_SHK1,
    bluePresent: true,
    blueX: 168.0,
    blueY: 594.0,
    blueAngles: BLUE_CLASH_S,
  },
  {
    frame: 29,
    act: 'Act 7: The Screen Shake',
    phase: 'Violent Screen Shake 4 (Down-Left)',
    camX: -248.0,
    camY: 78.0,
    camZoom: 1.43,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_BLOCK_SHK2,
    bluePresent: true,
    blueX: 168.0,
    blueY: 594.0,
    blueAngles: BLUE_CLASH,
  },
  {
    frame: 30,
    act: 'Act 7: The Screen Shake',
    phase: 'Violent Screen Shake 5 (Damping)',
    camX: -226.0,
    camY: 58.0,
    camZoom: 1.42,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_BLOCK_LOCK,
    bluePresent: true,
    blueX: 168.0,
    blueY: 594.0,
    blueAngles: BLUE_CLASH,
  },
  {
    frame: 31,
    act: 'Act 8: End Scene',
    phase: 'Locked Clash Pose Hold (1/5)',
    camX: -232.0,
    camY: 64.0,
    camZoom: 1.42,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_BLOCK_LOCK,
    bluePresent: true,
    blueX: 168.0,
    blueY: 594.0,
    blueAngles: BLUE_CLASH,
  },
  {
    frame: 32,
    act: 'Act 8: End Scene',
    phase: 'Locked Clash Pose Hold (2/5)',
    camX: -232.0,
    camY: 64.0,
    camZoom: 1.42,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_BLOCK_LOCK,
    bluePresent: true,
    blueX: 168.0,
    blueY: 594.0,
    blueAngles: BLUE_CLASH,
  },
  {
    frame: 33,
    act: 'Act 8: End Scene',
    phase: 'Locked Clash Pose Hold (3/5)',
    camX: -232.0,
    camY: 64.0,
    camZoom: 1.42,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_BLOCK_LOCK,
    bluePresent: true,
    blueX: 168.0,
    blueY: 594.0,
    blueAngles: BLUE_CLASH,
  },
  {
    frame: 34,
    act: 'Act 8: End Scene',
    phase: 'Locked Clash Pose Hold (4/5)',
    camX: -232.0,
    camY: 64.0,
    camZoom: 1.42,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_BLOCK_LOCK,
    bluePresent: true,
    blueX: 168.0,
    blueY: 594.0,
    blueAngles: BLUE_CLASH,
  },
  {
    frame: 35,
    act: 'Act 8: End Scene',
    phase: 'Locked Clash Pose Hold (5/5)',
    camX: -232.0,
    camY: 64.0,
    camZoom: 1.42,
    redX: 440.0,
    redY: 742.0,
    redAngles: RED_BLOCK_LOCK,
    bluePresent: true,
    blueX: 168.0,
    blueY: 594.0,
    blueAngles: BLUE_CLASH,
  },
];

export function buildAdjustedTeleportFrames(
  config: TeleportAmbushGeneratorConfig
): TeleportAmbushKeyframeSpec[] {
  const zoomScale = config.closeUpZoom / 2.35;
  const whipOffsetDelta = config.whipPanOffsetX - 124.0;
  const shakeScale = config.screenShakeAmplitudePx / 20.0;

  const adjusted36: TeleportAmbushKeyframeSpec[] = CANONICAL_36_TELEPORT_FRAMES.map((spec) => {
    let camX = spec.camX;
    let camY = spec.camY;
    let camZoom = spec.camZoom;

    if (spec.frame >= 10 && spec.frame <= 14) {
      camZoom = Number((1.0 + (spec.camZoom - 1.0) * zoomScale).toFixed(2));
    } else if (spec.frame >= 16 && spec.frame <= 18) {
      camX = Number((spec.camX + whipOffsetDelta).toFixed(1));
    } else if (spec.frame >= 26 && spec.frame <= 30) {
      const baseCamX = -232.0;
      const baseCamY = 64.0;
      camX = Number((baseCamX + (spec.camX - baseCamX) * shakeScale).toFixed(1));
      camY = Number((baseCamY + (spec.camY - baseCamY) * shakeScale).toFixed(1));
    }

    return {
      ...spec,
      camX,
      camY,
      camZoom,
      redAngles: [...spec.redAngles],
      blueAngles: [...spec.blueAngles],
    };
  });

  if (config.targetFps === 24 && config.interpolate24FpsFrames) {
    const interpolated: TeleportAmbushKeyframeSpec[] = [];
    for (let i = 0; i < adjusted36.length; i++) {
      const curr = adjusted36[i];
      interpolated.push({
        ...curr,
        frame: interpolated.length,
      });
      if (i < adjusted36.length - 1) {
        const next = adjusted36[i + 1];
        if (i === 14 || i === 18) {
          interpolated.push({
            ...curr,
            frame: interpolated.length,
            phase: `${curr.phase} (Hold Cut)`,
          });
        } else {
          interpolated.push({
            frame: interpolated.length,
            act: curr.act,
            phase: `${curr.phase} (24fps In-Between)`,
            camX: Number(((curr.camX + next.camX) * 0.5).toFixed(1)),
            camY: Number(((curr.camY + next.camY) * 0.5).toFixed(1)),
            camZoom: Number(((curr.camZoom + next.camZoom) * 0.5).toFixed(2)),
            redX: Number(((curr.redX + next.redX) * 0.5).toFixed(1)),
            redY: Number(((curr.redY + next.redY) * 0.5).toFixed(1)),
            redAngles: curr.redAngles.map((a, idx) =>
              Number(((a + next.redAngles[idx]) * 0.5).toFixed(1))
            ),
            bluePresent: curr.bluePresent && next.bluePresent,
            blueX: Number(((curr.blueX + next.blueX) * 0.5).toFixed(1)),
            blueY: Number(((curr.blueY + next.blueY) * 0.5).toFixed(1)),
            blueAngles: curr.blueAngles.map((a, idx) =>
              Number(((a + next.blueAngles[idx]) * 0.5).toFixed(1))
            ),
          });
        }
      }
    }
    return interpolated;
  }

  return adjusted36;
}

export async function synthesizeTeleportStknds(
  baseDecompressed27: Uint8Array,
  config: TeleportAmbushGeneratorConfig
): Promise<Uint8Array> {
  const framesSpec = buildAdjustedTeleportFrames(config);
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

  const redArgb = hexToArgbUint32(config.redColorHex);
  const blueArgb = hexToArgbUint32(config.blueColorHex);

  let totalBytes = prefixHdr.length + ptrlTmpl.length;
  for (const spec of framesSpec) {
    const figCount = spec.bluePresent ? 2 : 1;
    totalBytes += fhdrTmpl.length + figCount * instTmpl.length + fftrTmpl.length;
  }

  const buf = new Uint8Array(totalBytes);
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  buf.set(prefixHdr, 0);
  dv.setInt32(27, config.targetFps, false);
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
    dv.setFloat32(cursor + 71, 0.5, false);
    dv.setFloat32(cursor + 75, sx, false);
    dv.setFloat32(cursor + 79, sy, false);
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
    dv.setInt32(cursor + 54, spec.bluePresent ? 2 : 1, false);
    cursor += fhdrTmpl.length;

    writeFigureInstance(1, spec.redX, spec.redY, redArgb, spec.redAngles);
    if (spec.bluePresent) {
      writeFigureInstance(2, spec.blueX, spec.blueY, blueArgb, spec.blueAngles);
    }

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
