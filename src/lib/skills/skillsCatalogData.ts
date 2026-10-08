/**
 * UNIVERSAL HUMAN MOTION, BIOMECHANICS & PROCEDURAL KINEMATICS FRAMEWORK (v3.0)
 * =============================================================================
 * Medium-independent animation intelligence system governing human and creature
 * movement across Stick Nodes (.stknds), 2D skeletal rigs, 3D keyframe animation,
 * sprite sheets, and procedural character controllers.
 *
 * Integrated Open-Source Foundations:
 * 1. Forward & Inverse Kinematics (axharb/forward-and-inverse-kinematics)
 * 2. Procedural 2D Character Animation (mradovic38/ik-proc-anim-2d)
 * 3. Procedural Hyper-Motion & Physics (cristhiandrm/2D-Procedural-Hyper-Motion-Controller)
 * 4. Programmatic Animation Systems (ManimCommunity/manim)
 * 5. Human Pose & Motion Reference (CMU-Perceptual-Computing-Lab/openpose)
 */

import {
  STICKFIGURE_BONE_LENGTHS,
  STICKFIGURE_BONE_NAMES,
  STICKFIGURE_PARENTS,
  TeleportAmbushKeyframeSpec,
} from '../stkndsCodec';

export type AnimationStyleMode =
  | 'REALISTIC'
  | 'SEMI-REALISTIC'
  | 'CARTOON'
  | 'STICK-FIGURE'
  | 'EXAGGERATED'
  | 'ANIME-INSPIRED'
  | 'DYNAMIC'
  | 'COMEDIC';

export type SkillCategory =
  | 'Master & Foundation'
  | 'Anatomical & Skeletal'
  | 'Kinematics & Limb Solving'
  | 'Balance & Mechanics'
  | 'Locomotion & Action Mechanics'
  | 'Physics, Secondary & Inertia'
  | 'Timing, Composition & Arcs'
  | 'Spatial Consistency & Interaction'
  | 'Quality Assurance';

export interface MotionSkillDefinition {
  id: number;
  slug: string;
  name: string;
  category: SkillCategory;
  priority: 'CRITICAL' | 'HIGH' | 'STANDARD';
  summary: string;
  causalQuestion: string;
  biomechanicalRules: string[];
  failureModesPrevented: string[];
  verificationMetrics: string[];
}

export interface SkillHierarchyBranch {
  id: string;
  name: string;
  description: string;
  skills: number[];
  subBranches?: SkillHierarchyBranch[];
  autoInvokes: string[];
}

/**
 * Hierarchical Skill Organization
 * Higher-level action skills automatically invoke lower-level foundational skills.
 */
export const SKILL_HIERARCHY: SkillHierarchyBranch[] = [
  {
    id: 'anatomy',
    name: '1. Anatomy',
    description: 'Biological constraints, bone invariant lengths, and OpenPose skeletal topological references.',
    skills: [2, 34, 35],
    autoInvokes: [],
    subBranches: [
      {
        id: 'anatomy-constraints',
        name: 'Joint Constraints',
        description: 'Hinge polarity limits (knees/elbows) and multi-segment spinal distribution.',
        skills: [2],
        autoInvokes: [],
      },
      {
        id: 'anatomy-lengths',
        name: 'Limb Length Preservation',
        description: 'Rigid bone invariants resisting numerical stretching unless stylized.',
        skills: [34],
        autoInvokes: [],
      },
      {
        id: 'anatomy-pose-ref',
        name: 'Pose Structure & OpenPose Reference',
        description: 'Keypoint relationship topology and segment mass distribution.',
        skills: [35],
        autoInvokes: [],
      },
    ],
  },
  {
    id: 'kinematics',
    name: '2. Kinematics',
    description: 'Forward Kinematics, Analytical 2-bone Inverse Kinematics, and coupled limb solving.',
    skills: [36, 37, 38],
    autoInvokes: ['anatomy'],
    subBranches: [
      {
        id: 'kinematics-fk',
        name: 'Forward Kinematics',
        description: 'Hierarchical coordinate transformation pipeline down bone trees.',
        skills: [36],
        autoInvokes: [],
      },
      {
        id: 'kinematics-ik',
        name: 'Inverse Kinematics',
        description: 'Analytical cosine-law 2-bone solver with polarity constraints.',
        skills: [37],
        autoInvokes: ['anatomy-constraints'],
      },
      {
        id: 'kinematics-limbs',
        name: 'Limb Solving (Legs & Arms)',
        description: 'Coupled HIP→KNEE→ANKLE→FOOT and SHOULDER→ELBOW→WRIST→HAND systems.',
        skills: [38],
        autoInvokes: ['kinematics-ik'],
      },
    ],
  },
  {
    id: 'balance',
    name: '3. Balance',
    description: 'Center of mass tracking, 6-stage weight transfer, and ground contact support polygon.',
    skills: [3, 4, 27, 39],
    autoInvokes: ['anatomy', 'kinematics'],
    subBranches: [
      {
        id: 'balance-com',
        name: 'Center of Mass',
        description: 'Weighted 17-bone mass centroid projection relative to support base.',
        skills: [3],
        autoInvokes: [],
      },
      {
        id: 'balance-weight',
        name: 'Weight Transfer',
        description: 'Progressive load transfer, pelvis dipping, and unweighting cycles.',
        skills: [4],
        autoInvokes: ['balance-com'],
      },
      {
        id: 'balance-support',
        name: 'Foot Support & Ground Pinning',
        description: 'World-space coordinate pinning without sliding or floating.',
        skills: [27, 39],
        autoInvokes: [],
      },
    ],
  },
  {
    id: 'locomotion',
    name: '4. Locomotion',
    description: 'Walk cycles, running strides, directional starts/stops, turns, and procedural gait control.',
    skills: [20, 21, 22, 23, 40, 41],
    autoInvokes: ['balance', 'kinematics', 'anatomy'],
    subBranches: [
      {
        id: 'locomotion-walk',
        name: 'Walk Mechanics',
        description: 'Four-phase gait (Contact, Down, Passing, Up) with sinusoidal pelvis wave.',
        skills: [40],
        autoInvokes: ['balance-weight', 'balance-support'],
      },
      {
        id: 'locomotion-run',
        name: 'Run Mechanics',
        description: 'Forward torso lean, high heel kick, airborne flight phase.',
        skills: [20],
        autoInvokes: [],
      },
      {
        id: 'locomotion-procedural',
        name: 'Procedural Character Motion',
        description: 'Deriving secondary pelvic/torso/knee positions from high-level footstep targets.',
        skills: [41],
        autoInvokes: ['kinematics-limbs', 'balance-com'],
      },
      {
        id: 'locomotion-transitions',
        name: 'Starts, Stops & Turns',
        description: 'Acceleration lean, lead-foot braking, and gaze-first heading turns.',
        skills: [21, 22, 23],
        autoInvokes: [],
      },
    ],
  },
  {
    id: 'action',
    name: '5. Action',
    description: 'Ballistic jumps, landings, martial strikes, sweeping kicks, and collision reaction.',
    skills: [6, 17, 18, 19],
    autoInvokes: ['locomotion', 'balance', 'kinematics'],
    subBranches: [
      {
        id: 'action-jumps',
        name: 'Jump & Flight Mechanics',
        description: 'Anticipation crouch, push-off, apex evolution, ballistic descent.',
        skills: [19],
        autoInvokes: [],
      },
      {
        id: 'action-landing',
        name: 'Landing Mechanics',
        description: 'Touchdown shock absorption, pelvic compression, and staggered recovery.',
        skills: [18],
        autoInvokes: ['balance-weight'],
      },
      {
        id: 'action-combat',
        name: 'Strikes, Kicks & Impact',
        description: 'Knee chambering, kinetic chain whipping, hit-stop holds, and recoil slides.',
        skills: [6, 17],
        autoInvokes: ['kinematics-limbs'],
      },
    ],
  },
  {
    id: 'motion-quality',
    name: '6. Motion Quality',
    description: 'Spatial arcs, non-linear timing, acceleration curves, continuity, and Manim-inspired composition.',
    skills: [11, 12, 13, 25, 28, 30, 32, 42],
    autoInvokes: [],
    subBranches: [
      {
        id: 'quality-arcs',
        name: 'Curvilinear Motion Arcs',
        description: 'Smooth extremity trajectories eliminating zigzags and straight translation.',
        skills: [11],
        autoInvokes: [],
      },
      {
        id: 'quality-timing',
        name: 'Timing, Spacing & Acceleration',
        description: 'Ease-in/ease-out distributions, velocity peaks, and momentum preservation.',
        skills: [12, 13],
        autoInvokes: [],
      },
      {
        id: 'quality-composition',
        name: 'Animation Composition',
        description: 'Deterministic multi-phase transitions with C1-continuous spline blending.',
        skills: [42],
        autoInvokes: [],
      },
    ],
  },
  {
    id: 'secondary-motion',
    name: '7. Secondary Motion',
    description: 'Momentum, follow-through, Verlet-integrated secondary oscillations, and dynamic squash & stretch.',
    skills: [14, 15, 43, 44, 45, 46],
    autoInvokes: ['motion-quality'],
    subBranches: [
      {
        id: 'secondary-followthrough',
        name: 'Follow-Through & Overlapping Action',
        description: '1-2 frame phase lag down parent-child chains.',
        skills: [14, 15],
        autoInvokes: [],
      },
      {
        id: 'secondary-physics',
        name: 'Verlet & Harmonic Secondary Physics',
        description: 'Spring-damper oscillations for head stabilization, loose apparel, and recoil.',
        skills: [43, 45, 46],
        autoInvokes: [],
      },
      {
        id: 'secondary-squash',
        name: 'Dynamic Squash & Stretch',
        description: 'Volume-preserving deformation along velocity vectors during impact and takeoff.',
        skills: [44],
        autoInvokes: [],
      },
    ],
  },
  {
    id: 'spatial-interaction',
    name: '8. Spatial Consistency & Interaction',
    description: 'Shared world coordinate space, absolute ground plane alignment (Y=755px), elevation tracking, and multi-character interaction solving.',
    skills: [47, 48, 49, 50, 51, 52, 53],
    autoInvokes: ['anatomy', 'kinematics', 'balance', 'action'],
    subBranches: [
      {
        id: 'spatial-ground',
        name: 'Ground Plane & Elevation Tracking',
        description: 'Master scene reference frame, floor grounding without vertical drift, and multi-tier platform surfaces.',
        skills: [47, 48, 51],
        autoInvokes: [],
      },
      {
        id: 'spatial-reach',
        name: 'Relative Distance & Strike Reach',
        description: 'Character root positioning, facing alignment, and analytical combat strike reach solving.',
        skills: [49, 50],
        autoInvokes: ['kinematics'],
      },
      {
        id: 'spatial-sync',
        name: 'Multi-Character Synchronization & QC',
        description: 'Same-frame hit timing, recoil physics, dynamic camera framing, and 10-point spatial validation.',
        skills: [52, 53],
        autoInvokes: [],
      },
    ],
  },
];

