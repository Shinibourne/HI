import { solveLegLimb } from '../src/lib/humanMotionSkills';

const G = 755.0;
// Stance feet at x=775 and x=705, y=755.0
for (const cy of [620, 625, 630, 635, 640, 645, 650]) {
  const rL = solveLegLimb(740, cy, 775, G, true, 0.5, true);
  const lL = solveLegLimb(740, cy, 705, G, true, 0.5, true);
  const rFlex = Math.abs(rL.shinAngleDeg - rL.thighAngleDeg);
  const lFlex = Math.abs(lL.shinAngleDeg - lL.thighAngleDeg);
  console.log(`cy=${cy}: rFlex=${rFlex.toFixed(1)}°, lFlex=${lFlex.toFixed(1)}°, rShin=${rL.shinAngleDeg.toFixed(1)}, lShin=${lL.shinAngleDeg.toFixed(1)}`);
}
