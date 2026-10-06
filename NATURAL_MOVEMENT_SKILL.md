---
name: "sticknodes-natural-movement"
version: "1.0.0"
description: >-
  Reusable biomechanical and animation-principles instruction layer for generating,
  evaluating, and surgically repairing natural character movement in Stick Nodes
  (.stknds) projects. Works alongside the binary container skill (SKILL.md).
---

# Stick Nodes — Natural Movement Skill

## 1. Purpose & Role in the Skill Stack

**Natural Movement** is a reusable **animation quality and body-mechanics layer** applied *on top of* any requested Stick Nodes action.

- **Binary Container Skill (`SKILL.md`)** governs *how* bytes, headers, 84-byte figure nodes, and 58-byte per-node frame pose records are serialized so Stick Nodes opens the `.stknds` file without error.
- **Natural Movement Skill (`NATURAL_MOVEMENT_SKILL.md`)** governs *how the character moves across frames* so the resulting animation exhibits authentic weight, balance, arcs, anticipation, easing, overlapping action, and physical believability.

> **Core Axiom**: A technically valid `.stknds` file is **NOT** successful if the character moves in the wrong direction, slides linearly like a rigid statue, lacks gravity/momentum, or snaps all limbs simultaneously. Natural Movement transforms a mechanical pose list into believable motion without altering the user's requested narrative action.

---

## 2. Coordinate Space & Direction Verification (Anti-Reversal Rules)

Before authoring or modifying a single keyframe, the AI must lock in the exact coordinate conventions of the target `.stknds` container (`v334`) and verify movement signs frame-by-frame.

### 2.1 Scene Translation Coordinates (`frame_offset + 130` and `+ 134`)
- **`scene_x` (`float32` at `+130`)**:
  - **Increasing `scene_x` (`Δx > 0`)** moves the character **Right**.
  - **Decreasing `scene_x` (`Δx < 0`)** moves the character **Left**.
- **`scene_y` (`float32` at `+134`)**:
  - Stick Nodes scene space uses **top-left origin (`+Y` points DOWNWARD toward the ground)**.
  - **Decreasing `scene_y` (`Δy < 0`)** moves the character **UPWARD** into the air/sky.
  - **Increasing `scene_y` (`Δy > 0`)** moves the character **DOWNWARD** toward the ground.
  - **CRITICAL TRAP**: Never treat `+Y` as upward in `scene_y`. If a character jumps or takes off, `scene_y` **must decrease** during ascent and **increase** during descent.

### 2.2 Node Rotation Coordinates (`node_record_offset + 12`)
- In Stick Nodes `v334` forward kinematics (`MyBase` 17-node hierarchy and standard stickfigures), world bone angles follow standard Cartesian degrees before screen projection:
  - **`0°`** = pointing **Right** (`+X`)
  - **`+90°`** = pointing **Straight Up** (`-Y` in scene space)
  - **`-90°` (or `270°`)** = pointing **Straight Down** (`+Y` in scene space, toward the ground)
  - **`180°` / `-180°`** = pointing **Left** (`-X`)
- Each frame node record stores the **parent-relative angle `a1`** at byte offset `+12..+16`:
  $$a_1(\text{node}) = \theta_{\text{world}}(\text{node}) - \theta_{\text{world}}(\text{parent})$$
- **Forward Kinematics Verification Formula**:
  $$\text{end\_x}_i = \text{start\_x}_i + \cos(\theta_{\text{world}, i}) \cdot \text{length}_i \cdot \text{instance\_scale}$$
  $$\text{end\_y}_i = \text{start\_y}_i - \sin(\theta_{\text{world}, i}) \cdot \text{length}_i \cdot \text{instance\_scale}$$

