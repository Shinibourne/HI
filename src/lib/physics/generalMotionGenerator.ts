import {
  GeneralPhysicsKeyframeSpec,
  ConfigurablePhysicsParams,
  DEFAULT_PHYSICS_PARAMS,
} from './types';
import { solveForwardKinematics17, solveTwoBoneIK, solveLegLimb, solveArmLimb } from '../skills/kinematicsSolvers';
import { calculateWeightedCenterOfMass } from './dynamicBalanceSolver';
import { computeBaseOfSupport } from './contactSupportEngine';
import { calculateLoadLeverage, solveCatchMomentumYield, solveStrikingOutcome } from './massLoadSolver';

export type PhysicsScenarioType =
  | 'LIFT_HEAVY_VS_LIGHT'
  | 'LEVER_ARM_NEAR_VS_FAR'
  | 'CARRY_HEAVY_WALK'
  | 'PUSH_HEAVY_OBJECT'
  | 'PULL_HEAVY_OBJECT'
  | 'CATCH_MOMENTUM_ABSORPTION'
  | 'THROW_ATHLETIC'
  | 'STRIKE_COLLISION_RECOIL'
  | 'CONTROLLED_IMBALANCE_RECOVERY';

export interface GeneralGeneratorConfig {
  scenario: PhysicsScenarioType;
  targetFps: 12 | 24;
  charMass: number;
  objMass: number;
  groundY: number;
  charColorHex: string;
  objColorHex: string;
  objRadius: number;
  leverArmDistance: number; // For near vs far testing (e.g. 25px vs 80px)
}

export const DEFAULT_GENERAL_GENERATOR_CONFIG: GeneralGeneratorConfig = {
  scenario: 'LIFT_HEAVY_VS_LIGHT',
  targetFps: 24,
  charMass: 100.0,
  objMass: 50.0,
  groundY: 755.0,
  charColorHex: '#0F172A',
  objColorHex: '#EA580C',
  objRadius: 22.0,
  leverArmDistance: 50.0,
};

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Procedural Generator for General Physics Scenarios
 */
