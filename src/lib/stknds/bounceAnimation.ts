import { BounceGeneratorConfig } from './stkndsCore';
import { STKNDS_PREFIX, gzipBytes, hexColorToArgbUint32 } from './stkndsCore';

export const CANONICAL_22_FRAME_PHASES: {
  frame: number;
  normY: number;
  phase: string;
  squashFactor: number;
}[] = [
  { frame: 0, normY: 0, phase: 'Phase 1: Contact (Ground)', squashFactor: 0.80 },
  { frame: 1, normY: -18, phase: 'Phase 2: Launch Impulse', squashFactor: 1.15 },
  { frame: 2, normY: -42, phase: 'Phase 2: Launch Acceleration', squashFactor: 1.11 },
  { frame: 3, normY: -70, phase: 'Phase 3: Primary Ascent', squashFactor: 1.06 },
  { frame: 4, normY: -96, phase: 'Phase 3: Primary Ascent', squashFactor: 1.02 },
  { frame: 5, normY: -115, phase: 'Phase 3: Decelerating Ascent', squashFactor: 1.00 },
  { frame: 6, normY: -126, phase: 'Phase 4: Primary Apex Approach', squashFactor: 0.99 },
  { frame: 7, normY: -130, phase: 'Phase 4: Primary Apex Peak', squashFactor: 1.00 },
  { frame: 8, normY: -126, phase: 'Phase 4: Primary Apex Hang', squashFactor: 1.00 },
  { frame: 9, normY: -112, phase: 'Phase 5: Primary Descent', squashFactor: 1.02 },
  { frame: 10, normY: -90, phase: 'Phase 5: Primary Descent', squashFactor: 1.05 },
  { frame: 11, normY: -62, phase: 'Phase 5: Accelerating Fall', squashFactor: 1.10 },
  { frame: 12, normY: -30, phase: 'Phase 5: Pre-Impact Stretch', squashFactor: 1.16 },
  { frame: 13, normY: 0, phase: 'Phase 6: Ground Impact Squash', squashFactor: 0.76 },
  { frame: 14, normY: -42, phase: 'Phase 7: Secondary Rebound Launch', squashFactor: 1.13 },
  { frame: 15, normY: -70, phase: 'Phase 7: Secondary Ascent', squashFactor: 1.05 },
  { frame: 16, normY: -84, phase: 'Phase 7: Secondary Apex Approach', squashFactor: 1.01 },
  { frame: 17, normY: -88, phase: 'Phase 7: Secondary Apex Peak', squashFactor: 1.00 },
  { frame: 18, normY: -82, phase: 'Phase 7: Secondary Descent', squashFactor: 1.01 },
  { frame: 19, normY: -64, phase: 'Phase 7: Secondary Fall', squashFactor: 1.05 },
  { frame: 20, normY: -34, phase: 'Phase 7: Pre-Settle Fall', squashFactor: 1.09 },
  { frame: 21, normY: 0, phase: 'Phase 8: Final Contact Settle', squashFactor: 1.00 },
];

export async function synthesizeBounceStknds(
  baseDecompressed: Uint8Array,
  config: BounceGeneratorConfig
): Promise<Uint8Array> {
  const buf = new Uint8Array(baseDecompressed);
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  // Set target FPS (12 or 24) at byte 30
  buf[30] = config.targetFps;

  const figOff = 1135;
  const argbColor = hexColorToArgbUint32(config.ballColorHex);

  for (let i = 0; i < 17; i++) {
    const nOff = figOff + 12 + i * 84;
    if (i === 13) {
      buf[nOff] = config.nodeType;
      dv.setFloat32(nOff + 14, 0.0, false);
      dv.setFloat32(nOff + 18, 0.0, false);
      dv.setFloat32(nOff + 22, 1.0, false);
      dv.setFloat32(nOff + 26, config.ballDiameter, false);
      dv.setFloat32(nOff + 30, config.ballDiameter, false);
      dv.setInt32(nOff + 34, config.ballThickness, false);
      dv.setInt32(nOff + 38, config.ballThickness, false);
      dv.setFloat32(nOff + 56, 0.0, false);
      dv.setFloat32(nOff + 60, 0.0, false);
      dv.setFloat32(nOff + 64, 90.0, false);
      dv.setUint32(nOff + 68, argbColor, false);
      dv.setUint32(nOff + 72, argbColor, false);
      dv.setUint32(nOff + 76, argbColor, false);
    } else {
      if (i !== 0) {
        buf[nOff] = 0;
      }
      dv.setFloat32(nOff + 14, 0.0, false);
      dv.setFloat32(nOff + 18, 0.0, false);
      dv.setFloat32(nOff + 22, 1.0, false);
      dv.setFloat32(nOff + 26, 0.0, false);
      dv.setFloat32(nOff + 30, 0.0, false);
      dv.setInt32(nOff + 34, 0, false);
      dv.setInt32(nOff + 38, 0, false);
      dv.setFloat32(nOff + 56, 0.0, false);
      dv.setFloat32(nOff + 60, 0.0, false);
      dv.setFloat32(nOff + 64, 0.0, false);
    }
  }

  for (let f = 0; f < 22; f++) {
    const fOff = 2594 + f * 1197;
    const phaseInfo = CANONICAL_22_FRAME_PHASES[f];
    const isSecondBounce = f >= 14 && f <= 20;
    const normPeak = isSecondBounce ? 88 : 130;
    const targetApex = isSecondBounce ? config.secondaryApexHeight : config.primaryApexHeight;

    const verticalOffset = (phaseInfo.normY / normPeak) * targetApex;
    const sceneY = config.groundY + verticalOffset;

    dv.setFloat32(fOff + 126, 1.0, false);
    dv.setFloat32(fOff + 130, config.centerX, false);
    dv.setFloat32(fOff + 134, sceneY, false);

    for (let i = 0; i < 17; i++) {
      const rOff = fOff + 167 + i * 58;
      if (i === 13) {
        const rawSq = phaseInfo.squashFactor;
        const blendedSq = config.enableSquashStretch
          ? 1.0 + (rawSq - 1.0) * config.squashIntensity
          : 1.0;
        const frameDiameter = config.ballDiameter * blendedSq;
        const frameThickness = Math.max(2, Math.round(config.ballThickness / blendedSq));

        dv.setFloat32(rOff + 0, 1.0, false);
        dv.setFloat32(rOff + 4, frameDiameter, false);
        dv.setInt32(rOff + 8, frameThickness, false);
        dv.setFloat32(rOff + 12, 0.0, false);
        dv.setFloat32(rOff + 16, 0.0, false);
        dv.setFloat32(rOff + 20, 90.0, false);
        dv.setUint32(rOff + 24, argbColor, false);
        dv.setUint32(rOff + 28, argbColor, false);
        dv.setUint32(rOff + 32, argbColor, false);
      } else {
        dv.setFloat32(rOff + 0, 1.0, false);
        dv.setFloat32(rOff + 4, 0.0, false);
        dv.setInt32(rOff + 8, 0, false);
        dv.setFloat32(rOff + 12, 0.0, false);
        dv.setFloat32(rOff + 16, 0.0, false);
        dv.setFloat32(rOff + 20, 0.0, false);
      }
    }
  }

  const compressedPayload = await gzipBytes(buf);
  const finalStknds = new Uint8Array(STKNDS_PREFIX.length + compressedPayload.length);
  finalStknds.set(STKNDS_PREFIX, 0);
  finalStknds.set(compressedPayload, STKNDS_PREFIX.length);
  return finalStknds;
}
