/**
 * DENSITY, FLUID FORCES & ENVIRONMENTAL PROBABILITY SOLVER MODULE
 * ================================================================
 * Physics engine implementing:
 * 1. Matter Density (ρ = m / V in kg/m³) - distinction from force
 * 2. Force Connections:
 *    - Archimedes' Buoyant Upthrust (F_b = ρ_fluid * g * V_displaced)
 *    - Hydrostatic Pressure (P = P_0 + ρ_fluid * g * h)
 *    - Weight & Sinking / Floating / Neutral Equilibrium (W vs F_b)
 *    - Force Density (f = F / V in N/m³)
 * 3. Environmental Variables (fluid density, gravity, depth, temperature, viscosity)
 * 4. Environmental Probability (turbulence, wave perturbation, sink/float transition probability)
 */

export const FLUID_DENSITY_FRESHWATER = 1000.0; // kg/m³
export const FLUID_DENSITY_SEAWATER = 1025.0; // kg/m³
export const FLUID_DENSITY_AIR = 1.225; // kg/m³ at sea level
export const FLUID_DENSITY_OIL = 850.0; // kg/m³
export const FLUID_DENSITY_MERCURY = 13546.0; // kg/m³
export const STANDARD_ATMOSPHERIC_PRESSURE_PA = 101325.0; // Pa (N/m²)
export const EARTH_GRAVITY_MPS2 = 9.80665; // m/s²
export const MOON_GRAVITY_MPS2 = 1.62; // m/s²
export const MARS_GRAVITY_MPS2 = 3.72; // m/s²

export interface DensityReport {
  massKg: number;
  volumeM3: number;
  densityKgM3: number;
}

export interface BuoyantForceReport {
  fluidDensityKgM3: number;
  gravityMps2: number;
  displacedVolumeM3: number;
  buoyantForceN: number;
}

export interface HydrostaticPressureReport {
  surfacePressurePa: number;
  fluidDensityKgM3: number;
  gravityMps2: number;
  depthMeters: number;
  hydrostaticGaugePressurePa: number;
  totalAbsolutePressurePa: number;
  pressureAtmospheres: number;
}

export interface ForceDensityReport {
  forceN: number;
  volumeM3: number;
  forceDensityNm3: number;
}

export interface BuoyancyEquilibriumReport {
  objectDensityKgM3: number;
  fluidDensityKgM3: number;
  objectMassKg: number;
  objectVolumeM3: number;
  weightForceN: number;
  maxBuoyantForceN: number;
  netForceN: number;
  state: 'FLOATING' | 'SINKING' | 'NEUTRAL';
  submergedVolumeFraction: number;
  submergedVolumeM3: number;
}

export interface EnvironmentalVariablesReport {
  fluidName: string;
  fluidDensityKgM3: number;
  gravityMps2: number;
  depthMeters: number;
  temperatureCelsius: number;
  dynamicViscosityPaS: number;
}

export interface EnvironmentalProbabilityReport {
  reynoldsNumber: number;
  turbulenceProbability: number; // 0.0 to 1.0
  waveFluctuationStdDevN: number;
  sinkFloatTransitionProbability: number; // probability of shifting state under environmental perturbation
  stateConfidence: number; // confidence in deterministic state
  stochasticBuoyantForceN: number;
}

export interface UnifiedDensityFluidReport {
  density: DensityReport;
  buoyancy: BuoyantForceReport;
  hydrostatic: HydrostaticPressureReport;
  forceDensity: ForceDensityReport;
  equilibrium: BuoyancyEquilibriumReport;
  environment: EnvironmentalVariablesReport;
  probability: EnvironmentalProbabilityReport;
  summaryText: string;
}

/**
 * Calculates Matter Density (ρ = m / V)
 */
export function calculateDensity(massKg: number, volumeM3: number): DensityReport {
  const safeVol = Math.max(1e-12, volumeM3);
  const safeMass = Math.max(0, massKg);
  const densityKgM3 = safeMass / safeVol;

  return {
    massKg: safeMass,
    volumeM3: safeVol,
    densityKgM3,
  };
}

/**
 * Calculates Archimedes' Buoyant Force (F_b = ρ_fluid * g * V_displaced)
 */
export function calculateBuoyantForce(
  fluidDensityKgM3: number,
  displacedVolumeM3: number,
  gravityMps2 = EARTH_GRAVITY_MPS2
): BuoyantForceReport {
  const safeFluidDensity = Math.max(0, fluidDensityKgM3);
  const safeVol = Math.max(0, displacedVolumeM3);
  const safeG = Math.max(0, gravityMps2);

  const buoyantForceN = safeFluidDensity * safeG * safeVol;

  return {
    fluidDensityKgM3: safeFluidDensity,
    gravityMps2: safeG,
    displacedVolumeM3: safeVol,
    buoyantForceN,
  };
}

