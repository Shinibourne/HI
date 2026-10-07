---
name: "procedural-animation-and-character-kinematics"
version: "1.0.0"
description: >-
  Procedural Animation, Connected Articulated Kinematics, Dynamic Balance, and Physics-Driven
  Locomotion Framework for 2D stickfigures and Stick Nodes v334 binary format. Integrates analytical
  two-bone Inverse Kinematics (IK), Forward Kinematics (FK), Center of Mass (CoM) tracking, Base of Support
  equilibrium, stance foot pinning, parabolic motion arcs, target-directed combat reaching, and
  authored-keyframe-guided procedural transition solving.
---

# Procedural Animation & Character Kinematics (v1.0)

## 1. Core Purpose & Architectural Philosophy

The **Procedural Animation & Character Kinematics** framework transforms 2D skeletal animation from disjointed, frame-by-frame joint placement into a **connected, physics-aware, mechanically coherent articulated system**.

Rather than treating each limb and bone as an isolated rotation value:
1. **The character is an articulated body**: Every bone exists in a deterministic kinematic tree where motion in parent nodes (Pelvis, Chest, Shoulder, Hip) naturally propagates through child nodes (Thigh, Shin, Foot, Bicep, Forearm, Hand).
2. **Kinematic solvers dictate intermediate joints**: End-effectors (feet, hands, head) reach targets via **Analytical Two-Bone Inverse Kinematics (IK)** and **FABRIK (Forward And Backward Reaching Inverse Kinematics)**, preserving joint constraints and natural human bending polarity.
3. **Dynamic balance governs root and torso compensation**: Moving a leg or throwing an arm shifts the body's **Center of Mass (CoM)**. The pelvis and torso automatically counter-pitch and counter-shift to maintain equilibrium over the **Base of Support (BoS)**.
4. **Stance pinning guarantees zero foot sliding**: Planted feet remain strictly locked in world space ($Y_{ground} = \text{const}$, $X_{contact} = \text{const}$) while the pelvis drives locomotion.
5. **Authored key poses serve as physical boundary constraints**: Key dramatic poses (the peak of a windup, the contact of a strike, the apex of a jump) are preserved as primary constraints, while procedural kinematics solves the transitions, arcs, momentum transfer, and secondary drag between them.

---

## 2. Anatomical Skeleton Hierarchy & Stick Nodes v334 Topology

The standard Stick Nodes 17-node human stickfigure rig operates under a strict hierarchical tree:

```
[00: Pelvis] (Root / Scene Anchor)
 ├── [01: R Thigh]
 │    └── [02: R Shin]
 │         └── [03: R Foot] (End-Effector: Ankle/Toe)
 ├── [04: L Thigh]
 │    └── [05: L Shin]
 │         └── [06: L Foot] (End-Effector: Ankle/Toe)
 └── [07: Spine / Torso]
      ├── [08: Neck]
      │    └── [13: Head / Circle] (End-Effector: Head)
      ├── [09: R Bicep]
      │    └── [10: R Forearm]
      │         └── [11: R Hand] (End-Effector: Wrist/Fist)
      └── [12: L Bicep]
           └── [14: L Forearm]
                └── [15: L Hand] (End-Effector: Wrist/Fist)
```

### 2.1 Stick Nodes Local vs World Coordinate Mapping
Stick Nodes frame records store angles as **local relative offsets** ($a_1$) from the parent bone:
$$\theta_{\text{world}}(i) = \theta_{\text{world}}(\text{parent}(i)) + a_1(i)$$
$$a_1(i) = \theta_{\text{world}}(i) - \theta_{\text{world}}(\text{parent}(i)) \pmod{360^\circ}$$

For the root (Pelvis, index 0), $a_1(0) \equiv \theta_{\text{world}}(0)$.

### 2.2 Forward Kinematics (FK) Propagation
For any joint $i$ with parent $p = \text{parent}(i)$ and bone length $L_i$ (scaled by global figure scale $S$):
$$P_{\text{start}}(i) = \begin{cases} (X_{\text{scene}}, Y_{\text{scene}}) & \text{if } p = -1 \\ P_{\text{end}}(p) & \text{if } p \ge 0 \end{cases}$$
$$P_{\text{end}}(i) = P_{\text{start}}(i) + \begin{pmatrix} L_i \cdot S \cdot \cos(\theta_{\text{world}}(i)) \\ -L_i \cdot S \cdot \sin(\theta_{\text{world}}(i)) \end{pmatrix}$$
*(Note: In screen space, Y increases downwards, so $-\sin(\theta)$ represents upward vertical movement in standard trigonometric orientation).*

---

## 3. Inverse Kinematics (IK) & Joint Polarity Laws

When an end-effector (foot or hand) must reach a target point $T = (T_x, T_y)$ from origin $O = (O_x, O_y)$ across two bones of lengths $L_1$ and $L_2$:

### 3.1 Analytical Two-Bone Law of Cosines Solver
1. **Target Reach Distance**:
   $$D = \|T - O\| = \sqrt{(T_x - O_x)^2 + (T_y - O_y)^2}$$
   $$D_{\text{clamped}} = \text{clamp}(D, |L_1 - L_2| + 0.01, L_1 + L_2 - 0.001)$$
