import { ISkill, SkillExecutionResult, SkillValidationResult } from '../core/ISkill';
import { SkillRegistry } from '../core/SkillRegistry';
import { calculateUnifiedFluidPivotalAnalysis } from '../../src/lib/physics/fluidMechanicsPivotalSolver';

export const FluidMechanicsSkill: ISkill = {
  metadata: {
    id: 'fluid-mechanics-and-pivotal-dynamics',
    name: 'Fluid Mechanics & Pivotal Dynamics Engine',
    category: 'physics',
    summary:
      'Governs Continuity mass conservation, Bernoulli energy metrics, control volume linear momentum reaction forces, turbomachinery angular momentum torque, Reynolds flow behavior thresholds, and pipeline friction losses.',
    dependencies: ['physics-and-momentum'],
    capabilities: [
      'continuity-mass-flow',
      'bernoulli-energy-metrics',
      'control-volume-reaction-forces',
      'turbomachinery-angular-momentum',
      'reynolds-flow-regimes',
      'pipeline-friction-head-loss',
    ],
    knowledgeRules: [
      {
        id: 'RULE_CONTINUITY_MASS_CONSERVATION',
        name: 'Mass Flow Conservation',
        description: 'Volume flow rate Q = A1 v1 = A2 v2 and mass flow rate m_dot = ρ Q remain conserved across varying cross-sections.',
        failureModesPrevented: ['Mass creation/destruction or velocity discontinuities across conduits'],
      },
      {
        id: 'RULE_CONTROL_VOLUME_MOMENTUM',
        name: 'Control Volume Momentum Balance',
        description: 'Anchoring reaction forces F_Rx, F_Ry strictly balance pressure forces, weight, and fluid momentum flux m_dot Δv.',
        failureModesPrevented: ['Unanchored pipe joint displacement or ignoring dynamic pressure thrust on elbow bends'],
      },
      {
        id: 'RULE_REYNOLDS_REGIME_ACCURACY',
        name: 'Reynolds Flow Regime Thresholds',
        description: 'Flow behavior transitions cleanly between Laminar (Re <= 2100), Transitional (2100 < Re <= 4000), and Turbulent (Re > 4000).',
        failureModesPrevented: ['Applying laminar shear formulas to chaotic turbulent flow regimes'],
      },
    ],
  },

  execute(context: any, params?: any): SkillExecutionResult {
    const densityKgM3 = params?.densityKgM3 ?? context?.densityKgM3 ?? 1000.0;
    const area1M2 = params?.area1M2 ?? context?.area1M2 ?? 0.05;
    const area2M2 = params?.area2M2 ?? context?.area2M2 ?? 0.02;
    const velocity1Mps = params?.velocity1Mps ?? context?.velocity1Mps ?? 3.0;
    const staticPressure1Pa = params?.staticPressure1Pa ?? context?.staticPressure1Pa ?? 200000.0;
    const deflectionAngleDeg = params?.deflectionAngleDeg ?? context?.deflectionAngleDeg ?? 60.0;
    const shaftRpm = params?.shaftRpm ?? context?.shaftRpm ?? 1200.0;

    const analysis = calculateUnifiedFluidPivotalAnalysis({
      densityKgM3,
      area1M2,
      area2M2,
      velocity1Mps,
      staticPressure1Pa,
      deflectionAngleDeg,
      shaftRpm,
    });

    return {
      success: true,
      modifiedContext: {
        ...context,
        fluidPivotalAnalysis: analysis,
        massFlowRateKgS: analysis.continuity.massFlowRateKgS,
        reactionForceXN: analysis.reaction.reactionForceXN,
        reactionForceYN: analysis.reaction.reactionForceYN,
        resultantReactionForceN: analysis.reaction.resultantReactionForceN,
        shaftTorqueNm: analysis.turbomachinery.shaftTorqueNm,
        shaftPowerWatts: analysis.turbomachinery.shaftPowerWatts,
        reynoldsNumber: analysis.reynolds.reynoldsNumber,
        flowRegime: analysis.reynolds.flowRegime,
      },
      diagnostics: [analysis.summaryText],
      metrics: {
        volumeFlowRateQM3s: analysis.continuity.volumeFlowRateQM3s,
        massFlowRateKgS: analysis.continuity.massFlowRateKgS,
        resultantReactionForceN: analysis.reaction.resultantReactionForceN,
        shaftTorqueNm: analysis.turbomachinery.shaftTorqueNm,
        reynoldsNumber: analysis.reynolds.reynoldsNumber,
        darcyFrictionFactor: analysis.friction.darcyFrictionFactor,
      },
    };
  },

  validate(context: any): SkillValidationResult {
    const mDotIn = context?.massFlowRateInKgS ?? context?.massFlowRateKgS ?? 150.0;
    const mDotOut = context?.massFlowRateOutKgS ?? context?.massFlowRateKgS ?? 150.0;
    const deltaMDot = Math.abs(mDotIn - mDotOut);

    const issues: string[] = [];
    let score = 100;

    if (deltaMDot > 1e-4) {
      issues.push(`Mass flow conservation error ${deltaMDot.toFixed(4)} kg/s violates continuity equation.`);
      score -= 40;
    }

    const re = context?.reynoldsNumber ?? 5000;
    if (re < 0) {
      issues.push(`Negative Reynolds number ${re} is physically impossible.`);
      score -= 30;
    }

    return {
      valid: issues.length === 0,
      score: Math.max(0, score),
      issues,
      metrics: { massFlowConservationError: deltaMDot, reynoldsNumber: re, qualityScore: Math.max(0, score) },
    };
  },

  correct(context: any, issues: string[]): SkillExecutionResult {
    const safeMDot = Math.max(0, context?.massFlowRateKgS ?? 150.0);
    const fixedContext = {
      ...context,
      massFlowRateInKgS: safeMDot,
      massFlowRateOutKgS: safeMDot,
    };

    const res = this.execute!(fixedContext);
    return {
      success: true,
      modifiedContext: res.modifiedContext,
      diagnostics: ['Corrected Fluid Mechanics State: Enforced mass flow continuity across in/out ports.'],
    };
  },
};

SkillRegistry.getInstance().register(FluidMechanicsSkill);
