---
name: "general-interaction"
version: "3.0.0"
description: >-
  Universal multi-entity interaction in one shared world space for Character-Character, Character-Object,
  Character-Terrain, Object-Object, and Entity-Environment (air, water, wind, slope, surface material).
  Enforces shared coordinates, collision, elevation, contact mechanics, friction limits, load sharing,
  and environmental forces across all scene participants.
requires: ["physics-environment-and-quantum"]
---

# General Interaction & Multi-Entity Spatial Skill (v3.0)

## 1. Shared World Coordinate Axiom

All entities inhabit one Cartesian world: origin top-left, +X right, +Y down.
- Universal ground plane $Y_{ground}=755.0$ px (configurable).
- Internal solving in SI; scale `pxPerMeter` (default 260) and `fps` (default 24) convert to px/frames (see physics skill §1).
- No entity is animated in an isolated frame and pasted in.
- The scene also holds one `EnvironmentState` (gravity, medium density, wind vector, temperature, pressure, altitude, per-surface friction/compliance). Regions may override it (e.g. a puddle patch with $\mu_s=0.4$, a water pool with $\rho=1000$).

```
(0,0) TOP-LEFT
┌───────────────────────────────────────────────────────────┐
│ Wind →→ (vector field)           Sky / ballistic paths    │
│ Raised platform (Y = 620 px)  μ=0.9                       │
│ [═════════════]            Puddle region μ=0.45 [~~~~]    │
│ GROUND (Y = 755 px) μ=0.9, slope α = 0                    │
│ Character A ── Object ── Character B                      │
└───────────────────────────────────────────────────────────┘
```

---

## 2. Interaction Pair Taxonomies

### 2.1 Character ↔ Object
1. **Pickup & Lift**: contact $|P_{hand}-P_{obj}|\le1.5$ px. Object becomes `HELD`; combined CoM shifts by $\Delta x=\dfrac{M_{obj}}{m_{body}+M_{obj}}d$. Example: 20 kg at 0.4 m ahead → +0.089 m (23 px).
2. **Push & Pull**: required force $F=\mu_{obj}Mg\cos\alpha+Mg\sin\alpha$; the pusher's foot limit is $\mu_{foot}N$. If $F>\mu_{foot}N$, feet slip first. Lean angle $\theta\approx\arctan(F/(m g))$. Example: 40 kg crate, $\mu=0.4$ → 157 N → 12.9° lean.
3. **Throw & Catch**: separation velocity = hand velocity at release; projectile includes drag, wind and optional Magnus (physics skill §3.4). Catch impulse $J=M\Delta v$, compliant yield time $\Delta t$ gives $\bar F=J/\Delta t$.
4. **Striking prop**: mass ratio $\mu_m=M_{obj}/M_{char}$; post-collision velocity from restitution (§2.4).

### 2.2 Character ↔ Character
1. **Cooperative transport**: load share $F_A+F_B=M g$; lever geometry decides the split: if the object CoM sits at fraction $\lambda$ of the distance from A to B, $F_A=(1-\lambda)Mg$, $F_B=\lambda Mg$. Roots advance in sync ($\Delta X_A\approx\Delta X_B$), steps phase-locked within 1 frame.
2. **Combat / Clash**: contact when attacker limb reaches defender hitbox on frame $T_{clash}$. **Hit-stop**: both freeze the same frame (stylistic pause, 1–3 frames). **Recoil transfer**: momentum exchange $m_Av_A=m_Av_A'+m_Dv_D$; defender slide limited by foot friction: slide distance $s=v_D^2/(2\mu g)$.
   - Example: 70 kg defender hit with 25 kg·m/s effective impulse → $v_D=0.36$ m/s; slide on dry ($\mu=0.8$) = 0.8 cm (≈2 px); on ice ($\mu=0.1$) = 6.5 cm (≈17 px). Larger blows need stepping/stagger rather than sliding.
3. **Grapple & Tackle**: kinematic coupling of two bodies is replaced by a **shared-contact constraint**: relative velocity at the grip point driven to zero over $\ge2$ frames; combined momentum conserved: $v'=(m_Av_A+m_Bv_B)/(m_A+m_B)$ (perfectly inelastic).

