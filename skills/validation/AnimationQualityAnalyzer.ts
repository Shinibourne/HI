/**
 * Skill-Agnostic Animation Quality Analyzer.
 * Generates machine-readable audit reports across Structural, Kinematic, Biomechanical, Contact, and Visual domains.
 */

import { STICKFIGURE_BONE_LENGTHS, STICKFIGURE_PARENTS } from '../../src/lib/stkndsCodec';
import { solveForwardKinematics17, JointWorldPose } from '../ik/kinematicsSolvers';
import { enforceAnatomicalConstraints17 } from '../skeleton/AnatomicalConstraints';
import { calculateCenterOfMass17 } from '../physics/MassMomentumSecondaryPhysics';

export interface FramePose {
  frameIndex: number;
  pelvisX: number;
  pelvisY: number;
  worldAnglesDeg: number[]; // 17 angles
  isRightFacing?: boolean;
}

export interface DomainAuditResult {
  domain: 'structural' | 'kinematic' | 'biomechanical' | 'contacts' | 'visual';
  score: number; // 0 - 100
  passed: boolean;
  issues: string[];
  metrics: Record<string, number>;
}

export interface AnimationQualityReport {
  overallScore: number;
  passed: boolean;
  totalFrames: number;
  domainResults: Record<string, DomainAuditResult>;
  summary: string;
}

export class AnimationQualityAnalyzer {
  /**
   * Analyzes an entire animation frame sequence.
   */
  public analyzeAnimation(
    frames: FramePose[],
    groundY = 755.0,
    isRightFacing = true
  ): AnimationQualityReport {
    if (frames.length === 0) {
      return {
        overallScore: 0,
        passed: false,
        totalFrames: 0,
        domainResults: {},
        summary: 'Empty animation frames array provided.',
      };
    }

    const structural = this.auditStructuralDomain(frames, isRightFacing);
    const kinematic = this.auditKinematicDomain(frames);
    const biomechanical = this.auditBiomechanicalDomain(frames, isRightFacing);
    const contacts = this.auditContactDomain(frames, groundY);
    const visual = this.auditVisualDomain(frames);

    const domainResults = { structural, kinematic, biomechanical, contacts, visual };

    const scores = Object.values(domainResults).map((d) => d.score);
    const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const allPassed = Object.values(domainResults).every((d) => d.passed);

    return {
      overallScore: avgScore,
      passed: allPassed && avgScore >= 85,
      totalFrames: frames.length,
      domainResults,
      summary: `Audit complete. Score: ${avgScore.toFixed(1)}/100. Status: ${allPassed ? 'PASS' : 'NEEDS_CORRECTION'}.`,
    };
  }

  private auditStructuralDomain(frames: FramePose[], isRightFacing: boolean): DomainAuditResult {
    const issues: string[] = [];
    let hingeViolations = 0;

    for (const f of frames) {
      const res = enforceAnatomicalConstraints17(f.worldAnglesDeg, STICKFIGURE_PARENTS, isRightFacing);
      if (res.violationsCount > 0) {
        hingeViolations += res.violationsCount;
        issues.push(`Frame ${f.frameIndex}: ${res.violationsCount} joint limit violations.`);
      }
    }

    const score = Math.max(0, 100 - hingeViolations * 5);
    return {
      domain: 'structural',
      score,
      passed: hingeViolations === 0,
      issues,
      metrics: { totalHingeViolations: hingeViolations },
    };
  }

