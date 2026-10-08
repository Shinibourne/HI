import fs from 'fs';
import path from 'path';
import { scanCorpus, saveCorpusCatalog } from '../src/lib/intelligence/corpusScanner';
import { inspectStkndsBuffer } from '../src/lib/stknds/stkndsCore';
import { analyzeProjectMotionForensics } from '../src/lib/intelligence/motionForensics';
import { detectSemanticEvents, extractTimingSpacingProfile } from '../src/lib/intelligence/eventDetector';
import { mineTechniquesAndProvenance, saveKnowledgeArtifacts } from '../src/lib/intelligence/techniqueMiner';
import { synthesizeLivingSkillFromTechnique, evolveLivingSkill, saveLivingSkillsCatalog } from '../src/lib/intelligence/skillEvolution';
import { evaluateAnimationQuality, saveQualityReport } from '../src/lib/intelligence/qualityEvaluator';
import { runSelfImprovementLoop } from '../src/lib/intelligence/codeEvolution';

async function runMasterValidation() {
  console.log('================================================================');
  console.log('  STICK NODES ANIMATION INTELLIGENCE — MASTER VALIDATION SUITE');
  console.log('================================================================\n');

  const passedStages: string[] = [];
  const failedStages: string[] = [];

  // Stage 1: Corpus Discovery & Ingestion
  console.log('[STAGE 1] Discovering & Ingesting Corpus from templates/...');
  const catalog = await scanCorpus(['templates']);
  saveCorpusCatalog(catalog);
  if (catalog.totalProjectsScanned > 0 && catalog.analyzedProjects.length > 0) {
    console.log(`  ✓ Scanned ${catalog.totalProjectsScanned} projects (${catalog.analyzedProjects.length} valid analyzed)`);
    passedStages.push('Stage 1: Corpus Discovery & Ingestion');
  } else {
    console.error('  ✗ Stage 1 Failed: No valid projects discovered');
    failedStages.push('Stage 1: Corpus Discovery & Ingestion');
  }

  // Stage 2: Deep Inspection & Decoding
  console.log('\n[STAGE 2] Deep Decoding & Metadata Extraction...');
  const firstProject = catalog.analyzedProjects[0];
  if (!firstProject) {
    throw new Error('No analyzed project available for deep inspection');
  }
  const fileBuf = fs.readFileSync(firstProject.filePath);
  const ab = fileBuf.buffer.slice(fileBuf.byteOffset, fileBuf.byteOffset + fileBuf.byteLength);
  const inspection = await inspectStkndsBuffer(firstProject.fileName, ab);
  if (inspection.prefixValid && inspection.figureNodes.length > 0) {
    console.log(`  ✓ Decoded ${firstProject.fileName}: ${inspection.figureNodes.length} nodes, ${inspection.frameCount} frames`);
    passedStages.push('Stage 2: Deep Inspection & Decoding');
  } else {
    failedStages.push('Stage 2: Deep Inspection & Decoding');
  }

  // Stage 3 & 4: Motion Forensics & Body Mechanics Analysis
  console.log('\n[STAGE 3 & 4] Motion Forensics & Kinetic Chain/COM Analysis...');
  const forensicsByProject: Record<string, any> = {};
  const eventsByProject: Record<string, any> = {};
  let totalFramesAnalyzed = 0;

  for (const proj of catalog.analyzedProjects) {
    const pBuf = fs.readFileSync(proj.filePath);
    const pAb = pBuf.buffer.slice(pBuf.byteOffset, pBuf.byteOffset + pBuf.byteLength);
    const pInsp = await inspectStkndsBuffer(proj.fileName, pAb);
    if (pInsp.frames.length > 0) {
      const fList = analyzeProjectMotionForensics(pInsp);
      const evList = detectSemanticEvents(proj.id, fList);
      forensicsByProject[proj.id] = fList;
      eventsByProject[proj.id] = evList;
      totalFramesAnalyzed += fList.length;
    }
  }

  if (totalFramesAnalyzed > 0) {
    console.log(`  ✓ Analyzed motion forensics across ${totalFramesAnalyzed} total frames`);
    passedStages.push('Stage 3 & 4: Motion Forensics & Body Mechanics');
  } else {
    failedStages.push('Stage 3 & 4: Motion Forensics & Body Mechanics');
  }

  // Stage 5 & 6: Semantic Events & Timing Profiles
  console.log('\n[STAGE 5 & 6] Semantic Motion Event Detection & Timing Profiles...');
  const totalEvents = Object.values(eventsByProject).reduce((acc: number, list: any) => acc + list.length, 0);
  if (totalEvents > 0) {
    console.log(`  ✓ Extracted ${totalEvents} semantic motion events (contacts, bursts, apexes, shakes)`);
    passedStages.push('Stage 5 & 6: Semantic Events & Timing Profiles');
  } else {
    failedStages.push('Stage 5 & 6: Semantic Events & Timing Profiles');
  }

  // Stage 7: Technique Mining & Provenance Graph
  console.log('\n[STAGE 7] Mining Generalized Animation Techniques & Provenance Graph...');
  const knowledge = mineTechniquesAndProvenance({
    projects: catalog.analyzedProjects,
    forensicsByProject,
    eventsByProject,
  });
  saveKnowledgeArtifacts(knowledge);
  if (knowledge.techniques.length > 0 && knowledge.provenanceGraph.length > 0) {
    console.log(`  ✓ Mined ${knowledge.techniques.length} generalized techniques with ${knowledge.provenanceGraph.length} provenance graph nodes`);
    passedStages.push('Stage 7: Technique Mining & Provenance Graph');
  } else {
    failedStages.push('Stage 7: Technique Mining & Provenance Graph');
  }

  // Stage 8: Living Skill Evolution
  console.log('\n[STAGE 8] Living Skill Creation & Versioned Evolution...');
  const livingSkills = knowledge.techniques.map((tech) =>
    synthesizeLivingSkillFromTechnique(tech, knowledge.provenanceGraph, 'v1.0.0')
  );
  const evolvedSkills = livingSkills.map((sk) =>
    evolveLivingSkill(sk, { verifiedByMasterSuite: true }, 95, 'Validated in master test suite')
  );
  saveLivingSkillsCatalog(evolvedSkills);
  if (livingSkills.length > 0 && evolvedSkills[0].version === 'v1.1.0') {
    console.log(`  ✓ Created and evolved ${livingSkills.length} living skills (versioned v1.0.0 → v1.1.0)`);
    passedStages.push('Stage 8: Living Skill Creation & Evolution');
  } else {
    failedStages.push('Stage 8: Living Skill Creation & Evolution');
  }

  // Stage 9 & 10 & 11: Generation, Evaluation & Quality Audit Reports
  console.log('\n[STAGE 9, 10, 11] Closed Self-Improvement & Quality Audit Diagnostics...');
  const selfImprovementResult = await runSelfImprovementLoop(evolvedSkills);
  if (selfImprovementResult.finalReport.overallScore >= 80) {
    console.log(`  ✓ Closed self-improvement loop complete: initial score ${selfImprovementResult.initialReport.overallScore} → final score ${selfImprovementResult.finalReport.overallScore}`);
    passedStages.push('Stage 9, 10, 11: Generation, Quality Audit & Self-Improvement');
  } else {
    failedStages.push('Stage 9, 10, 11: Generation, Quality Audit & Self-Improvement');
  }

  // Summary
  console.log('\n================================================================');
  console.log('  SUMMARY OF VALIDATION RESULTS');
  console.log('================================================================');
  console.log(`Passed Stages (${passedStages.length}/${passedStages.length + failedStages.length}):`);
  for (const s of passedStages) {
    console.log(`  ✓ ${s}`);
  }

  if (failedStages.length > 0) {
    console.error(`\nFailed Stages (${failedStages.length}):`);
    for (const s of failedStages) {
      console.error(`  ✗ ${s}`);
    }
    process.exit(1);
  } else {
    console.log('\n🎉 ALL MASTER VALIDATION SUITE STAGES PASSED SUCCESSFULLY!\n');
  }
}

runMasterValidation().catch((err) => {
  console.error('Master Validation Suite Error:', err);
  process.exit(1);
});
