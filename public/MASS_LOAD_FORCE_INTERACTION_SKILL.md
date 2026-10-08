---
name: "mass-load-force-interaction"
version: "2.0.0"
description: >-
  General-purpose physics, mass distribution, external load compensation, lever-arm torque dynamics,
  and force transmission framework for articulated 2D characters and Stick Nodes (.stknds) animations.
  Enforces causal physics where external masses, loads, pushes, pulls, lifts, carries, catches, and strikes
  physically perturb posture, center of mass, joint torques, and support reactions.
---

# Mass, Load & External Force Interaction Skill (v2.0)

## 1. Core Philosophy: Causal Load Dynamics Over Kinematic Placements

The engine does not ask:
> "Where should the hands and object be placed on frame 12?"

Instead it reasons:
> "What is the mass of this object relative to the character, what lever arm does it exert about the spine and support base, what muscular torques and ground reaction forces must be mobilized to accelerate or sustain it, and what posture naturally balances that load?"

Every physical interaction is governed by the causal pipeline:
$$\text{INTENT} \to \text{CAUSE} \to \text{FORCES / TORQUES / LOADS} \to \text{MOMENTUM} \to \text{BALANCE / COM} \to \text{CONTACT / SUPPORT} \to \text{WHOLE-BODY REACTION} \to \text{KINEMATICS / IK} \to \text{FRAME}$$

---

## 2. Configurable Normalized Physical Model

To remain domain-agnostic without requiring fragile unit conversions, the system operates on a configurable normalized physical model:

- **Character Base Mass**: $M_{char} = 100.0$ (normalized reference mass)
- **Object Mass**: $M_{obj} \in (0, 200)$
- **Relative Mass Ratio**:
  $$\mu = \frac{M_{obj}}{M_{char}}$$
  - **Light Object ($\mu \le 0.10$, e.g. mass = 5)**: Minimal whole-body postural compensation; arm muscles support load with negligible pelvic or spinal counter-lean ($< 2^\circ$).
  - **Moderate Object ($0.10 < \mu \le 0.35$, e.g. mass = 20)**: Measurable torso pitch ($3^\circ..7^\circ$), noticeable knee compression, and slight contralateral arm counterbalance.
  - **Heavy Object ($\mu > 0.35$, e.g. mass = 50..100)**: Substantial whole-body compensation; deep spinal counter-lean ($8^\circ..18^\circ$), pelvic displacement ($12..30\text{px}$), contralateral limb abduction for equilibrium, widened support base, and slower acceleration profiles.

### Anthropometric Segment Mass Distribution (17-Node Rig)
$$\begin{aligned}
m_{pelvis} &= 0.22 \cdot M_{char} & m_{thigh} &= 0.10 \cdot M_{char} \\
m_{shin} &= 0.05 \cdot M_{char} & m_{foot} &= 0.015 \cdot M_{char} \\
m_{spine} &= 0.28 \cdot M_{char} & m_{neck} &= 0.03 \cdot M_{char} \\
m_{head} &= 0.07 \cdot M_{char} & m_{bicep} &= 0.02 \cdot M_{char} \\
m_{forearm} &= 0.012 \cdot M_{char} & m_{hand} &= 0.003 \cdot M_{char}
\end{aligned}$$

---

## 3. Physical Roles of Body Parts

A body point (hand, foot, pelvis, head) is never a solitary coordinate. It is assigned active mechanical roles:
1. **Contact Points**: Surface meeting location ($|P_{point} - P_{surface}| \le \epsilon_{contact}$).
2. **Force Application Points**: Vector origin of applied muscular or contact forces ($\vec{F}_{applied}$).
3. **Support / Load-Bearing Points**: Compressive load transfer into ground or furniture ($\vec{N}_{ground} \ge 0$).
4. **Pivot Points**: Rotational axes during steps, roll-overs, or tipping ($\vec{\tau} = \vec{r} \times \vec{F}$).
5. **Constraint / Attachment Points**: Mechanical linkage locking relative degrees of freedom ($P_{obj} = P_{hand} + \vec{r}_{grip}$).
6. **Collision Points**: Impulse transfer sites during strikes, tackles, and catches ($\vec{J} = \Delta \vec{p}$).

### Force Transmission Chains
$$\begin{aligned}
\text{Push Force Chain:} \quad &\text{Ground} \to \text{Feet} \to \text{Shins/Thighs} \to \text{Pelvis} \to \text{Spine} \to \text{Shoulders} \to \text{Arms} \to \text{Hands} \to \text{Object} \\
\text{Pull Force Chain:} \quad &\text{Object} \to \text{Hands} \to \text{Arms} \to \text{Shoulders} \to \text{Spine} \to \text{Pelvis} \to \text{Legs} \to \text{Feet} \to \text{Ground} \\
\text{Lifting Chain:} \quad &\text{Ground Reaction} \to \text{Knee/Hip Extension} \to \text{Pelvic Elevation} \to \text{Spinal Erectors} \to \text{Scapulae} \to \text{Elbows} \to \text{Object}
\end{aligned}$$

---

## 4. Leverage, Distance & Rotational Demand (Torque)

Weight is never treated as a scalar magnitude alone. The physiological rotational demand on a joint depends on the cross product of the load vector and the moment arm (lever arm):
$$\vec{\tau}_{joint} = \vec{r}_{joint \to load} \times \vec{F}_{load} = (X_{load} - X_{joint}) \cdot (M_{obj} \cdot g)$$

### Comparison: Near Hold vs. Far Hold
- **Near Hold ($|\Delta X| = 25\text{px}$)**:
  $$\tau_{shoulder} = 25 \cdot (50 \cdot g) = 1,250 \cdot g$$
  Shoulder torque is low; elbows remain flexed ($45^\circ..75^\circ$); torso remains near upright ($< 3^\circ$ counter-lean).
