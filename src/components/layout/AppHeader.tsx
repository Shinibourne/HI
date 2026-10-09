import React, { useState } from 'react';
import {
  Download,
  ChevronDown,
  Layers,
  Sparkles,
  Sliders,
  Menu,
  X,
  FileCode2,
} from 'lucide-react';

export interface AppHeaderProps {
  activeAnimationMode: string;
  setActiveAnimationMode: (mode: any) => void;
  globalFps: 12 | 24;
  handleSelectFps: (fps: 12 | 24) => void;
  synthesizing: boolean;
  handleSynthesizeAndDownload: () => Promise<void>;
  setSelectedPresetPath: (path: string) => void;
  setCurrentFrame: (f: number) => void;
  setIsPlaying: (p: boolean) => void;
  setBinaryStageOverride: (v: boolean) => void;
  mobileActiveView: 'stage' | 'inspector' | 'engineering';
  setMobileActiveView: (v: 'stage' | 'inspector' | 'engineering') => void;
  isInspectorCollapsed: boolean;
  setIsInspectorCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ANIMATION_MODES: {
  id: string;
  label: string;
  shortLabel: string;
  presetPath: string;
  fps: 12 | 24;
  badge: string;
  tagline: string;
}[] = [
  {
    id: 'combat',
    label: 'Master Fighting Combos (Rapid Accuracy & Fluidity)',
    shortLabel: '🥋 Fighting Combos',
    presetPath: '/downloads/basketball_walk_pickup_dribble_24f.stknds',
    fps: 24,
    badge: '24 FPS · 120f Master',
    tagline: '1-2 Jab-Cross, Slip & Liver Hook, Uppercut, 360° Spinning Back Kick, Flying Knee & Blitz Flurry',
  },
  {
    id: 'parkour',
    label: 'The Parkour Acrobat (Run ➔ Jump ➔ Roll ➔ Backflip)',
    shortLabel: '🏃‍♂️ Parkour Acrobat',
    presetPath: '/downloads/parkour_acrobat_24f.stknds',
    fps: 24,
    badge: '24 FPS · 10 Panels',
    tagline: 'Athletic sprint, hurdle dive jump, scapular shoulder roll, rebound block & 360° aerial backflip',
  },
  {
    id: 'basketball',
    label: 'Basketball Choreography (24f Master)',
    shortLabel: '🏀 Basketball',
    presetPath: '/downloads/basketball_walk_pickup_dribble_24f.stknds',
    fps: 24,
    badge: '24 FPS · 10 Phases',
    tagline: 'Walk, brake plant, deep crouch pickup, triple extension toss & rhythmic dribble cycle',
  },
  {
    id: 'stroll-kick',
    label: 'The Stroll & Kick (216f Master)',
    shortLabel: 'Stroll & Kick',
    presetPath: '/downloads/sit_stand_kick_24fps_216f.stknds',
    fps: 24,
    badge: '24 FPS · 16 Panels',
    tagline: 'Seated rest, trunk fold, squat stand, pendulum walk, punt kick & celebratory settle',
  },
  {
    id: 'phantom',
    label: 'The Phantom Shadowbox (75f Master)',
    shortLabel: 'Phantom Shadowbox',
    presetPath: '/downloads/phantom_shadowbox_24fps_75f.stknds',
    fps: 24,
    badge: '12/24 FPS · 10 Panels',
    tagline: 'Stillness hold, crouch drop, snap jab, weave slip & ballistic power punch',
  },
  {
    id: 'speed-strength',
    label: 'Speed vs Strength (36f Multi-Char)',
    shortLabel: 'Speed vs Strength',
    presetPath: '/downloads/speed_vs_strength_24fps.stknds',
    fps: 24,
    badge: '2-Character Combat',
    tagline: 'Agile fighter vs heavy bruiser with dynamic camera tracking and clash kinetics',
  },
  {
    id: 'teleport',
    label: 'The Teleport Ambush (36f Cinematic)',
    shortLabel: 'Teleport Ambush',
    presetPath: '/downloads/teleport_ambush_24fps.stknds',
    fps: 24,
    badge: 'Dynamic V-Cam',
    tagline: 'Close-up camera zoom, whip-pan vanish, blindspot ambush & impact screen shake',
  },
  {
    id: 'sneeze',
    label: 'The Epic Sneeze (36f Physical Comedy)',
    shortLabel: 'Epic Sneeze',
    presetPath: '/downloads/epic_sneeze_24fps.stknds',
    fps: 24,
    badge: 'Exaggerated Recoil',
    tagline: 'Build-up tremble hold, supersonic sneeze burst, thruster backflip & floor crash',
  },
  {
    id: 'superhero',
    label: 'Walk ➔ Run ➔ Ground-Propelled Flight (Master 36f)',
    shortLabel: '🚀 Propelled Flight',
    presetPath: '/downloads/walk_run_propelled_flight_24fps_71f.stknds',
    fps: 24,
    badge: 'Ground Launch',
    tagline: 'Walk gait, acceleration stride, max sprint, deep compression loading, explosive ground launch & sky cruise',
  },
  {
    id: 'bounce',
    label: 'Squash & Stretch Ball Bounce',
    shortLabel: 'Ball Bounce',
    presetPath: '/downloads/ball_bounce_squash_stretch.stknds',
    fps: 12,
    badge: 'Deformable Physics',
    tagline: 'Disney 12-principles deformation, apex deceleration and ground restitution',
  },
];

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeAnimationMode,
  setActiveAnimationMode,
  globalFps,
  handleSelectFps,
  synthesizing,
  handleSynthesizeAndDownload,
  setSelectedPresetPath,
  setCurrentFrame,
  setIsPlaying,
  setBinaryStageOverride,
  mobileActiveView,
  setMobileActiveView,
  isInspectorCollapsed,
  setIsInspectorCollapsed,
}) => {
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentMode =
    ANIMATION_MODES.find((m) => m.id === activeAnimationMode) || ANIMATION_MODES[0];

  const handleSelectMode = (mode: typeof currentMode) => {
    setBinaryStageOverride(false);
    setActiveAnimationMode(mode.id);
    setSelectedPresetPath(mode.presetPath);
    setCurrentFrame(0);
    setIsPlaying(true);
    setModeDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-[1800px] mx-auto px-3 sm:px-5 lg:px-8 h-15 flex items-center justify-between gap-3">
        {/* Zone 1: Single text element wordmark with clean styling */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8.5 h-8.5 rounded-lg bg-slate-900 flex items-center justify-center text-white font-mono text-xs font-bold tracking-tighter shadow-sm select-none">
            SN
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm sm:text-base text-slate-900 tracking-tight whitespace-nowrap">
                Stick Nodes Animation Forge
              </span>
              <span className="hidden md:inline-flex text-[10px] font-mono text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.2 rounded font-medium">
                v334 GZIP Binary
              </span>
            </div>
          </div>
        </div>

        {/* Zone 2: Mode Selector Segmented Menu / Dropdown */}
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={() => setModeDropdownOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-medium border border-slate-200/70 transition-colors cursor-pointer"
            aria-expanded={modeDropdownOpen}
            aria-label="Select animation mode"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="font-semibold max-w-[120px] sm:max-w-[200px] md:max-w-[260px] truncate">
              {currentMode.shortLabel}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                modeDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Mode Dropdown Menu */}
          {modeDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setModeDropdownOpen(false)}
              />
              <div className="absolute top-full left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-1.5 w-[310px] sm:w-[360px] bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 text-xs space-y-1 max-h-[80vh] overflow-y-auto">
                <div className="px-2 py-1 text-[11px] font-medium text-slate-500 border-b border-slate-100">
                  Select Choreography Engine Preset
                </div>
                {ANIMATION_MODES.map((m) => {
                  const isSelected = m.id === activeAnimationMode;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelectMode(m)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors flex items-start justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-sky-50 text-sky-900 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate">{m.label}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-normal line-clamp-1">
                          {m.tagline}
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        {m.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Zone 3: Actions & Persistent Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Global FPS Switcher */}
          <div className="hidden sm:inline-flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => handleSelectFps(12)}
              className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-md transition-all cursor-pointer ${
                globalFps === 12
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="12 Frames Per Second (Standard Stick Nodes baseline)"
            >
              12 FPS
            </button>
            <button
              type="button"
              onClick={() => handleSelectFps(24)}
              className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-md transition-all cursor-pointer ${
                globalFps === 24
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="24 Frames Per Second (Cinematic Sky Flight Engine)"
            >
              24 FPS
            </button>
          </div>

          {/* Toggle Inspector (Desktop) */}
          <button
            type="button"
            onClick={() => setIsInspectorCollapsed((prev) => !prev)}
            className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              !isInspectorCollapsed
                ? 'bg-slate-100 border-slate-300 text-slate-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Toggle Right Telemetry Inspector Panel"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[11px]">Inspector</span>
          </button>

          {/* Export .stknds Primary Button */}
          <button
            type="button"
            disabled={synthesizing}
            onClick={handleSynthesizeAndDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer shrink-0"
            title="Compile & Download .stknds file"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {synthesizing ? 'Compiling…' : 'Export .stknds'}
            </span>
            <span className="sm:hidden">{synthesizing ? '…' : 'Export'}</span>
          </button>

          {/* Mobile Navigation Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer"
            aria-label="Toggle mobile drawer"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation (When hamburger opened on mobile) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-3">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600">
            <span>Frame Rate:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => handleSelectFps(12)}
                className={`px-3 py-1 font-mono font-semibold rounded text-xs ${
                  globalFps === 12 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                12 FPS
              </button>
              <button
                type="button"
                onClick={() => handleSelectFps(24)}
                className={`px-3 py-1 font-mono font-semibold rounded text-xs ${
                  globalFps === 24 ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                24 FPS
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400">Workspace View Mode:</span>
            <div className="grid grid-cols-3 gap-1.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  setMobileActiveView('stage');
                  setMobileMenuOpen(false);
                }}
                className={`py-2 px-2 rounded-lg text-center ${
                  mobileActiveView === 'stage'
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Canvas Stage
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileActiveView('inspector');
                  setMobileMenuOpen(false);
                }}
                className={`py-2 px-2 rounded-lg text-center ${
                  mobileActiveView === 'inspector'
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Audit &amp; Telemetry
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileActiveView('engineering');
                  setMobileMenuOpen(false);
                }}
                className={`py-2 px-2 rounded-lg text-center ${
                  mobileActiveView === 'engineering'
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Engineering Suite
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
