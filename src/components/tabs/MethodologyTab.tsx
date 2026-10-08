import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, FileCode2, Upload, AlertCircle, Play, Layers } from 'lucide-react';
import { BasketballAuditReport } from '../../lib/basketballChoreographyFrames';
import { BiomechanicalAuditReport } from '../../lib/sitWalkKickBallFrames';
import { StkndsInspectionResult } from '../../lib/stknds/stkndsCore';
import { CORPUS_PRESETS } from '../../data/corpusPresets';
import { computeForwardKinematics } from '../../lib/kinematics/forwardKinematics';

interface MethodologyTabProps {
  activeAnimationMode: string;
  globalFps: 12 | 24;
  totalModeFrames: number;
  basketballAudit: BasketballAuditReport;
  strollKickAudit: BiomechanicalAuditReport;
  basketballFrames: any[];
  strollKickFrames: any[];
  phantomFrames: any[];
  speedStrengthFrames: any[];
  teleportFrames: any[];
  sneezeFrames: any[];
  superheroFrames: any[];
  currentFrame: number;
  selectedPresetPath: string;
  setSelectedPresetPath: (val: string) => void;
  syncAnimationModeFromPath: (val: string) => void;
  activeInspection: StkndsInspectionResult | null;
  inspectLoading: boolean;
  inspectError: string | null;
  binaryStageOverride: boolean;
  setBinaryStageOverride: (val: React.SetStateAction<boolean>) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  setCurrentFrame: (f: number | ((prev: number) => number)) => void;
  setIsPlaying: (playing: boolean) => void;
  inspectorCanvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const MethodologyTab: React.FC<MethodologyTabProps> = ({
  activeAnimationMode,
  globalFps,
  totalModeFrames,
  basketballAudit,
  strollKickAudit,
  basketballFrames,
  strollKickFrames,
  phantomFrames,
  speedStrengthFrames,
  teleportFrames,
  sneezeFrames,
  superheroFrames,
  currentFrame,
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
  useEffect(() => {
    if (!inspectorCanvasRef?.current || !activeInspection || activeInspection.frames.length === 0) return;
    const canvas = inspectorCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const safeIdx = currentFrame % activeInspection.frames.length;
    const binFrame = activeInspection.frames[safeIdx];
    const instances = binFrame.instances ?? [
      {
        instanceIndex: 0,
        instanceScale: binFrame.instanceScale,
        sceneX: binFrame.sceneX,
        sceneY: binFrame.sceneY,
        instanceColorHex: binFrame.instanceColorHex,
        nodes: binFrame.nodes,
      },
    ];

    const scaleX = w / 1920;
    const scaleY = h / 1080;
    const groundSceneY = 755;
    const groundCanvasY = groundSceneY * scaleY;

    // Light High-Contrast Sky & Platform Floor (Never Black)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundCanvasY);
    skyGrad.addColorStop(0, '#F8FAFC');
    skyGrad.addColorStop(1, '#F1F5F9');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, groundCanvasY);

    const floorGrad = ctx.createLinearGradient(0, groundCanvasY, 0, h);
    floorGrad.addColorStop(0, '#E2E8F0');
    floorGrad.addColorStop(0.15, '#EDF2F7');
    floorGrad.addColorStop(1, '#CBD5E1');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, groundCanvasY, w, h - groundCanvasY);

    // Fine coordinate grid
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < w; gx += 40) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.stroke();
    }

