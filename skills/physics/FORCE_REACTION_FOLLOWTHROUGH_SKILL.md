---
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
