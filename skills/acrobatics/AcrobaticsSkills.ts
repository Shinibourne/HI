import { ISkill, SkillExecutionResult } from '../core/ISkill';
import { SkillRegistry } from '../core/SkillRegistry';
import { FramePose } from '../validation/AnimationQualityAnalyzer';
import { solveLegLimb, solveArmLimb } from '../ik/kinematicsSolvers';

export interface AcrobaticsParams {
  type: 'jump' | 'roll' | 'landing';
  startX: number;
  groundY: number;
  isRightFacing: boolean;
}

export function generateProceduralAcrobatics(params: AcrobaticsParams): FramePose[] {
  const { type, startX, groundY, isRightFacing } = params;
  const frames: FramePose[] = [];
  const basePelvisY = 520;
  const totalFrames = 12;

  for (let f = 0; f < totalFrames; f++) {
    const progress = f / totalFrames;
    let pelvisX = startX + progress * (type === 'roll' ? 120 : 60);
    let pelvisY = basePelvisY;

    if (type === 'jump') {
      // Parabolic flight trajectory
      const jumpProgress = Math.sin(progress * Math.PI);
      pelvisY = basePelvisY - jumpProgress * 150; // apex jump height
    } else if (type === 'roll') {
      // Ground roll crouching trajectory
      pelvisY = groundY - 60;
    } else if (type === 'landing') {
      // Touchdown shock absorption compression
      const compress = f < 4 ? f * 12 : (12 - f) * 4;
      pelvisY = basePelvisY + compress;
    }

    const footY = Math.min(groundY, pelvisY + 235);
    const rightLeg = solveLegLimb(pelvisX, pelvisY, pelvisX + 15, footY, isRightFacing, 0.5, footY >= groundY, groundY);
    const leftLeg = solveLegLimb(pelvisX, pelvisY, pelvisX - 15, footY, isRightFacing, 0.5, footY >= groundY, groundY);

    const rightArm = solveArmLimb(pelvisX, pelvisY - 60, pelvisX + 30, pelvisY, isRightFacing, 0.5);
    const leftArm = solveArmLimb(pelvisX, pelvisY - 60, pelvisX - 30, pelvisY, isRightFacing, 0.5);

    const angles = new Array(17).fill(0);
    angles[0] = isRightFacing ? 0 : 180;
    angles[1] = rightLeg.thighAngleDeg;
    angles[2] = rightLeg.shinAngleDeg;
    angles[3] = rightLeg.footAngleDeg;
    angles[4] = leftLeg.thighAngleDeg;
    angles[5] = leftLeg.shinAngleDeg;
    angles[6] = leftLeg.footAngleDeg;
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

export const AcrobaticsSkill: ISkill = {
  metadata: {
    id: 'procedural-acrobatics',
    name: 'Procedural Acrobatics & Vertical Motion System',
    category: 'acrobatics',
    summary: 'Procedural jump flight, landing shock absorption, and ground roll generators.',
    dependencies: ['procedural-animation-kinematics', 'physics-and-momentum', 'contact-and-constraints'],
    capabilities: ['jump-generator', 'landing-generator', 'roll-generator'],
    knowledgeRules: [
      {
        id: 'RULE_PARABOLIC_FLIGHT',
        name: 'Parabolic Ballistic Flight',
        description: 'Airborne trajectory must follow exact parabolic gravity curve with clear apex.',
        failureModesPrevented: ['Linear elevator jumps'],
      },
      {
        id: 'RULE_LANDING_CUSHION',
        name: 'Landing Compression Cushioning',
        description: 'Touchdowns must flex knees and dip pelvis downward to dissipate kinetic energy.',
        failureModesPrevented: ['Stiff-legged jarring landings'],
      },
    ],
  },

  execute(context: any, params?: any): SkillExecutionResult {
    const p: AcrobaticsParams = params ?? {
      type: 'jump',
      startX: 350,
      groundY: 755.0,
      isRightFacing: true,
    };

    const frames = generateProceduralAcrobatics(p);

    return {
      success: true,
      modifiedContext: { ...context, frames },
      metrics: { totalFramesGenerated: frames.length },
    };
  },
};

SkillRegistry.getInstance().register(AcrobaticsSkill);
