---
name: "force-reaction-followthrough"
version: "3.0.0"
description: >-
  Bidirectional full-body force propagation, action-reaction chains, impact recoil, landing absorption,
  and inertial follow-through for articulated 2D characters, with computed impulses, energy budgets,
  environment-dependent reactions (gravity, surface, wind, medium) and latency-aware reflex timing.
requires: ["physics-environment-and-quantum"]
---

# Force Reaction & Follow-Through Skill (v3.0)

## 1. Newton's Third Law in Articulated Biomechanics

$$\sum\vec F_{action}=-\sum\vec F_{reaction},\qquad \Delta\vec P_{A}+\Delta\vec P_{B}=0\ \text{(isolated pair)}$$

### 1.1 Dynamic propagation ordering
The reaction sequence is never hard-coded; it follows:
1. **Point of origin**
   - Distal action (punch/throw): Hand → Wrist/Elbow → Shoulder → Thorax → Pelvis → Contralateral Hip → Stance Foot → Ground.
   - Ground impact (landing): Ground → Ankle → Knee → Hip → Pelvis Tilt → Spine Flex → Head Nod.
   - External torso impact: Ribs/Thorax → Upper Chest Shear → Lower Spine Flex → Pelvic Slide → Both Legs Brace.
2. **Direction & magnitude**: higher impulse travels deeper (into ground anchors).
3. **Support state**: grounded → reaction goes to ground shear (bounded by $\mu_sN$); airborne → rotation about the CoM.

### 1.2 Propagation timing (new)
Mechanical stress waves traverse the body in under a millisecond, so mechanically the whole body feels the load within the frame. What is **visible** is the neuromuscular response:
| Response | Delay | Frames @24 fps |
|---|---|---|
| Passive tissue deformation (soft tissue jiggle, joint give) | 0 ms | same frame |
| Short-latency stretch reflex | ~40 ms | ~1 |
| Balance / long-loop reflex | 80–120 ms | 2–3 |
| Deliberate counter-action | ≥150–250 ms | ≥4–6 |
So the first 1–2 frames after a hit are **passive** (limp, momentum-driven); only later does the character brace, step, or counter. [TUNE]

---

## 2. Reaction Modes with Calculations

### 2.1 Athletic Recoil (whiplash)
Conservation of angular momentum about the lumbar/pelvic girdle: kicking leg swings forward with $\dot\theta_{leg}>25^\circ$/frame, so the trunk counter-rotates.
$$\dot\theta_{trunk}=-\frac{I_{leg}}{I_{trunk}}\dot\theta_{leg}$$
- Example: $I_{leg}=1.2$ kg·m² (extended leg about hip, [TUNE]), $I_{trunk}=3.5$ kg·m²; leg at 25°/f gives trunk $-8.6^\circ$/f for the swing duration. Over 1.5 frames of peak swing this yields ≈ 10–13° posterior lean, matching the 10°–16° band.
- Contralateral arm extends as a counterweight, increasing arm inertia and reducing needed trunk lean.
- Hill cap: at maximal leg speed, force available falls (≈ 0.3 $F_0$ at 0.31 $v_{max}$ for peak power). Do not also give the leg full impact force.

### 2.2 Landing Force Cushioning (energy and force budget)
Energy to dissipate: $E=mg h+\tfrac12mv_0^2$. Over pelvic drop $d$ (average force $\bar F=E/d$):
$$a=\frac{v^2}{2d},\qquad F_{peak}\approx m(g+a)\ \text{(average)},\quad F_{peak}\approx1.3\text{–}1.8\times\ \text{average impact peak [TUNE]}$$
- **Example**: 70 kg lands from 0.5 m ($v=3.13$ m/s). Pelvic drop 0.30 m → $a=16.4$ m/s² (1.67 g), average ground force 1831 N (2.67 BW). Drop 0.15 m → $a=32.7$ m/s² (3.3 g), 4.3× BW average (≈ 2975 N), stiff-leg landing risk; show knees buckling or an additional roll.
- Frames: touchdown at $T$; compress $T+1\ldots T+3$ (knee 165° → 115°); rebound $T+4\ldots T+7$ (elastic return with tendon efficiency $\eta\approx0.9$, so ≈ 10 % energy is lost as heat per cycle).
- Pelvis drop scaled by speed: $d=v^2/(2a_{allow})$ with $a_{allow}\in[1.5g,\ 3g]$; keep stylistic floor $d\ge12$ px.
- **Environment variants**:
  - Soft sand / mat: ground yields too; $d_{total}=d_{body}+\delta_{ground}$, peak force lower, push-off weaker.
  - Moon ($g=1.62$): same takeoff effort gives higher $h$; landing from $h=3$ m: $v=3.12$ m/s, similar to Earth 0.5 m, compression looks the same but airtime ×6.
  - Underwater: landing force negligible; reaction is drag-damped (overdamped settle, no rebound).
  - Slope: asymmetric absorption; uphill foot lands first, trunk leans into slope by $\alpha$.

### 2.3 Impact Reaction (receiving a blow)
Impulse delivered: $J=m_{att}v_{rel}(1+e)\mu_{eff}$ (effective mass fraction $\mu_{eff}\approx0.3$–$0.6$ for fists/kicks [TUNE]).
- Defender velocity gain: $\Delta v=J/m_{def}$.
- **Example**: fist/hand effective mass 6 kg at 8 m/s, $e=0.2$ → $J=6\times8\times1.2=57.6$ N·s; on a 70 kg defender $\Delta v=0.82$ m/s (≈ 8.9 px/frame at 24 fps / 260 px/m). Dry-ground slide limit $v^2/(2\mu g)=4.3$ cm (11 px), so the natural response is a short stagger step, not a long slide.
- Distribution: impact point → local compression (chest/head snap), whole-body momentum → step or slide; head lag by ≥ 1 frame (neck inertia).

