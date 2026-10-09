import { StickfigureKeyframeSpec } from '../stknds/stkndsCore';
import { PropelledFlightGeneratorConfig } from './propelledFlightTypes';
import { CANONICAL_36_PROPELLED_FLIGHT_FRAMES } from './propelledFlightFrames';

export function buildAdjustedPropelledFlightFrames(
  config: PropelledFlightGeneratorConfig
): StickfigureKeyframeSpec[] {
  const apexShift = (config.flightApexY ?? 135.0) - 135.0;
  const compressionDelta = (config.compressionDipPx ?? 72.0) - 72.0;

  const adjusted36: StickfigureKeyframeSpec[] = CANONICAL_36_PROPELLED_FLIGHT_FRAMES.map((spec) => {
    const angles = [...spec.worldAngles];
    let sy = spec.sceneY;

    // Shift sky flight altitude when airborne
    if (spec.isFlightFrame || spec.act.includes('Sustained Flight')) {
      sy = Math.max(80, sy + apexShift);
    }

    // Apply deep crouch compression adjustments
    if (spec.phase.includes('Compression') || spec.phase.includes('Crouch')) {
      sy += compressionDelta;
    }

    return {
      ...spec,
      sceneY: sy,
      worldAngles: angles,
    };
  });

  // If 24 FPS with sub-frame tweening is enabled, generate 71 frames
  if (config.targetFps === 24 && config.interpolate24FpsFrames) {
    const interpolated: StickfigureKeyframeSpec[] = [];
    let fCounter = 0;
    let flightCounter = 0;

    for (let i = 0; i < adjusted36.length; i++) {
      const cur = adjusted36[i];
      if (cur.isFlightFrame) flightCounter++;

      interpolated.push({
        ...cur,
        frame: fCounter++,
        flightStepIndex: cur.isFlightFrame ? flightCounter : undefined,
      });

      if (i < adjusted36.length - 1) {
        const nxt = adjusted36[i + 1];
        const midIsFlight = cur.isFlightFrame || nxt.isFlightFrame;
        if (midIsFlight) flightCounter++;

        const midAngles = cur.worldAngles.map((a: number, idx: number) => 0.5 * (a + nxt.worldAngles[idx]));
        interpolated.push({
          frame: fCounter++,
          act: cur.act,
          phase: midIsFlight
            ? `${cur.phase} (Sub-frame Flight)`
            : `${cur.phase} (24fps Sub-frame)`,
          isFlightFrame: midIsFlight,
          flightStepIndex: midIsFlight ? flightCounter : undefined,
          sceneX: 0.5 * (cur.sceneX + nxt.sceneX),
          sceneY: 0.5 * (cur.sceneY + nxt.sceneY),
          worldAngles: midAngles,
        });
      }
    }
    return interpolated;
  }

  return adjusted36;
}
