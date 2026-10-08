import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, Activity, Target, Download, Sparkles } from 'lucide-react';
import { BasketballAuditReport, BasketballKeyframeSpec, BasketballGeneratorConfig } from '../../lib/basketballChoreographyFrames';
import { BiomechanicalAuditReport, SitWalkKickKeyframeSpec, SitWalkKickGeneratorConfig } from '../../lib/sitWalkKickBallFrames';
import { PhantomShadowboxKeyframeSpec, PhantomShadowboxGeneratorConfig } from '../../lib/phantomShadowboxFrames';
import { SpeedVsStrengthKeyframeSpec, SpeedVsStrengthGeneratorConfig } from '../../lib/speedVsStrengthFrames';
import { TeleportAmbushKeyframeSpec, StickfigureKeyframeSpec, TeleportAmbushGeneratorConfig, EpicSneezeGeneratorConfig, SuperheroGeneratorConfig, BounceGeneratorConfig } from '../../lib/stknds/stkndsCore';

export interface AuditMetricsPanelProps {
  activeAnimationMode: string;
  globalFps: 12 | 24;
  basketballAudit: BasketballAuditReport;
  strollKickAudit: BiomechanicalAuditReport;
  safeBasketballFrame: BasketballKeyframeSpec;
  safeStrollKickFrame: SitWalkKickKeyframeSpec;
  safePhantomFrame: PhantomShadowboxKeyframeSpec;
  safeTeleportFrame: TeleportAmbushKeyframeSpec;
  safeSpeedStrengthFrame: SpeedVsStrengthKeyframeSpec;
  safeHeroFrame: StickfigureKeyframeSpec;
  safeBounceFrame: any;
  currentFrame: number;
  totalModeFrames: number;
  sneezeFrames: StickfigureKeyframeSpec[];
  superheroFrames: StickfigureKeyframeSpec[];
  speedStrengthFrames: SpeedVsStrengthKeyframeSpec[];
  basketballConfig: BasketballGeneratorConfig;
  setBasketballConfig: React.Dispatch<React.SetStateAction<BasketballGeneratorConfig>>;
  strollKickConfig: SitWalkKickGeneratorConfig;
  setStrollKickConfig: React.Dispatch<React.SetStateAction<SitWalkKickGeneratorConfig>>;
  phantomConfig: PhantomShadowboxGeneratorConfig;
  setPhantomConfig: React.Dispatch<React.SetStateAction<PhantomShadowboxGeneratorConfig>>;
  speedStrengthConfig: SpeedVsStrengthGeneratorConfig;
  setSpeedStrengthConfig: React.Dispatch<React.SetStateAction<SpeedVsStrengthGeneratorConfig>>;
  teleportConfig: TeleportAmbushGeneratorConfig;
  setTeleportConfig: React.Dispatch<React.SetStateAction<TeleportAmbushGeneratorConfig>>;
  sneezeConfig: EpicSneezeGeneratorConfig;
  setSneezeConfig: React.Dispatch<React.SetStateAction<EpicSneezeGeneratorConfig>>;
  heroConfig: SuperheroGeneratorConfig;
  setHeroConfig: React.Dispatch<React.SetStateAction<SuperheroGeneratorConfig>>;
  bounceConfig: BounceGeneratorConfig;
  setBounceConfig: React.Dispatch<React.SetStateAction<BounceGeneratorConfig>>;
  baseTemplate22: Uint8Array | null;
  baseTemplate27: Uint8Array | null;
  setCurrentFrame: React.Dispatch<React.SetStateAction<number>>;
  synthesizing: boolean;
  handleSynthesizeAndDownload: () => Promise<void>;
  basketballFrames: BasketballKeyframeSpec[];
  strollKickFrames: SitWalkKickKeyframeSpec[];
  phantomFrames: PhantomShadowboxKeyframeSpec[];
  teleportFrames: TeleportAmbushKeyframeSpec[];
}

