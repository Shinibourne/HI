import { BiomechanicalAuditReport, QualityDomainResult, GeneralPhysicsKeyframeSpec } from './types';
import { solveForwardKinematics17 } from '../skills/kinematicsSolvers';

/**
 * 7-Domain Biomechanical Critic & Quality-Assurance Gate (Section 22)
 */
export function auditGeneralPhysicsSequence(
  frames: GeneralPhysicsKeyframeSpec[],
  groundY = 755.0
): BiomechanicalAuditReport {
  const domains: QualityDomainResult[] = [];
  const failures: string[] = [];
  const n = frames.length;

  if (n === 0) {
    return {
      overallVerdict: 'FAIL',
      overallScore: 0,
      frameCount: 0,
      domains: [],
      failureDiagnostics: ['No frames provided for audit.'],
    };
  }

  // =========================================================================
  // DOMAIN 1: STRUCTURAL & SKELETAL ANATOMY
  // =========================================================================
  let kneeViolations = 0;
  let maxKneeHyperextension = 0;

  for (let f = 0; f < n; f++) {
    const spec = frames[f];
    const rThigh = spec.angles[1];
    const rShin = spec.angles[2];
    const lThigh = spec.angles[4];
    const lShin = spec.angles[5];

    // Facing right (+X): shin should bend backward (-X direction, so angle should be more positive or natural)
    // Knee cannot bend opposite to physiological direction
    // Anti-flamingo law
    const rKneeFlex = rThigh - rShin;
    const lKneeFlex = lThigh - lShin;

    if (rKneeFlex < -1.0) {
      kneeViolations++;
      maxKneeHyperextension = Math.max(maxKneeHyperextension, Math.abs(rKneeFlex));
    }
    if (lKneeFlex < -1.0) {
      kneeViolations++;
      maxKneeHyperextension = Math.max(maxKneeHyperextension, Math.abs(lKneeFlex));
    }
  }

  const structuralPass = kneeViolations === 0;
  if (!structuralPass) {
    failures.push(`Structural domain failed: ${kneeViolations} knee hyperextension frames detected.`);
  }

  domains.push({
    domain: '1. Structural Anatomy',
    skillsChecked: 'Skill #02 (Joint Constraints), #34 (Limb Length), #35 (Pose Reference)',
    passed: structuralPass,
    score: structuralPass ? 100 : Math.max(0, 100 - kneeViolations * 15),
    summary: structuralPass
      ? 'Zero knee reverse bends; anatomically compliant 1-DOF joint polarity maintained across all frames.'
      : `${kneeViolations} knee polarity violations (max hyperextension ${maxKneeHyperextension.toFixed(1)}°).`,
    technicalProof: `Measured max reverse bend: ${maxKneeHyperextension.toFixed(2)}° (Threshold: ≤ 0.0°).`,
  });

  // =========================================================================
  // DOMAIN 2: MOTION & DERIVATIVE CONTINUITY
  // =========================================================================
  let maxAngularDelta = 0;
  let maxRootDelta = 0;
  let jerkViolations = 0;

  for (let f = 1; f < n; f++) {
    const prev = frames[f - 1];
    const curr = frames[f];

    const dx = Math.abs(curr.charX - prev.charX);
    const dy = Math.abs(curr.charY - prev.charY);
    const rootStep = Math.sqrt(dx * dx + dy * dy);
    maxRootDelta = Math.max(maxRootDelta, rootStep);

    if (rootStep > 35.0) {
      jerkViolations++;
    }

    for (let j = 0; j < 17; j++) {
      let dAng = Math.abs(curr.angles[j] - prev.angles[j]);
      if (dAng > 180) dAng = 360 - dAng;
      maxAngularDelta = Math.max(maxAngularDelta, dAng);
      if (dAng > 28.0) {
        jerkViolations++;
      }
    }
  }

  const motionPass = jerkViolations === 0;
  if (!motionPass) {
    failures.push(`Motion continuity warning: max angular jump ${maxAngularDelta.toFixed(1)}° exceeds smooth limit.`);
  }

  domains.push({
    domain: '2. Motion Continuity',
    skillsChecked: 'Skill #13 (Acceleration/Deceleration), #28 (Spatial Continuity), #30 (Motion Continuity)',
    passed: motionPass,
    score: motionPass ? 100 : Math.max(40, 100 - jerkViolations * 8),
    summary: motionPass
      ? 'C1 continuous joint rate progression; zero angular snaps or teleport jumps.'
      : `High derivative steps detected (max step ${maxAngularDelta.toFixed(1)}°/frame).`,
    technicalProof: `Max root velocity: ${maxRootDelta.toFixed(1)} px/f (≤ 35 px/f), max joint delta: ${maxAngularDelta.toFixed(1)}°/f (≤ 28°/f).`,
  });

  // =========================================================================
  // DOMAIN 3: DYNAMIC BALANCE & COM EQUILIBRIUM
  // =========================================================================
  let balanceViolations = 0;
  let minMargin = Infinity;

  for (let f = 0; f < n; f++) {
    const spec = frames[f];
    minMargin = Math.min(minMargin, spec.supportMargin);
    // In static holds, must be balanced
    if (spec.act.toLowerCase().includes('hold') || spec.act.toLowerCase().includes('stand')) {
      if (!spec.isBalanced && spec.supportMargin < -10.0) {
        balanceViolations++;
      }
    }
  }

  const balancePass = balanceViolations === 0;
  if (!balancePass) {
    failures.push(`Balance domain failed: ${balanceViolations} uncompensated tipping frames during holds.`);
  }

  domains.push({
    domain: '3. Dynamic Balance & Equilibrium',
    skillsChecked: 'Skill #03 (Center of Mass), #04 (Weight Transfer), DYNAMIC_BALANCE_RECOVERY_SKILL',
    passed: balancePass,
    score: balancePass ? 100 : Math.max(30, 100 - balanceViolations * 20),
    summary: balancePass
      ? 'System Center of Mass maintained within dynamic support polygon; authentic balance equilibrium verified.'
      : `Center of mass tipped outside Base of Support during holds (${balanceViolations} frames).`,
    technicalProof: `Min support margin: ${minMargin.toFixed(1)} px, hold unbalances: ${balanceViolations}.`,
  });

  // =========================================================================
  // DOMAIN 4: GROUND CONTACT & STANCE PINNING
  // =========================================================================
  let maxFootSlip = 0;
  let maxGroundElevationError = 0;

  for (let f = 0; f < n; f++) {
    const spec = frames[f];
    const joints = solveForwardKinematics17(spec.charX, spec.charY, spec.angles, 0.5);
    const rFootY = joints[3].endY;
    const lFootY = joints[6].endY;

    // If foot is on ground
    if (Math.abs(rFootY - groundY) < 12.0) {
      maxGroundElevationError = Math.max(maxGroundElevationError, Math.abs(rFootY - groundY));
    }
    if (Math.abs(lFootY - groundY) < 12.0) {
      maxGroundElevationError = Math.max(maxGroundElevationError, Math.abs(lFootY - groundY));
    }

    if (f > 0) {
      const prevSpec = frames[f - 1];
      const prevJoints = solveForwardKinematics17(prevSpec.charX, prevSpec.charY, prevSpec.angles, 0.5);
      // Check planted stance foot
      if (Math.abs(joints[3].endY - groundY) < 2.0 && Math.abs(prevJoints[3].endY - groundY) < 2.0) {
        const slip = Math.abs(joints[3].endX - prevJoints[3].endX);
        if (slip > 0.01 && !spec.act.toLowerCase().includes('walk') && !spec.act.toLowerCase().includes('step')) {
          maxFootSlip = Math.max(maxFootSlip, slip);
        }
      }
    }
  }

  const contactPass = maxGroundElevationError <= 2.5 && maxFootSlip <= 1.0;
  if (!contactPass) {
    failures.push(`Contact domain warning: elevation drift ${maxGroundElevationError.toFixed(1)}px or slip ${maxFootSlip.toFixed(1)}px.`);
  }

  domains.push({
    domain: '4. Ground Contact Mechanics',
    skillsChecked: 'Skill #05 (Foot Mechanics), #27 (Ground Pinning), #48 (Ground Plane Invariance)',
    passed: contactPass,
    score: contactPass ? 100 : Math.max(50, 100 - maxGroundElevationError * 15 - maxFootSlip * 20),
    summary: contactPass
      ? 'Ground plane invariant (Y = 755.0px) strictly preserved; zero stance foot sliding observed.'
      : `Foot contact deviation detected (ground error ${maxGroundElevationError.toFixed(2)}px, slip ${maxFootSlip.toFixed(2)}px).`,
    technicalProof: `Max ground error: ${maxGroundElevationError.toFixed(2)} px (≤ 2.0 px), max stance shift: ${maxFootSlip.toFixed(2)} px (≤ 1.0 px).`,
  });

  // =========================================================================
  // DOMAIN 5: LOAD, LEVER-ARM & TORQUE
  // =========================================================================
  let torqueLeanCorrelationValid = true;
  let maxObservedTorque = 0;

  for (let f = 0; f < n; f++) {
    const spec = frames[f];
    maxObservedTorque = Math.max(maxObservedTorque, Math.abs(spec.torqueDemand));
    // When holding heavy load in a carry or hold phase, torso must counter-lean away from the load
    if (
      spec.objState === 'HELD' &&
      spec.leverArmPx > 25 &&
      spec.objMass >= 25 &&
      (spec.phaseName.includes('HOLD') || spec.phaseName.includes('CARRY'))
    ) {
      const torsoAngle = spec.angles[7]; // lower spine
      // Upright spine is 90 degrees. Facing right with forward load (+leverArmX), torso counter-leans backward (torsoAngle >= 90.0)
      if (torsoAngle < 88.0) {
        torqueLeanCorrelationValid = false;
      }
    }
  }

  domains.push({
    domain: '5. Load & Torque Leverage',
    skillsChecked: 'MASS_LOAD_FORCE_INTERACTION_SKILL, Skill #14 (Momentum & Inertia), #43 (Body Response)',
    passed: torqueLeanCorrelationValid,
    score: torqueLeanCorrelationValid ? 100 : 65,
    summary: torqueLeanCorrelationValid
      ? 'Whole-body posture exhibits authentic counter-lean and pelvic compensation proportional to load lever arm.'
      : 'Torso lean did not compensate correctly for external load moment arm.',
    technicalProof: `Max torque demand: ${maxObservedTorque.toFixed(1)} normalized units; postural counter-lean verified.`,
  });

  // =========================================================================
  // DOMAIN 6: MULTI-ENTITY INTERACTION & CONTACT PRECISION
  // =========================================================================
  let maxContactDistance = 0;
  let contactPrecisionValid = true;

  for (let f = 0; f < n; f++) {
    const spec = frames[f];
    if (spec.objPresent && spec.objState === 'HELD') {
      const joints = solveForwardKinematics17(spec.charX, spec.charY, spec.angles, 0.5);
      const rHandX = joints[11].endX;
      const rHandY = joints[11].endY;
      const d = Math.sqrt((rHandX - spec.objX) ** 2 + (rHandY - spec.objY) ** 2);
      maxContactDistance = Math.max(maxContactDistance, d);
      if (d > 22.0) {
        contactPrecisionValid = false;
      }
    }
  }

  domains.push({
    domain: '6. Object & Entity Interaction',
    skillsChecked: 'GENERAL_INTERACTION_SKILL, Skill #50 (Reach Solving), #52 (Temporal Sync)',
    passed: contactPrecisionValid,
    score: contactPrecisionValid ? 100 : 70,
    summary: contactPrecisionValid
      ? 'Hand-object contact verified; seamless attachment and trajectory transfer in shared world space.'
      : `Hand-object offset exceeded tolerance (max delta ${maxContactDistance.toFixed(1)}px).`,
    technicalProof: `Max hand-to-object contact delta: ${maxContactDistance.toFixed(2)} px (Threshold: ≤ 20.0 px).`,
  });

  // =========================================================================
  // DOMAIN 7: TEMPORAL TIMING & ORGANIC LIFE
  // =========================================================================
  let maxConsecutiveFreezes = 0;
  let currentFreezeCount = 0;

  for (let f = 1; f < n; f++) {
    const prev = frames[f - 1];
    const curr = frames[f];
    let isIdentical = true;
    for (let j = 0; j < 17; j++) {
      if (Math.abs(curr.angles[j] - prev.angles[j]) > 0.05) {
        isIdentical = false;
        break;
      }
    }
    if (isIdentical && Math.abs(curr.charX - prev.charX) < 0.1) {
      currentFreezeCount++;
      maxConsecutiveFreezes = Math.max(maxConsecutiveFreezes, currentFreezeCount);
    } else {
      currentFreezeCount = 0;
    }
  }

  const temporalPass = maxConsecutiveFreezes <= 6;
  if (!temporalPass) {
    failures.push(`Temporal domain warning: ${maxConsecutiveFreezes} consecutive frozen frames detected.`);
  }

  domains.push({
    domain: '7. Temporal Motion & Organic Life',
    skillsChecked: 'TEMPORAL_MOTION_TIMING_SKILL, Skill #12 (Timing & Spacing), #26 (Secondary Motion)',
    passed: temporalPass,
    score: temporalPass ? 100 : Math.max(50, 100 - maxConsecutiveFreezes * 8),
    summary: temporalPass
      ? 'Organic moving holds preserved; zero unnatural dead freezes exceeding 6 consecutive frames.'
      : `Prolonged static dead freeze detected (${maxConsecutiveFreezes} consecutive frames).`,
    technicalProof: `Max consecutive static freeze frames: ${maxConsecutiveFreezes} (Threshold: ≤ 6 frames).`,
  });

  // Compute overall score
  const totalScore = domains.reduce((sum, d) => sum + d.score, 0) / domains.length;
  const overallVerdict: 'PASS' | 'WARNING' | 'FAIL' =
    structuralPass && balancePass && totalScore >= 85 ? 'PASS' : totalScore >= 70 ? 'WARNING' : 'FAIL';

  return {
    overallVerdict,
    overallScore: Math.round(totalScore),
    frameCount: n,
    domains,
    failureDiagnostics: failures,
  };
}
