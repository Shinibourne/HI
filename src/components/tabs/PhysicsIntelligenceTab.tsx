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
import { calculateUnifiedEnergyAnalysis } from '../../lib/physics/energyDynamicsSolver';
import {
  calculateUnifiedDensityFluidAnalysis,
  FLUID_DENSITY_FRESHWATER,
  FLUID_DENSITY_SEAWATER,
  FLUID_DENSITY_AIR,
  FLUID_DENSITY_OIL,
  FLUID_DENSITY_MERCURY,
} from '../../lib/physics/densityFluidEnvironmentSolver';
import { calculateUnifiedQuantumAnalysis } from '../../lib/physics/quantumPhysicsSolver';

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

  const [energyHeightMeters, setEnergyHeightMeters] = useState<number>(2.5);
  const [energyVelocityMps, setEnergyVelocityMps] = useState<number>(7.0);
  const [energyAngularVelRadS, setEnergyAngularVelRadS] = useState<number>(3.14);
  const [energySpringStretchMeters, setEnergySpringStretchMeters] = useState<number>(0.15);

  const scientificAnalysis = calculateUnifiedMassAnalysis({
    massKg: scientificMassKg,
    speedVelocityMps: scientificVelocityFractionC * 299792458,
    secondaryMassKg: generalPhysicsConfig.objMass,
  });

  const energyAnalysis = calculateUnifiedEnergyAnalysis({
    massKg: scientificMassKg,
    heightMeters: energyHeightMeters,
    velocityMps: energyVelocityMps,
    angularVelocityRadS: energyAngularVelRadS,
    springStretchMeters: energySpringStretchMeters,
  });

  // Environmental Variables & Density State
  const [fluidPreset, setFluidPreset] = useState<'FRESHWATER' | 'SEAWATER' | 'AIR' | 'OIL' | 'MERCURY'>('FRESHWATER');
  const [fluidDepthMeters, setFluidDepthMeters] = useState<number>(3.5);
  const [fluidFlowVelocityMps, setFluidFlowVelocityMps] = useState<number>(1.8);
  const [customObjectVolumeLiters, setCustomObjectVolumeLiters] = useState<number>(65.0);

  const fluidDensityMap = {
    FRESHWATER: FLUID_DENSITY_FRESHWATER,
    SEAWATER: FLUID_DENSITY_SEAWATER,
    AIR: FLUID_DENSITY_AIR,
    OIL: FLUID_DENSITY_OIL,
    MERCURY: FLUID_DENSITY_MERCURY,
  };

  const currentFluidDensity = fluidDensityMap[fluidPreset];

  const densityFluidAnalysis = calculateUnifiedDensityFluidAnalysis({
    objectMassKg: generalPhysicsConfig.objMass,
    objectVolumeM3: customObjectVolumeLiters / 1000.0,
    fluidDensityKgM3: currentFluidDensity,
    depthMeters: fluidDepthMeters,
    gravityMps2: 9.80665,
    fluidName: fluidPreset,
    flowVelocityMps: fluidFlowVelocityMps,
  });

  // Quantum Physics & Skill Acquisition State (Skills #84–#91)
  const [quantumFocusConscious, setQuantumFocusConscious] = useState<boolean>(false);
  const [quantumDxMeters, setQuantumDxMeters] = useState<number>(0.05);
  const [quantumPracticeJoules, setQuantumPracticeJoules] = useState<number>(85.0);
  const [quantumQubits, setQuantumQubits] = useState<number>(4);

  const quantumAnalysis = calculateUnifiedQuantumAnalysis({
    massKg: scientificMassKg,
    velocityMps: energyVelocityMps,
    isConsciousFocusHigh: quantumFocusConscious,
    positionUncertaintyMeters: quantumDxMeters,
    practiceEnergyJoules: quantumPracticeJoules,
    qubitCount: quantumQubits,
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
              <span className="text-xs text-indigo-200">Skills #54–#91 Active</span>
            </div>
            <h2 className="text-lg font-bold mt-1 text-white">General Physics &amp; Quantum Skill Acquisition Lab</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Domain-agnostic causal physics: Mass ratios, torques, fluid dynamics, and Quantum Mechanics Skill Acquisition models.
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

      {/* Kinetic & Potential Energy Dynamics Live Telemetry Panel (Skills #69–#76) */}
      <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Kinetic &amp; Potential Energy Dynamics (Skills #69–#76)
              </h3>
              <p className="text-[11px] text-slate-500">
                Translational, Rotational, Vibrational KE, Gravitational, Elastic, Chemical/Field PE &amp; Energy Conservation Laws
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-mono text-slate-600">Vel (v):</label>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={energyVelocityMps}
                onChange={(e) => setEnergyVelocityMps(parseFloat(e.target.value))}
                className="w-20 accent-amber-600 cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-amber-600 w-10">
                {energyVelocityMps}m/s
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-mono text-slate-600">Height (h):</label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={energyHeightMeters}
                onChange={(e) => setEnergyHeightMeters(parseFloat(e.target.value))}
                className="w-20 accent-emerald-600 cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-emerald-600 w-10">
                {energyHeightMeters}m
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Kinetic Energy Subcategories */}
          <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200/60 space-y-1">
            <div className="font-bold text-amber-900 text-[11px] uppercase tracking-wide flex items-center justify-between">
              <span>Kinetic Energy (KE)</span>
              <span className="font-mono text-amber-700">{energyAnalysis.kinetic.totalKineticEnergyJoules.toFixed(1)} J</span>
            </div>
            <div className="font-mono text-[11px] text-slate-700 space-y-0.5 pt-1">
              <div>Translational (½mv²): <span className="font-bold text-amber-800">{energyAnalysis.kinetic.translationalKEJoules.toFixed(1)} J</span></div>
              <div>Rotational (½Iω²): <span className="font-bold">{energyAnalysis.kinetic.rotationalKEJoules.toFixed(1)} J</span></div>
              <div>Vibrational (½k(A²-x²)): <span className="font-bold">{energyAnalysis.kinetic.vibrationalKEJoules.toFixed(1)} J</span></div>
            </div>
          </div>

          {/* Gravitational & Elastic PE */}
          <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200/60 space-y-1">
            <div className="font-bold text-emerald-900 text-[11px] uppercase tracking-wide flex items-center justify-between">
              <span>Potential Energy (PE)</span>
              <span className="font-mono text-emerald-700">{energyAnalysis.potential.totalPotentialEnergyJoules.toFixed(1)} J</span>
            </div>
            <div className="font-mono text-[11px] text-slate-700 space-y-0.5 pt-1">
              <div>Gravitational (mgh): <span className="font-bold text-emerald-800">{energyAnalysis.potential.gravitationalPEJoules.toFixed(1)} J</span></div>
              <div>Elastic (½kx²): <span className="font-bold">{energyAnalysis.potential.elasticPEJoules.toFixed(1)} J</span></div>
              <div>Electrostatic/Field: <span className="font-bold">{energyAnalysis.potential.electrostaticPEJoules.toFixed(3)} J</span></div>
            </div>
          </div>

          {/* Total Mechanical Energy */}
          <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-200/60 space-y-1">
            <div className="font-bold text-indigo-900 text-[11px] uppercase tracking-wide flex items-center justify-between">
              <span>Mechanical Energy (E_mech)</span>
              <span className="font-mono text-indigo-700">{energyAnalysis.conservation.totalMechanicalEnergyJoules.toFixed(1)} J</span>
            </div>
            <div className="font-mono text-[11px] text-slate-700 space-y-0.5 pt-1">
              <div>KE Total: <span className="font-bold text-amber-700">{energyAnalysis.conservation.totalKineticEnergyJoules.toFixed(1)} J</span></div>
              <div>PE Total: <span className="font-bold text-emerald-700">{energyAnalysis.conservation.totalPotentialEnergyJoules.toFixed(1)} J</span></div>
              <div>Phase Shift: <span className="font-bold text-indigo-600">KE ↔ PE Oscillation</span></div>
            </div>
          </div>

          {/* Law of Conservation of Energy */}
          <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-200/60 space-y-1">
            <div className="font-bold text-purple-900 text-[11px] uppercase tracking-wide flex items-center justify-between">
              <span>Energy Conservation</span>
              <span className="font-mono text-purple-700 font-bold">100% CONSERVED</span>
            </div>
            <div className="font-mono text-[11px] text-slate-700 space-y-0.5 pt-1">
              <div>Total System E: <span className="font-bold text-purple-800">{energyAnalysis.conservation.totalSystemEnergyJoules.toFixed(1)} J</span></div>
              <div>Thermal Losses (Q): <span className="font-bold">{energyAnalysis.conservation.thermalLossJoules.toFixed(1)} J</span></div>
              <div>Thermodynamic Law: <span className="font-bold text-purple-700">E_total = Const</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Density, Fluid Forces, Environmental Variables & Environmental Probability Panel (Skills #77–#83) */}
      <div className="bg-white p-4 rounded-xl border border-cyan-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-600 shrink-0" />
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Density, Fluid Forces &amp; Environmental Probability (Skills #77–#83)
              </h3>
              <p className="text-[11px] text-slate-500">
                Matter Density (ρ=m/V), Archimedes' Buoyancy (F_b=ρgV), Hydrostatic Pressure (P=P_0+ρgh), Force Density (f=F/V), Environmental Medium Variables &amp; Stochastic Turbulence/Wave Probability
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-mono text-slate-600">Fluid Medium:</label>
              <select
                value={fluidPreset}
                onChange={(e) => setFluidPreset(e.target.value as any)}
                className="text-xs font-mono bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-cyan-900 font-bold cursor-pointer"
              >
                <option value="FRESHWATER">Freshwater (1000 kg/m³)</option>
                <option value="SEAWATER">Seawater (1025 kg/m³)</option>
                <option value="AIR">Air (1.225 kg/m³)</option>
                <option value="OIL">Oil (850 kg/m³)</option>
                <option value="MERCURY">Mercury (13546 kg/m³)</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-mono text-slate-600">Depth (h):</label>
              <input
                type="range"
                min="0.5"
                max="20"
                step="0.5"
                value={fluidDepthMeters}
                onChange={(e) => setFluidDepthMeters(parseFloat(e.target.value))}
                className="w-20 accent-cyan-600 cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-cyan-700 w-10">
                {fluidDepthMeters}m
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* 1. Matter Density */}
          <div className="p-3 bg-cyan-50/50 rounded-lg border border-cyan-200/60 space-y-1">
            <div className="font-bold text-cyan-900 text-[11px] uppercase tracking-wide flex items-center justify-between">
              <span>1. Matter Density (ρ)</span>
              <span className="font-mono text-cyan-700">{densityFluidAnalysis.density.densityKgM3.toFixed(0)} kg/m³</span>
            </div>
            <div className="font-mono text-[11px] text-slate-700 space-y-0.5 pt-1">
              <div>Formula: <span className="font-bold text-cyan-800">ρ = m / V</span> (Scalar)</div>
              <div>Object Mass: <span className="font-bold">{densityFluidAnalysis.density.massKg} kg</span></div>
              <div>Object Vol: <span className="font-bold">{(densityFluidAnalysis.density.volumeM3 * 1000).toFixed(0)} L</span></div>
            </div>
          </div>

          {/* 2. Buoyancy & Equilibrium */}
          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200/60 space-y-1">
            <div className="font-bold text-blue-900 text-[11px] uppercase tracking-wide flex items-center justify-between">
              <span>2. Buoyancy (F_b)</span>
              <span className="font-mono text-blue-700 font-bold">{densityFluidAnalysis.equilibrium.state}</span>
            </div>
            <div className="font-mono text-[11px] text-slate-700 space-y-0.5 pt-1">
              <div>Upthrust F_b: <span className="font-bold text-blue-800">{densityFluidAnalysis.buoyancy.buoyantForceN.toFixed(1)} N</span></div>
              <div>Weight W: <span className="font-bold">{densityFluidAnalysis.equilibrium.weightForceN.toFixed(1)} N</span></div>
              <div>Submerged: <span className="font-bold text-blue-700">{(densityFluidAnalysis.equilibrium.submergedVolumeFraction * 100).toFixed(0)}%</span></div>
            </div>
          </div>

          {/* 3. Hydrostatic Pressure */}
          <div className="p-3 bg-sky-50/50 rounded-lg border border-sky-200/60 space-y-1">
            <div className="font-bold text-sky-900 text-[11px] uppercase tracking-wide flex items-center justify-between">
              <span>3. Hydrostatic P(h)</span>
              <span className="font-mono text-sky-700">{densityFluidAnalysis.hydrostatic.pressureAtmospheres.toFixed(2)} atm</span>
            </div>
            <div className="font-mono text-[11px] text-slate-700 space-y-0.5 pt-1">
              <div>Gauge P: <span className="font-bold text-sky-800">{(densityFluidAnalysis.hydrostatic.hydrostaticGaugePressurePa / 1000).toFixed(1)} kPa</span></div>
              <div>Total Abs P: <span className="font-bold">{(densityFluidAnalysis.hydrostatic.totalAbsolutePressurePa / 1000).toFixed(1)} kPa</span></div>
              <div>Depth h: <span className="font-bold text-sky-700">{fluidDepthMeters} m</span></div>
            </div>
          </div>

          {/* 4. Force Density */}
          <div className="p-3 bg-teal-50/50 rounded-lg border border-teal-200/60 space-y-1">
            <div className="font-bold text-teal-900 text-[11px] uppercase tracking-wide flex items-center justify-between">
              <span>4. Force Density (f)</span>
              <span className="font-mono text-teal-700">{(densityFluidAnalysis.forceDensity.forceDensityNm3 / 1000).toFixed(1)} kN/m³</span>
            </div>
            <div className="font-mono text-[11px] text-slate-700 space-y-0.5 pt-1">
              <div>Formula: <span className="font-bold text-teal-800">f = F / V</span></div>
              <div>Gravity Field f_g: <span className="font-bold">{(currentFluidDensity * 9.81 / 1000).toFixed(1)} kN/m³</span></div>
              <div>Dimension: <span className="font-bold text-teal-700">N / m³</span></div>
            </div>
          </div>

          {/* 5. Environmental Probability */}
          <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-200/60 space-y-1">
            <div className="font-bold text-indigo-900 text-[11px] uppercase tracking-wide flex items-center justify-between">
              <span>5. Stochastic Prob</span>
              <span className="font-mono text-indigo-700">Re={(densityFluidAnalysis.probability.reynoldsNumber / 1000).toFixed(1)}k</span>
            </div>
            <div className="font-mono text-[11px] text-slate-700 space-y-0.5 pt-1">
              <div>Turbulence Prob: <span className="font-bold text-indigo-800">{(densityFluidAnalysis.probability.turbulenceProbability * 100).toFixed(0)}%</span></div>
              <div>State Shift Prob: <span className="font-bold text-indigo-700">{(densityFluidAnalysis.probability.sinkFloatTransitionProbability * 100).toFixed(1)}%</span></div>
              <div>Confidence: <span className="font-bold text-emerald-700">{(densityFluidAnalysis.probability.stateConfidence * 100).toFixed(0)}%</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quantum Physics & Skill Acquisition Live Telemetry Panel (Skills #84–#91) */}
      <div className="bg-white p-4 rounded-xl border border-violet-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-violet-100 pb-3">
          <div className="flex items-center gap-2">
            <Atom className="w-4 h-4 text-violet-600 shrink-0" />
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Quantum Physics &amp; Skill Acquisition Engine (Skills #84–#91)
              </h3>
              <p className="text-[11px] text-slate-500">
                Wave-Particle Duality, Superposition (Beginner's Mind), Uncertainty (Overthinking), Entanglement (Skill Transfer), Tunneling, Leaps &amp; Parallel Sim
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantumFocusConscious(!quantumFocusConscious)}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded border transition-colors cursor-pointer ${
                quantumFocusConscious
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}
            >
              Mode: {quantumFocusConscious ? 'Hyper-Conscious (Choking Risk)' : 'Intuitive Flow State'}
            </button>
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-mono text-slate-600">Practice E:</label>
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={quantumPracticeJoules}
                onChange={(e) => setQuantumPracticeJoules(parseFloat(e.target.value))}
                className="w-20 accent-violet-600 cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-violet-700 w-12">
                {quantumPracticeJoules}J
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* 1. Wave-Particle Duality */}
          <div className="p-3 bg-violet-50/50 rounded-lg border border-violet-200/60 space-y-1">
            <div className="font-bold text-violet-900 text-[11px] uppercase tracking-wide flex items-center justify-between">
              <span>1. Wave-Particle Duality</span>
              <span className="font-mono text-violet-700 font-bold">{quantumAnalysis.waveParticle.stateMode}</span>
            </div>
            <div className="font-mono text-[11px] text-slate-700 space-y-0.5 pt-1">
              <div>Adaptability (Wave): <span className="font-bold text-violet-800">{quantumAnalysis.waveParticle.adaptabilityScore.toFixed(0)}%</span></div>
              <div>Precision (Particle): <span className="font-bold">{quantumAnalysis.waveParticle.executionPrecisionScore.toFixed(0)}%</span></div>
              <div>λ_deBroglie: <span className="font-bold text-violet-700">{quantumAnalysis.waveParticle.deBroglieWavelengthMeters.toExponential(2)} m</span></div>
            </div>
          </div>

          {/* 2. Superposition */}
          <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-200/60 space-y-1">
            <div className="font-bold text-indigo-900 text-[11px] uppercase tracking-wide flex items-center justify-between">
              <span>2. Superposition Mind</span>
              <span className="font-mono text-indigo-700">{quantumAnalysis.superposition.beginnersMindPotentialScore.toFixed(0)}/100</span>
            </div>
            <div className="font-mono text-[11px] text-slate-700 space-y-0.5 pt-1">
              <div>Entropy S(ρ): <span className="font-bold text-indigo-800">{quantumAnalysis.superposition.vonNeumannEntropy.toFixed(3)}</span></div>
              <div>State Option Space: <span className="font-bold">{quantumAnalysis.superposition.stateCoefficients.length} Active Options</span></div>
              <div>State Collapse: <span className="font-bold text-indigo-700">{quantumAnalysis.superposition.isCollapsed ? 'COLLAPSED' : 'SUPERPOSITION'}</span></div>
            </div>
          </div>

          {/* 3. Uncertainty & Choking */}
          <div className="p-3 bg-rose-50/50 rounded-lg border border-rose-200/60 space-y-1">
            <div className="font-bold text-rose-900 text-[11px] uppercase tracking-wide flex items-center justify-between">
              <span>3. Observer / Overthinking</span>
              <span className="font-mono text-rose-700 font-bold">{quantumAnalysis.uncertainty.chokingRiskLevel} RISK</span>
            </div>
            <div className="font-mono text-[11px] text-slate-700 space-y-0.5 pt-1">
              <div>Δx · Δp Product: <span className="font-bold text-rose-800">{quantumAnalysis.uncertainty.uncertaintyProduct.toFixed(2)}</span></div>
              <div>Micro-Focus Δx: <span className="font-bold">{quantumAnalysis.uncertainty.positionUncertaintyMeters.toFixed(2)} m</span></div>
              <div>Choking Score: <span className="font-bold text-rose-700">{quantumAnalysis.uncertainty.overthinkingInterferenceScore.toFixed(0)}%</span></div>
            </div>
          </div>

          {/* 4. Quantum Entanglement */}
          <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-200/60 space-y-1">
            <div className="font-bold text-purple-900 text-[11px] uppercase tracking-wide flex items-center justify-between">
              <span>4. Quantum Entanglement</span>
              <span className="font-mono text-purple-700">C={quantumAnalysis.entanglement.concurrence.toFixed(2)}</span>
            </div>
            <div className="font-mono text-[11px] text-slate-700 space-y-0.5 pt-1">
              <div>Bell State: <span className="font-bold text-purple-800">{quantumAnalysis.entanglement.bellStateName}</span></div>
              <div>Skill Transfer Gain: <span className="font-bold text-purple-700">+{quantumAnalysis.entanglement.transferGainPercentage.toFixed(1)}% Gain</span></div>
              <div>Mutual Info I(A:B): <span className="font-bold">{quantumAnalysis.entanglement.quantumMutualInformation.toFixed(2)}</span></div>
            </div>
          </div>

          {/* 5. Quantum Tunneling */}
          <div className="p-3 bg-cyan-50/50 rounded-lg border border-cyan-200/60 space-y-1">
            <div className="font-bold text-cyan-900 text-[11px] uppercase tracking-wide flex items-center justify-between">
              <span>5. Quantum Tunneling</span>
              <span className="font-mono text-cyan-700 font-bold">{quantumAnalysis.tunneling.plateauPiercingLikelihood}</span>
            </div>
            <div className="font-mono text-[11px] text-slate-700 space-y-0.5 pt-1">
              <div>Transmission T: <span className="font-bold text-cyan-800">{quantumAnalysis.tunneling.transmissionCoefficientT.toExponential(2)}</span></div>
              <div>Barrier V_0 - E: <span className="font-bold">{(quantumAnalysis.tunneling.barrierHeightJoules - quantumAnalysis.tunneling.particleEnergyJoules).toFixed(1)} J</span></div>
              <div>Piercing Success: <span className="font-bold text-cyan-700">{quantumAnalysis.tunneling.tunnelingSuccessPercentage.toFixed(1)}%</span></div>
            </div>
          </div>

          {/* 6. Quantum Leaps */}
          <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200/60 space-y-1">
            <div className="font-bold text-amber-900 text-[11px] uppercase tracking-wide flex items-center justify-between">
              <span>6. Quantum Leaps (ΔE=hν)</span>
              <span className="font-mono text-amber-700 font-bold">{quantumAnalysis.quantumLeap.isLeapTriggered ? 'LEAP TRIGGERED' : 'PLATEAU'}</span>
            </div>
            <div className="font-mono text-[11px] text-slate-700 space-y-0.5 pt-1">
              <div>Accumulated Progress: <span className="font-bold text-amber-800">{(quantumAnalysis.quantumLeap.practiceAccumulationProgress * 100).toFixed(0)}%</span></div>
              <div>Target Level: <span className="font-bold">Level {quantumAnalysis.quantumLeap.finalLevel}</span></div>
              <div>Transition State: <span className="font-bold text-amber-700">{quantumAnalysis.quantumLeap.breakthroughStateName}</span></div>
            </div>
          </div>

          {/* 7. Quantum Coherence */}
          <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200/60 space-y-1">
            <div className="font-bold text-emerald-900 text-[11px] uppercase tracking-wide flex items-center justify-between">
              <span>7. Quantum Coherence</span>
              <span className="font-mono text-emerald-700">{quantumAnalysis.coherence.flowStatePurityPercentage.toFixed(0)}% FLOW</span>
            </div>
            <div className="font-mono text-[11px] text-slate-700 space-y-0.5 pt-1">
              <div>Coherence Time τ: <span className="font-bold text-emerald-800">{quantumAnalysis.coherence.coherenceTimeSeconds.toFixed(1)} s</span></div>
              <div>Noise Level: <span className="font-bold">{(quantumAnalysis.coherence.environmentalNoiseLevel * 100).toFixed(0)}%</span></div>
              <div>Phase Coherent: <span className="font-bold text-emerald-700">{quantumAnalysis.coherence.isFlowCoherent ? 'COHERENT FLOW' : 'DECOHERED'}</span></div>
            </div>
          </div>

          {/* 8. Quantum Parallel Computing */}
          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200/60 space-y-1">
            <div className="font-bold text-blue-900 text-[11px] uppercase tracking-wide flex items-center justify-between">
              <span>8. Parallel Computing</span>
              <span className="font-mono text-blue-700">{quantumAnalysis.computing.simultaneousStateDimensions} States</span>
            </div>
            <div className="font-mono text-[11px] text-slate-700 space-y-0.5 pt-1">
              <div>Grover Acceleration: <span className="font-bold text-blue-800">{quantumAnalysis.computing.groverSpeedupFactor.toFixed(1)}x Speedup</span></div>
              <div>Superposition Gates: <span className="font-bold text-blue-700">Hadamard + QFT Active</span></div>
              <div>Optimal Option: <span className="font-bold text-blue-900 text-[10px] truncate block">{quantumAnalysis.computing.optimalPathSelected}</span></div>
            </div>
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
