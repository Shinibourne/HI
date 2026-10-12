/**
 * FLUID MECHANICS AND PIVOTAL DYNAMICS SOLVER MODULE
 * ==================================================
 * Physical solver implementing the 3 foundational conservation laws and subform mechanics:
 * 1. Fluid Mass & Velocity (Continuity Equation Q = A1 v1 = A2 v2, m_dot = \rho Q)
 * 2. Energy & Pressure Metrics (Bernoulli's Equation: Static, Dynamic, Hydrostatic Head)
 * 3. Structural Reaction Mechanics (Control Volume Linear Momentum, Reaction forces F_Rx, F_Ry)
 * 4. Turbomachinery Dynamics (Angular Momentum / Moment of Momentum, Shaft Torque T, Shaft Power W_dot)
 * 5. Flow Behavior Thresholds (Reynolds Number Re, Laminar, Transitional, Turbulent Regimes)
 * 6. Pipeline Friction & Head Loss (Darcy-Weisbach Equation h_f = f * (L/D) * (v^2 / 2g))
 */

export const WATER_DENSITY_KG_PER_M3 = 1000.0;
export const STANDARD_GRAVITY_MPS2 = 9.80665;
export const WATER_DYNAMIC_VISCOSITY_PA_S = 0.0010016; // Pa s at 20°C
export const WATER_KINEMATIC_VISCOSITY_M2_S = 1.0016e-6; // m²/s at 20°C

export interface ContinuityReport {
  densityKgM3: number;
  area1M2: number;
  area2M2: number;
  velocity1Mps: number;
  velocity2Mps: number;
  volumeFlowRateQM3s: number;
  volumeFlowRateLitersPerSec: number;
  massFlowRateKgS: number;
}

export interface BernoulliEnergyReport {
  staticPressure1Pa: number;
  staticPressure2Pa: number;
  dynamicPressure1Pa: number;
  dynamicPressure2Pa: number;
  hydrostaticPressure1Pa: number;
  hydrostaticPressure2Pa: number;
  totalPressure1Pa: number;
  totalPressure2Pa: number;
  totalHead1Meters: number;
  totalHead2Meters: number;
  isEnergyConserved: boolean;
}

export interface ControlVolumeReactionReport {
  deflectionAngleDeg: number;
  deflectionAngleRad: number;
  momentumCorrectionFactorBeta: number;
  weightFluidN: number;
  weightStructureN: number;
  reactionForceXN: number;
  reactionForceYN: number;
  resultantReactionForceN: number;
  reactionAngleDeg: number;
  inletMomentumFluxN: number;
  outletMomentumFluxN: number;
}

export interface TurbomachineryReport {
  radiusInMeters: number;
  radiusOutMeters: number;
  tangentialVelocityInMps: number;
  tangentialVelocityOutMps: number;
  shaftAngularVelocityRadS: number;
  shaftRpm: number;
  shaftTorqueNm: number;
  shaftPowerWatts: number;
  shaftPowerHp: number;
}

export interface ReynoldsFlowRegimeReport {
  reynoldsNumber: number;
  flowRegime: 'LAMINAR' | 'TRANSITIONAL' | 'TURBULENT';
  characteristicDiameterMeters: number;
  dynamicViscosityPaS: number;
  kinematicViscosityM2S: number;
  regimeDescription: string;
}

export interface PipelineFrictionReport {
  pipeLengthMeters: number;
  pipeDiameterMeters: number;
  darcyFrictionFactor: number;
  headLossMeters: number;
  frictionPressureDropPa: number;
}

export interface UnifiedFluidPivotalReport {
  continuity: ContinuityReport;
  bernoulli: BernoulliEnergyReport;
  reaction: ControlVolumeReactionReport;
  turbomachinery: TurbomachineryReport;
  reynolds: ReynoldsFlowRegimeReport;
  friction: PipelineFrictionReport;
  summaryText: string;
}

/**
 * 1. Calculates Fluid Mass & Velocity via Continuity Equation (Q = A1 v1 = A2 v2, m_dot = \rho Q)
 */
