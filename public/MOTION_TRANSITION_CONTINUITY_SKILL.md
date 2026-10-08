---
name: "motion-transition-continuity"
version: "2.0.0"
description: >-
  Phase boundary blending, residual momentum preservation, and seamless multi-action transition framework
  for articulated 2D characters. Abolishes robotic "freeze-and-reset" poses between distinct actions,
  mandating C1-continuous joint angular rates, root velocity tracking, and contact persistence.
---

# Motion Transition Continuity Skill (v2.0)

## 1. The Anti-Reset Doctrine

A major signature of artificial, amateur animation is the **Reset Freeze**:
$$\text{Action A (e.g. Sprint)} \xrightarrow{\text{Glitch Freeze}} \text{T-Pose / Default Stand} \xrightarrow{\text{Abrupt Start}} \text{Action B (e.g. Jump)}$$

### Universal Law of Continuous Flow
**A living character never snaps to a default rest pose between activities.**
Instead, Action B emerges directly from the **residual momentum, foot placement, and joint angular velocities** of Action A:

$$\text{Action A} \xrightarrow{\vec{V}_{residual}, \vec{\omega}_{residual}} \text{Transitional Kinetic State} \xrightarrow{\text{Causal Drive}} \text{Action B}$$

---

## 2. Continuously Tracked State Vectors Across Transitions

Whenever an action completes or shifts to a new intent, the state vector is preserved and handed to the subsequent phase solver:

```typescript
interface TransitionStateBuffer {
  timestamp: number;
  rootPosition: { x: number; y: number };
  rootVelocity: { x: number; y: number };
  rootAcceleration: { x: number; y: number };
  jointAngles: number[];       // Unwrapped continuous degrees [0..16]
  jointVelocities: number[];   // deg / frame
  centerOfMass: { x: number; y: number };
  comVelocity: { x: number; y: number };
  angularMomentum: number;
  footContactStates: { leftPlanted: boolean; rightPlanted: boolean };
  carriedObjectIds: string[];
}
```

### 2.1 Cubic Hermite Spline Phase Blending
At the transition boundary between Action A ($t \in [0, T_A]$) and Action B ($t \in [0, T_B]$), a transition window of duration $\Delta \tau = 2..5$ frames applies $C^1$-continuous Hermite blending:

$$\theta(s) = (2s^3 - 3s^2 + 1) \theta_A(T_A) + (s^3 - 2s^2 + s) \dot{\theta}_A(T_A) + (-2s^3 + 3s^2) \theta_B(0) + (s^3 - s^2) \dot{\theta}_B(0)$$
where normalized parameter $s = \frac{t - T_{trans}}{\Delta \tau} \in [0, 1]$.

This ensures:
1. $\theta(0) = \theta_A(T_A)$ and $\theta(1) = \theta_B(0)$ (position continuity $C^0$).
2. $\dot{\theta}(0) = \dot{\theta}_A(T_A)$ and $\dot{\theta}(1) = \dot{\theta}_B(0)$ (velocity continuity $C^1$).
3. Zero angular acceleration spikes or visible jerks.

---

## 3. Contact Persistence & Ground Invariance

During an action transition:
1. **No Foot Popping**: If the right foot is planted at $(X_{plant}, 755.0\text{px})$ at the end of Action A, it must remain anchored at $(X_{plant}, 755.0\text{px})$ at the start of Action B unless explicitly lifted by swing intent.
2. **Elevation Invariance**: The pelvis height must transition smoothly without vertical jumps ($|\Delta Y_{pelvis}| \le 2.0\text{px/f}$).
3. **Prop / Object Grip Continuity**: An object held in the hand does not drop or drift across the action seam.

---

## 4. Verification Metrics

1. **Zero Angular Seam Jumps**: Maximum single-frame change in any joint angle at an action boundary must not exceed $25^\circ$.
2. **Root Velocity Continuity**: $|V_{root}(T_{start}) - V_{root}(T_{end})| \le 8\text{px/f}$ across transition boundaries.
3. **Contact Anchor Drift**: Stance foot drift across the transition seam must be $< 0.5\text{px}$.