### 2.3 Mandatory Frame-by-Frame Direction Audit
Before exporting any `.stknds` file, run a numerical sign check across every phase:
1. **Upward motion (Jump takeoff, levitation, climb, uppercut)**: Confirm `scene_y[f] < scene_y[f-1]`.
2. **Downward motion (Fall, dive, landing compression, crouch)**: Confirm `scene_y[f] > scene_y[f-1]`.
3. **Ground contact lock**: During standing, walking, crouching, or landing impact, compute the Y coordinate of the lowest planted foot/knee (`end_y`) and confirm it contacts the ground plane (`Y_ground`) rather than floating above or sinking through the floor.

---

## 3. Pre-Edit Analysis Protocol (What to Analyze Before Editing)

Whenever asked to create a new animation or improve an existing `.stknds` file, perform these 5 analytical steps first:

1. **Inventory the Rig & Hierarchy**:
   - Parse the figure node table (`84` bytes/node) to identify the root anchor (Pelvis `Node 0`), lower/upper spine (`Nodes 7, 8`), neck/head (`Nodes 12, 13`), left/right leg chains (`Nodes 1–3`, `4–6`), and left/right arm chains (`Nodes 9–11`, `14–16`).
   - Record each bone's default length, thickness, and immutable baseline local/world angles (`a2, a3` at record offsets `+16, +20`).
2. **Determine Target Frame Rate (`12 FPS` vs `24 FPS`)**:
   - Check header byte `@30` (`8 + name_len + 14`).
   - At **12 FPS**, each frame represents `83.3 ms`; motions require clearer pose contrast and wider spacing during fast actions.
   - At **24 FPS**, each frame represents `41.7 ms`; fast actions use smoother intermediate breakdowns and gentler per-frame angular deltas.
3. **Decompose the Requested Action into Biomechanical Phases**:
   - Break the prompt into sequential physical beats: ** Equilibrium/Setup → Anticipation (Wind-up) → Primary Impulse/Drive → Follow-Through & Overlapping Drag → Recovery & Settle**.
4. **Map the Center of Mass (COM) Trajectory**:
   - Plot the path of `Node 0` (Pelvis) across the scene before posing individual limbs. Every limb motion must serve or react to the pelvis and torso trajectory.
5. **Audit Existing Frames (When Repairing a File)**:
   - If modifying an existing `.stknds`, inspect all existing frames first. Identify which frames or limbs already work well and isolate only the specific frame range or joint chains that look robotic, reversed, or unbalanced.

---

## 4. Core Principles of Natural Movement in Stick Nodes

### 4.1 Timing, Spacing & Easing (Never Move Linearly)
- **Robotic Failure Mode**: Moving `scene_x` by `+20 px` every frame and rotating a limb by `+10°` every frame produces lifeless, mechanical interpolation.
- **Ease-Out (Accelerating from Rest)**:
  - When a body part starts moving, frame-to-frame deltas must grow progressively (e.g., displacement ratios of `1 : 3 : 6 : 10`).
- **Ease-In (Decelerating into a Stop or Apex)**:
  - When approaching an apex, pose hold, or rest state, frame-to-frame deltas must shrink progressively (e.g., `10 : 6 : 3 : 1`).
- **Ballistic Gravity Spacing**:
  - In freefall or jumping, vertical velocity changes at a constant gravitational rate (`Δ²y = +g` per frame):
    - **Launch**: Largest upward delta (`Δy = -55, -42, -28, -14`).
    - **Apex Hang**: Near-zero vertical delta (`Δy = -4, 0, +4`) while horizontal translation continues smoothly.
    - **Descent**: Progressively increasing downward delta (`Δy = +14, +28, +44, +62`) until ground contact.

### 4.2 Natural Arcs (Curved Trajectories Across All Joints)
- Biological joints rotate around sockets (`hips, knees, shoulders, elbows, neck`). Therefore, every extremity **must travel along a circular or elliptical arc**, never a straight line.
- **Pelvis Bounce Arcs in Locomotion**:
  - Even when walking or running across flat ground, the pelvis (`Node 0`) never moves on a flat horizontal line (`Δy = 0`). It traces a continuous vertical wave: dipping on the **Down/Absorption** pose after heel strike and rising to a peak on the **Passing/Push-off** pose.
