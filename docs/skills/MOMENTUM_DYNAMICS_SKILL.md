---
name: "momentum-dynamics"
version: "3.0.0"
description: >-
  Linear and angular momentum conservation, rotational inertia, proximal-to-distal kinetic chains,
  friction-limited braking, drag and wind effects, fluid/low-gravity variants, and damped follow-through
  for articulated 2D characters. All limits derive from environment variables instead of fixed pixel constants.
requires: ["physics-environment-and-quantum"]
---

# Momentum Dynamics & Kinetic Transfer Skill (v3.0)

## 1. Linear Momentum, Braking and Reversal

$$\vec P=M\vec V_{com},\qquad \vec J=\int\vec F\,dt=\Delta\vec P$$

### 1.1 Cardinal Law of Directional Reversal
A character cannot flip $V_x$ from negative to positive in one frame. To reverse:
1. **Braking plant**: lead foot lands ahead of CoM by $\Delta X_{brake}$. Geometric requirement from friction: the ground reaction must pass through the CoM region, so $\tan\phi=\dfrac{a_{brake}}{g}\le\mu_s$ and the plant offset is $\Delta X\approx h_{CoM}\,\dfrac{a_{brake}}{g}$.
2. **Friction retardation**: $a_{max}=\mu_s g$.
3. **Deceleration time**: $t_{brake}\ge v/(\mu_s g)$.
4. **Compression cushion**: pelvis lowers 8–18 px (≈ 0.03–0.07 m) while knees absorb energy.
5. **Push-off reversal**: trailing foot pushes off; acceleration again ≤ $\mu_sg$.

### 1.2 Worked example (24 fps, 260 px/m)
- Walk speed 1.3 m/s = 14.08 px/f. Dry rubber/concrete $\mu_s=0.8$: $a_{max}=7.85$ m/s² = 3.54 px/f². Minimum stop time 0.166 s = **3.98 frames**. So the "≥3 frame" rule is consistent but the true minimum depends on the surface.
- Plant offset at max braking: $h=1.0$ m, $a/g=0.8$ → $\Delta X\approx0.8$ m: impossible for a walk stride, so real reversals use partial braking over several steps. Typical comfortable braking uses $a\approx0.3g$ → offset 0.3 m (78 px), time 0.44 s ≈ 10.6 frames.
- Ice ($\mu_s=0.1$): minimum stop time 1.33 s (32 frames) and stopping distance 0.86 m. The character slides; show short pigeon-step braking and arms out.
- Ramp $10:6:3:1$ is the **shape** of a good deceleration profile (fractions 0.50, 0.30, 0.15, 0.05 of $\Delta v$); the **length** comes from $v/(\mu g)$ or comfort limit, whichever is longer.

### 1.3 Drag and wind on momentum
$$M\dot{V}=-\tfrac12\rho C_dA\,|V-V_{wind}|(V-V_{wind})$$
- Running at 6 m/s in still air, $C_dA=0.7$: $F=\tfrac12(1.225)(0.7)(36)=15.4$ N (≈ 0.22 m/s² decel, 0.025 g). Small but it sets forward lean. In a 10 m/s headwind, $v_{rel}=16$ m/s → 110 N, lean ≈ 9°.
- Water: replace $\rho$ by 1000; same running speed gives ~12.6 kN-scale force (unrealistic), so speed collapses to ≤ 1–2 m/s. Use overdamped, smooth motion.

### 1.4 Reduced / modified gravity
- Moon ($g=1.62$): braking is still limited by $\mu g$, so $a_{max}$ drops 6×; stopping distance ×6; strides long and floaty; pelvis compression for same $v$ unchanged.
- Time-of-flight scales $1/g$; dimensionless Froude number $Fr=v^2/(gl)$ preserves gait type (walk→run transition near $Fr\approx0.5$) [STD].

---

## 2. Angular Momentum & Rotational Inertia

$$\vec L=\sum_i\big(\vec r_i\times m_i\vec v_i+I_i\vec\omega_i\big),\quad I_i=m_i(k_il_i)^2$$

