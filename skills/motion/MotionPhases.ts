/**
 * Motion Phases & Motion State Machine Framework.
 * Represents animations using explicit biomechanical phases rather than raw frame transforms.
 */

export type MotionPhaseType =
  | 'anticipation'
  | 'initiation'
  | 'acceleration'
  | 'main_action'
  | 'peak'
  | 'deceleration'
  | 'recovery'
  | 'settling';

export interface MotionPhaseSpec {
  type: MotionPhaseType;
  durationFrames: number;
  weightShiftRatio: number; // -1 to +1 (e.g., -0.2 for counter-lean, +1.0 for drive)
  pelvisDipPx: number; // vertical pelvis wave offset
  footContactState: 'planted' | 'swing' | 'push_off' | 'landing';
  armPoseType: 'counter_swing' | 'guard' | 'extension' | 'recoil';
  easingType: 'ease_in' | 'ease_out' | 'ease_in_out' | 'linear';
}

export interface PhaseEvaluationResult {
  currentPhase: MotionPhaseType;
  phaseProgress: number; // 0.0 to 1.0
  interpolatedPelvisDip: number;
  interpolatedWeightShift: number;
  contactState: string;
}

export class MotionPhaseStateMachine {
  private phases: MotionPhaseSpec[] = [];
  private totalFrames = 0;

  constructor(phases: MotionPhaseSpec[]) {
    this.phases = phases;
    this.totalFrames = phases.reduce((sum, p) => sum + p.durationFrames, 0);
  }

  public getTotalFrames(): number {
    return this.totalFrames;
  }

  public evaluateAtFrame(frameIndex: number): PhaseEvaluationResult {
    let accumulated = 0;
    let selectedPhase = this.phases[0] ?? {
      type: 'main_action' as MotionPhaseType,
      durationFrames: 1,
      weightShiftRatio: 0,
      pelvisDipPx: 0,
      footContactState: 'planted' as const,
      armPoseType: 'guard' as const,
      easingType: 'linear' as const,
    };

    for (const p of this.phases) {
      if (frameIndex < accumulated + p.durationFrames) {
        selectedPhase = p;
        break;
      }
      accumulated += p.durationFrames;
    }

    const frameInPhase = Math.max(0, frameIndex - accumulated);
    const rawProgress = selectedPhase.durationFrames > 0
      ? Math.min(1.0, frameInPhase / selectedPhase.durationFrames)
      : 1.0;

    const progress = applyEasing(rawProgress, selectedPhase.easingType);

    return {
      currentPhase: selectedPhase.type,
      phaseProgress: progress,
      interpolatedPelvisDip: selectedPhase.pelvisDipPx * progress,
      interpolatedWeightShift: selectedPhase.weightShiftRatio * progress,
      contactState: selectedPhase.footContactState,
    };
  }
}

function applyEasing(t: number, easing: 'ease_in' | 'ease_out' | 'ease_in_out' | 'linear'): number {
  switch (easing) {
    case 'ease_in':
      return t * t * t;
    case 'ease_out':
      return 1 - Math.pow(1 - t, 3);
    case 'ease_in_out':
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    default:
      return t;
  }
}
