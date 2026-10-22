import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Maximize2,
  Minimize2,
  Sliders,
  ShieldCheck,
  Zap,
  Play,
  RotateCcw,
  Layers,
  Compass,
} from 'lucide-react';
import {
  STICKMAN_JOINT_CONSTRAINTS,
  clampJointAngle,
  calculateJointPenaltyCost,
  solveCCD2D,
  Joint2DNode,
  blendAngleDeg,
  blendPoseIKFK,
  calculateLandingBlendAlpha,
  easeInOutCubic,
  smoothstep,
  updateOverlappingJoint,
  computeRotationalArcTrajectory,
  computeAnticipationWindUp,
} from '../../lib/kinematics/skeletalFluidMechanics';

export const FluidMovementTab: React.FC = () => {
  // 1. CCD IK State
  const [ccdTargetX, setCcdTargetX] = useState<number>(280);
  const [ccdTargetY, setCcdTargetY] = useState<number>(180);
  const [ccdMaxIter, setCcdMaxIter] = useState<number>(5);
  const [ccdTolerance, setCcdTolerance] = useState<number>(0.5);

  // Initial 3-node chain (e.g. Shoulder -> Elbow -> Wrist)
  const initialNodes: Joint2DNode[] = [
    { position: [100, 150], angleRad: 0.2, length: 90, minAngleRad: -Math.PI * 0.5, maxAngleRad: Math.PI },
    { position: [100, 150], angleRad: 0.5, length: 80, minAngleRad: -0.1, maxAngleRad: Math.PI * 0.8 },
    { position: [100, 150], angleRad: 0.0, length: 30, minAngleRad: -Math.PI * 0.4, maxAngleRad: Math.PI * 0.4 },
  ];

  // Recalculate CCD solution
  const nodesCopy: Joint2DNode[] = JSON.parse(JSON.stringify(initialNodes));
  const ccdResult = solveCCD2D(nodesCopy, [ccdTargetX, ccdTargetY], ccdMaxIter, ccdTolerance);

  // 2. IK/FK Blending State
  const [blendAlpha, setBlendAlpha] = useState<number>(0.5);
  const [simLandingT, setSimLandingT] = useState<number>(0.0);
  const [isSimulatingLanding, setIsSimulatingLanding] = useState<boolean>(false);

  useEffect(() => {
    if (!isSimulatingLanding) return;
    const interval = setInterval(() => {
      setSimLandingT((t) => {
        if (t >= 1.2) {
          setIsSimulatingLanding(false);
          return 0;
        }
        return t + 0.02;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [isSimulatingLanding]);

  const livePhaseAlpha = isSimulatingLanding ? calculateLandingBlendAlpha(simLandingT) : blendAlpha;

  // 3. Spring-Damper Oscillator State
  const [springStiffness, setSpringStiffness] = useState<number>(180.0);
  const [springDamping, setSpringDamping] = useState<number>(12.0);
  const [oscAngle, setOscAngle] = useState<number>(45.0);
  const [oscTargetAngle, setOscTargetAngle] = useState<number>(0.0);
  const [oscVel, setOscVel] = useState<number>(0.0);
  const [isOscRunning, setIsOscRunning] = useState<boolean>(true);
  const [oscHistory, setOscHistory] = useState<number[]>([]);

  useEffect(() => {
    if (!isOscRunning) return;
    const interval = setInterval(() => {
      setOscAngle((cur) => {
        const res = updateOverlappingJoint(cur, oscTargetAngle, oscVel, springStiffness, springDamping, 0.033);
        setOscVel(res.velocity);
        setOscHistory((h) => [...h.slice(-60), res.angle]);
        return res.angle;
      });
    }, 33);
    return () => clearInterval(interval);
  }, [isOscRunning, oscTargetAngle, oscVel, springStiffness, springDamping]);

  // 4. Arc Trajectory Preview State
  const [arcProgressT, setArcProgressT] = useState<number>(0.5);

  const arcSample = computeRotationalArcTrajectory(150, 150, 110, -30, 120, arcProgressT);

  // 5. Joint Limits Audit State
  const [testAnglesDeg, setTestAnglesDeg] = useState<number[]>([
    0, 45, 120, 10, 20, 80, -10, 0, 15, 60, 90, 0, 30, 0, 45, 0, 0
  ]);

  const currentPenalty = calculateJointPenaltyCost(testAnglesDeg);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-sky-500/20 rounded-xl border border-sky-400/30 text-sky-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Stickman Skeletal Fluid Movement Optimization Engine
              </h3>
              <p className="text-xs text-sky-200">
                Low-DoF Skeletal Mechanics, 2D CCD IK Solver, IK/FK Blending &amp; Damped Harmonic Oscillations
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-3 py-1 bg-sky-500/10 border border-sky-400/30 text-sky-300 rounded-full">
            REF: STICKMAN_SKELETAL_FLUID_MOVEMENT_OPTIMIZATION.md
          </span>
        </div>
      </div>

      {/* Grid Section 1: 2D CCD IK Solver & Joint Constraints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1: Compact 2D CCD IK Solver */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-sky-600" />
              <h4 className="font-semibold text-slate-900 text-sm">
                1. Cyclic Coordinate Descent (CCD) 2D IK Solver
              </h4>
            </div>
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold ${
                ccdResult.converged
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {ccdResult.converged ? 'CONVERGED' : 'REACH LIMIT'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Target X ({ccdTargetX}px)
              </label>
              <input
                type="range"
                min="50"
                max="320"
                value={ccdTargetX}
                onChange={(e) => setCcdTargetX(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Target Y ({ccdTargetY}px)
              </label>
              <input
                type="range"
                min="50"
                max="300"
                value={ccdTargetY}
                onChange={(e) => setCcdTargetY(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Max Iterations ({ccdMaxIter})
              </label>
              <input
                type="range"
                min="1"
                max="15"
                value={ccdMaxIter}
                onChange={(e) => setCcdMaxIter(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Tolerance ({ccdTolerance}px)
              </label>
              <input
                type="range"
                min="0.01"
                max="5"
                step="0.05"
                value={ccdTolerance}
                onChange={(e) => setCcdTolerance(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
            </div>
          </div>

          {/* Interactive CCD Visual Canvas */}
          <div className="bg-slate-900 rounded-xl p-3 relative h-64 border border-slate-800 flex items-center justify-center">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 350 300">
              {/* Grid Lines */}
              <defs>
                <pattern id="ccdGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#ccdGrid)" rx="8" />

              {/* Target Point */}
              <circle cx={ccdTargetX} cy={ccdTargetY} r="8" fill="#EF4444" opacity="0.4" />
              <circle cx={ccdTargetX} cy={ccdTargetY} r="4" fill="#EF4444" />
              <line
                x1={ccdTargetX - 10}
                y1={ccdTargetY}
                x2={ccdTargetX + 10}
                y2={ccdTargetY}
                stroke="#EF4444"
                strokeWidth="1.5"
              />
              <line
                x1={ccdTargetX}
                y1={ccdTargetY - 10}
                x2={ccdTargetX}
                y2={ccdTargetY + 10}
                stroke="#EF4444"
                strokeWidth="1.5"
              />

              {/* Render CCD Nodes */}
              {ccdResult.solvedNodes.map((node, idx) => {
                if (idx === ccdResult.solvedNodes.length - 1) {
                  return (
                    <circle
                      key={idx}
                      cx={node.position[0]}
                      cy={node.position[1]}
                      r="6"
                      fill="#38BDF8"
                    />
                  );
                }
                const nextNode = ccdResult.solvedNodes[idx + 1];
                return (
                  <g key={idx}>
                    <line
                      x1={node.position[0]}
                      y1={node.position[1]}
                      x2={nextNode.position[0]}
                      y2={nextNode.position[1]}
                      stroke="#0284C7"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <circle cx={node.position[0]} cy={node.position[1]} r="5" fill="#38BDF8" />
                  </g>
                );
              })}
            </svg>

            {/* Telemetry Badge */}
            <div className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur-xs border border-slate-700/60 rounded-lg p-2 text-[10px] font-mono text-slate-300 space-y-0.5">
              <div>Iterations Used: <span className="text-sky-400 font-bold">{ccdResult.iterationsUsed}</span></div>
              <div>Final Error: <span className="text-emerald-400 font-bold">{ccdResult.finalErrorPx.toFixed(2)}px</span></div>
            </div>
          </div>
        </div>

        {/* Module 2: Anatomical Joint Classification & Constraints */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-600" />
              <h4 className="font-semibold text-slate-900 text-sm">
                2. Anatomical Joint Limits &amp; Penalty Cost ($C_{`penalty`}$)
              </h4>
            </div>
            <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
              Penalty: {currentPenalty.toFixed(4)}
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
            {Object.values(STICKMAN_JOINT_CONSTRAINTS).map((j) => {
              const currentVal = testAnglesDeg[j.index] || 0;
              const isViolated = currentVal < j.minAngleDeg || currentVal > j.maxAngleDeg;
              return (
                <div
                  key={j.index}
                  className={`p-2.5 flex items-center justify-between gap-2 ${
                    isViolated ? 'bg-amber-50/60' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-center font-mono text-[10px] text-slate-400 font-bold">
                      #{j.index}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-800">{j.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {j.anatomicalEquivalent} · {j.degreesOfFreedom}-DoF
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-slate-600">
                      [{j.minAngleDeg}°, {j.maxAngleDeg}°]
                    </span>
                    <input
                      type="number"
                      value={currentVal}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setTestAnglesDeg((prev) => {
                          const next = [...prev];
                          next[j.index] = val;
                          return next;
                        });
                      }}
                      className={`w-14 text-center font-mono py-1 rounded border ${
                        isViolated
                          ? 'border-amber-400 bg-amber-100 text-amber-900 font-bold'
                          : 'border-slate-300 bg-white text-slate-800'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-500 italic">
            Penalty cost function increases exponentially as joint angles approach or exceed anatomical bounds, preventing dislocation.
          </p>
        </div>
      </div>

      {/* Grid Section 2: IK/FK Blending & Overlapping Damped Oscillator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 3: IK/FK Blending Engine */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-sky-600" />
              <h4 className="font-semibold text-slate-900 text-sm">
                3. IK/FK Blending Engine ($\alpha \in [0, 1]$)
              </h4>
            </div>
            <button
              type="button"
              onClick={() => {
                setSimLandingT(0.0);
                setIsSimulatingLanding(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Simulate Jump Landing</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>FK Ballistic Control ($\alpha = 0.0$)</span>
                <span className="font-mono text-sky-600 font-bold">
                  $\alpha$ = {livePhaseAlpha.toFixed(2)}
                </span>
                <span>Full IK Pin ($\alpha = 1.0$)</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={livePhaseAlpha}
                onChange={(e) => setBlendAlpha(Number(e.target.value))}
                disabled={isSimulatingLanding}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>

            {/* Motion Phase Visualizer */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-[11px]">
              <div className={`p-2 rounded-lg text-center flex-1 ${livePhaseAlpha === 0 ? 'bg-sky-100 border border-sky-300 font-bold text-sky-900' : 'text-slate-500'}`}>
                In-Air Phase (FK)
              </div>
              <div className="px-2 text-slate-400 font-bold">→</div>
              <div className={`p-2 rounded-lg text-center flex-1 ${livePhaseAlpha > 0 && livePhaseAlpha < 1 ? 'bg-amber-100 border border-amber-300 font-bold text-amber-900' : 'text-slate-500'}`}>
                Pre-Contact Blend
              </div>
              <div className="px-2 text-slate-400 font-bold">→</div>
              <div className={`p-2 rounded-lg text-center flex-1 ${livePhaseAlpha === 1 ? 'bg-emerald-100 border border-emerald-300 font-bold text-emerald-900' : 'text-slate-500'}`}>
                Ground Contact (IK Lock)
              </div>
            </div>
          </div>
        </div>

        {/* Module 4: Overlapping Motion & Spring-Damper Dynamics */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-sky-600" />
              <h4 className="font-semibold text-slate-900 text-sm">
                4. Damped Harmonic Oscillator (Secondary Drag)
              </h4>
            </div>
            <button
              type="button"
              onClick={() => {
                setOscAngle(60.0);
                setOscVel(0.0);
              }}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Impulse Strike</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Stiffness ($k = {springStiffness}$)
              </label>
              <input
                type="range"
                min="50"
                max="400"
                value={springStiffness}
                onChange={(e) => setSpringStiffness(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Damping ($\gamma = {springDamping}$)
              </label>
              <input
                type="range"
                min="2"
                max="30"
                value={springDamping}
                onChange={(e) => setSpringDamping(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Waveform Graph Canvas */}
          <div className="bg-slate-900 rounded-xl p-3 h-32 border border-slate-800 flex items-center justify-center relative">
            <svg className="w-full h-full" viewBox="0 0 300 100">
              <line x1="0" y1="50" x2="300" y2="50" stroke="#334155" strokeDasharray="3 3" />
              {oscHistory.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="2.5"
                  points={oscHistory
                    .map((val, idx) => {
                      const x = (idx / 60) * 300;
                      const y = 50 - val * 0.8;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
              )}
            </svg>
            <span className="absolute bottom-1 right-2 text-[10px] font-mono text-sky-400">
              Angle: {oscAngle.toFixed(2)}°
            </span>
          </div>
        </div>
      </div>

      {/* Section 3: Rotational Circular Arc Trajectory Preview */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-600" />
            <h4 className="font-semibold text-slate-900 text-sm">
              5. Rotational Circular Arc Trajectories vs. Linear Shortcuts
            </h4>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-slate-600">Arc Progress ($t = {arcProgressT.toFixed(2)}$)</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={arcProgressT}
              onChange={(e) => setArcProgressT(Number(e.target.value))}
              className="w-32 accent-sky-600 cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 h-52 relative flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 300 200">
              {/* Joint Pivot */}
              <circle cx="100" cy="150" r="6" fill="#F59E0B" />
              {/* Green Rotational Arc */}
              <path
                d="M 195.2 95.0 A 110 110 0 0 0 45.0 205.0"
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeDasharray="4 4"
              />
              {/* Red Robotic Straight Line */}
              <line x1="195.2" y1="95.0" x2="45.0" y2="205.0" stroke="#EF4444" strokeWidth="2" strokeDasharray="2 2" />

              {/* Dynamic Limb Line to Rotational Point */}
              <line x1="100" y1="150" x2={arcSample.x} y2={arcSample.y} stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
              <circle cx={arcSample.x} cy={arcSample.y} r="6" fill="#0284C7" />
            </svg>
            <div className="absolute top-2 left-2 text-[11px] font-mono text-emerald-400 font-semibold bg-slate-950/80 px-2 py-1 rounded border border-slate-800">
              Green Arc: Natural Rotation (Constant Limb Length)
            </div>
            <div className="absolute bottom-2 left-2 text-[11px] font-mono text-rose-400 font-semibold bg-slate-950/80 px-2 py-1 rounded border border-slate-800">
              Red Line: Robotic Straight Shortcut (Shortens Limb)
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-600 flex flex-col justify-center">
            <h5 className="font-semibold text-slate-900 text-sm">Key Principles for Fluid Stickman Animation</h5>
            <ul className="space-y-1.5 list-disc pl-4">
              <li>
                <strong>Joint Constraints:</strong> Enforce hard angular limits on hinge knees ($[0^\circ, 145^\circ]$) and elbows ($[0^\circ, 150^\circ]$) to eliminate dislocation.
              </li>
              <li>
                <strong>2D CCD IK Solver:</strong> Iteratively rotates parent joints backward from leaf to root to reach foot/hand targets under 5 iterations.
              </li>
              <li>
                <strong>IK/FK Blending:</strong> Transitions smoothly from airborne FK arcs to ground-locked IK stance pins during foot contacts.
              </li>
              <li>
                <strong>Overlapping Action:</strong> Secondary joint dynamics (head, fists, loose elements) lag primary drivers and settle via damped harmonic oscillation.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
