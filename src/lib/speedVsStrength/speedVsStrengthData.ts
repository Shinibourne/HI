import { SpeedVsStrengthKeyframeSpec } from './speedVsStrengthTypes';
import { solveNaturalLegIK } from './speedVsStrengthIK';

function makeStanceA_R(pelvisX: number, pelvisY: number, rFootX: number, lFootX: number, spineAng = 88, chestAng = 86): number[] {
  const rLeg = solveNaturalLegIK(pelvisX, pelvisY, rFootX, 755.0, true);
  const lLeg = solveNaturalLegIK(pelvisX, pelvisY, lFootX, 755.0, true);
  return [
    0,
    rLeg.thighAngle, rLeg.shinAngle, 0,
    lLeg.thighAngle, lLeg.shinAngle, 0,
    spineAng, chestAng,
    -48, 58, 60,
    spineAng, spineAng,
    -68, 68, 70
  ];
}

function makeStanceA_L(pelvisX: number, pelvisY: number, rFootX: number, lFootX: number, spineAng = 92, chestAng = 94): number[] {
  const rLeg = solveNaturalLegIK(pelvisX, pelvisY, rFootX, 755.0, false);
  const lLeg = solveNaturalLegIK(pelvisX, pelvisY, lFootX, 755.0, false);
  return [
    0,
    rLeg.thighAngle, rLeg.shinAngle, 180,
    lLeg.thighAngle, lLeg.shinAngle, 180,
    spineAng, chestAng,
    -92, 112, 116,
    spineAng, spineAng,
    -72, 105, 110
  ];
}

function makeStanceB_L(pelvisX: number, pelvisY: number, rFootX: number, lFootX: number, spineAng = 93, chestAng = 95): number[] {
  const rLeg = solveNaturalLegIK(pelvisX, pelvisY, rFootX, 755.0, false);
  const lLeg = solveNaturalLegIK(pelvisX, pelvisY, lFootX, 755.0, false);
  return [
    0,
    rLeg.thighAngle, rLeg.shinAngle, 180,
    lLeg.thighAngle, lLeg.shinAngle, 180,
    spineAng, chestAng,
    -110, 115, 120,
    92, 92,
    -135, 130, 135
  ];
}

function makeStanceB_R(pelvisX: number, pelvisY: number, rFootX: number, lFootX: number, spineAng = 88, chestAng = 88): number[] {
  const rLeg = solveNaturalLegIK(pelvisX, pelvisY, rFootX, 755.0, true);
  const lLeg = solveNaturalLegIK(pelvisX, pelvisY, lFootX, 755.0, true);
  return [
    0,
    rLeg.thighAngle, rLeg.shinAngle, 0,
    lLeg.thighAngle, lLeg.shinAngle, 0,
    spineAng, chestAng,
    -65, 65, 70,
    84, 82,
    -125, 80, 85
  ];
}

