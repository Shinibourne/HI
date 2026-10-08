/**
 * Skill-Agnostic Multi-Pass Automated Correction Engine.
 * Executes the Generate → Analyze → Detect → Correct → Re-solve → Validate loop with kinetic chain propagation.
 */

import { AnimationQualityAnalyzer, AnimationQualityReport, FramePose } from '../validation/AnimationQualityAnalyzer';
import { enforceAnatomicalConstraints17 } from '../skeleton/AnatomicalConstraints';
import { STICKFIGURE_PARENTS } from '../../src/lib/stkndsCodec';
import { solveLegLimb } from '../ik/kinematicsSolvers';
import { solveForwardKinematics17 } from '../ik/kinematicsSolvers';

export interface CorrectionResult {
  correctedFrames: FramePose[];
  iterations: number;
  initialReport: AnimationQualityReport;
  finalReport: AnimationQualityReport;
  correctionsApplied: string[];
}

export class AutomatedCorrectionEngine {
  private analyzer = new AnimationQualityAnalyzer();

  /**
   * Executes multi-pass automated correction loop up to maxPasses.
   */
  public autoCorrectAnimation(
    frames: FramePose[],
    groundY = 755.0,
    isRightFacing = true,
    maxPasses = 5
  ): CorrectionResult {
    let currentFrames = frames.map((f) => ({ ...f, worldAnglesDeg: [...f.worldAnglesDeg] }));
    const initialReport = this.analyzer.analyzeAnimation(currentFrames, groundY, isRightFacing);
    let latestReport = initialReport;
    const allCorrections: string[] = [];

    let pass = 0;
    while (pass < maxPasses && !latestReport.passed) {
      pass++;
      const passCorrections: string[] = [];

      // Pass Step 1: Correct Ground Penetration & Foot Sliding via Kinetic Chain Solving
      currentFrames = currentFrames.map((f) => {
        const angles = [...f.worldAnglesDeg];
        let pelvisY = f.pelvisY;

        const FK = solveForwardKinematics17(f.pelvisX, pelvisY, angles);

        // Right Foot Ankle (Node 3) & Left Foot Ankle (Node 6)
        for (const [footIdx, thighIdx, shinIdx] of [[3, 1, 2], [6, 4, 5]]) {
          const footPose = FK[footIdx];
          if (footPose.endY > groundY) {
            const pen = footPose.endY - groundY;
            pelvisY -= pen * 0.5; // elevate pelvis to relieve ground penetration

            // Re-solve leg IK so foot sits exactly at groundY
            const targetFootX = footPose.startX;
            const targetFootY = groundY;

            const legIK = solveLegLimb(
              f.pelvisX,
              pelvisY,
              targetFootX,
              targetFootY,
              isRightFacing,
              0.5,
              true,
              groundY
            );

            angles[thighIdx] = legIK.thighAngleDeg;
            angles[shinIdx] = legIK.shinAngleDeg;
            angles[footIdx] = legIK.footAngleDeg;

            passCorrections.push(
              `Pass ${pass}, Frame ${f.frameIndex}: Foot ${footIdx} ground penetration of ${pen.toFixed(1)}px corrected via leg IK re-solve.`
            );
          }
        }

        // Pass Step 2: Anatomical Hinge Constraints Enforcement (0° reverse knees/elbows)
        const structRes = enforceAnatomicalConstraints17(angles, STICKFIGURE_PARENTS, isRightFacing);
        if (structRes.violationsCount > 0) {
          passCorrections.push(
            `Pass ${pass}, Frame ${f.frameIndex}: ${structRes.violationsCount} joint limits corrected.`
          );
        }

        return {
          ...f,
          pelvisY,
          worldAnglesDeg: structRes.constrainedAngles,
        };
      });

      // Pass Step 3: Shortest Path Angle Unwrapping to prevent ±180° Seam Flips
      for (let i = 1; i < currentFrames.length; i++) {
        const prev = currentFrames[i - 1];
        const cur = currentFrames[i];
        for (let j = 0; j < 17; j++) {
          let delta = cur.worldAnglesDeg[j] - prev.worldAnglesDeg[j];
          while (delta > 180) {
            cur.worldAnglesDeg[j] -= 360;
            delta = cur.worldAnglesDeg[j] - prev.worldAnglesDeg[j];
            passCorrections.push(`Pass ${pass}, Frame ${cur.frameIndex}, Joint ${j}: Seam flip unwrapped.`);
          }
          while (delta < -180) {
            cur.worldAnglesDeg[j] += 360;
            delta = cur.worldAnglesDeg[j] - prev.worldAnglesDeg[j];
            passCorrections.push(`Pass ${pass}, Frame ${cur.frameIndex}, Joint ${j}: Seam flip unwrapped.`);
          }
        }
      }

      allCorrections.push(...passCorrections);
      latestReport = this.analyzer.analyzeAnimation(currentFrames, groundY, isRightFacing);

      // If pass made no changes or score reached target, break early
      if (passCorrections.length === 0) break;
    }

    return {
      correctedFrames: currentFrames,
      iterations: pass,
      initialReport,
      finalReport: latestReport,
      correctionsApplied: allCorrections,
    };
  }
}