- **Limb Swing Arcs**:
  - When swinging an arm forward (punching, throwing, running) or raising a hand to the head, the elbow and hand trace a curved path. Avoid simultaneous opposite-sign angle changes that accidentally make the hand travel in a rigid straight line unless performing a deliberate straight-line thrust (and even then, the shoulder and chest rotate along an arc).

### 4.3 Anticipation (Preparation Before Action)
- No forceful human movement happens instantaneously from a static pose.
- **Rule of Opposite Preparation**:
  - Before jumping **upward**, the pelvis drops **downward** into a crouch while the torso leans forward and arms swing back.
  - Before punching **forward**, the torso coils **backward** and the striking shoulder/elbow draws back.
  - Before running or dashing **right**, the center of mass shifts slightly **left/down** as the push foot loads weight, or leans forward past the support foot to initiate fall-forward acceleration.
- Scale the duration of anticipation to the force of the action: a light step needs 1 frame of weight shift; an explosive takeoff or heavy punch requires 2–4 frames of deep coil and a 1-frame compressed hold.

### 4.4 Follow-Through, Overlapping Action & "Successive Breaking of Joints"
- **Never start or stop all 17 nodes on the same frame.**
- Force originates at the core and propagates outward along the kinetic chain with a **1-to-2 frame phase lag per joint**:
  1. **Frame `T`**: Pelvis (`Node 0`) and Lower Spine (`Node 7`) initiate the movement or stop.
  2. **Frame `T + 1`**: Upper Chest (`Node 8`) and Upper Limbs (`Thighs 1/4`, `Biceps 9/14`) follow.
  3. **Frame `T + 2`**: Lower Limbs (`Shins 2/5`, `Forearms 10/15`) and Neck (`Node 12`) follow, exhibiting drag behind the parent segment during acceleration and overshoot past the parent segment during deceleration.
  4. **Frame `T + 3`**: Extremities (`Feet 3/6`, `Hands 11/16`, `Head 13`) complete their follow-through and settle back to equilibrium.

### 4.5 Secondary Motion (Full-Body Reaction)
- Every primary action induces secondary reactions in the rest of the body:
  - During a **heavy landing**, the head (`Node 13`) nods downward slightly after the pelvis bottoms out, and the non-supporting arm flares outward for counterbalance.
  - During a **head scratch or gesture**, the torso shifts weight onto one hip, the opposite hand rests on the hip or hangs relaxed, and the head tilts into the hand on each stroke.
  - During **high-speed flight**, trailing shins and feet exhibit subtle alternating air-current flutter (`±3° to ±5°`) rather than locking at a dead `0.0°` delta.

### 4.6 Center of Mass (COM), Weight & Balance
- **Static & Slow Poses (Support Polygon Rule)**:
  - The horizontal projection of the Center of Mass (approx. midpoint between Pelvis `Node 0` and Upper Chest `Node 8`) must lie **between the planted contact points** on the ground.
  - If one leg lifts off the ground, the pelvis and spine must shift laterally/horizontally over the remaining standing foot so the character does not look like an unbalanced statue defying gravity.
- **Dynamic Acceleration & Deceleration (Torque Rule)**:
  - To accelerate **forward**, the COM must lean **ahead** of the planted foot.
  - To stop suddenly from forward motion, the planted foot must strike **ahead** of the COM while the spine leans back or absorbs the forward momentum through knee flexion.

