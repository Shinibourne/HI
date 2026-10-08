import { SpeedVsStrengthKeyframeSpec, SpeedVsStrengthGeneratorConfig } from './speedVsStrengthTypes';
import { CANONICAL_36_SPEED_VS_STRENGTH_FRAMES } from './speedVsStrengthData';

export function buildAdjustedSpeedStrengthFrames(
  config: SpeedVsStrengthGeneratorConfig
): SpeedVsStrengthKeyframeSpec[] {
  const base36 = CANONICAL_36_SPEED_VS_STRENGTH_FRAMES;

  if (config.targetFps === 24 && config.interpolate24FpsFrames) {
    const interpolated: SpeedVsStrengthKeyframeSpec[] = [];
    for (let i = 0; i < base36.length; i++) {
      const curr = base36[i];
      interpolated.push({
        ...curr,
        frame: interpolated.length,
      });

      if (i < base36.length - 1) {
        const next = base36[i + 1];
        // Don't blend across the impact clash frame (F24) to preserve hit-stop freeze density
        if (curr.frame === 24) {
          interpolated.push({
            ...curr,
            frame: interpolated.length,
            phase: `${curr.phase} (Hit-Stop Freeze)`,
          });
        } else {
          interpolated.push({
            frame: interpolated.length,
            act: curr.act,
            phase: `${curr.phase} (24fps In-Between)`,
            camX: Number(((curr.camX + next.camX) * 0.5).toFixed(1)),
            camY: Number(((curr.camY + next.camY) * 0.5).toFixed(1)),
            camZoom: Number(((curr.camZoom + next.camZoom) * 0.5).toFixed(2)),
            charAX: Number(((curr.charAX + next.charAX) * 0.5).toFixed(1)),
            charAY: Number(((curr.charAY + next.charAY) * 0.5).toFixed(1)),
            charAAngles: curr.charAAngles.map((a, idx) =>
              Number(((a + next.charAAngles[idx]) * 0.5).toFixed(1))
            ),
            charBX: Number(((curr.charBX + next.charBX) * 0.5).toFixed(1)),
            charBY: Number(((curr.charBY + next.charBY) * 0.5).toFixed(1)),
            charBAngles: curr.charBAngles.map((a, idx) =>
              Number(((a + next.charBAngles[idx]) * 0.5).toFixed(1))
            ),
          });
        }
      }
    }
    return interpolated;
  }

  return base36;
}

/**
 * Binary synthesizer encoding Speed vs Strength into valid Stick Nodes v334 project
 */
