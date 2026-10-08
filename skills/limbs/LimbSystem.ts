/**
 * Core Unified Limb System.
 * Connects bones, joints, hierarchy, IK/FK solvers, contact states, and constraints.
 */

import { solveTwoBoneIK, TwoBoneIKResult } from '../ik/kinematicsSolvers';
import { solveFabrik2D, FabrikResult } from '../ik/FabrikIK';
import { solveCcd2D, CcdResult } from '../ik/CcdIK';
import { blendFkIkAngles } from '../fk/ForwardKinematics';

export type LimbSolverType = 'ANALYTICAL' | 'FABRIK' | 'CCD';

export interface LimbSegment {
  name: string;
  length: number;
  minRelAngleDeg?: number;
  maxRelAngleDeg?: number;
  preferredBendSign?: number;
}

export interface LimbSolveRequest {
  rootX: number;
  rootY: number;
  targetX: number;
  targetY: number;
  segments: LimbSegment[];
  isRightFacing: boolean;
  limbType: 'LEG' | 'ARM' | 'SPINE' | 'CHAIN';
  solverType?: LimbSolverType;
  fkWorldAnglesDeg?: number[];
  ikBlendAlpha?: number; // 0 = 100% FK, 1 = 100% IK
  groundY?: number;
  scale?: number;
}

export interface LimbSolveResult {
  worldAnglesDeg: number[];
  jointPositions: Array<{ x: number; y: number }>;
  endEffectorX: number;
  endEffectorY: number;
  reachable: boolean;
  finalError: number;
  solverUsed: LimbSolverType;
}

/**
 * Solves any 2-segment or multi-segment limb chain using the most effective solver.
 */
export function solveLimbChain(req: LimbSolveRequest): LimbSolveResult {
  const scale = req.scale ?? 0.5;
  const solverType = req.solverType ?? (req.segments.length === 2 ? 'ANALYTICAL' : 'FABRIK');

  let rawWorldAngles: number[] = [];
  let rawPositions: Array<{ x: number; y: number }> = [];
  let reachable = true;
  let finalError = 0;

  if (solverType === 'ANALYTICAL' && req.segments.length === 2) {
    const l1 = req.segments[0].length;
    const l2 = req.segments[1].length;

    const ik = solveTwoBoneIK(
      req.rootX,
      req.rootY,
      req.targetX,
      req.targetY,
      l1,
      l2,
      req.isRightFacing,
      req.limbType === 'ARM' ? 'ARM' : 'LEG',
      scale
    );

    rawWorldAngles = [ik.upperAngleDeg, ik.lowerAngleDeg];
    rawPositions = [
      { x: req.rootX, y: req.rootY },
      { x: ik.midJointX, y: ik.midJointY },
      { x: ik.endEffectorX, y: ik.endEffectorY },
    ];
    reachable = ik.reachable;
    finalError = Math.hypot(req.targetX - ik.endEffectorX, req.targetY - ik.endEffectorY);
  } else if (solverType === 'CCD') {
    const ccdJoints = req.segments.map((s) => ({
      worldAngleDeg: 0,
      length: s.length * scale,
      minRelAngleDeg: s.minRelAngleDeg,
      maxRelAngleDeg: s.maxRelAngleDeg,
      preferredBendSign: s.preferredBendSign,
    }));

    const ccdRes: CcdResult = solveCcd2D(req.rootX, req.rootY, ccdJoints, req.targetX, req.targetY);
    rawWorldAngles = ccdRes.worldAnglesDeg;
    rawPositions = ccdRes.positions;
    reachable = ccdRes.reached;
    finalError = ccdRes.finalError;
  } else {
    // Default to FABRIK
    const fabrikJoints = req.segments.map((s) => ({
      x: req.rootX,
      y: req.rootY,
      length: s.length * scale,
      minAngleDeg: s.minRelAngleDeg,
      maxAngleDeg: s.maxRelAngleDeg,
      preferredBendSign: s.preferredBendSign,
    }));

    const fabRes: FabrikResult = solveFabrik2D(
      fabrikJoints,
      req.targetX,
      req.targetY,
      20,
      0.5,
      req.groundY
    );

    rawWorldAngles = fabRes.anglesDeg;
    rawPositions = fabRes.positions;
    reachable = fabRes.reached;
    finalError = fabRes.finalError;
  }

  // Apply FK/IK Blending if FK angles and alpha provided
  let finalWorldAngles = rawWorldAngles;
  if (req.fkWorldAnglesDeg && req.ikBlendAlpha !== undefined) {
    finalWorldAngles = blendFkIkAngles(req.fkWorldAnglesDeg, rawWorldAngles, req.ikBlendAlpha);
  }

  const lastPos = rawPositions[rawPositions.length - 1] ?? { x: req.targetX, y: req.targetY };

  return {
    worldAnglesDeg: finalWorldAngles,
    jointPositions: rawPositions,
    endEffectorX: lastPos.x,
    endEffectorY: lastPos.y,
    reachable,
    finalError,
    solverUsed: solverType,
  };
}
