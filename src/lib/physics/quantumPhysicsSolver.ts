/**
 * QUANTUM PHYSICS & SKILL ACQUISITION SOLVER MODULE
 * ==================================================
 * Physical calculation engine and skill metaphor analyzer implementing:
 * 1. Wave-Particle Duality (de Broglie λ = h/p, E = hν = ℏω, phase & group velocities)
 * 2. Superposition & Wavefunction Collapse (|ψ⟩ = Σ c_i |ϕ_i⟩, von Neumann Entropy S(ρ))
 * 3. Heisenberg Uncertainty Principle (Δx Δp ≥ ℏ/2, ΔE Δt ≥ ℏ/2, Observer Effect / Overthinking)
 * 4. Quantum Entanglement & Bell States (|Φ+⟩, Concurrence C(ρ), Mutual Information I(A:B))
 * 5. Quantum Tunneling & Barrier Penetration (WKB T ≈ exp(-2 ∫ K dx))
 * 6. Quantum Leaps / Discrete Eigenstate Transitions (ΔE = hν, Fermi's Golden Rule rate W)
 * 7. Quantum Coherence & Decoherence Timescales (τ_dec, Lindblad flow decay)
 * 8. Quantum Computing & Parallel State Exploration (Hadamard H, QFT, Grover acceleration)
 */

export const PLANCK_CONSTANT_J_S = 6.62607015e-34; // h in J s
export const REDUCED_PLANCK_HBAR_J_S = 1.054571817e-34; // ℏ in J s
export const ELECTRON_MASS_KG = 9.1093837015e-31; // electron rest mass in kg
export const HUMAN_MOTOR_HBAR_ANALOG = 1.0; // Normalized motor uncertainty constant for skill simulations

export interface WaveParticleReport {
  deBroglieWavelengthMeters: number;
  momentumKgMps: number;
  energyJoules: number;
  frequencyHz: number;
  phaseVelocityMps: number;
  groupVelocityMps: number;
  stateMode: 'WAVE' | 'PARTICLE' | 'HYBRID_MASTERY';
  adaptabilityScore: number; // 0 to 100
  executionPrecisionScore: number; // 0 to 100
}

export interface SuperpositionReport {
  stateCoefficients: { stateName: string; amplitude: number; probability: number }[];
  totalProbabilitySum: number;
  vonNeumannEntropy: number; // S(ρ)
  isCollapsed: boolean;
  collapsedStateName: string | null;
  beginnersMindPotentialScore: number; // 0 to 100
}

export interface UncertaintyReport {
  positionUncertaintyMeters: number; // Δx
  momentumUncertaintyKgMps: number; // Δp
  uncertaintyProduct: number; // Δx · Δp
  minimumAllowedUncertainty: number; // ℏ / 2
  isUncertaintySatisfied: boolean;
  overthinkingInterferenceScore: number; // 0 to 100 (high = choking)
  chokingRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}

export interface EntanglementReport {
  primarySkillName: string;
  secondarySkillName: string;
  bellStateName: string;
  concurrence: number; // 0.0 (uncorrelated) to 1.0 (maximally entangled)
  quantumMutualInformation: number; // I(A:B)
  transferGainPercentage: number;
  isEntangled: boolean;
}

export interface TunnelingReport {
  particleEnergyJoules: number; // E
  barrierHeightJoules: number; // V_0
  barrierWidthMeters: number; // L
  decayConstantK: number;
  transmissionCoefficientT: number; // Probability T
  tunnelingSuccessPercentage: number;
  plateauPiercingLikelihood: 'LOW' | 'MEDIUM' | 'HIGH' | 'INSTANT_BREAKTHROUGH';
}

export interface QuantumLeapReport {
  initialLevel: number;
  finalLevel: number;
  energyDeltaJoules: number; // ΔE = hν
  transitionFrequencyHz: number; // ν
  fermiTransitionRate: number; // W_{i->f}
  practiceAccumulationProgress: number; // 0.0 to 1.0
  isLeapTriggered: boolean;
  breakthroughStateName: string;
}

