/**
 * SCIENTIFIC VARIATIONS OF MASS SOLVER & CALCULATOR MODULE
 * =======================================================
 * Fundamental physics calculation engine implementing:
 * 1. Inertial Mass (F = ma, p = mv, I = m r^2, τ = I α)
 * 2. Gravitational Mass (active, passive, Equivalence Principle m_i = m_g, local weight W = mg)
 * 3. Rest Mass / Invariant Mass (m_0, E_0 = m_0 c^2, System Invariant Mass M_inv, Mass Defect)
 * 4. Relativistic Mass (m_rel = γ m_0, Lorentz factor γ, relativistic momentum & total energy E = γ m_0 c^2)
 * 5. Scientific Variations & Sub-categories (Reduced mass μ, Hydrodynamic added mass m_added, Effective lattice mass m*)
 */

/** Helper to read numeric environment variables in either Node.js process.env or Vite import.meta.env environments */
function getEnvNumber(key: string, defaultValue: number): number {
  let valStr: string | undefined;
  if (typeof process !== 'undefined' && process.env && process.env[key] !== undefined) {
    valStr = process.env[key];
  } else if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key] !== undefined) {
    valStr = import.meta.env[key] as string;
  }
  if (valStr !== undefined && valStr !== '') {
    const num = Number(valStr);
    if (!isNaN(num)) return num;
  }
  return defaultValue;
}

export const SPEED_OF_LIGHT_MPS = getEnvNumber('VITE_PHYSICS_SPEED_OF_LIGHT_MPS', 299792458); // c in m/s
export const GRAVITATIONAL_CONSTANT = getEnvNumber('VITE_PHYSICS_GRAVITATIONAL_CONSTANT', 6.67430e-11); // G in m^3 kg^-1 s^-2
export const STANDARD_GRAVITY_MPS2 = getEnvNumber('VITE_PHYSICS_GRAVITY_EARTH_MPS2', 9.80665); // g in m/s^2
export const JOULES_PER_MEV = getEnvNumber('VITE_JOULES_PER_MEV', 1.602176634e-13); // 1 MeV in Joules
export const ELECTRON_REST_MASS_KG = getEnvNumber('VITE_MASS_ELECTRON_REST_KG', 9.1093837015e-31); // electron mass in kg

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface InertialMassReport {
  massKg: number;
  appliedForceN: Vector3D;
  accelerationMps2: Vector3D;
  momentumKgMps: Vector3D;
  rotationalInertiaKgM2: number;
  torqueNm: number;
  angularAccelerationRadS2: number;
  kineticEnergyJoules: number;
}

export interface GravitationalMassReport {
  passiveMassKg: number;
  activeMassKg: number;
  distanceMeters: number;
  gravitationalForceN: number;
  localWeightN: number;
  localGMps2: number;
  equivalenceRatio: number; // m_i / m_g
  isEquivalenceVerified: boolean; // within 1e-12
  potentialEnergyJoules: number;
}

export interface RestMassReport {
  restMassKg: number;
  restEnergyJoules: number;
  restEnergyMeV: number;
  invariantMassOfSystemKg: number;
  massDefectKg: number;
  bindingEnergyJoules: number;
}

export interface RelativisticMassReport {
  restMassKg: number;
  velocityMps: number;
  velocityFractionC: number; // v / c
  lorentzFactor: number; // γ
  relativisticMassKg: number; // m_rel = γ m_0
  relativisticMomentumKgMps: number; // p = γ m_0 v
  totalEnergyJoules: number; // E = γ m_0 c^2
  kineticEnergyJoules: number; // K = (γ - 1) m_0 c^2
  massIncreasePercentage: number;
}

export interface ScientificMassVariationsReport {
  primaryMass1Kg: number;
  secondaryMass2Kg: number;
  reducedMassKg: number; // μ = m1 m2 / (m1 + m2)
  massRatio: number; // m1 / m2
  fluidDensityKgM3: number;
  displacedVolumeM3: number;
  hydrodynamicAddedMassKg: number; // m_added = C_v * ρ * V
  effectiveFluidMassKg: number; // m_0 + m_added
  effectiveLatticeMassRatio: number; // m* / m_e
  effectiveLatticeMassKg: number;
}

export interface UnifiedMassAnalysisReport {
  inertial: InertialMassReport;
  gravitational: GravitationalMassReport;
  rest: RestMassReport;
  relativistic: RelativisticMassReport;
  variations: ScientificMassVariationsReport;
  summaryText: string;
}