export function calculateContinuityAndMassFlow(params: {
  densityKgM3?: number;
  area1M2?: number;
  area2M2?: number;
  velocity1Mps?: number;
}): ContinuityReport {
  const densityKgM3 = Math.max(1e-6, params.densityKgM3 ?? WATER_DENSITY_KG_PER_M3);
  const area1M2 = Math.max(1e-9, params.area1M2 ?? 0.05); // e.g. 0.05 m² (~25cm diameter)
  const area2M2 = Math.max(1e-9, params.area2M2 ?? 0.02); // e.g. 0.02 m² reducer nozzle
  const velocity1Mps = Math.max(0, params.velocity1Mps ?? 3.0); // 3 m/s inlet

  const volumeFlowRateQM3s = area1M2 * velocity1Mps;
  const velocity2Mps = volumeFlowRateQM3s / area2M2;
  const massFlowRateKgS = densityKgM3 * volumeFlowRateQM3s;
  const volumeFlowRateLitersPerSec = volumeFlowRateQM3s * 1000.0;

  return {
    densityKgM3,
    area1M2,
    area2M2,
    velocity1Mps,
    velocity2Mps,
    volumeFlowRateQM3s,
    volumeFlowRateLitersPerSec,
    massFlowRateKgS,
  };
}

/**
 * 2. Calculates Bernoulli Energy Metrics & Pressure Heads along a streamline
 */
export function calculateBernoulliEnergyMetrics(params: {
  densityKgM3?: number;
  staticPressure1Pa?: number;
  velocity1Mps?: number;
  height1Meters?: number;
  velocity2Mps?: number;
  height2Meters?: number;
  gravityMps2?: number;
}): BernoulliEnergyReport {
  const rho = Math.max(1e-6, params.densityKgM3 ?? WATER_DENSITY_KG_PER_M3);
  const g = Math.max(0, params.gravityMps2 ?? STANDARD_GRAVITY_MPS2);
  const P1 = params.staticPressure1Pa ?? 200000.0; // 200 kPa inlet
  const v1 = Math.max(0, params.velocity1Mps ?? 3.0);
  const h1 = params.height1Meters ?? 0.0;
  const v2 = Math.max(0, params.velocity2Mps ?? 7.5);
  const h2 = params.height2Meters ?? 2.0;

  const dynamicPressure1Pa = 0.5 * rho * v1 * v1;
  const hydrostaticPressure1Pa = rho * g * h1;
  const totalPressure1Pa = P1 + dynamicPressure1Pa + hydrostaticPressure1Pa;
  const totalHead1Meters = totalPressure1Pa / (rho * g);

  // By Bernoulli: P2 = Total1 - (0.5 * rho * v2^2 + rho * g * h2)
  const dynamicPressure2Pa = 0.5 * rho * v2 * v2;
  const hydrostaticPressure2Pa = rho * g * h2;
  const staticPressure2Pa = totalPressure1Pa - dynamicPressure2Pa - hydrostaticPressure2Pa;
  const totalPressure2Pa = staticPressure2Pa + dynamicPressure2Pa + hydrostaticPressure2Pa;
  const totalHead2Meters = totalPressure2Pa / (rho * g);

  const isEnergyConserved = Math.abs(totalPressure1Pa - totalPressure2Pa) < 1e-4;

  return {
    staticPressure1Pa: P1,
    staticPressure2Pa,
    dynamicPressure1Pa,
    dynamicPressure2Pa,
    hydrostaticPressure1Pa,
    hydrostaticPressure2Pa,
    totalPressure1Pa,
    totalPressure2Pa,
    totalHead1Meters,
    totalHead2Meters,
    isEnergyConserved,
  };
}

/**
 * 3. Calculates Structural Reaction Mechanics on Bends / Nozzles via Control Volume Momentum
 */