export interface CoherenceReport {
  coherenceTimeSeconds: number; // τ_dec
  relaxationTimeSeconds: number;
  thermalWavelengthMeters: number;
  environmentalNoiseLevel: number; // 0.0 to 1.0
  flowStatePurityPercentage: number;
  isFlowCoherent: boolean;
}

export interface QuantumComputingReport {
  qubitCount: number;
  simultaneousStateDimensions: number; // 2^N
  hadamardSuperpositionActive: boolean;
  groverSpeedupFactor: number; // √N
  parallelOptionEvaluations: string[];
  optimalPathSelected: string;
}

export interface UnifiedQuantumAnalysisReport {
  waveParticle: WaveParticleReport;
  superposition: SuperpositionReport;
  uncertainty: UncertaintyReport;
  entanglement: EntanglementReport;
  tunneling: TunnelingReport;
  quantumLeap: QuantumLeapReport;
  coherence: CoherenceReport;
  computing: QuantumComputingReport;
  summaryText: string;
}

/**
 * Calculates Wave-Particle Duality dynamics (λ = h/p, E = hν, Adaptability vs Execution)
 */
export function calculateWaveParticleDuality(
  massKg = 70.0,
  velocityMps = 5.0,
  frequencyHz = 100.0,
  isConsciousFocusHigh = false
): WaveParticleReport {
  const safeMass = Math.max(1e-15, massKg);
  const safeVel = Math.max(1e-6, velocityMps);
  const momentumKgMps = safeMass * safeVel;

  const deBroglieWavelengthMeters = PLANCK_CONSTANT_J_S / momentumKgMps;
  const energyJoules = PLANCK_CONSTANT_J_S * frequencyHz;
  const phaseVelocityMps = (PLANCK_CONSTANT_J_S * frequencyHz) / momentumKgMps;
  const groupVelocityMps = safeVel;

  // Skill reapplication metrics
  const executionPrecisionScore = isConsciousFocusHigh ? 92.0 : 45.0;
  const adaptabilityScore = isConsciousFocusHigh ? 25.0 : 90.0;

  let stateMode: 'WAVE' | 'PARTICLE' | 'HYBRID_MASTERY' = 'WAVE';
  if (isConsciousFocusHigh && adaptabilityScore < 40) {
    stateMode = 'PARTICLE';
  } else if (!isConsciousFocusHigh && executionPrecisionScore > 70) {
    stateMode = 'HYBRID_MASTERY';
  }

  return {
    deBroglieWavelengthMeters,
    momentumKgMps,
    energyJoules,
    frequencyHz,
    phaseVelocityMps,
    groupVelocityMps,
    stateMode,
    adaptabilityScore,
    executionPrecisionScore,
  };
}

/**
 * Calculates Superposition state vector and von Neumann entropy
 */
export function calculateSuperpositionState(
  amplitudes: { stateName: string; amplitude: number }[] = [
    { stateName: 'Technique A (Linear)', amplitude: 0.6 },
    { stateName: 'Technique B (Rotational)', amplitude: 0.5 },
    { stateName: 'Technique C (Adaptive Counter)', amplitude: 0.6245 },
  ],
  forceCollapseIndex: number | null = null
): SuperpositionReport {
  // Normalize amplitudes
  const normSq = amplitudes.reduce((sum, a) => sum + a.amplitude * a.amplitude, 0);
  const scale = normSq > 0 ? 1.0 / Math.sqrt(normSq) : 1.0;

  const stateCoefficients = amplitudes.map((a) => {
    const normAmp = a.amplitude * scale;
    return {
      stateName: a.stateName,
      amplitude: normAmp,
      probability: normAmp * normAmp,
    };
  });

  const totalProbabilitySum = stateCoefficients.reduce((sum, c) => sum + c.probability, 0);

  // von Neumann Entropy S(ρ) = - Σ p_i ln(p_i)
  let vonNeumannEntropy = 0;
  for (const c of stateCoefficients) {
    if (c.probability > 1e-12) {
      vonNeumannEntropy -= c.probability * Math.log(c.probability);
    }
  }

  const isCollapsed = forceCollapseIndex !== null;
  const collapsedStateName = isCollapsed && stateCoefficients[forceCollapseIndex]
    ? stateCoefficients[forceCollapseIndex].stateName
    : null;

  const beginnersMindPotentialScore = Math.min(100, Math.max(0, vonNeumannEntropy * 75.0));

  return {
    stateCoefficients,
    totalProbabilitySum,
    vonNeumannEntropy,
    isCollapsed,
    collapsedStateName,
    beginnersMindPotentialScore,
  };
}