/**
 * Universal 46-Skill Reusable Human Motion & Procedural Kinematics Library
 */
export const EXPANDED_46_MOTION_SKILLS: MotionSkillDefinition[] = [
  {
    id: 1,
    slug: 'natural-human-movement',
    name: '01. Natural Human Movement (Master Skill)',
    category: 'Master & Foundation',
    priority: 'CRITICAL',
    summary:
      'Governs characters as unified living bodies with mass, skeleton, muscles, and intent rather than collections of independently repositioned segments.',
    causalQuestion: 'What internal muscular force or external physical impulse caused this body movement?',
    biomechanicalRules: [
      'Every movement originates from a physical force (muscular contraction, gravity, momentum, or external impact).',
      'Never move a limb merely to reach the next frame coordinate; drive the extremity through pelvis weight shift, spine torque, and proximal-to-distal joint propagation.',
      'Maintain continuous whole-body coordination across balance, center of mass, posture, and natural asymmetry.',
    ],
    failureModesPrevented: [
      'Independent stick-repositioning ("puppet-on-strings" look)',
      'Unmotivated limb movement while torso stays frozen',
      'Mechanical linear interpolation between arbitrary poses',
    ],
    verificationMetrics: [
      'Proximal-to-distal kinetic chain correlation > 0.85',
      'Zero isolated limb motion without corresponding torso/pelvis compensation',
    ],
  },
  {
    id: 2,
    slug: 'human-anatomy-joint-constraints',
    name: '02. Human Anatomy & Joint Constraints',
    category: 'Anatomical & Skeletal',
    priority: 'CRITICAL',
    summary:
      'Enforces biological hinge and ball-and-socket joint limits across hips, knees, ankles, spine, shoulders, elbows, wrists, and neck.',
    causalQuestion: 'Does every joint bend only in its anatomical direction and within human range of motion?',
    biomechanicalRules: [
      'Knee Hinge Rule: Knees are strict 1-DOF hinges. When facing Right (+X), shin world angle must be <= thigh world angle (flexion range 0° to -140°). When facing Left (-X), shin world angle must be >= thigh world angle (flexion range 0° to +140°). Zero backward hyperextension.',
      'Elbow Hinge Rule: Elbows flex only toward the anterior bicep aspect (0° to 145° flexion) and never hyperextend backward.',
      'Ankle Range Rule: Ankles operate within dorsiflexion (+35°) and plantarflexion (-50°) relative to the shin perpendicular.',
      'Spine & Neck Curvature Rule: Total torso/neck bend is distributed across Lower Spine, Upper Chest, and Neck (max ±35° relative delta per segment) — never a 90° single-joint snap.',
    ],
    failureModesPrevented: [
      'Flamingo/bird reverse-bending knees',
      'Backwards-bending elbows',
      '180° backward-twisted feet on standing poses',
      'Broken-neck / limbo-spine hyperextension',
    ],
    verificationMetrics: [
      '0 knee hyperextension violations across all frames',
      '0 inter-segment spine/neck kinks > 40° relative angle',
    ],
  },
  {
    id: 3,
    slug: 'balance-center-of-mass',
    name: '03. Balance & Center of Mass (COM)',
    category: 'Balance & Mechanics',
    priority: 'CRITICAL',
    summary:
      'Tracks whole-body weighted Center of Mass relative to the ground support polygon, direction of acceleration, and external forces.',
    causalQuestion: 'Where is the Center of Mass relative to the supporting foot/base, and why is the body leaning?',
    biomechanicalRules: [
      'In static or slow poses, the vertical projection of the Center of Mass (weighted average: Pelvis 42%, Chest 26%, Head 8%, Limbs 24%) must fall inside the ground support polygon.',
      'During single-leg support (e.g., high kick or passing stride), the pelvis shifts over the standing foot and the upper torso counter-leans away from the raised leg.',
      'To accelerate forward, COM leans ahead of the planted foot; to decelerate/brake, the planted foot strikes ahead of the COM.',
    ],
    failureModesPrevented: [
      'Leaning at impossible angles without falling',
      'Lifting a kicking leg without shifting hip/torso weight onto the standing leg',
      'Instantaneous stops without COM braking lean',
    ],
    verificationMetrics: [
      'Static/quasi-static COM horizontal offset within support base ±18 px',
      'Counter-balance torso angle opposite to extended kicking leg',
    ],
  },
  {
    id: 4,
    slug: 'weight-transfer',
    name: '04. Weight Transfer',
    category: 'Balance & Mechanics',
    priority: 'CRITICAL',
    summary:
      'Governs the 6-stage transfer of body mass from one support to another during stepping, kicking, fighting, jumping, and stopping.',
    causalQuestion: 'Which leg currently bears the body weight, and when does the receiving leg compress to accept it?',
    biomechanicalRules: [
      '6-Stage Transfer Cycle: (1) Initial support bears load → (2) COM shifts toward new support → (3) Receiving foot contacts ground → (4) Receiving knee flexes & pelvis dips to absorb weight → (5) Old support unweights & releases → (6) Support leg extends to propel body.',
      'Never simply scissor left and right legs back and forth at constant pelvis height.',
      'The pelvis must visibly dip (+5 to +14 px downward) during weight acceptance and rise during single-leg passing.',
    ],
    failureModesPrevented: [
      'Flat-line pelvis translation during walking/stepping',
      'Weightless leg swapping without knee compression',
    ],
    verificationMetrics: [
      'Measurable vertical pelvis wave (dip on Down pose, rise on Passing pose)',
      'Support knee flexion increase of 12°–25° during weight acceptance',
    ],
  },
  {
    id: 5,
    slug: 'foot-mechanics',
    name: '05. Foot Mechanics',
    category: 'Balance & Mechanics',
    priority: 'HIGH',
    summary:
      'Governs heel-strike, flat-foot weight-acceptance locking, heel-to-toe roll, toe-off propulsion, and swing-phase ground clearance.',
    causalQuestion: 'What phase of contact is this foot in, and is it firmly anchored to the ground?',
    biomechanicalRules: [
      'Heel-Strike: The foot arrives dorsiflexed (toes up ~25°) so the calcaneus contacts first.',
      'Flat-Foot World Lock: Once planted, the foot’s world X/Y coordinate must remain locked (slip < 2px) while the hip rolls over it.',
      'Toe-Off: The heel peels off the ground first while the ball of the foot pushes backward.',
      'Swing Clearance: The foot dorsiflexes and the knee bends to clear the ground without stubbing toes.',
    ],
    failureModesPrevented: [
      'Moonwalking / sliding feet on the ground',
      'Flat-foot slapping before heel contact',
      'Toes dragging on the ground during swing phase',
    ],
    verificationMetrics: [
      'Planted foot horizontal movement < 2.0 px per frame during stance',
      'Swing foot minimum ground clearance >= 12 px',
    ],
  },
  {
    id: 6,
    slug: 'knee-path-leg-mechanics',
    name: '06. Knee Path & Leg Mechanics',
    category: 'Kinematics & Limb Solving',
    priority: 'HIGH',
    summary:
      'Coordinates HIP → KNEE → ANKLE → FOOT as a coupled pendulum-lever system during swings, chambers, and landings.',
    causalQuestion: 'Is the knee driving the limb forward while the lower leg trails naturally?',
    biomechanicalRules: [
      'The hip joint accelerates the thigh first; the knee leads the forward arc while the shin folds loosely behind.',
      'In a kick chamber, the knee raises to target height before the shin snaps outward into extension.',
      'In landing, the knee compresses smoothly to dissipate kinetic energy.',
    ],
    failureModesPrevented: [
      'Straight-leg robot kicking',
      'Shin moving before thigh during swing',
      'Rigid unyielding leg impacts',
    ],
    verificationMetrics: [
      'Knee joint leads shin extremity by 1–2 frames during forward drive',
      'Flexion angle peaks before extension phase commences',
    ],
  },
  {
    id: 7,
    slug: 'pelvis-hip-mechanics',
    name: '07. Pelvis / Hip Mechanics',
    category: 'Balance & Mechanics',
    priority: 'CRITICAL',
    summary:
      'Governs the Pelvis (Node 0) as the primary locomotive engine, energy reservoir, and center of rotational torque.',
    causalQuestion: 'How does the pelvis move, dip, rotate, and absorb impact to drive the rest of the body?',
    biomechanicalRules: [
      'The pelvis dictates overall center of mass and moves before limbs move.',
      'In walking and running, the pelvis traces a vertical sine wave (dipping on weight strike, rising on passing).',
      'In rotational strikes and blocks, the hips rotate ahead of the chest, creating torque.',
    ],
    failureModesPrevented: [
      'Static pelvis with flailing limbs',
      'Lack of vertical locomotion rhythm',
      'Disembodied limb movement without hip involvement',
    ],
    verificationMetrics: [
      'Vertical pelvis displacement oscillation >= 6 px during standard strides',
      'Pelvis rotation leads chest rotation in axial strikes by 1 frame',
    ],
  },
  {
    id: 8,
    slug: 'spine-torso-mechanics',
    name: '08. Spine & Torso Mechanics',
    category: 'Anatomical & Skeletal',
    priority: 'HIGH',
    summary:
      'Distributes torso curvature across Lower Spine (Node 7) and Upper Chest (Node 8) with organic delay and counter-twist.',
    causalQuestion: 'How is the spine flexing and counter-balancing the hips and limbs?',
    biomechanicalRules: [
      'Lower spine leads upper chest with a 1-frame propagation delay.',
      'The spine maintains an organic S or C curve, bending away from high kicks to counter-balance.',
      'During impact absorption, the spine flexes slightly forward or compresses rather than snapping backward.',
    ],
    failureModesPrevented: [
      'Stiff plank-like torso',
      'Opposite torso leaning that defies gravity',
      'Acute angular kink between pelvis and chest',
    ],
    verificationMetrics: [
      'Relative angle between Node 7 and Node 8 <= 32°',
      'Torso angle leans away from raised extremity during high kicks',
    ],
  },
  {
    id: 9,
    slug: 'shoulder-arm-counter-motion',
    name: '09. Shoulder & Arm Counter-Motion',
    category: 'Kinematics & Limb Solving',
    priority: 'HIGH',
    summary:
      'Manages anti-phase arm swings during locomotion and counter-rotational torque during athletic strikes.',
    causalQuestion: 'Are the arms actively balancing leg momentum and stabilizing rotational inertia?',
    biomechanicalRules: [
      'Right arm swings forward when left leg swings forward, and vice-versa.',
      'Forearms lag biceps by 1 frame due to inertia, flexing on upswings and extending on downswings.',
      'During single-leg strikes, the opposite arm forms a guard or counter-whip to cancel rotational slip.',
    ],
    failureModesPrevented: [
      'Robotic synchronous arm-leg swinging ("same-side march")',
      'Rigid frozen arms during locomotion',
      'Arms moving without wrist or elbow lag',
    ],
    verificationMetrics: [
      'Cross-body arm/leg phase opposition correlation < -0.80',
      'Forearm phase delay of 1 frame behind bicep',
    ],
  },
  {
    id: 10,
    slug: 'head-stability-gaze-control',
    name: '10. Head Stability & Gaze Control',
    category: 'Anatomical & Skeletal',
    priority: 'HIGH',
    summary:
      'Gimbal neck stabilization and gaze-directed intention that precedes body turns and target acquisitions.',
    causalQuestion: 'Where are the character’s eyes looking, and is the neck dampening body vibration?',
    biomechanicalRules: [
      'The neck counter-rotates during locomotion to keep the head level within ±2° of the horizontal gaze.',
      'When turning or acquiring a target, the head and gaze turn 1–2 frames ahead of the torso and limbs.',
    ],
    failureModesPrevented: [
      'Head violently bobbing with torso without stabilization',
      'Body turning into an attack before looking',
      'Blank zombie stare unconnected to scene action',
    ],
    verificationMetrics: [
      'Head world angle variance during steady walk < 3°',
      'Head rotational onset precedes torso rotational onset by 1–2 frames',
    ],
  },
  {
    id: 11,
    slug: 'arcs-of-motion',
    name: '11. Arcs of Motion',
    category: 'Timing, Composition & Arcs',
    priority: 'HIGH',
    summary:
      'Ensures all body extremities, joints, and objects trace organic, curvilinear paths through space rather than straight lines.',
    causalQuestion: 'Does the trajectory of every moving joint form a smooth, continuous circular or parabolic arc?',
    biomechanicalRules: [
      'Joints are fixed-length levers rotating around pivots; therefore natural trajectories are always arcs.',
      'Eliminate straight linear interpolations across frames for hands, feet, knees, and head.',
    ],
    failureModesPrevented: [
      'Robotic linear A-to-B sliding',
      'Sharp angular direction changes without transitional curves',
    ],
    verificationMetrics: [
      'Curvature continuity across all tracked joint trajectories',
      'Zero single-frame acute direction reversals without an external collision',
    ],
  },
  {
    id: 12,
    slug: 'timing-spacing',
    name: '12. Timing & Spacing',
    category: 'Timing, Composition & Arcs',
    priority: 'CRITICAL',
    summary:
      'Sculpts non-uniform frame distributions to communicate mass, gravity, effort, and explosiveness.',
    causalQuestion: 'Does the spacing between frames reflect the true physical acceleration and deceleration of the mass?',
    biomechanicalRules: [
      'Never space poses uniformly across time.',
      'Cluster frames closely during anticipation and settle; spread frames apart during peak ballistic velocity.',
      'Use hit-stop frame holds (1–2 frames) at moments of massive physical impact to emphasize force transfer.',
    ],
    failureModesPrevented: [
      'Floaty, weightless, underwater motion',
      'Uniform robotic tick-tick pacing',
      'Weak impacts lacking punch or weight',
    ],
    verificationMetrics: [
      'Measurable velocity variation across action phases',
      'Presence of anticipation ease-in and recovery ease-out',
    ],
  },
  {
    id: 13,
    slug: 'acceleration-deceleration',
    name: '13. Acceleration & Deceleration',
    category: 'Timing, Composition & Arcs',
    priority: 'HIGH',
    summary:
      'Governs progressive velocity curves when initiating movement and braking, respecting physical inertia.',
    causalQuestion: 'How does the body overcome inertia to start moving, and how does it absorb momentum to stop?',
    biomechanicalRules: [
      'Bodies cannot achieve maximum speed instantaneously; use progressive launch ratios (1:3:6:10).',
      'Deceleration requires opposing muscular force and distance (10:6:3:1) with forward braking lean.',
    ],
    failureModesPrevented: [
      'Instant starts from dead stop',
      'Abrupt stops without braking stride or recoil',
    ],
    verificationMetrics: [
      'Progressive displacement delta increase on launch',
      'Smooth deceleration curve over at least 3 frames upon stopping',
    ],
  },
  {
    id: 14,
    slug: 'momentum-inertia',
    name: '14. Momentum & Inertia',
    category: 'Physics, Secondary & Inertia',
    priority: 'CRITICAL',
    summary:
      'Implements Newton’s first law: massive bodies carry forward until acted on by friction, muscles, or collision.',
    causalQuestion: 'What happens to the body’s mass when primary motion ceases or collides?',
    biomechanicalRules: [
      'Heavy segments (pelvis, torso) carry forward and settle first; lighter extremities lag and oscillate.',
      'When an external force strikes the character, momentum transfers directly into defensive slides and joint flexion.',
    ],
    failureModesPrevented: [
      'Sudden dead-freezes upon reaching a keyframe',
      'Immune characters unaffected by collision forces',
    ],
    verificationMetrics: [
      'Momentum conservation: post-collision slide distance proportional to strike velocity',
      'Damped oscillation settle of extremities after stopping',
    ],
  },
  {
    id: 15,
    slug: 'follow-through-overlapping-action',
    name: '15. Follow-Through & Overlapping Action',
    category: 'Physics, Secondary & Inertia',
    priority: 'HIGH',
    summary:
      'Staggers arrival times across parent-child skeletal chains so joints never start or stop simultaneously.',
    causalQuestion: 'Which joint leads the motion, and how long does the child joint take to catch up and overshoot?',
    biomechanicalRules: [
      'Proximal joints (hips, shoulders) initiate and finish primary movement first.',
      'Distal joints (hands, feet, loose gear) arrive 1–2 frames later, overshooting slightly before settling.',
    ],
    failureModesPrevented: [
      'Rigid block-like body movement',
      'Simultaneous whole-body stopping',
    ],
    verificationMetrics: [
      'Staggered peak velocity timestamps across connected joints',
      '1–2 frame overshoot on extremity arrival',
    ],
  },
  {
    id: 16,
    slug: 'anticipation',
    name: '16. Anticipation',
    category: 'Locomotion & Action Mechanics',
    priority: 'HIGH',
    summary:
      'Prepares the audience and loads physical energy in the opposing direction before any major forceful action.',
    causalQuestion: 'How does the character physically coil and shift weight before unleashing explosive movement?',
    biomechanicalRules: [
      'Every major athletic movement begins with a counter-movement (squatting before jumping, coiling back before striking).',
      'The anticipation communicates intent, weight, and upcoming direction.',
    ],
    failureModesPrevented: [
      'Unheralded jerky strikes without windup',
      'Weak attacks lacking perceived kinetic power',
    ],
    verificationMetrics: [
      'Opposing direction displacement during anticipation phase >= 15% of action stroke',
      'Duration of anticipation calibrated to explosive power',
    ],
  },
  {
    id: 17,
    slug: 'impact-reaction',
    name: '17. Impact & Reaction',
    category: 'Locomotion & Action Mechanics',
    priority: 'CRITICAL',
    summary:
      'Governs physical contact precision, hit-stop holds, recoil shockwaves, and equal-and-opposite reaction forces.',
    causalQuestion: 'Do the striking and receiving bodies physically collide at the exact spatial coordinate?',
    biomechanicalRules: [
      'At impact frame, the striking surface and target boundary must physically contact in world space.',
      'Incorporate a 1–2 frame hit-stop freeze where velocity halts to convey bone-crushing density.',
      'Defending character absorbs force via braced sliding, knee compression, and forearm deflection.',
    ],
    failureModesPrevented: [
      'Phantom misses where strikes hit empty air',
      'Flinchless marble-statue defenders',
      'Soft mushy contacts lacking hit-stop punch',
    ],
    verificationMetrics: [
      'Contact distance between striking bone and target surface < 20 px',
      'Immediate recoil displacement or compression in defender on subsequent frame',
    ],
  },
  {
    id: 18,
    slug: 'landing-mechanics',
    name: '18. Landing Mechanics',
    category: 'Locomotion & Action Mechanics',
    priority: 'HIGH',
    summary:
      'Absorbs downward vertical momentum through progressive ankle, knee, and hip shock absorption compression.',
    causalQuestion: 'How does the body dissipate downward kinetic energy to avoid injury upon ground impact?',
    biomechanicalRules: [
      'Balls of feet make contact first, followed by heel drop.',
      'Knees flex deeply (20°–50°) and pelvis dips (+12 to +28 px) to cushion impact over 2–4 frames.',
      'The body recovers slowly upward from pelvis to head as stability is regained.',
    ],
    failureModesPrevented: [
      'Stiff-legged jarring landings',
      'Zero vertical pelvic compression on impact',
    ],
    verificationMetrics: [
      'Downward pelvic compression of at least 12 px during touchdown phase',
      'Smooth rebound recovery over 3–5 frames',
    ],
  },
  {
    id: 19,
    slug: 'jump-mechanics',
    name: '19. Jump Mechanics',
    category: 'Locomotion & Action Mechanics',
    priority: 'HIGH',
    summary:
      'Structures ballistic jumping across 8 distinct biomechanical phases from anticipation crouch to landing recovery.',
    causalQuestion: 'How does muscular push-off convert into ballistic gravitational parabolic flight?',
    biomechanicalRules: [
      'Phases: Crouch → Push-off drive → Toe-off extension → Decelerating ascent → Apex hang → Accelerating descent → Touchdown cushion → Settle.',
      'During airborne flight, center of mass follows an exact parabolic trajectory governed by gravity ($y = v_0 t - 0.5 g t^2$).',
    ],
    failureModesPrevented: [
      'Constant-speed elevator jumping',
      'Lack of push-off leg extension',
    ],
    verificationMetrics: [
      'Parabolic vertical apex curve with reduced velocity at apex',
      'Full ankle plantarflexion extension during push-off',
    ],
  },
  {
    id: 20,
    slug: 'run-mechanics',
    name: '20. Run Mechanics',
    category: 'Locomotion & Action Mechanics',
    priority: 'HIGH',
    summary:
      'Governs high-speed human running: forward torso lean, vigorous arm pumps, high rear heel kick, and airborne flight.',
    causalQuestion: 'Does the stride include a true flight phase where both feet are airborne?',
    biomechanicalRules: [
      'Running differs from walking by having a flight phase where both feet clear the ground.',
      'Torso leans forward into acceleration (65°–78°).',
      'Trailing heel folds tightly under the glute to shorten pendulum length for fast recovery swing.',
    ],
    failureModesPrevented: [
      'Fast walking disguised as running (no flight phase)',
      'Upright or backward-leaning runners',
    ],
    verificationMetrics: [
      'Presence of airborne flight frames where both feet Y < Y_ground',
      'Forward torso angle of 65°–78°',
    ],
  },
  {
    id: 21,
    slug: 'turning-mechanics',
    name: '21. Turning Mechanics',
    category: 'Locomotion & Action Mechanics',
    priority: 'HIGH',
    summary:
      'Sequences heading changes logically: eyes/head lead, chest rotates, pelvis shifts weight, and feet step.',
    causalQuestion: 'In what order do body parts rotate when changing direction?',
    biomechanicalRules: [
      'Never spin the entire body as a rigid monolith on a single frame.',
      'Rotation propagates: Gaze/Head (F1) → Shoulders/Spine (F2) → Pelvis & Hips (F3) → Foot pivot/step (F4).',
    ],
    failureModesPrevented: [
      'Instantaneous card-flip turnaround',
      'Feet turning before character looks',
    ],
    verificationMetrics: [
      'Staggered rotation onset: Head leads Chest by 1–2 frames',
      'Foot pivot coordinated with weight transfer onto opposite leg',
    ],
  },
  {
    id: 22,
    slug: 'stopping-mechanics',
    name: '22. Stopping Mechanics',
    category: 'Locomotion & Action Mechanics',
    priority: 'HIGH',
    summary:
      'Decelerates running/walking momentum through lead-foot braking strike, backward torso lean, and damped settle.',
    causalQuestion: 'How does the character absorb forward kinetic energy to stop safely?',
    biomechanicalRules: [
      'Lead foot plants firmly ahead of center of mass to act as a brake.',
      'Knee flexes and pelvis lowers to absorb momentum.',
      'Trailing leg steps forward into balanced resting stance as torso settles.',
    ],
    failureModesPrevented: [
      'Instant freeze without braking step',
      'Stopping with center of mass past front foot (tripping)',
    ],
    verificationMetrics: [
      'Braking foot contact X ahead of Pelvis X by at least 25 px',
      'Progressive pelvic horizontal velocity decay to 0',
    ],
  },
  {
    id: 23,
    slug: 'starting-movement',
    name: '23. Starting Movement',
    category: 'Locomotion & Action Mechanics',
    priority: 'HIGH',
    summary:
      'Initiates movement by leaning center of mass in the target direction and pushing off the trailing foot.',
    causalQuestion: 'How does the character generate forward propulsion from rest?',
    biomechanicalRules: [
      'Center of mass leans into direction of travel before pelvis translates.',
      'Trailing foot plants and extends to drive the body forward.',
    ],
    failureModesPrevented: [
      'Pelvis translating while body stays upright or leans backward',
      'Stepping forward without trailing foot push-off',
    ],
    verificationMetrics: [
      'Torso lean angle shifts in travel direction prior to stride 1',
      'Trailing leg extension during initial step push',
    ],
  },
  {
    id: 24,
    slug: 'gesture-intent',
    name: '24. Gesture & Intent',
    category: 'Master & Foundation',
    priority: 'HIGH',
    summary:
      'Injects personality, emotion, intent, and clear silhouette storytelling into every pose and transition.',
    causalQuestion: 'What does this character feel, desire, and intend to do in this moment?',
    biomechanicalRules: [
      'Characters are living beings with thoughts and emotions, not robotic puppets.',
      'Pose lines of action communicate state of mind (alert, aggressive, exhausted, wary).',
    ],
    failureModesPrevented: [
      'Generic neutral mannequins',
      'Confusing silhouettes that obscure the action',
    ],
    verificationMetrics: [
      'Clear line of action traceable through spine and limbs',
      'Distinct recognizable silhouette from any camera angle',
    ],
  },
  {
    id: 25,
    slug: 'natural-asymmetry',
    name: '25. Natural Asymmetry',
    category: 'Master & Foundation',
    priority: 'HIGH',
    summary:
      'Eliminates robotic mirroring by differentiating left and right limb angles, duties, and timing by 10°–30°.',
    causalQuestion: 'Are the left and right limbs doing slightly different, complementary jobs?',
    biomechanicalRules: [
      'Avoid twin poses where left and right arms or legs are identical mirror images.',
      'One arm may act as primary shield while the other braces against the floor or prepares a counter.',
    ],
    failureModesPrevented: [
      'Robotic symmetric twinning',
      'Boring, unnatural cloned poses',
    ],
    verificationMetrics: [
      'Left and right limb joint angle deltas >= 8° in non-symmetric actions',
      'Functional differentiation between lead and trailing arms',
    ],
  },
  {
    id: 26,
    slug: 'secondary-motion',
    name: '26. Secondary Motion',
    category: 'Physics, Secondary & Inertia',
    priority: 'HIGH',
    summary:
      'Ensures non-primary limbs, hair, loose garments, and equipment react dynamically to primary body movement.',
    causalQuestion: 'How do secondary attachments and limbs respond to the primary physical impulse?',
    biomechanicalRules: [
      'Secondary motion enhances the primary action; it never competes with or obscures it.',
      'Follows primary motion with a 1–3 frame inertial delay.',
    ],
    failureModesPrevented: [
      'Stiff, glued-on secondary accessories',
      'Random uncontrolled wobbles distracting from core action',
    ],
    verificationMetrics: [
      'Secondary oscillation frequency correlated with primary body acceleration',
      'Natural damping decay over time',
    ],
  },
  {
    id: 27,
    slug: 'ground-contact-pinning',
    name: '27. Ground Contact & Pinning',
    category: 'Balance & Mechanics',
    priority: 'CRITICAL',
    summary:
      'Maintains exact ground plane alignment and anchors planted feet in world space without skating or floating.',
    causalQuestion: 'Is the planted foot firmly locked to the floor plane without sliding or sinking?',
    biomechanicalRules: [
      'All grounded feet, seated hips, and fallen limbs must rest on the defined ground plane (e.g. Y = 755 px).',
      'Zero foot floating in mid-air during stance phases.',
      'Zero horizontal sliding (> 2 px) of planted feet while bearing body weight.',
    ],
    failureModesPrevented: [
      'Feet sinking below the floor',
      'Characters floating above the ground',
      'Foot sliding / ice-skating during steps',
    ],
    verificationMetrics: [
      'Planted foot Y coordinate variance < 1.0 px',
      'Planted foot horizontal translation < 2.0 px while bearing weight',
    ],
  },
  {
    id: 28,
    slug: 'pose-spatial-continuity',
    name: '28. Pose & Spatial Continuity',
    category: 'Timing, Composition & Arcs',
    priority: 'CRITICAL',
    summary:
      'Unwraps relative joint angles across frames to prevent ±180° mathematical seam flips and 300° spin glitches.',
    causalQuestion: 'Are all joint angle deltas between frames smooth and free of wrapping glitches?',
    biomechanicalRules: [
      'Ensure all relative angles (a1) take the shortest angular path across frames (|delta| <= 180°).',
      'Never allow a joint to snap 360° across a single frame due to sign inversion.',
    ],
    failureModesPrevented: [
      'Sudden propeller-spinning limbs',
      'Angle wrapping glitches at the ±180° boundary',
    ],
    verificationMetrics: [
      'Maximum single-frame bone angle delta <= 75° during non-teleport motion',
      '0 seam-flip discontinuities across entire animation',
    ],
  },
  {
    id: 29,
    slug: 'pose-to-pose-intelligence',
    name: '29. Pose-to-Pose & Breakdown Intelligence',
    category: 'Timing, Composition & Arcs',
    priority: 'HIGH',
    summary:
      'Anchors golden storytelling key poses first, then crafts arc-preserving breakdowns where proximal joints lead.',
    causalQuestion: 'Do the in-between breakdowns preserve the physical arcs and timing of the key poses?',
    biomechanicalRules: [
      'Key poses define the narrative; breakdown poses define the physical path and weight.',
      'Breakdown poses lead with the hips, knees, and elbows rather than interpolating linear averages.',
    ],
    failureModesPrevented: [
      'Straight-line linear interpolation destroying arcs',
      'Lost weight and power in intermediate frames',
    ],
    verificationMetrics: [
      'Breakdown poses adhere to curved trajectory paths',
      'Lead joints advance ahead of trailing extremities in breakdowns',
    ],
  },
  {
    id: 30,
    slug: 'motion-continuity',
    name: '30. Motion Continuity',
    category: 'Timing, Composition & Arcs',
    priority: 'HIGH',
    summary:
      'Preserves momentum, directional vectors, and physical flow across scene cuts, jumps, and transitions.',
    causalQuestion: 'Does motion flow seamlessly across shots and multi-phase actions without jarring hitches?',
    biomechanicalRules: [
      'Velocity vectors entering a transition must match or logically evolve exiting the transition.',
      'Camera whip pans and cuts must match subject velocity and eye-line focus.',
    ],
    failureModesPrevented: [
      'Jarring direction hitches across cuts',
      'Sudden loss of momentum at phase boundaries',
    ],
    verificationMetrics: [
      'Velocity vector angle variance across cuts < 25° for continuing motion',
      'Consistent physical energy transfer across transitions',
    ],
  },
  {
    id: 31,
    slug: 'physics-awareness',
    name: '31. Physics Awareness',
    category: 'Physics, Secondary & Inertia',
    priority: 'HIGH',
    summary:
      'Applies universal laws of physics: gravity, friction, rotational inertia, leverage, and action-reaction forces.',
    causalQuestion: 'Does this motion obey physical mechanics and the laws of motion in the scene?',
    biomechanicalRules: [
      'Every action creates an equal and opposite reaction (Newton’s 3rd law).',
      'Airborne bodies rotate around their center of mass unless braced against an external surface.',
      'Friction between feet and ground determines maximum acceleration and stopping distance.',
    ],
    failureModesPrevented: [
      'Weightless, cartoon-floaty physics in grounded martial arts',
      'Characters flying off without push-off traction',
    ],
    verificationMetrics: [
      'Gravitational acceleration matches consistent scene constant',
      'Equal and opposite force evident on interacting bodies',
    ],
  },
  {
    id: 32,
    slug: 'stylization-control',
    name: '32. Stylization Control',
    category: 'Master & Foundation',
    priority: 'HIGH',
    summary:
      'Allows stylistic modulation (Realistic, Anime, Comedic, Exaggerated) while enforcing 100% anatomical joint integrity.',
    causalQuestion: 'Does the chosen art style enhance the animation without violating biological joint limits?',
    biomechanicalRules: [
      'Stylization exaggerates timing contrast, camera energy, and silhouette poses.',
      'Stylization NEVER permits broken reverse-bending knees, backward elbows, or disjointed skeletons.',
    ],
    failureModesPrevented: [
      'Using "stylization" as an excuse for bad anatomy or reverse knees',
      'Rigid, lifeless realistic pacing when dynamic anime action is needed',
    ],
    verificationMetrics: [
      '100% compliance with anatomical hinge limits regardless of style mode',
      'Calibrated timing contrast matched to selected style mode',
    ],
  },
  {
    id: 33,
    slug: 'animation-quality-control',
    name: '33. Animation Quality-Control Gate',
    category: 'Quality Assurance',
    priority: 'CRITICAL',
    summary:
      'Final 10-domain diagnostic auditor verifying Anatomy, Balance, Feet, Timing, Arcs, Weight, Momentum, Continuity, Intent, and Organic Quality.',
    causalQuestion: 'Does this animation pass every quantitative biomechanical test and read as a believable living human?',
    biomechanicalRules: [
      'Automated inspection across all frames, joints, and transitions.',
      'If any domain fails, the non-compliant motion must be reconstructed before delivery.',
      'Passes the Silhouette & Unified Body Test: reads as a living human even with textures removed.',
    ],
    failureModesPrevented: [
      'Delivering flawed, uninspected animations',
      'Releasing animations that look like detached sticks being algorithmically shoved around',
    ],
    verificationMetrics: [
      '10/10 Quality Control domains passing with score >= 95%',
      'Overall biomechanical quality score >= 98%',
    ],
  },
  {
    id: 34,
    slug: 'limb-length-preservation',
    name: '34. Limb Length Preservation',
    category: 'Anatomical & Skeletal',
    priority: 'HIGH',
    summary:
      'Enforces skeletal bone invariance ($L = \\text{const}$) across all rotations unless volume-preserving squash/stretch is explicitly active.',
    causalQuestion: 'Do bone segments retain their fixed physical lengths as they rotate?',
    biomechanicalRules: [
      'In standard human motion, bones do not compress or stretch.',
      'Verify that thigh, shin, bicep, and forearm lengths remain constant across every frame.',
    ],
    failureModesPrevented: [
      'Accidental rubber-hose limb stretching during rotation',
      'Segments shrinking near trigonometric singularities',
    ],
    verificationMetrics: [
      'Bone length variance across frames < 0.5% of nominal length',
    ],
  },
  {
    id: 35,
    slug: 'human-pose-reference',
    name: '35. Human Pose Reference (OpenPose Mapping)',
    category: 'Anatomical & Skeletal',
    priority: 'HIGH',
    summary:
      'Integrates OpenPose 18/25 keypoint topological relationships and segment mass proportions into internal spatial reasoning.',
    causalQuestion: 'Does the pose reflect authentic human keypoint relationships and anatomical proportions?',
    biomechanicalRules: [
      'Map Stick Nodes 17 bones directly to standardized OpenPose keypoints (Nose, Neck, Shoulders, Elbows, Wrists, Hips, Knees, Ankles).',
      'Reason about motion as: POSE → JOINT RELATIONSHIPS → TRAJECTORIES → TIMING → MOTION.',
    ],
    failureModesPrevented: [
      'Proportionally distorted poses with unnatural segment ratios',
      'Treating stickfigures as abstract lines rather than human skeletons',
    ],
    verificationMetrics: [
      'Consistent keypoint distance ratios matching standard human biomechanics',
    ],
  },
  {
    id: 36,
    slug: 'forward-kinematics',
    name: '36. Forward Kinematics (FK)',
    category: 'Kinematics & Limb Solving',
    priority: 'HIGH',
    summary:
      'Computes joint world coordinates hierarchically from parent origins, bone lengths, and relative joint angles.',
    causalQuestion: 'Are joint world coordinates solved cleanly down the parent-child transform tree?',
    biomechanicalRules: [
      'P_{child} = P_{parent} + [cos(θ), -sin(θ)] * length * scale.',
      'Guarantees perfect connected joint chains without gaps or floating bones.',
    ],
    failureModesPrevented: [
      'Disconnected joints and visual gaps',
      'Coordinate drift across nested hierarchies',
    ],
    verificationMetrics: [
      'Child bone origin exactly equals parent bone terminus (error = 0 px)',
    ],
  },
  {
    id: 37,
    slug: 'inverse-kinematics',
    name: '37. Inverse Kinematics (IK)',
    category: 'Kinematics & Limb Solving',
    priority: 'CRITICAL',
    summary:
      'Solves 2-bone joint angles analytically via the Law of Cosines to reach desired end-effector target positions.',
    causalQuestion: 'When placing a hand or foot at a target coordinate, are joint angles solved accurately?',
    biomechanicalRules: [
      'Given target distance D clamped to [|L1-L2|+ε, (L1+L2)*0.998], solve interior angle via cos(β) = (L1² + L2² - D²) / (2*L1*L2).',
      'Enforce biological hinge polarity so knees and elbows bend only in authentic directions.',
    ],
    failureModesPrevented: [
      'Target misses and disjointed end-effectors',
      'Reverse-bending knee or elbow artifacts',
    ],
    verificationMetrics: [
      'End-effector position error < 1.0 px when target is within reachable envelope',
    ],
  },
  {
    id: 38,
    slug: 'kinematics-limb-solving',
    name: '38. Kinematics & Limb Solving',
    category: 'Kinematics & Limb Solving',
    priority: 'CRITICAL',
    summary:
      'Treats HIP → KNEE → ANKLE → FOOT and SHOULDER → ELBOW → WRIST → HAND as unified, coupled kinematic systems.',
    causalQuestion: 'Does the entire limb solve coherently when an end-effector moves, rather than positioning joints independently?',
    biomechanicalRules: [
      'Never independently position hip, knee, ankle, and foot hoping they look correct.',
      'Moving the foot to a target automatically derives coordinated thigh angle, shin angle, knee location, and ankle orientation.',
    ],
    failureModesPrevented: [
      'Unnatural bends and disjointed limb postures',
      'Ankles twisted away from shin trajectory',
    ],
    verificationMetrics: [
      'Coupled kinetic solution across all 4 limb segments simultaneously',
      'Zero independent floating joints within limbs',
    ],
  },
  {
    id: 39,
    slug: 'foot-support-ground-pinning',
    name: '39. Foot Support & Planting',
    category: 'Balance & Mechanics',
    priority: 'HIGH',
    summary:
      'Locks the stance foot in world space while the pelvis travels forward, rolling smoothly from heel to toe.',
    causalQuestion: 'Does the planted foot remain locked in place as the body moves over it?',
    biomechanicalRules: [
      'The stance foot acts as a fixed anchor point on the ground plane.',
      'Pelvis translates over the stationary ankle while support leg IK flexes and extends naturally.',
    ],
    failureModesPrevented: [
      'Foot sliding during the stance phase of walking or combat',
    ],
    verificationMetrics: [
      'Stance foot world X/Y translation < 1.5 px over full stance duration',
    ],
  },
  {
    id: 40,
    slug: 'walk-mechanics',
    name: '40. Walk Mechanics',
    category: 'Locomotion & Action Mechanics',
    priority: 'HIGH',
    summary:
      'Executes the classic human walking gait cycle: Contact → Down (Cushion) → Passing → Up (Push-off).',
    causalQuestion: 'Does the walk cycle exhibit authentic human gait rhythm, pelvic wave, and arm counter-swing?',
    biomechanicalRules: [
      'Contact: Front heel strikes with dorsiflexion, rear foot finishes push-off.',
      'Down: Front knee flexes, pelvis dips to lowest vertical position.',
      'Passing: Weight shifts over stance leg, swing knee leads forward, pelvis rises.',
      'Up: Stance heel lifts, body reaches highest point before next contact.',
    ],
    failureModesPrevented: [
      'Robotic stiff-legged marches',
      'Flat pelvis translation without the sinusoidal wave',
    ],
    verificationMetrics: [
      'Complete 4-phase gait rhythm visible across stride sequence',
      'Sinusoidal vertical pelvis oscillation amplitude >= 6 px',
    ],
  },
  {
    id: 41,
    slug: 'procedural-character-motion',
    name: '41. Procedural Character Motion',
    category: 'Locomotion & Action Mechanics',
    priority: 'CRITICAL',
    summary:
      'Derives secondary body positions (hip shift, knee flexion, torso counter-lean, arm swings) from higher-level movement decisions.',
    causalQuestion: 'When the character decides to take a step, does the system automatically derive all supporting body adjustments?',
    biomechanicalRules: [
      'Higher-level command ("Step left foot to target X") automatically generates pelvis wave, stance knee IK, swing trajectory, and torso balance.',
      'Reduces authoring burden while ensuring 100% physically coherent poses.',
    ],
    failureModesPrevented: [
      'Requiring manual specification of every joint for routine locomotion',
      'Inconsistent secondary reactions across similar steps',
    ],
    verificationMetrics: [
      'Full skeletal pose derived from footstep target with balanced COM and zero reverse bends',
    ],
  },
  {
    id: 42,
    slug: 'animation-composition',
    name: '42. Animation Composition',
    category: 'Timing, Composition & Arcs',
    priority: 'CRITICAL',
    summary:
      'Composes multi-stage action sequences (Walk → Accelerate → Jump → Airborne → Attack → Fall → Land → Recover) with C1-continuous transitions.',
    causalQuestion: 'Do sequential actions blend smoothly into one continuous performance rather than feeling glued together?',
    biomechanicalRules: [
      'Animation = Reusable Motion Operations + Timing + Interpolation + State Transitions.',
      'Phase boundaries use cubic Hermite spline interpolation to match position, velocity, and momentum vectors.',
    ],
    failureModesPrevented: [
      'Choppy, segmented animations with jarring stops between actions',
      'Sudden loss of momentum when switching from run to jump',
    ],
    verificationMetrics: [
      'C1 velocity continuity across all phase transitions (no instantaneous velocity jumps)',
    ],
  },
  {
    id: 43,
    slug: 'dynamic-body-response',
    name: '43. Dynamic Body Response',
    category: 'Physics, Secondary & Inertia',
    priority: 'HIGH',
    summary:
      'Generates secondary core, spine, and extremity responses automatically from primary movement impulses.',
    causalQuestion: 'How does the rest of the body react when a primary force is applied to one part?',
    biomechanicalRules: [
      'A fast run generates body movement → arm swing → hand follow-through → torso response → head stabilization.',
      'Primary impulses propagate outward through the mass network with realistic physical lag.',
    ],
    failureModesPrevented: [
      'Frozen torso during intense limb activity',
      'Manually inventing unrelated, disconnected movements for each joint',
    ],
    verificationMetrics: [
      'Measurable kinetic energy propagation from primary to secondary segments',
    ],
  },
  {
    id: 44,
    slug: 'squash-and-stretch',
    name: '44. Squash & Stretch',
    category: 'Physics, Secondary & Inertia',
    priority: 'HIGH',
    summary:
      'Applies volume-preserving dynamic deformation along the direction of velocity to accentuate acceleration and impact.',
    causalQuestion: 'Does the body deform along its velocity vector to emphasize speed and impact force?',
    biomechanicalRules: [
      'Along velocity: stretch factor s_parallel = 1 + λ * ||v||.',
      'Transverse to velocity: squash factor s_perp = 1 / sqrt(s_parallel) to preserve 2D/3D volume.',
      'Used during extreme impacts, explosive jumps, and comedic/exaggerated stylization.',
    ],
    failureModesPrevented: [
      'Volume inflation or deflation (ballooning or disappearing mass)',
      'Squashing in the wrong direction (orthogonal to impact)',
    ],
    verificationMetrics: [
      'Volume conservation ratio: width * height ≈ constant (variance < 2%)',
    ],
  },
  {
    id: 45,
    slug: 'inertial-motion',
    name: '45. Inertial Motion',
    category: 'Physics, Secondary & Inertia',
    priority: 'HIGH',
    summary:
      'Models mass-dependent resistance to change in motion, causing heavy limbs to resist starting and resist stopping.',
    causalQuestion: 'Does the motion reflect the true physical inertia of the character’s body mass?',
    biomechanicalRules: [
      'Heavier body segments require more time and force to accelerate and decelerate.',
      'Damped settle oscillations follow the harmonic decay formula: A(t) = A_0 * exp(-γ t) * cos(ω t).',
    ],
    failureModesPrevented: [
      'Instant starts and stops that make the character feel weightless',
      'Endless unnatural wobble without physical damping decay',
    ],
    verificationMetrics: [
      'Decay rate matches calculated physical damping ratio ζ between 0.3 and 0.7',
    ],
  },
  {
    id: 46,
    slug: 'procedural-secondary-motion',
    name: '46. Procedural Secondary Motion',
    category: 'Physics, Secondary & Inertia',
    priority: 'HIGH',
    summary:
      'Uses Verlet integration and damped spring physics to drive loose elements, extremities, and clothing automatically.',
    causalQuestion: 'Are secondary movements calculated from physical laws rather than manually keyframed?',
    biomechanicalRules: [
      'x_{t+Δt} = 2 x_t - x_{t-Δt} + a_t * Δt².',
      'Secondary chains (hair, coat tails, weapon tassels, dangling hands) lag and whip naturally.',
    ],
    failureModesPrevented: [
      'Manual, tedious keyframing of secondary wiggles that look stiff or robotic',
    ],
    verificationMetrics: [
      'Verlet position continuity and realistic centrifugal flare during turns',
    ],
  },
  {
    id: 47,
    slug: 'shared-world-coordinate-space',
    name: '47. Shared World Coordinate Space & Master Scene Reference',
    category: 'Spatial Consistency & Interaction',
    priority: 'CRITICAL',
    summary:
      'Establishes a single, unbending master coordinate frame for all characters and objects before generating animation, eliminating desynchronized local origins.',
    causalQuestion: 'Do all characters and objects in this scene share the exact same spatial coordinate origin and ground plane?',
    biomechanicalRules: [
      'Before posing any character, establish the Scene Reference Frame: Ground Level (Y = 755 px standard), horizontal center, orientation, scale, and surface elevations.',
      'Never independently animate Character A and Character B around disparate local origins and paste them into the scene.',
      'All joint world positions are evaluated in this single shared frame of reference.',
    ],
    failureModesPrevented: [
      'Character A floating high in the sky while Character B stands on the ground',
      'Attacks passing over or under the opponent because elevations were guessed',
      'Scene looking spatially broken upon export into Stick Nodes',
    ],
    verificationMetrics: [
      'Single shared coordinate reference frame established for all scene actors',
      '0 disparate local origins; 100% of characters reference master scene ground Y',
    ],
  },
  {
    id: 48,
    slug: 'ground-plane-elevation-tracking',
    name: '48. Ground Plane Alignment & Elevation Tracking',
    category: 'Spatial Consistency & Interaction',
    priority: 'CRITICAL',
    summary:
      'Maintains an exact, permanent relationship between character contact points and the scene ground plane, eliminating vertical elevation drift.',
    causalQuestion: 'Is every grounded character anchored to the exact ground plane without floating or sinking?',
    biomechanicalRules: [
      'When a foot is planted or pelvis is seated: Foot/Pelvis contact Y ≈ Ground Level (Y = 755 px ± 2 px).',
      'Never allow a supposedly standing character to gradually drift upward or downward between frames.',
      'Jump cycles (Ground → Takeoff → Ascent → Apex → Descent → Landing → Ground) must return to the exact same spatial ground reference.',
    ],
    failureModesPrevented: [
      'Characters floating above the ground in mid-air',
      'Feet sinking below the floor across frames',
      'Inconsistent takeoff and landing elevations across jumps',
    ],
    verificationMetrics: [
      'Planted contact point variance <= 1.0 px across stance frames',
      'Landing touchdown elevation matches takeoff elevation within 1.5 px',
    ],
  },
  {
    id: 49,
    slug: 'character-root-world-positioning',
    name: '49. Character Root & Hierarchical World Positioning',
    category: 'Spatial Consistency & Interaction',
    priority: 'CRITICAL',
    summary:
      'Controls character locomotion through a dedicated Character Root; limbs move relative to body core rather than random global translations.',
    causalQuestion: 'Is the character’s overall world movement driven by a single coherent root node with hierarchical limb propagation?',
    biomechanicalRules: [
      'Hierarchical propagation: World Position → Character Root → Pelvis / Core → Limbs → Hands / Feet.',
      'Whole-body locomotion is governed by continuous Character Root translation; individual limbs solve relative to body position.',
      'Eliminates erratic global leaps of individual joints that cause the body to tear apart.',
    ],
    failureModesPrevented: [
      'Independent limb skating where body segments rip apart across frames',
      'Unintended global teleportation outside deliberate cinematic cuts',
    ],
    verificationMetrics: [
      'Smooth C1 continuous Character Root translation trajectory',
      'Zero isolated joint position jumps > 40 px without corresponding root displacement',
    ],
  },
  {
    id: 50,
    slug: 'relative-distance-strike-reach',
    name: '50. Relative Positioning & Strike Reach Solving',
    category: 'Spatial Consistency & Interaction',
    priority: 'CRITICAL',
    summary:
      'Calculates true geometric distance between characters and solves limb reach dynamically so strikes actually contact hitboxes without missing by 100px.',
    causalQuestion: 'Does the attacking strike point actually intersect the defender’s hitbox within physical contact tolerance?',
    biomechanicalRules: [
      'Attacker Strike Point ≈ Defender Hit Target (contact distance ||P_strike - P_target|| <= 12 px).',
      'When an attack is launched, solve limb extension via Analytical IK and Character Root advance so the fist/foot reaches the defender.',
      'Never generate defender hit flinches when the attacking limb stops 150 px away in empty air.',
      'Both characters must face each other during combat exchanges (facing direction points toward opponent root).',
    ],
    failureModesPrevented: [
      'Ghost impacts: defender reacting violently to punches that miss by 100+ pixels',
      'Attacks passing straight through defender hitbox without contact',
      'Fighters facing opposite directions during combat clash',
    ],
    verificationMetrics: [
      'Clash contact distance <= 12.0 px at strike impact frame',
      'Attacker and defender facing directions oriented toward each other',
    ],
  },
  {
    id: 51,
    slug: 'elevation-management-platforms',
    name: '51. Elevation Management & Platform Surfaces',
    category: 'Spatial Consistency & Interaction',
    priority: 'HIGH',
    summary:
      'Explicitly tracks multi-tier surfaces, ledges, crates, and elevated platforms so characters stand and land on authentic physical surfaces.',
    causalQuestion: 'Does the character’s vertical position correspond to an authentic surface or ballistic airborne state?',
    biomechanicalRules: [
      'If standing on platform: Foot contact Y = Platform Y ± 2 px.',
      'If knocked off a platform ledge: character transitions from Platform Y through ballistic gravitational drop down to Ground Y.',
      'Prevents characters from hovering at platform elevation after walking off the edge.',
    ],
    failureModesPrevented: [
      'Characters standing on invisible air at platform height',
      'Falling characters stopping mid-air above ground plane',
    ],
    verificationMetrics: [
      'Elevation matches registered platform Y within 2.0 px when on surface',
      'Full parabolic fall trajectory down to master Ground Y when displaced from ledge',
    ],
  },
  {
    id: 52,
    slug: 'temporal-spatial-interaction-sync',
    name: '52. Temporal-Spatial Interaction Synchronization',
    category: 'Spatial Consistency & Interaction',
    priority: 'CRITICAL',
    summary:
      'Synchronizes interacting characters in both time and space: strike contact frame coincides exactly with hit-stop hold, followed by momentum recoil.',
    causalQuestion: 'Do the attacker and defender react in the exact same frame with physically proportional momentum transfer?',
    biomechanicalRules: [
      'Frame T: Attacker strike end-effector reaches Target Point.',
      'Frame T: Defender registers impact in the EXACT SAME frame (hit-stop hold 1–2 frames).',
      'Frame T+1: Defender reels back with momentum calculated from strike direction (ΔX_recoil ∝ F_strike / Mass).',
      'Both characters remain synchronized in space and time throughout the entire impact exchange.',
    ],
    failureModesPrevented: [
      'Defender reacting before the strike lands (telepathic flinch)',
      'Defender flinching 3–5 frames late after the limb has already retracted',
      'Recoil direction contradicting strike impulse angle',
    ],
    verificationMetrics: [
      'Exact 0-frame delay between attacker impact arrival and defender flinch trigger',
      'Defender recoil vector directly opposes attacker strike impulse direction',
    ],
  },
  {
    id: 53,
    slug: 'multi-character-spatial-qc-gate',
    name: '53. Multi-Character Spatial Quality-Control Gate',
    category: 'Spatial Consistency & Interaction',
    priority: 'CRITICAL',
    summary:
      'Enforces a 10-domain automated spatial audit across multi-character scenes, certifying elevation, reach, grounding, framing, and continuity.',
    causalQuestion: 'Does the multi-character animation pass all 10 spatial consistency and physical interaction checks?',
    biomechanicalRules: [
      'Automated audit executes across all frames verifying: 1. Elevation Consistency, 2. Ground Penetration, 3. Floating Prevention, 4. Strike Reach Tolerance, 5. Facing Alignment, 6. Root Continuity, 7. Scale Uniformity, 8. Temporal Sync, 9. Shared Framing, 10. Platform Landing.',
      'Any scene failing contact reach or elevation alignment is flagged for instant kinematic correction.',
    ],
    failureModesPrevented: [
      'Exporting animations where characters exist in different coordinate universes',
      'Disjointed multi-character choreography that breaks when imported into Stick Nodes',
    ],
    verificationMetrics: [
      '10/10 spatial domains pass with 0 critical violations',
      'Overall Multi-Character Spatial Consistency Score >= 95%',
    ],
  },
];