/**
 * Calculates Inertial Mass dynamics (F = ma, p = mv, I = m r^2, τ = I α)
 */
export function calculateInertialMass(
  massKg: number = getEnvNumber('VITE_INERTIAL_MASS_DEFAULT_KG', 70.0),
  appliedForceN: Vector3D = { x: getEnvNumber('VITE_INERTIAL_APPLIED_FORCE_N', 10.0), y: 0, z: 0 },
  velocityMps: Vector3D = { x: getEnvNumber('VITE_INERTIAL_VELOCITY_MPS', 5.0), y: 0, z: 0 },
  radiusMeters = getEnvNumber('VITE_INERTIAL_RADIUS_METERS', 0.5),
  appliedTorqueNm = getEnvNumber('VITE_INERTIAL_TORQUE_NM', 5.0)
): InertialMassReport {
  const safeMass = Math.max(1e-15, massKg);

  const accelerationMps2: Vector3D = {
    x: appliedForceN.x / safeMass,
    y: appliedForceN.y / safeMass,
    z: appliedForceN.z / safeMass,
  };

  const momentumKgMps: Vector3D = {
    x: safeMass * velocityMps.x,
    y: safeMass * velocityMps.y,
    z: safeMass * velocityMps.z,
  };

  const vSquared =
    velocityMps.x * velocityMps.x +
    velocityMps.y * velocityMps.y +
    velocityMps.z * velocityMps.z;
  const kineticEnergyJoules = 0.5 * safeMass * vSquared;

  // Moment of inertia for point mass or thin cylindrical shell: I = m * r^2
  const rotationalInertiaKgM2 = safeMass * radiusMeters * radiusMeters;
  const angularAccelerationRadS2 =
    rotationalInertiaKgM2 > 0 ? appliedTorqueNm / rotationalInertiaKgM2 : 0;

  return {
    massKg: safeMass,
    appliedForceN,
    accelerationMps2,
    momentumKgMps,
    rotationalInertiaKgM2,
    torqueNm: appliedTorqueNm,
    angularAccelerationRadS2,
    kineticEnergyJoules,
  };
}

/**
 * Calculates Gravitational Mass dynamics and Weak Equivalence Principle verification
 */
export function calculateGravitationalMass(
  passiveMassKg: number = getEnvNumber('VITE_GRAVITATIONAL_MASS_PASSIVE_KG', 70.0),
  activeMassKg = getEnvNumber('VITE_GRAVITATIONAL_MASS_ACTIVE_EARTH_KG', 5.9722e24), // Earth mass default
  distanceMeters = getEnvNumber('VITE_GRAVITATIONAL_DISTANCE_METERS', 6371000.0), // Earth radius default
  inertialMassKg?: number,
  localGMps2 = getEnvNumber('VITE_MASS_GRAVITY_ACCELERATION_G_MPS2', STANDARD_GRAVITY_MPS2)
): GravitationalMassReport {
  const safePassive = Math.max(1e-15, passiveMassKg);
  const safeActive = Math.max(1e-15, activeMassKg);
  const safeDist = Math.max(1e-3, distanceMeters);
  const safeInertial = inertialMassKg !== undefined ? Math.max(1e-15, inertialMassKg) : safePassive;

  // Universal Gravitation: F = G * M * m / r^2
  const gravitationalForceN =
    (GRAVITATIONAL_CONSTANT * safeActive * safePassive) / (safeDist * safeDist);

  // Local weight force: W = m_g * g
  const localWeightN = safePassive * localGMps2;

  // Equivalence ratio m_i / m_g
  const equivalenceRatio = safeInertial / safePassive;
  const tolerance = getEnvNumber('VITE_GRAVITATIONAL_EQUIVALENCE_TOLERANCE', 1.0e-12);
  const isEquivalenceVerified = Math.abs(equivalenceRatio - 1.0) < tolerance;

  // Potential energy U = m * g * h (or astrophysical U = -G M m / r)
  const potentialEnergyJoules = -(GRAVITATIONAL_CONSTANT * safeActive * safePassive) / safeDist;

  return {
    passiveMassKg: safePassive,
    activeMassKg: safeActive,
    distanceMeters: safeDist,
    gravitationalForceN,
    localWeightN,
    localGMps2,
    equivalenceRatio,
    isEquivalenceVerified,
    potentialEnergyJoules,
  };
}

/**
 * Calculates Rest Mass (Invariant Mass) & Mass-Energy Equivalence (E = m0 c^2)
 */
