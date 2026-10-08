/**
 * Comprehensive Validation Test Suite for Animation System Upgrade.
 * Tests IK/FK solvers, kinematic chains, CoM, contact state machine, correction pipeline,
 * SkillRegistry, and procedural generators.
 */

import { SkillRegistry, useSkill } from '../skills/core/SkillRegistry';
import '../skills/ik/KinematicsSkill';
import '../skills/physics/PhysicsSkill';
import '../skills/contacts/ContactSkill';
import '../skills/validation/ValidationSkill';
import '../skills/correction/CorrectionSkill';
import '../skills/locomotion/LocomotionSkills';
import '../skills/combat/CombatSkills';
import '../skills/acrobatics/AcrobaticsSkills';

import { solveTwoBoneIK } from '../skills/ik/kinematicsSolvers';
import { solveFabrik2D } from '../skills/ik/FabrikIK';
import { solveCcd2D } from '../skills/ik/CcdIK';
import { blendFkIkAngles } from '../skills/fk/ForwardKinematics';
import { enforceAnatomicalConstraints17 } from '../skills/skeleton/AnatomicalConstraints';
import { calculateCenterOfMass17 } from '../skills/physics/MassMomentumSecondaryPhysics';
import { propagateKineticImpulse } from '../skills/body_mechanics/KineticChainPropagation';
import { ContactSystem } from '../skills/contacts/ContactSystem';
import { AnimationQualityAnalyzer } from '../skills/validation/AnimationQualityAnalyzer';
import { AutomatedCorrectionEngine } from '../skills/correction/AutomatedCorrectionEngine';
import { generateProceduralLocomotion } from '../skills/locomotion/LocomotionSkills';
import { generateProceduralCombatStrike } from '../skills/combat/CombatSkills';
import { generateProceduralAcrobatics } from '../skills/acrobatics/AcrobaticsSkills';
import { STICKFIGURE_PARENTS } from '../src/lib/stkndsCodec';

function runTestSuite() {
  console.log('================================================================');
  console.log('RUNNING COMPREHENSIVE ANIMATION ENGINE & SKILLS TEST SUITE');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`[✓ PASS] #${totalTests} ${testName}`);
    } else {
      console.error(`[✗ FAIL] #${totalTests} ${testName}${detail ? ` - ${detail}` : ''}`);
    }
  }

  // 1. Analytical 2-Bone IK
  const ikRes = solveTwoBoneIK(500, 500, 500, 680, 255, 245, true, 'LEG', 0.5);
  assert(ikRes.reachable, 'Analytical 2-Bone IK reachability');
  assert(Math.abs(ikRes.endEffectorY - 680) < 1.5, 'Analytical 2-Bone IK precision', `Y=${ikRes.endEffectorY}`);

  // 2. FABRIK 2D Solver
  const fabRes = solveFabrik2D(
    [
      { x: 500, y: 500, length: 100 },
      { x: 500, y: 600, length: 100 },
      { x: 500, y: 700, length: 50 },
    ],
    550,
    720
  );
  assert(fabRes.reached, 'FABRIK 2D solver reachability');
  assert(fabRes.finalError < 1.0, 'FABRIK 2D solver final error', `Err=${fabRes.finalError.toFixed(2)}`);

  // 3. CCD 2D Solver
  const ccdRes = solveCcd2D(
    500,
    500,
    [
      { worldAngleDeg: 0, length: 100 },
      { worldAngleDeg: 0, length: 100 },
    ],
    550,
    650
  );
  assert(ccdRes.reached, 'CCD 2D solver reachability');

  // 4. FK / IK Blending
  const blended = blendFkIkAngles([0, 90], [10, 80], 0.5);
  assert(blended[0] === 5 && blended[1] === 85, 'FK/IK angle blending alpha=0.5');

  // 5. Anatomical Joint Limit Constraints
  const testAngles = new Array(17).fill(0);
  testAngles[2] = 50; // reverse knee violation for right-facing
  const structRes = enforceAnatomicalConstraints17(testAngles, STICKFIGURE_PARENTS, true);
  assert(structRes.violationsCount > 0, 'Anatomical joint limit violation detection');
  assert(structRes.constrainedAngles[2] <= 0, 'Anatomical knee polarity enforcement');

  // 6. Center of Mass Calculation
  const com = calculateCenterOfMass17(500, 500, testAngles);
  assert(com.totalMass > 0.99, 'Center of Mass total mass sum');

  // 7. Kinetic Chain Impulse Propagation
  const impulseRes = propagateKineticImpulse({
    originNodeIndex: 11, // Hand
    impulseX: 30,
    impulseY: 0,
    torque: 10,
    worldAnglesDeg: testAngles,
    parents: STICKFIGURE_PARENTS,
    isRightFacing: true,
  });
  assert(impulseRes.chainReactionDiagnostics.length >= 3, 'Kinetic chain impulse propagation diagnostics');

  // 8. Contact State Machine
  const contactSys = new ContactSystem();
  contactSys.updateContact({
    id: 'foot_r',
    boneIndex: 3,
    state: 'approaching',
    worldX: 500,
    worldY: 755.0,
    friction: 0.9,
    surfaceNormalY: -1,
    penetrationDepth: 0,
    contactFrames: 0,
  });
  const contactRes = contactSys.solveContacts(500, 500, { groundY: 755.0 });
  assert(contactRes.updatedContacts[0].state === 'contact', 'Contact state machine transition approaching -> contact');

  // 9. Procedural Walk Locomotion Generator
  const walkFrames = generateProceduralLocomotion({ type: 'walk', numSteps: 2, startX: 300, groundY: 755.0, isRightFacing: true });
  assert(walkFrames.length === 24, 'Procedural walk locomotion frame count');

  // 10. Procedural Combat Strike Generator
  const punchFrames = generateProceduralCombatStrike({ type: 'punch', startX: 400, groundY: 755.0, isRightFacing: true });
  assert(punchFrames.length === 10, 'Procedural combat punch frame count');

  // 11. Procedural Acrobatics Jump Generator
  const jumpFrames = generateProceduralAcrobatics({ type: 'jump', startX: 350, groundY: 755.0, isRightFacing: true });
  assert(jumpFrames.length === 12, 'Procedural acrobatics jump frame count');

  // 12. Automated Correction Engine & Quality Analyzer
  const correctionEngine = new AutomatedCorrectionEngine();
  const corrRes = correctionEngine.autoCorrectAnimation(walkFrames, 755.0, true);
  assert(corrRes.finalReport.overallScore >= 80, 'Automated Correction Engine output quality score >= 80', `Score=${corrRes.finalReport.overallScore.toFixed(1)}`);

  // 13. Skill Registry & Dynamic Capability Execution
  const registry = SkillRegistry.getInstance();
  const registeredSkills = registry.getAllSkills();
  assert(registeredSkills.length >= 5, 'SkillRegistry registered skills count', `Count=${registeredSkills.length}`);

  const useSkillRes = useSkill('procedural-locomotion', { groundY: 755.0 });
  assert(useSkillRes.success, 'Dynamic useSkill(...) capability invocation');

  console.log(`\n----------------------------------------------------------------`);
  console.log(`SUMMARY: ${passedTests}/${totalTests} tests passed.`);
  console.log(`----------------------------------------------------------------\n`);

  if (passedTests === totalTests) {
    console.log('ALL ANIMATION ENGINE & SKILL UPGRADE CHECKS PASSED SUCCESSFULLY!');
  } else {
    console.error('TEST SUITE COMPLETED WITH ERRORS.');
    process.exit(1);
  }
}

runTestSuite();
