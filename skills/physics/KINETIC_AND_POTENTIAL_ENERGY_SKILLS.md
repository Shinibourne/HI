---
name: "kinetic-and-potential-energy-dynamics"
version: "3.0.0"
description: >-
  Comprehensive physical framework and skills governing Kinetic Energy (Translational, Rotational, Vibrational),
  Potential Energy (Gravitational, Elastic, Chemical, Electrostatic/Nuclear), and Governing Physical Conservation Laws
  (Law of Conservation of Energy and Mechanical Energy Conservation).
---

# Kinetic & Potential Energy Dynamics Skill (v3.0)

## 1. Core Philosophy & Overview

Energy is the scalar quantity that characterizes the ability of a physical system to perform work or produce physical change. In physical mechanics and procedural animation, energy manifests as:

1. **Kinetic Energy (KE)**: The energy an object possesses due to its motion.
   - **Formula**: $\text{KE} = \frac{1}{2} m v^2$ (measured in Joules, J; $m$ in kg, $v$ in m/s).
   - **Kinetic Subcategories**:
     - *Translational*: Motion along a straight or curved spatial trajectory ($\text{KE}_{\text{trans}} = \frac{1}{2} m v^2$).
     - *Rotational*: Energy of an object spinning around an internal axis ($\text{KE}_{\text{rot}} = \frac{1}{2} I \omega^2$).
     - *Vibrational*: Oscillation of connected structural parts or molecules ($\text{KE}_{\text{vib}} = \frac{1}{2} m v_{\text{vib}}^2 = \frac{1}{2} k (A^2 - x^2)$).
2. **Potential Energy (PE)**: Stored energy arising from an object's position, configuration, or internal state within a force field or system.
   - **Gravitational Formula**: $\text{PE}_{\text{grav}} = mgh$ ($m$ in kg, $g$ acceleration due to gravity, $h$ in meters; measured in Joules, J).
   - **Potential Subcategories**:
     - *Gravitational*: Elevation within a gravitational field ($\text{PE}_{\text{grav}} = mgh$ or $U = -G \frac{M m}{r}$).
     - *Elastic*: Deformation of stretched or compressed springs/materials ($\text{PE}_{\text{elastic}} = \frac{1}{2} k x^2$).
     - *Chemical*: Energy stored in molecular chemical bonds ($\text{PE}_{\text{chem}}$).
     - *Electrostatic / Nuclear*: Energy stored via electric charges ($\text{PE}_{\text{elec}} = \frac{1}{4\pi\varepsilon_0}\frac{q_1 q_2}{r}$) or atomic nuclear binding forces ($\text{PE}_{\text{nuc}} = \Delta m \cdot c^2$).
3. **Governing Physical Conservation Laws**:
   - **Law of Conservation of Energy**: Total energy in an isolated system remains strictly constant ($E_{\text{total}} = \text{constant}$). Energy cannot be created or destroyed, only transformed between forms.
   - **Mechanical Energy Conservation**: In an ideal system without non-conservative friction or external losses, the sum of kinetic and potential energy remains constant ($E_{\text{mech}} = \text{KE} + \text{PE} = \text{constant}$).

---

## 2. Detailed Skills Specifications

### Skill #69: Translational Kinetic Energy & Linear Displacement Dynamics
- **Definition**: Quantifies the kinetic energy stored in the straight-line or curvilinear translation of an entity's center of mass.
- **Governing Equations**:
  $$\text{KE}_{\text{trans}} = \frac{1}{2} m v^2 = \frac{p^2}{2m}$$
  $$\Delta \text{KE}_{\text{trans}} = W_{\text{net}} = \int \vec{F}_{\text{net}} \cdot d\vec{r}$$
- **Causal Principle**: "How much work must be performed by net forces to accelerate an object of mass $m$ to linear velocity $v$?"
- **Biomechanical & Physical Rules**:
  - Higher velocity produces quadratic energy demands ($\propto v^2$). Doubling speed requires $4\times$ the kinetic energy absorption distance during braking or collision.
  - Linear momentum $\vec{p} = m\vec{v}$ dictates directional force transmission in impacts.
- **Failure Modes Prevented**:
  - Linear velocity spikes without work application.
  - Equal stopping distances for $1\text{m/s}$ vs $4\text{m/s}$ motion.

---

