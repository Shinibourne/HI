import { solveLegLimb } from '../src/lib/skills/kinematicsSolvers';
import { IK_STUDIO_GROUND_Y, enforceFootGroundPerimeter } from '../src/lib/physics/groundPerimeterSystem';

console.log('--- TEST 4: Angled Foot Ground Perimeter ---');
const rawLegUnplanted = solveLegLimb(240, 110, 310, 350, true, 0.55, false);
console.log(`Unplanted with ankleTargetY = 350 without foot offset:`);
console.log(`Ankle Y: ${rawLegUnplanted.ankleY.toFixed(2)}, FootTip Y: ${rawLegUnplanted.footTipY.toFixed(2)}`);
console.log(`FootTip penetration below 350: ${(rawLegUnplanted.footTipY - IK_STUDIO_GROUND_Y).toFixed(2)} px`);

const enforced = enforceFootGroundPerimeter(350, -25, 53.5, 0.55, IK_STUDIO_GROUND_Y);
console.log(`\nWith enforceFootGroundPerimeter:`);
console.log(`Clamped Ankle Y: ${enforced.clampedAnkleY.toFixed(2)}, Clamped FootTip Y: ${enforced.clampedFootTipY.toFixed(2)}, Penetration: ${enforced.penetrationDepthPx.toFixed(2)} px`);

const correctedLeg = solveLegLimb(240, 110, 310, enforced.clampedAnkleY, true, 0.55, false);
console.log(`Corrected Leg:`);
console.log(`Ankle Y: ${correctedLeg.ankleY.toFixed(2)}, FootTip Y: ${correctedLeg.footTipY.toFixed(2)}`);
console.log(`Max penetration: ${Math.max(0, correctedLeg.footTipY - IK_STUDIO_GROUND_Y, correctedLeg.ankleY - IK_STUDIO_GROUND_Y).toFixed(2)} px`);
