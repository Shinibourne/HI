import { ISkill, SkillExecutionResult, SkillValidationResult } from '../core/ISkill';
import { SkillRegistry } from '../core/SkillRegistry';
import { AnimationQualityAnalyzer } from './AnimationQualityAnalyzer';

const globalAnalyzer = new AnimationQualityAnalyzer();

export const ValidationSkill: ISkill = {
  metadata: {
    id: 'biomechanical-quality-audit',
    name: 'Biomechanical Quality Audit & Analyzer',
    category: 'validation',
    summary: 'Automated 5-domain quality diagnostic analyzer across Structural, Kinematic, Biomechanical, Contact, and Visual dimensions.',
    dependencies: ['procedural-animation-kinematics', 'physics-and-momentum', 'contact-and-constraints'],
    capabilities: ['quality-analyzer', 'quality-audit-gate'],
    knowledgeRules: [
      {
        id: 'RULE_QUAL_AUDIT',
        name: 'Quality Gate Compliance',
        description: 'Animation must pass 5-domain quantitative audit with score >= 85.',
        failureModesPrevented: ['Exporting flawed or broken animations'],
      },
    ],
  },

  validate(context: any): SkillValidationResult {
    const frames = context.frames;
    const groundY = context.groundY ?? 755.0;
    const isRightFacing = context.isRightFacing ?? true;

    if (!frames || !Array.isArray(frames)) {
      return { valid: true, score: 100, issues: [] };
    }

    const report = globalAnalyzer.analyzeAnimation(frames, groundY, isRightFacing);

    return {
      valid: report.passed,
      score: report.overallScore,
      issues: Object.values(report.domainResults).flatMap((d) => d.issues),
    };
  },
};

SkillRegistry.getInstance().register(ValidationSkill);