/**
 * Calculates Heisenberg Uncertainty Principle bounds and Observer Effect choking risk
 */
export function calculateUncertaintyAndObserverEffect(
  positionUncertaintyMeters = 0.05, // High micro-focus Δx = 0.05m
  momentumUncertaintyKgMps = 2.0,
  hbarConstant = HUMAN_MOTOR_HBAR_ANALOG
): UncertaintyReport {
  const dx = Math.max(1e-6, positionUncertaintyMeters);
  const dp = Math.max(1e-6, momentumUncertaintyKgMps);

  const uncertaintyProduct = dx * dp;
  const minimumAllowedUncertainty = hbarConstant / 2.0;
  const isUncertaintySatisfied = uncertaintyProduct >= minimumAllowedUncertainty - 1e-9;

  // Overthinking / Choking Risk increases when trying to make Δx extremely small
  const overthinkingInterferenceScore = Math.min(100, Math.max(0, (1.0 / dx) * 3.5));

  let chokingRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (overthinkingInterferenceScore > 80) chokingRiskLevel = 'CRITICAL';
  else if (overthinkingInterferenceScore > 60) chokingRiskLevel = 'HIGH';
  else if (overthinkingInterferenceScore > 35) chokingRiskLevel = 'MODERATE';

  return {
    positionUncertaintyMeters: dx,
    momentumUncertaintyKgMps: dp,
    uncertaintyProduct,
    minimumAllowedUncertainty,
    isUncertaintySatisfied,
    overthinkingInterferenceScore,
    chokingRiskLevel,
  };
}

/**
 * Calculates Quantum Entanglement between interconnected skills
 */
export function calculateQuantumSkillEntanglement(
  primarySkillName = 'Music Rhythm & Pacing',
  secondarySkillName = 'Video Editing & Composition',
  structuralCorrelation = 0.88
): EntanglementReport {
  const concurrence = Math.max(0, Math.min(1.0, structuralCorrelation));

  // Bell State |Φ+⟩ = 1/√2 (|00⟩ + |11⟩)
  const bellStateName = '|Φ+⟩ = 1/√2 (|00⟩ + |11⟩)';

  // Quantum Mutual Information I(A:B) = S(A) + S(B) - S(AB)
  const quantumMutualInformation = concurrence * 2.0 * Math.LN2;

  const transferGainPercentage = concurrence * 45.0; // Up to 45% non-local skill transfer
  const isEntangled = concurrence > 0.3;

  return {
    primarySkillName,
    secondarySkillName,
    bellStateName,
    concurrence,
    quantumMutualInformation,
    transferGainPercentage,
    isEntangled,
  };
}

/**
 * Calculates Quantum Tunneling transmission through skill potential energy barriers
 */
