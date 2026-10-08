import React from 'react';
import { Sparkles, Camera, Play, Pause, Zap, Crosshair, Activity } from 'lucide-react';
import { BasketballGeneratorConfig, BasketballKeyframeSpec } from '../../lib/basketballChoreographyFrames';
import { SitWalkKickGeneratorConfig, SitWalkKickKeyframeSpec } from '../../lib/sitWalkKickBallFrames';
import { PhantomShadowboxGeneratorConfig, PhantomShadowboxKeyframeSpec } from '../../lib/phantomShadowboxFrames';
import { SpeedVsStrengthGeneratorConfig, SpeedVsStrengthKeyframeSpec } from '../../lib/speedVsStrengthFrames';
import { TeleportAmbushGeneratorConfig, EpicSneezeGeneratorConfig, SuperheroGeneratorConfig, BounceGeneratorConfig, StickfigureKeyframeSpec, TeleportAmbushKeyframeSpec } from '../../lib/stknds/stkndsCore';
import { BASKETBALL_24_TIMELINE } from '../../lib/basketballChoreographyFrames';
import { STROLL_KICK_PANELS } from '../../lib/sitWalkKickBallFrames';
import { STORYBOARD_PANELS } from '../../lib/phantomShadowboxFrames';

export interface ModeControlsPanelProps {
  activeAnimationMode: string;
  setActiveAnimationMode: (m: any) => void;
  binaryStageOverride: boolean;
  setBinaryStageOverride: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentFrame: React.Dispatch<React.SetStateAction<number>>;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  basketballConfig: BasketballGeneratorConfig;
  setBasketballConfig: React.Dispatch<React.SetStateAction<BasketballGeneratorConfig>>;
  strollKickConfig: SitWalkKickGeneratorConfig;
  setStrollKickConfig: React.Dispatch<React.SetStateAction<SitWalkKickGeneratorConfig>>;
  phantomConfig: PhantomShadowboxGeneratorConfig;
  setPhantomConfig: React.Dispatch<React.SetStateAction<PhantomShadowboxGeneratorConfig>>;
  teleportConfig: TeleportAmbushGeneratorConfig;
  setTeleportConfig: React.Dispatch<React.SetStateAction<TeleportAmbushGeneratorConfig>>;
  speedStrengthConfig: SpeedVsStrengthGeneratorConfig;
  setSpeedStrengthConfig: React.Dispatch<React.SetStateAction<SpeedVsStrengthGeneratorConfig>>;
  sneezeConfig: EpicSneezeGeneratorConfig;
  setSneezeConfig: React.Dispatch<React.SetStateAction<EpicSneezeGeneratorConfig>>;
  heroConfig: SuperheroGeneratorConfig;
  setHeroConfig: React.Dispatch<React.SetStateAction<SuperheroGeneratorConfig>>;
  bounceConfig: BounceGeneratorConfig;
  setBounceConfig: React.Dispatch<React.SetStateAction<BounceGeneratorConfig>>;
  currentFrame: number;
  totalModeFrames: number;
  vcamFollow: boolean;
  setVcamFollow: React.Dispatch<React.SetStateAction<boolean>>;
  safeBasketballFrame: BasketballKeyframeSpec;
  safeStrollKickFrame: SitWalkKickKeyframeSpec;
  safePhantomFrame: PhantomShadowboxKeyframeSpec;
  safeTeleportFrame: TeleportAmbushKeyframeSpec;
  safeSpeedStrengthFrame: SpeedVsStrengthKeyframeSpec;
  safeHeroFrame: StickfigureKeyframeSpec;
  safeBounceFrame: any;
  setSelectedPresetPath: (path: string) => void;
  strollKickFrames: SitWalkKickKeyframeSpec[];
}

