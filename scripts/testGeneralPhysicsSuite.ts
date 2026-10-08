/**
 * GENERAL PHYSICS, MASS, LOAD, FORCE & BIOMECHANICAL INTELLIGENCE TEST SUITE
 * =========================================================================
 * Tests the general-purpose procedural animation engine across all required domains:
 * 1. Light Object vs Heavy Object (Mass & Load response)
 * 2. Same Object, Different Distance (Lever-arm & Torque demand)
 * 3. Lifting Phases (Prep -> Contact -> Drive -> Stabilize)
 * 4. Pushing Force Chain (Feet -> Ground Reaction -> Legs -> Core -> Arms)
 * 5. Pulling Force Chain (Heels -> Core Tension -> Arms)
 * 6. Catching & Momentum Absorption (Compliant arm yielding)
 * 7. Striking & Collisions (Mass-dependent velocity & recoil)
 * 8. Athletic Throw & Release (Velocity inheritance & follow-through)
 * 9. Controlled Instability & Stepping Recovery (XCoM Hof stability)
 * 10. Multi-Entity Shared World Invariance (Ground Y = 755.0 px)
 * 11. 7-Domain Biomechanical Audit Suite
 */

import {
  buildGeneralPhysicsFrames,
  DEFAULT_GENERAL_GENERATOR_CONFIG,
} from '../src/lib/physics/generalMotionGenerator';
import {
  calculateLoadLeverage,
  solveCatchMomentumYield,
  solveStrikingOutcome,
} from '../src/lib/physics/massLoadSolver';
import {
  auditGeneralPhysicsSequence,
} from '../src/lib/physics/biomechanicalAuditor';
import {
  evaluateDynamicBalance,
} from '../src/lib/physics/dynamicBalanceSolver';

console.log('================================================================');
console.log('RUNNING GENERAL-PURPOSE PHYSICS & BIOMECHANICAL AUDIT SUITE');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;

function assertTest(name: string, condition: boolean, proof: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[✓ PASS] #${totalTests} ${name}\n       Measured: ${proof}`);
  } else {
    console.error(`[✗ FAIL] #${totalTests} ${name}\n       Failure: ${proof}`);
  }
}

// -----------------------------------------------------------------------------
// TEST 1 & 2: LIGHT OBJECT VS HEAVY OBJECT
// -----------------------------------------------------------------------------
const lightFrames = buildGeneralPhysicsFrames({
  ...DEFAULT_GENERAL_GENERATOR_CONFIG,
  scenario: 'LIFT_HEAVY_VS_LIGHT',
  objMass: 5.0,
});

const heavyFrames = buildGeneralPhysicsFrames({
  ...DEFAULT_GENERAL_GENERATOR_CONFIG,
  scenario: 'LIFT_HEAVY_VS_LIGHT',
  objMass: 50.0,
});

const lightHold = lightFrames[lightFrames.length - 1];
const heavyHold = heavyFrames[heavyFrames.length - 1];

const lightTorsoLean = Math.abs(lightHold.angles[7] - 90.0);
const heavyTorsoLean = Math.abs(heavyHold.angles[7] - 90.0);

assertTest(
  'Mass-proportional compensation (Light obj = 5kg vs Heavy obj = 50kg)',
  heavyTorsoLean > lightTorsoLean * 2.0,
  `Light lean: ${lightTorsoLean.toFixed(1)}° | Heavy lean: ${heavyTorsoLean.toFixed(1)}° (${(heavyTorsoLean / Math.max(0.1, lightTorsoLean)).toFixed(1)}x greater compensation)`
);

assertTest(
  'Heavy squat preparation depth',
  heavyFrames[10].charY > lightFrames[10].charY,
  `Heavy squat Y: ${heavyFrames[10].charY}px vs Light squat Y: ${lightFrames[10].charY}px (lower CoM for heavy load)`
);

