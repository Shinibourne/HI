import React from 'react';
import { TeleportAmbushKeyframeSpec } from '../../lib/stknds/stkndsCore';
import { STICKFIGURE_BONE_NAMES, STICKFIGURE_PARENTS } from '../../lib/stknds/stickfigureStructure';

export interface JointPoint {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  worldAngle: number;
  relAngleA1: number;
  length: number;
  thickness: number;
}

interface BoneHierarchyTabProps {
  currentFrame: number;
  totalModeFrames: number;
  activeAnimationMode: string;
  selectedBoneFigure: 'red' | 'blue';
  setSelectedBoneFigure: (fig: 'red' | 'blue') => void;
  safeTeleportFrame: TeleportAmbushKeyframeSpec;
  safeHeroJoints: JointPoint[];
}

export const BoneHierarchyTab: React.FC<BoneHierarchyTabProps> = ({
  currentFrame,
  totalModeFrames,
  activeAnimationMode,
  selectedBoneFigure,
  setSelectedBoneFigure,
  safeTeleportFrame,
  safeHeroJoints,
}) => {
  return (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    Active Frame #{(currentFrame % totalModeFrames).toString().padStart(2, '0')} —{' '}
                    {activeAnimationMode === 'teleport'
                      ? selectedBoneFigure === 'red'
                        ? 'Character Red (Figure #1 Seated Guard)'
                        : 'Character Blue (Figure #2 Ambush Attacker)'
                      : 'All 17 Bone Angles & Joint Coordinates'}
                  </h3>
                  {activeAnimationMode === 'teleport' && !safeTeleportFrame.bluePresent && selectedBoneFigure === 'blue' && (
                    <p className="text-xs text-[#DC2626] font-mono mt-0.5">
                      Note: Character Blue has vanished from the scene during this whip-pan frame (F15–F16).
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {activeAnimationMode === 'teleport' && (
                    <div className="flex items-center gap-1 p-0.5 bg-[#F1F5F9] rounded-md text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedBoneFigure('red')}
                        className={`px-2.5 py-1 rounded font-medium transition-colors ${
                          selectedBoneFigure === 'red'
                            ? 'bg-[#DC2626] text-white'
                            : 'text-[#475569] hover:text-[#0F172A]'
                        }`}
                      >
                        Red (Fig #1)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedBoneFigure('blue')}
                        className={`px-2.5 py-1 rounded font-medium transition-colors ${
                          selectedBoneFigure === 'blue'
                            ? 'bg-[#2563EB] text-white'
                            : 'text-[#475569] hover:text-[#0F172A]'
                        }`}
                      >
                        Blue (Fig #2)
                      </button>
                    </div>
                  )}
                  <span className="text-xs font-mono text-[#475569]">
                    a1(i) = world_angle(i) − world_angle(parent(i))
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto max-h-80 overflow-y-auto border border-[#E2E8F0] rounded-lg">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead className="sticky top-0 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569]">
                    <tr>
                      <th className="py-2 px-3">Bone Name</th>
                      <th className="py-2 px-3">Parent</th>
                      <th className="py-2 px-3">Length (@+4)</th>
                      <th className="py-2 px-3">Rel Angle a1 (@+12)</th>
                      <th className="py-2 px-3">World Angle</th>
                      <th className="py-2 px-3">Joint Start (X, Y)</th>
                      <th className="py-2 px-3">Joint Tip (X, Y)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {safeHeroJoints.map((j, idx) => (
                      <tr
                        key={STICKFIGURE_BONE_NAMES[idx]}
                        className={
                          idx === 7 || idx === 9 || idx === 10 || idx === 13
                            ? 'bg-[#0284C7]/8 font-semibold'
                            : 'hover:bg-[#F8FAFC]'
                        }
                      >
                        <td className="py-1.5 px-3">{STICKFIGURE_BONE_NAMES[idx]}</td>
                        <td className="py-1.5 px-3">
                          {STICKFIGURE_PARENTS[idx] === -1
                            ? 'Scene Root'
                            : `Node ${STICKFIGURE_PARENTS[idx].toString().padStart(2, '0')}`}
                        </td>
                        <td className="py-1.5 px-3">{j.length.toFixed(1)}</td>
                        <td className="py-1.5 px-3 text-[#0284C7]">{j.relAngleA1.toFixed(2)}°</td>
                        <td className="py-1.5 px-3">{j.worldAngle.toFixed(1)}°</td>
                        <td className="py-1.5 px-3">
                          ({j.startX.toFixed(1)}, {j.startY.toFixed(1)})
                        </td>
                        <td className="py-1.5 px-3">
                          ({j.endX.toFixed(1)}, {j.endY.toFixed(1)})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
  );
};
