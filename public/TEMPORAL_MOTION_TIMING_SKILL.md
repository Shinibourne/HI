---
name: "temporal-motion-timing"
version: "2.0.0"
description: >-
  Biomechanical temporal motion, non-linear velocity curves, kinetic spacing, anticipation,
  hit-stop impact holds, and organic easing framework for Stick Nodes (.stknds) and 2D procedural animation.
  Enforces variable-duration action choreography decoupled from arbitrary fixed frame counts.
---

# Temporal Motion & Kinetic Timing Skill (v2.0)

## 1. Frame Rate vs. Action Duration

**24 FPS means playback frame rate (24 discrete samples per second of simulated real-time).**
**It does NOT mean: "Every animation must contain exactly 24 frames."**

A biological action chooses its temporal duration based on physical mass, distance, muscle contraction velocity, and narrative intensity:

| Action Category | Real-Time Duration | Frames @ 24 FPS | Frames @ 12 FPS |
|---|---|---|---|
| **Quick Jab / Snap Strike** | 0.25 – 0.35 s | 6 – 8 frames | 3 – 4 frames |
| **Explosive Jump & Land** | 0.75 – 1.00 s | 18 – 24 frames | 9 – 12 frames |
| **Heavy Deadlift (Floor to Lockout)** | 1.50 – 2.50 s | 36 – 60 frames | 18 – 30 frames |
| **Stroll & Kick Master Sequence** | 9.00 s | 216 frames | 108 frames |
| **Martial Arts Clash & Evasion** | 1.50 s | 36 frames | 18 frames |

The procedural engine calculates the frame budget from the physical equations of motion:
$$T_{total} = \sum_{phase=1}^{K} \Delta t_{phase}, \quad N_{frames} = \lceil T_{total} \cdot \text{FPS} \rceil$$

---

## 2. The 9 Temporal Phases of Biomechanical Movement

Every non-trivial human action progresses through 9 distinct temporal phases:

```
VELOCITY PROFILE OVER TIME
│
│                  ▲ Peak Velocity (Drive Phase)
│                 / \
│                /   \
│               /     ■ Hit-Stop Freeze (1-2f)
│  Anticipation/       \
│  /           \        \ Recoil
│ /             \        \
─┴───────────────┴────────┴──────■───────────■ Settle / Moving Hold
  Prep           Launch   Impact Recovery
```

1. **Anticipation (Slow-In)**: Counter-movement coiling energy in opposite direction ($15\%..25\%$ of action time).
2. **Launch / Drive**: Explosive acceleration following non-linear exponential or quintic easing ($t^3..t^5$).
3. **Ballistic Flight / Extension**: Zero active thrust; governed by inertial gravity parabola.
4. **Apex**: Momentary deceleration at the peak of an arc ($V \approx 0$).
5. **Deceleration / Descent**: Gravity or friction accelerates extremity toward target.
6. **Impact & Hit-Stop Freeze**: Meeting of surfaces; velocity drops to zero for $1..2$ frames to communicate solid mass density.
7. **Recoil Compression**: Yielding deflection absorbing kinetic energy ($2..4$ frames).
8. **Recovery & Balance Realignment**: Repositioning of limbs to restore stability polygon.
9. **Organic Settle / Moving Hold**: Zero static dead freezes; micromotion breathing and weight shifts ($0.5^\circ..1.5^\circ$) preserve organic life.

---

## 3. Spacing Ratios for Natural Easing

Linear interpolation ($\Delta x = \text{const}$) creates mechanical, robotic motion. Physical movement requires non-uniform spacing ratios:

- **Launch Spacing (Slow-Out)**:
  $$\Delta x_i \propto 1 : 3 : 7 : 12 : 18$$
- **Braking Spacing (Slow-In)**:
  $$\Delta x_i \propto 18 : 12 : 7 : 3 : 1$$
- **Quintic Smooth-Step Interpolation**:
  $$S(t) = 6t^5 - 15t^4 + 10t^3, \quad t \in [0, 1]$$
  Ensures zero initial velocity, zero final velocity, zero initial acceleration, and zero final acceleration ($C^2$-continuity).

---

## 4. Verification Metrics

1. **Zero Dead Freeze Rule**: In alive human characters, no segment may remain numerically identical ($\Delta \theta = 0.0^\circ$) for $> 6$ consecutive frames unless explicitly knocked unconscious.
2. **Impact Hit-Stop Presence**: High-speed physical collisions ($V > 25\text{px/f}$) must feature a $1..2$ frame hit-stop freeze.
3. **Non-Linear Spacing**: Acceleration phases must exhibit monotonically increasing displacement ($\Delta x_{i+1} > \Delta x_i$) during drive.
