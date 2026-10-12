---
name: "physics-environment-and-quantum"
version: "3.0.0"
description: >-
  Shared physical foundation for all motion skills: SI unit system and pixel/frame conversion, environment
  variables (gravity, air/fluid density, wind, temperature, altitude, surface friction, slope, compliance),
  derived calculations (drag, buoyancy, friction limits, XcoM stability, impulse, projectile, jump/landing),
  Hill/Huxley muscle limits, neural latency, motor noise, and an honest bridge from quantum mechanics
  to macroscopic animation (what is real, what is negligible, what is opt-in stylization).
---

# Physics, Environment & Quantum Bridge Skill (v3.0)

This file is the **single source of truth** for constants, units and environment variables.
The other four skills (`MOTION_INTENT_AND_CAUSALITY`, `MOMENTUM_DYNAMICS`, `GENERAL_INTERACTION`,
`FORCE_REACTION_FOLLOWTHROUGH`) and `COMBAT_IMPACT_AND_FOLLOWTHROUGH` import from here.

## 0. Provenance legend

Every constant below is tagged:
- **[SRC]** taken from a cited scientific source (see §9).
- **[STD]** standard physics constant or textbook formula.
- **[TUNE]** engineering default chosen for animation. Tune per project; not a measured truth.

---

## 1. Unit system and conversion (fixes the old px-only thresholds)

All physics is solved in **SI** (m, kg, s, N, rad). Pixels and frames are an **export layer only**.

```typescript
interface UnitScale {
  pxPerMeter: number;   // [TUNE] default 260 (hip height 243 px ≈ 0.93 m adult)
  fps: number;          // [TUNE] default 24  (CONFIRM against the project's real frame rate)
}
```

| Conversion | Formula | Default result |
|---|---|---|
| m → px | $x_{px} = s\,x_m$ | 1 m = 260 px |
| velocity m/s → px/frame | $v_{pf} = v\,s/\text{fps}$ | 1.3 m/s = 14.08 px/f |
| acceleration m/s² → px/frame² | $a_{pf2} = a\,s/\text{fps}^2$ | $g$ = **4.428 px/f²** |
| frames → seconds | $t = n/\text{fps}$ | 1 frame = 41.7 ms |

> Every legacy threshold written in px (35 px, 25 px, 45 px/f², 12 px) is a **fallback**.
> Whenever the SI-derived value exists, the derived value wins.

---

## 2. Environment variables

```typescript
interface EnvironmentState {
  // Planet / field
  gravity: number;                 // m/s²   Earth 9.81, Moon 1.62, Mars 3.71 [STD]
  // Medium
  medium: 'AIR' | 'WATER' | 'VACUUM' | 'CUSTOM';
  fluidDensity: number;            // kg/m³  air 1.225 @15 °C sea level, water ≈ 1000 [STD]
  temperatureC: number;            // °C
  pressurePa: number;              // Pa     101325 at sea level [STD]
  altitudeM: number;               // m
  wind: { x: number; y: number };  // m/s    velocity of the air (world frame)
  // Surface
  surface: SurfaceProps;
  slopeRad: number;                // + = uphill in +X
  // Body / equipment
  bodyMassKg: number;              // default 70 [TUNE]
  heightM: number;                 // default 1.75 [TUNE]
  footwear: 'BARE' | 'RUBBER' | 'CLEATS' | 'SMOOTH_SOLE';
  fatigue: number;                 // 0..1  (0 fresh)
}

interface SurfaceProps {
  muStatic: number;                // μs
  muKinetic: number;               // μk  (≈ 0.8–0.9 × μs) [TUNE]
  restitution: number;             // e   0..1
  stiffness: number;               // N/m per contact patch (compliance, see §5)
  damping: number;                 // N·s/m
  sinkDepthPerNewton?: number;     // sand / snow / mud
}
```

### 2.1 Surface presets (all **[TUNE]** engineering defaults; real values vary widely with materials and moisture)

| Surface | μs | μk | Notes |
|---|---|---|---|
| Dry concrete, rubber sole | 0.9 | 0.8 | baseline "ground" |
| Wet concrete, rubber sole | 0.5 | 0.4 | longer braking, wider stance |
| Dry grass / turf, cleats | 0.9 | 0.8 | cleats penetrate; add stud-catch risk on pivots |
| Loose sand | 0.5 | 0.45 | add sink depth, reduced push-off efficiency |
| Packed snow | 0.3 | 0.25 | |
| Ice, smooth sole | 0.1 | 0.05 | gait collapses to short shuffle |
| Gym mat / trampoline | 0.7 | 0.6 | high compliance (energy storage, see §5) |

