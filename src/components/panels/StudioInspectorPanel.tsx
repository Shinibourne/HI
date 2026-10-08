import React, { useState } from 'react';
import {
  ShieldCheck,
  Activity,
  Sliders,
  Download,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
} from 'lucide-react';
import { BasketballAuditReport } from '../../lib/basketballChoreographyFrames';
import { BiomechanicalAuditReport } from '../../lib/sitWalkKickBallFrames';
import { ParkourKeyframeSpec } from '../../lib/parkourAcrobatFrames';

export interface StudioInspectorPanelProps {
  activeAnimationMode: string;
  globalFps: 12 | 24;
  currentFrame: number;
  totalModeFrames: number;
  combatAudit?: any;
  safeCombatFrame?: any;
  combatConfig?: any;
  setCombatConfig?: React.Dispatch<React.SetStateAction<any>>;
  parkourAudit?: BiomechanicalAuditReport;
  safeParkourFrame?: ParkourKeyframeSpec;
  basketballAudit: BasketballAuditReport;
  strollKickAudit: BiomechanicalAuditReport;
  safeBasketballFrame: any;
  safeStrollKickFrame: any;
  safePhantomFrame: any;
  safeTeleportFrame: any;
  safeSpeedStrengthFrame: any;
  safeHeroFrame: any;
  safeBounceFrame: any;
  basketballConfig: any;
  setBasketballConfig: React.Dispatch<React.SetStateAction<any>>;
  strollKickConfig: any;
  setStrollKickConfig: React.Dispatch<React.SetStateAction<any>>;
  phantomConfig: any;
  setPhantomConfig: React.Dispatch<React.SetStateAction<any>>;
  speedStrengthConfig: any;
  setSpeedStrengthConfig: React.Dispatch<React.SetStateAction<any>>;
  teleportConfig: any;
  setTeleportConfig: React.Dispatch<React.SetStateAction<any>>;
  sneezeConfig: any;
  setSneezeConfig: React.Dispatch<React.SetStateAction<any>>;
  heroConfig: any;
  setHeroConfig: React.Dispatch<React.SetStateAction<any>>;
  bounceConfig: any;
  setBounceConfig: React.Dispatch<React.SetStateAction<any>>;
  baseTemplate22: Uint8Array | null;
  baseTemplate27: Uint8Array | null;
  synthesizing: boolean;
  handleSynthesizeAndDownload: () => Promise<void>;
  basketballFrames: any[];
  strollKickFrames: any[];
  phantomFrames: any[];
  teleportFrames: any[];
}

