import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  Sliders,
  Layers,
  BookOpen,
  Wind,
  Camera,
  ShieldCheck,
} from 'lucide-react';
import {
  BounceGeneratorConfig,
  EpicSneezeGeneratorConfig,
  SuperheroGeneratorConfig,
  TeleportAmbushGeneratorConfig,
  CANONICAL_22_FRAME_PHASES,
  STICKFIGURE_PARENTS,
  STICKFIGURE_BONE_NAMES,
  STICKFIGURE_BONE_LENGTHS,
  STICKFIGURE_BONE_THICKNESS,
  StkndsInspectionResult,
  buildAdjustedSneezeFrames,
  buildAdjustedSuperheroFrames,
  buildAdjustedTeleportFrames,
  inspectStkndsBuffer,
  synthesizeBounceStknds,
  synthesizeSneezeStknds,
  synthesizeSuperheroStknds,
  synthesizeTeleportStknds,
} from './lib/stkndsCodec';
import {
  UNIVERSAL_33_MOTION_SKILLS,
  AUTOMATIC_15_STEP_PIPELINE,
  evaluateTeleportAmbushQuality,
} from './lib/humanMotionSkills';

interface CorpusPreset {
  label: string;
  path: string;
  category: 'Generated Animation' | 'Reference Corpus';
  note: string;
}

