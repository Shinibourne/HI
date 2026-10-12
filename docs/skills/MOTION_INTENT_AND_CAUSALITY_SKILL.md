---
name: "motion-intent-and-causality"
version: "3.0.0"
description: >-
  Causal motion generation and narrative-physical intent planning for articulated characters.
  Intent drives forces, forces alter momentum, momentum perturbs balance (computed via XcoM / margin of stability),
  balance triggers latency-aware full-body reactions, and IK solves the resulting configuration each frame.
  Environment-aware (gravity, wind, friction, slope, medium). Imports constants from PHYSICS_ENVIRONMENT_AND_QUANTUM_SKILL.md.
requires: ["physics-environment-and-quantum"]
---

# Motion Intent & Causality Skill (v3.0)

## 1. The Fundamental Axiom of Causal Motion

**A frame does not exist because an animator typed coordinates.**
**A frame exists because the preceding physical state, the environment, and current intent made that configuration physically necessary.**

```
USER / NARRATIVE INTENT
   ▼
CAUSE & TASK PLANNING (Locomotion, Lift, Push, Pull, Catch, Throw, Strike, Recover)
   ▼
ENVIRONMENT READ (g, medium density, wind, surface μ, slope, fatigue)        ← new
   ▼
FORCES, TORQUES & LOADS (gravity, contact normal, friction, drag, Hill-limited muscle torque)
   ▼
MOMENTUM & ACCELERATION (dP/dt, dL/dt, rotational inertia)
   ▼
BALANCE: XcoM = x + v/ω0, ω0 = √(g/l); MoS vs base of support                 ← new
   ▼
CONTACT & SUPPORT CHAIN (slip test μreq vs μs, foot roll, grip links)
   ▼
LATENCY-AWARE REACTIVE CHAIN (reflex 1 f, balance 2–3 f, voluntary ≥4 f @24 fps)
   ▼
KINEMATICS & IK (2-bone analytic, anatomical limits, segment lengths preserved)
   ▼
SECONDARY MOTION (damped oscillators, filtered motor noise)
   ▼
FRAME STATE (deterministic, timestamped, SI + px)
   ▼
AUDIT GATE (Pass → export / Fail → causal repair)
```

All units, constants and the full formula library live in `PHYSICS_ENVIRONMENT_AND_QUANTUM_SKILL.md`.

---

## 2. Intent Representation & Decomposition

```typescript
interface MotionIntent {
  action: 'LIFT' | 'CARRY' | 'PUSH' | 'PULL' | 'CATCH' | 'THROW' | 'STRIKE' | 'LOCOMOTION' | 'BALANCE_RECOVERY';
  targetObjectId?: string;
  targetPosition?: { x: number; y: number };
  effortLevel: number;            // 0.0 casual .. 1.0 maximal
  style: 'NATURAL' | 'MARTIAL' | 'EXAGGERATED';
  environment: EnvironmentState;  // see physics skill §2
  objectMassKg?: number;          // for lift/catch/push, drives all load maths
}
```

Effort maps to physiology, not just speed:
- Fraction of peak isometric force $F_{use}=\text{effort}\cdot F_0^{eff}$.
- Fast segment speed is capped by Hill's curve: at $u=v/v_{max}$, available force fraction is $(1-u)/(1+u/0.25)$.
- Peak mechanical power occurs near $u\approx0.31$ with $F\approx0.31F_0$. Power moves (throw, punch) live near that region; grinding moves (push heavy crate) live at low $u$.

| Action | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|---|---|---|---|---|---|
| **Lift** | Anticipation & Squat | Hand Contact & Attachment | Leg Drive & Ground Reaction | Spinal Extension & Balance Shift | Stable Hold |
| **Push** | Stance Brace Behind CoM | Forearm Contact | Ground Friction Drive | Forward Torso Lean & Leg Drive | Settle |
| **Pull** | Heel Brace Ahead of CoM | Hand Grip Link | Backward Lean & Core Tension | Pelvic Retraction & Leg Traction | Stable Grip |
| **Catch** | Hand Intercept (min-jerk path) | Contact & Impulse Registration | Compliant Arm Yield | Torso Compression & CoM Settle | Stable Stance |
| **Throw** | Backswing & Pelvic Coil | Forward Leg Drive | Torso Kinetic Whip | Release at Peak Velocity | Follow-Through Recoil |
| **Strike** | Windup / Chamber | Explosive Kinetic Whip | Contact Hit-Stop | Directional Impulse Transfer | Return / Guard |

