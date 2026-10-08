import { STICKFIGURE_BONE_LENGTHS } from '../stknds/stickfigureStructure';

export function solveNaturalLegIK(
  pelvisX: number,
  pelvisY: number,
  footX: number,
  footY = 755.0,
  facingRight = true
): { thighAngle: number; shinAngle: number; kneeX: number; kneeY: number } {
  const L1 = 127.5; // Thigh
  const L2 = 122.5; // Shin
  const maxReach = L1 + L2 - 1.5;

  const dx = footX - pelvisX;
  const dy = footY - pelvisY; // down in screen (+Y)
  const rawDist = Math.hypot(dx, dy);
  const D = Math.max(Math.abs(L1 - L2) + 2.0, Math.min(maxReach, rawDist));

  // Cartesian base angle (math Y is -dy)
  const baseAngleRad = Math.atan2(-dy, dx);

  const cosAlpha = (L1 * L1 + D * D - L2 * L2) / (2 * L1 * D);
  const alphaRad = Math.acos(Math.max(-1, Math.min(1, cosAlpha)));

  const cosBeta = (L1 * L1 + L2 * L2 - D * D) / (2 * L1 * L2);
  const betaRad = Math.acos(Math.max(-1, Math.min(1, cosBeta)));
  const gammaRad = Math.PI - betaRad; // interior bend angle

  let thighRad: number;
  let shinRad: number;

  if (facingRight) {
    // Knee must point forward (+X) and flex backward (-X)
    thighRad = baseAngleRad + alphaRad;
    shinRad = thighRad - gammaRad;
  } else {
    // Knee must point forward to left (-X) and flex backward to right (+X)
    thighRad = baseAngleRad - alphaRad;
    shinRad = thighRad + gammaRad;
  }

  const thighAngle = Math.round((thighRad * 180) / Math.PI);
  const shinAngle = Math.round((shinRad * 180) / Math.PI);

  const kneeX = pelvisX + Math.cos(thighRad) * L1;
  const kneeY = pelvisY - Math.sin(thighRad) * L1;

  return { thighAngle, shinAngle, kneeX, kneeY };
}

// Exported alias for compatibility
export const solveLegIK = solveNaturalLegIK;

// Grounded stance builder helpers
