---
name: "physics-and-scientific-mass-variations"
version: "3.0.0"
description: >-
  Comprehensive physical framework and skills governing the scientific variations of mass:
  Inertial Mass, Gravitational Mass (active, passive, and equivalence principle), Rest Mass (Invariant Mass),
  Relativistic Mass (velocity dependence and Lorentz scaling), and Sub-category Scientific Variations
  (Reduced Mass, Effective Mass, and Hydrodynamic Added Mass).
---

# Physics and Scientific Variations of Mass Skill (v3.0)

## 1. Core Philosophy & Overview

In fundamental physics, mass describes an object's resistance to acceleration or how it interacts with gravitational fields. Mass is not merely a single static scalar number; it manifests across distinct physical contexts and scientific variations:

1. **Inertial Mass ($m_i$)**: Quantitative measure of an object's resistance to change in velocity (acceleration) when a net force is applied ($F = m_i \cdot a$).
2. **Gravitational Mass ($m_g$)**: Quantitative measure of an object's response to or creation of a gravitational field (active vs. passive). Modern physics and precision experiments prove its exact equivalence to inertial mass ($m_i = m_g$).
3. **Rest Mass / Invariant Mass ($m_0$)**: The intrinsic mass of an object measured in its own rest frame ($v = 0$), remaining strictly constant regardless of motion or observer reference frame.
4. **Relativistic Mass ($m_{rel}$)**: Velocity-dependent representation of an object's total energy content ($E / c^2$) as it moves near light speed ($m_{rel} = \gamma(v) m_0$).
5. **Scientific Variations & Sub-categories**: Specialized formulations including **Reduced Mass ($\mu$)** for two-body orbital and collision dynamics, **Hydrodynamic Added Mass ($m_{added}$)** in fluid mechanics, and **Effective Mass ($m^*$)** in condensed matter physics.

---

## 2. Detailed Mass Skills Specifications

### Skill #64: Inertial Mass & Force Acceleration Dynamics
- **Definition**: Measures an object's translational and rotational resistance to acceleration under applied forces or torques.
- **Governing Equations**:
  - Newton's Second Law: $\vec{F} = m_i \vec{a} \implies \vec{a} = \frac{\vec{F}}{m_i}$
  - Linear Momentum: $\vec{p} = m_i \vec{v}$
  - Impulse-Momentum Theorem: $\vec{J} = \int \vec{F} dt = \Delta \vec{p} = m_i \Delta \vec{v}$
  - Moment of Inertia (Rotational Inertia): $I = \sum m_i r_i^2$, Torque $\vec{\tau} = I \vec{\alpha}$
- **Causal Principle**: "How much net force and torque must be applied to achieve a desired translational acceleration or rotational spin for a given mass?"
- **Biomechanical & Physical Rules**:
  - Heavier inertial mass ($m_i > 50\text{kg}$) requires proportionally higher ground reaction forces and longer acceleration/deceleration durations.
  - Rotational moment of inertia scales with $r^2$; tucking limbs reduces $I$, increasing angular acceleration $\alpha$.
- **Failure Modes Prevented**:
  - Instantaneous velocity snaps without force application.
  - Identical acceleration rates for light vs extremely heavy objects under equal force.

---

### Skill #65: Gravitational Mass & Equivalence Principle
- **Definition**: Measures an object's response to an external gravitational field (Passive Gravitational Mass) or its creation of a gravitational field (Active Gravitational Mass).
- **Governing Equations**:
  - Universal Gravitation (Active & Passive):
    $$F_g = G \frac{M_{g, \text{active}} \cdot m_{g, \text{passive}}}{r^2}$$
  - Local Weight Force: $W = m_{g, \text{passive}} \cdot g$
  - Weak Equivalence Principle (WEP):
    $$m_i = m_g \implies m_i a = m_g g \implies a = g$$
    (Verified in Eötvös and MICROSCOPE satellite experiments to precision $< 10^{-15}$). All bodies accelerate identically in a gravitational vacuum regardless of mass.
  - Gravitational Potential Energy: $U_g = m_g g h$ (local) or $U_g = -G \frac{M m}{r}$ (astrophysical).
- **Causal Principle**: "Does gravitational attraction scale proportionally with mass while maintaining constant freefall acceleration in vacuum?"
- **Biomechanical & Physical Rules**:
  - In atmosphere, aerodynamic drag ($F_d = \frac{1}{2} \rho v^2 C_d A$) creates mass-dependent terminal velocities, whereas in a vacuum all bodies drop synchronously.
  - Active gravitational mass generates central attraction fields for planetary and orbital dynamics.

---