### 2.1 Task feasibility maths (run before generating frames)

**Push / pull feasibility.** Object of mass $M$ on surface friction $\mu_{obj}$ needs force $F_{need}=\mu_{obj}Mg\cos\alpha+Mg\sin\alpha$ (uphill) at constant speed. The pusher's feet can deliver at most $F_{max}=\mu_{foot}N$, where $N\approx m_{body}g$ plus vertical lean component.
- Example: 40 kg crate, $\mu_{obj}=0.4$ → $F_{need}=157$ N. 70 kg person, $\mu_{foot}=0.9$ → $F_{max}\approx618$ N. Feasible; forward lean required: $\theta\approx\arctan(F_{need}/(m g))=12.9°$.
- If $F_{need}>F_{max}$, the foot slips before the crate moves: show foot slide, not crate motion.

**Lift feasibility.** Moment at lumbar level $\tau=M_{obj}\,g\,d_{horizontal}$. Keep the load close ($d$ small) or the torso must lean back to keep $MoS>0$. Combined CoM shift: $\Delta x_{CoM}=\dfrac{M_{obj}}{m_{body}+M_{obj}}\,d_{horizontal}$.
- Example: 20 kg at 0.4 m ahead of body → CoM shifts 0.089 m (23 px) forward; hips must move back about that amount.

**Carry.** Metabolic and sway: step width widens and cadence drops as $M_{obj}/m_{body}$ rises (tunable, ≈ +10 % stance width per 0.2 ratio).

---

## 3. Causal Propagation Chains in Action

### 3.1 Causal Trip & Recovery (physics-driven trigger)
1. *Cause*: foot hits obstacle during swing.
2. *Force*: obstacle applies retarding impulse $J_x<0$ on that foot; $J=m_{foot,eff}\Delta v$.
3. *Momentum*: foot stops; pelvis and torso continue at $v_x>0$.
4. *Balance (computed)*: $X^{ext}_{CoM}=x_{CoM}+v/\omega_0$. Walking at 1.3 m/s with $l=1$ m: offset 0.415 m (108 px). If $MoS<0$ beyond the base of support, a fall is under way. **This replaces the old fixed 35 px trigger.**
5. *Latency*: stretch reflex ≈ 1 frame (flinch); balance reaction 2–3 frames; deliberate step choice ≥ 4 frames.
6. *Reactive chain*: lower spine flexes; head pitches up (vestibular horizon lock); arms abduct, raising rotational inertia to slow trunk pitch ($\omega=L/I$).
7. *Support strategy*: required step length $\approx|MoS|$ (plus margin 0.05–0.1 m); step must be placed ahead of $X^{ext}_{CoM}$.
8. *Kinematics*: swing leg extends; heel lands at ground plane; knee compresses to absorb ~1.2–1.5 BW impact.
9. *Settle*: CoM re-enters base of support; critically damped return, 3–6 frames.
- **Environment modifiers**: wet floor ($\mu_s=0.45$) lowers max braking to 4.4 m/s²; on ice the recovery step slips ($\mu_{req}>\mu_s$) and the character falls anyway. Strong tailwind adds forward drag force to XcoM drift.

### 3.2 Heavy Catch (impulse maths)
1. *Intent*: catch 5 kg ball at 8 m/s ($p=40$ kg·m/s).
2. *Anticipation*: widen stance; eyes track; hands follow minimum-jerk path to intercept, $v_{peak}=1.875\Delta/T$.
3. *Contact*: $|P_{hand}-P_{ball}|\le1.5$ px.
4. *Impulse*: $J=M\Delta v=40$ N·s.
5. *Compliance*: yield for 3 frames (0.125 s): $\bar F=320$ N (0.47 BW), yield distance $d=\tfrac12v\Delta t=0.5$ m (130 px) along the line of travel, distributed across elbows, shoulders, trunk and hips. A 1-frame stop would be 960 N and must not occur.
6. *Whole-body*: chest compresses, hips push back, rear foot loads. Check $\mu_{req}=F_t/F_n$: here $320/(686+\text{load})<0.9$ OK on dry ground; on ice it fails, so the character slides back $\approx v^2/(2\mu g)$-scale.
7. *Equilibrium*: ball settles at waist height.
- **Drag/wind adjust**: incoming ball path uses §3.4 projectile maths; a crosswind curves the arrival point, hands must correct late (visual reaction ≥ 4 frames).

