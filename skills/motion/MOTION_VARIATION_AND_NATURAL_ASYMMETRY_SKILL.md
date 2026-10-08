---
name: "motion-variation-and-natural-asymmetry"
version: "2.0.0"
description: >-
  Causal biomechanical asymmetry and organic variation framework for articulated 2D characters.
  Eliminates robotic bilateral twinning and synchronized clone limbs by deriving natural asymmetry
  from physical causes: momentum history, uneven load distribution, dominant stance bias, and gait phase offset.
---

# Motion Variation & Natural Asymmetry Skill (v2.0)

## 1. The Anti-Twinning Principle

In nature, living human bodies are **never mathematically symmetrical**:
- Left and right arms do not sweep with identical angular arcs.
- The spine exhibits subtle lateral curvature.
- Stance leg and free leg experience completely different load-bearing demands.

### The Cardinal Rule of Organic Variation
**Do not add arbitrary noise or random jitter.**
Random noise creates vibrating, twitching stick figures.
**Instead, asymmetry must emerge from authentic physical causes:**
1. **Load Asymmetry**: An object held in one hand or on one shoulder.
2. **Dominant Lead Stance**: Boxer or sprinter stance with one side forward and coiled.
3. **Phase-Offset Pendulums**: Arm swing periods modulated by walking velocity.
4. **Action History & Inertial Memory**: A limb that just threw a punch carries residual momentum that its partner does not share.

---

## 2. Mathematical Asymmetry Formulations

### 2.1 Locomotion Bilateral Offset
During steady walking or running:
- **Phase Offset**: Left and right limbs operate in anti-phase ($\Delta \phi = \pi$).
- **Amplitude Asymmetry**:
  $$\theta_{arm, R}(t) = \bar{\theta}_R + A_{swing} \cdot (1 + \delta_{bias}) \cdot \sin(\omega t)$$
  $$\theta_{arm, L}(t) = \bar{\theta}_L - A_{swing} \cdot (1 - \delta_{bias}) \cdot \sin(\omega t + \epsilon_{phase})$$
  Where $\delta_{bias} \approx 0.05..0.12$ (natural dominance bias) and $\epsilon_{phase} \approx 0.08\text{ rad}$ (subtle timing lag).
- **Elbow Flexion Contrast**: One arm flexes slightly tighter ($3^\circ..8^\circ$ more) than the other during forward drive.

### 2.2 Postural Weight Shift (Contrapposto)
When a character stands at ease:
- One leg acts as the primary weight-bearing pillar ($75\%..85\%$ of body weight).
- Pelvis tilts toward the unweighted side ($\pm 3^\circ..6^\circ$).
- Spine curves slightly in opposition to keep cranium centered over the supporting foot.
- Unweighted leg relaxes with knee slightly flexed ($10^\circ..20^\circ$).

---

## 3. Verification Metrics

1. **Anti-Twinning Margin**: Bilateral limbs performing simultaneous idle or walking actions must differ by at least $3.0^\circ$ in instantaneous angle.
2. **Deterministic Reproducibility**: Given identical seed and configuration, frames must generate identically (no unseeded `Math.random()` jitter).
3. **Causal Justification**: Every asymmetric posture must correlate with a physical support, load, or momentum differential.