### 4.7 Squash, Stretch & Impact Compression
- For **organic characters (17-node stickfigures)**, squash and stretch is achieved primarily through **pose compression and extension** rather than distorting bone lengths:
  - **Squash (Impact / Crouch)**: Deep knee flexion (`Thighs` angled forward, `Shins` angled backward), lowered pelvis (`scene_y` increased), and flexed spine (`Nodes 7, 8` pitched forward).
  - **Stretch (Launch / High-Speed Reach)**: Full extension of hip, knee, ankle, and spine along the velocity vector (`Thigh`, `Shin`, `Spine`, and `Lead Arm` aligned within `10°–20°` of the travel direction).
- For **elastic/non-human nodes (e.g., Bouncing Ball on `Node 13`)**:
  - Apply volume-preserving dimension scaling: when `length` compresses by factor $k < 1.0$ on ground contact, `thickness` scales by $1/k$ so visual mass remains constant.

### 4.8 Anti-Jitter Discipline ("Organic" ≠ Random Noise)
- **Strict Prohibition**: Never add random per-frame noise (`random(-5°, +5°)`) to bone angles to fake "organic" movement.
- Every angle change between `Frame[f-1]`, `Frame[f]`, and `Frame[f+1]` must have a clear directional derivative (accelerating, cruising, decelerating, or damped harmonic settling).

---

## 5. Diagnosing & Repairing Unnatural or Robotic Motion

When inspecting a generated or user-supplied `.stknds` project, use this diagnostic table to identify and surgically repair movement flaws while **preserving working parts of the animation**:

| Observed Symptom | Root Binary / Kinematic Cause | Surgical Repair Procedure |
| :--- | :--- | :--- |
| **Sliding / Ice-Skating Feet** | `scene_x` advances while planted leg angles (`Nodes 1–3` or `4–6`) do not counter-rotate to keep the foot world X stationary on the ground. | Compute planted foot `end_x` in the contact frame; adjust `scene_x` or thigh/shin angles in subsequent stance frames so `end_x` stays locked within `±3 px` until toe-off. |
| **Statue / Elevator Jump** | `scene_y` moves up and down linearly while spine, thigh, shin, and arm angles stay nearly constant. | Add a 2-frame crouch anticipation (`scene_y` down, knees bent), full leg/spine extension on liftoff, progressive gravity easing toward apex, knee tuck near apex, and impact compression on landing. |
| **Reversed Vertical Motion** | Author treated `+Y` as up instead of down (`scene_y` increased during jump/flight climb). | Invert the sign of vertical offsets around the ground baseline (`scene_y = ground_y - altitude`) and re-verify foot ground contact. |
| **Robotic Simultaneous Stop** | All 17 nodes reach their final target angle on the exact same frame `F_stop`. | Stagger arrival times: lock Feet/Pelvis at `F_stop`, let Spine/Chest overshoot by `4°–8°` on `F_stop + 1`, let Arms/Head overshoot on `F_stop + 1..2`, and settle on `F_stop + 3`. |
| **Floaty / Weightless Impact** | Character lands from a jump or dive and immediately freezes without pelvis dip or knee flexion. | Insert 1–2 shock-absorption frames immediately after ground contact where `scene_y` dips `+10 to +22 px` deeper and knees/spine flex before rebounding to the settle pose. |
| **Jump-Like Flight** | Flying character follows an inverted parabola (`up → peak → immediately down`) instead of sustaining altitude. | Separate liftoff (vertical levitation/hover) from propulsion: lock `scene_y` into a high-altitude horizontal sky corridor across 6–12+ frames with horizontal spine (`+2° to +10°`) before initiating a deliberate air-brake and dive. |

---

## 6. Concrete Action Blueprints (Movement Logic for AI Generation)

Use the following movement logic whenever generating or refining these common Stick Nodes actions. Adapt coordinates, speeds, and frame counts to the user's specific scene and FPS setting (`12 FPS` vs `24 FPS`).

