import { ISkill, SkillExecutionResult, SkillValidationResult } from '../core/ISkill';
import { SkillRegistry } from '../core/SkillRegistry';
import { calculateUnifiedQuantumAnalysis } from '../../src/lib/physics/quantumPhysicsSolver';

export const QuantumPhysicsSkill: ISkill = {
  metadata: {
    id: 'quantum-physics-and-skill-acquisition',
    name: 'Quantum Physics & Skill Acquisition Engine',
    category: 'physics',
    summary:
      'Governs Wave-Particle Duality, Superposition, Uncertainty Principle, Entanglement, Quantum Tunneling, Quantum Leaps, Quantum Coherence, and Quantum Parallel Computing.',
    dependencies: ['physics-and-momentum'],
    capabilities: [
      'quantum-leaps',
      'superposition-beginners-mind',
      'wave-particle-duality',
      'observer-effect-avoidance',
      'quantum-entanglement-transfer',
      'quantum-tunneling',
      'quantum-coherence-flow',
      'quantum-parallel-simulation',
    ],
    knowledgeRules: [
      {
        id: 'RULE_UNCERTAINTY_BOUND',
        name: 'Heisenberg Uncertainty Bounding',
        description: 'Position uncertainty and momentum uncertainty satisfy Δx · Δp ≥ ℏ/2.',
        failureModesPrevented: ['Conscious hyper-focus choking and motor program freezing'],
      },
      {
        id: 'RULE_SUPERPOSITION_NORMALIZATION',
        name: 'Superposition Probability Normalization',
        description: 'Sum of state probabilities Σ |c_i|² equals 1.0.',
        failureModesPrevented: ['State probability inflation or collapse error'],
      },
      {
        id: 'RULE_QUANTUM_LEAP_THRESHOLD',
        name: 'Discrete Quantum Leap Energy Threshold',
        description: 'Breakthrough transitions occur when threshold practice energy is accumulated.',
        failureModesPrevented: ['Artificial linear gradient assumptions in non-linear motor learning'],
      },
    ],
  },

  execute(context: any, params?: any): SkillExecutionResult {
    const massKg = params?.massKg ?? context?.massKg ?? 70.0;
    const velocityMps = params?.velocityMps ?? context?.velocityMps ?? 5.0;
    const isConsciousFocusHigh = params?.isConsciousFocusHigh ?? context?.isConsciousFocusHigh ?? false;
    const positionUncertaintyMeters = params?.positionUncertaintyMeters ?? context?.positionUncertaintyMeters ?? 0.05;
    const practiceEnergyJoules = params?.practiceEnergyJoules ?? context?.practiceEnergyJoules ?? 100.0;
    const qubitCount = params?.qubitCount ?? context?.qubitCount ?? 4;

    const analysis = calculateUnifiedQuantumAnalysis({
      massKg,
      velocityMps,
      isConsciousFocusHigh,
      positionUncertaintyMeters,
      practiceEnergyJoules,
      qubitCount,
    });

    return {
      success: true,
      modifiedContext: {
        ...context,
        quantumAnalysis: analysis,
        stateMode: analysis.waveParticle.stateMode,
        chokingRiskLevel: analysis.uncertainty.chokingRiskLevel,
        isLeapTriggered: analysis.quantumLeap.isLeapTriggered,
        flowStatePurityPercentage: analysis.coherence.flowStatePurityPercentage,
      },
      diagnostics: [analysis.summaryText],
      metrics: {
        vonNeumannEntropy: analysis.superposition.vonNeumannEntropy,
        uncertaintyProduct: analysis.uncertainty.uncertaintyProduct,
        entanglementConcurrence: analysis.entanglement.concurrence,
        tunnelingProbability: analysis.tunneling.transmissionCoefficientT,
        coherenceFlowPurity: analysis.coherence.flowStatePurityPercentage,
        quantumSimulatedDimensions: analysis.computing.simultaneousStateDimensions,
      },
    };
  },

  validate(context: any): SkillValidationResult {
    const dx = context?.positionUncertaintyMeters ?? 0.05;
    const dp = context?.momentumUncertaintyKgMps ?? 2.0;
    const product = dx * dp;

    const issues: string[] = [];
    let score = 100;

    if (product < 0.5) {
      issues.push(`Uncertainty product ${product.toFixed(3)} violates minimum motor ℏ/2 bound.`);
      score -= 30;
    }

    if (context?.isConsciousFocusHigh) {
      issues.push('High conscious focus detected (Observer Effect / Choking Risk elevated).');
      score -= 15;
    }

    return {
      valid: issues.length === 0,
      score: Math.max(0, score),
      issues,
      metrics: { uncertaintyProduct: product, qualityScore: Math.max(0, score) },
    };
  },

  correct(context: any, issues: string[]): SkillExecutionResult {
    const fixedDx = Math.max(0.2, context?.positionUncertaintyMeters ?? 0.2); // Relax micro-focus
    const fixedContext = {
      ...context,
      positionUncertaintyMeters: fixedDx,
      isConsciousFocusHigh: false, // Transition to intuitive flow
    };

    const res = this.execute!(fixedContext);
    return {
      success: true,
      modifiedContext: res.modifiedContext,
      diagnostics: ['Corrected Observer Effect: Relaxed micro-focus and restored intuitive flow state.'],
    };
  },
};

SkillRegistry.getInstance().register(QuantumPhysicsSkill);
