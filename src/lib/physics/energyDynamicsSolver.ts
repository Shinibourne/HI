/**
 * KINETIC AND POTENTIAL ENERGY DYNAMICS SOLVER & CALCULATOR MODULE
 * ================================================================
 * Fundamental physics calculation engine implementing:
 * 1. Kinetic Energy (KE = 0.5 * m * v^2)
 *    - Translational Kinetic Energy (0.5 * m * v_trans^2)
 *    - Rotational Kinetic Energy (0.5 * I * omega^2)
 *    - Vibrational Kinetic Energy (0.5 * k * (A^2 - x^2) or 0.5 * m * v_vib^2)
 * 2. Potential Energy (PE)
 *    - Gravitational Potential Energy (PE = m * g * h)
 *    - Elastic Potential Energy (PE = 0.5 * k * x^2)
 *    - Chemical Potential Energy (stored molecular bond energy)
 *    - Electrostatic & Nuclear Potential Energy (k_e * q1 * q2 / r & delta_m * c^2)
 * 3. Governing Physical Conservation Laws
 *    - Law of Conservation of Energy (E_total = KE + PE + Q + W = const)
 *    - Mechanical Energy Conservation (E_mech = KE + PE = const)
 */

export const STANDARD_GRAVITY_MPS2 = 9.80665; // g in m/s^2
export const SPEED_OF_LIGHT_MPS = 299792458; // c in m/s
export const COULOMB_CONSTANT = 8.9875517923e9; // k_e in N m^2 / C^2

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface KineticEnergySubcategoriesReport {
  massKg: number;
  translationalVelocityMps: number;
  translationalKEJoules: number;
  rotationalInertiaKgM2: number;
  angularVelocityRadS: number;
  rotationalKEJoules: number;
  springConstantNm: number;
  amplitudeMeters: number;
  vibrationalDisplacementMeters: number;
  vibrationalKEJoules: number;
  totalKineticEnergyJoules: number;
}

export interface PotentialEnergySubcategoriesReport {
  massKg: number;
  heightMeters: number;
  gravityMps2: number;
  gravitationalPEJoules: number;
  springConstantNm: number;
  stretchDisplacementMeters: number;
  elasticPEJoules: number;
  chemicalEnergyJoules: number;
  charge1Coulombs: number;
  charge2Coulombs: number;
  chargeDistanceMeters: number;
  electrostaticPEJoules: number;
  massDefectKg: number;
  nuclearPEJoules: number;
  totalPotentialEnergyJoules: number;
}

export interface ConservationLawsReport {
  totalKineticEnergyJoules: number;
  totalPotentialEnergyJoules: number;
  totalMechanicalEnergyJoules: number;
  thermalLossJoules: number;
  workDoneJoules: number;
  totalSystemEnergyJoules: number;
  isMechanicalEnergyConserved: boolean;
  isTotalEnergyConserved: boolean;
  conservationErrorMarginJoules: number;
}

export interface UnifiedEnergyAnalysisReport {
  kinetic: KineticEnergySubcategoriesReport;
  potential: PotentialEnergySubcategoriesReport;
  conservation: ConservationLawsReport;
  summaryText: string;
}

/**
 * Calculates Kinetic Energy and its subcategories (Translational, Rotational, Vibrational)
 */
