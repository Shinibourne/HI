import { ParkourKeyframeSpec, ParkourGeneratorConfig } from './parkourTypes';
import { calculateCenterOfMass17 } from '../skills/biomechanicalPhysics';

/**
 * Normalizes an angle into [0, 360)
 */
function normDeg(d: number): number {
  let a = d % 360;
  if (a < 0) a += 360;
  return a;
}

/**
 * Cubic ease in-out
 */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Anatomical Character Rig Parameters for Stick Nodes 17-bone skeleton.
 *
 * Persistent coordinate principles:
 * - worldForward is ALWAYS +1 (facing Right, along +X axis).
 * - Upright spine is at 90° (pointing UP, -Y in screen space).
 * - Standing leg is at 270° (pointing DOWN, +Y in screen space).
 * - Feet point forward along +X (0° in screen space).
 * - Knees ONLY flex backward towards hamstrings (kneeFlex >= 0).
 * - Elbows ONLY flex forward towards biceps/chest (elbowFlex >= 0).
 * - When body rotates by worldRotationDeg, the entire hierarchical rig
 *   rotates seamlessly as a single biomechanical entity.
 */
interface AnatomicalRigParams {
  worldRotationDeg: number; // Whole-body tilt around pelvis (0 = upright facing +X)
  torsoPitch: number;       // Spine lean (deg, positive = leaning forward towards +X)
  chestCurve: number;       // Thoracic curvature (deg, positive = rounding into tuck)
  neckGaze: number;         // Neck & head gaze compensation (deg)
  
  // Right Leg
  rHip: number;             // Hip flexion (deg, positive = swing forward towards +X)
  rKneeFlex: number;        // Knee flexion (deg, >= 0, bends backward)
  rAnkle: number;           // Foot angle relative to horizontal (deg)
  
  // Left Leg
  lHip: number;             // Hip flexion (deg, positive = swing forward towards +X)
  lKneeFlex: number;        // Knee flexion (deg, >= 0, bends backward)
  lAnkle: number;           // Foot angle relative to horizontal (deg)
  
  // Right Arm
  rShoulder: number;        // Shoulder angle (deg, positive = swing forward/up)
  rElbowFlex: number;       // Elbow flexion (deg, >= 0, bends forward)
  rWrist: number;
  
  // Left Arm
  lShoulder: number;        // Shoulder angle (deg, positive = swing forward/up)
  lElbowFlex: number;       // Elbow flexion (deg, >= 0, bends forward)
  lWrist: number;
}

/**
 * Computes the 17 world angles strictly enforcing the anatomical bone hierarchy:
 * 0: Pelvis (Root)
 * 1: Right Thigh (parent: 0)
 * 2: Right Shin (parent: 1)
 * 3: Right Foot (parent: 2)
 * 4: Left Thigh (parent: 0)
 * 5: Left Shin (parent: 4)
 * 6: Left Foot (parent: 5)
 * 7: Lower Spine (parent: 0)
 * 8: Upper Chest (parent: 7)
 * 9: Right Bicep (parent: 8)
 * 10: Right Forearm (parent: 9)
 * 11: Right Hand (parent: 10)
 * 12: Neck (parent: 8)
 * 13: Head (parent: 12)
 * 14: Left Bicep (parent: 8)
 * 15: Left Forearm (parent: 14)
 * 16: Left Hand (parent: 15)
 */
function solveAnatomicalRig(p: AnatomicalRigParams): number[] {
  const rot = p.worldRotationDeg;

  // 1. Torso Chain (Root -> Spine -> Chest -> Neck -> Head)
  // Upright is 90°. Torso pitch tilts towards +X (decreases angle).
  const lowerSpineWorld = normDeg(90 - p.torsoPitch + rot);
  const upperChestWorld = normDeg(90 - p.torsoPitch - p.chestCurve + rot);
  const neckWorld = normDeg(90 - p.torsoPitch - p.chestCurve + p.neckGaze + rot);
  const headWorld = neckWorld; // Head circle inherits neck gaze

  // 2. Right Leg Chain (Pelvis -> Thigh -> Shin -> Foot)
  // Upright thigh is 270°. Hip flexion swings towards +X (increases angle).
  const rThighWorld = normDeg(270 + p.rHip + rot);
  // Knee flexes backward towards hamstrings (subtracts angle relative to thigh).
  const rKneeClamped = Math.max(0, Math.min(145, p.rKneeFlex));
  const rShinWorld = normDeg(270 + p.rHip - rKneeClamped + rot);
  const rFootWorld = normDeg(0 + p.rAnkle + rot);

  // 3. Left Leg Chain (Pelvis -> Thigh -> Shin -> Foot)
  const lThighWorld = normDeg(270 + p.lHip + rot);
  const lKneeClamped = Math.max(0, Math.min(145, p.lKneeFlex));
  const lShinWorld = normDeg(270 + p.lHip - lKneeClamped + rot);
  const lFootWorld = normDeg(0 + p.lAnkle + rot);

  // 4. Right Arm Chain (Upper Chest -> Bicep -> Forearm -> Hand)
  // Neutral hanging arm is 270°. Shoulder swing forward increases angle towards +X/up.
  const rBicepWorld = normDeg(270 + p.rShoulder + rot);
  // Elbow flexes forward towards chest (adds angle relative to bicep).
  const rElbowClamped = Math.max(0, Math.min(145, p.rElbowFlex));
  const rForearmWorld = normDeg(270 + p.rShoulder + rElbowClamped + rot);
  const rHandWorld = normDeg(270 + p.rShoulder + rElbowClamped + p.rWrist + rot);

  // 5. Left Arm Chain (Upper Chest -> Bicep -> Forearm -> Hand)
  const lBicepWorld = normDeg(270 + p.lShoulder + rot);
  const lElbowClamped = Math.max(0, Math.min(145, p.lElbowFlex));
  const lForearmWorld = normDeg(270 + p.lShoulder + lElbowClamped + rot);
  const lHandWorld = normDeg(270 + p.lShoulder + lElbowClamped + p.lWrist + rot);

  return [
    normDeg(rot),       // 0: Pelvis
    rThighWorld,        // 1: Right Thigh
    rShinWorld,         // 2: Right Shin
    rFootWorld,         // 3: Right Foot
    lThighWorld,        // 4: Left Thigh
    lShinWorld,         // 5: Left Shin
    lFootWorld,         // 6: Left Foot
    lowerSpineWorld,    // 7: Lower Spine
    upperChestWorld,    // 8: Upper Chest
    rBicepWorld,        // 9: Right Bicep
    rForearmWorld,      // 10: Right Forearm
    rHandWorld,         // 11: Right Hand
    neckWorld,          // 12: Neck
    headWorld,          // 13: Head
    lBicepWorld,        // 14: Left Bicep
    lForearmWorld,      // 15: Left Forearm
    lHandWorld,         // 16: Left Hand
  ];
}