/**
 * Calculates Hydrostatic Pressure (P = P_0 + ρ * g * h)
 */
export function calculateHydrostaticPressure(
  fluidDensityKgM3: number,
  depthMeters: number,
  gravityMps2 = EARTH_GRAVITY_MPS2,
  surfacePressurePa = STANDARD_ATMOSPHERIC_PRESSURE_PA
): HydrostaticPressureReport {
  const safeFluidDensity = Math.max(0, fluidDensityKgM3);
  const safeDepth = Math.max(0, depthMeters);
  const safeG = Math.max(0, gravityMps2);
  const safeSurfaceP = Math.max(0, surfacePressurePa);

  const hydrostaticGaugePressurePa = safeFluidDensity * safeG * safeDepth;
  const totalAbsolutePressurePa = safeSurfaceP + hydrostaticGaugePressurePa;
  const pressureAtmospheres = totalAbsolutePressurePa / STANDARD_ATMOSPHERIC_PRESSURE_PA;

  return {
    surfacePressurePa: safeSurfaceP,
    fluidDensityKgM3: safeFluidDensity,
    gravityMps2: safeG,
    depthMeters: safeDepth,
    hydrostaticGaugePressurePa,
    totalAbsolutePressurePa,
    pressureAtmospheres,
  };
}

/**
 * Calculates Continuum Mechanics Force Density (f = F / V in N/m³)
 */
export function calculateForceDensity(forceN: number, volumeM3: number): ForceDensityReport {
  const safeVol = Math.max(1e-12, volumeM3);
  const forceDensityNm3 = forceN / safeVol;

  return {
    forceN,
    volumeM3: safeVol,
    forceDensityNm3,
  };
}

/**
 * Calculates Buoyancy State, Weight vs Buoyancy Equilibrium, and Submerged Fraction
 */
export function calculateBuoyancyState(
  objectMassKg: number,
  objectVolumeM3: number,
  fluidDensityKgM3: number,
  gravityMps2 = EARTH_GRAVITY_MPS2
): BuoyancyEquilibriumReport {
  const safeMass = Math.max(1e-12, objectMassKg);
  const safeVol = Math.max(1e-12, objectVolumeM3);
  const safeFluidDensity = Math.max(1e-12, fluidDensityKgM3);
  const safeG = Math.max(0, gravityMps2);

  const objectDensityKgM3 = safeMass / safeVol;
  const weightForceN = safeMass * safeG;
  const maxBuoyantForceN = safeFluidDensity * safeG * safeVol;

  let state: 'FLOATING' | 'SINKING' | 'NEUTRAL';
  let submergedVolumeFraction: number;
  let submergedVolumeM3: number;
  let netForceN: number;

  const densityRatio = objectDensityKgM3 / safeFluidDensity;

  if (Math.abs(densityRatio - 1.0) < 0.001) {
    state = 'NEUTRAL';
    submergedVolumeFraction = 1.0;
    submergedVolumeM3 = safeVol;
    netForceN = 0.0;
  } else if (objectDensityKgM3 < safeFluidDensity) {
    state = 'FLOATING';
    submergedVolumeFraction = densityRatio;
    submergedVolumeM3 = safeVol * submergedVolumeFraction;
    netForceN = 0.0; // In equilibrium when floating
  } else {
    state = 'SINKING';
    submergedVolumeFraction = 1.0;
    submergedVolumeM3 = safeVol;
    netForceN = weightForceN - maxBuoyantForceN; // Downward resultant force
  }

  return {
    objectDensityKgM3,
    fluidDensityKgM3: safeFluidDensity,
    objectMassKg: safeMass,
    objectVolumeM3: safeVol,
    weightForceN,
    maxBuoyantForceN,
    netForceN,
    state,
    submergedVolumeFraction,
    submergedVolumeM3,
  };
}

/**
 * Calculates Environmental Probability Distributions and Stochastic Turbulence/Wave Perturbations
 */