### 2.4 Follow-Through & Phase Lag
- Primary driver brakes first; intermediate segments overshoot 1–2 frames; extremities lag 2–3 frames, damped oscillation $\theta=\theta_t+\delta_0e^{-\zeta\omega_nt}\cos(\omega_dt)$.
- Choose $\zeta$: hair/cloth 0.1–0.3; relaxed arms 0.3–0.5; guarded limbs 0.7–1.0 [TUNE]. Settle time ≈ $4/(\zeta\omega_n)$.
- Wind shifts rest pose of cloth/hair by $\Delta=F_D/k$ and continues oscillating around it.

---

## 3. Verification Metrics

1. **Recoil proportionality**: maximum strike/throw velocity produces torso counter-lean ≥ 6° and matches $I_{leg}/I_{trunk}\cdot\Delta\theta$ within ±30 %.
2. **Landing depth**: $d\ge\max(12\ \text{px},\ v^2/(2\cdot3g))$; peak force logged and < 5 BW unless a roll/crouch is shown.
3. **Phase-staggered follow-through**: distal peak lags proximal by ≥ 40 ms (≥ 1 frame at 24 fps).
4. **Latency**: no deliberate counter-motion within the first 3 frames of an impact; passive response only.
5. **Friction honesty**: slide distance after impact within 25 % of $v^2/(2\mu g)$.
6. **Environment coherence**: landing cues change with gravity, surface compliance, medium.---
name: "force-reaction-followthrough"
version: "2.0.0"
description: >-
  Bidirectional full-body force propagation, action-reaction kinetic chains, impact recoil,
  and inertial follow-through for articulated 2D characters. Replaces unilateral limb posing
  with full-body biomechanical reactions governed by Newton's Third Law and conservation of momentum.
---

# Force Reaction & Follow-Through Skill (v2.0)

## 1. Newton's Third Law in Articulated Biomechanics

For every active acceleration or contact force exerted by a body segment, an equal and opposite reaction force propagates through the kinetic tree:
$$\sum \vec{F}_{action} = -\sum \vec{F}_{reaction}$$

### Dynamic Propagation Ordering
The reaction sequence is **never hard-coded** to a fixed order (e.g. "arms always react first"). The propagation sequence is determined by:
1. **Point of Origin**: Where does the force originate?
   - *Distal Extremity (e.g. Hand Punch / Ball Throw)*:
     $$\text{Hand} \to \text{Wrist/Elbow} \to \text{Shoulder} \to \text{Thorax} \to \text{Pelvis} \to \text{Contralateral Hip} \to \text{Stance Foot} \to \text{Ground}$$
   - *Ground Impact (e.g. Heavy Jump Landing)*:
     $$\text{Ground} \to \text{Ankle} \to \text{Knee Compression} \to \text{Hip Cushion} \to \text{Pelvis Tilt} \to \text{Spine Flex} \to \text{Head Nod}$$
   - *External Torso Impact (e.g. Heavy Push / Kick to Ribs)*:
     $$\text{Ribs / Thorax} \to \text{Upper Chest Shear} \to \text{Lower Spine Flex} \to \text{Pelvic Slide} \to \text{Both Legs Brace}$$
2. **Direction & Magnitude**: High-force impacts propagate deeper into the core and ground anchors than low-force micro-movements.
3. **Current Momentum & Support State**: A grounded character transfers reaction force into ground shear; an airborne character rotates freely about its Center of Mass.

---

## 2. Distinct Reaction Modes

### 2.1 Athletic Recoil (The Whiplash Effect)
During explosive actions (e.g. a maximum-effort soccer kick or baseball pitch):
- Kicking leg accelerates forward at high angular velocity ($\dot{\theta}_{leg} > 25^\circ/\text{frame}$).
- To conserve angular momentum around the pelvic/lumbar girdle, the **upper torso recoils backward** ($10^\circ..16^\circ$ posterior lean).
- Contralateral arm extends horizontally as a dynamic counterweight.
- If the upper body remained rigid, the character would tip backward or appear weightless.

### 2.2 Landing Force Cushioning
When touching down from a jump or ballistic fall:
1. **Touchdown (Frame $T$)**: Toes contact ground plane ($Y = 755.0\text{px}$).
2. **Compressive Cushion (Frames $T+1 .. T+3$)**:
   - Ankle dorsiflexes; knees flex from $165^\circ$ down to $115^\circ$ ($+50^\circ$ compression).
   - Pelvis drops by $\Delta Y = +18..+36\text{px}$.
   - Spine flexes forward ($+4^\circ..+8^\circ$) to absorb vertical deceleration.
   - Arms swing downward and slightly forward.
3. **Rebound & Elastic Settle (Frames $T+4 .. T+7$)**:
   - Stored tendon elastic energy extends knees back to neutral standing ($Y_{pelvis} = 512\text{px}$).

### 2.3 Follow-Through & Phase Lag
Segments decelerate in a staggered, overlapping phase sequence:
- Primary driver brakes first.
- Intermediate segments overshoot by $1..2$ frames.
- Free extremities (hands, head, cape, pony-tail) lag by $2..3$ frames, settling through damped harmonic oscillation.

---

## 3. Verification Metrics

1. **Recoil Proportionality**: Maximum strike or throw velocity must induce measurable counter-lean in the torso ($\ge 6.0^\circ$).
2. **Landing Compression Depth**: High falls ($V_y > 15\text{px/f}$) must produce at least $12\text{px}$ of pelvic compression.
3. **Phase-Staggered Follow-Through**: Peak distal displacement must lag proximal peak by at least 1 frame.
