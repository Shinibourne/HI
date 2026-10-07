import { solveLegLimb } from '../src/lib/humanMotionSkills';

// If F9=605, F10=605, F11=555, F12=512:
for (const y of [605, 555, 512]) {
  const lLeg = solveLegLimb(740, y, 705, 755, true, 0.5, true);
  const rLeg = solveLegLimb(740, y, 775, 755, true, 0.5, true);
  console.log(`y=${y}: LShin=${lLeg.shinAngleDeg.toFixed(1)}, RShin=${rLeg.shinAngleDeg.toFixed(1)}, LThigh=${lLeg.thighAngleDeg.toFixed(1)}, RThigh=${rLeg.thighAngleDeg.toFixed(1)}`);
}
