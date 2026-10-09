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
  | 'Quality Assurance'
  | 'General Physics & Load Intelligence'
  | 'Physics & Scientific Mass Variations'
  | 'Kinetic & Potential Energy Dynamics'
  | 'Density, Fluid Forces & Environmental Probability'
  | 'Quantum Physics & Skill Acquisition';

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
  {
    id: 'general-physics-intelligence',
    name: '9. General Physics & Biomechanical Intelligence',
    description: 'General-purpose mass ratios, lever-arm torque dynamics, Hof dynamic balance, momentum braking, multi-entity physical causality, scientific mass variations, kinetic/potential energy, and density/fluid/environmental dynamics.',
    skills: [54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83],
    autoInvokes: ['anatomy', 'kinematics', 'balance', 'spatial-interaction'],
    subBranches: [
      {
        id: 'physics-mass-torque',
        name: 'Mass, Load & Torque Mechanics',
        description: 'Relative mass ratios (μ), lever-arm moments (τ = r × F), and postural counter-lean compensation.',
        skills: [54],
        autoInvokes: [],
      },
      {
        id: 'physics-balance-momentum',
        name: 'Dynamic Balance & Momentum Dynamics',
        description: 'Extrapolated CoM stability, ankle/hip/stepping recovery, rotational inertia, and non-linear braking ramps.',
        skills: [55, 56],
        autoInvokes: [],
      },
      {
        id: 'physics-causality-reactions',
        name: 'Causality, Force Reaction & Continuity',
        description: 'Newtonian force chains, compliant impact absorption, C1 transition splines, and anti-reset continuity.',
        skills: [57, 58, 59, 60, 61, 62],
        autoInvokes: [],
      },
      {
        id: 'physics-audit',
        name: '7-Domain Biomechanical Audit Gate',
        description: 'Quantitative physical critic measuring bone invariance, knee polarity, contact slip, and torque proportionality.',
        skills: [63],
        autoInvokes: [],
      },
      {
        id: 'physics-scientific-mass-variations',
        name: 'Physics & Scientific Mass Variations',
        description: 'Inertial Mass (F=ma), Gravitational Mass (active/passive & Weak Equivalence Principle), Rest Mass (Invariant Mass & E=mc²), Relativistic Mass (Lorentz γ), and Sub-Category Scientific Mass Variations (Reduced μ, Added m_added, Effective m*).',
        skills: [64, 65, 66, 67, 68],
        autoInvokes: [],
      },
      {
        id: 'physics-kinetic-potential-energy',
        name: 'Kinetic & Potential Energy Dynamics',
        description: 'Translational (KE=0.5mv²), Rotational (KE=0.5Iω²), Vibrational KE, Gravitational (PE=mgh), Elastic (PE=0.5kx²), Chemical, Electrostatic/Nuclear PE, and Conservation Laws.',
        skills: [69, 70, 71, 72, 73, 74, 75, 76],
        autoInvokes: [],
      },
      {
        id: 'density-fluid-forces-environment',
        name: 'Density, Fluid Forces & Environmental Probability',
        description: 'Matter Density (ρ=m/V), Buoyant Upthrust (F_b=ρgV), Hydrostatic Pressure (P=P_0+ρgh), Sinking/Floating Equilibrium, Force Density (f=F/V), Environmental Variables, and Environmental Probability distributions.',
        skills: [77, 78, 79, 80, 81, 82, 83],
        autoInvokes: [],
      },
      {
        id: 'quantum-physics-skill-acquisition',
        name: 'Quantum Physics & Skill Acquisition',
        description: 'Wave-Particle Duality, Superposition (Beginner\'s Mind), Heisenberg Uncertainty (Overthinking / Choking), Quantum Entanglement (Skill Transfer), Quantum Tunneling, Quantum Leaps, Quantum Coherence, and Quantum Parallel Computing.',
        skills: [84, 85, 86, 87, 88, 89, 90, 91],
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
  {
    id: 54,
    slug: 'mass-load-force-interaction',
    name: '54. Mass, Load & External Force Interaction',
    category: 'General Physics & Load Intelligence',
    priority: 'CRITICAL',
    summary:
      'Models mass ratios (μ = M_obj / M_char), lever-arm moments (τ = r × F), and proportional whole-body counter-lean across lifting, carrying, pushing, and pulling.',
    causalQuestion: 'How does the external object mass and moment arm alter the character’s muscular torque demands and whole-body posture?',
    biomechanicalRules: [
      'Weight is never treated as a scalar alone; rotational torque demand τ = leverArmX × F_load governs postural compensation.',
      'A heavy load (μ > 0.35) or far hold (> 50px) requires proportional backward or lateral spinal counter-lean and pelvic displacement.',
      'Force chains propagate through the whole articulated skeleton: feet, legs, core, shoulders, and arms participate in push/pull/lift.',
    ],
    failureModesPrevented: [
      'Weightless lifting where a character picks up a massive boulder with unchanged upright posture',
      'Lifting or pushing through isolated floating hand coordinates with no ground reaction participation',
    ],
    verificationMetrics: [
      'Spinal counter-lean angle scales proportionally with torque demand (R² >= 0.88)',
      'Ground reaction force equals (M_char + M_obj) × g across grounded stance limbs',
    ],
  },
  {
    id: 55,
    slug: 'dynamic-balance-recovery',
    name: '55. Dynamic Balance & Recovery Strategy',
    category: 'General Physics & Load Intelligence',
    priority: 'CRITICAL',
    summary:
      'Evaluates dynamic stability via Hof Extrapolated Center of Mass (XCoM) and selects authentic recovery actions: ankle torque, hip shear, arm counterbalance, or emergency stumble steps.',
    causalQuestion: 'When perturbed by forces or movement, which biomechanical recovery strategy restores equilibrium?',
    biomechanicalRules: [
      'Static equilibrium requires CoM inside Base of Support; dynamic equilibrium requires Extrapolated CoM inside Base of Support.',
      'Minor perturbations (|ΔX| < 15px) trigger ankle strategy; moderate perturbations (15–35px) trigger hip strategy; severe perturbations (> 35px) trigger stepping recovery.',
      'Controlled instability must emerge from physical causes, not frame-to-frame random jitter.',
    ],
    failureModesPrevented: [
      'Characters tipping over without reactive compensation',
      'Artificial jitter or shaking used as a substitute for real biomechanical balance recovery',
    ],
    verificationMetrics: [
      'Extrapolated CoM tracked per frame against support polygon boundaries',
      'Perturbations > 35px initiate verified recovery footfall target solving',
    ],
  },
  {
    id: 56,
    slug: 'momentum-dynamics',
    name: '56. Momentum Dynamics & Kinetic Transfer',
    category: 'General Physics & Load Intelligence',
    priority: 'HIGH',
    summary:
      'Enforces linear momentum conservation, rotational inertia modulation, non-linear braking deceleration ramps, and pelvic-thoracic counter-rotation.',
    causalQuestion: 'How does the character preserve or dissipate momentum without physically impossible velocity snaps?',
    biomechanicalRules: [
      'A character moving left cannot switch to moving right on a single frame; directional reversals require at least a 3-frame braking ramp (10:6:3:1).',
      'Power in athletic strikes and throws transfers sequentially from proximal heavy segments (legs/hips) to distal light segments (hands/feet).',
      'Pelvic rotation drives anti-phase thoracic counter-rotation to conserve vertical spinal angular momentum.',
    ],
    failureModesPrevented: [
      'Instantaneous velocity snaps and abrupt momentum teleportation',
      'Robotic plank-wood torso where shoulders and hips rotate identically',
    ],
    verificationMetrics: [
      'C1 continuous root velocity progression with max acceleration <= 40 px/f²',
      'Measurable phase lag between proximal pelvic peak velocity and distal extremity peak velocity',
    ],
  },
  {
    id: 57,
    slug: 'motion-intent-and-causality',
    name: '57. Motion Intent & Causality Pipeline',
    category: 'General Physics & Load Intelligence',
    priority: 'CRITICAL',
    summary:
      'Governs movement as a causal progression: Intent → Cause → Forces/Torques → Momentum → CoM → Contact → Whole-Body Reaction → Kinematics → Audit.',
    causalQuestion: 'What physical cause made this specific joint configuration and world displacement physically necessary on this frame?',
    biomechanicalRules: [
      'Every significant joint movement must have an understandable mechanical cause.',
      'High-level narrative intent decomposes deterministically into Anticipation, Drive, Contact, Recoil, and Settle phases.',
      'Eliminates arbitrary coordinate placing in favor of physically motivated body reactions.',
    ],
    failureModesPrevented: [
      'Arbitrary keyframe placement with zero physical motivation',
      'Uncaused joint twitching and disjointed pose collections',
    ],
    verificationMetrics: [
      '100% of frames trace back to active causal action phases and force vectors',
      'Zero uncaused coordinate jumps > 5px across non-ballistic phases',
    ],
  },
  {
    id: 58,
    slug: 'force-reaction-followthrough',
    name: '58. Force Reaction & Follow-Through',
    category: 'General Physics & Load Intelligence',
    priority: 'HIGH',
    summary:
      'Applies Newton’s Third Law across the articulated kinetic tree, modeling athletic whiplash recoil, landing compression cushioning, and staggered follow-through.',
    causalQuestion: 'How does the reaction force from this strike, jump, or catch propagate back through the body?',
    biomechanicalRules: [
      'Maximum kicking or throwing velocity induces backward recoil in the upper torso to conserve momentum.',
      'High falls or jump landings absorb kinetic energy via multi-joint compression (knees flex +30–50°, pelvis drops 18–36px).',
      'Free extremities lag primary drivers by 1–3 frames and settle via damped harmonic oscillation.',
    ],
    failureModesPrevented: [
      'Weightless kicking where the torso stays completely motionless during a high-speed strike',
      'Rigid-legged jump landings with zero knee compression',
    ],
    verificationMetrics: [
      'Torso backward recoil angle >= 6.0° during maximum strike acceleration',
      'Pelvis compression depth >= 12px on high-velocity touchdowns',
    ],
  },
  {
    id: 59,
    slug: 'temporal-motion-timing',
    name: '59. Temporal Motion & Kinetic Timing',
    category: 'General Physics & Load Intelligence',
    priority: 'HIGH',
    summary:
      'Decouples action choreography from fixed frame counts; applies non-linear quintic easing curves, anticipation spacing, impact hit-stop holds, and organic moving holds.',
    causalQuestion: 'Does the action duration match physical reality, and does the timing reflect genuine acceleration curves?',
    biomechanicalRules: [
      '24 FPS represents sample rate, not a mandate that every animation must last 24 frames.',
      'Acceleration phases follow non-linear easing (1:3:7:12:18 launch; 18:12:7:3:1 braking).',
      'Living human characters must preserve organic micromotions; zero dead freezes exceeding 6 consecutive frames.',
    ],
    failureModesPrevented: [
      'Robotic linear interpolation between poses',
      'Frozen mannequin characters in moving holds',
    ],
    verificationMetrics: [
      'Monotonically increasing spacing during drive phases',
      'Zero frozen frames > 6 consecutive frames in living characters',
    ],
  },
  {
    id: 60,
    slug: 'motion-transition-continuity',
    name: '60. Motion Transition Continuity',
    category: 'General Physics & Load Intelligence',
    priority: 'CRITICAL',
    summary:
      'Abolishes robotic "freeze-and-reset" poses between activities; blends action boundaries via cubic Hermite splines preserving residual momentum and contact anchors.',
    causalQuestion: 'Does Action B emerge seamlessly from the residual momentum and foot placement of Action A?',
    biomechanicalRules: [
      'A living character never resets to a neutral T-pose between activities.',
      'State buffers (root velocity, joint angles, angular momentum) are preserved across phase boundaries.',
      'Cubic Hermite splines guarantee C1 velocity continuity across transition seams.',
    ],
    failureModesPrevented: [
      'Abrupt pose snapping at action boundaries',
      'Foot popping or elevation resets between movements',
    ],
    verificationMetrics: [
      'Max angular delta <= 25°/frame across transition seams',
      'Planted stance foot drift < 0.5px during action handoffs',
    ],
  },
  {
    id: 61,
    slug: 'general-interaction',
    name: '61. General Multi-Entity Interaction',
    category: 'General Physics & Load Intelligence',
    priority: 'CRITICAL',
    summary:
      'Maintains unified world-space simulation for Character-Character, Character-Object, Character-Terrain, and Object-Object physical engagements.',
    causalQuestion: 'Do all participating characters, objects, and props interact in one shared world coordinate system?',
    biomechanicalRules: [
      'All scene participants share the master scene origin and ground plane (Y = 755.0px).',
      'Props transition cleanly between FREE, HELD, RESTING, and IMPACTING states with exact contact precision.',
      'Multi-character cooperative actions synchronize support forces and ground advancement.',
    ],
    failureModesPrevented: [
      'Props floating or disconnecting from character hands',
      'Characters interacting across incompatible elevations or ground planes',
    ],
    verificationMetrics: [
      'Hand-to-object contact delta <= 1.5px during HELD state',
      '100% of grounded actors share Y_ground within 1.0px',
    ],
  },
  {
    id: 62,
    slug: 'motion-variation-and-natural-asymmetry',
    name: '62. Natural Asymmetry & Organic Variation',
    category: 'General Physics & Load Intelligence',
    priority: 'STANDARD',
    summary:
      'Derives authentic bilateral asymmetry and organic movement variation from physical causes (load bias, lead stance, gait phase offset) without random noise.',
    causalQuestion: 'Is the bilateral asymmetry motivated by real physical forces rather than artificial random jitter?',
    biomechanicalRules: [
      'Never twin left and right limbs into identical robotic mirror copies unless strictly intentional.',
      'Asymmetry emerges from dominant lead stance, carried loads, and arm pendulum phase offsets.',
      'All procedural variation must be deterministic and physically justifiable.',
    ],
    failureModesPrevented: [
      'Robotic bilateral twinning and synchronized mirror movements',
      'Vibrating stickfigures caused by unseeded random noise',
    ],
    verificationMetrics: [
      'Bilateral limb angular separation >= 3.0° during locomotion and idle stances',
      '100% deterministic frame generation across multiple runs',
    ],
  },
  {
    id: 63,
    slug: 'biomechanical-audit',
    name: '63. 7-Domain Biomechanical Audit Gate',
    category: 'General Physics & Load Intelligence',
    priority: 'CRITICAL',
    summary:
      'Autonomous quantitative critic verifying structural anatomy, motion continuity, dynamic balance, ground contact, load leverage, interaction precision, and temporal spacing.',
    causalQuestion: 'Does the animation pass all 7 quantitative physical verification domains with verifiable numeric proof?',
    biomechanicalRules: [
      'Evaluates bone length invariance, knee 1-DOF polarity (0° hyperextension), stance pinning, torque-lean proportionality, and contact precision.',
      'Generates actionable PASS / WARNING / FAIL verdicts with numeric diagnostic telemetry.',
      'Acts as an automated quality gate preventing defective motion from reaching export.',
    ],
    failureModesPrevented: [
      'Silent export of broken, hyperextended, or sliding animations',
      'Unverified animations that pass superficial container checks but fail biomechanically',
    ],
    verificationMetrics: [
      '7/7 audit domains evaluated with numeric scores',
      'Overall Biomechanical Score >= 90/100 required for full certification',
    ],
  },
  {
    id: 64,
    slug: 'inertial-mass-dynamics',
    name: '64. Inertial Mass & Force Acceleration Dynamics',
    category: 'Physics & Scientific Mass Variations',
    priority: 'CRITICAL',
    summary:
      'Quantifies an object\'s resistance to linear acceleration (F = ma) and rotational angular acceleration (τ = I α) under applied forces and torques.',
    causalQuestion: 'How much net force and torque is required to accelerate or decelerate an object of given inertial mass?',
    biomechanicalRules: [
      'Translational acceleration scales inversely with inertial mass: a = F / m_i.',
      'Linear momentum (p = m_i v) dictates impulse energy transfer during collisions and push/pull actions.',
      'Rotational moment of inertia scales with distance squared (I = m_i r²); tucking limbs reduces I, accelerating spin rates.',
    ],
    failureModesPrevented: [
      'Instantaneous acceleration without force application',
      'Heavy and light objects accelerating identically under equal applied force',
    ],
    verificationMetrics: [
      'Translational acceleration verified against a = F / m_i within float precision',
      'Rotational spin rate scales proportionally with moment of inertia changes',
    ],
  },
  {
    id: 65,
    slug: 'gravitational-mass-equivalence',
    name: '65. Gravitational Mass & Equivalence Principle',
    category: 'Physics & Scientific Mass Variations',
    priority: 'CRITICAL',
    summary:
      'Governs active and passive gravitational mass attraction, local weight force (W = m_g g), and the Weak Equivalence Principle (m_i = m_g).',
    causalQuestion: 'Does gravitational attraction scale with mass while preserving uniform freefall acceleration in vacuum?',
    biomechanicalRules: [
      'Passive gravitational mass responds to external gravitational fields; local weight force equals W = m_g g.',
      'Active gravitational mass generates central gravitational attraction fields (F_g = G M m / r²).',
      'Weak Equivalence Principle dictates m_i = m_g, causing all objects to fall at identical acceleration g in vacuum.',
    ],
    failureModesPrevented: [
      'Mass-dependent freefall speeds in gravitational vacuum',
      'Violation of local weight force proportionality',
    ],
    verificationMetrics: [
      'Equivalence ratio |m_i / m_g - 1.0| < 1e-12 in vacuum gravity simulations',
      '100% synchronous freefall displacement for unequal masses in vacuum',
    ],
  },
  {
    id: 66,
    slug: 'rest-mass-invariant-equivalence',
    name: '66. Rest Mass (Invariant Mass) & Mass-Energy Equivalence',
    category: 'Physics & Scientific Mass Variations',
    priority: 'HIGH',
    summary:
      'Defines intrinsic rest frame mass m_0, mass-energy equivalence (E_0 = m_0 c²), multi-particle system invariant mass, and binding mass defect.',
    causalQuestion: 'What is the frame-independent intrinsic mass and rest energy of the system, and how is mass defect conserved?',
    biomechanicalRules: [
      'Rest mass m_0 is measured in the object\'s own center-of-momentum frame (v = 0) and remains constant across all inertial frames.',
      'Rest mass converts directly to rest energy via Einstein\'s relation E_0 = m_0 c².',
      'System invariant mass M_inv is conserved in closed particle systems: M_inv² c⁴ = (Σ E)² - ||Σ p c||².',
    ],
    failureModesPrevented: [
      'Frame-dependent rest mass corruption',
      'Non-conservation of multi-particle system invariant mass',
    ],
    verificationMetrics: [
      'Invariant mass M_inv preserved strictly across Lorentz coordinate transformations',
      'Mass-energy conversion verified against E_0 = m_0 c²',
    ],
  },
  {
    id: 67,
    slug: 'relativistic-mass-lorentz-dynamics',
    name: '67. Relativistic Mass & Lorentz Velocity Dynamics',
    category: 'Physics & Scientific Mass Variations',
    priority: 'HIGH',
    summary:
      'Models velocity-dependent mass expansion (m_rel = γ m_0), Lorentz factor scaling, relativistic momentum, and total energy near light speed.',
    causalQuestion: 'How does an object\'s effective mass and resistance to acceleration increase non-linearly as its velocity approaches c?',
    biomechanicalRules: [
      'Relativistic mass expands with velocity according to m_rel(v) = γ(v) m_0, where Lorentz factor γ = 1 / √(1 - v²/c²).',
      'Relativistic momentum equals p = γ m_0 v, and total relativistic energy equals E = γ m_0 c².',
      'As v → c, Lorentz factor γ → ∞, making it impossible for massive bodies to reach or exceed light speed c.',
    ],
    failureModesPrevented: [
      'Superluminal movement of massive objects (v >= c)',
      'Linear force-acceleration behavior at near-relativistic velocities',
    ],
    verificationMetrics: [
      'Lorentz factor γ calculated continuously for high-velocity entities',
      'Relativistic momentum and energy satisfied via E² = p²c² + m_0²c⁴',
    ],
  },
  {
    id: 68,
    slug: 'scientific-mass-subcategories',
    name: '68. Scientific Variations & Sub-Categories of Mass',
    category: 'Physics & Scientific Mass Variations',
    priority: 'HIGH',
    summary:
      'Formulates specialized scientific mass variations: Reduced Mass (μ) in two-body systems, Hydrodynamic Added Mass (m_added) in fluid media, and Effective Mass (m*).',
    causalQuestion: 'How do coupled two-body systems and surrounding media alter the effective mass during physical interactions?',
    biomechanicalRules: [
      'Two-body orbital and collision systems reduce to an equivalent single-body problem via reduced mass μ = m_1 m_2 / (m_1 + m_2).',
      'Objects accelerating through fluids experience hydrodynamic added mass m_added = C_v ρ V, increasing effective inertial mass to m_0 + m_added.',
      'Condensed matter and lattice interactions modify charge transport via effective quantum mass m*.',
    ],
    failureModesPrevented: [
      'Ignoring fluid displaced mass during aquatic character movement',
      'Inaccurate two-body orbital or collision trajectory calculations',
    ],
    verificationMetrics: [
      'Reduced mass μ calculated for 100% of paired entity interactions',
      'Fluid acceleration reflects effective virtual mass m_eff = m_0 + C_v ρ V',
    ],
  },
  {
    id: 69,
    slug: 'translational-kinetic-energy',
    name: '69. Translational Kinetic Energy & Linear Displacement Dynamics',
    category: 'Kinetic & Potential Energy Dynamics',
    priority: 'CRITICAL',
    summary:
      'Quantifies translational kinetic energy (KE_trans = 0.5 m v²) stored in the linear motion of entities and props across spatial trajectories.',
    causalQuestion: 'How much work must be performed by net forces to accelerate an entity of mass m to linear velocity v?',
    biomechanicalRules: [
      'Translational kinetic energy scales quadratically with linear velocity: KE_trans = 0.5 m v².',
      'Doubling speed requires quadrupling work input or braking absorption distance during deceleration.',
      'Linear momentum p = m v dictates impact force transfer during collisions.',
    ],
    failureModesPrevented: [
      'Linear velocity spikes without work application',
      'Equal stopping distances for slow vs fast moving entities',
    ],
    verificationMetrics: [
      'Kinetic energy verified against KE = 0.5 m v² within float precision',
      'Quadratic work-energy relation ΔKE = W_net satisfied',
    ],
  },
  {
    id: 70,
    slug: 'rotational-kinetic-energy',
    name: '70. Rotational Kinetic Energy & Axial Spin Mechanics',
    category: 'Kinetic & Potential Energy Dynamics',
    priority: 'CRITICAL',
    summary:
      'Measures rotational kinetic energy (KE_rot = 0.5 I ω²) of spinning bodies, torso axial twists, and weapon rotations.',
    causalQuestion: 'How much rotational torque and angular displacement is stored in a spinning body or prop?',
    biomechanicalRules: [
      'Rotational kinetic energy depends on rotational moment of inertia and angular velocity squared: KE_rot = 0.5 I ω².',
      'Tucking limbs reduces moment of inertia I, increasing angular spin rate ω while preserving angular momentum.',
      'Torque work W_rot = ∫ τ dθ converts directly into rotational kinetic energy.',
    ],
    failureModesPrevented: [
      'Constant spin rate when tucking or extending limbs in mid-air',
      'Rotational acceleration without applied torque or inertia change',
    ],
    verificationMetrics: [
      'Rotational KE verified against 0.5 I ω² within float precision',
      'Angular momentum L = I ω preserved during mid-air tucks',
    ],
  },
  {
    id: 71,
    slug: 'vibrational-kinetic-energy',
    name: '71. Vibrational Kinetic Energy & Oscillatory Structural Dynamics',
    category: 'Kinetic & Potential Energy Dynamics',
    priority: 'HIGH',
    summary:
      'Governs high-frequency vibrational kinetic oscillations (KE_vib = 0.5 k (A² - x²)) across flexible structures, apparel, and impact shockwaves.',
    causalQuestion: 'How does impact force dissipate into high-frequency structural vibration and harmonic decay?',
    biomechanicalRules: [
      'Vibrational kinetic energy converts back and forth with elastic potential energy during structural oscillations.',
      'Impact shockwaves induce exponentially damped harmonic vibration x(t) = A e^(-γt) cos(ωt).',
      'Flexible weapon shafts, apparel, and hair display anti-phase vibrational lag.',
    ],
    failureModesPrevented: [
      'Rigid non-vibrating impact landings',
      'Undamped infinite jitter without physical decay',
    ],
    verificationMetrics: [
      'Vibrational kinetic energy exchanges continuously with elastic potential energy',
      'Damping decay rate γ matches physical damping coefficient',
    ],
  },
  {
    id: 72,
    slug: 'gravitational-potential-energy',
    name: '72. Gravitational Potential Energy & Elevation Dynamics',
    category: 'Kinetic & Potential Energy Dynamics',
    priority: 'CRITICAL',
    summary:
      'Measures stored gravitational potential energy (PE_grav = mgh) based on elevation within a gravitational acceleration field.',
    causalQuestion: 'How much gravitational potential energy is accumulated at peak elevation, and how does it convert into kinetic fall speed?',
    biomechanicalRules: [
      'Gravitational potential energy scales linearly with height h and mass m: PE_grav = m g h.',
      'Freefall in a vacuum converts 100% of PE_grav into kinetic energy, reaching impact velocity v = √(2gh).',
      'In athletic jumping, apex elevation represents total initial vertical kinetic energy converted to PE.',
    ],
    failureModesPrevented: [
      'Falling faster or slower than gravitational freefall velocity v = √(2gh)',
      'Instantaneous upward elevation gains without work input',
    ],
    verificationMetrics: [
      'Gravitational PE verified against mgh within float precision',
      'Full PE-to-KE energy conversion verified during freefall',
    ],
  },
  {
    id: 73,
    slug: 'elastic-potential-energy',
    name: '73. Elastic Potential Energy & Deformable Material Mechanics',
    category: 'Kinetic & Potential Energy Dynamics',
    priority: 'HIGH',
    summary:
      'Governs energy stored in stretched or compressed materials, tendons, and springs (PE_elastic = 0.5 k x²).',
    causalQuestion: 'How much energy is stored during joint compression and released during explosive recoil?',
    biomechanicalRules: [
      'Elastic potential energy scales with spring constant k and displacement squared x²: PE_elastic = 0.5 k x².',
      'Pre-jump knee crouch stretches tendons, storing elastic potential energy released during takeoff drive.',
      'Impact landings deform material, converting kinetic impact energy into elastic potential compression.',
    ],
    failureModesPrevented: [
      'Explosive jumps without prior crouch deformation',
      'Rigid impact landings with zero material compliance',
    ],
    verificationMetrics: [
      'Elastic PE verified against 0.5 k x² within float precision',
      'Restorative Hooke force F = -kx opposes direction of deformation',
    ],
  },
  {
    id: 74,
    slug: 'chemical-electrostatic-nuclear-pe',
    name: '74. Chemical, Electrostatic & Nuclear Potential Energy',
    category: 'Kinetic & Potential Energy Dynamics',
    priority: 'HIGH',
    summary:
      'Models internal chemical bond energy, electrostatic charge potentials (k_e q1 q2 / r), and nuclear binding energy (Δm c²).',
    causalQuestion: 'How do internal molecular, electrostatic, and nuclear potential energies transform into macroscopic work and motion?',
    biomechanicalRules: [
      'Muscular contraction converts internal chemical potential energy (ATP hydrolysis) into mechanical kinetic work.',
      'Electrostatic potential energy governs electric charge interactions and field force attractions.',
      'Nuclear mass defect Δm converts to nuclear potential energy via E = Δm c².',
    ],
    failureModesPrevented: [
      'Uncaused muscular work without internal energy expenditure',
      'Field interactions violating inverse-distance electrostatic potential laws',
    ],
    verificationMetrics: [
      'Electrostatic PE satisfied via k_e q1 q2 / r within float precision',
      'Internal potential energy conversions satisfy global thermodynamic balance',
    ],
  },
  {
    id: 75,
    slug: 'law-of-conservation-of-energy',
    name: '75. Law of Conservation of Energy & Transformation Dynamics',
    category: 'Kinetic & Potential Energy Dynamics',
    priority: 'CRITICAL',
    summary:
      'Enforces the fundamental thermodynamic law that total energy in an isolated system remains strictly constant across all transformations.',
    causalQuestion: 'Does the sum of all kinetic, potential, thermal, and work energy terms remain conserved across every phase transition?',
    biomechanicalRules: [
      'Total energy cannot be created or destroyed: E_total = KE + PE + Q + W = constant.',
      'Frictional losses convert kinetic energy into thermal heat energy Q = F_f d.',
      'Energy input from muscular work strictly equals change in mechanical energy plus thermal dissipation.',
    ],
    failureModesPrevented: [
      'Spontaneous energy creation without work input',
      'Energy vanishing without conversion to potential, thermal, or work forms',
    ],
    verificationMetrics: [
      'Global energy conservation error margin |ΔE_total| < 1e-5 across all frames',
      '100% accounting for thermal and frictional dissipation terms',
    ],
  },
  {
    id: 76,
    slug: 'mechanical-energy-conservation',
    name: '76. Mechanical Energy Conservation & Phase Oscillations',
    category: 'Kinetic & Potential Energy Dynamics',
    priority: 'CRITICAL',
    summary:
      'Enforces conservation of mechanical energy (E_mech = KE + PE = constant) in conservative systems such as pendulums, bouncing balls, and jumps.',
    causalQuestion: 'How does mechanical energy continuously shift back and forth between kinetic motion and potential storage across dynamic phases?',
    biomechanicalRules: [
      'In ideal conservative systems without non-conservative friction, E_mech = KE_trans + KE_rot + PE_grav + PE_elastic = constant.',
      'At trajectory apex, vertical kinetic energy drops to zero while gravitational potential energy reaches maximum.',
      'At ground level, potential energy reaches zero while kinetic energy reaches maximum velocity.',
    ],
    failureModesPrevented: [
      'Asymmetric peak heights in frictionless bounce cycles',
      'Non-conservative energy gain or loss during ballistic parabolic flight',
    ],
    verificationMetrics: [
      'Mechanical energy invariance E_mech = constant verified to precision < 1e-6 in ideal phases',
      'Continuous smooth interchange between KE and PE curves',
    ],
  },
  {
    id: 77,
    slug: 'matter-density-volumetric-mass',
    name: '77. Matter Density & Volumetric Mass Distribution',
    category: 'Density, Fluid Forces & Environmental Probability',
    priority: 'CRITICAL',
    summary:
      'Quantifies matter density (ρ = m/V in kg/m³) as an intrinsic material scalar property distinct from force vectors.',
    causalQuestion: 'How tightly packed is the matter inside a character or prop, and how does its volume determine total mass?',
    biomechanicalRules: [
      'Density is calculated as ρ = m / V (kg/m³); it is a scalar property, not a force vector.',
      'Mass distribution across articulated body segments scales with individual segment densities and volumes.',
      'Higher density objects contain more mass per unit volume, increasing inertial resistance (F = ma).',
    ],
    failureModesPrevented: [
      'Confusing scalar density with vector force magnitudes',
      'Treating equal-volume objects as having identical mass regardless of material',
    ],
    verificationMetrics: [
      'Density calculation ρ = m / V verified within float precision',
      'Segment mass equals volume integral of density m = ∫ ρ dV',
    ],
  },
  {
    id: 78,
    slug: 'archimedes-buoyant-force',
    name: '78. Archimedes\' Buoyancy & Fluid Displaced Upthrust',
    category: 'Density, Fluid Forces & Environmental Probability',
    priority: 'CRITICAL',
    summary:
      'Calculates upward buoyant upthrust force (F_b = ρ_fluid g V_displaced) exerted on submerged or floating bodies according to Archimedes\' Principle.',
    causalQuestion: 'What upward buoyant force is generated by the volume of fluid displaced by a submerged object or character?',
    biomechanicalRules: [
      'Buoyancy is an upward force exerted by fluids: F_b = ρ_fluid · g · V_displaced.',
      'Buoyant force depends directly on fluid density ρ_fluid and displaced volume V_displaced, not on object mass.',
      'In denser fluids (e.g. seawater vs air), buoyant force is higher for the same submerged volume.',
    ],
    failureModesPrevented: [
      'Assuming buoyant force depends on object density rather than displaced fluid weight',
      'Zero buoyant forces acting on objects in fluid media',
    ],
    verificationMetrics: [
      'Buoyant force matches F_b = ρ_fluid · g · V_displaced within float precision',
      'Upward force scales linearly with submerged volume fraction',
    ],
  },
  {
    id: 79,
    slug: 'hydrostatic-pressure-depth-dynamics',
    name: '79. Hydrostatic Pressure & Depth Dynamics',
    category: 'Density, Fluid Forces & Environmental Probability',
    priority: 'HIGH',
    summary:
      'Governs depth-dependent isotropic compressive hydrostatic fluid pressure P(h) = P_0 + ρ_fluid g h.',
    causalQuestion: 'How does fluid pressure increase with submersion depth based on fluid density and gravity?',
    biomechanicalRules: [
      'Hydrostatic pressure increases linearly with depth: P(h) = P_0 + ρ_fluid · g · h.',
      'Pressure acts uniformly in all directions at a given depth (isotropic force distribution).',
      'Total absolute pressure combines surface atmospheric pressure P_0 with hydrostatic gauge pressure.',
    ],
    failureModesPrevented: [
      'Constant pressure regardless of fluid submersion depth',
      'Anisotropic directional pressure in static fluids',
    ],
    verificationMetrics: [
      'Pressure gradient dP/dh = ρ_fluid · g verified across fluid depths',
      'Gauge pressure scales linearly with submersion depth h',
    ],
  },
  {
    id: 80,
    slug: 'sinking-floating-equilibrium',
    name: '80. Sinking, Floating & Neutral Buoyancy Equilibrium',
    category: 'Density, Fluid Forces & Environmental Probability',
    priority: 'CRITICAL',
    summary:
      'Models equilibrium state transitions (sinking, floating, neutral suspension) based on relative object-to-fluid density ratios.',
    causalQuestion: 'Does an object sink, float, or remain neutrally suspended based on its density relative to the surrounding fluid?',
    biomechanicalRules: [
      'If ρ_obj > ρ_fluid: Weight exceeds maximum buoyancy (W > F_b), net downward force causes sinking.',
      'If ρ_obj < ρ_fluid: Object floats at equilibrium where submerged fraction equals ρ_obj / ρ_fluid.',
      'If ρ_obj = ρ_fluid: Neutral buoyancy is achieved, object remains suspended at any submersion depth.',
    ],
    failureModesPrevented: [
      'Objects with ρ_obj > ρ_fluid floating without applied external support',
      'Objects with ρ_obj < ρ_fluid sinking without added weight load',
    ],
    verificationMetrics: [
      'Submerged volume fraction matches ρ_obj / ρ_fluid for floating bodies',
      'Net force vector F_net = F_b - W verified in all three equilibrium states',
    ],
  },
  {
    id: 81,
    slug: 'continuum-force-density',
    name: '81. Continuum Mechanics Force Density (f = F/V)',
    category: 'Density, Fluid Forces & Environmental Probability',
    priority: 'HIGH',
    summary:
      'Models volumetric force field density distribution f = F / V (N/m³) across continuous fluid media and deformable bodies.',
    causalQuestion: 'What force per unit volume is distributed across a fluid region or continuous body segment?',
    biomechanicalRules: [
      'Force density f = F / V represents force distributed per unit volume (measured in N/m³).',
      'For body forces under uniform gravity, force density equals mass density times acceleration: f_g = ρ · g.',
      'In fluid mechanics, pressure gradient -∇P represents force density driving fluid flow.',
    ],
    failureModesPrevented: [
      'Confusing mass density (kg/m³) with force density (N/m³)',
      'Point-force application on continuous volumetric media',
    ],
    verificationMetrics: [
      'Force density f = F / V verified across continuous volume regions',
      'Gravitational force density f_g = ρ · g holds in uniform fields',
    ],
  },
  {
    id: 82,
    slug: 'environmental-variables-parameterization',
    name: '82. Environmental Variables & Fluid Medium Parameterization',
    category: 'Density, Fluid Forces & Environmental Probability',
    priority: 'HIGH',
    summary:
      'Parameterizes environmental state variables (fluid density, gravity, submersion depth, temperature, viscosity) governing fluid interactions.',
    causalQuestion: 'How do environmental medium variables govern the physical forces acting on characters and objects?',
    biomechanicalRules: [
      'Fluid medium parameters (ρ_fluid, g, h, T, μ_visc) define the environmental physics context.',
      'Changes in fluid medium (e.g. air to freshwater to seawater to oil) scale drag, buoyancy, and hydrostatic pressure.',
      'Gravity variations (Earth g = 9.81 m/s², Moon g = 1.62 m/s², Mars g = 3.72 m/s²) scale all gravitational weight forces.',
    ],
    failureModesPrevented: [
      'Hardcoded earth-air assumptions when animating aquatic or alien environments',
      'Uncalibrated fluid parameter discontinuities',
    ],
    verificationMetrics: [
      'Fluid interaction forces scale correctly across environmental parameter presets',
      'Viscous drag and buoyancy update dynamically with environmental variable changes',
    ],
  },
  {
    id: 83,
    slug: 'environmental-probability-stochastic-fluid',
    name: '83. Environmental Probability & Stochastic Fluid Perturbation',
    category: 'Density, Fluid Forces & Environmental Probability',
    priority: 'HIGH',
    summary:
      'Integrates stochastic probability distributions (Reynolds turbulence probability, wave surface fluctuations, sink/float state transitions) into fluid force modeling.',
    causalQuestion: 'What is the probability of turbulence, wave perturbation, or sink/float state transitions under environmental fluctuations?',
    biomechanicalRules: [
      'Turbulence probability scales with Reynolds Number Re = ρ v L / μ via stochastic transition curves.',
      'Wave action introduces probabilistic buoyant force fluctuations: F_b(t) = F_b_mean · (1 + σ_wave · N(0,1)).',
      'Sink/float transition probability peaks near neutral density balance (ρ_obj ≈ ρ_fluid) under fluid turbulence.',
    ],
    failureModesPrevented: [
      'Deterministic rigid fluid motion without natural wave and turbulence probability',
      'Abrupt unphysical state flipping without stochastic transition probabilities',
    ],
    verificationMetrics: [
      'Turbulence probability matches Reynolds number transition model',
      'Stochastic buoyant force variance matches expected environmental wave probability distribution',
    ],
  },
  {
    id: 84,
    slug: 'quantum-leaps-discrete-states',
    name: '84. Quantum Leaps & Discrete Skill States',
    category: 'Quantum Physics & Skill Acquisition',
    priority: 'CRITICAL',
    summary:
      'Governs non-linear skill acquisition characterized by extended performance plateaus punctuated by discrete, high-amplitude breakthroughs (ΔE = hν).',
    causalQuestion: 'Has the learner accumulated sufficient structural practice energy to trigger a discrete eigenstate quantum leap?',
    biomechanicalRules: [
      'Skill progression does not follow smooth continuous linear gradients.',
      'Frustrating plateaus represent neural state reorganization before discrete eigenstate snaps.',
      'Breakthrough energy transitions skip intermediate incomplete execution states.',
    ],
    failureModesPrevented: [
      'Assuming linear progress models for non-linear skill acquisition',
      'Abandoning practice during plateau state reorganization before energy threshold completion',
    ],
    verificationMetrics: [
      'Practice accumulation energy progress calculated continuously against leap threshold',
      'Discrete state transition executed upon reaching 100% threshold',
    ],
  },
  {
    id: 85,
    slug: 'superposition-beginners-mind',
    name: '85. Superposition & Beginner\'s Mind Potential',
    category: 'Quantum Physics & Skill Acquisition',
    priority: 'CRITICAL',
    summary:
      'Preserves a multi-dimensional state space (|ψ⟩ = Σ c_i |ϕ_i⟩) during initial learning, preventing premature over-specialization.',
    causalQuestion: 'Is the learner maintaining high entropy potential options before collapsing into a specific execution technique?',
    biomechanicalRules: [
      'Preserve multi-directional option space before premature technique specialization.',
      'High von Neumann entropy S(ρ) maximizes adaptability to dynamic environmental variations.',
      'Delayed state collapse yields broader skill transfer and creative problem-solving potential.',
    ],
    failureModesPrevented: [
      'Premature over-specialization collapsing option space early',
      'Rigid single-track execution incapable of handling novel scenarios',
    ],
    verificationMetrics: [
      'von Neumann entropy S(ρ) maintained above 0.8 during exploration phase',
      'State probabilities normalized so Σ |c_i|² = 1.0',
    ],
  },
  {
    id: 86,
    slug: 'wave-particle-duality-skill-execution',
    name: '86. Wave-Particle Duality in Skill Execution',
    category: 'Quantum Physics & Skill Acquisition',
    priority: 'CRITICAL',
    summary:
      'Balances fluid, intuitive adaptability (wave state λ = h/p) with precise, rigid macro-execution (particle state E = ℏω, p = ℏk).',
    causalQuestion: 'Does the character/learner transition seamlessly from fluid environmental reading (wave) to crisp strike execution (particle)?',
    biomechanicalRules: [
      'Pre-execution operates in fluid wave state to absorb unpredictable environmental dynamics.',
      'Execution collapses into particle state at impact frame for maximum momentum transfer.',
      'Mastery synthesizes both states rather than locking rigidly into one.',
    ],
    failureModesPrevented: [
      'Rigid particle execution in unpredictable dynamic environments',
      'Floppy wave execution lacking impact momentum density',
    ],
    verificationMetrics: [
      'Seamless mode shift from high wave adaptability to crisp particle impact precision',
      'Group velocity matching movement trajectory speed',
    ],
  },
  {
    id: 87,
    slug: 'observer-effect-performance-interference',
    name: '87. Observer Effect & Performance Interference (Overthinking)',
    category: 'Quantum Physics & Skill Acquisition',
    priority: 'CRITICAL',
    summary:
      'Models performance degradation caused by hyper-conscious micro-monitoring of automated motor programs (Δx · Δp ≥ ℏ/2).',
    causalQuestion: 'Does excessive conscious measurement disrupt automated muscle memory and cause choking?',
    biomechanicalRules: [
      'Hyper-focusing on joint position (Δx → 0) forces high momentum uncertainty (Δp → ∞).',
      'Conscious micro-monitoring disrupts automated cerebellar motor execution, causing hitching and choking.',
      'Peak performance requires releasing conscious observation into unhindered flow.',
    ],
    failureModesPrevented: [
      'Overthinking and micro-managing automated motor programs',
      'Performance choking under intense conscious inspection',
    ],
    verificationMetrics: [
      'Uncertainty product Δx · Δp verified against minimum ℏ/2 bound',
      'Choking risk telemetry calculated from micro-focus position uncertainty',
    ],
  },
  {
    id: 88,
    slug: 'quantum-entanglement-skill-transfer',
    name: '88. Quantum Entanglement & Interconnected Skill Transfer',
    category: 'Quantum Physics & Skill Acquisition',
    priority: 'HIGH',
    summary:
      'Quantifies non-local skill transfer where mastering one domain instantly elevates a structurally linked secondary domain (|Φ+⟩).',
    causalQuestion: 'How does mastering fundamental structural principles in Skill A elevate performance in entangled Skill B?',
    biomechanicalRules: [
      'Skills sharing deep structural invariants (rhythm, spatial timing, weight transfer) exhibit non-zero quantum mutual information.',
      'Mastering Skill A induces non-local transfer gains in Skill B without direct repetition in Skill B.',
      'Cross-domain elevation optimizes total learning efficiency across complex skill trees.',
    ],
    failureModesPrevented: [
      'Treating connected skills as isolated independent silos',
      'Wasting repetition on redundant skill mechanics already mastered in linked domains',
    ],
    verificationMetrics: [
      'Quantum mutual information I(A:B) > 0 for linked skill pairs',
      'Entanglement concurrence C(ρ) calculated across structural correlation matrix',
    ],
  },
  {
    id: 89,
    slug: 'quantum-tunneling-skill-barriers',
    name: '89. Quantum Tunneling Through Skill Barriers',
    category: 'Quantum Physics & Skill Acquisition',
    priority: 'HIGH',
    summary:
      'Governs overcoming seemingly insurmountable skill or creative barriers through probability density penetration (T ≈ e^(-2KL)).',
    causalQuestion: 'Can the learner tunnel through a high potential energy barrier despite having insufficient classical energy?',
    biomechanicalRules: [
      'When classical energy E < V_0, deep structural focus maintains non-zero wavefunction amplitude across the barrier.',
      'Tunneling allows breakthrough solutions without requiring brute-force energy scaling.',
      'Barrier transmission probability scales exponentially with barrier thickness and energy deficit.',
    ],
    failureModesPrevented: [
      'Giving up when classical energy is lower than perceived obstacle height',
      'Brute-force burnout against high technical skill barriers',
    ],
    verificationMetrics: [
      'Transmission coefficient T calculated via WKB approximation',
      'Non-zero breakthrough probability density maintained inside barrier',
    ],
  },
  {
    id: 90,
    slug: 'quantum-coherence-flow-retention',
    name: '90. Quantum Coherence, Decoherence & Flow Retention',
    category: 'Quantum Physics & Skill Acquisition',
    priority: 'HIGH',
    summary:
      'Measures flow state duration and environmental decoherence rate (τ_dec) during athletic and cognitive performance.',
    causalQuestion: 'How long can a character maintain phase-coherent flow before environmental noise causes decoherence?',
    biomechanicalRules: [
      'Flow state represents phase-coherent superposition of cognitive and motor states.',
      'Environmental distractions and anxiety induce rapid decoherence into chaotic classical attempts.',
      'Mindfulness and environmental isolation extend coherence time τ_dec.',
    ],
    failureModesPrevented: [
      'Rapid flow state decay caused by unmitigated environmental noise',
      'Decoherence collapsing smooth execution into disjointed erratic attempts',
    ],
    verificationMetrics: [
      'Decoherence timescale τ_dec tracked against environmental noise level',
      'Flow state purity score calculated continuously',
    ],
  },
  {
    id: 91,
    slug: 'quantum-parallel-computing-mental-exploration',
    name: '91. Quantum Parallel Computing & Mental Exploration',
    category: 'Quantum Physics & Skill Acquisition',
    priority: 'HIGH',
    summary:
      'Models parallel cognitive evaluation of multiple action trajectories via quantum superposition gates (H, QFT).',
    causalQuestion: 'How does parallel mental simulation evaluate 2^N option pathways simultaneously before initiating movement?',
    biomechanicalRules: [
      'Qubits and superposition gates evaluate 2^N option pathways simultaneously in parallel.',
      'Constructive mental interference amplifies optimal action vectors while cancelling high-risk paths.',
      'Provides quadratic (Grover √N) or exponential speedups in tactical strategy selection.',
    ],
    failureModesPrevented: [
      'Sequential trial-and-error bottlenecks during high-speed combat',
      'Suboptimal action selection caused by incomplete option space evaluation',
    ],
    verificationMetrics: [
      '2^N simultaneous state evaluation capacity verified for N qubits',
      'Grover speedup factor √N satisfied during option search',
    ],
  },
];

export const EXPANDED_91_MOTION_SKILLS = EXPANDED_46_MOTION_SKILLS;
export const EXPANDED_83_MOTION_SKILLS = EXPANDED_46_MOTION_SKILLS;
export const EXPANDED_76_MOTION_SKILLS = EXPANDED_46_MOTION_SKILLS;
export const EXPANDED_68_MOTION_SKILLS = EXPANDED_46_MOTION_SKILLS;
export const EXPANDED_63_MOTION_SKILLS = EXPANDED_46_MOTION_SKILLS;
export const EXPANDED_53_MOTION_SKILLS = EXPANDED_46_MOTION_SKILLS;
export const ALL_MOTION_SKILLS = EXPANDED_46_MOTION_SKILLS;

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
