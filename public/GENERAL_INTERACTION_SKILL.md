---
name: "general-interaction"
version: "2.0.0"
description: >-
  Universal multi-entity interaction framework in unified world space for Character-Character,
  Character-Object, Character-Terrain, and Object-Object physical engagements.
  Enforces shared coordinate systems, mutual collision boundaries, elevation alignment,
  and contact mechanics across all scene participants.
---

# General Interaction & Multi-Entity Spatial Skill (v2.0)

## 1. The Shared World Coordinate Axiom

**All entities in a scene—whether human characters, sports balls, crates, or platforms—must inhabit one single, unbending Cartesian world space:**
- Coordinate system: Origin $(0, 0)$ at top-left. Positive $+X$ extends rightward; positive $+Y$ extends downward.
- **Universal Ground Plane**: $Y_{ground} = 755.0\text{px}$ (configurable).
- No entity is ever animated in an isolated local frame of reference and then pasted onto the canvas.

```
(0,0) TOP-LEFT SCENE ORIGIN
┌────────────────────────────────────────────────────────┐
│                                                        │
│   Shared Sky / Airborne Trajectories                   │
│                                                        │
│   Raised Platform / Crate (Y = 620.0 px)               │
│   [═════════════════]                                  │
│                                                        │
│   UNIVERSAL GROUND PLANE (Y = 755.0 px)                │
│   Character A ─── Interacting Object ─── Character B  │
└────────────────────────────────────────────────────────┘
```

---

## 2. Interaction Pair Taxonomies

The engine models 4 fundamental classes of physical interaction:

### 2.1 Character ↔ Object
1. **Pickup & Lift**: Hands establish contact with object bounding box ($|P_{hand} - P_{obj}| \le 1.5\text{px}$). Object transitions to `HELD`; its mass modifies character CoM.
2. **Push & Pull**: Contact normal vectors $\vec{n}_{contact}$ transfer compressive or tensile force; friction between object and terrain resists displacement.
3. **Throw & Catch**: Ballistic projectile separation at hand release velocity; compliant hand catch with impulse absorption.
4. **Striking Prop**: Impact transfer equation based on relative mass ratio $\mu = M_{obj} / M_{char}$.

### 2.2 Character ↔ Character
1. **Cooperative Transport (Two-Man Lift)**:
   - Both characters share the load: $F_{load, A} + F_{load, B} = M_{obj} \cdot g$.
   - Root positions advance synchronously ($\Delta X_A \approx \Delta X_B$).
2. **Combat / Clash**:
   - Attacker limb reaches Defender hitbox on Frame $T_{clash}$.
   - **Hit-Stop Freeze**: Both characters pause on Frame $T_{clash}$.
   - **Recoil Transfer**: Defender absorbs impulse and slides along ground plane; Attacker recoils upper body.
3. **Grapple & Tackle**:
   - Kinematic coupling: Defender root position binds to Attacker hands.

### 2.3 Character ↔ Terrain
1. **Multi-Tier Elevation**:
   - Surfaces track elevations (e.g. Ground $755\text{px}$, Dais $620\text{px}$, Ledge $480\text{px}$).
   - Characters walk, stand, and step onto authentic horizontal boundaries.
2. **Edge Stepping & Falling**:
   - If foot departs support edge and no ground exists, gravity acceleration immediately takes over ($\ddot{y} = g$).

### 2.4 Object ↔ Object
1. **Stacking & Support**:
   - Lower crate supports upper crate; normal force accumulates.
2. **Collision & Deflection**:
   - Momentum conservation with restitution coefficient $e$:
     $$v_{1}' = \frac{(m_1 - e m_2) v_1 + (1 + e) m_2 v_2}{m_1 + m_2}, \quad v_{2}' = \frac{(1 + e) m_1 v_1 + (m_2 - e m_1) v_2}{m_1 + m_2}$$

---

## 3. World-Space State Registry

The simulation maintains a global registry of all active scene participants on every frame:

```typescript
interface WorldEntityState {
  id: string;
  type: 'CHARACTER' | 'OBJECT' | 'TERRAIN';
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  acceleration: { x: number; y: number };
  mass: number;
  orientation: number;
  supportSurfaceY: number;
  contactingEntityIds: string[];
}
```

Before exporting any frame to `.stknds` or canvas rendering, the spatial consistency checker iterates over all registered pairs. If any entity penetrates another or hovers unsupported, a spatial constraint violation is raised.

---

## 4. Verification Metrics

1. **Shared Ground Invariant**: Grounded characters and resting objects must share $Y_{contact} = Y_{ground} \pm 1.0\text{px}$.
2. **Hitbox Contact Precision**: Strikes and catches must establish contact within $\le 12.0\text{px}$ of the target point.
3. **Zero Penetration**: Rigid props and character bones must not penetrate beyond collision tolerances.
4. **Simultaneous Hit-Stop**: Both characters in an impact exchange must freeze on the exact same frame.
