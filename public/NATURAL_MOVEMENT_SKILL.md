---
name: "universal-human-motion-and-natural-movement"
version: "4.0.0"
description: >-
  Universal Human Motion, Biomechanics, Procedural Kinematics, and Spatial Consistency Framework
  integrating forward/inverse kinematics, procedural 2D character animation, physics-inspired
  secondary motion, Manim programmatic composition, OpenPose skeletal models, and multi-character
  spatial consistency, elevation tracking, strike-reach solving, and interaction synchronization.
---

# Universal Human Motion & Natural Animation Framework (v4.0)

## 1. External Technical Foundations & Integrated Research

This skill system synthesizes principles, algorithms, and structural models from open-source procedural animation, biomechanics, and spatial interaction research:

### 1.1 Forward & Inverse Kinematics (`axharb/forward-and-inverse-kinematics`)
- **Forward Kinematics (FK)**: Hierarchical propagation of coordinate frames down the kinematic tree:
  $$P_{child} = P_{parent} + R(\theta_{world}) \cdot L_{bone}$$
- **Analytical Two-Bone Inverse Kinematics (IK)**: Given root position $P_{root}$, target end-effector $P_{target}$, and bone lengths $L_1, L_2$:
  - Distance to target: $D = \text{clamp}(\|P_{target} - P_{root}\|, |L_1 - L_2| + \epsilon, L_1 + L_2 - \epsilon)$
  - Interior joint angle via Law of Cosines:
    $$\cos(\beta) = \frac{L_1^2 + L_2^2 - D^2}{2 L_1 L_2}$$
  - Root angle adjustment:
    $$\alpha = \text{atan2}(P_{target}.y - P_{root}.y, P_{target}.x - P_{root}.x) \pm \arccos\left(\frac{L_1^2 + D^2 - L_2^2}{2 L_1 D}\right)$$
- **Connected System Discipline**:
  - `HIP → KNEE → ANKLE → FOOT` and `SHOULDER → ELBOW → WRIST → HAND` are solved as coupled kinematic chains.
  - End-effector targeting never breaks parent-child continuity or introduces unnatural reverse bends.

### 1.2 Procedural 2D Character Animation (`mradovic38/ik-proc-anim-2d`)
- **Logic-Driven Locomotion**: Character decisions (e.g., "Step left foot to target $(X, Y)$") drive secondary body responses:
  - Pelvis vertical displacement follows a sinusoidal wave (dip on weight acceptance, rise on passing).
  - Standing leg IK solves dynamically to maintain ground contact ($Y_{ground} = \text{const}$).
  - Swing leg trajectory follows a cubic Bezier arc with clearance height and heel-strike orientation.
  - Torso counter-leans to preserve equilibrium.

### 1.3 Procedural Hyper-Motion & Physics (`cristhiandrm/2D-Procedural-Hyper-Motion-Controller`)
- **Verlet Integration for Secondary Motion**:
  $$x_{t+\Delta t} = 2 x_t - x_{t-\Delta t} + a_t \cdot \Delta t^2$$
- **Damped Harmonic Oscillators**: Secondary extremities (head, forearms, loose garments) lag primary impulses with natural spring damping:
  $$F = -k (x - x_0) - c \cdot v$$
- **Dynamic Squash & Stretch**: Volume-preserving deformation along velocity vectors:
  $$s_{\parallel} = 1 + \lambda \|\vec{v}\|, \quad s_{\perp} = \frac{1}{\sqrt{s_{\parallel}}}$$

### 1.4 Programmatic Animation Systems (`ManimCommunity/manim`)
- **Animation as Deterministic Composition**:
  $$\text{Animation} = \text{Reusable Operations} + \text{Timing Curves} + \text{Interpolation} + \text{State Transitions}$$
- Multi-phase actions ($\text{Walk} \to \text{Accelerate} \to \text{Jump} \to \text{Airborne} \to \text{Attack} \to \text{Fall} \to \text{Land} \to \text{Recover}$) blend smoothly using $C^1$-continuous cubic Hermite splines at phase boundaries.

