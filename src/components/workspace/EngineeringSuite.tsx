import React, { useState } from 'react';
import {
  Target,
  Sparkles,
  Compass,
  Activity,
  ShieldCheck,
  Layers,
  GitBranch,
  FileCode2,
  ChevronDown,
} from 'lucide-react';

import { KinematicsIkTab } from '../tabs/KinematicsIkTab';
import { FullBodyReactivityTab } from '../tabs/FullBodyReactivityTab';
import { ProceduralKinematicsTab } from '../tabs/ProceduralKinematicsTab';
import { SpatialInteractionTab } from '../tabs/SpatialInteractionTab';
import { ProceduralMotionTab } from '../tabs/ProceduralMotionTab';
import { SkillsCatalogTab } from '../tabs/SkillsCatalogTab';
import { FrameInspectorTab } from '../tabs/FrameInspectorTab';
import { BoneHierarchyTab } from '../tabs/BoneHierarchyTab';
import { MethodologyTab } from '../tabs/MethodologyTab';

export interface EngineeringSuiteProps {
  activeDocTab: string;
  setActiveDocTab: (tab: any) => void;
  // IK Tab props
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
  // Reactivity
  strollKickAudit: any;
  // Procedural
  safeStrollKickFrame: any;
  currentFrame: number;
  strollKickFrames: any[];
  // Spatial
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
  liveSpatialAudit: any;
  // Gait
  gaitProgress: number;
  setGaitProgress: (val: number) => void;
  gaitStrideLength: number;
  setGaitStrideLength: (val: number) => void;
  gaitStepHeight: number;
  setGaitStepHeight: (val: number) => void;
  // Skills
  liveBiomechanicsAudit: any;
  selectedSkillCategory: string;
  setSelectedSkillCategory: (val: string) => void;
  skillSearchQuery: string;
  setSkillSearchQuery: (val: string) => void;
  synthesizing: boolean;
  handleSynthesizeAndDownload: () => Promise<void>;
  // Frames
  activeAnimationMode: string;
  sneezeFrames: any[];
  superheroFrames: any[];
  // Bone Hierarchy
  totalModeFrames: number;
  selectedBoneFigure: 'red' | 'blue';
  setSelectedBoneFigure: (fig: 'red' | 'blue') => void;
  safeTeleportFrame: any;
  safeHeroJoints: any[];
  // Methodology
  globalFps: 12 | 24;
  basketballAudit: any;
  basketballFrames: any[];
  phantomFrames: any[];
  speedStrengthFrames: any[];
  teleportFrames: any[];
  selectedPresetPath: string;
  setSelectedPresetPath: (val: string) => void;
  syncAnimationModeFromPath: (val: string) => void;
  activeInspection: any;
  inspectLoading: boolean;
  inspectError: string | null;
  binaryStageOverride: boolean;
  setBinaryStageOverride: (val: React.SetStateAction<boolean>) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  setCurrentFrame: (f: number | ((prev: number) => number)) => void;
  setIsPlaying: (p: boolean) => void;
  inspectorCanvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const ENGINEERING_TABS = [
  { id: 'kinematics-ik', label: '1. Kinematics & Limb IK', shortLabel: 'Limb IK', icon: Target },
  { id: 'full-body-reactivity', label: '2. Full-Body Reactivity', shortLabel: 'Reactivity', icon: Sparkles },
  { id: 'procedural-kinematics', label: '3. Procedural Kinematics', shortLabel: 'Kinematics', icon: GitBranch },
  { id: 'spatial-interaction', label: '4. Spatial Consistency', shortLabel: 'Spatial', icon: Compass },
  { id: 'procedural-motion', label: '5. Locomotion & Gait', shortLabel: 'Locomotion', icon: Activity },
  { id: 'skills', label: '6. 53-Skill Library & QC', shortLabel: '53-Skills', icon: ShieldCheck },
  { id: 'frames', label: '7. Act Mechanics', shortLabel: 'Acts', icon: Layers },
  { id: 'bone-hierarchy', label: '8. Bone Transform Table', shortLabel: 'Bones (FK)', icon: GitBranch },
  { id: 'methodology', label: '9. Binary Spec & Inspector', shortLabel: 'Binary Spec', icon: FileCode2 },
];

export const EngineeringSuite: React.FC<EngineeringSuiteProps> = ({
  activeDocTab,
  setActiveDocTab,
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
  strollKickAudit,
  safeStrollKickFrame,
  currentFrame,
  strollKickFrames,
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
  gaitProgress,
  setGaitProgress,
  gaitStrideLength,
  setGaitStrideLength,
  gaitStepHeight,
  setGaitStepHeight,
  liveBiomechanicsAudit,
  selectedSkillCategory,
  setSelectedSkillCategory,
  skillSearchQuery,
  setSkillSearchQuery,
  synthesizing,
  handleSynthesizeAndDownload,
  activeAnimationMode,
  sneezeFrames,
  superheroFrames,
  totalModeFrames,
  selectedBoneFigure,
  setSelectedBoneFigure,
  safeTeleportFrame,
  safeHeroJoints,
  globalFps,
  basketballAudit,
  basketballFrames,
  phantomFrames,
  speedStrengthFrames,
  teleportFrames,
  selectedPresetPath,
  setSelectedPresetPath,
  syncAnimationModeFromPath,
  activeInspection,
  inspectLoading,
  inspectError,
  binaryStageOverride,
  setBinaryStageOverride,
  handleFileUpload,
  setCurrentFrame,
  setIsPlaying,
  inspectorCanvasRef,
}) => {
  const [mobileSelectOpen, setMobileSelectOpen] = useState(false);

  const activeTabMeta = ENGINEERING_TABS.find((t) => t.id === activeDocTab) || ENGINEERING_TABS[0];

  return (
    <section className="space-y-4">
      {/* Module Header & Responsive Navigation */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                RESEARCH &amp; BIOMECHANICAL SUITE
              </span>
              <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                5 Knowledge Repositories · 53 Biomechanical Skills
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
              Universal Human Motion Framework &amp; Procedural Kinematics
            </h2>
          </div>

          {/* Mobile Select Dropdown for tabs */}
          <div className="sm:hidden relative">
            <button
              type="button"
              onClick={() => setMobileSelectOpen((p) => !p)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800"
            >
              <div className="flex items-center gap-2">
                <activeTabMeta.icon className="w-3.5 h-3.5 text-sky-600" />
                <span>{activeTabMeta.label}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            {mobileSelectOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setMobileSelectOpen(false)} />
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-40 p-1 space-y-0.5 text-xs max-h-72 overflow-y-auto">
                  {ENGINEERING_TABS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setActiveDocTab(t.id);
                        setMobileSelectOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${
                        activeDocTab === t.id
                          ? 'bg-sky-50 text-sky-900 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <t.icon className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Desktop / Tablet Tab Strip */}
        <div className="hidden sm:flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-lg text-xs">
          {ENGINEERING_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeDocTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveDocTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap cursor-pointer text-xs ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? 'text-sky-600' : 'text-slate-400'
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Subview Container */}
      <div className="transition-opacity duration-150">
        {activeDocTab === 'kinematics-ik' && (
          <KinematicsIkTab
            ikLimbType={ikLimbType}
            setIkLimbType={setIkLimbType}
            ikFacingRight={ikFacingRight}
            setIkFacingRight={setIkFacingRight}
            ikTargetFootX={ikTargetFootX}
            setIkTargetFootX={setIkTargetFootX}
            ikTargetFootY={ikTargetFootY}
            setIkTargetFootY={setIkTargetFootY}
            ikTargetHandX={ikTargetHandX}
            setIkTargetHandX={setIkTargetHandX}
            ikTargetHandY={ikTargetHandY}
            setIkTargetHandY={setIkTargetHandY}
            ikFootPlanted={ikFootPlanted}
            setIkFootPlanted={setIkFootPlanted}
          />
        )}

        {activeDocTab === 'full-body-reactivity' && (
          <FullBodyReactivityTab strollKickAudit={strollKickAudit} />
        )}

        {activeDocTab === 'procedural-kinematics' && (
          <ProceduralKinematicsTab
            safeStrollKickFrame={safeStrollKickFrame}
            currentFrame={currentFrame}
            strollKickFrames={strollKickFrames}
          />
        )}

        {activeDocTab === 'spatial-interaction' && (
          <SpatialInteractionTab
            spatialDebugMode={spatialDebugMode}
            setSpatialDebugMode={setSpatialDebugMode}
            spatialShowAnchors={spatialShowAnchors}
            setSpatialShowAnchors={setSpatialShowAnchors}
            spatialShowCameraFrame={spatialShowCameraFrame}
            setSpatialShowCameraFrame={setSpatialShowCameraFrame}
            spatialShowHitboxRing={spatialShowHitboxRing}
            setSpatialShowHitboxRing={setSpatialShowHitboxRing}
            spatialAutoSolveReach={spatialAutoSolveReach}
            setSpatialAutoSolveReach={setSpatialAutoSolveReach}
            spatialTargetClashFrame={spatialTargetClashFrame}
            setSpatialTargetClashFrame={setSpatialTargetClashFrame}
            spatialAttackerX={spatialAttackerX}
            setSpatialAttackerX={setSpatialAttackerX}
            spatialAttackerElevation={spatialAttackerElevation}
            setSpatialAttackerElevation={setSpatialAttackerElevation}
            spatialDefenderX={spatialDefenderX}
            setSpatialDefenderX={setSpatialDefenderX}
            spatialDefenderElevation={spatialDefenderElevation}
            setSpatialDefenderElevation={setSpatialDefenderElevation}
            spatialAttackType={spatialAttackType}
            setSpatialAttackType={setSpatialAttackType}
            spatialPlatformHeight={spatialPlatformHeight}
            setSpatialPlatformHeight={setSpatialPlatformHeight}
            liveSpatialAudit={liveSpatialAudit}
          />
        )}

        {activeDocTab === 'procedural-motion' && (
          <ProceduralMotionTab
            gaitProgress={gaitProgress}
            setGaitProgress={setGaitProgress}
            gaitStrideLength={gaitStrideLength}
            setGaitStrideLength={setGaitStrideLength}
            gaitStepHeight={gaitStepHeight}
            setGaitStepHeight={setGaitStepHeight}
            ikFacingRight={ikFacingRight}
            setIkFacingRight={setIkFacingRight}
          />
        )}

        {activeDocTab === 'skills' && (
          <SkillsCatalogTab
            liveBiomechanicsAudit={liveBiomechanicsAudit}
            selectedSkillCategory={selectedSkillCategory}
            setSelectedSkillCategory={setSelectedSkillCategory}
            skillSearchQuery={skillSearchQuery}
            setSkillSearchQuery={setSkillSearchQuery}
            synthesizing={synthesizing}
            handleSynthesizeAndDownload={handleSynthesizeAndDownload}
          />
        )}

        {activeDocTab === 'frames' && (
          <FrameInspectorTab
            activeAnimationMode={activeAnimationMode}
            sneezeFrames={sneezeFrames}
            superheroFrames={superheroFrames}
          />
        )}

        {activeDocTab === 'bone-hierarchy' && (
          <BoneHierarchyTab
            currentFrame={currentFrame}
            totalModeFrames={totalModeFrames}
            activeAnimationMode={activeAnimationMode}
            selectedBoneFigure={selectedBoneFigure}
            setSelectedBoneFigure={setSelectedBoneFigure}
            safeTeleportFrame={safeTeleportFrame}
            safeHeroJoints={safeHeroJoints}
          />
        )}

        {activeDocTab === 'methodology' && (
          <MethodologyTab
            activeAnimationMode={activeAnimationMode}
            globalFps={globalFps}
            totalModeFrames={totalModeFrames}
            basketballAudit={basketballAudit}
            strollKickAudit={strollKickAudit}
            basketballFrames={basketballFrames}
            strollKickFrames={strollKickFrames}
            phantomFrames={phantomFrames}
            speedStrengthFrames={speedStrengthFrames}
            teleportFrames={teleportFrames}
            sneezeFrames={sneezeFrames}
            superheroFrames={superheroFrames}
            currentFrame={currentFrame}
            selectedPresetPath={selectedPresetPath}
            setSelectedPresetPath={setSelectedPresetPath}
            syncAnimationModeFromPath={syncAnimationModeFromPath}
            activeInspection={activeInspection}
            inspectLoading={inspectLoading}
            inspectError={inspectError}
            binaryStageOverride={binaryStageOverride}
            setBinaryStageOverride={setBinaryStageOverride}
            handleFileUpload={handleFileUpload}
            setCurrentFrame={setCurrentFrame}
            setIsPlaying={setIsPlaying}
            inspectorCanvasRef={inspectorCanvasRef}
          />
        )}
      </div>
    </section>
  );
};
