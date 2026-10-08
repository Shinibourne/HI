import { FrameMotionForensics, SemanticMotionEvent, TimingSpacingProfile } from './types';

export function detectSemanticEvents(
  projectId: string,
  forensics: FrameMotionForensics[]
): SemanticMotionEvent[] {
  const events: SemanticMotionEvent[] = [];
  if (!forensics || forensics.length === 0) return events;

  let eventCounter = 0;

  for (let f = 1; f < forensics.length; f++) {
    const cur = forensics[f];
    const prev = forensics[f - 1];
    const curFig = cur.figureInstances[0];
    const prevFig = prev.figureInstances[0];

    if (!curFig || !prevFig) continue;

    const time = cur.timeSeconds;

    // 1. Foot Contact & Liftoff Detection
    const curPlanted = curFig.supportState.plantedFeetIndices;
    const prevPlanted = prevFig.supportState.plantedFeetIndices;

    for (const footIdx of curPlanted) {
      if (!prevPlanted.includes(footIdx)) {
        events.push({
          id: `evt_${projectId}_${eventCounter++}`,
          projectId,
          frameIndex: f,
          timeSeconds: time,
          eventType: 'foot-contact',
          primaryBodyPart: footIdx === 3 ? 'Right Foot' : 'Left Foot',
          affectedJointIndices: [footIdx],
          description: `${footIdx === 3 ? 'Right' : 'Left'} foot made ground contact`,
          magnitude: curFig.nodes[footIdx]?.speed ?? 0,
          kinematicContext: {
            comVelocity: curFig.centerOfMass.velocity,
            supportType: curFig.supportState.supportType,
            secondaryMotionDetected: false,
          },
        });
      }
    }

    for (const footIdx of prevPlanted) {
      if (!curPlanted.includes(footIdx)) {
        events.push({
          id: `evt_${projectId}_${eventCounter++}`,
          projectId,
          frameIndex: f,
          timeSeconds: time,
          eventType: 'foot-liftoff',
          primaryBodyPart: footIdx === 3 ? 'Right Foot' : 'Left Foot',
          affectedJointIndices: [footIdx],
          description: `${footIdx === 3 ? 'Right' : 'Left'} foot lifted off ground`,
          magnitude: curFig.nodes[footIdx]?.speed ?? 0,
          kinematicContext: {
            comVelocity: curFig.centerOfMass.velocity,
            supportType: curFig.supportState.supportType,
            secondaryMotionDetected: false,
          },
        });
      }
    }

    // 2. High Acceleration Bursts & Impact Detection
    for (const node of curFig.nodes) {
      if (node.accelerationMagnitude > 2500) {
        const isHand = node.nodeIndex === 11 || node.nodeIndex === 16;
        const isFoot = node.nodeIndex === 3 || node.nodeIndex === 6;

        events.push({
          id: `evt_${projectId}_${eventCounter++}`,
          projectId,
          frameIndex: f,
          timeSeconds: time,
          eventType: isHand ? 'impact' : 'acceleration-burst',
          primaryBodyPart: `Node_${node.nodeIndex}`,
          affectedJointIndices: [node.nodeIndex],
          description: isHand
            ? `High-energy hand movement/impact strike (accel: ${Math.round(node.accelerationMagnitude)})`
            : `Acceleration burst on node ${node.nodeIndex} (${Math.round(node.accelerationMagnitude)} px/s²)`,
          magnitude: node.accelerationMagnitude,
          kinematicContext: {
            comVelocity: curFig.centerOfMass.velocity,
            supportType: curFig.supportState.supportType,
            secondaryMotionDetected: true,
          },
        });
      }
    }

    // 3. COM Apex Height Detection (flight phase direction reversal)
    if (prevFig.centerOfMass.velocity.y > 50 && curFig.centerOfMass.velocity.y <= 0) {
      events.push({
        id: `evt_${projectId}_${eventCounter++}`,
        projectId,
        frameIndex: f,
        timeSeconds: time,
        eventType: 'apex-height',
        primaryBodyPart: 'Center of Mass',
        description: 'COM reached trajectory apex',
        magnitude: curFig.centerOfMass.position.y,
        kinematicContext: {
          comVelocity: curFig.centerOfMass.velocity,
          supportType: curFig.supportState.supportType,
          secondaryMotionDetected: false,
        },
      });
    }

    // 4. Directional Change
    if (
      Math.sign(prevFig.centerOfMass.velocity.x) !== Math.sign(curFig.centerOfMass.velocity.x) &&
      Math.abs(curFig.centerOfMass.velocity.x) > 100
    ) {
      events.push({
        id: `evt_${projectId}_${eventCounter++}`,
        projectId,
        frameIndex: f,
        timeSeconds: time,
        eventType: 'directional-change',
        primaryBodyPart: 'Center of Mass',
        description: 'COM reversed horizontal direction',
        magnitude: Math.abs(curFig.centerOfMass.velocity.x),
        kinematicContext: {
          comVelocity: curFig.centerOfMass.velocity,
          supportType: curFig.supportState.supportType,
          secondaryMotionDetected: true,
        },
      });
    }

    // 5. Camera Shake
    if (cur.cameraState && cur.cameraState.shakeMagnitude > 50) {
      events.push({
        id: `evt_${projectId}_${eventCounter++}`,
        projectId,
        frameIndex: f,
        timeSeconds: time,
        eventType: 'camera-shake',
        primaryBodyPart: 'Camera',
        description: `Camera shake event detected (mag: ${Math.round(cur.cameraState.shakeMagnitude)})`,
        magnitude: cur.cameraState.shakeMagnitude,
        kinematicContext: {
          comVelocity: curFig.centerOfMass.velocity,
          supportType: curFig.supportState.supportType,
          secondaryMotionDetected: false,
        },
      });
    }
  }

  return events;
}