function buildCanonical36Frames(): SpeedVsStrengthKeyframeSpec[] {
  const frames: SpeedVsStrengthKeyframeSpec[] = [];

  // ===========================================================================
  // ACT 1: STANDOFF & SIZING UP (Frames 00..04)
  // Distance: A at X=380, B at X=645. Both grounded on Y=755.
  // ===========================================================================

  // F00: Initial Read
  frames.push({
    frame: 0,
    act: 'Act 1: Standoff & Sizing Up',
    phase: 'Initial Read: A in relaxed fluid guard (X=380, Y=510); B in deep orthodox power stance (X=645, Y=518). Both feet anchored on Y=755.',
    camX: -80.0, camY: 0.0, camZoom: 1.15,
    charAX: 380, charAY: 510,
    charAAngles: makeStanceA_R(380, 510, 415, 345, 88, 86),
    charBX: 645, charBY: 518,
    charBAngles: makeStanceB_L(645, 518, 695, 595, 93, 95),
  });

  // F01: Hold & Eye Lock
  frames.push({
    frame: 1,
    act: 'Act 1: Standoff & Sizing Up',
    phase: 'Eye Lock & Stillness: Both fighters hold guard with zero unnecessary fidgeting. Disciplined physical tension.',
    camX: -80.0, camY: 0.0, camZoom: 1.15,
    charAX: 380, charAY: 510,
    charAAngles: makeStanceA_R(380, 510, 415, 345, 88, 86),
    charBX: 645, charBY: 518,
    charBAngles: makeStanceB_L(645, 518, 695, 595, 93, 95),
  });

  // F02: Diaphragmatic Inhalation
  frames.push({
    frame: 2,
    act: 'Act 1: Standoff & Sizing Up',
    phase: 'Sizing Up: B takes a deep diaphragmatic breath (chest rises 2px, shoulders broaden); A holds stillness.',
    camX: -80.0, camY: 0.0, camZoom: 1.15,
    charAX: 380, charAY: 510,
    charAAngles: makeStanceA_R(380, 510, 415, 345, 88, 86),
    charBX: 645, charBY: 516,
    charBAngles: makeStanceB_L(645, 516, 695, 595, 91, 98),
  });

  // F03: A Weight Shift onto Lead Foot (Rear heel lifts naturally, ZERO hyperextension)
  {
    const rLegA = solveNaturalLegIK(383, 512, 420, 755.0, true);
    frames.push({
      frame: 3,
      act: 'Act 1: Standoff & Sizing Up',
      phase: 'Weight Shift: A shifts 70% weight onto lead foot; Rear heel lifts naturally preparing to drive; B remains solidly anchored.',
      camX: -80.0, camY: 0.0, camZoom: 1.16,
      charAX: 383, charAY: 512,
      charAAngles: [
        0,
        rLegA.thighAngle, rLegA.shinAngle, 0,
        -85, -105, 10, // rear heel lifted, knee flexed forward naturally!
        82, 80,
        -52, 54, 56,
        82, 84,
        -72, 64, 66
      ],
      charBX: 645, charBY: 518,
      charBAngles: makeStanceB_L(645, 518, 695, 595, 93, 94),
    });
  }

  // F04: A Drops Center of Mass into Pre-Launch Compression
  {
    const rLegA = solveNaturalLegIK(385, 526, 425, 755.0, true);
    frames.push({
      frame: 4,
      act: 'Act 1: Standoff & Sizing Up',
      phase: 'Pre-Sprint Compression: A drops Center of Mass (Y=526), knees flex forward, torso tilts 35° forward into acceleration angle; B core tenses.',
      camX: -80.0, camY: 0.0, camZoom: 1.16,
      charAX: 385, charAY: 526,
      charAAngles: [
        0,
        rLegA.thighAngle, rLegA.shinAngle, 0,
        -75, -105, 15, // rear leg knee flexed forward, tendon loaded!
        72, 68,
        -68, 42, 45,
        76, 80,
        -88, 52, 55
      ],
      charBX: 645, charBY: 519,
      charBAngles: makeStanceB_L(645, 519, 695, 595, 93, 93),
    });
  }

  // ===========================================================================
  // ACT 2: EXPLOSIVE LAUNCH & LEAP SEQUENCE (Frames 05..08)
  // True Jump Biomechanics:
  // F05: Push-Off (Ground Drive) — Triple extension of rear leg (-145°/-162°),
  //      lead knee driving forward-up (-30°/-85°).
  // F06: Airborne Launch — Body leaves ground, pushing leg extends back,
  //      lead knee leads flight.
  // F07: Airborne Posture (Apex) — True human airborne hurdle stride at peak.
  // F08: Preparation for Landing — Lead leg extends down-forward toward mat.
  // ===========================================================================

  // F05: Ground Drive Push-Off
  frames.push({
    frame: 5,
    act: 'Act 2: The Explosive Launch',
    phase: 'Ground Drive: A rear foot drives violently against mat (triple extension); Torso leans into leap; Lead knee drives forward-up.',
    camX: -90.0, camY: 0.0, camZoom: 1.18,
    charAX: 435, charAY: 516,
    charAAngles: [
      0,
      -30, -85, -10, // lead thigh forward-up, shin hanging naturally under knee (kneecap forward!)
      -145, -162, -165, // rear leg in full triple extension pushing against ground
      58, 52,
      -135, -105, -100,
      72, 75,
      28, 72, 75
    ],
    charBX: 645, charBY: 519,
    charBAngles: makeStanceB_L(645, 519, 695, 595, 93, 93),
  });

  // F06: Airborne Launch (Triple Extension Follow-Through)
  frames.push({
    frame: 6,
    act: 'Act 2: The Explosive Launch',
    phase: 'Airborne Launch: A leaves turf into explosive forward leap; Pushing leg extends behind; Lead knee drives forward; Torso streamlined.',
    camX: -105.0, camY: 0.0, camZoom: 1.20,
    charAX: 515, charAY: 485,
    charAAngles: [
      0,
      -25, -80, -15, // lead knee leads flight forward, shin relaxed under thigh
      -150, -168, -170, // full flight trailing extension behind body
      56, 50,
      -140, -120, -115,
      72, 75,
      30, 74, 78
    ],
    charBX: 645, charBY: 519,
    charBAngles: makeStanceB_L(645, 519, 695, 595, 93, 94),
  });

  // F07: Airborne Posture (Apex of the Leap)
  frames.push({
    frame: 7,
    act: 'Act 2: The Explosive Launch',
    phase: 'Airborne Stride Apex: A at peak leap altitude passing B; Natural human airborne posture; Lead leg unfolds; Trailing leg cycles under hip.',
    camX: -120.0, camY: 0.0, camZoom: 1.22,
    charAX: 605, charAY: 470,
    charAAngles: [
      0,
      -35, -75, -10, // lead leg reaching forward for landing stride
      -105, -145, -150, // trailing leg cycling forward under pelvis, shin folded naturally behind
      60, 56,
      45, 85, 90,
      75, 78,
      -150, -130, -125
    ],
    charBX: 645, charBY: 518,
    charBAngles: makeStanceB_L(645, 518, 695, 595, 92, 95),
  });

  // F08: Preparation for Landing
  frames.push({
    frame: 8,
    act: 'Act 2: The Explosive Launch',
    phase: 'Landing Preparation: A descends past B; Lead leg extends down-forward reaching for ground; Trailing leg poised behind.',
    camX: -138.0, camY: 0.0, camZoom: 1.24,
    charAX: 695, charAY: 495,
    charAAngles: [
      0,
      -55, -85, 10, // lead leg reaching down-forward toward ground
      -120, -155, -160, // trailing leg trailing behind
      65, 62,
      -160, -140, -135,
      78, 80,
      50, 90, 95
    ],
    charBX: 645, charBY: 518,
    charBAngles: makeStanceB_L(645, 518, 695, 595, 92, 95),
  });

  // ===========================================================================
  // ACT 3: TOUCHDOWN, BRAKING & PIVOT SETTLE (Frames 09..11)
  // F09: Touchdown & Landing Compression — Lead foot touches down at Y=755,
  //      landing knee flexes to absorb impact force. B head snaps in shock.
  // F10: Braking Stride — Second foot plants, torso tilts back against inertia.
  // F11: Brake Settle — Pelvis drops low, knees absorb skid, preparing pivot.
  // ===========================================================================

  // F09: Landing Touchdown & Shock Absorption
  {
    const rLegA = solveNaturalLegIK(765, 522, 795, 755.0, true);
    const bStance = makeStanceB_L(645, 518, 695, 595, 90, 92);
    frames.push({
      frame: 9,
      act: 'Act 3: Speed Burst',
      phase: 'Landing Touchdown: A lead foot strikes ground (X=795, Y=755); Landing knee flexes naturally absorbing shock; B head snaps in utter shock.',
      camX: -155.0, camY: 0.0, camZoom: 1.28,
      charAX: 765, charAY: 522,
      charAAngles: [
        0,
        rLegA.thighAngle, rLegA.shinAngle, 5, // natural landing compression knee flex!
        -115, -145, -150, // trailing leg poised behind
        75, 70,
        -150, -130, -125,
        82, 84,
        50, 85, 90
      ],
      charBX: 645, charBY: 518,
      charBAngles: [
        0,
        bStance[1], bStance[2], 180,
        bStance[4], bStance[5], 180,
        90, 92,
        -90, 125, 130,
        72, 68, // head snaps right!
        -115, 142, 146
      ],
    });
  }

  // F10: Braking Plant
  {
    const rLegA = solveNaturalLegIK(815, 522, 850, 755.0, true);
    const lLegA = solveNaturalLegIK(815, 522, 760, 755.0, true);
    frames.push({
      frame: 10,
      act: 'Act 3: Speed Burst',
      phase: 'Braking Plant: Both feet on turf (Y=755); Torso tilts backward (100°) to scrub forward momentum; Knees absorb deceleration.',
      camX: -175.0, camY: 0.0, camZoom: 1.30,
      charAX: 815, charAY: 522,
      charAAngles: [
        0,
        rLegA.thighAngle, rLegA.shinAngle, 20,
        lLegA.thighAngle, lLegA.shinAngle, 0,
        100, 105, // torso tilted back against inertia
        -30, 20, 25,
        90, 88,
        -145, -115, -110
      ],
      charBX: 645, charBY: 520,
      charBAngles: makeStanceB_L(645, 520, 695, 595, 88, 88),
    });
  }

  // F11: Brake Settle
  {
    const rLegA = solveNaturalLegIK(825, 524, 860, 755.0, true);
    const lLegA = solveNaturalLegIK(825, 524, 780, 755.0, true);
    frames.push({
      frame: 11,
      act: 'Act 3: Speed Burst',
      phase: 'Brake Settle: A drops hips low (Y=524) absorbing skid force; B begins unweighting foot to initiate 180° turnaround.',
      camX: -190.0, camY: 0.0, camZoom: 1.32,
      charAX: 825, charAY: 524,
      charAAngles: [
        0,
        rLegA.thighAngle, rLegA.shinAngle, 10,
        lLegA.thighAngle, lLegA.shinAngle, 0,
        96, 100,
        -45, 35, 40,
        90, 88,
        -120, -90, -85
      ],
      charBX: 645, charBY: 522,
      charBAngles: makeStanceB_L(645, 522, 695, 595, 86, 84),
    });
  }

  // ===========================================================================
  // ACT 4: B REACTS & LOADS COMPACT POWER CROSS (Frames 12..16)
  // Distance: B at X=645, A at X=820 (distance = 175 px, exact sparring range).
  // A spins 180° into disciplined left-facing guard and holds still.
  // B pivots feet, hips, shoulders into orthodox boxing stance facing right.
  // B loads compact power cross: elbow tucked, fist at cheek, lead hand probes.
  // ZERO giant wild circular flailing!
  // ===========================================================================

  // F12: Low Pivot 180°
  {
    const rLegB = solveNaturalLegIK(645, 522, 695, 755.0, false);
    frames.push({
      frame: 12,
      act: 'Act 4: B Reacts & Loads Power Cross',
      phase: 'Low Pivot: A spins 180° into solid left-facing ready guard at (X=820, Y=512); B pivots left foot.',
      camX: -200.0, camY: 0.0, camZoom: 1.34,
      charAX: 820, charAY: 512,
      charAAngles: makeStanceA_L(820, 512, 855, 785, 92, 94),
      charBX: 645, charBY: 522,
      charBAngles: [
        0,
        rLegB.thighAngle, rLegB.shinAngle, 180,
        -95, -75, 0, // unweighting left foot to step (natural knee bend!)
        86, 84, -75, 50, 55, 82, 80, -115, 90, 95
      ],
    });
  }

  // F13: B Heavy Turn Step
  {
    const rLegB = solveNaturalLegIK(645, 521, 685, 755.0, true);
    frames.push({
      frame: 13,
      act: 'Act 4: B Reacts & Loads Power Cross',
      phase: 'B Heavy Turn: Left foot steps around; Hips rotate to face right; A holds disciplined ready guard.',
      camX: -200.0, camY: 0.0, camZoom: 1.34,
      charAX: 820, charAY: 512,
      charAAngles: makeStanceA_L(820, 512, 855, 785, 92, 94),
      charBX: 645, charBY: 521,
      charBAngles: [
        0,
        rLegB.thighAngle, rLegB.shinAngle, 0,
        -75, -100, 0, // left foot stepping down facing right
        88, 86, -70, 58, 62, 84, 82, -120, 85, 90
      ],
    });
  }

  // F14: B Plants Stance Facing Right
  frames.push({
    frame: 14,
    act: 'Act 4: B Reacts & Loads Power Cross',
    phase: 'B Plants Stance Facing Right: Feet set wide (X=605 & X=685); Fists in tight guard protecting jaw; A holds guard.',
    camX: -205.0, camY: 0.0, camZoom: 1.35,
    charAX: 820, charAY: 512,
    charAAngles: makeStanceA_L(820, 512, 855, 785, 92, 94),
    charBX: 645, charBY: 520,
    charBAngles: makeStanceB_R(645, 520, 685, 605, 88, 88),
  });

  // F15: Loading Compact Power Cross
  {
    const rLegB = solveNaturalLegIK(645, 520, 685, 755.0, true);
    const lLegB = solveNaturalLegIK(645, 520, 605, 755.0, true);
    frames.push({
      frame: 15,
      act: 'Act 4: B Reacts & Loads Power Cross',
      phase: 'Loading the Punch: B shifts weight to rear left leg; Right fist stays near cheek with elbow tucked; Left arm probes forward.',
      camX: -210.0, camY: 0.0, camZoom: 1.35,
      charAX: 820, charAY: 512,
      charAAngles: makeStanceA_L(820, 512, 855, 785, 92, 94),
      charBX: 645, charBY: 520,
      charBAngles: [
        0,
        rLegB.thighAngle, rLegB.shinAngle, 0,
        lLegB.thighAngle, lLegB.shinAngle, 0,
        92, 94,
        -25, 75, 80, // right elbow tucked, fist cocked at chin level!
        86, 84,
        -15, 35, 40 // lead hand probing forward
      ],
    });
  }

  // F16: MAXIMUM COIL (Telegraph Tension Hold)
  {
    const rLegB = solveNaturalLegIK(645, 522, 685, 755.0, true);
    const lLegB = solveNaturalLegIK(645, 522, 605, 755.0, true);
    frames.push({
      frame: 16,
      act: 'Act 4: B Reacts & Loads Power Cross',
      phase: 'MAXIMUM COIL: B coils rear hip, right fist cocked at chin level; A recognizes telegraph and softens knees.',
      camX: -215.0, camY: 5.0, camZoom: 1.36,
      charAX: 820, charAY: 516,
      charAAngles: makeStanceA_L(820, 516, 855, 785, 90, 92),
      charBX: 645, charBY: 522,
      charBAngles: [
        0,
        rLegB.thighAngle, rLegB.shinAngle, 0,
        lLegB.thighAngle, lLegB.shinAngle, 0,
        95, 98,
        -20, 80, 85, // tight compact coil, ZERO giant swing
        84, 82,
        -10, 30, 35
      ],
    });
  }

  // ===========================================================================
  // ACT 5: THE PUNCH & THE SLIP (Frames 17..20)
  // B drives right punch in a laser-straight direct line from chin to X=814, Y=338.
  // Left hand stays glued to chin in tight guard.
  // A ducks/slips: knees flex forward naturally, pelvis drops (Y=545),
  // torso curls, head drops to Y=367 safely under punch plane (Y=338).
  // Punch whiffs overhead -> B over-extends due to committed momentum.
  // ===========================================================================

  // F17: Punch Drive & A Drops Center of Mass
  {
    const rLegB = solveNaturalLegIK(645, 520, 685, 755.0, true);
    const lLegB = solveNaturalLegIK(645, 520, 605, 755.0, true);
    frames.push({
      frame: 17,
      act: 'Act 5: The Punch & The Slip',
      phase: 'Kinetic Drive: B rear heel pivots, right shoulder drives forward; A drops Center of Mass (Y=532), bending knees forward naturally.',
      camX: -220.0, camY: 10.0, camZoom: 1.38,
      charAX: 820, charAY: 532,
      charAAngles: [
        0,
        -95, -70, 180, // rear leg knee flexed forward naturally
        -120, -70, 180, // lead leg knee flexed forward naturally
        105, 112,
        -105, 95, 100,
        98, 98,
        -85, 90, 95
      ],
      charBX: 645, charBY: 520,
      charBAngles: [
        0,
        rLegB.thighAngle, rLegB.shinAngle, 0,
        lLegB.thighAngle, lLegB.shinAngle, 15,
        84, 80,
        20, 22, 25, // punch launching straight from chin aimed at standing head level
        80, 78,
        -55, 65, 70 // left hand guarding chin!
      ],
    });
  }

  // F18: THE SLIP (Duck) — Compact Direct Line
  {
    const rLegB = solveNaturalLegIK(645, 520, 685, 755.0, true);
    const lLegB = solveNaturalLegIK(645, 520, 605, 755.0, true);
    frames.push({
      frame: 18,
      act: 'Act 5: The Punch & The Slip',
      phase: 'THE SLIP (Duck): B right punch extends in direct line (Fist X=814, Y=338); A ducks head down (Y=367) safely under punch.',
      camX: -225.0, camY: 12.0, camZoom: 1.40,
      charAX: 820, charAY: 545,
      charAAngles: [
        0,
        -95, -68, 180, // rear leg natural knee
        -125, -65, 180, // lead leg natural knee
        115, 125, // spine curled forward in tight duck
        140, 85, 80, // peek-a-boo guard
        105, 95,
        155, 110, 105
      ],
      charBX: 645, charBY: 520,
      charBAngles: [
        0,
        rLegB.thighAngle, rLegB.shinAngle, 0,
        lLegB.thighAngle, lLegB.shinAngle, 15,
        78, 74, // torso rotated into punch
        28, 28, 28, // fist extends directly forward at head height (X=814, Y=338)
        78, 80, // chin tucked behind punching shoulder
        -60, 70, 75 // lead hand guarding jaw
      ],
    });
  }

  // F19: THE WHIFF (Fist Sweeps Overhead)
  {
    const rLegB = solveNaturalLegIK(650, 520, 685, 755.0, true);
    const lLegB = solveNaturalLegIK(650, 520, 605, 755.0, true);
    frames.push({
      frame: 19,
      act: 'Act 5: The Punch & The Slip',
      phase: 'THE WHIFF: Fist whips overhead into empty air (X=825); B committed full weight; A head ducked safely below.',
      camX: -225.0, camY: 14.0, camZoom: 1.42,
      charAX: 820, charAY: 542,
      charAAngles: [
        0,
        -95, -70, 180,
        -122, -66, 180,
        116, 126,
        138, 88, 85,
        106, 94,
        152, 112, 108
      ],
      charBX: 650, charBY: 520,
      charBAngles: [
        0,
        rLegB.thighAngle, rLegB.shinAngle, 0,
        lLegB.thighAngle, lLegB.shinAngle, 20,
        70, 65,
        22, 18, 15, // punch follows through over ducked head
        74, 76,
        -65, 68, 72
      ],
    });
  }

  // F20: OVER-EXTENSION
  {
    const rLegB = solveNaturalLegIK(655, 522, 690, 755.0, true);
    frames.push({
      frame: 20,
      act: 'Act 5: The Punch & The Slip',
      phase: 'OVER-EXTENSION: Forward momentum drags B torso past front knee; A uncoils legs and rises, seeing exposed ribs.',
      camX: -220.0, camY: 12.0, camZoom: 1.40,
      charAX: 820, charAY: 528,
      charAAngles: [
        0,
        -95, -72, 180,
        -115, -75, 180,
        100, 105,
        -110, 85, 90,
        96, 96,
        -75, 95, 100
      ],
      charBX: 655, charBY: 522,
      charBAngles: [
        0,
        rLegB.thighAngle, rLegB.shinAngle, 0,
        -145, -165, 25, // rear foot dragged forward off-balance
        60, 50,
        -8, -14, -18, // arm follow-through
        65, 68,
        -80, 55, 60
      ],
    });
  }

  // ===========================================================================
  // ACT 6: A COUNTERS — PIVOT, CHAMBER, SIDE KICK & IMPACT CLASH (Frames 21..24)
  // Supporting right leg: locked at (X=820, Y=755), heel pivots toward target.
  // Left kicking leg:
  // F21: Supporting foot pivots, kicking leg unweights.
  // F22: High Knee Chamber: Torso leans back-right as counterweight;
  //      Kicking knee points left at B (175°), shin folded tight underneath (-5°).
  // F23: Piston Thrust: Hip punches through, kicking leg extends in linear strike.
  // F24: IMPACT CLASH! Striking heel slams into B lower ribs at X=645, Y=505.
  //      HIT-STOP FREEZE!
  // ===========================================================================

  // F21: Supporting Foot Pivot
  frames.push({
    frame: 21,
    act: 'Act 6: A Counters with Side Kick',
    phase: 'Supporting Foot Pivot: A plants right foot on mat, pivoting heel toward B to open hip; Left leg unweights; B struggles to brake.',
    camX: -215.0, camY: 10.0, camZoom: 1.38,
    charAX: 820, charAY: 518,
    charAAngles: [
      0,
      -105, -72, 0, // supporting right leg, knee forward-left, shin back-right (natural!)
      -130, -80, 15, // left kicking leg lifts
      78, 72,
      -65, 55, 60,
      85, 88,
      -115, 75, 80
    ],
    charBX: 655, charBY: 522,
    charBAngles: [
      0,
      -50, -88, 0, -145, -162, 20,
      58, 48, -12, -20, -25, 62, 65, -95, 60, 65
    ],
  });

  // F22: High Knee Chamber (True Martial Arts Side Kick Chamber)
  frames.push({
    frame: 22,
    act: 'Act 6: A Counters with Side Kick',
    phase: 'High Knee Chamber: A leans torso back (50°/42°) as counterweight; Kicking knee points left at B (175°), shin folded tight underneath (-5°).',
    camX: -210.0, camY: 10.0, camZoom: 1.38,
    charAX: 820, charAY: 516,
    charAAngles: [
      0,
      -102, -74, 0, // supporting right leg solid on ground Y=755
      175, -5, 150, // knee points left at B, shin folded tight underneath thigh!
      50, 42, // torso counter-lean
      -30, 40, 45,
      75, 88,
      135, 160, 165
    ],
    charBX: 650, charBY: 522,
    charBAngles: [
      0,
      -50, -88, 0, -140, -158, 15,
      60, 50, -8, -15, -20, 64, 66, -100, 65, 70
    ],
  });

  // F23: Piston Thrust Extension
  frames.push({
    frame: 23,
    act: 'Act 6: A Counters with Side Kick',
    phase: 'Piston Thrust Extension: Left leg drives out in linear strike; Hip punches through; Heel leads directly into B exposed ribs.',
    camX: -205.0, camY: 10.0, camZoom: 1.38,
    charAX: 820, charAY: 514,
    charAAngles: [
      0,
      -102, -74, 0, // supporting leg locked
      178, 180, 175, // straight linear side kick piston thrust!
      48, 38,
      -30, 30, 35,
      74, 90,
      172, 170, 168
    ],
    charBX: 645, charBY: 522,
    charBAngles: [
      0,
      -52, -86, 0, -135, -150, 10,
      64, 54, 10, -5, -10, 65, 68, -110, 70, 75
    ],
  });

  // F24: IMPACT CLASH! Striking heel slams into B ribs (X=645, Y=505)
  frames.push({
    frame: 24,
    act: 'Act 6: A Counters with Side Kick',
    phase: 'IMPACT CLASH! Striking heel impacts B lower ribs (X=645, Y=505); B solar plexus compresses violently; HIT-STOP FREEZE!',
    camX: -200.0, camY: 10.0, camZoom: 1.40,
    charAX: 820, charAY: 514,
    charAAngles: [
      0,
      -102, -74, 0,
      176, 180, 175,
      48, 38,
      -30, 30, 35,
      74, 90,
      172, 170, 168
    ],
    charBX: 645, charBY: 522,
    charBAngles: [
      0,
      -45, -88, 0, -125, -142, 0,
      72, 54, 45, 15, 8, 52, 48, 135, 110, 105
    ],
  });

  // ===========================================================================
  // ACT 7: BALLISTIC RECOIL, PARABOLIC FLIGHT & HEAVY TOUCHDOWN (Frames 25..31)
  // B launched backward from X=645 to X=240 along parabolic flight path.
  // A re-chambers kicking knee before setting foot down smoothly.
  // B boots slam into mat at X=250, knees compress deeply, slide halts at X=240.
  // ===========================================================================

  // F25: The Launch Impulse
  frames.push({
    frame: 25,
    act: 'Act 7: Ballistic Recoil & Touchdown',
    phase: 'The Launch Impulse: Kinetic transfer accelerates B backward; Boots leave mat (Y=495); A follow-through.',
    camX: -180.0, camY: 5.0, camZoom: 1.35,
    charAX: 820, charAY: 514,
    charAAngles: [
      0,
      -102, -74, 0,
      175, 178, 175,
      52, 40,
      -25, 35, 40,
      76, 90,
      165, 162, 160
    ],
    charBX: 600, charBY: 495,
    charBAngles: [
      0,
      8, -45, 25, -65, -115, 0,
      105, 118, 55, 25, 18, 112, 116, -115, -95, -90
    ],
  });

  // F26: Airborne Ascent & A RE-CHAMBERS KNEE
  frames.push({
    frame: 26,
    act: 'Act 7: Ballistic Recoil & Touchdown',
    phase: 'Airborne Ascent: B flies up and back (X=520, Y=455); A snaps kicking knee back into tight chamber (re-chamber).',
    camX: -150.0, camY: 0.0, camZoom: 1.30,
    charAX: 820, charAY: 514,
    charAAngles: [
      0,
      -102, -74, 0,
      175, -5, 150, // knee re-chambered crisp and tight!
      60, 50,
      -35, 45, 50,
      82, 92,
      120, 150, 155
    ],
    charBX: 520, charBY: 455,
    charBAngles: [
      0,
      22, -32, 35, -48, -98, 10,
      115, 128, 72, 42, 35, 122, 125, -95, -75, -70
    ],
  });

  // F27: Parabolic Flight Apex
  frames.push({
    frame: 27,
    act: 'Act 7: Ballistic Recoil & Touchdown',
    phase: 'Parabolic Flight Apex: B reaches peak altitude (X=430, Y=425); A lowers kicking foot in controlled downward arc.',
    camX: -110.0, camY: 0.0, camZoom: 1.25,
    charAX: 820, charAY: 514,
    charAAngles: [
      0,
      -102, -74, 0,
      -120, -85, 0, // lowering kicking foot down-forward
      78, 72,
      -45, 55, 60,
      88, 92,
      85, 125, 130
    ],
    charBX: 430, charBY: 425,
    charBAngles: [
      0,
      32, -22, 45, -35, -85, 15,
      124, 136, 85, 55, 48, 125, 130, -75, -55, -50
    ],
  });

  // F28: Ballistic Descent: A Left Foot Touches Down
  frames.push({
    frame: 28,
    act: 'Act 7: Ballistic Recoil & Touchdown',
    phase: 'Ballistic Descent: B falling fast along parabolic curve (X=340, Y=485); A left foot touches mat (Y=755), accepting weight.',
    camX: -70.0, camY: 0.0, camZoom: 1.20,
    charAX: 820, charAY: 512,
    charAAngles: makeStanceA_L(820, 512, 855, 785, 90, 92),
    charBX: 340, charBY: 485,
    charBAngles: [
      0,
      18, -35, 30, -55, -105, 5,
      115, 125, 65, 35, 28, 118, 122, -95, -75, -70
    ],
  });

  // F29: Pre-Landing Approach: B Boots Reach for Mat
  frames.push({
    frame: 29,
    act: 'Act 7: Ballistic Recoil & Touchdown',
    phase: 'Pre-Landing Approach: B boots reach down for mat (X=280, Y=555); Knees flex to brace for collision; A in balanced guard.',
    camX: -40.0, camY: 0.0, camZoom: 1.15,
    charAX: 820, charAY: 512,
    charAAngles: makeStanceA_L(820, 512, 855, 785, 91, 93),
    charBX: 280, charBY: 555,
    charBAngles: [
      0,
      -25, -75, 15, -82, -125, 0,
      95, 102, 35, 12, 10, 102, 105, -112, -90, -85
    ],
  });

  // F30: HEAVY TOUCHDOWN & COMPRESSION
  {
    const rLegB = solveNaturalLegIK(250, 565, 290, 755.0, true);
    const lLegB = solveNaturalLegIK(250, 565, 220, 755.0, true);
    frames.push({
      frame: 30,
      act: 'Act 7: Ballistic Recoil & Touchdown',
      phase: 'HEAVY TOUCHDOWN & COMPRESSION: B boots slam into mat (Y=755 at X=250); Knees undergo massive compression; Pelvis drops to (250, 565).',
      camX: -20.0, camY: 0.0, camZoom: 1.12,
      charAX: 820, charAY: 512,
      charAAngles: makeStanceA_L(820, 512, 855, 785, 91, 93),
      charBX: 250, charBY: 565,
      charBAngles: [
        0,
        rLegB.thighAngle, rLegB.shinAngle, 0,
        lLegB.thighAngle, lLegB.shinAngle, 0,
        75, 68,
        -45, -15, -20,
        82, 80,
        -125, -105, -100
      ],
    });
  }

  // F31: Friction Skid Slide & 3-Point Brace
  {
    const rLegB = solveNaturalLegIK(240, 560, 285, 755.0, true);
    const lLegB = solveNaturalLegIK(240, 560, 205, 755.0, true);
    frames.push({
      frame: 31,
      act: 'Act 7: Ballistic Recoil & Touchdown',
      phase: 'Friction Skid Slide & 3-Point Brace: B drops rear knee and slams left fist onto mat to halt slide at X=240.',
      camX: 0.0, camY: 0.0, camZoom: 1.10,
      charAX: 820, charAY: 512,
      charAAngles: makeStanceA_L(820, 512, 855, 785, 91, 93),
      charBX: 240, charBY: 560,
      charBAngles: [
        0,
        rLegB.thighAngle, rLegB.shinAngle, 0,
        lLegB.thighAngle, lLegB.shinAngle, 0,
        65, 52,
        -35, 15, 20,
        72, 70,
        -90, -90, -90 // fist planted on ground!
      ],
    });
  }

  // ===========================================================================
  // ACT 8: RESOLUTION & THE CONTRAST (Frames 32..35)
  // B halted across arena in 3-point brace, heaving chest, slowly lifting head.
  // A stands untouched across arena (X=820), balanced and breathing easily.
  // ===========================================================================

  // F32: Skid Halts in 3-Point Floor Brace (HOLD)
  {
    const rLegB = solveNaturalLegIK(240, 560, 285, 755.0, true);
    const lLegB = solveNaturalLegIK(240, 560, 205, 755.0, true);
    frames.push({
      frame: 32,
      act: 'Act 8: Resolution & Contrast',
      phase: 'B Halted in 3-Point Floor Brace (X=240); A stands untouched across arena (X=820), balanced and breathing easily.',
      camX: 0.0, camY: 0.0, camZoom: 1.05,
      charAX: 820, charAY: 512,
      charAAngles: makeStanceA_L(820, 512, 855, 785, 91, 93),
      charBX: 240, charBY: 560,
      charBAngles: [
        0,
        rLegB.thighAngle, rLegB.shinAngle, 0,
        lLegB.thighAngle, lLegB.shinAngle, 0,
        68, 58,
        -32, 22, 26,
        68, 65,
        -90, -90, -90 // fist on ground supporting weight
      ],
    });
  }

  // F33: Hold & Ragged Breath
  {
    const rLegB = solveNaturalLegIK(240, 558, 285, 755.0, true);
    const lLegB = solveNaturalLegIK(240, 558, 205, 755.0, true);
    frames.push({
      frame: 33,
      act: 'Act 8: Resolution & Contrast',
      phase: 'Hold & Heavy Breath: B chest heaves with ragged breath; Fist pressed into mat; A holds still, pristine balance.',
      camX: 0.0, camY: 0.0, camZoom: 1.05,
      charAX: 820, charAY: 512,
      charAAngles: makeStanceA_L(820, 512, 855, 785, 91, 93),
      charBX: 240, charBY: 558,
      charBAngles: [
        0,
        rLegB.thighAngle, rLegB.shinAngle, 0,
        lLegB.thighAngle, lLegB.shinAngle, 0,
        72, 64,
        -28, 25, 30,
        74, 72,
        -90, -90, -90
      ],
    });
  }

  // F34: B slowly lifts head
  {
    const rLegB = solveNaturalLegIK(240, 558, 285, 755.0, true);
    const lLegB = solveNaturalLegIK(240, 558, 205, 755.0, true);
    frames.push({
      frame: 34,
      act: 'Act 8: Resolution & Contrast',
      phase: 'Slow Head Lift: B slowly tilts bruised head up (88°), staring across arena; A untouched in effortless equilibrium.',
      camX: 0.0, camY: 0.0, camZoom: 1.05,
      charAX: 820, charAY: 512,
      charAAngles: makeStanceA_L(820, 512, 855, 785, 91, 93),
      charBX: 240, charBY: 558,
      charBAngles: [
        0,
        rLegB.thighAngle, rLegB.shinAngle, 0,
        lLegB.thighAngle, lLegB.shinAngle, 0,
        75, 68,
        -25, 28, 32,
        88, 86, // head lifted looking at A!
        -90, -90, -90
      ],
    });
  }

  // F35: Final Living Equilibrium
  {
    const rLegB = solveNaturalLegIK(240, 558, 285, 755.0, true);
    const lLegB = solveNaturalLegIK(240, 558, 205, 755.0, true);
    frames.push({
      frame: 35,
      act: 'Act 8: Resolution & Contrast',
      phase: 'Resolution: B had the power. A had the speed. A was simply impossible to hit. Both fighters in steady living equilibrium.',
      camX: 0.0, camY: 0.0, camZoom: 1.05,
      charAX: 820, charAY: 512,
      charAAngles: makeStanceA_L(820, 512, 855, 785, 91, 93),
      charBX: 240, charBY: 558,
      charBAngles: [
        0,
        rLegB.thighAngle, rLegB.shinAngle, 0,
        lLegB.thighAngle, lLegB.shinAngle, 0,
        72, 65,
        -28, 25, 30,
        92, 90,
        -90, -90, -90
      ],
    });
  }

  return frames;
}

export const CANONICAL_36_SPEED_VS_STRENGTH_FRAMES: SpeedVsStrengthKeyframeSpec[] = buildCanonical36Frames();

/**
 * Builds keyframes with optional 24fps interpolation
 */
