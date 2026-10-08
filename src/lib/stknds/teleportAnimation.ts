import { TeleportAmbushGeneratorConfig, TeleportAmbushKeyframeSpec } from './stkndsCore';
import { STKNDS_PREFIX, gzipBytes, hexColorToArgbUint32 } from './stkndsCore';
import { STICKFIGURE_PARENTS, STICKFIGURE_BONE_LENGTHS, STICKFIGURE_BONE_THICKNESS } from './stickfigureStructure';

const RED_SIT_IDLE = [0, 16, -32, 14, -11, -176, -178, 88, 85, -38, 12, 4, 84, 82, -74, -18, -12];
const RED_SIT_BREATH = [0, 16, -32, 14, -11, -176, -178, 89, 86, -37, 13, 5, 85, 83, -73, -17, -11];
const RED_NOTICE_1 = [0, 16, -32, 14, -11, -176, -178, 89, 87, -36, 14, 6, 86, 86, -72, -16, -10];
const RED_NOTICE_2 = [0, 16, -32, 14, -11, -176, -178, 90, 88, -35, 16, 8, 88, 90, -71, -15, -9];
const RED_NOTICE_3 = [0, 16, -32, 14, -11, -176, -178, 90, 88, -34, 17, 9, 89, 92, -70, -14, -8];
const RED_NOTICE_HOLD = [0, 16, -32, 14, -11, -176, -178, 90, 89, -34, 18, 10, 90, 93, -70, -14, -8];
const RED_SENSE_AMB = [0, 15, -33, 14, -11, -176, -178, 91, 92, -78, 32, 28, 96, 104, -66, -48, -24];
const RED_TWIST_1 = [0, 14, -34, 12, -11, -176, -178, 92, 95, -118, 72, 74, 99, 106, -62, -84, -12];
const RED_TWIST_2 = [0, 13, -35, 12, -11, -176, -178, 94, 97, -148, 98, 98, 101, 108, -60, -86, -10];
const RED_BLOCK_LOCK = [0, 12, -36, 10, -11, -176, -178, 94, 98, -156, 102, 100, 102, 108, -58, -88, -8];
const RED_BLOCK_SHK1 = [0, 12, -36, 10, -11, -176, -178, 93, 96, -154, 97, 95, 100, 106, -57, -89, -6];
const RED_BLOCK_SHK2 = [0, 12, -36, 10, -11, -176, -178, 94, 98, -156, 101, 99, 102, 108, -58, -88, -8];

const BLUE_WALK_0 = [0, -108, -90, -154, -72, -52, -126, 93, 95, -72, -84, -88, 92, 91, -112, -134, -138];
const BLUE_WALK_1 = [0, -104, -80, -179, -84, -42, -134, 94, 96, -68, -78, -82, 92, 91, -116, -142, -146];
const BLUE_WALK_2 = [0, -88, -86, -179, -108, -56, -148, 92, 94, -88, -104, -108, 91, 90, -94, -122, -126];
const BLUE_WALK_3 = [0, -74, -66, -142, -114, -102, -150, 93, 95, -108, -130, -134, 91, 90, -76, -88, -92];
const BLUE_WALK_4 = [0, -72, -44, -128, -106, -86, -178, 94, 96, -116, -142, -146, 92, 91, -68, -78, -82];
const BLUE_WALK_5 = [0, -106, -54, -146, -90, -88, -179, 92, 94, -96, -124, -128, 91, 90, -86, -102, -106];
const BLUE_WALK_6 = [0, -112, -98, -154, -78, -74, -152, 92, 93, -78, -96, -100, 91, 90, -104, -128, -132];
const BLUE_WALK_7 = [0, -104, -88, -179, -80, -68, -164, 93, 95, -80, -102, -106, 93, 93, -98, -122, -126];
const BLUE_WALK_8 = [0, -98, -89, -179, -82, -80, -179, 91, 92, -84, -108, -112, 93, 94, -94, -118, -122];
const BLUE_STAND = [0, -98, -89, -179, -82, -80, -179, 91, 92, -84, -108, -112, 94, 95, -94, -118, -122];