### Skill #70: Rotational Kinetic Energy & Axial Spin Mechanics
- **Definition**: Measures the kinetic energy of an articulated body or prop spinning around an internal or external axis of rotation.
- **Governing Equations**:
  $$\text{KE}_{\text{rot}} = \frac{1}{2} I \omega^2 = \frac{L^2}{2I}$$
  $$\tau_{\text{net}} = I \alpha, \quad W_{\text{rot}} = \int \tau d\theta$$
- **Causal Principle**: "How much rotational torque and angular displacement is stored in a spinning torso, limb, or weapon?"
- **Biomechanical & Physical Rules**:
  - Moment of inertia $I = \sum m_i r_i^2$ scales with distance squared; tucking limbs in mid-air reduces $I$, increasing angular speed $\omega$ while preserving rotational kinetic energy and angular momentum $L$.
  - Aerial flips and martial spin kicks convert linear launch energy into rotational kinetic energy.
- **Failure Modes Prevented**:
  - Constant spin rate when tucking or extending limbs.
  - Rotational acceleration without applied torque or inertia change.

---

### Skill #71: Vibrational Kinetic Energy & Oscillatory Structural Dynamics
- **Definition**: Governs the rapid internal kinetic oscillations of flexible structures, limbs, apparel, or weapon shafts around equilibrium positions.
- **Governing Equations**:
  $$\text{KE}_{\text{vib}}(t) = \frac{1}{2} m v_{\text{vib}}(t)^2 = \frac{1}{2} k \left( A^2 - x(t)^2 \right)$$
  $$x(t) = A e^{-\gamma t} \cos(\omega_d t + \phi)$$
- **Causal Principle**: "How does impact force dissipate into high-frequency structural vibration and harmonic decay?"
- **Biomechanical & Physical Rules**:
  - Striking a rigid object or landing heavily causes high-frequency kinetic vibrations that decay via internal damping $\gamma$.
  - Secondary apparel or weapon tassels vibrate in anti-phase during rapid Direction changes.
- **Failure Modes Prevented**:
  - Rigid, non-vibrating impact landings.
  - Undamped infinite jitter without physical decay.

---

### Skill #72: Gravitational Potential Energy & Elevation Dynamics
- **Definition**: Measures the potential energy stored in an entity or prop due to its vertical elevation within a gravitational acceleration field.
- **Governing Equations**:
  $$\text{PE}_{\text{grav}} = mgh \quad (\text{local uniform field})$$
  $$U_{\text{grav}} = -G \frac{M m}{r} \quad (\text{astrophysical central field})$$
- **Causal Principle**: "How much gravitational potential energy is accumulated at peak elevation, and how does it convert into kinetic fall speed?"
- **Biomechanical & Physical Rules**:
  - Elevating a mass by height $h$ requires work $W = mgh$; dropping the mass converts 100% of $\text{PE}_{\text{grav}}$ into $\text{KE}_{\text{trans}}$ in a vacuum ($v = \sqrt{2gh}$).
  - In athletic jumping, apex height determines touchdown kinetic velocity.
- **Failure Modes Prevented**:
  - Falling faster or slower than gravitational freefall $v = \sqrt{2gh}$.
  - Instantaneous upward elevation changes without work input.

---

