import fs from 'fs';
import path from 'path';
import { synthesizePhantomShadowboxStknds, PhantomShadowboxGeneratorConfig } from '../phantomShadowboxFrames';
import { inspectStkndsBuffer } from '../stknds/stkndsCore';
import { analyzeProjectMotionForensics } from './motionForensics';
import { evaluateAnimationQuality, saveQualityReport } from './qualityEvaluator';
import { evolveLivingSkill, saveLivingSkillsCatalog } from './skillEvolution';
import { LivingSkill, QualityReport } from './types';

export interface SelfImprovementResult {
  initialReport: QualityReport;
  finalReport: QualityReport;
  scoreImprovement: number;
  evolvedSkills: LivingSkill[];
  appliedParameterAdjustments: Record<string, number | string | boolean>;
}

async function getBaseDecompressed27(): Promise<Uint8Array> {
  const candidatePaths = ['templates/rpoject5.stknds', 'public/templates/rpoject5.stknds', 'templates/project6.stknds'];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      const compressed = fs.readFileSync(p);
      const ab = compressed.buffer.slice(compressed.byteOffset, compressed.byteOffset + compressed.byteLength);
      const inspection = await inspectStkndsBuffer(path.basename(p), ab);
      if (inspection.rawDecompressed) {
        return inspection.rawDecompressed;
      }
    }
  }
  throw new Error('Base template for procedural generation not found in templates/ or public/templates/');
}

export async function runSelfImprovementLoop(
  initialSkills: LivingSkill[],
  outputDir: string = 'benchmarks'
): Promise<SelfImprovementResult> {
  const raw27 = await getBaseDecompressed27();

  // 1. Initial Test Generation with Baseline Parameters
  const initialConfig: PhantomShadowboxGeneratorConfig = {
    projectName: 'Self_Improvement_Test',
    targetFps: 24,
    interpolate24FpsFrames: true,
    primaryColorHex: '#1d1d1f',
    headColorHex: '#ffffff',
    stillnessHoldFrames: 2,
    crouchHoldFrames: 2,
    jabExtensionSnap: 1,
  };

  const initialStkndsBytes = await synthesizePhantomShadowboxStknds(raw27, initialConfig);
  const initialInspection = await inspectStkndsBuffer(
    'Self_Improvement_Test.stknds',
    initialStkndsBytes.buffer
  );

  const initialForensics = analyzeProjectMotionForensics(initialInspection);
  const initialReport = evaluateAnimationQuality('Self_Improvement_Initial', initialForensics);
  saveQualityReport(initialReport, outputDir);

  // 2. Propose Parameter Improvements based on Quality Report Diagnostics
  const adjustedConfig: PhantomShadowboxGeneratorConfig = { ...initialConfig };
  const appliedAdjustments: Record<string, number | string | boolean> = {};

  if (initialReport.suggestedParameterTweaks.crouchHoldFrames !== undefined) {
    adjustedConfig.crouchHoldFrames = Number(initialReport.suggestedParameterTweaks.crouchHoldFrames);
    appliedAdjustments.crouchHoldFrames = adjustedConfig.crouchHoldFrames;
  } else {
    adjustedConfig.crouchHoldFrames = 3; // Increase crouch hold anticipation
    appliedAdjustments.crouchHoldFrames = 3;
  }

  adjustedConfig.jabExtensionSnap = 2;
  appliedAdjustments.jabExtensionSnap = 2;

  // 3. Generate Improved Test Animation
  const improvedStkndsBytes = await synthesizePhantomShadowboxStknds(raw27, adjustedConfig);
  const improvedInspection = await inspectStkndsBuffer(
    'Self_Improvement_Improved.stknds',
    improvedStkndsBytes.buffer
  );

  const improvedForensics = analyzeProjectMotionForensics(improvedInspection);
  const finalReport = evaluateAnimationQuality('Self_Improvement_Final', improvedForensics);
  saveQualityReport(finalReport, outputDir);

  // 4. Evolve Skills based on Audit Feedback
  const evolvedSkills: LivingSkill[] = initialSkills.map((skill) => {
    return evolveLivingSkill(
      skill,
      appliedAdjustments,
      finalReport.overallScore,
      `Automated self-improvement iteration for ${finalReport.targetAnimationName}`
    );
  });

  saveLivingSkillsCatalog(evolvedSkills);

  const scoreImprovement = finalReport.overallScore - initialReport.overallScore;

  const resultSummary = {
    timestamp: new Date().toISOString(),
    initialScore: initialReport.overallScore,
    finalScore: finalReport.overallScore,
    scoreImprovement,
    appliedAdjustments,
    evolvedSkillsCount: evolvedSkills.length,
  };

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(outputDir, 'self_improvement_summary.json'),
    JSON.stringify(resultSummary, null, 2),
    'utf-8'
  );

  return {
    initialReport,
    finalReport,
    scoreImprovement,
    evolvedSkills,
    appliedParameterAdjustments: appliedAdjustments,
  };
}