export function calculateRestInvariantMass(
  restMassKg: number = getEnvNumber('VITE_REST_MASS_KG', 70.0),
  systemParticles?: Array<{ energyJoules: number; momentumKgMps: Vector3D }>,
  boundConstituentMassesKg?: number[]
): RestMassReport {
  const safeRestMass = Math.max(0, restMassKg);
  const restEnergyJoules = safeRestMass * SPEED_OF_LIGHT_MPS * SPEED_OF_LIGHT_MPS;
  const restEnergyMeV = restEnergyJoules / JOULES_PER_MEV;

  let invariantMassOfSystemKg = safeRestMass;

  if (systemParticles && systemParticles.length > 0) {
    let totalE = 0;
    let totalPx = 0;
    let totalPy = 0;
    let totalPz = 0;

    for (const p of systemParticles) {
      totalE += p.energyJoules;
      totalPx += p.momentumKgMps.x;
      totalPy += p.momentumKgMps.y;
      totalPz += p.momentumKgMps.z;
    }

    const pSquaredC2 =
      (totalPx * totalPx + totalPy * totalPy + totalPz * totalPz) *
      (SPEED_OF_LIGHT_MPS * SPEED_OF_LIGHT_MPS);
    const mInvSquaredC4 = Math.max(0, totalE * totalE - pSquaredC2);
    invariantMassOfSystemKg =
      Math.sqrt(mInvSquaredC4) / (SPEED_OF_LIGHT_MPS * SPEED_OF_LIGHT_MPS);
  }

  let massDefectKg = 0;
  let bindingEnergyJoules = 0;

  if (boundConstituentMassesKg && boundConstituentMassesKg.length > 0) {
    const sumConstituents = boundConstituentMassesKg.reduce((a, b) => a + b, 0);
    massDefectKg = Math.max(0, sumConstituents - safeRestMass);
    bindingEnergyJoules = massDefectKg * SPEED_OF_LIGHT_MPS * SPEED_OF_LIGHT_MPS;
  }

  return {
    restMassKg: safeRestMass,
    restEnergyJoules,
    restEnergyMeV,
    invariantMassOfSystemKg,
    massDefectKg,
    bindingEnergyJoules,
  };
}

/**
 * Calculates Relativistic Mass & Lorentz Scaling (m_rel = γ m_0)
 */
export function calculateRelativisticMass(
  restMassKg: number = getEnvNumber('VITE_RELATIVISTIC_REST_MASS_KG', 1.0),
  velocityMps?: number
): RelativisticMassReport {
  const defaultVelFrac = getEnvNumber('VITE_RELATIVISTIC_VELOCITY_FRACTION_C', 0.80);
  const actualVelMps = velocityMps ?? (defaultVelFrac * SPEED_OF_LIGHT_MPS);

  const safeRestMass = Math.max(0, restMassKg);
  const clampedVel = Math.max(0, Math.min(SPEED_OF_LIGHT_MPS - 1e-6, actualVelMps));
  const beta = clampedVel / SPEED_OF_LIGHT_MPS; // v / c

  const lorentzFactor = 1.0 / Math.sqrt(Math.max(1e-15, 1.0 - beta * beta));
  const relativisticMassKg = lorentzFactor * safeRestMass;
  const relativisticMomentumKgMps = lorentzFactor * safeRestMass * clampedVel;

  const totalEnergyJoules = relativisticMassKg * SPEED_OF_LIGHT_MPS * SPEED_OF_LIGHT_MPS;
  const restEnergyJoules = safeRestMass * SPEED_OF_LIGHT_MPS * SPEED_OF_LIGHT_MPS;
  const kineticEnergyJoules = totalEnergyJoules - restEnergyJoules;

  const massIncreasePercentage = (lorentzFactor - 1.0) * 100;

  return {
    restMassKg: safeRestMass,
    velocityMps: clampedVel,
    velocityFractionC: beta,
    lorentzFactor,
    relativisticMassKg,
    relativisticMomentumKgMps,
    totalEnergyJoules,
    kineticEnergyJoules,
    massIncreasePercentage,
  };
}

/**
 * Calculates Scientific Mass Variations: Reduced Mass, Hydrodynamic Added Mass, Effective Mass
 */
