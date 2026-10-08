import { SitWalkKickKeyframeSpec, StrollKickPanelMeta } from './strollKickTypes';
import { buildCanonicalSitWalkKickFrames } from './strollKickGenerator';

export const CANONICAL_216_SIT_WALK_KICK_FRAMES: SitWalkKickKeyframeSpec[] =
  buildCanonicalSitWalkKickFrames();


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