2. **Interior Joint Flexion Angle $\beta$**:
   $$\cos(\beta) = \frac{L_1^2 + L_2^2 - D_{\text{clamped}}^2}{2 L_1 L_2}$$
   $$\beta = \arccos(\text{clamp}(\cos(\beta), -1, 1))$$
3. **Base Joint Angle Adjustment $\alpha$**:
   $$\phi = \operatorname{atan2}(-(T_y - O_y), T_x - O_x)$$
   $$\psi = \arccos\left(\text{clamp}\left(\frac{L_1^2 + D_{\text{clamped}}^2 - L_2^2}{2 L_1 D_{\text{clamped}}}, -1, 1\right)\right)$$
   $$\theta_1 = \phi \pm \psi \quad (\text{sign determined by knee/elbow bend polarity})$$
   $$\theta_2 = \theta_1 \mp (180^\circ - \beta)$$

### 3.2 Human 1-DOF Polarity Invariants (Anti-Flamingo Law)
- **Knees (Facing Right +X)**: The human knee flexes **backward**. The kneecap always faces anteriorly (+X).
  - In screen space, $\theta_{\text{shin}} \le \theta_{\text{thigh}}$ (shin sweeps counter-clockwise / backward relative to thigh).
  - Cross product vector: $(P_{\text{knee}} - P_{\text{hip}}) \times (P_{\text{ankle}} - P_{\text{knee}}) \ge 0$.
  - Knee hyperextension ($\beta < 0^\circ$ or reverse bend) is mathematically clamped to straight ($0^\circ$).
- **Elbows (Facing Right +X)**: The human elbow flexes anteriorly or downward toward the chest; olecranon points posteriorly (-X).
  - Reverse elbow hyperextension past $180^\circ$ is forbidden.

---

## 4. Center of Mass (CoM) & Dynamic Equilibrium

Believable character motion requires understanding why a character does not fall over.

### 4.1 Anthropometric Mass Distribution for 17-Node Rig
Each segment contributes a fractional mass $m_i$ and midpoint center of mass:

| Bone Index & Name | Anatomical Segment | Mass Ratio ($m_i / M_{\text{total}}$) |
|---|---|---|
| 00: Pelvis | Pelvic Core & Lower Abdomen | 0.22 |
| 07: Spine / Torso | Upper Abdomen & Thorax | 0.28 |
| 08: Neck | Cervical Spine | 0.03 |
| 13: Head | Cranium & Facial Mass | 0.07 |
| 01, 04: Thighs (R/L) | Femoral Upper Leg (x2) | 0.10 each (0.20 total) |
| 02, 05: Shins (R/L) | Tibial Lower Leg (x2) | 0.05 each (0.10 total) |
| 03, 06: Feet (R/L) | Tarsal & Metatarsal (x2) | 0.015 each (0.03 total) |
| 09, 12: Biceps (R/L) | Brachial Upper Arm (x2) | 0.02 each (0.04 total) |
| 10, 14: Forearms (R/L)| Radial/Ulnar Lower Arm (x2)| 0.012 each (0.024 total)|
| 11, 15: Hands (R/L) | Carpal & Phalangeal (x2) | 0.003 each (0.006 total)|

### 4.2 Total Center of Mass (CoM)
$$\vec{R}_{\text{com}} = \frac{\sum_{i=0}^{16} m_i \cdot \vec{r}_i}{\sum_{i=0}^{16} m_i}$$
where $\vec{r}_i = \frac{1}{2}(P_{\text{start}}(i) + P_{\text{end}}(i))$ is the spatial centroid of bone segment $i$.

### 4.3 Base of Support (BoS) & Static vs Dynamic Stability
- **Base of Support (BoS)**: The horizontal convex hull defined by all body points in rigid ground contact ($Y \approx Y_{\text{ground}}$):
  $$[\min(X_{\text{contact}}), \max(X_{\text{contact}})]$$
- **Static Equilibrium**: The character remains stable without acceleration if:
  $$X_{\text{com}} \in [\min(X_{\text{contact}}), \max(X_{\text{contact}})]$$
- **Dynamic Compensatory Balance**:
  - When a major limb extends forward (e.g., right leg kicking forward at $+X$), $X_{\text{com}}$ shifts forward.
  - To prevent falling, the procedural controller **counter-pitches the torso backward** ($\Delta \theta_{\text{spine}} < 0$) and **translates the pelvis slightly backward** ($\Delta X_{\text{pelvis}} < 0$).
  - When sitting up from the floor, the trunk folds forward by $35^\circ$–$45^\circ$ specifically to pull $X_{\text{com}}$ over the feet before the hips can physically leave the ground.

---

## 5. Stance Pinning, Foot-Roll & Zero-Slip Discipline

### 5.1 The Stance Constraint
During single-support or double-support stance phases:
1. The grounded foot tip/ankle coordinates must remain **fixed in world space**:
   $$P_{\text{foot}}(t) = P_{\text{foot}}(t_0) = (X_{\text{planted}}, Y_{\text{ground}})$$