export function calculateEnvironmentalProbability(
  objectDensityKgM3: number,
  fluidDensityKgM3: number,
  velocityMps = 1.5,
  characteristicLengthMeters = 0.5,
  dynamicViscosityPaS = 0.001, // Water viscosity at 20°C
  waveAmplitudeFraction = 0.08
): EnvironmentalProbabilityReport {
  const safeObjDensity = Math.max(1e-12, objectDensityKgM3);
  const safeFluidDensity = Math.max(1e-12, fluidDensityKgM3);
  const safeVisc = Math.max(1e-9, dynamicViscosityPaS);
  const safeLen = Math.max(1e-4, characteristicLengthMeters);
  const safeVel = Math.max(0, velocityMps);

  // Reynolds Number: Re = ρ * v * L / μ
  const reynoldsNumber = (safeFluidDensity * safeVel * safeLen) / safeVisc;

  // Turbulence Probability curve (Logistic sigmoid over Re critical transition ~2000-4000)
  const turbulenceProbability = 1.0 / (1.0 + Math.exp(-(reynoldsNumber - 2300) / 400));

  // Density margin delta
  const densityDeltaRatio = Math.abs(safeObjDensity - safeFluidDensity) / safeFluidDensity;

  // Sink/Float State Transition Probability (higher when object density is close to fluid density)
  const sinkFloatTransitionProbability = Math.exp(-15.0 * densityDeltaRatio) * (0.2 + 0.8 * turbulenceProbability);

  const stateConfidence = Math.max(0, Math.min(1.0, 1.0 - sinkFloatTransitionProbability));

  const baseBuoyantForce = safeFluidDensity * EARTH_GRAVITY_MPS2 * 0.05; // 50L reference
  const waveFluctuationStdDevN = baseBuoyantForce * waveAmplitudeFraction;

  // Simulated stochastic realization (using mean offset)
  const stochasticBuoyantForceN = baseBuoyantForce * (1.0 + waveAmplitudeFraction * (turbulenceProbability - 0.5));

  return {
    reynoldsNumber,
    turbulenceProbability,
    waveFluctuationStdDevN,
    sinkFloatTransitionProbability,
    stateConfidence,
    stochasticBuoyantForceN,
  };
}

/**
 * Performs a unified comprehensive analysis of density, fluid forces, environmental variables, and environmental probability
 */
export function calculateUnifiedDensityFluidAnalysis(params: {
  objectMassKg?: number;
  objectVolumeM3?: number;
  fluidDensityKgM3?: number;
  depthMeters?: number;
  gravityMps2?: number;
  fluidName?: string;
  flowVelocityMps?: number;
}): UnifiedDensityFluidReport {
  const objMass = params.objectMassKg ?? 70.0;
  const objVol = params.objectVolumeM3 ?? 0.065; // ~65 Liters
  const fluidDensity = params.fluidDensityKgM3 ?? FLUID_DENSITY_FRESHWATER;
  const depth = params.depthMeters ?? 5.0;
  const g = params.gravityMps2 ?? EARTH_GRAVITY_MPS2;
  const fluidName = params.fluidName ?? 'Freshwater';
  const vel = params.flowVelocityMps ?? 1.2;

  const density = calculateDensity(objMass, objVol);
  const buoyancy = calculateBuoyantForce(fluidDensity, objVol, g);
  const hydrostatic = calculateHydrostaticPressure(fluidDensity, depth, g);
  const equilibrium = calculateBuoyancyState(objMass, objVol, fluidDensity, g);
  const forceDensity = calculateForceDensity(equilibrium.weightForceN, objVol);

  const environment: EnvironmentalVariablesReport = {
    fluidName,
    fluidDensityKgM3: fluidDensity,
    gravityMps2: g,
    depthMeters: depth,
    temperatureCelsius: 20.0,
    dynamicViscosityPaS: fluidDensity > 500 ? 0.001 : 0.0000181,
  };

  const probability = calculateEnvironmentalProbability(
    density.densityKgM3,
    fluidDensity,
    vel,
    Math.cbrt(objVol),
    environment.dynamicViscosityPaS
  );

  const summaryText =
    `Unified Density & Fluid Analysis (${fluidName}):\n` +
    `• Density: Object ρ = ${density.densityKgM3.toFixed(1)} kg/m³ (Mass = ${density.massKg.toFixed(1)} kg, Vol = ${(density.volumeM3 * 1000).toFixed(1)} L)\n` +
    `• Buoyancy: Max Upthrust F_b = ${buoyancy.buoyantForceN.toFixed(1)} N, Weight W = ${equilibrium.weightForceN.toFixed(1)} N → State: ${equilibrium.state} (${(equilibrium.submergedVolumeFraction * 100).toFixed(1)}% submerged)\n` +
    `• Hydrostatic Pressure at ${depth.toFixed(1)}m: Gauge = ${(hydrostatic.hydrostaticGaugePressurePa / 1000).toFixed(1)} kPa, Total = ${hydrostatic.pressureAtmospheres.toFixed(2)} atm\n` +
    `• Force Density: f = ${(forceDensity.forceDensityNm3 / 1000).toFixed(2)} kN/m³\n` +
    `• Stochastic Environment: Re = ${probability.reynoldsNumber.toFixed(0)}, Turbulence Prob = ${(probability.turbulenceProbability * 100).toFixed(1)}%, Sink/Float Transition Prob = ${(probability.sinkFloatTransitionProbability * 100).toFixed(1)}%`;

  return {
    density,
    buoyancy,
    hydrostatic,
    forceDensity,
    equilibrium,
    environment,
    probability,
    summaryText,
  };
}
