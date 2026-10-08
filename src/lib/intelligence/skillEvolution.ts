import fs from 'fs';
import path from 'path';
import { ExtractedTechnique, KnowledgeProvenanceNode, LivingSkill } from './types';

export function synthesizeLivingSkillFromTechnique(
  technique: ExtractedTechnique,
  provenanceGraph: KnowledgeProvenanceNode[],
  version: string = 'v1.0.0'
): LivingSkill {
  const relatedProvenance = provenanceGraph.filter(
    (node) => node.childNodeIds.includes(`principle_${technique.id}`) || node.id.includes(technique.id)
  );

  return {
    id: `skill_living_${technique.id}`,
    name: `Living Skill: ${technique.name}`,
    version,
    category: technique.category,
    description: technique.description,
    extractedFromTechniqueIds: [technique.id],
    confidence: technique.confidence,
    parameters: technique.parameters,
    prerequisites: technique.prerequisites,
    timingProfile: technique.timingProfile,
    bodyRelationships: [
      technique.bodyMechanicsPattern,
      'Kinetic chain propagation down 17-bone stickfigure tree',
      'COM support stability check',
    ],
    provenance: relatedProvenance,
    validationHistory: [
      {
        timestamp: new Date().toISOString(),
        score: Math.round(technique.confidence * 100),
        passed: technique.confidence >= 0.5,
        notes: `Initial synthesis from ${technique.supportingProjectIds.length} reference projects`,
      },
    ],
    implementationHooks: [
      { generatorName: 'phantomShadowboxFrames', methodName: 'buildAdjustedPhantomFrames' },
      { generatorName: 'speedVsStrengthFrames', methodName: 'buildAdjustedSpeedStrengthFrames' },
      { generatorName: 'proceduralKinematics', methodName: 'applyBiomechanicalPhysics' },
    ],
  };
}

export function evolveLivingSkill(
  existingSkill: LivingSkill,
  newParameters: Record<string, number | string | boolean>,
  auditScore: number,
  notes: string
): LivingSkill {
  const [major, minor, patch] = existingSkill.version.replace('v', '').split('.').map(Number);
  const newVersion = `v${major}.${minor + 1}.${patch}`;

  const updatedParameters = {
    ...existingSkill.parameters,
    ...newParameters,
  };

  const newConfidence = Math.min(1.0, existingSkill.confidence + (auditScore >= 80 ? 0.05 : -0.05));

  return {
    ...existingSkill,
    version: newVersion,
    confidence: Math.max(0.1, newConfidence),
    parameters: updatedParameters,
    validationHistory: [
      ...existingSkill.validationHistory,
      {
        timestamp: new Date().toISOString(),
        score: auditScore,
        passed: auditScore >= 70,
        notes,
      },
    ],
  };
}

export function saveLivingSkillsCatalog(
  skills: LivingSkill[],
  outputDir: string = 'skills'
): void {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save JSON representation
  fs.writeFileSync(
    path.join(outputDir, 'living_skills.json'),
    JSON.stringify(skills, null, 2),
    'utf-8'
  );

  // Generate TypeScript exports module
  const tsContent = `/**
 * AUTO-GENERATED LIVING SKILLS CATALOG
 * Produced by Stick Nodes Animation Intelligence Subsystem
 */

import { LivingSkill } from '../intelligence/types';

export const LIVING_SKILLS_CATALOG: LivingSkill[] = ${JSON.stringify(skills, null, 2)};

export function getLivingSkillById(id: string): LivingSkill | undefined {
  return LIVING_SKILLS_CATALOG.find((s) => s.id === id);
}

export function getLivingSkillParameters(id: string): Record<string, number | string | boolean> {
  const skill = getLivingSkillById(id);
  return skill ? skill.parameters : {};
}
`;

  const srcSkillsDir = path.join('src', 'lib', 'skills');
  if (!fs.existsSync(srcSkillsDir)) {
    fs.mkdirSync(srcSkillsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(srcSkillsDir, 'livingSkillsCatalog.ts'),
    tsContent,
    'utf-8'
  );
}