### 1.5 Human Pose & Keypoint Reference (`CMU-Perceptual-Computing-Lab/openpose`)
- **Keypoint Topology**: Maps 18/25 body keypoints to Stick Nodes 17-node skeleton.
- **Biomechanical Mass Distribution**:
  - Pelvis & Abdomen: 42%
  - Thorax & Upper Chest: 26%
  - Head & Neck: 8%
  - Thighs: 10% (5% each)
  - Shins: 6% (3% each)
  - Feet: 2% (1% each)
  - Biceps: 3% (1.5% each)
  - Forearms & Hands: 3% (1.5% each)
- Pose is reasoned as: $\text{POSE} \to \text{JOINT RELATIONSHIPS} \to \text{TRAJECTORIES} \to \text{TIMING} \to \text{MOTION}$.

---

## 2. The Universal Skill Hierarchy (8 Branches, 53 Skills)

```
NATURAL HUMAN MOTION
│
├── Anatomy
│   ├── Joint Constraints (Skill #02)
│   ├── Limb Length (Skill #34)
│   └── Pose Structure & Reference (Skill #35)
│
├── Kinematics
│   ├── Forward Kinematics (Skill #36)
│   ├── Inverse Kinematics (Skill #37)
│   └── Kinematics & Limb Solving (Skill #38)
│
├── Balance
│   ├── Center of Mass (Skill #03)
│   ├── Weight Transfer (Skill #04)
│   └── Foot Support & Ground Pinning (Skill #27, #39)
│
├── Locomotion
│   ├── Walk Mechanics (Skill #40)
│   ├── Run Mechanics (Skill #20)
│   ├── Starting Movement (Skill #23)
│   ├── Stopping Mechanics (Skill #22)
│   ├── Turning Mechanics (Skill #21)
│   └── Procedural Character Motion (Skill #41)
│
├── Action
│   ├── Jump Mechanics (Skill #19)
│   ├── Landing Mechanics (Skill #18)
│   ├── Strike & Kick Mechanics (Skill #06, #17)
│   └── Impact & Force Absorption (Skill #17)
│
├── Motion Quality
│   ├── Arcs of Motion (Skill #11)
│   ├── Timing & Spacing (Skill #12)
│   ├── Acceleration & Deceleration (Skill #13)
│   ├── Pose & Motion Continuity (Skill #28, #30)
│   ├── Natural Asymmetry (Skill #25)
│   ├── Stylization Control (Skill #32)
│   └── Animation Composition (Skill #42)
│
├── Secondary Motion
│   ├── Momentum & Inertia (Skill #14)
│   ├── Follow-Through & Overlap (Skill #15)
│   ├── Dynamic Body Response (Skill #43)
│   ├── Squash & Stretch (Skill #44)
│   ├── Inertial Motion (Skill #45)
│   └── Procedural Secondary Motion (Skill #46)
│
└── Spatial Consistency & Interaction
    ├── Shared World Space & Master Scene Reference (Skill #47)
    ├── Ground Plane Alignment & Elevation Tracking (Skill #48)
    ├── Character Root & Hierarchical World Positioning (Skill #49)
    ├── Relative Distance & Strike Reach Solving (Skill #50)
    ├── Elevation Management & Platform Surfaces (Skill #51)
    ├── Temporal-Spatial Interaction Synchronization (Skill #52)
    └── Multi-Character Spatial Quality-Control Gate (Skill #53)
```

**Rule of Automatic Invocation**:
Higher-level action and interaction skills automatically invoke their dependent balance, kinematics, and anatomy skills. An author never specifies low-level joint angles when an action can be solved from physical intent.

---

## 3. The Reference-First Execution Workflow (12 Steps)

Before generating any complex movement sequence, execute these 12 steps:

1. **Establish Scene Reference Frame**: Define Master Ground Plane ($Y_{ground} = 755\text{px}$), viewport framing, orientation, and platform elevations.
2. **Determine Action & Intent**: Establish narrative intent, velocity, target endpoints, and emotional energy.
3. **Break into Physical Phases**: Segment motion into natural phases (Anticipation, Drive, Flight, Contact, Cushion, Recoil).
4. **Identify Supporting Surfaces & Grounding**: Lock stance limbs to $Y_{ground}$ or platform surfaces with zero vertical drift.
5. **Determine Center-of-Mass Trajectory**: Plot the $(X_{com}, Y_{com})$ curve before positioning individual bones.
6. **Author Storytelling Key Poses**: Establish golden poses (Equilibrium, Anticipation, Clash, Recoil, Settle).
7. **Solve Major Limbs Using Kinematics**:
   - Solve `HIP → KNEE → ANKLE → FOOT` via Analytical IK with knee polarity constraints.
   - Solve `SHOULDER → ELBOW → WRIST → HAND` via Analytical IK with anterior flexion constraints.