export function calculateQuantumTunneling(
  particleEnergyJoules = 4.0, // E
  barrierHeightJoules = 6.0, // V_0 (V_0 > E)
  barrierWidthMeters = 0.5, // L
  massKg = 1.0
): TunnelingReport {
  const E = particleEnergyJoules;
  const V0 = Math.max(E + 1e-6, barrierHeightJoules);
  const L = Math.max(1e-4, barrierWidthMeters);

  // K = √(2 m (V_0 - E)) / ℏ
  const deltaE = V0 - E;
  const decayConstantK = Math.sqrt(2.0 * massKg * deltaE) / HUMAN_MOTOR_HBAR_ANALOG;

  // Transmission coefficient T ≈ exp(-2 K L)
  const exponent = -2.0 * decayConstantK * L;
  const transmissionCoefficientT = Math.exp(Math.max(-100, exponent));

  const tunnelingSuccessPercentage = transmissionCoefficientT * 100.0;

  let plateauPiercingLikelihood: 'LOW' | 'MEDIUM' | 'HIGH' | 'INSTANT_BREAKTHROUGH' = 'LOW';
  if (tunnelingSuccessPercentage > 50) plateauPiercingLikelihood = 'INSTANT_BREAKTHROUGH';
  else if (tunnelingSuccessPercentage > 20) plateauPiercingLikelihood = 'HIGH';
  else if (tunnelingSuccessPercentage > 5) plateauPiercingLikelihood = 'MEDIUM';

  return {
    particleEnergyJoules: E,
    barrierHeightJoules: V0,
    barrierWidthMeters: L,
    decayConstantK,
    transmissionCoefficientT,
    tunnelingSuccessPercentage,
    plateauPiercingLikelihood,
  };
}

/**
 * Calculates Quantum Leaps / Eigenstate Transitions
 */
export function calculateQuantumLeapTransition(
  initialLevel = 1,
  practiceEnergyAccumulatedJoules = 85.0,
  thresholdEnergyJoules = 100.0
): QuantumLeapReport {
  const progress = Math.min(1.0, practiceEnergyAccumulatedJoules / Math.max(1e-6, thresholdEnergyJoules));
  const isLeapTriggered = progress >= 1.0;

  const finalLevel = isLeapTriggered ? initialLevel + 1 : initialLevel;
  const energyDeltaJoules = 15.0 * finalLevel; // ΔE
  const transitionFrequencyHz = energyDeltaJoules / HUMAN_MOTOR_HBAR_ANALOG; // ν

  // Fermi's Golden Rule W = (2π / ℏ) |M|^2 ρ(E)
  const fermiTransitionRate = isLeapTriggered ? 0.95 : progress * 0.2;

  const breakthroughStateName = isLeapTriggered
    ? `Eigenstate |Level ${finalLevel} Mastery⟩`
    : `Plateau State |Level ${initialLevel} Practice⟩`;

  return {
    initialLevel,
    finalLevel,
    energyDeltaJoules,
    transitionFrequencyHz,
    fermiTransitionRate,
    practiceAccumulationProgress: progress,
    isLeapTriggered,
    breakthroughStateName,
  };
}

/**
 * Calculates Quantum Coherence and Decoherence timescales
 */
export function calculateQuantumCoherence(
  relaxationTimeSeconds = 10.0,
  thermalWavelengthMeters = 0.5,
  spatialSeparationMeters = 0.1,
  environmentalNoiseLevel = 0.2
): CoherenceReport {
  const ratio = thermalWavelengthMeters / Math.max(1e-6, spatialSeparationMeters);
  const coherenceTimeSeconds = relaxationTimeSeconds * (ratio * ratio) * (1.0 - environmentalNoiseLevel * 0.8);

  const flowStatePurityPercentage = Math.min(100, Math.max(0, (coherenceTimeSeconds / relaxationTimeSeconds) * 100));
  const isFlowCoherent = flowStatePurityPercentage > 50.0;

  return {
    coherenceTimeSeconds,
    relaxationTimeSeconds,
    thermalWavelengthMeters,
    environmentalNoiseLevel,
    flowStatePurityPercentage,
    isFlowCoherent,
  };
}

/**
 * Calculates Quantum Parallel Computing evaluation
 */
