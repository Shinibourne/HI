import { ISkill, SkillContext, SkillExecutionResult } from '../ISkill';
import { validatePropelledFlightBiomechanics } from '../../src/lib/propelledFlight/propelledFlightAudit';
import { buildAdjustedPropelledFlightFrames } from '../../src/lib/propelledFlight/propelledFlightGenerator';

export class PropelledFlightSkill implements ISkill {
  readonly id = 'propelled-flight-skill';
  readonly name = 'Walk -> Run -> Ground-Propelled Flight Choreography Skill';
  readonly category = 'acrobatics' as const;
  readonly description =
    'Choreographs a seamless continuous transition from walking gait into sprinting acceleration, deep compression crouch, ground-propelled explosive takeoff, and sustained high-speed aerial flight.';

  async execute(context: SkillContext): Promise<SkillExecutionResult> {
    const fps = (context.parameters?.fps as 12 | 24) || 24;
    const frames = buildAdjustedPropelledFlightFrames({
      targetFps: fps,
      interpolate24FpsFrames: false,
    });

    const metrics = validatePropelledFlightBiomechanics(frames);

    return {
      success: metrics.passed,
      confidence: metrics.score / 100,
      outputData: {
        framesCount: frames.length,
        metrics,
      },
      logs: [
        `Generated ${frames.length} frames for Walk -> Run -> Propelled Flight Skill`,
        `Biomechanical Score: ${metrics.score}/100`,
        `Compression Drop: ${metrics.kneeCompressionDepthPx.toFixed(1)}px`,
        `Launch Displacement: ${metrics.launchDisplacementPx.toFixed(1)}px`,
        `Cruising Speed: ${metrics.airborneCruisingSpeedPx.toFixed(1)} px/f`,
      ],
    };
  }
}