8. **Solve Strike Reach & Interaction Distances**: Compute whether strikes reach defender hitboxes ($\le 12\text{px}$) and advance Character Roots accordingly.
9. **Synchronize Interaction Timing**: Align attacker strike arrival with defender hit-stop freeze on the exact same frame, followed by directional recoil.
10. **Add Secondary Motion & Inertia**: Compute Verlet/inertial lag for head, torso counter-twist, and loose appendages.
11. **Run 10-Domain Spatial & Biomechanical QC**: Verify zero hyperextension, zero foot sliding, reach tolerance, and elevation stability.
12. **The Final Silhouette & Unified Body Test**:
    - *Question 1*: "If I removed colors and character design and watched only the silhouettes, would this still look like human characters performing the action?"
    - *Question 2*: "Do the characters share a physical world, or do they feel like floating cutouts placed at random heights?"
    - If NO to either: Rebuild the scene.

---

## 4. Comprehensive Skill Definitions (53 Skills)

### Master & Foundation
- **Skill 01: Natural Human Movement**: Master biological coordinator. Forces originate at core and propagate outward.
- **Skill 24: Gesture & Intent**: Poses convey clear emotion, gaze direction, and narrative motivation.
- **Skill 25: Natural Asymmetry**: Left and right limbs differ by $10^\circ..30^\circ$ to eliminate robotic twinning.

### Anatomical & Skeletal
- **Skill 02: Human Anatomy & Joint Constraints**: Knee 1-DOF polarity laws (0° hyperextension), anterior elbow limits, spine curvature distribution ($\le 35^\circ$ per segment).
- **Skill 34: Limb Length Preservation**: Invariant bone lengths resisting numerical stretching.
- **Skill 35: Human Pose Reference (OpenPose Mapping)**: 17-bone topological keypoints with realistic mass ratios.

### Kinematics & Limb Solving
- **Skill 36: Forward Kinematics (FK)**: Coordinate transformations down parent-child chains.
- **Skill 37: Inverse Kinematics (IK)**: Analytical Law of Cosines 2-bone solver.
- **Skill 38: Kinematics & Limb Solving**: Coupled leg and arm system solving preventing disjointed extremities.

### Balance & Mechanics
- **Skill 03: Balance & Center of Mass (COM)**: 17-segment weighted mass centroid relative to ground base.
- **Skill 04: Weight Transfer**: 6-stage unweighting and pelvic shift cycle.
- **Skill 05: Foot Mechanics & Ground Pinning**: Heel-strike, flat plant, heel-rise, toe-off.
- **Skill 27: Ground Contact & Pinning**: World coordinate locking without sliding ($< 2\text{px}$) or floating.
- **Skill 39: Foot Support & Planting**: Stance foot holds ground while pelvis translates forward.

### Locomotion & Action Mechanics
- **Skill 06: Knee Mechanics & Leg Kinematics**: Knee drives forward in swing while shin folds back.
- **Skill 07: Pelvis Mechanics**: Sinusoidal locomotion wave (±8px) and strike power source.
- **Skill 08: Spine Mechanics**: Progressive torso flex; lower spine leads upper chest.
- **Skill 09: Shoulder & Arm Counter-Motion**: Anti-phase arm swing balancing leg momentum.
- **Skill 10: Head Stabilization**: Gimbal neck stabilization keeping eye-line level.
- **Skill 16: Anticipation**: Counter-movement preceding explosive action.
- **Skill 17: Impact & Force Absorption**: Physical meeting $\to$ hit-stop freeze $\to$ recoil compression.
- **Skill 18: Landing Mechanics**: Touchdown compression dip ($+12..+24\text{px}$) and recovery.
- **Skill 19: Jump Mechanics**: Crouch $\to$ launch $\to$ decelerating ascent $\to$ apex $\to$ fall $\to$ landing.
- **Skill 20: Run Mechanics**: Forward lean ($65^\circ..78^\circ$), high rear heel fold, airborne flight.
- **Skill 21: Turning Mechanics**: Gaze leads turn $\to$ torso twists $\to$ pelvis turns $\to$ feet step.
- **Skill 22: Stopping Mechanics**: Lead foot plants ahead of COM into progressive braking.
- **Skill 23: Starting Movement**: COM leans forward before push-off foot extends.
- **Skill 40: Walk Mechanics**: Complete Contact $\to$ Down $\to$ Passing $\to$ Up cycle.
- **Skill 41: Procedural Character Motion**: Derives secondary joint positions from high-level footstep targets.

