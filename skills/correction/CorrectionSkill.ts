import { ISkill, SkillExecutionResult, SkillValidationResult } from '../core/ISkill';
import { SkillRegistry } from '../core/SkillRegistry';
import { AutomatedCorrectionEngine } from './AutomatedCorrectionEngine';

const globalCorrectionEngine = new AutomatedCorrectionEngine();

export const CorrectionSkill: ISkill = {
  metadata: {
    id: 'automated-correction-pipeline',
    name: 'Multi-Pass Automated Correction Engine',
    category: 'correction',
    summary: 'Skill-agnostic optimization loop (Generate → Analyze → Detect → Correct → Re-solve → Validate) with kinetic chain error propagation.',
    dependencies: ['biomechanical-quality-audit'],
    capabilities: ['auto-correction', 'kinetic-chain-correction', 'seam-flip-unwrap'],
    knowledgeRules: [
      {
        id: 'RULE_PROP_CORRECT',
        name: 'Kinetic Chain Correction Propagation',
        description: 'Corrections must propagate through parent joints rather than applying isolated clamps.',
        failureModesPrevented: ['Isolated joint clamping artifacts'],
      },
    ],
  },

  execute(context: any, params?: any): SkillExecutionResult {
    const frames = context.frames;
    const groundY = context.groundY ?? 755.0;
    const isRightFacing = context.isRightFacing ?? true;

    if (!frames || !Array.isArray(frames)) {
      return { success: false, diagnostics: ['No frames array provided in context.'] };
    }

    const res = globalCorrectionEngine.autoCorrectAnimation(frames, groundY, isRightFacing);

    return {
      success: res.finalReport.passed,
      modifiedContext: {
        ...context,
        frames: res.correctedFrames,
        correctionReport: res.finalReport,
      },
      diagnostics: res.correctionsApplied,
      metrics: {
        initialScore: res.initialReport.overallScore,
        finalScore: res.finalReport.overallScore,
        passes: res.iterations,
      },
    };
  },
};

SkillRegistry.getInstance().register(CorrectionSkill);
