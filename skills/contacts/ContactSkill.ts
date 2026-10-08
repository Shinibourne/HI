import { ISkill, SkillExecutionResult, SkillValidationResult } from '../core/ISkill';
import { SkillRegistry } from '../core/SkillRegistry';
import { ContactSystem, ContactPoint } from './ContactSystem';

const globalContactSystem = new ContactSystem();

export const ContactSkill: ISkill = {
  metadata: {
    id: 'contact-and-constraints',
    name: 'Contact & Constraint Solver',
    category: 'contacts',
    summary: 'Generalized contact state machine (approaching, contact, compression, planted, sliding, release) enforcing world-space locking.',
    dependencies: [],
    capabilities: ['foot-planting', 'hand-contact', 'world-lock', 'ground-perimeter'],
    knowledgeRules: [
      {
        id: 'RULE_PLANTED_LOCK',
        name: 'Planted World Lock',
        description: 'Planted stance feet must remain locked in world space without sliding or floating.',
        failureModesPrevented: ['Ice skating / foot sliding', 'Ground clipping'],
      },
    ],
  },

  execute(context: any, params?: any): SkillExecutionResult {
    const groundY = context.groundY ?? 755.0;
    const pelvisX = context.pelvisX ?? 500;
    const pelvisY = context.pelvisY ?? 500;

    if (params && params.contacts) {
      for (const c of params.contacts as ContactPoint[]) {
        globalContactSystem.updateContact(c);
      }
    }

    const res = globalContactSystem.solveContacts(pelvisX, pelvisY, { groundY });

    return {
      success: true,
      modifiedContext: {
        ...context,
        pelvisY: pelvisY + res.pelvisAdjustmentY,
        contacts: res.updatedContacts,
      },
      diagnostics: res.correctionsApplied,
    };
  },

  validate(context: any): SkillValidationResult {
    const contacts = (context.contacts as ContactPoint[]) ?? globalContactSystem.getAllContacts();
    const groundY = context.groundY ?? 755.0;

    const issues: string[] = [];
    let score = 100;

    for (const c of contacts) {
      if (c.state === 'planted' && c.worldY > groundY + 1.0) {
        issues.push(`Planted contact ${c.id} penetrating ground at Y=${c.worldY.toFixed(1)}`);
        score -= 20;
      }
    }

    return {
      valid: issues.length === 0,
      score: Math.max(0, score),
      issues,
    };
  },
};

SkillRegistry.getInstance().register(ContactSkill);