export function buildGeneralPhysicsFrames(
  config: GeneralGeneratorConfig = DEFAULT_GENERAL_GENERATOR_CONFIG
): GeneralPhysicsKeyframeSpec[] {
  const G = config.groundY;
  const R = config.objRadius;
  const scenario = config.scenario;
  const is24Fps = config.targetFps === 24;
  const numFrames = is24Fps ? 24 : 12;

  const frames: GeneralPhysicsKeyframeSpec[] = [];

  // =========================================================================
  // SCENARIO 1: LIFT HEAVY VS LIGHT (OR LEVER ARM NEAR VS FAR)
  // =========================================================================
  if (scenario === 'LIFT_HEAVY_VS_LIGHT' || scenario === 'LEVER_ARM_NEAR_VS_FAR') {
    const isHeavy = config.objMass >= 30.0;
    const isFarHold = scenario === 'LEVER_ARM_NEAR_VS_FAR' ? config.leverArmDistance > 45 : false;
    const holdOffset = isFarHold ? config.leverArmDistance : isHeavy ? 35 : 24;

    // Timeline phases:
    // F0..F4: Stand & Approach
    // F5..F9: Deep Preparation Squat (lower COM, bend knees, hinge hips)
    // F10..F11: Hand Contact & Grip Attachment
    // F12..F18: Leg Drive & Lift (Ground reaction forces, spinal extension)
    // F19..F23: Stabilization & Standing Hold with Load Leverage

    for (let f = 0; f < numFrames; f++) {
      const tNorm = f / (numFrames - 1);
      let act = 'Stand & Approach';
      let phaseName = 'PREPARATION';
      let objState: 'FREE' | 'HELD' | 'RESTING' | 'IMPACTING' = 'RESTING';
      let activeForceChain = 'Ground -> Feet -> Legs -> Pelvis';

      // Base coordinates
      let charX = 580;
      let charY = 512; // standing pelvis
      let torsoAngle = 90.0; // vertical lower spine
      let chestAngle = 90.0;
      let neckAngle = 90.0;
      let headAngle = 80.0;

      let rThigh = 91.0;
      let rShin = 90.0;
      let lThigh = 92.0;
      let lShin = 90.0;

      let rBicep = 270.0; // hanging down
      let rForearm = 270.0;
      let lBicep = 270.0;
      let lForearm = 270.0;

      let objX = 660;
      let objY = G - R; // on ground

      if (f < 5) {
        // Stand and gaze down at object
        act = 'Anticipation & Gaze';
        phaseName = 'ANTICIPATION';
        charY = 512;
        torsoAngle = 88.0;
        headAngle = 65.0; // looking down at object
        objState = 'RESTING';
      } else if (f < 10) {
        // Squat preparation (lowering COM, flexing knees and hips)
        act = 'Preparation Squat & Reach';
        phaseName = 'SQUAT_PREP';
        const p = (f - 5) / 4;
        charY = 512 + p * (isHeavy ? 115 : 90); // lower pelvis deep into squat
        torsoAngle = 88.0 - p * 18.0; // hinge hips forward (forward lean to reach)
        chestAngle = torsoAngle + 4.0;
        headAngle = 70.0; // gaze locked on object

        // Knee flexion (Facing right: thigh goes forward, shin folds backward)
        rThigh = 91.0 + p * 39.0;
        rShin = 90.0 + p * 4.0;
        lThigh = 92.0 + p * 38.0;
        lShin = 90.0 + p * 6.0;

        // Reach arms down to object
        rBicep = 270.0 + p * 25.0;
        rForearm = 270.0 + p * 35.0;
        lBicep = 270.0 + p * 20.0;
        lForearm = 270.0 + p * 35.0;

        objState = 'RESTING';
        activeForceChain = 'Leg Flexion Cushion -> Hip Hinge Tension';
      } else if (f < 12) {
        // Hand Contact & Attachment
        act = 'Contact & Grip Lock';
        phaseName = 'CONTACT_ATTACH';
        charY = isHeavy ? 627 : 602;
        torsoAngle = 70.0;
        chestAngle = 74.0;
        headAngle = 72.0;

        rThigh = 130.0;
        rShin = 94.0;
        lThigh = 130.0;
        lShin = 96.0;

        // Hands contact object
        rBicep = 295.0;
        rForearm = 305.0;
        lBicep = 290.0;
        lForearm = 305.0;

        objState = 'HELD';
        objX = charX + holdOffset;
        objY = G - R - 10;
        activeForceChain = 'Hands -> Object Contact -> Grip Attachment';
      } else if (f < 19) {
        // Leg Drive & Vertical Lifting
        act = 'Ground Reaction Leg Drive & Lift';
        phaseName = 'LIFT_DRIVE';
        const p = (f - 12) / 6; // 0 to 1
        // Smooth quintic acceleration
        const smoothP = p * p * (3 - 2 * p);

        const squatDepth = isHeavy ? 115 : 90;
        charY = 512 + (1 - smoothP) * squatDepth;

        // Calculate leverage & counter-lean
        const curObjX = charX + holdOffset;
        const curObjY = (G - R - 10) - smoothP * 180;
        const lev = calculateLoadLeverage(config.charMass, config.objMass, charX, curObjX, curObjY, charY - 80);

        // Heavy object or far hold forces torso to lean BACKWARD proportionally
        torsoAngle = 70.0 + smoothP * (20.0 + (isHeavy || isFarHold ? 8.0 : 0.0));
        chestAngle = torsoAngle + 2.0;

        rThigh = 130.0 - smoothP * 39.0;
        rShin = 94.0 - smoothP * 4.0;
        lThigh = 130.0 - smoothP * 38.0;
        lShin = 96.0 - smoothP * 6.0;

        // Arms holding object
        rBicep = 295.0 - smoothP * 10.0;
        rForearm = 305.0 - smoothP * 25.0;

        // Contralateral left arm counterbalances smoothly
        if (isHeavy || isFarHold) {
          lBicep = 290.0 - smoothP * 45.0; // 290 -> 245
          lForearm = 305.0 - smoothP * 65.0; // 305 -> 240
        } else {
          lBicep = 290.0 - smoothP * 20.0;
          lForearm = 305.0 - smoothP * 35.0;
        }

        objState = 'HELD';
        objX = curObjX;
        objY = curObjY;
        activeForceChain = 'Feet Normal Force -> Knee/Hip Extension -> Spinal Tension -> Arms Lift';
      } else {
        // Standing hold with load compensation
        act = isFarHold
          ? 'Far-Hold High Torque Counter-Lean'
          : isHeavy
          ? 'Heavy-Load Equilibrium Hold'
          : 'Light-Load Neutral Hold';
        phaseName = 'STABILIZE_HOLD';
        charY = 512;

        const curObjX = charX + holdOffset;
        const curObjY = 520;
        const lev = calculateLoadLeverage(config.charMass, config.objMass, charX, curObjX, curObjY, charY - 80);

        // Counter-lean: torso tilts backward away from forward weight
        const counterLean = isFarHold ? 12.0 : isHeavy ? 7.5 : 2.0;
        torsoAngle = 90.0 + counterLean;
        chestAngle = torsoAngle + 1.5;
        headAngle = 82.0;

        rThigh = 91.0;
        rShin = 90.0;
        lThigh = 92.0;
        lShin = 90.0;

        // Arms supporting
        rBicep = 285.0;
        rForearm = 280.0;

        if (isHeavy || isFarHold) {
          lBicep = 245.0;
          lForearm = 240.0;
        } else {
          lBicep = 270.0;
          lForearm = 270.0;
        }

        objState = 'HELD';
        objX = curObjX;
        objY = curObjY;
        activeForceChain = 'Torso Counter-Torque <-> Planted Ground Support';
      }

      const rawAngles = [
        0.0, // 0: Pelvis
        rThigh, rShin, 0.0, // 1..3
        lThigh, lShin, 0.0, // 4..6
        torsoAngle, chestAngle, // 7..8
        rBicep, rForearm, 0.0, // 9..11
        neckAngle, headAngle, // 12..13
        lBicep, lForearm, 0.0, // 14..16
      ];

      const joints = solveForwardKinematics17(charX, charY, rawAngles, 0.5);
      if (objState === 'HELD') {
        // Hand-locked attachment precision
        objX = joints[11].endX;
        objY = joints[11].endY;
      }
      const carriedObjs = objState === 'HELD' ? [{
        id: 'prop',
        name: 'Prop',
        position: { x: objX, y: objY },
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        mass: config.objMass,
        relativeMass: config.objMass / config.charMass,
        radius: R,
        orientation: 0,
        angularVelocity: 0,
        rotationalInertia: 10,
        contactState: 'HELD' as const,
        attachedTo: null,
        contactPoint: { x: objX, y: objY },
      }] : [];

      const com = calculateWeightedCenterOfMass(joints, carriedObjs, config.charMass);
      const bos = computeBaseOfSupport(joints, G);
      const margin = Math.min(com.x - bos.minX, bos.maxX - com.x);
      const lev = calculateLoadLeverage(config.charMass, config.objMass, charX, objX, objY, charY - 80);

      frames.push({
        frame: f,
        act,
        phaseName,
        charX,
        charY,
        angles: rawAngles,
        objPresent: true,
        objX,
        objY,
        objState,
        objMass: config.objMass,
        leverArmPx: lev.leverArmX,
        torqueDemand: lev.torqueDemand,
        comX: com.x,
        comY: com.y,
        isBalanced: margin >= -5.0,
        supportMargin: margin,
        activeForceChain,
        notes: `Frame ${f}: ${phaseName} | Torso: ${torsoAngle.toFixed(1)}° | Torque: ${lev.torqueDemand.toFixed(1)} | Margin: ${margin.toFixed(1)}px`,
      });
    }
  }

  // =========================================================================
  // SCENARIO 2: CATCH MOMENTUM ABSORPTION
  // =========================================================================
  else if (scenario === 'CATCH_MOMENTUM_ABSORPTION') {
    // Projectile flies in from right at high velocity (-40 px/f).
    // F0..F7: Approaching ball, character extends hands in anticipation
    // F8: Contact / impact registered
    // F9..F12: Compliant arm yield (elbow flexes +25°), torso compresses backward
    // F13..F23: Stabilization & bring ball to waist

    for (let f = 0; f < numFrames; f++) {
      let charX = 520;
      let charY = 512;
      let objState: 'FREE' | 'HELD' | 'RESTING' | 'IMPACTING' = 'FREE';
      let objX = 1050 - f * 48;
      let objY = 480 + (f - 8) * (f - 8) * 1.5;

      let rThigh = 88.0;
      let rShin = 90.0;
      let lThigh = 92.0;
      let lShin = 90.0;
      let torsoAngle = 90.0;
      let chestAngle = 90.0;
      let rBicep = 270.0;
      let rForearm = 270.0;
      let lBicep = 270.0;
      let lForearm = 270.0;
      let act = 'Intercept Anticipation';
      let phaseName = 'INTERCEPT_APPROACH';
      let activeForceChain = 'Visual Tracking -> Arm Extends Forward';

      if (f < 8) {
        // Extending arms to meet incoming projectile
        const p = f / 7;
        rBicep = 270.0 + p * 60.0;
        rForearm = 270.0 + p * 30.0;
        lBicep = 270.0 + p * 55.0;
        lForearm = 270.0 + p * 25.0;
        torsoAngle = 90.0 - p * 3.0;
        objState = 'FREE';
      } else if (f === 8) {
        // Frame of impact & hit-stop freeze
        act = 'Impact Intercept & Impulse Registration';
        phaseName = 'HIT_STOP_IMPACT';
        objState = 'IMPACTING';
        objX = charX + 85;
        objY = 470;
        rBicep = 330.0;
        rForearm = 300.0;
        lBicep = 325.0;
        lForearm = 295.0;
        activeForceChain = 'Hand Contact -> Impulse J = m * delta_v';
      } else if (f < 13) {
        // Compliant yield: elbows flex, torso pitches back to absorb energy
        act = 'Compliant Momentum Absorption (Yield)';
        phaseName = 'COMPLIANT_YIELD';
        const p = (f - 8) / 4;
        const yieldReport = solveCatchMomentumYield(config.objMass, { x: -40, y: 5 }, config.charMass);

        charX = 520 - p * yieldReport.pelvisBackwardShiftPx;
        torsoAngle = 90.0 + p * yieldReport.torsoBackwardCompressionDeg;
        chestAngle = torsoAngle + 2.0;

        // Yielding elbow flexion
        rBicep = 330.0 - p * 35.0;
        rForearm = 300.0 - p * yieldReport.yieldingElbowFlexionDeg;
        lBicep = 325.0 - p * 30.0;
        lForearm = 295.0 - p * yieldReport.yieldingElbowFlexionDeg;

        objState = 'HELD';
        objX = charX + 85 - p * 22;
        objY = 470 + p * 25;
        activeForceChain = 'Elbow Compliance Flexion -> Thoracic Compression -> Rear Foot Brace';
      } else {
        // Settle & stable control at chest/waist
        act = 'Momentum Dissipation & Stable Control';
        phaseName = 'STABILIZE_CONTROL';
        const p = (f - 13) / 10;
        charX = 505 + p * 15;
        torsoAngle = 94.0 - p * 4.0;
        chestAngle = 94.0 - p * 4.0;

        rBicep = 295.0 - p * 10.0;
        rForearm = 265.0 + p * 15.0;
        lBicep = 295.0 - p * 10.0;
        lForearm = 265.0 + p * 15.0;

        objState = 'HELD';
        objX = charX + 55;
        objY = 495 + p * 30;
        activeForceChain = 'Core Equilibrium Restored';
      }

      const rawAngles = [
        0.0,
        rThigh, rShin, 0.0,
        lThigh, lShin, 0.0,
        torsoAngle, chestAngle,
        rBicep, rForearm, 0.0,
        90.0, 80.0,
        lBicep, lForearm, 0.0,
      ];

      const joints = solveForwardKinematics17(charX, charY, rawAngles, 0.5);
      const bos = computeBaseOfSupport(joints, G);
      const com = calculateWeightedCenterOfMass(joints, [], config.charMass);
      const margin = Math.min(com.x - bos.minX, bos.maxX - com.x);

      frames.push({
        frame: f,
        act,
        phaseName,
        charX,
        charY,
        angles: rawAngles,
        objPresent: true,
        objX,
        objY,
        objState,
        objMass: config.objMass,
        leverArmPx: objX - charX,
        torqueDemand: (objX - charX) * (config.objMass / config.charMass),
        comX: com.x,
        comY: com.y,
        isBalanced: margin >= -5.0,
        supportMargin: margin,
        activeForceChain,
        notes: `Frame ${f}: ${phaseName} | Object X: ${objX.toFixed(1)} | Margin: ${margin.toFixed(1)}px`,
      });
    }
  }

  // =========================================================================
  // SCENARIO 3: PUSH HEAVY OBJECT
  // =========================================================================
  else if (scenario === 'PUSH_HEAVY_OBJECT') {
    // Pushing a massive crate:
    // Feet brace firmly behind COM (X_foot < X_com), whole body forward lean,
    // Ground reaction force transmits up through legs, pelvis, spine into arms and crate.
    for (let f = 0; f < numFrames; f++) {
      const p = f / (numFrames - 1);
      const pushAdvance = p * 60; // crate displaces forward

      const charX = 490 + pushAdvance;
      const charY = 525; // slightly lowered driving stance
      const objX = 640 + pushAdvance;
      const objY = G - 45; // crate on ground

      // Forward drive lean: spine tilted forward (angle < 90)
      const torsoAngle = 76.0 - Math.sin(p * Math.PI) * 4.0;
      const chestAngle = torsoAngle + 2.0;

      // Rear foot driving hard, front foot planting
      const rThigh = 75.0 + Math.sin(p * Math.PI * 2) * 12.0;
      const rShin = 92.0;
      const lThigh = 105.0 - Math.sin(p * Math.PI * 2) * 12.0;
      const lShin = 90.0;

      // Arms extended in compression against crate face
      const rBicep = 340.0;
      const rForearm = 350.0;
      const lBicep = 335.0;
      const lForearm = 345.0;

      const rawAngles = [
        0.0,
        rThigh, rShin, 0.0,
        lThigh, lShin, 0.0,
        torsoAngle, chestAngle,
        rBicep, rForearm, 0.0,
        90.0, 75.0,
        lBicep, lForearm, 0.0,
      ];

      const joints = solveForwardKinematics17(charX, charY, rawAngles, 0.5);
      const bos = computeBaseOfSupport(joints, G);
      const com = calculateWeightedCenterOfMass(joints, [], config.charMass);
      const margin = Math.min(com.x - bos.minX, bos.maxX - com.x);

      frames.push({
        frame: f,
        act: 'Heavy Load Ground Reaction Push',
        phaseName: 'PUSH_DRIVE',
        charX,
        charY,
        angles: rawAngles,
        objPresent: true,
        objX,
        objY,
        objState: 'IMPACTING',
        objMass: config.objMass,
        leverArmPx: objX - charX,
        torqueDemand: 35.0,
        comX: com.x,
        comY: com.y,
        isBalanced: true,
        supportMargin: margin,
        activeForceChain: 'Rear Foot Ground Grip -> Leg Drive -> Pelvis -> Torso Lean -> Arms Compression -> Crate',
        notes: `Frame ${f}: Pushing crate | Advance: ${pushAdvance.toFixed(1)}px | Force Chain: Ground-to-Crate`,
      });
    }
  }

  // =========================================================================
  // SCENARIO 4: PULL HEAVY OBJECT
  // =========================================================================
  else if (scenario === 'PULL_HEAVY_OBJECT') {
    // Pulling heavy load:
    // Feet brace AHEAD of COM (X_foot > X_com), whole body backward lean (torso > 90),
    // Kinetic chain in tension: heels take ground reaction -> legs -> core -> arms pull.
    for (let f = 0; f < numFrames; f++) {
      const p = f / (numFrames - 1);
      const pullAdvance = -p * 45; // moving backward to the left

      const charX = 540 + pullAdvance;
      const charY = 525;
      const objX = 690 + pullAdvance;
      const objY = G - 40;

      // Backward pull lean: spine tilted backward (angle > 90)
      const torsoAngle = 104.0 + Math.sin(p * Math.PI) * 4.0;
      const chestAngle = torsoAngle - 2.0;

      const rThigh = 105.0;
      const rShin = 90.0;
      const lThigh = 78.0;
      const lShin = 90.0;

      // Arms in tension pulling back
      const rBicep = 330.0;
      const rForearm = 320.0;
      const lBicep = 325.0;
      const lForearm = 315.0;

      const rawAngles = [
        0.0,
        rThigh, rShin, 0.0,
        lThigh, lShin, 0.0,
        torsoAngle, chestAngle,
        rBicep, rForearm, 0.0,
        90.0, 80.0,
        lBicep, lForearm, 0.0,
      ];

      const joints = solveForwardKinematics17(charX, charY, rawAngles, 0.5);
      const bos = computeBaseOfSupport(joints, G);
      const com = calculateWeightedCenterOfMass(joints, [], config.charMass);
      const margin = Math.min(com.x - bos.minX, bos.maxX - com.x);

      frames.push({
        frame: f,
        act: 'Heel-Braced Tensile Pull',
        phaseName: 'PULL_DRIVE',
        charX,
        charY,
        angles: rawAngles,
        objPresent: true,
        objX,
        objY,
        objState: 'IMPACTING',
        objMass: config.objMass,
        leverArmPx: objX - charX,
        torqueDemand: -32.0,
        comX: com.x,
        comY: com.y,
        isBalanced: true,
        supportMargin: margin,
        activeForceChain: 'Object -> Hand Grip Tension -> Shoulders -> Spine Counter-Lean -> Heel Ground Brace',
        notes: `Frame ${f}: Pulling load | Backward lean: ${torsoAngle.toFixed(1)}° | Force Chain: Tensile Link`,
      });
    }
  }

  // =========================================================================
  // SCENARIO 5: THROW ATHLETIC
  // =========================================================================
  else if (scenario === 'THROW_ATHLETIC') {
    // Kinetic whip release:
    // F0..F6: Crouch, backswing coil, arm chambers back
    // F7..F10: Ground drive -> pelvic rotation -> torso whip forward
    // F11: Release at peak hand velocity!
    // F12..F23: Ballistic parabolic trajectory + whole body follow-through recoil
    let launchVx = 42.0;
    let launchVy = -18.0;

    for (let f = 0; f < numFrames; f++) {
      let charX = 480;
      let charY = 512;
      let objState: 'FREE' | 'HELD' | 'RESTING' | 'IMPACTING' = 'HELD';
      let objX = 480;
      let objY = 480;
      let act = 'Backswing Coil';
      let phaseName = 'WINDUP_COIL';
      let activeForceChain = 'Leg Compression -> Spinal Pre-Stretch';

      let torsoAngle = 90.0;
      let chestAngle = 90.0;
      let rThigh = 88.0;
      let rShin = 90.0;
      let lThigh = 92.0;
      let lShin = 90.0;
      let rBicep = 270.0;
      let rForearm = 270.0;
      let lBicep = 270.0;
      let lForearm = 270.0;

      if (f < 7) {
        // Windup & backswing
        const p = f / 6;
        charY = 512 + p * 15;
        torsoAngle = 90.0 + p * 16.0; // lean back to coil
        chestAngle = torsoAngle + 2.0;
        rBicep = 270.0 - p * 60.0; // arm back
        rForearm = 270.0 - p * 50.0;
        lBicep = 270.0 + p * 40.0; // left arm forward for balance
        objX = charX - p * 40;
        objY = 460 - p * 20;
      } else if (f < 11) {
        // Forward drive whip
        act = 'Kinetic Whip Forward Drive';
        phaseName = 'EXPLOSIVE_DRIVE';
        const p = (f - 7) / 4;
        charX = 480 + p * 25;
        torsoAngle = 106.0 - p * 32.0; // whip forward through vertical
        chestAngle = torsoAngle - 4.0;
        rBicep = 210.0 + p * 140.0;
        rForearm = 220.0 + p * 130.0;
        lBicep = 310.0 - p * 40.0;
        objX = charX + p * 65;
        objY = 440 + p * 20;
        activeForceChain = 'Leg Push -> Hip Torque -> Torso Whip -> Arm Whip';
      } else if (f === 11) {
        // Release frame!
        act = 'Hand Release at Peak Hand Velocity';
        phaseName = 'RELEASE_INSTANT';
        objState = 'FREE';
        objX = charX + 75;
        objY = 460;
        torsoAngle = 72.0;
        chestAngle = 68.0;
        rBicep = 355.0;
        rForearm = 350.0;
        activeForceChain = 'Velocity Transfer to Projectile';
      } else {
        // Parabolic ballistic flight & follow-through recoil
        act = 'Ballistic Flight & Follow-Through Recoil';
        phaseName = 'FOLLOW_THROUGH';
        const p = (f - 11);
        objState = 'FREE';
        objX = 555 + p * launchVx;
        // Gravity parabola: Y(t) = Y0 + Vy*t + 0.5*g*t^2
        const grav = 3.2;
        objY = Math.min(G - R, 460 + p * launchVy + 0.5 * grav * p * p);

        // Character decelerates & rebounds to standing
        const retP = Math.min(1.0, (f - 11) / 8);
        torsoAngle = 72.0 + retP * 18.0;
        chestAngle = torsoAngle;
        rBicep = 350.0 - retP * 70.0;
        rForearm = 350.0 - retP * 75.0;
        activeForceChain = 'Follow-Through Momentum Dissipation';
      }

      const rawAngles = [
        0.0,
        rThigh, rShin, 0.0,
        lThigh, lShin, 0.0,
        torsoAngle, chestAngle,
        rBicep, rForearm, 0.0,
        90.0, 80.0,
        lBicep, lForearm, 0.0,
      ];

      const joints = solveForwardKinematics17(charX, charY, rawAngles, 0.5);
      const bos = computeBaseOfSupport(joints, G);
      const com = calculateWeightedCenterOfMass(joints, [], config.charMass);
      const margin = Math.min(com.x - bos.minX, bos.maxX - com.x);

      frames.push({
        frame: f,
        act,
        phaseName,
        charX,
        charY,
        angles: rawAngles,
        objPresent: true,
        objX,
        objY,
        objState,
        objMass: config.objMass,
        leverArmPx: objX - charX,
        torqueDemand: 25.0,
        comX: com.x,
        comY: com.y,
        isBalanced: true,
        supportMargin: margin,
        activeForceChain,
        notes: `Frame ${f}: ${phaseName} | Ball X: ${objX.toFixed(1)}, Y: ${objY.toFixed(1)}`,
      });
    }
  }

  // =========================================================================
  // SCENARIO 6: CONTROLLED IMBALANCE RECOVERY (TRIP & STUMBLE STEP)
  // =========================================================================
  else if (scenario === 'CONTROLLED_IMBALANCE_RECOVERY') {
    // Demonstrates Section 13 & 30:
    // F0..F4: Steady standing stance
    // F5..F8: External perturbation / trip -> COM pitches forward beyond support polygon
    // F9..F14: Stepping strategy triggered: emergency recovery step plants ahead of COM
    // F15..F19: Knee compression cushion absorbs forward momentum
    // F20..F23: Base of support realigned, deceleration settles into stable stance
    for (let f = 0; f < numFrames; f++) {
      let charX = 520;
      let charY = 512;
      let act = 'Equilibrium Stance';
      let phaseName = 'STABLE_EQUILIBRIUM';
      let activeForceChain = 'Symmetric Normal Ground Reaction';

      let torsoAngle = 90.0;
      let chestAngle = 90.0;
      let rThigh = 88.0;
      let rShin = 90.0;
      let lThigh = 92.0;
      let lShin = 90.0;
      let rBicep = 270.0;
      let rForearm = 270.0;
      let lBicep = 270.0;
      let lForearm = 270.0;

      if (f < 5) {
        // Neutral hold
        charX = 520;
      } else if (f < 9) {
        // Forward perturbation / unbalance
        act = 'Imbalance Perturbation (XCoM Crosses Base)';
        phaseName = 'CONTROLLED_INSTABILITY';
        const p = (f - 5) / 3;
        charX = 520 + p * 45; // CoM surges forward
        torsoAngle = 90.0 - p * 16.0; // pitch forward
        chestAngle = torsoAngle - 2.0;
        // Arms flare back/outward for counterbalance
        rBicep = 270.0 - p * 45.0;
        lBicep = 270.0 - p * 45.0;
        activeForceChain = 'Perturbation Impulse -> Ankle Torque Limit Exceeded';
      } else if (f < 15) {
        // Stepping strategy: swing right foot forward rapidly into recovery plant
        act = 'Biomechanical Stepping Recovery (Emergency Step)';
        phaseName = 'STEPPING_RECOVERY';
        const p = (f - 9) / 5;
        charX = 565 + p * 50;
        torsoAngle = 74.0 + p * 10.0;
        chestAngle = torsoAngle;

        // Right leg takes long forward step
        rThigh = 88.0 + p * 35.0;
        rShin = 90.0 + p * 10.0;
        lThigh = 92.0 - p * 15.0; // trailing leg

        // Arms abduct wide for balance
        rBicep = 240.0 + p * 30.0;
        lBicep = 240.0 + p * 30.0;
        activeForceChain = 'Emergency Footfall Target Solved -> Foot Accelerates';
      } else {
        // Cushioning & deceleration into new equilibrium
        act = 'Impact Cushion & Stability Settle';
        phaseName = 'CUSHION_SETTLE';
        const p = (f - 15) / 8;
        charX = 615 + p * 15;
        charY = 512 + (1 - p) * 12; // knee compression dip
        torsoAngle = 84.0 + p * 6.0; // back to upright
        chestAngle = torsoAngle;

        rThigh = 123.0 - p * 33.0;
        rShin = 100.0 - p * 10.0;
        lThigh = 77.0 + p * 15.0;

        rBicep = 270.0;
        lBicep = 270.0;
        activeForceChain = 'Knee Cushion -> Base Realigned -> Ground Reaction Stable';
      }

      const rawAngles = [
        0.0,
        rThigh, rShin, 0.0,
        lThigh, lShin, 0.0,
        torsoAngle, chestAngle,
        rBicep, rForearm, 0.0,
        90.0, 80.0,
        lBicep, lForearm, 0.0,
      ];

      const joints = solveForwardKinematics17(charX, charY, rawAngles, 0.5);
      const bos = computeBaseOfSupport(joints, G);
      const com = calculateWeightedCenterOfMass(joints, [], config.charMass);
      const margin = Math.min(com.x - bos.minX, bos.maxX - com.x);

      frames.push({
        frame: f,
        act,
        phaseName,
        charX,
        charY,
        angles: rawAngles,
        objPresent: false,
        objX: 0,
        objY: 0,
        objState: 'FREE',
        objMass: 0,
        leverArmPx: 0,
        torqueDemand: 0,
        comX: com.x,
        comY: com.y,
        isBalanced: margin >= -15.0,
        supportMargin: margin,
        activeForceChain,
        notes: `Frame ${f}: ${phaseName} | Pelvis X: ${charX.toFixed(1)} | Margin: ${margin.toFixed(1)}px`,
      });
    }
  }

  // Fallback / default
  else {
    return buildGeneralPhysicsFrames({
      ...config,
      scenario: 'LIFT_HEAVY_VS_LIGHT',
    });
  }

  return frames;
}
