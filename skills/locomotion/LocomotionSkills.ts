import { ISkill, SkillExecutionResult, SkillValidationResult } from '../core/ISkill';
import { SkillRegistry } from '../core/SkillRegistry';
import { FramePose } from '../validation/AnimationQualityAnalyzer';
import { solveLegLimb, solveArmLimb } from '../ik/kinematicsSolvers';

export interface LocomotionParams {
  type: 'walk' | 'run' | 'sprint';
  numSteps: number;
  startX: number;
  groundY: number;
  isRightFacing: boolean;
}

export function generateProceduralLocomotion(params: LocomotionParams): FramePose[] {
  const { type, numSteps, startX, groundY, isRightFacing } = params;
  const frames: FramePose[] = [];

  const stepDistance = type === 'sprint' ? 90 : type === 'run' ? 65 : 45;
  const framesPerStep = type === 'sprint' ? 6 : type === 'run' ? 8 : 12;
  const pelvisHeight = 520;

  let currentPelvisX = startX;

  for (let s = 0; s < numSteps; s++) {
    for (let f = 0; f < framesPerStep; f++) {
      const frameIdx = s * framesPerStep + f;
      const progress = f / framesPerStep;

      // Sinusoidal pelvis wave (dips on weight acceptance, rises on passing)
      const pelvisDip = Math.sin(progress * Math.PI) * (type === 'sprint' ? 14 : 8);
      currentPelvisX += stepDistance / framesPerStep;
      const pelvisY = pelvisHeight + pelvisDip;

      // Swing leg vs Stance leg IK targets
      const isRightLead = s % 2 === 0;
      const leadFootX = currentPelvisX + (progress - 0.5) * stepDistance;
      const trailFootX = currentPelvisX - (progress - 0.5) * stepDistance;

      const rightFootX = isRightLead ? leadFootX : trailFootX;
      const leftFootX = isRightLead ? trailFootX : leadFootX;

      const rightFootY = isRightLead && progress < 0.5 ? groundY - 15 * Math.sin(progress * 2 * Math.PI) : groundY;
      const leftFootY = !isRightLead && progress < 0.5 ? groundY - 15 * Math.sin(progress * 2 * Math.PI) : groundY;

      // Solve legs via Leg IK
      const rightLeg = solveLegLimb(currentPelvisX, pelvisY, rightFootX, rightFootY, isRightFacing, 0.5, true, groundY);
      const leftLeg = solveLegLimb(currentPelvisX, pelvisY, leftFootX, leftFootY, isRightFacing, 0.5, true, groundY);

      // Arm counter-swing
      const armSwingDeg = (isRightLead ? 1 : -1) * Math.cos(progress * Math.PI) * (type === 'sprint' ? 45 : 25);
      const rightArmTargetX = currentPelvisX - Math.sin((armSwingDeg * Math.PI) / 180) * 80;
      const leftArmTargetX = currentPelvisX + Math.sin((armSwingDeg * Math.PI) / 180) * 80;

      const rightArm = solveArmLimb(currentPelvisX, pelvisY - 60, rightArmTargetX, pelvisY, isRightFacing, 0.5);
      const leftArm = solveArmLimb(currentPelvisX, pelvisY - 60, leftArmTargetX, pelvisY, isRightFacing, 0.5);

      // Construct 17 bone angles array
      const angles = new Array(17).fill(0);
      angles[0] = isRightFacing ? 0 : 180; // Pelvis
      angles[1] = rightLeg.thighAngleDeg;
      angles[2] = rightLeg.shinAngleDeg;
      angles[3] = rightLeg.footAngleDeg;
      angles[4] = leftLeg.thighAngleDeg;
      angles[5] = leftLeg.shinAngleDeg;
      angles[6] = leftLeg.footAngleDeg;
      angles[7] = isRightFacing ? 5 : -5; // Lower Spine
      angles[8] = isRightFacing ? 5 : -5; // Upper Chest
      angles[9] = rightArm.bicepAngleDeg;
      angles[10] = rightArm.forearmAngleDeg;
      angles[11] = rightArm.handAngleDeg;
      angles[12] = leftArm.bicepAngleDeg;
      angles[13] = leftArm.forearmAngleDeg;
      angles[14] = leftArm.handAngleDeg;
      angles[15] = 0; // Neck
      angles[16] = 0; // Head

      frames.push({
        frameIndex: frameIdx,
        pelvisX: currentPelvisX,
        pelvisY,
        worldAnglesDeg: angles,
        isRightFacing,
      });
    }
  }

  return frames;
}

export const LocomotionSkill: ISkill = {
  metadata: {
    id: 'procedural-locomotion',
    name: 'Procedural Gait & Locomotion System',
    category: 'locomotion',
    summary: 'Procedural walk, run, sprint gait generator combining pelvic sinusoidal wave, Leg IK, and arm counter-swing.',
    dependencies: ['procedural-animation-kinematics', 'physics-and-momentum', 'contact-and-constraints'],
    capabilities: ['walk-cycle', 'run-cycle', 'procedural-gait'],
    knowledgeRules: [
      {
        id: 'RULE_4PHASE_GAIT',
        name: '4-Phase Gait Cycle',
        description: 'Gait must cycle cleanly through Contact → Down → Passing → Up phases.',
        failureModesPrevented: ['Flat stiff-legged walking'],
      },
    ],
  },

  execute(context: any, params?: any): SkillExecutionResult {
    const p: LocomotionParams = params ?? {
      type: 'walk',
      numSteps: 2,
      startX: 300,
      groundY: 755.0,
      isRightFacing: true,
    };

    const frames = generateProceduralLocomotion(p);

    return {
      success: true,
      modifiedContext: { ...context, frames },
      metrics: { totalFramesGenerated: frames.length },
    };
  },
};

SkillRegistry.getInstance().register(LocomotionSkill);
