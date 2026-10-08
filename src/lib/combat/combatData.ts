import { CombatStoryboardPanel } from './combatTypes';

export const COMBAT_STORYBOARD_PANELS: CombatStoryboardPanel[] = [
  {
    panelNumber: 1,
    title: 'Dynamic Combat Stance & Spring Loading',
    startFrame: 0,
    endFrame: 7,
    frameRangeStr: 'F00 – F07 (0.00s – 0.29s)',
    technique: 'Orthodox Combat Bounce & Guard',
    actionSummary:
      'Fighter adopts athletic orthodox fighting stance with chin tucked behind lead shoulder. Rhythmic ankle elasticity and subtle weight pulsing between lead and rear leg (60/40 weight distribution).',
    biomechanicalPhase: 'Combat Readiness & Dynamic Pre-load',
    keyPrinciples: [
      'Elastic recoil readiness: rear heel elevated 15mm with achilles tendon tension',
      'High protective guard: rear fist shields jaw angle, lead hand probes forward',
      'Vestibular horizon lock: gaze fixed firmly on target centerline',
    ],
  },
  {
    panelNumber: 2,
    title: 'Piston Lead Jab & Scapular Protraction',
    startFrame: 8,
    endFrame: 14,
    frameRangeStr: 'F08 – F14 (0.33s – 0.58s)',
    technique: 'Lead Left Jab (1-Strike)',
    actionSummary:
      'Lightning-quick lead step forward. Ground reaction force transfers through lead ankle; lead shoulder protracts and elevates to shield chin as left fist snaps forward to target in 2 frames with instantaneous recoil.',
    biomechanicalPhase: 'Rapid Distal Acceleration & Kinetic Snap',
    keyPrinciples: [
      'Proximal-to-distal whip: scapular protraction precedes elbow extension',
      'Contralateral high guard: right fist stays glued to jaw angle throughout strike',
      'Instantaneous elastic recoil: fist returns along same straight trajectory',
    ],
  },
  {
    panelNumber: 3,
    title: 'Explosive Power Rear Cross & Hip Torque',
    startFrame: 15,
    endFrame: 23,
    frameRangeStr: 'F15 – F23 (0.63s – 0.96s)',
    technique: 'Rear Right Power Cross (2-Strike)',
    actionSummary:
      'Rear foot drives off ball of foot into ground. Pelvis violently rotates 42° clockwise, driving thoracic torso forward. Right arm punches through centerline with full extension, driving piercing kinetic force into opponent.',
    biomechanicalPhase: 'Rotational Torque Drive & Full Kinetic Chain',
    keyPrinciples: [
      'Ground reaction drive: rear foot pivots on ball, knee flexes slightly to drive hip',
      'Pelvic-thoracic torsion: core rotates violently to generate strike velocity',
      'Lead hand recovery: left fist returns to shield temple as right hand extends',
    ],
  },
  {
    panelNumber: 4,
    title: 'Defensive Bob & Weave (Slip) Under Counter',
    startFrame: 24,
    endFrame: 31,
    frameRangeStr: 'F24 – F31 (1.00s – 1.29s)',
    technique: 'Parabolic U-Slip & Core Compression',
    actionSummary:
      'Evasion under an incoming high counter-strike. Both knees flex into a deep athletic crouch (pelvis drops 28px); torso carves a smooth parabolic U-curve under the line of fire while eyes stay locked on target.',
    biomechanicalPhase: 'Defensive Deceleration & Low Elastic Loading',
    keyPrinciples: [
      'Knee flexion shock absorption: knees flex from 165° to 118°',
      'Center of Mass remains within bilateral foot base of support',
      'Head stabilizes on horizon while cervical spine absorbs torso tilt',
    ],
  },
  {
    panelNumber: 5,
    title: 'Savage Liver Hook (Body Rip) & Torsional Whip',
    startFrame: 32,
    endFrame: 39,
    frameRangeStr: 'F32 – F39 (1.33s – 1.63s)',
    technique: 'Lead Left Liver Hook (Body Rip)',
    actionSummary:
      'Uncoiling violently from the bottom of the slip: lead leg pushes off canvas, pelvis snaps clockwise, and left arm locks at a 90° elbow hook, whipping horizontally across the mid-section plane with crushing torque.',
    biomechanicalPhase: 'Rotational Uncoiling & Horizontal Kinetic Whip',
    keyPrinciples: [
      'Lead hip drives horizontal arc while rear leg stabilizes base',
      'Rigid 90° elbow structure transmits full rotational inertia into impact',
      'High rear shield: right glove covers temple against check hooks',
    ],
  },
  {
    panelNumber: 6,
    title: 'Vertical Ground Drive Lead Uppercut',
    startFrame: 40,
    endFrame: 47,
    frameRangeStr: 'F40 – F47 (1.67s – 1.96s)',
    technique: 'Lead Vertical Uppercut',
    actionSummary:
      'Lead knee explodes upward into extension, driving pelvic rise. Left arm scoops vertically upward through target centerline from hip to jaw. Thoracic spine exhibits subtle posterior counter-lean.',
    biomechanicalPhase: 'Vertical Kinetic Ground Drive & Centerline Thrust',
    keyPrinciples: [
      'Vertical ground reaction impulse converts leg drive into upward strike energy',
      'Upper torso counter-recoils backward to conserve angular momentum',
      'Elbow travels close to ribs for maximum structural leverage',
    ],
  },
  {
    panelNumber: 7,
    title: 'Step-Through Stance Pivot & Vestibular Spotting',
    startFrame: 48,
    endFrame: 54,
    frameRangeStr: 'F48 – F54 (2.00s – 2.25s)',
    technique: 'Lead Stance Pivot & Target Spotting',
    actionSummary:
      'Lead foot steps across and pivots 90° on the ball of the foot to open the hips. Head turns rapidly over the opposite shoulder FIRST, spotting the target before the body completes its rotational spin.',
    biomechanicalPhase: 'Rotational Initiation & Vestibular Spotting',
    keyPrinciples: [
      'Foot pivot protects knee joint from destructive rotational torque',
      'Vestibular ocular reflex: head spots target before torso finishes rotation',
      'Center of mass shifts over the pivot foot axis of rotation',
    ],
  },
  {
    panelNumber: 8,
    title: 'Tight Chamber & Conservation of Angular Momentum',
    startFrame: 55,
    endFrame: 60,
    frameRangeStr: 'F55 – F60 (2.29s – 2.50s)',
    technique: 'Spinning Kick Chamber (Compact Tuck)',
    actionSummary:
      'Right kicking leg chambers tightly to pelvis (knee flexes to 135°), drastically reducing the moment of inertia (I = m*r²) and accelerating rotational speed. Arms fold into a compact guard.',
    biomechanicalPhase: 'Angular Acceleration & Inertia Reduction',
    keyPrinciples: [
      'Angular momentum conservation: tucking limbs accelerates spin velocity',
      'Gluteal and hamstring pre-stretch loaded for linear kick release',
      'Support leg maintains firm ground grip without slippage',
    ],
  },
  {
    panelNumber: 9,
    title: 'Linear Heel Piston Thrust (360° Back Kick Peak)',
    startFrame: 61,
    endFrame: 65,
    frameRangeStr: 'F61 – F65 (2.54s – 2.71s)',
    technique: 'Spinning Back Kick (Heel Impact)',
    actionSummary:
      'Explosive linear piston thrust: right heel drives horizontally straight through target chest with razor-sharp alignment. Torso counter-leans horizontally backward into negative pitch for balance equilibrium.',
    biomechanicalPhase: 'Maximum Strike Extension & Piercing Impact',
    keyPrinciples: [
      'Straight linear line of force: heel, knee, hip, and shoulder aligned',
      'Torso horizontal counter-lean perfectly balances kicking leg mass',
      'Contralateral arm sweeps back as dynamic aerodynamic counterbalance',
    ],
  },
  {
    panelNumber: 10,
    title: 'Dynamic Retraction & Muay Thai Stance Switch',
    startFrame: 66,
    endFrame: 77,
    frameRangeStr: 'F66 – F77 (2.75s – 3.21s)',
    technique: 'Kick Chamber Retract & Scissor Switch Hop',
    actionSummary:
      'Immediate retraction chamber prevents leg entrapment. Foot returns to ground into a lightning scissor switch-hop: feet exchange positions in mid-air in 3 frames, loading spring energy into the rear calf.',
    biomechanicalPhase: 'Momentum Dissipation & Elastic Stance Switch',
    keyPrinciples: [
      'Elastic tendon recoil: switch hop re-loads quadriceps for vertical launch',
      'Controlled rotational deceleration prevents over-spinning',
      'Hands maintain dynamic guard throughout stance transition',
    ],
  },
  {
    panelNumber: 11,
    title: 'Hanuman Flying Knee Thrust & Airborne Arc',
    startFrame: 78,
    endFrame: 89,
    frameRangeStr: 'F78 – F89 (3.25s – 3.71s)',
    technique: 'Muay Thai Hanuman Flying Knee',
    actionSummary:
      'Explosive launch off ground into high airborne trajectory (apex Y = 440px). Right knee drives spear-sharp into target; pelvis thrusts forward, spine arches into lumbar extension, and both arms whip down and back.',
    biomechanicalPhase: 'Ballistic Apex Thrust & Core Extension',
    keyPrinciples: [
      'Center of Mass follows true zero-drag ballistic flight parabola',
      'Classic Muay Thai arm-whip down generates reactive upward pelvic impulse',
      'Spear knee acute angle (knee flexion 130°) concentrates strike force',
    ],
  },
  {
    panelNumber: 12,
    title: 'Landing Cushion, Rapid Elbow Slash & Guard Settle',
    startFrame: 90,
    endFrame: 119,
    frameRangeStr: 'F90 – F119 (3.75s – 4.96s)',
    technique: 'Landing Cushion, Lead Elbow Slash & Guard',
    actionSummary:
      'Landing on balls of feet with deep knee shock absorption. Immediately transitions into rapid cross-jab flurry, followed by a decisive horizontal elbow slash cutting across target face, before settling into high guard.',
    biomechanicalPhase: 'Impact Cushioning, Multi-Strike Blitz & Settling',
    keyPrinciples: [
      'Ground reaction cushioning: knees flex to absorb vertical landing energy',
      'Tight elbow blade: forearm folded flush against bicep at 140° flexion',
      'Harmonic settling: smooth return to balanced combat stance without resets',
    ],
  },
];
