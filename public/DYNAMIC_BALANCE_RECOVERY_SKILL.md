---
name: "dynamic-balance-recovery"
version: "2.0.0"
description: >-
  Dynamic balance, center-of-mass (COM) equilibrium, base-of-support (BOS) stability margins,
  and biomechanical perturbation recovery strategies (ankle, hip, arm counterbalance, and stepping)
  for articulated 2D characters. Governs realistic stumbles, tripping, controlled instability,
  and athletic recovery without random jitter.
---

# Dynamic Balance & Recovery Skill (v2.0)

## 1. Core Principle: Balance as an Active Dynamical Equilibrium

A character does not remain balanced merely because feet are glued to the ground. Balance is an active neuromuscular equilibrium governed by the relationship between the **Center of Mass (COM)**, its **Velocity ($\vec{V}_{com}$)**, and the **Base of Support (BOS)**:

$$\vec{P}_{xcom} = \vec{P}_{com} + \frac{\vec{V}_{com}}{\omega_0}, \quad \omega_0 = \sqrt{\frac{g}{L_{leg}}}$$

Where:
- $\vec{P}_{xcom}$ is the **Extrapolated Center of Mass (XCoM)** (Hof et al. dynamic stability criterion).
- $L_{leg} \approx 243\text{px}$ (effective pendulum leg length).
- $\omega_0$ is the eigenfrequency of the inverted pendulum model.

### Cardinal Balance Condition
- **Static Equilibrium**: $\vec{P}_{com} \in \text{BOS}$.
- **Dynamic Equilibrium**: $\vec{P}_{xcom} \in \text{BOS}$.
- **Instability / Tipping**: $\vec{P}_{xcom} \notin \text{BOS}$.

When $\vec{P}_{xcom}$ exits the Base of Support, the character will tip or fall unless a **biomechanical recovery action** is triggered.

---

## 2. The 4 Biomechanical Recovery Strategies

The system selects from 4 authentic human balance strategies based on the perturbation magnitude:

```
PERTURBATION MAGNITUDE
│
├── Level 1: Minor (|ΔX| < 15px) ────► Ankle Strategy (Inverted pendulum plantar/dorsiflexion)
│
├── Level 2: Moderate (15px ≤ |ΔX| < 35px) ► Hip Strategy (Rapid trunk counter-pitch & pelvic shear)
│
├── Level 3: Rotational / Dynamic ───► Arm Counterbalance (Anti-phase arm abduction)
│
└── Level 4: Severe (|ΔX| ≥ 35px) ────► Stepping Strategy (Stumble step, crossover step, base realignment)
```

### 2.1 Ankle Strategy (Low Perturbation, Rigid Contact)
- The body sways as a single-segment inverted pendulum centered at the ankle joint.
- Ankle produces restoring torque $\tau_{ankle} = -k_{ankle} \Delta \theta - c_{ankle} \dot{\theta}$.
- Torso, hips, and knees remain aligned with minimal inter-segment flexion ($< 2^\circ$).

### 2.2 Hip Strategy (Moderate Perturbation, Compliant or Limited Base)
- When ankle torque is insufficient or support base is narrow (e.g. beam or toe contact):
- Upper body rapidly rotates in the direction of the fall to generate inertial reaction torque:
  $$\tau_{reaction} = -I_{torso} \ddot{\theta}_{trunk}$$
- The pelvis shears in the opposite direction ($\Delta X_{pelvis} = -\text{sgn}(\Delta X_{com}) \cdot 12..25\text{px}$).
- Lower spine and upper chest pitch forward or backward by $10^\circ..22^\circ$.

### 2.3 Arm Counterbalance Strategy
- Rapid bilateral arm abduction ($+30^\circ..+70^\circ$) to increase whole-body moment of inertia ($I_{system} = \sum m_i r_i^2$).
- Asymmetric arm swing to cancel angular momentum about the spinal axis.
- Arms lag trunk acceleration by $1..2$ frames, then snap outward to arrest angular momentum.

### 2.4 Stepping Strategy (Recovery Steps)
- When XCoM penetrates beyond the support boundary by $> 25\text{px}$:
- Stance leg unloads; contralateral swing leg initiates an emergency recovery step:
  $$X_{target\_foot} = P_{xcom} + \Delta X_{safety\_margin}$$
- The swing foot travels along a rapid parabolic arc, planting firmly at ground plane ($Y = 755.0\text{px}$).
- Touchdown impact absorbs momentum with knee compression ($+15^\circ..+30^\circ$ flexion).
- Base of support is instantly realigned to encompass the new COM position.

---

## 3. Controlled Instability vs. False Jitter

A core failure mode in procedural animation is generating fake instability through random frame-to-frame noise.

### Anti-Jitter Rule
**Instability must have a physical cause, a continuous trajectory, and a coherent recovery sequence:**
1. **Initial Perturbation / Cause**: An external push, trip obstacle, or intentional forward drive introduces an unbalance impulse.
2. **Trajectory of COM**: COM follows a smooth, continuous second-order differential curve ($\ddot{x} = F_{net}/M$).
3. **Delayed Neuromuscular Response**: Muscles react with a $2..3$ frame latency, not an instantaneous bounce.
4. **Overshoot & Settle**: The recovery action slightly overshoots the neutral center, settling via a damped harmonic oscillator:
   $$\theta(t) = \theta_{neutral} + A_0 e^{-\zeta \omega_n t} \cos(\omega_d t)$$

---

## 4. Foot Support State Machine

The interaction of feet with the ground is categorized into 7 continuous states:
1. `SWING`: Foot elevated and accelerating toward next footfall target.
2. `APPROACH`: Foot decelerating downward toward ground plane ($|Y_{foot} - Y_{ground}| < 20\text{px}$).
3. `CONTACT`: Initial surface touch (heel-strike or toe touch); normal force begins rising.
4. `LOAD`: Weight transferring onto limb; knee compresses, arch flattens; normal force reaches $100\%$.
5. `PLANT`: Fully weight-bearing stance; zero horizontal slip ($\Delta X_{foot} < 0.5\text{px}$).
6. `UNLOAD`: Weight transferring off limb toward contralateral side; heel lifts.
7. `RELEASE`: Push-off toe break; normal force drops to zero; limb transitions into `SWING`.

---

## 5. Verification Metrics

1. **Dynamic Stability Invariant**: In static holds, COM X position must remain strictly inside $[X_{min}^{bos}, X_{max}^{bos}]$ with $\ge 10\text{px}$ stability margin.
2. **Continuous Recovery Trajectory**: Zero frame-to-frame angular jitter ($|\Delta \theta_{frame}| \le 22^\circ$).
3. **Planted Base Pinning**: During `PLANT` and `LOAD` phases, foot position drift must not exceed $0.5\text{px}$.
4. **Biomechanical Strategy Signature**: Perturbations $> 35\text{px}$ must trigger a measurable stepping or hip strategy.
