---
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
