import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Sparkles,
  BookOpen,
  Sliders,
  Layers,
  Activity,
  FileCode2,
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

import { AppHeader } from './components/layout/AppHeader';
import { AnimationStudioStage } from './components/workspace/AnimationStudioStage';
import { StudioInspectorPanel } from './components/panels/StudioInspectorPanel';
import { EngineeringSuite } from './components/workspace/EngineeringSuite';

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

  // Responsive UI state
  const [mobileActiveView, setMobileActiveView] = useState<'stage' | 'inspector' | 'engineering'>('stage');
  const [isInspectorCollapsed, setIsInspectorCollapsed] = useState<boolean>(false);

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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-sky-500 selection:text-white flex flex-col">
      {/* 1. Header (Sticky, 3-zone contract, responsive navigation) */}
      <AppHeader
        activeAnimationMode={activeAnimationMode}
        setActiveAnimationMode={setActiveAnimationMode}
        globalFps={globalFps}
        handleSelectFps={handleSelectFps}
        synthesizing={synthesizing}
        handleSynthesizeAndDownload={handleSynthesizeAndDownload}
        setSelectedPresetPath={setSelectedPresetPath}
        setCurrentFrame={setCurrentFrame}
        setIsPlaying={setIsPlaying}
        setBinaryStageOverride={setBinaryStageOverride}
        mobileActiveView={mobileActiveView}
        setMobileActiveView={setMobileActiveView}
        isInspectorCollapsed={isInspectorCollapsed}
        setIsInspectorCollapsed={setIsInspectorCollapsed}
      />

      {/* Mobile Top Segmented View Selector (shows on mobile < 768px for easy thumb switching) */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-3 py-2">
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setMobileActiveView('stage')}
            className={`flex-1 py-1.5 px-2 rounded-md font-medium text-center transition-colors cursor-pointer text-xs ${
              mobileActiveView === 'stage'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600'
            }`}
          >
            Stage &amp; Playback
          </button>
          <button
            type="button"
            onClick={() => setMobileActiveView('inspector')}
            className={`flex-1 py-1.5 px-2 rounded-md font-medium text-center transition-colors cursor-pointer text-xs ${
              mobileActiveView === 'inspector'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600'
            }`}
          >
            Audit &amp; Telemetry
          </button>
          <button
            type="button"
            onClick={() => setMobileActiveView('engineering')}
            className={`flex-1 py-1.5 px-2 rounded-md font-medium text-center transition-colors cursor-pointer text-xs ${
              mobileActiveView === 'engineering'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600'
            }`}
          >
            Tools (9 Tabs)
          </button>
        </div>
      </div>

      {/* Main Studio Workspace Container */}
      <main className="flex-1 w-full max-w-[1800px] mx-auto px-3 sm:px-5 lg:px-8 py-4 sm:py-6 space-y-6">
        {/* On Mobile: Conditionally render the active tab view */}
        <div className="lg:hidden">
          {mobileActiveView === 'stage' && (
            <AnimationStudioStage
              canvasRef={canvasRef}
              activeAnimationMode={activeAnimationMode}
              currentFrame={currentFrame}
              setCurrentFrame={setCurrentFrame}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              totalModeFrames={totalModeFrames}
              showOnionSkin={showOnionSkin}
              setShowOnionSkin={setShowOnionSkin}
              showTrajectoryArc={showTrajectoryArc}
              setShowTrajectoryArc={setShowTrajectoryArc}
              showKinematicsCoM={showKinematicsCoM}
              setShowKinematicsCoM={setShowKinematicsCoM}
              vcamFollow={vcamFollow}
              setVcamFollow={setVcamFollow}
              globalFps={globalFps}
              binaryStageOverride={binaryStageOverride}
              setBinaryStageOverride={setBinaryStageOverride}
              activeInspection={activeInspection}
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
            />
          )}

          {mobileActiveView === 'inspector' && (
            <StudioInspectorPanel
              activeAnimationMode={activeAnimationMode}
              globalFps={globalFps}
              currentFrame={currentFrame}
              totalModeFrames={totalModeFrames}
              basketballAudit={basketballAudit}
              strollKickAudit={strollKickAudit}
              safeBasketballFrame={safeBasketballFrame}
              safeStrollKickFrame={safeStrollKickFrame}
              safePhantomFrame={safePhantomFrame}
              safeTeleportFrame={safeTeleportFrame}
              safeSpeedStrengthFrame={safeSpeedStrengthFrame}
              safeHeroFrame={safeHeroFrame}
              safeBounceFrame={safeBounceFrame}
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
              synthesizing={synthesizing}
              handleSynthesizeAndDownload={handleSynthesizeAndDownload}
              basketballFrames={basketballFrames}
              strollKickFrames={strollKickFrames}
              phantomFrames={phantomFrames}
              teleportFrames={teleportFrames}
            />
          )}

          {mobileActiveView === 'engineering' && (
            <EngineeringSuite
              activeDocTab={activeDocTab}
              setActiveDocTab={setActiveDocTab}
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
              strollKickAudit={strollKickAudit}
              safeStrollKickFrame={safeStrollKickFrame}
              currentFrame={currentFrame}
              strollKickFrames={strollKickFrames}
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
              gaitProgress={gaitProgress}
              setGaitProgress={setGaitProgress}
              gaitStrideLength={gaitStrideLength}
              setGaitStrideLength={setGaitStrideLength}
              gaitStepHeight={gaitStepHeight}
              setGaitStepHeight={setGaitStepHeight}
              liveBiomechanicsAudit={liveBiomechanicsAudit}
              selectedSkillCategory={selectedSkillCategory}
              setSelectedSkillCategory={setSelectedSkillCategory}
              skillSearchQuery={skillSearchQuery}
              setSkillSearchQuery={setSkillSearchQuery}
              synthesizing={synthesizing}
              handleSynthesizeAndDownload={handleSynthesizeAndDownload}
              activeAnimationMode={activeAnimationMode}
              sneezeFrames={sneezeFrames}
              superheroFrames={superheroFrames}
              totalModeFrames={totalModeFrames}
              selectedBoneFigure={selectedBoneFigure}
              setSelectedBoneFigure={setSelectedBoneFigure}
              safeTeleportFrame={safeTeleportFrame}
              safeHeroJoints={safeHeroJoints}
              globalFps={globalFps}
              basketballAudit={basketballAudit}
              basketballFrames={basketballFrames}
              phantomFrames={phantomFrames}
              speedStrengthFrames={speedStrengthFrames}
              teleportFrames={teleportFrames}
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
        </div>

        {/* On Desktop/Laptop: Side-by-Side Studio Stage & Inspector */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-5 items-start">
          {/* Main Stage Viewport Column */}
          <div
            className={`transition-all duration-200 ${
              isInspectorCollapsed ? 'lg:col-span-12' : 'lg:col-span-8 xl:col-span-8'
            }`}
          >
            <AnimationStudioStage
              canvasRef={canvasRef}
              activeAnimationMode={activeAnimationMode}
              currentFrame={currentFrame}
              setCurrentFrame={setCurrentFrame}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              totalModeFrames={totalModeFrames}
              showOnionSkin={showOnionSkin}
              setShowOnionSkin={setShowOnionSkin}
              showTrajectoryArc={showTrajectoryArc}
              setShowTrajectoryArc={setShowTrajectoryArc}
              showKinematicsCoM={showKinematicsCoM}
              setShowKinematicsCoM={setShowKinematicsCoM}
              vcamFollow={vcamFollow}
              setVcamFollow={setVcamFollow}
              globalFps={globalFps}
              binaryStageOverride={binaryStageOverride}
              setBinaryStageOverride={setBinaryStageOverride}
              activeInspection={activeInspection}
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
            />
          </div>

          {/* Right Inspector Panel Column */}
          {!isInspectorCollapsed && (
            <div className="lg:col-span-4 xl:col-span-4">
              <StudioInspectorPanel
                activeAnimationMode={activeAnimationMode}
                globalFps={globalFps}
                currentFrame={currentFrame}
                totalModeFrames={totalModeFrames}
                basketballAudit={basketballAudit}
                strollKickAudit={strollKickAudit}
                safeBasketballFrame={safeBasketballFrame}
                safeStrollKickFrame={safeStrollKickFrame}
                safePhantomFrame={safePhantomFrame}
                safeTeleportFrame={safeTeleportFrame}
                safeSpeedStrengthFrame={safeSpeedStrengthFrame}
                safeHeroFrame={safeHeroFrame}
                safeBounceFrame={safeBounceFrame}
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
                synthesizing={synthesizing}
                handleSynthesizeAndDownload={handleSynthesizeAndDownload}
                basketballFrames={basketballFrames}
                strollKickFrames={strollKickFrames}
                phantomFrames={phantomFrames}
                teleportFrames={teleportFrames}
              />
            </div>
          )}
        </div>

        {/* Desktop Research & Engineering Suite (Below main studio workspace) */}
        <div className="hidden lg:block pt-2">
          <EngineeringSuite
            activeDocTab={activeDocTab}
            setActiveDocTab={setActiveDocTab}
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
            strollKickAudit={strollKickAudit}
            safeStrollKickFrame={safeStrollKickFrame}
            currentFrame={currentFrame}
            strollKickFrames={strollKickFrames}
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
            gaitProgress={gaitProgress}
            setGaitProgress={setGaitProgress}
            gaitStrideLength={gaitStrideLength}
            setGaitStrideLength={setGaitStrideLength}
            gaitStepHeight={gaitStepHeight}
            setGaitStepHeight={setGaitStepHeight}
            liveBiomechanicsAudit={liveBiomechanicsAudit}
            selectedSkillCategory={selectedSkillCategory}
            setSelectedSkillCategory={setSelectedSkillCategory}
            skillSearchQuery={skillSearchQuery}
            setSkillSearchQuery={setSkillSearchQuery}
            synthesizing={synthesizing}
            handleSynthesizeAndDownload={handleSynthesizeAndDownload}
            activeAnimationMode={activeAnimationMode}
            sneezeFrames={sneezeFrames}
            superheroFrames={superheroFrames}
            totalModeFrames={totalModeFrames}
            selectedBoneFigure={selectedBoneFigure}
            setSelectedBoneFigure={setSelectedBoneFigure}
            safeTeleportFrame={safeTeleportFrame}
            safeHeroJoints={safeHeroJoints}
            globalFps={globalFps}
            basketballAudit={basketballAudit}
            basketballFrames={basketballFrames}
            phantomFrames={phantomFrames}
            speedStrengthFrames={speedStrengthFrames}
            teleportFrames={teleportFrames}
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
        </div>
      </main>

      {/* Modern Studio Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 sm:px-6 py-4 mt-auto">
        <div className="max-w-[1800px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-600" />
            <span>
              Stick Nodes Animation Forge · 12 FPS / 24 FPS Sky-Flight Engine &amp; Binary Corpus
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
            <a
              href="/downloads/walk_scratch_fly_superhero_12fps.stknds"
              download
              className="hover:text-slate-900 transition-colors"
            >
              superhero_12fps.stknds
            </a>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <a
              href="/downloads/walk_scratch_fly_superhero_24fps.stknds"
              download
              className="hover:text-slate-900 transition-colors"
            >
              superhero_24fps.stknds
            </a>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <a
              href="/downloads/basketball_walk_pickup_dribble_24f.stknds"
              download
              className="hover:text-slate-900 transition-colors"
            >
              basketball_24f.stknds
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

