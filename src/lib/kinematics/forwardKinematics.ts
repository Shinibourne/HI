import { STICKFIGURE_PARENTS, STICKFIGURE_BONE_LENGTHS, STICKFIGURE_BONE_THICKNESS } from '../stknds/stickfigureStructure';

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

export function computeForwardKinematics(
  sceneX: number,
  sceneY: number,
  worldAngles: number[],
  instanceScale = 0.5
): JointPoint[] {
  const joints: JointPoint[] = new Array(17);
  for (let i = 0; i < 17; i++) {
    const p = STICKFIGURE_PARENTS[i];
    const len = STICKFIGURE_BONE_LENGTHS[i];
    const thick = STICKFIGURE_BONE_THICKNESS[i];
    const wAng = worldAngles[i];
    const relA1 = p === -1 ? wAng : wAng - worldAngles[p];

    if (p === -1) {
      joints[i] = {
        startX: sceneX,
        startY: sceneY,
        endX: sceneX,
        endY: sceneY,
        worldAngle: wAng,
        relAngleA1: relA1,
        length: len,
        thickness: thick,
      };
    } else {
      const startX = joints[p].endX;
      const startY = joints[p].endY;
      const rad = (wAng * Math.PI) / 180;
      const endX = startX + Math.cos(rad) * len * instanceScale;
      const endY = startY - Math.sin(rad) * len * instanceScale;
      joints[i] = {
        startX,
        startY,
        endX,
        endY,
        worldAngle: wAng,
        relAngleA1: relA1,
        length: len,
        thickness: thick,
      };
    }
  }
  return joints;
}
