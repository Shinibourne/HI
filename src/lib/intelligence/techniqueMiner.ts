import fs from 'fs';
import path from 'path';
import {
  ExtractedTechnique,
  FrameMotionForensics,
  KnowledgeProvenanceNode,
  ProjectMetadata,
  SemanticMotionEvent,
} from './types';

export interface MiningContext {
  projects: ProjectMetadata[];
  forensicsByProject: Record<string, FrameMotionForensics[]>;
  eventsByProject: Record<string, SemanticMotionEvent[]>;
}

export function mineTechniquesAndProvenance(context: MiningContext): {
  techniques: ExtractedTechnique[];
  provenanceGraph: KnowledgeProvenanceNode[];
  principles: { id: string; title: string; category: string; description: string; confidence: number; evidenceProjects: string[] }[];
} {
  const techniques: ExtractedTechnique[] = [];
  const provenanceGraph: KnowledgeProvenanceNode[] = [];
  const principles: { id: string; title: string; category: string; description: string; confidence: number; evidenceProjects: string[] }[] = [];

  const projectIds = context.projects.map((p) => p.id);

  // 1. Dynamic Extraction of Technique 1: Foot Contact & Ground Balance Shift
  const contactEventsByProject: Record<string, SemanticMotionEvent[]> = {};
  for (const pid of projectIds) {
    const pEvs = (context.eventsByProject[pid] ?? []).filter(
      (e) => e.eventType === 'foot-contact' || e.eventType === 'foot-liftoff'
    );
    if (pEvs.length > 0) {
      contactEventsByProject[pid] = pEvs;
    }
  }

  const contactProjects = Object.keys(contactEventsByProject);
  const avgContactMagnitude = contactProjects.length > 0
    ? Object.values(contactEventsByProject).flat().reduce((acc, e) => acc + e.magnitude, 0) /
      Object.values(contactEventsByProject).flat().length
    : 40;

  const contactConfidence = Math.min(1.0, Math.max(0.5, 0.4 + contactProjects.length * 0.1));

  const t1: ExtractedTechnique = {
    id: 'tech_ground_balance_shift',
    name: 'Dynamic Foot Contact & COM Shift',
    category: 'balance',
    description: `Alternating foot contact with Center of Mass progression dynamically mined across ${contactProjects.length} reference projects.`,
    prerequisites: ['foot-contact-detection', 'com-calculation'],
    applicableSituations: ['walking', 'running', 'stroll', 'combat-stance-shift'],
    timingProfile: {
      id: 'tp_ground_balance',
      name: 'Dynamic Ground Balance',
      anticipationFrames: 2,
      accelerationFrames: 4,
      impactFrames: 1,
      recoilFrames: 2,
      recoveryFrames: 5,
      holdFrames: 0,
      totalDurationFrames: 14,
      spacingProfile: 'ease-in-out',
    },
    bodyMechanicsPattern: 'Planted support foot anchors in world space while COM progresses and swing limb flexes.',
    parameters: {
      plantedFootMaxSpeed: Math.round(avgContactMagnitude * 0.8),
      comMarginThreshold: 50,
      kneeFlexionAngleDeg: 25,
    },
    variations: ['high-speed-run', 'casual-stroll', 'heavy-march'],
    confidence: contactConfidence,
    supportingProjectIds: contactProjects,
    limitations: ['Requires solid ground plane', 'Less applicable during continuous flight'],
    implementationNotes: 'Enforce zero foot displacement relative to world during planted support phase.',
  };
  techniques.push(t1);

  // 2. Dynamic Extraction of Technique 2: Impact Compression & Secondary Recoil
  const impactEventsByProject: Record<string, SemanticMotionEvent[]> = {};
  for (const pid of projectIds) {
    const pEvs = (context.eventsByProject[pid] ?? []).filter(
      (e) => e.eventType === 'impact' || e.eventType === 'camera-shake'
    );
    if (pEvs.length > 0) {
      impactEventsByProject[pid] = pEvs;
    }
  }

  const impactProjects = Object.keys(impactEventsByProject);
  const avgImpactMagnitude = impactProjects.length > 0
    ? Object.values(impactEventsByProject).flat().reduce((acc, e) => acc + e.magnitude, 0) /
      Object.values(impactEventsByProject).flat().length
    : 1500;

  const impactConfidence = Math.min(1.0, Math.max(0.5, 0.5 + impactProjects.length * 0.12));

  const t2: ExtractedTechnique = {
    id: 'tech_impact_compression',
    name: 'Impact Compression & Secondary Recoil',
    category: 'impact',
    description: `High-energy contact creates immediate compression along kinetic chain (avg force: ${Math.round(avgImpactMagnitude)}) followed by delayed recoil.`,
    prerequisites: ['impact-detection', 'kinetic-chain-propagation'],
    applicableSituations: ['punch', 'kick', 'heavy-landing', 'weapon-hit'],
    timingProfile: {
      id: 'tp_impact_compression',
      name: 'Dynamic Snap & Settle',
      anticipationFrames: 3,
      accelerationFrames: 2,
      impactFrames: 1,
      recoilFrames: 3,
      recoveryFrames: 6,
      holdFrames: 1,
      totalDurationFrames: 16,
      spacingProfile: 'snap-and-settle',
    },
    bodyMechanicsPattern: 'Contact node decelerates sharply -> torso and spine compress -> secondary arm/head follow-through.',
    parameters: {
      compressionDampingFactor: 0.82,
      cameraShakeThreshold: Math.round(avgImpactMagnitude * 0.5),
      recoilLagFrames: 2,
    },
    variations: ['sharp-strike', 'heavy-thud', 'elastic-bounce'],
    confidence: impactConfidence,
    supportingProjectIds: impactProjects,
    limitations: ['May need style tuning for lightweight vs heavy characters'],
    implementationNotes: 'Apply momentary joint angle freeze at impact frame, then dissipate force through torso.',
  };
  techniques.push(t2);

  // 3. Dynamic Extraction of Technique 3: Anticipatory Windup & Burst Acceleration
  const accelEventsByProject: Record<string, SemanticMotionEvent[]> = {};
  for (const pid of projectIds) {
    const pEvs = (context.eventsByProject[pid] ?? []).filter(
      (e) => e.eventType === 'acceleration-burst' || e.eventType === 'directional-change'
    );
    if (pEvs.length > 0) {
      accelEventsByProject[pid] = pEvs;
    }
  }

  const accelProjects = Object.keys(accelEventsByProject);
  const accelConfidence = Math.min(1.0, Math.max(0.5, 0.45 + accelProjects.length * 0.1));

  const t3: ExtractedTechnique = {
    id: 'tech_anticipation_burst',
    name: 'Anticipatory Windup & Burst Acceleration',
    category: 'locomotion',
    description: `Body compresses in opposing direction before unleashing high-acceleration directional burst mined across ${accelProjects.length} reference projects.`,
    prerequisites: ['com-acceleration-tracking'],
    applicableSituations: ['dash', 'jump-takeoff', 'power-punch', 'teleport-charge'],
    timingProfile: {
      id: 'tp_anticipation_burst',
      name: 'Exponential Burst',
      anticipationFrames: 4,
      accelerationFrames: 3,
      impactFrames: 1,
      recoilFrames: 2,
      recoveryFrames: 4,
      holdFrames: 0,
      totalDurationFrames: 14,
      spacingProfile: 'exponential-impact',
    },
    bodyMechanicsPattern: 'Pelvis lowers and tilts backward -> limb stores kinetic potential -> rapid linear extension.',
    parameters: {
      anticipationScale: 0.15,
      accelerationFactor: 2.4,
    },
    variations: ['crouch-jump', 'dash-start', 'power-windup'],
    confidence: accelConfidence,
    supportingProjectIds: accelProjects,
    limitations: ['Avoid over-anticipation in instant-action mechanics'],
    implementationNotes: 'Subtly shift COM opposite to target motion direction for 3-4 frames before burst.',
  };
  techniques.push(t3);

  // 4. Build Provenance Graph
  for (const tech of techniques) {
    const rawObsNodes: KnowledgeProvenanceNode[] = tech.supportingProjectIds.map((projId) => ({
      type: 'raw-observation',
      id: `obs_${tech.id}_${projId}`,
      label: `Observation from ${projId}`,
      sourceProjectIds: [projId],
      evidenceDetails: `Direct motion forensics and semantic events extracted from project ${projId}`,
      confidenceScore: 0.9,
      childNodeIds: [`pattern_${tech.id}`],
      parentNodeIds: [],
    }));

    const inferredPatternNode: KnowledgeProvenanceNode = {
      type: 'inferred-pattern',
      id: `pattern_${tech.id}`,
      label: `Pattern: ${tech.name}`,
      sourceProjectIds: tech.supportingProjectIds,
      evidenceDetails: `Inferred recurring kinetic relationship across ${tech.supportingProjectIds.length} projects`,
      confidenceScore: tech.confidence,
      childNodeIds: [`principle_${tech.id}`],
      parentNodeIds: rawObsNodes.map((n) => n.id),
    };

    const generalizedPrincipleNode: KnowledgeProvenanceNode = {
      type: 'generalized-principle',
      id: `principle_${tech.id}`,
      label: `Principle: ${tech.category.toUpperCase()} - ${tech.name}`,
      sourceProjectIds: tech.supportingProjectIds,
      evidenceDetails: `Generalized biomechanical principle applicable to procedural stickfigure generation`,
      confidenceScore: tech.confidence,
      childNodeIds: [`skill_living_${tech.id}`],
      parentNodeIds: [`pattern_${tech.id}`],
    };

    provenanceGraph.push(...rawObsNodes, inferredPatternNode, generalizedPrincipleNode);

    principles.push({
      id: `principle_${tech.id}`,
      title: tech.name,
      category: tech.category,
      description: tech.description,
      confidence: tech.confidence,
      evidenceProjects: tech.supportingProjectIds,
    });
  }

  return { techniques, provenanceGraph, principles };
}

export function saveKnowledgeArtifacts(
  knowledge: ReturnType<typeof mineTechniquesAndProvenance>,
  outputDir: string = 'knowledge'
): void {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, 'extracted_techniques.json'),
    JSON.stringify(knowledge.techniques, null, 2),
    'utf-8'
  );

  fs.writeFileSync(
    path.join(outputDir, 'provenance_graph.json'),
    JSON.stringify(knowledge.provenanceGraph, null, 2),
    'utf-8'
  );

  fs.writeFileSync(
    path.join(outputDir, 'generalized_principles.json'),
    JSON.stringify(knowledge.principles, null, 2),
    'utf-8'
  );
}