export const EXPANDED_53_MOTION_SKILLS = EXPANDED_46_MOTION_SKILLS;

/**
 * Backward compatibility: export original 33 skills
 */
export const UNIVERSAL_33_MOTION_SKILLS = EXPANDED_46_MOTION_SKILLS.slice(0, 33);

/**
 * The Mandatory 15-Step Automatic Execution Pipeline
 */
export const AUTOMATIC_15_STEP_PIPELINE: {
  step: number;
  title: string;
  detail: string;
  skillsInvoked: number[];
}[] = [
  {
    step: 1,
    title: 'Analyze Requested Action & Narrative Intent',
    detail: 'Identify characters, facing directions, environment ground plane, camera staging, and emotional/physical intent.',
    skillsInvoked: [1, 24, 32],
  },
  {
    step: 2,
    title: 'Activate Relevant Motion Skills Automatically',
    detail: 'Bind locomotion, combat, anatomy, kinematics, foot mechanics, and physics skills without waiting for user prompts.',
    skillsInvoked: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 37, 38, 41],
  },
  {
    step: 3,
    title: 'Map Center of Mass & Support Base Trajectory',
    detail: 'Plot Pelvis (Node 0) X/Y waves, ground contact pins, and weight-transfer support polygons across all acts.',
    skillsInvoked: [3, 4, 7, 27, 35, 39],
  },
  {
    step: 4,
    title: 'Author Golden Storytelling Poses',
    detail: 'Construct anatomically grounded key poses (Equilibrium, Anticipation, Chamber, Extension, Impact, Settle).',
    skillsInvoked: [2, 16, 17, 25, 29, 35],
  },
  {
    step: 5,
    title: 'Solve Major Limbs Using Kinematic Principles (IK/FK)',
    detail: 'Solve HIP→KNEE→ANKLE→FOOT and SHOULDER→ELBOW→WRIST→HAND via 2-bone analytical IK with strict hinge limits.',
    skillsInvoked: [6, 9, 36, 37, 38],
  },
  {
    step: 6,
    title: 'Establish Full-Body Biomechanics & Counter-Motion',
    detail: 'Coordinate pelvis tilt, spinal C-curve, opposite arm counter-swing, and secondary support struts.',
    skillsInvoked: [7, 8, 9, 26, 31, 43],
  },
  {
    step: 7,
    title: 'Build Arc-Preserving Breakdowns & Transitions',
    detail: 'Lead transitions with proximal joints (hips, knees, elbows) while trailing distal extremities along curved arcs.',
    skillsInvoked: [6, 11, 29, 30, 42],
  },
  {
    step: 8,
    title: 'Sculpt Non-Linear Timing, Spacing & Easing',
    detail: 'Apply Ease-Out acceleration, ballistic/whip velocity peaks, hit-stop holds, and Ease-In damping.',
    skillsInvoked: [12, 13, 18, 19, 20, 22, 23],
  },
  {
    step: 9,
    title: 'Add Procedural Secondary Motion & Inertial Lag',
    detail: 'Apply Verlet integration and spring-damper equations for head stabilization, arm follow-through, and settle.',
    skillsInvoked: [10, 14, 15, 26, 44, 45, 46],
  },
  {
    step: 10,
    title: 'Audit Human Anatomy & Hinge Polarity',
    detail: 'Verify 0° backward knee/elbow hyperextension relative to character facing direction and natural spine distribution.',
    skillsInvoked: [2, 6, 8, 34],
  },
  {
    step: 11,
    title: 'Audit Balance, Weight Transfer & Pelvis Wave',
    detail: 'Verify COM support alignment, pelvis absorption dip on contact, and counter-lean during kicks.',
    skillsInvoked: [3, 4, 7, 39],
  },
  {
    step: 12,
    title: 'Audit Foot Mechanics & Ground Contact Pinning',
    detail: 'Verify heel-strike, flat-foot world X/Y lock (zero skating), heel-to-toe roll, toe-off, and swing clearance.',
    skillsInvoked: [5, 27, 39, 40],
  },
  {
    step: 13,
    title: 'Audit Motion Arcs & Frame-to-Frame Continuity',
    detail: 'Trace world-space extremity trajectories and verify unwrapped relative angles (zero ±180° seam flips).',
    skillsInvoked: [11, 21, 28, 30],
  },
  {
    step: 14,
    title: 'Execute Automated 10-Domain Quality-Control Gate',
    detail: 'Run quantitative biomechanical diagnostics across all frames and joints.',
    skillsInvoked: [33],
  },
  {
    step: 15,
    title: 'Run Silhouette & Unified Body Test (Final Gate)',
    detail: 'Verify that silhouette reads as a living human and motion reads as a unified body, not separate algorithm segments.',
    skillsInvoked: [1, 24, 33],
  },
];

// =============================================================================
// PROGRAMMATIC KINEMATICS, IK SOLVERS & SKELETAL ENGINE
// =============================================================================