### 2.2 Derived environment quantities

**Air density from the ideal-gas law** [STD]:
$$\rho = \frac{pM}{RT},\quad M=0.02897\ \text{kg/mol},\ R=8.314\ \text{J/(mol·K)}$$
- 15 °C, 101 325 Pa → 1.225 kg/m³ · 35 °C → 1.146 · −10 °C → 1.342.

**Altitude** (isothermal approximation, scale height ≈ 8.5 km) [STD]: $\rho(h)\approx\rho_0 e^{-h/8500}$ → 3000 m ≈ 0.861 kg/m³ (−30 %). Drag and Magnus shrink accordingly; jump height is unchanged by thin air (gravity changes negligibly).

**Slope** [STD]: along-slope gravity $g_\parallel=g\sin\alpha$, normal $g_\perp=g\cos\alpha$. Stand-without-slipping requires $\mu_s\ge\tan\alpha$ (0.5 → max 26.6°).

**Effective gravity in water** (buoyancy) [STD]:
$$g_{eff}=g\left(1-\frac{\rho_{fluid}}{\rho_{body}}\right),\quad \rho_{body}\approx1010\ \text{kg/m}^3 [TUNE]$$
Fully submerged: $g_{eff}\approx 0.097$ m/s². Drag in water is ~816× air at equal speed → motion is slow, smooth, overdamped.

---

## 3. Core calculation library

### 3.1 Aerodynamic / hydrodynamic drag [STD]
$$\vec F_D=-\tfrac12\rho\,C_dA\,|\vec v_{rel}|\,\vec v_{rel},\qquad \vec v_{rel}=\vec v-\vec v_{wind}$$
- Standing human $C_dA\approx0.7\ \text{m}^2$ [TUNE]. Crouched / tucked ≈ 0.4 [TUNE].
- **Worked example**: 10 m/s headwind on a stationary 70 kg person: $F=\tfrac12(1.225)(0.7)(10^2)=42.9$ N (6.3 % bodyweight).
- **Lean response** (moment balance about the ankles, small angle): $\theta_{lean}\approx F_D/(mg)=0.0625$ rad = **3.6° into the wind**. Add trailing-foot brace and shortened stride beyond ~15 m/s.

### 3.2 Friction limit (slip test) [STD]
Required friction coefficient each stance frame: $\mu_{req}=|F_t|/F_n$.
- If $\mu_{req}>\mu_s$ → **slip event**: foot stops being a fixed anchor; switch to kinetic friction $F_t=\mu_kF_n$, trigger flail reaction (arms abduct, trunk pitches).
- Maximum horizontal deceleration: $a_{max}=\mu g$. Stopping distance from speed $v$: $d=v^2/(2\mu g)$.

| Surface (μs) | $a_{max}$ | Stop from 1.3 m/s |
|---|---|---|
| Dry 0.9 | 8.83 m/s² | 0.096 m |
| Wet 0.45 | 4.41 m/s² | 0.191 m |
| Ice 0.10 | 0.98 m/s² | 0.861 m |

### 3.3 Impulse–momentum with compliance [STD]
$$\vec J=m\Delta\vec v,\qquad \bar F=\frac{J}{\Delta t},\qquad d_{stop}=\tfrac12 v\,\Delta t$$
- **Worked heavy catch**: ball 5 kg at 8 m/s ($p$ = 40 kg·m/s), arms yield for 3 frames (0.125 s): $\bar F=320$ N (**0.47 BW** for 70 kg), arm yield distance 0.5 m.
- Rigid freeze (1 frame, 0.042 s) would be 960 N: the animation must show yielding, not a pop-to-stop.

### 3.4 Projectile with drag and spin [STD]
$$m\dot{\vec v}=m\vec g-\tfrac12\rho C_dA|\vec v_{rel}|\vec v_{rel}+\tfrac12\rho C_LA|\vec v_{rel}|^2\hat n_{Magnus}$$
Integrate with semi-implicit Euler or RK4 at substep ≥ 4 per frame. $C_d\approx0.47$ sphere subcritical [STD]; $C_L$ grows with spin parameter $S=\omega r/v$ [TUNE: $C_L\approx0.5S$ for $S<0.3$].
Vacuum / no-drag closed form: range $R=v_0^2\sin2\theta/g$.

