import React from 'react';
import { Target, Compass, Activity, CheckCircle2, Move, Footprints, ShieldAlert } from 'lucide-react';
import { solveLegLimb, solveArmLimb } from '../../lib/skills/kinematicsSolvers';

interface KinematicsIkTabProps {
  ikLimbType: 'LEG' | 'ARM';
  setIkLimbType: (val: 'LEG' | 'ARM') => void;
  ikFacingRight: boolean;
  setIkFacingRight: (val: boolean) => void;
  ikTargetFootX: number;
  setIkTargetFootX: (val: number) => void;
  ikTargetFootY: number;
  setIkTargetFootY: (val: number) => void;
  ikTargetHandX: number;
  setIkTargetHandX: (val: number) => void;
  ikTargetHandY: number;
  setIkTargetHandY: (val: number) => void;
  ikFootPlanted: boolean;
  setIkFootPlanted: (val: boolean) => void;
}

export const KinematicsIkTab: React.FC<KinematicsIkTabProps> = ({
  ikLimbType,
  setIkLimbType,
  ikFacingRight,
  setIkFacingRight,
  ikTargetFootX,
  setIkTargetFootX,
  ikTargetFootY,
  setIkTargetFootY,
  ikTargetHandX,
  setIkTargetHandX,
  ikTargetHandY,
  setIkTargetHandY,
  ikFootPlanted,
  setIkFootPlanted,
}) => {
  const legIK = solveLegLimb(240, 110, ikTargetFootX, ikTargetFootY, ikFacingRight, 0.55, ikFootPlanted);
  const armIK = solveArmLimb(240, 130, ikTargetHandX, ikTargetHandY, ikFacingRight, 0.55);
  const activeIK = ikLimbType === 'LEG' ? legIK.ikResult : armIK.ikResult;

  return (
              <div className="space-y-6">
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
                    <div>
                      <div className="text-xs font-mono text-[#0284C7] font-semibold flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5" />
                        ANALYTICAL 2-BONE INVERSE KINEMATICS &amp; CONNECTED LIMB SOLVER
                      </div>
                      <h3 className="text-base font-semibold text-[#0F172A]">
                        Interactive Limb Solving Studio (<code className="font-mono text-xs">HIP→KNEE→ANKLE→FOOT</code> &amp; <code className="font-mono text-xs">SHOULDER→ELBOW→WRIST→HAND</code>)
                      </h3>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Derived from research in <code className="font-mono text-xs">axharb/forward-and-inverse-kinematics</code>. Solves connected chains via Law of Cosines while enforcing 0° reverse hyperextension limits based on facing direction.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-lg text-xs">
                        <button
                          type="button"
                          onClick={() => setIkLimbType('LEG')}
                          className={`px-3 py-1 rounded font-medium transition-colors ${
                            ikLimbType === 'LEG'
                              ? 'bg-[#0284C7] text-white shadow-xs'
                              : 'text-[#475569] hover:text-[#0F172A]'
                          }`}
                        >
                          Leg Chain (Thigh + Shin + Foot)
                        </button>
                        <button
                          type="button"
                          onClick={() => setIkLimbType('ARM')}
                          className={`px-3 py-1 rounded font-medium transition-colors ${
                            ikLimbType === 'ARM'
                              ? 'bg-[#0284C7] text-white shadow-xs'
                              : 'text-[#475569] hover:text-[#0F172A]'
                          }`}
                        >
                          Arm Chain (Bicep + Forearm + Hand)
                        </button>
                      </div>

                      <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-lg text-xs">
                        <button
                          type="button"
                          onClick={() => setIkFacingRight(true)}
                          className={`px-2.5 py-1 rounded font-medium transition-colors ${
                            ikFacingRight
                              ? 'bg-white text-[#0F172A] shadow-xs'
                              : 'text-[#475569] hover:text-[#0F172A]'
                          }`}
                        >
                          Facing Right (+X)
                        </button>
                        <button
                          type="button"
                          onClick={() => setIkFacingRight(false)}
                          className={`px-2.5 py-1 rounded font-medium transition-colors ${
                            !ikFacingRight
                              ? 'bg-white text-[#0F172A] shadow-xs'
                              : 'text-[#475569] hover:text-[#0F172A]'
                          }`}
                        >
                          Facing Left (-X)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* SVG Interactive Canvas */}
                    <div className="lg:col-span-8 bg-[#0F172A] rounded-xl p-4 flex flex-col justify-between border border-[#334155]/60 relative overflow-hidden">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 z-10 pb-2 border-b border-slate-800">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse"></span>
                          2D Kinematic Canvas (Origin: Pelvis/Shoulder at X=240, Y=110)
                        </span>
                        <span>Ground Plane: Y=350 px</span>
                      </div>

                      <div className="my-2 flex items-center justify-center">
                        <svg
                          viewBox="0 0 540 380"
                          className="w-full h-[320px] select-none"
                        >
                          {/* Ground platform floor (High-Contrast, not black) */}
                          <rect x="0" y="350" width="540" height="30" fill="#E2E8F0" />
                          <line
                            x1="0"
                            y1="350"
                            x2="540"
                            y2="350"
                            stroke="#0284C7"
                            strokeWidth="2.5"
                          />
                          <text x="28" y="344" fill="#38BDF8" fontSize="10" fontFamily="monospace" fontWeight="bold">
                            Ground Platform Surface Y = 350 px
                          </text>

                          {/* Max reach circle from root */}
                          <circle
                            cx="240"
                            cy={ikLimbType === 'LEG' ? 110 : 130}
                            r={activeIK.maxReach}
                            fill="none"
                            stroke="#334155"
                            strokeWidth="1"
                            strokeDasharray="5 5"
                          />

                          {ikLimbType === 'LEG' ? (
                            <g>
                              {/* Pelvis Origin */}
                              <circle cx="240" cy="110" r="7" fill="#38BDF8" />
                              <text x="240" y="96" fill="#38BDF8" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                                Hip Root (Node 0)
                              </text>

                              {/* Thigh Bone */}
                              <line
                                x1="240"
                                y1="110"
                                x2={legIK.kneeX}
                                y2={legIK.kneeY}
                                stroke="#0284C7"
                                strokeWidth="8"
                                strokeLinecap="round"
                              />

                              {/* Knee Joint */}
                              <circle cx={legIK.kneeX} cy={legIK.kneeY} r="6" fill="#F59E0B" />
                              <text
                                x={legIK.kneeX + (ikFacingRight ? 12 : -12)}
                                y={legIK.kneeY - 6}
                                fill="#FCD34D"
                                fontSize="10"
                                textAnchor={ikFacingRight ? 'start' : 'end'}
                                fontFamily="monospace"
                              >
                                Knee ({legIK.ikResult.interiorAngleDeg.toFixed(0)}°)
                              </text>

                              {/* Shin Bone */}
                              <line
                                x1={legIK.kneeX}
                                y1={legIK.kneeY}
                                x2={legIK.ankleX}
                                y2={legIK.ankleY}
                                stroke="#10B981"
                                strokeWidth="7"
                                strokeLinecap="round"
                              />

                              {/* Ankle Joint */}
                              <circle cx={legIK.ankleX} cy={legIK.ankleY} r="5" fill="#EC4899" />

                              {/* Foot Bone */}
                              <line
                                x1={legIK.ankleX}
                                y1={legIK.ankleY}
                                x2={legIK.footTipX}
                                y2={legIK.footTipY}
                                stroke="#F43F5E"
                                strokeWidth="6"
                                strokeLinecap="round"
                              />

                              {/* Target Marker */}
                              <g transform={`translate(${ikTargetFootX}, ${ikTargetFootY})`}>
                                <circle cx="0" cy="0" r="9" fill="none" stroke="#EF4444" strokeWidth="2" strokeDasharray="3 3" />
                                <line x1="-12" y1="0" x2="12" y2="0" stroke="#EF4444" strokeWidth="1.5" />
                                <line x1="0" y1="-12" x2="0" y2="12" stroke="#EF4444" strokeWidth="1.5" />
                                <text x="14" y="4" fill="#F87171" fontSize="10" fontFamily="monospace">
                                  Target Foot ({ikTargetFootX}, {ikTargetFootY})
                                </text>
                              </g>
                            </g>
                          ) : (
                            <g>
                              {/* Shoulder Origin */}
                              <circle cx="240" cy="130" r="7" fill="#38BDF8" />
                              <text x="240" y="116" fill="#38BDF8" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                                Shoulder Origin (Node 8)
                              </text>

                              {/* Bicep Bone */}
                              <line
                                x1="240"
                                y1="130"
                                x2={armIK.elbowX}
                                y2={armIK.elbowY}
                                stroke="#0284C7"
                                strokeWidth="8"
                                strokeLinecap="round"
                              />

                              {/* Elbow Joint */}
                              <circle cx={armIK.elbowX} cy={armIK.elbowY} r="6" fill="#F59E0B" />
                              <text
                                x={armIK.elbowX + (ikFacingRight ? 12 : -12)}
                                y={armIK.elbowY - 6}
                                fill="#FCD34D"
                                fontSize="10"
                                textAnchor={ikFacingRight ? 'start' : 'end'}
                                fontFamily="monospace"
                              >
                                Elbow ({armIK.ikResult.interiorAngleDeg.toFixed(0)}°)
                              </text>

                              {/* Forearm Bone */}
                              <line
                                x1={armIK.elbowX}
                                y1={armIK.elbowY}
                                x2={armIK.wristX}
                                y2={armIK.wristY}
                                stroke="#10B981"
                                strokeWidth="7"
                                strokeLinecap="round"
                              />

                              {/* Wrist Joint */}
                              <circle cx={armIK.wristX} cy={armIK.wristY} r="5" fill="#EC4899" />

                              {/* Hand Bone */}
                              <line
                                x1={armIK.wristX}
                                y1={armIK.wristY}
                                x2={armIK.handTipX}
                                y2={armIK.handTipY}
                                stroke="#F43F5E"
                                strokeWidth="5"
                                strokeLinecap="round"
                              />

                              {/* Target Marker */}
                              <g transform={`translate(${ikTargetHandX}, ${ikTargetHandY})`}>
                                <circle cx="0" cy="0" r="9" fill="none" stroke="#EF4444" strokeWidth="2" strokeDasharray="3 3" />
                                <line x1="-12" y1="0" x2="12" y2="0" stroke="#EF4444" strokeWidth="1.5" />
                                <line x1="0" y1="-12" x2="0" y2="12" stroke="#EF4444" strokeWidth="1.5" />
                                <text x="14" y="4" fill="#F87171" fontSize="10" fontFamily="monospace">
                                  Target Hand ({ikTargetHandX}, {ikTargetHandY})
                                </text>
                              </g>
                            </g>
                          )}
                        </svg>
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800 pt-2">
                        <span>Distance D = {activeIK.distance.toFixed(1)} px / Max {activeIK.maxReach.toFixed(1)} px</span>
                        <span className={activeIK.reachable ? 'text-[#34D399]' : 'text-[#F87171]'}>
                          {activeIK.reachable ? '● TARGET WITHIN REACHABLE ENVELOPE' : '▲ TARGET CLAMPED AT MAX REACH'}
                        </span>
                      </div>
                    </div>

                    {/* Controls & Math Breakdown */}
                    <div className="lg:col-span-4 space-y-4 text-xs">
                      <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                        <div className="font-semibold text-[#0F172A] flex items-center justify-between">
                          <span>Target Coordinate Controls</span>
                          <span className="font-mono text-[11px] text-[#0284C7]">End-Effector Target</span>
                        </div>

                        {ikLimbType === 'LEG' ? (
                          <div className="space-y-2.5">
                            <div className="space-y-1">
                              <div className="flex justify-between font-mono text-[11px]">
                                <span>Foot Target X</span>
                                <span className="font-bold text-[#0F172A]">{ikTargetFootX} px</span>
                              </div>
                              <input
                                type="range"
                                min={80}
                                max={440}
                                value={ikTargetFootX}
                                onChange={(e) => setIkTargetFootX(Number(e.target.value))}
                                className="w-full accent-[#0284C7]"
                              />
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between font-mono text-[11px]">
                                <span>Foot Target Y</span>
                                <span className="font-bold text-[#0F172A]">{ikTargetFootY} px</span>
                              </div>
                              <input
                                type="range"
                                min={150}
                                max={350}
                                value={ikTargetFootY}
                                onChange={(e) => setIkTargetFootY(Number(e.target.value))}
                                className="w-full accent-[#0284C7]"
                              />
                            </div>

                            <div className="pt-1 flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="ik-foot-plant"
                                checked={ikFootPlanted}
                                onChange={(e) => setIkFootPlanted(e.target.checked)}
                                className="accent-[#0284C7] rounded"
                              />
                              <label htmlFor="ik-foot-plant" className="text-xs text-[#334155] font-medium">
                                Lock Flat Foot to Ground Plane (0° / 180°)
                              </label>
                            </div>

                            <div className="pt-2 border-t border-[#E2E8F0] space-y-1">
                              <span className="text-[10px] font-mono text-[#64748B]">Quick Kinematic Presets:</span>
                              <div className="grid grid-cols-2 gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => { setIkTargetFootX(240); setIkTargetFootY(350); setIkFootPlanted(true); }}
                                  className="px-2 py-1 rounded bg-white border border-[#CBD5E1] text-[11px] hover:bg-[#F1F5F9] font-medium"
                                >
                                  Standing Plant
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setIkTargetFootX(330); setIkTargetFootY(350); setIkFootPlanted(true); }}
                                  className="px-2 py-1 rounded bg-white border border-[#CBD5E1] text-[11px] hover:bg-[#F1F5F9] font-medium"
                                >
                                  Forward Stride
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setIkTargetFootX(330); setIkTargetFootY(200); setIkFootPlanted(false); }}
                                  className="px-2 py-1 rounded bg-white border border-[#CBD5E1] text-[11px] hover:bg-[#F1F5F9] font-medium"
                                >
                                  High Roundhouse
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setIkTargetFootX(150); setIkTargetFootY(340); setIkFootPlanted(false); }}
                                  className="px-2 py-1 rounded bg-white border border-[#CBD5E1] text-[11px] hover:bg-[#F1F5F9] font-medium"
                                >
                                  Rear Push-Off
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            <div className="space-y-1">
                              <div className="flex justify-between font-mono text-[11px]">
                                <span>Hand Target X</span>
                                <span className="font-bold text-[#0F172A]">{ikTargetHandX} px</span>
                              </div>
                              <input
                                type="range"
                                min={80}
                                max={440}
                                value={ikTargetHandX}
                                onChange={(e) => setIkTargetHandX(Number(e.target.value))}
                                className="w-full accent-[#0284C7]"
                              />
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between font-mono text-[11px]">
                                <span>Hand Target Y</span>
                                <span className="font-bold text-[#0F172A]">{ikTargetHandY} px</span>
                              </div>
                              <input
                                type="range"
                                min={80}
                                max={340}
                                value={ikTargetHandY}
                                onChange={(e) => setIkTargetHandY(Number(e.target.value))}
                                className="w-full accent-[#0284C7]"
                              />
                            </div>

                            <div className="pt-2 border-t border-[#E2E8F0] space-y-1">
                              <span className="text-[10px] font-mono text-[#64748B]">Quick Arm Presets:</span>
                              <div className="grid grid-cols-2 gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => { setIkTargetHandX(310); setIkTargetHandY(160); }}
                                  className="px-2 py-1 rounded bg-white border border-[#CBD5E1] text-[11px] hover:bg-[#F1F5F9] font-medium"
                                >
                                  High Guard Shield
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setIkTargetHandX(390); setIkTargetHandY(180); }}
                                  className="px-2 py-1 rounded bg-white border border-[#CBD5E1] text-[11px] hover:bg-[#F1F5F9] font-medium"
                                >
                                  Extended Punch
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setIkTargetHandX(190); setIkTargetHandY(330); }}
                                  className="px-2 py-1 rounded bg-white border border-[#CBD5E1] text-[11px] hover:bg-[#F1F5F9] font-medium"
                                >
                                  Seated Floor Strut
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setIkTargetHandX(240); setIkTargetHandY(290); }}
                                  className="px-2 py-1 rounded bg-white border border-[#CBD5E1] text-[11px] hover:bg-[#F1F5F9] font-medium"
                                >
                                  Relaxed Drop
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Kinematic Angle Telemetry */}
                      <div className="p-3.5 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-[#065F46]">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                            Biological Hinge Law Enforced
                          </span>
                          <span className="font-mono text-[10px]">0° Hyperextension</span>
                        </div>
                        <div className="space-y-1 font-mono text-[11px] text-[#064E3B]">
                          <div className="flex justify-between">
                            <span>Upper Segment World Angle:</span>
                            <span className="font-bold">{activeIK.upperAngleDeg.toFixed(1)}°</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Lower Segment World Angle:</span>
                            <span className="font-bold">{activeIK.lowerAngleDeg.toFixed(1)}°</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Interior Joint Flexion (γ):</span>
                            <span className="font-bold">{activeIK.interiorAngleDeg.toFixed(1)}°</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-[#A7F3D0]">
                            <span>Polarity Law Compliance:</span>
                            <span className="text-[#059669] font-bold">100% Anatomical</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
  );
};