### 2.3 Character ↔ Terrain
1. **Multi-tier elevation**: ground 755, dais 620, ledge 480 px (examples). Step-up height limit $\le0.45$ m (117 px) without hands [TUNE].
2. **Edge stepping & falling**: no support → $\ddot y=g_{eff}$ (px/f² via conversion; Earth 4.43 px/f² at defaults).
3. **Slope**: stance leans by $\alpha$ to keep CoM over base; stability requires $\mu_s\ge\tan\alpha$; show slip if not.
4. **Compliance**: deformable ground (sand/mat/trampoline) uses spring-damper $F_n=k\delta+c\dot\delta$; sinking reduces push-off efficiency; trampoline returns energy with efficiency $\eta$ (≈ 0.8–0.9 [TUNE]).

### 2.4 Object ↔ Object
1. **Stacking**: normal force accumulates; a stack tips when its combined CoM projection leaves the base footprint.
2. **Collision with restitution $e$**:
$$v_1'=\frac{(m_1-em_2)v_1+(1+e)m_2v_2}{m_1+m_2},\quad v_2'=\frac{(1+e)m_1v_1+(m_2-e m_1)v_2}{m_1+m_2}$$
3. **Rolling and sliding**: sliding friction $F=\mu_kN$ until rolling condition $v=\omega r$; rolling resistance $F_r=C_{rr}N$ ($C_{rr}\approx0.01$–$0.05$ ball on turf [TUNE]).

### 2.5 Entity ↔ Environment (new)
1. **Wind on bodies and props**: $\vec F=-\tfrac12\rho C_dA|\vec v_{rel}|\vec v_{rel}$, $\vec v_{rel}=\vec v-\vec v_{wind}$. Light props (cloth, paper, hair) have large $C_dA/m$ so respond strongly. A 10 m/s headwind on a standing person: 42.9 N → lean 3.6°.
2. **Buoyancy** in water: $F_b=\rho_{fluid}Vg$. Neutral objects hover; objects with density below fluid rise.
3. **Temperature and altitude**: $\rho=pM/(RT)$ (1.225 at 15 °C, 1.146 at 35 °C); at 3000 m ρ is ~0.86 kg/m³. Thin air reduces drag by the same ratio; ball flight carries farther.
4. **Moisture**: wet surface lowers $\mu$ (0.9 → 0.5 typical for rubber on concrete) and raises slip risk on pivots and braking.
5. **Heat/cold** (optional): fatigue accumulates faster; stiff, cold muscles reduce $v_{max}$ [TUNE].

---

## 3. World-Space State Registry

```typescript
interface WorldEntityState {
  id: string;
  type: 'CHARACTER' | 'OBJECT' | 'TERRAIN' | 'REGION';
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  acceleration: { x: number; y: number };
  massKg: number;
  dragCdA?: number;                // m²
  orientation: number;
  angularVelocity?: number;
  supportSurfaceY: number;
  surface?: SurfaceProps;          // μs, μk, restitution, stiffness, damping
  contactingEntityIds: string[];
  environmentOverride?: Partial<EnvironmentState>;
}
```

Spatial consistency checker, every frame, before export:
1. Penetration test for all pairs (tolerance 1 px at rest).
2. Support test: each non-airborne entity has contact; each hovering one has an active cause.
3. Friction test: $\mu_{req}\le\mu_s$ or a logged slip.
4. Momentum ledger: total momentum change of the closed system equals logged external impulses (ground, wind, gravity) within 2 %.

---

## 4. Verification Metrics

1. **Shared Ground Invariant**: grounded characters and resting objects share $Y_{contact}=Y_{ground}\pm1.0$ px (slope: along local surface line).
2. **Hitbox Precision**: strikes and catches meet within ≤ 12 px of the target point.
3. **Zero Penetration** beyond tolerance.
4. **Simultaneous Hit-Stop**: both characters freeze on the same frame.
5. **Load Share**: cooperative carry load error $|F_A+F_B-Mg|/Mg<5\%$.
6. **Environment Application**: every entity in a wind/fluid region has the drag force logged; heavy bodies respond less than light props in the ratio of $C_dA/m$.
7. **Momentum Ledger** closes within 2 % per collision.---
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