### 6.1 Walking
- **Biomechanics**: Controlled cyclic shifting of weight from heel strike to toe-off with continuous pelvis vertical oscillation and opposite arm/leg counter-rotation.
- **4 Key Poses per Half-Cycle**:
  1. **Contact**: Lead leg extended forward (`heel touch`), trailing leg extended back (`toe touch`), both knees nearly straight, pelvis (`scene_y`) at medium height, opposite arm swung forward.
  2. **Down (Weight Absorption)**: Pelvis drops to its **lowest vertical point** (`scene_y` increases by `+10 to +16 px`) as the lead knee bends to absorb body weight; arms reach maximum swing excursion.
  3. **Passing Pose**: Lead leg straightens under the pelvis while the trailing leg lifts and passes the standing ankle; pelvis rises; arms pass the torso centerline.
  4. **Up (High Point / Push-Off)**: Standing ankle pushes off, raising the pelvis to its **highest vertical point** (`scene_y` decreases by `-8 to -14 px`) just before the swing foot drops into the next Contact pose.
- **Overlapping Details**: Forearms (`Nodes 10, 15`) lag `1 frame` behind biceps (`Nodes 9, 14`), flexing slightly more on the forward upswing and extending on the backswing.

### 6.2 Running
- **Biomechanics**: High-momentum gait distinguished from walking by a **forward torso lean** (`Spine +65° to +78°` instead of `+88°`), vigorous elbow bend (`Forearms` bent `70°–100°` relative to biceps), and an **Airborne Suspension Phase** where both feet are off the ground.
- **5 Key Phases per Stride**:
  1. **Impact Contact**: Front foot strikes directly under the leaning Center of Mass.
  2. **Down / Maximum Compression**: Deep knee bend on support leg, pelvis at lowest `scene_y`, back heel kicked high toward the glutes (`Shin` folded sharply back).
  3. **Drive / Push-Off**: Explosive hip, knee, and ankle extension of the support leg while the opposite knee drives high forward and upward; opposite arm punches forward/up.
  4. **Flight / Airborne Peak**: Both feet off the ground (`scene_y` at highest point), legs split wide in mid-air, torso maintaining forward lean.
  5. **Reach / Descent**: Front shin extends forward to prepare for the next foot strike.

### 6.3 Jumping (Vertical or Forward Leap)
- **Biomechanics**: Conversion of muscular coil into upward ballistic velocity governed strictly by gravity after toe-off.
- **Phase Logic**:
  1. **Neutral → Anticipation Crouch (2–4 frames)**: Pelvis drops (`scene_y` increases), thighs angle forward, shins angle backward, spine pitches forward (`+50°`), and both arms swing backward behind the hips to load momentum.
  2. **Power Drive & Toe-Off (1–2 frames)**: Arms swing violently upward past the chest (`+60° to +80°`), spine snaps upright/forward, and hips/knees/ankles extend completely just as the toes leave the ground.
  3. **Ascent with Decelerating Spacing**: `scene_y` decreases by progressively smaller increments each frame; legs begin folding/tucking underneath the pelvis as upward velocity slows.
  4. **Apex Hang (1–3 frames)**: Vertical displacement is minimal (`Δy ≈ 0`); knees are tucked, arms float near peak height, and the torso rotates smoothly from upward pitch toward landing alignment.
  5. **Accelerating Descent**: `scene_y` increases by progressively larger increments each frame; leading leg extends downward toward the ground to prepare for impact absorption.

### 6.4 Landing (Standard Two-Foot & Three-Point Superhero Landing)
- **Biomechanics**: Dissipation of downward kinetic energy through joint flexion and staggered follow-through.
- **Phase Logic**:
  1. **Touchdown Frame**: Toes/foot (and in a three-point superhero landing, front foot + rear knee + downward-punching fist) contact the ground plane simultaneously.
  2. **Compression / Shockwave Overshoot (1–2 frames after touchdown)**: Pelvis continues moving downward (`scene_y` increases by `+12 to +28 px`) as knees and hips flex deeply; spine pitches forward (`+20° to +45°`) and the head nods down due to neck inertia.
  3. **Damped Hold (1–2 frames)**: Character holds the compressed brace pose while the non-contact arm flares back/out for balance.
  4. **Recovery & Settle (2–4 frames)**: Pelvis eases upward, spine and chest uncoil first, followed 1 frame later by the neck and head lifting to the final heroic or standing gaze.

