import { buildCanonicalParkourFrames } from '../src/lib/parkourAcrobatFrames';
import { buildCanonicalSitWalkKickFrames } from '../src/lib/sitWalkKickBallFrames';
import { solveForwardKinematics17 } from '../src/lib/skills/kinematicsSolvers';

console.log('--- DIAGNOSING PARKOUR FEET ---');
const parkour = buildCanonicalParkourFrames({ targetFps: 24 });
for (let f = 0; f < parkour.length; f++) {
  const spec = parkour[f];
  const joints = solveForwardKinematics17(spec.manX, spec.manY, spec.manAngles, 0.5);
  const rFoot = Math.max(joints[3].startY, joints[3].endY);
  const lFoot = Math.max(joints[6].startY, joints[6].endY);
  const maxFoot = Math.max(rFoot, lFoot);
  if (maxFoot > 755.5) {
    console.log(`Parkour F${f} (${spec.act} - ${spec.phase}): maxFoot=${maxFoot.toFixed(1)}, manY=${spec.manY.toFixed(1)}, rot=${spec.bodyRotationDeg}°`);
  }
}

console.log('\n--- DIAGNOSING SIT WALK KICK FEET ---');
const stroll = buildCanonicalSitWalkKickFrames({ targetFps: 24 });
for (let f = 0; f < stroll.length; f++) {
  const spec = stroll[f];
  const joints = solveForwardKinematics17(spec.manX, spec.manY, spec.manAngles, 0.5);
  const rFoot = Math.max(joints[3].startY, joints[3].endY);
  const lFoot = Math.max(joints[6].startY, joints[6].endY);
  const maxFoot = Math.max(rFoot, lFoot);
  if (maxFoot > 755.5) {
    console.log(`StrollKick F${f} (${spec.act} - ${spec.phase}): maxFoot=${maxFoot.toFixed(1)}, manY=${spec.manY.toFixed(1)}`);
  }
}