const BLUE_AMB_0 = [0, -102, -114, -18, -76, -96, 0, 86, 82, -112, -24, -18, 84, 82, -36, 42, 48];
const BLUE_AMB_1 = [0, -98, -122, -26, -72, -100, 0, 84, 79, -118, -32, -24, 82, 80, -32, 46, 52];
const BLUE_DROP_1 = [0, -44, -136, -148, -64, -114, 1, 94, 98, -132, -118, -114, 90, 86, -12, 56, 62];
const BLUE_DROP_2 = [0, -18, -62, -72, -60, -122, 2, 102, 108, -144, -148, -150, 96, 90, 12, 74, 78];
const BLUE_SWEEP = [0, -12, -22, -30, -58, -126, 2, 106, 112, -150, -160, -162, 100, 94, 24, 82, 86];
const BLUE_CLASH = [0, -10, -14, -20, -58, -126, 2, 108, 114, -152, -164, -166, 102, 96, 28, 86, 90];
const BLUE_CLASH_S = [0, -11, -17, -23, -58, -126, 2, 109, 115, -154, -166, -168, 103, 97, 30, 88, 92];

export const CANONICAL_36_TELEPORT_FRAMES: TeleportAmbushKeyframeSpec[] = [
  {
    frame: 0,
    act: 'Act 1: The Approach',
    phase: 'Wide Shot — Red Seated, Blue Enters Right (Heel Strike)',
    camX: 0.0,
    camY: 0.0,
    camZoom: 1.0,
    redX: 440.0,
    redY: 726.0,
    redAngles: RED_SIT_IDLE,
    bluePresent: true,
    blueX: 948.0,
    blueY: 512.0,
    blueAngles: BLUE_WALK_0,
  },
  {
    frame: 1,
    act: 'Act 1: The Approach',
    phase: 'Blue Step 1 — Weight Acceptance & Knee Flex',
    camX: 0.0,
    camY: 0.0,
    camZoom: 1.0,
    redX: 440.0,
    redY: 726.0,
    redAngles: RED_SIT_IDLE,
    bluePresent: true,
    blueX: 918.0,
    blueY: 511.0,
    blueAngles: BLUE_WALK_1,
  },
  {
    frame: 2,
    act: 'Act 1: The Approach',
    phase: 'Blue Step 1 — Passing Pose (Foot Pinned, Swing Clearance)',
    camX: 0.0,
    camY: 0.0,
    camZoom: 1.0,
    redX: 440.0,
    redY: 726.0,
    redAngles: RED_SIT_BREATH,
    bluePresent: true,
    blueX: 896.0,
    blueY: 507.0,
    blueAngles: BLUE_WALK_2,
  },
  {
    frame: 3,
    act: 'Act 1: The Approach',
    phase: 'Blue Step 1 — Heel-to-Toe Roll & Left Leg Reach',
    camX: 0.0,
    camY: 0.0,
    camZoom: 1.0,
    redX: 440.0,
    redY: 726.0,
    redAngles: RED_SIT_BREATH,
    bluePresent: true,
    blueX: 868.0,
    blueY: 508.0,
    blueAngles: BLUE_WALK_3,
  },
  {
    frame: 4,
    act: 'Act 1: The Approach',
    phase: 'Blue Step 2 — Left Heel Contact & Right Toe-Off',
    camX: 0.0,
    camY: 0.0,
    camZoom: 1.0,
    redX: 440.0,
    redY: 726.0,
    redAngles: RED_SIT_IDLE,
    bluePresent: true,
    blueX: 840.0,
    blueY: 513.0,
    blueAngles: BLUE_WALK_4,
  },
  {
    frame: 5,
    act: 'Act 1: The Approach',
    phase: 'Blue Step 2 — Passing Pose Over Left Support Leg',
    camX: 0.0,
    camY: 0.0,
    camZoom: 1.0,
    redX: 440.0,
    redY: 726.0,
    redAngles: RED_SIT_IDLE,
    bluePresent: true,
    blueX: 812.0,
    blueY: 507.0,
    blueAngles: BLUE_WALK_5,
  },
  {
    frame: 6,
    act: 'Act 1: The Approach',
    phase: 'Blue Step 3 — Braking Reach & Deceleration',
    camX: 0.0,
    camY: 0.0,
    camZoom: 1.0,
    redX: 440.0,
    redY: 726.0,
    redAngles: RED_SIT_BREATH,
    bluePresent: true,
    blueX: 788.0,
    blueY: 509.0,
    blueAngles: BLUE_WALK_6,
  },
  {
    frame: 7,
    act: 'Act 1: The Approach',
    phase: 'Blue Step 3 — Braking Plant & Weight Absorption',
    camX: 0.0,
    camY: 0.0,
    camZoom: 1.0,
    redX: 440.0,
    redY: 726.0,
    redAngles: RED_SIT_BREATH,
    bluePresent: true,
    blueX: 770.0,
    blueY: 513.0,
    blueAngles: BLUE_WALK_7,
  },
  {
    frame: 8,
    act: 'Act 1: The Approach',
    phase: 'Blue Settles Weight Into Grounded Stance',
    camX: 0.0,
    camY: 0.0,
    camZoom: 1.0,
    redX: 440.0,
    redY: 726.0,
    redAngles: RED_SIT_IDLE,
    bluePresent: true,
    blueX: 762.0,
    blueY: 511.0,
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
    redY: 726.0,
    redAngles: RED_SIT_IDLE,
    bluePresent: true,
    blueX: 760.0,
    blueY: 510.0,
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
    redY: 726.0,
    redAngles: RED_NOTICE_1,
    bluePresent: true,
    blueX: 760.0,
    blueY: 510.0,
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
    redY: 726.0,
    redAngles: RED_NOTICE_2,
    bluePresent: true,
    blueX: 760.0,
    blueY: 510.0,
    blueAngles: BLUE_STAND,
  },
  {
    frame: 12,
    act: 'Act 2: The Close-Up',
    phase: 'Red Lifts Gaze & Tilts Head Up Noticing Blue',
    camX: -158.0,
    camY: 52.0,
    camZoom: 2.35,
    redX: 440.0,
    redY: 726.0,
    redAngles: RED_NOTICE_3,
    bluePresent: true,
    blueX: 760.0,
    blueY: 510.0,
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
    redY: 726.0,
    redAngles: RED_NOTICE_HOLD,
    bluePresent: true,
    blueX: 760.0,
    blueY: 510.0,
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
    redY: 726.0,
    redAngles: RED_NOTICE_HOLD,
    bluePresent: true,
    blueX: 760.0,
    blueY: 510.0,
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
    redY: 726.0,
    redAngles: RED_NOTICE_HOLD,
    bluePresent: false,
    blueX: 760.0,
    blueY: 510.0,
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
    redY: 726.0,
    redAngles: RED_NOTICE_HOLD,
    bluePresent: false,
    blueX: 760.0,
    blueY: 510.0,
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
    redY: 726.0,
    redAngles: RED_NOTICE_HOLD,
    bluePresent: false,
    blueX: 760.0,
    blueY: 510.0,
    blueAngles: BLUE_STAND,
  },
  {
    frame: 18,
    act: 'Act 3: The Swish (Whip Pan)',
    phase: 'Empty Space Hold — Red Head Leads Turn (2/2)',
    camX: 124.0,
    camY: -14.0,
    camZoom: 1.85,
    redX: 440.0,
    redY: 726.0,
    redAngles: RED_SENSE_AMB,
    bluePresent: false,
    blueX: 760.0,
    blueY: 510.0,
    blueAngles: BLUE_STAND,
  },
  {
    frame: 19,
    act: 'Act 4: The Ambush',
    phase: 'Camera Snaps Back — Blue Behind Red in Combat Stance!',
    camX: -220.0,
    camY: 48.0,
    camZoom: 1.28,
    redX: 440.0,
    redY: 726.0,
    redAngles: RED_SENSE_AMB,
    bluePresent: true,
    blueX: 186.0,
    blueY: 512.0,
    blueAngles: BLUE_AMB_0,
  },
  {
    frame: 20,
    act: 'Act 4: The Ambush',
    phase: 'Ambush Realization & Pre-Strike Weight Compression',
    camX: -220.0,
    camY: 48.0,
    camZoom: 1.28,
    redX: 440.0,
    redY: 726.0,
    redAngles: RED_SENSE_AMB,
    bluePresent: true,
    blueX: 190.0,
    blueY: 518.0,
    blueAngles: BLUE_AMB_1,
  },
  {
    frame: 21,
    act: 'Act 5: The Strike',
    phase: 'Blue Shifts Weight to Support Leg & Chambers Knee High',
    camX: -224.0,
    camY: 54.0,
    camZoom: 1.32,
    redX: 440.0,
    redY: 726.0,
    redAngles: RED_TWIST_1,
    bluePresent: true,
    blueX: 194.0,
    blueY: 532.0,
    blueAngles: BLUE_DROP_1,
  },
  {
    frame: 22,
    act: 'Act 5: The Strike',
    phase: 'Blue Drives Hip & Uncoils Kick; Red Raises Forearm Shield',
    camX: -228.0,
    camY: 58.0,
    camZoom: 1.35,
    redX: 440.0,
    redY: 726.0,
    redAngles: RED_TWIST_2,
    bluePresent: true,
    blueX: 196.0,
    blueY: 540.0,
    blueAngles: BLUE_DROP_2,
  },
  {
    frame: 23,
    act: 'Act 5: The Strike',
    phase: 'Blue Whips Sweeping Roundhouse Kick Along Arc',
    camX: -230.0,
    camY: 62.0,
    camZoom: 1.38,
    redX: 440.0,
    redY: 726.0,
    redAngles: RED_TWIST_2,
    bluePresent: true,
    blueX: 198.0,
    blueY: 544.0,
    blueAngles: BLUE_SWEEP,
  },
  {
    frame: 24,
    act: 'Act 6: The Block & Impact',
    phase: 'CLASH! Red Vertical Forearm Shield Catches Blue Shin',
    camX: -232.0,
    camY: 64.0,
    camZoom: 1.42,
    redX: 443.0,
    redY: 727.0,
    redAngles: RED_BLOCK_LOCK,
    bluePresent: true,
    blueX: 198.0,
    blueY: 545.0,
    blueAngles: BLUE_CLASH,
  },
  {
    frame: 25,
    act: 'Act 6: The Block & Impact',
    phase: 'Hit-Stop & Momentum Transfer (+5.5px Braced Slide)',
    camX: -232.0,
    camY: 64.0,
    camZoom: 1.42,
    redX: 445.5,
    redY: 727.5,
    redAngles: RED_BLOCK_SHK1,
    bluePresent: true,
    blueX: 199.0,
    blueY: 546.0,
    blueAngles: BLUE_CLASH_S,
  },
  {
    frame: 26,
    act: 'Act 7: The Screen Shake',
    phase: 'Violent Screen Shake 1 (Up-Left + Guard Compression)',
    camX: -252.0,
    camY: 46.0,
    camZoom: 1.45,
    redX: 445.5,
    redY: 727.5,
    redAngles: RED_BLOCK_SHK1,
    bluePresent: true,
    blueX: 199.0,
    blueY: 546.0,
    blueAngles: BLUE_CLASH_S,
  },
  {
    frame: 27,
    act: 'Act 7: The Screen Shake',
    phase: 'Violent Screen Shake 2 (Down-Right + Rebound)',
    camX: -212.0,
    camY: 82.0,
    camZoom: 1.45,
    redX: 444.5,
    redY: 727.0,
    redAngles: RED_BLOCK_SHK2,
    bluePresent: true,
    blueX: 198.0,
    blueY: 545.0,
    blueAngles: BLUE_CLASH,
  },
  {
    frame: 28,
    act: 'Act 7: The Screen Shake',
    phase: 'Violent Screen Shake 3 (Up-Right)',
    camX: -216.0,
    camY: 48.0,
    camZoom: 1.44,
    redX: 445.0,
    redY: 727.2,
    redAngles: RED_BLOCK_SHK1,
    bluePresent: true,
    blueX: 198.5,
    blueY: 545.5,
    blueAngles: BLUE_CLASH_S,
  },
  {
    frame: 29,
    act: 'Act 7: The Screen Shake',
    phase: 'Violent Screen Shake 4 (Down-Left)',
    camX: -248.0,
    camY: 78.0,
    camZoom: 1.43,
    redX: 444.0,
    redY: 727.0,
    redAngles: RED_BLOCK_SHK2,
    bluePresent: true,
    blueX: 198.0,
    blueY: 545.0,
    blueAngles: BLUE_CLASH,
  },
  {
    frame: 30,
    act: 'Act 7: The Screen Shake',
    phase: 'Violent Screen Shake 5 (Damping Settle)',
    camX: -226.0,
    camY: 58.0,
    camZoom: 1.42,
    redX: 444.0,
    redY: 727.0,
    redAngles: RED_BLOCK_LOCK,
    bluePresent: true,
    blueX: 198.0,
    blueY: 545.0,
    blueAngles: BLUE_CLASH,
  },
  {
    frame: 31,
    act: 'Act 8: End Scene',
    phase: 'Locked Clash Pose Hold (1/5)',
    camX: -232.0,
    camY: 64.0,
    camZoom: 1.42,
    redX: 444.0,
    redY: 727.0,
    redAngles: RED_BLOCK_LOCK,
    bluePresent: true,
    blueX: 198.0,
    blueY: 545.0,
    blueAngles: BLUE_CLASH,
  },
  {
    frame: 32,
    act: 'Act 8: End Scene',
    phase: 'Locked Clash Pose Hold (2/5)',
    camX: -232.0,
    camY: 64.0,
    camZoom: 1.42,
    redX: 444.0,
    redY: 727.0,
    redAngles: RED_BLOCK_LOCK,
    bluePresent: true,
    blueX: 198.0,
    blueY: 545.0,
    blueAngles: BLUE_CLASH,
  },
  {
    frame: 33,
    act: 'Act 8: End Scene',
    phase: 'Locked Clash Pose Hold (3/5)',
    camX: -232.0,
    camY: 64.0,
    camZoom: 1.42,
    redX: 444.0,
    redY: 727.0,
    redAngles: RED_BLOCK_LOCK,
    bluePresent: true,
    blueX: 198.0,
    blueY: 545.0,
    blueAngles: BLUE_CLASH,
  },
  {
    frame: 34,
    act: 'Act 8: End Scene',
    phase: 'Locked Clash Pose Hold (4/5)',
    camX: -232.0,
    camY: 64.0,
    camZoom: 1.42,
    redX: 444.0,
    redY: 727.0,
    redAngles: RED_BLOCK_LOCK,
    bluePresent: true,
    blueX: 198.0,
    blueY: 545.0,
    blueAngles: BLUE_CLASH,
  },
  {
    frame: 35,
    act: 'Act 8: End Scene',
    phase: 'Locked Clash Pose Hold (5/5)',
    camX: -232.0,
    camY: 64.0,
    camZoom: 1.42,
    redX: 444.0,
    redY: 727.0,
    redAngles: RED_BLOCK_LOCK,
    bluePresent: true,
    blueX: 198.0,
    blueY: 545.0,
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
            redAngles: curr.redAngles.map((a: number, idx: number) =>
              Number(((a + next.redAngles[idx]) * 0.5).toFixed(1))
            ),
            bluePresent: curr.bluePresent && next.bluePresent,
            blueX: Number(((curr.blueX + next.blueX) * 0.5).toFixed(1)),
            blueY: Number(((curr.blueY + next.blueY) * 0.5).toFixed(1)),
            blueAngles: curr.blueAngles.map((a: number, idx: number) =>
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

  const redArgb = hexColorToArgbUint32(config.redColorHex);
  const blueArgb = hexColorToArgbUint32(config.blueColorHex);

  let totalBytes = prefixHdr.length + ptrlTmpl.length;
  for (const spec of framesSpec) {
    const figCount = spec.bluePresent ? 2 : 1;
    totalBytes += fhdrTmpl.length + figCount * instTmpl.length + fftrTmpl.length;
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
