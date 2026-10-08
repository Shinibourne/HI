/**
 * SPEED VS STRENGTH: 36-FRAME BIOMECHANICAL COMBAT ENGINE (v5.0 AUDITED)
 * =======================================================================
 * Micro-Biomechanics, True Knee Alignments, Compact Power, and Disciplined Motion:
 *
 * 1. REAL ATHLETIC LEAP & JUMP DYNAMICS (CHARACTER A):
 *    - Compression (F03-F04): Pelvis lowers (Y=526), knees flex forward naturally,
 *      Achilles tendon loads on ball of foot.
 *    - Push-off (F05): Rear leg achieves triple extension (-145°/-162°) pushing into turf;
 *      Lead knee drives forward-up (-30°), shin hanging relaxed underneath (-85°),
 *      kneecap pointing in running direction.
 *    - Airborne Flight (F06): Pushing leg trails behind in full flight extension;
 *      Lead knee leads forward flight.
 *    - Airborne Apex (F07): True human airborne stride posture; Lead leg unfolds to reach;
 *      Trailing leg cycles under pelvis (-105° thigh, -145° shin). Zero arbitrary folding.
 *    - Prep Landing (F08): Lead leg reaches down-forward for turf.
 *    - Landing Compression (F09-F10): Lead foot strikes turf flat (Y=755); Landing knee flexes
 *      progressively to cushion landing impact force; Torso leans back to scrub inertia.
 *
 * 2. COMPACT POWER CROSS OVER GIANT SLIDES (CHARACTER B):
 *    - B remains grounded over feet at X ≈ 645 px (base width: 80 px).
 *    - Power originates from rear-foot pivot → hip rotation → shoulder drive.
 *    - Fist extends directly from chin along a tight, linear trajectory to X ≈ 814 px, Y ≈ 338 px.
 *    - Left arm remains in tight guard protecting jaw; no unmotivated flailing.
 *
 * 3. REAL EVASION / DUCK UNDER THE PUNCH (CHARACTER A):
 *    - A recognizes telegraph coil in F16 and drops center of mass in F17.
 *    - F18 Slip/Duck: Knees flex forward naturally, pelvis drops (Y=545), torso curls.
 *    - A's head drops to Y ≈ 367 px — safely below B's punch plane (Y ≈ 338 px).
 *    - B's punch whips harmlessly overhead through empty air.
 *    - B over-extends forward due to committed momentum, exposing left flank.
 *
 * 4. BIOMECHANICALLY TRUE SIDE KICK (CHARACTER A):
 *    - Supporting foot pivots heel toward B to open hip; knee flexes naturally.
 *    - High Knee Chamber: Torso leans back as counterweight; Kicking knee points left at B (175°),
 *      shin folded tightly underneath thigh (-5°) with heel loaded at hip.
 *    - Piston Extension: Clean linear thrust (178° / 180°) impacting B ribs at X=645 px.
 *    - Re-chamber: Kicking knee snaps back to chamber before setting foot down.
 *
 * 5. BALLISTIC RECOIL & HEAVY TOUCHDOWN (CHARACTER B):
 *    - B launched backward along parabolic arc from X=645 to X=240.
 *    - Boots slam into Y=755 at X=250 with deep knee compression.
 *    - Slide halts at X=240 into a grounded 3-point floor brace.
 */

import {
  STICKFIGURE_BONE_LENGTHS,
  STICKFIGURE_BONE_THICKNESS,
  STICKFIGURE_PARENTS,
} from '../stkndsCodec';

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

/**
 * Analytical Two-Bone Inverse Kinematics for Grounded Feet (0.5 scale skeleton)
 * Solves thigh and shin angles so ankle lands precisely on ground plane Y = 755.0 px.
 * GUARANTEES natural human knee bend direction with zero hyperextension!
 */
