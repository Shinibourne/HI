import { GeneralGeneratorConfig, buildGeneralPhysicsFrames } from './generalMotionGenerator';
import { STKNDS_PREFIX, gzipBytes } from '../stknds/stkndsCore';
import { STICKFIGURE_PARENTS, STICKFIGURE_BONE_LENGTHS, STICKFIGURE_BONE_THICKNESS } from '../stknds/stickfigureStructure';
import { hexColorToArgbUint32 } from '../basketball/basketballExporter';

/**
 * Binary Synthesizer for General-Purpose Procedural Physics Animations.
 * Encodes keyframes into a valid Stick Nodes v334 binary file with 2 figures:
 * Figure 1: Character (17-node articulated stickfigure)
 * Figure 2: Interactive Prop (Ball / Crate node)
 */
export async function synthesizeGeneralPhysicsStknds(
  baseDecompressed27: Uint8Array,
  config: GeneralGeneratorConfig
): Promise<Uint8Array> {
  const framesSpec = buildGeneralPhysicsFrames(config);
  const nFrames = framesSpec.length;

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
  const propArgb = hexColorToArgbUint32(config.objColorHex);

  let totalBytes = prefixHdr.length + ptrlTmpl.length;
  for (let f = 0; f < nFrames; f++) {
    totalBytes += fhdrTmpl.length + 2 * instTmpl.length + fftrTmpl.length;
  }

  const buf = new Uint8Array(totalBytes);
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  buf.set(prefixHdr, 0);
  buf[30] = config.targetFps;
  dv.setInt32(2587, nFrames, false);

  let cursor = prefixHdr.length;

  const writeCharInstance = (sx: number, sy: number, wAngles: number[]) => {
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

  const writePropInstance = (bx: number, by: number, present: boolean) => {
    buf.set(instTmpl, cursor);
    dv.setInt32(cursor + 0, 0, false);
    dv.setInt32(cursor + 4, 1, false);
    dv.setInt32(cursor + 8, 2, false); // Instance ID 2
    dv.setFloat32(cursor + 71, 0.5, false);
    dv.setFloat32(cursor + 75, bx, false);
    dv.setFloat32(cursor + 79, by, false);
    dv.setUint32(cursor + 83, propArgb, false);

    const propSize = present ? config.objRadius * 4.0 : 0.0;

    for (let i = 0; i < 17; i++) {
      const rOff = cursor + 112 + i * 58;
      if (i === 13) {
        // Node 13 is the Head Circle
        dv.setFloat32(rOff + 0, 1.0, false);
        dv.setFloat32(rOff + 4, propSize, false);
        dv.setInt32(rOff + 8, Math.round(propSize), false);
        dv.setFloat32(rOff + 12, 0.0, false);
        dv.setFloat32(rOff + 16, 0.0, false);
        dv.setFloat32(rOff + 20, 90.0, false);
        dv.setUint32(rOff + 24, propArgb, false);
      } else {
        dv.setFloat32(rOff + 0, 1.0, false);
        dv.setFloat32(rOff + 4, 0.0, false);
        dv.setInt32(rOff + 8, 0, false);
        dv.setFloat32(rOff + 12, 0.0, false);
        dv.setFloat32(rOff + 16, 0.0, false);
        dv.setFloat32(rOff + 20, 0.0, false);
        dv.setUint32(rOff + 24, propArgb, false);
      }
    }
    cursor += instTmpl.length;
  };

  for (let f = 0; f < nFrames; f++) {
    const spec = framesSpec[f];
    buf.set(fhdrTmpl, cursor);
    dv.setFloat32(cursor + 42, 1.0, false); // camZoom 1.0
    dv.setFloat32(cursor + 46, 0.0, false); // camX
    dv.setFloat32(cursor + 50, 0.0, false); // camY
    dv.setInt32(cursor + 54, 2, false); // 2 figure instances (Character + Interactive Prop)
    cursor += fhdrTmpl.length;

    writeCharInstance(spec.charX, spec.charY, spec.angles);
    writePropInstance(spec.objX, spec.objY, spec.objPresent);

    buf.set(fftrTmpl, cursor);
    cursor += fftrTmpl.length;
  }

  buf.set(ptrlTmpl, cursor);

  const gzipped = await gzipBytes(buf);
  const out = new Uint8Array(STKNDS_PREFIX.length + gzipped.length);
  out.set(STKNDS_PREFIX, 0);
  out.set(gzipped, STKNDS_PREFIX.length);
  return out;
}