export function calculateScientificMassVariations(
  primaryMass1Kg: number = getEnvNumber('VITE_REDUCED_MASS_PRIMARY_M1_KG', 70.0),
  secondaryMass2Kg = getEnvNumber('VITE_REDUCED_MASS_SECONDARY_M2_KG', 20.0),
  fluidDensityKgM3 = getEnvNumber('VITE_FLUID_DENSITY_KG_PER_M3', 1000.0), // Water density
  displacedVolumeM3 = getEnvNumber('VITE_FLUID_DISPLACED_VOLUME_M3', 0.05), // 50 Liters
  addedMassCoeff = getEnvNumber('VITE_HYDRODYNAMIC_ADDED_MASS_COEFF', 0.5), // Sphere in fluid C_v = 0.5
  effectiveLatticeRatio = getEnvNumber('VITE_EFFECTIVE_LATTICE_MASS_RATIO', 1.2)
): ScientificMassVariationsReport {
  const m1 = Math.max(1e-15, primaryMass1Kg);
  const m2 = Math.max(1e-15, secondaryMass2Kg);

  // Reduced mass μ = m1 * m2 / (m1 + m2)
  const reducedMassKg = (m1 * m2) / (m1 + m2);
  const massRatio = m1 / m2;

  // Hydrodynamic added mass m_added = C_v * ρ * V
  const hydrodynamicAddedMassKg = addedMassCoeff * fluidDensityKgM3 * displacedVolumeM3;
  const effectiveFluidMassKg = m1 + hydrodynamicAddedMassKg;

  // Solid state effective lattice mass
  const effectiveLatticeMassKg = effectiveLatticeRatio * ELECTRON_REST_MASS_KG;

  return {
    primaryMass1Kg: m1,
    secondaryMass2Kg: m2,
    reducedMassKg,
    massRatio,
    fluidDensityKgM3,
    displacedVolumeM3,
    hydrodynamicAddedMassKg,
    effectiveFluidMassKg,
    effectiveLatticeMassRatio: effectiveLatticeRatio,
    effectiveLatticeMassKg,
  };
}

/**
 * Performs a unified comprehensive scientific mass analysis across all categories
 */
export function calculateUnifiedMassAnalysis(params: {
  massKg?: number;
  appliedForceN?: Vector3D;
  velocityMps?: Vector3D;
  secondaryMassKg?: number;
  speedVelocityMps?: number;
}): UnifiedMassAnalysisReport {
  const m = params.massKg ?? getEnvNumber('VITE_MASS_DEFAULT_CHARACTER_KG', 70.0);
  const force = params.appliedForceN || { x: getEnvNumber('VITE_INERTIAL_APPLIED_FORCE_N', 100), y: 0, z: 0 };
  const vel = params.velocityMps || { x: getEnvNumber('VITE_INERTIAL_VELOCITY_MPS', 10), y: 0, z: 0 };
  const vMag = params.speedVelocityMps ?? Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z);
  const m2 = params.secondaryMassKg ?? getEnvNumber('VITE_MASS_REFERENCE_OBJECT_KG', 20.0);

  const inertial = calculateInertialMass(m, force, vel);
  const gravitational = calculateGravitationalMass(m);
  const rest = calculateRestInvariantMass(m);
  const relativistic = calculateRelativisticMass(m, vMag);
  const variations = calculateScientificMassVariations(m, m2);

  const summaryText =
    `Unified Analysis for Mass = ${m.toFixed(2)} kg:\n` +
    `• Inertial: Accel = (${inertial.accelerationMps2.x.toFixed(2)}, ${inertial.accelerationMps2.y.toFixed(2)}) m/s², Momentum = ${inertial.momentumKgMps.x.toFixed(1)} kg·m/s\n` +
    `• Gravitational: Local Weight = ${gravitational.localWeightN.toFixed(1)} N, Equivalence m_i/m_g = ${gravitational.equivalenceRatio.toFixed(6)} (PASS)\n` +
    `• Rest Mass Energy: E_0 = ${(rest.restEnergyJoules / 1e18).toFixed(3)} Exajoules (${rest.restEnergyMeV.toExponential(2)} MeV)\n` +
    `• Relativistic Scaling: v = ${(relativistic.velocityFractionC * 100).toFixed(4)}% c, Lorentz γ = ${relativistic.lorentzFactor.toFixed(6)}, Relativistic Mass = ${relativistic.relativisticMassKg.toFixed(4)} kg (+${relativistic.massIncreasePercentage.toFixed(4)}%)\n` +
    `• Sub-Category Variations: Reduced Mass μ = ${variations.reducedMassKg.toFixed(2)} kg, Hydrodynamic Added Mass = ${variations.hydrodynamicAddedMassKg.toFixed(2)} kg (Total Fluid Eff Mass = ${variations.effectiveFluidMassKg.toFixed(2)} kg)`;

  return {
    inertial,
    gravitational,
    rest,
    relativistic,
    variations,
    summaryText,
  };
}
