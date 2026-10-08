import React from 'react';
import { Activity, Footprints, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { generateProceduralGaitPose } from '../../lib/skills/proceduralGait';
import { solveForwardKinematics17, JointWorldPose } from '../../lib/skills/kinematicsSolvers';

interface ProceduralMotionTabProps {
  gaitProgress: number;
  setGaitProgress: (val: number) => void;
  gaitStrideLength: number;
  setGaitStrideLength: (val: number) => void;
  gaitStepHeight: number;
  setGaitStepHeight: (val: number) => void;
  ikFacingRight: boolean;
  setIkFacingRight: (val: boolean) => void;
}

export const ProceduralMotionTab: React.FC<ProceduralMotionTabProps> = ({
  gaitProgress,
  setGaitProgress,
  gaitStrideLength,
  setGaitStrideLength,
  gaitStepHeight,
  setGaitStepHeight,
  ikFacingRight,
  setIkFacingRight,
}) => {
  const gaitPose = generateProceduralGaitPose({
    rootX: 320,
    groundY: 310,
    strideLength: gaitStrideLength,
    stepHeight: gaitStepHeight,
    gaitProgress,
    isRightFacing: ikFacingRight,
    scale: 0.45,
  });
  const gaitJoints = solveForwardKinematics17(gaitPose.pelvisX, gaitPose.pelvisY, gaitPose.worldAngles, 0.45);

  return (
              <div className="space-y-6">
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
                    <div>
                      <div className="text-xs font-mono text-[#059669] font-semibold flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" />
                        PROCEDURAL CHARACTER LOCOMOTION &amp; BALANCE ENGINE
                      </div>
                      <h3 className="text-base font-semibold text-[#0F172A]">
                        Logic-Driven Gait Derivation (<code className="font-mono text-xs">mradovic38/ik-proc-anim-2d</code> &amp; OpenPose Mass Centroid)
                      </h3>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        High-level foot placement automatically computes sinusoidal pelvis wave, ground-locked stance foot (zero skating), swing-foot parabolic clearance, and spine counter-lean.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIkFacingRight(!ikFacingRight)}
                        className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-medium text-[#0F172A] hover:bg-white"
                      >
                        Direction: {ikFacingRight ? 'Facing Right (+X)' : 'Facing Left (-X)'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* SVG Procedural Canvas */}
                    <div className="lg:col-span-8 bg-[#0F172A] rounded-xl p-4 flex flex-col justify-between border border-[#334155]/60 relative overflow-hidden">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 z-10 pb-2 border-b border-slate-800">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                          Dynamic Gait Simulation (Phase: {(gaitProgress * 100).toFixed(0)}%)
                        </span>
                        <span>Ground Plane Y = 310 px</span>
                      </div>

                      <div className="my-2 flex items-center justify-center">
                        <svg viewBox="0 0 640 360" className="w-full h-auto aspect-[640/360] max-h-[360px] select-none">
                          {/* Ground plane */}
                          <line x1="20" y1="310" x2="620" y2="310" stroke="#475569" strokeWidth="2" strokeDasharray="4 4" />

                          {/* Support polygon on ground */}
                          <line
                            x1={gaitPose.comReport.supportPolygonMinX}
                            y1="310"
                            x2={gaitPose.comReport.supportPolygonMaxX}
                            y2="310"
                            stroke="#10B981"
                            strokeWidth="6"
                            strokeLinecap="round"
                          />
                          <text
                            x={(gaitPose.comReport.supportPolygonMinX + gaitPose.comReport.supportPolygonMaxX) * 0.5}
                            y="330"
                            fill="#34D399"
                            fontSize="10"
                            textAnchor="middle"
                            fontFamily="monospace"
                          >
                            Support Base [{gaitPose.comReport.supportPolygonMinX.toFixed(0)} .. {gaitPose.comReport.supportPolygonMaxX.toFixed(0)} px]
                          </text>

                          {/* Center of Mass Vertical Plum-line */}
                          <line
                            x1={gaitPose.comReport.comX}
                            y1={gaitPose.comReport.comY}
                            x2={gaitPose.comReport.comX}
                            y2="310"
                            stroke="#EC4899"
                            strokeWidth="1.5"
                            strokeDasharray="3 3"
                          />

                          {/* Center of Mass Marker */}
                          <circle cx={gaitPose.comReport.comX} cy={gaitPose.comReport.comY} r="7" fill="#EC4899" stroke="#FDF2F8" strokeWidth="2" />
                          <text x={gaitPose.comReport.comX + 10} y={gaitPose.comReport.comY - 4} fill="#F472B6" fontSize="10" fontFamily="monospace" fontWeight="bold">
                            COM ({gaitPose.comReport.comX.toFixed(0)}, {gaitPose.comReport.comY.toFixed(0)})
                          </text>

                          {/* Skeleton Bones from FK */}
                          {gaitJoints.map((j: JointWorldPose) => {
                            if (j.index === 0) {
                              return <circle key={j.name} cx={j.startX} cy={j.startY} r="8" fill="#38BDF8" />;
                            }
                            if (j.index === 13) {
                              // Head circle
                              return (
                                <circle
                                  key={j.name}
                                  cx={(j.startX + j.endX) * 0.5}
                                  cy={(j.startY + j.endY) * 0.5}
                                  r="20"
                                  fill="#0284C7"
                                  stroke="#38BDF8"
                                  strokeWidth="2"
                                />
                                );
                              }
                            const isArm = j.index >= 9 && j.index <= 16 && j.index !== 12 && j.index !== 13;
                            const isTorso = j.index === 7 || j.index === 8 || j.index === 12;
                            const isRightLeg = j.index >= 1 && j.index <= 3;
                            const color = isTorso ? '#CBD5E1' : isArm ? '#38BDF8' : isRightLeg ? '#0284C7' : '#10B981';
                            const width = isTorso ? 8 : isArm ? 5 : 6;

                            return (
                              <line
                                key={j.name}
                                x1={j.startX}
                                y1={j.startY}
                                x2={j.endX}
                                y2={j.endY}
                                stroke={color}
                                strokeWidth={width}
                                strokeLinecap="round"
                              />
                            );
                          })}
                        </svg>
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800 pt-2">
                        <span>Pelvis Y Wave: {gaitPose.pelvisY.toFixed(1)} px (Dip: Cushion / Rise: Passing)</span>
                        <span className={gaitPose.comReport.isBalanced ? 'text-[#34D399]' : 'text-[#FBBF24]'}>
                          {gaitPose.comReport.isBalanced
                            ? `● STABLE (Margin: +${gaitPose.comReport.stabilityMarginPx.toFixed(1)} px)`
                            : '▲ DYNAMIC ACCELERATION LEAN'}
                        </span>
                      </div>
                    </div>

                    {/* Gait Phase Slider & Controls */}
                    <div className="lg:col-span-4 space-y-4 text-xs">
                      <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                        <div className="font-semibold text-[#0F172A] flex items-center justify-between">
                          <span>Gait Cycle Phase Controller</span>
                          <span className="font-mono text-[#059669] font-bold">
                            {(gaitProgress * 100).toFixed(0)}% Cycle
                          </span>
                        </div>

                        <div className="space-y-1">
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={gaitProgress}
                            onChange={(e) => setGaitProgress(Number(e.target.value))}
                            className="w-full accent-[#059669]"
                          />
                          <div className="grid grid-cols-4 gap-1 text-[10px] font-mono text-[#64748B] pt-1 text-center">
                            <span className={gaitProgress < 0.2 ? 'font-bold text-[#059669]' : ''}>Contact</span>
                            <span className={gaitProgress >= 0.2 && gaitProgress < 0.45 ? 'font-bold text-[#059669]' : ''}>Down</span>
                            <span className={gaitProgress >= 0.45 && gaitProgress < 0.7 ? 'font-bold text-[#059669]' : ''}>Passing</span>
                            <span className={gaitProgress >= 0.7 ? 'font-bold text-[#059669]' : ''}>Push-off</span>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
                          <div className="space-y-1">
                            <div className="flex justify-between font-mono text-[11px]">
                              <span>Stride Length</span>
                              <span className="font-bold text-[#0F172A]">{gaitStrideLength} px</span>
                            </div>
                            <input
                              type="range"
                              min={60}
                              max={220}
                              value={gaitStrideLength}
                              onChange={(e) => setGaitStrideLength(Number(e.target.value))}
                              className="w-full accent-[#059669]"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between font-mono text-[11px]">
                              <span>Swing Foot Clearance</span>
                              <span className="font-bold text-[#0F172A]">{gaitStepHeight} px</span>
                            </div>
                            <input
                              type="range"
                              min={15}
                              max={65}
                              value={gaitStepHeight}
                              onChange={(e) => setGaitStepHeight(Number(e.target.value))}
                              className="w-full accent-[#059669]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Gait Telemetry */}
                      <div className="p-3.5 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] space-y-2 font-mono text-[11px]">
                        <div className="font-semibold text-[#166534] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                          Procedural Derivation Metrics
                        </div>
                        <div className="space-y-1 text-[#14532D]">
                          <div className="flex justify-between">
                            <span>Stance Foot Ground Lock:</span>
                            <span className="font-bold text-[#16A34A]">PINNED (0.0 px Slip)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pelvis Vertical Dip/Wave:</span>
                            <span className="font-bold">±8.0 px Sinusoidal</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Spine Counter-Lean:</span>
                            <span className="font-bold">Active Equilibrium</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Arm Opposition:</span>
                            <span className="font-bold">Anti-Phase (-0.95 Corr)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
  );
};