export function calculateControlVolumeReactionForces(params: {
  massFlowRateKgS?: number;
  velocity1Mps?: number;
  velocity2Mps?: number;
  area1M2?: number;
  area2M2?: number;
  staticPressure1Pa?: number;
  staticPressure2Pa?: number;
  deflectionAngleDeg?: number;
  momentumCorrectionFactorBeta?: number;
  weightFluidN?: number;
  weightStructureN?: number;
}): ControlVolumeReactionReport {
  const mDot = Math.max(0, params.massFlowRateKgS ?? 150.0); // 150 kg/s
  const v1 = Math.max(0, params.velocity1Mps ?? 3.0);
  const v2 = Math.max(0, params.velocity2Mps ?? 7.5);
  const A1 = Math.max(1e-9, params.area1M2 ?? 0.05);
  const A2 = Math.max(1e-9, params.area2M2 ?? 0.02);
  const P1 = params.staticPressure1Pa ?? 200000.0;
  const P2 = params.staticPressure2Pa ?? 150000.0;
  const thetaDeg = params.deflectionAngleDeg ?? 60.0; // 60° elbow bend
  const beta = params.momentumCorrectionFactorBeta ?? 1.02;
  const Wfluid = Math.max(0, params.weightFluidN ?? 250.0);
  const Wstruct = Math.max(0, params.weightStructureN ?? 180.0);

  const thetaRad = (thetaDeg * Math.PI) / 180.0;

  const inletMomentumFluxN = beta * mDot * v1;
  const outletMomentumFluxN = beta * mDot * v2;

  // F_Rx + P1*A1 - P2*A2*cos(theta) = beta * mDot * (v2*cos(theta) - v1)
  const reactionForceXN =
    beta * mDot * (v2 * Math.cos(thetaRad) - v1) - P1 * A1 + P2 * A2 * Math.cos(thetaRad);

  // F_Ry - W_fluid - W_struct - P2*A2*sin(theta) = beta * mDot * (v2*sin(theta) - 0)
  const reactionForceYN =
    beta * mDot * (v2 * Math.sin(thetaRad) - 0) + Wfluid + Wstruct + P2 * A2 * Math.sin(thetaRad);

  const resultantReactionForceN = Math.hypot(reactionForceXN, reactionForceYN);
  const reactionAngleDeg = (Math.atan2(reactionForceYN, reactionForceXN) * 180.0) / Math.PI;

  return {
    deflectionAngleDeg: thetaDeg,
    deflectionAngleRad: thetaRad,
    momentumCorrectionFactorBeta: beta,
    weightFluidN: Wfluid,
    weightStructureN: Wstruct,
    reactionForceXN,
    reactionForceYN,
    resultantReactionForceN,
    reactionAngleDeg,
    inletMomentumFluxN,
    outletMomentumFluxN,
  };
}

/**
 * 4. Calculates Turbomachinery Angular Momentum & Shaft Power (Euler Turbomachine Equation)
 */
export function calculateTurbomachineryDynamics(params: {
  massFlowRateKgS?: number;
  radiusInMeters?: number;
  radiusOutMeters?: number;
  tangentialVelocityInMps?: number;
  tangentialVelocityOutMps?: number;
  shaftRpm?: number;
}): TurbomachineryReport {
  const mDot = Math.max(0, params.massFlowRateKgS ?? 150.0);
  const rIn = Math.max(1e-4, params.radiusInMeters ?? 0.15); // 15cm inlet radius
  const rOut = Math.max(1e-4, params.radiusOutMeters ?? 0.35); // 35cm outlet impeller radius
  const vtIn = params.tangentialVelocityInMps ?? 2.0;
  const vtOut = params.tangentialVelocityOutMps ?? 18.0;
  const rpm = Math.max(0, params.shaftRpm ?? 1200.0);

  const omegaRadS = (rpm * 2.0 * Math.PI) / 60.0;

  // Euler Turbomachine Equation: T = m_dot * (r_out * v_t,out - r_in * v_t,in)
  const shaftTorqueNm = mDot * (rOut * vtOut - rIn * vtIn);
  const shaftPowerWatts = shaftTorqueNm * omegaRadS;
  const shaftPowerHp = shaftPowerWatts / 745.699872;

  return {
    radiusInMeters: rIn,
    radiusOutMeters: rOut,
    tangentialVelocityInMps: vtIn,
    tangentialVelocityOutMps: vtOut,
    shaftAngularVelocityRadS: omegaRadS,
    shaftRpm: rpm,
    shaftTorqueNm,
    shaftPowerWatts,
    shaftPowerHp,
  };
}