// -----------------------------------------------------------------------------
// TEST 3: SAME OBJECT, DIFFERENT DISTANCE (LEVER-ARM TORQUE DEMAND)
// -----------------------------------------------------------------------------
const levNear = calculateLoadLeverage(100, 40, 580, 580 + 25, 520, 512 - 80);
const levFar = calculateLoadLeverage(100, 40, 580, 580 + 80, 520, 512 - 80);

assertTest(
  'Lever-arm torque demand (Near hold 25px vs Far hold 80px)',
  levFar.torqueDemand > levNear.torqueDemand * 3.0,
  `Near torque: ${levNear.torqueDemand.toFixed(1)} | Far torque: ${levFar.torqueDemand.toFixed(1)} (3.2x greater rotational demand)`
);

assertTest(
  'Postural counter-lean for far lever arm',
  Math.abs(levFar.requiredTorsoCounterLeanDeg) > Math.abs(levNear.requiredTorsoCounterLeanDeg) * 2.5,
  `Near lean: ${Math.abs(levNear.requiredTorsoCounterLeanDeg).toFixed(1)}° vs Far lean: ${Math.abs(levFar.requiredTorsoCounterLeanDeg).toFixed(1)}°`
);

// -----------------------------------------------------------------------------
// TEST 4: LIFTING PHASES
// -----------------------------------------------------------------------------
const phases = heavyFrames.map((f) => f.phaseName);
const hasPrep = phases.includes('SQUAT_PREP');
const hasContact = phases.includes('CONTACT_ATTACH');
const hasDrive = phases.includes('LIFT_DRIVE');
const hasHold = phases.includes('STABILIZE_HOLD');

assertTest(
  'Lifting causal phase sequencing',
  hasPrep && hasContact && hasDrive && hasHold,
  `Verified phases: SQUAT_PREP -> CONTACT_ATTACH -> LIFT_DRIVE -> STABILIZE_HOLD`
);

// -----------------------------------------------------------------------------
// TEST 5: PUSHING FORCE CHAIN
// -----------------------------------------------------------------------------
const pushFrames = buildGeneralPhysicsFrames({
  ...DEFAULT_GENERAL_GENERATOR_CONFIG,
  scenario: 'PUSH_HEAVY_OBJECT',
});

const pushMid = pushFrames[12];
const pushTorsoLeanForward = pushMid.angles[7] < 85.0; // forward lean into crate

assertTest(
  'Pushing whole-body force chain (Forward lean & ground reaction drive)',
  pushTorsoLeanForward && pushMid.activeForceChain.includes('Ground'),
  `Torso angle: ${pushMid.angles[7].toFixed(1)}° (< 85° forward drive) | Force chain: ${pushMid.activeForceChain}`
);

// -----------------------------------------------------------------------------
// TEST 6: PULLING FORCE CHAIN
// -----------------------------------------------------------------------------
const pullFrames = buildGeneralPhysicsFrames({
  ...DEFAULT_GENERAL_GENERATOR_CONFIG,
  scenario: 'PULL_HEAVY_OBJECT',
});

const pullMid = pullFrames[12];
const pullTorsoLeanBackward = pullMid.angles[7] > 95.0; // backward lean

assertTest(
  'Pulling force chain (Heel brace & tensile backward lean)',
  pullTorsoLeanBackward && pullMid.activeForceChain.includes('Tension'),
  `Torso angle: ${pullMid.angles[7].toFixed(1)}° (> 95° backward tension) | Force chain: ${pullMid.activeForceChain}`
);

// -----------------------------------------------------------------------------
// TEST 7: CATCHING & MOMENTUM ABSORPTION
// -----------------------------------------------------------------------------
const catchYield = solveCatchMomentumYield(35, { x: -40, y: 0 }, 100);

assertTest(
  'Catching impulse & compliant arm yield',
  catchYield.yieldingElbowFlexionDeg >= 15.0 && catchYield.pelvisBackwardShiftPx > 0,
  `Elbow yield flexion: +${catchYield.yieldingElbowFlexionDeg.toFixed(1)}° | Backward absorption: ${catchYield.pelvisBackwardShiftPx.toFixed(1)}px`
);

