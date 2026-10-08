/**
 * Unified Executable Skill Interface & Metadata Definitions
 */

export type SkillCategory =
  | 'core'
  | 'skeleton'
  | 'limbs'
  | 'ik'
  | 'fk'
  | 'locomotion'
  | 'combat'
  | 'acrobatics'
  | 'physics'
  | 'contacts'
  | 'body_mechanics'
  | 'motion'
  | 'transitions'
  | 'environment'
  | 'correction'
  | 'validation'
  | 'utilities';

export interface KnowledgeRule {
  id: string;
  name: string;
  description: string;
  formulaOrMetric?: string;
  failureModesPrevented: string[];
}

export interface SkillMetadata {
  id: string;
  name: string;
  category: SkillCategory;
  summary: string;
  dependencies: string[]; // Skill IDs that this skill auto-invokes or requires
  capabilities: string[]; // Named capabilities (e.g., 'ik-2bone', 'fabrik', 'foot-planting', 'balance-com')
  knowledgeRules: KnowledgeRule[];
}

export interface SkillExecutionResult {
  success: boolean;
  modifiedContext?: Record<string, any>;
  diagnostics?: string[];
  metrics?: Record<string, number>;
}

export interface SkillValidationResult {
  valid: boolean;
  score: number; // 0 to 100
  issues: string[];
  metrics?: Record<string, number>;
}

export interface ISkill<TContext = any, TParams = any> {
  metadata: SkillMetadata;

  /**
   * Primary solver / generator execution logic.
   */
  execute?: (context: TContext, params?: TParams) => SkillExecutionResult;

  /**
   * Quantitative validator evaluating compliance against this skill's knowledge rules.
   */
  validate?: (context: TContext) => SkillValidationResult;

  /**
   * Automatic correction pass repairing violations detected by validate().
   */
  correct?: (context: TContext, issues: string[]) => SkillExecutionResult;
}
