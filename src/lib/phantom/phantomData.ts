import { StoryboardPanelMeta, PhantomShadowboxKeyframeSpec } from './phantomTypes';
import { generate75Frames } from './phantomGenerator';

export const STORYBOARD_PANELS: StoryboardPanelMeta[] = [
  {
    panelNumber: 1,
    title: 'THE FOCUS',
    frameRangeStr: 'Frame 1-30',
    startFrame: 0,
    endFrame: 29,
    actionSummary: 'Character stands in center of frame, perfectly rigid. Hold stillness.',
    visualCues: ['Center of stage (X=640)', 'Feet shoulder-width (Y=755)', 'Arms straight down', 'Chin tucked'],
  },
  {
    panelNumber: 2,
    title: 'TELEPORT 1 (THE BLINK)',
    frameRangeStr: 'Frame 31',
    startFrame: 30,
    endFrame: 30,
    actionSummary: 'Character completely disappears in a single frame with a flash BOOM burst.',
    visualCues: ['1 Blank Frame', 'BOOM blast ring', 'Zero tweening across cut'],
  },
  {
    panelNumber: 3,
    title: 'REAPPEARANCE & JAB',
    frameRangeStr: 'Frame 32-34',
    startFrame: 31,
    endFrame: 33,
    actionSummary: 'Reappears instantly on far right in deep stance; left arm snaps straight out.',
    visualCues: ['Far right position (X=980)', 'Left knee bent forward', 'Left jab at 180° head height', 'Motion snap lines'],
  },
  {
    panelNumber: 4,
    title: 'THE CROSS & TWIST',
    frameRangeStr: 'Frame 35-37',
    startFrame: 34,
    endFrame: 36,
    actionSummary: 'Retracts left arm to chin, twists torso violently left, right punch snaps sharply.',
    visualCues: ['Violent torso twist (112°)', 'Right punch at 180°', 'Rear foot pivoted on ball', 'Air impact hold'],
  },
  {
    panelNumber: 5,
    title: 'UPPERCUT LAUNCH',
    frameRangeStr: 'Frame 38-41',
    startFrame: 37,
    endFrame: 40,
    actionSummary: 'Knees dip, launches dynamic vertical uppercut, lifting character up off toes.',
    visualCues: ['Right fist drops into chamber', 'Upward vertical arc (+90°)', 'Lifts off toes', 'Airborne suspension'],
  },
  {
    panelNumber: 6,
    title: 'TELEPORT 2 (MID-AIR APEX)',
    frameRangeStr: 'Frame 42',
    startFrame: 41,
    endFrame: 41,
    actionSummary: 'Vanishes at the very millisecond the uppercut hits maximum height.',
    visualCues: ['1 Blank Frame', 'Upper right dissipation trails', 'Instantaneous disappearance'],
  },
  {
    panelNumber: 7,
    title: 'AERIAL REAPPEARANCE',
    frameRangeStr: 'Frame 43',
    startFrame: 42,
    endFrame: 42,
    actionSummary: 'Reappears high in air on far left, horizontal back parallel to ceiling.',
    visualCues: ['High altitude (X=340, Y=275)', 'Torso parallel to ceiling (5°)', 'Right leg chambered high', 'Arms flung back'],
  },
  {
    panelNumber: 8,
    title: 'AXE KICK DROP & SMEAR',
    frameRangeStr: 'Frame 44-46',
    startFrame: 43,
    endFrame: 45,
    actionSummary: 'Right leg whips to apex and violently chops straight down toward floor with smear lines.',
    visualCues: ['Apex chamber (+102°)', 'Violent downward smear (-88°)', 'Right heel locked straight', 'Speed descent lines'],
  },
  {
    panelNumber: 9,
    title: 'IMPACT & 3-POINT CROUCH',
    frameRangeStr: 'Frame 47-52',
    startFrame: 46,
    endFrame: 51,
    actionSummary: 'Heel & fist slam into floor in deep 3-point crouch with screen shake. Hold 6 frames.',
    visualCues: ['*SCREEN SHAKE* (Frame 47)', 'Right fist impacts floor (Y=754)', 'Left arm defensive guard', 'Impact shockwave cracks'],
  },
  {
    panelNumber: 10,
    title: 'THE RESET (SLOW MOTION)',
    frameRangeStr: 'Frame 53-75',
    startFrame: 52,
    endFrame: 74,
    actionSummary: 'Cinematic 23-frame ease-in transition relaxing back to exact Step 1 rigid posture.',
    visualCues: ['23-frame ease-in curve', 'Fist lifts off turf', 'Spine straightens', 'Arms fall to sides', 'Loop return to Step 1'],
  },
];


export const CANONICAL_75_PHANTOM_FRAMES: PhantomShadowboxKeyframeSpec[] = generate75Frames();

// Backwards compatibility alias
export const CANONICAL_40_PHANTOM_FRAMES = CANONICAL_75_PHANTOM_FRAMES;

/**
 * Builds adjusted frames supporting 12 FPS and baked 24 FPS with blank frames preserved.
 */