### 3.5 Jump and landing [STD]
- Takeoff speed for height $h$: $v_0=\sqrt{2gh}$. $h=0.5$ m → 3.13 m/s; flight time $t=2v_0/g=0.639$ s = **15.3 frames at 24 fps**.
- Landing deceleration over pelvis drop $d$: $a=v^2/(2d)$; peak ground force $F=m(g+a)$.
  $h=0.5$ m, $d=0.30$ m → $a=16.4$ m/s² (1.67 g) → $F=1831$ N = **2.67 BW**.
- Required pelvis drop for a comfortable limit $a_{allow}$: $d=v^2/(2a_{allow})$. Enforce stylistic floor $d\ge12$ px for readability.
- In low gravity (Moon 1.62): flight time scales $\propto1/g$ → 6.1× longer for same $h$; landing compression for same $v$ is the same, but $v$ is lower for same takeoff effort.

### 3.6 Dynamic stability: extrapolated center of mass [SRC: Hof et al. 2005]
Inverted pendulum with eigenfrequency $\omega_0=\sqrt{g/l}$ ($l$ = CoM height above ankle/foot, ≈ 1.0 m):
$$X_{CoM}^{ext}=x_{CoM}+\frac{v_{CoM}}{\omega_0},\qquad MoS=\min\big(\text{distance from }X_{CoM}^{ext}\text{ to base-of-support edge}\big)$$
- $MoS>0$ → stable without stepping. $MoS<0$ → **a step (or grab) is required**; larger negative = bigger, faster recovery step.
- Walking at 1.3 m/s, $l=1$ m: $v/\omega_0=0.415$ m = 108 px beyond CoM. A 0.26 m foot (68 px) cannot contain this; therefore walking *is* controlled falling and each step re-establishes $MoS>0$ on the next foot.
- **Replaces the fixed `ΔX_xcom > 35 px` trip threshold** in the causality skill.
- Caution [SRC: Curtze et al. 2024]: MoS is a *measure of instantaneous mechanical stability under pendulum assumptions*, not a complete predictor. Use as a trigger plus margin, not as absolute truth.

### 3.7 Rotational dynamics [STD]
$$\vec L=\sum_i\big(m_i\vec r_i\times\vec v_i+I_i\vec\omega_i\big),\quad I_i=m_i(k_il_i)^2\ (\text{radius of gyration }k_i)$$
Free flight (no external torque): $L$ conserved, $\omega=L/I$. Tuck halves $I$ → doubles $\omega$.

### 3.8 Body segment parameters [SRC: Dempster 1955 as adapted by Winter 2009]
Mass fractions of body mass (Winter-adapted Dempster, sagittal, one side where applicable):

| Segment | Mass fraction | CoM from proximal end |
|---|---|---|
| Head + neck | 0.081 | ~1.0 (approx., head-neck unit) |
| Trunk | 0.497 | 0.50 |
| Upper arm | 0.028 | 0.436 |
| Forearm | 0.016 | 0.430 |
| Hand | 0.006 | 0.506 |
| Thigh | 0.100 | 0.433 |
| Shank | 0.0465 | 0.433 |
| Foot | 0.0145 | 0.50 |

Values above are the commonly published Winter/Dempster figures; confirm against the table before locking them project-wide. Alternative: Zatsiorsky–Seluyanov / de Leva gives noticeably different thigh (≈ +40 %) and trunk (≈ −15 %) fractions (SRC notebook comparison). Pick one table and keep it project-wide. The 17-segment rig splits the trunk into pelvis / abdomen / thorax by project-specific ratios [TUNE].

---

## 4. Muscle and neural limits (replaces "any joint can accelerate arbitrarily")

### 4.1 Hill force–velocity [SRC: Hill 1938; Huxley 1957 explains it]
$$(F+a)(v+b)=(F_0+a)\,b\ \Longrightarrow\ \frac{F}{F_0}=\frac{1-u}{1+u/k},\quad u=\frac{v}{v_{max}},\ k=\frac aF_0\ (\approx0.25)\ [TUNE]$$
- More load → slower shortening; faster shortening → less force.
- With $k=0.25$: **peak power at $u=0.309$, where $F=0.309F_0$**, $P_{max}\approx0.096F_0v_{max}$.
- Animation consequence: a *fast* limb swing cannot also carry *high* force. A maximal punch is fast with little load; a push-through shove is slow with high force. Do not give one segment both.