    // Master Ground line
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundCanvasY);
    ctx.lineTo(w, groundCanvasY);
    ctx.stroke();

    ctx.save();
    const targetSceneX = 720;
    const targetSceneY = 540;
    ctx.translate(w * 0.5, h * 0.5);
    const z = binFrame.camZoom && binFrame.camZoom > 0.2 ? binFrame.camZoom * 0.9 : 0.9;
    ctx.scale(z, z);
    ctx.translate(-targetSceneX * scaleX, -targetSceneY * scaleY);

    for (const inst of instances) {
      const wAngles = inst.nodes.map((n: any) => n.worldAngle);
      const nonZeroLimbs = inst.nodes.filter((n: any, idx: number) => idx !== 0 && idx !== 13 && n.length > 1).length;
      if (nonZeroLimbs === 0 && inst.nodes[13] && inst.nodes[13].length > 0) {
        // Ball / Prop
        const r = inst.nodes[13].length * 0.5 * inst.instanceScale * scaleX;
        ctx.save();
        ctx.fillStyle = inst.nodes[13].colorHex || inst.instanceColorHex;
        ctx.beginPath();
        ctx.arc(inst.sceneX * scaleX, inst.sceneY * scaleY, Math.max(3, r), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (inst.nodes.length === 17) {
        const joints = computeForwardKinematics(inst.sceneX, inst.sceneY, wAngles, inst.instanceScale);
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (let i = 1; i < 17; i++) {
          if (i === 13) continue;
          const j = joints[i];
          ctx.strokeStyle = inst.nodes[i]?.colorHex || inst.instanceColorHex;
          ctx.lineWidth = Math.max(1.5, j.thickness * inst.instanceScale * scaleX);
          ctx.beginPath();
          ctx.moveTo(j.startX * scaleX, j.startY * scaleY);
          ctx.lineTo(j.endX * scaleX, j.endY * scaleY);
          ctx.stroke();
        }
        const headJ = joints[13];
        const headCx = ((headJ.startX + headJ.endX) * 0.5) * scaleX;
        const headCy = ((headJ.startY + headJ.endY) * 0.5) * scaleY;
        const headR = (headJ.length * inst.instanceScale * 0.5) * scaleX;
        ctx.fillStyle = inst.nodes[13]?.colorHex || inst.instanceColorHex;
        ctx.beginPath();
        ctx.arc(headCx, headCy, Math.max(3, headR), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.restore();
  }, [inspectorCanvasRef, activeInspection, currentFrame]);

  return (
    <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-2.5">
                <div className="text-xs font-mono text-[#0284C7] font-semibold">
                  FPS HEADER OFFSET (@BYTE 30)
                </div>
                <h3 className="text-base font-semibold text-[#0F172A]">
                  12 FPS vs 24 FPS Binary Encoding
                </h3>
                <p className="text-sm text-[#475569] leading-relaxed">
                  Across all corpus templates (<code className="font-mono text-xs">project6</code>, <code className="font-mono text-xs">rpoject5</code>, <code className="font-mono text-xs">Project2..4</code>), project frame rate is stored at offset <code className="font-mono text-xs">8 + name_len + 14</code> (byte <code className="font-mono text-xs">30</code> when <code className="font-mono text-xs">name_len = 8</code>). Setting byte <code className="font-mono text-xs">30</code> to <code className="font-mono text-xs">0x0C</code> configures 12 FPS; <code className="font-mono text-xs">0x18</code> configures 24 FPS.
                </p>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-2.5">
                <div className="text-xs font-mono text-[#0284C7] font-semibold">
                  FRAME LIST DELIMITER (+1194)
                </div>
                <h3 className="text-base font-semibold text-[#0F172A]">
                  Variable Frame Count Table Rules
                </h3>
                <p className="text-sm text-[#475569] leading-relaxed">
                  Big-endian <code className="font-mono text-xs">int32</code> at offset <code className="font-mono text-xs">2587</code> specifies total frames <code className="font-mono text-xs">N</code>. Every 1,197-byte frame record <code className="font-mono text-xs">0..N−2</code> terminates with <code className="font-mono text-xs">01 01 00</code> at <code className="font-mono text-xs">+1194..+1197</code>, while the final frame <code className="font-mono text-xs">N−1</code> terminates with <code className="font-mono text-xs">00 00 00</code> before the 41-byte project trailer.
                </p>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-2.5">
                <div className="text-xs font-mono text-[#0284C7] font-semibold">
                  VALIDATION DISCLOSURE
                </div>
                <h3 className="text-base font-semibold text-[#0F172A]">
                  Container &amp; Semantic Verification
                </h3>
                <p className="text-sm text-[#475569] leading-relaxed">
                  All exported <code className="font-mono text-xs">.stknds</code> files pass Level 1 (Container) and Level 2 (Semantic) checks in the inspector below. Per <code className="font-mono text-xs">SKILL.md</code> Section 14, native Stick Nodes app execution is not available in this browser environment and is not claimed as device smoke-tested.
                </p>
              </div>
            </div>

        <section id="trajectory" className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-[#0F172A]">
                04. Complete Keyframe Schedule —{' '}
                {activeAnimationMode === 'basketball'
                  ? `Basketball: Walk → Approach → Pick Up → Toss → Catch → Dribble (${basketballFrames.length} Frames)`
                  : activeAnimationMode === 'stroll-kick'
                  ? `The Stroll & Kick (${strollKickFrames.length} Frames · Man + Ball + Camera)`
                  : activeAnimationMode === 'phantom'
                  ? `The Phantom Shadowbox (${phantomFrames.length} Frames)`
                  : activeAnimationMode === 'speed-strength'
                  ? `Speed vs Strength (${speedStrengthFrames.length} Frames · 2 Figures)`
                  : activeAnimationMode === 'teleport'
                  ? `The Teleport Ambush (${teleportFrames.length} Frames · 2 Figures + Camera)`
                  : activeAnimationMode === 'sneeze'
                  ? `The Epic Sneeze (${sneezeFrames.length} Frames)`
                  : `Walk, Scratch & 12f Sky Flight (${superheroFrames.length} Frames)`}
              </h2>
              <p className="text-xs text-[#475569] mt-0.5">
                Click any row to scrub the viewport to that keyframe and inspect its joint angles and camera parameters.
              </p>
            </div>
            <span className="text-xs font-mono text-[#475569]">
              Target Rate: {globalFps} FPS (@byte 30) · Total Frames: {totalModeFrames}
            </span>
          </div>

          <div className="overflow-x-auto max-h-[440px] overflow-y-auto border border-[#E2E8F0] rounded-lg">
            {activeAnimationMode === 'basketball' ? (
              <table className="w-full text-left border-collapse text-xs font-mono min-w-[760px]">
                <thead className="sticky top-0 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569]">
                  <tr>
                    <th className="py-2.5 px-3">Frame</th>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3 font-sans">Choreographic Phase</th>
                    <th className="py-2.5 px-3 font-sans">Sub-Event</th>
                    <th className="py-2.5 px-3 text-[#EA580C]">Ball State</th>
                    <th className="py-2.5 px-3">Pelvis (X, Y)</th>
                    <th className="py-2.5 px-3 text-[#EA580C]">Ball (X, Y)</th>
                    <th className="py-2.5 px-3">R_Knee / R_Elbow</th>
                    <th className="py-2.5 px-3">CoM (X, Y)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {basketballFrames.map((row: any, idx: number) => {
                    const isCurrent = currentFrame % basketballFrames.length === idx;
                    return (
                      <tr
                        key={idx}
                        onClick={() => {
                          setIsPlaying(false);
                          setCurrentFrame(idx);
                        }}
                        className={`cursor-pointer transition-colors ${
                          isCurrent
                            ? 'bg-[#EA580C]/15 font-semibold'
                            : row.ballState === 'PROJECTILE' || row.ballState === 'CAUGHT'
                            ? 'bg-[#EFF6FF]/60 hover:bg-[#DBEAFE]/70'
                            : row.ballState.includes('DRIBBLE')
                            ? 'bg-[#FFF7ED]/70 hover:bg-[#FFEDD5]/70'
                            : 'hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <td className="py-2 px-3 text-[#EA580C]">
                          #{idx.toString().padStart(2, '0')}
                        </td>
                        <td className="py-2 px-3 text-[#64748B]">{row.timeSeconds.toFixed(2)}s</td>
                        <td className="py-2 px-3 font-sans text-[#475569]">{row.phaseName}</td>
                        <td className="py-2 px-3 font-sans text-[#0F172A]">{row.subEventName}</td>
                        <td className="py-2 px-3 text-[#EA580C] font-semibold">{row.ballState}</td>
                        <td className="py-2 px-3">
                          ({row.charX.toFixed(0)}, {row.charY.toFixed(0)})
                        </td>
                        <td className="py-2 px-3 text-[#EA580C]">
                          ({row.ballX.toFixed(1)}, {row.ballY.toFixed(1)})
                        </td>
                        <td className="py-2 px-3">
                          {row.rKneeFlexDeg.toFixed(0)}° / {row.rElbowFlexDeg.toFixed(0)}°
                        </td>
                        <td className="py-2 px-3 text-[#059669]">
                          ({row.comX.toFixed(1)}, {row.comY.toFixed(1)})
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : activeAnimationMode === 'stroll-kick' ? (
              <table className="w-full text-left border-collapse text-xs font-mono min-w-[760px]">
                <thead className="sticky top-0 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569]">
                  <tr>
                    <th className="py-2.5 px-3">Frame</th>
                    <th className="py-2.5 px-3 font-sans">Narrative Act</th>
                    <th className="py-2.5 px-3 font-sans">Keyframe Stage</th>
                    <th className="py-2.5 px-3">Man Pelvis (X, Y)</th>
                    <th className="py-2.5 px-3 text-[#EA580C]">Ball (X, Y)</th>
                    <th className="py-2.5 px-3">Spine / Chest</th>
                    <th className="py-2.5 px-3">CoM (X, Y)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {strollKickFrames.map((row: any, idx: number) => {
                    const isCurrent = currentFrame % strollKickFrames.length === idx;
                    return (
                      <tr
                        key={idx}
                        onClick={() => {
                          setIsPlaying(false);
                          setCurrentFrame(idx);
                        }}
                        className={`cursor-pointer transition-colors ${
                          isCurrent ? 'bg-[#0284C7]/15 font-semibold' : 'hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <td className="py-2 px-3 text-[#0284C7]">
                          #{idx.toString().padStart(3, '0')}
                        </td>
                        <td className="py-2 px-3 font-sans text-[#475569]">{row.act}</td>
                        <td className="py-2 px-3 font-sans text-[#0F172A]">{row.phase}</td>
                        <td className="py-2 px-3">
                          ({row.manX.toFixed(0)}, {row.manY.toFixed(0)})
                        </td>
                        <td className="py-2 px-3 text-[#EA580C]">
                          ({row.ballX.toFixed(0)}, {row.ballY.toFixed(0)})
                        </td>
                        <td className="py-2 px-3">
                          {row.manAngles[7].toFixed(0)}° / {row.manAngles[8].toFixed(0)}°
                        </td>
                        <td className="py-2 px-3 text-[#059669]">
                          ({row.comX.toFixed(1)}, {row.comY.toFixed(1)})
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : activeAnimationMode === 'phantom' ? (
              <table className="w-full text-left border-collapse text-xs font-mono min-w-[760px]">
                <thead className="sticky top-0 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569]">
                  <tr>
                    <th className="py-2.5 px-3">Frame</th>
                    <th className="py-2.5 px-3 font-sans">Storyboard Panel</th>
                    <th className="py-2.5 px-3 font-sans">Keyframe Stage</th>
                    <th className="py-2.5 px-3">Scene (X, Y)</th>
                    <th className="py-2.5 px-3">Spine (N07/N08)</th>
                    <th className="py-2.5 px-3">R_Arm / L_Arm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {phantomFrames.map((row: any, idx: number) => {
                    const isCurrent = currentFrame % phantomFrames.length === idx;
                    return (
                      <tr
                        key={idx}
                        onClick={() => {
                          setIsPlaying(false);
                          setCurrentFrame(idx);
                        }}
                        className={`cursor-pointer transition-colors ${
                          isCurrent ? 'bg-[#0284C7]/15 font-semibold' : 'hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <td className="py-2 px-3 text-[#0284C7]">
                          #{idx.toString().padStart(2, '0')}
                        </td>
                        <td className="py-2 px-3 font-sans text-[#475569]">{row.act}</td>
                        <td className="py-2 px-3 font-sans text-[#0F172A]">{row.phase}</td>
                        <td className="py-2 px-3">
                          {row.isTeleportBlank
                            ? 'TELEPORT VANISH'
                            : `(${row.sceneX.toFixed(0)}, ${row.sceneY.toFixed(0)})`}
                        </td>
                        <td className="py-2 px-3">
                          {row.worldAngles[7].toFixed(0)}° / {row.worldAngles[8].toFixed(0)}°
                        </td>
                        <td className="py-2 px-3">
                          {row.worldAngles[10].toFixed(0)}° / {row.worldAngles[15].toFixed(0)}°
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : activeAnimationMode === 'speed-strength' ? (
              <table className="w-full text-left border-collapse text-xs font-mono min-w-[760px]">
                <thead className="sticky top-0 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569]">
                  <tr>
                    <th className="py-2.5 px-3">Frame</th>
                    <th className="py-2.5 px-3 font-sans">Narrative Act</th>
                    <th className="py-2.5 px-3 font-sans">Keyframe Stage</th>
                    <th className="py-2.5 px-3 text-[#D97706]">Speed A (X, Y)</th>
                    <th className="py-2.5 px-3 text-[#334155]">Strength B (X, Y)</th>
                    <th className="py-2.5 px-3">Camera Zoom</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {speedStrengthFrames.map((row: any, idx: number) => {
                    const isCurrent = currentFrame % speedStrengthFrames.length === idx;
                    return (
                      <tr
                        key={idx}
                        onClick={() => {
                          setIsPlaying(false);
                          setCurrentFrame(idx);
                        }}
                        className={`cursor-pointer transition-colors ${
                          isCurrent ? 'bg-[#0284C7]/15 font-semibold' : 'hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <td className="py-2 px-3 text-[#0284C7]">
                          #{idx.toString().padStart(2, '0')}
                        </td>
                        <td className="py-2 px-3 font-sans text-[#475569]">{row.act}</td>
                        <td className="py-2 px-3 font-sans text-[#0F172A]">{row.phase}</td>
                        <td className="py-2 px-3 text-[#D97706]">
                          ({row.charAX.toFixed(0)}, {row.charAY.toFixed(0)})
                        </td>
                        <td className="py-2 px-3 text-[#334155]">
                          ({row.charBX.toFixed(0)}, {row.charBY.toFixed(0)})
                        </td>
                        <td className="py-2 px-3 text-[#0284C7]">{row.camZoom.toFixed(2)}x</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : activeAnimationMode === 'teleport' ? (
              <table className="w-full text-left border-collapse text-xs font-mono min-w-[760px]">
                <thead className="sticky top-0 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569]">
                  <tr>
                    <th className="py-2.5 px-3">Frame</th>
                    <th className="py-2.5 px-3 font-sans">Narrative Act</th>
                    <th className="py-2.5 px-3 font-sans">Keyframe Stage</th>
                    <th className="py-2.5 px-3">Camera (@+42..+50)</th>
                    <th className="py-2.5 px-3 text-[#DC2626]">Red Seated (X, Y)</th>
                    <th className="py-2.5 px-3 text-[#2563EB]">Blue Ambush (X, Y)</th>
                    <th className="py-2.5 px-3">Red Spine / Forearm</th>
                    <th className="py-2.5 px-3">Blue Shin / Kick</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {teleportFrames.map((row: any, idx: number) => {
                    const isCurrent = currentFrame % teleportFrames.length === idx;
                    return (
                      <tr
                        key={idx}
                        onClick={() => {
                          setIsPlaying(false);
                          setCurrentFrame(idx);
                        }}
                        className={`cursor-pointer transition-colors ${
                          isCurrent
                            ? 'bg-[#0284C7]/15 font-semibold'
                            : row.act.includes('Screen Shake') || row.act.includes('Block')
                            ? 'bg-[#FEF2F2]/70 hover:bg-[#FEE2E2]/70'
                            : row.act.includes('Whip Pan')
                            ? 'bg-[#EFF6FF]/70 hover:bg-[#DBEAFE]/70'
                            : row.act.includes('Ambush')
                            ? 'bg-[#FEF9C3]/50 hover:bg-[#FEF08A]/60'
                            : 'hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <td className="py-2 px-3 text-[#0284C7]">
                          #{idx.toString().padStart(2, '0')}
                        </td>
                        <td className="py-2 px-3 font-sans text-[#475569]">{row.act}</td>
                        <td className="py-2 px-3 font-sans text-[#0F172A]">{row.phase}</td>
                        <td className="py-2 px-3 text-[#0284C7]">
                          {row.camZoom.toFixed(2)}x ({row.camX.toFixed(0)}, {row.camY.toFixed(0)})
                        </td>
                        <td className="py-2 px-3 text-[#DC2626]">
                          ({row.redX.toFixed(0)}, {row.redY.toFixed(0)})
                        </td>
                        <td className="py-2 px-3 text-[#2563EB]">
                          {row.bluePresent
                            ? `(${row.blueX.toFixed(0)}, ${row.blueY.toFixed(0)})`
                            : 'VANISHED (0 FIG)'}
                        </td>
                        <td className="py-2 px-3">
                          {row.redAngles[7].toFixed(0)}° / {row.redAngles[10].toFixed(0)}°
                        </td>
                        <td className="py-2 px-3">
                          {row.bluePresent
                            ? `${row.blueAngles[2].toFixed(0)}° / ${row.blueAngles[3].toFixed(0)}°`
                            : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse text-xs font-mono min-w-[760px]">
                <thead className="sticky top-0 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569]">
                  <tr>
                    <th className="py-2.5 px-3">Frame</th>
                    <th className="py-2.5 px-3">Byte Offset</th>
                    <th className="py-2.5 px-3 font-sans">Narrative Act</th>
                    <th className="py-2.5 px-3 font-sans">Keyframe Pose</th>
                    <th className="py-2.5 px-3">Scene X (@+130)</th>
                    <th className="py-2.5 px-3">Scene Y (@+134)</th>
                    <th className="py-2.5 px-3">Spine (N07)</th>
                    <th className="py-2.5 px-3">R_Arm (N09/N10)</th>
                    <th className="py-2.5 px-3">Head (N13)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {(activeAnimationMode === 'sneeze' ? sneezeFrames : superheroFrames).map((row: any, idx: number) => {
                    const isCurrent =
                      activeAnimationMode !== 'bounce' &&
                      currentFrame % (activeAnimationMode === 'sneeze' ? sneezeFrames.length : superheroFrames.length) === idx;
                    const byteOff = 2594 + idx * 1197;
                    return (
                      <tr
                        key={idx}
                        onClick={() => {
                          setIsPlaying(false);
                          setCurrentFrame(idx);
                        }}
                        className={`cursor-pointer transition-colors ${
                          isCurrent
                            ? 'bg-[#0284C7]/15 font-semibold'
                            : row.act.includes('Explosion')
                            ? 'bg-[#FEF2F2]/70 hover:bg-[#FEE2E2]/70'
                            : row.isFlightFrame
                            ? 'bg-[#E0F2FE]/40 hover:bg-[#E0F2FE]/70'
                            : 'hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <td className="py-2 px-3 text-[#0284C7]">
                          #{idx.toString().padStart(2, '0')}
                        </td>
                        <td className="py-2 px-3 text-[#64748B]">{byteOff}</td>
                        <td className="py-2 px-3 font-sans text-[#475569]">{row.act}</td>
                        <td className="py-2 px-3 font-sans text-[#0F172A]">{row.phase}</td>
                        <td className="py-2 px-3">{row.sceneX.toFixed(1)}</td>
                        <td className="py-2 px-3">{row.sceneY.toFixed(1)}</td>
                        <td className="py-2 px-3">{row.worldAngles[7].toFixed(0)}°</td>
                        <td className="py-2 px-3">
                          {row.worldAngles[9].toFixed(0)}° / {row.worldAngles[10].toFixed(0)}°
                        </td>
                        <td className="py-2 px-3">{row.worldAngles[13].toFixed(0)}°</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>


        <section id="corpus" className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-[#0F172A] flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-[#0284C7]" />
                05. Interactive .stknds Corpus &amp; Semantic Inspector
              </h2>
              <p className="text-xs text-[#475569] mt-0.5">
                Browser-native port of <code className="font-mono">inspect_stknds.py</code> extended
                with Level-2 figure hierarchy, FPS header, and frame record semantic verification.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                aria-label="Select a .stknds file to inspect"
                value={selectedPresetPath}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedPresetPath(val);
                  syncAnimationModeFromPath(val);
                }}
                className="text-xs font-medium bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-2 text-[#0F172A]"
              >
                {CORPUS_PRESETS.map((p) => (
                  <option key={p.path} value={p.path}>
                    [{p.category}] {p.label}
                  </option>
                ))}
              </select>

              {activeInspection && activeInspection.frames.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setBinaryStageOverride((prev) => !prev);
                    setCurrentFrame(0);
                    setIsPlaying(true);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    binaryStageOverride
                      ? 'bg-[#0284C7] text-white shadow-xs'
                      : 'bg-[#EFF6FF] text-[#0284C7] border border-[#BAE6FD] hover:bg-[#DBEAFE]'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  {binaryStageOverride
                    ? 'Playing Raw Binary on Main Stage'
                    : 'Play Decoded Binary on Main Stage'}
                </button>
              )}

              <label className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] rounded-lg cursor-pointer transition-colors whitespace-nowrap">
                <Upload className="w-3.5 h-3.5" />
                Inspect Local .stknds
                <input
                  type="file"
                  accept=".stknds"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {inspectLoading && (
            <div className="py-8 text-center text-sm text-[#475569] font-mono">
              Decompressing GZIP stream and verifying v334 binary offsets...
            </div>
          )}

          {inspectError && (
            <div className="p-4 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>ERROR: {inspectError}</span>
            </div>
          )}

          {!inspectLoading && activeInspection && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
                <div>
                  <div className="text-[#64748B]">File Name</div>
                  <div className="font-mono font-semibold text-[#0F172A] mt-0.5 truncate">
                    {activeInspection.fileName}
                  </div>
                </div>
                <div>
                  <div className="text-[#64748B]">Compressed / Raw</div>
                  <div className="font-mono font-semibold text-[#0F172A] mt-0.5">
                    {activeInspection.compressedSize.toLocaleString()} B →{' '}
                    {activeInspection.decompressedSize.toLocaleString()} B
                  </div>
                </div>
                <div>
                  <div className="text-[#64748B]">Format Version &amp; Rate</div>
                  <div className="font-mono font-semibold text-[#0284C7] mt-0.5">
                    v{activeInspection.version} · {activeInspection.fps} FPS
                  </div>
                </div>
                <div>
                  <div className="text-[#64748B]">Embedded Figure</div>
                  <div className="font-mono font-semibold text-[#0F172A] mt-0.5 truncate">
                    {activeInspection.figureName} ({activeInspection.figureNodes.length} nodes)
                  </div>
                </div>
                <div>
                  <div className="text-[#64748B]">Frame Count</div>
                  <div className="font-mono font-semibold text-[#0F172A] mt-0.5">
                    {activeInspection.frameCount} frames
                  </div>
                </div>
                <div>
                  <div className="text-[#64748B]">SHA-256 Digest</div>
                  <div
                    className="font-mono font-semibold text-[#0F172A] mt-0.5 truncate"
                    title={activeInspection.sha256}
                  >
                    {activeInspection.sha256.slice(0, 16)}…
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeInspection.semanticChecks.map((chk) => (
                  <div
                    key={chk.label}
                    className="flex items-start gap-3 p-3.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                  >
                    {chk.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    )}
                    <div className="text-xs space-y-0.5">
                      <div className="font-semibold text-[#0F172A]">
                        {chk.passed ? 'PASS · ' : 'INFO · '}
                        {chk.label}
                      </div>
                      <div className="text-[#475569] font-mono">{chk.detail}</div>
                    </div>
                  </div>
                ))}
              </div>

              {activeInspection.frames.length > 0 && (
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-[#0F172A] flex items-center gap-1.5">
                        <Play className="w-4 h-4 text-[#0284C7]" />
                        Decoded Binary Frame Playback — {activeInspection.fileName}
                      </h3>
                      <p className="text-xs text-[#64748B]">
                        Rendering {activeInspection.frames.length} decoded binary frames (
                        {activeInspection.frames[0]?.figureCount ?? 1} figure/prop instance(s) per frame) at{' '}
                        {activeInspection.fps} FPS.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-semibold text-[#0284C7]">
                      Frame {(currentFrame % activeInspection.frames.length) + 1} /{' '}
                      {activeInspection.frames.length}
                    </span>
                  </div>
                  <div className="rounded-lg overflow-hidden border border-[#CBD5E1] bg-white">
                    <canvas
                      ref={inspectorCanvasRef}
                      width={640}
                      height={260}
                      className="w-full h-auto block"
                    />
                  </div>
                </div>
              )}

              {activeInspection.figureNodes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#0F172A] flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#0284C7]" />
                      Parsed 84-Byte Figure Nodes in {activeInspection.fileName} (Offset{' '}
                      {activeInspection.figureOffset})
                    </h3>
                    <span className="text-xs font-mono text-[#64748B]">
                      Showing all {activeInspection.figureNodes.length} recursive nodes
                    </span>
                  </div>
                  <div className="overflow-x-auto max-h-64 overflow-y-auto border border-[#E2E8F0] rounded-lg">
                    <table className="w-full text-left border-collapse text-xs font-mono">
                      <thead className="sticky top-0 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569]">
                        <tr>
                          <th className="py-2 px-3">Idx</th>
                          <th className="py-2 px-3">UID</th>
                          <th className="py-2 px-3">Node Type</th>
                          <th className="py-2 px-3">Length</th>
                          <th className="py-2 px-3">Thickness</th>
                          <th className="py-2 px-3">Local (X, Y)</th>
                          <th className="py-2 px-3">Color</th>
                          <th className="py-2 px-3">Children</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {activeInspection.figureNodes.map((n) => (
                          <tr
                            key={n.index}
                            className={
                              n.index === 13
                                ? 'bg-[#0284C7]/10 font-semibold'
                                : 'hover:bg-[#F8FAFC]'
                            }
                          >
                            <td className="py-1.5 px-3">{n.index}</td>
                            <td className="py-1.5 px-3">{n.uid}</td>
                            <td className="py-1.5 px-3">{n.nodeTypeName}</td>
                            <td className="py-1.5 px-3">{n.length.toFixed(1)}</td>
                            <td className="py-1.5 px-3">{n.thickness}</td>
                            <td className="py-1.5 px-3">
                              ({n.localX.toFixed(1)}, {n.localY.toFixed(1)})
                            </td>
                            <td className="py-1.5 px-3 flex items-center gap-1.5">
                              <span
                                className="inline-block w-3 h-3 rounded-xs border border-[#CBD5E1]"
                                style={{ backgroundColor: n.colorHex }}
                              />
                              {n.colorHex}
                            </td>
                            <td className="py-1.5 px-3">{n.childCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
    </div>
  );
};
