---
name: "momentum-dynamics"
version: "2.0.0"
description: >-
  General-purpose linear and angular momentum conservation, rotational inertia, multi-segment kinetic chains,
  braking deceleration ramps, and momentum redirection physics for articulated 2D characters.
  Prevents abrupt, physically impossible velocity snaps and mandates causal braking, overshoot, and counter-rotation.
---

# Momentum Dynamics & Kinetic Transfer Skill (v2.0)

## 1. Linear Momentum Conservation & Braking Mechanics

In Newtonian mechanics, momentum is the product of mass and velocity:
$$\vec{P}_{linear} = M_{total} \vec{V}_{com}$$

### Cardinal Law of Directional Reversal
**A character cannot switch from moving left ($\vec{V}_x < 0$) to moving right ($\vec{V}_x > 0$) in a single frame.**
To reverse direction:
1. **Braking Plant**: Lead foot plants ahead of the Center of Mass ($\Delta X_{brake} = X_{foot} - X_{com} > 25\text{px}$).
2. **Friction Retardation**: Normal force and horizontal ground friction apply a braking impulse:
   $$\vec{J}_{brake} = \int_{t_1}^{t_2} \vec{F}_{friction} dt = \Delta \vec{P}$$
3. **Deceleration Phase**: Velocity decelerates smoothly over $\ge 3$ frames following a natural deceleration ramp ($10 : 6 : 3 : 1$).
4. **Compression Cushion**: Pelvis lowers ($Y_{pelvis} + 8..+18\text{px}$) as knees absorb kinetic energy.
5. **Push-Off Reversal**: Trailing foot pushes off to accelerate in the opposite direction.

---

## 2. Angular Momentum & Rotational Inertia

For an articulated body composed of $N=17$ segments:
$$\vec{L}_{angular} = \sum_{i=1}^{17} \left( \vec{r}_i \times m_i \vec{v}_i + I_{segment, i} \vec{\omega}_i \right)$$

### 2.1 Rotational Inertia Modulation
The character's resistance to angular acceleration depends on how mass is distributed relative to the axis of rotation:
$$I_{system} = \sum_{i=1}^{17} m_i r_i^2$$
- **Tucked / Chambered Pose (Low $I$)**: Limbs pulled close to the spinal axis (e.g. knees high, elbows flexed). High rotational speed ($\omega = L / I_{low}$).
- **Extended / Outstretched Pose (High $I$)**: Limbs extended wide (e.g. arms spread, legs split). Low rotational speed ($\omega = L / I_{high}$); acts as an emergency rotational brake.

### 2.2 Pelvic-Thoracic Counter-Rotation
When external torque about the vertical spinal axis is zero ($\sum \tau_z = 0$), total angular momentum is conserved:
$$\frac{dL_z}{dt} = 0 \implies I_{pelvis} \dot{\theta}_{pelvis} + I_{thorax} \dot{\theta}_{thorax} \approx 0$$
- When hips drive forward (e.g. right hip forwards during running or kicking), the shoulder girdle and thoracic spine **counter-rotate in anti-phase** ($1.5^\circ..6^\circ$ differential).
- Eliminates robotic plank-torso movement.

---

## 3. Kinetic Chain Acceleration (Proximal to Distal)

Power in athletic human movements (punches, kicks, throws, jumps) transfers sequentially from large, heavy segments to small, fast segments:

$$\text{GROUND} \xrightarrow{\vec{F}_{react}} \text{LEGS (Thighs/Shins)} \xrightarrow{\vec{\tau}_{hip}} \text{PELVIS} \xrightarrow{\vec{\tau}_{core}} \text{TORSO / CHEST} \xrightarrow{\vec{\tau}_{shoulder}} \text{ARMS} \xrightarrow{\vec{\tau}_{wrist}} \text{EXTREMITY}$$

### Phase Lag Discipline
- **Peak Pelvis Velocity**: Occurs first (Frame $T$).
- **Peak Torso Velocity**: Lags by $1..2$ frames (Frame $T + 1$).
- **Peak Arm/Limb Velocity**: Lags by $2..3$ frames (Frame $T + 2$).
- **Peak Hand/Foot Contact**: Arrives with maximum velocity and zero phase delay at target.

---

## 4. Overshoot & Follow-Through Mechanics

When a heavy segment stops, connected lighter extremities continue moving due to inertia:
1. **Primary Segment Decelerates**: Torso or pelvis reaches destination and decelerates.
2. **Secondary Extremities Overshoot**: Arms, head, hair, and clothing overshoot the resting target position by $\delta_{overshoot} \propto M_{segment} V_{arrival}$.
3. **Harmonic Settle**: Extremities return to equilibrium over $2..4$ frames via a damped oscillator curve:
   $$\theta(t) = \theta_{target} + \delta_0 e^{-\gamma t} \cos(\omega t)$$

---

## 5. Verification Metrics

1. **Velocity Derivative Continuity**: Peak acceleration $|\vec{a}_{com}| \le 45\text{px/frame}^2$ across transitions (no discontinuous step changes).
2. **Reversal Deceleration Ramp**: Directional sign changes in root velocity must exhibit at least a 3-frame deceleration sequence.
3. **Kinetic Chain Sequentiality**: Proximal segment peak velocity precedes distal segment peak velocity by $\ge 1$ frame.
4. **Follow-Through Presence**: High-speed actions ($V > 20\text{px/frame}$) must display measurable follow-through and recoil.
