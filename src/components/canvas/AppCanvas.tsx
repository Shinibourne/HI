import { computeForwardKinematics, JointPoint } from '../../lib/kinematics/forwardKinematics';
import { StkndsInspectionResult } from '../../lib/stknds/stkndsCore';
import React, { useEffect } from 'react';
import { BasketballGeneratorConfig, BasketballKeyframeSpec } from '../../lib/basketballChoreographyFrames';
import { SitWalkKickGeneratorConfig, SitWalkKickKeyframeSpec } from '../../lib/sitWalkKickBallFrames';
import { PhantomShadowboxGeneratorConfig, PhantomShadowboxKeyframeSpec } from '../../lib/phantomShadowboxFrames';
import { SpeedVsStrengthGeneratorConfig, SpeedVsStrengthKeyframeSpec } from '../../lib/speedVsStrengthFrames';
import { TeleportAmbushGeneratorConfig, TeleportAmbushKeyframeSpec, EpicSneezeGeneratorConfig, SuperheroGeneratorConfig, BounceGeneratorConfig, StickfigureKeyframeSpec } from '../../lib/stknds/stkndsCore';
import { STICKFIGURE_PARENTS, STICKFIGURE_BONE_LENGTHS } from '../../lib/stknds/stickfigureStructure';
import { calculateCenterOfMass17 } from '../../lib/skills/biomechanicalPhysics';

interface AppCanvasProps {
  binaryStageOverride: boolean;
  activeInspection: StkndsInspectionResult | null;

  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  activeAnimationMode: string;
  currentFrame: number;
  showOnionSkin: boolean;
  showTrajectoryArc: boolean;
  showKinematicsCoM: boolean;
  vcamFollow: boolean;
  globalFps: 12 | 24;
  basketballConfig: BasketballGeneratorConfig;
  strollKickConfig: SitWalkKickGeneratorConfig;
  phantomConfig: PhantomShadowboxGeneratorConfig;
  teleportConfig: TeleportAmbushGeneratorConfig;
  speedStrengthConfig: SpeedVsStrengthGeneratorConfig;
  sneezeConfig: EpicSneezeGeneratorConfig;
  heroConfig: SuperheroGeneratorConfig;
  bounceConfig: BounceGeneratorConfig;
  basketballFrames: BasketballKeyframeSpec[];
  strollKickFrames: SitWalkKickKeyframeSpec[];
  phantomFrames: PhantomShadowboxKeyframeSpec[];
  teleportFrames: TeleportAmbushKeyframeSpec[];
  speedStrengthFrames: SpeedVsStrengthKeyframeSpec[];
  sneezeFrames: StickfigureKeyframeSpec[];
  superheroFrames: StickfigureKeyframeSpec[];
  computedBounceFrames: any[];
  safeBasketballFrame: BasketballKeyframeSpec;
  safeStrollKickFrame: SitWalkKickKeyframeSpec;
  safePhantomFrame: PhantomShadowboxKeyframeSpec;
  safeTeleportFrame: TeleportAmbushKeyframeSpec;
  safeSpeedStrengthFrame: SpeedVsStrengthKeyframeSpec;
  safeHeroFrame: StickfigureKeyframeSpec;
  safeBounceFrame: any;
}