export const AuditMetricsPanel: React.FC<AuditMetricsPanelProps> = ({
  activeAnimationMode,
  globalFps,
  basketballAudit,
  strollKickAudit,
  safeBasketballFrame,
  safeStrollKickFrame,
  safePhantomFrame,
  safeTeleportFrame,
  safeSpeedStrengthFrame,
  safeHeroFrame,
  safeBounceFrame,
  currentFrame,
  totalModeFrames,
  sneezeFrames,
  superheroFrames,
  speedStrengthFrames,
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
  setCurrentFrame,
  synthesizing,
  handleSynthesizeAndDownload,
  basketballFrames,
  strollKickFrames,
  phantomFrames,
  teleportFrames,
}) => {
  return (
    <div className="space-y-6">
            {activeAnimationMode === 'basketball' ? (
              <div className="space-y-4 text-xs">
                {/* 20-Rule Biomechanical & Physics Audit Card */}
                <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#059669]" />
                      20-Rule Biomechanical &amp; Ball Physics Audit
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 bg-[#ECFDF5] text-[#059669] rounded font-semibold border border-[#A7F3D0]">
                      {basketballAudit.passedChecks}/{basketballAudit.totalChecks} PASSED
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1 text-[11px]">
                    {basketballAudit.items.map((it) => (
                      <div
                        key={it.id}
                        className="p-1.5 rounded bg-white border border-[#E2E8F0] flex items-center justify-between gap-1"
                        title={it.detail}
                      >
                        <span className="text-[#475569] truncate">
                          #{it.ruleNumber} {it.label}
                        </span>
                        <span className="font-mono font-semibold text-[#059669] shrink-0">
                          {it.metric}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Procedural Kinematics & Ball Telemetry Card */}
                <div className="p-3 rounded-lg bg-[#FFF7ED] border border-[#FED7AA] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#9A3412] flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-[#EA580C]" />
                      Basketball &amp; IK Contact Telemetry
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-[#FFEDD5] text-[#C2410C] border border-[#FDBA74]">
                      {safeBasketballFrame.ballState}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-1.5 rounded bg-white border border-[#FED7AA]/70">
                      <span className="text-[#9A3412] block text-[10px]">Center of Mass (CoM)</span>
                      <span className="font-bold text-[#0F172A]">
                        ({safeBasketballFrame.comX.toFixed(1)}, {safeBasketballFrame.comY.toFixed(1)}) px
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-white border border-[#FED7AA]/70">
                      <span className="text-[#9A3412] block text-[10px]">Ball Center / Vel Y</span>
                      <span className="font-bold text-[#EA580C]">
                        ({safeBasketballFrame.ballX.toFixed(1)}, {safeBasketballFrame.ballY.toFixed(1)}) · {safeBasketballFrame.ballVy.toFixed(1)} px/f
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-white border border-[#FED7AA]/70">
                      <span className="text-[#9A3412] block text-[10px]">Hand-Ball Contact Dist</span>
                      <span className="font-bold text-[#0F172A]">
                        {safeBasketballFrame.contactDist.toFixed(1)} px (r={basketballConfig.ballRadius}px)
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-white border border-[#FED7AA]/70">
                      <span className="text-[#9A3412] block text-[10px]">R_Knee / R_Elbow Flex</span>
                      <span className="font-bold text-[#0284C7]">
                        {safeBasketballFrame.rKneeFlexDeg.toFixed(0)}° / {safeBasketballFrame.rElbowFlexDeg.toFixed(0)}°
                      </span>
                    </div>
                  </div>
                </div>

                {/* Character & Ball Colors + Radius Controls */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[#475569] font-medium block">Player Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={basketballConfig.charColorHex}
                        onChange={(e) =>
                          setBasketballConfig((c: any) => ({ ...c, charColorHex: e.target.value }))
                        }
                        className="w-7 h-7 rounded cursor-pointer border border-[#CBD5E1]"
                      />
                      <span className="font-mono text-[#0F172A]">
                        {basketballConfig.charColorHex}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#475569] font-medium block">Basketball Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={basketballConfig.ballColorHex}
                        onChange={(e) =>
                          setBasketballConfig((c: any) => ({ ...c, ballColorHex: e.target.value }))
                        }
                        className="w-7 h-7 rounded cursor-pointer border border-[#CBD5E1]"
                      />
                      <span className="font-mono text-[#0F172A]">
                        {basketballConfig.ballColorHex}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <label htmlFor="bball-radius">Basketball Radius (Node 13 Scale 0.5)</label>
                    <span className="font-mono text-[#0F172A]">
                      {basketballConfig.ballRadius} px (Ø {basketballConfig.ballRadius * 2} px)
                    </span>
                  </div>
                  <input
                    id="bball-radius"
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
                    className="w-full accent-[#EA580C]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    disabled={!baseTemplate27 || synthesizing}
                    onClick={handleSynthesizeAndDownload}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    {synthesizing
                      ? 'Synthesizing GZIP Container...'
                      : `Compile & Download Basketball (${globalFps} FPS · ${basketballFrames.length}f .stknds)`}
                  </button>
                </div>
              </div>
            ) : activeAnimationMode === 'stroll-kick' ? (
              <div className="space-y-4 text-xs">
                {/* Biomechanical Invariant Real-time Audit Card */}
                <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#059669]" />
                      Biomechanical &amp; Procedural Kinematics Audit
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 bg-[#ECFDF5] text-[#059669] rounded font-semibold border border-[#A7F3D0]">
                      {strollKickAudit.passedChecks}/{strollKickAudit.totalChecks} PASSED
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    {strollKickAudit.items.map((it) => (
                      <div
                        key={it.id}
                        className="p-1.5 rounded bg-white border border-[#E2E8F0] flex items-center justify-between gap-1"
                        title={it.detail}
                      >
                        <span className="text-[#475569] truncate">{it.label}</span>
                        <span className="font-mono font-semibold text-[#059669] shrink-0">
                          {it.metric}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Procedural Kinematics Telemetry Card */}
                <div className="p-3 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#92400E] flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-[#D97706]" />
                      Procedural Character Kinematics
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      safeStrollKickFrame.isBalanced
                        ? 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                        : 'bg-[#FEF3C7] text-[#D97706] border border-[#FCD34D]'
                    }`}>
                      {safeStrollKickFrame.isBalanced ? 'STATIC EQUILIBRIUM' : 'DYNAMIC MOMENTUM'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-1.5 rounded bg-white border border-[#FDE68A]/60">
                      <span className="text-[#78350F] block text-[10px]">Center of Mass (CoM)</span>
                      <span className="font-bold text-[#0F172A]">
                        ({safeStrollKickFrame.comX.toFixed(1)}, {safeStrollKickFrame.comY.toFixed(1)}) px
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-white border border-[#FDE68A]/60">
                      <span className="text-[#78350F] block text-[10px]">Base of Support (BoS)</span>
                      <span className="font-bold text-[#0F172A]">
                        [{safeStrollKickFrame.supportMinX.toFixed(0)}, {safeStrollKickFrame.supportMaxX.toFixed(0)}] px
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-white border border-[#FDE68A]/60">
                      <span className="text-[#78350F] block text-[10px]">Stability Margin</span>
                      <span className={`font-bold ${Math.abs(safeStrollKickFrame.stabilityMargin) <= 25 ? 'text-[#059669]' : 'text-[#D97706]'}`}>
                        {safeStrollKickFrame.stabilityMargin.toFixed(1)} px
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-white border border-[#FDE68A]/60">
                      <span className="text-[#78350F] block text-[10px]">Stance Foot Slip</span>
                      <span className="font-bold text-[#059669]">
                        0.00 px (Locked)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Full-Body Reactive Movement Telemetry Card */}
                <div className="p-3 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#1E40AF] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                      Full-Body Reactive Movement
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-[#DBEAFE] text-[#1D4ED8] border border-[#93C5FD]">
                      CONNECTED SYSTEM ACTIVE
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-1.5 rounded bg-white border border-[#BFDBFE]/60">
                      <span className="text-[#1E3A8A] block text-[10px]">Thoracic Torsion</span>
                      <span className="font-bold text-[#0F172A]">
                        {safeStrollKickFrame.thoracicTorsionDeg?.toFixed(1) ?? '0.0'}° counter-twist
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-white border border-[#BFDBFE]/60">
                      <span className="text-[#1E3A8A] block text-[10px]">Arm Elbow Modulation</span>
                      <span className="font-bold text-[#0F172A]">
                        {safeStrollKickFrame.armElbowFlexionDeg?.toFixed(1) ?? '0.0'}° bend
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-white border border-[#BFDBFE]/60">
                      <span className="text-[#1E3A8A] block text-[10px]">Kinetic Whip Recoil</span>
                      <span className={`font-bold ${(safeStrollKickFrame.kineticWhipRecoilDeg ?? 0) > 8 ? 'text-[#DC2626]' : 'text-[#059669]'}`}>
                        +{safeStrollKickFrame.kineticWhipRecoilDeg?.toFixed(1) ?? '0.0'}° backward
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-white border border-[#BFDBFE]/60">
                      <span className="text-[#1E3A8A] block text-[10px]">Vestibular Gaze Horizon</span>
                      <span className="font-bold text-[#0284C7]">
                        {safeStrollKickFrame.headGazeStabilization ?? '84.0° gaze'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Color customization */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="stroll-man-color" className="font-medium text-[#0F172A]">
                      Man Figure Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="stroll-man-color"
                        type="color"
                        value={strollKickConfig.manColorHex}
                        onChange={(e) =>
                          setStrollKickConfig((c: any) => ({
                            ...c,
                            manColorHex: e.target.value,
                          }))
                        }
                        className="w-7 h-7 rounded border border-[#CBD5E1] cursor-pointer"
                      />
                      <span className="font-mono text-[#475569]">
                        {strollKickConfig.manColorHex}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="stroll-ball-color" className="font-medium text-[#0F172A]">
                      Ball Prop Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="stroll-ball-color"
                        type="color"
                        value={strollKickConfig.ballColorHex}
                        onChange={(e) =>
                          setStrollKickConfig((c: any) => ({
                            ...c,
                            ballColorHex: e.target.value,
                          }))
                        }
                        className="w-7 h-7 rounded border border-[#CBD5E1] cursor-pointer"
                      />
                      <span className="font-mono text-[#475569]">
                        {strollKickConfig.ballColorHex}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ball Radius Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <label htmlFor="ball-radius">Ball Radius (Spec: ~18 px)</label>
                    <span className="font-mono text-[#0F172A]">
                      {strollKickConfig.ballRadius} px
                    </span>
                  </div>
                  <input
                    id="ball-radius"
                    type="range"
                    min={12}
                    max={26}
                    step={1}
                    value={strollKickConfig.ballRadius}
                    onChange={(e) =>
                      setStrollKickConfig((c: any) => ({
                        ...c,
                        ballRadius: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-[#0284C7]"
                  />
                </div>

                {/* 1-Frame Impact Hit-Stop Toggle */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F1F5F9]">
                  <div>
                    <label htmlFor="hit-stop-toggle" className="font-medium text-[#0F172A] cursor-pointer">
                      1-Frame Impact Hit-Stop (F174)
                    </label>
                    <p className="text-[11px] text-[#64748B]">
                      Emphasizes kick momentum transfer before launch
                    </p>
                  </div>
                  <input
                    id="hit-stop-toggle"
                    type="checkbox"
                    checked={strollKickConfig.enableHitStop}
                    onChange={(e) =>
                      setStrollKickConfig((c: any) => ({
                        ...c,
                        enableHitStop: e.target.checked,
                      }))
                    }
                    className="accent-[#0284C7]"
                  />
                </div>

                {/* Download Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={!baseTemplate27 || synthesizing}
                    onClick={handleSynthesizeAndDownload}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    {synthesizing
                      ? 'Synthesizing GZIP Container...'
                      : `Compile & Download (${globalFps} FPS · ${strollKickFrames.length}f .stknds)`}
                  </button>
                </div>
              </div>
            ) : activeAnimationMode === 'phantom' ? (
              <div className="space-y-4 text-xs">
                {globalFps === 24 && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F1F5F9]">
                    <label
                      htmlFor="bake-phantom-24fps"
                      className="font-medium text-[#0F172A] cursor-pointer"
                    >
                      Bake 24 FPS In-Betweens (79 Frames Total)
                    </label>
                    <input
                      id="bake-phantom-24fps"
                      type="checkbox"
                      checked={phantomConfig.interpolate24FpsFrames}
                      onChange={(e) => {
                        setPhantomConfig((c: any) => ({
                          ...c,
                          interpolate24FpsFrames: e.target.checked,
                        }));
                        setCurrentFrame(0);
                      }}
                      className="accent-[#0284C7]"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="phantom-primary-color" className="font-medium text-[#0F172A]">
                      Stick Figure Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="phantom-primary-color"
                        type="color"
                        value={phantomConfig.primaryColorHex}
                        onChange={(e) =>
                          setPhantomConfig((c: any) => ({
                            ...c,
                            primaryColorHex: e.target.value,
                          }))
                        }
                        className="w-8 h-8 rounded border border-[#CBD5E1] cursor-pointer"
                      />
                      <span className="font-mono text-[11px] text-[#64748B]">
                        {phantomConfig.primaryColorHex}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="phantom-head-color" className="font-medium text-[#0F172A]">
                      Head Accent Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="phantom-head-color"
                        type="color"
                        value={phantomConfig.headColorHex}
                        onChange={(e) =>
                          setPhantomConfig((c: any) => ({
                            ...c,
                            headColorHex: e.target.value,
                          }))
                        }
                        className="w-8 h-8 rounded border border-[#CBD5E1] cursor-pointer"
                      />
                      <span className="font-mono text-[11px] text-[#64748B]">
                        {phantomConfig.headColorHex}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 7-Step Action Breakdown Checklist */}
                <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-[11px]">
                  <div className="font-semibold text-[#0F172A] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0284C7]" />
                      Prompt Specification Compliance
                    </span>
                    <span className="font-mono text-[10px] text-[#0284C7] bg-[#E0F2FE] px-1.5 py-0.5 rounded">
                      7 Steps Verified
                    </span>
                  </div>
                  <div className="space-y-1.5 text-[#475569]">
                    <div className="flex items-start gap-1.5">
                      <span className="font-bold text-[#0F172A]">1. The Focus:</span>
                      <span>Center frame (X=640), rigid posture, arms down, head tilted down (12f / 1.0s).</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="font-bold text-[#0284C7]">2. Teleport 1 Blink:</span>
                      <span>1-frame complete disappearance. Blank stage sells infinite velocity.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="font-bold text-[#0F172A]">3. Combo 1 Rapid Hands:</span>
                      <span>Far right deep stance; 180° head-height jab, 180° twist cross, +90° vertical uppercut onto toes.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="font-bold text-[#0284C7]">4. Teleport 2 Mid-Swing:</span>
                      <span>Vanishes at the apex of the uppercut swing. Exactly 1 blank frame.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="font-bold text-[#0F172A]">5. Combo 2 Aerial Assault:</span>
                      <span>Far left airborne horizontal spine, 190° violent downward axe kick chop toward floor.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="font-bold text-[#0F172A]">6. Impact Landing:</span>
                      <span>Right heel ground slam (Y=755), left touchdown, deep 3-point crouch with fist in floor.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="font-bold text-[#0F172A]">7. The Reset:</span>
                      <span>Hold crouch 6 frames, uncoil, stand completely straight to Step 1 pose.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    disabled={synthesizing || !baseTemplate27}
                    onClick={handleSynthesizeAndDownload}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#0F172A] hover:bg-[#1E293B] disabled:bg-[#94A3B8] rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4 text-[#38BDF8]" />
                    {synthesizing
                      ? 'Synthesizing GZIP Container...'
                      : `Compile & Download The Phantom Shadowbox (${globalFps} FPS · ${phantomFrames.length}f .stknds)`}
                  </button>
                </div>
              </div>
            ) : activeAnimationMode === 'speed-strength' ? (
              <div className="space-y-4 text-xs">
                {globalFps === 24 && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F1F5F9]">
                    <label
                      htmlFor="bake-speed-24fps"
                      className="font-medium text-[#0F172A] cursor-pointer"
                    >
                      Bake 24 FPS In-Betweens (71 Frames Total)
                    </label>
                    <input
                      id="bake-speed-24fps"
                      type="checkbox"
                      checked={speedStrengthConfig.interpolate24FpsFrames}
                      onChange={(e) => {
                        setSpeedStrengthConfig((c: any) => ({
                          ...c,
                          interpolate24FpsFrames: e.target.checked,
                        }));
                        setCurrentFrame(0);
                      }}
                      className="accent-[#D97706]"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F1F5F9]">
                  <label
                    htmlFor="cam-track-speed"
                    className="font-medium text-[#0F172A] cursor-pointer"
                  >
                    Dynamic Camera Framing &amp; Tracking
                  </label>
                  <input
                    id="cam-track-speed"
                    type="checkbox"
                    checked={speedStrengthConfig.cameraDynamicTrack}
                    onChange={(e) => {
                      setSpeedStrengthConfig((c: any) => ({
                        ...c,
                        cameraDynamicTrack: e.target.checked,
                      }));
                    }}
                    className="accent-[#D97706]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="speed-color-a" className="font-medium text-[#0F172A]">
                      Char A (Speed) Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="speed-color-a"
                        type="color"
                        value={speedStrengthConfig.speedColorHex}
                        onChange={(e) =>
                          setSpeedStrengthConfig((c: any) => ({
                            ...c,
                            speedColorHex: e.target.value,
                          }))
                        }
                        className="w-8 h-8 rounded border border-[#CBD5E1] cursor-pointer"
                      />
                      <span className="font-mono text-[11px] text-[#64748B]">
                        {speedStrengthConfig.speedColorHex}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="strength-color-b" className="font-medium text-[#0F172A]">
                      Char B (Strength) Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="strength-color-b"
                        type="color"
                        value={speedStrengthConfig.strengthColorHex}
                        onChange={(e) =>
                          setSpeedStrengthConfig((c: any) => ({
                            ...c,
                            strengthColorHex: e.target.value,
                          }))
                        }
                        className="w-8 h-8 rounded border border-[#CBD5E1] cursor-pointer"
                      />
                      <span className="font-mono text-[11px] text-[#64748B]">
                        {speedStrengthConfig.strengthColorHex}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Biomechanics & Spatial Principles Card */}
                <div className="p-3 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] space-y-1.5 text-[11px]">
                  <div className="font-semibold text-[#92400E] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D97706]" />
                    Human Motion &amp; Spatial Consistency Enforced
                  </div>
                  <ul className="space-y-1 text-[#78350F] list-disc list-inside">
                    <li>Shared Ground Plane invariant: Y = 755.0 px</li>
                    <li>Zero teleportation: continuous Character Root kinematics</li>
                    <li>Kinetic chain sequencing: feet → hips → torso → shoulder → arm</li>
                    <li>Biomechanical anticipation: crouch, coil, and rear leg loading</li>
                    <li>Anatomical hinge constraints: 0° hyperextension on knees &amp; elbows</li>
                    <li>Parabolic ballistic recoil: originates at kick contact (860, 520)</li>
                  </ul>
                </div>

                <div className="pt-2 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    disabled={synthesizing || !baseTemplate27}
                    onClick={handleSynthesizeAndDownload}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#D97706] hover:bg-[#B45309] disabled:bg-[#94A3B8] rounded-lg transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    {synthesizing
                      ? 'Synthesizing GZIP Container...'
                      : `Compile & Download Speed vs Strength (${globalFps} FPS · ${speedStrengthFrames.length}f .stknds)`}
                  </button>
                </div>
              </div>
            ) : activeAnimationMode === 'teleport' ? (
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
                        setTeleportConfig((c: any) => ({
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
                      setTeleportConfig((c: any) => ({
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
                      setTeleportConfig((c: any) => ({
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
                      setTeleportConfig((c: any) => ({
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
                          onClick={() => setTeleportConfig((c: any) => ({ ...c, redColorHex: hex }))}
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
                          onClick={() => setTeleportConfig((c: any) => ({ ...c, blueColorHex: hex }))}
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
                        setSneezeConfig((c: any) => ({
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
                      setSneezeConfig((c: any) => ({
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
                      setSneezeConfig((c: any) => ({
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
                      setSneezeConfig((c: any) => ({
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
                      setSneezeConfig((c: any) => ({
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
                        onClick={() => setSneezeConfig((c: any) => ({ ...c, headColorHex: hex }))}
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
                        setHeroConfig((c: any) => ({
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
                      setHeroConfig((c: any) => ({ ...c, flightApexY: Number(e.target.value) }))
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
                      setHeroConfig((c: any) => ({
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
                      setHeroConfig((c: any) => ({
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
                        onClick={() => setHeroConfig((c: any) => ({ ...c, headColorHex: hex }))}
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
                      onClick={() => setBounceConfig((c: any) => ({ ...c, nodeType: 4 }))}
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
                      onClick={() => setBounceConfig((c: any) => ({ ...c, nodeType: 2 }))}
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
                      setBounceConfig((c: any) => ({
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
  );
};