### 3.3 Jump and Landing Chain
1. Takeoff: $v_0=\sqrt{2gh}$; $h=0.5$ m → 3.13 m/s, flight 15.3 frames at 24 fps.
2. Flight: no external torque, so $L$ conserved; tuck increases $\omega$.
3. Landing: $a=v^2/(2d)$; $d=0.30$ m → 1.67 g; peak ground force 2.67 BW.
4. Gravity variant: Moon (1.62 m/s²) flight time ×6.1; landing softer; lateral drift larger because $t_{flight}$ is longer.

---

## 4. Verification Metrics

1. **Zero Uncaused Displacements**: any shift > 5 px must be mapped to a muscle drive, external impulse, gravity, drag, or buoyancy.
2. **Phase Boundary Continuity**: joint velocity and angular rate are $C^1$-continuous across phase transitions (spline blended).
3. **Intent Traceability**: every frame logs phase, active forces, environment hash, and intent.
4. **Balance Consistency**: if MoS < 0 for more than 2 consecutive frames and no recovery step, the sequence must end in a fall.
5. **Latency Consistency**: no voluntary counter-action sooner than 4 frames after stimulus (24 fps).
6. **Hill Plausibility**: no segment simultaneously exceeds 0.7 $v_{max}$ and 0.7 $F_0$.
7. **Friction Honesty**: $\mu_{req}\le\mu_s$ on every anchored foot, otherwise a logged slip.---
name: "motion-intent-and-causality"
version: "2.0.0"
description: >-
  Causal motion generation and narrative-physical intent planning framework for articulated characters.
  Abolishes arbitrary kinematic pose commands in favor of causal action chains:
  Intent drives forces, forces alter momentum, momentum perturbs balance, balance triggers full-body reactions,
  and kinematics solves the resulting physically necessary body configuration on each frame.
---

# Motion Intent & Causality Skill (v2.0)

## 1. The Fundamental Axiom of Causal Motion

**A frame does not exist because an animator typed coordinates.**
**A frame exists because the preceding physical state and current intent made that configuration physically necessary.**

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ THE UNIVERSAL CAUSAL PIPELINE                                                          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  USER / NARRATIVE INTENT                                                               │
│       │                                                                                │
│       ▼                                                                                │
│  CAUSE & TASK PLANNING (Locomotion, Lift, Push, Pull, Catch, Throw, Strike, Recover)   │
│       │                                                                                │
│       ▼                                                                                │
│  FORCES, TORQUES & EXTERNAL LOADS (Gravity, Contact Normal, Friction, Muscle Torques)  │
│       │                                                                                │
│       ▼                                                                                │
│  MOMENTUM & ACCELERATION DYNAMICS (Linear dP/dt, Angular dL/dt, Rotational Inertia)    │
│       │                                                                                │
│       ▼                                                                                │
│  BALANCE & CENTER OF MASS EQUILIBRIUM (Extrapolated CoM vs Base of Support)            │
│       │                                                                                │
│       ▼                                                                                │
│  CONTACT & SUPPORT CHAIN (Ground Pinning, Foot Roll, Friction Anchors, Grip Links)     │
│       │                                                                                │
│       ▼                                                                                │
│  WHOLE-BODY REACTIVE CHAIN (Pelvis Counter-Rotation, Spine Flexion, Arm Balance)      │
│       │                                                                                │
│       ▼                                                                                │
│  KINEMATICS & IK SOLVING (Analytical 2-Bone IK with Human Anatomical Limits)           │
│       │                                                                                │
│       ▼                                                                                │
│  SECONDARY MOTION & FOLLOW-THROUGH (Inertial Lag, Harmonic Decay, Breathing Life)      │
│       │                                                                                │
│       ▼                                                                                │
│  FRAME STATE GENERATION (Deterministic, Timestamped, Fully Articulated Frame)         │
│       │                                                                                │
│       ▼                                                                                │
│  BIOMECHANICAL & SPATIAL AUDIT GATE (Pass ──► Export / Fail ──► Causal Repair)         │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Intent Representation & Decomposition