/**
 * 5. Calculates Reynolds Number & Determines Flow Regime Thresholds
 */
export function calculateReynoldsAndFlowRegime(params: {
  densityKgM3?: number;
  velocityMps?: number;
  characteristicDiameterMeters?: number;
  dynamicViscosityPaS?: number;
}): ReynoldsFlowRegimeReport {
  const rho = Math.max(1e-6, params.densityKgM3 ?? WATER_DENSITY_KG_PER_M3);
  const vel = Math.max(0, params.velocityMps ?? 3.0);
  const D = Math.max(1e-6, params.characteristicDiameterMeters ?? 0.25); // 25cm pipe
  const mu = Math.max(1e-9, params.dynamicViscosityPaS ?? WATER_DYNAMIC_VISCOSITY_PA_S);

  const kinematicViscosityM2S = mu / rho;
  const reynoldsNumber = (rho * vel * D) / mu;

  let flowRegime: 'LAMINAR' | 'TRANSITIONAL' | 'TURBULENT';
  let regimeDescription: string;

  if (reynoldsNumber <= 2100) {
    flowRegime = 'LAMINAR';
    regimeDescription = 'Dominated by viscous shear; fluid moves in smooth, predictive streamlines.';
  } else if (reynoldsNumber <= 4000) {
    flowRegime = 'TRANSITIONAL';
    regimeDescription = 'Unstable oscillations alternate between streamline layers and vortex shedding.';
  } else {
    flowRegime = 'TURBULENT';
    regimeDescription = 'Chaotic, inertial energy dominance; localized eddies dictate high friction drops.';
  }

  return {
    reynoldsNumber,
    flowRegime,
    characteristicDiameterMeters: D,
    dynamicViscosityPaS: mu,
    kinematicViscosityM2S,
    regimeDescription,
  };
}

/**
 * 6. Calculates Pipeline Friction & Head Loss via Darcy-Weisbach Equation
 */
export function calculatePipelineFrictionHeadLoss(params: {
  densityKgM3?: number;
  velocityMps?: number;
  pipeLengthMeters?: number;
  pipeDiameterMeters?: number;
  reynoldsNumber?: number;
  gravityMps2?: number;
}): PipelineFrictionReport {
  const rho = Math.max(1e-6, params.densityKgM3 ?? WATER_DENSITY_KG_PER_M3);
  const vel = Math.max(0, params.velocityMps ?? 3.0);
  const L = Math.max(0, params.pipeLengthMeters ?? 50.0); // 50 meters
  const D = Math.max(1e-6, params.pipeDiameterMeters ?? 0.25);
  const Re = Math.max(1.0, params.reynoldsNumber ?? 748800);
  const g = Math.max(1e-6, params.gravityMps2 ?? STANDARD_GRAVITY_MPS2);

  // Friction factor f (Laminar f = 64/Re; Turbulent approximation f ~ 0.316 / Re^0.25 Blasius)
  let darcyFrictionFactor: number;
  if (Re <= 2100) {
    darcyFrictionFactor = 64.0 / Re;
  } else {
    darcyFrictionFactor = 0.316 / Math.pow(Re, 0.25);
  }

  // Darcy-Weisbach: h_f = f * (L/D) * (v^2 / 2g)
  const headLossMeters = darcyFrictionFactor * (L / D) * ((vel * vel) / (2.0 * g));
  const frictionPressureDropPa = rho * g * headLossMeters;

  return {
    pipeLengthMeters: L,
    pipeDiameterMeters: D,
    darcyFrictionFactor,
    headLossMeters,
    frictionPressureDropPa,
  };
}

/**
 * Performs a unified comprehensive analysis of Fluid Mechanics and Pivotal Dynamics
 */