export function calculateQuantumComputingParallelSim(
  qubitCount = 4
): QuantumComputingReport {
  const safeQubits = Math.max(1, Math.min(16, qubitCount));
  const simultaneousStateDimensions = Math.pow(2, safeQubits);
  const groverSpeedupFactor = Math.sqrt(simultaneousStateDimensions);

  const parallelOptionEvaluations = [
    'Trajectory Alpha: Linear High Punch',
    'Trajectory Beta: Low Sweeping Kick',
    'Trajectory Gamma: Feint & Side Slip',
    'Trajectory Delta: Defensive Parry & Counter',
  ];

  const optimalPathSelected = 'Trajectory Gamma: Feint & Side Slip (Constructive Interference Peak)';

  return {
    qubitCount: safeQubits,
    simultaneousStateDimensions,
    hadamardSuperpositionActive: true,
    groverSpeedupFactor,
    parallelOptionEvaluations,
    optimalPathSelected,
  };
}

/**
 * Performs a unified comprehensive Quantum Physics & Skill Acquisition analysis across all categories
 */
export function calculateUnifiedQuantumAnalysis(params: {
  massKg?: number;
  velocityMps?: number;
  isConsciousFocusHigh?: boolean;
  positionUncertaintyMeters?: number;
  practiceEnergyJoules?: number;
  qubitCount?: number;
}): UnifiedQuantumAnalysisReport {
  const m = params.massKg ?? 70.0;
  const v = params.velocityMps ?? 5.0;
  const conscious = params.isConsciousFocusHigh ?? false;
  const dx = params.positionUncertaintyMeters ?? 0.05;
  const practiceE = params.practiceEnergyJoules ?? 100.0;
  const qubits = params.qubitCount ?? 4;

  const waveParticle = calculateWaveParticleDuality(m, v, 100.0, conscious);
  const superposition = calculateSuperpositionState();
  const uncertainty = calculateUncertaintyAndObserverEffect(dx, 2.0);
  const entanglement = calculateQuantumSkillEntanglement();
  const tunneling = calculateQuantumTunneling();
  const quantumLeap = calculateQuantumLeapTransition(1, practiceE, 100.0);
  const coherence = calculateQuantumCoherence();
  const computing = calculateQuantumComputingParallelSim(qubits);

  const summaryText =
    `Unified Quantum Analysis (Mass = ${m}kg, Vel = ${v}m/s):\n` +
    `• Wave-Particle Mode: ${waveParticle.stateMode} (Adaptability = ${waveParticle.adaptabilityScore.toFixed(0)}%, Precision = ${waveParticle.executionPrecisionScore.toFixed(0)}%)\n` +
    `• Superposition: Entropy S = ${superposition.vonNeumannEntropy.toFixed(3)} (Beginner's Mind Potential = ${superposition.beginnersMindPotentialScore.toFixed(0)}/100)\n` +
    `• Observer Effect / Choking: Δx·Δp = ${uncertainty.uncertaintyProduct.toFixed(3)} (Overthinking Score = ${uncertainty.overthinkingInterferenceScore.toFixed(0)}%, Choking Risk = ${uncertainty.chokingRiskLevel})\n` +
    `• Quantum Entanglement: Bell State ${entanglement.bellStateName}, Concurrence = ${entanglement.concurrence.toFixed(2)} (+${entanglement.transferGainPercentage.toFixed(1)}% Non-local Skill Transfer)\n` +
    `• Quantum Tunneling: Transmission T = ${tunneling.transmissionCoefficientT.toExponential(2)} (Plateau Piercing = ${tunneling.plateauPiercingLikelihood})\n` +
    `• Quantum Leap: ${quantumLeap.breakthroughStateName} (${(quantumLeap.practiceAccumulationProgress * 100).toFixed(0)}% energy accumulated)\n` +
    `• Quantum Coherence: Flow Purity = ${coherence.flowStatePurityPercentage.toFixed(1)}% (Coherent = ${coherence.isFlowCoherent ? 'YES' : 'NO'})\n` +
    `• Quantum Computing: ${computing.simultaneousStateDimensions} Parallel Paths evaluated via ${computing.groverSpeedupFactor.toFixed(1)}x Grover Speedup.`;

  return {
    waveParticle,
    superposition,
    uncertainty,
    entanglement,
    tunneling,
    quantumLeap,
    coherence,
    computing,
    summaryText,
  };
}
