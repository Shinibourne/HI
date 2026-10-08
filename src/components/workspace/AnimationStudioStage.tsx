import React, { useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Layers,
  Compass,
  Activity,
  Camera,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { AppCanvas } from '../canvas/AppCanvas';
import { BASKETBALL_24_TIMELINE } from '../../lib/basketballChoreographyFrames';
import { STROLL_KICK_PANELS } from '../../lib/sitWalkKickBallFrames';
import { STORYBOARD_PANELS } from '../../lib/phantomShadowboxFrames';
import { PARKOUR_STORYBOARD_PANELS } from '../../lib/parkourAcrobatFrames';
import { COMBAT_STORYBOARD_PANELS } from '../../lib/combatFrames';

export interface AnimationStudioStageProps {
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  activeAnimationMode: string;
  currentFrame: number;
  setCurrentFrame: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  totalModeFrames: number;
  showOnionSkin: boolean;
  setShowOnionSkin: React.Dispatch<React.SetStateAction<boolean>>;
  showTrajectoryArc: boolean;
  setShowTrajectoryArc: React.Dispatch<React.SetStateAction<boolean>>;
  showKinematicsCoM: boolean;
  setShowKinematicsCoM: React.Dispatch<React.SetStateAction<boolean>>;
  vcamFollow: boolean;
  setVcamFollow: React.Dispatch<React.SetStateAction<boolean>>;
  globalFps: 12 | 24;
  binaryStageOverride: boolean;
  setBinaryStageOverride: React.Dispatch<React.SetStateAction<boolean>>;
  activeInspection: any;
  combatConfig?: any;
  combatFrames?: any[];
  safeCombatFrame?: any;
  parkourConfig?: any;
  parkourFrames?: any[];
  safeParkourFrame?: any;
  basketballConfig: any;
  strollKickConfig: any;
  phantomConfig: any;
  teleportConfig: any;
  speedStrengthConfig: any;
  sneezeConfig: any;
  heroConfig: any;
  bounceConfig: any;
  basketballFrames: any[];
  strollKickFrames: any[];
  phantomFrames: any[];
  teleportFrames: any[];
  speedStrengthFrames: any[];
  sneezeFrames: any[];
  superheroFrames: any[];
  computedBounceFrames: any[];
  safeBasketballFrame: any;
  safeStrollKickFrame: any;
  safePhantomFrame: any;
  safeTeleportFrame: any;
  safeSpeedStrengthFrame: any;
  safeHeroFrame: any;
  safeBounceFrame: any;
}

export const AnimationStudioStage: React.FC<AnimationStudioStageProps> = ({
  canvasRef,
  activeAnimationMode,
  currentFrame,
  setCurrentFrame,
  isPlaying,
  setIsPlaying,
  totalModeFrames,
  showOnionSkin,
  setShowOnionSkin,
  showTrajectoryArc,
  setShowTrajectoryArc,
  showKinematicsCoM,
  setShowKinematicsCoM,
  vcamFollow,
  setVcamFollow,
  globalFps,
  binaryStageOverride,
  setBinaryStageOverride,
  activeInspection,
  combatConfig,
  combatFrames = [],
  safeCombatFrame,
  parkourConfig,
  parkourFrames = [],
  safeParkourFrame,
  basketballConfig,
  strollKickConfig,
  phantomConfig,
  teleportConfig,
  speedStrengthConfig,
  sneezeConfig,
  heroConfig,
  bounceConfig,
  basketballFrames,
  strollKickFrames,
  phantomFrames,
  teleportFrames,
  speedStrengthFrames,
  sneezeFrames,
  superheroFrames,
  computedBounceFrames,
  safeBasketballFrame,
  safeStrollKickFrame,
  safePhantomFrame,
  safeTeleportFrame,
  safeSpeedStrengthFrame,
  safeHeroFrame,
  safeBounceFrame,
}) => {
  const ribbonScrollRef = useRef<HTMLDivElement | null>(null);
  const stageContainerRef = useRef<HTMLDivElement | null>(null);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setIsPlaying(false);
        setCurrentFrame((f) => (f - 1 + totalModeFrames) % totalModeFrames);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setIsPlaying(false);
        setCurrentFrame((f) => (f + 1) % totalModeFrames);
      } else if (e.code === 'Home') {
        e.preventDefault();
        setCurrentFrame(0);
      } else if (e.key === 'o' || e.key === 'O') {
        setShowOnionSkin((s) => !s);
      } else if (e.key === 't' || e.key === 'T') {
        setShowTrajectoryArc((s) => !s);
      } else if (e.key === 'c' || e.key === 'C') {
        setShowKinematicsCoM((s) => !s);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalModeFrames, setIsPlaying, setCurrentFrame, setShowOnionSkin, setShowTrajectoryArc, setShowKinematicsCoM]);

  // Scroll ribbon helper
  const scrollRibbon = (direction: 'left' | 'right') => {
    if (ribbonScrollRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      ribbonScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    setCurrentFrame((f) => (f - 1 + totalModeFrames) % totalModeFrames);
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setCurrentFrame((f) => (f + 1) % totalModeFrames);
  };

  // Determine active phase/act badge title for stage HUD
  const activePhaseTitle = (() => {
    if (activeAnimationMode === 'parkour' && safeParkourFrame) {
      return `Panel ${safeParkourFrame.panelId}: ${safeParkourFrame.storyboardTitle} · ${safeParkourFrame.phase}`;
    }
    if (activeAnimationMode === 'basketball' && safeBasketballFrame) {
      return `Phase ${safeBasketballFrame.phaseIndex}: ${safeBasketballFrame.phaseName} · ${safeBasketballFrame.ballState}`;
    }
    if (activeAnimationMode === 'stroll-kick' && safeStrollKickFrame) {
      return `Panel ${safeStrollKickFrame.panelId}: ${safeStrollKickFrame.storyboardTitle}`;
    }
    if (activeAnimationMode === 'phantom' && safePhantomFrame) {
      return `Panel ${safePhantomFrame.storyboardPanel}: ${safePhantomFrame.storyboardLabel}`;
    }
    if (activeAnimationMode === 'speed-strength' && safeSpeedStrengthFrame) {
      return `${safeSpeedStrengthFrame.act} · ${safeSpeedStrengthFrame.phase}`;
    }
    if (activeAnimationMode === 'teleport' && safeTeleportFrame) {
      return `${safeTeleportFrame.act} · ${safeTeleportFrame.phase}`;
    }
    if (activeAnimationMode === 'sneeze' && safeHeroFrame) {
      return `${safeHeroFrame.act || 'Sneeze'} · Frame ${currentFrame}`;
    }
    if (activeAnimationMode === 'superhero' && safeHeroFrame) {
      return `${safeHeroFrame.act || 'Flight'} · Frame ${currentFrame}`;
    }
    if (activeAnimationMode === 'bounce') {
      const bf = computedBounceFrames?.[currentFrame % (computedBounceFrames?.length || 22)];
      return bf?.phase ? `${bf.phase} · Frame ${currentFrame}` : `Bounce · Frame ${currentFrame}`;
    }
    return `Frame ${currentFrame}`;
  })();

  const currentTimeSec = (currentFrame / globalFps).toFixed(2);
  const totalDurationSec = (totalModeFrames / globalFps).toFixed(2);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
      {/* Stage HUD Top Bar */}
      <div className="px-3 sm:px-4 py-2 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left: Phase Title & State */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-slate-800 truncate max-w-[220px] sm:max-w-md">
            {activePhaseTitle}
          </span>
          {binaryStageOverride && (
            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded shrink-0">
              RAW GZIP OVERRIDE
            </span>
          )}
        </div>

        {/* Right: Viewport Overlays & Toggles */}
        <div className="flex items-center gap-1 sm:gap-1.5 text-xs text-slate-600">
          {/* Onion Skin */}
          <button
            type="button"
            onClick={() => setShowOnionSkin((v) => !v)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border transition-colors cursor-pointer text-[11px] font-medium ${
              showOnionSkin
                ? 'bg-sky-50 border-sky-300 text-sky-700'
                : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-600'
            }`}
            title="Toggle Ghosting / Onion Skin (Key: O)"
          >
            <Layers className="w-3 h-3 text-sky-600 shrink-0" />
            <span className="hidden sm:inline">Onion Skin</span>
          </button>

          {/* Trajectory */}
          <button
            type="button"
            onClick={() => setShowTrajectoryArc((v) => !v)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border transition-colors cursor-pointer text-[11px] font-medium ${
              showTrajectoryArc
                ? 'bg-orange-50 border-orange-300 text-orange-700'
                : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-600'
            }`}
            title="Toggle Ballistic / Kinematic Trajectory Arcs (Key: T)"
          >
            <Compass className="w-3 h-3 text-orange-600 shrink-0" />
            <span className="hidden sm:inline">Trajectory</span>
          </button>

          {/* CoM & Ground */}
          <button
            type="button"
            onClick={() => setShowKinematicsCoM((v) => !v)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border transition-colors cursor-pointer text-[11px] font-medium ${
              showKinematicsCoM
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-600'
            }`}
            title="Toggle Center of Mass & Ground Projection (Key: C)"
          >
            <Activity className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="hidden sm:inline">CoM &amp; Ground</span>
          </button>

          {/* Dynamic Camera Tracking (for Teleport, SpeedVsStrength, Sneeze, Superhero) */}
          {['teleport', 'speed-strength', 'sneeze', 'superhero'].includes(activeAnimationMode) && (
            <button
              type="button"
              onClick={() => setVcamFollow((v) => !v)}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border transition-colors cursor-pointer text-[11px] font-medium ${
                vcamFollow
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-600'
              }`}
              title="Toggle Virtual Camera Dynamic Tracking vs Wide Master Shot"
            >
              <Camera className="w-3 h-3 text-amber-600 shrink-0" />
              <span className="hidden sm:inline">
                {vcamFollow ? 'Dynamic Camera' : 'Wide Stage'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Canvas Viewport Frame */}
      <div
        ref={stageContainerRef}
        className="relative aspect-video max-h-[min(56vh,620px)] min-h-[220px] sm:min-h-[290px] w-full bg-slate-100 flex items-center justify-center overflow-hidden select-none border-b border-slate-200"
      >
        <AppCanvas
          canvasRef={canvasRef}
          activeAnimationMode={activeAnimationMode}
          currentFrame={currentFrame}
          showOnionSkin={showOnionSkin}
          showTrajectoryArc={showTrajectoryArc}
          showKinematicsCoM={showKinematicsCoM}
          vcamFollow={vcamFollow}
          globalFps={globalFps}
          combatConfig={combatConfig}
          combatFrames={combatFrames}
          safeCombatFrame={safeCombatFrame}
          parkourConfig={parkourConfig}
          parkourFrames={parkourFrames}
          safeParkourFrame={safeParkourFrame}
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

      {/* Playback Transport & Scrubber Bar */}
      <div className="p-3 sm:p-4 bg-white space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Transport Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleStepBackward}
              className="p-2 sm:px-2.5 sm:py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title="Previous Frame (Left Arrow)"
              aria-label="Previous Frame"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs min-w-[76px] justify-center"
              title="Play / Pause (Spacebar)"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              type="button"
              onClick={handleStepForward}
              className="p-2 sm:px-2.5 sm:py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title="Next Frame (Right Arrow)"
              aria-label="Next Frame"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

            {/* Timecode & Frame Indicators */}
            <div className="flex items-center gap-2">
              <span className="font-mono tabular-nums text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-1.5 rounded-lg border border-slate-200">
                Frame {currentFrame.toString().padStart(2, '0')} / {(totalModeFrames - 1).toString().padStart(2, '0')}
              </span>
              <span className="hidden md:inline font-mono tabular-nums text-xs text-slate-500">
                {currentTimeSec}s / {totalDurationSec}s
              </span>
            </div>
          </div>

          {/* Scrubber Range Slider */}
          <div className="flex-1 max-w-xl sm:mx-4">
            <input
              type="range"
              min={0}
              max={totalModeFrames - 1}
              value={currentFrame % totalModeFrames}
              onChange={(e) => {
                setIsPlaying(false);
                setCurrentFrame(Number(e.target.value));
              }}
              className="w-full h-2 accent-sky-600 bg-slate-200 rounded-lg cursor-pointer"
              aria-label="Timeline Scrubber"
            />
          </div>

          {/* Quick Shortcuts Hint on Desktop */}
          <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
            <span>[Space] Play</span>
            <span>·</span>
            <span>[← / →] Step</span>
          </div>
        </div>

        {/* Interactive Storyboard & Keyframe Ribbon */}
        <div className="relative pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between gap-2 pb-1.5 text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5 text-[11px]">
              Choreography Ribbon &amp; Storyboard Steps:
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollRibbon('left')}
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                aria-label="Scroll storyboard left"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => scrollRibbon('right')}
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                aria-label="Scroll storyboard right"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Horizontally scrollable strip */}
          <div
            ref={ribbonScrollRef}
            className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar scroll-smooth"
          >
            {activeAnimationMode === 'combat' &&
              COMBAT_STORYBOARD_PANELS.map((p) => {
                const isActive = (safeCombatFrame?.panelId ?? 1) === p.panelNumber;
                return (
                  <button
                    key={p.panelNumber}
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentFrame(p.startFrame);
                    }}
                    className={`shrink-0 px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-rose-700 border-rose-700 text-white shadow-xs font-semibold'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                    title={`Panel ${p.panelNumber}: ${p.title} (${p.frameRangeStr}) — ${p.actionSummary}`}
                  >
                    <div className="text-[10px] font-mono tabular-nums opacity-75">
                      {p.frameRangeStr}
                    </div>
                    <div className="font-semibold text-[11px] whitespace-nowrap truncate max-w-[140px]">
                      {p.panelNumber}. {p.technique}
                    </div>
                  </button>
                );
              })}

            {activeAnimationMode === 'parkour' &&
              PARKOUR_STORYBOARD_PANELS.map((p) => {
                const isActive = (safeParkourFrame?.panelId ?? 1) === p.panelNumber;
                return (
                  <button
                    key={p.panelNumber}
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentFrame(p.startFrame);
                    }}
                    className={`shrink-0 px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-sky-600 border-sky-600 text-white shadow-xs font-semibold'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                    title={`Panel ${p.panelNumber}: ${p.title} (${p.frameRangeStr}) — ${p.actionSummary}`}
                  >
                    <div className="text-[10px] font-mono tabular-nums opacity-75">
                      {p.frameRangeStr}
                    </div>
                    <div className="font-semibold text-[11px] whitespace-nowrap truncate max-w-[140px]">
                      {p.panelNumber}. {p.title}
                    </div>
                  </button>
                );
              })}

            {activeAnimationMode === 'basketball' &&
              BASKETBALL_24_TIMELINE.map((t: any) => {
                const isActive = (safeBasketballFrame?.frame ?? currentFrame) === t.frame;
                return (
                  <button
                    key={t.frame}
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentFrame(t.frame);
                    }}
                    className={`shrink-0 px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                    title={`Frame ${t.frame} (${t.timeSec.toFixed(2)}s): ${t.phaseLabel} — ${t.biomechanicalAction}`}
                  >
                    <div className="text-[10px] font-mono tabular-nums opacity-75">
                      F{t.frame.toString().padStart(2, '0')} · {t.timeSec.toFixed(2)}s
                    </div>
                    <div className="font-semibold text-[11px] whitespace-nowrap truncate max-w-[130px]">
                      {t.eventName}
                    </div>
                  </button>
                );
              })}

            {activeAnimationMode === 'stroll-kick' &&
              STROLL_KICK_PANELS.map((p: any) => {
                const isActive = (safeStrollKickFrame?.panelId ?? 1) === p.panelNumber;
                return (
                  <button
                    key={p.panelNumber}
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentFrame(p.startFrame);
                    }}
                    className={`shrink-0 px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-sky-700 border-sky-700 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                    title={`Panel ${p.panelNumber}: ${p.title} (${p.frameRangeStr}) — ${p.actionSummary}`}
                  >
                    <div className="text-[10px] font-mono tabular-nums opacity-75">
                      {p.frameRangeStr}
                    </div>
                    <div className="font-semibold text-[11px] whitespace-nowrap truncate max-w-[140px]">
                      {p.panelNumber}. {p.title}
                    </div>
                  </button>
                );
              })}

            {activeAnimationMode === 'phantom' &&
              STORYBOARD_PANELS.map((p: any) => {
                const isActive = (safePhantomFrame?.storyboardPanel ?? 1) === p.panelNumber;
                return (
                  <button
                    key={p.panelNumber}
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentFrame(p.startFrame);
                    }}
                    className={`shrink-0 px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                    title={`Panel ${p.panelNumber}: ${p.title} (${p.frameRangeStr}) — ${p.actionSummary}`}
                  >
                    <div className="text-[10px] font-mono tabular-nums opacity-75">
                      {p.frameRangeStr}
                    </div>
                    <div className="font-semibold text-[11px] whitespace-nowrap truncate max-w-[140px]">
                      {p.panelNumber}. {p.title}
                    </div>
                  </button>
                );
              })}

            {activeAnimationMode === 'speed-strength' &&
              [
                { label: '1. Standoff', frame: 0 },
                {
                  label: '2. A Launches',
                  frame:
                    speedStrengthConfig.targetFps === 24 && speedStrengthConfig.interpolate24FpsFrames
                      ? 10
                      : 5,
                },
                {
                  label: '3. Speed Burst',
                  frame:
                    speedStrengthConfig.targetFps === 24 && speedStrengthConfig.interpolate24FpsFrames
                      ? 18
                      : 9,
                },
                {
                  label: '4. B Reacts',
                  frame:
                    speedStrengthConfig.targetFps === 24 && speedStrengthConfig.interpolate24FpsFrames
                      ? 26
                      : 13,
                },
                {
                  label: '5. Punch & Slip',
                  frame:
                    speedStrengthConfig.targetFps === 24 && speedStrengthConfig.interpolate24FpsFrames
                      ? 34
                      : 17,
                },
                {
                  label: '6. Counter Kick',
                  frame:
                    speedStrengthConfig.targetFps === 24 && speedStrengthConfig.interpolate24FpsFrames
                      ? 42
                      : 21,
                },
                {
                  label: '7. Ballistic Launch',
                  frame:
                    speedStrengthConfig.targetFps === 24 && speedStrengthConfig.interpolate24FpsFrames
                      ? 50
                      : 25,
                },
                {
                  label: '8. Contrast & Settle',
                  frame:
                    speedStrengthConfig.targetFps === 24 && speedStrengthConfig.interpolate24FpsFrames
                      ? 64
                      : 32,
                },
              ].map((jump) => (
                <button
                  key={jump.label}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentFrame(jump.frame);
                  }}
                  className={`shrink-0 px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                    currentFrame === jump.frame
                      ? 'bg-amber-700 border-amber-700 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="text-[10px] font-mono opacity-75">F{jump.frame.toString().padStart(2, '0')}</div>
                  <div className="font-semibold text-[11px] whitespace-nowrap">{jump.label}</div>
                </button>
              ))}

            {activeAnimationMode === 'teleport' &&
              [
                { label: '1. Approach', frame: 0 },
                {
                  label: '2. Close-Up Zoom',
                  frame:
                    teleportConfig.targetFps === 24 && teleportConfig.interpolate24FpsFrames ? 20 : 10,
                },
                {
                  label: '3. Whip Pan Vanish',
                  frame:
                    teleportConfig.targetFps === 24 && teleportConfig.interpolate24FpsFrames ? 30 : 15,
                },
                {
                  label: '4. Teleport Ambush!',
                  frame:
                    teleportConfig.targetFps === 24 && teleportConfig.interpolate24FpsFrames ? 38 : 19,
                },
                {
                  label: '5. Sweeping Kick',
                  frame:
                    teleportConfig.targetFps === 24 && teleportConfig.interpolate24FpsFrames ? 42 : 21,
                },
                {
                  label: '6. Block & Shake',
                  frame:
                    teleportConfig.targetFps === 24 && teleportConfig.interpolate24FpsFrames ? 48 : 24,
                },
                {
                  label: '7. Locked End Scene',
                  frame:
                    teleportConfig.targetFps === 24 && teleportConfig.interpolate24FpsFrames ? 62 : 31,
                },
              ].map((jump) => (
                <button
                  key={jump.label}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentFrame(jump.frame);
                  }}
                  className={`shrink-0 px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                    currentFrame === jump.frame
                      ? 'bg-sky-700 border-sky-700 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="text-[10px] font-mono opacity-75">F{jump.frame.toString().padStart(2, '0')}</div>
                  <div className="font-semibold text-[11px] whitespace-nowrap">{jump.label}</div>
                </button>
              ))}

            {activeAnimationMode === 'sneeze' &&
              [
                { label: '1. Build-Up', frame: 0 },
                { label: '2. Tremble Hold', frame: sneezeConfig.targetFps === 24 ? 12 : 6 },
                { label: '3. The Explosion!', frame: sneezeConfig.targetFps === 24 ? 22 : 11 },
                { label: '4. Backflip', frame: sneezeConfig.targetFps === 24 ? 26 : 13 },
                { label: '5. Floor Crash', frame: sneezeConfig.targetFps === 24 ? 44 : 22 },
                { label: '6. Settle & Twitch', frame: sneezeConfig.targetFps === 24 ? 66 : 33 },
              ].map((jump) => (
                <button
                  key={jump.label}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentFrame(jump.frame);
                  }}
                  className={`shrink-0 px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                    currentFrame === jump.frame
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="text-[10px] font-mono opacity-75">F{jump.frame.toString().padStart(2, '0')}</div>
                  <div className="font-semibold text-[11px] whitespace-nowrap">{jump.label}</div>
                </button>
              ))}

            {activeAnimationMode === 'superhero' &&
              [
                { label: '1. Walk Gait', frame: 0 },
                { label: '2. Scratch Head', frame: heroConfig.targetFps === 24 ? 12 : 6 },
                { label: '3. Zero-G Levitate', frame: heroConfig.targetFps === 24 ? 20 : 10 },
                { label: '4. Sky Cruise', frame: heroConfig.targetFps === 24 ? 28 : 14 },
                { label: '5. Landing', frame: heroConfig.targetFps === 24 ? 44 : 22 },
              ].map((jump) => (
                <button
                  key={jump.label}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentFrame(jump.frame);
                  }}
                  className={`shrink-0 px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                    currentFrame === jump.frame
                      ? 'bg-sky-700 border-sky-700 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="text-[10px] font-mono opacity-75">F{jump.frame.toString().padStart(2, '0')}</div>
                  <div className="font-semibold text-[11px] whitespace-nowrap">{jump.label}</div>
                </button>
              ))}

            {activeAnimationMode === 'bounce' &&
              [0, 5, 11, 16, 21].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentFrame(f);
                  }}
                  className={`shrink-0 px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                    currentFrame === f
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="text-[10px] font-mono opacity-75">Frame {f.toString().padStart(2, '0')}</div>
                  <div className="font-semibold text-[11px] whitespace-nowrap">
                    {f === 0 ? 'Apex' : f === 11 ? 'Impact' : f === 21 ? 'Restitution' : `Keyframe ${f}`}
                  </div>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
