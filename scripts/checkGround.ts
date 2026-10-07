import { buildCanonicalBasketballFrames } from '../src/lib/basketballChoreographyFrames';
import { solveForwardKinematics17 } from '../src/lib/humanMotionSkills';

const frames = buildCanonicalBasketballFrames();
const G = 755.0;

for (const f of frames) {
  if ([0, 1, 7, 12, 13, 14, 15, 16, 17, 19, 20, 23].includes(f.frame)) {
    const fk = solveForwardKinematics17(f.charX, f.charY, f.angles, 0.5);
    const errR = Math.abs(fk[3].endY - G);
    const errL = Math.abs(fk[6].endY - G);
    console.log(`F${f.frame}: errR=${errR.toFixed(3)}, errL=${errL.toFixed(3)} (RFootY=${fk[3].endY.toFixed(2)}, LFootY=${fk[6].endY.toFixed(2)})`);
  }
}