### 6.5 Punching
- **Biomechanics**: Whip-like kinetic chain transferring rotational torque from the back foot and hips through the spine and shoulder into the fist.
- **Phase Logic**:
  1. **Coil / Wind-Up (2–3 frames)**: Weight shifts slightly onto the rear leg, torso tilts slightly back (`Spine +95° to +102°`), striking shoulder/bicep draws back (`-135° to -155°`) with forearm cocked, and non-striking hand rises to guard the chin.
  2. **Hip & Shoulder Drive (1 frame)**: Pelvis lunges forward (`Δscene_x` surges), spine pitches forward (`+72° to +78°`), and the elbow drives forward ahead of the hand.
  3. **Snap Impact Frame (1 frame — Do Not Over-Tween)**: Striking arm reaches full horizontal extension (`Bicep 0°`, `Forearm 0°`, `Hand 0°`), non-striking arm pulls sharply back to the ribs for counter-torque, and the front knee braces under the forward-leaning COM.
  4. **Impact Hold / Recoil (1–2 frames)**: Fist holds at the target point with tiny micro-compression while the shoulder and head settle into the strike.
  5. **Follow-Through & Guard Recovery (2–3 frames)**: Elbow drops slightly along a downward arc before retracting back to the fighting stance.

### 6.6 Kicking
- **Biomechanics**: Counter-balanced pendulum whip requiring the torso to lean away from the kicking leg to keep the Center of Mass over the standing foot.
- **Phase Logic**:
  1. **Weight Shift & Chamber (2–3 frames)**: Pelvis shifts over the support leg; kicking thigh lifts high (`+20° to +45°`) while the kicking shin stays tightly folded back (`-90° to -120°`) like a cocked spring.
  2. **Whip Extension (1–2 frames)**: Support foot pivots, torso leans counter-direction (`Spine +105° to +120°`) with arms counter-swinging for balance, and the kicking shin snaps outward to full extension (`Thigh +25°`, `Shin +25°`, `Foot +15°`).
  3. **Apex Hold (1 frame)**: Kicking foot holds at peak extension for visual readability.
  4. **Re-Chamber & Plant (2–3 frames)**: Kicking shin folds back first (`overlapping action`) before the thigh lowers the foot along an arc back to the ground.

### 6.7 Falling
- **Biomechanics**: Loss of support polygon followed by gravitational acceleration and Secondary Drag on extremities.
- **Phase Logic**:
  1. **Tipping / Loss of Balance (2–3 frames)**: Center of Mass moves outside the planted foot; character attempts a corrective arm windmill while the torso tips at an accelerating angular rate.
  2. **Freefall Acceleration**: Downward displacement `Δscene_y` increases every single frame (`+12, +26, +44, +66...`).
  3. **Upward Drag on Limbs**: Because the heavy pelvis/torso accelerates downward, lighter extremities (`Forearms`, `Hands`, `Lower Shins`) trail **upward** behind the falling torso until impact.
  4. **Ground Impact & Bounce/Settle**: Heavy compression on contact followed by a tiny secondary limb bounce (`1–2 frames`) before coming to rest.

### 6.8 Stopping Suddenly
- **Biomechanics**: Deceleration via forward foot bracing and forward-overshooting upper-body inertia.
- **Phase Logic**:
  1. **Brake Plant**: Lead foot plants well **ahead** of the pelvis (`Thigh -35°`, `Shin -70°`) while `scene_x` velocity begins to drop.
  2. **Inertia Overshoot (1–2 frames)**: Even after the feet stop advancing, the pelvis slides slightly forward/down (knee bending) and the upper chest, head, and arms **whip forward** past vertical due to momentum.
  3. **Counter-Balance & Settle (2–3 frames)**: Chest pulls back upright, followed 1 frame later by the head and forearms settling back to neutral stance.