### Skill #66: Rest Mass (Invariant Mass) & Mass-Energy Equivalence
- **Definition**: The intrinsic mass of an object or system measured in its own center-of-momentum / rest frame ($v = 0$). Invariant under Lorentz transformations.
- **Governing Equations**:
  - Mass-Energy Equivalence: $E_0 = m_0 c^2$
  - System Invariant Mass (Particle Physics & Bound Systems):
    $$M_{\text{inv}}^2 c^4 = \left( \sum_{k} E_k \right)^2 - \left\| \sum_{k} \vec{p}_k c \right\|^2$$
  - Mass Defect & Nuclear Binding Energy:
    $$\Delta m = \sum m_{\text{constituents}} - m_{\text{bound\_system}}, \quad E_{\text{binding}} = \Delta m \cdot c^2$$
- **Causal Principle**: "What is the intrinsic frame-independent energy content of this mass at rest, and how does mass defect conserve total energy during reactions?"
- **Biomechanical & Physical Rules**:
  - Rest mass $m_0$ serves as the fundamental anchor for relativistic transformations.
  - Bound physical systems possess slightly less rest mass than the sum of their free constituents due to negative binding energy.

---

### Skill #67: Relativistic Mass & Lorentz Velocity Dynamics
- **Definition**: A velocity-dependent description of an object's total energy content ($E / c^2$) as it approaches the speed of light ($c$).
- **Governing Equations**:
  - Lorentz Factor:
    $$\gamma(v) = \frac{1}{\sqrt{1 - \frac{v^2}{c^2}}}$$
  - Relativistic Mass:
    $$m_{\text{rel}}(v) = \gamma(v) \cdot m_0 = \frac{m_0}{\sqrt{1 - \frac{v^2}{c^2}}}$$
  - Relativistic Momentum: $\vec{p} = \gamma(v) m_0 \vec{v} = m_{\text{rel}} \vec{v}$
  - Relativistic Total Energy: $E = m_{\text{rel}} c^2 = \gamma(v) m_0 c^2 = \sqrt{p^2 c^2 + m_0^2 c^4}$
  - Relativistic Kinetic Energy: $K = (\gamma - 1) m_0 c^2$
  - Ultra-Relativistic Limit ($v \to c$): As $v \to c$, $\gamma \to \infty$, causing $m_{\text{rel}} \to \infty$; infinite energy is required to accelerate a massive body to light speed $c$. Photons have $m_0 = 0$ but carry momentum $p = E / c$.
- **Causal Principle**: "How does an object's effective resistance to acceleration grow non-linearly as its velocity approaches light speed?"
- **Biomechanical & Physical Rules**:
  - At non-relativistic speeds ($v \ll c$, e.g. human animation velocities), $\gamma \approx 1.0$ and $m_{\text{rel}} \approx m_0$.
  - For high-energy hyper-motion or sci-fi relativistic effects ($v > 0.1c$), relativistic mass dilatation and momentum scaling must be applied to force vectors.

---

### Skill #68: Scientific Variations & Sub-Categories of Mass
- **Definition**: Specialized physical mass concepts used in multi-body, fluid, and condensed-matter physics.
- **Sub-Categories & Governing Equations**:
  1. **Reduced Mass ($\mu$)** (Two-Body Orbital & Collision Problem):
     $$\mu = \frac{m_1 m_2}{m_1 + m_2}$$
     Simplifies two-body motion into an equivalent single-body problem relative to the center of mass.
  2. **Hydrodynamic Added Mass ($m_{\text{added}}$)** (Fluid Mechanics):
     $$m_{\text{added}} = C_v \cdot \rho_{\text{fluid}} \cdot V_{\text{displaced}}$$
     $$m_{\text{effective}} = m_0 + m_{\text{added}}$$
     When an object accelerates through a fluid (water/air), it must accelerate a surrounding volume of fluid, increasing its virtual inertial mass.
  3. **Effective Mass ($m^*$)** (Solid State / Quantum Lattice):
     $$m^* = \hbar^2 \left( \frac{d^2 E}{d k^2} \right)^{-1}$$
     Describes electron behavior inside periodic crystal potentials.
- **Causal Principle**: "How do surrounding media or coupled two-body interactions modify the effective mass experienced during motion?"

---

## 3. Quantitative Verification Metrics

Every calculation and physics simulation involving Scientific Variations of Mass must satisfy:
1. **Equivalence Principle Precision**: $|m_i - m_g| / m_i < 10^{-12}$ in standard gravitational simulations.
2. **Lorentz Energy Conservation**: Relativistic total energy $E = \sqrt{p^2 c^2 + m_0^2 c^4}$ held invariant across frame transformations within float64 precision.
3. **Inertial Force Consistency**: $\vec{F}_{\text{net}} = m_i \vec{a}$ verified across all non-relativistic frames.
4. **Reduced Mass Two-Body Accuracy**: Relative position trajectory error $< 0.01\%$ compared to full two-body analytical integration.
5. **Fluid Added Mass Ratio**: Acceleration in fluid matches $a = F / (m_0 + C_v \rho V)$.