export const StudioInspectorPanel: React.FC<StudioInspectorPanelProps> = ({
  activeAnimationMode,
  globalFps,
  currentFrame,
  totalModeFrames,
  combatAudit,
  safeCombatFrame,
  combatConfig,
  setCombatConfig,
  parkourAudit,
  safeParkourFrame,
  basketballAudit,
  strollKickAudit,
  safeBasketballFrame,
  safeStrollKickFrame,
  safePhantomFrame,
  safeTeleportFrame,
  safeSpeedStrengthFrame,
  safeHeroFrame,
  safeBounceFrame,
  basketballConfig,
  setBasketballConfig,
  strollKickConfig,
  setStrollKickConfig,
  phantomConfig,
  setPhantomConfig,
  speedStrengthConfig,
  setSpeedStrengthConfig,
  teleportConfig,
  setTeleportConfig,
  sneezeConfig,
  setSneezeConfig,
  heroConfig,
  setHeroConfig,
  bounceConfig,
  setBounceConfig,
  baseTemplate22,
  baseTemplate27,
  synthesizing,
  handleSynthesizeAndDownload,
  basketballFrames,
  strollKickFrames,
  phantomFrames,
  teleportFrames,
}) => {
  const [activeInspectorTab, setActiveInspectorTab] = useState<'audit' | 'telemetry' | 'params'>('audit');

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col h-full">
      {/* Inspector Header & Tab Switcher */}
      <div className="p-2 sm:p-2.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 p-0.5 bg-slate-200/70 rounded-lg text-xs w-full">
          <button
            type="button"
            onClick={() => setActiveInspectorTab('audit')}
            className={`flex-1 py-1.5 px-2 rounded-md font-medium text-center transition-colors cursor-pointer text-[11px] sm:text-xs flex items-center justify-center gap-1.5 ${
              activeInspectorTab === 'audit'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Audit &amp; Rules</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveInspectorTab('telemetry')}
            className={`flex-1 py-1.5 px-2 rounded-md font-medium text-center transition-colors cursor-pointer text-[11px] sm:text-xs flex items-center justify-center gap-1.5 ${
              activeInspectorTab === 'telemetry'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-sky-600" />
            <span>Live Telemetry</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveInspectorTab('params')}
            className={`flex-1 py-1.5 px-2 rounded-md font-medium text-center transition-colors cursor-pointer text-[11px] sm:text-xs flex items-center justify-center gap-1.5 ${
              activeInspectorTab === 'params'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-600" />
            <span>Parameters</span>
          </button>
        </div>
      </div>

      {/* Main Tab Body */}
      <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-4 max-h-[min(540px,calc(100vh-220px))] lg:max-h-[520px]">
        {/* TAB 1: AUDIT & INVARIANTS */}
        {activeInspectorTab === 'audit' && (
          <div className="space-y-3">
            {activeAnimationMode === 'combat' && combatAudit && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>8-Domain Biomechanical Combat Audit</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {combatAudit.passedChecks}/{combatAudit.totalChecks} PASSED (100%)
                  </span>
                </div>
                <div className="space-y-1.5">
                  {combatAudit.items.map((it: any) => (
                    <div
                      key={it.id}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 text-xs"
                      title={it.detail}
                    >
                      <div className="min-w-0">
                        <span className="text-slate-800 block truncate text-[11px] font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          {it.label}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {it.detail}
                        </span>
                      </div>
                      <span className="font-mono tabular-nums font-semibold text-emerald-700 shrink-0 text-xs bg-emerald-50/80 px-1.5 py-0.5 rounded border border-emerald-200">
                        {it.metric}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeAnimationMode === 'parkour' && parkourAudit && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>7-Domain Biomechanical Audit</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {parkourAudit.passedChecks}/{parkourAudit.totalChecks} PASSED (100%)
                  </span>
                </div>
                <div className="space-y-1.5">
                  {parkourAudit.items.map((it) => (
                    <div
                      key={it.id}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 text-xs"
                      title={it.detail}
                    >
                      <div className="min-w-0">
                        <span className="text-slate-800 block truncate text-[11px] font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          {it.label}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {it.detail}
                        </span>
                      </div>
                      <span className="font-mono tabular-nums font-semibold text-emerald-700 shrink-0 text-xs bg-emerald-50/80 px-1.5 py-0.5 rounded border border-emerald-200">
                        {it.metric}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeAnimationMode === 'basketball' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>20-Rule Biomechanical Invariants</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {basketballAudit.passedChecks}/{basketballAudit.totalChecks} PASSED
                  </span>
                </div>
                <div className="space-y-1.5">
                  {basketballAudit.items.map((it) => (
                    <div
                      key={it.id}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 text-xs"
                      title={it.detail}
                    >
                      <div className="min-w-0">
                        <span className="text-slate-700 block truncate text-[11px] font-medium">
                          #{it.ruleNumber} {it.label}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {it.detail}
                        </span>
                      </div>
                      <span className="font-mono tabular-nums font-semibold text-emerald-600 shrink-0 text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {it.metric}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeAnimationMode === 'stroll-kick' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>14-Rule Biomechanical Invariants</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {strollKickAudit.passedChecks}/{strollKickAudit.totalChecks} PASSED
                  </span>
                </div>
                <div className="space-y-1.5">
                  {strollKickAudit.items.map((it) => (
                    <div
                      key={it.id}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 text-xs"
                      title={it.detail}
                    >
                      <div className="min-w-0">
                        <span className="text-slate-700 block truncate text-[11px] font-medium">
                          {it.label}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {it.detail}
                        </span>
                      </div>
                      <span className="font-mono tabular-nums font-semibold text-emerald-600 shrink-0 text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {it.metric}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!['basketball', 'stroll-kick'].includes(activeAnimationMode) && (
              <div className="space-y-2.5">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Kinematic Stability &amp; Boundary Check</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Closed kinematic chains verified with 0° reverse hyperextension limits, ground-contact pinning, and Law of Cosines limb solving.
                  </p>
                  <div className="pt-1 flex items-center gap-2 font-mono text-[11px] text-slate-500">
                    <span>Frame Count: {totalModeFrames}</span>
                    <span>·</span>
                    <span>Target FPS: {globalFps}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LIVE TELEMETRY */}
        {activeInspectorTab === 'telemetry' && (
          <div className="space-y-3">
            {activeAnimationMode === 'combat' && safeCombatFrame && (
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200/80 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-rose-950">🥋 Fighting Combo Telemetry</span>
                    <span className={`font-mono font-bold px-1.5 py-0.5 rounded border ${
                      safeCombatFrame.isHitFrame
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : safeCombatFrame.isBalanced
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-amber-50 text-amber-700 border-amber-300'
                    }`}>
                      {safeCombatFrame.isHitFrame
                        ? `💥 IMPACT SNAP (${safeCombatFrame.hitType.toUpperCase()})`
                        : safeCombatFrame.isBalanced
                        ? 'STANCE BALANCE'
                        : 'DYNAMIC WHIP'}
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-900 font-medium">
                    {safeCombatFrame.act} — {safeCombatFrame.technique}
                  </p>
                  <p className="text-[10px] text-slate-500 italic">
                    {safeCombatFrame.notes}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono tabular-nums">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Strike Speed / Velocity</span>
                    <span className="font-bold text-rose-700">
                      {safeCombatFrame.strikeSpeedPxPerFrame > 0 ? `${safeCombatFrame.strikeSpeedPxPerFrame.toFixed(1)} px/f` : 'Stance Chamber'}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Center of Mass (CoM)</span>
                    <span className="font-bold text-slate-900">
                      ({safeCombatFrame.comX.toFixed(1)}, {safeCombatFrame.comY.toFixed(1)})
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Torso Counter-Rotation</span>
                    <span className="font-bold text-purple-700">
                      {Math.round(safeCombatFrame.torsoCounterRotationDeg)}° counter-coil
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Body Rotation / Spin</span>
                    <span className="font-bold text-slate-900">
                      {Math.round(Math.abs(safeCombatFrame.bodyRotationDeg))}° (360° continuity)
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-600 block uppercase tracking-wider">
                    Full-Body Kinetic Reaction Chain:
                  </span>
                  <p className="text-[11px] text-slate-700 font-sans">
                    {safeCombatFrame.kineticChainDesc}
                  </p>
                </div>
              </div>
            )}

            {activeAnimationMode === 'parkour' && safeParkourFrame && (
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-sky-50/70 border border-sky-200/80 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-sky-950">Parkour Action Beat</span>
                    <span className={`font-mono font-bold px-1.5 py-0.5 rounded border ${
                      safeParkourFrame.isBalanced
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-amber-50 text-amber-700 border-amber-300'
                    }`}>
                      {safeParkourFrame.isBalanced ? 'STABLE IN BOS' : 'AIRBORNE DYNAMICS'}
                    </span>
                  </div>
                  <p className="text-[11px] text-sky-900 font-medium">
                    {safeParkourFrame.act} — {safeParkourFrame.phase}
                  </p>
                  <p className="text-[10px] text-slate-500 italic">
                    {safeParkourFrame.notes}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono tabular-nums">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Center of Mass (CoM)</span>
                    <span className="font-bold text-slate-900">
                      ({safeParkourFrame.comX.toFixed(1)}, {safeParkourFrame.comY.toFixed(1)})
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Velocity Vector</span>
                    <span className="font-bold text-sky-700">
                      Vx: {safeParkourFrame.kineticVelocityX.toFixed(1)} · Vy: {safeParkourFrame.kineticVelocityY.toFixed(1)} px/f
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Body Rotation</span>
                    <span className="font-bold text-purple-700">
                      {Math.round(Math.abs(safeParkourFrame.bodyRotationDeg))}° ({safeParkourFrame.angularVelocityDegPerFrame.toFixed(1)}°/f)
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Knee Flex / Impact Drop</span>
                    <span className="font-bold text-slate-900">
                      {Math.round(safeParkourFrame.kneeFlexionDeg)}° / {Math.round(safeParkourFrame.landingCompressionPx)} px
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-600 block uppercase tracking-wider">
                    Kinetic Reaction Chain:
                  </span>
                  <p className="text-[11px] text-slate-700 font-sans">
                    {safeParkourFrame.kineticChainDesc}
                  </p>
                </div>
              </div>
            )}

            {activeAnimationMode === 'basketball' && safeBasketballFrame && (
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-orange-50/70 border border-orange-200/80 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-orange-900">Current Phase State</span>
                    <span className="font-mono font-bold text-orange-700 px-1.5 py-0.5 bg-white rounded border border-orange-200">
                      {safeBasketballFrame.ballState}
                    </span>
                  </div>
                  <p className="text-[11px] text-orange-800">
                    {safeBasketballFrame.phaseName} — {safeBasketballFrame.subEventName}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono tabular-nums">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Center of Mass (CoM)</span>
                    <span className="font-bold text-slate-900">
                      ({safeBasketballFrame.comX.toFixed(1)}, {safeBasketballFrame.comY.toFixed(1)})
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Ball Position / Vel Y</span>
                    <span className="font-bold text-orange-600">
                      ({safeBasketballFrame.ballX.toFixed(1)}, {safeBasketballFrame.ballY.toFixed(1)}) · {safeBasketballFrame.ballVy.toFixed(1)} px/f
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Hand Contact Dist</span>
                    <span className="font-bold text-slate-900">
                      {safeBasketballFrame.contactDist.toFixed(1)} px (r={basketballConfig.ballRadius})
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">R_Knee / R_Elbow Flex</span>
                    <span className="font-bold text-sky-700">
                      {safeBasketballFrame.rKneeFlexDeg.toFixed(0)}° / {safeBasketballFrame.rElbowFlexDeg.toFixed(0)}°
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeAnimationMode === 'stroll-kick' && safeStrollKickFrame && (
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-sky-50/70 border border-sky-200/80 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-sky-900">Equilibrium Status</span>
                    <span className={`font-mono font-bold px-1.5 py-0.5 rounded border ${
                      safeStrollKickFrame.isBalanced
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-amber-50 text-amber-700 border-amber-300'
                    }`}>
                      {safeStrollKickFrame.isBalanced ? 'STATIC BALANCE' : 'DYNAMIC MOMENTUM'}
                    </span>
                  </div>
                  <p className="text-[11px] text-sky-800">
                    {safeStrollKickFrame.act} — {safeStrollKickFrame.phase}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono tabular-nums">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Center of Mass</span>
                    <span className="font-bold text-slate-900">
                      ({safeStrollKickFrame.comX.toFixed(1)}, {safeStrollKickFrame.comY.toFixed(1)})
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Base of Support (BoS)</span>
                    <span className="font-bold text-slate-900">
                      [{safeStrollKickFrame.supportMinX.toFixed(0)}, {safeStrollKickFrame.supportMaxX.toFixed(0)}]
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Spine / Chest Flex</span>
                    <span className="font-bold text-sky-700">
                      {safeStrollKickFrame.manAngles[7].toFixed(0)}° / {safeStrollKickFrame.manAngles[8].toFixed(0)}°
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Ball Position</span>
                    <span className="font-bold text-orange-600">
                      ({safeStrollKickFrame.ballX.toFixed(0)}, {safeStrollKickFrame.ballY.toFixed(0)})
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeAnimationMode === 'phantom' && safePhantomFrame && (
              <div className="space-y-2 text-xs font-mono tabular-nums">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 block font-sans">Scene Coordinates</span>
                  <div className="font-bold text-slate-900">
                    X: {safePhantomFrame.sceneX.toFixed(1)} px · Y: {safePhantomFrame.sceneY.toFixed(1)} px
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 block font-sans">Spine &amp; Lead Arm Angles</span>
                  <div className="font-bold text-sky-700">
                    Spine: {safePhantomFrame.worldAngles[7]?.toFixed(0)}° · Arm: {safePhantomFrame.worldAngles[9]?.toFixed(0)}°
                  </div>
                </div>
              </div>
            )}

            {activeAnimationMode === 'speed-strength' && safeSpeedStrengthFrame && (
              <div className="space-y-2 text-xs font-mono tabular-nums">
                <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 space-y-1">
                  <span className="text-[10px] text-amber-800 block font-sans font-medium">Speed Fighter (Char A)</span>
                  <div className="font-bold text-slate-900">
                    ({safeSpeedStrengthFrame.charAX.toFixed(0)}, {safeSpeedStrengthFrame.charAY.toFixed(0)}) px
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-600 block font-sans font-medium">Strength Bruiser (Char B)</span>
                  <div className="font-bold text-slate-900">
                    ({safeSpeedStrengthFrame.charBX.toFixed(0)}, {safeSpeedStrengthFrame.charBY.toFixed(0)}) px
                  </div>
                </div>
              </div>
            )}

            {activeAnimationMode === 'teleport' && safeTeleportFrame && (
              <div className="space-y-2 text-xs font-mono tabular-nums">
                <div className="p-2.5 rounded-lg bg-red-50/70 border border-red-200 space-y-1">
                  <span className="text-[10px] text-red-800 block font-sans font-medium">Character Red (Seated)</span>
                  <div className="font-bold text-slate-900">
                    ({safeTeleportFrame.redX.toFixed(0)}, {safeTeleportFrame.redY.toFixed(0)}) px
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 space-y-1">
                  <span className="text-[10px] text-blue-800 block font-sans font-medium">Character Blue (Attacker)</span>
                  <div className="font-bold text-slate-900">
                    {safeTeleportFrame.bluePresent
                      ? `(${safeTeleportFrame.blueX.toFixed(0)}, ${safeTeleportFrame.blueY.toFixed(0)}) px`
                      : 'VANISHED (Whip Pan Offscreen)'}
                  </div>
                </div>
              </div>
            )}

            {!['basketball', 'stroll-kick', 'phantom', 'speed-strength', 'teleport'].includes(activeAnimationMode) && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <span className="font-semibold block text-slate-800">Active Keyframe Telemetry</span>
                <p className="mt-1 font-mono text-[11px]">
                  Frame: {currentFrame} / {totalModeFrames - 1} · Rate: {globalFps} FPS
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: GENERATOR PARAMETERS */}
        {activeInspectorTab === 'params' && (
          <div className="space-y-3.5 text-xs">
            {activeAnimationMode === 'combat' && combatConfig && setCombatConfig && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block text-[11px]">Fighter Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={combatConfig.fighterColorHex}
                        onChange={(e) =>
                          setCombatConfig((c: any) => ({ ...c, fighterColorHex: e.target.value }))
                        }
                        className="w-7 h-7 rounded border border-slate-300 cursor-pointer"
                      />
                      <span className="font-mono text-[11px] text-slate-700">{combatConfig.fighterColorHex}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block text-[11px]">Strike Accent Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={combatConfig.accentColorHex}
                        onChange={(e) =>
                          setCombatConfig((c: any) => ({ ...c, accentColorHex: e.target.value }))
                        }
                        className="w-7 h-7 rounded border border-slate-300 cursor-pointer"
                      />
                      <span className="font-mono text-[11px] text-slate-700">{combatConfig.accentColorHex}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-medium text-[11px]">
                    <label htmlFor="combat-ground-y">Ground Floor Y (px)</label>
                    <span className="font-mono text-slate-800">{combatConfig.groundY} px</span>
                  </div>
                  <input
                    id="combat-ground-y"
                    type="range"
                    min={700}
                    max={820}
                    step={1}
                    value={combatConfig.groundY}
                    onChange={(e) =>
                      setCombatConfig((c: any) => ({
                        ...c,
                        groundY: Number(e.target.value),
                      }))
                    }
                    className="w-full h-1.5 accent-rose-600 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="pt-2 border-t border-slate-200/80 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700">
                    <input
                      type="checkbox"
                      checked={combatConfig.enableHitSparks}
                      onChange={(e) =>
                        setCombatConfig((c: any) => ({ ...c, enableHitSparks: e.target.checked }))
                      }
                      className="rounded accent-rose-600"
                    />
                    <span>Show Radiant Strike Hit Sparks &amp; Shockwaves</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700">
                    <input
                      type="checkbox"
                      checked={combatConfig.enableSpeedTrails}
                      onChange={(e) =>
                        setCombatConfig((c: any) => ({ ...c, enableSpeedTrails: e.target.checked }))
                      }
                      className="rounded accent-rose-600"
                    />
                    <span>Show Trajectory &amp; Speed Motion Arcs</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700">
                    <input
                      type="checkbox"
                      checked={combatConfig.showTargetDummy}
                      onChange={(e) =>
                        setCombatConfig((c: any) => ({ ...c, showTargetDummy: e.target.checked }))
                      }
                      className="rounded accent-rose-600"
                    />
                    <span>Show Tactical Sparring Target Dummy</span>
                  </label>
                </div>
              </div>
            )}

            {activeAnimationMode === 'basketball' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block text-[11px]">Player Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={basketballConfig.charColorHex}
                        onChange={(e) =>
                          setBasketballConfig((c: any) => ({ ...c, charColorHex: e.target.value }))
                        }
                        className="w-7 h-7 rounded border border-slate-300 cursor-pointer"
                      />
                      <span className="font-mono text-[11px] text-slate-700">{basketballConfig.charColorHex}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block text-[11px]">Basketball Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={basketballConfig.ballColorHex}
                        onChange={(e) =>
                          setBasketballConfig((c: any) => ({ ...c, ballColorHex: e.target.value }))
                        }
                        className="w-7 h-7 rounded border border-slate-300 cursor-pointer"
                      />
                      <span className="font-mono text-[11px] text-slate-700">{basketballConfig.ballColorHex}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-medium text-[11px]">
                    <label htmlFor="bball-radius-inspector">Ball Radius (Node 13 Scale 0.5)</label>
                    <span className="font-mono text-slate-800">{basketballConfig.ballRadius} px</span>
                  </div>
                  <input
                    id="bball-radius-inspector"
                    type="range"
                    min={14}
                    max={24}
                    step={1}
                    value={basketballConfig.ballRadius}
                    onChange={(e) =>
                      setBasketballConfig((c: any) => ({
                        ...c,
                        ballRadius: Number(e.target.value),
                      }))
                    }
                    className="w-full h-1.5 accent-orange-600 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}

            {activeAnimationMode === 'stroll-kick' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block text-[11px]">Character Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={strollKickConfig.manColorHex}
                        onChange={(e) =>
                          setStrollKickConfig((c: any) => ({ ...c, manColorHex: e.target.value }))
                        }
                        className="w-7 h-7 rounded border border-slate-300 cursor-pointer"
                      />
                      <span className="font-mono text-[11px] text-slate-700">{strollKickConfig.manColorHex}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block text-[11px]">Ball Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={strollKickConfig.ballColorHex}
                        onChange={(e) =>
                          setStrollKickConfig((c: any) => ({ ...c, ballColorHex: e.target.value }))
                        }
                        className="w-7 h-7 rounded border border-slate-300 cursor-pointer"
                      />
                      <span className="font-mono text-[11px] text-slate-700">{strollKickConfig.ballColorHex}</span>
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={strollKickConfig.enableHitStop}
                    onChange={(e) =>
                      setStrollKickConfig((c: any) => ({ ...c, enableHitStop: e.target.checked }))
                    }
                    className="rounded text-sky-600 focus:ring-0"
                  />
                  <span className="text-[11px] font-medium text-slate-700">
                    Enable 2-frame Impact Hit-Stop at F132
                  </span>
                </label>
              </div>
            )}

            {activeAnimationMode === 'phantom' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block text-[11px]">Body Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={phantomConfig.primaryColorHex}
                        onChange={(e) =>
                          setPhantomConfig((c: any) => ({ ...c, primaryColorHex: e.target.value }))
                        }
                        className="w-7 h-7 rounded border border-slate-300 cursor-pointer"
                      />
                      <span className="font-mono text-[11px] text-slate-700">{phantomConfig.primaryColorHex}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block text-[11px]">Head Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={phantomConfig.headColorHex}
                        onChange={(e) =>
                          setPhantomConfig((c: any) => ({ ...c, headColorHex: e.target.value }))
                        }
                        className="w-7 h-7 rounded border border-slate-300 cursor-pointer"
                      />
                      <span className="font-mono text-[11px] text-slate-700">{phantomConfig.headColorHex}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-medium text-[11px]">
                    <label htmlFor="phantom-stillness">Stillness Hold Frames</label>
                    <span className="font-mono text-slate-800">{phantomConfig.stillnessHoldFrames} frames</span>
                  </div>
                  <input
                    id="phantom-stillness"
                    type="range"
                    min={4}
                    max={20}
                    value={phantomConfig.stillnessHoldFrames}
                    onChange={(e) =>
                      setPhantomConfig((c: any) => ({
                        ...c,
                        stillnessHoldFrames: Number(e.target.value),
                      }))
                    }
                    className="w-full h-1.5 accent-sky-600 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}

            {activeAnimationMode === 'speed-strength' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block text-[11px]">Speed Fighter (A)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={speedStrengthConfig.speedColorHex}
                        onChange={(e) =>
                          setSpeedStrengthConfig((c: any) => ({ ...c, speedColorHex: e.target.value }))
                        }
                        className="w-7 h-7 rounded border border-slate-300 cursor-pointer"
                      />
                      <span className="font-mono text-[11px] text-slate-700">{speedStrengthConfig.speedColorHex}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block text-[11px]">Strength Bruiser (B)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={speedStrengthConfig.strengthColorHex}
                        onChange={(e) =>
                          setSpeedStrengthConfig((c: any) => ({ ...c, strengthColorHex: e.target.value }))
                        }
                        className="w-7 h-7 rounded border border-slate-300 cursor-pointer"
                      />
                      <span className="font-mono text-[11px] text-slate-700">{speedStrengthConfig.strengthColorHex}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeAnimationMode === 'teleport' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block text-[11px]">Red Seated Guard</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={teleportConfig.redColorHex}
                        onChange={(e) =>
                          setTeleportConfig((c: any) => ({ ...c, redColorHex: e.target.value }))
                        }
                        className="w-7 h-7 rounded border border-slate-300 cursor-pointer"
                      />
                      <span className="font-mono text-[11px] text-slate-700">{teleportConfig.redColorHex}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block text-[11px]">Blue Ambush Attacker</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={teleportConfig.blueColorHex}
                        onChange={(e) =>
                          setTeleportConfig((c: any) => ({ ...c, blueColorHex: e.target.value }))
                        }
                        className="w-7 h-7 rounded border border-slate-300 cursor-pointer"
                      />
                      <span className="font-mono text-[11px] text-slate-700">{teleportConfig.blueColorHex}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-medium text-[11px]">
                    <label htmlFor="teleport-shake">Screen Shake Amplitude</label>
                    <span className="font-mono text-slate-800">{teleportConfig.screenShakeAmplitudePx} px</span>
                  </div>
                  <input
                    id="teleport-shake"
                    type="range"
                    min={0}
                    max={40}
                    value={teleportConfig.screenShakeAmplitudePx}
                    onChange={(e) =>
                      setTeleportConfig((c: any) => ({
                        ...c,
                        screenShakeAmplitudePx: Number(e.target.value),
                      }))
                    }
                    className="w-full h-1.5 accent-sky-600 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}

            {activeAnimationMode === 'sneeze' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between font-medium text-[11px]">
                    <label htmlFor="sneeze-tremble">Hold Tremble Degree</label>
                    <span className="font-mono text-slate-800">{sneezeConfig.holdTrembleDeg}°</span>
                  </div>
                  <input
                    id="sneeze-tremble"
                    type="range"
                    min={2}
                    max={12}
                    value={sneezeConfig.holdTrembleDeg}
                    onChange={(e) =>
                      setSneezeConfig((c: any) => ({
                        ...c,
                        holdTrembleDeg: Number(e.target.value),
                      }))
                    }
                    className="w-full h-1.5 accent-sky-600 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}

            {activeAnimationMode === 'superhero' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between font-medium text-[11px]">
                    <label htmlFor="hero-apex">Flight Apex Height (Scene Y)</label>
                    <span className="font-mono text-slate-800">{heroConfig.flightApexY} px</span>
                  </div>
                  <input
                    id="hero-apex"
                    type="range"
                    min={80}
                    max={260}
                    value={heroConfig.flightApexY}
                    onChange={(e) =>
                      setHeroConfig((c: any) => ({
                        ...c,
                        flightApexY: Number(e.target.value),
                      }))
                    }
                    className="w-full h-1.5 accent-sky-600 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}

            {activeAnimationMode === 'bounce' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between font-medium text-[11px]">
                    <label htmlFor="bounce-apex">Primary Apex Height</label>
                    <span className="font-mono text-slate-800">{bounceConfig.primaryApexHeight} px</span>
                  </div>
                  <input
                    id="bounce-apex"
                    type="range"
                    min={180}
                    max={360}
                    value={bounceConfig.primaryApexHeight}
                    onChange={(e) =>
                      setBounceConfig((c: any) => ({
                        ...c,
                        primaryApexHeight: Number(e.target.value),
                      }))
                    }
                    className="w-full h-1.5 accent-sky-600 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Export Action */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 mt-auto">
        <button
          type="button"
          disabled={synthesizing}
          onClick={handleSynthesizeAndDownload}
          className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>
            {synthesizing
              ? 'Synthesizing GZIP Container…'
              : `Compile & Export ${activeAnimationMode.toUpperCase()} (${globalFps} FPS)`}
          </span>
        </button>
      </div>
    </div>
  );
};
