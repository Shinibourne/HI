import { CombatKeyframeSpec, CombatGeneratorConfig } from './combatTypes';
import { COMBAT_STORYBOARD_PANELS } from './combatData';
import { calculateCenterOfMass17 } from '../skills/biomechanicalPhysics';
import { solveForwardKinematics17 } from '../skills/kinematicsSolvers';

/**
 * Normalizes an angle into [0, 360)
 */
function normDeg(d: number): number {
  let a = d % 360;
  if (a < 0) a += 360;
  return a;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

function easeInQuad(t: number): number {
  return t * t;
}

/**
 * Anatomical Character Rig Parameters for the 17-bone skeleton.
 *
 * Rules:
 * - worldForward is +1 (+X).
 * - Upright spine is at 90° (pointing UP).
 * - Standing leg is at 270° (pointing DOWN).
 * - Knees ONLY flex backward towards hamstrings (kneeFlex >= 0).
 * - Elbows ONLY flex forward towards bicep/chest (elbowFlex >= 0).
 */
interface AnatomicalRigParams {
  worldRotationDeg: number;
  torsoPitch: number;       // deg, positive = forward lean towards +X
  chestCurve: number;       // thoracic flexion
  neckGaze: number;         // gaze offset
  
  // Right Leg
  rHip: number;             // hip flexion, positive = forward towards +X
  rKneeFlex: number;        // knee flexion, >= 0, bends backward
  rAnkle: number;           // ankle angle
  
  // Left Leg
  lHip: number;
  lKneeFlex: number;
  lAnkle: number;
  
  // Right Arm (Rear arm in orthodox stance)
  rShoulder: number;        // shoulder angle relative to torso
  rElbowFlex: number;       // elbow flexion, >= 0
  rWrist: number;
  
  // Left Arm (Lead arm in orthodox stance)
  lShoulder: number;
  lElbowFlex: number;
  lWrist: number;
}

function solveAnatomicalRig(p: AnatomicalRigParams): number[] {
  const rot = p.worldRotationDeg;

  // Torso Chain: Root(0) -> LowerSpine(7) -> UpperChest(8) -> Neck(12) -> Head(13)
  const lowerSpineWorld = normDeg(90 - p.torsoPitch + rot);
  const upperChestWorld = normDeg(90 - p.torsoPitch - p.chestCurve + rot);
  const neckWorld = normDeg(90 - p.torsoPitch - p.chestCurve + p.neckGaze + rot);
  const headWorld = neckWorld;

  // Right Leg Chain: Pelvis(0) -> RThigh(1) -> RShin(2) -> RFoot(3)
  const rThighWorld = normDeg(270 + p.rHip + rot);
  const rKneeClamped = clamp(p.rKneeFlex, 0, 145);
  const rShinWorld = normDeg(270 + p.rHip - rKneeClamped + rot);
  const rFootWorld = normDeg(0 + p.rAnkle + rot);

  // Left Leg Chain: Pelvis(0) -> LThigh(4) -> LShin(5) -> LFoot(6)
  const lThighWorld = normDeg(270 + p.lHip + rot);
  const lKneeClamped = clamp(p.lKneeFlex, 0, 145);
  const lShinWorld = normDeg(270 + p.lHip - lKneeClamped + rot);
  const lFootWorld = normDeg(0 + p.lAnkle + rot);

  // Right Arm Chain: Chest(8) -> RBicep(9) -> RForearm(10) -> RHand(11)
  const rBicepWorld = normDeg(270 + p.rShoulder + rot);
  const rElbowClamped = clamp(p.rElbowFlex, 0, 145);
  const rForearmWorld = normDeg(270 + p.rShoulder + rElbowClamped + rot);
  const rHandWorld = normDeg(rForearmWorld + p.rWrist);

  // Left Arm Chain: Chest(8) -> LBicep(14) -> LForearm(15) -> LHand(16)
  const lBicepWorld = normDeg(270 + p.lShoulder + rot);
  const lElbowClamped = clamp(p.lElbowFlex, 0, 145);
  const lForearmWorld = normDeg(270 + p.lShoulder + lElbowClamped + rot);
  const lHandWorld = normDeg(lForearmWorld + p.lWrist);

  return [
    0,                // 0: Pelvis
    rThighWorld,      // 1: Right Thigh
    rShinWorld,       // 2: Right Shin
    rFootWorld,       // 3: Right Foot
    lThighWorld,      // 4: Left Thigh
    lShinWorld,       // 5: Left Shin
    lFootWorld,       // 6: Left Foot
    lowerSpineWorld,  // 7: Lower Spine
    upperChestWorld,  // 8: Upper Chest
    rBicepWorld,      // 9: Right Bicep
    rForearmWorld,    // 10: Right Forearm
    rHandWorld,       // 11: Right Hand
    neckWorld,        // 12: Neck
    headWorld,        // 13: Head
    lBicepWorld,      // 14: Left Bicep
    lForearmWorld,    // 15: Left Forearm
    lHandWorld,       // 16: Left Hand
  ];
}

export function buildCanonicalCombatFrames(
  config: CombatGeneratorConfig
): CombatKeyframeSpec[] {
  const is24Fps = config.targetFps === 24;
  const numFrames = is24Fps ? 120 : 60;
  const frames: CombatKeyframeSpec[] = [];

  const groundY = config.groundY || 755.0;
  const baseManX = 540.0;
  const targetStationaryX = 735.0;
  const targetStationaryY = 515.0;

  for (let f = 0; f < numFrames; f++) {
    // Normalizing canonical 24 FPS index
    const canonF = is24Fps ? f : f * 2;

    let act = '';
    let technique = '';
    let phase = '';
    let panelId = 1;
    let storyboardTitle = '';
    let notes = '';
    let activeForces: string[] = ['Gravity (1.0g)', 'Ground Reaction Force (Support Pin)'];
    let kineticChainDesc = '';

    let manX = baseManX;
    let manY = groundY - 240.0; // ~515 px standing pelvis
    let bodyRot = 0.0;
    let rigParams: AnatomicalRigParams = {
      worldRotationDeg: 0,
      torsoPitch: 5,
      chestCurve: 4,
      neckGaze: 0,
      rHip: -12,
      rKneeFlex: 16,
      rAnkle: 10,
      lHip: 14,
      lKneeFlex: 18,
      lAnkle: 0,
      rShoulder: 40,
      rElbowFlex: 92,
      rWrist: 0,
      lShoulder: 55,
      lElbowFlex: 85,
      lWrist: 0,
    };

    let targetX = targetStationaryX;
    let targetY = targetStationaryY;
    let isHit = false;
    let hitType: CombatKeyframeSpec['hitType'] = 'none';
    let hitIntensity = 0.0;
    let strikeSpeed = 0.0;
    let leadShoulderElevation = 0.0;
    let torsoCounterRotation = 0.0;
    let isGrounded = true;

    // Camera variables
    let camX = 0;
    let camY = 0;
    let camZoom = 1.0;

    // =========================================================================
    // ACT I: 1-2 LIGHTNING COMBINATION (F0 - F23)
    // =========================================================================
    if (canonF <= 7) {
      // 1. Dynamic Combat Stance & Rhythmic Spring Bounce
      panelId = 1;
      act = 'Act I: 1-2 Lightning Combination';
      technique = 'Orthodox Combat Bounce & Guard';
      phase = 'Dynamic Stance & Spring Loading';
      storyboardTitle = 'Dynamic Combat Stance & Spring Loading';
      notes = 'Rhythmic fighting bounce with chin tucked behind lead shoulder. Achillean tendon spring-loading.';
      kineticChainDesc = 'Bilateral ankle elasticity -> pelvis vertical bob (+/- 4px) -> thoracic counter-sway';

      const bounceProgress = (canonF % 8) / 8;
      const bounceSin = Math.sin(bounceProgress * Math.PI * 2);
      manX = baseManX + Math.sin(bounceProgress * Math.PI) * 2;
      manY = groundY - 240.0 + bounceSin * 4.0;

      rigParams.torsoPitch = 6 + bounceSin * 1.5;
      rigParams.rHip = -14 + bounceSin * 2;
      rigParams.rKneeFlex = 18 + bounceSin * 4;
      rigParams.rAnkle = 12;
      rigParams.lHip = 15 - bounceSin * 2;
      rigParams.lKneeFlex = 20 - bounceSin * 4;
      rigParams.lAnkle = 0;
      // High guard
      rigParams.rShoulder = 38 + bounceSin * 2;
      rigParams.rElbowFlex = 95;
      rigParams.lShoulder = 58 + bounceSin * 2;
      rigParams.lElbowFlex = 84;
    } else if (canonF <= 14) {
      // 2. Piston Lead Jab (F8 - F14) - Peak Hit at F11
      panelId = 2;
      act = 'Act I: 1-2 Lightning Combination';
      technique = 'Lead Left Jab (1-Strike)';
      phase = canonF <= 11 ? 'Forward Drive & Distal Whip' : 'Elastic Recoil Retraction';
      storyboardTitle = 'Piston Lead Jab & Scapular Protraction';
      notes = 'Lead foot steps forward; lead shoulder protracts shielding chin. Left arm fires straight through centerline.';
      kineticChainDesc = 'Rear ankle GRF -> pelvic pivot (+14 deg) -> scapular protraction -> elbow snap -> fist recoil';

      if (canonF <= 11) {
        const t = (canonF - 8) / 3.0; // 0..1
        const ease = easeOutQuad(t);
        manX = baseManX + ease * 24.0; // Quick step forward
        manY = groundY - 242.0;
        rigParams.torsoPitch = 7 + ease * 4;
        rigParams.chestCurve = 6;
        leadShoulderElevation = ease * 12.0;

        // Lead Arm Snap
        rigParams.lShoulder = lerp(58, 86, ease);
        rigParams.lElbowFlex = lerp(84, 8, ease); // Snap from 84° to 8° (full straight jab extension!)
        rigParams.lWrist = 0;

        // Rear Arm Stays firmly glued to jaw (protective guard)
        rigParams.rShoulder = 36;
        rigParams.rElbowFlex = 98;

        // Stance legs
        rigParams.rHip = lerp(-14, -20, ease);
        rigParams.rKneeFlex = 16;
        rigParams.lHip = lerp(15, 26, ease);
        rigParams.lKneeFlex = 22;

        if (canonF === 11) {
          isHit = true;
          hitType = 'jab';
          hitIntensity = 0.85;
          strikeSpeed = 26.5;
          targetX = targetStationaryX + 6;
        }
      } else {
        // Recoil back (F12 - F14)
        const t = (canonF - 11) / 3.0;
        const ease = easeInQuad(t);
        manX = baseManX + 24.0 - ease * 8.0;
        manY = groundY - 241.0;
        rigParams.torsoPitch = 11 - ease * 2;
        leadShoulderElevation = 12.0 * (1 - ease);

        // Arm recoils back along same straight line
        rigParams.lShoulder = lerp(86, 68, ease);
        rigParams.lElbowFlex = lerp(8, 62, ease);

        // Rear arm pre-loading for the cross!
        rigParams.rShoulder = lerp(36, 42, ease);
        rigParams.rElbowFlex = lerp(98, 92, ease);

        rigParams.rHip = -20;
        rigParams.lHip = 24;
      }
    } else if (canonF <= 23) {
      // 3. Power Rear Cross (F15 - F23) - Peak Hit at F19
      panelId = 3;
      act = 'Act I: 1-2 Lightning Combination';
      technique = 'Rear Right Power Cross (2-Strike)';
      phase = canonF <= 19 ? 'Ground Torso Drive & Centerline Thrust' : 'Follow-Through & Slip Pre-load';
      storyboardTitle = 'Explosive Power Rear Cross & Hip Torque';
      notes = 'Rear foot drives off ball of foot. Pelvis rotates 42°, driving right fist straight into target with crushing kinetic energy.';
      kineticChainDesc = 'Rear ball of foot pivot -> pelvic rotation (42 deg) -> thoracic rotation -> right elbow snap -> lead guard lock';

      if (canonF <= 19) {
        const t = (canonF - 14) / 5.0; // 0..1
        const ease = easeOutQuad(t);
        manX = baseManX + 16.0 + ease * 12.0;
        manY = groundY - 240.0;

        torsoCounterRotation = ease * 34.0;
        rigParams.torsoPitch = 9 + ease * 5;
        rigParams.chestCurve = 4;

        // Rear Cross Extension
        rigParams.rShoulder = lerp(42, 90, ease);
        rigParams.rElbowFlex = lerp(92, 6, ease); // Fully straight piercing cross!

        // Lead arm recoils back to shield temple
        rigParams.lShoulder = lerp(68, 48, ease);
        rigParams.lElbowFlex = lerp(62, 96, ease);

        // Rear foot pivot on ball
        rigParams.rHip = lerp(-20, -6, ease);
        rigParams.rKneeFlex = lerp(16, 28, ease);
        rigParams.rAnkle = 24; // Heel rotated up
        rigParams.lHip = lerp(24, 28, ease);
        rigParams.lKneeFlex = 24;

        if (canonF === 19) {
          isHit = true;
          hitType = 'cross';
          hitIntensity = 1.0;
          strikeSpeed = 34.0;
          targetX = targetStationaryX + 18;
          targetY = targetStationaryY - 4;
        }
      } else {
        // Follow-through into slip preparation (F20 - F23)
        const t = (canonF - 19) / 4.0;
        const ease = easeInOutCubic(t);
        manX = baseManX + 28.0 - ease * 4.0;
        manY = groundY - 240.0 + ease * 8.0; // Beginning downward crouch

        torsoCounterRotation = 34.0 * (1 - ease * 0.7);
        rigParams.torsoPitch = 14 - ease * 2;
        rigParams.rShoulder = lerp(90, 65, ease);
        rigParams.rElbowFlex = lerp(6, 68, ease);
        rigParams.lShoulder = 48;
        rigParams.lElbowFlex = 96;

        rigParams.rKneeFlex = lerp(28, 36, ease);
        rigParams.lKneeFlex = lerp(24, 34, ease);
      }
    }
    // =========================================================================
    // ACT II: SLIP & WEAVE INTO LIVER HOOK & UPPERCUT (F24 - F47)
    // =========================================================================
    else if (canonF <= 31) {
      // 4. Defensive Bob & Weave (Slip) (F24 - F31)
      panelId = 4;
      act = 'Act II: Defensive Slip & Mid-Section Body Rip';
      technique = 'Parabolic U-Slip & Core Compression';
      phase = 'Deceleration & Low Elastic Core Loading';
      storyboardTitle = 'Defensive Bob & Weave (Slip) Under Counter';
      notes = 'Both knees flex deeply as pelvis drops 28px, ducking under incoming counter in smooth parabolic U-curve.';
      kineticChainDesc = 'Bilateral knee flexion (118 deg) -> pelvic drop (28px) -> thoracic lateral slip -> vestibular target lock';

      const t = (canonF - 24) / 7.0; // 0..1
      const dipSin = Math.sin(t * Math.PI); // 0 -> 1 -> 0

      manX = baseManX + 24.0 + Math.sin(t * Math.PI * 2) * 8.0;
      manY = groundY - 240.0 + dipSin * 28.0; // Deep squat dip

      rigParams.torsoPitch = 12 + dipSin * 8;
      rigParams.chestCurve = 6 + dipSin * 6;
      rigParams.neckGaze = -dipSin * 8; // Chin stays tucked, eyes locked forward

      rigParams.rHip = -14 + dipSin * 10;
      rigParams.rKneeFlex = 36 + dipSin * 34; // Deep knee compression
      rigParams.lHip = 18 + dipSin * 8;
      rigParams.lKneeFlex = 34 + dipSin * 36;

      // Both fists anchored in tight high earmuff guard
      rigParams.rShoulder = 42;
      rigParams.rElbowFlex = 105;
      rigParams.lShoulder = 46;
      rigParams.lElbowFlex = 108;
    } else if (canonF <= 39) {
      // 5. Savage Liver Hook (Body Rip) (F32 - F39) - Peak Hit at F36
      panelId = 5;
      act = 'Act II: Defensive Slip & Mid-Section Body Rip';
      technique = 'Lead Left Liver Hook (Body Rip)';
      phase = canonF <= 36 ? 'Rotational Uncoiling & Horizontal Hook Whip' : 'Hook Follow-Through & Uppercut Preload';
      storyboardTitle = 'Savage Liver Hook (Body Rip) & Torsional Whip';
      notes = 'Uncoiling violently from slip: lead hip whips clockwise; left arm locks at 90° horizontal hook crushing the body.';
      kineticChainDesc = 'Lead foot push-off -> lead hip torque -> rigid 90 deg elbow structure -> mid-level body impact';

      if (canonF <= 36) {
        const t = (canonF - 32) / 4.0;
        const ease = easeOutQuad(t);
        manX = baseManX + 20.0 + ease * 12.0;
        manY = groundY - 228.0 - ease * 8.0; // Rising out of crouch

        torsoCounterRotation = -ease * 38.0; // Explosive left hip rotation
        rigParams.torsoPitch = 14 - ease * 4;
        rigParams.chestCurve = 4;

        // Left Hook Arm: Shoulder drives forward-horizontal, elbow locked at ~88°
        rigParams.lShoulder = lerp(46, 82, ease);
        rigParams.lElbowFlex = 88; // Rigid hook structure!
        rigParams.lWrist = lerp(0, 18, ease);

        // Right Hand guards temple
        rigParams.rShoulder = 38;
        rigParams.rElbowFlex = 100;

        rigParams.rKneeFlex = lerp(60, 24, ease);
        rigParams.lKneeFlex = lerp(62, 20, ease);

        if (canonF === 36) {
          isHit = true;
          hitType = 'liver-hook';
          hitIntensity = 0.95;
          strikeSpeed = 30.0;
          targetX = targetStationaryX - 10;
          targetY = targetStationaryY + 35; // Low liver target level!
        }
      } else {
        const t = (canonF - 36) / 3.0;
        const ease = easeInQuad(t);
        manX = baseManX + 32.0;
        manY = groundY - 236.0;

        torsoCounterRotation = -38.0 * (1 - ease * 0.6);
        rigParams.lShoulder = lerp(82, 60, ease);
        rigParams.lElbowFlex = lerp(88, 92, ease);
        rigParams.rShoulder = 38;
        rigParams.rElbowFlex = 100;
      }
    } else if (canonF <= 47) {
      // 6. Vertical Lead Uppercut (F40 - F47) - Peak Hit at F44
      panelId = 6;
      act = 'Act II: Defensive Slip & Mid-Section Body Rip';
      technique = 'Lead Vertical Uppercut';
      phase = canonF <= 44 ? 'Vertical Ground Reaction Impulse & Centerline Scoop' : 'Apex Recoil & Stance Reset';
      storyboardTitle = 'Vertical Ground Drive Lead Uppercut';
      notes = 'Lead knee explodes upward; left fist scoops vertically through opponent jaw with thoracic posterior recoil.';
      kineticChainDesc = 'Ground vertical GRF -> knee extension -> pelvis rise (+14px) -> vertical fist scoop -> cervical recoil';

      if (canonF <= 44) {
        const t = (canonF - 40) / 4.0;
        const ease = easeOutQuad(t);
        manX = baseManX + 30.0 + ease * 6.0;
        manY = groundY - 248.0 - ease * 12.0; // Pelvic rise upward!

        rigParams.torsoPitch = lerp(10, -6, ease); // Slight posterior counter-recoil lean!
        rigParams.chestCurve = 2;

        // Vertical Uppercut Scoop
        rigParams.lShoulder = lerp(60, 108, ease); // Upward angle!
        rigParams.lElbowFlex = lerp(92, 42, ease);
        rigParams.lWrist = 10;

        // Rear high shield
        rigParams.rShoulder = 36;
        rigParams.rElbowFlex = 98;

        rigParams.rKneeFlex = 18;
        rigParams.lKneeFlex = 12; // Almost straight leg driving upward

        if (canonF === 44) {
          isHit = true;
          hitType = 'uppercut';
          hitIntensity = 0.92;
          strikeSpeed = 28.0;
          targetX = targetStationaryX - 4;
          targetY = targetStationaryY - 14; // High chin target level!
        }
      } else {
        const t = (canonF - 44) / 3.0;
        const ease = easeInOutCubic(t);
        manX = baseManX + 36.0;
        manY = groundY - 260.0 + ease * 18.0;

        rigParams.torsoPitch = lerp(-6, 6, ease);
        rigParams.lShoulder = lerp(108, 62, ease);
        rigParams.lElbowFlex = lerp(42, 85, ease);
        rigParams.rKneeFlex = 18;
        rigParams.lKneeFlex = 18;
      }
    }
    // =========================================================================
    // ACT III: 360° SPINNING BACK KICK / WHEEL THRUST (F48 - F71)
    // =========================================================================
    else if (canonF <= 54) {
      // 7. Step-Through Stance Pivot & Spotting (F48 - F54)
      panelId = 7;
      act = 'Act III: 360° Spinning Back Kick / Wheel Thrust';
      technique = 'Lead Stance Pivot & Target Spotting';
      phase = 'Stance Pivot & Vestibular Target Spotting';
      storyboardTitle = 'Step-Through Stance Pivot & Vestibular Spotting';
      notes = 'Lead foot steps across and pivots 90° on ball of foot. Head turns over shoulder FIRST, spotting target before spin!';
      kineticChainDesc = 'Ball of foot pivot (90 deg) -> hip torque -> cervical spotting reflex -> compact arm guard';

      const t = (canonF - 48) / 6.0;
      const ease = easeInOutCubic(t);

      manX = baseManX + 36.0 - ease * 12.0;
      manY = groundY - 240.0;

      bodyRot = ease * 75.0; // Early rotation
      rigParams.torsoPitch = 6;
      rigParams.neckGaze = -ease * 55.0; // CRITICAL: Head counter-turns to SPOT TARGET over rear shoulder!

      // Arms tuck in to reduce rotational inertia
      rigParams.rShoulder = 35;
      rigParams.rElbowFlex = 100;
      rigParams.lShoulder = 42;
      rigParams.lElbowFlex = 105;

      rigParams.lAnkle = ease * 45.0; // Lead foot pivoting
      rigParams.rHip = -10 + ease * 25.0;
      rigParams.rKneeFlex = 20 + ease * 40.0; // Beginning chamber
    } else if (canonF <= 60) {
      // 8. Tight Chamber & Conservation of Angular Momentum (F55 - F60)
      panelId = 8;
      act = 'Act III: 360° Spinning Back Kick / Wheel Thrust';
      technique = 'Spinning Kick Chamber (Compact Tuck)';
      phase = 'Rotational Acceleration & Inertia Reduction';
      storyboardTitle = 'Tight Chamber & Conservation of Angular Momentum';
      notes = 'Right kicking leg tucks tight to pelvis (knee flexes to 135°), cutting moment of inertia and accelerating rotation.';
      kineticChainDesc = 'Reduced rotational radius r -> angular acceleration dθ/dt -> gluteal stretch -> target alignment';

      const t = (canonF - 55) / 5.0;
      const ease = easeInOutCubic(t);

      manX = baseManX + 24.0;
      manY = groundY - 242.0;

      bodyRot = 75.0 + ease * 95.0; // Now at 170° facing backward towards target!
      rigParams.torsoPitch = 8 + ease * 14; // Torso prepares to lean back
      rigParams.neckGaze = -55.0 + ease * 40.0; // Head looking directly past shoulder at opponent

      // Right leg deeply chambered!
      rigParams.rHip = lerp(15, -45, ease); // Drawing knee up to chest
      rigParams.rKneeFlex = lerp(60, 132, ease); // Deep acute tuck

      // Support left leg solid on ground
      rigParams.lHip = 10;
      rigParams.lKneeFlex = 24;

      // Arms compact
      rigParams.rShoulder = 30;
      rigParams.rElbowFlex = 110;
      rigParams.lShoulder = 35;
      rigParams.lElbowFlex = 110;
    } else if (canonF <= 65) {
      // 9. Linear Heel Piston Thrust (Back Kick Peak) (F61 - F65) - Peak Hit at F63
      panelId = 9;
      act = 'Act III: 360° Spinning Back Kick / Wheel Thrust';
      technique = 'Spinning Back Kick (Heel Impact)';
      phase = canonF <= 63 ? 'Linear Heel Drive & Horizontal Core Lean' : 'Impact Freeze & Elastic Retraction';
      storyboardTitle = 'Linear Heel Piston Thrust (360° Back Kick Peak)';
      notes = 'Straight linear heel piston drives straight through opponent chest. Torso counter-leans horizontally for balance!';
      kineticChainDesc = 'Full linear hamstring extension -> heel impact -> horizontal torso counterbalance lean -> contralateral arm wing';

      if (canonF <= 63) {
        const t = (canonF - 61) / 2.0;
        const ease = easeOutQuad(t);

        manX = baseManX + 24.0 + ease * 10.0;
        manY = groundY - 242.0;

        bodyRot = 170.0 + ease * 10.0; // 180° complete turn!
        rigParams.torsoPitch = lerp(22, 68, ease); // Deep horizontal counterbalance lean!

        // Right Leg explosive linear extension!
        rigParams.rHip = lerp(-45, 82, ease); // Driving heel toward target
        rigParams.rKneeFlex = lerp(132, 6, ease); // Full extension (6° safety)
        rigParams.rAnkle = -20; // Dorsiflexed heel leading!

        // Support Left Leg
        rigParams.lHip = 14;
        rigParams.lKneeFlex = 26;

        // Left arm extends back as aerodynamic counterweight
        rigParams.lShoulder = lerp(35, -45, ease);
        rigParams.lElbowFlex = 25;
        rigParams.rShoulder = 25;
        rigParams.rElbowFlex = 95;

        if (canonF === 63) {
          isHit = true;
          hitType = 'back-kick';
          hitIntensity = 1.0;
          strikeSpeed = 38.0;
          targetX = targetStationaryX + 25;
          targetY = targetStationaryY + 12;
        }
      } else {
        // Immediate retraction chamber (F64 - F65)
        const t = (canonF - 63) / 2.0;
        const ease = easeInOutCubic(t);

        manX = baseManX + 34.0;
        manY = groundY - 242.0;

        bodyRot = 180.0 + ease * 40.0;
        rigParams.torsoPitch = lerp(68, 30, ease);

        // Retract kicking leg back to chamber (prevent capture!)
        rigParams.rHip = lerp(82, 10, ease);
        rigParams.rKneeFlex = lerp(6, 95, ease);
        rigParams.lKneeFlex = 28;
      }
    } else if (canonF <= 71) {
      // 10. Dynamic Retraction & Foot Plant (F66 - F71)
      panelId = 10;
      act = 'Act III: 360° Spinning Back Kick / Wheel Thrust';
      technique = 'Kick Chamber Retract & Stance Return';
      phase = 'Controlled Retraction & Ground Planting';
      storyboardTitle = 'Dynamic Retraction & Stance Stabilization';
      notes = 'Right foot touches down smoothly on ground plane Y = 755.0, restoring bilateral stability polygon.';
      kineticChainDesc = 'Knee retraction -> rotational dissipation -> bilateral ground contact -> elastic balance restore';

      const t = (canonF - 66) / 5.0;
      const ease = easeInOutCubic(t);

      manX = baseManX + 34.0 - ease * 8.0;
      manY = groundY - 242.0;

      bodyRot = (220.0 + ease * 140.0) % 360; // Completes 360° rotation!
      if (bodyRot > 180) bodyRot -= 360; // Back to ~0°

      rigParams.torsoPitch = lerp(30, 8, ease);
      rigParams.neckGaze = 0;

      rigParams.rHip = lerp(10, 14, ease);
      rigParams.rKneeFlex = lerp(95, 22, ease);
      rigParams.lHip = lerp(14, -14, ease);
      rigParams.lKneeFlex = lerp(28, 20, ease);

      rigParams.rShoulder = 38;
      rigParams.rElbowFlex = 95;
      rigParams.lShoulder = 54;
      rigParams.lElbowFlex = 85;
    }
    // =========================================================================
    // ACT IV: SWITCH STANCE FLYING KNEE (F72 - F95)
    // =========================================================================
    else if (canonF <= 77) {
      // 11. Scissor Switch-Hop (F72 - F77)
      panelId = 10;
      act = 'Act IV: Switch Stance Muay Thai Flying Knee';
      technique = 'Scissor Switch Hop';
      phase = 'Stance Inversion & Tendon Preload';
      storyboardTitle = 'Rapid Scissor Switch-Hop & Launch Pre-load';
      notes = 'Feet scissor in mid-air (micro-hop), exchanging stance to load the rear spring for explosive takeoff.';
      kineticChainDesc = 'Micro-hop airborne transition -> bilateral limb scissor -> rear calf pre-stretch';

      const t = (canonF - 72) / 5.0;
      const hopSin = Math.sin(t * Math.PI);

      manX = baseManX + 26.0 + t * 6.0;
      manY = groundY - 240.0 - hopSin * 14.0; // Micro-hop

      rigParams.torsoPitch = 8 + hopSin * 4;

      // Feet scissor positions
      rigParams.rHip = lerp(14, -22, t);
      rigParams.lHip = lerp(-14, 24, t);
      rigParams.rKneeFlex = 22 + hopSin * 20;
      rigParams.lKneeFlex = 20 + hopSin * 18;

      rigParams.rShoulder = 42;
      rigParams.rElbowFlex = 90;
      rigParams.lShoulder = 50;
      rigParams.lElbowFlex = 90;
    } else if (canonF <= 83) {
      // 12. Explosive Ground Launch into Air (F78 - F83)
      panelId = 11;
      act = 'Act IV: Switch Stance Muay Thai Flying Knee';
      technique = 'Muay Thai Hanuman Flying Knee';
      phase = 'Explosive Takeoff & Upward Parabolic Drive';
      storyboardTitle = 'Explosive Airborne Launch & Lead Knee Drive';
      notes = 'Violent ground push-off launches fighter airborne. Lead leg punches upward to accelerate vertical momentum.';
      kineticChainDesc = 'Ground normal force impulse (> 2.8x BW) -> ballistic launch -> left leg swing momentum';

      const t = (canonF - 78) / 5.0;
      const ease = easeInQuad(t);

      manX = baseManX + 32.0 + t * 24.0;
      manY = groundY - 240.0 - ease * 75.0; // Soaring skyward
      isGrounded = false;

      rigParams.torsoPitch = 12 - ease * 16; // Torso begins arching back

      // Lead left leg drives upward
      rigParams.lHip = lerp(24, 75, ease);
      rigParams.lKneeFlex = lerp(20, 85, ease);

      // Trailing right leg begins spear knee chamber
      rigParams.rHip = lerp(-22, 15, ease);
      rigParams.rKneeFlex = lerp(22, 95, ease);

      // Arms begin downward whip
      rigParams.rShoulder = lerp(42, 10, ease);
      rigParams.lShoulder = lerp(50, 15, ease);
    } else if (canonF <= 89) {
      // 13. Hanuman Flying Knee Apex Thrust (F84 - F89) - Peak Hit at F86
      panelId = 11;
      act = 'Act IV: Switch Stance Muay Thai Flying Knee';
      technique = 'Muay Thai Hanuman Flying Knee';
      phase = canonF <= 86 ? 'Ballistic Apex Thrust & Core Extension' : 'Parabolic Descent & Landing Preparation';
      storyboardTitle = 'Hanuman Flying Knee Thrust & Airborne Arc';
      notes = 'Right knee drives spear-sharp into target at ballistic flight apex. Pelvis thrusts forward; arms whip down.';
      kineticChainDesc = 'Ballistic apex (Y = 440px) -> pelvic thrust -> acute knee spear (130 deg flexion) -> bilateral arm whip';

      const t = (canonF - 84) / 5.0;
      // Parabolic flight arc
      const apexArc = 4 * t * (1 - t);
      manX = baseManX + 56.0 + t * 28.0;
      manY = groundY - 315.0 - apexArc * 20.0; // High apex!
      isGrounded = false;

      rigParams.torsoPitch = -16; // Lumbar hyperextension (arching back like a bow!)
      rigParams.chestCurve = -4;

      // Spear Knee: Right hip flexes high, knee bent tight (130°)
      rigParams.rHip = 88; // Pointing forward-up!
      rigParams.rKneeFlex = 128; // Acute spear point!
      rigParams.rAnkle = -30;

      // Trailing leg hangs back
      rigParams.lHip = -30;
      rigParams.lKneeFlex = 35;

      // Classic Muay Thai arm whip: Both arms whip straight down and back!
      rigParams.rShoulder = -35;
      rigParams.rElbowFlex = 20;
      rigParams.lShoulder = -30;
      rigParams.lElbowFlex = 25;

      if (canonF === 86) {
        isHit = true;
        hitType = 'flying-knee';
        hitIntensity = 1.0;
        strikeSpeed = 36.0;
        targetX = targetStationaryX + 32;
        targetY = targetStationaryY - 20;
      }
    } else if (canonF <= 95) {
      // 14. Touchdown & Landing Shock Absorption (F90 - F95)
      panelId = 12;
      act = 'Act IV: Switch Stance Muay Thai Flying Knee';
      technique = 'Landing Cushion & Impact Absorption';
      phase = 'Ground Contact Cushion & Kinetic Recovery';
      storyboardTitle = 'Landing Impact Cushion & Shock Absorption';
      notes = 'Touchdown on balls of feet; ankles dorsiflex and knees compress to absorb vertical momentum without stiffness.';
      kineticChainDesc = 'Toe touchdown -> ankle dorsiflexion -> knee flexion shock absorption (115 deg) -> core stabilization';

      const t = (canonF - 90) / 5.0;
      const ease = easeOutQuad(t);

      manX = baseManX + 84.0 + ease * 12.0;
      // Dropping back down to ground plane with compression cushion
      manY = lerp(groundY - 280.0, groundY - 225.0, ease);

      const compressSin = Math.sin(t * Math.PI);
      manY += compressSin * 16.0; // Deep pelvic cushion

      rigParams.torsoPitch = lerp(-16, 15, ease);
      rigParams.chestCurve = 6;

      rigParams.rHip = lerp(88, 12, ease);
      rigParams.rKneeFlex = lerp(128, 45, ease) + compressSin * 25.0; // Landing compression
      rigParams.lHip = lerp(-30, -10, ease);
      rigParams.lKneeFlex = lerp(35, 42, ease) + compressSin * 25.0;

      // Hands return to guard
      rigParams.rShoulder = lerp(-35, 38, ease);
      rigParams.rElbowFlex = lerp(20, 92, ease);
      rigParams.lShoulder = lerp(-30, 48, ease);
      rigParams.lElbowFlex = lerp(25, 90, ease);
    }
    // =========================================================================
    // ACT V: LIGHTNING MULTI-HIT BLITZ FLURRY & COMBAT SETTLE (F96 - F119)
    // =========================================================================
    else if (canonF <= 105) {
      // 15. Rapid Cross-Jab Flurry (F96 - F105) - Hits at F98, F102
      panelId = 12;
      act = 'Act V: Lightning Multi-Hit Blitz Flurry & Settle';
      technique = 'Rapid Cross-Jab Blitz Flurry';
      phase = 'High-Frequency Distal Flurry';
      storyboardTitle = 'Rapid Machine-Gun Cross-Jab Combination';
      notes = 'Lightning-fast alternate strikes with minimal recovery phase. Dynamic hip pulsing and razor-sharp extension.';
      kineticChainDesc = 'Alternating pelvic pulses -> immediate reciprocal shoulder protraction -> target barrage';

      manX = baseManX + 96.0;
      manY = groundY - 240.0;

      if (canonF <= 100) {
        // Strike 1: Rapid Right Cross (Hit at F98)
        const t = (canonF - 96) / 4.0;
        const snap = Math.sin(t * Math.PI);
        rigParams.rShoulder = 40 + snap * 48.0;
        rigParams.rElbowFlex = 92 - snap * 82.0; // Snaps straight
        rigParams.lShoulder = 48;
        rigParams.lElbowFlex = 95;
        torsoCounterRotation = snap * 24.0;

        if (canonF === 98) {
          isHit = true;
          hitType = 'cross';
          hitIntensity = 0.88;
          strikeSpeed = 32.0;
          targetX = targetStationaryX + 16;
        }
      } else {
        // Strike 2: Rapid Left Hook (Hit at F102)
        const t = (canonF - 100) / 4.0;
        const snap = Math.sin(t * Math.PI);
        rigParams.lShoulder = 48 + snap * 38.0;
        rigParams.lElbowFlex = 90; // Hook angle
        rigParams.rShoulder = 42;
        rigParams.rElbowFlex = 98;
        torsoCounterRotation = -snap * 26.0;

        if (canonF === 102) {
          isHit = true;
          hitType = 'liver-hook';
          hitIntensity = 0.86;
          strikeSpeed = 29.0;
          targetX = targetStationaryX + 8;
        }
      }

      rigParams.rKneeFlex = 22;
      rigParams.lKneeFlex = 22;
    } else if (canonF <= 112) {
      // 16. Decisive Horizontal Elbow Slash (F106 - F112) - Peak Hit at F109
      panelId = 12;
      act = 'Act V: Lightning Multi-Hit Blitz Flurry & Settle';
      technique = 'Lead Horizontal Elbow Slash';
      phase = canonF <= 109 ? 'Elbow Blade Acceleration & Torsional Cut' : 'Follow-Through Slice';
      storyboardTitle = 'Decisive Horizontal Elbow Slash (Cutting Blade)';
      notes = 'Lead step-in, right arm folds flush into razor elbow blade (140° flexion) slicing diagonally through target.';
      kineticChainDesc = 'Full rotational torque -> acute 140 deg elbow blade -> cutting diagonal follow-through';

      if (canonF <= 109) {
        const t = (canonF - 106) / 3.0;
        const ease = easeOutQuad(t);
        manX = baseManX + 96.0 + ease * 12.0;
        manY = groundY - 240.0;

        torsoCounterRotation = ease * 42.0;
        rigParams.torsoPitch = 10 + ease * 4;

        // Razor Elbow: Forearm folded tight against bicep!
        rigParams.rShoulder = lerp(42, 92, ease);
        rigParams.rElbowFlex = 138; // Acute sharp elbow point!
        rigParams.lShoulder = 38;
        rigParams.lElbowFlex = 102;

        if (canonF === 109) {
          isHit = true;
          hitType = 'elbow';
          hitIntensity = 1.0;
          strikeSpeed = 35.0;
          targetX = targetStationaryX + 22;
          targetY = targetStationaryY - 8;
        }
      } else {
        const t = (canonF - 109) / 3.0;
        const ease = easeInOutCubic(t);
        manX = baseManX + 108.0;
        manY = groundY - 240.0;

        torsoCounterRotation = 42.0 * (1 - ease * 0.5);
        rigParams.rShoulder = lerp(92, 70, ease);
        rigParams.rElbowFlex = lerp(138, 110, ease);
      }
    } else {
      // 17. Martial Exhalation, Dynamic Recovery & Guard (F113 - F119)
      panelId = 12;
      act = 'Act V: Lightning Multi-Hit Blitz Flurry & Settle';
      technique = 'Martial Recovery & Orthodox Combat Guard';
      phase = 'Harmonic Momentum Dissipation & Guard Equilibrium';
      storyboardTitle = 'Martial Exhalation, Dynamic Recovery & Guard';
      notes = 'Rotational momentum dissipates through damped harmonic settling. Fighter resumes balanced high guard.';
      kineticChainDesc = 'Core rotational deceleration -> bilateral stance re-centering -> deep respiratory exhale';

      const t = (canonF - 113) / 6.0;
      const ease = easeInOutCubic(t);

      manX = baseManX + 108.0 - ease * 12.0;
      manY = groundY - 240.0;

      torsoCounterRotation = 21.0 * (1 - ease);
      rigParams.torsoPitch = lerp(12, 6, ease);
      rigParams.chestCurve = 4;
      rigParams.neckGaze = 0;

      rigParams.rHip = lerp(0, -12, ease);
      rigParams.rKneeFlex = lerp(26, 16, ease);
      rigParams.lHip = lerp(18, 14, ease);
      rigParams.lKneeFlex = lerp(26, 18, ease);

      // Smooth settling of hands to guard
      rigParams.rShoulder = lerp(70, 38, ease);
      rigParams.rElbowFlex = lerp(110, 95, ease);
      rigParams.lShoulder = lerp(45, 56, ease);
      rigParams.lElbowFlex = lerp(98, 85, ease);
    }

    // Solve Rig & Compute Forward Kinematics
    rigParams.worldRotationDeg = bodyRot;
    const manAngles = solveAnatomicalRig(rigParams);

    // Environmental Ground Perimeter Enforcement:
    // Strictly prevents feet and limbs from penetrating below groundY (default 755.0 px)
    const fkPreview = solveForwardKinematics17(manX, manY, manAngles, 0.5);
    const rFootDeep = Math.max(fkPreview[3].startY, fkPreview[3].endY);
    const lFootDeep = Math.max(fkPreview[6].startY, fkPreview[6].endY);
    const deepestFootY = Math.max(rFootDeep, lFootDeep);
    if (deepestFootY > groundY) {
      manY -= (deepestFootY - groundY);
    }

    // Compute Center of Mass with finalized ground-constrained root
    const com = calculateCenterOfMass17(manX, manY, manAngles, 0.5);

    // Dynamic Support Base
    const footSpan = 55.0;
    const supportMinX = isGrounded ? manX - footSpan * 0.5 : com.comX - 10;
    const supportMaxX = isGrounded ? manX + footSpan * 0.5 : com.comX + 10;
    const stabilityMargin = isGrounded
      ? Math.min(com.comX - supportMinX, supportMaxX - com.comX)
      : -15;
    const isBalanced = isGrounded ? stabilityMargin >= -25 : true; // Dynamic running/striking balance

    // Camera follow centering
    camX = (manX - 540) * 0.45;
    camY = (manY - 515) * 0.35;
    camZoom = 1.0;

    frames.push({
      frame: f,
      act,
      technique,
      phase,
      manX,
      manY,
      bodyRotationDeg: bodyRot,
      manAngles,
      targetX,
      targetY,
      isHitFrame: isHit,
      hitType,
      hitIntensity,
      comX: com.comX,
      comY: com.comY,
      supportMinX,
      supportMaxX,
      isGrounded,
      isBalanced,
      stabilityMargin,
      kineticVelocityX: 0,
      kineticVelocityY: 0,
      strikeSpeedPxPerFrame: strikeSpeed,
      leadShoulderElevation,
      torsoCounterRotationDeg: torsoCounterRotation,
      angularVelocityDegPerFrame: 0,
      camX,
      camY,
      camZoom,
      panelId,
      storyboardTitle,
      notes,
      activeForces,
      kineticChainDesc,
    });
  }

  // Calculate derivatives: kinetic velocity & angular velocity
  for (let i = 1; i < frames.length; i++) {
    const prev = frames[i - 1];
    const curr = frames[i];
    curr.kineticVelocityX = curr.manX - prev.manX;
    curr.kineticVelocityY = curr.manY - prev.manY;
    curr.angularVelocityDegPerFrame = curr.bodyRotationDeg - prev.bodyRotationDeg;
  }

  return frames;
}
