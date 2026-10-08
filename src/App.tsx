import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Sparkles,
  Download,
  Target,
  Play,
  Pause,
  Layers,
  Compass,
  Activity,
  GitBranch,
  Cpu,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';

import { CORPUS_PRESETS } from './data/corpusPresets';
import { computeForwardKinematics } from './lib/kinematics/forwardKinematics';

import {
  type StkndsInspectionResult,
  type BounceGeneratorConfig,
  type SuperheroGeneratorConfig,
  type EpicSneezeGeneratorConfig,
  type TeleportAmbushGeneratorConfig,
  type SpeedVsStrengthGeneratorConfig,
  type PhantomShadowboxGeneratorConfig,
  inspectStkndsBuffer,
  buildAdjustedSuperheroFrames,
  synthesizeSuperheroStknds,
  synthesizeBounceStknds,
  buildAdjustedSneezeFrames,
  synthesizeSneezeStknds,
  buildAdjustedTeleportFrames,
  synthesizeTeleportStknds,
  buildAdjustedSpeedStrengthFrames,
  synthesizeSpeedStrengthStknds,
  buildAdjustedPhantomFrames,
  synthesizePhantomShadowboxStknds,
} from './lib/stkndsCodec';

import {
  type BasketballGeneratorConfig,
  buildCanonicalBasketballFrames,
  validateBasketballBiomechanics,
  synthesizeBasketballStknds,
} from './lib/basketballChoreographyFrames';

import {
  type SitWalkKickGeneratorConfig,
  buildCanonicalSitWalkKickFrames,
  buildAdjustedSitWalkKickFrames,
  validateSitWalkKickBiomechanics,
  synthesizeSitWalkKickStknds,
} from './lib/sitWalkKickBallFrames';

import {
  evaluateTeleportAmbushQuality,
  evaluateSpeedVsStrengthQuality,
  validateMultiCharacterSpatialConsistency,
} from './lib/humanMotionSkills';

import { AppCanvas } from './components/canvas/AppCanvas';
import { ModeControlsPanel } from './components/panels/ModeControlsPanel';
import { AuditMetricsPanel } from './components/panels/AuditMetricsPanel';

import { KinematicsIkTab } from './components/tabs/KinematicsIkTab';
import { FullBodyReactivityTab } from './components/tabs/FullBodyReactivityTab';
import { ProceduralKinematicsTab } from './components/tabs/ProceduralKinematicsTab';
import { SpatialInteractionTab } from './components/tabs/SpatialInteractionTab';
import { ProceduralMotionTab } from './components/tabs/ProceduralMotionTab';
import { SkillsCatalogTab } from './components/tabs/SkillsCatalogTab';
import { FrameInspectorTab } from './components/tabs/FrameInspectorTab';
import { BoneHierarchyTab } from './components/tabs/BoneHierarchyTab';
import { MethodologyTab } from './components/tabs/MethodologyTab';