### Physics, Secondary & Inertia
- **Skill 14: Momentum & Inertia**: Energy propagation with natural damping settle.
- **Skill 15: Follow-Through & Overlapping Action**: 1–2 frame phase lag down parent-child chains.
- **Skill 26: Secondary Motion**: Dynamic reactions of non-primary elements.
- **Skill 31: Physics Awareness**: Momentum conservation, ground friction, and reaction force.
- **Skill 43: Dynamic Body Response**: Core reacts automatically to limb momentum.
- **Skill 44: Squash & Stretch**: Volume-preserving deformation ($s_{\parallel} \cdot s_{\perp}^2 \approx 1$).
- **Skill 45: Inertial Motion**: Mass-dependent harmonic settle decay $A_0 e^{-\gamma t} \cos(\omega t)$.
- **Skill 46: Procedural Secondary Motion**: Verlet integration for dangling chains and clothing.

### Timing, Composition & Arcs
- **Skill 11: Motion Arcs**: Smooth curvilinear joint trajectories without straight translation.
- **Skill 12: Timing & Spacing**: Non-linear frame distribution matching physical mass.
- **Skill 13: Acceleration & Deceleration**: Progressive velocity ramps ($1:3:6:10$ launch, $10:6:3:1$ brake).
- **Skill 28: Pose & Spatial Continuity**: Unwrapped joint angles across frames; 0 seam-flip glitches.
- **Skill 29: Pose-to-Pose & Breakdown Intelligence**: Key poses anchored first; breakdowns lead with proximal joints.
- **Skill 30: Motion Continuity**: Velocity vectors preserved across transitions.
- **Skill 32: Stylization Control**: Modulate timing contrast while preserving biological constraints.
- **Skill 42: Animation Composition**: Manim-inspired $C^1$-continuous multi-phase action chaining.

### Spatial Consistency & Interaction (The Spatial Framework)
- **Skill 47: Shared World Coordinate Space & Master Scene Reference**: Establishes a single, unbending master coordinate frame for all characters and objects before posing, eliminating disparate local origins.
- **Skill 48: Ground Plane Alignment & Elevation Tracking**: Locks grounded characters to $Y_{ground} = 755\text{px} \pm 2\text{px}$; eliminates upward/downward elevation drift across frames; returns jump landings to takeoff ground reference.
- **Skill 49: Character Root & Hierarchical World Positioning**: Drives whole-body movement through a dedicated Character Root; limbs solve relative to body rather than erratic global translation.
- **Skill 50: Relative Positioning & Strike Reach Solving**: Computes true geometric distance between characters and solves limb reach dynamically so strikes actually contact hitboxes ($\le 12\text{px}$) without missing by 100px.
- **Skill 51: Elevation Management & Platform Surfaces**: Explicitly tracks multi-tier surfaces, ledges, and crates so characters stand, walk, and land on authentic physical surfaces, falling to $Y_{ground}$ when displaced.
- **Skill 52: Temporal-Spatial Interaction Synchronization**: Synchronizes interacting characters in time and space: strike arrival frame triggers defender hit-stop freeze on the exact same frame, followed by directional recoil slide.
- **Skill 53: Multi-Character Spatial Quality-Control Gate**: 10-domain automated audit certifying shared ground, elevation stability, penetration prevention, strike reach, facing alignment, root continuity, scale uniformity, temporal sync, camera framing, and platform stability.

---

## 5. Spatial Consistency, Elevation & Character Interaction Architecture

### 5.1 Shared World Space & Master Scene Reference
In Stick Nodes (.stknds) coordinate architecture, scene positions are represented in a Cartesian system where positive X extends rightward and positive Y extends downward.

```
(0,0) TOP-LEFT VIEWPORT CORNER
┌────────────────────────────────────────────────────────┐
│                                                        │
│   Sky Corridor (Y = 120 .. 300 px)                    │
│                                                        │
│   Platform / Dais (Y = 620 px)                         │
│   [═════════════════]                                  │
│                                                        │
│   MASTER GROUND PLANE (Y = 755.0 px)                   │
└───┴────────────────────────────────────────────────┴───┘
```