/**
 * Builds the canonical 96-frame (at 24 FPS) Parkour Acrobat sequence as ONE continuous,
 * synchronized performance where momentum, orientation, velocity, and limb kinematics
 * carry seamlessly from F00 through F95.
 */
export function buildCanonicalParkourFrames(
  config: ParkourGeneratorConfig = {
    projectName: 'parkour_acrobat',
    targetFps: 24,
    manColorHex: '#0F172A',
    accentColorHex: '#0284C7',
    groundY: 755.0,
    jumpApexY: 590.0,
    backflipApexY: 390.0,
    enableMotionTrails: true,
  }
): ParkourKeyframeSpec[] {
  const frames24: ParkourKeyframeSpec[] = [];

  // =========================================================================
  // CONTINUOUS 96-FRAME KINEMATIC INTEGRATOR
  // =========================================================================

  // Key poses at phase transition boundaries for seamless C1 Hermite blending
  let poseF23: AnatomicalRigParams = {
    worldRotationDeg: 0,
    torsoPitch: 18,
    chestCurve: 3,
    neckGaze: 14,
    rHip: -21,
    rKneeFlex: 51.5,
    rAnkle: -12,
    lHip: 21,
    lKneeFlex: 23.3,
    lAnkle: 0,
    rShoulder: 26,
    rElbowFlex: 75,
    rWrist: 0,
    lShoulder: -26,
    lElbowFlex: 35,
    lWrist: 0,
  };

  let poseF29: AnatomicalRigParams = { ...poseF23 };
  let poseF37: AnatomicalRigParams = { ...poseF23 };
  let poseF43: AnatomicalRigParams = { ...poseF23 };
  let poseF51: AnatomicalRigParams = { ...poseF23 };
  let poseF55: AnatomicalRigParams = { ...poseF23 };
  let poseF61: AnatomicalRigParams = { ...poseF23 };
  let poseF69: AnatomicalRigParams = { ...poseF23 };
  let poseF81: AnatomicalRigParams = { ...poseF23 };

  for (let f = 0; f < 96; f++) {
    let act = '';
    let phase = '';
    let panelId = 1;
    let storyboardTitle = '';
    let notes = '';
    let kineticChainDesc = '';
    const activeForces: string[] = [];

    let manX = 300;
    let manY = 510;
    let bodyRotationDeg = 0;
    let kineticVelocityX = 0;
    let kineticVelocityY = 0;
    let angularVelocityDegPerFrame = 0;
    let kneeFlexionDeg = 15;
    let landingCompressionPx = 0;
    let isGrounded = false;
    let isBalanced = true;

    // Anatomical pose variables
    let torsoPitch = 0;
    let chestCurve = 0;
    let neckGaze = 0;
    let rHip = 0;
    let rKneeFlex = 10;
    let rAnkle = 0;
    let lHip = 0;
    let lKneeFlex = 10;
    let lAnkle = 0;
    let rShoulder = 0;
    let rElbowFlex = 25;
    let rWrist = 0;
    let lShoulder = 0;
    let lElbowFlex = 25;
    let lWrist = 0;

    // -------------------------------------------------------------------------
    // ACT I: ATHLETIC SPRINT ACCELERATION (F00 - F23, Panels 1 & 2)
    // -------------------------------------------------------------------------
    if (f < 24) {
      act = 'Act I: Athletic Sprint';
      panelId = f < 12 ? 1 : 2;
      storyboardTitle = f < 12 ? 'Sprint Initiation & Forward Drive' : 'High-Cadence Sprint Stride';
      isGrounded = false; // Dynamic forward locomotion

      const t = f;
      const tNorm = f / 23;

      // Continuous acceleration from Vx = 7.0 px/f to 18.0 px/f
      manX = 300 + 7.0 * t + (11.0 / 46.0) * t * t;
      kineticVelocityX = 7.0 + (11.0 / 23.0) * t;

      // Two full gait cycles over 24 frames (period T = 12 frames)
      const gaitPhase = (t / 12) * Math.PI * 2;

      // Pelvic sinusoidal bounce
      manY = 510 - 4.5 * Math.abs(Math.sin(gaitPhase));
      kineticVelocityY = -2.5 * Math.sin(gaitPhase * 2);

      // Torso forward lean pitches from 14° to 18°
      torsoPitch = 14 + 4 * tNorm;
      chestCurve = 3;
      neckGaze = 14;
      bodyRotationDeg = 0;

      // Legs: Anti-phase sprint drive
      const rHipDrive = Math.sin(gaitPhase) * 42;
      const lHipDrive = -Math.sin(gaitPhase) * 42;
      rHip = rHipDrive;
      lHip = lHipDrive;

      if (rHipDrive < 0) {
        rKneeFlex = 20 + Math.abs(rHipDrive) * 1.5;
        rAnkle = -12;
      } else {
        rKneeFlex = Math.max(10, 38 - rHipDrive * 0.7);
        rAnkle = 0;
      }

      if (lHipDrive < 0) {
        lKneeFlex = 20 + Math.abs(lHipDrive) * 1.5;
        lAnkle = -12;
      } else {
        lKneeFlex = Math.max(10, 38 - lHipDrive * 0.7);
        lAnkle = 0;
      }

      // Arms: Dynamic anti-phase pump with smooth continuous elbow modulation
      const sprintRamp = Math.min(1.0, (t + 2) / 6);
      const armPump = -Math.sin(gaitPhase) * 52 * sprintRamp;
      rShoulder = armPump;
      rElbowFlex = 55 + (armPump / 52) * 20;
      rWrist = 0;

      lShoulder = -armPump;
      lElbowFlex = 55 - (armPump / 52) * 20;
      lWrist = 0;

      kneeFlexionDeg = Math.max(rKneeFlex, lKneeFlex);
      phase = f < 12 ? 'Drive Phase & Acceleration' : 'Terminal Flight & Pre-Takeoff Cadence';
      notes = `High-cadence sprint stride. Forward velocity Vx: ${kineticVelocityX.toFixed(1)} px/f. Anti-phase arm pump ±52° cancels spinal torsion; stance foot pinned at Y=755.`;
      kineticChainDesc = 'Ground ➔ Foot Plant ➔ Quad Extension ➔ Pelvis Drive ➔ Spinal Counter-Torsion ➔ Arm Pump';
      activeForces.push('Ground Reaction Shear', 'Muscular Hip Extension', 'Torso Counter-Torque');

      if (f === 23) {
        poseF23 = {
          worldRotationDeg: bodyRotationDeg,
          torsoPitch,
          chestCurve,
          neckGaze,
          rHip,
          rKneeFlex,
          rAnkle,
          lHip,
          lKneeFlex,
          lAnkle,
          rShoulder,
          rElbowFlex,
          rWrist,
          lShoulder,
          lElbowFlex,
          lWrist,
        };
      }
    }
    // -------------------------------------------------------------------------
    // ACT II: HURDLE DIVE JUMP (F24 - F37, Panels 3 & 4)
    // -------------------------------------------------------------------------
    else if (f < 38) {
      act = 'Act II: Dive Hurdle Jump';

      if (f < 30) {
        // F24 - F29: Hurdle Take-off & Leg Punch (Panel 3)
        panelId = 3;
        storyboardTitle = 'Hurdle Take-off & Leg Punch';
        phase = 'Elastic Energy Preload & Airborne Launch';
        isGrounded = false;

        const u = (f - 23) / 6; // 1/6 .. 1.0
        kineticVelocityX = 18.0 - 1.5 * u;
        manX = 587.5 + (f - 23) * 17.5;

        // F24-F26: Takeoff foot compression; F27-F29: explosive launch into air
        if (f < 27) {
          const comp = Math.sin(((f - 23) / 3) * Math.PI * 0.5) * 10;
          manY = 510 + comp;
          kineticVelocityY = 1.5;
        } else {
          const liftFrac = (f - 26) / 3;
          manY = 520 - 60 * liftFrac;
          kineticVelocityY = -12.5 * liftFrac;
        }

        // Body pitch tilts smoothly from F23 into dive launch
        bodyRotationDeg = lerp(poseF23.worldRotationDeg, -28, easeInOutCubic(u));
        angularVelocityDegPerFrame = -4.6;

        // Limb angles transition smoothly from poseF23 into takeoff extension!
        rHip = lerp(poseF23.rHip, -22, u);
        rKneeFlex = lerp(poseF23.rKneeFlex, 12, u);
        rAnkle = -12;
        lHip = lerp(poseF23.lHip, 25, u);
        lKneeFlex = lerp(poseF23.lKneeFlex, 18, u);
        lAnkle = -12;

        rShoulder = lerp(poseF23.rShoulder, 75, u);
        rElbowFlex = lerp(poseF23.rElbowFlex, 20, u);
        lShoulder = lerp(poseF23.lShoulder, 70, u);
        lElbowFlex = lerp(poseF23.lElbowFlex, 20, u);

        torsoPitch = lerp(poseF23.torsoPitch, 16, u);
        chestCurve = lerp(poseF23.chestCurve, 5, u);
        neckGaze = lerp(poseF23.neckGaze, 20, u);

        notes = `Hurdle takeoff punch. Horizontal momentum redirected into upward impulse. Lead foot pushes off floor at X=610.`;
        kineticChainDesc = 'Patellar Tendon Preload ➔ Explosive Knee Extension ➔ Double Arm Punch ➔ Dive Launch';
        activeForces.push('Ground Normal Impulse', 'Quadriceps Elastic Recoil');

        if (f === 29) {
          poseF29 = {
            worldRotationDeg: bodyRotationDeg,
            torsoPitch,
            chestCurve,
            neckGaze,
            rHip,
            rKneeFlex,
            rAnkle,
            lHip,
            lKneeFlex,
            lAnkle,
            rShoulder,
            rElbowFlex,
            rWrist,
            lShoulder,
            lElbowFlex,
            lWrist,
          };
        }
      } else {
        // F30 - F37: Aerial Cat Dive Parabolic Arc (Panel 4)
        panelId = 4;
        storyboardTitle = 'Aerial Cat Dive Parabolic Arc';
        phase = 'Ballistic Flight & Ground Intercept Reaching';
        isGrounded = false;

        const u = (f - 29) / 8; // 1/8 .. 1.0
        kineticVelocityX = 16.5 - 1.5 * u;
        manX = 692.5 + (f - 29) * 15.8;

        // True ballistic arc under gravity: apex around F33 (Y ~ 425px)
        const arcProgress = (f - 29) / 8;
        manY = 460 - 35 * Math.sin(arcProgress * Math.PI) + arcProgress * 80;
        kineticVelocityY = -10.0 + arcProgress * 21.0;

        // Continuous pitch tilt into dive angle (-28° to -60°)
        bodyRotationDeg = lerp(poseF29.worldRotationDeg, -60, easeInOutCubic(u));
        angularVelocityDegPerFrame = -4.0;

        // Limbs transition smoothly from poseF29 into floor reaching
        rHip = lerp(poseF29.rHip, -22, u);
        rKneeFlex = lerp(poseF29.rKneeFlex, 12, u);
        rAnkle = -10;
        lHip = lerp(poseF29.lHip, -26, u);
        lKneeFlex = lerp(poseF29.lKneeFlex, 14, u);
        lAnkle = -10;

        rShoulder = lerp(poseF29.rShoulder, 105, u);
        rElbowFlex = lerp(poseF29.rElbowFlex, 15, u);
        lShoulder = lerp(poseF29.lShoulder, 100, u);
        lElbowFlex = lerp(poseF29.lElbowFlex, 18, u);

        torsoPitch = lerp(poseF29.torsoPitch, 12, u);
        chestCurve = lerp(poseF29.chestCurve, 6, u);
        neckGaze = lerp(poseF29.neckGaze, 26, u);

        notes = `Airborne cat dive along ballistic parabola. Pelvis apex at Y=${Math.round(manY)}px. Arms extending forward-downward to intercept floor.`;
        kineticChainDesc = 'Ballistic Center of Mass Flight ➔ Aerodynamic Streamline ➔ Vestibular Spotting ➔ Arm Reach';
        activeForces.push('Gravity (g = 980px/s²)', 'Conserved Horizontal Momentum');

        if (f === 37) {
          poseF37 = {
            worldRotationDeg: bodyRotationDeg,
            torsoPitch,
            chestCurve,
            neckGaze,
            rHip,
            rKneeFlex,
            rAnkle,
            lHip,
            lKneeFlex,
            lAnkle,
            rShoulder,
            rElbowFlex,
            rWrist,
            lShoulder,
            lElbowFlex,
            lWrist,
          };
        }
      }
    }
    // -------------------------------------------------------------------------
    // ACT III: PARKOUR SHOULDER ROLL (F38 - F51, Panels 5 & 6)
    // -------------------------------------------------------------------------
    else if (f < 52) {
      act = 'Act III: Parkour Shoulder Roll';

      if (f < 44) {
        // F38 - F43: Hand Touchdown & Elbow Yielding (Panel 5)
        panelId = 5;
        storyboardTitle = 'Hand Touchdown & Elbow Yielding';
        phase = 'Impulse Attenuation & Roll Initiation';
        isGrounded = false; // Rolling on floor, not standing on feet

        const u = (f - 37) / 6; // 1/6 .. 1.0
        kineticVelocityX = lerp(15.0, 12.0, u);
        manX = 819.0 + (f - 37) * 13.5;

        // Hands contact ground at Y=755, arms yield, pelvis lowers smoothly into roll
        manY = lerp(540, 625, easeInOutCubic(u));
        kineticVelocityY = lerp(8.0, 1.5, u);

        // Rotation carries from dive into roll (-60° to -120°)
        bodyRotationDeg = lerp(poseF37.worldRotationDeg, -120, easeInOutCubic(u));
        angularVelocityDegPerFrame = -10.0;

        // Arms yield/absorb force (elbows flex from 15° to 95°)
        rShoulder = lerp(poseF37.rShoulder, 55, u);
        rElbowFlex = lerp(poseF37.rElbowFlex, 95, u);
        lShoulder = lerp(poseF37.lShoulder, 50, u);
        lElbowFlex = lerp(poseF37.lElbowFlex, 90, u);

        // Spine rounds into protective C-curve; chin tucks
        torsoPitch = lerp(poseF37.torsoPitch, 8, u);
        chestCurve = lerp(poseF37.chestCurve, 32, u);
        neckGaze = lerp(poseF37.neckGaze, -18, u);

        // Legs fold towards chest into tuck
        rHip = lerp(poseF37.rHip, 55, u);
        rKneeFlex = lerp(poseF37.rKneeFlex, 75, u);
        rAnkle = 0;
        lHip = lerp(poseF37.lHip, 45, u);
        lKneeFlex = lerp(poseF37.lKneeFlex, 65, u);
        lAnkle = 0;

        notes = `Hand touchdown at Y=755. Elbows yield to attenuate vertical impulse while redirecting momentum into rotational shoulder roll.`;
        kineticChainDesc = 'Hand Intercept ➔ Elbow Flexion Yield ➔ Scapular Grounding ➔ Cervical Protection Tuck';
        activeForces.push('Ground Friction Normal', 'Momentum-to-Torque Conversion');

        if (f === 43) {
          poseF43 = {
            worldRotationDeg: bodyRotationDeg,
            torsoPitch,
            chestCurve,
            neckGaze,
            rHip,
            rKneeFlex,
            rAnkle,
            lHip,
            lKneeFlex,
            lAnkle,
            rShoulder,
            rElbowFlex,
            rWrist,
            lShoulder,
            lElbowFlex,
            lWrist,
          };
        }
      } else {
        // F44 - F51: Diagonal Scapular Shoulder Roll (Panel 6)
        panelId = 6;
        storyboardTitle = 'Diagonal Scapular Shoulder Roll';
        phase = 'Rotational Energy Dissipation & Tight Core Tuck';
        isGrounded = false; // Rolling across upper back

        const u = (f - 43) / 8; // 1/8 .. 1.0
        kineticVelocityX = lerp(12.0, 8.5, u);
        manX = 900.0 + (f - 43) * 10.0;

        // Pelvis stays close to rolling ground line (Y ~ 625px)
        manY = 625 + 8 * Math.sin(u * Math.PI);
        kineticVelocityY = 0;

        bodyRotationDeg = lerp(poseF43.worldRotationDeg, -360, u);
        angularVelocityDegPerFrame = -30.0;

        // Smooth interpolation from poseF43 into spherical tuck
        torsoPitch = lerp(poseF43.torsoPitch, 5, u);
        chestCurve = lerp(poseF43.chestCurve, 35, u);
        neckGaze = lerp(poseF43.neckGaze, -20, u);

        rHip = lerp(poseF43.rHip, 85, u);
        rKneeFlex = lerp(poseF43.rKneeFlex, 115, u);
        rAnkle = 0;
        lHip = lerp(poseF43.lHip, 80, u);
        lKneeFlex = lerp(poseF43.lKneeFlex, 110, u);
        lAnkle = 0;

        rShoulder = lerp(poseF43.rShoulder, 25, u);
        rElbowFlex = lerp(poseF43.rElbowFlex, 105, u);
        lShoulder = lerp(poseF43.lShoulder, 20, u);
        lElbowFlex = lerp(poseF43.lElbowFlex, 100, u);

        notes = `Diagonal scapular roll across thoracic spine. Tight spherical tuck minimizes moment of inertia, rolling cleanly along ground plane.`;
        kineticChainDesc = 'Scapular Diagonal Roll ➔ Thoracic Curvature ➔ Lumbar Sweep ➔ Kinetic Continuity';
        activeForces.push('Ground Normal Contact', 'Centripetal Core Compression', 'Angular Momentum Conservation');

        if (f === 51) {
          poseF51 = {
            worldRotationDeg: 0, // Finished 360° forward roll, now upright
            torsoPitch,
            chestCurve,
            neckGaze,
            rHip,
            rKneeFlex,
            rAnkle,
            lHip,
            lKneeFlex,
            lAnkle,
            rShoulder,
            rElbowFlex,
            rWrist,
            lShoulder,
            lElbowFlex,
            lWrist,
          };
        }
      }
    }
    // -------------------------------------------------------------------------
    // ACT IV: REBOUND PLANT & SQUAT BLOCK (F52 - F61, Panel 7)
    // -------------------------------------------------------------------------
    else if (f < 62) {
      act = 'Act IV: Roll Exit & Rebound Plant';
      panelId = 7;
      storyboardTitle = 'Roll Exit & Rebound Plant';
      phase = 'Horizontal Braking & Elastic Rebound Preload';
      bodyRotationDeg = 0; // Solidly upright facing +X

      if (f < 56) {
        // F52 - F55: Feet swing through to plant
        isGrounded = false; // Swinging legs down to touch floor
        const exitFrac = (f - 51) / 4;
        kineticVelocityX = lerp(8.5, 5.0, exitFrac);
        manX = 980.0 + (f - 51) * 7.0;

        // Pelvis height transitions smoothly from roll to crouch (625 -> 595)
        manY = lerp(625, 595, exitFrac);
        kineticVelocityY = -3.0;

        // Legs un-tuck smoothly from poseF51 into foot plant
        rHip = lerp(poseF51.rHip, 25, exitFrac);
        rKneeFlex = lerp(poseF51.rKneeFlex, 55, exitFrac);
        rAnkle = 0;
        lHip = lerp(poseF51.lHip, 20, exitFrac);
        lKneeFlex = lerp(poseF51.lKneeFlex, 50, exitFrac);
        lAnkle = 0;

        // Arms open smoothly from tuck
        rShoulder = lerp(poseF51.rShoulder, -25, exitFrac);
        rElbowFlex = lerp(poseF51.rElbowFlex, 35, exitFrac);
        lShoulder = lerp(poseF51.lShoulder, -25, exitFrac);
        lElbowFlex = lerp(poseF51.lElbowFlex, 35, exitFrac);

        torsoPitch = lerp(poseF51.torsoPitch, 18, exitFrac);
        chestCurve = lerp(poseF51.chestCurve, 6, exitFrac);
        neckGaze = lerp(poseF51.neckGaze, 16, exitFrac);

        if (f === 55) {
          poseF55 = {
            worldRotationDeg: 0,
            torsoPitch,
            chestCurve,
            neckGaze,
            rHip,
            rKneeFlex,
            rAnkle,
            lHip,
            lKneeFlex,
            lAnkle,
            rShoulder,
            rElbowFlex,
            rWrist,
            lShoulder,
            lElbowFlex,
            lWrist,
          };
        }
      } else {
        // F56 - F61: Feet plant firmly; deep squat compression and arm backswing
        isGrounded = true; // Firm two-foot stance on floor
        const squatFrac = (f - 55) / 6;
        kineticVelocityX = lerp(5.0, 0.5, squatFrac);
        manX = 1008.0 + (f - 55) * 2.8;

        // Deep knee compression: Pelvis lowers to 635px (deep athletic squat)
        manY = lerp(595, 635, easeInOutCubic(squatFrac));
        kineticVelocityY = 4.0 * (1 - squatFrac);

        // Legs deeply flexed to absorb horizontal momentum and preload jump
        rHip = lerp(poseF55.rHip, 42, squatFrac);
        rKneeFlex = lerp(poseF55.rKneeFlex, 105, squatFrac);
        rAnkle = 0;
        lHip = lerp(poseF55.lHip, 38, squatFrac);
        lKneeFlex = lerp(poseF55.lKneeFlex, 100, squatFrac);
        lAnkle = 0;

        // Arms sweep backward behind torso (anticipation preload for upward leap)
        rShoulder = lerp(poseF55.rShoulder, -72, squatFrac);
        rElbowFlex = lerp(poseF55.rElbowFlex, 18, squatFrac);
        lShoulder = lerp(poseF55.lShoulder, -72, squatFrac);
        lElbowFlex = lerp(poseF55.lElbowFlex, 18, squatFrac);

        torsoPitch = 18;
        chestCurve = 4;
        neckGaze = 18;

        if (f === 61) {
          poseF61 = {
            worldRotationDeg: 0,
            torsoPitch,
            chestCurve,
            neckGaze,
            rHip,
            rKneeFlex,
            rAnkle,
            lHip,
            lKneeFlex,
            lAnkle,
            rShoulder,
            rElbowFlex,
            rWrist,
            lShoulder,
            lElbowFlex,
            lWrist,
          };
        }
      }

      kneeFlexionDeg = Math.max(rKneeFlex, lKneeFlex);
      notes = `Blocking plant at X=${Math.round(manX)}. Feet pinned to floor at Y=755; knees flexed to ${Math.round(kneeFlexionDeg)}°; arms swept back to preload backflip.`;
      kineticChainDesc = 'Floor Friction Lock ➔ Patellar Tendon Elastic Storage ➔ Core Tension ➔ Shoulder Extension Windup';
      activeForces.push('Ground Friction Braking', 'Elastic Tendon Strain', 'Quadriceps Preload');
    }
    // -------------------------------------------------------------------------
    // ACT V: EXPLOSIVE BACKFLIP 360° (F62 - F81, Panels 8 & 9)
    // -------------------------------------------------------------------------
    else if (f < 82) {
      act = 'Act V: Explosive Aerial Backflip';

      if (f < 70) {
        // F62 - F69: Explosive Takeoff Punch & Arm Whip (Panel 8)
        panelId = 8;
        storyboardTitle = 'Explosive Backflip Takeoff Punch';
        phase = 'Vertical Thrust & Angular Momentum Generation';
        isGrounded = false; // Launching into air

        const u = (f - 61) / 8; // 1/8 .. 1.0
        kineticVelocityX = lerp(0.8, 1.8, u);
        manX = 1025.0 + (f - 61) * 1.5;

        // Smooth quadratic upward acceleration: pelvis launches 635 -> 491
        const step = f - 61; // 1..8
        manY = 635 - (8.0 * step + 1.25 * step * step);
        kineticVelocityY = -(8.0 + 2.5 * step);

        if (f < 66) {
          const launchFrac = (f - 61) / 4;
          // Arms whip violently upward past ears
          rShoulder = lerp(poseF61.rShoulder, 130, launchFrac);
          rElbowFlex = lerp(poseF61.rElbowFlex, 15, launchFrac);
          lShoulder = lerp(poseF61.lShoulder, 130, launchFrac);
          lElbowFlex = lerp(poseF61.lElbowFlex, 15, launchFrac);

          // Legs snap into full extension
          rHip = lerp(poseF61.rHip, -5, launchFrac);
          rKneeFlex = lerp(poseF61.rKneeFlex, 5, launchFrac);
          rAnkle = -15;
          lHip = lerp(poseF61.lHip, -5, launchFrac);
          lKneeFlex = lerp(poseF61.lKneeFlex, 5, launchFrac);
          lAnkle = -15;

          torsoPitch = lerp(poseF61.torsoPitch, -15, launchFrac);
          chestCurve = -6;
          neckGaze = -15;
          bodyRotationDeg = lerp(0, 35, launchFrac);
          angularVelocityDegPerFrame = 8.5;
        } else {
          // Mid-air ascent into backflip tuck
          const tuckFrac = (f - 65) / 4;
          // Rotation continues (+35° to +115°)
          bodyRotationDeg = lerp(35, 115, tuckFrac);
          angularVelocityDegPerFrame = 20.0;

          // Limbs pull into tuck
          rHip = lerp(-5, 85, tuckFrac);
          rKneeFlex = lerp(5, 110, tuckFrac);
          rAnkle = 0;
          lHip = lerp(-5, 80, tuckFrac);
          lKneeFlex = lerp(5, 105, tuckFrac);
          lAnkle = 0;

          rShoulder = lerp(130, 45, tuckFrac);
          rElbowFlex = lerp(15, 85, tuckFrac);
          lShoulder = lerp(130, 45, tuckFrac);
          lElbowFlex = lerp(15, 85, tuckFrac);

          torsoPitch = 5;
          chestCurve = 15;
          neckGaze = -10;
        }

        notes = `Explosive backflip takeoff. Upward arm whip generates reactionary thrust; head arches back initiating 360° backward rotation.`;
        kineticChainDesc = 'Calf/Quad Extension ➔ Upward Arm Whip ➔ Core Tuck ➔ Mid-Air Angular Acceleration';
        activeForces.push('Explosive Takeoff Thrust', 'Muscular Upward Impulse', 'Rotational Torque');

        if (f === 69) {
          poseF69 = {
            worldRotationDeg: bodyRotationDeg,
            torsoPitch,
            chestCurve,
            neckGaze,
            rHip,
            rKneeFlex,
            rAnkle,
            lHip,
            lKneeFlex,
            lAnkle,
            rShoulder,
            rElbowFlex,
            rWrist,
            lShoulder,
            lElbowFlex,
            lWrist,
          };
        }
      } else {
        // F70 - F81: Inverted Aerial Apex & 360° Tuck (Panel 9)
        panelId = 9;
        storyboardTitle = 'Inverted Aerial Apex & 360° Tuck';
        phase = 'Airborne Inversion & Angular Conservation';
        isGrounded = false; // Mid-air flight

        const u = (f - 69) / 12; // 1/12 .. 1.0
        kineticVelocityX = 1.8;
        manX = 1037.0 + (f - 69) * 1.0;

        // Ballistic parabola with apex at F73 (Y = 390px) reaching touchdown at F81 (Y = 520px)
        const apexFrac = (f - 69) / 12;
        manY = 491 - 101 * Math.sin(apexFrac * Math.PI) + apexFrac * 29;
        kineticVelocityY = -12.0 + apexFrac * 24.0;

        // Continuous 360° backward rotation (+115° to +360° / 0°)
        bodyRotationDeg = lerp(poseF69.worldRotationDeg, 360, easeInOutCubic(u));
        angularVelocityDegPerFrame = 20.4;

        if (f < 76) {
          // F70-F75: Tight mid-air tuck through inverted apex (F73 = 180° inverted)
          rHip = 105;
          rKneeFlex = 120;
          rAnkle = 0;
          lHip = 100;
          lKneeFlex = 115;
          lAnkle = 0;

          rShoulder = 40;
          rElbowFlex = 90;
          lShoulder = 40;
          lElbowFlex = 90;

          torsoPitch = 0;
          chestCurve = 28;
          neckGaze = -15;
        } else {
          // F76-F81: Opening up to spot floor and brake spin
          const openFrac = (f - 75) / 6;
          rHip = lerp(105, 18, openFrac);
          rKneeFlex = lerp(120, 22, openFrac);
          rAnkle = 0;
          lHip = lerp(100, 15, openFrac);
          lKneeFlex = lerp(115, 20, openFrac);
          lAnkle = 0;

          rShoulder = lerp(40, -10, openFrac);
          rElbowFlex = lerp(90, 25, openFrac);
          lShoulder = lerp(40, -10, openFrac);
          lElbowFlex = lerp(90, 25, openFrac);

          torsoPitch = lerp(0, 14, openFrac);
          chestCurve = lerp(28, 4, openFrac);
          neckGaze = lerp(-15, 20, openFrac);
        }

        notes = `Airborne 360° backflip. Inverted apex reached at Y=${Math.round(manY)}px. Tight tuck accelerates rotation; limbs open at F76 to spot landing.`;
        kineticChainDesc = 'Angular Momentum Conservation ➔ Inverted Apex ➔ Spotting Horizon ➔ Limbs Opening Braking';
        activeForces.push('Gravity (g = 980px/s²)', 'Angular Momentum Conservation');

        if (f === 81) {
          poseF81 = {
            worldRotationDeg: 0, // Finished 360° flip, landed upright
            torsoPitch,
            chestCurve,
            neckGaze,
            rHip,
            rKneeFlex,
            rAnkle,
            lHip,
            lKneeFlex,
            lAnkle,
            rShoulder,
            rElbowFlex,
            rWrist,
            lShoulder,
            lElbowFlex,
            lWrist,
          };
        }
      }
    }
    // -------------------------------------------------------------------------
    // ACT VI: LANDING CUSHION & HEROIC SETTLE (F82 - F95, Panel 10)
    // -------------------------------------------------------------------------
    else {
      act = 'Act VI: Impact Cushion & Heroic Settle';
      panelId = 10;
      storyboardTitle = 'Landing Impact Cushion & Heroic Equilibrium';
      phase = 'Impact Cushioning & Dynamic Balance Recovery';
      isGrounded = true;
      bodyRotationDeg = 0; // Solidly upright facing +X

      const landIdx = f - 82;
      const landFrac = landIdx / 13; // 0..1

      kineticVelocityX = lerp(1.2, 0, landFrac);
      manX = 1049.0 + landIdx * 0.1; // Zero foot sliding!

      // Impact cushion:
      // F82-F85: Toes contact floor, knees compress (pelvis drops from 520 to 552)
      // F86-F95: Elastic rebound up to stable standing height (510px)
      if (landIdx < 4) {
        const compFrac = landIdx / 3;
        landingCompressionPx = 32 * easeInOutCubic(compFrac);
        manY = 520 + landingCompressionPx;
        kineticVelocityY = 8.0 * (1 - compFrac);
      } else {
        const recoverFrac = (landIdx - 3) / 10;
        landingCompressionPx = 32 * (1 - easeInOutCubic(recoverFrac));
        manY = 510 + landingCompressionPx;
        kineticVelocityY = -2.0 * (1 - recoverFrac);
      }

      kneeFlexionDeg = 15 + landingCompressionPx * 1.2;

      // Leg compression angles (knees flex backward naturally, zero flamingo)
      rHip = lerp(poseF81.rHip, 12 + landingCompressionPx * 0.5, landFrac);
      rKneeFlex = lerp(poseF81.rKneeFlex, 15 + landingCompressionPx * 1.1, landFrac);
      rAnkle = 0;
      lHip = lerp(poseF81.lHip, 10 + landingCompressionPx * 0.5, landFrac);
      lKneeFlex = lerp(poseF81.lKneeFlex, 14 + landingCompressionPx * 1.1, landFrac);
      lAnkle = 0;

      // Torso pitches forward 14° to center CoM over feet, then straightens
      torsoPitch = lerp(poseF81.torsoPitch, 2, landFrac);
      chestCurve = 2;
      neckGaze = lerp(poseF81.neckGaze, 2, landFrac);

      // Arms swing forward to catch dynamic balance, then settle into confident guard
      rShoulder = lerp(poseF81.rShoulder, -5, landFrac);
      rElbowFlex = lerp(poseF81.rElbowFlex, 25, landFrac);
      rWrist = 0;
      lShoulder = lerp(poseF81.lShoulder, -5, landFrac);
      lElbowFlex = lerp(poseF81.lElbowFlex, 25, landFrac);
      lWrist = 0;

      notes = `Landing impact cushion at X=${Math.round(manX)}. Knee flexion: ${Math.round(kneeFlexionDeg)}°, compressive drop: ${Math.round(landingCompressionPx)}px. Upright heroic equilibrium established.`;
      kineticChainDesc = 'Foot Strike ➔ Ankle Dorsiflexion ➔ Knee Shock Absorption ➔ Torso Balance Lean ➔ Upright Settle';
      activeForces.push('Ground Normal Force (Deceleration)', 'Quadriceps Eccentric Brake', 'Dynamic Balance Restoration');
    }

    // Solve the 17 world angles using the anatomical hierarchy
    const manAngles = solveAnatomicalRig({
      worldRotationDeg: bodyRotationDeg,
      torsoPitch,
      chestCurve,
      neckGaze,
      rHip,
      rKneeFlex,
      rAnkle,
      lHip,
      lKneeFlex,
      lAnkle,
      rShoulder,
      rElbowFlex,
      rWrist,
      lShoulder,
      lElbowFlex,
      lWrist,
    });

    // Dynamic Balance & Center of Mass computation
    const comReport = calculateCenterOfMass17(manX, manY, manAngles, 0.5, config.groundY);

    // Smooth virtual camera tracking
    const camX = (manX - 480) * 0.75;
    const camY = (manY - 540) * 0.35;
    const camZoom = panelId === 6 || panelId === 9 ? 1.12 : 1.05;

    frames24.push({
      frame: f,
      act,
      phase,
      manX,
      manY,
      bodyRotationDeg,
      manAngles,
      comX: comReport.comX,
      comY: comReport.comY,
      supportMinX: comReport.supportPolygonMinX,
      supportMaxX: comReport.supportPolygonMaxX,
      isGrounded,
      isBalanced: isGrounded ? comReport.isBalanced : isBalanced,
      stabilityMargin: comReport.stabilityMarginPx,
      kineticVelocityX,
      kineticVelocityY,
      angularVelocityDegPerFrame,
      kneeFlexionDeg,
      landingCompressionPx,
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

  if (config.targetFps === 12) {
    // Return every other frame reindexed 0..47
    return frames24
      .filter((_, idx) => idx % 2 === 0)
      .map((item, newIdx) => ({
        ...item,
        frame: newIdx,
      }));
  }

  return frames24;
}
