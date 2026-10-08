/**
 * Central Skill Registry for dynamic discovery, composition, and execution.
 */

import { ISkill, SkillCategory, SkillExecutionResult, SkillValidationResult } from './ISkill';

export class SkillRegistry {
  private static instance: SkillRegistry;
  private skills: Map<string, ISkill> = new Map();

  private constructor() {}

  public static getInstance(): SkillRegistry {
    if (!SkillRegistry.instance) {
      SkillRegistry.instance = new SkillRegistry();
    }
    return SkillRegistry.instance;
  }

  /**
   * Registers a new skill in the central registry.
   */
  public register(skill: ISkill): void {
    this.skills.set(skill.metadata.id, skill);
  }

  /**
   * Retrieves a skill by ID.
   */
  public getSkill(id: string): ISkill | undefined {
    return this.skills.get(id);
  }

  /**
   * Returns all registered skills.
   */
  public getAllSkills(): ISkill[] {
    return Array.from(this.skills.values());
  }

  /**
   * Retrieves all skills belonging to a specific category.
   */
  public getSkillsByCategory(category: SkillCategory): ISkill[] {
    return this.getAllSkills().filter((s) => s.metadata.category === category);
  }

  /**
   * Retrieves all skills that provide a specific capability (e.g. 'ik-2bone', 'foot-planting').
   */
  public getSkillsByCapability(capability: string): ISkill[] {
    return this.getAllSkills().filter((s) => s.metadata.capabilities.includes(capability));
  }

  /**
   * Resolves full dependency list for a given set of skill IDs.
   */
  public resolveDependencies(skillIds: string[]): ISkill[] {
    const resolvedIds = new Set<string>();
    const stack = [...skillIds];

    while (stack.length > 0) {
      const currentId = stack.pop()!;
      if (resolvedIds.has(currentId)) continue;

      const skill = this.getSkill(currentId);
      if (skill) {
        resolvedIds.add(currentId);
        for (const depId of skill.metadata.dependencies) {
          if (!resolvedIds.has(depId)) {
            stack.push(depId);
          }
        }
      }
    }

    return Array.from(resolvedIds)
      .map((id) => this.getSkill(id)!)
      .filter(Boolean);
  }

  /**
   * Executes a composed pipeline of skills in dependency order on a shared context.
   */
  public executePipeline(skillIds: string[], context: any, params?: Record<string, any>): SkillExecutionResult {
    const pipeline = this.resolveDependencies(skillIds);
    let currentContext = { ...context };
    const allDiagnostics: string[] = [];
    const aggregatedMetrics: Record<string, number> = {};

    for (const skill of pipeline) {
      if (skill.execute) {
        const skillParams = params ? params[skill.metadata.id] : undefined;
        const res = skill.execute(currentContext, skillParams);
        if (res.modifiedContext) {
          currentContext = { ...currentContext, ...res.modifiedContext };
        }
        if (res.diagnostics) {
          allDiagnostics.push(...res.diagnostics);
        }
        if (res.metrics) {
          Object.assign(aggregatedMetrics, res.metrics);
        }
      }
    }

    return {
      success: true,
      modifiedContext: currentContext,
      diagnostics: allDiagnostics,
      metrics: aggregatedMetrics,
    };
  }

  /**
   * Runs validation across all requested skills or all registered skills.
   */
  public validateAll(context: any, skillIds?: string[]): {
    valid: boolean;
    overallScore: number;
    results: Record<string, SkillValidationResult>;
  } {
    const skillsToValidate = skillIds
      ? skillIds.map((id) => this.getSkill(id)).filter((s): s is ISkill => s !== undefined)
      : this.getAllSkills();

    const results: Record<string, SkillValidationResult> = {};
    let totalScore = 0;
    let validatedCount = 0;
    let allValid = true;

    for (const skill of skillsToValidate) {
      if (skill.validate) {
        const res = skill.validate(context);
        results[skill.metadata.id] = res;
        totalScore += res.score;
        validatedCount++;
        if (!res.valid) {
          allValid = false;
        }
      }
    }

    const averageScore = validatedCount > 0 ? totalScore / validatedCount : 100;

    return {
      valid: allValid,
      overallScore: averageScore,
      results,
    };
  }
}

/**
 * Convenience helper to compose and execute skills.
 */
export function useSkill(capabilityOrId: string, context: any, params?: any): SkillExecutionResult {
  const registry = SkillRegistry.getInstance();
  let skill = registry.getSkill(capabilityOrId);
  if (!skill) {
    const matching = registry.getSkillsByCapability(capabilityOrId);
    if (matching.length > 0) {
      skill = matching[0];
    }
  }

  if (!skill || !skill.execute) {
    return {
      success: false,
      diagnostics: [`Skill or capability '${capabilityOrId}' not found or not executable.`],
    };
  }

  return skill.execute(context, params);
}