**Cardinal Law of Scene Reference**:
No character or prop may be animated relative to an isolated local origin. Before placing frame 0:
1. Define $Y_{ground} = 755.0\text{px}$.
2. Character A standing pelvis: $Y = 510\text{px}$ (feet contact $Y = 755\text{px}$).
3. Character B seated pelvis: $Y = 726\text{px}$ (buttock base contacts $Y = 755\text{px}$).
4. Character C on Platform: $Y_{contact} = Y_{platform} = 620\text{px}$.

### 5.2 Ground Plane Elevation Tracking
To prevent floating or floor sinking:
- **Stance Pinning**: While bearing weight, foot contact point must satisfy $|Y_{foot} - Y_{ground}| \le 2.0\text{px}$.
- **Elevation Drift Zero-Tolerance**: A character standing for 10 frames must exhibit vertical pelvis variance $\sigma_Y < 1.0\text{px}$.
- **Ballistic Elevation Closure**: If a character launches into a jump from $Y_0$ and lands on the same ground surface, touchdown elevation $Y_{land}$ must satisfy $|Y_{land} - Y_0| \le 1.5\text{px}$.

### 5.3 Character Root & Hierarchical World Propagation
Motion propagates strictly downward through the hierarchy:
$$\text{WORLD ORIGIN} \xrightarrow{\vec{P}_{root}(t)} \text{CHARACTER ROOT} \xrightarrow{\vec{P}_{pelvis}} \text{PELVIS / SPINE} \xrightarrow{\theta_i} \text{LIMBS} \to \text{EXTREMITIES}$$

Individual limbs NEVER perform independent global translations to make a character traverse the scene. The Character Root translates continuously, while limbs solve relative to that root.

### 5.4 Strike Reach & Physical Hitbox Solving
When Character A attacks Character B:
$$\vec{P}_{strike} = \text{ForwardKinematics}(\vec{P}_{root}^A, \vec{\theta}^A)_{end\_effector}$$
$$\vec{P}_{target} = \text{ForwardKinematics}(\vec{P}_{root}^B, \vec{\theta}^B)_{hitbox}$$
$$\text{Distance} = \|\vec{P}_{strike} - \vec{P}_{target}\|$$

- **Physical Contact Threshold**: $\text{Distance} \le 12.0\text{px}$.
- **Dynamic Advance Requirement**: If the maximum geometric reach $L_{max} = (L_{upper} + L_{lower}) \cdot \text{scale}$ is less than the distance to target, the system MUST advance the Character Root forward:
  $$\Delta X_{root}^A = \text{sgn}(X_B - X_A) \cdot (\text{Distance} - L_{max} + 8\text{px})$$
- Never animate a defender flinching when $\text{Distance} > 20\text{px}$.

### 5.5 Temporal-Spatial Hit Synchronization
Impact exchanges follow strict frame timing:
- **Frame $T_{clash}$**: Attacker limb reaches maximum extension at Defender target.
- **Frame $T_{clash}$**: Defender registers contact in the **EXACT SAME FRAME**. Both characters execute a 1–2 frame **Hit-Stop Freeze** (velocity drops to zero to communicate solid impact density).
- **Frame $T_{clash} + 1$**: Defender receives recoil impulse proportional to attack force:
  $$\vec{P}_{root}^B(T+1) = \vec{P}_{root}^B(T) + \vec{v}_{recoil}$$
  For a heavy roundhouse kick, standard braced slide is $+4..+8\text{px}$ in the direction of the kick vector.

### 5.6 Shared Viewport Camera Framing
The virtual camera framing must consider ALL active characters:
$$X_{min} = \min_{i} (X_i^{root} - \text{margin}), \quad X_{max} = \max_{i} (X_i^{root} + \text{margin})$$
$$Y_{min} = \min_{i} (Y_i^{head} - \text{margin}), \quad Y_{max} = Y_{ground}$$
$$\text{camZoom} = \text{clamp}\left( \frac{\text{ViewportWidth}}{X_{max} - X_{min}}, 0.65, 2.35 \right)$$
$$\text{camX} = -\left( \frac{X_{min} + X_{max}}{2} - \text{CenterX} \right) \cdot \text{Factor}$$