export function calculateKineticEnergySubcategories(params: {
  massKg: number;
  translationalVelocityMps?: number;
  rotationalInertiaKgM2?: number;
  angularVelocityRadS?: number;
  springConstantNm?: number;
  amplitudeMeters?: number;
  vibrationalDisplacementMeters?: number;
}): KineticEnergySubcategoriesReport {
  const m = Math.max(1e-15, params.massKg);
  const vTrans = params.translationalVelocityMps || 0;
  const I = Math.max(0, params.rotationalInertiaKgM2 || 0.5 * m * 0.25 * 0.25);
  const omega = params.angularVelocityRadS || 0;
  const k = Math.max(0, params.springConstantNm || 100);
  const A = Math.max(0, params.amplitudeMeters || 0.1);
  const xVib = Math.min(A, Math.max(0, params.vibrationalDisplacementMeters || 0.02));

  // Translational KE = 0.5 * m * v^2
  const translationalKEJoules = 0.5 * m * vTrans * vTrans;

  // Rotational KE = 0.5 * I * omega^2
  const rotationalKEJoules = 0.5 * I * omega * omega;

  // Vibrational KE = 0.5 * k * (A^2 - x^2)
  const vibrationalKEJoules = 0.5 * k * Math.max(0, A * A - xVib * xVib);

  const totalKineticEnergyJoules = translationalKEJoules + rotationalKEJoules + vibrationalKEJoules;

  return {
    massKg: m,
    translationalVelocityMps: vTrans,
    translationalKEJoules,
    rotationalInertiaKgM2: I,
    angularVelocityRadS: omega,
    rotationalKEJoules,
    springConstantNm: k,
    amplitudeMeters: A,
    vibrationalDisplacementMeters: xVib,
    vibrationalKEJoules,
    totalKineticEnergyJoules,
  };
}

/**
 * Calculates Potential Energy and its subcategories (Gravitational, Elastic, Chemical, Electrostatic, Nuclear)
 */
export function calculatePotentialEnergySubcategories(params: {
  massKg: number;
  heightMeters?: number;
  gravityMps2?: number;
  springConstantNm?: number;
  stretchDisplacementMeters?: number;
  chemicalEnergyJoules?: number;
  charge1Coulombs?: number;
  charge2Coulombs?: number;
  chargeDistanceMeters?: number;
  massDefectKg?: number;
}): PotentialEnergySubcategoriesReport {
  const m = Math.max(1e-15, params.massKg);
  const h = params.heightMeters || 0;
  const g = params.gravityMps2 || STANDARD_GRAVITY_MPS2;
  const k = Math.max(0, params.springConstantNm || 100);
  const xStretch = params.stretchDisplacementMeters || 0;
  const chemE = params.chemicalEnergyJoules || 0;
  const q1 = params.charge1Coulombs || 1e-6;
  const q2 = params.charge2Coulombs || 1e-6;
  const rCharge = Math.max(1e-9, params.chargeDistanceMeters || 0.05);
  const deltaM = Math.max(0, params.massDefectKg || 0);

  // Gravitational PE = m * g * h
  const gravitationalPEJoules = m * g * h;

  // Elastic PE = 0.5 * k * x^2
  const elasticPEJoules = 0.5 * k * xStretch * xStretch;

  // Electrostatic PE = k_e * q1 * q2 / r
  const electrostaticPEJoules = (COULOMB_CONSTANT * q1 * q2) / rCharge;

  // Nuclear PE = delta_m * c^2
  const nuclearPEJoules = deltaM * SPEED_OF_LIGHT_MPS * SPEED_OF_LIGHT_MPS;

  const totalPotentialEnergyJoules =
    gravitationalPEJoules + elasticPEJoules + chemE + electrostaticPEJoules + nuclearPEJoules;

  return {
    massKg: m,
    heightMeters: h,
    gravityMps2: g,
    gravitationalPEJoules,
    springConstantNm: k,
    stretchDisplacementMeters: xStretch,
    elasticPEJoules,
    chemicalEnergyJoules: chemE,
    charge1Coulombs: q1,
    charge2Coulombs: q2,
    chargeDistanceMeters: rCharge,
    electrostaticPEJoules,
    massDefectKg: deltaM,
    nuclearPEJoules,
    totalPotentialEnergyJoules,
  };
}

/**
 * Calculates Conservation of Energy laws and mechanical vs total system balance
 */
