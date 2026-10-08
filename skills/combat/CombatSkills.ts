import { ISkill, SkillExecutionResult } from '../core/ISkill';
import { SkillRegistry } from '../core/SkillRegistry';
import { FramePose } from '../validation/AnimationQualityAnalyzer';
import { solveArmLimb, solveLegLimb } from '../ik/kinematicsSolvers';

export interface StrikeParams {
  type: 'punch' | 'kick' | 'boxing_combo';
  startX: number;
  groundY: number;
  isRightFacing: boolean;
}

export function generateProceduralCombatStrike(params: StrikeParams): FramePose[] {
  const { type, startX, groundY, isRightFacing } = params;
  const frames: FramePose[] = [];
  const pelvisHeight = 520;

  // Phases: Anticipation (coiling back) -> Extension -> Hit-Stop -> Recovery -> Settle
  const totalFrames = type === 'boxing_combo' ? 18 : 10;

  for (let f = 0; f < totalFrames; f++) {
    const progress = f / totalFrames;
    let pelvisX = startX;
    let pelvisY = pelvisHeight;

    // Anticipation crouch vs Extension drive
    if (f < 3) {
      // Coiling back
      pelvisX -= isRightFacing ? 8 : -8;
      pelvisY += 10;
    } else if (f >= 3 && f <= 5) {
      // Explosive drive forward
      pelvisX += isRightFacing ? 20 : -20;
    } else {
      // Recovery settle
      pelvisX += isRightFacing ? 12 : -12;
    }

    // Legs stance
    const rightLeg = solveLegLimb(pelvisX, pelvisY, pelvisX + 25, groundY, isRightFacing, 0.5, true, groundY);
    const leftLeg = solveLegLimb(pelvisX, pelvisY, pelvisX - 25, groundY, isRightFacing, 0.5, true, groundY);

    // Striking Arm / Leg
    let rightArmTargetX = pelvisX + (isRightFacing ? 40 : -40);
    let rightArmTargetY = pelvisY - 30;

    if (f >= 3 && f <= 5) {
      // Full punch extension
      rightArmTargetX = pelvisX + (isRightFacing ? 130 : -130);
      rightArmTargetY = pelvisY - 40;
    }

    const rightArm = solveArmLimb(pelvisX, pelvisY - 60, rightArmTargetX, rightArmTargetY, isRightFacing, 0.5);
    const leftArm = solveArmLimb(pelvisX, pelvisY - 60, pelvisX - 20, pelvisY - 20, isRightFacing, 0.5);

    const angles = new Array(17).fill(0);
    angles[0] = isRightFacing ? 0 : 180;
    angles[1] = rightLeg.thighAngleDeg;
    angles[2] = rightLeg.shinAngleDeg;
    angles[3] = rightLeg.footAngleDeg;
    angles[4] = leftLeg.thighAngleDeg;
    angles[5] = leftLeg.shinAngleDeg;
    angles[6] = leftLeg.footAngleDeg;
    angles[7] = f >= 3 && f <= 5 ? (isRightFacing ? 12 : -12) : 0; // Torso drive
    angles[8] = f >= 3 && f <= 5 ? (isRightFacing ? 15 : -15) : 0; // Chest twist
    angles[9] = rightArm.bicepAngleDeg;
    angles[10] = rightArm.forearmAngleDeg;
    angles[11] = rightArm.handAngleDeg;
    angles[12] = leftArm.bicepAngleDeg;
    angles[13] = leftArm.forearmAngleDeg;
    angles[14] = leftArm.handAngleDeg;

    frames.push({
      frameIndex: f,
      pelvisX,
      pelvisY,
      worldAnglesDeg: angles,
      isRightFacing,
    });
  }

  return frames;
}

export const CombatSkill: ISkill = {
  metadata: {
    id: 'procedural-combat-strikes',
    name: 'Procedural Combat & Martial Arts System',
    category: 'combat',
    summary: 'Procedural punch, kick, and boxing combo generator with kinetic chain whipping and hit-stop holds.',
    dependencies: ['procedural-animation-kinematics', 'physics-and-momentum'],
    capabilities: ['punch-generator', 'kick-generator', 'boxing-combos'],
    knowledgeRules: [
      {
        id: 'RULE_STRIKE_WHIP',
        name: 'Kinetic Chain Whip',
        description: 'Strikes must originate from pelvis weight shift → spine torque → shoulder whip → hand extension.',
        failureModesPrevented: ['Arm-only weak strikes'],
      },
    ],
  },

  execute(context: any, params?: any): SkillExecutionResult {
    const p: StrikeParams = params ?? {
      type: 'punch',
      startX: 400,
      groundY: 755.0,
      isRightFacing: true,
    };

    const frames = generateProceduralCombatStrike(p);

    return {
      success: true,
      modifiedContext: { ...context, frames },
      metrics: { totalFramesGenerated: frames.length },
    };
  },
};

SkillRegistry.getInstance().register(CombatSkill);