### Skill #73: Elastic Potential Energy & Deformable Material Mechanics
- **Definition**: Governs energy stored when elastic materials (tendons, muscles, springs, bows, trampolines) undergo mechanical deformation.
- **Governing Equations**:
  $$\text{PE}_{\text{elastic}} = \frac{1}{2} k x^2$$
  $$F_{\text{elastic}} = -k x \quad (\text{Hooke's Law})$$
- **Causal Principle**: "How much energy is stored during joint compression and released during explosive recoil?"
- **Biomechanical & Physical Rules**:
  - Deep leg crouch prior to jumping stores elastic potential energy in quadriceps and Achilles tendons ($x$).
  - On landing or catching, elastic compression absorbs kinetic impact before restoring resting shape.
- **Failure Modes Prevented**:
  - Explosive jumps without crouch deformation energy storage.
  - Rigid impacts with zero material elasticity.

---

### Skill #74: Chemical, Electrostatic & Nuclear Potential Energy
- **Definition**: Models internal potential energy variations across chemical bond reactions, electrostatic charge interactions, and nuclear mass defect conversions.
- **Governing Equations**:
  $$\text{PE}_{\text{elec}} = \frac{1}{4 \pi \varepsilon_0} \frac{q_1 q_2}{r} = k_e \frac{q_1 q_2}{r}$$
  $$\text{PE}_{\text{chem}} = \Delta H_{\text{reaction}}$$
  $$\text{PE}_{\text{nuc}} = \Delta m \cdot c^2$$
- **Causal Principle**: "How do internal microscopic and field potential energies transform into macroscopic mechanical motion or energy release?"
- **Biomechanical & Physical Rules**:
  - Muscular work converts chemical potential energy (ATP hydrolysis) into mechanical kinetic work ($W = \eta \cdot \Delta \text{PE}_{\text{chem}}$).
  - Sci-fi energy blasts or magnetic force interactions follow electrostatic and field potential laws.
- **Failure Modes Prevented**:
  - Uncaused muscular work without internal chemical energy expenditure.
  - Non-physical field attractions disobeying $1/r$ or $1/r^2$ laws.

---

### Skill #75: Law of Conservation of Energy & Transformation Dynamics
- **Definition**: Enforces the fundamental thermodynamic law that total energy in an isolated system remains strictly constant across all transformations.
- **Governing Equations**:
  $$E_{\text{total}} = \text{KE} + \text{PE} + Q + E_{\text{internal}} = \text{constant}$$
  $$\Delta E_{\text{system}} + \Delta E_{\text{surroundings}} = 0$$
- **Causal Principle**: "Does the sum of all kinetic, potential, thermal, and work energy terms remain conserved across every phase transition?"
- **Biomechanical & Physical Rules**:
  - Energy cannot disappear; kinetic energy lost during friction convert into thermal heat $Q = F_f \cdot d$.
  - Energy input from muscular work equals change in mechanical energy plus heat loss.
- **Failure Modes Prevented**:
  - Energy creation out of nothing (spontaneous speed spikes).
  - Energy destruction (motion vanishing without conversion to PE, heat, or deformation).

---

### Skill #76: Mechanical Energy Conservation & Phase Oscillations
- **Definition**: Enforces conservation of total mechanical energy ($E_{\text{mech}} = \text{KE} + \text{PE}$) in conservative ideal systems such as pendulums, bouncing balls, and ballistic leaps.
- **Governing Equations**:
  $$E_{\text{mech}} = \text{KE}_{\text{trans}} + \text{KE}_{\text{rot}} + \text{PE}_{\text{grav}} + \text{PE}_{\text{elastic}} = \text{constant}$$
  $$\frac{1}{2} m v_1^2 + m g h_1 + \frac{1}{2} k x_1^2 = \frac{1}{2} m v_2^2 + m g h_2 + \frac{1}{2} k x_2^2$$
- **Causal Principle**: "How does mechanical energy continuously shift back and forth between kinetic motion and potential storage across dynamic phases?"
- **Biomechanical & Physical Rules**:
  - At trajectory apex: $v_y = 0$, $\text{KE}_{\text{vert}} = 0$, $\text{PE}_{\text{grav}} = \text{maximum}$.
  - At ground contact: $h = 0$, $\text{PE}_{\text{grav}} = 0$, $\text{KE}_{\text{trans}} = \text{maximum}$.
  - During spring rebound: $\text{KE}$ drops to $0$ as $\text{PE}_{\text{elastic}}$ reaches maximum at maximum compression.
- **Failure Modes Prevented**:
  - Asymmetric height/speed gains in lossless ballistic flight.
  - Non-conservative velocity spikes at trajectory apex.

---

## 3. Quantitative Verification Metrics

Every calculation and physics simulation involving Kinetic and Potential Energy Dynamics must satisfy:
1. **Total Energy Conservation Precision**: $|\Delta E_{\text{total}}| / E_{\text{initial}} < 10^{-6}$ across all closed-system frames.
2. **Mechanical Energy Interchange Consistency**: In conservative parabolic flight, $mgh + \frac{1}{2}mv^2 = E_{\text{mech}}$ holds invariant within float64 precision.
3. **Quadratic Velocity Scaling**: Double velocity requires $4\times$ kinetic energy ($\text{KE}(2v) = 4 \text{KE}(v)$).
4. **Elastic Potential Balance**: Spring compression energy $\frac{1}{2}kx^2$ matches kinetic impact energy $\frac{1}{2}mv^2$ at maximum deflection.
5. **Rotational Kinetic Preservation**: Spin energy $\frac{1}{2}I\omega^2$ scales correctly with moment of inertia changes during tucks and extends.
