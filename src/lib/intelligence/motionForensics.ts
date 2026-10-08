import { StkndsInspectionResult, StkndsFrameRecord } from '../stknds/stkndsCore';
import { computeForwardKinematics } from '../kinematics/forwardKinematics';
import {
  CenterOfMassState,
  CharacterStructureProfile,
  FrameMotionForensics,
  NodeMotionState,
  Point2D,
  SupportPolygonState,
  Vector2D,
} from './types';

// Segment mass weights for 17-node figure based on standard biomechanics
const STICKFIGURE_MASS_WEIGHTS: number[] = [
  0.15, // 0: Pelvis
  0.10, // 1: R Thigh
  0.06, // 2: R Shin
  0.02, // 3: R Foot
  0.10, // 4: L Thigh
  0.06, // 5: L Shin
  0.02, // 6: L Foot
  0.12, // 7: Lower Spine
  0.15, // 8: Upper Chest
  0.03, // 9: R Bicep
  0.02, // 10: R Forearm
  0.01, // 11: R Hand
  0.02, // 12: Neck
  0.08, // 13: Head
  0.03, // 14: L Bicep
  0.02, // 15: L Forearm
  0.01, // 16: L Hand
];

export function computeCenterOfMass(
  jointPoints: { startX: number; startY: number; endX: number; endY: number }[],
  weights: number[] = STICKFIGURE_MASS_WEIGHTS
): Point2D {
  let totalMass = 0;
  let comX = 0;
  let comY = 0;

  for (let i = 0; i < jointPoints.length; i++) {
    const w = weights[i] ?? 0.05;
    const midX = (jointPoints[i].startX + jointPoints[i].endX) / 2;
    const midY = (jointPoints[i].startY + jointPoints[i].endY) / 2;

    comX += midX * w;
    comY += midY * w;
    totalMass += w;
  }

  if (totalMass <= 0) return { x: jointPoints[0]?.startX ?? 0, y: jointPoints[0]?.startY ?? 0 };

  return { x: comX / totalMass, y: comY / totalMass };
}