export function calculateEnergyConservation(params: {
  totalKineticEnergyJoules: number;
  totalPotentialEnergyJoules: number;
  thermalLossJoules?: number;
  workDoneJoules?: number;
  referenceEnergyJoules?: number;
}): ConservationLawsReport {
  const ke = params.totalKineticEnergyJoules;
  const pe = params.totalPotentialEnergyJoules;
  const q = params.thermalLossJoules || 0;
  const w = params.workDoneJoules || 0;

  // Mechanical Energy = KE + PE
  const totalMechanicalEnergyJoules = ke + pe;

  // Total System Energy = KE + PE + Q + W
  const totalSystemEnergyJoules = totalMechanicalEnergyJoules + q + w;

  const refEnergy = params.referenceEnergyJoules !== undefined ? params.referenceEnergyJoules : totalSystemEnergyJoules;
  const conservationErrorMarginJoules = Math.abs(totalSystemEnergyJoules - refEnergy);

  const isMechanicalEnergyConserved = Math.abs(q) < 1e-6 && Math.abs(w) < 1e-6;
  const isTotalEnergyConserved = conservationErrorMarginJoules < 1e-5;

  return {
    totalKineticEnergyJoules: ke,
    totalPotentialEnergyJoules: pe,
    totalMechanicalEnergyJoules,
    thermalLossJoules: q,
    workDoneJoules: w,
    totalSystemEnergyJoules,
    isMechanicalEnergyConserved,
    isTotalEnergyConserved,
    conservationErrorMarginJoules,
  };
}

/**
 * Performs a unified comprehensive analysis of Kinetic & Potential Energy Dynamics
 */
export function calculateUnifiedEnergyAnalysis(params: {
  massKg: number;
  heightMeters?: number;
  velocityMps?: number;
  angularVelocityRadS?: number;
  springStretchMeters?: number;
  thermalLossJoules?: number;
}): UnifiedEnergyAnalysisReport {
  const m = params.massKg || 70.0;
  const h = params.heightMeters || 2.5;
  const v = params.velocityMps || 7.0;
  const omega = params.angularVelocityRadS || 3.14159;
  const xStretch = params.springStretchMeters || 0.15;
  const qLoss = params.thermalLossJoules || 0;

  const kinetic = calculateKineticEnergySubcategories({
    massKg: m,
    translationalVelocityMps: v,
    angularVelocityRadS: omega,
  });

  const potential = calculatePotentialEnergySubcategories({
    massKg: m,
    heightMeters: h,
    stretchDisplacementMeters: xStretch,
  });

  const conservation = calculateEnergyConservation({
    totalKineticEnergyJoules: kinetic.totalKineticEnergyJoules,
    totalPotentialEnergyJoules: potential.totalPotentialEnergyJoules,
    thermalLossJoules: qLoss,
  });

  const summaryText =
    `Unified Energy Analysis for Mass = ${m.toFixed(2)} kg:\n` +
    `• Kinetic Energy Subcategories: Trans = ${kinetic.translationalKEJoules.toFixed(1)} J, Rot = ${kinetic.rotationalKEJoules.toFixed(1)} J, Vib = ${kinetic.vibrationalKEJoules.toFixed(1)} J (Total KE = ${kinetic.totalKineticEnergyJoules.toFixed(1)} J)\n` +
    `• Potential Energy Subcategories: Grav = ${potential.gravitationalPEJoules.toFixed(1)} J, Elastic = ${potential.elasticPEJoules.toFixed(1)} J, Elec = ${potential.electrostaticPEJoules.toFixed(3)} J (Total PE = ${potential.totalPotentialEnergyJoules.toFixed(1)} J)\n` +
    `• Conservation Laws: Mechanical E_mech = ${conservation.totalMechanicalEnergyJoules.toFixed(1)} J, System E_total = ${conservation.totalSystemEnergyJoules.toFixed(1)} J (Conserved: ${conservation.isTotalEnergyConserved ? 'YES' : 'NO'})`;

  return {
    kinetic,
    potential,
    conservation,
    summaryText,
  };
}