Both characters remain fully in view during dialogue, standoff, combat, and recoil.

---

## 6. Case Study: "Speed vs Strength" (36-Frame Master Choreography)

The **Speed vs Strength** choreography serves as the canonical benchmark demonstrating the synthesis of all biomechanical motion rules with spatial consistency:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ SPEED VS STRENGTH 36-FRAME CHOREOGRAPHIC PIPELINE                                     │
├────────────┬─────────────────────────────────┬─────────────────────────────────────────┤
│ ACT        │ FRAMES & TIMING                 │ BIOMECHANICAL & SPATIAL LAWS            │
├────────────┼─────────────────────────────────┼─────────────────────────────────────────┤
│ 1. Standoff│ F00..F04 (5 frames)             │ CoM Lowering, Ground Plane Invariant    │
│ 2. Launch  │ F05..F08 (4 frames)             │ Slow-Out Spacing (+40px, +85px Drive)   │
│ 3. Burst   │ F09..F12 (4 frames)             │ Streamlined Torso, Zero Teleportation   │
│ 4. Pivot   │ F13..F16 (4 frames)             │ Kinetic Chain: Feet → Hips → Torso      │
│ 5. Strike  │ F17..F20 (4 frames)             │ Arc Trajectory Punch & Slip-Duck Evasion│
│ 6. Counter │ F21..F24 (4 frames)             │ Hip Torque → Side Kick Torso Contact    │
│ 7. Launch  │ F25..F31 (7 frames)             │ Parabolic Ballistic Arc from Clash Point│
│ 8. Settle  │ F32..F35 (4 frames)             │ Contrast: Agile Guard vs Grounded Recovery│
└────────────┴─────────────────────────────────┴─────────────────────────────────────────┘
```

### Biomechanical Laws Applied:
1. **Dynamic Spacing (True Physical Acceleration)**:
   - Frame 06 $\to$ 07: $+40\text{px}$ drive (anticipation slow-out)
   - Frame 07 $\to$ 08: $+85\text{px}$ sprint stride
   - Frame 08 $\to$ 09: $+125\text{px}$ streamlined torpedo pass
   - Frame 09 $\to$ 10: $+120\text{px}$ flash pass directly beside B (X=765px)
   - Frame 11 $\to$ 12: High-speed brake plant into friction deceleration.
2. **Kinetic Chain Staggered Rotation**:
   - Heavy Character B does NOT rotate instantaneously.
   - Frame 13: Feet plant heavily into ground plane ($Y = 755\text{px}$).
   - Frame 14: Hips rotate $180^\circ$ ($+5\text{px}$ inertia lag).
   - Frame 15: Torso and heavy spine rotate toward A.
   - Frame 16: Shoulders roll and heavy arm retracts into maximum punch coil.
3. **Physical Arc Strike & Slip Evasion**:
   - B's fist sweeps along a clean $140^\circ$ arc centered at chest elevation ($Y \approx 460\text{px}$).
   - A recognizes the strike and dips into a duck slip ($Y_{pelvis} = 542\text{px}$, head drops to $Y = 492\text{px}$), slipping safely beneath the fist.
   - B's momentum carries his upper body forward, over-extending his stance and leaving his ribs exposed.
4. **Counter Strike Biomechanics**:
   - A plants the support foot firmly on $Y = 755\text{px}$.
   - Hip torques backwards, chambering the kicking knee high (Thigh $+142^\circ$, Shin $+48^\circ$).
   - Leg extends linearly into B's ribs at coordinate $(860, 520)$.
   - Frame 24: Direct physical contact with 1-frame impact compression (squash) and hit-stop freeze.
5. **Ballistic Impulse Trajectory**:
   - Launch vector originates directly from contact point $(X=860, Y=525)$.
   - Flight path follows a true quadratic gravity parabola:
     $$X(t) = 840 - 75 \cdot t, \quad Y(t) = 520 - 90 \cdot \sin(\pi \cdot t / 5)$$
   - Apex occurs at Frame 27: $(X=675, Y=430)$.
   - Touchdown occurs at Frame 30: Boots hit $Y = 755\text{px}$ ($X=335$) with deep knee compression.
   - Skid slide decelerates B along the ground plane to rest at $X=250\text{px}$.

