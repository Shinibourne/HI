import {
  STICKMAN_JOINT_CONSTRAINTS,
  clampJointAngle,
  calculateJointPenaltyCost,
  solveCCD2D,
  Joint2DNode,
  blendAngleDeg,
  blendPoseIKFK,
  calculateLandingBlendAlpha,
  smoothstep,
  easeInOutCubic,
  updateOverlappingJoint,
  computeRotationalArcTrajectory,
  computeAnticipationWindUp,
} from '../src/lib/kinematics/skeletalFluidMechanics';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
}

console.log('🧪 Starting Skeletal Fluid Movement Optimization Test Suite...');

// 1. Joint Constraint Clamping Tests
console.log('  1. Testing Joint Constraints & Clamping...');
assert(clampJointAngle(2, -10) === -2, 'Knee hyperextension clamped to -2°');
assert(clampJointAngle(2, 200) === 145, 'Knee flexion clamped to 145°');
assert(clampJointAngle(10, 180) === 150, 'Elbow flexion clamped to 150°');
assert(clampJointAngle(10, -10) === -5, 'Elbow hyperextension clamped to -5°');
console.log('  ✅ Joint constraints clamping verified.');

// 2. Penalty Cost Tests
console.log('  2. Testing Penalty Cost Calculation...');
const normalPose = Object.values(STICKMAN_JOINT_CONSTRAINTS).map((c) => c.preferredAngleDeg);
const extremePose = [...normalPose];
extremePose[2] = 300; // Severe knee violation
extremePose[10] = -120; // Severe elbow violation

const normalPenalty = calculateJointPenaltyCost(normalPose);
const extremePenalty = calculateJointPenaltyCost(extremePose);

assert(normalPenalty >= 0, 'Normal penalty is non-negative');
assert(extremePenalty > normalPenalty * 10, 'Extreme pose generates significantly higher penalty');
console.log('  ✅ Penalty cost calculations verified.');

// 3. 2D CCD IK Solver Tests
console.log('  3. Testing 2D CCD IK Solver...');
const nodes: Joint2DNode[] = [
  { position: [0, 0], angleRad: 0.0, length: 100, minAngleRad: -Math.PI, maxAngleRad: Math.PI },
  { position: [0, 0], angleRad: 0.0, length: 100, minAngleRad: -Math.PI * 0.8, maxAngleRad: Math.PI * 0.8 },
];
const target: [number, number] = [120, 80];

const ccdRes = solveCCD2D(nodes, target, 10, 0.5);
assert(ccdRes.iterationsUsed > 0, 'CCD solver performed iterations');
assert(ccdRes.finalErrorPx <= 2.0, `CCD solver converged within target distance (Error: ${ccdRes.finalErrorPx}px)`);
console.log('  ✅ 2D CCD IK solver verified.');

// 4. IK/FK Blending Tests
console.log('  4. Testing IK/FK Blending Engine...');
assert(blendAngleDeg(0, 90, 0.0) === 0, 'Alpha 0 returns pure FK angle');
assert(blendAngleDeg(0, 90, 1.0) === 90, 'Alpha 1 returns pure IK angle');
assert(blendAngleDeg(0, 90, 0.5) === 45, 'Alpha 0.5 interpolates mid-point');

assert(calculateLandingBlendAlpha(0.5) === 0.0, 'Airborne phase returns 0.0 alpha');
assert(calculateLandingBlendAlpha(1.0) === 1.0, 'Touchdown phase returns 1.0 alpha');
assert(calculateLandingBlendAlpha(0.875) > 0.0 && calculateLandingBlendAlpha(0.875) < 1.0, 'Pre-contact phase smoothly ramps alpha');
console.log('  ✅ IK/FK blending verified.');

// 5. Spring-Damper Oscillator Tests
console.log('  5. Testing Damped Harmonic Oscillator...');
let currentAngle = 45.0;
let velocity = 0.0;
const targetAngle = 0.0;

for (let step = 0; step < 60; step++) {
  const state = updateOverlappingJoint(currentAngle, targetAngle, velocity, 180.0, 15.0, 0.016);
  currentAngle = state.angle;
  velocity = state.velocity;
}

assert(Math.abs(currentAngle - targetAngle) < 1.0, 'Oscillator settles near target angle after dampening period');
console.log('  ✅ Damped harmonic oscillator verified.');

// 6. Easing & Rotational Circular Arc Tests
console.log('  6. Testing Easing & Rotational Arcs...');
assert(smoothstep(0) === 0, 'Smoothstep(0) = 0');
assert(smoothstep(1) === 1, 'Smoothstep(1) = 1');
assert(easeInOutCubic(0.5) === 0.5, 'easeInOutCubic(0.5) = 0.5');

const arcMid = computeRotationalArcTrajectory(0, 0, 100, 0, 90, 0.5);
const distFromPivot = Math.hypot(arcMid.x, arcMid.y);
assert(Math.abs(distFromPivot - 100) < 0.01, 'Rotational arc maintains exact bone radius length throughout sweep');
console.log('  ✅ Rotational circular arc trajectory verified.');

// 7. Anticipation Crouch Tests
console.log('  7. Testing Anticipation Crouch Mechanics...');
const prep = computeAnticipationWindUp(0.35, 1.0, 25.0, 20.0);
assert(prep.pelvisCrouchY > 15.0, 'Crouch Y displacement active during wind-up phase');
assert(prep.torsoWindUpDeg < 0, 'Torso leans backward opposite to forward action');
console.log('  ✅ Anticipation crouch mechanics verified.');

console.log('🎉 All Skeletal Fluid Movement Optimization tests PASSED successfully!');