- **Far Hold ($|\Delta X| = 80\text{px}$)**:
  $$\tau_{shoulder} = 80 \cdot (50 \cdot g) = 4,000 \cdot g \quad (3.2\times \text{ greater demand!})$$
  Shoulder torque is high; upper torso must counter-lean backward or laterally by $10^\circ..16^\circ$; pelvis must shift in opposite direction by $+15\text{px}$ to keep whole-body COM within the support polygon.

---

## 5. Movement Primitives Under Load

### 5.1 Lifting
Lifting an object progresses through 4 causal phases:
1. **Preparation**:
   - COM lowers ($Y_{pelvis} + 80..+120\text{px}$).
   - Knees flex ($60^\circ..110^\circ$), hips hinge ($45^\circ..75^\circ$).
   - Feet plant flat at ground plane ($Y = 755.0\text{px}$).
   - Arms reach downward toward the object's resting position.
2. **Contact & Attachment**:
   - Hands establish contact with object bounding box ($\le 2.0\text{px}$).
   - Mechanical attachment initialized; object state transitions from `FREE` or `RESTING` to `HELD`.
3. **Drive & Force Transmission**:
   - Feet exert compressive ground reaction force ($\vec{F}_{ground} = (M_{char} + M_{obj})(g + a_y)$).
   - Legs extend; pelvis rises smoothly along a quintic ease curve.
   - Spine erects under load; shoulder elevation elevates.
   - Combined COM is tracked continuously:
     $$\vec{P}_{com}(t) = \frac{M_{char} \vec{P}_{char\_com}(t) + M_{obj} \vec{P}_{obj}(t)}{M_{char} + M_{obj}}$$
4. **Stabilization & Standing Lock**:
   - Pelvis locks into standing elevation ($Y \approx 512\text{px}$).
   - Torso settles with compensatory lean matching final load position.

### 5.2 Carrying
1. **Asymmetric (Side) Carry**:
   - Heavy object carried on right side ($\Delta X > 0$):
     - Torso leans left ($\theta_{spine} = -6^\circ..-14^\circ$).
     - Left arm abducts outward to act as an inertial counterweight ($+25^\circ..+45^\circ$).
     - Right foot receives higher normal force during stance ($65\%..75\%$ of total load).
2. **Symmetric (Front) Carry**:
   - Heavy object carried in front ($\Delta X > 0$ relative to chest):
     - Torso leans backward ($\theta_{spine} = +5^\circ..+12^\circ$).
     - Pelvis shifts forward ($+8..+18\text{px}$) to keep system COM centered over mid-foot.

### 5.3 Pushing & Pulling
- **Pushing**:
  - Feet brace behind COM ($\Delta X_{feet} < \Delta X_{com}$).
  - Body leans into the load; ground reaction pushes forward through ankles and hips into thoracic spine.
  - Arms extend in compression against object contact face.
- **Pulling**:
  - Feet brace ahead of COM ($\Delta X_{feet} > \Delta X_{com}$).
  - Body leans away from the load; heels take primary compressive load.
  - Kinetic chain pulls in tension through arms, shoulders, and core.

### 5.4 Catching & Momentum Absorption
When catching an object with mass $M_{obj}$ and velocity $\vec{v}_{obj}$:
1. **Impulse Calculation**:
   $$\vec{J} = M_{obj} \cdot (\vec{v}_{final} - \vec{v}_{initial})$$
2. **Compliance / Yielding Flexion**:
   - Arms do NOT freeze on impact.
   - Hands yield backward along the direction of $\vec{v}_{obj}$ by distance $\Delta x_{yield} \propto \|\vec{J}\|$.
   - Elbows flex by $+12^\circ..+35^\circ$ to absorb impact energy over $2..4$ frames.
   - Torso compresses and flexes slightly forward/backward to absorb momentum transfer.
   - Rear foot braces to resist tipping torque.

### 5.5 Throwing
1. **Kinetic Chain Sequencing**:
   - Ground drive $\to$ legs drive pelvis rotation $\to$ thoracic coil $\to$ shoulder whip $\to$ elbow extension $\to$ hand release.
2. **Release Continuity**:
   - Object releases at peak hand velocity ($\vec{v}_{obj, 0} = \vec{v}_{hand}(t_{release})$).
   - Character upper body experiences reaction recoil in opposite direction ($\vec{F}_{recoil} = -M_{obj} \vec{a}_{launch}$).
   - Follow-through settles over $3..6$ frames.

### 5.6 Striking & Collisions
- Relative mass determines collision outcome:
  $$v_{obj, after} = \frac{M_{limb} v_{limb} (1 + e)}{M_{limb} + M_{obj}}$$
  - Striking light object ($M_{obj} = 5$): Object accelerates rapidly away; striking limb experiences minimal recoil.
  - Striking heavy object ($M_{obj} = 150$): Object barely displaces; character limb recoils backwards, torso absorbs compression, and support foot slides or braces.

---

## 6. Verification Metrics

Every animation involving external mass or force must satisfy:
1. **Lever-Arm Proportionality**: Torso lean angle must correlate with $\tau = M_{obj} \cdot |\Delta X_{com}|$ ($R^2 \ge 0.88$).
2. **Zero Involuntary Teleportation**: Carried object position must strictly equal hand position + grip offset while `HELD`.
3. **Ground Load Balance**: $\sum F_y = (M_{char} + M_{obj}) \cdot g$ across all grounded support feet.
4. **Impact Absorption**: On catching or landing, deceleration occurs over $\ge 2$ frames with measurable joint compliance.