### 2.1 Rotational inertia modulation
- Tucked: low $I$ → high $\omega$. Extended: high $I$ → low $\omega$ (emergency rotational brake).
- **Numerical**: body $I$ about CoM ≈ 12 kg·m² tucked vs ≈ 25 kg·m² extended [TUNE] (factor ≈ 2). A tumble with $L=40$ kg·m²/s spins at 3.33 rad/s tucked (191°/s, 8°/frame at 24 fps) vs 1.6 rad/s extended (92°/s, 3.8°/frame).
- In flight, $L$ is conserved; ground torque only through feet.

### 2.2 Pelvic–thoracic counter-rotation
With $\sum\tau_z=0$: $I_p\dot\theta_p+I_t\dot\theta_t\approx0$. When the right hip drives forward, shoulders counter-rotate $1.5^\circ$–$6^\circ$. The ratio of rotations is the inverse inertia ratio: $\dot\theta_t/\dot\theta_p=-I_p/I_t$ (pelvis/thorax inertia ratio ≈ 0.3–0.5 [TUNE], so the thorax moves *less*, in the opposite direction).

---

## 3. Kinetic Chain Acceleration (Proximal → Distal)

$$\text{GROUND}\to\text{LEGS}\to\text{PELVIS}\to\text{TORSO}\to\text{ARMS}\to\text{EXTREMITY}$$

### 3.1 Phase lag
- Peak pelvis speed at frame $T$; torso $T+1$; arm $T+2$; hand/foot at contact with maximum speed.
- Phase lag in seconds rather than frames: 40–80 ms between successive segments in a maximal throw/strike [TUNE]. At 24 fps this is 1–2 frames, at 60 fps 2–5 frames. **Define lags in ms and convert, never hard-code frames.**

### 3.2 Why distal segments get faster
Angular-momentum transfer between segments: when a heavy proximal segment slows, a lighter distal one speeds up by the inverse inertia ratio (for simple two-body transfer, $\omega_d\approx\omega_p\,I_p/I_d$ if $L$ is passed intact). Real motion also uses muscle torque at the joint, but Hill's curve caps hand speed: at high $u$ the hand cannot add more force.

### 3.3 Speed budget example (overhand throw)
Hand release speed $v_{hand}$ ≈ sum of segment contributions (tunable shares): legs 15 %, trunk rotation 30 %, shoulder 25 %, elbow 20 %, wrist 10 %. For a 25 m/s release the legs/pelvis contribute ≈ 3.8 m/s, the trunk ≈ 7.5 m/s.

---

## 4. Overshoot & Follow-Through

When a heavy segment stops, lighter extremities continue.
$$\theta(t)=\theta_{target}+\delta_0e^{-\gamma t}\cos(\omega_dt),\quad\omega_d=\omega_n\sqrt{1-\zeta^2}$$
- Choose $\zeta$ by material: hair/cloth 0.1–0.3, relaxed arm 0.3–0.5, controlled limb 0.7–1.0 [TUNE].
- Settle time (2 %): $t_s\approx4/(\zeta\omega_n)$. Aim 2–4 frames for arms at 24 fps → $\zeta\omega_n\approx40$–$80$ s⁻¹.
- Overshoot amplitude estimate: $\delta_0\propto M_{seg}V_{arrival}$ (keep proportional, capped by joint limits).
- Add wind: cloth/hair equilibrium shifts by $\Delta=F_D/k$ (drag over stiffness) and oscillates about the shifted rest pose.

---

## 5. Verification Metrics

1. **Acceleration bounds (replaces old 45 px/f² limit)**: horizontal ground-driven $|a_x|\le1.2\mu_sg$ (≈ 4.2 px/f² on dry ground at 24 fps / 260 px/m). Vertical: push-off ≤ 3g (13.3 px/f²), landing impact peak ≤ 5g (22 px/f²) [TUNE]. The old 45 px/f² equals ≈ 10 g and was unrealistic for a standing character.
2. **Reversal ramp**: sign change of $V_x$ preceded by ≥ $v/(\mu_sg)$ seconds (converted to frames), minimum 3.
3. **Kinetic chain order**: proximal peak precedes distal peak by ≥ 40 ms.
4. **Follow-through**: actions above 20 px/f show damped overshoot; $\zeta$ logged.
5. **Angular conservation in flight**: $|\Delta L|/L<2\%$ per frame with no ground contact.
6. **Environment consistency**: braking distance within 25 % of $v^2/(2\mu g)$, lean angle within ±1.5° of $F_D/(mg)$.---
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
