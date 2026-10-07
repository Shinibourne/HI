import { buildFinal24Frames } from './testFinalFlawless';
import { solveForwardKinematics17 } from '../src/lib/humanMotionSkills';

const frames = buildFinal24Frames();
for (const f of frames) {
  const fk = solveForwardKinematics17(f.charX, f.charY, f.angles, 0.5);
  const handDist = Math.hypot(fk[11].endX - f.ballX, fk[11].endY - f.ballY);
  if (['HELD', 'CAUGHT', 'DRIBBLE_RECEIVE'].includes(f.ballState)) {
    console.log(`F${f.frame} (${f.ballState}): hand=(${fk[11].endX.toFixed(1)}, ${fk[11].endY.toFixed(1)}), ball=(${f.ballX.toFixed(1)}, ${f.ballY.toFixed(1)}), dist=${handDist.toFixed(2)}, err=${Math.abs(handDist - 18).toFixed(2)}`);
  }
}
