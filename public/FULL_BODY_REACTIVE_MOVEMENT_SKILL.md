---
name: "full-body-reactive-movement"
version: "1.0.0"
description: >-
  Full-Body Reactive Movement & Kinetic Chain Propagation Framework for articulated 2D characters.
  Ensures the body reacts to itself as one unified biomechanical system: pelvic-thoracic counter-rotation,
  momentum-driven arm counterbalances, scapular/shoulder coupling, multi-segment spinal flex/compression,
  and vestibular head stabilization across walking, running, jumping, kick preparation, strike impact,
  and recovery.
---

# Full-Body Reactive Movement Skill (v1.0)

## 1. Core Biomechanical Principle: "The Body Reacts to Itself"

A human body is not a collection of isolated extremities attached to a static cylinder. It is a closed, interconnected **kinetic chain** governed by Newtonian mechanics, musculoskeletal elasticity, and balance equilibrium:

$$\sum \vec{F}_{ext} = M \vec{a}_{com}, \quad \sum \vec{\tau}_{ext} = \frac{d\vec{L}}{dt}$$

Whenever a major segment (e.g. pelvis, thigh, foot) accelerates, exerts force, or changes spatial orientation, that impulse **must propagate through connected joints** and trigger involuntary reactionary adjustments across the torso, shoulders, arms, and head.

---

## 2. The 6 Pillars of Full-Body Reactivity

### 2.1 Pelvic-Thoracic Axial Counter-Rotation (Gait & Locomotion)
- During forward walking or sprinting, when the right hip swings forward ($+X$), the pelvic girdle rotates clockwise in the transverse plane.
- To conserve angular momentum around the vertical spinal axis ($L_z \approx 0$), the shoulder girdle and thoracic spine **counter-rotate in anti-phase**:
  $$\theta_{shoulder}(t) = -\kappa_{torsion} \cdot (\theta_{thigh\_R}(t) - \theta_{thigh\_L}(t))$$
- In 2D sagittal view:
  - This counter-twist manifests as differential spinal pitch: lower spine (segment 07) leads pelvic translation, while upper chest (segment 08) pitches in opposition or lags by 1–2 frames ($1.5^\circ..4.5^\circ$ differential).
  - Eliminates the stiff "plank-wood torso" where spine and chest have identical static angles.

### 2.2 Momentum-Driven Dynamic Arm Swing & Elbow Modulation
- Arms do not move by arbitrary motor commands; their movement is predominantly a **passive pendulum driven by shoulder acceleration and gravitational torque**:
  $$\ddot{\theta}_{arm} + 2\zeta\omega_0 \dot{\theta}_{arm} + \omega_0^2 \sin(\theta_{arm}) = -\frac{a_{shoulder, x}}{L_{arm}} \cos(\theta_{arm})$$
- **Elbow Flexion Phase Modulation**:
  - Forward swing: elbow naturally flexes to $35^\circ..50^\circ$ (shortening pendulum length and reducing rotational inertia).
  - Backward swing: elbow extends to $15^\circ..22^\circ$ (longer arc, natural gravity extension).
  - Forearm and wrist lag the upper arm by $1..2$ frames (Follow-Through & Overlapping Action).

### 2.3 Scapular & Clavicular Shoulder Elevation/Depression
- The shoulder joint (origin of segment 09 and segment 14 at the end of segment 08) is not fixed in space:
  - When an arm raises forward or upward, the clavicle and scapula elevate: the effective shoulder elevation rises $+4..+12\text{px}$.
  - Under load (e.g., pushing off the ground during squat rise), shoulders depress into scapular retraction.
  - In surprise or impact braking, shoulders shrug upwards ($+5^\circ..+8^\circ$ upward roll).

### 2.4 Multi-Segment Torso Flexion, Compression & Breathing
- The torso is divided into **Lower Spine (07)** and **Upper Chest (08)**:
  - **Heel-Strike Cushion**: Spine compresses and flexes slightly forward ($2^\circ..5^\circ$) to absorb vertical ground reaction forces.
  - **Push-Off / Passing**: Spine extends upward into natural length.
  - **Breathing & Micro-Life**: Ribcage expands with a sinusoidal wave ($0.6^\circ..1.2^\circ$), lifting chest and shoulders together.