Every movement sequence begins with an explicit high-level `MotionIntent`:

```typescript
interface MotionIntent {
  action: 'LIFT' | 'CARRY' | 'PUSH' | 'PULL' | 'CATCH' | 'THROW' | 'STRIKE' | 'LOCOMOTION' | 'BALANCE_RECOVERY';
  targetObjectId?: string;
  targetPosition?: { x: number; y: number };
  effortLevel: number; // 0.0 (casual) to 1.0 (maximal athletic power)
  style: 'NATURAL' | 'MARTIAL' | 'EXAGGERATED';
}
```

The system decomposes this intent into a deterministic state-machine of **Causal Action Phases**:

| Action | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|---|---|---|---|---|---|
| **Lift** | Anticipation & Squat | Hand Contact & Attachment | Leg Drive & Ground Reaction | Spinal Extension & Balance Shift | Stable Hold |
| **Push** | Stance Brace Behind CoM | Forearm Contact | Ground Friction Drive | Forward Torso Lean & Leg Drive | Settle |
| **Pull** | Heel Brace Ahead of CoM | Hand Grip Link | Backward Lean & Core Tension | Pelvic Retraction & Leg Traction | Stable Grip |
| **Catch** | Hand Trajectory Intercept | Contact & Impulse Registration | Compliant Arm Yielding (Elbow Flex) | Torso Compression & CoM Settle | Stable Stance |
| **Throw** | Backswing & Pelvic Coil | Forward Leg Drive | Torso Kinetic Whip | Arm Release at Peak Velocity | Follow-Through Recoil |
| **Strike** | Windup / Chamber | Explosive Kinetic Whip | Contact Hit-Stop Freeze (F_clash) | Directional Impulse Transfer | Return / Guard |

---

## 3. Causal Propagation Chains in Action

### 3.1 The Causal Trip & Recovery Chain
1. *Cause*: Right foot strikes unexpected obstacle during forward swing.
2. *Force*: Ground obstacle exerts horizontal retarding impulse $\vec{J}_x < 0$ on right foot.
3. *Momentum*: Foot stops instantly; torso and pelvis continue forward at velocity $\vec{V}_x > 0$.
4. *CoM*: Whole-body Center of Mass pitches forward past the stance support boundary ($\Delta X_{xcom} > 35\text{px}$).
5. *Reactivity*: Lower spine flexes forward; neck and cranium pitch up (vestibular horizon lock); arms abduct rapidly for balance.
6. *Support Strategy*: Left leg unloads; right leg initiates an emergency stumble recovery step.
7. *Kinematics*: Right hip swings forward; knee extends; heel strikes ground firmly at $Y = 755.0\text{px}$.
8. *Settle*: Knee compresses $+25^\circ$ absorbing impact; CoM decelerates; body returns to equilibrium.

### 3.2 The Heavy Catch Chain
1. *Intent*: Catch heavy projectile ($M_{obj} = 40$) incoming at $\vec{V} = (-35, +5)\text{px/f}$.
2. *Anticipation*: Character widens stance; eyes track incoming target; arms raise toward intercept point.
3. *Contact*: Hands intercept ball bounding box ($|P_{hand} - P_{ball}| \le 1.5\text{px}$).
4. *Impulse*: Kinetic energy transfer $\vec{J} = M_{obj} \vec{V}_{rel}$ registered.
5. *Compliance*: Arms do NOT rigidly freeze; elbows flex $+24^\circ$ over 3 frames to prolong deceleration time $\Delta t$.
6. *Whole-Body Absorption*: Upper chest compresses backward; hips push back; rear foot presses into ground plane.
7. *Equilibrium*: Total momentum dissipated; ball settles comfortably at waist height.

---

## 4. Verification Metrics

1. **Zero Uncaused Displacements**: Every coordinate shift $> 5\text{px}$ must map to an active muscular drive, external impulse, or gravitational acceleration.
2. **Phase Boundary Continuity**: Joint velocities and angular rates across phase transitions must be $C^1$-continuous (spline blended).
3. **Intent Traceability**: Every generated frame logs its active phase, active forces, and causal intent.