export const ModeControlsPanel: React.FC<ModeControlsPanelProps> = ({
  activeAnimationMode,
  setActiveAnimationMode,
  binaryStageOverride,
  setBinaryStageOverride,
  setCurrentFrame,
  setIsPlaying,
  basketballConfig,
  setBasketballConfig,
  strollKickConfig,
  setStrollKickConfig,
  phantomConfig,
  setPhantomConfig,
  teleportConfig,
  setTeleportConfig,
  speedStrengthConfig,
  setSpeedStrengthConfig,
  sneezeConfig,
  setSneezeConfig,
  heroConfig,
  setHeroConfig,
  bounceConfig,
  setBounceConfig,
  currentFrame,
  totalModeFrames,
  vcamFollow,
  setVcamFollow,
  safeBasketballFrame,
  safeStrollKickFrame,
  safePhantomFrame,
  safeTeleportFrame,
  safeSpeedStrengthFrame,
  safeHeroFrame,
  safeBounceFrame,
  setSelectedPresetPath,
  strollKickFrames,
}) => {
  return (
    <div className="space-y-3.5">
      {/* Animation Mode Switcher */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 rounded-xl overflow-x-auto scrollbar-none border border-slate-200/70">
        <button
          type="button"
          onClick={() => {
            setBinaryStageOverride(false);
            setActiveAnimationMode('basketball');
            setSelectedPresetPath('/downloads/basketball_walk_pickup_dribble_24f.stknds');
            setCurrentFrame(0);
            setIsPlaying(true);
          }}
          className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            !binaryStageOverride && activeAnimationMode === 'basketball'
              ? 'bg-[#EA580C] text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          🏀 Basketball (24f)
        </button>
        <button
          type="button"
          onClick={() => {
            setBinaryStageOverride(false);
            setActiveAnimationMode('stroll-kick');
            setSelectedPresetPath('/downloads/sit_stand_kick_24fps_216f.stknds');
            setCurrentFrame(0);
            setIsPlaying(true);
          }}
          className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            !binaryStageOverride && activeAnimationMode === 'stroll-kick'
              ? 'bg-[#0284C7] text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          🚶 Stroll &amp; Kick (216f)
        </button>
        <button
          type="button"
          onClick={() => {
            setBinaryStageOverride(false);
            setActiveAnimationMode('phantom');
            setSelectedPresetPath('/downloads/phantom_shadowbox_24fps_75f.stknds');
            setCurrentFrame(0);
            setIsPlaying(true);
          }}
          className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            !binaryStageOverride && activeAnimationMode === 'phantom'
              ? 'bg-slate-900 text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          🥊 Phantom (75f)
        </button>
        <button
          type="button"
          onClick={() => {
            setBinaryStageOverride(false);
            setActiveAnimationMode('speed-strength');
            setSelectedPresetPath('/downloads/speed_vs_strength_24fps.stknds');
            setVcamFollow(true);
            setCurrentFrame(0);
            setIsPlaying(true);
          }}
          className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            !binaryStageOverride && activeAnimationMode === 'speed-strength'
              ? 'bg-amber-600 text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          ⚡ Speed vs Strength (36f)
        </button>
        <button
          type="button"
          onClick={() => {
            setBinaryStageOverride(false);
            setActiveAnimationMode('teleport');
            setSelectedPresetPath('/downloads/teleport_ambush_24fps.stknds');
            setVcamFollow(true);
            setCurrentFrame(0);
            setIsPlaying(true);
          }}
          className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            !binaryStageOverride && activeAnimationMode === 'teleport'
              ? 'bg-blue-600 text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          🌀 Teleport Ambush (36f)
        </button>
        <button
          type="button"
          onClick={() => {
            setBinaryStageOverride(false);
            setActiveAnimationMode('sneeze');
            setSelectedPresetPath('/downloads/epic_sneeze_24fps.stknds');
            setCurrentFrame(0);
            setIsPlaying(true);
          }}
          className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            !binaryStageOverride && activeAnimationMode === 'sneeze'
              ? 'bg-emerald-600 text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          🤧 Epic Sneeze (36f)
        </button>
        <button
          type="button"
          onClick={() => {
            setBinaryStageOverride(false);
            setActiveAnimationMode('superhero');
            setSelectedPresetPath('/downloads/walk_scratch_fly_superhero_24fps.stknds');
            setCurrentFrame(0);
            setIsPlaying(true);
          }}
          className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            !binaryStageOverride && activeAnimationMode === 'superhero'
              ? 'bg-indigo-600 text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          🦸 Sky Flight (12f)
        </button>
        <button
          type="button"
          onClick={() => {
            setBinaryStageOverride(false);
            setActiveAnimationMode('bounce');
            setSelectedPresetPath('/downloads/ball_bounce_squash_stretch.stknds');
            setCurrentFrame(0);
            setIsPlaying(true);
          }}
          className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            !binaryStageOverride && activeAnimationMode === 'bounce'
              ? 'bg-sky-600 text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          ⚪ Ball Bounce (22f)
        </button>
      </div>

      {activeAnimationMode === 'basketball' && (
        <div className="flex flex-col gap-2 pt-1 border-t border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
              Choreography Timeline (10 Phases · 24 Frames):
            </span>
            <span className="text-[11px] font-mono text-[#EA580C] font-semibold bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
              Phase {safeBasketballFrame.phaseIndex}: {safeBasketballFrame.phaseName} · State: {safeBasketballFrame.ballState}
            </span>
          </div>
          <div className="overflow-x-auto scrollbar-none pb-1">
            <div className="flex sm:grid sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-1.5 min-w-max sm:min-w-0">
              {BASKETBALL_24_TIMELINE.map((t: any) => {
                const isActive = safeBasketballFrame.frame === t.frame;
                return (
                  <button
                    key={t.frame}
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentFrame(t.frame);
                    }}
                    className={`px-2 py-1.5 text-[11px] font-medium rounded-lg transition-all text-left truncate cursor-pointer shrink-0 sm:shrink ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs font-semibold ring-2 ring-[#EA580C]/80'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                    title={`Frame ${t.frame} (${t.timeSec.toFixed(2)}s): ${t.phaseLabel} — ${t.biomechanicalAction}`}
                  >
                    <div className="font-mono text-[9px] opacity-75">F{t.frame < 10 ? '0' + t.frame : t.frame} · {t.timeSec.toFixed(2)}s</div>
                    <div className="truncate font-semibold">{t.eventName}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 16 Visual Storyboard Panels Quick-Jump Controls for The Stroll & Kick */}
      {activeAnimationMode === 'stroll-kick' && (
        <div className="flex flex-col gap-2 pt-1 border-t border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
              Visual Storyboard Panels (16 Panels · {strollKickFrames.length} Frames):
            </span>
            <span className="text-[11px] font-mono text-[#0284C7] font-semibold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              Panel {safeStrollKickFrame.panelId} · {safeStrollKickFrame.storyboardTitle}
            </span>
          </div>
          <div className="overflow-x-auto scrollbar-none pb-1">
            <div className="flex sm:grid sm:grid-cols-4 md:grid-cols-8 gap-1.5 min-w-max sm:min-w-0">
              {STROLL_KICK_PANELS.map((p: any) => {
                const isActive = safeStrollKickFrame.panelId === p.panelNumber;
                return (
                  <button
                    key={p.panelNumber}
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentFrame(p.startFrame);
                    }}
                    className={`px-2 py-1.5 text-[11px] font-medium rounded-lg transition-all text-left truncate cursor-pointer shrink-0 sm:shrink ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs font-semibold ring-2 ring-[#0284C7]/60'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                    title={`Panel ${p.panelNumber}: ${p.title} (${p.frameRangeStr}) — ${p.actionSummary}`}
                  >
                    <div className="font-mono text-[9px] opacity-75">{p.frameRangeStr}</div>
                    <div className="truncate font-semibold">{p.panelNumber}. {p.title}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 10 Visual Storyboard Panels Quick-Jump Controls */}
      {activeAnimationMode === 'phantom' && (
        <div className="flex flex-col gap-2 pt-1 border-t border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
              Visual Storyboard Panels (10 Panels · 75 Frames):
            </span>
            <span className="text-[11px] font-mono text-[#0284C7] font-semibold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              Panel {safePhantomFrame.storyboardPanel} · {safePhantomFrame.storyboardLabel}
            </span>
          </div>
          <div className="overflow-x-auto scrollbar-none pb-1">
            <div className="flex items-center gap-1.5 shrink-0">
              {STORYBOARD_PANELS.map((p: any) => {
                const isActive = safePhantomFrame.storyboardPanel === p.panelNumber;
                return (
                  <button
                    key={p.panelNumber}
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentFrame(p.startFrame);
                    }}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs font-semibold ring-2 ring-[#0284C7]/60'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                    title={`${p.title} (${p.frameRangeStr}): ${p.actionSummary}`}
                  >
                    {p.title} ({p.frameRangeStr})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Act Quick-Jump Buttons when in Speed vs Strength Mode */}
      {activeAnimationMode === 'speed-strength' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <div className="overflow-x-auto scrollbar-none pb-1 flex-1">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-medium text-slate-500 mr-1 shrink-0">Jump to Act:</span>
              {[
                { label: '1. Standoff (F00)', frame: 0 },
                {
                  label: '2. A Launches (F05)',
                  frame:
                    speedStrengthConfig.targetFps === 24 && speedStrengthConfig.interpolate24FpsFrames
                      ? 10
                      : 5,
                },
                {
                  label: '3. Speed Burst (F09)',
                  frame:
                    speedStrengthConfig.targetFps === 24 && speedStrengthConfig.interpolate24FpsFrames
                      ? 18
                      : 9,
                },
                {
                  label: '4. B Reacts (F13)',
                  frame:
                    speedStrengthConfig.targetFps === 24 && speedStrengthConfig.interpolate24FpsFrames
                      ? 26
                      : 13,
                },
                {
                  label: '5. Punch & Slip (F17)',
                  frame:
                    speedStrengthConfig.targetFps === 24 && speedStrengthConfig.interpolate24FpsFrames
                      ? 34
                      : 17,
                },
                {
                  label: '6. Counter Kick (F21)',
                  frame:
                    speedStrengthConfig.targetFps === 24 && speedStrengthConfig.interpolate24FpsFrames
                      ? 42
                      : 21,
                },
                {
                  label: '7. Ballistic Launch (F25)',
                  frame:
                    speedStrengthConfig.targetFps === 24 && speedStrengthConfig.interpolate24FpsFrames
                      ? 50
                      : 25,
                },
                {
                  label: '8. Contrast & Settle (F32)',
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
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {jump.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setVcamFollow((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              vcamFollow
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            {vcamFollow ? 'Dynamic Camera: ON' : 'Wide Stage: ON'}
          </button>
        </div>
      )}

      {/* Act Quick-Jump Buttons when in Teleport, Sneeze, or Superhero Mode */}
      {activeAnimationMode === 'teleport' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <div className="overflow-x-auto scrollbar-none pb-1 flex-1">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-medium text-slate-500 mr-1 shrink-0">Jump to Act:</span>
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
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {jump.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setVcamFollow((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              vcamFollow
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            {vcamFollow ? 'Camera Pan/Zoom: ON' : 'Wide Stage: ON'}
          </button>
        </div>
      )}

      {activeAnimationMode === 'sneeze' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <div className="overflow-x-auto scrollbar-none pb-1 flex-1">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-medium text-slate-500 mr-1 shrink-0">Jump to Act:</span>
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
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {jump.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setVcamFollow((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              vcamFollow
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            {vcamFollow ? 'V-Cam Follow: ON' : 'V-Cam Follow: OFF'}
          </button>
        </div>
      )}

      {activeAnimationMode === 'superhero' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <div className="overflow-x-auto scrollbar-none pb-1 flex-1">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-medium text-slate-500 mr-1 shrink-0">Jump to Stage:</span>
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
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {jump.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setVcamFollow((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              vcamFollow
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            {vcamFollow ? 'V-Cam Follow: ON' : 'V-Cam Follow: OFF'}
          </button>
        </div>
      )}
    </div>
  );
};