export function App() {
  const [activeAnimationMode, setActiveAnimationMode] = useState<
    'basketball' | 'stroll-kick' | 'phantom' | 'teleport' | 'sneeze' | 'superhero' | 'bounce' | 'speed-strength'
  >('basketball');

  const [globalFps, setGlobalFps] = useState<12 | 24>(24);

  const [basketballConfig, setBasketballConfig] = useState<BasketballGeneratorConfig>({
    projectName: 'basketball_walk_pickup_dribble',
    targetFps: 24,
    charColorHex: '#0F172A',
    ballColorHex: '#EA580C',
    ballRadius: 18,
    groundY: 755.0,
  });

  const [strollKickConfig, setStrollKickConfig] = useState<SitWalkKickGeneratorConfig>({
    projectName: 'sit_stand_kick',
    targetFps: 24,
    manColorHex: '#1E293B',
    ballColorHex: '#EA580C',
    ballRadius: 18,
    enableHitStop: true,
  });

  const [phantomConfig, setPhantomConfig] = useState<PhantomShadowboxGeneratorConfig>({
    projectName: 'phantom_shadowbox',
    targetFps: 12,
    interpolate24FpsFrames: false,
    primaryColorHex: '#0F172A',
    headColorHex: '#0284C7',
    stillnessHoldFrames: 12,
    crouchHoldFrames: 6,
    jabExtensionSnap: 1.0,
  });

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

  const [speedStrengthConfig, setSpeedStrengthConfig] = useState<SpeedVsStrengthGeneratorConfig>({
    projectName: 'speed_vs_strength',
    targetFps: 12,
    interpolate24FpsFrames: false,
    speedColorHex: '#F59E0B',
    strengthColorHex: '#1E293B',
    cameraDynamicTrack: true,
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
    primaryApexHeight: 260,
    secondaryApexHeight: 176,
    groundY: 920,
    centerX: 960,
    enableSquashStretch: true,
    squashIntensity: 1.0,
    ballColorHex: '#0284C7',
  });

  const handleSelectFps = (fps: 12 | 24) => {
    setGlobalFps(fps);
    setBasketballConfig((c) => ({ ...c, targetFps: fps }));
    setStrollKickConfig((c) => ({ ...c, targetFps: fps }));
    setPhantomConfig((c) => ({ ...c, targetFps: fps }));
    setTeleportConfig((c) => ({ ...c, targetFps: fps }));
    setSpeedStrengthConfig((c) => ({ ...c, targetFps: fps }));
    setSneezeConfig((c) => ({ ...c, targetFps: fps }));
    setHeroConfig((c) => ({ ...c, targetFps: fps }));
    setBounceConfig((c) => ({ ...c, targetFps: fps }));
  };

  const [baseTemplate22, setBaseTemplate22] = useState<Uint8Array | null>(null);
  const [baseTemplate27, setBaseTemplate27] = useState<Uint8Array | null>(null);
  const [activeInspection, setActiveInspection] = useState<StkndsInspectionResult | null>(null);
  const [selectedPresetPath, setSelectedPresetPath] = useState<string>(
    '/downloads/basketball_walk_pickup_dribble_24f.stknds'
  );
  const [inspectLoading, setInspectLoading] = useState<boolean>(true);
  const [inspectError, setInspectError] = useState<string | null>(null);
  const [binaryStageOverride, setBinaryStageOverride] = useState<boolean>(false);
  const inspectorCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showOnionSkin, setShowOnionSkin] = useState<boolean>(true);
  const [showTrajectoryArc, setShowTrajectoryArc] = useState<boolean>(true);
  const [showKinematicsCoM, setShowKinematicsCoM] = useState<boolean>(true);
  const [vcamFollow, setVcamFollow] = useState<boolean>(true);
  const [activeDocTab, setActiveDocTab] = useState<
    'kinematics-ik' | 'full-body-reactivity' | 'procedural-kinematics' | 'spatial-interaction' | 'procedural-motion' | 'hierarchy' | 'research' | 'skills' | 'frames' | 'bone-hierarchy' | 'methodology'
  >('kinematics-ik');

  const [selectedSkillCategory, setSelectedSkillCategory] = useState<string>('ALL');
  const [skillSearchQuery, setSkillSearchQuery] = useState<string>('');
  const [synthesizing, setSynthesizing] = useState<boolean>(false);

  const [spatialDebugMode, setSpatialDebugMode] = useState<boolean>(true);
  const [spatialShowAnchors, setSpatialShowAnchors] = useState<boolean>(true);
  const [spatialShowCameraFrame, setSpatialShowCameraFrame] = useState<boolean>(true);
  const [spatialTargetClashFrame, setSpatialTargetClashFrame] = useState<number>(24);
  const [spatialAttackerX, setSpatialAttackerX] = useState<number>(205);
  const [spatialAttackerElevation, setSpatialAttackerElevation] = useState<'GROUND' | 'AIR' | 'PLATFORM'>('GROUND');
  const [spatialDefenderX, setSpatialDefenderX] = useState<number>(440);
  const [spatialDefenderElevation, setSpatialDefenderElevation] = useState<'SEATED' | 'STANDING' | 'PLATFORM'>('SEATED');
  const [spatialAttackType, setSpatialAttackType] = useState<'ROUNDHOUSE' | 'PUNCH' | 'LOW_SWEEP'>('ROUNDHOUSE');
  const [spatialAutoSolveReach, setSpatialAutoSolveReach] = useState<boolean>(true);
  const [spatialPlatformHeight, setSpatialPlatformHeight] = useState<number>(140);
  const [spatialShowHitboxRing, setSpatialShowHitboxRing] = useState<boolean>(true);

  const [ikLimbType, setIkLimbType] = useState<'LEG' | 'ARM'>('LEG');
  const [ikFacingRight, setIkFacingRight] = useState<boolean>(true);
  const [ikTargetFootX, setIkTargetFootX] = useState<number>(310);
  const [ikTargetFootY, setIkTargetFootY] = useState<number>(755);
  const [ikTargetHandX, setIkTargetHandX] = useState<number>(370);
  const [ikTargetHandY, setIkTargetHandY] = useState<number>(440);
  const [ikFootPlanted, setIkFootPlanted] = useState<boolean>(true);

  const [gaitProgress, setGaitProgress] = useState<number>(0.25);
  const [gaitStrideLength, setGaitStrideLength] = useState<number>(140);
  const [gaitStepHeight, setGaitStepHeight] = useState<number>(36);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadTemplates() {
      try {
        const [res22, res27] = await Promise.all([
          fetch('/templates/project6.stknds'),
          fetch('/templates/rpoject5.stknds'),
        ]);

        if (res22.ok) {
          const ab22 = await res22.arrayBuffer();
          if (!cancelled) setBaseTemplate22(new Uint8Array(ab22));
        }
        if (res27.ok) {
          const ab27 = await res27.arrayBuffer();
          if (!cancelled) setBaseTemplate27(new Uint8Array(ab27));
        }
      } catch (err) {
        console.warn('Could not load base templates:', err);
      }
    }

    loadTemplates();
    return () => {
      cancelled = true;
    };
  }, []);

  const syncAnimationModeFromPath = useCallback((pathOrName: string) => {
    const lower = pathOrName.toLowerCase();
    if (lower.includes('basketball')) {
      setActiveAnimationMode('basketball');
    } else if (lower.includes('sit_stand') || lower.includes('stroll')) {
      setActiveAnimationMode('stroll-kick');
    } else if (lower.includes('phantom')) {
      setActiveAnimationMode('phantom');
    } else if (lower.includes('speed_vs_strength')) {
      setActiveAnimationMode('speed-strength');
    } else if (lower.includes('teleport')) {
      setActiveAnimationMode('teleport');
    } else if (lower.includes('sneeze')) {
      setActiveAnimationMode('sneeze');
    } else if (lower.includes('superhero') || lower.includes('fly')) {
      setActiveAnimationMode('superhero');
    } else if (lower.includes('bounce') || lower.includes('project6')) {
      setActiveAnimationMode('bounce');
    }
  }, []);

  const inspectPreset = useCallback(async (path: string, displayName: string) => {
    setInspectLoading(true);
    setInspectError(null);
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error('HTTP error! status: ' + res.status);
      const ab = await res.arrayBuffer();
      const report = await inspectStkndsBuffer(displayName, ab);
      setActiveInspection(report);
    } catch (err: any) {
      setInspectError(err.message || 'Failed to parse .stknds binary.');
    } finally {
      setInspectLoading(false);
    }
  }, []);

  useEffect(() => {
    inspectPreset(selectedPresetPath, selectedPresetPath.split('/').pop() || 'preset.stknds');
  }, [selectedPresetPath, inspectPreset]);

  const basketballFrames = useMemo(
    () => buildCanonicalBasketballFrames(basketballConfig),
    [basketballConfig]
  );

  const basketballAudit = useMemo(
    () => validateBasketballBiomechanics(basketballFrames),
    [basketballFrames]
  );

  const strollKickFrames = useMemo(
    () => buildAdjustedSitWalkKickFrames(strollKickConfig),
    [strollKickConfig]
  );

  const strollKickAudit = useMemo(
    () => validateSitWalkKickBiomechanics(strollKickFrames),
    [strollKickFrames]
  );

  const phantomFrames = useMemo(
    () => buildAdjustedPhantomFrames(phantomConfig),
    [phantomConfig]
  );

  const teleportFrames = useMemo(
    () => buildAdjustedTeleportFrames(teleportConfig),
    [teleportConfig]
  );

  const speedStrengthFrames = useMemo(
    () => buildAdjustedSpeedStrengthFrames(speedStrengthConfig),
    [speedStrengthConfig]
  );

  const sneezeFrames = useMemo(
    () => buildAdjustedSneezeFrames(sneezeConfig),
    [sneezeConfig]
  );

  const superheroFrames = useMemo(
    () => buildAdjustedSuperheroFrames(heroConfig),
    [heroConfig]
  );

  const liveBiomechanicsAudit = useMemo(
    () =>
      activeAnimationMode === 'teleport'
        ? evaluateTeleportAmbushQuality(teleportFrames)
        : evaluateSpeedVsStrengthQuality(speedStrengthFrames),
    [activeAnimationMode, teleportFrames, speedStrengthFrames]
  );

  const liveSpatialAudit = useMemo(
    () => validateMultiCharacterSpatialConsistency(teleportFrames),
    [teleportFrames]
  );

  const computedBounceFrames = useMemo(() => {
    return Array.from({ length: 22 }, (_, idx) => ({ frame: idx }));
  }, []);

  const totalModeFrames =
    activeAnimationMode === 'basketball'
      ? basketballFrames.length
      : activeAnimationMode === 'stroll-kick'
      ? strollKickFrames.length
      : activeAnimationMode === 'phantom'
      ? phantomFrames.length
      : activeAnimationMode === 'speed-strength'
      ? speedStrengthFrames.length
      : activeAnimationMode === 'teleport'
      ? teleportFrames.length
      : activeAnimationMode === 'sneeze'
      ? sneezeFrames.length
      : activeAnimationMode === 'superhero'
      ? superheroFrames.length
      : 22;

  const effectivePlaybackFps = globalFps;

  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = 1000 / effectivePlaybackFps;
    const timer = setInterval(() => {
      setCurrentFrame((f) => (f + 1) % totalModeFrames);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, totalModeFrames, effectivePlaybackFps]);

  const handleSynthesizeAndDownload = async () => {
    if (synthesizing) return;
    setSynthesizing(true);
    try {
      let bytes: Uint8Array | null = null;
      let filename = 'animation.stknds';

      if (activeAnimationMode === 'basketball') {
        if (!baseTemplate27) return;
        filename = `${basketballConfig.projectName}_${globalFps}f.stknds`;
        bytes = await synthesizeBasketballStknds(baseTemplate27, basketballConfig);
      } else if (activeAnimationMode === 'stroll-kick') {
        if (!baseTemplate22) return;
        filename = `${strollKickConfig.projectName}_${globalFps}fps_${strollKickFrames.length}f.stknds`;
        bytes = await synthesizeSitWalkKickStknds(baseTemplate22, strollKickConfig);
      } else if (activeAnimationMode === 'phantom') {
        if (!baseTemplate22) return;
        filename = `${phantomConfig.projectName}_${globalFps}fps_${phantomFrames.length}f.stknds`;
        bytes = await synthesizePhantomShadowboxStknds(baseTemplate22, phantomConfig);
      } else if (activeAnimationMode === 'speed-strength') {
        if (!baseTemplate27) return;
        filename = `${speedStrengthConfig.projectName}_${globalFps}fps.stknds`;
        bytes = await synthesizeSpeedStrengthStknds(baseTemplate27, speedStrengthConfig);
      } else if (activeAnimationMode === 'teleport') {
        if (!baseTemplate27) return;
        filename = `${teleportConfig.projectName}_${globalFps}fps.stknds`;
        bytes = await synthesizeTeleportStknds(baseTemplate27, teleportConfig);
      } else if (activeAnimationMode === 'sneeze') {
        if (!baseTemplate27) return;
        filename = `${sneezeConfig.projectName}_${globalFps}fps.stknds`;
        bytes = await synthesizeSneezeStknds(baseTemplate27, sneezeConfig);
      } else if (activeAnimationMode === 'superhero') {
        if (!baseTemplate27) return;
        filename = `${heroConfig.projectName}_${globalFps}fps.stknds`;
        bytes = await synthesizeSuperheroStknds(baseTemplate27, heroConfig);
      } else if (activeAnimationMode === 'bounce') {
        if (!baseTemplate22) return;
        filename = `${bounceConfig.projectName}_${globalFps}fps.stknds`;
        bytes = await synthesizeBounceStknds(baseTemplate22, bounceConfig);
      }

      if (bytes) {
        const blob = new Blob([bytes.buffer], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Download synthesis error:', err);
    } finally {
      setSynthesizing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const ab = await file.arrayBuffer();
      const report = await inspectStkndsBuffer(file.name, ab);
      setActiveInspection(report);
      setSelectedPresetPath(file.name);
      syncAnimationModeFromPath(file.name);
    } catch (err: any) {
      setInspectError(err.message || 'Failed to parse file.');
    }
  };

  const safeBasketballFrame =
    basketballFrames[currentFrame % basketballFrames.length] || basketballFrames[0];
  const safeStrollKickFrame =
    strollKickFrames[currentFrame % strollKickFrames.length] || strollKickFrames[0];
  const safePhantomFrame = phantomFrames[currentFrame % phantomFrames.length];
  const safeTeleportFrame = teleportFrames[currentFrame % teleportFrames.length];
  const safeSpeedStrengthFrame = speedStrengthFrames[currentFrame % speedStrengthFrames.length];
  const [selectedBoneFigure, setSelectedBoneFigure] = useState<'red' | 'blue'>('red');

  const activeStickfigureFrames =
    activeAnimationMode === 'sneeze'
      ? sneezeFrames
      : superheroFrames;

  const safeHeroFrame =
    activeStickfigureFrames[currentFrame % activeStickfigureFrames.length] ||
    activeStickfigureFrames[0];

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
      computeForwardKinematics(
        safeTeleportFrame.blueX,
        safeTeleportFrame.blueY,
        safeTeleportFrame.blueAngles,
        0.5
      ),
    [safeTeleportFrame]
  );

  const safeHeroJoints =
    activeAnimationMode === 'teleport'
      ? selectedBoneFigure === 'red'
        ? safeTeleportRedJoints
        : safeTeleportBlueJoints
      : activeAnimationMode === 'basketball'
      ? computeForwardKinematics(
          safeBasketballFrame.charX,
          safeBasketballFrame.charY,
          safeBasketballFrame.angles,
          0.5
        )
      : activeAnimationMode === 'stroll-kick'
      ? computeForwardKinematics(
          safeStrollKickFrame.manX,
          safeStrollKickFrame.manY,
          safeStrollKickFrame.manAngles,
          0.5
        )
      : activeAnimationMode === 'phantom'
      ? computeForwardKinematics(
          safePhantomFrame.isTeleportBlank ? 640 : safePhantomFrame.sceneX,
          safePhantomFrame.isTeleportBlank ? 515 : safePhantomFrame.sceneY,
          safePhantomFrame.worldAngles,
          0.5
        )
      : activeAnimationMode === 'speed-strength'
      ? selectedBoneFigure === 'red'
        ? computeForwardKinematics(
            safeSpeedStrengthFrame.charAX,
            safeSpeedStrengthFrame.charAY,
            safeSpeedStrengthFrame.charAAngles,
            0.5
          )
        : computeForwardKinematics(
            safeSpeedStrengthFrame.charBX,
            safeSpeedStrengthFrame.charBY,
            safeSpeedStrengthFrame.charBAngles,
            0.5
          )
      : activeAnimationMode !== 'bounce'
      ? computeForwardKinematics(
          safeHeroFrame.sceneX,
          safeHeroFrame.sceneY,
          safeHeroFrame.worldAngles,
          0.5
        )
      : [];

  const safeBounceFrame = computedBounceFrames[currentFrame % 22];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased selection:bg-[#0284C7] selection:text-white pb-16">
      {/* Top Navigation & App Header */}
      <header className="border-b border-[#E2E8F0] bg-white sticky top-0 z-40 shadow-xs">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0F172A] flex items-center justify-center text-white font-mono text-sm font-bold shadow-sm">
              SN
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-base text-[#0F172A] tracking-tight">
                  Stick Nodes Animation Forge
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E0F2FE] text-[#0369A1]">
                  v334 GZIP BINARY
                </span>
              </div>
              <p className="text-xs text-[#64748B] hidden sm:block">
                Physics-Aware Articulated Body Engine, 2-Bone IK &amp; Biomechanical Audit Suite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Persistent Global FPS Switcher */}
            <div className="flex items-center bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => handleSelectFps(12)}
                className={`px-3 py-1 text-xs font-mono font-semibold rounded-md transition-all ${
                  globalFps === 12
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                12 FPS
              </button>
              <button
                type="button"
                onClick={() => handleSelectFps(24)}
                className={`px-3 py-1 text-xs font-mono font-semibold rounded-md transition-all ${
                  globalFps === 24
                    ? 'bg-[#0284C7] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                24 FPS (Sky Flight Engine)
              </button>
            </div>

            <button
              type="button"
              disabled={synthesizing}
              onClick={handleSynthesizeAndDownload}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F172A] text-white text-xs font-semibold hover:bg-[#1E293B] transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Export Current (.stknds)</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1360px] mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Main Stage & Stage Controls */}
        <section className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-5 shadow-xs">
          <ModeControlsPanel
            activeAnimationMode={activeAnimationMode}
            setActiveAnimationMode={setActiveAnimationMode}
            binaryStageOverride={binaryStageOverride}
            setBinaryStageOverride={setBinaryStageOverride}
            setCurrentFrame={setCurrentFrame}
            setIsPlaying={setIsPlaying}
            basketballConfig={basketballConfig}
            setBasketballConfig={setBasketballConfig}
            strollKickConfig={strollKickConfig}
            setStrollKickConfig={setStrollKickConfig}
            phantomConfig={phantomConfig}
            setPhantomConfig={setPhantomConfig}
            teleportConfig={teleportConfig}
            setTeleportConfig={setTeleportConfig}
            speedStrengthConfig={speedStrengthConfig}
            setSpeedStrengthConfig={setSpeedStrengthConfig}
            sneezeConfig={sneezeConfig}
            setSneezeConfig={setSneezeConfig}
            heroConfig={heroConfig}
            setHeroConfig={setHeroConfig}
            bounceConfig={bounceConfig}
            setBounceConfig={setBounceConfig}
            currentFrame={currentFrame}
            totalModeFrames={totalModeFrames}
            vcamFollow={vcamFollow}
            setVcamFollow={setVcamFollow}
            safeBasketballFrame={safeBasketballFrame}
            safeStrollKickFrame={safeStrollKickFrame}
            safePhantomFrame={safePhantomFrame}
            safeTeleportFrame={safeTeleportFrame}
            safeSpeedStrengthFrame={safeSpeedStrengthFrame}
            safeHeroFrame={safeHeroFrame}
            safeBounceFrame={safeBounceFrame}
            setSelectedPresetPath={setSelectedPresetPath}
            strollKickFrames={strollKickFrames}
          />

          {/* Canvas Rendering Stage */}
          <div className="relative rounded-xl overflow-hidden shadow-inner border border-[#1E293B] bg-[#090D16]">
            <AppCanvas
              canvasRef={canvasRef}
              activeAnimationMode={activeAnimationMode}
              currentFrame={currentFrame}
              showOnionSkin={showOnionSkin}
              showTrajectoryArc={showTrajectoryArc}
              showKinematicsCoM={showKinematicsCoM}
              vcamFollow={vcamFollow}
              globalFps={globalFps}
              basketballConfig={basketballConfig}
              strollKickConfig={strollKickConfig}
              phantomConfig={phantomConfig}
              teleportConfig={teleportConfig}
              speedStrengthConfig={speedStrengthConfig}
              sneezeConfig={sneezeConfig}
              heroConfig={heroConfig}
              bounceConfig={bounceConfig}
              basketballFrames={basketballFrames}
              strollKickFrames={strollKickFrames}
              phantomFrames={phantomFrames}
              teleportFrames={teleportFrames}
              speedStrengthFrames={speedStrengthFrames}
              sneezeFrames={sneezeFrames}
              superheroFrames={superheroFrames}
              computedBounceFrames={computedBounceFrames}
              safeBasketballFrame={safeBasketballFrame}
              safeStrollKickFrame={safeStrollKickFrame}
              safePhantomFrame={safePhantomFrame}
              safeTeleportFrame={safeTeleportFrame}
              safeSpeedStrengthFrame={safeSpeedStrengthFrame}
              safeHeroFrame={safeHeroFrame}
              safeBounceFrame={safeBounceFrame}
              binaryStageOverride={binaryStageOverride}
              activeInspection={activeInspection}
            />
          </div>

          {/* Playback & Frame Scrubber Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#0F172A] text-white rounded-lg hover:bg-[#1E293B] transition-colors whitespace-nowrap cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <span className="text-xs font-mono font-medium text-[#475569] bg-[#F1F5F9] px-2.5 py-2 rounded-lg border border-[#E2E8F0]">
                Frame {currentFrame.toString().padStart(2, '0')} / {(totalModeFrames - 1).toString().padStart(2, '0')}
              </span>
            </div>

            <div className="flex-1 max-w-xl mx-2">
              <input
                type="range"
                min={0}
                max={totalModeFrames - 1}
                value={currentFrame % totalModeFrames}
                onChange={(e) => {
                  setIsPlaying(false);
                  setCurrentFrame(Number(e.target.value));
                }}
                className="w-full accent-[#0284C7] cursor-pointer"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#475569]">
              <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F1F5F9] rounded-lg border border-[#E2E8F0] cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnionSkin}
                  onChange={(e) => setShowOnionSkin(e.target.checked)}
                  className="rounded text-[#0284C7] focus:ring-0"
                />
                <Layers className="w-3.5 h-3.5 text-[#0284C7]" />
                Onion Skin
              </label>
              <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F1F5F9] rounded-lg border border-[#E2E8F0] cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTrajectoryArc}
                  onChange={(e) => setShowTrajectoryArc(e.target.checked)}
                  className="rounded text-[#0284C7] focus:ring-0"
                />
                <Compass className="w-3.5 h-3.5 text-[#EA580C]" />
                Trajectory
              </label>
              <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F1F5F9] rounded-lg border border-[#E2E8F0] cursor-pointer">
                <input
                  type="checkbox"
                  checked={showKinematicsCoM}
                  onChange={(e) => setShowKinematicsCoM(e.target.checked)}
                  className="rounded text-[#0284C7] focus:ring-0"
                />
                <Activity className="w-3.5 h-3.5 text-[#059669]" />
                COM &amp; Ground
              </label>
            </div>
          </div>
        </section>

        {/* Audit Metrics Dashboard */}
        <AuditMetricsPanel
          activeAnimationMode={activeAnimationMode}
          globalFps={globalFps}
          basketballAudit={basketballAudit}
          strollKickAudit={strollKickAudit}
          safeBasketballFrame={safeBasketballFrame}
          safeStrollKickFrame={safeStrollKickFrame}
          safePhantomFrame={safePhantomFrame}
          safeTeleportFrame={safeTeleportFrame}
          safeSpeedStrengthFrame={safeSpeedStrengthFrame}
          safeHeroFrame={safeHeroFrame}
          safeBounceFrame={safeBounceFrame}
          currentFrame={currentFrame}
          totalModeFrames={totalModeFrames}
          sneezeFrames={sneezeFrames}
          superheroFrames={superheroFrames}
          speedStrengthFrames={speedStrengthFrames}
          basketballConfig={basketballConfig}
          setBasketballConfig={setBasketballConfig}
          strollKickConfig={strollKickConfig}
          setStrollKickConfig={setStrollKickConfig}
          phantomConfig={phantomConfig}
          setPhantomConfig={setPhantomConfig}
          speedStrengthConfig={speedStrengthConfig}
          setSpeedStrengthConfig={setSpeedStrengthConfig}
          teleportConfig={teleportConfig}
          setTeleportConfig={setTeleportConfig}
          sneezeConfig={sneezeConfig}
          setSneezeConfig={setSneezeConfig}
          heroConfig={heroConfig}
          setHeroConfig={setHeroConfig}
          bounceConfig={bounceConfig}
          setBounceConfig={setBounceConfig}
          baseTemplate22={baseTemplate22}
          baseTemplate27={baseTemplate27}
          setCurrentFrame={setCurrentFrame}
          synthesizing={synthesizing}
          handleSynthesizeAndDownload={handleSynthesizeAndDownload}
          basketballFrames={basketballFrames}
          strollKickFrames={strollKickFrames}
          phantomFrames={phantomFrames}
          teleportFrames={teleportFrames}
        />

        {/* Tab Navigation & Subviews */}
        <section className="space-y-6">
          <div className="border-b border-[#E2E8F0] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#0284C7]/10 text-[#0284C7]">
                  <Sparkles className="w-3 h-3" />
                  KNOWLEDGE INTEGRATION ENGINE v3.0
                </span>
                <span className="text-xs text-[#64748B] font-mono">
                  5 GitHub Research Repositories · 46 Biomechanical Skills
                </span>
              </div>
              <h2 className="font-display text-2xl font-semibold text-[#0F172A]">
                03. Universal Human Motion Framework &amp; Procedural Kinematics
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-1 p-1 bg-[#E2E8F0]/70 rounded-lg self-start">
              <button
                type="button"
                onClick={() => setActiveDocTab('kinematics-ik')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeDocTab === 'kinematics-ik'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                <Target className="w-3.5 h-3.5 text-[#0284C7]" />
                1. Kinematics &amp; Limb IK
              </button>
              <button
                type="button"
                onClick={() => setActiveDocTab('full-body-reactivity')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeDocTab === 'full-body-reactivity'
                    ? 'bg-white text-[#0F172A] shadow-xs font-semibold'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                Full-Body Reactive Movement Skill
              </button>
              <button
                type="button"
                onClick={() => setActiveDocTab('procedural-kinematics')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeDocTab === 'procedural-kinematics'
                    ? 'bg-white text-[#0F172A] shadow-xs font-semibold'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                2. Procedural Character Kinematics Skill
              </button>
              <button
                type="button"
                onClick={() => setActiveDocTab('spatial-interaction')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeDocTab === 'spatial-interaction'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-[#DC2626]" />
                3. Spatial Consistency &amp; Interaction
              </button>
              <button
                type="button"
                onClick={() => setActiveDocTab('procedural-motion')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeDocTab === 'procedural-motion'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-[#059669]" />
                3. Procedural Locomotion &amp; COM
              </button>
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
                6. 53-Skill Library &amp; QC
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
                7. Act Mechanics
              </button>
              <button
                type="button"
                onClick={() => setActiveDocTab('bone-hierarchy')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeDocTab === 'bone-hierarchy'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                8. Bone Transform Table
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
                9. Binary Spec
              </button>
            </div>
          </div>

          {activeDocTab === 'kinematics-ik' && (
            <KinematicsIkTab
              ikLimbType={ikLimbType}
              setIkLimbType={setIkLimbType}
              ikFacingRight={ikFacingRight}
              setIkFacingRight={setIkFacingRight}
              ikTargetFootX={ikTargetFootX}
              setIkTargetFootX={setIkTargetFootX}
              ikTargetFootY={ikTargetFootY}
              setIkTargetFootY={setIkTargetFootY}
              ikTargetHandX={ikTargetHandX}
              setIkTargetHandX={setIkTargetHandX}
              ikTargetHandY={ikTargetHandY}
              setIkTargetHandY={setIkTargetHandY}
              ikFootPlanted={ikFootPlanted}
              setIkFootPlanted={setIkFootPlanted}
            />
          )}

          {activeDocTab === 'full-body-reactivity' && (
            <FullBodyReactivityTab strollKickAudit={strollKickAudit} />
          )}

          {activeDocTab === 'procedural-kinematics' && (
            <ProceduralKinematicsTab
              safeStrollKickFrame={safeStrollKickFrame}
              currentFrame={currentFrame}
              strollKickFrames={strollKickFrames}
            />
          )}

          {activeDocTab === 'spatial-interaction' && (
            <SpatialInteractionTab
              spatialDebugMode={spatialDebugMode}
              setSpatialDebugMode={setSpatialDebugMode}
              spatialShowAnchors={spatialShowAnchors}
              setSpatialShowAnchors={setSpatialShowAnchors}
              spatialShowCameraFrame={spatialShowCameraFrame}
              setSpatialShowCameraFrame={setSpatialShowCameraFrame}
              spatialShowHitboxRing={spatialShowHitboxRing}
              setSpatialShowHitboxRing={setSpatialShowHitboxRing}
              spatialAutoSolveReach={spatialAutoSolveReach}
              setSpatialAutoSolveReach={setSpatialAutoSolveReach}
              spatialTargetClashFrame={spatialTargetClashFrame}
              setSpatialTargetClashFrame={setSpatialTargetClashFrame}
              spatialAttackerX={spatialAttackerX}
              setSpatialAttackerX={setSpatialAttackerX}
              spatialAttackerElevation={spatialAttackerElevation}
              setSpatialAttackerElevation={setSpatialAttackerElevation}
              spatialDefenderX={spatialDefenderX}
              setSpatialDefenderX={setSpatialDefenderX}
              spatialDefenderElevation={spatialDefenderElevation}
              setSpatialDefenderElevation={setSpatialDefenderElevation}
              spatialAttackType={spatialAttackType}
              setSpatialAttackType={setSpatialAttackType}
              spatialPlatformHeight={spatialPlatformHeight}
              setSpatialPlatformHeight={setSpatialPlatformHeight}
              liveSpatialAudit={liveSpatialAudit}
            />
          )}

          {activeDocTab === 'procedural-motion' && (
            <ProceduralMotionTab
              gaitProgress={gaitProgress}
              setGaitProgress={setGaitProgress}
              gaitStrideLength={gaitStrideLength}
              setGaitStrideLength={setGaitStrideLength}
              gaitStepHeight={gaitStepHeight}
              setGaitStepHeight={setGaitStepHeight}
              ikFacingRight={ikFacingRight}
              setIkFacingRight={setIkFacingRight}
            />
          )}

          {activeDocTab === 'skills' && (
            <SkillsCatalogTab
              liveBiomechanicsAudit={liveBiomechanicsAudit}
              selectedSkillCategory={selectedSkillCategory}
              setSelectedSkillCategory={setSelectedSkillCategory}
              skillSearchQuery={skillSearchQuery}
              setSkillSearchQuery={setSkillSearchQuery}
              synthesizing={synthesizing}
              handleSynthesizeAndDownload={handleSynthesizeAndDownload}
            />
          )}

          {activeDocTab === 'frames' && (
            <FrameInspectorTab
              activeAnimationMode={activeAnimationMode}
              sneezeFrames={sneezeFrames}
              superheroFrames={superheroFrames}
            />
          )}

          {activeDocTab === 'bone-hierarchy' && (
            <BoneHierarchyTab
              currentFrame={currentFrame}
              totalModeFrames={totalModeFrames}
              activeAnimationMode={activeAnimationMode}
              selectedBoneFigure={selectedBoneFigure}
              setSelectedBoneFigure={setSelectedBoneFigure}
              safeTeleportFrame={safeTeleportFrame}
              safeHeroJoints={safeHeroJoints}
            />
          )}

          {activeDocTab === 'methodology' && (
            <MethodologyTab
              activeAnimationMode={activeAnimationMode}
              globalFps={globalFps}
              totalModeFrames={totalModeFrames}
              basketballAudit={basketballAudit}
              strollKickAudit={strollKickAudit}
              basketballFrames={basketballFrames}
              strollKickFrames={strollKickFrames}
              phantomFrames={phantomFrames}
              speedStrengthFrames={speedStrengthFrames}
              teleportFrames={teleportFrames}
              sneezeFrames={sneezeFrames}
              superheroFrames={superheroFrames}
              currentFrame={currentFrame}
              selectedPresetPath={selectedPresetPath}
              setSelectedPresetPath={setSelectedPresetPath}
              syncAnimationModeFromPath={syncAnimationModeFromPath}
              activeInspection={activeInspection}
              inspectLoading={inspectLoading}
              inspectError={inspectError}
              binaryStageOverride={binaryStageOverride}
              setBinaryStageOverride={setBinaryStageOverride}
              handleFileUpload={handleFileUpload}
              setCurrentFrame={setCurrentFrame}
              setIsPlaying={setIsPlaying}
              inspectorCanvasRef={inspectorCanvasRef}
            />
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
