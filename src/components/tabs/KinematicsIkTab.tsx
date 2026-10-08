import React, { useRef, useState, useEffect } from 'react';
import { Target, Compass, Activity, CheckCircle2, Move, Footprints, ShieldAlert, ShieldCheck } from 'lucide-react';
import { solveLegLimb, solveArmLimb } from '../../lib/skills/kinematicsSolvers';
import {
  IK_STUDIO_GROUND_Y,
  clampToGround,
  auditGroundPerimeterIntegrity,
} from '../../lib/physics/groundPerimeterSystem';

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
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Environmental Ground Constraint: Ensure state coordinates never breach floor perimeter
  // Immediately reconciles and normalizes any legacy or out-of-bounds target coordinates
  useEffect(() => {
    if (ikTargetFootY > IK_STUDIO_GROUND_Y) {
      setIkTargetFootY(IK_STUDIO_GROUND_Y);
    }
    if (ikTargetHandY > IK_STUDIO_GROUND_Y - 8) {
      setIkTargetHandY(200);
    }
  }, [ikTargetFootY, ikTargetHandY, setIkTargetFootY, setIkTargetHandY]);

  // Defensive clamping ensures immediate ground compliance even before effect executes
  const effectiveFootY = clampToGround(ikTargetFootY, IK_STUDIO_GROUND_Y);
  const effectiveHandY = clampToGround(ikTargetHandY, IK_STUDIO_GROUND_Y - 8);

  const legIK = solveLegLimb(
    240,
    110,
    ikTargetFootX,
    effectiveFootY,
    ikFacingRight,
    0.55,
    ikFootPlanted,
    IK_STUDIO_GROUND_Y
  );
  const armIK = solveArmLimb(
    240,
    130,
    ikTargetHandX,
    effectiveHandY,
    ikFacingRight,
    0.55,
    undefined,
    IK_STUDIO_GROUND_Y
  );
  const activeIK = ikLimbType === 'LEG' ? legIK.ikResult : armIK.ikResult;

  // Real-time Ground Integrity Audit across all articulating segments
  const groundAudit = auditGroundPerimeterIntegrity(
    ikLimbType === 'LEG'
      ? [
          { name: 'Thigh (Hip→Knee)', startY: 110, endY: legIK.kneeY },
          { name: 'Shin (Knee→Ankle)', startY: legIK.kneeY, endY: legIK.ankleY },
          { name: 'Foot (Ankle→Toe)', startY: legIK.ankleY, endY: legIK.footTipY },
        ]
      : [
          { name: 'Bicep (Shoulder→Elbow)', startY: 130, endY: armIK.elbowY },
          { name: 'Forearm (Elbow→Wrist)', startY: armIK.elbowY, endY: armIK.wristY },
          { name: 'Hand (Wrist→Tip)', startY: armIK.wristY, endY: armIK.handTipY },
        ],
    IK_STUDIO_GROUND_Y,
    0.01
  );

  const isFootOnFloor = Math.abs(legIK.footTipY - IK_STUDIO_GROUND_Y) <= 0.5 || Math.abs(legIK.ankleY - IK_STUDIO_GROUND_Y) <= 0.5;

  const updateTargetFromPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const scaleX = 540 / rect.width;
    const scaleY = 380 / rect.height;
    const rawX = (e.clientX - rect.left) * scaleX;
    const rawY = (e.clientY - rect.top) * scaleY;

    if (ikLimbType === 'LEG') {
      const clampedX = Math.round(Math.max(80, Math.min(440, rawX)));
      // Strict floor constraint during dragging: Y cannot exceed IK_STUDIO_GROUND_Y
      const clampedY = Math.round(Math.max(150, Math.min(IK_STUDIO_GROUND_Y, rawY)));
      setIkTargetFootX(clampedX);
      setIkTargetFootY(clampedY);
    } else {
      const clampedX = Math.round(Math.max(80, Math.min(440, rawX)));
      const clampedY = Math.round(Math.max(80, Math.min(IK_STUDIO_GROUND_Y - 8, rawY)));
      setIkTargetHandX(clampedX);
      setIkTargetHandY(clampedY);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    setIsDragging(true);
    updateTargetFromPointer(e);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isDragging || e.buttons === 1) {
      updateTargetFromPointer(e);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    setIsDragging(false);
    try {
      (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
    } catch {}
  };

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
              Derived from research in <code className="font-mono text-xs">axharb/forward-and-inverse-kinematics</code>. Solves connected chains via Law of Cosines with strict environmental floor barrier constraints and zero hyperextension.
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
                Interactive 2D Canvas (Click &amp; Drag End-Effector Target)
              </span>
              <span className="flex items-center gap-2">
                <span className="text-[#34D399] font-bold">Floor Barrier: Y={IK_STUDIO_GROUND_Y} px</span>
              </span>
            </div>

            <div className="my-2 flex items-center justify-center relative">
              <svg
                ref={svgRef}
                viewBox="0 0 540 380"
                className="w-full h-[320px] select-none cursor-crosshair touch-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                {/* Background coordinate grid */}
                <defs>
                  <pattern id="ik-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1E293B" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="540" height="350" fill="url(#ik-grid)" />

                {/* Ground platform floor (High-Contrast non-slip surface) */}
                <rect x="0" y={IK_STUDIO_GROUND_Y} width="540" height={380 - IK_STUDIO_GROUND_Y} fill="#E2E8F0" />
                <line
                  x1="0"
                  y1={IK_STUDIO_GROUND_Y}
                  x2="540"
                  y2={IK_STUDIO_GROUND_Y}
                  stroke="#0284C7"
                  strokeWidth="3"
                />
                <line
                  x1="0"
                  y1={IK_STUDIO_GROUND_Y + 1}
                  x2="540"
                  y2={IK_STUDIO_GROUND_Y + 1}
                  stroke="#38BDF8"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text x="24" y={IK_STUDIO_GROUND_Y - 8} fill="#38BDF8" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  Ground Platform Perimeter: Y = {IK_STUDIO_GROUND_Y}.0 px (Rigid Environmental Barrier)
                </text>

                {/* Floor Hatching */}
                {Array.from({ length: 27 }).map((_, i) => (
                  <line
                    key={i}
                    x1={i * 20}
                    y1={IK_STUDIO_GROUND_Y}
                    x2={i * 20 + 12}
                    y2={IK_STUDIO_GROUND_Y + 14}
                    stroke="#CBD5E1"
                    strokeWidth="1.5"
                  />
                ))}

                {/* Ground Contact Contact Shadow */}
                {ikLimbType === 'LEG' && isFootOnFloor && (
                  <ellipse
                    cx={(legIK.ankleX + legIK.footTipX) * 0.5}
                    cy={IK_STUDIO_GROUND_Y + 2}
                    rx={28}
                    ry={4}
                    fill="#0284C7"
                    opacity={0.65}
                  />
                )}

                {/* Max reach envelope circle from root */}
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

                    {/* Ground contact pad indicator */}
                    {isFootOnFloor && (
                      <rect
                        x={Math.min(legIK.ankleX, legIK.footTipX) - 4}
                        y={IK_STUDIO_GROUND_Y - 2}
                        width={Math.abs(legIK.footTipX - legIK.ankleX) + 8}
                        height={4}
                        fill="#34D399"
                        rx="2"
                      />
                    )}

                    {/* Target Marker with Drag Glow */}
                    <g transform={`translate(${ikTargetFootX}, ${effectiveFootY})`}>
                      <circle
                        cx="0"
                        cy="0"
                        r={isDragging ? 14 : 10}
                        fill={isDragging ? 'rgba(239, 68, 68, 0.25)' : 'none'}
                        stroke="#EF4444"
                        strokeWidth="2"
                        strokeDasharray={isDragging ? undefined : '3 3'}
                      />
                      <line x1="-12" y1="0" x2="12" y2="0" stroke="#EF4444" strokeWidth="1.5" />
                      <line x1="0" y1="-12" x2="0" y2="12" stroke="#EF4444" strokeWidth="1.5" />
                      <text x="14" y="4" fill="#F87171" fontSize="10" fontFamily="monospace">
                        Target Foot ({ikTargetFootX}, {effectiveFootY})
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

                    {/* Target Marker with Drag Glow */}
                    <g transform={`translate(${ikTargetHandX}, ${effectiveHandY})`}>
                      <circle
                        cx="0"
                        cy="0"
                        r={isDragging ? 14 : 10}
                        fill={isDragging ? 'rgba(239, 68, 68, 0.25)' : 'none'}
                        stroke="#EF4444"
                        strokeWidth="2"
                        strokeDasharray={isDragging ? undefined : '3 3'}
                      />
                      <line x1="-12" y1="0" x2="12" y2="0" stroke="#EF4444" strokeWidth="1.5" />
                      <line x1="0" y1="-12" x2="0" y2="12" stroke="#EF4444" strokeWidth="1.5" />
                      <text x="14" y="4" fill="#F87171" fontSize="10" fontFamily="monospace">
                        Target Hand ({ikTargetHandX}, {effectiveHandY})
                      </text>
                    </g>
                  </g>
                )}
              </svg>
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800 pt-2 gap-2">
              <span>Distance D = {activeIK.distance.toFixed(1)} px / Max {activeIK.maxReach.toFixed(1)} px</span>
              <div className="flex items-center gap-3">
                <span className={activeIK.reachable ? 'text-[#34D399]' : 'text-[#F87171]'}>
                  {activeIK.reachable ? '● TARGET WITHIN REACH' : '▲ CLAMPED AT MAX REACH'}
                </span>
                <span className={groundAudit.passed ? 'text-[#38BDF8]' : 'text-[#EF4444]'}>
                  {groundAudit.passed ? '✓ FLOOR BARRIER STRICT' : '⚠ FLOOR BREACH'}
                </span>
              </div>
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
                      <span>Foot Target Y (Floor Max: {IK_STUDIO_GROUND_Y})</span>
                      <span className="font-bold text-[#0F172A]">{effectiveFootY} px</span>
                    </div>
                    <input
                      type="range"
                      min={150}
                      max={IK_STUDIO_GROUND_Y}
                      value={effectiveFootY}
                      onChange={(e) => setIkTargetFootY(Math.min(IK_STUDIO_GROUND_Y, Number(e.target.value)))}
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
                        onClick={() => { setIkTargetFootX(240); setIkTargetFootY(IK_STUDIO_GROUND_Y); setIkFootPlanted(true); }}
                        className="px-2 py-1 rounded bg-white border border-[#CBD5E1] text-[11px] hover:bg-[#F1F5F9] font-medium"
                      >
                        Standing Plant (Floor)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setIkTargetFootX(330); setIkTargetFootY(IK_STUDIO_GROUND_Y); setIkFootPlanted(true); }}
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
                      <span className="font-bold text-[#0F172A]">{effectiveHandY} px</span>
                    </div>
                    <input
                      type="range"
                      min={80}
                      max={IK_STUDIO_GROUND_Y - 8}
                      value={effectiveHandY}
                      onChange={(e) => setIkTargetHandY(Math.min(IK_STUDIO_GROUND_Y - 8, Number(e.target.value)))}
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

            {/* Environmental Floor Barrier Invariant Badge */}
            <div className="p-3.5 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#166534]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                  Ground Barrier Invariant
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#DCFCE7] text-[#15803D] font-bold">
                  Y = {IK_STUDIO_GROUND_Y} px
                </span>
              </div>
              <div className="space-y-1 font-mono text-[11px] text-[#14532D]">
                <div className="flex justify-between">
                  <span>Max Floor Penetration:</span>
                  <span className="font-bold text-[#16A34A]">{groundAudit.maxPenetrationPx.toFixed(2)} px</span>
                </div>
                <div className="flex justify-between">
                  <span>Violating Segments:</span>
                  <span className="font-bold">{groundAudit.violatingJointCount} joints</span>
                </div>
                <div className="flex justify-between">
                  <span>Contact Status:</span>
                  <span className="font-bold text-[#0284C7]">
                    {ikLimbType === 'LEG'
                      ? (isFootOnFloor ? '● Ground Planted (Flexed)' : '○ Swing Airborne')
                      : (effectiveHandY >= IK_STUDIO_GROUND_Y - 25 ? '● Floor Support Contact' : '○ Free Guard / Reach')}
                  </span>
                </div>
                <div className="pt-1 border-t border-[#BBF7D0] text-[10px] text-[#15803D]">
                  {groundAudit.summary}
                </div>
              </div>
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