  private auditKinematicDomain(frames: FramePose[]): DomainAuditResult {
    const issues: string[] = [];
    let maxAngleJump = 0;
    let maxVelJump = 0;

    for (let i = 1; i < frames.length; i++) {
      const prev = frames[i - 1];
      const cur = frames[i];

      const dx = cur.pelvisX - prev.pelvisX;
      const dy = cur.pelvisY - prev.pelvisY;
      const rootStep = Math.hypot(dx, dy);

      if (rootStep > 45.0) {
        issues.push(`Frame ${cur.frameIndex}: Large root displacement step of ${rootStep.toFixed(1)}px/f.`);
      }

      for (let j = 0; j < 17; j++) {
        let delta = Math.abs(cur.worldAnglesDeg[j] - prev.worldAnglesDeg[j]) % 360;
        if (delta > 180) delta = 360 - delta;
        if (delta > maxAngleJump) maxAngleJump = delta;

        if (delta > 65.0) {
          issues.push(`Frame ${cur.frameIndex}, Joint ${j}: Angle jump of ${delta.toFixed(1)}°/f.`);
        }
      }
    }

    const score = Math.max(0, 100 - maxAngleJump * 0.8);
    return {
      domain: 'kinematic',
      score,
      passed: maxAngleJump <= 65.0,
      issues,
      metrics: { maxAngleJumpDeg: maxAngleJump },
    };
  }

  private auditBiomechanicalDomain(frames: FramePose[], isRightFacing: boolean): DomainAuditResult {
    const issues: string[] = [];
    let maxComOffset = 0;

    for (const f of frames) {
      const com = calculateCenterOfMass17(f.pelvisX, f.pelvisY, f.worldAnglesDeg);
      const offset = Math.abs(com.comX - f.pelvisX);
      if (offset > maxComOffset) maxComOffset = offset;

      if (offset > 40.0) {
        issues.push(`Frame ${f.frameIndex}: Large Center of Mass offset ${offset.toFixed(1)}px from Pelvis X.`);
      }
    }

    const score = Math.max(0, 100 - maxComOffset * 1.2);
    return {
      domain: 'biomechanical',
      score,
      passed: maxComOffset <= 40.0,
      issues,
      metrics: { maxComOffsetPx: maxComOffset },
    };
  }

  private auditContactDomain(frames: FramePose[], groundY: number): DomainAuditResult {
    const issues: string[] = [];
    let maxGroundPenetration = 0;

    for (const f of frames) {
      const poses: JointWorldPose[] = solveForwardKinematics17(f.pelvisX, f.pelvisY, f.worldAnglesDeg);
      // Check foot ankles (Nodes 3 & 6)
      for (const footIdx of [3, 6]) {
        const footPose = poses[footIdx];
        if (footPose.endY > groundY + 1.0) {
          const pen = footPose.endY - groundY;
          if (pen > maxGroundPenetration) maxGroundPenetration = pen;
          issues.push(`Frame ${f.frameIndex}: Foot joint ${footIdx} penetrates ground by ${pen.toFixed(1)}px.`);
        }
      }
    }

    const score = Math.max(0, 100 - maxGroundPenetration * 10);
    return {
      domain: 'contacts',
      score,
      passed: maxGroundPenetration <= 1.5,
      issues,
      metrics: { maxGroundPenetrationPx: maxGroundPenetration },
    };
  }

  private auditVisualDomain(frames: FramePose[]): DomainAuditResult {
    const issues: string[] = [];
    let staticFreezeCount = 0;
    let consecutiveStatic = 0;

    for (let i = 1; i < frames.length; i++) {
      const prev = frames[i - 1];
      const cur = frames[i];

      let isIdentical = Math.hypot(cur.pelvisX - prev.pelvisX, cur.pelvisY - prev.pelvisY) < 0.01;
      if (isIdentical) {
        for (let j = 0; j < 17; j++) {
          if (Math.abs(cur.worldAnglesDeg[j] - prev.worldAnglesDeg[j]) > 0.01) {
            isIdentical = false;
            break;
          }
        }
      }

      if (isIdentical) {
        consecutiveStatic++;
        if (consecutiveStatic > 6) {
          staticFreezeCount++;
          issues.push(`Frame ${cur.frameIndex}: Static freeze > 6 consecutive frames.`);
        }
      } else {
        consecutiveStatic = 0;
      }
    }

    const score = Math.max(0, 100 - staticFreezeCount * 15);
    return {
      domain: 'visual',
      score,
      passed: staticFreezeCount === 0,
      issues,
      metrics: { staticFreezeViolations: staticFreezeCount },
    };
  }
}