### 4.2 Activation and latency [TUNE unless noted]
| Process | Time | Frames @24 fps |
|---|---|---|
| Electromechanical delay | 30–50 ms | 1–2 |
| Short-latency stretch reflex | ~40 ms | ~1 |
| Long-loop / balance reflex | 80–120 ms | 2–3 |
| Visual reaction (simple) | 150–250 ms | 4–6 |
| Activation rise $\tau_{act}$ | 10–20 ms | <1 (smooth) |
| Deactivation $\tau_{deact}$ | 40–60 ms | ~1–2 |

Therefore a character struck from behind cannot visibly "decide" a counter-move until ≥ 4 frames after contact; only reflexive stagger fits in frames 1–3.

### 4.3 Minimum-jerk reaching [SRC-class: Flash & Hogan 1985; formula standard]
$$x(\tau)=x_0+\Delta\,(10\tau^3-15\tau^4+6\tau^5),\ \tau=t/T,\quad v_{peak}=1.875\,\Delta/T$$
Use for goal-directed hand trajectories (reach, catch intercept) instead of arbitrary easing. Peak velocity is at mid-movement; hand paths are nearly straight.

### 4.4 Fatigue and effort [TUNE]
$F_0^{eff}=F_0(1-0.4f)$, $v_{max}^{eff}=v_{max}(1-0.25f)$ for fatigue $f\in[0,1]$. Increases tremor and shortens recovery.

### 4.5 Motor noise [TUNE]
Signal-dependent noise: $\sigma_F=\kappa F$ with $\kappa\approx0.02$–$0.08$. Apply as a **low-pass-filtered** perturbation (cutoff ~8 Hz), never white jitter.

---

## 5. Contact model (where quantum mechanics actually enters the engine)

At the atomic scale, solid contact is electromagnetic repulsion plus the Pauli exclusion principle: electron clouds of two bodies cannot occupy the same states. Macroscopically this appears as a stiff normal force and finite friction.

**Implementation: compliant penalty contact** [STD]
$$F_n=\max\big(0,\ k\,\delta+c\,\dot\delta\big),\quad \delta=\text{penetration depth}$$
- $k$, $c$ come from `SurfaceProps`. Choose $c\approx2\zeta\sqrt{km}$ with $\zeta\in[0.3,1.0]$.
- Restitution $e$ (velocity ratio after/before): normal velocity after impact $v_n'=-e\,v_n$.
- Hard floor target: penetration < 1 px at rest.

---

## 6. Quantum mechanics: honest bridge to animation

### 6.1 What the numbers say (so the framework does not fake physics)

| Quantum effect | Value for a 70 kg person at 1 m/s | Verdict |
|---|---|---|
| de Broglie wavelength $\lambda=h/(mv)$ | $9.5\times10^{-36}$ m | Not observable. No diffraction or tunneling for bodies. |
| Heisenberg bound $\Delta x\,\Delta v\ge\hbar/(2m)$ | for $\Delta x=1$ mm, $\Delta v\ge7.5\times10^{-34}$ m/s | Irrelevant. |
| Thermal energy $k_BT$ at 310 K | $4.3\times10^{-21}$ J | Brownian motion of the body is negligible. |
| Cross-bridge count fluctuation $\sim1/\sqrt N$, $N\sim10^{12}$–$10^{15}$ (order-of-magnitude estimate) | $10^{-6}$–$3\times10^{-8}$ relative | Muscle force is effectively deterministic. Visible tremor is neural noise (§4.5), not quantum. |

**Rule: never add literal quantum randomness to a realistic character. It would be physically wrong.**

### 6.2 Where quantum mechanics legitimately feeds the model (emergent constants)
1. **Contact stiffness and friction** → Pauli exclusion + EM forces → §5 parameters.
2. **Muscle force and the Hill curve** → actin–myosin cross-bridge cycle powered by ATP hydrolysis; Huxley's attach/detach kinetics reproduce Hill's force–velocity curve (SRC: Huxley 1957 and later cross-bridge reviews) → §4.1.
3. **Elasticity and tendon energy return** → molecular bonds → spring constants and hysteresis ($\eta\approx0.9$ for tendon) [TUNE].
4. **Material and fabric constants** (cloth, hair damping) → molecular structure → damping ratios.