export function analyzeProjectMotionForensics(
  inspection: StkndsInspectionResult,
  profile?: CharacterStructureProfile
): FrameMotionForensics[] {
  const fps = inspection.fps || 24;
  const dt = 1 / fps;
  const frames = inspection.frames;
  const forensicsList: FrameMotionForensics[] = [];

  if (!frames || frames.length === 0) {
    return [];
  }

  // Pre-calculate positions across all frames for kinematics
  const frameJointPositions: { startX: number; startY: number; endX: number; endY: number; worldAngle: number; localAngle: number; angleDelta: number }[][] = [];

  for (const frame of frames) {
    const worldAngles = frame.nodes.map((n) => n.worldAngle);
    const instScale = frame.instanceScale || 0.5;
    const joints = computeForwardKinematics(frame.sceneX, frame.sceneY, worldAngles, instScale);

    const mapped = joints.map((j, idx) => ({
      startX: j.startX,
      startY: j.startY,
      endX: j.endX,
      endY: j.endY,
      worldAngle: j.worldAngle,
      localAngle: frame.nodes[idx]?.localAngle ?? j.relAngleA1,
      angleDelta: frame.nodes[idx]?.angleDelta ?? 0,
    }));
    frameJointPositions.push(mapped);
  }

  // Estimate ground Y level from foot joint Y positions
  let estimatedGroundY = -Infinity;
  for (const jPos of frameJointPositions) {
    const rFootY = jPos[3]?.endY ?? 0;
    const lFootY = jPos[6]?.endY ?? 0;
    estimatedGroundY = Math.max(estimatedGroundY, rFootY, lFootY);
  }
  if (!Number.isFinite(estimatedGroundY)) estimatedGroundY = 0;

  // Compute motion forensics for each frame
  for (let f = 0; f < frames.length; f++) {
    const curFrame = frames[f];
    const curJoints = frameJointPositions[f];
    const prevJoints = frameJointPositions[Math.max(0, f - 1)];
    const prevPrevJoints = frameJointPositions[Math.max(0, f - 2)];

    // 1. Compute COM
    const curCom = computeCenterOfMass(curJoints);
    const prevCom = computeCenterOfMass(prevJoints);
    const prevPrevCom = computeCenterOfMass(prevPrevJoints);

    const comVelX = (curCom.x - prevCom.x) * fps;
    const comVelY = (curCom.y - prevCom.y) * fps;
    const comSpeed = Math.sqrt(comVelX * comVelX + comVelY * comVelY);

    const prevComVelX = (prevCom.x - prevPrevCom.x) * fps;
    const prevComVelY = (prevCom.y - prevPrevCom.y) * fps;

    const comAccX = (comVelX - prevComVelX) * fps;
    const comAccY = (comVelY - prevComVelY) * fps;

    const centerOfMass: CenterOfMassState = {
      position: curCom,
      velocity: { x: comVelX, y: comVelY },
      acceleration: { x: comAccX, y: comAccY },
      speed: comSpeed,
    };

    // 2. Compute Nodes Kinematics
    const nodeStates: NodeMotionState[] = [];
    for (let i = 0; i < curJoints.length; i++) {
      const curJ = curJoints[i];
      const prevJ = prevJoints[i];
      const prevPrevJ = prevPrevJoints[i];

      const vx = (curJ.endX - prevJ.endX) * fps;
      const vy = (curJ.endY - prevJ.endY) * fps;
      const speed = Math.sqrt(vx * vx + vy * vy);

      const pvx = (prevJ.endX - prevPrevJ.endX) * fps;
      const pvy = (prevJ.endY - prevPrevJ.endY) * fps;

      const ax = (vx - pvx) * fps;
      const ay = (vy - pvy) * fps;
      const accMag = Math.sqrt(ax * ax + ay * ay);

      const angVel = (curJ.worldAngle - prevJ.worldAngle) * fps;
      const prevAngVel = (prevJ.worldAngle - prevPrevJ.worldAngle) * fps;
      const angAcc = (angVel - prevAngVel) * fps;

      nodeStates.push({
        nodeIndex: i,
        worldPosition: { x: curJ.endX, y: curJ.endY },
        localPosition: { x: curJ.startX, y: curJ.startY },
        worldAngle: curJ.worldAngle,
        localAngle: curJ.localAngle,
        angleDelta: curJ.angleDelta,
        velocity: { x: vx, y: vy },
        speed,
        acceleration: { x: ax, y: ay },
        accelerationMagnitude: accMag,
        angularVelocity: angVel,
        angularAcceleration: angAcc,
      });
    }

    // 3. Support & Balance Analysis
    const rFootSpeed = nodeStates[3]?.speed ?? 999;
    const lFootSpeed = nodeStates[6]?.speed ?? 999;
    const rFootY = nodeStates[3]?.worldPosition.y ?? 0;
    const lFootY = nodeStates[6]?.worldPosition.y ?? 0;

    const rPlanted = rFootSpeed < 40 && Math.abs(rFootY - estimatedGroundY) < 60;
    const lPlanted = lFootSpeed < 40 && Math.abs(lFootY - estimatedGroundY) < 60;

    const plantedFeet: number[] = [];
    const movingFeet: number[] = [];

    if (rPlanted) plantedFeet.push(3); else movingFeet.push(3);
    if (lPlanted) plantedFeet.push(6); else movingFeet.push(6);

    let supportType: SupportPolygonState['supportType'] = 'airborne';
    let supportCenterX = curCom.x;

    if (plantedFeet.length === 2) {
      supportType = 'double-leg';
      supportCenterX = ((nodeStates[3]?.worldPosition.x ?? 0) + (nodeStates[6]?.worldPosition.x ?? 0)) / 2;
    } else if (plantedFeet.length === 1) {
      supportType = 'single-leg';
      supportCenterX = nodeStates[plantedFeet[0]]?.worldPosition.x ?? curCom.x;
    } else {
      supportType = 'airborne';
    }

    const marginOfStability = Math.abs(curCom.x - supportCenterX);

    const supportState: SupportPolygonState = {
      supportType,
      groundY: estimatedGroundY,
      plantedFeetIndices: plantedFeet,
      movingFeetIndices: movingFeet,
      supportCenter: { x: supportCenterX, y: estimatedGroundY },
      comMarginOfStability: marginOfStability,
    };

    // 4. Camera State
    const camX = curFrame.camX ?? 0;
    const camY = curFrame.camY ?? 0;
    const prevCamX = frames[Math.max(0, f - 1)].camX ?? 0;
    const prevCamY = frames[Math.max(0, f - 1)].camY ?? 0;
    const camVelX = (camX - prevCamX) * fps;
    const camVelY = (camY - prevCamY) * fps;
    const shakeMag = Math.sqrt(camVelX * camVelX + camVelY * camVelY);

    forensicsList.push({
      frameIndex: f,
      timeSeconds: f * dt,
      figureInstances: [
        {
          instanceIndex: 0,
          rootPosition: { x: curFrame.sceneX, y: curFrame.sceneY },
          rootVelocity: {
            x: (curFrame.sceneX - frames[Math.max(0, f - 1)].sceneX) * fps,
            y: (curFrame.sceneY - frames[Math.max(0, f - 1)].sceneY) * fps,
          },
          centerOfMass,
          supportState,
          nodes: nodeStates,
        },
      ],
      cameraState: {
        x: camX,
        y: camY,
        zoom: curFrame.camZoom ?? 1,
        velocity: { x: camVelX, y: camVelY },
        shakeMagnitude: shakeMag,
      },
    });
  }

  return forensicsList;
}
