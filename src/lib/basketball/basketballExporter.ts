import { BasketballGeneratorConfig } from './basketballTypes';
import { STKNDS_PREFIX, gzipBytes } from '../stknds/stkndsCore';
import { STICKFIGURE_PARENTS, STICKFIGURE_BONE_LENGTHS, STICKFIGURE_BONE_THICKNESS } from '../stknds/stickfigureStructure';
import { buildCanonicalBasketballFrames } from './basketballGenerator';

export function hexColorToArgbUint32(hex: string): number {
  const clean = hex.replace('#', '');
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return ((255 << 24) | (r << 16) | (g << 8) | b) >>> 0;
  }
  return 0xff000000;
}

/**
 * Binary Synthesizer for Basketball Walk, Pickup & Dribble Animation.
 * Encodes the 24 frames into a valid Stick Nodes v334 binary file with 2 figures:
 * Figure 1: The Man (17-node stickfigure)
 * Figure 2: The Basketball (Node 13 Circle with diameter 72px at scale 0.5 = 36px / radius 18px)
 */
export async function synthesizeBasketballStknds(
  baseDecompressed27: Uint8Array,
  config: BasketballGeneratorConfig
): Promise<Uint8Array> {
  const framesSpec = buildCanonicalBasketballFrames(config);
  const nFrames = framesSpec.length; // 24 frames

  const prefixHdr = baseDecompressed27.slice(0, 2591);
  const fhdrTmpl = baseDecompressed27.slice(2591, 2649);
  const instTmpl = baseDecompressed27.slice(2649, 3740);
  const fftrTmpl = baseDecompressed27.slice(3740, 3788);
  const ptrlTmpl = baseDecompressed27.slice(34910, 34954);

  const baseDv = new DataView(
    baseDecompressed27.buffer,
    baseDecompressed27.byteOffset,
    baseDecompressed27.byteLength
  );
  const defA2: number[] = [];
  const defA3: number[] = [];
  for (let i = 0; i < 17; i++) {
    const off = 1231 + i * 84;
    defA2.push(baseDv.getFloat32(off + 28, false));
    defA3.push(baseDv.getFloat32(off + 32, false));
  }

  const charArgb = hexColorToArgbUint32(config.charColorHex);
  const ballArgb = hexColorToArgbUint32(config.ballColorHex);

  let totalBytes = prefixHdr.length + ptrlTmpl.length;
  for (let f = 0; f < nFrames; f++) {
    totalBytes += fhdrTmpl.length + 2 * instTmpl.length + fftrTmpl.length;
  }

  const buf = new Uint8Array(totalBytes);
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  buf.set(prefixHdr, 0);
  buf[30] = config.targetFps; // 24 FPS
  dv.setInt32(2587, nFrames, false); // 24 frames

  let cursor = prefixHdr.length;

  const writeManInstance = (sx: number, sy: number, wAngles: number[]) => {
    buf.set(instTmpl, cursor);
    dv.setInt32(cursor + 0, 0, false);
    dv.setInt32(cursor + 4, 1, false);
    dv.setInt32(cursor + 8, 1, false); // Instance ID 1
    dv.setFloat32(cursor + 71, 0.5, false); // Scale: 0.50x
    dv.setFloat32(cursor + 75, sx, false); // Scene X
    dv.setFloat32(cursor + 79, sy, false); // Scene Y
    dv.setUint32(cursor + 83, charArgb, false);

    for (let i = 0; i < 17; i++) {
      const rOff = cursor + 112 + i * 58;
      const p = STICKFIGURE_PARENTS[i];
      const relA1 = p === -1 ? wAngles[i] : wAngles[i] - wAngles[p];

      dv.setFloat32(rOff + 0, 1.0, false);
      dv.setFloat32(rOff + 4, STICKFIGURE_BONE_LENGTHS[i], false);
      dv.setInt32(rOff + 8, STICKFIGURE_BONE_THICKNESS[i], false);
      dv.setFloat32(rOff + 12, relA1, false);
      dv.setFloat32(rOff + 16, defA2[i], false);
      dv.setFloat32(rOff + 20, defA3[i], false);
      dv.setUint32(rOff + 24, charArgb, false);
    }
    cursor += instTmpl.length;
  };

  const writeBallInstance = (bx: number, by: number) => {
    buf.set(instTmpl, cursor);
    dv.setInt32(cursor + 0, 0, false);
    dv.setInt32(cursor + 4, 1, false);
    dv.setInt32(cursor + 8, 2, false); // Instance ID 2
    dv.setFloat32(cursor + 71, 0.5, false); // Scale: 0.50x
    dv.setFloat32(cursor + 75, bx, false); // Scene X
    dv.setFloat32(cursor + 79, by, false); // Scene Y
    dv.setUint32(cursor + 83, ballArgb, false);

    for (let i = 0; i < 17; i++) {
      const rOff = cursor + 112 + i * 58;
      if (i === 13) {
        // Node 13 is the Head Circle in MyBase
        // Length 72.0 at scale 0.5 = 36.0 px diameter (radius 18.0 px)
        dv.setFloat32(rOff + 0, 1.0, false);
        dv.setFloat32(rOff + 4, 72.0, false);
        dv.setInt32(rOff + 8, 72, false);
        dv.setFloat32(rOff + 12, 0.0, false);
        dv.setFloat32(rOff + 16, 0.0, false);
        dv.setFloat32(rOff + 20, 90.0, false);
        dv.setUint32(rOff + 24, ballArgb, false);
      } else {
        dv.setFloat32(rOff + 0, 1.0, false);
        dv.setFloat32(rOff + 4, 0.0, false);
        dv.setInt32(rOff + 8, 0, false);
        dv.setFloat32(rOff + 12, 0.0, false);
        dv.setFloat32(rOff + 16, 0.0, false);
        dv.setFloat32(rOff + 20, 0.0, false);
        dv.setUint32(rOff + 24, ballArgb, false);
      }
    }
    cursor += instTmpl.length;
  };

  for (let f = 0; f < nFrames; f++) {
    const spec = framesSpec[f];
    buf.set(fhdrTmpl, cursor);
    dv.setFloat32(cursor + 42, spec.camZoom, false);
    dv.setFloat32(cursor + 46, spec.camX, false);
    dv.setFloat32(cursor + 50, spec.camY, false);
    dv.setInt32(cursor + 54, 2, false); // 2 figure instances per frame
    cursor += fhdrTmpl.length;

    writeManInstance(spec.charX, spec.charY, spec.angles);
    writeBallInstance(spec.ballX, spec.ballY);

    buf.set(fftrTmpl, cursor);
    cursor += fftrTmpl.length;
  }

  buf.set(ptrlTmpl, cursor);

  const compressedPayload = await gzipBytes(buf);
  const finalStknds = new Uint8Array(STKNDS_PREFIX.length + compressedPayload.length);
  finalStknds.set(STKNDS_PREFIX, 0);
  finalStknds.set(compressedPayload, STKNDS_PREFIX.length);
  return finalStknds;
}
