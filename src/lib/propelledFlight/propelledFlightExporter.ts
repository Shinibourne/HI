import { STKNDS_PREFIX, gzipBytes, hexColorToArgbUint32 } from '../stknds/stkndsCore';
import { STICKFIGURE_PARENTS, STICKFIGURE_BONE_LENGTHS, STICKFIGURE_BONE_THICKNESS } from '../stknds/stickfigureStructure';
import { PropelledFlightGeneratorConfig } from './propelledFlightTypes';
import { buildAdjustedPropelledFlightFrames } from './propelledFlightGenerator';

export type { PropelledFlightGeneratorConfig };
export { buildAdjustedPropelledFlightFrames };

export async function synthesizePropelledFlightStknds(
  baseDecompressed27: Uint8Array,
  config: PropelledFlightGeneratorConfig
): Promise<Uint8Array> {
  const framesSpec = buildAdjustedPropelledFlightFrames(config);
  const nFrames = framesSpec.length;

  // Buffer layout: 2594 header + nFrames * 1197 + 41 trailer
  const totalByteLength = 2594 + nFrames * 1197 + 41;
  const buf = new Uint8Array(totalByteLength);
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  // Copy 0..2594 from baseDecompressed27 template
  buf.set(baseDecompressed27.slice(0, 2594), 0);

  // Set target FPS and frame count
  buf[30] = config.targetFps;
  dv.setInt32(2587, nFrames, false);

  const primaryArgb = hexColorToArgbUint32(config.primaryColorHex ?? '#1F2937');
  const headArgb = hexColorToArgbUint32(config.headColorHex ?? '#0284C7');

  // Update figure node colors
  const figOff = 1135;
  for (let i = 0; i < 17; i++) {
    const nOff = figOff + 12 + i * 84;
    const c = i === 13 ? headArgb : primaryArgb;
    dv.setUint32(nOff + 68, c, false);
  }

  // Extract Frame 0 template
  const frame0Template = baseDecompressed27.slice(2594, 2594 + 1197);
  const baseDv = new DataView(
    baseDecompressed27.buffer,
    baseDecompressed27.byteOffset,
    baseDecompressed27.byteLength
  );
  const defA2: number[] = [];
  const defA3: number[] = [];
  for (let i = 0; i < 17; i++) {
    const rOff0 = 2594 + 167 + i * 58;
    defA2.push(baseDv.getFloat32(rOff0 + 16, false));
    defA3.push(baseDv.getFloat32(rOff0 + 20, false));
  }

  for (let f = 0; f < nFrames; f++) {
    const spec = framesSpec[f];
    const fOff = 2594 + f * 1197;
    buf.set(frame0Template, fOff);

    // Set scale = 0.5f, sceneX, sceneY
    dv.setFloat32(fOff + 126, 0.5, false);
    dv.setFloat32(fOff + 130, spec.sceneX, false);
    dv.setFloat32(fOff + 134, spec.sceneY, false);

    for (let i = 0; i < 17; i++) {
      const rOff = fOff + 167 + i * 58;
      const p = STICKFIGURE_PARENTS[i];
      const relA1 =
        p === -1 ? spec.worldAngles[i] : spec.worldAngles[i] - spec.worldAngles[p];
      const nodeColor = i === 13 ? headArgb : primaryArgb;

      dv.setFloat32(rOff + 0, 1.0, false);
      dv.setFloat32(rOff + 4, STICKFIGURE_BONE_LENGTHS[i], false);
      dv.setInt32(rOff + 8, STICKFIGURE_BONE_THICKNESS[i], false);
      dv.setFloat32(rOff + 12, relA1, false);
      dv.setFloat32(rOff + 16, defA2[i], false);
      dv.setFloat32(rOff + 20, defA3[i], false);
      dv.setUint32(rOff + 24, nodeColor, false);
    }

    if (f < nFrames - 1) {
      buf[fOff + 1194] = 1;
      buf[fOff + 1195] = 1;
      buf[fOff + 1196] = 0;
    } else {
      buf[fOff + 1194] = 0;
      buf[fOff + 1195] = 0;
      buf[fOff + 1196] = 0;
    }
  }

  const trailer41 = baseDecompressed27.slice(2594 + 27 * 1197);
  buf.set(trailer41, 2594 + nFrames * 1197);

  const compressedPayload = await gzipBytes(buf);
  const finalStknds = new Uint8Array(STKNDS_PREFIX.length + compressedPayload.length);
  finalStknds.set(STKNDS_PREFIX, 0);
  finalStknds.set(compressedPayload, STKNDS_PREFIX.length);
  return finalStknds;
}
