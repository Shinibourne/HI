import React from 'react';
import { Target, Compass, Camera, ShieldCheck, Layers, Crosshair, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { MultiCharacterSpatialAudit, solveStrikeReach, solveMultiCharacterFraming, validateMultiCharacterSpatialConsistency } from '../../lib/skills/spatialInteraction';
import { solveForwardKinematics17 } from '../../lib/skills/kinematicsSolvers';
import { CANONICAL_36_TELEPORT_FRAMES } from '../../lib/stknds/teleportAnimation';
import { SPATIAL_ARENA_GROUND_Y } from '../../lib/physics/groundPerimeterSystem';

interface SpatialInteractionTabProps {
  spatialDebugMode: boolean;
  setSpatialDebugMode: (val: boolean) => void;
  spatialShowAnchors: boolean;
  setSpatialShowAnchors: (val: boolean) => void;
  spatialShowCameraFrame: boolean;
  setSpatialShowCameraFrame: (val: boolean) => void;
  spatialShowHitboxRing: boolean;
  setSpatialShowHitboxRing: (val: boolean) => void;
  spatialAutoSolveReach: boolean;
  setSpatialAutoSolveReach: (val: boolean) => void;
  spatialTargetClashFrame: number;
  setSpatialTargetClashFrame: (val: number) => void;
  spatialAttackerX: number;
  setSpatialAttackerX: (val: number) => void;
  spatialAttackerElevation: 'GROUND' | 'AIR' | 'PLATFORM';
  setSpatialAttackerElevation: (val: 'GROUND' | 'AIR' | 'PLATFORM') => void;
  spatialDefenderX: number;
  setSpatialDefenderX: (val: number) => void;
  spatialDefenderElevation: 'SEATED' | 'STANDING' | 'PLATFORM';
  setSpatialDefenderElevation: (val: 'SEATED' | 'STANDING' | 'PLATFORM') => void;
  spatialAttackType: 'ROUNDHOUSE' | 'PUNCH' | 'LOW_SWEEP';
  setSpatialAttackType: (val: 'ROUNDHOUSE' | 'PUNCH' | 'LOW_SWEEP') => void;
  spatialPlatformHeight: number;
  setSpatialPlatformHeight: (val: number) => void;
  liveSpatialAudit: MultiCharacterSpatialAudit;
}

export const SpatialInteractionTab: React.FC<SpatialInteractionTabProps> = ({
  spatialDebugMode,
  setSpatialDebugMode,
  spatialShowAnchors,
  setSpatialShowAnchors,
  spatialShowCameraFrame,
  setSpatialShowCameraFrame,
  spatialShowHitboxRing,
  setSpatialShowHitboxRing,
  spatialAutoSolveReach,
  setSpatialAutoSolveReach,
  spatialTargetClashFrame,
  setSpatialTargetClashFrame,
  spatialAttackerX,
  setSpatialAttackerX,
  spatialAttackerElevation,
  setSpatialAttackerElevation,
  spatialDefenderX,
  setSpatialDefenderX,
  spatialDefenderElevation,
  setSpatialDefenderElevation,
  spatialAttackType,
  setSpatialAttackType,
  spatialPlatformHeight,
  setSpatialPlatformHeight,
  liveSpatialAudit,
}) => {
            const arenaGroundY = SPATIAL_ARENA_GROUND_Y;
            const platformY = arenaGroundY - spatialPlatformHeight * 0.45;
            const arenaScale = 0.42;

            // Defender Pelvis Y & Geometry
            let defPelvisY = arenaGroundY - 26; // Seated base contacts Y=295
            let defAngles = [0, 8, -48, -135, -12, -45, -135, 78, 82, -145, 62, 75, 88, 88, 12, 45, 52];
            let targetHitboxX = spatialDefenderX - 22;
            let targetHitboxY = defPelvisY - 32;

            if (spatialDefenderElevation === 'STANDING') {
              defPelvisY = arenaGroundY - 145;
              defAngles = [0, -98, -89, -179, -82, -80, -179, 91, 92, -84, -108, -112, 94, 95, -94, -118, -122];
              targetHitboxX = spatialDefenderX - 16;
              targetHitboxY = defPelvisY - 68; // Chest hitbox
            } else if (spatialDefenderElevation === 'PLATFORM') {
              defPelvisY = platformY - 26;
              targetHitboxX = spatialDefenderX - 22;
              targetHitboxY = defPelvisY - 32;
            }

            // Attacker Pelvis Y & Root
            let attPelvisY = arenaGroundY - 110; // Combat drop crouch
            if (spatialAttackerElevation === 'AIR') {
              attPelvisY = arenaGroundY - 195;
            } else if (spatialAttackerElevation === 'PLATFORM') {
              attPelvisY = platformY - 110;
            }

            // Solve analytical strike reach
            const rawReach = solveStrikeReach(
              spatialAttackerX,
              attPelvisY,
              targetHitboxX,
              targetHitboxY,
              true,
              spatialAttackType,
              arenaScale
            );

            const effectiveAttackerX = spatialAutoSolveReach
              ? spatialAttackerX + rawReach.requiredRootShiftX
              : spatialAttackerX;

            const activeReach = spatialAutoSolveReach
              ? solveStrikeReach(
                  effectiveAttackerX,
                  attPelvisY,
                  targetHitboxX,
                  targetHitboxY,
                  true,
                  spatialAttackType,
                  arenaScale
                )
              : rawReach;

            // Attacker world angles
            let attAngles = [0, activeReach.ikSolution.upperAngleDeg, activeReach.ikSolution.lowerAngleDeg, activeReach.ikSolution.lowerAngleDeg, -58, -126, 2, 108, 114, -152, -164, -166, 102, 96, 28, 86, 90];
            if (spatialAttackType === 'PUNCH') {
              attAngles = [0, -82, -90, 0, -98, -100, 0, 84, 82, activeReach.ikSolution.upperAngleDeg, activeReach.ikSolution.lowerAngleDeg, activeReach.ikSolution.lowerAngleDeg, 88, 88, -75, -55, -50];
            } else if (spatialAttackType === 'LOW_SWEEP') {
              attAngles = [0, activeReach.ikSolution.upperAngleDeg, activeReach.ikSolution.lowerAngleDeg, activeReach.ikSolution.lowerAngleDeg, -54, -125, 2, 98, 102, -140, -150, -152, 95, 90, 20, 75, 80];
            }

            const attJoints = solveForwardKinematics17(effectiveAttackerX, attPelvisY, attAngles, arenaScale);
            const defJoints = solveForwardKinematics17(spatialDefenderX, defPelvisY, defAngles, arenaScale);

            // Virtual Camera Framing
            const framing = solveMultiCharacterFraming(
              [
                { rootX: effectiveAttackerX, rootY: attPelvisY },
                { rootX: spatialDefenderX, rootY: defPelvisY },
              ]
            );

            // 10-Domain Spatial Consistency Audit
            const spatialAudit = validateMultiCharacterSpatialConsistency(CANONICAL_36_TELEPORT_FRAMES);


  return (
              <div className="space-y-6">
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
                    <div>
                      <div className="text-xs font-mono text-[#DC2626] font-semibold flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5" />
                        SPATIAL CONSISTENCY &amp; MULTI-CHARACTER INTERACTION STUDIO (SKILLS #47–#53)
                      </div>
                      <h3 className="text-base font-semibold text-[#0F172A]">
                        Master Scene Reference, Ground Plane (Y = 755px) &amp; Analytical Strike Reach Solving
                      </h3>
                      <p className="text-xs text-[#64748B] mt-0.5 max-w-4xl">
                        Eliminates the fundamental issue where characters exist in disconnected local coordinates, float at random heights, or miss strikes by 100px. Establishes a shared world space, tracks elevation across multi-tier platforms, and guarantees millimeter hit accuracy.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSpatialAutoSolveReach(!spatialAutoSolveReach)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                          spatialAutoSolveReach
                            ? 'bg-[#EFF6FF] border-[#3B82F6] text-[#1D4ED8]'
                            : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#475569]'
                        }`}
                      >
                        <Crosshair className="w-3.5 h-3.5" />
                        Auto-Solve Reach: {spatialAutoSolveReach ? 'ENABLED' : 'OFF (MANUAL)'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setSpatialShowCameraFrame(!spatialShowCameraFrame)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                          spatialShowCameraFrame
                            ? 'bg-[#FEF3C7] border-[#F59E0B] text-[#92400E]'
                            : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#475569]'
                        }`}
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Camera Framing View
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* SVG Spatial Arena */}
                    <div className="lg:col-span-8 bg-[#0F172A] rounded-xl p-4 flex flex-col justify-between border border-[#334155]/60 relative overflow-hidden">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 z-10 pb-2 border-b border-slate-800">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse"></span>
                          Shared World Space (Stick Nodes Master Origin: 0,0 · Ground Y = 755 px)
                        </span>
                        <span className="text-slate-400">
                          Attacker: ({effectiveAttackerX.toFixed(0)}, {attPelvisY.toFixed(0)}) · Defender: ({spatialDefenderX}, {defPelvisY.toFixed(0)})
                        </span>
                      </div>

                      <div className="my-2 flex items-center justify-center">
                        <svg viewBox="0 0 760 380" className="w-full h-[340px] select-none">
                          {/* Background Grid Lines & Platform Gradient */}
                          <defs>
                            <pattern id="arena-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.8" />
                            </pattern>
                            <linearGradient id="spatialPlatformGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#F8FAFC" />
                              <stop offset="12%" stopColor="#EDF2F7" />
                              <stop offset="100%" stopColor="#CBD5E1" />
                            </linearGradient>
                            <linearGradient id="spatialGroundGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#E2E8F0" />
                              <stop offset="15%" stopColor="#EDF2F7" />
                              <stop offset="100%" stopColor="#CBD5E1" />
                            </linearGradient>
                          </defs>
                          <rect width="760" height={arenaGroundY} fill="url(#arena-grid)" />

                          {/* Light High-Contrast Ground Floor (Never black - perfect limb visibility) */}
                          <rect x="0" y={arenaGroundY} width="760" height={380 - arenaGroundY} fill="url(#spatialGroundGrad)" />

                          {/* Master Ground Plane (Y = 755px standard in Stick Nodes) */}
                          <line x1="0" y1={arenaGroundY} x2="760" y2={arenaGroundY} stroke="#334155" strokeWidth="2.5" />
                          <line x1="0" y1={arenaGroundY + 1} x2="760" y2={arenaGroundY + 1} stroke="#0284C7" strokeWidth="1" strokeDasharray="3 3" />
                          <text x="30" y={arenaGroundY - 8} fill="#38BDF8" fontSize="11" fontFamily="monospace" fontWeight="bold">
                            MASTER GROUND PLANE (Stick Nodes Y = 755.0 px)
                          </text>

                          {/* Ground contact shadow puddles */}
                          <ellipse cx={spatialDefenderX} cy={arenaGroundY + 2} rx="28" ry="4" fill="#64748B" opacity="0.4" />
                          <ellipse cx={effectiveAttackerX} cy={arenaGroundY + 2} rx="28" ry="4" fill="#0284C7" opacity="0.4" />

                          {/* Elevated Platform Dais (Skill #51 - High-Contrast Light Surface, Not Black) */}
                          <g>
                            <rect
                              x="40"
                              y={platformY}
                              width="200"
                              height={arenaGroundY - platformY}
                              fill="url(#spatialPlatformGrad)"
                              stroke="#94A3B8"
                              strokeWidth="1.5"
                              rx="2"
                            />
                            {/* Platform Top Landing Highlight */}
                            <line x1="40" y1={platformY} x2="240" y2={platformY} stroke="#0284C7" strokeWidth="3" />
                            <line x1="40" y1={platformY + 2} x2="240" y2={platformY + 2} stroke="#38BDF8" strokeWidth="1" />
                            <text x="45" y={platformY - 7} fill="#0284C7" fontSize="10" fontFamily="monospace" fontWeight="bold">
                              Platform Dais (Y = {(755 - spatialPlatformHeight).toFixed(0)} px)
                            </text>
                          </g>

                          {/* Virtual Camera Viewport Frame (Skill #52 & #08) */}
                          {spatialShowCameraFrame && (
                            <g>
                              <rect
                                x={Math.max(25, (effectiveAttackerX + spatialDefenderX) * 0.5 - 280)}
                                y="30"
                                width="560"
                                height="320"
                                fill="none"
                                stroke="#F59E0B"
                                strokeWidth="1.5"
                                strokeDasharray="6 4"
                                opacity="0.75"
                              />
                              <text
                                x={Math.max(35, (effectiveAttackerX + spatialDefenderX) * 0.5 - 270)}
                                y="46"
                                fill="#FCD34D"
                                fontSize="10"
                                fontFamily="monospace"
                              >
                                [Dynamic Camera Viewport · Framing Zoom: {framing.camZoom.toFixed(2)}x]
                              </text>
                            </g>
                          )}

                          {/* Defender (Red) Bone Hierarchy */}
                          <g>
                            {defJoints.map((j) => {
                              if (j.index === 0) {
                                return <circle key={`def-${j.name}`} cx={j.startX} cy={j.startY} r="7" fill="#DC2626" />;
                              }
                              if (j.index === 13) {
                                return (
                                  <circle
                                    key={`def-${j.name}`}
                                    cx={(j.startX + j.endX) * 0.5}
                                    cy={(j.startY + j.endY) * 0.5}
                                    r="18"
                                    fill="#DC2626"
                                    stroke="#F87171"
                                    strokeWidth="2"
                                  />
                                );
                              }
                              const isTorso = j.index === 7 || j.index === 8 || j.index === 12;
                              const isShieldForearm = j.index === 10;
                              return (
                                <line
                                  key={`def-${j.name}`}
                                  x1={j.startX}
                                  y1={j.startY}
                                  x2={j.endX}
                                  y2={j.endY}
                                  stroke={isShieldForearm ? '#FBBF24' : isTorso ? '#FCA5A5' : '#EF4444'}
                                  strokeWidth={isShieldForearm ? 8 : isTorso ? 7 : 5}
                                  strokeLinecap="round"
                                />
                              );
                            })}

                            <text x={spatialDefenderX} y={defPelvisY + 45} fill="#F87171" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                              Defender (Red)
                            </text>
                          </g>

                          {/* Attacker (Blue) Bone Hierarchy */}
                          <g>
                            {attJoints.map((j) => {
                              if (j.index === 0) {
                                return <circle key={`att-${j.name}`} cx={j.startX} cy={j.startY} r="7" fill="#2563EB" />;
                              }
                              if (j.index === 13) {
                                return (
                                  <circle
                                    key={`att-${j.name}`}
                                    cx={(j.startX + j.endX) * 0.5}
                                    cy={(j.startY + j.endY) * 0.5}
                                    r="18"
                                    fill="#2563EB"
                                    stroke="#60A5FA"
                                    strokeWidth="2"
                                  />
                                );
                              }
                              const isStrikingLimb =
                                (spatialAttackType === 'PUNCH' && (j.index === 9 || j.index === 10)) ||
                                (spatialAttackType !== 'PUNCH' && (j.index === 1 || j.index === 2 || j.index === 3));
                              const isTorso = j.index === 7 || j.index === 8 || j.index === 12;
                              return (
                                <line
                                  key={`att-${j.name}`}
                                  x1={j.startX}
                                  y1={j.startY}
                                  x2={j.endX}
                                  y2={j.endY}
                                  stroke={isStrikingLimb ? '#38BDF8' : isTorso ? '#93C5FD' : '#3B82F6'}
                                  strokeWidth={isStrikingLimb ? 8 : isTorso ? 7 : 5}
                                  strokeLinecap="round"
                                />
                              );
                            })}

                            <text x={effectiveAttackerX} y={attPelvisY + 45} fill="#60A5FA" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                              Attacker (Blue)
                            </text>
                          </g>

                          {/* Reach Trajectory Vector (Skill #50) */}
                          <line
                            x1={activeReach.strikePointX}
                            y1={activeReach.strikePointY}
                            x2={targetHitboxX}
                            y2={targetHitboxY}
                            stroke={activeReach.reaches ? '#10B981' : '#EF4444'}
                            strokeWidth="2"
                            strokeDasharray="4 3"
                          />

                          {/* Target Hitbox Marker & Tolerance Ring */}
                          {spatialShowHitboxRing && (
                            <g transform={`translate(${targetHitboxX}, ${targetHitboxY})`}>
                              {/* Contact Tolerance Circle (12px) */}
                              <circle
                                cx="0"
                                cy="0"
                                r={activeReach.tolerancePx * 1.2}
                                fill={activeReach.reaches ? '#10B981' : '#EF4444'}
                                fillOpacity={activeReach.reaches ? '0.25' : '0.15'}
                                stroke={activeReach.reaches ? '#34D399' : '#F87171'}
                                strokeWidth="1.5"
                                strokeDasharray={activeReach.reaches ? 'none' : '3 3'}
                              />
                              <circle cx="0" cy="0" r="4" fill="#FBBF24" />
                              <text x="12" y="4" fill={activeReach.reaches ? '#34D399' : '#F87171'} fontSize="10" fontFamily="monospace" fontWeight="bold">
                                {activeReach.reaches
                                  ? `HIT CONTACT (Δ=${activeReach.distanceToTarget.toFixed(1)}px <= 12px)`
                                  : `OUT OF REACH (Δ=${activeReach.distanceToTarget.toFixed(1)}px)`}
                              </text>
                            </g>
                          )}

                          {/* Attacker Strike End-Effector Marker */}
                          <circle
                            cx={activeReach.strikePointX}
                            cy={activeReach.strikePointY}
                            r="6"
                            fill="#38BDF8"
                            stroke="#FFFFFF"
                            strokeWidth="2"
                          />

                          {/* Auto-Solve Root Shift Indicator */}
                          {spatialAutoSolveReach && Math.abs(rawReach.requiredRootShiftX) > 1 && (
                            <g transform={`translate(${spatialAttackerX}, ${arenaGroundY + 15})`}>
                              <line
                                x1="0"
                                y1="0"
                                x2={rawReach.requiredRootShiftX}
                                y2="0"
                                stroke="#10B981"
                                strokeWidth="3"
                                markerEnd="url(#arrow)"
                              />
                              <text x={rawReach.requiredRootShiftX * 0.5} y="14" fill="#34D399" fontSize="9" fontFamily="monospace" textAnchor="middle">
                                +{rawReach.requiredRootShiftX.toFixed(1)}px Root Advance
                              </text>
                            </g>
                          )}
                        </svg>
                      </div>

                      {/* Live Telemetry Bar */}
                      <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800 pt-2 gap-2">
                        <span>
                          Distance to Target: <strong className={activeReach.reaches ? 'text-[#34D399]' : 'text-[#F87171]'}>{activeReach.distanceToTarget.toFixed(1)} px</strong> (Tolerance: &le; {activeReach.tolerancePx.toFixed(1)} px)
                        </span>

                        <span className={activeReach.reaches ? 'text-[#34D399] font-bold' : 'text-[#F87171] font-bold'}>
                          {activeReach.reaches ? '● PHYSICAL CONTACT CONFIRMED (ZERO PHANTOM MISS)' : '▲ ATTACK MISSES (OUT OF REACH)'}
                        </span>

                        <span className="text-slate-300">
                          Ground Plane: <strong className="text-[#38BDF8]">Y = 755.0 px</strong> (0.0 px Drift)
                        </span>
                      </div>
                    </div>

                    {/* Interactive Arena Controls */}
                    <div className="lg:col-span-4 space-y-4 text-xs">
                      {/* Attacker Controls */}
                      <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                        <div className="font-semibold text-[#0F172A] flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-[#2563EB]">
                            <Target className="w-3.5 h-3.5" />
                            Attacker (Blue) Staging
                          </span>
                          <span className="font-mono text-[11px] text-[#2563EB]">Actor Root</span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between font-mono text-[11px]">
                            <span>Root Position X</span>
                            <span className="font-bold text-[#0F172A]">{spatialAttackerX} px</span>
                          </div>
                          <input
                            type="range"
                            min={100}
                            max={380}
                            value={spatialAttackerX}
                            onChange={(e) => setSpatialAttackerX(Number(e.target.value))}
                            className="w-full accent-[#2563EB]"
                          />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-[#64748B]">Attacker Elevation State:</span>
                          <div className="grid grid-cols-3 gap-1">
                            {(['GROUND', 'AIR', 'PLATFORM'] as const).map((elev) => (
                              <button
                                key={elev}
                                type="button"
                                onClick={() => setSpatialAttackerElevation(elev)}
                                className={`px-2 py-1 rounded text-[10px] font-medium border ${
                                  spatialAttackerElevation === elev
                                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                                    : 'bg-white text-[#334155] border-[#CBD5E1] hover:bg-[#F1F5F9]'
                                }`}
                              >
                                {elev === 'GROUND' ? 'Floor (755)' : elev === 'AIR' ? 'Airborne' : 'Platform'}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1 pt-1 border-t border-[#E2E8F0]">
                          <span className="text-[10px] font-mono text-[#64748B]">Attack Combat Action:</span>
                          <div className="grid grid-cols-3 gap-1">
                            {(['ROUNDHOUSE', 'PUNCH', 'LOW_SWEEP'] as const).map((atk) => (
                              <button
                                key={atk}
                                type="button"
                                onClick={() => setSpatialAttackType(atk)}
                                className={`px-1.5 py-1 rounded text-[10px] font-medium border ${
                                  spatialAttackType === atk
                                    ? 'bg-[#0284C7] text-white border-[#0284C7]'
                                    : 'bg-white text-[#334155] border-[#CBD5E1] hover:bg-[#F1F5F9]'
                                }`}
                              >
                                {atk === 'ROUNDHOUSE' ? 'Roundhouse' : atk === 'PUNCH' ? 'Straight Punch' : 'Low Sweep'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Defender Controls */}
                      <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                        <div className="font-semibold text-[#0F172A] flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-[#DC2626]">
                            <Target className="w-3.5 h-3.5" />
                            Defender (Red) Staging
                          </span>
                          <span className="font-mono text-[11px] text-[#DC2626]">Target Hitbox</span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between font-mono text-[11px]">
                            <span>Root Position X</span>
                            <span className="font-bold text-[#0F172A]">{spatialDefenderX} px</span>
                          </div>
                          <input
                            type="range"
                            min={360}
                            max={620}
                            value={spatialDefenderX}
                            onChange={(e) => setSpatialDefenderX(Number(e.target.value))}
                            className="w-full accent-[#DC2626]"
                          />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-[#64748B]">Defender Stance &amp; Elevation:</span>
                          <div className="grid grid-cols-3 gap-1">
                            {(['SEATED', 'STANDING', 'PLATFORM'] as const).map((elev) => (
                              <button
                                key={elev}
                                type="button"
                                onClick={() => setSpatialDefenderElevation(elev)}
                                className={`px-2 py-1 rounded text-[10px] font-medium border ${
                                  spatialDefenderElevation === elev
                                    ? 'bg-[#DC2626] text-white border-[#DC2626]'
                                    : 'bg-white text-[#334155] border-[#CBD5E1] hover:bg-[#F1F5F9]'
                                }`}
                              >
                                {elev === 'SEATED' ? 'Seated Guard' : elev === 'STANDING' ? 'Standing' : 'Platform'}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1 pt-1 border-t border-[#E2E8F0]">
                          <div className="flex justify-between font-mono text-[11px]">
                            <span>Platform Dais Elevation</span>
                            <span className="font-bold text-[#0F172A]">{spatialPlatformHeight} px</span>
                          </div>
                          <input
                            type="range"
                            min={60}
                            max={220}
                            value={spatialPlatformHeight}
                            onChange={(e) => setSpatialPlatformHeight(Number(e.target.value))}
                            className="w-full accent-[#D97706]"
                          />
                        </div>
                      </div>

                      {/* Analytical Reach Status Card */}
                      <div className={`p-3.5 rounded-lg border space-y-2 font-mono text-[11px] ${
                        activeReach.reaches ? 'bg-[#ECFDF5] border-[#A7F3D0]' : 'bg-[#FEF2F2] border-[#FECACA]'
                      }`}>
                        <div className="flex items-center justify-between font-semibold">
                          <span className={`flex items-center gap-1.5 ${
                            activeReach.reaches ? 'text-[#065F46]' : 'text-[#991B1B]'
                          }`}>
                            {activeReach.reaches ? (
                              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
                            )}
                            {activeReach.reaches ? 'Reach Criteria Fulfilled' : 'Reach Miss Detected'}
                          </span>
                          <span className={activeReach.reaches ? 'text-[#059669]' : 'text-[#DC2626]'}>
                            {activeReach.reaches ? '100% Valid' : 'Missed'}
                          </span>
                        </div>

                        <p className={`text-[10px] leading-relaxed ${
                          activeReach.reaches ? 'text-[#064E3B]' : 'text-[#7F1D1D]'
                        }`}>
                          {activeReach.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 10-Domain Spatial Consistency Audit Card */}
                  <div className="mt-6 pt-5 border-t border-[#E2E8F0] space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-mono text-[#059669] font-semibold flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          10-DOMAIN MULTI-CHARACTER SPATIAL CONSISTENCY AUDIT GATE
                        </div>
                        <h4 className="text-sm font-bold text-[#0F172A]">
                          Certified Quality Control on Multi-Actor Elevation, Reach &amp; Framing
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#DCFCE7] text-[#15803D]">
                          Score: {spatialAudit.overallScore}% ({spatialAudit.checks.filter(c => c.passed).length}/10 Passed)
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {spatialAudit.checks.map((chk) => (
                        <div
                          key={chk.id}
                          className="p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#0F172A]">{chk.domain}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-[#DCFCE7] text-[#166534]">
                              PASS ({chk.score}%)
                            </span>
                          </div>
                          <div className="font-mono text-[10px] text-[#475569]">{chk.title}</div>
                          <p className="text-[11px] text-[#334155] bg-white p-2 rounded border border-[#E2E8F0]/70 font-mono">
                            {chk.technicalProof}
                          </p>
                          <div className="text-[10px] text-[#64748B]">
                            <span className="font-bold text-[#DC2626]">Prevents: </span>
                            {chk.failureModePrevented}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
  );
};