export const AppCanvas: React.FC<AppCanvasProps> = ({
  binaryStageOverride,
  activeInspection,

  canvasRef,
  activeAnimationMode,
  currentFrame,
  showOnionSkin,
  showTrajectoryArc,
  showKinematicsCoM,
  vcamFollow,
  globalFps,
  basketballConfig,
  strollKickConfig,
  phantomConfig,
  teleportConfig,
  speedStrengthConfig,
  sneezeConfig,
  heroConfig,
  bounceConfig,
  basketballFrames,
  strollKickFrames,
  phantomFrames,
  teleportFrames,
  speedStrengthFrames,
  sneezeFrames,
  superheroFrames,
  computedBounceFrames,
  safeBasketballFrame,
  safeStrollKickFrame,
  safePhantomFrame,
  safeTeleportFrame,
  safeSpeedStrengthFrame,
  safeHeroFrame,
  safeBounceFrame,
}) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const scaleX = w / 1920;
    const scaleY = h / 1080;

    // Base Studio Backdrop & Light High-Contrast Platform (Never pitch black, perfect visibility)
    const baseSky = ctx.createLinearGradient(0, 0, 0, 755 * scaleY);
    baseSky.addColorStop(0, '#F8FAFC');
    baseSky.addColorStop(1, '#F1F5F9');
    ctx.fillStyle = baseSky;
    ctx.fillRect(0, 0, w, 755 * scaleY);

    const basePlatform = ctx.createLinearGradient(0, 755 * scaleY, 0, h);
    basePlatform.addColorStop(0, '#E2E8F0');
    basePlatform.addColorStop(0.12, '#EDF2F7');
    basePlatform.addColorStop(1, '#CBD5E1');
    ctx.fillStyle = basePlatform;
    ctx.fillRect(0, 755 * scaleY, w, h - 755 * scaleY);

    if (binaryStageOverride && activeInspection && activeInspection.frames.length > 0) {
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

      ctx.save();
      const targetSceneX = 720;
      const targetSceneY = 540;
      ctx.translate(w * 0.5, h * 0.5);
      const z = binFrame.camZoom && binFrame.camZoom > 0.2 ? binFrame.camZoom : 1.0;
      ctx.scale(z, z);
      ctx.translate(-targetSceneX * scaleX, -targetSceneY * scaleY);

      const groundCanvasY = 755 * scaleY;

      const bgGrad = ctx.createLinearGradient(0, 0, 0, groundCanvasY);
      bgGrad.addColorStop(0, '#F8FAFC');
      bgGrad.addColorStop(1, '#F1F5F9');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(-2400, -1600, w + 4800, groundCanvasY + 1600);

      // Studio Platform Floor (High-Contrast, not black)
      const binFloor = ctx.createLinearGradient(0, groundCanvasY, 0, groundCanvasY + 600 * scaleY);
      binFloor.addColorStop(0, '#E2E8F0');
      binFloor.addColorStop(0.12, '#EDF2F7');
      binFloor.addColorStop(1, '#CBD5E1');
      ctx.fillStyle = binFloor;
      ctx.fillRect(-2400, groundCanvasY, w + 4800, 1600);

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-400 * scaleX, groundCanvasY);
      ctx.lineTo(3200 * scaleX, groundCanvasY);
      ctx.stroke();

      for (const inst of instances) {
        const wAngles = inst.nodes.map((n: any) => n.worldAngle);
        const nonZeroLimbs = inst.nodes.filter((n, idx) => idx !== 0 && idx !== 13 && n.length > 1).length;
        if (nonZeroLimbs === 0 && inst.nodes[13] && inst.nodes[13].length > 0) {
          // Ball / Circle prop instance
          const r = inst.nodes[13].length * 0.5 * inst.instanceScale * scaleX;
          ctx.save();
          ctx.fillStyle = inst.nodes[13].colorHex || inst.instanceColorHex;
          ctx.beginPath();
          ctx.arc(inst.sceneX * scaleX, inst.sceneY * scaleY, Math.max(4, r), 0, Math.PI * 2);
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
            ctx.lineWidth = Math.max(2, j.thickness * inst.instanceScale * scaleX);
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
          ctx.arc(headCx, headCy, Math.max(4, headR), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
      ctx.restore();

      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.fillRect(12, 12, 340, 36);
      ctx.fillStyle = '#38BDF8';
      ctx.font = '600 11px "IBM Plex Mono", monospace';
      ctx.fillText(
        `BINARY PREVIEW · ${activeInspection.fileName} · F${safeIdx + 1}/${activeInspection.frames.length}`,
        22,
        34
      );
      ctx.restore();
    } else if (activeAnimationMode === 'basketball') {
      const safeIdx = currentFrame % basketballFrames.length;
      const activeSpec = basketballFrames[safeIdx];

      ctx.save();
      // Decoupled virtual camera framing that tracks character & ball across X = 480..865
      const camCenterX = vcamFollow ? 560 + activeSpec.camX : 720;
      const camCenterY = vcamFollow ? 540 + activeSpec.camY : 540;
      ctx.translate(w * 0.5, h * 0.5);
      if (vcamFollow) {
        ctx.scale(activeSpec.camZoom, activeSpec.camZoom);
      }
      ctx.translate(-camCenterX * scaleX, -camCenterY * scaleY);

      const groundSceneY = 755;
      const groundCanvasY = groundSceneY * scaleY;

      // Studio Court Backdrop Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, groundCanvasY);
      if (activeSpec.ballState.includes('DRIBBLE')) {
        bgGrad.addColorStop(0, '#FEF3C7');
        bgGrad.addColorStop(1, '#FFFBEB');
      } else if (activeSpec.ballState === 'PROJECTILE' || activeSpec.ballState === 'CAUGHT') {
        bgGrad.addColorStop(0, '#EFF6FF');
        bgGrad.addColorStop(1, '#F8FAFC');
      } else {
        bgGrad.addColorStop(0, '#F8FAFC');
        bgGrad.addColorStop(1, '#F1F5F9');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(-2400, -1600, w + 4800, groundCanvasY + 1600);

      // Court Platform Floor (High-Contrast, never black - warm polished maple gym surface)
      const courtFloorGrad = ctx.createLinearGradient(0, groundCanvasY, 0, groundCanvasY + 600 * scaleY);
      courtFloorGrad.addColorStop(0, '#FED7AA');
      courtFloorGrad.addColorStop(0.12, '#FFEDD5');
      courtFloorGrad.addColorStop(1, '#FDBA74');
      ctx.fillStyle = courtFloorGrad;
      ctx.fillRect(-2400, groundCanvasY, w + 4800, 1600);

      // Fine coordinate grid
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      for (let gx = -400; gx < 3200; gx += 160) {
        ctx.beginPath();
        ctx.moveTo(gx * scaleX, -400);
        ctx.lineTo(gx * scaleX, h + 800);
        ctx.stroke();
      }
      for (let gy = -200; gy < 1600; gy += 120) {
        ctx.beginPath();
        ctx.moveTo(-400, gy * scaleY);
        ctx.lineTo(w + 1600, gy * scaleY);
        ctx.stroke();
      }

      // Master Ground Plane Line (Universal Y = 755.0 px)
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-400 * scaleX, groundCanvasY);
      ctx.lineTo(3200 * scaleX, groundCanvasY);
      ctx.stroke();

      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1;
      for (let tx = -200; tx <= 3000; tx += 40) {
        ctx.beginPath();
        ctx.moveTo(tx * scaleX, groundCanvasY);
        ctx.lineTo((tx - 12) * scaleX, groundCanvasY + 10);
        ctx.stroke();
      }

      // Ground Stage Zone Labels
      ctx.font = '600 10px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#64748B';
      ctx.fillText('WALK GAIT APPROACH (X: 480 → 705)', 460 * scaleX, groundCanvasY + 24);
      ctx.fillText('STANCE BASE [705..775] & SQUAT REACH', 710 * scaleX, groundCanvasY + 24);
      ctx.fillText('BALL GROUND REST (X: 865, Y: 737)', 850 * scaleX, groundCanvasY + 38);
      ctx.fillText('DRIBBLE REBOUND AXIS (WAIST 580 ↔ GROUND 737)', 880 * scaleX, groundCanvasY + 24);

      // Parabolic Ballistic Flight Arc Guide
      if (showTrajectoryArc) {
        ctx.save();
        ctx.strokeStyle = 'rgba(234, 88, 12, 0.45)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let t = 0; t <= 10; t++) {
          const frac = t / 10;
          const arcX = 864.6 * scaleX;
          const arcY = (275 + Math.pow(frac - 0.5, 2) * 4 * (491 - 275)) * scaleY;
          if (t === 0) ctx.moveTo(arcX, arcY);
          else ctx.lineTo(arcX, arcY);
        }
        ctx.stroke();

        ctx.strokeStyle = 'rgba(14, 165, 233, 0.4)';
        ctx.beginPath();
        ctx.moveTo(864.6 * scaleX, 580 * scaleY);
        ctx.lineTo(864.6 * scaleX, 737 * scaleY);
        ctx.stroke();
        ctx.restore();
      }

      // Draw the Basketball
      const ballCanvasX = activeSpec.ballX * scaleX;
      const ballCanvasY = activeSpec.ballY * scaleY;
      const ballCanvasR = basketballConfig.ballRadius * scaleX;

      // Contact shadow under ball when near ground
      if (activeSpec.ballY >= 680) {
        ctx.save();
        const shadowOpacity = Math.max(0.12, 0.70 - (activeSpec.ballY - 737) * 0.015);
        ctx.fillStyle = `rgba(15, 23, 42, ${shadowOpacity})`;
        ctx.beginPath();
        ctx.ellipse(ballCanvasX, groundCanvasY, ballCanvasR * 1.1, 4 * scaleY, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Ball 3D Spherical Rendering (Gradient with specular highlight and seams)
      ctx.save();
      const ballGrad = ctx.createRadialGradient(
        ballCanvasX - ballCanvasR * 0.35,
        ballCanvasY - ballCanvasR * 0.35,
        ballCanvasR * 0.15,
        ballCanvasX,
        ballCanvasY,
        ballCanvasR
      );
      ballGrad.addColorStop(0, '#FED7AA'); // Soft highlight
      ballGrad.addColorStop(0.35, basketballConfig.ballColorHex); // Primary vibrant orange
      ballGrad.addColorStop(1, '#9A3412'); // Deep shadow rim
      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(ballCanvasX, ballCanvasY, ballCanvasR, 0, Math.PI * 2);
      ctx.fill();

      // Basketball curved rib seams
      ctx.strokeStyle = '#7C2D12';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(ballCanvasX, ballCanvasY, ballCanvasR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(ballCanvasX, ballCanvasY, ballCanvasR * 0.45, ballCanvasR, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(ballCanvasX - ballCanvasR, ballCanvasY);
      ctx.lineTo(ballCanvasX + ballCanvasR, ballCanvasY);
      ctx.stroke();

      // Status tag floating above ball
      ctx.fillStyle = '#EA580C';
      ctx.font = '600 10px "IBM Plex Mono", monospace';
      ctx.fillText(
        `BASKETBALL [${activeSpec.ballState}]`,
        ballCanvasX - 45 * scaleX,
        ballCanvasY - 24 * scaleY
      );
      ctx.restore();

      // Ghost Onion Skin (Previous frame)
      if (showOnionSkin && safeIdx > 0) {
        const prevSpec = basketballFrames[safeIdx - 1];
        const ghostJoints = computeForwardKinematics(prevSpec.charX, prevSpec.charY, prevSpec.angles, 0.5);
        ctx.save();
        ctx.globalAlpha = 0.22;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (let i = 1; i < 17; i++) {
          if (i === 13) continue;
          const j = ghostJoints[i];
          ctx.strokeStyle = '#94A3B8';
          ctx.lineWidth = Math.max(2, j.thickness * 0.5 * scaleX);
          ctx.beginPath();
          ctx.moveTo(j.startX * scaleX, j.startY * scaleY);
          ctx.lineTo(j.endX * scaleX, j.endY * scaleY);
          ctx.stroke();
        }
        const gHead = ghostJoints[13];
        ctx.fillStyle = '#CBD5E1';
        ctx.beginPath();
        ctx.arc(
          ((gHead.startX + gHead.endX) * 0.5) * scaleX,
          ((gHead.startY + gHead.endY) * 0.5) * scaleY,
          (gHead.length * 0.25) * scaleX,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.restore();
      }

      // Draw Main Figure (17 Nodes)
      const joints = computeForwardKinematics(activeSpec.charX, activeSpec.charY, activeSpec.angles, 0.5);
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // 1. Shadow under character
      const footRX = joints[3].endX * scaleX;
      const footLX = joints[6].endX * scaleX;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
      ctx.beginPath();
      ctx.ellipse((footRX + footLX) * 0.5, groundCanvasY, 32 * scaleX, 4 * scaleY, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Far limbs (Left leg: 4, 5, 6; Left arm: 14, 15, 16) with subtle depth tint
      const farBones = [4, 5, 6, 14, 15, 16];
      for (const b of farBones) {
        const j = joints[b];
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = Math.max(2, j.thickness * 0.5 * scaleX);
        ctx.beginPath();
        ctx.moveTo(j.startX * scaleX, j.startY * scaleY);
        ctx.lineTo(j.endX * scaleX, j.endY * scaleY);
        ctx.stroke();
      }

      // 3. Torso, Spine & Head (7, 8, 12, 13)
      const coreBones = [7, 8, 12];
      for (const b of coreBones) {
        const j = joints[b];
        ctx.strokeStyle = basketballConfig.charColorHex;
        ctx.lineWidth = Math.max(2.5, j.thickness * 0.5 * scaleX);
        ctx.beginPath();
        ctx.moveTo(j.startX * scaleX, j.startY * scaleY);
        ctx.lineTo(j.endX * scaleX, j.endY * scaleY);
        ctx.stroke();
      }

      // Head circle (Node 13)
      const headJ = joints[13];
      const headCenterX = ((headJ.startX + headJ.endX) * 0.5) * scaleX;
      const headCenterY = ((headJ.startY + headJ.endY) * 0.5) * scaleY;
      const headRadius = (headJ.length * 0.25) * scaleX;

      ctx.fillStyle = basketballConfig.charColorHex;
      ctx.beginPath();
      ctx.arc(headCenterX, headCenterY, headRadius, 0, Math.PI * 2);
      ctx.fill();

      // 4. Near limbs (Right leg: 1, 2, 3; Right arm: 9, 10, 11)
      const nearBones = [1, 2, 3, 9, 10, 11];
      for (const b of nearBones) {
        const j = joints[b];
        ctx.strokeStyle = basketballConfig.charColorHex;
        ctx.lineWidth = Math.max(2.5, j.thickness * 0.5 * scaleX);
        ctx.beginPath();
        ctx.moveTo(j.startX * scaleX, j.startY * scaleY);
        ctx.lineTo(j.endX * scaleX, j.endY * scaleY);
        ctx.stroke();
      }

      // Hand contact indicator crosshair/ring
      const hand = joints[11];
      if (['HELD', 'CAUGHT', 'DRIBBLE_RECEIVE', 'DRIBBLE_PUSH'].includes(activeSpec.ballState)) {
        ctx.strokeStyle = '#0284C7';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(hand.endX * scaleX, hand.endY * scaleY, 6 * scaleX, 0, Math.PI * 2);
        ctx.stroke();
      }

      // CoM and Base of Support overlay
      if (showKinematicsCoM) {
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(activeSpec.supportMinX * scaleX, groundCanvasY);
        ctx.lineTo(activeSpec.supportMaxX * scaleX, groundCanvasY);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(activeSpec.comX * scaleX, activeSpec.comY * scaleY);
        ctx.lineTo(activeSpec.comX * scaleX, groundCanvasY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(activeSpec.comX * scaleX, activeSpec.comY * scaleY, 5 * scaleX, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.restore(); // Restore main figure drawing style (line 1050)
      ctx.restore(); // Restore camera transform (line 863)

      // Telemetry Banner in Canvas (Screen-space HUD)
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(12, 12, 460, 44, 8);
      ctx.fill();
      ctx.stroke();

      ctx.font = '600 11px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#0F172A';
      ctx.fillText(`FRAME ${activeSpec.frame}/23 · ${activeSpec.phaseName} [${activeSpec.ballState}]`, 22, 30);
      ctx.font = '500 10px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#475569';
      ctx.fillText(
        `${activeSpec.notes.length > 72 ? activeSpec.notes.slice(0, 72) + '…' : activeSpec.notes}`,
        22,
        46
      );
      ctx.restore();
    } else if (activeAnimationMode === 'stroll-kick') {
      const safeIdx = currentFrame % strollKickFrames.length;
      const activeSpec = strollKickFrames[safeIdx];

      ctx.save();
      // Decoupled virtual camera framing: camX, camY, camZoom
      const targetSceneX = 640;
      const targetSceneY = 540;
      ctx.translate(w * 0.5, h * 0.5);
      ctx.scale(activeSpec.camZoom, activeSpec.camZoom);
      ctx.translate((-targetSceneX + activeSpec.camX) * scaleX, (-targetSceneY + activeSpec.camY) * scaleY);

      const groundSceneY = 755;
      const groundCanvasY = groundSceneY * scaleY;

      // Flash & impact pulse on Frame 174 (Hit-Stop Kick Frame)
      const isHitFrame = activeSpec.frame === 174;
      const bgGrad = ctx.createLinearGradient(0, 0, 0, groundCanvasY);
      if (isHitFrame) {
        bgGrad.addColorStop(0, '#FEF3C7');
        bgGrad.addColorStop(1, '#FDE68A');
      } else if (activeSpec.act.includes('Jump')) {
        bgGrad.addColorStop(0, '#EFF6FF');
        bgGrad.addColorStop(1, '#F8FAFC');
      } else if (activeSpec.act.includes('Run') || activeSpec.act.includes('Kick')) {
        bgGrad.addColorStop(0, '#FFF7ED');
        bgGrad.addColorStop(1, '#F8FAFC');
      } else {
        bgGrad.addColorStop(0, '#F8FAFC');
        bgGrad.addColorStop(1, '#F1F5F9');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(-2400, -1600, w + 4800, groundCanvasY + 1600);

      // Studio Platform Floor (High-Contrast, not black)
      const strollFloorGrad = ctx.createLinearGradient(0, groundCanvasY, 0, groundCanvasY + 600 * scaleY);
      strollFloorGrad.addColorStop(0, '#E2E8F0');
      strollFloorGrad.addColorStop(0.12, '#EDF2F7');
      strollFloorGrad.addColorStop(1, '#CBD5E1');
      ctx.fillStyle = strollFloorGrad;
      ctx.fillRect(-2400, groundCanvasY, w + 4800, 1600);

      // Fine coordinate grid
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      for (let gx = -400; gx < 3200; gx += 160) {
        ctx.beginPath();
        ctx.moveTo(gx * scaleX, -400);
        ctx.lineTo(gx * scaleX, h + 800);
        ctx.stroke();
      }
      for (let gy = -200; gy < 1600; gy += 120) {
        ctx.beginPath();
        ctx.moveTo(-400, gy * scaleY);
        ctx.lineTo(w + 1600, gy * scaleY);
        ctx.stroke();
      }

      // Master Ground Plane Line (Universal Y = 755.0 px)
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-400 * scaleX, groundCanvasY);
      ctx.lineTo(3200 * scaleX, groundCanvasY);
      ctx.stroke();

      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1;
      for (let tx = -200; tx <= 3000; tx += 40) {
        ctx.beginPath();
        ctx.moveTo(tx * scaleX, groundCanvasY);
        ctx.lineTo((tx - 12) * scaleX, groundCanvasY + 10);
        ctx.stroke();
      }

      // Stage Zone Labels
      ctx.font = '600 10px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#64748B';
      ctx.fillText('SEATED START (X: 300)', 240 * scaleX, groundCanvasY + 24);
      ctx.fillText('STROLL & JUMP ZONE (X: 400 → 650)', 440 * scaleX, groundCanvasY + 24);
      ctx.fillText('KICK CONTACT ANCHOR (X: 884, Y: 735)', 820 * scaleX, groundCanvasY + 24);
      ctx.fillText('BALL LAUNCH TRAJECTORY CORRIDOR (+40, -44 px/f)', 1060 * scaleX, groundCanvasY + 24);

      // Dotted Parabolic Flight Arc Guide
      ctx.save();
      ctx.strokeStyle = 'rgba(234, 88, 12, 0.3)';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let t = 0; t <= 36; t++) {
        const bx = (900 + 40 * t) * scaleX;
        const by = (737 - 44 * t + 1.2 * t * t) * scaleY;
        if (t === 0) ctx.moveTo(bx, by);
        else ctx.lineTo(bx, by);
      }
      ctx.stroke();
      ctx.restore();

      // Ball Trajectory Trail (when activeSpec.frame >= 175)
      if (activeSpec.frame >= 175) {
        ctx.save();
        ctx.strokeStyle = 'rgba(234, 88, 12, 0.75)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        const maxT = activeSpec.frame - 174;
        for (let t = 0; t <= maxT; t++) {
          const bx = (900 + 40 * t) * scaleX;
          const by = (737 - 44 * t + 1.2 * t * t) * scaleY;
          if (t === 0) ctx.moveTo(bx, by);
          else ctx.lineTo(bx, by);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Draw the Orange Ball (radius ~18 px)
      const ballCanvasX = activeSpec.ballX * scaleX;
      const ballCanvasY = activeSpec.ballY * scaleY;
      const ballCanvasR = strollKickConfig.ballRadius * scaleX;

      // Contact shadow under ball when near ground
      if (activeSpec.ballY >= 720) {
        ctx.save();
        const shadowOpacity = Math.max(0.12, 0.65 - (activeSpec.ballY - 737) * 0.02);
        ctx.fillStyle = `rgba(15, 23, 42, ${shadowOpacity})`;
        ctx.beginPath();
        ctx.ellipse(ballCanvasX, groundCanvasY, ballCanvasR * 1.1, 4 * scaleY, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Ball 3D Spherical Rendering (Gradient with specular highlight)
      ctx.save();
      const ballGrad = ctx.createRadialGradient(
        ballCanvasX - ballCanvasR * 0.35,
        ballCanvasY - ballCanvasR * 0.35,
        ballCanvasR * 0.15,
        ballCanvasX,
        ballCanvasY,
        ballCanvasR
      );
      ballGrad.addColorStop(0, '#FED7AA'); // Soft highlight
      ballGrad.addColorStop(0.35, strollKickConfig.ballColorHex); // Primary vibrant orange
      ballGrad.addColorStop(1, '#9A3412'); // Deep shadow rim
      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(ballCanvasX, ballCanvasY, ballCanvasR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#7C2D12';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (activeSpec.frame < 174) {
        ctx.fillStyle = '#EA580C';
        ctx.font = '600 11px "IBM Plex Mono", monospace';
        ctx.fillText('BALL (900, 737)', ballCanvasX - 35 * scaleX, ballCanvasY - 24 * scaleY);
      }
      ctx.restore();

      // Ghost Onion Skin (Previous frame)
      if (showOnionSkin && safeIdx > 0) {
        const prevSpec = strollKickFrames[safeIdx - 1];
        const ghostJoints = computeForwardKinematics(prevSpec.manX, prevSpec.manY, prevSpec.manAngles, 0.5);
        ctx.save();
        ctx.globalAlpha = 0.22;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (let i = 1; i < 17; i++) {
          if (i === 13) continue;
          const j = ghostJoints[i];
          ctx.strokeStyle = '#94A3B8';
          ctx.lineWidth = Math.max(2, j.thickness * 0.5 * scaleX);
          ctx.beginPath();
          ctx.moveTo(j.startX * scaleX, j.startY * scaleY);
          ctx.lineTo(j.endX * scaleX, j.endY * scaleY);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Draw The Man (17-node stickfigure)
      const joints = computeForwardKinematics(activeSpec.manX, activeSpec.manY, activeSpec.manAngles, 0.5);
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Segments (1..12, 14..16)
      for (let i = 1; i < 17; i++) {
        if (i === 13) continue;
        const j = joints[i];
        ctx.strokeStyle = strollKickConfig.manColorHex;
        ctx.lineWidth = Math.max(2.5, j.thickness * 0.5 * scaleX);
        ctx.beginPath();
        ctx.moveTo(j.startX * scaleX, j.startY * scaleY);
        ctx.lineTo(j.endX * scaleX, j.endY * scaleY);
        ctx.stroke();
      }

      // Head Circle (Node 13)
      const headJ = joints[13];
      const headCenterX = ((headJ.startX + headJ.endX) * 0.5) * scaleX;
      const headCenterY = ((headJ.startY + headJ.endY) * 0.5) * scaleY;
      const headRadius = (headJ.length * 0.5 * 0.5) * scaleX;

      ctx.fillStyle = strollKickConfig.manColorHex;
      ctx.strokeStyle = strollKickConfig.manColorHex;
      ctx.lineWidth = Math.max(2.5, 10 * scaleX);
      ctx.beginPath();
      ctx.arc(headCenterX, headCenterY, headRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pelvis Root Dot
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = strollKickConfig.manColorHex;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(activeSpec.manX * scaleX, activeSpec.manY * scaleY, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Live Procedural Center of Mass & Base of Support Overlay
      if (showKinematicsCoM && activeSpec.comX !== undefined) {
        ctx.save();
        const comPxX = activeSpec.comX * scaleX;
        const comPxY = activeSpec.comY * scaleY;
        const groundPxY = 755.0 * scaleY;

        // Ground Base of Support (BoS) interval line
        if (activeSpec.isGrounded && activeSpec.supportMinX !== undefined) {
          ctx.strokeStyle = activeSpec.isBalanced ? '#10B981' : '#F59E0B';
          ctx.lineWidth = 4 * scaleX;
          ctx.beginPath();
          ctx.moveTo(activeSpec.supportMinX * scaleX, groundPxY);
          ctx.lineTo(activeSpec.supportMaxX * scaleX, groundPxY);
          ctx.stroke();

          // End caps
          ctx.fillStyle = activeSpec.isBalanced ? '#10B981' : '#F59E0B';
          ctx.beginPath();
          ctx.arc(activeSpec.supportMinX * scaleX, groundPxY, 3, 0, Math.PI * 2);
          ctx.arc(activeSpec.supportMaxX * scaleX, groundPxY, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Vertical Gravity Line from CoM to Ground Plane
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = activeSpec.isBalanced ? 'rgba(16, 185, 129, 0.7)' : 'rgba(245, 158, 11, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(comPxX, comPxY);
        ctx.lineTo(comPxX, groundPxY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Center of Mass Amber Crosshair Indicator
        ctx.fillStyle = '#D97706';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(comPxX, comPxY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(comPxX - 9, comPxY);
        ctx.lineTo(comPxX + 9, comPxY);
        ctx.moveTo(comPxX, comPxY - 9);
        ctx.lineTo(comPxX, comPxY + 9);
        ctx.stroke();

        // Label
        ctx.font = '600 10px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#B45309';
        ctx.fillText(`CoM (${activeSpec.comX.toFixed(0)}, ${activeSpec.comY.toFixed(0)})`, comPxX + 8, comPxY - 4);
        ctx.restore();
      }

      ctx.restore();

      // IMPACT CONTACT BURST (Frame 174)
      if (isHitFrame) {
        ctx.save();
        const impactX = 884 * scaleX;
        const impactY = 735 * scaleY;
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 3.5;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
          ctx.beginPath();
          ctx.moveTo(impactX + Math.cos(a) * 8 * scaleX, impactY + Math.sin(a) * 8 * scaleY);
          ctx.lineTo(impactX + Math.cos(a) * 40 * scaleX, impactY + Math.sin(a) * 40 * scaleY);
          ctx.stroke();
        }

        ctx.fillStyle = '#DC2626';
        ctx.font = '900 14px "IBM Plex Mono", monospace';
        ctx.fillText('💥 *1-FRAME HIT-STOP* (CONTACT FRAME 174)', impactX - 145 * scaleX, impactY - 48 * scaleY);
        ctx.font = '700 12px "IBM Plex Mono", monospace';
        ctx.fillText('TOE STRIKES BALL AT (884, 735) · d=14.96px', impactX - 130 * scaleX, impactY - 26 * scaleY);
        ctx.restore();
      }

      // Panel Action Callouts
      ctx.save();
      ctx.font = '700 12px "IBM Plex Mono", monospace';
      if (activeSpec.panelId === 1) {
        ctx.fillStyle = '#64748B';
        ctx.fillText('① SEATED PAUSE (KNEES UP, RESTING ON TURF Y=755)', (activeSpec.manX - 100) * scaleX, (activeSpec.manY - 140) * scaleY);
      } else if (activeSpec.panelId === 2) {
        ctx.fillStyle = '#0284C7';
        ctx.fillText('② TRUNK FOLD & HAND PLANT (35–45° FORWARD FLEXION)', (activeSpec.manX - 80) * scaleX, (activeSpec.manY - 140) * scaleY);
      } else if (activeSpec.panelId === 3) {
        ctx.fillStyle = '#7C3AED';
        ctx.fillText('③ DEEP SQUAT LAUNCH (PEAK VELOCITY MOMENT)', (activeSpec.manX - 80) * scaleX, (activeSpec.manY - 140) * scaleY);
      } else if (activeSpec.panelId === 4) {
        ctx.fillStyle = '#059669';
        ctx.fillText('④ STAND EXTENSION (PELVIS RISES TO Y=510)', (activeSpec.manX - 80) * scaleX, (activeSpec.manY - 160) * scaleY);
      } else if (activeSpec.panelId === 8) {
        ctx.fillStyle = '#DC2626';
        ctx.fillText('⑧ NOTICES BALL! HEAD SNAPS DOWN & FRICTION BRAKE', (activeSpec.manX - 110) * scaleX, (activeSpec.manY - 170) * scaleY);
      } else if (activeSpec.panelId === 9) {
        ctx.fillStyle = '#D97706';
        ctx.fillText('⑨ JUMP CROUCH ANTICIPATION (COM DROPS 60px)', (activeSpec.manX - 90) * scaleX, (activeSpec.manY - 140) * scaleY);
      } else if (activeSpec.panelId === 10) {
        ctx.fillStyle = '#2563EB';
        ctx.fillText('⑩ EXCITED APEX JUMP (Y=440, +70px ABOVE GROUND)', (activeSpec.manX - 90) * scaleX, (activeSpec.manY - 180) * scaleY);
      } else if (activeSpec.panelId === 11) {
        ctx.fillStyle = '#059669';
        ctx.fillText('⑪ TOUCHDOWN CUSHION (70° KNEE COMPRESSION AT Y=755)', (activeSpec.manX - 110) * scaleX, (activeSpec.manY - 140) * scaleY);
      } else if (activeSpec.panelId === 12) {
        ctx.fillStyle = '#EA580C';
        ctx.fillText('⑫ SPRINT TO BALL (ARMS 90°, HIGH HEEL FOLD, 30 px/f)', (activeSpec.manX - 110) * scaleX, (activeSpec.manY - 160) * scaleY);
      } else if (activeSpec.panelId === 13) {
        ctx.fillStyle = '#D97706';
        ctx.fillText('⑬ PLANT & KICKING BACKSWING (105° KNEE BEND)', (activeSpec.manX - 110) * scaleX, (activeSpec.manY - 160) * scaleY);
      } else if (activeSpec.panelId === 15) {
        ctx.fillStyle = '#7C3AED';
        ctx.fillText('⑮ HIGH FOLLOW-THROUGH & BALL LAUNCH', (activeSpec.manX - 100) * scaleX, (activeSpec.manY - 170) * scaleY);
      } else if (activeSpec.panelId === 16) {
        ctx.fillStyle = '#059669';
        ctx.fillText('⑯ WATCHING BALL FLY AWAY (FIST PUMP & MOVING HOLD)', (activeSpec.manX - 120) * scaleX, (activeSpec.manY - 170) * scaleY);
      }
      ctx.restore();

      ctx.restore();
    } else if (activeAnimationMode === 'phantom') {
      const safeIdx = currentFrame % phantomFrames.length;
      const activeSpec = phantomFrames[safeIdx];

      ctx.save();
      // Wide, static camera shot covering large arena floor
      const targetSceneX = 640;
      const targetSceneY = 540;
      ctx.translate(w * 0.5, h * 0.5);
      ctx.scale(1.04, 1.04);
      ctx.translate(-targetSceneX * scaleX, -targetSceneY * scaleY);

      // *SCREEN SHAKE* Translation (Storyboard Panel ⑨: Impact Frame 47)
      let shakeX = 0;
      let shakeY = 0;
      if (activeSpec.screenShake || activeSpec.frame === 46) {
        shakeX = (Math.random() - 0.5) * 22;
        shakeY = -12 + (Math.random() - 0.5) * 8;
      } else if (activeSpec.frame === 47) {
        shakeX = (Math.random() - 0.5) * 12;
        shakeY = 6;
      } else if (activeSpec.frame === 48) {
        shakeX = (Math.random() - 0.5) * 6;
        shakeY = -3;
      }
      ctx.translate(shakeX * scaleX, shakeY * scaleY);

      const groundSceneY = 755;
      const groundCanvasY = groundSceneY * scaleY;

      // Studio Arena Backdrop - Dynamic Flash Tints
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundCanvasY);
      skyGrad.addColorStop(
        0,
        activeSpec.screenShake || activeSpec.frame === 46
          ? '#FEE2E2'
          : activeSpec.isTeleportBlank
          ? '#FEF3C7'
          : activeSpec.act.includes('Impact')
          ? '#FEF2F2'
          : activeSpec.act.includes('Aerial')
          ? '#EFF6FF'
          : activeSpec.act.includes('Jab') || activeSpec.act.includes('Cross')
          ? '#F8FAFC'
          : '#F1F5F9'
      );
      skyGrad.addColorStop(1, '#F8FAFC');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(-2400, -1600, w + 4800, groundCanvasY + 1600);

      // Arena Platform Floor (High-Contrast, not black)
      const phantomFloorGrad = ctx.createLinearGradient(0, groundCanvasY, 0, groundCanvasY + 600 * scaleY);
      phantomFloorGrad.addColorStop(0, '#E2E8F0');
      phantomFloorGrad.addColorStop(0.12, '#EDF2F7');
      phantomFloorGrad.addColorStop(1, '#CBD5E1');
      ctx.fillStyle = phantomFloorGrad;
      ctx.fillRect(-2400, groundCanvasY, w + 4800, 1600);

      // Fine coordinate grid
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      for (let gx = -400; gx < 2400; gx += 160) {
        ctx.beginPath();
        ctx.moveTo(gx * scaleX, -400);
        ctx.lineTo(gx * scaleX, h + 400);
        ctx.stroke();
      }
      for (let gy = -200; gy < 1400; gy += 120) {
        ctx.beginPath();
        ctx.moveTo(-400, gy * scaleY);
        ctx.lineTo(w + 400, gy * scaleY);
        ctx.stroke();
      }

      // Ground plane line (Universal Ground Plane Y = 755.0 px)
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-400 * scaleX, groundCanvasY);
      ctx.lineTo(2400 * scaleX, groundCanvasY);
      ctx.stroke();

      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1;
      for (let tx = -200; tx <= 2200; tx += 40) {
        ctx.beginPath();
        ctx.moveTo(tx * scaleX, groundCanvasY);
        ctx.lineTo((tx - 12) * scaleX, groundCanvasY + 10);
        ctx.stroke();
      }

      // Ground Stage Zone Labels
      ctx.font = '600 10px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#7C3AED';
      ctx.fillText('PANELS ⑧–⑩: AERIAL ASSAULT, IMPACT & RESET (X: 340 → 370)', 140 * scaleX, groundCanvasY + 24);
      ctx.fillStyle = '#0F172A';
      ctx.fillText('PANEL ①: THE FOCUS STILLNESS (X: 640)', 530 * scaleX, groundCanvasY + 24);
      ctx.fillStyle = '#D97706';
      ctx.fillText('PANELS ③–⑥: RAPID HANDS COMBOS (X: 980)', 890 * scaleX, groundCanvasY + 24);

      // Ceiling indicator for aerial parallel reference
      ctx.save();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(100 * scaleX, 220 * scaleY);
      ctx.lineTo(600 * scaleX, 220 * scaleY);
      ctx.stroke();
      ctx.fillStyle = '#64748B';
      ctx.font = '500 10px "IBM Plex Mono", monospace';
      ctx.fillText('AERIAL PARALLEL PLANE (Y ~ 220)', 110 * scaleX, 212 * scaleY);
      ctx.restore();

      const drawPhantomFigure = (
        sx: number,
        sy: number,
        angles: number[],
        alpha: number,
        isGhost: boolean
      ) => {
        const joints = computeForwardKinematics(sx, sy, angles, 0.5);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw segments (Nodes 1..12, 14..16)
        for (let i = 1; i < 17; i++) {
          if (i === 13) continue;
          const j = joints[i];
          ctx.strokeStyle = isGhost ? '#94A3B8' : phantomConfig.primaryColorHex;
          ctx.lineWidth = Math.max(2, j.thickness * 0.5 * scaleX);
          ctx.beginPath();
          ctx.moveTo(j.startX * scaleX, j.startY * scaleY);
          ctx.lineTo(j.endX * scaleX, j.endY * scaleY);
          ctx.stroke();
        }

        // Draw Head Circle (Node 13)
        const headJ = joints[13];
        const headCenterX = ((headJ.startX + headJ.endX) * 0.5) * scaleX;
        const headCenterY = ((headJ.startY + headJ.endY) * 0.5) * scaleY;
        const headRadius = (headJ.length * 0.5 * 0.5) * scaleX;

        ctx.fillStyle = isGhost ? '#CBD5E1' : phantomConfig.headColorHex;
        ctx.strokeStyle = isGhost ? '#94A3B8' : phantomConfig.headColorHex;
        ctx.lineWidth = Math.max(2.5, 10 * scaleX);
        ctx.beginPath();
        ctx.arc(headCenterX, headCenterY, headRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Pelvis Root Dot
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = isGhost ? '#94A3B8' : phantomConfig.primaryColorHex;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(sx * scaleX, sy * scaleY, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
        return joints;
      };

      if (activeSpec.isTeleportBlank) {
        // TELEPORT 1 (Frame 31) or TELEPORT 2 (Frame 42): 1 BLANK FRAME!
        ctx.save();
        if (activeSpec.teleportEffect === 'boom' || activeSpec.frame === 30) {
          // Panel ② Teleport 1: Flash BOOM blast!
          const vanishX = 640;
          const vanishY = 505;

          // Expanding shockwave rings
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(vanishX * scaleX, vanishY * scaleY, 70 * scaleX, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(vanishX * scaleX, vanishY * scaleY, 100 * scaleX, 0, Math.PI * 2);
          ctx.stroke();

          // Starburst spikes
          ctx.strokeStyle = '#DC2626';
          ctx.lineWidth = 2.5;
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
            ctx.beginPath();
            ctx.moveTo((vanishX + Math.cos(a) * 45) * scaleX, (vanishY + Math.sin(a) * 45) * scaleY);
            ctx.lineTo((vanishX + Math.cos(a) * 115) * scaleX, (vanishY + Math.sin(a) * 115) * scaleY);
            ctx.stroke();
          }

          // Bold BOOM! comic callout
          ctx.fillStyle = '#DC2626';
          ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
          ctx.fillText('💥 BOOM!', (vanishX - 52) * scaleX, (vanishY - 15) * scaleY);
          ctx.fillStyle = '#0F172A';
          ctx.font = '700 11px "IBM Plex Mono", monospace';
          ctx.fillText('PANEL ② TELEPORT 1 (1 BLANK FRAME)', (vanishX - 110) * scaleX, (vanishY + 30) * scaleY);
        } else {
          // Panel ⑦ Teleport 2: Mid-air apex vanish
          const vanishX = 974;
          const vanishY = 440;
          ctx.strokeStyle = 'rgba(2, 132, 199, 0.6)';
          ctx.lineWidth = 2;
          for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.moveTo((vanishX - 30 + i * 15) * scaleX, (vanishY - 40 - i * 8) * scaleY);
            ctx.lineTo((vanishX + 20 + i * 20) * scaleX, (vanishY - 70 - i * 12) * scaleY);
            ctx.stroke();
          }
          ctx.fillStyle = '#0284C7';
          ctx.font = '700 12px "IBM Plex Mono", monospace';
          ctx.fillText('⚡ PANEL ⑦ TELEPORT 2: VANISHES MID-AIR APEX (1 BLANK FRAME)', (vanishX - 180) * scaleX, (vanishY - 50) * scaleY);
        }
        ctx.restore();
      } else {
        // Onion Skinning
        if (showOnionSkin && safeIdx > 0) {
          const prev = phantomFrames[safeIdx - 1];
          if (!prev.isTeleportBlank) {
            drawPhantomFigure(prev.sceneX, prev.sceneY, prev.worldAngles, 0.22, true);
          }
        }

        // Action Motion Smear Blur (Panel ⑨: Axe Kick Smear Frame 44)
        if (activeSpec.actionSmear === 'axe_kick' || activeSpec.frame === 44) {
          ctx.save();
          ctx.fillStyle = 'rgba(124, 58, 237, 0.22)';
          ctx.beginPath();
          ctx.moveTo(360 * scaleX, 280 * scaleY);
          ctx.arc(360 * scaleX, 280 * scaleY, 155 * scaleX, -Math.PI * 0.15, Math.PI * 0.52);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = 'rgba(124, 58, 237, 0.8)';
          ctx.lineWidth = 2;
          for (let sl = -20; sl <= 40; sl += 15) {
            ctx.beginPath();
            ctx.moveTo((360 + sl) * scaleX, 250 * scaleY);
            ctx.lineTo((365 + sl) * scaleX, 420 * scaleY);
            ctx.stroke();
          }

          ctx.fillStyle = '#7C3AED';
          ctx.font = '800 12px "IBM Plex Mono", monospace';
          ctx.fillText('PANEL ⑨ AXE KICK DROP: R LEG SMEAR!', 200 * scaleX, 350 * scaleY);
          ctx.restore();
        }

        // Active stickfigure
        const liveJoints = drawPhantomFigure(
          activeSpec.sceneX,
          activeSpec.sceneY,
          activeSpec.worldAngles,
          1.0,
          false
        );

        // Action Highlights & Biomechanical Callouts
        if (activeSpec.storyboardPanel === 3 || activeSpec.phase.includes('Jab')) {
          // Sharp horizontal jab extension
          const fist = liveJoints[16];
          ctx.save();
          ctx.strokeStyle = 'rgba(2, 132, 199, 0.7)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo((fist.endX + 60) * scaleX, fist.endY * scaleY);
          ctx.lineTo(fist.endX * scaleX, fist.endY * scaleY);
          ctx.stroke();
          ctx.fillStyle = '#0284C7';
          ctx.font = '700 12px "IBM Plex Mono", monospace';
          ctx.fillText('PANEL ③ 180° STRAIGHT JAB SNAP', (fist.endX - 110) * scaleX, (fist.endY - 20) * scaleY);
          ctx.restore();
        } else if (activeSpec.storyboardPanel === 4 || activeSpec.phase.includes('Cross')) {
          // Violent torso twist right cross
          const fist = liveJoints[11];
          ctx.save();
          ctx.strokeStyle = 'rgba(220, 38, 38, 0.7)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo((fist.endX + 70) * scaleX, fist.endY * scaleY);
          ctx.lineTo(fist.endX * scaleX, fist.endY * scaleY);
          ctx.stroke();
          ctx.fillStyle = '#DC2626';
          ctx.font = '700 12px "IBM Plex Mono", monospace';
          ctx.fillText('PANEL ④ 180° STRAIGHT CROSS SNAP', (fist.endX - 120) * scaleX, (fist.endY - 20) * scaleY);
          ctx.restore();
        } else if (activeSpec.storyboardPanel === 5 || activeSpec.phase.includes('Uppercut')) {
          // Vertical launch arc
          const fist = liveJoints[11];
          ctx.save();
          ctx.strokeStyle = 'rgba(217, 119, 6, 0.7)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(fist.endX * scaleX, (fist.endY + 70) * scaleY);
          ctx.lineTo(fist.endX * scaleX, fist.endY * scaleY);
          ctx.stroke();
          ctx.fillStyle = '#D97706';
          ctx.font = '700 12px "IBM Plex Mono", monospace';
          ctx.fillText('PANEL ⑥ DYNAMIC UPPERCUT LAUNCH (+90°)', (fist.endX - 90) * scaleX, (fist.endY - 24) * scaleY);
          ctx.restore();
        } else if (activeSpec.storyboardPanel === 7 || activeSpec.phase.includes('Axe Kick')) {
          // Downward chop arc
          const foot = liveJoints[3];
          ctx.save();
          ctx.strokeStyle = 'rgba(124, 58, 237, 0.7)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(liveJoints[1].startX * scaleX, liveJoints[1].startY * scaleY, 130 * scaleX, -Math.PI * 0.1, Math.PI * 0.5);
          ctx.stroke();
          ctx.fillStyle = '#7C3AED';
          ctx.font = '700 12px "IBM Plex Mono", monospace';
          ctx.fillText('PANEL ⑧ AXE KICK (-88° DOWNWARD ARC)', (foot.endX - 60) * scaleX, (foot.endY - 24) * scaleY);
          ctx.restore();
        }

        // Panel ⑨ Impact & Screen Shake (Frame 46 / Storyboard Frame 47)
        if (activeSpec.screenShake || activeSpec.frame === 46) {
          ctx.save();
          // Ground impact cracks branching out
          ctx.strokeStyle = '#DC2626';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(370 * scaleX, groundCanvasY);
          ctx.lineTo(310 * scaleX, groundCanvasY + 6);
          ctx.lineTo(260 * scaleX, groundCanvasY - 2);
          ctx.moveTo(370 * scaleX, groundCanvasY);
          ctx.lineTo(430 * scaleX, groundCanvasY + 5);
          ctx.lineTo(490 * scaleX, groundCanvasY - 1);
          ctx.stroke();

          // Shockwave burst rings
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.ellipse(370 * scaleX, groundCanvasY, 95 * scaleX, 16 * scaleY, 0, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#DC2626';
          ctx.font = '900 14px "IBM Plex Mono", monospace';
          ctx.fillText('💥 *SCREEN SHAKE* (IMPACT FRAME 47)', 220 * scaleX, groundCanvasY - 45);
          ctx.fillText('R FIST IMPACTS FLOOR (Y=754)', 260 * scaleX, groundCanvasY - 25);
          ctx.restore();
        } else if (activeSpec.storyboardPanel === 9) {
          // Deep crouch hold
          const fist = liveJoints[11];
          ctx.save();
          ctx.strokeStyle = '#0284C7';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(fist.endX * scaleX, groundCanvasY, 32 * scaleX, 6 * scaleY, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#0284C7';
          ctx.font = '700 12px "IBM Plex Mono", monospace';
          ctx.fillText('PANEL ⑨ DEEP 3-POINT CROUCH ABSORPTION', (fist.endX - 110) * scaleX, (fist.endY - 60) * scaleY);
          ctx.restore();
        } else if (activeSpec.storyboardPanel === 10) {
          ctx.save();
          ctx.fillStyle = '#059669';
          ctx.font = '700 12px "IBM Plex Mono", monospace';
          ctx.fillText('PANEL ⑩ THE RESET: EASE IN (TRANSITION TO P1 POSE)', (activeSpec.sceneX - 130) * scaleX, (activeSpec.sceneY - 140) * scaleY);
          ctx.restore();
        }
      }

      ctx.restore();
    } else if (activeAnimationMode === 'speed-strength') {
      const safeIdx = currentFrame % speedStrengthFrames.length;
      const activeSpec = speedStrengthFrames[safeIdx];

      ctx.save();
      if (vcamFollow && speedStrengthConfig.cameraDynamicTrack) {
        // Native Stick Nodes camera pan (camX, camY) and zoom (camZoom)
        const targetSceneX = 640 + activeSpec.camX;
        const targetSceneY = 560 - activeSpec.camY;
        ctx.translate(w * 0.5, h * 0.5);
        ctx.scale(activeSpec.camZoom, activeSpec.camZoom);
        ctx.translate(-targetSceneX * scaleX, -targetSceneY * scaleY);
      }

      const groundSceneY = 755;
      const groundCanvasY = groundSceneY * scaleY;

      // Studio Arena Backdrop
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 600 * scaleY);
      skyGrad.addColorStop(
        0,
        activeSpec.act.includes('Counters') || activeSpec.phase.includes('IMPACT')
          ? '#FEF3C7'
          : activeSpec.act.includes('Speed Burst')
          ? '#F0FDF4'
          : activeSpec.act.includes('Ballistic')
          ? '#EFF6FF'
          : '#F8FAFC'
      );
      skyGrad.addColorStop(1, '#F1F5F9');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(-2400, -1600, w + 4800, groundCanvasY + 1600);

      // Arena Platform Floor (High-Contrast, never black - clean gym/dojo studio floor)
      const arenaFloorGrad = ctx.createLinearGradient(0, groundCanvasY, 0, groundCanvasY + 600 * scaleY);
      arenaFloorGrad.addColorStop(0, '#E2E8F0');
      arenaFloorGrad.addColorStop(0.12, '#EDF2F7');
      arenaFloorGrad.addColorStop(1, '#CBD5E1');
      ctx.fillStyle = arenaFloorGrad;
      ctx.fillRect(-2400, groundCanvasY, w + 4800, 1600);

      // Coordinate grid
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      for (let gx = -400; gx < 2400; gx += 160) {
        ctx.beginPath();
        ctx.moveTo(gx * scaleX, -400);
        ctx.lineTo(gx * scaleX, h + 400);
        ctx.stroke();
      }
      for (let gy = -200; gy < 1400; gy += 120) {
        ctx.beginPath();
        ctx.moveTo(-400, gy * scaleY);
        ctx.lineTo(w + 400, gy * scaleY);
        ctx.stroke();
      }

      // Ground plane (Invariant Y = 755.0 px)
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-400 * scaleX, groundCanvasY);
      ctx.lineTo(2400 * scaleX, groundCanvasY);
      ctx.stroke();

      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1;
      for (let tx = -200; tx <= 2200; tx += 40) {
        ctx.beginPath();
        ctx.moveTo(tx * scaleX, groundCanvasY);
        ctx.lineTo((tx - 12) * scaleX, groundCanvasY + 10);
        ctx.stroke();
      }

      // Ground Stage Zone Labels
      ctx.font = '600 10px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#B45309';
      ctx.fillText('A START (X: 380)', 340 * scaleX, groundCanvasY + 24);
      ctx.fillStyle = '#475569';
      ctx.fillText('B POWER STANCE (X: 645)', 605 * scaleX, groundCanvasY + 24);
      ctx.fillStyle = '#DC2626';
      ctx.fillText('KICK CLASH (X: 645)', 625 * scaleX, groundCanvasY + 38);
      ctx.fillStyle = '#0284C7';
      ctx.fillText('B TOUCHDOWN & SKID (X: 250 → 240)', 160 * scaleX, groundCanvasY + 24);

      // Speed Lines during Act 3 (Frames 9..12)
      if (activeSpec.act.includes('Speed Burst')) {
        ctx.save();
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
        ctx.lineWidth = 2.5;
        for (let sl = 460; sl <= 560; sl += 24) {
          ctx.beginPath();
          ctx.moveTo((activeSpec.charAX - 180) * scaleX, sl * scaleY);
          ctx.lineTo((activeSpec.charAX + 80) * scaleX, sl * scaleY);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Compact Direct Linear Punch Trajectory during Act 5 (Frames 17..20)
      if (activeSpec.act.includes('The Punch')) {
        ctx.save();
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(660 * scaleX, 410 * scaleY);
        ctx.lineTo(814 * scaleX, 338 * scaleY);
        ctx.stroke();
        ctx.restore();
      }

      // Impact Shockwave Flash on Clash Frame (F24)
      if (activeSpec.frame === 24 || activeSpec.phase.includes('IMPACT CLASH')) {
        ctx.save();
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(645 * scaleX, 505 * scaleY, 28 * scaleX, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#DC2626';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(645 * scaleX, 505 * scaleY, 44 * scaleX, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Ballistic Recoil Arc Trajectory of Character B
      if (showTrajectoryArc) {
        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#64748B';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        speedStrengthFrames.forEach((f, idx) => {
          const px = f.charBX * scaleX;
          const py = f.charBY * scaleY;
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();

        speedStrengthFrames.forEach((f, idx) => {
          const px = f.charBX * scaleX;
          const py = f.charBY * scaleY;
          ctx.fillStyle =
            idx === safeIdx
              ? '#EF4444'
              : f.frame >= 25 && f.frame <= 31
              ? '#0284C7'
              : '#CBD5E1';
          ctx.beginPath();
          ctx.arc(px, py, idx === safeIdx ? 4.5 : 2.5, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      const drawFigure = (
        sx: number,
        sy: number,
        angles: number[],
        colorHex: string,
        alpha: number,
        isGhost: boolean
      ) => {
        const joints = computeForwardKinematics(sx, sy, angles, 0.5);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw segments (Nodes 1..12, 14..16)
        for (let i = 1; i < 17; i++) {
          if (i === 13) continue;
          const j = joints[i];
          ctx.strokeStyle = isGhost ? '#94A3B8' : colorHex;
          ctx.lineWidth = Math.max(2, j.thickness * 0.5 * scaleX);
          ctx.beginPath();
          ctx.moveTo(j.startX * scaleX, j.startY * scaleY);
          ctx.lineTo(j.endX * scaleX, j.endY * scaleY);
          ctx.stroke();
        }

        // Draw Head Circle (Node 13)
        const headJ = joints[13];
        const headCenterX = ((headJ.startX + headJ.endX) * 0.5) * scaleX;
        const headCenterY = ((headJ.startY + headJ.endY) * 0.5) * scaleY;
        const headRadius = (headJ.length * 0.5 * 0.5) * scaleX;

        ctx.fillStyle = isGhost ? '#CBD5E1' : colorHex;
        ctx.strokeStyle = isGhost ? '#94A3B8' : colorHex;
        ctx.lineWidth = Math.max(2.5, 10 * scaleX);
        ctx.beginPath();
        ctx.arc(headCenterX, headCenterY, headRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Pelvis Root Dot
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = colorHex;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(sx * scaleX, sy * scaleY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      };

      // Onion skinning
      if (showOnionSkin && safeIdx > 0) {
        const prev = speedStrengthFrames[safeIdx - 1];
        drawFigure(prev.charAX, prev.charAY, prev.charAAngles, speedStrengthConfig.speedColorHex, 0.22, true);
        drawFigure(prev.charBX, prev.charBY, prev.charBAngles, speedStrengthConfig.strengthColorHex, 0.22, true);
      }

      // Draw active characters: Character A (Speed, Gold) and Character B (Strength, Slate)
      drawFigure(activeSpec.charAX, activeSpec.charAY, activeSpec.charAAngles, speedStrengthConfig.speedColorHex, 1.0, false);
      drawFigure(activeSpec.charBX, activeSpec.charBY, activeSpec.charBAngles, speedStrengthConfig.strengthColorHex, 1.0, false);

      ctx.restore();
    } else if (activeAnimationMode === 'teleport') {
      const safeIdx = currentFrame % teleportFrames.length;
      const activeSpec = teleportFrames[safeIdx];

      ctx.save();
      if (vcamFollow) {
        // Apply native Stick Nodes camera pan (camX, camY) and zoom (camZoom)
        const targetSceneX = 640 + activeSpec.camX;
        const targetSceneY = 560 - activeSpec.camY;
        ctx.translate(w * 0.5, h * 0.5);
        ctx.scale(activeSpec.camZoom, activeSpec.camZoom);
        ctx.translate(-targetSceneX * scaleX, -targetSceneY * scaleY);
      }

      const groundSceneY = 755;
      const groundCanvasY = groundSceneY * scaleY;

      // Studio / Anime Ambush Backdrop
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundCanvasY);
      skyGrad.addColorStop(
        0,
        activeSpec.act.includes('Screen Shake') || activeSpec.phase.includes('CLASH')
          ? '#FEF2F2'
          : activeSpec.act.includes('Whip Pan')
          ? '#EFF6FF'
          : '#F1F5F9'
      );
      skyGrad.addColorStop(1, '#F8FAFC');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(-2400, -1600, w + 4800, groundCanvasY + 1600);

      // Arena Platform Floor (High-Contrast, never black - clean studio floor)
      const teleportFloorGrad = ctx.createLinearGradient(0, groundCanvasY, 0, groundCanvasY + 600 * scaleY);
      teleportFloorGrad.addColorStop(0, '#E2E8F0');
      teleportFloorGrad.addColorStop(0.12, '#EDF2F7');
      teleportFloorGrad.addColorStop(1, '#CBD5E1');
      ctx.fillStyle = teleportFloorGrad;
      ctx.fillRect(-2400, groundCanvasY, w + 4800, 1600);

      // Coordinate grid
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      for (let gx = -400; gx < 2400; gx += 160) {
        ctx.beginPath();
        ctx.moveTo(gx * scaleX, -400);
        ctx.lineTo(gx * scaleX, h + 400);
        ctx.stroke();
      }
      for (let gy = -200; gy < 1400; gy += 120) {
        ctx.beginPath();
        ctx.moveTo(-400, gy * scaleY);
        ctx.lineTo(w + 400, gy * scaleY);
        ctx.stroke();
      }

      // Whip Pan Speed-Lines during Act 3 (Frames 15..16)
      if (activeSpec.act.includes('Whip Pan') && activeSpec.phase.includes('Whip Pan')) {
        ctx.save();
        ctx.strokeStyle = 'rgba(37, 99, 235, 0.28)';
        ctx.lineWidth = 3;
        for (let sl = 240; sl <= 720; sl += 48) {
          ctx.beginPath();
          ctx.moveTo(220 * scaleX, sl * scaleY);
          ctx.lineTo(1060 * scaleX, sl * scaleY);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Ground plane
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-400 * scaleX, groundCanvasY);
      ctx.lineTo(2400 * scaleX, groundCanvasY);
      ctx.stroke();

      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1;
      for (let tx = 40; tx <= 1820; tx += 40) {
        ctx.beginPath();
        ctx.moveTo(tx * scaleX, groundCanvasY);
        ctx.lineTo((tx - 12) * scaleX, groundCanvasY + 10);
        ctx.stroke();
      }

      // Ground Stage Zone Labels
      ctx.font = '600 10px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#2563EB';
      ctx.fillText('ACT 4–8: TELEPORT AMBUSH ZONE (X: 168)', 90 * scaleX, groundCanvasY + 24);
      ctx.fillStyle = '#DC2626';
      ctx.fillText('RED SEATED GUARD POSITION (X: 440)', 380 * scaleX, groundCanvasY + 24);
      ctx.fillStyle = '#2563EB';
      ctx.fillText(
        'ACT 1 & 3: BLUE APPROACH & VANISH SPOT (X: 960 → 756)',
        700 * scaleX,
        groundCanvasY + 24
      );

      // Draw Empty Vanish Marker during Act 3 (Blue is GONE!)
      if (!activeSpec.bluePresent) {
        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#2563EB';
        ctx.lineWidth = 1.75;
        ctx.strokeRect(706 * scaleX, 340 * scaleY, 100 * scaleX, 412 * scaleY);

        // Anime afterimage speed-lines showing Blue vanished from X=756
        for (let sy = 380; sy <= 710; sy += 55) {
          ctx.beginPath();
          ctx.moveTo(725 * scaleX, sy * scaleY);
          ctx.lineTo(788 * scaleX, sy * scaleY);
          ctx.stroke();
        }
        ctx.restore();

        ctx.fillStyle = '#2563EB';
        ctx.font = '700 12px "IBM Plex Mono", monospace';
        ctx.fillText('?! BLUE VANISHED (EMPTY SPOT X=756)', 655 * scaleX, 322 * scaleY);
      }

      // Camera Focus Trajectory Indicator if Trajectory Arc enabled
      if (showTrajectoryArc) {
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.moveTo(756 * scaleX, 517 * scaleY);
        ctx.quadraticCurveTo(475 * scaleX, 260 * scaleY, 194 * scaleX, 517 * scaleY);
        ctx.stroke();
        ctx.restore();
      }

      const drawCharacter = (
        sx: number,
        sy: number,
        angles: number[],
        colorHex: string,
        alpha: number,
        label?: string
      ) => {
        const joints = computeForwardKinematics(sx, sy, angles, 0.5);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let i = 1; i < 17; i++) {
          if (i === 13) continue;
          const j = joints[i];
          ctx.strokeStyle = colorHex;
          ctx.lineWidth = Math.max(2, j.thickness * 0.5 * scaleX);
          ctx.beginPath();
          ctx.moveTo(j.startX * scaleX, j.startY * scaleY);
          ctx.lineTo(j.endX * scaleX, j.endY * scaleY);
          ctx.stroke();
        }

        const headJ = joints[13];
        const headCenterX = ((headJ.startX + headJ.endX) * 0.5) * scaleX;
        const headCenterY = ((headJ.startY + headJ.endY) * 0.5) * scaleY;
        const headRadius = (headJ.length * 0.5 * 0.5) * scaleX;

        ctx.fillStyle = colorHex;
        ctx.strokeStyle = colorHex;
        ctx.lineWidth = Math.max(2.5, 10 * scaleX);
        ctx.beginPath();
        ctx.arc(headCenterX, headCenterY, headRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (label && alpha > 0.8) {
          ctx.fillStyle = colorHex;
          ctx.font = '600 10px "IBM Plex Mono", monospace';
          ctx.fillText(label, headCenterX - 24 * scaleX, headCenterY - headRadius - 10 * scaleY);
        }

        ctx.restore();
        return joints;
      };

      if (showOnionSkin) {
        const prevIdx = (safeIdx - 1 + teleportFrames.length) % teleportFrames.length;
        const prevSpec = teleportFrames[prevIdx];
        drawCharacter(prevSpec.redX, prevSpec.redY, prevSpec.redAngles, '#94A3B8', 0.22);
        if (prevSpec.bluePresent) {
          drawCharacter(prevSpec.blueX, prevSpec.blueY, prevSpec.blueAngles, '#93C5FD', 0.22);
        }
      }

      const redJoints = drawCharacter(
        activeSpec.redX,
        activeSpec.redY,
        activeSpec.redAngles,
        teleportConfig.redColorHex,
        1.0,
        'RED (FIG #1)'
      );
      let blueJoints: JointPoint[] | null = null;
      if (activeSpec.bluePresent) {
        blueJoints = drawCharacter(
          activeSpec.blueX,
          activeSpec.blueY,
          activeSpec.blueAngles,
          teleportConfig.blueColorHex,
          1.0,
          'BLUE (FIG #2)'
        );
      }

      // Act-Specific Cinematic Callouts
      if (activeSpec.act.includes('Close-Up')) {
        const redHead = redJoints[13];
        ctx.fillStyle = '#DC2626';
        ctx.font = '700 11px "IBM Plex Mono", monospace';
        ctx.fillText(
          `! NOTICES BLUE (${activeSpec.camZoom.toFixed(2)}x ZOOM)`,
          (redHead.endX + 18) * scaleX,
          (redHead.endY - 12) * scaleY
        );
      } else if (
        (activeSpec.act.includes('Block & Impact') ||
          activeSpec.act.includes('Screen Shake') ||
          activeSpec.act.includes('End Scene')) &&
        blueJoints
      ) {
        // Draw Clash Impact Starburst at true biomechanical contact point between Blue R_Shin (Node 2) and Red R_Forearm (Node 10)
        const clashX = ((redJoints[10].endX + blueJoints[2].endX) * 0.5) * scaleX;
        const clashY = ((redJoints[10].endY + blueJoints[2].endY) * 0.5) * scaleY;
        ctx.save();
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2.5;
        for (let r = 0; r < 8; r++) {
          const ang = (r * Math.PI) / 4 + (safeIdx % 2) * 0.2;
          const rInner = 10 * scaleX;
          const rOuter = (r % 2 === 0 ? 38 : 24) * scaleX;
          ctx.beginPath();
          ctx.moveTo(clashX + Math.cos(ang) * rInner, clashY + Math.sin(ang) * rInner);
          ctx.lineTo(clashX + Math.cos(ang) * rOuter, clashY + Math.sin(ang) * rOuter);
          ctx.stroke();
        }
        ctx.fillStyle = '#B45309';
        ctx.font = '700 12px "IBM Plex Mono", monospace';
        ctx.fillText(
          activeSpec.act.includes('Screen Shake')
            ? 'HEAVY CLASH! (SCREEN SHAKE)'
            : 'SHIN BLOCKED BY RIGID FOREARM!',
          clashX - 75 * scaleX,
          clashY - 42 * scaleY
        );
        ctx.restore();
      }

      ctx.restore();

      // HUD Camera Viewfinder Overlay in top-left of canvas
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
      ctx.fillRect(12, 12, 330, 44);
      ctx.fillStyle = '#38BDF8';
      ctx.font = '600 11px "IBM Plex Mono", monospace';
      ctx.fillText(
        `CAM @+42..+50: ZOOM ${activeSpec.camZoom.toFixed(2)}x | PAN (${activeSpec.camX.toFixed(0)}, ${activeSpec.camY.toFixed(0)})`,
        22,
        30
      );
      ctx.fillStyle = '#E2E8F0';
      ctx.font = '500 10px "IBM Plex Mono", monospace';
      ctx.fillText(
        `FIGURES @+54: ${activeSpec.bluePresent ? '2 (RED + BLUE)' : '1 (RED ONLY — BLUE VANISHED)'}`,
        22,
        46
      );
      ctx.restore();
    } else if (activeAnimationMode === 'sneeze') {
      const safeIdx = currentFrame % sneezeFrames.length;
      const activeSpec = sneezeFrames[safeIdx];

      ctx.save();
      if (vcamFollow) {
        const camZoom = activeSpec.act.includes('Explosion')
          ? 1.4
          : activeSpec.isFlightFrame
          ? 1.25
          : 1.15;
        const targetX = activeSpec.sceneX * scaleX;
        const targetY = activeSpec.sceneY * scaleY;
        ctx.translate(w * 0.5, h * 0.5);
        ctx.scale(camZoom, camZoom);
        ctx.translate(-targetX, -targetY);
      }

      const groundSceneY = 758;
      const groundCanvasY = groundSceneY * scaleY;

      // Background sky & studio gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundCanvasY);
      skyGrad.addColorStop(
        0,
        activeSpec.act.includes('Explosion')
          ? '#FEF2F2'
          : activeSpec.isFlightFrame
          ? '#E0F2FE'
          : '#F1F5F9'
      );
      skyGrad.addColorStop(1, '#F8FAFC');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(-2400, -1600, w + 4800, groundCanvasY + 1600);

      // Sneeze Platform Floor (High-Contrast, never black - clean studio floor)
      const sneezeFloorGrad = ctx.createLinearGradient(0, groundCanvasY, 0, groundCanvasY + 600 * scaleY);
      sneezeFloorGrad.addColorStop(0, '#E2E8F0');
      sneezeFloorGrad.addColorStop(0.12, '#EDF2F7');
      sneezeFloorGrad.addColorStop(1, '#CBD5E1');
      ctx.fillStyle = sneezeFloorGrad;
      ctx.fillRect(-2400, groundCanvasY, w + 4800, 1600);

      // Coordinate grid
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      for (let gx = -400; gx < 2400; gx += 160) {
        ctx.beginPath();
        ctx.moveTo(gx * scaleX, -400);
        ctx.lineTo(gx * scaleX, h + 400);
        ctx.stroke();
      }
      for (let gy = -200; gy < 1400; gy += 120) {
        ctx.beginPath();
        ctx.moveTo(-400, gy * scaleY);
        ctx.lineTo(w + 400, gy * scaleY);
        ctx.stroke();
      }

      // Mid-air Backflip Apex Guide Line
      const recoilApexCanvasY = sneezeConfig.recoilApexY * scaleY;
      ctx.save();
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(420 * scaleX, recoilApexCanvasY);
      ctx.lineTo(1180 * scaleX, recoilApexCanvasY);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#0284C7';
      ctx.font = '600 10px "IBM Plex Mono", monospace';
      ctx.fillText(
        `ACT 4: MID-AIR BACKFLIP RECOIL APEX (Y=${sneezeConfig.recoilApexY}px · 360° MESSY SPIN)`,
        530 * scaleX,
        recoilApexCanvasY - 8
      );

      // Ground plane
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-400 * scaleX, groundCanvasY);
      ctx.lineTo(2400 * scaleX, groundCanvasY);
      ctx.stroke();

      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1;
      for (let tx = 100; tx <= 1820; tx += 40) {
        ctx.beginPath();
        ctx.moveTo(tx * scaleX, groundCanvasY);
        ctx.lineTo((tx - 12) * scaleX, groundCanvasY + 10);
        ctx.stroke();
      }

      // Act zone markers along ground
      ctx.font = '600 11px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#D97706';
      ctx.fillText(
        'ACT 1–3: BUILD-UP, HOLD TREMBLE & SNEEZE EXPLOSION (X: 1120)',
        960 * scaleX,
        groundCanvasY + 24
      );
      ctx.fillStyle = '#059669';
      ctx.fillText(
        'ACT 5–6: FLAT BACK CRASH, LIMB BOUNCE & LEG TWITCH (X: 482)',
        220 * scaleX,
        groundCanvasY + 24
      );

      // Backflip Recoil Trajectory Arc
      if (showTrajectoryArc) {
        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        sneezeFrames.forEach((f, idx) => {
          const px = f.sceneX * scaleX;
          const py = f.sceneY * scaleY;
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();

        sneezeFrames.forEach((f, idx) => {
          const px = f.sceneX * scaleX;
          const py = f.sceneY * scaleY;
          ctx.fillStyle =
            idx === safeIdx
              ? '#E11D48'
              : f.isFlightFrame
              ? '#0284C7'
              : '#CBD5E1';
          ctx.beginPath();
          ctx.arc(px, py, idx === safeIdx ? 5 : f.isFlightFrame ? 3.5 : 2.5, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      const drawSneezePose = (specIndex: number, alpha: number, isGhost: boolean) => {
        const spec = sneezeFrames[specIndex];
        const joints = computeForwardKinematics(spec.sceneX, spec.sceneY, spec.worldAngles, 0.5);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw segments (Nodes 1..12, 14..16)
        for (let i = 1; i < 17; i++) {
          if (i === 13) continue;
          const j = joints[i];
          ctx.strokeStyle = isGhost ? '#64748B' : sneezeConfig.primaryColorHex;
          ctx.lineWidth = Math.max(2, j.thickness * 0.5 * scaleX);
          ctx.beginPath();
          ctx.moveTo(j.startX * scaleX, j.startY * scaleY);
          ctx.lineTo(j.endX * scaleX, j.endY * scaleY);
          ctx.stroke();
        }

        // Draw Head Circle (Node 13)
        const headJ = joints[13];
        const headCenterX = ((headJ.startX + headJ.endX) * 0.5) * scaleX;
        const headCenterY = ((headJ.startY + headJ.endY) * 0.5) * scaleY;
        const headRadius = (headJ.length * 0.5 * 0.5) * scaleX;

        ctx.fillStyle = isGhost ? '#94A3B8' : sneezeConfig.headColorHex;
        ctx.strokeStyle = isGhost ? '#64748B' : sneezeConfig.primaryColorHex;
        ctx.lineWidth = Math.max(2.5, 10 * scaleX);
        ctx.beginPath();
        ctx.arc(headCenterX, headCenterY, headRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (!isGhost) {
          // Visual annotations for each of the 6 Epic Sneeze Acts
          if (spec.act.includes('The Hold')) {
            ctx.strokeStyle = '#D97706';
            ctx.lineWidth = 2;
            for (let s = -1; s <= 1; s += 2) {
              ctx.beginPath();
              ctx.arc(
                headCenterX + s * 30 * scaleX,
                headCenterY - 12 * scaleY,
                14 * scaleX,
                -0.6,
                0.6
              );
              ctx.stroke();
            }
            ctx.fillStyle = '#D97706';
            ctx.font = '600 12px "IBM Plex Mono", monospace';
            ctx.fillText(
              'AH... AH... (STUCK TREMBLE!)',
              headCenterX - 95 * scaleX,
              headCenterY - 46 * scaleY
            );
          } else if (spec.act.includes('The Explosion') || spec.phase.includes('Thruster Liftoff')) {
            // Explosive Sneeze Thruster Blast Cone & Shock Lines shooting forward-down (+X, +Y)
            ctx.strokeStyle = '#E11D48';
            ctx.lineWidth = 2.5;
            for (let ray = 0; ray < 5; ray++) {
              const ang = (-20 - ray * 14) * (Math.PI / 180);
              const r1 = 36 * scaleX;
              const r2 = (135 + (ray % 2) * 35) * scaleX;
              ctx.beginPath();
              ctx.moveTo(headCenterX + Math.cos(ang) * r1, headCenterY - Math.sin(ang) * r1);
              ctx.lineTo(headCenterX + Math.cos(ang) * r2, headCenterY - Math.sin(ang) * r2);
              ctx.stroke();
            }
            ctx.fillStyle = '#E11D48';
            ctx.font = '700 14px "IBM Plex Mono", monospace';
            ctx.fillText(
              'ACHOO!! (THRUSTER BLAST)',
              headCenterX + 45 * scaleX,
              headCenterY + 55 * scaleY
            );
          } else if (spec.act.includes('The Landing') && spec.phase.includes('CRASH')) {
            ctx.strokeStyle = '#0284C7';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(
              spec.sceneX * scaleX,
              groundCanvasY,
              140 * scaleX,
              12 * scaleY,
              0,
              0,
              Math.PI * 2
            );
            ctx.stroke();
          } else if (spec.phase.includes('Twitch')) {
            const knee = joints[1];
            ctx.fillStyle = '#059669';
            ctx.font = '600 12px "IBM Plex Mono", monospace';
            ctx.fillText(
              '*TWITCH* (STILL ALIVE)',
              (knee.endX - 40) * scaleX,
              (knee.endY - 32) * scaleY
            );
          }

          // Root Pelvis Node Gizmo (Node 0)
          const root = joints[0];
          ctx.fillStyle = '#FFFFFF';
          ctx.strokeStyle = '#0284C7';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(root.startX * scaleX, root.startY * scaleY, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        ctx.restore();
      };

      if (showOnionSkin) {
        const prevIdx = (safeIdx - 1 + sneezeFrames.length) % sneezeFrames.length;
        drawSneezePose(prevIdx, 0.2, true);
      }
      drawSneezePose(safeIdx, 1.0, false);

      ctx.restore();
    } else if (activeAnimationMode === 'superhero') {
      const safeIdx = currentFrame % superheroFrames.length;
      const activeSpec = superheroFrames[safeIdx];

      // Optional V-Cam Camera Lock transform when flying through the sky
      ctx.save();
      if (vcamFollow) {
        const camZoom = activeSpec.isFlightFrame ? 1.35 : 1.15;
        const targetX = activeSpec.sceneX * scaleX;
        const targetY = activeSpec.sceneY * scaleY;
        ctx.translate(w * 0.5, h * 0.5);
        ctx.scale(camZoom, camZoom);
        ctx.translate(-targetX, -targetY);
      }

      const groundSceneY = 758;
      const groundCanvasY = groundSceneY * scaleY;

      // Upper Stratosphere Sky Band (Y: 0..groundCanvasY in scene units)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundCanvasY);
      skyGrad.addColorStop(0, activeSpec.isFlightFrame ? '#E0F2FE' : '#F1F5F9');
      skyGrad.addColorStop(1, '#F8FAFC');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(-2400, -1600, w + 4800, groundCanvasY + 1600);

      // Superhero Platform Floor (High-Contrast, never black - clean studio floor)
      const heroFloorGrad = ctx.createLinearGradient(0, groundCanvasY, 0, groundCanvasY + 600 * scaleY);
      heroFloorGrad.addColorStop(0, '#E2E8F0');
      heroFloorGrad.addColorStop(0.12, '#EDF2F7');
      heroFloorGrad.addColorStop(1, '#CBD5E1');
      ctx.fillStyle = heroFloorGrad;
      ctx.fillRect(-2400, groundCanvasY, w + 4800, 1600);

      // Coordinate grid
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      for (let gx = -400; gx < 2400; gx += 160) {
        ctx.beginPath();
        ctx.moveTo(gx * scaleX, -400);
        ctx.lineTo(gx * scaleX, h + 400);
        ctx.stroke();
      }
      for (let gy = -200; gy < 1400; gy += 120) {
        ctx.beginPath();
        ctx.moveTo(-400, gy * scaleY);
        ctx.lineTo(w + 400, gy * scaleY);
        ctx.stroke();
      }

      // High-altitude cloud silhouettes in sky corridor (scrolling parallax during flight)
      const cloudShift = activeSpec.isFlightFrame
        ? (activeSpec.flightStepIndex ?? 1) * 48
        : 0;
      const cloudPositions = [
        { x: 380, y: 125, r: 42 },
        { x: 780, y: 105, r: 54 },
        { x: 1180, y: 130, r: 48 },
        { x: 1580, y: 110, r: 44 },
      ];
      ctx.fillStyle = activeSpec.isFlightFrame ? '#BAE6FD' : '#E2E8F0';
      cloudPositions.forEach((c) => {
        const cx = ((c.x - cloudShift + 1920) % 1920) * scaleX;
        const cy = c.y * scaleY;
        ctx.beginPath();
        ctx.arc(cx, cy, c.r * scaleX, 0, Math.PI * 2);
        ctx.arc(cx + c.r * 0.7 * scaleX, cy + 4, c.r * 0.75 * scaleX, 0, Math.PI * 2);
        ctx.arc(cx - c.r * 0.7 * scaleX, cy + 6, c.r * 0.65 * scaleX, 0, Math.PI * 2);
        ctx.fill();
      });

      // Sky Flight Corridor Guide Band (Y = 144..180)
      const corridorY = heroConfig.flightApexY * scaleY;
      ctx.save();
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(500 * scaleX, corridorY);
      ctx.lineTo(1520 * scaleX, corridorY);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#0284C7';
      ctx.font = '600 10px "IBM Plex Mono", monospace';
      ctx.fillText(
        `STRATOSPHERE SKY CORRIDOR (12 FLIGHT FRAMES · Y=${heroConfig.flightApexY}px)`,
        530 * scaleX,
        corridorY - 8
      );

      // Ground plane
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-400 * scaleX, groundCanvasY);
      ctx.lineTo(2400 * scaleX, groundCanvasY);
      ctx.stroke();

      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1;
      for (let tx = 100; tx <= 1820; tx += 40) {
        ctx.beginPath();
        ctx.moveTo(tx * scaleX, groundCanvasY);
        ctx.lineTo((tx - 12) * scaleX, groundCanvasY + 10);
        ctx.stroke();
      }

      // Act zone markers along ground
      ctx.font = '600 11px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#475569';
      ctx.fillText('ACT 1: WALK (X: 260→515)', 240 * scaleX, groundCanvasY + 24);
      ctx.fillStyle = '#D97706';
      ctx.fillText('ACT 2–3: HEAD SCRATCH & ZERO-G HOVER (X: 520)', 520 * scaleX, groundCanvasY + 24);
      ctx.fillStyle = '#059669';
      ctx.fillText('ACT 5: 3-POINT SUPERHERO LANDING (X: 1542)', 1320 * scaleX, groundCanvasY + 24);

      // Flight arc trajectory curve
      if (showTrajectoryArc) {
        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        superheroFrames.forEach((f, idx) => {
          const px = f.sceneX * scaleX;
          const py = f.sceneY * scaleY;
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();

        superheroFrames.forEach((f, idx) => {
          const px = f.sceneX * scaleX;
          const py = f.sceneY * scaleY;
          ctx.fillStyle =
            idx === safeIdx
              ? '#0284C7'
              : f.isFlightFrame
              ? '#38BDF8'
              : '#CBD5E1';
          ctx.beginPath();
          ctx.arc(px, py, idx === safeIdx ? 5 : f.isFlightFrame ? 3.5 : 2.5, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      const drawStickfigurePose = (
        specIndex: number,
        alpha: number,
        isGhost: boolean
      ) => {
        const spec = superheroFrames[specIndex];
        const joints = computeForwardKinematics(spec.sceneX, spec.sceneY, spec.worldAngles, 0.5);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // If in horizontal Sky Flight (Flight Step >= 4), draw supersonic wind streamlines & sonic boom cone
        if (!isGhost && spec.isFlightFrame) {
          const step = spec.flightStepIndex ?? 1;
          if (step <= 3) {
            // Anti-gravity levitation aura rings under feet
            ctx.strokeStyle = '#0284C7';
            ctx.lineWidth = 1.5;
            for (let r = 1; r <= 2; r++) {
              ctx.beginPath();
              ctx.ellipse(
                spec.sceneX * scaleX,
                (spec.sceneY + 180 + r * 22) * scaleY,
                (45 - r * 10) * scaleX,
                6 * scaleY,
                0,
                0,
                Math.PI * 2
              );
              ctx.stroke();
            }
          } else {
            // Horizontal supersonic wind speed-lines rushing past body
            ctx.strokeStyle = '#0284C7';
            ctx.lineWidth = 1.75;
            const streamOffsets = [-55, -25, 10, 42];
            streamOffsets.forEach((yo, sIdx) => {
              const lineLen = (140 + (sIdx % 2) * 65) * scaleX;
              const startX = (spec.sceneX - 80 - ((step * 37 + sIdx * 29) % 90)) * scaleX;
              const lineY = (spec.sceneY + yo) * scaleY;
              ctx.beginPath();
              ctx.moveTo(startX, lineY);
              ctx.lineTo(startX - lineLen, lineY);
              ctx.stroke();
            });

            // Sonic Boom Mach Cone on initial pitch-out & cruise
            if (step >= 4 && step <= 10) {
              const fist = joints[11];
              ctx.strokeStyle = 'rgba(2, 132, 199, 0.45)';
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              ctx.ellipse(
                (fist.endX - 18) * scaleX,
                fist.endY * scaleY,
                14 * scaleX,
                46 * scaleY,
                0.12,
                0,
                Math.PI * 2
              );
              ctx.stroke();
            }
          }
        }

        // Draw segments (Nodes 1..12, 14..16)
        for (let i = 1; i < 17; i++) {
          if (i === 13) continue;
          const j = joints[i];
          ctx.strokeStyle = isGhost ? '#64748B' : heroConfig.primaryColorHex;
          ctx.lineWidth = Math.max(2, j.thickness * 0.5 * scaleX);
          ctx.beginPath();
          ctx.moveTo(j.startX * scaleX, j.startY * scaleY);
          ctx.lineTo(j.endX * scaleX, j.endY * scaleY);
          ctx.stroke();
        }

        // Draw Head Circle (Node 13, UID 16)
        const headJ = joints[13];
        const headCenterX = ((headJ.startX + headJ.endX) * 0.5) * scaleX;
        const headCenterY = ((headJ.startY + headJ.endY) * 0.5) * scaleY;
        const headRadius = (headJ.length * 0.5 * 0.5) * scaleX;

        ctx.fillStyle = isGhost ? '#94A3B8' : heroConfig.headColorHex;
        ctx.strokeStyle = isGhost ? '#64748B' : heroConfig.primaryColorHex;
        ctx.lineWidth = Math.max(2.5, 10 * scaleX);
        ctx.beginPath();
        ctx.arc(headCenterX, headCenterY, headRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (!isGhost) {
          // Highlight Scratching Effect in Act 2
          if (spec.act.includes('Scratch')) {
            const hand = joints[11];
            ctx.strokeStyle = '#D97706';
            ctx.lineWidth = 2;
            for (let ray = -1; ray <= 1; ray++) {
              ctx.beginPath();
              ctx.moveTo(hand.endX * scaleX - 6, (hand.endY - 12 + ray * 8) * scaleY);
              ctx.lineTo(hand.endX * scaleX - 18, (hand.endY - 18 + ray * 11) * scaleY);
              ctx.stroke();
            }
            ctx.fillStyle = '#D97706';
            ctx.font = '600 12px "IBM Plex Mono", monospace';
            ctx.fillText('? SCRATCH', (headJ.endX - 40) * scaleX, (headJ.endY - 24) * scaleY);
          }

          // Highlight Impact Shockwave rings in Act 5 (Superhero Landing)
          if (spec.act.includes('Superhero Landing')) {
            const fist = joints[11];
            ctx.strokeStyle = '#0284C7';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(
              fist.endX * scaleX,
              groundCanvasY,
              52 * scaleX,
              9 * scaleY,
              0,
              0,
              Math.PI * 2
            );
            ctx.stroke();
          }

          // Draw Root Pelvis Node Gizmo (Node 0)
          const root = joints[0];
          ctx.fillStyle = '#FFFFFF';
          ctx.strokeStyle = '#0284C7';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(root.startX * scaleX, root.startY * scaleY, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        ctx.restore();
      };

      if (showOnionSkin) {
        const prevIdx = (safeIdx - 1 + superheroFrames.length) % superheroFrames.length;
        drawStickfigurePose(prevIdx, 0.2, true);
      }
      drawStickfigurePose(safeIdx, 1.0, false);

      ctx.restore();
    } else {
      // Ball Bounce Rendering Mode
      const groundCanvasY =
        (bounceConfig.groundY + bounceConfig.ballDiameter * 0.42) * scaleY;

      // Studio Backdrop & Light High-Contrast Platform Floor
      const bounceSky = ctx.createLinearGradient(0, 0, 0, groundCanvasY);
      bounceSky.addColorStop(0, '#F8FAFC');
      bounceSky.addColorStop(1, '#F1F5F9');
      ctx.fillStyle = bounceSky;
      ctx.fillRect(-2400, -1600, w + 4800, groundCanvasY + 1600);

      const bounceFloor = ctx.createLinearGradient(0, groundCanvasY, 0, groundCanvasY + 600 * scaleY);
      bounceFloor.addColorStop(0, '#E2E8F0');
      bounceFloor.addColorStop(0.12, '#EDF2F7');
      bounceFloor.addColorStop(1, '#CBD5E1');
      ctx.fillStyle = bounceFloor;
      ctx.fillRect(-2400, groundCanvasY, w + 4800, 1600);

      // Coordinate grid
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      for (let gx = 160; gx < 1920; gx += 160) {
        ctx.beginPath();
        ctx.moveTo(gx * scaleX, 0);
        ctx.lineTo(gx * scaleX, h);
        ctx.stroke();
      }
      for (let gy = 120; gy < 1080; gy += 120) {
        ctx.beginPath();
        ctx.moveTo(0, gy * scaleY);
        ctx.lineTo(w, gy * scaleY);
        ctx.stroke();
      }

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(80 * scaleX, groundCanvasY);
      ctx.lineTo(1840 * scaleX, groundCanvasY);
      ctx.stroke();

      const apex1Y = (bounceConfig.groundY - bounceConfig.primaryApexHeight) * scaleY;
      const apex2Y = (bounceConfig.groundY - bounceConfig.secondaryApexHeight) * scaleY;
      ctx.save();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#0284C7';
      ctx.beginPath();
      ctx.moveTo(260 * scaleX, apex1Y);
      ctx.lineTo(1660 * scaleX, apex1Y);
      ctx.stroke();
      ctx.strokeStyle = '#059669';
      ctx.beginPath();
      ctx.moveTo(960 * scaleX, apex2Y);
      ctx.lineTo(1660 * scaleX, apex2Y);
      ctx.stroke();
      ctx.restore();

      const safeFrameIndex = currentFrame % 22;
      if (showOnionSkin) {
        [-2, -1, 1].forEach((offset) => {
          const gIdx = (safeFrameIndex + offset + 22) % 22;
          const gf = computedBounceFrames[gIdx];
          ctx.save();
          ctx.globalAlpha = offset < 0 ? 0.18 : 0.1;
          ctx.fillStyle = bounceConfig.ballColorHex;
          ctx.strokeStyle = bounceConfig.ballColorHex;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(
            gf.sceneX * scaleX,
            gf.sceneY * scaleY,
            gf.widthDiam * 0.5 * scaleX,
            gf.heightDiam * 0.5 * scaleY,
            0,
            0,
            Math.PI * 2
          );
          if (bounceConfig.nodeType === 4) ctx.fill();
          else ctx.stroke();
          ctx.restore();
        });
      }

      const activeF = computedBounceFrames[safeFrameIndex];
      ctx.save();
      ctx.fillStyle = bounceConfig.ballColorHex;
      ctx.strokeStyle = bounceConfig.ballColorHex;
      ctx.lineWidth = Math.max(3, activeF.serializedThickness * 0.25 * scaleX);
      ctx.beginPath();
      ctx.ellipse(
        activeF.sceneX * scaleX,
        activeF.sceneY * scaleY,
        activeF.widthDiam * 0.5 * scaleX,
        activeF.heightDiam * 0.5 * scaleY,
        0,
        0,
        Math.PI * 2
      );
      if (bounceConfig.nodeType === 4) ctx.fill();
      else ctx.stroke();
      ctx.restore();
    }
  }, [
    binaryStageOverride,
    activeInspection,
    activeAnimationMode,
    basketballFrames,
    basketballConfig,
    strollKickFrames,
    strollKickConfig,
    phantomFrames,
    phantomConfig,
    speedStrengthFrames,
    teleportFrames,
    sneezeFrames,
    superheroFrames,
    computedBounceFrames,
    currentFrame,
    showOnionSkin,
    showTrajectoryArc,
    showKinematicsCoM,
    vcamFollow,
    speedStrengthConfig,
    teleportConfig,
    sneezeConfig,
    heroConfig,
    bounceConfig,
  ]);


  return (
    <canvas
      ref={canvasRef}
      width={1920}
      height={1080}
      className="w-full h-full object-contain bg-[#F1F5F9] block font-mono select-none"
    />
  );
};
