import fs from 'fs';
import path from 'path';
import { FrameMotionForensics, QualityReport, CategoryAuditScore } from './types';

export function evaluateAnimationQuality(
  targetName: string,
  forensics: FrameMotionForensics[]
): QualityReport {
  const categoryScores: CategoryAuditScore[] = [];
  const primaryIssues: string[] = [];
  const recommendedSkillsToApply: string[] = [];
  const suggestedParameterTweaks: Record<string, number | string> = {};

  if (!forensics || forensics.length === 0) {
    return {
      id: `report_${Date.now().toString(36)}`,
      targetAnimationName: targetName,
      overallScore: 0,
      categoryScores: [],
      primaryIssues: ['No forensics frames available for evaluation'],
      recommendedSkillsToApply: ['skill_living_tech_ground_balance_shift'],
      suggestedParameterTweaks: {},
      createdAt: new Date().toISOString(),
    };
  }

  // 1. Foot Contact Quality
  let footSlips = 0;
  let totalPlanted = 0;
  for (const f of forensics) {
    const fig = f.figureInstances[0];
    if (!fig) continue;
    const planted = fig.supportState.plantedFeetIndices;
    if (planted.length > 0) {
      totalPlanted++;
      for (const idx of planted) {
        if ((fig.nodes[idx]?.speed ?? 0) > 30) footSlips++;
      }
    }
  }
  const footContactScore = totalPlanted > 0
    ? Math.max(0, Math.min(100, Math.round(100 - (footSlips / totalPlanted) * 100)))
    : 85;

  categoryScores.push({
    category: 'footContact',
    score: footContactScore,
    weight: 0.15,
    issues: footContactScore < 80 ? ['Foot slipping detected during stance phase'] : [],
    strengths: footContactScore >= 80 ? ['Planted foot stability well-maintained'] : [],
  });
  if (footContactScore < 80) {
    primaryIssues.push('Planted foot slipping on ground plane during stance');
    recommendedSkillsToApply.push('skill_living_tech_ground_balance_shift');
    suggestedParameterTweaks.plantedFootMaxSpeed = 25;
  }

  // 2. Balance Quality
  let unstableFrames = 0;
  for (const f of forensics) {
    const fig = f.figureInstances[0];
    if (fig && fig.supportState.comMarginOfStability > 120 && fig.supportState.supportType !== 'airborne') {
      unstableFrames++;
    }
  }
  const balanceScore = Math.max(0, Math.min(100, Math.round(100 - (unstableFrames / forensics.length) * 100)));

  categoryScores.push({
    category: 'balance',
    score: balanceScore,
    weight: 0.15,
    issues: balanceScore < 80 ? ['Center of mass offset too far outside support base'] : [],
    strengths: balanceScore >= 80 ? ['Center of mass properly counter-balanced'] : [],
  });
  if (balanceScore < 80) {
    primaryIssues.push('Character center of mass ungrounded without counter-balance lean');
    recommendedSkillsToApply.push('skill_living_tech_ground_balance_shift');
    suggestedParameterTweaks.comMarginThreshold = 40;
  }

  // 3. Timing Quality
  let uniformFrames = 0;
  for (let i = 1; i < forensics.length; i++) {
    const s1 = forensics[i].figureInstances[0]?.centerOfMass.speed ?? 0;
    const s0 = forensics[i - 1].figureInstances[0]?.centerOfMass.speed ?? 0;
    if (Math.abs(s1 - s0) < 0.5 && s1 > 50) uniformFrames++;
  }
  const timingScore = Math.max(0, Math.min(100, Math.round(100 - (uniformFrames / forensics.length) * 100)));

  categoryScores.push({
    category: 'timing',
    score: timingScore,
    weight: 0.12,
    issues: timingScore < 80 ? ['Monotonous uniform frame spacing detected'] : [],
    strengths: timingScore >= 80 ? ['Dynamic non-linear timing and acceleration curves'] : [],
  });

  // 4. Weight Quality
  let compressionDetected = false;
  for (const f of forensics) {
    const fig = f.figureInstances[0];
    if (fig && fig.centerOfMass.acceleration.y < -300) {
      compressionDetected = true;
      break;
    }
  }
  const weightScore = compressionDetected ? 92 : 72;

  categoryScores.push({
    category: 'weight',
    score: weightScore,
    weight: 0.12,
    issues: !compressionDetected ? ['Insufficient downward pelvic compression on landing/contact'] : [],
    strengths: compressionDetected ? ['Impact compression communicates physical mass'] : [],
  });
  if (!compressionDetected) {
    primaryIssues.push('Weight absorption compression is weak on landings/contacts');
    recommendedSkillsToApply.push('skill_living_tech_impact_compression');
    suggestedParameterTweaks.compressionDampingFactor = 0.85;
  }

  // 5. Torso Mechanics Quality (Dynamic calculation from spine nodes 7 & 8)
  let spineViolations = 0;
  for (const f of forensics) {
    const fig = f.figureInstances[0];
    if (fig && fig.nodes.length === 17) {
      const lowerSpineA = fig.nodes[7]?.worldAngle ?? 0;
      const upperChestA = fig.nodes[8]?.worldAngle ?? 0;
      if (Math.abs(upperChestA - lowerSpineA) > 40) {
        spineViolations++;
      }
    }
  }
  const torsoScore = Math.max(0, Math.min(100, Math.round(100 - (spineViolations / forensics.length) * 100)));
  categoryScores.push({
    category: 'torsoMechanics',
    score: torsoScore,
    weight: 0.1,
    issues: torsoScore < 80 ? ['Spine inter-segment curvature delta exceeded 40 deg'] : [],
    strengths: torsoScore >= 80 ? ['Spine curvature well-distributed'] : [],
  });

  // 6. Arm Mechanics Quality (Dynamic calculation from elbow hinge limits)
  let elbowViolations = 0;
  for (const f of forensics) {
    const fig = f.figureInstances[0];
    if (fig && fig.nodes.length === 17) {
      const rForearmRel = fig.nodes[10]?.angleDelta ?? 0;
      const lForearmRel = fig.nodes[15]?.angleDelta ?? 0;
      if (rForearmRel < -10 || lForearmRel < -10) {
        elbowViolations++;
      }
    }
  }
  const armScore = Math.max(0, Math.min(100, Math.round(100 - (elbowViolations / forensics.length) * 100)));
  categoryScores.push({
    category: 'armMechanics',
    score: armScore,
    weight: 0.1,
    issues: armScore < 80 ? ['Elbow reverse hyperextension detected'] : [],
    strengths: armScore >= 80 ? ['Elbow hinge joint limits respected'] : [],
  });

  // 7. Head Behavior Quality (Dynamic variance of head world angle)
  let headAngles: number[] = [];
  for (const f of forensics) {
    const fig = f.figureInstances[0];
    if (fig && fig.nodes[13]) {
      headAngles.push(fig.nodes[13].worldAngle);
    }
  }
  const avgHeadA = headAngles.length > 0 ? headAngles.reduce((a, b) => a + b, 0) / headAngles.length : 0;
  const headVariance = headAngles.length > 0
    ? headAngles.reduce((acc, a) => acc + Math.pow(a - avgHeadA, 2), 0) / headAngles.length
    : 0;
  const headScore = Math.max(0, Math.min(100, Math.round(100 - Math.min(30, headVariance))));
  categoryScores.push({
    category: 'headBehavior',
    score: headScore,
    weight: 0.08,
    issues: headScore < 80 ? ['Head orientation unstable or bobbing excessively'] : [],
    strengths: headScore >= 80 ? ['Gaze orientation and head horizon stabilized'] : [],
  });

  // 8. Impact Quality (High-energy acceleration bursts)
  let maxImpactAccel = 0;
  for (const f of forensics) {
    const fig = f.figureInstances[0];
    if (fig) {
      for (const n of fig.nodes) {
        if (n.accelerationMagnitude > maxImpactAccel) maxImpactAccel = n.accelerationMagnitude;
      }
    }
  }
  const impactScore = maxImpactAccel > 1500 ? 94 : 75;
  categoryScores.push({
    category: 'impact',
    score: impactScore,
    weight: 0.08,
    issues: impactScore < 80 ? ['Impact acceleration energy below threshold'] : [],
    strengths: impactScore >= 80 ? ['High-energy impact force detected'] : [],
  });

  // 9. Secondary Motion Quality (Forearm vs bicep phase lag)
  let secondaryLagDetected = false;
  for (let i = 1; i < forensics.length; i++) {
    const curRForearmVel = forensics[i].figureInstances[0]?.nodes[10]?.angularVelocity ?? 0;
    const prevRBicepVel = forensics[i - 1].figureInstances[0]?.nodes[9]?.angularVelocity ?? 0;
    if (Math.sign(curRForearmVel) === Math.sign(prevRBicepVel) && Math.abs(curRForearmVel) > 10) {
      secondaryLagDetected = true;
      break;
    }
  }
  const secondaryMotionScore = secondaryLagDetected ? 88 : 74;
  categoryScores.push({
    category: 'secondaryMotion',
    score: secondaryMotionScore,
    weight: 0.05,
    issues: !secondaryLagDetected ? ['Secondary extremity follow-through phase lag is subtle'] : [],
    strengths: secondaryLagDetected ? ['Secondary follow-through and lag present'] : [],
  });

  // 10. Camera Quality (Shake magnitude correlation with motion)
  let cameraShakes = 0;
  for (const f of forensics) {
    if ((f.cameraState?.shakeMagnitude ?? 0) > 30) cameraShakes++;
  }
  const cameraScore = cameraShakes > 0 ? 95 : 82;
  categoryScores.push({
    category: 'camera',
    score: cameraScore,
    weight: 0.05,
    issues: [],
    strengths: ['Camera response calibrated'],
  });

  // Overall Weighted Score Computation
  let totalWeight = 0;
  let weightedSum = 0;
  for (const cs of categoryScores) {
    weightedSum += cs.score * cs.weight;
    totalWeight += cs.weight;
  }

  const overallScore = Math.round(weightedSum / totalWeight);

  return {
    id: `report_${Date.now().toString(36)}`,
    targetAnimationName: targetName,
    overallScore,
    categoryScores,
    primaryIssues,
    recommendedSkillsToApply,
    suggestedParameterTweaks,
    createdAt: new Date().toISOString(),
  };
}

export function saveQualityReport(
  report: QualityReport,
  outputDir: string = 'benchmarks'
): void {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const reportPath = path.join(outputDir, `quality_report_${report.targetAnimationName.replace(/[^a-zA-Z0-9]/g, '_')}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
}
