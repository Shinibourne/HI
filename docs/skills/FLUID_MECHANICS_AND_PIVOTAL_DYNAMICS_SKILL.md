---
name: "fluid-mechanics-and-pivotal-dynamics"
version: "3.0.0"
description: >-
  Comprehensive physical framework and skills governing Fluid Mechanics and Pivotal Dynamics:
  Mass Conservation & Continuity (Q = A1 v1 = A2 v2, m_dot = \rho Q),
  Energy & Pressure Metrics (Bernoulli's Equation: Static, Dynamic, Hydrostatic Head),
  Structural Reaction Mechanics (Control Volume Linear Momentum, F_Rx and F_Ry reaction forces),
  Turbomachinery Dynamics (Angular Momentum / Moment of Momentum, Shaft Torque T, Shaft Power W_dot),
  Flow Behavior Thresholds (Reynolds Number Re, Laminar, Transitional, Turbulent Regimes),
  and Pipeline Friction & Head Loss (Darcy-Weisbach Equation).
---

# Fluid Mechanics and Pivotal Dynamics Skill (v3.0)

## 1. Core Philosophy & Overview

Fluid mechanics and pivotal dynamics govern how forces interact with fluids to create motion, pressure distributions, and structural reaction forces. The core mathematics rely on three foundational conservation laws:
1. **Mass Conservation (Continuity Equation)**: Enforces mass flow conservation across varying cross-sectional fields.
2. **Momentum Balance (Navier-Stokes / Euler & Control Volume Analysis)**: Maps dynamic forces exerted by moving fluid streams onto structural anchors, elbow bends, and nozzle pipes.
3. **Energy Conservation (Bernoulli's Equation)**: Tracks energy conversion between thermodynamic static pressure, directional kinetic dynamic pressure, and gravitational hydrostatic head along streamlines.

---

## 2. Detailed Mathematical breakdown & Calculations

### 1. Fluid Mass & Velocity (Continuity Equation)
The Continuity Equation enforces the conservation of mass. For an incompressible fluid (constant density $\rho$) traveling through varying cross-sectional fields, the volume flow rate ($Q$) remains uniform:

$$Q = A_1 v_1 = A_2 v_2$$

- $Q$: Volume flow rate ($\text{m}^3/\text{s}$)
- $A$: Cross-sectional area ($\text{m}^2$)
- $v$: Mean fluid velocity ($\text{m/s}$)

Mass Flow Rate ($\dot{m}$):

$$\dot{m} = \rho Q = \rho A v \quad (\text{kg/s})$$

---

### 2. Energy & Pressure Metrics (Bernoulli's Equation)
For steady, frictionless (inviscid), and incompressible flow along a streamline, Bernoulli’s equation maps energy conservation as total pressure head:

$$P_1 + \frac{1}{2} \rho v_1^2 + \rho g h_1 = P_2 + \frac{1}{2} \rho v_2^2 + \rho g h_2$$

Where structural energy mechanics break down into three localized fields:
1. **Static Pressure ($P$)**: The thermodynamic pressure of the fluid ($\text{Pa}$ or $\text{N/m}^2$).
2. **Dynamic Pressure ($\frac{1}{2}\rho v^2$)**: Kinetic energy per unit volume, tracking directional thrust from velocity changes.
3. **Hydrostatic Potential ($\rho g h$)**: Gravitational energy dictated by fluid density ($\rho$), acceleration due to gravity ($g = 9.80665\text{ m/s}^2$), and relative height ($h$).

---

### 3. Structural Reaction Mechanics (Linear Momentum)
When fluids change direction or speed (e.g., traveling through an elbow bend, reducer, or nozzle), they exert dynamic hydrodynamic forces. The anchoring reaction force ($\mathbf{F}_R$) required to hold structural joints stable is determined using Newton's Second Law applied via a Control Volume (CV) framework:

$$\sum \mathbf{F} = \dot{m} \left( \beta \mathbf{v}_{\text{out}} - \beta \mathbf{v}_{\text{in}} \right)$$

Breaking this vector balance into directional component equations ($x$ and $y$ coordinate axes):

$$F_{Rx} + P_1 A_1 - P_2 A_2 \cos(\theta) = \beta \dot{m} \left( v_2 \cos(\theta) - v_1 \right)$$

$$F_{Ry} - W_{\text{fluid}} - W_{\text{structure}} - P_2 A_2 \sin(\theta) = \beta \dot{m} \left( v_2 \sin(\theta) - 0 \right)$$

- $\beta$: Momentum correction factor (typically 1.0 to 1.05 depending on velocity profile uniformity).
- $W$: Gravitational weight forces of components and fluid inside the control volume ($\text{N}$).
- $\theta$: Geometric deflection angle of the flow path (degrees or radians).

---

### 4. Turbomachinery Dynamics (Angular Momentum)
When evaluating rotational fluid mechanics (pivotal turbomachinery, pumps, turbines, and centrifugal impellers), the system tracks the Moment of Momentum (Euler Turbomachine Equation) to find shaft torque ($T$) and fluid angular velocity ($\Omega$):

$$T = \dot{m} \left( r_{\text{out}} v_{t,\text{out}} - r_{\text{in}} v_{t,\text{in}} \right)$$

- $r$: Radial distance from structural pivot axis to flow streamline ($\text{m}$).
- $v_t$: Tangential component of velocity vector perpendicular to radius ($\text{m/s}$).

Fluid Shaft Power Calculation ($\dot{W}_{\text{shaft}}$):

$$\dot{W}_{\text{shaft}} = T \cdot \Omega = \dot{m} \Delta E$$

where $\Omega$ is shaft angular velocity ($\text{rad/s}$).

---

### 5. Flow Behavior Thresholds (Reynolds Number)
To determine if calculations must account for highly ordered layers (Laminar) or chaotic, mixing losses (Turbulent), engineers evaluate the dimensionless ratio of inertial forces to viscous friction:

$$Re = \frac{\rho v D}{\mu} = \frac{v D}{\nu}$$

- $D$: Characteristic hydraulic diameter ($\text{m}$).
- $\mu$: Dynamic viscosity ($\text{Pa}\cdot\text{s}$).
- $\nu$: Kinematic viscosity ($\mu / \rho$) ($\text{m}^2/\text{s}$).

| Flow Regime | Threshold Requirement | Mechanics Properties |
| :--- | :--- | :--- |
| **Laminar** | $Re \le 2100$ | Dominated by viscous shear; fluid moves in smooth, predictive streamlines. |
| **Transitional** | $2100 < Re \le 4000$ | Unstable oscillations alternate between streamline layers and vortex shedding. |
| **Turbulent** | $Re > 4000$ | Chaotic, inertial energy dominance; localized eddies dictate high friction drops. |

---

### 6. Pipeline Friction & Head Loss (Darcy-Weisbach Equation)
Major head loss due to pipe wall friction over length $L$ is calculated via:

$$h_f = f \cdot \frac{L}{D} \cdot \frac{v^2}{2g}$$

where $f$ is Darcy friction factor ($f = 64 / Re$ for laminar flow; Moody chart / Colebrook equation for turbulent flow).

---

## 3. Detailed Skills Specifications (Skills #92–#97)

### Skill #92: Mass Conservation & Continuity Dynamics
- **Definition**: Enforces volume flow rate ($Q = A v$) and mass flow rate ($\dot{m} = \rho A v$) conservation across varying conduit cross-sections.
- **Governing Equations**: $A_1 v_1 = A_2 v_2$, $\dot{m} = \rho A v$.
- **Causal Principle**: "How does changing cross-sectional flow area alter fluid velocity while conserving total mass flow?"
- **Failure Modes Prevented**: Velocity discontinuities or artificial mass creation/destruction across nozzles and reducers.

### Skill #93: Bernoulli Energy Metrics & Pressure Head
- **Definition**: Maps conservation of energy along fluid streamlines across static pressure $P$, dynamic pressure $\frac{1}{2}\rho v^2$, and hydrostatic head $\rho g h$.
- **Governing Equations**: $P + \frac{1}{2}\rho v^2 + \rho g h = \text{constant}$.
- **Causal Principle**: "How does static pressure trade off with dynamic velocity pressure as fluid accelerates?"
- **Failure Modes Prevented**: Pressure head non-conservation during elevation changes or nozzle accelerations.

### Skill #94: Control Volume Linear Momentum & Reaction Forces
- **Definition**: Calculates dynamic anchoring reaction forces ($F_{Rx}, F_{Ry}$) on pipe bends, nozzles, and deflector vanes using control volume momentum balance.
- **Governing Equations**: $\sum \mathbf{F} = \dot{m} (\beta \mathbf{v}_{\text{out}} - \beta \mathbf{v}_{\text{in}})$.
- **Causal Principle**: "What anchoring force is required to hold structural joints stable against dynamic fluid momentum changes?"
- **Failure Modes Prevented**: Unanchored pipe joint displacement or ignoring dynamic pressure thrust on elbow bends.

### Skill #95: Turbomachinery Dynamics & Moment of Momentum
- **Definition**: Computes shaft torque ($T = \dot{m}(r_{\text{out}} v_{t,\text{out}} - r_{\text{in}} v_{t,\text{in}})$) and shaft power ($\dot{W} = T \cdot \Omega$) in pumps, impellers, and pivotal turbines.
- **Governing Equations**: $T = \dot{m}(r_{\text{out}} v_{t,\text{out}} - r_{\text{in}} v_{t,\text{in}})$, $\dot{W}_{\text{shaft}} = T \cdot \Omega$.
- **Causal Principle**: "How does fluid momentum transfer across rotating blades to produce or absorb mechanical torque?"
- **Failure Modes Prevented**: Power discrepancies between shaft mechanical work and fluid momentum flux.

### Skill #96: Reynolds Number & Flow Regime Classification
- **Definition**: Classifies flow behavior into Laminar ($Re \le 2100$), Transitional ($2100 < Re \le 4000$), or Turbulent ($Re > 4000$) regimes based on ratio of inertial to viscous forces.
- **Governing Equations**: $Re = \frac{\rho v D}{\mu} = \frac{v D}{\nu}$.
- **Causal Principle**: "Is fluid flow dominated by smooth viscous streamlines or chaotic turbulent eddies?"
- **Failure Modes Prevented**: Applying laminar shear formulas to chaotic turbulent flow regimes.

### Skill #97: Conduit Friction & Darcy-Weisbach Head Loss
- **Definition**: Models viscous friction head losses $h_f = f \frac{L}{D} \frac{v^2}{2g}$ and pressure drops in fluid pipelines and channels.
- **Governing Equations**: $h_f = f \frac{L}{D} \frac{v^2}{2g}$, $\Delta P_{\text{friction}} = \rho g h_f$.
- **Causal Principle**: "How much pressure head is dissipated due to wall friction along pipe conduits?"
- **Failure Modes Prevented**: Assuming zero friction losses in extended fluid conveyance systems.

---

## 4. Quantitative Verification Metrics

Every calculation and physics simulation involving Fluid Mechanics and Pivotal Dynamics must satisfy:
1. **Continuity Mass Flow Preservation**: $|\dot{m}_{\text{in}} - \dot{m}_{\text{out}}| / \dot{m}_{\text{in}} < 10^{-12}$ across closed conduits.
2. **Bernoulli Energy Invariance**: Total pressure $P_{\text{total}} = P + \frac{1}{2}\rho v^2 + \rho g h$ invariant along lossless streamlines within float64 precision.
3. **Control Volume Reaction Equilibrium**: Vector sum of pressure forces, weight, and anchor reactions $F_{Rx}, F_{Ry}$ exactly balances momentum flux $\dot{m} \Delta \mathbf{v}$.
4. **Turbomachinery Power Balance**: Shaft power $\dot{W} = T \Omega$ equals total fluid kinetic/angular momentum transfer rate.
5. **Reynolds Regime Threshold Accuracy**: Exact transition boundaries ($2100$ and $4000$) verified for fluid regime classification.