### 6.9 Changing Direction (180° Pivot / Cut)
- **Biomechanics**: Deceleration of old velocity vector, low COM plant outside the turn, and re-acceleration along the new vector.
- **Phase Logic**:
  1. **Deceleration Lean**: Character leans **backward** against the old travel direction (already pointing toward the new direction!) while planting the outside foot wide.
  2. **Deep Pivot Crouch (1–2 frames)**: Horizontal velocity hits `0`; pelvis drops low (`scene_y` increases), knees bend deeply, and torso/head turn toward the new target direction **before** the legs push off (`Head leads → Chest follows → Pelvis & Legs drive`).
  3. **Explosive Push-Off**: Outside leg extends to drive the pelvis along the new direction with Ease-Out spacing.

### 6.10 Taking Off and Flying
- **Biomechanics**: Clear separation between anti-gravity/propulsive liftoff and sustained aerodynamic sky cruise (never animate flight as a big jump parabola).
- **Phase Logic**:
  1. **Liftoff / Zero-G Levitation OR Coiled Launch (2–3 frames)**: Either rise vertically into a weightless hover (`scene_y` decreasing while `scene_x` stays nearly constant, one knee raised, arms floating out) OR coil deeply and launch upward into the sky corridor.
  2. **Mid-Air Ignition & Pitch-Out (1–2 frames)**: At altitude, coil arms briefly and snap the torso nearly horizontal (`LowerSpine +2° to +10°`, `UpperChest 0° to +6°`), punching the lead arm straight ahead (`0°`) while tucking the trailing arm (`-174°`).
  3. **Sustained High-Altitude Sky Corridor Cruise (6–12+ frames)**: Hold `scene_y` high and nearly flat in the sky while advancing `scene_x` rapidly; add subtle alternating wind-current flutter (`±3° to ±5°`) on the trailing shins and feet so the character feels propelled through moving air.
  4. **Mid-Air Flare Brake & Dive**: Flare the torso upright (`+35° to +45°`) and spread the arms to brake in mid-air before pitching nose-down into a vertical dive or descending into a hover landing.

---

## 7. Final 10-Point Natural Movement Quality Gate

Before delivering any new or repaired `.stknds` file, the AI must verify that all 10 checks pass:

1. **Direction Check**: Does `scene_x` and `scene_y` move in the exact intended direction every phase (remembering `Δscene_y < 0` is UP and `Δscene_y > 0` is DOWN)?
2. **Ground Contact Check**: Do planted feet/knees/hands maintain consistent ground Y coordinates without floating or sinking?
3. **Non-Linear Spacing Check**: Are frame-to-frame deltas eased (Ease-Out on launch, Ease-In on stops/apexes, quadratic acceleration under gravity)?
4. **Arc Check**: Do hands, feet, head, and pelvis trace curved paths rather than rigid straight lines?
5. **Anticipation Check**: Is every major action preceded by an appropriate opposite preparatory wind-up or weight shift?
6. **Overlapping Action Check**: Do spine, chest, upper limbs, forearms/shins, and head start and stop on staggered frames (`1–2 frame` phase lag) rather than locking simultaneously?
7. **Secondary Motion Check**: Do non-primary limbs and the head react naturally to the main force?
8. **Balance & COM Check**: Is the Center of Mass supported over the planted feet during static/slow poses and leaned appropriately during acceleration/braking?
9. **Anti-Jitter Check**: Are all joint angle curves smooth and purposeful with zero random frame-to-frame noise?
10. **Container & Semantic Integrity Check**: Does the final `.stknds` file preserve the `v334` 9-byte prefix, GZIP stream, target FPS byte (`@30`), exact recursive node count, and frame footer delimiters (`01 01 00` → `00 00 00`)?
