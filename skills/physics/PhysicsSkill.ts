import { ISkill, SkillExecutionResult, SkillValidationResult } from '../core/ISkill';
import { SkillRegistry } from '../core/SkillRegistry';
import { calculateCenterOfMass17 } from './MassMomentumSecondaryPhysics';
import { propagateKineticImpulse } from '../body_mechanics/KineticChainPropagation';

export const PhysicsSkill: ISkill = {
  metadata: {
    id: 'physics-and-momentum',
    name: 'Mass, Momentum & Secondary Physics Engine',
    category: 'physics',
    summary: 'Center of Mass tracking, kinetic impulse propagation, and Verlet secondary motion physics.',
    dependencies: ['procedural-animation-kinematics'],
    capabilities: ['balance-com', 'kinetic-chain-propagation', 'momentum-transfer', 'verlet-secondary'],
    knowledgeRules: [
      {
        id: 'RULE_COM_BALANCE',
        name: 'Center of Mass Support',
        description: 'In static holds, Center of Mass vertical projection must fall inside support base.',
        failureModesPrevented: ['Impossible leaning without falling'],
      },
      {
        id: 'RULE_IMPULSE_REACTION',
        name: 'Whole-body Impulse Reaction',
        description: 'Impacts on extremities propagate force through connected skeletal tree.',
        failureModesPrevented: ['Rigid unyielding body on impact'],
      },
    ],
  },

  execute(context: any, params?: any): SkillExecutionResult {
    if (params && params.impulse) {
      const res = propagateKineticImpulse(params.impulse);
      return {
        success: true,
        modifiedContext: {
          ...context,
          worldAngles: res.modifiedWorldAnglesDeg,
          pelvisX: (context.pelvisX ?? 0) + res.pelvisShiftX,
          pelvisY: (context.pelvisY ?? 0) + res.pelvisShiftY,
        },
        diagnostics: res.chainReactionDiagnostics,
      };
    }
    return { success: true };
  },

  validate(context: any): SkillValidationResult {
    const pelvisX = context.pelvisX ?? 500;
    const pelvisY = context.pelvisY ?? 500;
    const worldAngles = context.worldAngles as number[];

    if (!worldAngles || worldAngles.length < 17) {
      return { valid: true, score: 100, issues: [] };
    }

    const com = calculateCenterOfMass17(pelvisX, pelvisY, worldAngles);
    const offset = Math.abs(com.comX - pelvisX);

    const valid = offset <= 35.0;
    const score = Math.max(0, 100 - offset * 1.5);

    return {
      valid,
      score,
      issues: valid ? [] : [`Center of mass offset ${offset.toFixed(1)}px exceeds limit`],
      metrics: { comX: com.comX, comY: com.comY, offsetFromPelvisX: offset },
    };
  },
};

SkillRegistry.getInstance().register(PhysicsSkill);
