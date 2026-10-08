import { ISkill, SkillExecutionResult, SkillValidationResult } from '../core/ISkill';
import { SkillRegistry } from '../core/SkillRegistry';
import { solveFabrik2D } from './FabrikIK';
import { solveCcd2D } from './CcdIK';
import { solveLimbChain } from '../limbs/LimbSystem';
import { enforceAnatomicalConstraints17 } from '../skeleton/AnatomicalConstraints';
import { STICKFIGURE_PARENTS } from '../../src/lib/stkndsCodec';

export const KinematicsSkill: ISkill = {
  metadata: {
    id: 'procedural-animation-kinematics',
    name: 'Procedural Animation Kinematics & Multi-IK System',
    category: 'ik',
    summary: 'Multi-solver IK/FK engine supporting Analytical 2-Bone, FABRIK, CCD, joint limits, and FK/IK blending.',
    dependencies: [],
    capabilities: ['ik-2bone', 'fabrik', 'ccd', 'fk-ik-blend', 'limb-solving'],
    knowledgeRules: [
      {
        id: 'RULE_IK_REACHABILITY',
        name: 'Reachability Clamping',
        description: 'End effector target must be clamped to reachable envelope [minReach, maxReach * 0.998].',
        failureModesPrevented: ['Singularity breakdown', 'Disjointed bone stretching'],
      },
      {
        id: 'RULE_HINGE_POLARITY',
        name: 'Biological Hinge Polarity',
        description: 'Knees and elbows must bend strictly in anatomical directions.',
        failureModesPrevented: ['Flamingo reverse knees', 'Backward elbows'],
      },
    ],
  },

  execute(context: any, params?: any): SkillExecutionResult {
    if (params && params.solveLimb) {
      const result = solveLimbChain(params.solveLimb);
      return {
        success: true,
        modifiedContext: { ...context, lastLimbResult: result },
        metrics: { finalError: result.finalError, reachable: result.reachable ? 1 : 0 },
      };
    }
    return { success: true };
  },

  validate(context: any): SkillValidationResult {
    const worldAngles = context.worldAngles as number[];
    const isRightFacing = context.isRightFacing ?? true;

    if (!worldAngles || worldAngles.length < 17) {
      return { valid: true, score: 100, issues: [] };
    }

    const { violationsCount, report } = enforceAnatomicalConstraints17(
      worldAngles,
      STICKFIGURE_PARENTS,
      isRightFacing
    );

    const score = Math.max(0, 100 - violationsCount * 15);
    return {
      valid: violationsCount === 0,
      score,
      issues: report,
      metrics: { hingeViolations: violationsCount },
    };
  },

  correct(context: any): SkillExecutionResult {
    const worldAngles = context.worldAngles as number[];
    const isRightFacing = context.isRightFacing ?? true;

    if (!worldAngles || worldAngles.length < 17) {
      return { success: true };
    }

    const { constrainedAngles, report } = enforceAnatomicalConstraints17(
      worldAngles,
      STICKFIGURE_PARENTS,
      isRightFacing
    );

    return {
      success: true,
      modifiedContext: { ...context, worldAngles: constrainedAngles },
      diagnostics: report,
    };
  },
};

// Auto-register in SkillRegistry
SkillRegistry.getInstance().register(KinematicsSkill);