### 2.5 Vestibular-Ocular Head & Neck Stabilization
- The human vestibular system stabilizes the cranium so the gaze remains focused on the visual target (horizon, ground obstacle, or ball):
  $$\theta_{head}(t) = \theta_{target} - \gamma_{gimbal} \cdot (\theta_{chest}(t) - 90^\circ) + \theta_{inertial\_lag}(t)$$
- When the chest tilts forward during a sprint or jump crouch, the neck compensates backwards to keep eyes forward.
- Sudden head motions (noticing an object) lead the body, snapping $1..2$ frames before the torso brakes.

### 2.6 Full-Body Participation in Kicking Mechanics
A kick is a whole-body athletic event with three distinct kinetic phases:
1. **Chamber / Backswing Pre-Stretch**:
   - Support leg flexes knee ($15^\circ..25^\circ$) to lower COM and plant flat at $Y = 755\text{px}$.
   - Pelvis tilts backward; lower spine hyperextends slightly.
   - Thoracic spine and shoulders counter-coil away from the kicking leg to create abdominal pre-stretch.
   - Contralateral arm extends outward/upward to establish rotational counterbalance.
2. **Kinetic Whip & Upper-Body Recoil (Impact)**:
   - Kinetic chain whip: Hips drive forward $\to$ thigh accelerates $\to$ shin snaps forward into ball.
   - **Conservation of Momentum Recoil**: As the heavy kicking leg accelerates forward at maximum velocity, the **upper torso recoils backward** ($10^\circ..16^\circ$ posterior lean).
   - Contralateral arm sweeps down and inward; ipsilateral arm pulls back and downward.
   - Striking toe reaches contact point within reach tolerance with 1-frame hit-stop.
3. **High Follow-Through & Momentum Dissipation**:
   - Leg carries high; torso maintains counterbalance lean.
   - Arms spread wide for dynamic aerodynamic equilibrium.
   - Energy dissipates through damped harmonic settling across the torso and arms as the character returns to upright walking stance.

---

## 3. Mathematical Specifications for 17-Node Rigs

| Node | Name | Reactive Driver | Reactive Behavior |
|---|---|---|---|
| 00 | Pelvis (Root) | Stance Leg & Ground | Height bobs $\pm 4\text{px}$, drives core pelvic tilt |
| 01-03 | Right Leg | Gait Cycle / Kicking | Primary drive or stance pin at $Y=755\text{px}$ |
| 04-06 | Left Leg | Gait Cycle / Kicking | Primary drive or stance pin at $Y=755\text{px}$ |
| 07 | Lower Spine | Pelvis + Hip Torque | Leads pelvic translation, flexes $3^\circ..5^\circ$ with leg drive |
| 08 | Upper Chest | Thoracic Torsion | Counter-rotates to pelvis, recoils on kick impact |
| 09-11 | Right Arm | Shoulder + Momentum | Anti-phase swing, dynamic elbow flexion, wrist lag |
| 12 | Neck | Torso Pitch | Gimbal compensation maintaining eye horizon |
| 13 | Head (Circle) | Gaze Target | Locks on ball/path, secondary spring oscillation |
| 14-16 | Left Arm | Shoulder + Momentum | Dynamic counterbalance, abducts for kick balance |

---

## 4. Verification & Biomechanical QC

Every animation asserting full-body reactivity must pass:
1. **Pelvic-Thoracic Counter-Rotation Check**: Chest and pelvis exhibit anti-phase angular deflection during gait cycles.
2. **Kick Upper-Body Recoil Check**: Torso pitches backward by $\ge 10^\circ$ relative to standing upright during maximum leg strike acceleration.
3. **Elbow Dynamic Modulation Check**: Elbow interior angle varies by $\ge 15^\circ$ between swing flexion and extension.
4. **Head Horizon Stability Check**: Head pitch variance is $< 50\%$ of torso pitch variance during steady locomotion.
5. **No Broken Constraints**: All 10 existing biomechanical constraints (ground $Y=755$, 0° knee hyperextension, bone lengths, etc.) remain $100\%$ valid.