### 6.3 Quantum → classical bridge as a planning principle
- **Principle of stationary action** (Feynman path integral, classical limit via stationary phase; Ehrenfest theorem for expectation values) justifies planning movements as trajectories that extremize an action-like cost:
$$S=\int\big(T-V\big)\,dt\ \longrightarrow\ J=\int\big(w_E\,\text{effort}^2+w_{jerk}\,\dddot x^2+w_{bal}\,\max(0,-MoS)^2\big)\,dt$$
- Optimize $J$ per action phase: yields minimum-effort, balanced, smooth motion. This is the **only** "quantum-derived" rule applied to realistic characters; it is really classical mechanics' variational form.

### 6.4 Opt-in `QUANTUM_STYLE` mode (fantasy or sci-fi characters only; never default)
Enabled only when `style = 'EXAGGERATED'` **and** the user explicitly requests it. Every effect must declare its energy/momentum accounting.

| Stylized effect | Physical-looking rule |
|---|---|
| **Superposition afterimages** | Render 2–3 plausible paths (e.g. dodge left / dodge right) at weights $p_i$ with $\sum p_i=1$; weights collapse to one path at the "measurement" (contact or decision) frame. Afterimage alpha ∝ $p_i$. |
| **Tunneling dash** | Instantaneous relocation allowed through a barrier of width $w$ with success probability $P\approx e^{-2\kappa w}$ ($\kappa$ = story-tunable). Character velocity before = after; add 3-frame energy-release effect. |
| **Entangled pair** | Two characters share a conserved quantity (e.g. total angular momentum): spin one up → other spins opposite. Log the shared invariant. |
| **Uncertainty blur** | Motion blur length ∝ $v\cdot\Delta t_{shutter}$ with extra "position fuzz" width $\sigma_x$; pose stays at integer-frame truth. |

Validation: stylized mode still must pass momentum accounting (`ΔP_total` explained by named sources) and cannot break joint-length or ground-contact invariants unless the effect is flagged as `TELEPORT`.

---

## 7. Per-frame solver order

1. Read `EnvironmentState`; recompute $\rho$, $\mu$, wind-adjusted $v_{rel}$ if changed.
2. Apply intent → desired joint torques, **clipped by Hill limit** (§4.1) and latency (§4.2).
3. Integrate forces: gravity (or $g_{eff}$), drag, contact (§5), grip/limb constraints.
4. Compute $X^{ext}_{CoM}$ and MoS (§3.6); trigger step/grab recovery if MoS < 0.
5. Slip test (§3.2).
6. Resolve IK to solved joint states, preserve segment lengths.
7. Apply secondary motion (damped oscillators) and filtered noise (§4.5).
8. Audit (§8). Export or repair.

---

## 8. Verification metrics

1. **Unit consistency**: every logged value carries an SI value and px conversion; no unit mixing.
2. **Environment coherence**: lean/step choices must match computed wind force ($\theta_{lean}$ within ±1.5° of §3.1), friction use ≤ $\mu_s$ (or flagged slip), braking distance within 25 % of $v^2/(2\mu g)$.
3. **Muscle plausibility**: no segment simultaneously exceeds 0.7 $v_{max}$ and 0.7 $F_0$ (Hill).
4. **Latency**: no voluntary reaction earlier than 4 frames after stimulus at 24 fps; reflexes ≥ 1 frame.
5. **Quantum honesty**: realistic mode contains no random positional jitter above the motor-noise level; stylized effects are flagged and conserve declared quantities.
6. **Energy bookkeeping**: unexplained kinetic energy gain per frame < 2 % unless an active muscle source is logged.

---

## 9. Sources

- Hof, A.L., Gazendam, M.G.J., Sinke, W.E. (2005). The condition for dynamic stability. *J. Biomechanics* 38(1):1–8 (XcoM, MoS, $\omega_0=\sqrt{g/l}$).
- Curtze, C., Buurke, T.J.W., McCrum, C. (2024). Notes on the margin of stability. *J. Biomechanics* 166 (limits of interpreting MoS).
- Hill, A.V. (1938); Huxley, A.F. (1957): Hill force–velocity relation and cross-bridge model; see Hill's muscle model overview (Wikipedia) and recent cross-bridge/Hill reviews (Frontiers in Physiology 2022; arXiv 2602.01743).
- Winter, D.A. (2009), *Biomechanics and Motor Control of Human Movement*, adapting Dempster (1955); de Leva (1996) adjustments of Zatsiorsky–Seluyanov (BMC notebook, Duarte).
- Flash, T. & Hogan, N. (1985): minimum-jerk trajectories (formula standard; not re-verified online in this revision).
- Constants tagged [TUNE] are engineering defaults, not measurements.
