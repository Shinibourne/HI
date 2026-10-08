/**
 * Forward Kinematics (FK) and FK/IK Blending System.
 * Supports hierarchical transformation, shortest-path angle unwrapping, and smooth FK/IK blending.
 */

export interface FKNode {
  index: number;
  name: string;
  parentIndex: number;
  length: number;
  relAngleDeg: number;
}

export interface ComputedWorldPose {
  index: number;
  name: string;
  parentIndex: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  worldAngleDeg: number;
  relAngleDeg: number;
}

/**
 * Computes world positions and angles for a hierarchy of nodes given relative angles.
 */
export function solveForwardKinematicsHierarchy(
  rootX: number,
  rootY: number,
  nodes: FKNode[],
  scale = 0.5
): ComputedWorldPose[] {
  const result: ComputedWorldPose[] = new Array(nodes.length);

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const p = node.parentIndex;
    const len = node.length * scale;

    if (p === -1) {
      const wAng = node.relAngleDeg;
      result[i] = {
        index: i,
        name: node.name,
        parentIndex: -1,
        startX: rootX,
        startY: rootY,
        endX: rootX,
        endY: rootY,
        worldAngleDeg: wAng,
        relAngleDeg: wAng,
      };
    } else {
      const parentPose = result[p];
      const startX = parentPose.endX;
      const startY = parentPose.endY;
      const wAng = parentPose.worldAngleDeg + node.relAngleDeg;
      const rad = (wAng * Math.PI) / 180;
      const endX = startX + Math.cos(rad) * len;
      const endY = startY - Math.sin(rad) * len;

      result[i] = {
        index: i,
        name: node.name,
        parentIndex: p,
        startX,
        startY,
        endX,
        endY,
        worldAngleDeg: wAng,
        relAngleDeg: node.relAngleDeg,
      };
    }
  }

  return result;
}

/**
 * Linearly interpolates two angles along the shortest angular path (unwrapping ±180° boundary).
 */
export function lerpAngleDeg(fromDeg: number, toDeg: number, alpha: number): number {
  let diff = (toDeg - fromDeg) % 360;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return fromDeg + diff * alpha;
}

/**
 * Blends FK world angles with IK solved world angles using blend weight alpha (0 = 100% FK, 1 = 100% IK).
 */
export function blendFkIkAngles(
  fkWorldAnglesDeg: number[],
  ikWorldAnglesDeg: number[],
  alpha: number
): number[] {
  const clampedAlpha = Math.max(0, Math.min(1, alpha));
  const result: number[] = new Array(fkWorldAnglesDeg.length);

  for (let i = 0; i < fkWorldAnglesDeg.length; i++) {
    const fk = fkWorldAnglesDeg[i] ?? 0;
    const ik = ikWorldAnglesDeg[i] ?? fk;
    result[i] = lerpAngleDeg(fk, ik, clampedAlpha);
  }

  return result;
}