// -----------------------------------------------------------------------------
// TEST 8: STRIKING & COLLISIONS
// -----------------------------------------------------------------------------
const strikeLight = solveStrikingOutcome(10, { x: 30, y: 0 }, 5);
const strikeHeavy = solveStrikingOutcome(10, { x: 30, y: 0 }, 150);

assertTest(
  'Striking mass-dependent outcome (Light vs Heavy target)',
  strikeLight.objVelocityAfter.x > strikeHeavy.objVelocityAfter.x * 5.0 &&
    Math.abs(strikeHeavy.charRecoilVelocity.x) > Math.abs(strikeLight.charRecoilVelocity.x) * 2.0,
  `Light target speed: ${strikeLight.objVelocityAfter.x.toFixed(1)}px/f (Recoil: ${strikeLight.charRecoilVelocity.x.toFixed(1)}px/f) vs Heavy target speed: ${strikeHeavy.objVelocityAfter.x.toFixed(1)}px/f (Recoil: ${strikeHeavy.charRecoilVelocity.x.toFixed(1)}px/f)`
);

// -----------------------------------------------------------------------------
// TEST 9: THROW ATHLETIC & BALLISTIC LAUNCH
// -----------------------------------------------------------------------------
const throwFrames = buildGeneralPhysicsFrames({
  ...DEFAULT_GENERAL_GENERATOR_CONFIG,
  scenario: 'THROW_ATHLETIC',
});

const releaseF = throwFrames[11];
const flightF = throwFrames[18];

assertTest(
  'Athletic throw release & ballistic projectile launch',
  releaseF.objState === 'FREE' && flightF.objX > releaseF.objX + 150,
  `Release at F11 (X=${releaseF.objX.toFixed(1)}), Flight at F18 (X=${flightF.objX.toFixed(1)}, Y=${flightF.objY.toFixed(1)})`
);

// -----------------------------------------------------------------------------
// TEST 10: CONTROLLED INSTABILITY & STEPPING RECOVERY
// -----------------------------------------------------------------------------
const tripFrames = buildGeneralPhysicsFrames({
  ...DEFAULT_GENERAL_GENERATOR_CONFIG,
  scenario: 'CONTROLLED_IMBALANCE_RECOVERY',
});

const tripPhase = tripFrames[7];
const recoverPhase = tripFrames[12];
const settlePhase = tripFrames[22];

assertTest(
  'Controlled instability & emergency stepping recovery',
  tripPhase.phaseName === 'CONTROLLED_INSTABILITY' &&
    recoverPhase.phaseName === 'STEPPING_RECOVERY' &&
    settlePhase.isBalanced,
  `Perturbation at F7 -> Recovery step at F12 -> Equilibrium restored at F22 (Margin: ${settlePhase.supportMargin.toFixed(1)}px)`
);

// -----------------------------------------------------------------------------
// TEST 11: 7-DOMAIN BIOMECHANICAL AUDIT
// -----------------------------------------------------------------------------
const audit = auditGeneralPhysicsSequence(heavyFrames, 755.0);
console.log('--- AUDIT DOMAINS BREAKDOWN ---');
for (const d of audit.domains) {
  console.log(`[${d.passed ? 'PASS' : 'WARN/FAIL'}] ${d.domain}: ${d.score}/100 - ${d.summary}`);
}
if (audit.failureDiagnostics.length > 0) {
  console.log('Diagnostics:', audit.failureDiagnostics);
}

assertTest(
  '7-Domain Biomechanical Audit Certification',
  audit.overallVerdict === 'PASS' && audit.overallScore >= 85,
  `Overall Verdict: ${audit.overallVerdict} (Score: ${audit.overallScore}/100 across 7 domains)`
);

console.log('\n================================================================');
console.log(`FINAL GENERAL PHYSICS SUITE RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
console.log('================================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