2. As the character's pelvis translates forward ($X_{\text{pelvis}}(t) = X_0 + v \cdot t$), the leg's hip position moves:
   $$P_{\text{hip}}(t) = P_{\text{pelvis}}(t) + \Delta P_{\text{hip}}$$
3. The thigh and shin angles are **recomputed via Analytical IK** for every frame:
   $$\{\theta_{\text{thigh}}(t), \theta_{\text{shin}}(t)\} = \operatorname{SolveLegIK}(P_{\text{hip}}(t), P_{\text{foot}}(t_0), L_{\text{thigh}}, L_{\text{shin}})$$
4. This ensures that the foot **never slips by even a fraction of a pixel** across the ground surface.

### 5.2 Foot-Roll Mechanics (Three-Rocker Gait)
A natural human step cycle transitions through three distinct rockers:
- **Heel Strike**: Initial contact with ankle dorsiflexion ($+10^\circ$).
- **Mid-Stance (Foot Flat)**: Full ground contact, ankle flexes smoothly as the tibia rolls forward over the talus.
- **Push-Off (Ball of Foot)**: Heel lifts, ankle plantarflexes ($-20^\circ$ to $-30^\circ$) while toe stays pinned, driving body momentum forward.

---

## 6. Procedural Motion Curves & Curvilinear Arcs

Human motion does not occur along straight Cartesian lines; limbs travel along **curved arcs of rotation** driven by torque and joint pivots.

### 6.1 Swing Phase Parabolic Clearance Arc
For a swinging leg or traveling hand from start $P_0$ to destination $P_1$ over duration $T$:
$$u = \frac{t}{T} \in [0, 1]$$
$$X(u) = (1 - u) X_0 + u X_1$$
$$Y(u) = (1 - u) Y_0 + u Y_1 - 4 \cdot H_{\text{apex}} \cdot u (1 - u)$$
where $H_{\text{apex}}$ is the clearance height above the direct path.

### 6.2 Acceleration & Deceleration Profiles (Quintic Smoothstep)
Linear interpolation creates robotic, stiff motion. Transitions use smoothstep or quintic polynomial easing:
$$S(u) = 6 u^5 - 15 u^4 + 10 u^3$$
with zero first and second derivatives at boundaries ($\dot{S}(0) = \dot{S}(1) = 0, \ddot{S}(0) = \ddot{S}(1) = 0$).

### 6.3 Anticipation & Damped Harmonic Settling
- **Anticipation Dip**: Before an explosive forward movement (jump, sprint start, kick), the character crouches or settles back along an opposing trajectory ($\Delta X < 0, \Delta Y > 0$).
- **Harmonic Settling (Moving Hold)**: After reaching a target pose, residual kinetic energy dissipates as a damped spring oscillator:
  $$\theta(t) = \theta_{\text{target}} + A \cdot e^{-\zeta \omega_n t} \cos(\omega_d t)$$
  eliminating unnatural mannequin dead-freezes.

---

## 7. Target-Directed Contact Solving & Interaction

When interacting with props (e.g., kicking a ball) or other characters (e.g., blocking a punch):
1. **Meaningful Contact Invariant**: The striking limb endpoint must physically converge with the target surface at the impact keyframe ($t_{\text{impact}}$):
   $$\|P_{\text{toe}}(t_{\text{impact}}) - P_{\text{target}}(t_{\text{impact}})\| \le R_{\text{target}}$$
2. **Hit-Stop (Impact Freeze)**: A 1-to-2 frame freeze where character velocities drop to zero, emphasizing momentum transfer before launch.
3. **Ballistic Prop Launch**: At $t_{\text{impact}}$, the prop inherits impulse velocity $\vec{v}_0$ and proceeds along a physical ballistic trajectory:
   $$\vec{r}_{\text{ball}}(t) = \vec{r}_0 + \vec{v}_0 \cdot \Delta t + \frac{1}{2} \vec{g} \cdot \Delta t^2$$
4. **Follow-Through & Recoil**: The striking limb continues along its momentum arc past the impact point, while the body absorbs recoil through support leg compression and torso counter-rotation.

---

## 8. Integration Protocol for Stick Nodes Projects

When generating or refining a Stick Nodes project with this skill:
1. **Audit Authored Keyframes**: Identify the core story beats and intended poses.
2. **Construct Kinematic Chains**: Map all joints to the 17-node hierarchy.
3. **Execute IK and CoM Solvers**: Calculate intermediate poses, stance pinning, and balance compensations.
4. **Verify Ground & Polarity Invariants**:
   - Planted feet strictly on $Y_{\text{ground}} = 755.0\text{ px}$.
   - No backward bending knees (flamingo legs).
   - CoM stays within stability thresholds or accelerates along intentional momentum trajectories.
5. **Serialize to v334 Format**: Write proper parent-relative angles ($a_1$), header frame rates (0x0C for 12 FPS, 0x18 for 24 FPS), and maintain GZIP container integrity.