export function calculateUnifiedFluidPivotalAnalysis(params: {
  densityKgM3?: number;
  area1M2?: number;
  area2M2?: number;
  velocity1Mps?: number;
  staticPressure1Pa?: number;
  deflectionAngleDeg?: number;
  shaftRpm?: number;
  pipeLengthMeters?: number;
}): UnifiedFluidPivotalReport {
  const continuity = calculateContinuityAndMassFlow({
    densityKgM3: params.densityKgM3,
    area1M2: params.area1M2,
    area2M2: params.area2M2,
    velocity1Mps: params.velocity1Mps,
  });

  const bernoulli = calculateBernoulliEnergyMetrics({
    densityKgM3: continuity.densityKgM3,
    staticPressure1Pa: params.staticPressure1Pa ?? 200000.0,
    velocity1Mps: continuity.velocity1Mps,
    velocity2Mps: continuity.velocity2Mps,
  });

  const reaction = calculateControlVolumeReactionForces({
    massFlowRateKgS: continuity.massFlowRateKgS,
    velocity1Mps: continuity.velocity1Mps,
    velocity2Mps: continuity.velocity2Mps,
    area1M2: continuity.area1M2,
    area2M2: continuity.area2M2,
    staticPressure1Pa: bernoulli.staticPressure1Pa,
    staticPressure2Pa: bernoulli.staticPressure2Pa,
    deflectionAngleDeg: params.deflectionAngleDeg ?? 60.0,
  });

  const turbomachinery = calculateTurbomachineryDynamics({
    massFlowRateKgS: continuity.massFlowRateKgS,
    shaftRpm: params.shaftRpm ?? 1200.0,
  });

  const reynolds = calculateReynoldsAndFlowRegime({
    densityKgM3: continuity.densityKgM3,
    velocityMps: continuity.velocity1Mps,
    characteristicDiameterMeters: Math.sqrt((4.0 * continuity.area1M2) / Math.PI),
  });

  const friction = calculatePipelineFrictionHeadLoss({
    densityKgM3: continuity.densityKgM3,
    velocityMps: continuity.velocity1Mps,
    pipeLengthMeters: params.pipeLengthMeters ?? 50.0,
    pipeDiameterMeters: reynolds.characteristicDiameterMeters,
    reynoldsNumber: reynolds.reynoldsNumber,
  });

  const summaryText =
    `Unified Fluid Mechanics & Pivotal Dynamics Analysis:\n` +
    `• Continuity: Q = ${continuity.volumeFlowRateQM3s.toFixed(3)} m³/s (${continuity.volumeFlowRateLitersPerSec.toFixed(1)} L/s), m_dot = ${continuity.massFlowRateKgS.toFixed(1)} kg/s (v1 = ${continuity.velocity1Mps.toFixed(1)} m/s → v2 = ${continuity.velocity2Mps.toFixed(1)} m/s)\n` +
    `• Bernoulli Energy: P1 = ${(bernoulli.staticPressure1Pa / 1000).toFixed(1)} kPa → P2 = ${(bernoulli.staticPressure2Pa / 1000).toFixed(1)} kPa (Total Head = ${bernoulli.totalHead1Meters.toFixed(2)} m)\n` +
    `• Reaction Forces (CV ${reaction.deflectionAngleDeg}° Bend): F_Rx = ${reaction.reactionForceXN.toFixed(1)} N, F_Ry = ${reaction.reactionForceYN.toFixed(1)} N → Resultant Anchor F_R = ${reaction.resultantReactionForceN.toFixed(1)} N @ ${reaction.reactionAngleDeg.toFixed(1)}°\n` +
    `• Turbomachinery (@ ${turbomachinery.shaftRpm} RPM): Torque T = ${turbomachinery.shaftTorqueNm.toFixed(1)} N·m, Shaft Power = ${turbomachinery.shaftPowerWatts.toFixed(1)} W (${turbomachinery.shaftPowerHp.toFixed(2)} HP)\n` +
    `• Reynolds Flow Regime: Re = ${reynolds.reynoldsNumber.toFixed(0)} → ${reynolds.flowRegime} (${reynolds.regimeDescription})\n` +
    `• Pipe Friction (L = ${friction.pipeLengthMeters}m): f = ${friction.darcyFrictionFactor.toFixed(4)}, Head Loss h_f = ${friction.headLossMeters.toFixed(2)} m (ΔP = ${(friction.frictionPressureDropPa / 1000).toFixed(1)} kPa)`;

  return {
    continuity,
    bernoulli,
    reaction,
    turbomachinery,
    reynolds,
    friction,
    summaryText,
  };
}
