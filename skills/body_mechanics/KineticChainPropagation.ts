/**
 * Full-Body Kinetic Chain Reaction Engine.
 * Propagates physical impulses and forces bidirectionally through connected body links.
 */

export interface BodyJointChainNode {
  index: number;
  name: string;
  parentIndex: number;
  worldX: number;
  worldY: number;
  worldAngleDeg: number;
  mass: number;
}

export interface ImpulsePropagationRequest {
  originNodeIndex: number; // Node where force/impact was applied
  impulseX: number;
  impulseY: number;
  torque: number;
  worldAnglesDeg: number[];
  parents: number[];
  isRightFacing: boolean;
}

export interface ImpulsePropagationResult {
  modifiedWorldAnglesDeg: number[];
  pelvisShiftX: number;
  pelvisShiftY: number;
  chainReactionDiagnostics: string[];
}

/**
 * Propagates an impulse through the 17-bone skeleton kinetic tree.
 *
 * Ground-Up (Bottom-Up): Foot contact -> Ankle -> Knee -> Hip -> Pelvis -> Spine -> Shoulders/Head
 * Top-Down: Hand/Punch impact -> Wrist -> Elbow -> Shoulder -> Spine -> Pelvis -> Legs
 */
export function propagateKineticImpulse(
  req: ImpulsePropagationRequest
): ImpulsePropagationResult {
  const angles = [...req.worldAnglesDeg];
  const diagnostics: string[] = [];
  let pelvisShiftX = 0;
  let pelvisShiftY = 0;

  const origin = req.originNodeIndex;
  const isRight = req.isRightFacing;

  // Case 1: Impact on Hand (Nodes 11 or 14) or Forearm -> Top-Down propagation
  if (origin === 11 || origin === 14 || origin === 10 || origin === 13) {
    const isRightArm = origin === 11 || origin === 10;
    const bicepIdx = isRightArm ? 9 : 12;
    const forearmIdx = isRightArm ? 10 : 13;

    // 1. Forearm / Bicep flexion recoil
    const flexAmt = Math.min(25, Math.hypot(req.impulseX, req.impulseY) * 0.8);
    angles[forearmIdx] += isRight ? flexAmt : -flexAmt;
    diagnostics.push(`Arm recoil: Joint ${forearmIdx} flexed by ${flexAmt.toFixed(1)}°`);

    // 2. Shoulder & Torso counter-twist
    const torsoTwist = (req.impulseX > 0 ? -1 : 1) * Math.min(15, Math.abs(req.impulseX) * 0.5);
    angles[8] += torsoTwist; // Upper Chest (Node 8)
    angles[7] += torsoTwist * 0.6; // Lower Spine (Node 7)
    diagnostics.push(`Torso counter-twist: Upper Chest Node 8 rotated by ${torsoTwist.toFixed(1)}°`);

    // 3. Pelvis reaction displacement
    pelvisShiftX += req.impulseX * 0.25;
    pelvisShiftY += req.impulseY * 0.15;
    diagnostics.push(`Pelvis displaced by (${pelvisShiftX.toFixed(1)}, ${pelvisShiftY.toFixed(1)})px`);
  }
  // Case 2: Impact on Foot (Nodes 3 or 6) or Shin -> Bottom-Up propagation
  else if (origin === 3 || origin === 6 || origin === 2 || origin === 5) {
    const isRightLeg = origin === 3 || origin === 2;
    const shinIdx = isRightLeg ? 2 : 5;
    const thighIdx = isRightLeg ? 1 : 4;

    // 1. Knee flexion shock absorption
    const kneeFlex = Math.min(30, Math.abs(req.impulseY) * 0.9);
    angles[shinIdx] += isRight ? -kneeFlex : kneeFlex;
    diagnostics.push(`Knee shock absorption: Joint ${shinIdx} flexed by ${kneeFlex.toFixed(1)}°`);

    // 2. Pelvis dip
    pelvisShiftY += Math.abs(req.impulseY) * 0.4;
    diagnostics.push(`Pelvis compressed downward by ${(Math.abs(req.impulseY) * 0.4).toFixed(1)}px`);

    // 3. Spine compression
    const spineFlex = Math.min(12, Math.abs(req.impulseY) * 0.3);
    angles[7] += isRight ? spineFlex : -spineFlex;
    diagnostics.push(`Spine compressed: Node 7 flexed by ${spineFlex.toFixed(1)}°`);
  }
  // Case 3: Torso / Core impact
  else {
    pelvisShiftX += req.impulseX * 0.5;
    pelvisShiftY += req.impulseY * 0.5;
    angles[7] += req.torque * 0.5;
    angles[8] += req.torque * 0.8;
    diagnostics.push(`Torso core impact: Pelvis shifted (${req.impulseX}, ${req.impulseY}), Spine torqued by ${req.torque}°`);
  }

  return {
    modifiedWorldAnglesDeg: angles,
    pelvisShiftX,
    pelvisShiftY,
    chainReactionDiagnostics: diagnostics,
  };
}
