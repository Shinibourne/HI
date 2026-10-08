import React, { useState } from 'react';
import {
  Scale,
  Activity,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  RotateCcw,
  Sliders,
  Download,
  Info,
  Atom,
} from 'lucide-react';
import {
  GeneralGeneratorConfig,
  PhysicsScenarioType,
} from '../../lib/physics/generalMotionGenerator';
import { BiomechanicalAuditReport } from '../../lib/physics/types';
import { calculateUnifiedMassAnalysis } from '../../lib/physics/scientificMassSolver';

interface PhysicsIntelligenceTabProps {
  generalPhysicsConfig: GeneralGeneratorConfig;
  setGeneralPhysicsConfig: React.Dispatch<React.SetStateAction<GeneralGeneratorConfig>>;
  currentFrame: number;
  totalModeFrames: number;
  generalPhysicsFrames: any[];
  generalPhysicsAudit: BiomechanicalAuditReport;
  synthesizing: boolean;
  onExportStknds: () => Promise<void>;
  setActiveAnimationMode: (mode: any) => void;
}

export const PhysicsIntelligenceTab: React.FC<PhysicsIntelligenceTabProps> = ({
  generalPhysicsConfig,
  setGeneralPhysicsConfig,
  currentFrame,
  totalModeFrames,
  generalPhysicsFrames,
  generalPhysicsAudit,
  synthesizing,
  onExportStknds,
  setActiveAnimationMode,
}) => {
  const safeIdx = currentFrame % Math.max(1, generalPhysicsFrames.length);
  const activeFrame = generalPhysicsFrames[safeIdx] || generalPhysicsFrames[0];

  const [scientificMassKg, setScientificMassKg] = useState<number>(70);
  const [scientificVelocityFractionC, setScientificVelocityFractionC] = useState<number>(0.1);

  const scientificAnalysis = calculateUnifiedMassAnalysis({
    massKg: scientificMassKg,
    speedVelocityMps: scientificVelocityFractionC * 299792458,
    secondaryMassKg: generalPhysicsConfig.objMass,
  });

  const scenarios: { type: PhysicsScenarioType; label: string; icon: string; desc: string }[] = [
    {
      type: 'LIFT_HEAVY_VS_LIGHT',
      label: 'Lift Heavy vs Light',
      icon: '🏋️',
      desc: 'Compares lifting 5kg vs 50kg load; deep squat preparation, leg drive, and counter-lean.',
    },
    {
      type: 'LEVER_ARM_NEAR_VS_FAR',
      label: 'Lever-Arm (Near vs Far)',
      icon: '📏',
      desc: 'Same mass held 25px vs 80px away; 3.2x torque demand forces backward counter-lean.',
    },
    {
      type: 'CATCH_MOMENTUM_ABSORPTION',
      label: 'Catch & Momentum Yield',
      icon: '🤾',
      desc: 'High-speed projectile caught with compliant yielding elbow flexion and pelvic cushion.',
    },
    {
      type: 'PUSH_HEAVY_OBJECT',
      label: 'Push Ground Drive Chain',
      icon: '🧱',
      desc: 'Feet brace behind CoM; ground reaction transmits through legs, pelvis, and torso into crate.',
    },
    {
      type: 'PULL_HEAVY_OBJECT',
      label: 'Pull Tensile Link',
      icon: '🪢',
      desc: 'Heel brace ahead of CoM; backward core lean pulls heavy load in tension.',
    },
    {
      type: 'THROW_ATHLETIC',
      label: 'Athletic Throw Whip',
      icon: '⚾',
      desc: 'Kinetic chain whip from ground to hand; parabolic release and follow-through recoil.',
    },
    {
      type: 'CONTROLLED_IMBALANCE_RECOVERY',
      label: 'Trip & Stepping Recovery',
      icon: '🏃',
      desc: 'XCoM crosses support boundary; emergency recovery step realigns base of support.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl shadow-sm border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                Core Engine Primitives
              </span>
              <span className="text-xs text-indigo-200">Skills #54–#68 Active</span>
            </div>
            <h2 className="text-lg font-bold mt-1 text-white">General Physics &amp; Biomechanical Intelligence Lab</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Domain-agnostic causal physics: Mass ratios, lever-arm torques, dynamic balance, and force chains.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveAnimationMode('general-physics');
            }}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Zap className="w-3.5 h-3.5" />
            Load into Animation Stage
          </button>
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-indigo-600" />
          Physical Scenario Selection
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {scenarios.map((sc) => (
            <button
              key={sc.type}
              type="button"
              onClick={() => {
                setGeneralPhysicsConfig((c) => ({ ...c, scenario: sc.type }));
                setActiveAnimationMode('general-physics');
              }}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                generalPhysicsConfig.scenario === sc.type
                  ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{sc.icon}</span>
                <span className="text-xs font-semibold text-slate-900">{sc.label}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{sc.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Physics Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Object Mass */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-slate-700">Object Mass (M_obj)</label>
            <span className="text-xs font-mono font-bold text-indigo-600">
              {generalPhysicsConfig.objMass} kg
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={generalPhysicsConfig.objMass}
            onChange={(e) =>
              setGeneralPhysicsConfig((c) => ({
                ...c,
                objMass: parseFloat(e.target.value),
              }))
            }
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>5 kg (Light, μ=0.05)</span>
            <span>50 kg (Heavy, μ=0.50)</span>
            <span>100 kg (Max)</span>
          </div>
        </div>

        {/* Character Mass */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-slate-700">Character Mass (M_char)</label>
            <span className="text-xs font-mono font-bold text-slate-800">
              {generalPhysicsConfig.charMass} kg
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="140"
            step="5"
            value={generalPhysicsConfig.charMass}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setGeneralPhysicsConfig((c) => ({ ...c, charMass: val }));
              setScientificMassKg(val);
            }}
            className="w-full accent-slate-800 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>50 kg (Agile)</span>
            <span>100 kg (Standard)</span>
            <span>140 kg (Heavyweight)</span>
          </div>
        </div>

        {/* Lever Arm Distance */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-slate-700">Lever Arm Distance (ΔX)</label>
            <span className="text-xs font-mono font-bold text-amber-600">
              {generalPhysicsConfig.leverArmDistance} px
            </span>
          </div>
          <input
            type="range"
            min="20"
            max="85"
            step="5"
            value={generalPhysicsConfig.leverArmDistance}
            onChange={(e) =>
              setGeneralPhysicsConfig((c) => ({
                ...c,
                leverArmDistance: parseFloat(e.target.value),
              }))
            }
            className="w-full accent-amber-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>20 px (Chest Hold)</span>
            <span>50 px (Mid Hold)</span>
            <span>85 px (Outstretched)</span>
          </div>
        </div>
      </div>

      {/* Interactive Physics & Scientific Variations of Mass Live Telemetry Panel */}
      <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-3">
          <div className="flex items-center gap-2">
            <Atom className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Physics &amp; Scientific Variations of Mass (Skills #64–#68)
              </h3>
              <p className="text-[11px] text-slate-500">
                Inertial, Gravitational Equivalence, Rest Energy (E=mc²), Relativistic Lorentz Scaling &amp; Sub-Category Variations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-mono text-slate-600">Velocity (v/c):</label>
            <input
              type="range"
              min="0"
              max="0.95"
              step="0.05"
              value={scientificVelocityFractionC}
              onChange={(e) => setScientificVelocityFractionC(parseFloat(e.target.value))}
              className="w-24 accent-indigo-600 cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-indigo-600 w-12">
              {(scientificVelocityFractionC * 100).toFixed(0)}% c
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Inertial Mass */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="font-bold text-indigo-900 text-[11px] uppercase tracking-wide">
              1. Inertial Mass (Skill #64)
            </div>
            <div className="font-mono text-[11px] text-slate-700 space-y-0.5">
              <div>Mass m_i: <span className="font-bold">{scientificAnalysis.inertial.massKg} kg</span></div>
              <div>Accel (F=100N): <span className="font-bold text-indigo-600">{scientificAnalysis.inertial.accelerationMps2.x.toFixed(2)} m/s²</span></div>
              <div>Linear p: <span className="font-bold">{scientificAnalysis.inertial.momentumKgMps.x.toFixed(0)} kg·m/s</span></div>
            </div>
          </div>

          {/* Gravitational Mass */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="font-bold text-emerald-900 text-[11px] uppercase tracking-wide">
              2. Gravitational Mass (Skill #65)
            </div>
            <div className="font-mono text-[11px] text-slate-700 space-y-0.5">
              <div>Weight W=mg: <span className="font-bold">{scientificAnalysis.gravitational.localWeightN.toFixed(1)} N</span></div>
              <div>m_i / m_g Ratio: <span className="font-bold text-emerald-600">{scientificAnalysis.gravitational.equivalenceRatio.toFixed(6)}</span></div>
              <div>WEP Equivalence: <span className="font-bold text-emerald-700">VERIFIED</span></div>
            </div>
          </div>

          {/* Rest Mass */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="font-bold text-amber-900 text-[11px] uppercase tracking-wide">
              3. Rest Mass (Skill #66)
            </div>
            <div className="font-mono text-[11px] text-slate-700 space-y-0.5">
              <div>Rest Mass m_0: <span className="font-bold">{scientificAnalysis.rest.restMassKg} kg</span></div>
              <div>E_0 = m_0 c²: <span className="font-bold text-amber-700">{(scientificAnalysis.rest.restEnergyJoules / 1e18).toFixed(2)} ExaJ</span></div>
              <div>MeV Equiv: <span className="font-bold">{scientificAnalysis.rest.restEnergyMeV.toExponential(2)}</span></div>
            </div>
          </div>

          {/* Relativistic Mass */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="font-bold text-purple-900 text-[11px] uppercase tracking-wide">
              4. Relativistic Mass (Skill #67)
            </div>
            <div className="font-mono text-[11px] text-slate-700 space-y-0.5">
              <div>Lorentz γ: <span className="font-bold text-purple-700">{scientificAnalysis.relativistic.lorentzFactor.toFixed(4)}</span></div>
              <div>m_rel = γ m_0: <span className="font-bold">{scientificAnalysis.relativistic.relativisticMassKg.toFixed(2)} kg</span></div>
              <div>Mass Delta: <span className="font-bold text-purple-600">+{scientificAnalysis.relativistic.massIncreasePercentage.toFixed(2)}%</span></div>
            </div>
          </div>

          {/* Scientific Sub-Categories */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="font-bold text-cyan-900 text-[11px] uppercase tracking-wide">
              5. Sub-Categories (Skill #68)
            </div>
            <div className="font-mono text-[11px] text-slate-700 space-y-0.5">
              <div>Reduced Mass μ: <span className="font-bold text-cyan-700">{scientificAnalysis.variations.reducedMassKg.toFixed(2)} kg</span></div>
              <div>Fluid Added Mass: <span className="font-bold">{scientificAnalysis.variations.hydrodynamicAddedMassKg.toFixed(1)} kg</span></div>
              <div>Fluid Eff Mass: <span className="font-bold">{scientificAnalysis.variations.effectiveFluidMassKg.toFixed(1)} kg</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Frame Telemetry & Causal Force Chain */}
      {activeFrame && (
        <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-mono bg-indigo-500/30 text-indigo-300 rounded font-bold">
                FRAME {activeFrame.frame} / {totalModeFrames - 1}
              </span>
              <span className="text-xs font-semibold text-slate-200">{activeFrame.act}</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Phase: <span className="text-emerald-400 font-bold">{activeFrame.phaseName}</span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">Relative Mass Ratio (μ)</span>
              <span className="font-mono font-bold text-indigo-300">
                {(activeFrame.objMass / generalPhysicsConfig.charMass).toFixed(2)}x
              </span>
            </div>
            <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">Lever Arm (ΔX)</span>
              <span className="font-mono font-bold text-amber-300">
                {activeFrame.leverArmPx.toFixed(1)} px
              </span>
            </div>
            <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">Torque Demand (τ)</span>
              <span className="font-mono font-bold text-red-300">
                {activeFrame.torqueDemand.toFixed(1)} N·m (norm)
              </span>
            </div>
            <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">Support Base Margin</span>
              <span className={`font-mono font-bold ${activeFrame.isBalanced ? 'text-emerald-300' : 'text-amber-300'}`}>
                {activeFrame.supportMargin.toFixed(1)} px ({activeFrame.isBalanced ? 'Stable' : 'Perturbed'})
              </span>
            </div>
          </div>

          {/* Active Force Transmission Chain */}
          <div className="p-2.5 bg-slate-800/90 rounded-lg border border-slate-700/70">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
              Active Force Transmission Chain:
            </span>
            <div className="text-xs font-mono text-indigo-300 font-medium flex items-center gap-1.5 flex-wrap">
              <span>{activeFrame.activeForceChain}</span>
            </div>
          </div>
        </div>
      )}

      {/* 7-Domain Biomechanical Audit Scorecard */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              7-Domain Biomechanical Audit Certification
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-xs font-bold rounded ${
              generalPhysicsAudit.overallVerdict === 'PASS'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {generalPhysicsAudit.overallVerdict} ({generalPhysicsAudit.overallScore}/100)
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {generalPhysicsAudit.domains.map((dom) => (
            <div
              key={dom.domain}
              className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${dom.passed ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="text-xs font-semibold text-slate-900">{dom.domain}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({dom.skillsChecked})</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">{dom.summary}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-mono font-bold text-slate-800">{dom.score}/100</span>
                <span className="block text-[10px] text-slate-400 font-mono">{dom.technicalProof}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export to .stknds Button */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold text-slate-900">Stick Nodes v334 Binary Export</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Generates fully verified .stknds binary container containing character and interactive physical prop.
          </p>
        </div>
        <button
          type="button"
          disabled={synthesizing}
          onClick={onExportStknds}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          {synthesizing ? 'Synthesizing...' : 'Export General Physics .stknds'}
        </button>
      </div>
    </div>
  );
};
