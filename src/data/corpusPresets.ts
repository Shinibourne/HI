export interface CorpusPreset {
  label: string;
  path: string;
  category: 'Generated Animation' | 'Reference Corpus';
  note: string;
}

export const CORPUS_PRESETS: CorpusPreset[] = [
  {
    label: 'basketball_walk_pickup_dribble_24f.stknds (24 FPS · 24f · Basketball Master)',
    path: '/downloads/basketball_walk_pickup_dribble_24f.stknds',
    category: 'Generated Animation',
    note: '24 FPS (@byte 30 = 24), 24 frames (1.0 s): Walk → Approach → Pick Up → Toss → Catch → Dribble master choreography. Biomechanical 2-bone IK, Center of Mass dynamic equilibrium, stance foot pinning (0.00 px shift), and 100% 20-rule validation pass.',
  },
  {
    label: 'basketball_walk_pickup_dribble_24fps.stknds (24 FPS · 24f · Basketball)',
    path: '/downloads/basketball_walk_pickup_dribble_24fps.stknds',
    category: 'Generated Animation',
    note: '24 FPS (@byte 30 = 24), 24 frames: Walk → Approach → Pick Up → Toss → Catch → Dribble native 24 FPS Stick Nodes v334 binary with 2 figures (Man + Basketball).',
  },
  {
    label: 'sit_stand_kick_24fps_216f.stknds (24 FPS · 216f · Storyboard Master)',
    path: '/downloads/sit_stand_kick_24fps_216f.stknds',
    category: 'Generated Animation',
    note: '24 FPS (@byte 30 = 24), 216 frames (9.0 s): The Stroll & Kick with Full-Body Reactive Movement across all 16 storyboard panels: ① Seated Rest (F0-18), ② Trunk Fold & Plant (F19-33), ③ Squat Launch (F34-43), ④ Stand Extension (F44-71), ⑤ Equilibrium & Shift (F72-81), ⑥-⑦ Relaxed Stroll with Pelvic-Thoracic Counter-Rotation & Dynamic Arm Swing (F82-111), ⑧ Notices Ball & Inertial Brake Plant (F112-129), ⑨ Jump Crouch (F130-135), ⑩ Excited Apex Jump (F136-147), ⑪ Touchdown Cushion (F148-153), ⑫ Sprint with Oblique Pumping (F154-165), ⑬ Plant & Chamber Pre-Stretch (F166-171), ⑭ Kick Impact with Angular Momentum Recoil at (884,735) (F172-174), ⑮ High Follow-Through & Ball Launch (F175-185), ⑯ Fist Pump & Harmonic Damped Hold (F186-215).',
  },
  {
    label: 'sit_stand_kick_12fps_108f.stknds (12 FPS · 108f · Stroll & Kick)',
    path: '/downloads/sit_stand_kick_12fps_108f.stknds',
    category: 'Generated Animation',
    note: '12 FPS (@byte 30 = 12), 108 frames: Native 12 FPS timing with Full-Body Reactive Movement, pelvic-thoracic counter-rotation, ground Y=755 invariant, and zero hyperextension.',
  },
  {
    label: 'phantom_shadowbox_24fps_75f.stknds (24 FPS · 75f · Storyboard Master)',
    path: '/downloads/phantom_shadowbox_24fps_75f.stknds',
    category: 'Generated Animation',
    note: '24 FPS (@byte 30 = 24), 75 frames: Complete visual storyboard master across all 10 panels. ① The Focus (F1-30 stillness), ② Teleport 1 (F31 BOOM vanish), ③ Reappearance & Jab (F32-34), ④ The Cross & Retract Twist (F35-37), ⑥ Uppercut Launch (F38-41), ⑦ Teleport 2 (F42 apex vanish), ⑧ Aerial Reappearance (F43 horizontal back), ⑨ Axe Kick Drop & Smear (F44-46), ⑨ Impact & 3-Point Crouch (F47-52 screen shake), ⑩ The Reset (F53-75 slow motion ease-in).',
  },
  {
    label: 'phantom_shadowbox_12fps_75f.stknds (12 FPS · 75f · Storyboard Master)',
    path: '/downloads/phantom_shadowbox_12fps_75f.stknds',
    category: 'Generated Animation',
    note: '12 FPS (@byte 30 = 12), 75 frames: Native 12 FPS timing with exact 1:1 storyboard panel fidelity, ground Y=755 invariant, and zero hyperextension.',
  },
  {
    label: 'phantom_shadowbox_24fps_147f.stknds (24 FPS · 147f · Baked Sub-Frame)',
    path: '/downloads/phantom_shadowbox_24fps_147f.stknds',
    category: 'Generated Animation',
    note: '24 FPS (@byte 30 = 24), 147 frames: Sub-frame interpolated action with instantaneous blank-frame teleport cuts strictly preserved without tweening.',
  },
  {
    label: 'speed_vs_strength_12fps.stknds (12 FPS · 36f · Speed vs Strength Showdown)',
    path: '/downloads/speed_vs_strength_12fps.stknds',
    category: 'Generated Animation',
    note: '12 FPS (@byte 30 = 12), 36 frames: Character A (Speed, Gold) vs Character B (Strength, Slate). Standoff, Acceleration, Speed Burst, Missed Haymaker, Slip Duck, Counter Side Kick & Ballistic Recoil Launch along exact impact arc.',
  },
  {
    label: 'speed_vs_strength_24fps.stknds (24 FPS · 36f Container)',
    path: '/downloads/speed_vs_strength_24fps.stknds',
    category: 'Generated Animation',
    note: '24 FPS (@byte 30 = 24), 36 frames: Speed vs Strength showdown container with shared world plane Y=755px invariant.',
  },
  {
    label: 'speed_vs_strength_24fps_71f.stknds (24 FPS · 71f Baked)',
    path: '/downloads/speed_vs_strength_24fps_71f.stknds',
    category: 'Generated Animation',
    note: '24 FPS (@byte 30 = 24), 71 frames: Full sub-frame interpolated spacing, preserved camera cuts and hit-stop freeze at clash frame.',
  },
  {
    label: 'teleport_ambush_12fps.stknds (12 FPS · 36f · 2 Figures + Camera)',
    path: '/downloads/teleport_ambush_12fps.stknds',
    category: 'Generated Animation',
    note: '12 FPS (@byte 30 = 12), 36 frames: Red & Blue 2-figure scene with Camera Zoom, Whip Pan, Teleport Ambush, Sweeping Kick, Rigid Block & Screen Shake',
  },
  {
    label: 'teleport_ambush_24fps.stknds (24 FPS · 36f Container)',
    path: '/downloads/teleport_ambush_24fps.stknds',
    category: 'Generated Animation',
    note: '24 FPS (@byte 30 = 24), 36 frames: Red & Blue 2-figure scene with Camera Zoom, Whip Pan, Teleport Ambush, Sweeping Kick, Rigid Block & Screen Shake',
  },
  {
    label: 'teleport_ambush_24fps_71f.stknds (24 FPS · 71f Baked)',
    path: '/downloads/teleport_ambush_24fps_71f.stknds',
    category: 'Generated Animation',
    note: '24 FPS (@byte 30 = 24), 71 frames with full 24 FPS in-betweens and hard camera cuts preserved',
  },
  {
    label: 'epic_sneeze_12fps.stknds (12 FPS · 36 Frames)',
    path: '/downloads/epic_sneeze_12fps.stknds',
    category: 'Generated Animation',
    note: '12 FPS (@byte 30 = 12), 36 frames: Build-Up, Hold Tremble, Explosion, Mid-Air Backflip, Back Crash & Leg Twitch',
  },
  {
    label: 'epic_sneeze_24fps.stknds (24 FPS · 36f Container)',
    path: '/downloads/epic_sneeze_24fps.stknds',
    category: 'Generated Animation',
    note: '24 FPS (@byte 30 = 24), 36 frames: Build-Up, Hold Tremble, Explosion, Mid-Air Backflip, Back Crash & Leg Twitch',
  },
  {
    label: 'epic_sneeze_24fps_71f.stknds (24 FPS · 71f Baked)',
    path: '/downloads/epic_sneeze_24fps_71f.stknds',
    category: 'Generated Animation',
    note: '24 FPS (@byte 30 = 24), 71 frames with full 24 FPS in-betweens for the Epic Sneeze',
  },
  {
    label: 'walk_scratch_fly_superhero_12fps.stknds (12 FPS · 12 Flight Frames)',
    path: '/downloads/walk_scratch_fly_superhero_12fps.stknds',
    category: 'Generated Animation',
    note: '12 FPS (@byte 30 = 12), 27 frames with 12 dedicated sky-flight frames (F10–F21)',
  },
  {
    label: 'walk_scratch_fly_superhero_24fps.stknds (24 FPS · 27f Container)',
    path: '/downloads/walk_scratch_fly_superhero_24fps.stknds',
    category: 'Generated Animation',
    note: '24 FPS (@byte 30 = 24), 27 frames with 12 dedicated sky-flight frames (F10–F21)',
  },
  {
    label: 'walk_scratch_fly_superhero_24fps_53f.stknds (24 FPS · 24 Flight Frames)',
    path: '/downloads/walk_scratch_fly_superhero_24fps_53f.stknds',
    category: 'Generated Animation',
    note: '24 FPS (@byte 30 = 24), 53 frames with 24 baked sky-flight frames on ones',
  },
  {
    label: 'ball_bounce_squash_stretch.stknds',
    path: '/downloads/ball_bounce_squash_stretch.stknds',
    category: 'Generated Animation',
    note: '22-frame double bounce with impact squash & launch stretch (Node Type 4)',
  },
  {
    label: 'ball_bounce_clean.stknds',
    path: '/downloads/ball_bounce_clean.stknds',
    category: 'Generated Animation',
    note: '22-frame pure rigid translation double bounce (Node Type 4)',
  },
  {
    label: 'project6.stknds (22f Base Container)',
    path: '/templates/project6.stknds',
    category: 'Reference Corpus',
    note: 'Known-good v334 22-frame, 17-node reference container (28,969 B decompressed)',
  },
  {
    label: 'rpoject5.stknds (27f Base Container)',
    path: '/templates/rpoject5.stknds',
    category: 'Reference Corpus',
    note: 'Known-good v334 27-frame, 17-node reference container (34,954 B decompressed)',
  },
  {
    label: 'Project2.stknds',
    path: '/templates/Project2.stknds',
    category: 'Reference Corpus',
    note: 'Multi-figure v334 reference containing Smart Circle & Round Segment nodes',
  },
  {
    label: 'Project3.stknds',
    path: '/templates/Project3.stknds',
    category: 'Reference Corpus',
    note: 'Large multi-figure v334 corpus project (1.24 MB decompressed)',
  },
  {
    label: 'Project4.stknds',
    path: '/templates/Project4.stknds',
    category: 'Reference Corpus',
    note: 'Multi-figure v334 corpus reference (688 KB decompressed)',
  },
];
