---
name: "biomechanical-audit"
version: "2.0.0"
description: >-
  Automated multi-domain biomechanical critic and quality-assurance gate for procedural 2D animation.
  Quantitatively measures structural invariants, motion derivatives, dynamic balance margins,
  ground contact pinning, load-torque proportionality, and multi-entity collision precision,
  returning actionable PASS / WARNING / FAIL verdicts with numeric diagnostic telemetry.
---

# Biomechanical Audit & Physical Verification Skill (v2.0)

## 1. The Autonomous Critic Architecture

An animation engine cannot claim success merely because binary bytes compile without throwing an exception.
The **Biomechanical Auditor** operates as an autonomous critic evaluating generated frames against 7 quantitative physical domains:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ THE 7-DOMAIN BIOMECHANICAL AUDIT PIPELINE                                              │
├────────────────────┬───────────────────────────────────────────────────────────────────┤
│ 1. STRUCTURAL      │ Invariant bone lengths, 1-DOF knee polarity, anterior elbow limits│
│ 2. MOTION          │ Peak acceleration limits, C1 velocity continuity, zero snaps      │
│ 3. BALANCE         │ Center of Mass (CoM) stability margin, support polygon containment│
│ 4. CONTACT         │ Stance foot pinning (zero slide), ground penetration, rocker roll  │
│ 5. LOAD & TORQUE   │ Moment arm × load magnitude, counter-lean proportionality         │
│ 6. INTERACTION     │ Hitbox reach tolerance (≤ 12px), simultaneous hit-stop freeze     │
│ 7. TEMPORAL        │ Anticipation slow-in, impact recoil compression, organic life     │
└────────────────────┴───────────────────────────────────────────────────────────────────┘
```

---

## 2. Quantitative Verification Gates & Tolerances

### 2.1 Domain 1: Structural & Skeletal Anatomy
- **Bone Length Conservation**: For all 17 segments, length variation across frames:
  $$\max_t |L_i(t) - L_{i, base}| \le 0.05\text{px} \quad \text{[FAIL if } > 0.1\text{px]}$$
- **Knee Anatomical Polarity (Anti-Flamingo Law)**: Knee interior angle $\ge 0.0^\circ$ (zero hyperextension / reverse bend).
- **Elbow Polarity**: Anterior elbow flexion $\ge 5.0^\circ$.
- **Spine Curvature Distribution**: Differential angle between adjacent vertebrae segments $\le 35.0^\circ$.

### 2.2 Domain 2: Motion & Derivative Continuity
- **Max Single-Frame Angular Step**:
  $$\max_{i, t} |\theta_i(t+1) - \theta_i(t)| \le 25.0^\circ/\text{frame} \quad \text{[FAIL if } > 35.0^\circ\text{]}$$
- **Root Spatial Acceleration**: $|\vec{a}_{root}| \le 40.0\text{px/frame}^2$ (no sudden teleport jumps).

### 2.3 Domain 3: Dynamic Balance & Equilibrium
- **Static Base Containment**: In static holds ($V_{com} \approx 0$), Center of Mass X must reside inside $[X_{min}^{bos}, X_{max}^{bos}]$.
- **Dynamic Stability Margin**: Extrapolated Center of Mass must be within $25.0\text{px}$ of support boundary, or trigger a verified recovery strategy.

### 2.4 Domain 4: Ground Contact Mechanics
- **Ground Invariance**: Stance foot touching ground must satisfy:
  $$|Y_{foot} - Y_{ground}| \le 1.0\text{px} \quad \text{[FAIL if } > 2.5\text{px]}$$
- **Stance Pinning (Zero Slip)**: When a foot is in `PLANT` state:
  $$\max_t |\Delta X_{foot}| \le 0.5\text{px/frame} \quad \text{[FAIL if } > 2.0\text{px]}$$

### 2.5 Domain 5: Load, Lever-Arm & Torque
- **Torque-Proportional Postural Compensation**:
  When carrying or lifting an object of relative mass $\mu > 0.20$ with horizontal moment arm $\Delta X$:
  $$\theta_{spine\_lean} \propto \mu \cdot \Delta X \quad (R^2 \ge 0.85)$$
  A character holding a heavy object far away without torso compensation is flagged as **FAIL**.

### 2.6 Domain 6: Multi-Entity Interaction
- **Contact Reach Precision**: For punches, kicks, or catches, distance between end-effector and target object:
  $$\text{Distance} \le 15.0\text{px} \quad \text{[FAIL if } > 25.0\text{px]}$$
- **Hit-Stop Temporal Coincidence**: Interacting entities must freeze on the **exact same frame** ($T_{attacker} == T_{defender}$).

### 2.7 Domain 7: Temporal Spacing & Organic Life
- **Anti-Freeze Rule**: No living character may have zero angular variation across all 17 bones for $> 6$ consecutive frames.
- **Impact Absorption**: Heavy catch or landing must display compressive joint flexion over $\ge 2$ frames.

---

## 3. Audit Verdict Output Format

The critic returns a structured audit report:

```typescript
interface BiomechanicalAuditReport {
  overallVerdict: 'PASS' | 'WARNING' | 'FAIL';
  overallScore: number; // 0 to 100
  domains: {
    name: string;
    verdict: 'PASS' | 'WARNING' | 'FAIL';
    measuredValue: number;
    threshold: number;
    notes: string;
  }[];
  failureDiagnostics: string[];
}
```
If `overallVerdict === 'FAIL'`, the animation must not be approved for release; the causal generator must iteratively adjust force vectors, moment arms, or footfall targets.
