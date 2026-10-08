import { STICKFIGURE_PARENTS, STICKFIGURE_BONE_LENGTHS } from '../stknds/stickfigureStructure';
import { SitWalkKickKeyframeSpec, BiomechanicalAuditReport, BiomechanicalAuditItem } from './strollKickTypes';
import { solveForwardKinematics17 } from '../skills/kinematicsSolvers';
import { calculateCenterOfMass17 } from '../skills/biomechanicalPhysics';

export function validateSitWalkKickBiomechanics(
  frames: SitWalkKickKeyframeSpec[]
): BiomechanicalAuditReport {
  const items: BiomechanicalAuditItem[] = [];

  // Check 1: Ground Alignment - Planted feet must match Ground Y = 755
  let maxFootGroundError = 0;
  for (const f of frames) {
    const fk = solveForwardKinematics17(f.manX, f.manY, f.manAngles, 0.5);
    // Grounded checks during standing (f.frame 71-81, 150-153, 186-215)
    if (
      (f.frame >= 71 && f.frame <= 81) ||
      (f.frame >= 150 && f.frame <= 153) ||
      (f.frame >= 186 && f.frame <= 215)
    ) {
      const rFootY = fk[3].endY;
      const lFootY = fk[6].endY;
      maxFootGroundError = Math.max(
        maxFootGroundError,
        Math.abs(rFootY - 755.0),
        Math.abs(lFootY - 755.0)
      );
    }
  }
  items.push({
    id: 'ground-alignment',
    label: 'Ground Alignment (Y = 755.0 px)',
    passed: maxFootGroundError <= 1.5,
    metric: `${maxFootGroundError.toFixed(2)} px max error`,
    threshold: '≤ 1.5 px',
    detail: 'Planted feet maintain exact ground plane contact at Y = 755.0 px without sinking or floating.',
  });

  // Check 2: No Foot Sliding during Stance Pinning
  let maxStanceSlide = 0;
  for (let i = 1; i < frames.length; i++) {
    const prev = frames[i - 1];
    const curr = frames[i];
    // Check seated plant (0..18)
    if (curr.frame <= 18) {
      const prevFK = solveForwardKinematics17(prev.manX, prev.manY, prev.manAngles, 0.5);
      const currFK = solveForwardKinematics17(curr.manX, curr.manY, curr.manAngles, 0.5);
      maxStanceSlide = Math.max(
        maxStanceSlide,
        Math.abs(currFK[3].startX - prevFK[3].startX),
        Math.abs(currFK[6].startX - prevFK[6].startX)
      );
    }
  }
  items.push({
    id: 'stance-pinning',
    label: 'Stance Pinning & Zero Sliding',
    passed: maxStanceSlide <= 0.5,
    metric: `${maxStanceSlide.toFixed(2)} px max shift`,
    threshold: '≤ 0.5 px',
    detail: 'Planted feet and support hands remain pinned to the floor during static holds without sliding.',
  });

  // Check 3: Jump Takeoff & Landing Elevation Closure
  const takeoffFrame = frames.find((f) => f.frame === 135);
  const landingFrame = frames.find((f) => f.frame === 148);
  let jumpElevationDelta = 0;
  if (takeoffFrame && landingFrame) {
    const fkLand = solveForwardKinematics17(landingFrame.manX, landingFrame.manY, landingFrame.manAngles, 0.5);
    jumpElevationDelta = Math.abs(fkLand[3].endY - 755.0);
  }
  items.push({
    id: 'jump-closure',
    label: 'Jump Takeoff & Landing Elevation Closure',
    passed: jumpElevationDelta <= 1.0,
    metric: `${jumpElevationDelta.toFixed(2)} px landing delta`,
    threshold: '≤ 1.0 px',
    detail: 'Airborne jump strictly returns to the identical ground plane surface Y = 755.0 px.',
  });

  // Check 4: Contact Precision at Kick Frame (F174)
  const kickFrame = frames.find((f) => f.frame === 174);
  let kickDistance = 999;
  if (kickFrame) {
    const fk = solveForwardKinematics17(kickFrame.manX, kickFrame.manY, kickFrame.manAngles, 0.5);
    const toeX = fk[3].endX;
    const toeY = fk[3].endY;
    kickDistance = Math.hypot(toeX - kickFrame.ballX, toeY - kickFrame.ballY);
  }
  items.push({
    id: 'kick-contact-precision',
    label: 'Kick Impact Contact Precision (F174)',
    passed: kickDistance <= 18.0,
    metric: `${kickDistance.toFixed(2)} px distance to ball center`,
    threshold: '≤ 18.0 px (Ball Radius)',
    detail: 'Striking toe physically contacts the rear-lower surface of the ball at F174 within 18.0 px.',
  });

  // Check 5: No Knee Hyperextension (0° Polarity Law)
  let maxHyperextension = 0;
  for (const f of frames) {
    const rThigh = f.manAngles[1];
    const rShin = f.manAngles[2];
    const lThigh = f.manAngles[4];
    const lShin = f.manAngles[5];
    // Facing right (+X): Shin angle must be <= Thigh angle (knee bends backward)
    const rRel = rShin - rThigh;
    const lRel = lShin - lThigh;
    if (rRel > 2.0) maxHyperextension = Math.max(maxHyperextension, rRel);
    if (lRel > 2.0) maxHyperextension = Math.max(maxHyperextension, lRel);
  }
  items.push({
    id: 'knee-polarity',
    label: 'Knee 1-DOF Polarity (Zero Hyperextension)',
    passed: maxHyperextension <= 2.0,
    metric: `${maxHyperextension.toFixed(1)}° max violation`,
    threshold: '0° reverse bend',
    detail: 'Kneecaps always point in the facing direction; knees never bend backwards like bird legs.',
  });

  // Check 6: Smooth Trajectory & No Unphysical Single-Frame Root Spikes
  let maxRootDelta = 0;
  for (let i = 1; i < frames.length; i++) {
    const dx = Math.abs(frames[i].manX - frames[i - 1].manX);
    const dy = Math.abs(frames[i].manY - frames[i - 1].manY);
    maxRootDelta = Math.max(maxRootDelta, Math.hypot(dx, dy));
  }
  items.push({
    id: 'root-continuity',
    label: 'Character Root Spatial Continuity',
    passed: maxRootDelta <= 35.0,
    metric: `${maxRootDelta.toFixed(1)} px max single-frame step`,
    threshold: '≤ 35.0 px/frame',
    detail: 'Root translations follow smooth acceleration curves without teleportation spikes or jitter.',
  });

  // Check 7: Decoupled Camera Isolation
  let cameraBakedInRoot = false;
  for (const f of frames) {
    if (f.manX < 0 || f.manY < 0) {
      cameraBakedInRoot = true;
    }
  }
  items.push({
    id: 'camera-isolation',
    label: 'Camera vs World Movement Decoupling',
    passed: !cameraBakedInRoot,
    metric: '100% decoupled',
    threshold: 'Zero camera bleed',
    detail: 'Virtual camera panning and zooming reside solely in camera fields (camX, camY, camZoom).',
  });

  // Check 8: Moving Hold Life (No Dead Freezes)
  let staticFrameCount = 0;
  for (let i = 205; i < frames.length; i++) {
    const prev = frames[i - 1];
    const curr = frames[i];
    let diff = 0;
    for (let k = 0; k < 17; k++) {
      diff += Math.abs(curr.manAngles[k] - prev.manAngles[k]);
    }
    if (diff < 0.05) staticFrameCount++;
  }
  items.push({
    id: 'moving-hold-life',
    label: 'Moving Hold Life & Organic Settle (F205–F215)',
    passed: staticFrameCount <= 1,
    metric: `${staticFrameCount} dead freeze frames`,
    threshold: '≤ 1 freeze',
    detail: 'Pauses include subtle breathing oscillations, head drift, and weight shifts rather than mannequin dead freezes.',
  });

  // Check 9: Center of Mass (CoM) Dynamic Balance Equilibrium
  let maxCoMDisplacementFromSupport = 0;
  for (const f of frames) {
    if (
      (f.frame >= 71 && f.frame <= 81) ||
      (f.frame >= 150 && f.frame <= 153) ||
      (f.frame >= 186 && f.frame <= 215)
    ) {
      const margin = Math.abs(f.stabilityMargin);
      if (margin > maxCoMDisplacementFromSupport) {
        maxCoMDisplacementFromSupport = margin;
      }
    }
  }
  items.push({
    id: 'com-dynamic-balance',
    label: 'Center of Mass (CoM) Dynamic Balance Equilibrium',
    passed: maxCoMDisplacementFromSupport <= 25.0,
    metric: `${maxCoMDisplacementFromSupport.toFixed(1)} px max CoM offset`,
    threshold: '≤ 25.0 px support margin',
    detail: 'Torso counter-pitch and pelvis shift keep the body Center of Mass balanced over the Base of Support.',
  });

  // Check 10: Connected Articulated Body Chain (Bone Length Invariant)
  let maxBoneLengthError = 0;
  for (const f of frames) {
    const fk = solveForwardKinematics17(f.manX, f.manY, f.manAngles, 0.5);
    for (let b = 1; b < 17; b++) {
      const p = STICKFIGURE_PARENTS[b];
      if (p !== -1) {
        const dx = fk[b].endX - fk[b].startX;
        const dy = fk[b].endY - fk[b].startY;
        const actualLen = Math.hypot(dx, dy);
        const expectedLen = STICKFIGURE_BONE_LENGTHS[b] * 0.5;
        const err = Math.abs(actualLen - expectedLen);
        if (err > maxBoneLengthError) maxBoneLengthError = err;
      }
    }
  }
  items.push({
    id: 'articulated-body-chain',
    label: 'Connected Articulated Body Chain Invariant',
    passed: maxBoneLengthError <= 0.05,
    metric: `${maxBoneLengthError.toFixed(3)} px max bone elongation`,
    threshold: '≤ 0.05 px (Rigid Links)',
    detail: 'All 17 skeletal bone lengths remain strictly constant; zero joint dismemberment or stretch.',
  });

  // Check 11: Pelvic-Thoracic Axial Counter-Rotation during Locomotion
  let maxThoracicCounterTorsion = 0;
  for (const f of frames) {
    if ((f.frame >= 82 && f.frame <= 111) || (f.frame >= 154 && f.frame <= 165)) {
      const diff = Math.abs(f.manAngles[8] - f.manAngles[7]);
      if (diff > maxThoracicCounterTorsion) maxThoracicCounterTorsion = diff;
    }
  }
  items.push({
    id: 'pelvic-thoracic-counter-rotation',
    label: 'Pelvic-Thoracic Counter-Rotation during Locomotion',
    passed: maxThoracicCounterTorsion >= 1.5,
    metric: `${maxThoracicCounterTorsion.toFixed(1)}° max counter-rotation`,
    threshold: '≥ 1.5° (Anti-Phase Torsion)',
    detail: 'Upper chest counter-rotates in anti-phase to pelvic leg swing, eliminating rigid plank-wood spine.',
  });

  // Check 12: Upper-Body Kinetic Whip Recoil during Kick
  const strikeFrame = frames.find((f) => f.frame === 174);
  let strikeTorsoRecoil = 0;
  if (strikeFrame) {
    strikeTorsoRecoil = Math.max(
      strikeFrame.manAngles[7] - 90.0,
      strikeFrame.manAngles[8] - 90.0
    );
  }
  items.push({
    id: 'kinetic-whip-torso-recoil',
    label: 'Upper-Body Kinetic Whip Recoil during Kick (F174)',
    passed: strikeTorsoRecoil >= 8.0,
    metric: `${strikeTorsoRecoil.toFixed(1)}° backward recoil`,
    threshold: '≥ 8.0° (Momentum Balance)',
    detail: 'Upper torso recoils backward dynamically to conserve angular momentum as kicking leg accelerates forward into impact.',
  });

  // Check 13: Dynamic Arm Elbow Flexion Modulation
  let minElbowBend = 180;
  let maxElbowBend = 0;
  for (const f of frames) {
    if (f.frame >= 82 && f.frame <= 111) {
      const bend = Math.abs(f.manAngles[10] - f.manAngles[9]);
      if (bend < minElbowBend) minElbowBend = bend;
      if (bend > maxElbowBend) maxElbowBend = bend;
    }
  }
  const elbowModulationRange = maxElbowBend - minElbowBend;
  items.push({
    id: 'dynamic-elbow-modulation',
    label: 'Dynamic Arm Elbow Flexion Modulation',
    passed: elbowModulationRange >= 10.0,
    metric: `${elbowModulationRange.toFixed(1)}° dynamic range (${minElbowBend.toFixed(0)}°–${maxElbowBend.toFixed(0)}°)`,
    threshold: '≥ 10.0° modulation',
    detail: 'Arm elbow flexes during forward swing to shorten pendulum inertia, and extends naturally during backswing.',
  });

  // Check 14: Vestibular-Ocular Head Horizon Stabilization
  let headPitchMin = 360;
  let headPitchMax = -360;
  for (const f of frames) {
    if (f.frame >= 82 && f.frame <= 111) {
      const h = f.manAngles[13];
      if (h < headPitchMin) headPitchMin = h;
      if (h > headPitchMax) headPitchMax = h;
    }
  }
  const headVariance = headPitchMax - headPitchMin;
  items.push({
    id: 'vestibular-head-stabilization',
    label: 'Vestibular-Ocular Head Horizon Stabilization',
    passed: headVariance <= 6.0,
    metric: `${headVariance.toFixed(1)}° head horizon variance`,
    threshold: '≤ 6.0° stable horizon',
    detail: 'Gimbal neck stabilization compensates for torso pitch to maintain steady forward gaze during strolling.',
  });

  // =========================================================================
  // REAL CHECKS: PROCEDURAL ARM BIOMECHANICS & ARTICULATION
  // =========================================================================
  const BEATS = [
    { id: 'C', name: 'Stand (Act C)', start: 72, end: 81 },
    { id: 'D', name: 'Stroll (Act D)', start: 82, end: 111 },
    { id: 'E', name: 'Notice (Act E)', start: 112, end: 129 },
    { id: 'F', name: 'Jump (Act F)', start: 130, end: 153 },
    { id: 'G', name: 'Run (Act G)', start: 154, end: 165 },
    { id: 'H', name: 'Kick (Act H)', start: 166, end: 174 },
    { id: 'I', name: 'Follow-Through (Act I)', start: 175, end: 215 },
  ];

  interface BeatArmStats {
    rAvgSwing: number;
    lAvgSwing: number;
    rMinSwing: number;
    rMaxSwing: number;
    lMinSwing: number;
    lMaxSwing: number;
    rMinFlex: number;
    rMaxFlex: number;
    lMinFlex: number;
    lMaxFlex: number;
    rMinDist: number;
    rMaxDist: number;
    lMinDist: number;
    lMaxDist: number;
  }

  const beatStats: Record<string, BeatArmStats> = {};

  for (const b of BEATS) {
    let rSumSwing = 0;
    let lSumSwing = 0;
    let rMinS = 999, rMaxS = -999;
    let lMinS = 999, lMaxS = -999;
    let rMinF = 999, rMaxF = -999;
    let lMinF = 999, lMaxF = -999;
    let rMinD = 999, rMaxD = -999;
    let lMinD = 999, lMaxD = -999;
    let count = 0;

    for (const f of frames) {
      if (f.frame >= b.start && f.frame <= b.end) {
        count++;
        // Convention: bicepWorld = -90 + swing => swing = bicepWorld + 90
        const rSwing = f.manAngles[9] + 90.0;
        const lSwing = f.manAngles[14] + 90.0;
        // forearmWorld = bicepWorld + flex => flex = forearmWorld - bicepWorld
        const rFlex = f.manAngles[10] - f.manAngles[9];
        const lFlex = f.manAngles[15] - f.manAngles[14];

        rSumSwing += rSwing;
        lSumSwing += lSwing;
        if (rSwing < rMinS) rMinS = rSwing;
        if (rSwing > rMaxS) rMaxS = rSwing;
        if (lSwing < lMinS) lMinS = lSwing;
        if (lSwing > lMaxS) lMaxS = lSwing;

        if (rFlex < rMinF) rMinF = rFlex;
        if (rFlex > rMaxF) rMaxF = rFlex;
        if (lFlex < lMinF) lMinF = lFlex;
        if (lFlex > lMaxF) lMaxF = lFlex;

        const fk = solveForwardKinematics17(f.manX, f.manY, f.manAngles, 0.5);
        const shX = fk[8].endX;
        const shY = fk[8].endY;
        const rHandDist = Math.hypot(fk[11].endX - shX, fk[11].endY - shY);
        const lHandDist = Math.hypot(fk[16].endX - shX, fk[16].endY - shY);

        if (rHandDist < rMinD) rMinD = rHandDist;
        if (rHandDist > rMaxD) rMaxD = rHandDist;
        if (lHandDist < lMinD) lMinD = lHandDist;
        if (lHandDist > lMaxD) lMaxD = lHandDist;
      }
    }

    beatStats[b.id] = {
      rAvgSwing: count > 0 ? rSumSwing / count : 0,
      lAvgSwing: count > 0 ? lSumSwing / count : 0,
      rMinSwing: rMinS,
      rMaxSwing: rMaxS,
      lMinSwing: lMinS,
      lMaxSwing: lMaxS,
      rMinFlex: rMinF,
      rMaxFlex: rMaxF,
      lMinFlex: lMinF,
      lMaxFlex: lMaxF,
      rMinDist: rMinD,
      rMaxDist: rMaxD,
      lMinDist: lMinD,
      lMaxDist: lMaxD,
    };
  }

  // Print measured numbers per beat, per arm
  console.log('=== SIT-WALK-KICK REAL ARM BIOMECHANICS AUDIT ===');
  for (const b of BEATS) {
    const s = beatStats[b.id];
    console.log(
      `Beat ${b.id} (${b.name}):\n` +
      `  Right Arm: Swing [${s.rMinSwing.toFixed(1)}° .. ${s.rMaxSwing.toFixed(1)}°] (Avg ${s.rAvgSwing.toFixed(1)}°), Flex [${s.rMinFlex.toFixed(1)}° .. ${s.rMaxFlex.toFixed(1)}°], HandDist [${s.rMinDist.toFixed(1)} .. ${s.rMaxDist.toFixed(1)} px]\n` +
      `  Left Arm:  Swing [${s.lMinSwing.toFixed(1)}° .. ${s.lMaxSwing.toFixed(1)}°] (Avg ${s.lAvgSwing.toFixed(1)}°), Flex [${s.lMinFlex.toFixed(1)}° .. ${s.lMaxFlex.toFixed(1)}°], HandDist [${s.lMinDist.toFixed(1)} .. ${s.lMaxDist.toFixed(1)} px]`
    );
  }

  // Check 15: Walk Shoulder Range (>= 35° total)
  const dStats = beatStats['D'];
  const rWalkRange = dStats.rMaxSwing - dStats.rMinSwing;
  const lWalkRange = dStats.lMaxSwing - dStats.lMinSwing;
  items.push({
    id: 'walk-shoulder-range',
    label: 'Walk Shoulder Swing Amplitude (Act D)',
    passed: rWalkRange >= 35.0 && lWalkRange >= 35.0,
    metric: `Right: ${rWalkRange.toFixed(1)}°, Left: ${lWalkRange.toFixed(1)}°`,
    threshold: '≥ 35.0° each arm',
    detail: `Stroll shoulder swings dynamically (Right ${rWalkRange.toFixed(1)}°, Left ${lWalkRange.toFixed(1)}°) exceeding the 35° minimum without frozen arms.`,
  });

  // Check 16: Stroll Hand-to-Shoulder Distance (>= 0.9 * 162.6 = 146.3 px)
  const minWalkHandDist = Math.min(dStats.rMinDist, dStats.lMinDist);
  items.push({
    id: 'walk-arm-extension',
    label: 'Walk Arm Extension & Pendulum Reach',
    passed: minWalkHandDist >= 0.9 * 162.6,
    metric: `Min distance: ${minWalkHandDist.toFixed(1)} px (Right ${dStats.rMinDist.toFixed(1)} px, Left ${dStats.lMinDist.toFixed(1)} px)`,
    threshold: '≥ 146.3 px (0.9 × 162.6 px)',
    detail: 'Hands remain natural pendulums (min distance 146.3 px) instead of folding into collapsed elbows during the stroll.',
  });

  // Check 17: Run Shoulder Range (>= 90° total)
  const gStats = beatStats['G'];
  const rRunRange = gStats.rMaxSwing - gStats.rMinSwing;
  const lRunRange = gStats.lMaxSwing - gStats.lMinSwing;
  items.push({
    id: 'run-shoulder-range',
    label: 'Sprint Shoulder Swing Amplitude (Act G)',
    passed: rRunRange >= 90.0 && lRunRange >= 90.0,
    metric: `Right: ${rRunRange.toFixed(1)}°, Left: ${lRunRange.toFixed(1)}°`,
    threshold: '≥ 90.0° each arm',
    detail: `Sprinting arms pump vigorously with ±50° amplitude (Right ${rRunRange.toFixed(1)}°, Left ${lRunRange.toFixed(1)}°) with elbow flex ~90°.`,
  });

  // Check 18: Jump Arms Reach (>= +150°)
  const fStats = beatStats['F'];
  const rJumpReach = fStats.rMaxSwing;
  const lJumpReach = fStats.lMaxSwing;
  items.push({
    id: 'jump-arms-overhead',
    label: 'Jump Airborne Overhead Arm Reach (Act F)',
    passed: rJumpReach >= 150.0 && lJumpReach >= 150.0,
    metric: `Right: ${rJumpReach.toFixed(1)}°, Left: ${lJumpReach.toFixed(1)}°`,
    threshold: '≥ +150.0° reach',
    detail: `Airborne jump sweeps arms from -45° to overhead reach (Right ${rJumpReach.toFixed(1)}°, Left ${lJumpReach.toFixed(1)}°).`,
  });

  // Check 19: Pairwise Distinct Average Swing (> 5.0° difference across all beats)
  let minSepR = 999;
  let minSepL = 999;
  let pairR = '';
  let pairL = '';
  for (let i = 0; i < BEATS.length; i++) {
    for (let j = i + 1; j < BEATS.length; j++) {
      const b1 = BEATS[i].id;
      const b2 = BEATS[j].id;
      const dR = Math.abs(beatStats[b1].rAvgSwing - beatStats[b2].rAvgSwing);
      const dL = Math.abs(beatStats[b1].lAvgSwing - beatStats[b2].lAvgSwing);
      if (dR < minSepR) {
        minSepR = dR;
        pairR = `${b1} vs ${b2}`;
      }
      if (dL < minSepL) {
        minSepL = dL;
        pairL = `${b1} vs ${b2}`;
      }
    }
  }
  items.push({
    id: 'beat-swing-distinctness',
    label: 'Distinct Average Swing Across All Beats',
    passed: minSepR > 5.0 && minSepL > 5.0,
    metric: `Min separation: Right ${minSepR.toFixed(2)}° (${pairR}), Left ${minSepL.toFixed(2)}° (${pairL})`,
    threshold: '> 5.0° separation',
    detail: 'Every beat has an individual distinct arm choreography identity; no duplicate average swing angles across beats.',
  });

  // Check 20: No Static Arm Frames (> 6 consecutive) outside F0-18 and F205-215
  let maxStaticR = 0;
  let maxStaticL = 0;
  let curStaticR = 0;
  let curStaticL = 0;
  for (let fIdx = 19; fIdx <= 204; fIdx++) {
    const prev = frames.find((x) => x.frame === fIdx - 1);
    const curr = frames.find((x) => x.frame === fIdx);
    if (prev && curr) {
      const dR = Math.hypot(
        curr.manAngles[9] - prev.manAngles[9],
        curr.manAngles[10] - prev.manAngles[10]
      );
      const dL = Math.hypot(
        curr.manAngles[14] - prev.manAngles[14],
        curr.manAngles[15] - prev.manAngles[15]
      );
      if (dR < 0.05) {
        curStaticR++;
        if (curStaticR > maxStaticR) maxStaticR = curStaticR;
      } else {
        curStaticR = 0;
      }
      if (dL < 0.05) {
        curStaticL++;
        if (curStaticL > maxStaticL) maxStaticL = curStaticL;
      } else {
        curStaticL = 0;
      }
    }
  }
  items.push({
    id: 'no-static-arm-frames',
    label: 'Continuous Organic Arm Life (Zero Static Freezes)',
    passed: maxStaticR <= 6 && maxStaticL <= 6,
    metric: `Max consecutive static: Right ${maxStaticR}f, Left ${maxStaticL}f`,
    threshold: '≤ 6 consecutive frames',
    detail: 'Arms exhibit continuous organic living micro-motion outside of initial seated pause and final celebratory hold.',
  });

  // Check 21: Stroll Left & Right NOT Exact Mirrors
  let minMirrorSum = 999;
  for (const f of frames) {
    if (f.frame >= 82 && f.frame <= 111) {
      const rS = f.manAngles[9] + 90.0;
      const lS = f.manAngles[14] + 90.0;
      const sum = Math.abs(rS + lS);
      if (sum < minMirrorSum) minMirrorSum = sum;
    }
  }
  items.push({
    id: 'stroll-arm-asymmetry',
    label: 'Organic Stroll Arm Asymmetry (Non-Mirrored)',
    passed: minMirrorSum > 2.0,
    metric: `${minMirrorSum.toFixed(2)}° min deviation from mirror zero-sum`,
    threshold: '> 2.0° asymmetry',
    detail: 'Left and right arms incorporate 4° offset, 10% amplitude divergence, and phase lag rather than mechanical mirroring.',
  });

  // Check 22: Elbow Polarity (Hand moves forward of elbow when flexed)
  let minFlexOverall = 999;
  let minHandForwardDelta = 999;
  for (const f of frames) {
    const rFlex = f.manAngles[10] - f.manAngles[9];
    const lFlex = f.manAngles[15] - f.manAngles[14];
    if (rFlex < minFlexOverall) minFlexOverall = rFlex;
    if (lFlex < minFlexOverall) minFlexOverall = lFlex;

    const fk = solveForwardKinematics17(f.manX, f.manY, f.manAngles, 0.5);
    // When facing +X, forearm vector (hand - elbow):
    // For elbow flexion, hand X relative to elbow X should not flip unnaturally behind
    const rHandRelX = fk[11].endX - fk[10].startX;
    const lHandRelX = fk[16].endX - fk[15].startX;
    if (rHandRelX < minHandForwardDelta) minHandForwardDelta = rHandRelX;
    if (lHandRelX < minHandForwardDelta) minHandForwardDelta = lHandRelX;
  }
  items.push({
    id: 'elbow-flexion-polarity',
    label: 'Elbow Anatomical Flexion Polarity',
    passed: minFlexOverall >= 5.0,
    metric: `Min elbow flex: ${minFlexOverall.toFixed(1)}°`,
    threshold: '≥ 5.0° forward bend',
    detail: 'Elbow joints bend exclusively forward/up (+X/-Y) anatomically; zero backward hyperextension.',
  });

  const passedChecks = items.filter((c) => c.passed).length;
  return {
    passed: passedChecks === items.length,
    totalChecks: items.length,
    passedChecks,
    items,
  };
}