const CORPUS_PRESETS: CorpusPreset[] = [
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

interface JointPoint {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  worldAngle: number;
  relAngleA1: number;
  length: number;
  thickness: number;
}

function computeForwardKinematics(
  sceneX: number,
  sceneY: number,
  worldAngles: number[],
  instanceScale = 0.5
): JointPoint[] {
  const joints: JointPoint[] = new Array(17);
  for (let i = 0; i < 17; i++) {
    const p = STICKFIGURE_PARENTS[i];
    const len = STICKFIGURE_BONE_LENGTHS[i];
    const thick = STICKFIGURE_BONE_THICKNESS[i];
    const wAng = worldAngles[i];
    const relA1 = p === -1 ? wAng : wAng - worldAngles[p];

    if (p === -1) {
      joints[i] = {
        startX: sceneX,
        startY: sceneY,
        endX: sceneX,
        endY: sceneY,
        worldAngle: wAng,
        relAngleA1: relA1,
        length: len,
        thickness: thick,
      };
    } else {
      const startX = joints[p].endX;
      const startY = joints[p].endY;
      const rad = (wAng * Math.PI) / 180;
      const endX = startX + Math.cos(rad) * len * instanceScale;
      const endY = startY - Math.sin(rad) * len * instanceScale;
      joints[i] = {
        startX,
        startY,
        endX,
        endY,
        worldAngle: wAng,
        relAngleA1: relA1,
        length: len,
        thickness: thick,
      };
    }
  }
  return joints;
}

export function App() {
  const [activeAnimationMode, setActiveAnimationMode] = useState<
    'teleport' | 'sneeze' | 'superhero' | 'bounce'
  >('teleport');

  // Persistent Global FPS Toggle (12 FPS vs 24 FPS) used across all generated Stick Nodes animations
  const [globalFps, setGlobalFps] = useState<12 | 24>(12);

  const [teleportConfig, setTeleportConfig] = useState<TeleportAmbushGeneratorConfig>({
    projectName: 'teleport_ambush',
    targetFps: 12,
    interpolate24FpsFrames: false,
    closeUpZoom: 2.35,
    whipPanOffsetX: 124,
    screenShakeAmplitudePx: 20,
    redColorHex: '#DC2626',
    blueColorHex: '#2563EB',
  });

  const [sneezeConfig, setSneezeConfig] = useState<EpicSneezeGeneratorConfig>({
    projectName: 'epic_sneeze',
    targetFps: 12,
    interpolate24FpsFrames: false,
    holdTrembleDeg: 6,
    recoilApexY: 218,
    limbBounceDeg: 36,
    twitchAngleDeg: 28,
    primaryColorHex: '#1F2937',
    headColorHex: '#0284C7',
  });

  const [heroConfig, setHeroConfig] = useState<SuperheroGeneratorConfig>({
    projectName: 'walk_scratch_fly_superhero',
    targetFps: 12,
    interpolate24FpsFrames: false,
    flightApexY: 144,
    scratchAmplitudeDeg: 18,
    landingCompressionPx: 12,
    primaryColorHex: '#1F2937',
    headColorHex: '#0284C7',
  });

  const [bounceConfig, setBounceConfig] = useState<BounceGeneratorConfig>({
    projectName: 'ball_bounce_forge',
    targetFps: 12,
    nodeType: 4,
    ballDiameter: 160,
    ballThickness: 80,
    primaryApexHeight: 286,
    secondaryApexHeight: 194,
    groundY: 640,
    centerX: 960,
    enableSquashStretch: true,
    squashIntensity: 1.0,
    ballColorHex: '#0284C7',
  });

  // Sync globalFps into all generator configs
  const handleSelectFps = (fps: 12 | 24) => {
    setGlobalFps(fps);
    setTeleportConfig((c) => ({ ...c, targetFps: fps }));
    setSneezeConfig((c) => ({ ...c, targetFps: fps }));
    setHeroConfig((c) => ({ ...c, targetFps: fps }));
    setBounceConfig((c) => ({ ...c, targetFps: fps }));
    setCurrentFrame(0);
  };

  const [baseTemplate22, setBaseTemplate22] = useState<Uint8Array | null>(null);
  const [baseTemplate27, setBaseTemplate27] = useState<Uint8Array | null>(null);
  const [activeInspection, setActiveInspection] = useState<StkndsInspectionResult | null>(null);
  const [selectedPresetPath, setSelectedPresetPath] = useState<string>(
    '/downloads/teleport_ambush_12fps.stknds'
  );
  const [inspectLoading, setInspectLoading] = useState<boolean>(true);
  const [inspectError, setInspectError] = useState<string | null>(null);

  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showOnionSkin, setShowOnionSkin] = useState<boolean>(true);
  const [showTrajectoryArc, setShowTrajectoryArc] = useState<boolean>(true);
  const [vcamFollow, setVcamFollow] = useState<boolean>(true);
  const [activeDocTab, setActiveDocTab] = useState<
    'skills' | 'frames' | 'hierarchy' | 'methodology'
  >('skills');
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<string>('ALL');
  const [synthesizing, setSynthesizing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadBaseContainers() {
      try {
        const [res22, res27] = await Promise.all([
          fetch('/templates/project6.stknds'),
          fetch('/templates/rpoject5.stknds'),
        ]);
        if (res22.ok) {
          const ab22 = await res22.arrayBuffer();
          const parsed22 = await inspectStkndsBuffer('project6.stknds', ab22);
          if (!cancelled && parsed22.rawDecompressed) {
            setBaseTemplate22(parsed22.rawDecompressed);
          }
        }
        if (res27.ok) {
          const ab27 = await res27.arrayBuffer();
          const parsed27 = await inspectStkndsBuffer('rpoject5.stknds', ab27);
          if (!cancelled && parsed27.rawDecompressed) {
            setBaseTemplate27(parsed27.rawDecompressed);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadBaseContainers();
    return () => {
      cancelled = true;
    };
  }, []);

  const inspectPreset = useCallback(async (path: string, displayName: string) => {
    setInspectLoading(true);
    setInspectError(null);
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`HTTP ${res.status} while fetching ${displayName}`);
      const ab = await res.arrayBuffer();
      const parsed = await inspectStkndsBuffer(displayName, ab);
      setActiveInspection(parsed);
    } catch (e) {
      setInspectError(e instanceof Error ? e.message : 'Failed to inspect .stknds binary');
    } finally {
      setInspectLoading(false);
    }
  }, []);

  useEffect(() => {
    const preset = CORPUS_PRESETS.find((p) => p.path === selectedPresetPath);
    if (preset) {
      inspectPreset(preset.path, preset.label);
    }
  }, [selectedPresetPath, inspectPreset]);

  const teleportFrames = useMemo(
    () => buildAdjustedTeleportFrames(teleportConfig),
    [teleportConfig]
  );

  const sneezeFrames = useMemo(
    () => buildAdjustedSneezeFrames(sneezeConfig),
    [sneezeConfig]
  );

  const superheroFrames = useMemo(
    () => buildAdjustedSuperheroFrames(heroConfig),
    [heroConfig]
  );

  // Automatic 10-Domain Biomechanical Quality-Control Gate (Evaluated across every frame)
  const liveBiomechanicsAudit = useMemo(
    () => evaluateTeleportAmbushQuality(teleportFrames),
    [teleportFrames]
  );

  const computedBounceFrames = useMemo(
    () =>
      CANONICAL_22_FRAME_PHASES.map((phase) => {
        const isSecondBounce = phase.frame >= 14 && phase.frame <= 20;
        const normPeak = isSecondBounce ? 88 : 130;
        const targetApex = isSecondBounce
          ? bounceConfig.secondaryApexHeight
          : bounceConfig.primaryApexHeight;
        const verticalOffset = (phase.normY / normPeak) * targetApex;
        const sceneY = bounceConfig.groundY + verticalOffset;

        const rawSq = phase.squashFactor;
        const blendedSq = bounceConfig.enableSquashStretch
          ? 1.0 + (rawSq - 1.0) * bounceConfig.squashIntensity
          : 1.0;

        const widthDiam = bounceConfig.ballDiameter / blendedSq;
        const heightDiam = bounceConfig.ballDiameter * blendedSq;
        const serializedLength = bounceConfig.ballDiameter * blendedSq;
        const serializedThickness = Math.max(
          2,
          Math.round(bounceConfig.ballThickness / blendedSq)
        );

        return {
          ...phase,
          sceneX: bounceConfig.centerX,
          sceneY,
          blendedSq,
          widthDiam,
          heightDiam,
          serializedLength,
          serializedThickness,
        };
      }),
    [bounceConfig]
  );

  const totalModeFrames =
    activeAnimationMode === 'teleport'
      ? teleportFrames.length
      : activeAnimationMode === 'sneeze'
      ? sneezeFrames.length
      : activeAnimationMode === 'superhero'
      ? superheroFrames.length
      : computedBounceFrames.length;

  // Authentic 12 FPS vs 24 FPS playback timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = window.setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % totalModeFrames);
    }, 1000 / globalFps);
    return () => window.clearInterval(interval);
  }, [isPlaying, totalModeFrames, globalFps]);

  // Draw the 17-Node Stickfigure (Teleport Ambush, Epic Sneeze, or Sky-Flight Sequence) or Ball Bounce on the 1920x1080 scene canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const scaleX = w / 1920;
    const scaleY = h / 1080;

    if (activeAnimationMode === 'teleport') {
      const safeIdx = currentFrame % teleportFrames.length;
      const activeSpec = teleportFrames[safeIdx];

      ctx.save();
      if (vcamFollow) {
        // Apply native Stick Nodes camera pan (camX, camY) and zoom (camZoom)
        const targetSceneX = 640 + activeSpec.camX;
        const targetSceneY = 560 - activeSpec.camY;
        ctx.translate(w * 0.5, h * 0.5);
        ctx.scale(activeSpec.camZoom, activeSpec.camZoom);
        ctx.translate(-targetSceneX * scaleX, -targetSceneY * scaleY);
      }

      // Studio / Anime Ambush Backdrop
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 580 * scaleY);
      skyGrad.addColorStop(
        0,
        activeSpec.act.includes('Screen Shake') || activeSpec.phase.includes('CLASH')
          ? '#FEF2F2'
          : activeSpec.act.includes('Whip Pan')
          ? '#EFF6FF'
          : '#F1F5F9'
      );
      skyGrad.addColorStop(1, '#F8FAFC');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(-800, -800, w + 1600, 620 * scaleY + 800);

      // Coordinate grid
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < 1920; gx += 160) {
        ctx.beginPath();
        ctx.moveTo(gx * scaleX, -400);
        ctx.lineTo(gx * scaleX, h + 400);
        ctx.stroke();
      }
      for (let gy = 0; gy < 1080; gy += 120) {
        ctx.beginPath();
        ctx.moveTo(-400, gy * scaleY);
        ctx.lineTo(w + 400, gy * scaleY);
        ctx.stroke();
      }

      // Whip Pan Speed-Lines during Act 3 (Frames 15..16)
      if (activeSpec.act.includes('Whip Pan') && activeSpec.phase.includes('Whip Pan')) {
        ctx.save();
        ctx.strokeStyle = 'rgba(37, 99, 235, 0.28)';
        ctx.lineWidth = 3;
        for (let sl = 240; sl <= 720; sl += 48) {
          ctx.beginPath();
          ctx.moveTo(220 * scaleX, sl * scaleY);
          ctx.lineTo(1060 * scaleX, sl * scaleY);
          ctx.stroke();
        }
        ctx.restore();
      }

      const groundSceneY = 755;
      const groundCanvasY = groundSceneY * scaleY;

      // Ground plane
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-200 * scaleX, groundCanvasY);
      ctx.lineTo(1860 * scaleX, groundCanvasY);
      ctx.stroke();

      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1;
      for (let tx = 40; tx <= 1820; tx += 40) {
        ctx.beginPath();
        ctx.moveTo(tx * scaleX, groundCanvasY);
        ctx.lineTo((tx - 12) * scaleX, groundCanvasY + 10);
        ctx.stroke();
      }

      // Ground Stage Zone Labels
      ctx.font = '600 10px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#2563EB';
      ctx.fillText('ACT 4–8: TELEPORT AMBUSH ZONE (X: 168)', 90 * scaleX, groundCanvasY + 24);
      ctx.fillStyle = '#DC2626';
      ctx.fillText('RED SEATED GUARD POSITION (X: 440)', 380 * scaleX, groundCanvasY + 24);
      ctx.fillStyle = '#2563EB';
      ctx.fillText(
        'ACT 1 & 3: BLUE APPROACH & VANISH SPOT (X: 960 → 756)',
        700 * scaleX,
        groundCanvasY + 24
      );

      // Draw Empty Vanish Marker during Act 3 (Blue is GONE!)
      if (!activeSpec.bluePresent) {
        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#2563EB';
        ctx.lineWidth = 1.75;
        ctx.strokeRect(706 * scaleX, 340 * scaleY, 100 * scaleX, 412 * scaleY);

        // Anime afterimage speed-lines showing Blue vanished from X=756
        for (let sy = 380; sy <= 710; sy += 55) {
          ctx.beginPath();
          ctx.moveTo(725 * scaleX, sy * scaleY);
          ctx.lineTo(788 * scaleX, sy * scaleY);
          ctx.stroke();
        }
        ctx.restore();

        ctx.fillStyle = '#2563EB';
        ctx.font = '700 12px "IBM Plex Mono", monospace';
        ctx.fillText('?! BLUE VANISHED (EMPTY SPOT X=756)', 655 * scaleX, 322 * scaleY);
      }

      // Camera Focus Trajectory Indicator if Trajectory Arc enabled
      if (showTrajectoryArc) {
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.moveTo(756 * scaleX, 517 * scaleY);
        ctx.quadraticCurveTo(475 * scaleX, 260 * scaleY, 194 * scaleX, 517 * scaleY);
        ctx.stroke();
        ctx.restore();
      }

      const drawCharacter = (
        sx: number,
        sy: number,
        angles: number[],
        colorHex: string,
        alpha: number,
        label?: string
      ) => {
        const joints = computeForwardKinematics(sx, sy, angles, 0.5);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let i = 1; i < 17; i++) {
          if (i === 13) continue;
          const j = joints[i];
          ctx.strokeStyle = colorHex;
          ctx.lineWidth = Math.max(2, j.thickness * 0.5 * scaleX);
          ctx.beginPath();
          ctx.moveTo(j.startX * scaleX, j.startY * scaleY);
          ctx.lineTo(j.endX * scaleX, j.endY * scaleY);
          ctx.stroke();
        }

        const headJ = joints[13];
        const headCenterX = ((headJ.startX + headJ.endX) * 0.5) * scaleX;
        const headCenterY = ((headJ.startY + headJ.endY) * 0.5) * scaleY;
        const headRadius = (headJ.length * 0.5 * 0.5) * scaleX;

        ctx.fillStyle = colorHex;
        ctx.strokeStyle = colorHex;
        ctx.lineWidth = Math.max(2.5, 10 * scaleX);
        ctx.beginPath();
        ctx.arc(headCenterX, headCenterY, headRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (label && alpha > 0.8) {
          ctx.fillStyle = colorHex;
          ctx.font = '600 10px "IBM Plex Mono", monospace';
          ctx.fillText(label, headCenterX - 24 * scaleX, headCenterY - headRadius - 10 * scaleY);
        }

        ctx.restore();
        return joints;
      };

      if (showOnionSkin) {
        const prevIdx = (safeIdx - 1 + teleportFrames.length) % teleportFrames.length;
        const prevSpec = teleportFrames[prevIdx];
        drawCharacter(prevSpec.redX, prevSpec.redY, prevSpec.redAngles, '#94A3B8', 0.22);
        if (prevSpec.bluePresent) {
          drawCharacter(prevSpec.blueX, prevSpec.blueY, prevSpec.blueAngles, '#93C5FD', 0.22);
        }
      }

      const redJoints = drawCharacter(
        activeSpec.redX,
        activeSpec.redY,
        activeSpec.redAngles,
        teleportConfig.redColorHex,
        1.0,
        'RED (FIG #1)'
      );
      let blueJoints: JointPoint[] | null = null;
      if (activeSpec.bluePresent) {
        blueJoints = drawCharacter(
          activeSpec.blueX,
          activeSpec.blueY,
          activeSpec.blueAngles,
          teleportConfig.blueColorHex,
          1.0,
          'BLUE (FIG #2)'
        );
      }

      // Act-Specific Cinematic Callouts
      if (activeSpec.act.includes('Close-Up')) {
        const redHead = redJoints[13];
        ctx.fillStyle = '#DC2626';
        ctx.font = '700 11px "IBM Plex Mono", monospace';
        ctx.fillText(
          `! NOTICES BLUE (${activeSpec.camZoom.toFixed(2)}x ZOOM)`,
          (redHead.endX + 18) * scaleX,
          (redHead.endY - 12) * scaleY
        );
      } else if (
        (activeSpec.act.includes('Block & Impact') ||
          activeSpec.act.includes('Screen Shake') ||
          activeSpec.act.includes('End Scene')) &&
        blueJoints
      ) {
        // Draw Clash Impact Starburst at true biomechanical contact point between Blue R_Shin (Node 2) and Red R_Forearm (Node 10)
        const clashX = ((redJoints[10].endX + blueJoints[2].endX) * 0.5) * scaleX;
        const clashY = ((redJoints[10].endY + blueJoints[2].endY) * 0.5) * scaleY;
        ctx.save();
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2.5;
        for (let r = 0; r < 8; r++) {
          const ang = (r * Math.PI) / 4 + (safeIdx % 2) * 0.2;
          const rInner = 10 * scaleX;
          const rOuter = (r % 2 === 0 ? 38 : 24) * scaleX;
          ctx.beginPath();
          ctx.moveTo(clashX + Math.cos(ang) * rInner, clashY + Math.sin(ang) * rInner);
          ctx.lineTo(clashX + Math.cos(ang) * rOuter, clashY + Math.sin(ang) * rOuter);
          ctx.stroke();
        }
        ctx.fillStyle = '#B45309';
        ctx.font = '700 12px "IBM Plex Mono", monospace';
        ctx.fillText(
          activeSpec.act.includes('Screen Shake')
            ? 'HEAVY CLASH! (SCREEN SHAKE)'
            : 'SHIN BLOCKED BY RIGID FOREARM!',
          clashX - 75 * scaleX,
          clashY - 42 * scaleY
        );
        ctx.restore();
      }

      ctx.restore();

      // HUD Camera Viewfinder Overlay in top-left of canvas
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
      ctx.fillRect(12, 12, 330, 44);
      ctx.fillStyle = '#38BDF8';
      ctx.font = '600 11px "IBM Plex Mono", monospace';
      ctx.fillText(
        `CAM @+42..+50: ZOOM ${activeSpec.camZoom.toFixed(2)}x | PAN (${activeSpec.camX.toFixed(0)}, ${activeSpec.camY.toFixed(0)})`,
        22,
        30
      );
      ctx.fillStyle = '#E2E8F0';
      ctx.font = '500 10px "IBM Plex Mono", monospace';
      ctx.fillText(
        `FIGURES @+54: ${activeSpec.bluePresent ? '2 (RED + BLUE)' : '1 (RED ONLY — BLUE VANISHED)'}`,
        22,
        46
      );
      ctx.restore();
    } else if (activeAnimationMode === 'sneeze') {
      const safeIdx = currentFrame % sneezeFrames.length;
      const activeSpec = sneezeFrames[safeIdx];

      ctx.save();
      if (vcamFollow) {
        const camZoom = activeSpec.act.includes('Explosion')
          ? 1.4
          : activeSpec.isFlightFrame
          ? 1.25
          : 1.15;
        const targetX = activeSpec.sceneX * scaleX;
        const targetY = activeSpec.sceneY * scaleY;
        ctx.translate(w * 0.5, h * 0.5);
        ctx.scale(camZoom, camZoom);
        ctx.translate(-targetX, -targetY);
      }

      // Background sky & studio gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 500 * scaleY);
      skyGrad.addColorStop(
        0,
        activeSpec.act.includes('Explosion')
          ? '#FEF2F2'
          : activeSpec.isFlightFrame
          ? '#E0F2FE'
          : '#F1F5F9'
      );
      skyGrad.addColorStop(1, '#F8FAFC');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(-400, -400, w + 800, 500 * scaleY + 400);

      // Coordinate grid
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      for (let gx = 160; gx < 1920; gx += 160) {
        ctx.beginPath();
        ctx.moveTo(gx * scaleX, 0);
        ctx.lineTo(gx * scaleX, h);
        ctx.stroke();
      }
      for (let gy = 120; gy < 1080; gy += 120) {
        ctx.beginPath();
        ctx.moveTo(0, gy * scaleY);
        ctx.lineTo(w, gy * scaleY);
        ctx.stroke();
      }

      // Mid-air Backflip Apex Guide Line
      const recoilApexCanvasY = sneezeConfig.recoilApexY * scaleY;
      ctx.save();
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(420 * scaleX, recoilApexCanvasY);
      ctx.lineTo(1180 * scaleX, recoilApexCanvasY);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#0284C7';
      ctx.font = '600 10px "IBM Plex Mono", monospace';
      ctx.fillText(
        `ACT 4: MID-AIR BACKFLIP RECOIL APEX (Y=${sneezeConfig.recoilApexY}px · 360° MESSY SPIN)`,
        530 * scaleX,
        recoilApexCanvasY - 8
      );

      const groundSceneY = 758;
      const groundCanvasY = groundSceneY * scaleY;

      // Ground plane
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(60 * scaleX, groundCanvasY);
      ctx.lineTo(1860 * scaleX, groundCanvasY);
      ctx.stroke();

      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1;
      for (let tx = 100; tx <= 1820; tx += 40) {
        ctx.beginPath();
        ctx.moveTo(tx * scaleX, groundCanvasY);
        ctx.lineTo((tx - 12) * scaleX, groundCanvasY + 10);
        ctx.stroke();
      }

      // Act zone markers along ground
      ctx.font = '600 11px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#D97706';
      ctx.fillText(
        'ACT 1–3: BUILD-UP, HOLD TREMBLE & SNEEZE EXPLOSION (X: 1120)',
        960 * scaleX,
        groundCanvasY + 24
      );
      ctx.fillStyle = '#059669';
      ctx.fillText(
        'ACT 5–6: FLAT BACK CRASH, LIMB BOUNCE & LEG TWITCH (X: 482)',
        220 * scaleX,
        groundCanvasY + 24
      );

      // Backflip Recoil Trajectory Arc
      if (showTrajectoryArc) {
        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        sneezeFrames.forEach((f, idx) => {
          const px = f.sceneX * scaleX;
          const py = f.sceneY * scaleY;
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();

        sneezeFrames.forEach((f, idx) => {
          const px = f.sceneX * scaleX;
          const py = f.sceneY * scaleY;
          ctx.fillStyle =
            idx === safeIdx
              ? '#E11D48'
              : f.isFlightFrame
              ? '#0284C7'
              : '#CBD5E1';
          ctx.beginPath();
          ctx.arc(px, py, idx === safeIdx ? 5 : f.isFlightFrame ? 3.5 : 2.5, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      const drawSneezePose = (specIndex: number, alpha: number, isGhost: boolean) => {
        const spec = sneezeFrames[specIndex];
        const joints = computeForwardKinematics(spec.sceneX, spec.sceneY, spec.worldAngles, 0.5);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw segments (Nodes 1..12, 14..16)
        for (let i = 1; i < 17; i++) {
          if (i === 13) continue;
          const j = joints[i];
          ctx.strokeStyle = isGhost ? '#64748B' : sneezeConfig.primaryColorHex;
          ctx.lineWidth = Math.max(2, j.thickness * 0.5 * scaleX);
          ctx.beginPath();
          ctx.moveTo(j.startX * scaleX, j.startY * scaleY);
          ctx.lineTo(j.endX * scaleX, j.endY * scaleY);
          ctx.stroke();
        }

        // Draw Head Circle (Node 13)
        const headJ = joints[13];
        const headCenterX = ((headJ.startX + headJ.endX) * 0.5) * scaleX;
        const headCenterY = ((headJ.startY + headJ.endY) * 0.5) * scaleY;
        const headRadius = (headJ.length * 0.5 * 0.5) * scaleX;

        ctx.fillStyle = isGhost ? '#94A3B8' : sneezeConfig.headColorHex;
        ctx.strokeStyle = isGhost ? '#64748B' : sneezeConfig.primaryColorHex;
        ctx.lineWidth = Math.max(2.5, 10 * scaleX);
        ctx.beginPath();
        ctx.arc(headCenterX, headCenterY, headRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (!isGhost) {
          // Visual annotations for each of the 6 Epic Sneeze Acts
          if (spec.act.includes('The Hold')) {
            ctx.strokeStyle = '#D97706';
            ctx.lineWidth = 2;
            for (let s = -1; s <= 1; s += 2) {
              ctx.beginPath();
              ctx.arc(
                headCenterX + s * 30 * scaleX,
                headCenterY - 12 * scaleY,
                14 * scaleX,
                -0.6,
                0.6
              );
              ctx.stroke();
            }
            ctx.fillStyle = '#D97706';
            ctx.font = '600 12px "IBM Plex Mono", monospace';
            ctx.fillText(
              'AH... AH... (STUCK TREMBLE!)',
              headCenterX - 95 * scaleX,
              headCenterY - 46 * scaleY
            );
          } else if (spec.act.includes('The Explosion') || spec.phase.includes('Thruster Liftoff')) {
            // Explosive Sneeze Thruster Blast Cone & Shock Lines shooting forward-down (+X, +Y)
            ctx.strokeStyle = '#E11D48';
            ctx.lineWidth = 2.5;
            for (let ray = 0; ray < 5; ray++) {
              const ang = (-20 - ray * 14) * (Math.PI / 180);
              const r1 = 36 * scaleX;
              const r2 = (135 + (ray % 2) * 35) * scaleX;
              ctx.beginPath();
              ctx.moveTo(headCenterX + Math.cos(ang) * r1, headCenterY - Math.sin(ang) * r1);
              ctx.lineTo(headCenterX + Math.cos(ang) * r2, headCenterY - Math.sin(ang) * r2);
              ctx.stroke();
            }
            ctx.fillStyle = '#E11D48';
            ctx.font = '700 14px "IBM Plex Mono", monospace';
            ctx.fillText(
              'ACHOO!! (THRUSTER BLAST)',
              headCenterX + 45 * scaleX,
              headCenterY + 55 * scaleY
            );
          } else if (spec.act.includes('The Landing') && spec.phase.includes('CRASH')) {
            ctx.strokeStyle = '#0284C7';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(
              spec.sceneX * scaleX,
              groundCanvasY,
              140 * scaleX,
              12 * scaleY,
              0,
              0,
              Math.PI * 2
            );
            ctx.stroke();
          } else if (spec.phase.includes('Twitch')) {
            const knee = joints[1];
            ctx.fillStyle = '#059669';
            ctx.font = '600 12px "IBM Plex Mono", monospace';
            ctx.fillText(
              '*TWITCH* (STILL ALIVE)',
              (knee.endX - 40) * scaleX,
              (knee.endY - 32) * scaleY
            );
          }

          // Root Pelvis Node Gizmo (Node 0)
          const root = joints[0];
          ctx.fillStyle = '#FFFFFF';
          ctx.strokeStyle = '#0284C7';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(root.startX * scaleX, root.startY * scaleY, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        ctx.restore();
      };

      if (showOnionSkin) {
        const prevIdx = (safeIdx - 1 + sneezeFrames.length) % sneezeFrames.length;
        drawSneezePose(prevIdx, 0.2, true);
      }
      drawSneezePose(safeIdx, 1.0, false);

      ctx.restore();
    } else if (activeAnimationMode === 'superhero') {
      const safeIdx = currentFrame % superheroFrames.length;
      const activeSpec = superheroFrames[safeIdx];

      // Optional V-Cam Camera Lock transform when flying through the sky
      ctx.save();
      if (vcamFollow) {
        const camZoom = activeSpec.isFlightFrame ? 1.35 : 1.15;
        const targetX = activeSpec.sceneX * scaleX;
        const targetY = activeSpec.sceneY * scaleY;
        ctx.translate(w * 0.5, h * 0.5);
        ctx.scale(camZoom, camZoom);
        ctx.translate(-targetX, -targetY);
      }

      // Upper Stratosphere Sky Band (Y: 0..380 in scene units)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 420 * scaleY);
      skyGrad.addColorStop(0, activeSpec.isFlightFrame ? '#E0F2FE' : '#F1F5F9');
      skyGrad.addColorStop(1, '#F8FAFC');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(-400, -400, w + 800, 420 * scaleY + 400);

      // Coordinate grid
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      for (let gx = 160; gx < 1920; gx += 160) {
        ctx.beginPath();
        ctx.moveTo(gx * scaleX, 0);
        ctx.lineTo(gx * scaleX, h);
        ctx.stroke();
      }
      for (let gy = 120; gy < 1080; gy += 120) {
        ctx.beginPath();
        ctx.moveTo(0, gy * scaleY);
        ctx.lineTo(w, gy * scaleY);
        ctx.stroke();
      }

      // High-altitude cloud silhouettes in sky corridor (scrolling parallax during flight)
      const cloudShift = activeSpec.isFlightFrame
        ? (activeSpec.flightStepIndex ?? 1) * 48
        : 0;
      const cloudPositions = [
        { x: 380, y: 125, r: 42 },
        { x: 780, y: 105, r: 54 },
        { x: 1180, y: 130, r: 48 },
        { x: 1580, y: 110, r: 44 },
      ];
      ctx.fillStyle = activeSpec.isFlightFrame ? '#BAE6FD' : '#E2E8F0';
      cloudPositions.forEach((c) => {
        const cx = ((c.x - cloudShift + 1920) % 1920) * scaleX;
        const cy = c.y * scaleY;
        ctx.beginPath();
        ctx.arc(cx, cy, c.r * scaleX, 0, Math.PI * 2);
        ctx.arc(cx + c.r * 0.7 * scaleX, cy + 4, c.r * 0.75 * scaleX, 0, Math.PI * 2);
        ctx.arc(cx - c.r * 0.7 * scaleX, cy + 6, c.r * 0.65 * scaleX, 0, Math.PI * 2);
        ctx.fill();
      });

      // Sky Flight Corridor Guide Band (Y = 144..180)
      const corridorY = heroConfig.flightApexY * scaleY;
      ctx.save();
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(500 * scaleX, corridorY);
      ctx.lineTo(1520 * scaleX, corridorY);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#0284C7';
      ctx.font = '600 10px "IBM Plex Mono", monospace';
      ctx.fillText(
        `STRATOSPHERE SKY CORRIDOR (12 FLIGHT FRAMES · Y=${heroConfig.flightApexY}px)`,
        530 * scaleX,
        corridorY - 8
      );

      const groundSceneY = 758;
      const groundCanvasY = groundSceneY * scaleY;

      // Ground plane
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(60 * scaleX, groundCanvasY);
      ctx.lineTo(1860 * scaleX, groundCanvasY);
      ctx.stroke();

      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1;
      for (let tx = 100; tx <= 1820; tx += 40) {
        ctx.beginPath();
        ctx.moveTo(tx * scaleX, groundCanvasY);
        ctx.lineTo((tx - 12) * scaleX, groundCanvasY + 10);
        ctx.stroke();
      }

      // Act zone markers along ground
      ctx.font = '600 11px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#475569';
      ctx.fillText('ACT 1: WALK (X: 260→515)', 240 * scaleX, groundCanvasY + 24);
      ctx.fillStyle = '#D97706';
      ctx.fillText('ACT 2–3: HEAD SCRATCH & ZERO-G HOVER (X: 520)', 520 * scaleX, groundCanvasY + 24);
      ctx.fillStyle = '#059669';
      ctx.fillText('ACT 5: 3-POINT SUPERHERO LANDING (X: 1542)', 1320 * scaleX, groundCanvasY + 24);

      // Flight arc trajectory curve
      if (showTrajectoryArc) {
        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        superheroFrames.forEach((f, idx) => {
          const px = f.sceneX * scaleX;
          const py = f.sceneY * scaleY;
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();

        superheroFrames.forEach((f, idx) => {
          const px = f.sceneX * scaleX;
          const py = f.sceneY * scaleY;
          ctx.fillStyle =
            idx === safeIdx
              ? '#0284C7'
              : f.isFlightFrame
              ? '#38BDF8'
              : '#CBD5E1';
          ctx.beginPath();
          ctx.arc(px, py, idx === safeIdx ? 5 : f.isFlightFrame ? 3.5 : 2.5, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      const drawStickfigurePose = (
        specIndex: number,
        alpha: number,
        isGhost: boolean
      ) => {
        const spec = superheroFrames[specIndex];
        const joints = computeForwardKinematics(spec.sceneX, spec.sceneY, spec.worldAngles, 0.5);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // If in horizontal Sky Flight (Flight Step >= 4), draw supersonic wind streamlines & sonic boom cone
        if (!isGhost && spec.isFlightFrame) {
          const step = spec.flightStepIndex ?? 1;
          if (step <= 3) {
            // Anti-gravity levitation aura rings under feet
            ctx.strokeStyle = '#0284C7';
            ctx.lineWidth = 1.5;
            for (let r = 1; r <= 2; r++) {
              ctx.beginPath();
              ctx.ellipse(
                spec.sceneX * scaleX,
                (spec.sceneY + 180 + r * 22) * scaleY,
                (45 - r * 10) * scaleX,
                6 * scaleY,
                0,
                0,
                Math.PI * 2
              );
              ctx.stroke();
            }
          } else {
            // Horizontal supersonic wind speed-lines rushing past body
            ctx.strokeStyle = '#0284C7';
            ctx.lineWidth = 1.75;
            const streamOffsets = [-55, -25, 10, 42];
            streamOffsets.forEach((yo, sIdx) => {
              const lineLen = (140 + (sIdx % 2) * 65) * scaleX;
              const startX = (spec.sceneX - 80 - ((step * 37 + sIdx * 29) % 90)) * scaleX;
              const lineY = (spec.sceneY + yo) * scaleY;
              ctx.beginPath();
              ctx.moveTo(startX, lineY);
              ctx.lineTo(startX - lineLen, lineY);
              ctx.stroke();
            });

            // Sonic Boom Mach Cone on initial pitch-out & cruise
            if (step >= 4 && step <= 10) {
              const fist = joints[11];
              ctx.strokeStyle = 'rgba(2, 132, 199, 0.45)';
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              ctx.ellipse(
                (fist.endX - 18) * scaleX,
                fist.endY * scaleY,
                14 * scaleX,
                46 * scaleY,
                0.12,
                0,
                Math.PI * 2
              );
              ctx.stroke();
            }
          }
        }

        // Draw segments (Nodes 1..12, 14..16)
        for (let i = 1; i < 17; i++) {
          if (i === 13) continue;
          const j = joints[i];
          ctx.strokeStyle = isGhost ? '#64748B' : heroConfig.primaryColorHex;
          ctx.lineWidth = Math.max(2, j.thickness * 0.5 * scaleX);
          ctx.beginPath();
          ctx.moveTo(j.startX * scaleX, j.startY * scaleY);
          ctx.lineTo(j.endX * scaleX, j.endY * scaleY);
          ctx.stroke();
        }

        // Draw Head Circle (Node 13, UID 16)
        const headJ = joints[13];
        const headCenterX = ((headJ.startX + headJ.endX) * 0.5) * scaleX;
        const headCenterY = ((headJ.startY + headJ.endY) * 0.5) * scaleY;
        const headRadius = (headJ.length * 0.5 * 0.5) * scaleX;

        ctx.fillStyle = isGhost ? '#94A3B8' : heroConfig.headColorHex;
        ctx.strokeStyle = isGhost ? '#64748B' : heroConfig.primaryColorHex;
        ctx.lineWidth = Math.max(2.5, 10 * scaleX);
        ctx.beginPath();
        ctx.arc(headCenterX, headCenterY, headRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (!isGhost) {
          // Highlight Scratching Effect in Act 2
          if (spec.act.includes('Scratch')) {
            const hand = joints[11];
            ctx.strokeStyle = '#D97706';
            ctx.lineWidth = 2;
            for (let ray = -1; ray <= 1; ray++) {
              ctx.beginPath();
              ctx.moveTo(hand.endX * scaleX - 6, (hand.endY - 12 + ray * 8) * scaleY);
              ctx.lineTo(hand.endX * scaleX - 18, (hand.endY - 18 + ray * 11) * scaleY);
              ctx.stroke();
            }
            ctx.fillStyle = '#D97706';
            ctx.font = '600 12px "IBM Plex Mono", monospace';
            ctx.fillText('? SCRATCH', (headJ.endX - 40) * scaleX, (headJ.endY - 24) * scaleY);
          }

          // Highlight Impact Shockwave rings in Act 5 (Superhero Landing)
          if (spec.act.includes('Superhero Landing')) {
            const fist = joints[11];
            ctx.strokeStyle = '#0284C7';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(
              fist.endX * scaleX,
              groundCanvasY,
              52 * scaleX,
              9 * scaleY,
              0,
              0,
              Math.PI * 2
            );
            ctx.stroke();
          }

          // Draw Root Pelvis Node Gizmo (Node 0)
          const root = joints[0];
          ctx.fillStyle = '#FFFFFF';
          ctx.strokeStyle = '#0284C7';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(root.startX * scaleX, root.startY * scaleY, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        ctx.restore();
      };

      if (showOnionSkin) {
        const prevIdx = (safeIdx - 1 + superheroFrames.length) % superheroFrames.length;
        drawStickfigurePose(prevIdx, 0.2, true);
      }
      drawStickfigurePose(safeIdx, 1.0, false);

      ctx.restore();
    } else {
      // Ball Bounce Rendering Mode
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      for (let gx = 160; gx < 1920; gx += 160) {
        ctx.beginPath();
        ctx.moveTo(gx * scaleX, 0);
        ctx.lineTo(gx * scaleX, h);
        ctx.stroke();
      }
      for (let gy = 120; gy < 1080; gy += 120) {
        ctx.beginPath();
        ctx.moveTo(0, gy * scaleY);
        ctx.lineTo(w, gy * scaleY);
        ctx.stroke();
      }

      const groundCanvasY =
        (bounceConfig.groundY + bounceConfig.ballDiameter * 0.42) * scaleY;
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80 * scaleX, groundCanvasY);
      ctx.lineTo(1840 * scaleX, groundCanvasY);
      ctx.stroke();

      const apex1Y = (bounceConfig.groundY - bounceConfig.primaryApexHeight) * scaleY;
      const apex2Y = (bounceConfig.groundY - bounceConfig.secondaryApexHeight) * scaleY;
      ctx.save();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#0284C7';
      ctx.beginPath();
      ctx.moveTo(260 * scaleX, apex1Y);
      ctx.lineTo(1660 * scaleX, apex1Y);
      ctx.stroke();
      ctx.strokeStyle = '#059669';
      ctx.beginPath();
      ctx.moveTo(960 * scaleX, apex2Y);
      ctx.lineTo(1660 * scaleX, apex2Y);
      ctx.stroke();
      ctx.restore();

      const safeFrameIndex = currentFrame % 22;
      if (showOnionSkin) {
        [-2, -1, 1].forEach((offset) => {
          const gIdx = (safeFrameIndex + offset + 22) % 22;
          const gf = computedBounceFrames[gIdx];
          ctx.save();
          ctx.globalAlpha = offset < 0 ? 0.18 : 0.1;
          ctx.fillStyle = bounceConfig.ballColorHex;
          ctx.strokeStyle = bounceConfig.ballColorHex;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(
            gf.sceneX * scaleX,
            gf.sceneY * scaleY,
            gf.widthDiam * 0.5 * scaleX,
            gf.heightDiam * 0.5 * scaleY,
            0,
            0,
            Math.PI * 2
          );
          if (bounceConfig.nodeType === 4) ctx.fill();
          else ctx.stroke();
          ctx.restore();
        });
      }

      const activeF = computedBounceFrames[safeFrameIndex];
      ctx.save();
      ctx.fillStyle = bounceConfig.ballColorHex;
      ctx.strokeStyle = bounceConfig.ballColorHex;
      ctx.lineWidth = Math.max(3, activeF.serializedThickness * 0.25 * scaleX);
      ctx.beginPath();
      ctx.ellipse(
        activeF.sceneX * scaleX,
        activeF.sceneY * scaleY,
        activeF.widthDiam * 0.5 * scaleX,
        activeF.heightDiam * 0.5 * scaleY,
        0,
        0,
        Math.PI * 2
      );
      if (bounceConfig.nodeType === 4) ctx.fill();
      else ctx.stroke();
      ctx.restore();
    }
  }, [
    activeAnimationMode,
    teleportFrames,
    sneezeFrames,
    superheroFrames,
    computedBounceFrames,
    currentFrame,
    showOnionSkin,
    showTrajectoryArc,
    vcamFollow,
    teleportConfig,
    sneezeConfig,
    heroConfig,
    bounceConfig,
  ]);

  const handleSynthesizeAndDownload = async () => {
    setSynthesizing(true);
    try {
      let stkndsBytes: Uint8Array;
      let fileName: string;

      if (activeAnimationMode === 'teleport') {
        if (!baseTemplate27) return;
        stkndsBytes = await synthesizeTeleportStknds(baseTemplate27, teleportConfig);
        const frameTag =
          teleportConfig.targetFps === 24 && teleportConfig.interpolate24FpsFrames ? '71f' : '36f';
        fileName = `${teleportConfig.projectName.trim() || 'teleport_ambush'}_${teleportConfig.targetFps}fps_${frameTag}.stknds`;
      } else if (activeAnimationMode === 'sneeze') {
        if (!baseTemplate27) return;
        stkndsBytes = await synthesizeSneezeStknds(baseTemplate27, sneezeConfig);
        const frameTag =
          sneezeConfig.targetFps === 24 && sneezeConfig.interpolate24FpsFrames ? '71f' : '36f';
        fileName = `${sneezeConfig.projectName.trim() || 'epic_sneeze'}_${sneezeConfig.targetFps}fps_${frameTag}.stknds`;
      } else if (activeAnimationMode === 'superhero') {
        if (!baseTemplate27) return;
        stkndsBytes = await synthesizeSuperheroStknds(baseTemplate27, heroConfig);
        const frameTag =
          heroConfig.targetFps === 24 && heroConfig.interpolate24FpsFrames ? '53f' : '27f';
        fileName = `${heroConfig.projectName.trim() || 'walk_scratch_fly_superhero'}_${heroConfig.targetFps}fps_${frameTag}.stknds`;
      } else {
        if (!baseTemplate22) return;
        stkndsBytes = await synthesizeBounceStknds(baseTemplate22, bounceConfig);
        fileName = `${bounceConfig.projectName.trim() || 'ball_bounce'}_${bounceConfig.targetFps}fps.stknds`;
      }

      const blob = new Blob([stkndsBytes], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const parsed = await inspectStkndsBuffer(fileName, stkndsBytes.buffer);
      setActiveInspection(parsed);
    } finally {
      setSynthesizing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setInspectLoading(true);
    setInspectError(null);
    try {
      const ab = await file.arrayBuffer();
      const parsed = await inspectStkndsBuffer(file.name, ab);
      setActiveInspection(parsed);
      setCurrentFrame(0);
    } catch (err) {
      setInspectError(err instanceof Error ? err.message : 'Invalid .stknds file');
    } finally {
      setInspectLoading(false);
    }
  };

  const safeTeleportFrame = teleportFrames[currentFrame % teleportFrames.length];
  const [selectedBoneFigure, setSelectedBoneFigure] = useState<'red' | 'blue'>('red');

  const activeStickfigureFrames =
    activeAnimationMode === 'teleport'
      ? []
      : activeAnimationMode === 'sneeze'
      ? sneezeFrames
      : superheroFrames;
  const safeHeroFrame =
    activeStickfigureFrames[currentFrame % Math.max(1, activeStickfigureFrames.length)] ||
    superheroFrames[0];

  const safeTeleportRedJoints = useMemo(
    () =>
      computeForwardKinematics(
        safeTeleportFrame.redX,
        safeTeleportFrame.redY,
        safeTeleportFrame.redAngles,
        0.5
      ),
    [safeTeleportFrame]
  );
  const safeTeleportBlueJoints = useMemo(
    () =>
      safeTeleportFrame.bluePresent
        ? computeForwardKinematics(
            safeTeleportFrame.blueX,
            safeTeleportFrame.blueY,
            safeTeleportFrame.blueAngles,
            0.5
          )
        : null,
    [safeTeleportFrame]
  );

  const safeHeroJoints =
    activeAnimationMode === 'teleport'
      ? selectedBoneFigure === 'red' || !safeTeleportBlueJoints
        ? safeTeleportRedJoints
        : safeTeleportBlueJoints
      : computeForwardKinematics(
          safeHeroFrame.sceneX,
          safeHeroFrame.sceneY,
          safeHeroFrame.worldAngles,
          0.5
        );
  const safeBounceFrame = computedBounceFrames[currentFrame % 22];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* Top Bar Contract: Zone 1 (Wordmark) — Zone 2 (4 Nav Links) — Zone 3 (Primary Action) */}
      <header className="sticky top-0 z-30 bg-[#F8FAFC]/95 backdrop-blur border-b border-[#E2E8F0] px-6 py-3.5 flex items-center justify-between">
        <a
          href="#forge"
          className="font-display text-lg font-semibold tracking-tight text-[#0F172A] whitespace-nowrap"
        >
          Stick Nodes Animation Forge
        </a>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#475569]">
          <a
            href="#forge"
            className="hover:text-[#0F172A] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
          >
            Interactive Forge
          </a>
          <a
            href="#specification"
            className="hover:text-[#0F172A] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
          >
            Natural Movement &amp; Spec
          </a>
          <a
            href="#trajectory"
            className="hover:text-[#0F172A] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
          >
            Keyframe Schedule
          </a>
          <a
            href="#corpus"
            className="hover:text-[#0F172A] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
          >
            Corpus Inspector
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={
              globalFps === 12
                ? '/downloads/teleport_ambush_12fps.stknds'
                : '/downloads/teleport_ambush_24fps.stknds'
            }
            download={
              globalFps === 12
                ? 'teleport_ambush_12fps.stknds'
                : 'teleport_ambush_24fps.stknds'
            }
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Download Teleport Ambush ({globalFps} FPS .stknds)
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-6 py-8 space-y-14">
        {/* Hero & Deliverable Disclosure Banner */}
        <section className="border-b border-[#E2E8F0] pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-medium text-[#475569]">
              <span>Stick Nodes v334 Multi-Figure &amp; Camera Serialization</span>
              <span aria-hidden="true">·</span>
              <span>Powered by Natural Movement Skill</span>
              <span aria-hidden="true">·</span>
              <span>12 FPS / 24 FPS Engine Toggle</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#0F172A] tracking-tight">
              The Teleport Ambush — 2-Character Anime Camera Pan, Zoom &amp; Clash
            </h1>
            <p className="text-[#475569] text-base leading-relaxed">
              Authored with two independent 17-node stickfigures (<strong>Character Red</strong> seated on the ground and <strong>Character Blue</strong>) plus native Stick Nodes per-frame camera pan/zoom floats (<code className="font-mono text-xs bg-[#E2E8F0]/60 px-1.5 py-0.5 rounded">@+42..+50</code>): 1. <strong>The Approach</strong> (wide shot, Blue walks casually toward seated Red), 2. <strong>The Close-Up</strong> (fast <code className="font-mono text-xs">2.35x</code> zoom on Red’s face as he tilts his head up), 3. <strong>The Swish</strong> (2-frame violent whip pan right to Blue’s spot — <em>Blue is gone</em>), 4. <strong>The Ambush</strong> (snap back to wider shot with Blue standing right behind Red), 5. <strong>The Strike</strong> (Blue drops weight and whips a heavy sweeping kick), 6. <strong>The Block &amp; Impact</strong> (Red twists sharply without standing and catches Blue’s shin with a rigid forearm), 7. <strong>The Screen Shake</strong> (hit-stop freeze + 5-frame violent camera shake), and 8. <strong>End Scene</strong> (locked clash hold).
            </p>
          </div>

          {/* Direct Verified Artifact Downloads */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href="/downloads/teleport_ambush_12fps.stknds"
              download="teleport_ambush_12fps.stknds"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-[#0F172A] text-white rounded-lg hover:bg-[#1E293B] transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              Teleport Ambush 12 FPS (36f .stknds)
            </a>
            <a
              href="/downloads/teleport_ambush_24fps.stknds"
              download="teleport_ambush_24fps.stknds"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-white border border-[#CBD5E1] text-[#0F172A] rounded-lg hover:bg-[#F1F5F9] transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              Teleport Ambush 24 FPS (36f .stknds)
            </a>
            <a
              href="/downloads/teleport_ambush_24fps_71f.stknds"
              download="teleport_ambush_24fps_71f.stknds"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-white border border-[#CBD5E1] text-[#0F172A] rounded-lg hover:bg-[#F1F5F9] transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              Teleport Ambush 24 FPS Baked (71f .stknds)
            </a>
          </div>
        </section>

        {/* Two-Zone Sandbox Layout: Left Interactive Stage (65%) + Right Control & Concept Deck (35%) */}
        <section id="forge" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Zone: Interactive Stage */}
          <div className="lg:col-span-8 bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3.5">
              <div>
                <h2 className="text-lg font-semibold text-[#0F172A] flex items-center gap-2">
                  01. Live v334 Animation Stage ({globalFps} FPS)
                  {activeAnimationMode === 'teleport' && (
                    <span className="inline-flex items-center gap-1 text-xs font-mono text-[#0284C7]">
                      <Camera className="w-3.5 h-3.5" />
                      {safeTeleportFrame.act} ({safeTeleportFrame.camZoom.toFixed(2)}x)
                    </span>
                  )}
                  {(activeAnimationMode === 'sneeze' || activeAnimationMode === 'superhero') &&
                    safeHeroFrame.isFlightFrame && (
                      <span className="inline-flex items-center gap-1 text-xs font-mono text-[#0284C7]">
                        <Wind className="w-3.5 h-3.5" />
                        AIRBORNE · {safeHeroFrame.act}
                      </span>
                    )}
                </h2>
                <p className="text-xs text-[#475569]">
                  {activeAnimationMode === 'teleport' ? (
                    <>
                      Figures: <span className="font-mono">Red (#1) + Blue (#2)</span> · Header FPS
                      Byte @30 = <span className="font-mono font-semibold">{globalFps}</span> ·{' '}
                      {safeTeleportFrame.phase}
                    </>
                  ) : activeAnimationMode !== 'bounce' ? (
                    <>
                      Figure: <span className="font-mono">MyBase(long foot)</span> · Header FPS Byte
                      @30 = <span className="font-mono font-semibold">{globalFps}</span> ·{' '}
                      {safeHeroFrame.phase}
                    </>
                  ) : (
                    <>
                      Isolated Leaf Node 13 (UID 16) · Header FPS Byte @30 ={' '}
                      <span className="font-mono font-semibold">{globalFps}</span>
                    </>
                  )}
                </p>
              </div>

              {/* Animation Mode Switcher */}
              <div className="flex flex-wrap items-center gap-1 p-1 bg-[#F1F5F9] rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    setActiveAnimationMode('teleport');
                    setVcamFollow(true);
                    setCurrentFrame(0);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    activeAnimationMode === 'teleport'
                      ? 'bg-white text-[#0F172A] shadow-xs'
                      : 'text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  The Teleport Ambush (36f)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveAnimationMode('sneeze');
                    setCurrentFrame(0);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    activeAnimationMode === 'sneeze'
                      ? 'bg-white text-[#0F172A] shadow-xs'
                      : 'text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  The Epic Sneeze (36f)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveAnimationMode('superhero');
                    setCurrentFrame(0);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    activeAnimationMode === 'superhero'
                      ? 'bg-white text-[#0F172A] shadow-xs'
                      : 'text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  12f Sky Flight
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveAnimationMode('bounce');
                    setCurrentFrame(0);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    activeAnimationMode === 'bounce'
                      ? 'bg-white text-[#0F172A] shadow-xs'
                      : 'text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  Ball Bounce
                </button>
              </div>
            </div>

            {/* Interactive Canvas */}
            <div className="relative rounded-lg overflow-hidden border border-[#E2E8F0] bg-[#F8FAFC]">
              <canvas
                ref={canvasRef}
                width={960}
                height={500}
                className="w-full h-auto block"
              />
            </div>

            {/* Act Quick-Jump Buttons when in Teleport, Sneeze, or Superhero Mode */}
            {activeAnimationMode === 'teleport' && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-medium text-[#64748B] mr-1">Jump to Act:</span>
                  {[
                    { label: '1. Approach (F00)', frame: 0 },
                    {
                      label: '2. Close-Up Zoom (F10)',
                      frame:
                        teleportConfig.targetFps === 24 && teleportConfig.interpolate24FpsFrames
                          ? 20
                          : 10,
                    },
                    {
                      label: '3. Whip Pan Vanish (F15)',
                      frame:
                        teleportConfig.targetFps === 24 && teleportConfig.interpolate24FpsFrames
                          ? 30
                          : 15,
                    },
                    {
                      label: '4. Teleport Ambush! (F19)',
                      frame:
                        teleportConfig.targetFps === 24 && teleportConfig.interpolate24FpsFrames
                          ? 38
                          : 19,
                    },
                    {
                      label: '5. Sweeping Kick (F21)',
                      frame:
                        teleportConfig.targetFps === 24 && teleportConfig.interpolate24FpsFrames
                          ? 42
                          : 21,
                    },
                    {
                      label: '6–7. Block & Screen Shake (F24)',
                      frame:
                        teleportConfig.targetFps === 24 && teleportConfig.interpolate24FpsFrames
                          ? 48
                          : 24,
                    },
                    {
                      label: '8. Locked End Scene (F31)',
                      frame:
                        teleportConfig.targetFps === 24 && teleportConfig.interpolate24FpsFrames
                          ? 62
                          : 31,
                    },
                  ].map((jump) => (
                    <button
                      key={jump.label}
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentFrame(jump.frame);
                      }}
                      className="px-2.5 py-1 text-xs font-medium bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] rounded-md transition-colors whitespace-nowrap"
                    >
                      {jump.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setVcamFollow((v) => !v)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    vcamFollow
                      ? 'bg-[#0284C7] text-white'
                      : 'bg-[#F1F5F9] text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  {vcamFollow ? 'Camera Pan/Zoom: ON' : 'Wide Stage View: ON'}
                </button>
              </div>
            )}
            {activeAnimationMode === 'sneeze' && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-medium text-[#64748B] mr-1">Jump to Act:</span>
                  {[
                    { label: '1. Build-Up (F00)', frame: 0 },
                    {
                      label: '2. Stuck Hold Tremble (F06)',
                      frame:
                        sneezeConfig.targetFps === 24 && sneezeConfig.interpolate24FpsFrames
                          ? 12
                          : 6,
                    },
                    {
                      label: '3. The Explosion! (F11)',
                      frame:
                        sneezeConfig.targetFps === 24 && sneezeConfig.interpolate24FpsFrames
                          ? 22
                          : 11,
                    },
                    {
                      label: '4. Thruster Backflip (F13)',
                      frame:
                        sneezeConfig.targetFps === 24 && sneezeConfig.interpolate24FpsFrames
                          ? 26
                          : 13,
                    },
                    {
                      label: '5. Flat Back Crash (F22)',
                      frame:
                        sneezeConfig.targetFps === 24 && sneezeConfig.interpolate24FpsFrames
                          ? 44
                          : 22,
                    },
                    {
                      label: '6. Stillness & Leg Twitch (F33)',
                      frame:
                        sneezeConfig.targetFps === 24 && sneezeConfig.interpolate24FpsFrames
                          ? 66
                          : 33,
                    },
                  ].map((jump) => (
                    <button
                      key={jump.label}
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentFrame(jump.frame);
                      }}
                      className="px-2.5 py-1 text-xs font-medium bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] rounded-md transition-colors whitespace-nowrap"
                    >
                      {jump.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setVcamFollow((v) => !v)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    vcamFollow
                      ? 'bg-[#0284C7] text-white'
                      : 'bg-[#F1F5F9] text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  {vcamFollow ? 'V-Cam Follow: ON' : 'V-Cam Follow: OFF'}
                </button>
              </div>
            )}

            {activeAnimationMode === 'superhero' && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-medium text-[#64748B] mr-1">Jump to Stage:</span>
                  {[
                    { label: '1. Walk (F00)', frame: 0 },
                    {
                      label: '2. Scratch Head (F06)',
                      frame:
                        heroConfig.targetFps === 24 && heroConfig.interpolate24FpsFrames ? 12 : 6,
                    },
                    {
                      label: '3. Zero-G Levitate (F10)',
                      frame:
                        heroConfig.targetFps === 24 && heroConfig.interpolate24FpsFrames ? 20 : 10,
                    },
                    {
                      label: '4. Sky Cruise (F14–F19)',
                      frame:
                        heroConfig.targetFps === 24 && heroConfig.interpolate24FpsFrames ? 28 : 14,
                    },
                    {
                      label: '5. Superhero Landing (F22)',
                      frame:
                        heroConfig.targetFps === 24 && heroConfig.interpolate24FpsFrames ? 44 : 22,
                    },
                  ].map((jump) => (
                    <button
                      key={jump.label}
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentFrame(jump.frame);
                      }}
                      className="px-2.5 py-1 text-xs font-medium bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] rounded-md transition-colors whitespace-nowrap"
                    >
                      {jump.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setVcamFollow((v) => !v)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    vcamFollow
                      ? 'bg-[#0284C7] text-white'
                      : 'bg-[#F1F5F9] text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  {vcamFollow ? 'V-Cam Follow: ON' : 'V-Cam Follow: OFF'}
                </button>
              </div>
            )}

            {/* Playback & Frame Scrubber Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#0F172A] text-white rounded-lg hover:bg-[#1E293B] transition-colors whitespace-nowrap"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentFrame((f) => (f + 1) % totalModeFrames);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-[#F1F5F9] text-[#0F172A] rounded-lg hover:bg-[#E2E8F0] transition-colors whitespace-nowrap"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  Step Frame
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentFrame(0);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-[#F1F5F9] text-[#0F172A] rounded-lg hover:bg-[#E2E8F0] transition-colors whitespace-nowrap"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>

              <div className="flex items-center gap-3 flex-1 max-w-md">
                <label
                  htmlFor="frame-scrubber"
                  className="text-xs font-mono text-[#475569] whitespace-nowrap"
                >
                  Frame {(currentFrame % totalModeFrames).toString().padStart(2, '0')} /{' '}
                  {(totalModeFrames - 1).toString().padStart(2, '0')}
                </label>
                <input
                  id="frame-scrubber"
                  type="range"
                  min={0}
                  max={totalModeFrames - 1}
                  value={currentFrame % totalModeFrames}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setCurrentFrame(Number(e.target.value));
                  }}
                  className="w-full accent-[#0284C7]"
                />
              </div>

              <div className="flex items-center gap-3 text-xs text-[#475569]">
                <label className="inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={showOnionSkin}
                    onChange={(e) => setShowOnionSkin(e.target.checked)}
                    className="accent-[#0284C7]"
                  />
                  Onion Skin
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={showTrajectoryArc}
                    onChange={(e) => setShowTrajectoryArc(e.target.checked)}
                    className="accent-[#0284C7]"
                  />
                  Trajectory Arc
                </label>
              </div>
            </div>

            {/* Live Byte-Level Telemetry Strip for Active Frame */}
            {activeAnimationMode === 'teleport' ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-[#E2E8F0] text-xs">
                <div>
                  <div className="text-[#64748B]">Act / Camera View</div>
                  <div className="font-semibold text-[#0F172A] mt-0.5 truncate">
                    {safeTeleportFrame.act}
                  </div>
                </div>
                <div>
                  <div className="text-[#64748B]">Camera Zoom / Pan (@+42..+50)</div>
                  <div className="font-mono font-semibold text-[#0284C7] mt-0.5">
                    {safeTeleportFrame.camZoom.toFixed(2)}x · ({safeTeleportFrame.camX.toFixed(0)},{' '}
                    {safeTeleportFrame.camY.toFixed(0)})
                  </div>
                </div>
                <div>
                  <div className="text-[#64748B]">Figure Positions (@+75/+79)</div>
                  <div className="font-mono font-semibold text-[#0F172A] mt-0.5 truncate">
                    Red ({safeTeleportFrame.redX.toFixed(0)}, {safeTeleportFrame.redY.toFixed(0)}) ·{' '}
                    {safeTeleportFrame.bluePresent
                      ? `Blue (${safeTeleportFrame.blueX.toFixed(0)}, ${safeTeleportFrame.blueY.toFixed(0)})`
                      : 'Blue (VANISHED)'}
                  </div>
                </div>
                <div>
                  <div className="text-[#64748B]">Active Frame Rate (@byte 30)</div>
                  <div className="font-mono font-semibold text-[#059669] mt-0.5">
                    {globalFps} FPS ({teleportFrames.length} Total Frames)
                  </div>
                </div>
              </div>
            ) : activeAnimationMode !== 'bounce' ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-[#E2E8F0] text-xs">
                <div>
                  <div className="text-[#64748B]">Act / Keyframe Stage</div>
                  <div className="font-semibold text-[#0F172A] mt-0.5 truncate">
                    {safeHeroFrame.phase}
                  </div>
                </div>
                <div>
                  <div className="text-[#64748B]">Pelvis Scene X / Y (@+130)</div>
                  <div className="font-mono font-semibold text-[#0F172A] mt-0.5">
                    {safeHeroFrame.sceneX.toFixed(1)}, {safeHeroFrame.sceneY.toFixed(1)} px
                  </div>
                </div>
                <div>
                  <div className="text-[#64748B]">Torso Pitch / Head Angle</div>
                  <div className="font-mono font-semibold text-[#0284C7] mt-0.5">
                    Spine {safeHeroJoints[7].worldAngle.toFixed(0)}° · Head{' '}
                    {safeHeroJoints[13].worldAngle.toFixed(0)}°
                  </div>
                </div>
                <div>
                  <div className="text-[#64748B]">Active Frame Rate (@byte 30)</div>
                  <div className="font-mono font-semibold text-[#059669] mt-0.5">
                    {globalFps} FPS ({activeStickfigureFrames.length} Total Frames)
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-[#E2E8F0] text-xs">
                <div>
                  <div className="text-[#64748B]">Active Motion Phase</div>
                  <div className="font-semibold text-[#0F172A] mt-0.5 truncate">
                    {safeBounceFrame.phase}
                  </div>
                </div>
                <div>
                  <div className="text-[#64748B]">Scene X / Y (@+130/+134)</div>
                  <div className="font-mono font-semibold text-[#0F172A] mt-0.5">
                    {safeBounceFrame.sceneX.toFixed(1)}, {safeBounceFrame.sceneY.toFixed(1)} px
                  </div>
                </div>
                <div>
                  <div className="text-[#64748B]">Node 13 Length (@rec+4)</div>
                  <div className="font-mono font-semibold text-[#0284C7] mt-0.5">
                    {safeBounceFrame.serializedLength.toFixed(1)} px (
                    {safeBounceFrame.blendedSq.toFixed(2)}×)
                  </div>
                </div>
                <div>
                  <div className="text-[#64748B]">Active Frame Rate (@byte 30)</div>
                  <div className="font-mono font-semibold text-[#059669] mt-0.5">
                    {globalFps} FPS
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Zone: Parameter Control & Binary Synthesis Deck */}
          <div className="lg:col-span-4 bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-5">
            <div className="border-b border-[#E2E8F0] pb-3">
              <h2 className="text-lg font-semibold text-[#0F172A] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#0284C7]" />
                02. Stick Nodes FPS &amp; Natural Movement Compiler
              </h2>
              <p className="text-xs text-[#475569] mt-0.5">
                Choose between <strong>12 FPS</strong> and <strong>24 FPS</strong> for all generated
                Stick Nodes <code className="font-mono">.stknds</code> projects.
              </p>
            </div>

            {/* Global 12 FPS vs 24 FPS Toggle (Persistent for all animations) */}
            <div className="space-y-2 p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
              <div className="flex items-center justify-between font-semibold text-[#0F172A]">
                <span>Target Stick Nodes Frame Rate</span>
                <span className="font-mono text-[#0284C7]">Header Byte @30 = {globalFps}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#E2E8F0]/70 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleSelectFps(12)}
                  className={`px-3 py-2 rounded-md font-semibold transition-colors whitespace-nowrap ${
                    globalFps === 12
                      ? 'bg-[#0F172A] text-white shadow-xs'
                      : 'text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  12 FPS (Standard)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectFps(24)}
                  className={`px-3 py-2 rounded-md font-semibold transition-colors whitespace-nowrap ${
                    globalFps === 24
                      ? 'bg-[#0F172A] text-white shadow-xs'
                      : 'text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  24 FPS (Smooth)
                </button>
              </div>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                {globalFps === 12
                  ? '12 FPS writes 0x0C at header byte 30 for crisp, high-contrast 2D pose timing.'
                  : '24 FPS writes 0x18 at header byte 30 with optional full in-between baking.'}
              </p>
            </div>

            {activeAnimationMode === 'teleport' ? (
              <div className="space-y-4 text-xs">
                {globalFps === 24 && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F1F5F9]">
                    <label
                      htmlFor="bake-teleport-24fps"
                      className="font-medium text-[#0F172A] cursor-pointer"
                    >
                      Bake 24 FPS In-Betweens (71 Frames Total)
                    </label>
                    <input
                      id="bake-teleport-24fps"
                      type="checkbox"
                      checked={teleportConfig.interpolate24FpsFrames}
                      onChange={(e) => {
                        setTeleportConfig((c) => ({
                          ...c,
                          interpolate24FpsFrames: e.target.checked,
                        }));
                        setCurrentFrame(0);
                      }}
                      className="accent-[#0284C7]"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <label htmlFor="teleport-closeup">Act 2 Close-Up Camera Zoom</label>
                    <span className="font-mono text-[#0F172A]">
                      {teleportConfig.closeUpZoom.toFixed(2)}x
                    </span>
                  </div>
                  <input
                    id="teleport-closeup"
                    type="range"
                    min={1.5}
                    max={3.5}
                    step={0.05}
                    value={teleportConfig.closeUpZoom}
                    onChange={(e) =>
                      setTeleportConfig((c) => ({
                        ...c,
                        closeUpZoom: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-[#0284C7]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <label htmlFor="teleport-whippan">Act 3 Whip-Pan Right Offset</label>
                    <span className="font-mono text-[#0F172A]">
                      +{teleportConfig.whipPanOffsetX} px
                    </span>
                  </div>
                  <input
                    id="teleport-whippan"
                    type="range"
                    min={40}
                    max={240}
                    step={4}
                    value={teleportConfig.whipPanOffsetX}
                    onChange={(e) =>
                      setTeleportConfig((c) => ({
                        ...c,
                        whipPanOffsetX: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-[#0284C7]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <label htmlFor="teleport-screenshake">Act 7 Impact Screen Shake Amplitude</label>
                    <span className="font-mono text-[#0F172A]">
                      ±{teleportConfig.screenShakeAmplitudePx} px
                    </span>
                  </div>
                  <input
                    id="teleport-screenshake"
                    type="range"
                    min={4}
                    max={40}
                    step={2}
                    value={teleportConfig.screenShakeAmplitudePx}
                    onChange={(e) =>
                      setTeleportConfig((c) => ({
                        ...c,
                        screenShakeAmplitudePx: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-[#0284C7]"
                  />
                </div>

                <div className="pt-2 border-t border-[#E2E8F0] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#0F172A]">Character Red (Fig #1)</span>
                    <div className="flex items-center gap-2">
                      {['#DC2626', '#EF4444', '#991B1B', '#EA580C', '#7C3AED'].map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => setTeleportConfig((c) => ({ ...c, redColorHex: hex }))}
                          aria-label={`Select Red color ${hex}`}
                          className={`w-5 h-5 rounded-full border transition-transform ${
                            teleportConfig.redColorHex === hex
                              ? 'scale-110 ring-2 ring-[#0F172A] border-white'
                              : 'border-[#CBD5E1]'
                          }`}
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#0F172A]">Character Blue (Fig #2)</span>
                    <div className="flex items-center gap-2">
                      {['#2563EB', '#0284C7', '#1D4ED8', '#059669', '#1F2937'].map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => setTeleportConfig((c) => ({ ...c, blueColorHex: hex }))}
                          aria-label={`Select Blue color ${hex}`}
                          className={`w-5 h-5 rounded-full border transition-transform ${
                            teleportConfig.blueColorHex === hex
                              ? 'scale-110 ring-2 ring-[#0F172A] border-white'
                              : 'border-[#CBD5E1]'
                          }`}
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 space-y-2">
                  <button
                    type="button"
                    disabled={!baseTemplate27 || synthesizing}
                    onClick={handleSynthesizeAndDownload}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    {synthesizing
                      ? 'Synthesizing GZIP Container...'
                      : `Compile & Download Teleport Ambush (${globalFps} FPS · ${teleportFrames.length}f .stknds)`}
                  </button>
                </div>
              </div>
            ) : activeAnimationMode === 'sneeze' ? (
              <div className="space-y-4 text-xs">
                {globalFps === 24 && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F1F5F9]">
                    <label
                      htmlFor="bake-sneeze-24fps"
                      className="font-medium text-[#0F172A] cursor-pointer"
                    >
                      Bake 24 FPS In-Betweens (71 Frames Total)
                    </label>
                    <input
                      id="bake-sneeze-24fps"
                      type="checkbox"
                      checked={sneezeConfig.interpolate24FpsFrames}
                      onChange={(e) => {
                        setSneezeConfig((c) => ({
                          ...c,
                          interpolate24FpsFrames: e.target.checked,
                        }));
                        setCurrentFrame(0);
                      }}
                      className="accent-[#0284C7]"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <label htmlFor="sneeze-tremble">Act 2 Stuck Hold Tremble Shake</label>
                    <span className="font-mono text-[#0F172A]">
                      ±{sneezeConfig.holdTrembleDeg}°
                    </span>
                  </div>
                  <input
                    id="sneeze-tremble"
                    type="range"
                    min={2}
                    max={14}
                    step={1}
                    value={sneezeConfig.holdTrembleDeg}
                    onChange={(e) =>
                      setSneezeConfig((c) => ({
                        ...c,
                        holdTrembleDeg: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-[#0284C7]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <label htmlFor="sneeze-apex">Act 4 Mid-Air Backflip Apex (Scene Y)</label>
                    <span className="font-mono text-[#0F172A]">{sneezeConfig.recoilApexY} px</span>
                  </div>
                  <input
                    id="sneeze-apex"
                    type="range"
                    min={130}
                    max={310}
                    step={4}
                    value={sneezeConfig.recoilApexY}
                    onChange={(e) =>
                      setSneezeConfig((c) => ({
                        ...c,
                        recoilApexY: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-[#0284C7]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <label htmlFor="sneeze-bounce">Act 5 Back Crash Limb Bounce Arc</label>
                    <span className="font-mono text-[#0F172A]">
                      +{sneezeConfig.limbBounceDeg}°
                    </span>
                  </div>
                  <input
                    id="sneeze-bounce"
                    type="range"
                    min={12}
                    max={64}
                    step={2}
                    value={sneezeConfig.limbBounceDeg}
                    onChange={(e) =>
                      setSneezeConfig((c) => ({
                        ...c,
                        limbBounceDeg: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-[#0284C7]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <label htmlFor="sneeze-twitch">Act 6 Final Slow Leg Twitch Angle</label>
                    <span className="font-mono text-[#0F172A]">
                      +{sneezeConfig.twitchAngleDeg}°
                    </span>
                  </div>
                  <input
                    id="sneeze-twitch"
                    type="range"
                    min={10}
                    max={48}
                    step={2}
                    value={sneezeConfig.twitchAngleDeg}
                    onChange={(e) =>
                      setSneezeConfig((c) => ({
                        ...c,
                        twitchAngleDeg: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-[#0284C7]"
                  />
                </div>

                <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between">
                  <span className="font-medium text-[#0F172A]">Head Circle Tint (Node 13)</span>
                  <div className="flex items-center gap-2">
                    {['#0284C7', '#393939', '#E11D48', '#059669', '#D97706'].map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setSneezeConfig((c) => ({ ...c, headColorHex: hex }))}
                        aria-label={`Select head color ${hex}`}
                        className={`w-5 h-5 rounded-full border transition-transform ${
                          sneezeConfig.headColorHex === hex
                            ? 'scale-110 ring-2 ring-[#0F172A] border-white'
                            : 'border-[#CBD5E1]'
                        }`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-3 space-y-2">
                  <button
                    type="button"
                    disabled={!baseTemplate27 || synthesizing}
                    onClick={handleSynthesizeAndDownload}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    {synthesizing
                      ? 'Synthesizing GZIP Container...'
                      : `Compile & Download Sneeze (${globalFps} FPS · ${sneezeFrames.length}f .stknds)`}
                  </button>
                </div>
              </div>
            ) : activeAnimationMode === 'superhero' ? (
              <div className="space-y-4 text-xs">
                {/* 24 FPS Baked In-Betweens Option */}
                {globalFps === 24 && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F1F5F9]">
                    <label
                      htmlFor="bake-24fps"
                      className="font-medium text-[#0F172A] cursor-pointer"
                    >
                      Bake 24 FPS In-Betweens (53f / 24 Flight Frames)
                    </label>
                    <input
                      id="bake-24fps"
                      type="checkbox"
                      checked={heroConfig.interpolate24FpsFrames}
                      onChange={(e) => {
                        setHeroConfig((c) => ({
                          ...c,
                          interpolate24FpsFrames: e.target.checked,
                        }));
                        setCurrentFrame(0);
                      }}
                      className="accent-[#0284C7]"
                    />
                  </div>
                )}

                {/* Sky Corridor Altitude Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <label htmlFor="flight-apex">Sky Corridor Cruise Altitude (Scene Y)</label>
                    <span className="font-mono text-[#0F172A]">{heroConfig.flightApexY} px</span>
                  </div>
                  <input
                    id="flight-apex"
                    type="range"
                    min={105}
                    max={240}
                    step={3}
                    value={heroConfig.flightApexY}
                    onChange={(e) =>
                      setHeroConfig((c) => ({ ...c, flightApexY: Number(e.target.value) }))
                    }
                    className="w-full accent-[#0284C7]"
                  />
                </div>

                {/* Head Scratch Forearm Oscillation */}
                <div className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <label htmlFor="scratch-amp">Head Scratch Forearm Arc (Node 10)</label>
                    <span className="font-mono text-[#0F172A]">
                      ±{heroConfig.scratchAmplitudeDeg}°
                    </span>
                  </div>
                  <input
                    id="scratch-amp"
                    type="range"
                    min={8}
                    max={32}
                    step={2}
                    value={heroConfig.scratchAmplitudeDeg}
                    onChange={(e) =>
                      setHeroConfig((c) => ({
                        ...c,
                        scratchAmplitudeDeg: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-[#0284C7]"
                  />
                </div>

                {/* Superhero Landing Compression */}
                <div className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <label htmlFor="landing-dip">3-Point Landing Shockwave Dip</label>
                    <span className="font-mono text-[#0F172A]">
                      +{heroConfig.landingCompressionPx} px
                    </span>
                  </div>
                  <input
                    id="landing-dip"
                    type="range"
                    min={4}
                    max={26}
                    step={2}
                    value={heroConfig.landingCompressionPx}
                    onChange={(e) =>
                      setHeroConfig((c) => ({
                        ...c,
                        landingCompressionPx: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-[#0284C7]"
                  />
                </div>

                {/* Stickfigure Body & Head Accent Colors */}
                <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between">
                  <span className="font-medium text-[#0F172A]">Head Circle Tint (Node 13)</span>
                  <div className="flex items-center gap-2">
                    {['#0284C7', '#393939', '#E11D48', '#059669', '#D97706'].map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setHeroConfig((c) => ({ ...c, headColorHex: hex }))}
                        aria-label={`Select head color ${hex}`}
                        className={`w-5 h-5 rounded-full border transition-transform ${
                          heroConfig.headColorHex === hex
                            ? 'scale-110 ring-2 ring-[#0F172A] border-white'
                            : 'border-[#CBD5E1]'
                        }`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-3 space-y-2">
                  <button
                    type="button"
                    disabled={!baseTemplate27 || synthesizing}
                    onClick={handleSynthesizeAndDownload}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    {synthesizing
                      ? 'Synthesizing GZIP Container...'
                      : `Compile & Download (${globalFps} FPS · ${superheroFrames.length}f .stknds)`}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between font-medium text-[#0F172A]">
                    <span>Target Node 13 (UID 16) Serialization Type</span>
                    <span className="font-mono text-[#0284C7]">Byte @2239</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F1F5F9] rounded-lg">
                    <button
                      type="button"
                      onClick={() => setBounceConfig((c) => ({ ...c, nodeType: 4 }))}
                      className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                        bounceConfig.nodeType === 4
                          ? 'bg-white text-[#0F172A] shadow-xs'
                          : 'text-[#475569] hover:text-[#0F172A]'
                      }`}
                    >
                      Type 4 (Filled Circle)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBounceConfig((c) => ({ ...c, nodeType: 2 }))}
                      className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                        bounceConfig.nodeType === 2
                          ? 'bg-white text-[#0F172A] shadow-xs'
                          : 'text-[#475569] hover:text-[#0F172A]'
                      }`}
                    >
                      Type 2 (Circle Ring)
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <label htmlFor="primary-apex">Primary Bounce Apex Height</label>
                    <span className="font-mono text-[#0F172A]">
                      {bounceConfig.primaryApexHeight} px
                    </span>
                  </div>
                  <input
                    id="primary-apex"
                    type="range"
                    min={120}
                    max={420}
                    step={2}
                    value={bounceConfig.primaryApexHeight}
                    onChange={(e) =>
                      setBounceConfig((c) => ({
                        ...c,
                        primaryApexHeight: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-[#0284C7]"
                  />
                </div>

                <div className="pt-3">
                  <button
                    type="button"
                    disabled={!baseTemplate22 || synthesizing}
                    onClick={handleSynthesizeAndDownload}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    {synthesizing
                      ? 'Synthesizing GZIP Container...'
                      : `Compile & Download Ball Bounce (${globalFps} FPS .stknds)`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Deliverable Documentation & Natural Movement Mechanics Reference */}
        <section id="specification" className="space-y-6">
          <div className="border-b border-[#E2E8F0] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-semibold text-[#0F172A]">
                03. Universal 33-Skill Human Motion Framework &amp; Biomechanics Gate
              </h2>
              <p className="text-sm text-[#475569] mt-1">
                Medium-independent animation intelligence system (<code className="font-mono">src/lib/humanMotionSkills.ts</code> &amp; <code className="font-mono">NATURAL_MOVEMENT_SKILL.md</code>) automatically evaluating every character through all 33 biomechanical skills, the 15-step execution pipeline, and the 10-domain quality-control gate.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1 p-1 bg-[#E2E8F0]/70 rounded-lg self-start">
              <button
                type="button"
                onClick={() => setActiveDocTab('skills')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeDocTab === 'skills'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
                1. 33-Skill Library &amp; 10-Domain QC Gate
              </button>
              <button
                type="button"
                onClick={() => setActiveDocTab('frames')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeDocTab === 'frames'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                {activeAnimationMode === 'teleport'
                  ? '2. 8-Act Teleport Ambush Mechanics'
                  : activeAnimationMode === 'superhero'
                  ? '2. 5-Act Sky Flight Mechanics'
                  : '2. 6-Act Epic Sneeze Mechanics'}
              </button>
              <button
                type="button"
                onClick={() => setActiveDocTab('hierarchy')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeDocTab === 'hierarchy'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                3. Active Frame Bone Table
              </button>
              <button
                type="button"
                onClick={() => setActiveDocTab('methodology')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeDocTab === 'methodology'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                4. 12 FPS vs 24 FPS Serialization
              </button>
            </div>
          </div>

          {activeDocTab === 'skills' && (
            <div className="space-y-6">
              {/* Live 10-Domain Biomechanical Quality-Control Gate Card */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
                  <div>
                    <div className="text-xs font-mono text-[#059669] font-semibold">
                      AUTOMATIC 10-DOMAIN QUALITY-CONTROL GATE (SKILL #33)
                    </div>
                    <h3 className="text-base font-semibold text-[#0F172A]">
                      {liveBiomechanicsAudit.animationTitle} ({liveBiomechanicsAudit.frameCount} Frames Audited)
                    </h3>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-semibold ${
                      liveBiomechanicsAudit.overallPassed
                        ? 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                        : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {liveBiomechanicsAudit.overallScore}% BIOMECHANICAL PASS
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {liveBiomechanicsAudit.domains.map((dom) => (
                    <div
                      key={dom.domain}
                      className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-semibold text-[#0F172A]">
                        <span>{dom.domain}</span>
                        <span className="font-mono text-[#059669]">{dom.score}% · {dom.skillsChecked}</span>
                      </div>
                      <p className="text-xs text-[#475569] leading-relaxed">{dom.summary}</p>
                      <div className="font-mono text-[11px] text-[#0284C7] pt-0.5">
                        {dom.technicalProof}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mandatory 15-Step Automatic Execution Pipeline */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                  <div>
                    <div className="text-xs font-mono text-[#0284C7] font-semibold">
                      PERSISTENT EXECUTION PIPELINE (AUTOMATIC ON EVERY ANIMATION)
                    </div>
                    <h3 className="text-base font-semibold text-[#0F172A]">
                      15-Step Causal Biomechanical Authoring Workflow
                    </h3>
                  </div>
                  <a
                    href="/NATURAL_MOVEMENT_SKILL.md"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono text-[#0284C7] hover:underline"
                  >
                    View Full NATURAL_MOVEMENT_SKILL.md (v2.0) →
                  </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
                  {AUTOMATIC_15_STEP_PIPELINE.map((p) => (
                    <div
                      key={p.step}
                      className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1"
                    >
                      <div className="font-mono text-[11px] font-bold text-[#0284C7]">
                        STEP {p.step.toString().padStart(2, '0')} · {p.title}
                      </div>
                      <p className="text-[11px] text-[#475569] leading-snug">{p.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive 33-Skill Universal Library Explorer */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
                  <div>
                    <div className="text-xs font-mono text-[#0F172A] font-semibold">
                      REUSABLE MEDIUM-INDEPENDENT SKILL LIBRARY (33 SKILLS)
                    </div>
                    <h3 className="text-base font-semibold text-[#0F172A]">
                      All 33 Human Biomechanics, Timing, Locomotion &amp; Combat Skills
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-1 bg-[#F1F5F9] p-1 rounded-lg text-xs">
                    {[
                      'ALL',
                      'Master & Foundation',
                      'Anatomical & Skeletal',
                      'Physics, Timing & Arcs',
                      'Locomotion & Action Mechanics',
                      'Expressive & Continuity',
                      'Quality Assurance',
                    ].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedSkillCategory(cat)}
                        className={`px-2.5 py-1 rounded font-medium transition-colors ${
                          selectedSkillCategory === cat
                            ? 'bg-white text-[#0F172A] shadow-xs'
                            : 'text-[#475569] hover:text-[#0F172A]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[520px] overflow-y-auto pr-1">
                  {UNIVERSAL_33_MOTION_SKILLS.filter(
                    (s) =>
                      selectedSkillCategory === 'ALL' || s.category === selectedSkillCategory
                  ).map((skill) => (
                    <div
                      key={skill.id}
                      className="p-3.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-[#0284C7]">
                            SKILL #{skill.id.toString().padStart(2, '0')}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E2E8F0] text-[#0F172A]">
                            {skill.category}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-[#0F172A]">{skill.name}</h4>
                        <p className="text-xs text-[#475569] leading-relaxed">
                          <strong>Causal Principle:</strong> {skill.causalQuestion}
                        </p>
                      </div>
                      <ul className="space-y-1 pt-2 border-t border-[#E2E8F0]/80 text-[11px] text-[#334155]">
                        {skill.biomechanicalRules.slice(0, 3).map((rule) => (
                          <li key={rule} className="flex items-start gap-1.5">
                            <span className="text-[#0284C7] font-bold">·</span>
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeDocTab === 'frames' && (
            activeAnimationMode === 'teleport' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                  <div className="text-xs font-mono text-[#2563EB] font-semibold">
                    ACTS 01–03 · APPROACH, ZOOM &amp; WHIP-PAN
                  </div>
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    The Standoff, Close-Up &amp; Vanish (Frames 00–16)
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    Wide establishing shot as Character Blue walks calmly toward seated Character Red (<code className="font-mono text-xs">X: 960 → 756</code>). At F10, the camera zooms aggressively (<code className="font-mono text-xs">2.35x</code>) into Red’s face as he notices Blue and tilts his head up. In just 2 frames (F15–F16), a violent whip-pan pans to Blue’s spot — <em>Blue is completely gone</em>!
                  </p>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                  <div className="text-xs font-mono text-[#DC2626] font-semibold">
                    ACTS 04–05 · TELEPORT &amp; SWEEPING KICK
                  </div>
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    Behind-the-Back Strike (Frames 17–23)
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    The camera snaps wide as Blue instantly materializes behind seated Red at <code className="font-mono text-xs">X=168</code>. Blue immediately drops body weight (<code className="font-mono text-xs">Y=594</code>) and whips a heavy roundhouse kick directly targeting Red’s upper body with maximum momentum.
                  </p>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                  <div className="text-xs font-mono text-[#D97706] font-semibold">
                    ACTS 06–08 · FOREARM BLOCK &amp; SCREEN SHAKE
                  </div>
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    Seated Block, Hit-Stop &amp; Standoff (Frames 24–35)
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    Without standing up, Red twists sharply and catches Blue’s shin with a rigid forearm block (<code className="font-mono text-xs">Forearm +172° / -124°</code>). An intense hit-stop freeze triggers a 5-frame screen shake (F26–F30) before settling into a 5-frame locked martial arts standoff hold.
                  </p>
                </div>
              </div>
            ) : activeAnimationMode === 'superhero' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                  <div className="text-xs font-mono text-[#475569] font-semibold">
                    ACTS 01–02 · STRIDE &amp; SCRATCH
                  </div>
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    Walk Cycle &amp; Thoughtful Pause (Frames 00–09)
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    Character walks along the ground from <code className="font-mono text-xs">X=260 → 515</code>, stops, and reaches up to scratch their head with forearm oscillation (<code className="font-mono text-xs">±18°</code>) before taking flight.
                  </p>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                  <div className="text-xs font-mono text-[#0284C7] font-semibold">
                    ACTS 03–04 · SKY FLIGHT CORRIDOR
                  </div>
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    12 Dedicated Sky-Flight Frames (Frames 10–21)
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    Zero-G levitation liftoff, sonic pitch-out, horizontal stratosphere cruise at <code className="font-mono text-xs">Y=144px</code> with supersonic wind speed-lines, and vertical meteor air brake.
                  </p>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                  <div className="text-xs font-mono text-[#059669] font-semibold">
                    ACT 05 · THREE-POINT LANDING
                  </div>
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    Superhero Impact Compression (Frames 22–26)
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    Impact compression with fist, left knee, and right foot planted on ground plane (<code className="font-mono text-xs">Y ≈ 754</code>) with shockwave damping.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                  <div className="text-xs font-mono text-[#D97706] font-semibold">
                    ACTS 01–02 · ANTICIPATION &amp; HOLD TREMBLE
                  </div>
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    The Build-Up &amp; Stuck Sneeze Hold (Frames 00–10)
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    Starts from a balanced standing equilibrium (<code className="font-mono text-xs">X=1120, Y=509</code>). As the massive breath builds, the head tilts back (<code className="font-mono text-xs">+90° → +142°</code>), the chest rises, and elbows bend up to the chest. When the sneeze gets stuck (F06–F10), the spine arches completely backward (<code className="font-mono text-xs">UpperChest +136°..+148°</code>) with a high-frequency tension tremble across the arms and legs while the feet stay planted on the ground (<code className="font-mono text-xs">Y ≈ 758</code>).
                  </p>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                  <div className="text-xs font-mono text-[#E11D48] font-semibold">
                    ACTS 03–04 · EXPLOSION &amp; THRUSTER BACKFLIP
                  </div>
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    2-Frame Whip &amp; Mid-Air Backflip Recoil (Frames 11–21)
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    In just 2 frames (F11–F12), the character snaps violently forward: the spine curls into a tight ball (<code className="font-mono text-xs">-96°</code>), the head whips down past the knees (<code className="font-mono text-xs">-152°</code>), and both arms throw straight backward (<code className="font-mono text-xs">+172°..+178°</code>). The sneeze acts like a thruster (F13–F21), ripping the feet off the floor and launching the character backward (<code className="font-mono text-xs">X: 1104 → 512</code>) through a full 360° messy mid-air backflip (<code className="font-mono text-xs">Spine: -48° → +468°</code>).
                  </p>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                  <div className="text-xs font-mono text-[#059669] font-semibold">
                    ACTS 05–06 · FLAT BACK CRASH &amp; LEG TWITCH
                  </div>
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    Secondary Limb Bounce &amp; 1s Stillness (Frames 22–35)
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    At F22, the character crashes flat on their back (<code className="font-mono text-xs">Spine 538° ≡ 178°</code>). Impact momentum causes both arms and legs to bounce skyward once (F23–F24) before dropping flat at F26. The character then lies completely motionless for 1 full second (F27–F32, zero delta) before slowly twitching the right leg (F33–F35) to show they are still alive.
                  </p>
                </div>
              </div>
            )
          )}

          {activeDocTab === 'hierarchy' && (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    Active Frame #{(currentFrame % totalModeFrames).toString().padStart(2, '0')} —{' '}
                    {activeAnimationMode === 'teleport'
                      ? selectedBoneFigure === 'red'
                        ? 'Character Red (Figure #1 Seated Guard)'
                        : 'Character Blue (Figure #2 Ambush Attacker)'
                      : 'All 17 Bone Angles & Joint Coordinates'}
                  </h3>
                  {activeAnimationMode === 'teleport' && !safeTeleportFrame.bluePresent && selectedBoneFigure === 'blue' && (
                    <p className="text-xs text-[#DC2626] font-mono mt-0.5">
                      Note: Character Blue has vanished from the scene during this whip-pan frame (F15–F16).
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {activeAnimationMode === 'teleport' && (
                    <div className="flex items-center gap-1 p-0.5 bg-[#F1F5F9] rounded-md text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedBoneFigure('red')}
                        className={`px-2.5 py-1 rounded font-medium transition-colors ${
                          selectedBoneFigure === 'red'
                            ? 'bg-[#DC2626] text-white'
                            : 'text-[#475569] hover:text-[#0F172A]'
                        }`}
                      >
                        Red (Fig #1)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedBoneFigure('blue')}
                        className={`px-2.5 py-1 rounded font-medium transition-colors ${
                          selectedBoneFigure === 'blue'
                            ? 'bg-[#2563EB] text-white'
                            : 'text-[#475569] hover:text-[#0F172A]'
                        }`}
                      >
                        Blue (Fig #2)
                      </button>
                    </div>
                  )}
                  <span className="text-xs font-mono text-[#475569]">
                    a1(i) = world_angle(i) − world_angle(parent(i))
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto max-h-80 overflow-y-auto border border-[#E2E8F0] rounded-lg">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead className="sticky top-0 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569]">
                    <tr>
                      <th className="py-2 px-3">Bone Name</th>
                      <th className="py-2 px-3">Parent</th>
                      <th className="py-2 px-3">Length (@+4)</th>
                      <th className="py-2 px-3">Rel Angle a1 (@+12)</th>
                      <th className="py-2 px-3">World Angle</th>
                      <th className="py-2 px-3">Joint Start (X, Y)</th>
                      <th className="py-2 px-3">Joint Tip (X, Y)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {safeHeroJoints.map((j, idx) => (
                      <tr
                        key={STICKFIGURE_BONE_NAMES[idx]}
                        className={
                          idx === 7 || idx === 9 || idx === 10 || idx === 13
                            ? 'bg-[#0284C7]/8 font-semibold'
                            : 'hover:bg-[#F8FAFC]'
                        }
                      >
                        <td className="py-1.5 px-3">{STICKFIGURE_BONE_NAMES[idx]}</td>
                        <td className="py-1.5 px-3">
                          {STICKFIGURE_PARENTS[idx] === -1
                            ? 'Scene Root'
                            : `Node ${STICKFIGURE_PARENTS[idx].toString().padStart(2, '0')}`}
                        </td>
                        <td className="py-1.5 px-3">{j.length.toFixed(1)}</td>
                        <td className="py-1.5 px-3 text-[#0284C7]">{j.relAngleA1.toFixed(2)}°</td>
                        <td className="py-1.5 px-3">{j.worldAngle.toFixed(1)}°</td>
                        <td className="py-1.5 px-3">
                          ({j.startX.toFixed(1)}, {j.startY.toFixed(1)})
                        </td>
                        <td className="py-1.5 px-3">
                          ({j.endX.toFixed(1)}, {j.endY.toFixed(1)})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeDocTab === 'methodology' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-2.5">
                <div className="text-xs font-mono text-[#0284C7] font-semibold">
                  FPS HEADER OFFSET (@BYTE 30)
                </div>
                <h3 className="text-base font-semibold text-[#0F172A]">
                  12 FPS vs 24 FPS Binary Encoding
                </h3>
                <p className="text-sm text-[#475569] leading-relaxed">
                  Across all corpus templates (<code className="font-mono text-xs">project6</code>, <code className="font-mono text-xs">rpoject5</code>, <code className="font-mono text-xs">Project2..4</code>), project frame rate is stored at offset <code className="font-mono text-xs">8 + name_len + 14</code> (byte <code className="font-mono text-xs">30</code> when <code className="font-mono text-xs">name_len = 8</code>). Setting byte <code className="font-mono text-xs">30</code> to <code className="font-mono text-xs">0x0C</code> configures 12 FPS; <code className="font-mono text-xs">0x18</code> configures 24 FPS.
                </p>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-2.5">
                <div className="text-xs font-mono text-[#0284C7] font-semibold">
                  FRAME LIST DELIMITER (+1194)
                </div>
                <h3 className="text-base font-semibold text-[#0F172A]">
                  Variable Frame Count Table Rules
                </h3>
                <p className="text-sm text-[#475569] leading-relaxed">
                  Big-endian <code className="font-mono text-xs">int32</code> at offset <code className="font-mono text-xs">2587</code> specifies total frames <code className="font-mono text-xs">N</code>. Every 1,197-byte frame record <code className="font-mono text-xs">0..N−2</code> terminates with <code className="font-mono text-xs">01 01 00</code> at <code className="font-mono text-xs">+1194..+1197</code>, while the final frame <code className="font-mono text-xs">N−1</code> terminates with <code className="font-mono text-xs">00 00 00</code> before the 41-byte project trailer.
                </p>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-2.5">
                <div className="text-xs font-mono text-[#0284C7] font-semibold">
                  VALIDATION DISCLOSURE
                </div>
                <h3 className="text-base font-semibold text-[#0F172A]">
                  Container &amp; Semantic Verification
                </h3>
                <p className="text-sm text-[#475569] leading-relaxed">
                  All exported <code className="font-mono text-xs">.stknds</code> files pass Level 1 (Container) and Level 2 (Semantic) checks in the inspector below. Per <code className="font-mono text-xs">SKILL.md</code> Section 14, native Stick Nodes app execution is not available in this browser environment and is not claimed as device smoke-tested.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Complete Keyframe Schedule Table */}
        <section id="trajectory" className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-[#0F172A]">
                04. Complete Keyframe Schedule —{' '}
                {activeAnimationMode === 'teleport'
                  ? `The Teleport Ambush (${teleportFrames.length} Frames · 2 Figures + Camera)`
                  : activeAnimationMode === 'sneeze'
                  ? `The Epic Sneeze (${sneezeFrames.length} Frames)`
                  : `Walk, Scratch & 12f Sky Flight (${superheroFrames.length} Frames)`}
              </h2>
              <p className="text-xs text-[#475569] mt-0.5">
                Click any row to scrub the viewport to that keyframe and inspect its joint angles and camera parameters.
              </p>
            </div>
            <span className="text-xs font-mono text-[#475569]">
              Target Rate: {globalFps} FPS (@byte 30) · Total Frames:{' '}
              {activeAnimationMode === 'teleport'
                ? teleportFrames.length
                : activeAnimationMode === 'sneeze'
                ? sneezeFrames.length
                : superheroFrames.length}
            </span>
          </div>

          <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
            {activeAnimationMode === 'teleport' ? (
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead className="sticky top-0 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569]">
                  <tr>
                    <th className="py-2.5 px-3">Frame</th>
                    <th className="py-2.5 px-3 font-sans">Narrative Act</th>
                    <th className="py-2.5 px-3 font-sans">Keyframe Stage</th>
                    <th className="py-2.5 px-3">Camera (@+42..+50)</th>
                    <th className="py-2.5 px-3 text-[#DC2626]">Red Seated (X, Y)</th>
                    <th className="py-2.5 px-3 text-[#2563EB]">Blue Ambush (X, Y)</th>
                    <th className="py-2.5 px-3">Red Spine / Forearm</th>
                    <th className="py-2.5 px-3">Blue Shin / Kick</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {teleportFrames.map((row, idx) => {
                    const isCurrent = currentFrame % teleportFrames.length === idx;
                    return (
                      <tr
                        key={idx}
                        onClick={() => {
                          setIsPlaying(false);
                          setCurrentFrame(idx);
                        }}
                        className={`cursor-pointer transition-colors ${
                          isCurrent
                            ? 'bg-[#0284C7]/15 font-semibold'
                            : row.act.includes('Screen Shake') || row.act.includes('Block')
                            ? 'bg-[#FEF2F2]/70 hover:bg-[#FEE2E2]/70'
                            : row.act.includes('Whip Pan')
                            ? 'bg-[#EFF6FF]/70 hover:bg-[#DBEAFE]/70'
                            : row.act.includes('Ambush')
                            ? 'bg-[#FEF9C3]/50 hover:bg-[#FEF08A]/60'
                            : 'hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <td className="py-2 px-3 text-[#0284C7]">
                          #{idx.toString().padStart(2, '0')}
                        </td>
                        <td className="py-2 px-3 font-sans text-[#475569]">{row.act}</td>
                        <td className="py-2 px-3 font-sans text-[#0F172A]">{row.phase}</td>
                        <td className="py-2 px-3 text-[#0284C7]">
                          {row.camZoom.toFixed(2)}x ({row.camX.toFixed(0)}, {row.camY.toFixed(0)})
                        </td>
                        <td className="py-2 px-3 text-[#DC2626]">
                          ({row.redX.toFixed(0)}, {row.redY.toFixed(0)})
                        </td>
                        <td className="py-2 px-3 text-[#2563EB]">
                          {row.bluePresent
                            ? `(${row.blueX.toFixed(0)}, ${row.blueY.toFixed(0)})`
                            : 'VANISHED (0 FIG)'}
                        </td>
                        <td className="py-2 px-3">
                          {row.redAngles[7].toFixed(0)}° / {row.redAngles[10].toFixed(0)}°
                        </td>
                        <td className="py-2 px-3">
                          {row.bluePresent
                            ? `${row.blueAngles[2].toFixed(0)}° / ${row.blueAngles[3].toFixed(0)}°`
                            : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead className="sticky top-0 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569]">
                  <tr>
                    <th className="py-2.5 px-3">Frame</th>
                    <th className="py-2.5 px-3">Byte Offset</th>
                    <th className="py-2.5 px-3 font-sans">Narrative Act</th>
                    <th className="py-2.5 px-3 font-sans">Keyframe Pose</th>
                    <th className="py-2.5 px-3">Scene X (@+130)</th>
                    <th className="py-2.5 px-3">Scene Y (@+134)</th>
                    <th className="py-2.5 px-3">Spine (N07)</th>
                    <th className="py-2.5 px-3">R_Arm (N09/N10)</th>
                    <th className="py-2.5 px-3">Head (N13)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {(activeAnimationMode === 'sneeze' ? sneezeFrames : superheroFrames).map((row, idx) => {
                    const isCurrent =
                      activeAnimationMode !== 'bounce' &&
                      currentFrame % (activeAnimationMode === 'sneeze' ? sneezeFrames.length : superheroFrames.length) === idx;
                    const byteOff = 2594 + idx * 1197;
                    return (
                      <tr
                        key={idx}
                        onClick={() => {
                          setIsPlaying(false);
                          setCurrentFrame(idx);
                        }}
                        className={`cursor-pointer transition-colors ${
                          isCurrent
                            ? 'bg-[#0284C7]/15 font-semibold'
                            : row.act.includes('Explosion')
                            ? 'bg-[#FEF2F2]/70 hover:bg-[#FEE2E2]/70'
                            : row.isFlightFrame
                            ? 'bg-[#E0F2FE]/40 hover:bg-[#E0F2FE]/70'
                            : 'hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <td className="py-2 px-3 text-[#0284C7]">
                          #{idx.toString().padStart(2, '0')}
                        </td>
                        <td className="py-2 px-3 text-[#64748B]">{byteOff}</td>
                        <td className="py-2 px-3 font-sans text-[#475569]">{row.act}</td>
                        <td className="py-2 px-3 font-sans text-[#0F172A]">{row.phase}</td>
                        <td className="py-2 px-3">{row.sceneX.toFixed(1)}</td>
                        <td className="py-2 px-3">{row.sceneY.toFixed(1)}</td>
                        <td className="py-2 px-3">{row.worldAngles[7].toFixed(0)}°</td>
                        <td className="py-2 px-3">
                          {row.worldAngles[9].toFixed(0)}° / {row.worldAngles[10].toFixed(0)}°
                        </td>
                        <td className="py-2 px-3">{row.worldAngles[13].toFixed(0)}°</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Live Corpus & Generated File Binary Inspector */}
        <section id="corpus" className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-[#0F172A] flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-[#0284C7]" />
                05. Interactive .stknds Corpus &amp; Semantic Inspector
              </h2>
              <p className="text-xs text-[#475569] mt-0.5">
                Browser-native port of <code className="font-mono">inspect_stknds.py</code> extended
                with Level-2 figure hierarchy, FPS header, and frame record semantic verification.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                aria-label="Select a .stknds file to inspect"
                value={selectedPresetPath}
                onChange={(e) => setSelectedPresetPath(e.target.value)}
                className="text-xs font-medium bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-2 text-[#0F172A]"
              >
                {CORPUS_PRESETS.map((p) => (
                  <option key={p.path} value={p.path}>
                    [{p.category}] {p.label}
                  </option>
                ))}
              </select>

              <label className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] rounded-lg cursor-pointer transition-colors whitespace-nowrap">
                <Upload className="w-3.5 h-3.5" />
                Inspect Local .stknds
                <input
                  type="file"
                  accept=".stknds"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {inspectLoading && (
            <div className="py-8 text-center text-sm text-[#475569] font-mono">
              Decompressing GZIP stream and verifying v334 binary offsets...
            </div>
          )}

          {inspectError && (
            <div className="p-4 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>ERROR: {inspectError}</span>
            </div>
          )}

          {!inspectLoading && activeInspection && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
                <div>
                  <div className="text-[#64748B]">File Name</div>
                  <div className="font-mono font-semibold text-[#0F172A] mt-0.5 truncate">
                    {activeInspection.fileName}
                  </div>
                </div>
                <div>
                  <div className="text-[#64748B]">Compressed / Raw</div>
                  <div className="font-mono font-semibold text-[#0F172A] mt-0.5">
                    {activeInspection.compressedSize.toLocaleString()} B →{' '}
                    {activeInspection.decompressedSize.toLocaleString()} B
                  </div>
                </div>
                <div>
                  <div className="text-[#64748B]">Format Version &amp; Rate</div>
                  <div className="font-mono font-semibold text-[#0284C7] mt-0.5">
                    v{activeInspection.version} · {activeInspection.fps} FPS
                  </div>
                </div>
                <div>
                  <div className="text-[#64748B]">Embedded Figure</div>
                  <div className="font-mono font-semibold text-[#0F172A] mt-0.5 truncate">
                    {activeInspection.figureName} ({activeInspection.figureNodes.length} nodes)
                  </div>
                </div>
                <div>
                  <div className="text-[#64748B]">Frame Count</div>
                  <div className="font-mono font-semibold text-[#0F172A] mt-0.5">
                    {activeInspection.frameCount} frames
                  </div>
                </div>
                <div>
                  <div className="text-[#64748B]">SHA-256 Digest</div>
                  <div
                    className="font-mono font-semibold text-[#0F172A] mt-0.5 truncate"
                    title={activeInspection.sha256}
                  >
                    {activeInspection.sha256.slice(0, 16)}…
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeInspection.semanticChecks.map((chk) => (
                  <div
                    key={chk.label}
                    className="flex items-start gap-3 p-3.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  >
                    {chk.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    )}
                    <div className="text-xs space-y-0.5">
                      <div className="font-semibold text-[#0F172A]">
                        {chk.passed ? 'PASS · ' : 'INFO · '}
                        {chk.label}
                      </div>
                      <div className="text-[#475569] font-mono">{chk.detail}</div>
                    </div>
                  </div>
                ))}
              </div>

              {activeInspection.figureNodes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#0F172A] flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#0284C7]" />
                      Parsed 84-Byte Figure Nodes in {activeInspection.fileName} (Offset{' '}
                      {activeInspection.figureOffset})
                    </h3>
                    <span className="text-xs font-mono text-[#64748B]">
                      Showing all {activeInspection.figureNodes.length} recursive nodes
                    </span>
                  </div>
                  <div className="overflow-x-auto max-h-64 overflow-y-auto border border-[#E2E8F0] rounded-lg">
                    <table className="w-full text-left border-collapse text-xs font-mono">
                      <thead className="sticky top-0 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569]">
                        <tr>
                          <th className="py-2 px-3">Idx</th>
                          <th className="py-2 px-3">UID</th>
                          <th className="py-2 px-3">Node Type</th>
                          <th className="py-2 px-3">Length</th>
                          <th className="py-2 px-3">Thickness</th>
                          <th className="py-2 px-3">Local (X, Y)</th>
                          <th className="py-2 px-3">Color</th>
                          <th className="py-2 px-3">Children</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {activeInspection.figureNodes.map((n) => (
                          <tr
                            key={n.index}
                            className={
                              n.index === 13
                                ? 'bg-[#0284C7]/10 font-semibold'
                                : 'hover:bg-[#F8FAFC]'
                            }
                          >
                            <td className="py-1.5 px-3">{n.index}</td>
                            <td className="py-1.5 px-3">{n.uid}</td>
                            <td className="py-1.5 px-3">{n.nodeTypeName}</td>
                            <td className="py-1.5 px-3">{n.length.toFixed(1)}</td>
                            <td className="py-1.5 px-3">{n.thickness}</td>
                            <td className="py-1.5 px-3">
                              ({n.localX.toFixed(1)}, {n.localY.toFixed(1)})
                            </td>
                            <td className="py-1.5 px-3 flex items-center gap-1.5">
                              <span
                                className="inline-block w-3 h-3 rounded-xs border border-[#CBD5E1]"
                                style={{ backgroundColor: n.colorHex }}
                              />
                              {n.colorHex}
                            </td>
                            <td className="py-1.5 px-3">{n.childCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-[#E2E8F0] bg-white px-6 py-5 mt-12">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>
              Stick Nodes Animation Forge · 12 FPS / 24 FPS Sky-Flight Engine &amp; Binary Corpus
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="/downloads/walk_scratch_fly_superhero_12fps.stknds"
              download
              className="hover:text-[#0F172A] underline underline-offset-2"
            >
              walk_scratch_fly_superhero_12fps.stknds
            </a>
            <span aria-hidden="true">·</span>
            <a
              href="/downloads/walk_scratch_fly_superhero_24fps.stknds"
              download
              className="hover:text-[#0F172A] underline underline-offset-2"
            >
              walk_scratch_fly_superhero_24fps.stknds
            </a>
            <span aria-hidden="true">·</span>
            <a
              href="/downloads/walk_scratch_fly_superhero_24fps_53f.stknds"
              download
              className="hover:text-[#0F172A] underline underline-offset-2"
            >
              walk_scratch_fly_superhero_24fps_53f.stknds
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