export function extractTimingSpacingProfile(
  events: SemanticMotionEvent[],
  totalFrames: number,
  fps: number = 24
): TimingSpacingProfile {
  let anticipationFrames = 0;
  let accelerationFrames = 0;
  let impactFrames = 0;
  let recoilFrames = 0;
  let recoveryFrames = 0;
  let holdFrames = 0;

  for (const evt of events) {
    if (evt.eventType === 'anticipation') anticipationFrames += 2;
    if (evt.eventType === 'acceleration-burst') accelerationFrames += 3;
    if (evt.eventType === 'impact') impactFrames += 2;
    if (evt.eventType === 'recoil' || evt.eventType === 'compression') recoilFrames += 3;
    if (evt.eventType === 'recovery' || evt.eventType === 'foot-contact') recoveryFrames += 4;
  }

  // Ensure default non-zero baseline
  if (anticipationFrames === 0) anticipationFrames = Math.max(1, Math.round(totalFrames * 0.1));
  if (accelerationFrames === 0) accelerationFrames = Math.max(2, Math.round(totalFrames * 0.25));
  if (impactFrames === 0) impactFrames = Math.max(1, Math.round(totalFrames * 0.1));
  if (recoilFrames === 0) recoilFrames = Math.max(1, Math.round(totalFrames * 0.15));
  if (recoveryFrames === 0) recoveryFrames = Math.max(2, Math.round(totalFrames * 0.3));

  let spacingProfile: TimingSpacingProfile['spacingProfile'] = 'ease-in-out';
  if (impactFrames > anticipationFrames) {
    spacingProfile = 'snap-and-settle';
  } else if (accelerationFrames > recoveryFrames) {
    spacingProfile = 'exponential-impact';
  }

  return {
    id: `profile_${Date.now().toString(36)}`,
    name: `Extracted Profile (${spacingProfile})`,
    anticipationFrames,
    accelerationFrames,
    impactFrames,
    recoilFrames,
    recoveryFrames,
    holdFrames,
    totalDurationFrames: totalFrames,
    spacingProfile,
  };
}
