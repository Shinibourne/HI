---
name: "universal-human-motion-and-natural-movement"
version: "2.0.0"
description: >-
  Universal, medium-independent 33-skill human biomechanics and professional
  animation framework. Automatically governs character movement across Stick Nodes
  (.stknds), 2D skeletal rigs, 3D keyframe animation, sprite sheets, and procedural
  character systems.
---

# Universal 33-Skill Human Motion & Natural Animation Framework

## 1. Core Requirement & Automatic Usage Rule

**These skills are NOT optional reference material — they are the default subconscious animation system.**

Every future animation must automatically be planned, authored, and evaluated through the entire 33-skill library before being considered finished. Never wait for the user to say *"Use Natural Movement"*, *"Use Human Motion"*, *"Fix the feet"*, or *"Add weight"*.

### The Mandatory 15-Step Automatic Execution Pipeline
Whenever creating or modifying ANY animation:
1. **Analyze the requested action** (narrative intent, facing direction, ground plane, forces).
2. **Identify and activate the relevant motion skills** from the 33-skill library.
3. **Establish Center of Mass (COM) & support base trajectory** (Pelvis `Node 0` path first).
4. **Build the golden storytelling poses** (Equilibrium, Anticipation, Chamber, Extension, Impact, Recovery).
5. **Establish full-body biomechanics** (pelvis driver, spinal C-curve, opposite arm counter-torque).
6. **Create arc-preserving breakdowns and transitions** (proximal joints lead, distal joints trail).
7. **Check non-linear timing and spacing** (Ease-Out, acceleration, peak velocity, Ease-In, settle).
8. **Check human anatomy and joint constraints** (zero reverse-knee or reverse-elbow hyperextension).
9. **Check balance and weight transfer** (6-stage weight shift, pelvis absorption dip).
10. **Check foot mechanics and ground contact** (heel-strike, flat lock without sliding, heel-to-toe roll, toe-off).
11. **Check arcs and joint trajectories** (eliminate zigzags and straight-line robotic translation).
12. **Check momentum, inertia, and overlapping follow-through** (1–2 frame phase lag per joint).
13. **Check frame-to-frame spatial continuity** (unwrapped relative angles, zero `±180°` seam flips).
14. **Perform the 10-Domain Animation Quality-Control pass** (Skill #33).
15. **Rebuild any non-compliant movement** before delivering the final animation.

> **MOST IMPORTANT RULE**: Never prioritize *"technically moving the object to the requested location"* over believable human movement. If a foot or arm moves from point A to point B, determine *why* it moves, which leg supports the body, how the knee/elbow leads, how the pelvis shifts weight, how the torso counter-balances, and how momentum settles.

---

## 2. The 33 Core Animation Skills

### Skill 01: Natural Human Movement (The Master Skill)
- Characters move as unified, coordinated living bodies with mass, skeleton, and intent — never as collections of independently repositioned sticks.
- Every movement must have a physical cause (muscular contraction, gravity, momentum transfer, or external impact).
- Force originates at the core (Pelvis & Spine) and propagates outward through the kinetic chain (`Pelvis → Spine/Chest → Thigh/Bicep → Shin/Forearm → Foot/Hand`).

### Skill 02: Human Anatomy & Joint Constraints
- **Knee Hinge Polarity Law (CRITICAL)**:
  - The human knee is a 1-DOF hinge that can **only flex toward the posterior calf/hamstring** and **never hyperextend forward past straight (`0°`)**.
  - **When Facing RIGHT (`+X`, `0°`)**: Kneecap points Right. Shin world angle $\theta_{\text{shin}}$ MUST be $\le \theta_{\text{thigh}}$ ($\theta_{\text{shin}} - \theta_{\text{thigh}} \in [-140^\circ, 0^\circ]$).
  - **When Facing LEFT (`-X`, `±180°`)**: Kneecap points Left, calf faces Right. Shin world angle $\theta_{\text{shin}}$ MUST be $\ge \theta_{\text{thigh}}$ ($\theta_{\text{shin}} - \theta_{\text{thigh}} \in [0^\circ, +140^\circ]$).
- **Elbow Hinge Polarity Law**:
  - Elbows flex only toward the anterior bicep aspect (`0° to 145°`) and never bend backward.
- **Ankle & Foot Alignment Law**:
  - Standing feet point in the character's facing direction (`~0°` when facing Right; `~-179°` when facing Left). Never twist one standing foot `180°` backward.
- **Spinal Curvature Law**:
  - Distribute torso bends across `Lower Spine`, `Upper Chest`, and `Neck` (`<= 30°` per joint). Never bend a seated character's spine/neck `55°` backward like a broken hinge when twisting or blocking.

### Skill 03: Balance & Center of Mass (COM)
- Track the weighted Center of Mass (`45% Pelvis + 30% Upper Chest + 25% Limbs/Head`).
- In standing or seated poses, the COM projection must fall inside the ground support base.
- When lifting a leg to kick, the pelvis shifts over the standing foot and the torso counter-leans away from the kicking leg (`Spine +104°..+112°`) to keep the COM balanced over the support ankle.

### Skill 04: Weight Transfer
- Every step or stance shift follows the **6-Stage Weight Transfer Cycle**:
  1. Weight begins on initial support.
  2. Center of Mass shifts toward receiving leg.
  3. Receiving heel/foot contacts ground.
  4. Receiving knee flexes (`15°–24°`) and pelvis dips downward (`+5 to +12 px`) to accept weight.
  5. Trailing support unweights and releases (`toe-off`).
  6. Standing leg extends to carry the body forward and upward into the passing phase.

### Skill 05: Foot Mechanics
- **Heel Contact**: Swing foot arrives dorsiflexed (`22°–30°` toes up) so the heel touches the ground first.
- **Flat Plant & World-Space Lock**: Once flat (`0°` facing Right, `-179°` facing Left), the foot's world `(X, Y)` coordinate stays **pinned to the ground** (`±2 px`) while the pelvis travels forward over the ankle.
- **Heel-to-Toe Roll & Toe-Off**: As the pelvis passes the ankle, the heel lifts first while the ball of the foot stays planted, finishing with a plantarflexed push-off.
- **Swing Clearance**: The knee bends and ankle dorsiflexes during swing so the toes clear the floor along a clean arc.

### Skill 06: Knee Path & Leg Mechanics
- Treat `HIP → KNEE → ANKLE → FOOT` as a coupled pendulum-lever system.
- During forward leg swing (walking, running, or chambering a kick), the hip flexes first so the **knee leads** in an upward/forward arc while the shin trails folded behind.
- Only after the knee reaches peak drive does the shin whip outward into extension.

### Skill 07: Pelvis / Hip Mechanics
- The Pelvis (`Node 0`) is the primary engine of the body.
- In locomotion, the pelvis traces a continuous sinusoidal vertical wave (dipping on `Down`, rising on `Passing`).
- In combat strikes, the pelvis drives toward the target ahead of the kicking or punching limb.
- In defensive blocks, the pelvis absorbs incoming momentum via a braced micro-slide (`+4 to +7 px`) and vertical compression (`+2 to +4 px`).

### Skill 08: Spine & Torso Mechanics
- Animate `Lower Spine (Node 7)` and `Upper Chest (Node 8)` with successive phase delay (`Node 7` leads `Node 8` by 1 frame).
- When bracing against an incoming attack, the torso leans *into* or perpendicular to the guard (`+92°..+98°`) supported by a rear bracing arm — never hyperextending backward into empty space.

### Skill 09: Shoulder & Arm Counter-Motion
- Left and right arms move in anti-phase opposition to left and right legs during locomotion.
- Forearms (`Nodes 10, 15`) lag 1 frame behind biceps (`Nodes 9, 14`), flexing more on the forward upswing and opening on the backswing.
- During a sweeping kick, the kicking-side arm whips backward for rotational counter-torque while the opposite hand stays high in guard.

### Skill 10: Head Stability & Gaze Control
- The neck acts as a gimbal stabilizer during walking so the head stays level (`±2°`) while the torso moves beneath it.
- During turns and ambushes, the eyes and head turn **first** (`1–2 frames` ahead of the chest and arms) to establish visual lock on the threat.

### Skill 11: Arcs of Motion
- Mentally and mathematically trace the world-space path of hands, feet, knees, elbows, and head across every frame.
- Eliminate linear trajectories, sharp corners, or single-frame direction reversals.

### Skill 12: Timing & Spacing
- Never space keyframes uniformly.
- Match frame spacing to mass and intent: slow relaxed Ease-In/Ease-Out for casual walks; compressed anticipation + ultra-wide 2-frame whip spacing for explosive martial arts strikes and blocks.

### Skill 13: Acceleration & Deceleration
- Bodies never jump from `0` velocity to max speed or max speed to `0` in a single frame without an external collision.
- Use progressive acceleration ratios (`1 : 3 : 6 : 10`) when initiating motion and progressive braking ratios (`10 : 6 : 3 : 1`) when stopping.

### Skill 14: Momentum & Inertia
- Follow the universal law: **PRIMARY MOTION → SECONDARY RESPONSE → DAMPED SETTLE**.
- When a character stops walking or absorbs a heavy kick, the pelvis settles first, followed 1 frame later by the chest, then the forearms/hands and head.

### Skill 15: Follow-Through & Overlapping Action
- Stagger arrival frames across parent-child chains (`1–2 frame` phase lag per joint).
- Every overlap must be caused by physical inertia — never add random wobble.

### Skill 16: Anticipation
- Precede every forceful action with a physical preparation in the opposite/loading direction:
  - Before a sweeping kick: step/shift weight onto the support leg, drop the pelvis, and chamber the kicking knee tightly.
  - Before a seated forearm block: snap head/eyes toward the attacker, coil the shoulder, and plant the rear bracing hand.

### Skill 17: Impact & Reaction
- **Contact Precision**: At the frame of impact, the striking bone (`Blue Right Shin`) and blocking bone (`Red Right Forearm`) must physically meet in world space.
- **Force Propagation**: Contact → 1–2 frame Hit-Stop freeze → Defender pelvis slides/compresses (`+5 px`) & blocking forearm flexes (`-4°`) → Damped vibration settle.

### Skill 18: Landing Mechanics
- Touchdown → Knee/Hip/Spine shock absorption dip (`+12 to +24 px`) → Brace hold → Staggered recovery from pelvis up to head.

### Skill 19: Jump Mechanics
- 8 distinct phases: `Anticipation Crouch → Push-Off → Toe-Off Extension → Decelerating Ascent → Rotational Apex Evolution → Accelerating Descent → Compression Landing → Recovery`.

### Skill 20: Run Mechanics
- Forward torso lean (`+65°..+78°`), vigorous elbow drive, high rear heel folding, and true airborne suspension frames where both feet clear the ground.

### Skill 21: Turning & Direction Changes
- Sequence: `Eyes/Head lead → Shoulders/Upper Chest pivot → Pelvis shifts weight → Legs/Arms reposition → Settle`.

### Skill 22: Stopping Mechanics
- Lead foot plants ahead of COM → Support knee flexes to absorb horizontal momentum → Pelvis decelerates (`-22 → -12 → -4 → 0 px`) → Trailing leg steps into balanced stance → Upper body settles.

### Skill 23: Starting Movement
- Shift COM toward target direction and push off the trailing foot before advancing the pelvis at full stride speed.

### Skill 24: Gesture & Intent
- Every pose must clearly communicate what the character is looking at, thinking, and preparing to do through silhouette and head/gaze alignment.

### Skill 25: Natural Asymmetry
- Avoid robotic twinning: differentiate left and right limb angles by at least `8°–25°` and assign distinct functional roles (e.g., Red's right forearm raised in high vertical guard while his left hand braces low against the floor/hip).

### Skill 26: Secondary Motion
- Ensure non-primary limbs actively support the primary action (counter-balancing arms, bracing legs, head stabilization).

### Skill 27: Contact & Grounding
- Maintain exact ground plane contact (`Y_ground = 755` or `758`) for all planted feet, seated hips, and folded ground legs with zero vertical floating or horizontal skating.

### Skill 28: Spatial Continuity
- Unwrap all parent-relative angles (`a1`) across frames so no joint ever crosses the `-180°/+180°` boundary with a `300°` single-frame spin glitch.

### Skill 29: Pose-to-Pose + In-Between Intelligence
- Author key storytelling poses first, then craft arc-preserving breakdowns where proximal joints lead distal joints.

### Skill 30: Motion Continuity
- Carry velocity and momentum smoothly through intermediate poses so the animation flows as one continuous performance.

### Skill 31: Physics Awareness
- Respect gravity, leverage, friction, and Newton's third law (every strike imparts an equal and opposite reaction force into both attacker and defender).

### Skill 32: Stylization Control
- Support `REALISTIC`, `SEMI-REALISTIC`, `CARTOON`, `STICK-FIGURE`, `EXAGGERATED`, `ANIME-INSPIRED`, `DYNAMIC`, and `COMEDIC` styles by modulating timing contrast and camera energy while preserving 100% anatomical joint integrity.

### Skill 33: Animation Quality-Control Skill (Final Gate)
- Automatically audit every finished animation across all 10 domains: **Anatomy, Balance, Feet, Timing, Arcs, Weight, Momentum, Continuity, Intent, and Organic Quality**. If any domain looks like separate stick segments being repositioned, rebuild the motion before delivery.
