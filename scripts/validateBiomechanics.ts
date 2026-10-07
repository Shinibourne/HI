import { STICKFIGURE_PARENTS, STICKFIGURE_BONE_LENGTHS } from '../src/lib/stkndsCodec';
import { SpeedVsStrengthKeyframeSpec } from '../src/lib/speedVsStrengthFrames';

export interface JointPoint {
  x: number;
  y: number;
  angle: number;
}

export function computeFK(sceneX: number, sceneY: number, angles: number[]): JointPoint[] {
  const pts: JointPoint[] = [];
  for (let i = 0; i < 17; i++) {
    const p = STICKFIGURE_PARENTS[i];
    const len = STICKFIGURE_BONE_LENGTHS[i] * 0.5;
    const a = angles[i];
    if (p === -1) {
      pts.push({ x: sceneX, y: sceneY, angle: a });
    } else {
      const rad = (a * Math.PI) / 180;
      pts.push({
        x: pts[p].x + Math.cos(rad) * len,
        y: pts[p].y - Math.sin(rad) * len,
        angle: a,
      });
    }
  }
  return pts;
}

export interface LegValidationResult {
  valid: boolean;
  kneeAngleDeg: number; // interior angle at knee
  kneeDirection: 'forward' | 'backward';
  isHyperextended: boolean;
  error?: string;
}

/**
 * Validates a human leg joint.
 * In humans, knee flexion is 0° (fully straight) to ~145° (fully flexed).
 * The knee CANNOT hyperextend past 0° (thigh and shin bending in opposite direction).
 * @param facingRight whether character faces right (+X) or left (-X)
 */
export function validateHumanLeg(
  hip: JointPoint,
  thigh: JointPoint, // contains thigh angle and knee pos
  shin: JointPoint,  // contains shin angle and ankle pos
  facingRight: boolean
): LegValidationResult {
  const kneeX = thigh.x;
  const kneeY = thigh.y;
  const ankleX = shin.x;
  const ankleY = shin.y;

  // Vector hip -> knee
  const v1x = kneeX - hip.x;
  const v1y = kneeY - hip.y;
  // Vector knee -> ankle
  const v2x = ankleX - kneeX;
  const v2y = ankleY - kneeY;

  const len1 = Math.hypot(v1x, v1y);
  const len2 = Math.hypot(v2x, v2y);

  // Dot product
  const dot = (v1x * v2x + v1y * v2y) / (len1 * len2);
  const clampedDot = Math.max(-1, Math.min(1, dot));
  // Bend angle (0° = straight leg, 90° = right angle bend)
  const bendAngleDeg = Math.acos(clampedDot) * (180 / Math.PI);

  // 2D cross product: v1x * v2y - v1y * v2x
  // In screen space (Y down):
  // When facing RIGHT:
  // Thigh goes down-right (+X, +Y). Knee points right (+X).
  // Shin bends backward (-X, +Y).
  // cross product v1x*v2y - v1y*v2x:
  // e.g. v1=(100, 78), v2=(-20, 120) => 100*120 - 78*(-20) = 12000 + 1560 > 0.
  // Positive cross means natural backward knee bend!
  // Negative cross means unnatural forward knee bend (hyperextension / flamingo)!
  //
  // When facing LEFT:
  // Thigh goes down-left (-X, +Y). Knee points left (-X).
  // Shin bends backward (+X, +Y).
  // e.g. v1=(-100, 78), v2=(20, 120) => -100*120 - 78*(20) = -12000 - 1560 < 0.
  // Negative cross means natural backward knee bend!
  // Positive cross means unnatural forward knee bend (hyperextension / flamingo)!

  const cross = v1x * v2y - v1y * v2x;
  let isHyperextended = false;

  if (facingRight) {
    if (cross < -200 && bendAngleDeg > 5) {
      isHyperextended = true;
    }
  } else {
    if (cross > 200 && bendAngleDeg > 5) {
      isHyperextended = true;
    }
  }

  return {
    valid: !isHyperextended && bendAngleDeg <= 150,
    kneeAngleDeg: bendAngleDeg,
    kneeDirection: (facingRight ? cross > 0 : cross < 0) ? 'forward' : 'backward',
    isHyperextended,
    error: isHyperextended
      ? `Hyperextended knee! Cross=${cross.toFixed(0)}, bend=${bendAngleDeg.toFixed(1)}°`
      : undefined,
  };
}

import {
  buildCanonicalSitWalkKickFrames,
  validateSitWalkKickBiomechanics,
} from '../src/lib/sitWalkKickBallFrames';
import {
  buildCanonicalBasketballFrames,
  validateBasketballBiomechanics,
} from '../src/lib/basketballChoreographyFrames';

export function runBasketballAudit(): boolean {
  console.log('\n================================================================');
  console.log('RUNNING BASKETBALL 24-FRAME MASTER BIOMECHANICS & PHYSICS AUDIT');
  console.log('================================================================\n');

  const frames = buildCanonicalBasketballFrames();
  const audit = validateBasketballBiomechanics(frames);

  console.log('\n--- 20-RULE VALIDATION SUITE METRICS & MEASURED VALUES ---');
  for (const item of audit.items) {
    const icon = item.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`[${icon}] #${item.ruleNumber} ${item.label}`);
    console.log(`       Measured: ${item.metric} | Required: ${item.threshold}`);
    if (!item.passed) {
      console.error(`       FAILED CHECK: ${item.id} - ${item.detail}`);
    }
  }

  console.log(`\nOverall Basketball Result: ${audit.passedChecks}/${audit.totalChecks} checks passed.`);
  if (!audit.passed) {
    console.error('FATAL: Basketball biomechanical validation failed!');
    return false;
  }
  return true;
}

export function runSitWalkKickAudit(): boolean {
  console.log('\n========================================');
  console.log('RUNNING MAN GET UP WALK AND KICK BIOMECHANICS AUDIT');
  console.log('========================================\n');

  const frames = buildCanonicalSitWalkKickFrames();
  const audit = validateSitWalkKickBiomechanics(frames);

  console.log('\n--- AUDIT ITEM METRICS & MEASURED VALUES ---');
  for (const item of audit.items) {
    const icon = item.passed ? '✓' : '✗';
    console.log(`[${icon}] ${item.label}: ${item.metric} (Threshold: ${item.threshold})`);
    if (!item.passed) {
      console.error(`FAILED CHECK: ${item.id} - ${item.detail}`);
    }
  }

  console.log(`\nOverall Result: ${audit.passedChecks}/${audit.totalChecks} checks passed.`);
  if (!audit.passed) {
    console.error('FATAL: Biomechanical validation failed!');
    return false;
  }
  return true;
}

// Run audit if invoked directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const basketballSuccess = runBasketballAudit();
  const sitWalkSuccess = runSitWalkKickAudit();
  if (!basketballSuccess || !sitWalkSuccess) {
    process.exit(1);
  }
}

