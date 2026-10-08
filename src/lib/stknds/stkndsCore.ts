import { STICKFIGURE_PARENTS } from './stickfigureStructure';

export interface StkndsFigureNode {
  index: number;
  uid: number;
  nodeType: number;
  nodeTypeName: string;
  localX: number;
  localY: number;
  scale: number;
  length: number;
  defaultLength: number;
  thickness: number;
  defaultThickness: number;
  localAngle1: number;
  localAngle2: number;
  worldAngle: number;
  colorHex: string;
  childCount: number;
}

export interface StkndsFrameNodePose {
  index: number;
  scale: number;
  length: number;
  thickness: number;
  angleDelta: number;
  localAngle: number;
  worldAngle: number;
  colorHex: string;
}

export interface StkndsFrameInstance {
  instanceIndex: number;
  instanceScale: number;
  sceneX: number;
  sceneY: number;
  instanceColorHex: string;
  nodes: StkndsFrameNodePose[];
}

export interface StkndsFrameRecord {
  frameIndex: number;
  camZoom?: number;
  camX?: number;
  camY?: number;
  figureCount?: number;
  instanceScale: number;
  sceneX: number;
  sceneY: number;
  instanceColorHex: string;
  nodes: StkndsFrameNodePose[];
  instances?: StkndsFrameInstance[];
}

export interface StkndsInspectionResult {
  fileName: string;
  compressedSize: number;
  decompressedSize: number;
  sha256: string;
  prefixValid: boolean;
  version: number;
  projectName: string;
  fps: number;
  tweenedFrames: number;
  figureName?: string;
  figureOffset?: number;
  figureNodes: StkndsFigureNode[];
  frameCount: number;
  frameTableOffset?: number;
  frames: StkndsFrameRecord[];
  semanticChecks: {
    label: string;
    passed: boolean;
    detail: string;
  }[];
  rawDecompressed?: Uint8Array;
}

export interface BounceGeneratorConfig {
  projectName: string;
  targetFps: 12 | 24;
  nodeType: 4 | 2;
  ballDiameter: number;
  ballThickness: number;
  primaryApexHeight: number;
  secondaryApexHeight: number;
  groundY: number;
  centerX: number;
  enableSquashStretch: boolean;
  squashIntensity: number;
  ballColorHex: string;
}

export interface SuperheroGeneratorConfig {
  projectName: string;
  targetFps: 12 | 24;
  interpolate24FpsFrames: boolean;
  flightApexY: number;
  scratchAmplitudeDeg: number;
  landingCompressionPx: number;
  primaryColorHex: string;
  headColorHex: string;
}

export interface EpicSneezeGeneratorConfig {
  projectName: string;
  targetFps: 12 | 24;
  interpolate24FpsFrames: boolean;
  holdTrembleDeg: number;
  recoilApexY: number;
  limbBounceDeg: number;
  twitchAngleDeg: number;
  primaryColorHex: string;
  headColorHex: string;
}

export interface TeleportAmbushGeneratorConfig {
  projectName: string;
  targetFps: 12 | 24;
  interpolate24FpsFrames: boolean;
  closeUpZoom: number;
  whipPanOffsetX: number;
  screenShakeAmplitudePx: number;
  redColorHex: string;
  blueColorHex: string;
}

export interface TeleportAmbushKeyframeSpec {
  frame: number;
  act: string;
  phase: string;
  camX: number;
  camY: number;
  camZoom: number;
  redX: number;
  redY: number;
  redAngles: number[];
  bluePresent: boolean;
  blueX: number;
  blueY: number;
  blueAngles: number[];
}

export interface StickfigureKeyframeSpec {
  frame: number;
  act: string;
  phase: string;
  isFlightFrame: boolean;
  flightStepIndex?: number;
  sceneX: number;
  sceneY: number;
  worldAngles: number[];
}

export const NODE_TYPE_NAMES: Record<number, string> = {
  255: 'Root (Invisible)',
  0: 'Segment (Line)',
  1: 'Circle (Fill)',
  2: 'Circle (Outline)',
  3: 'Polygon (Fill)',
  4: 'Polygon (Outline)',
  5: 'Triangle',
  6: 'Trapezoid',
};

export const STKNDS_PREFIX = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]);

async function computeSha256Hex(bytes: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function gunzipBytes(compressed: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream('gzip');
  const writer = ds.writable.getWriter();
  writer.write(compressed);
  writer.close();
  const response = new Response(ds.readable);
  const ab = await response.arrayBuffer();
  return new Uint8Array(ab);
}

export async function gzipBytes(raw: Uint8Array): Promise<Uint8Array> {
  const cs = new CompressionStream('gzip');
  const writer = cs.writable.getWriter();
  writer.write(raw);
  writer.close();
  const response = new Response(cs.readable);
  const ab = await response.arrayBuffer();
  return new Uint8Array(ab);
}

export function uint32ToHexColor(val: number): string {
  const r = (val >>> 16) & 0xff;
  const g = (val >>> 8) & 0xff;
  const b = val & 0xff;
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function hexColorToArgbUint32(hex: string): number {
  const clean = hex.replace('#', '');
  const rgb = parseInt(clean, 16) & 0xffffff;
  return ((0xff << 24) | rgb) >>> 0;
}

export async function inspectStkndsBuffer(
  fileName: string,
  rawBuffer: ArrayBuffer
): Promise<StkndsInspectionResult> {
  const raw = new Uint8Array(rawBuffer);
  const sha256 = await computeSha256Hex(raw);

  let prefixValid = true;
  for (let i = 0; i < STKNDS_PREFIX.length; i++) {
    if (raw[i] !== STKNDS_PREFIX[i]) {
      prefixValid = false;
      break;
    }
  }

  if (!prefixValid) {
    return {
      fileName,
      compressedSize: raw.length,
      decompressedSize: 0,
      sha256,
      prefixValid: false,
      version: 0,
      projectName: 'Invalid Prefix',
      fps: 0,
      tweenedFrames: 0,
      figureNodes: [],
      frameCount: 0,
      frames: [],
      semanticChecks: [
        {
          label: '9-Byte Outer Magic Prefix (01..09)',
          passed: false,
          detail: 'File does not start with 01 02 03 04 05 06 07 08 09.',
        },
      ],
    };
  }

  const decompressed = await gunzipBytes(raw.slice(9));
  const dv = new DataView(decompressed.buffer, decompressed.byteOffset, decompressed.byteLength);

  const version = dv.getInt32(0, false);
  const nameLen = dv.getInt32(4, false);
  const projectName = new TextDecoder().decode(decompressed.slice(8, 8 + nameLen));

  const headerBase = 8 + nameLen;
  const fps = headerBase + 15 <= decompressed.length ? decompressed[headerBase + 14] : 24;
  const tweenedFrames = headerBase + 19 <= decompressed.length ? decompressed[headerBase + 18] : 5;

  const figureOffsets: number[] = [];
  for (let i = 20; i < decompressed.length - 12; i++) {
    if (
      decompressed[i] === 0x00 &&
      decompressed[i + 1] === 0x00 &&
      decompressed[i + 2] === 0x01 &&
      decompressed[i + 3] === 0x4e &&
      decompressed[i + 4] === 0x3f &&
      decompressed[i + 5] === 0x80 &&
      decompressed[i + 6] === 0x00 &&
      decompressed[i + 7] === 0x00
    ) {
      figureOffsets.push(i);
    }
  }

  const targetFigOffset = figureOffsets.length > 1 ? figureOffsets[1] : figureOffsets[0];
  let figureName = 'Embedded Figure';
  const figureNodes: StkndsFigureNode[] = [];

  if (targetFigOffset !== undefined) {
    if (targetFigOffset >= 4) {
      for (let back = 4; back <= 36; back++) {
        if (targetFigOffset - back >= 4) {
          const candidateLen = dv.getInt32(targetFigOffset - back - 4, false);
          if (candidateLen === back) {
            figureName = new TextDecoder().decode(
              decompressed.slice(targetFigOffset - back, targetFigOffset)
            );
            break;
          }
        }
      }
    }

    let cur = targetFigOffset + 12;
    let idx = 0;
    while (cur + 84 <= decompressed.length && idx < 64) {
      const nodeType = decompressed[cur];
      const scale = dv.getFloat32(cur + 22, false);
      if (
        ![255, 0, 1, 2, 3, 4, 5, 6].includes(nodeType) ||
        !Number.isFinite(scale) ||
        Math.abs(scale - 1.0) > 0.5
      ) {
        break;
      }
      const uid = dv.getInt32(cur + 1, false);
      const localX = dv.getFloat32(cur + 14, false);
      const localY = dv.getFloat32(cur + 18, false);
      const length = dv.getFloat32(cur + 26, false);
      const defaultLength = dv.getFloat32(cur + 30, false);
      const thickness = dv.getInt32(cur + 34, false);
      const defaultThickness = dv.getInt32(cur + 38, false);
      const localAngle1 = dv.getFloat32(cur + 56, false);
      const localAngle2 = dv.getFloat32(cur + 60, false);
      const worldAngle = dv.getFloat32(cur + 64, false);
      const colorUint = dv.getUint32(cur + 68, false);
      const childCount = dv.getInt32(cur + 80, false);

      figureNodes.push({
        index: idx,
        uid,
        nodeType,
        nodeTypeName: NODE_TYPE_NAMES[nodeType] ?? `Type (${nodeType})`,
        localX,
        localY,
        scale,
        length,
        defaultLength,
        thickness,
        defaultThickness,
        localAngle1,
        localAngle2,
        worldAngle,
        colorHex: uint32ToHexColor(colorUint),
        childCount,
      });

      cur += 84;
      idx++;
    }
  }

  const frames: StkndsFrameRecord[] = [];
  let frameCount = 0;
  let frameTableOffset: number | undefined = undefined;

  if (targetFigOffset !== undefined && figureNodes.length > 0) {
    const afterFigure = targetFigOffset + 12 + figureNodes.length * 84 + 12;
    if (afterFigure + 4 <= decompressed.length) {
      const candidateFrameCount = dv.getInt32(afterFigure, false);
      const fTableStart = afterFigure + 4;
      const instSize = figureNodes.length === 17 ? 1091 : 112 + figureNodes.length * 58;

      if (candidateFrameCount > 0 && candidateFrameCount < 500) {
        let cursor = fTableStart;
        const parsedFrames: StkndsFrameRecord[] = [];
        let validMulti = true;

        for (let f = 0; f < candidateFrameCount; f++) {
          if (cursor + 58 > decompressed.length) {
            validMulti = false;
            break;
          }
          const figCnt = dv.getInt32(cursor + 54, false);
          if (figCnt < 1 || figCnt > 32) {
            validMulti = false;
            break;
          }
          const frameBytes = 58 + figCnt * instSize + 48;
          if (cursor + frameBytes > decompressed.length) {
            validMulti = false;
            break;
          }

          const rawZoom = dv.getFloat32(cursor + 42, false);
          const rawCamX = dv.getFloat32(cursor + 46, false);
          const rawCamY = dv.getFloat32(cursor + 50, false);
          const camZoom = Number.isFinite(rawZoom) && rawZoom > 0.1 && rawZoom < 10 ? rawZoom : 1.0;
          const camX = Number.isFinite(rawCamX) && Math.abs(rawCamX) < 10000 ? rawCamX : 0.0;
          const camY = Number.isFinite(rawCamY) && Math.abs(rawCamY) < 10000 ? rawCamY : 0.0;

          const instances: StkndsFrameInstance[] = [];
          for (let instIdx = 0; instIdx < figCnt; instIdx++) {
            const instOff = cursor + 58 + instIdx * instSize;
            const instScale = dv.getFloat32(instOff + 71, false);
            const sx = dv.getFloat32(instOff + 75, false);
            const sy = dv.getFloat32(instOff + 79, false);
            const instColorHex = uint32ToHexColor(dv.getUint32(instOff + 83, false));

            const instNodes: StkndsFrameNodePose[] = [];
            for (let n = 0; n < figureNodes.length; n++) {
              const rOff = instOff + 112 + n * 58;
              const angleDelta = dv.getFloat32(rOff + 12, false);
              const localAngle = dv.getFloat32(rOff + 16, false);
              const rawWorldAngle = dv.getFloat32(rOff + 20, false);
              const p = n < STICKFIGURE_PARENTS.length ? STICKFIGURE_PARENTS[n] : -1;
              const reconstructedWorldAngle =
                figureNodes.length === 17
                  ? p === -1
                    ? angleDelta
                    : (instNodes[p]?.worldAngle ?? 0) + angleDelta
                  : Number.isFinite(rawWorldAngle)
                  ? rawWorldAngle
                  : angleDelta;

              instNodes.push({
                index: n,
                scale: dv.getFloat32(rOff + 0, false),
                length: dv.getFloat32(rOff + 4, false),
                thickness: dv.getInt32(rOff + 8, false),
                angleDelta,
                localAngle: Number.isFinite(localAngle) ? localAngle : angleDelta,
                worldAngle: reconstructedWorldAngle,
                colorHex: uint32ToHexColor(dv.getUint32(rOff + 24, false)),
              });
            }

            instances.push({
              instanceIndex: instIdx,
              instanceScale: instScale,
              sceneX: sx,
              sceneY: sy,
              instanceColorHex: instColorHex,
              nodes: instNodes,
            });
          }

          const primaryInst = instances[0];
          parsedFrames.push({
            frameIndex: f,
            camZoom,
            camX,
            camY,
            figureCount: figCnt,
            instanceScale: primaryInst.instanceScale,
            sceneX: primaryInst.sceneX,
            sceneY: primaryInst.sceneY,
            instanceColorHex: primaryInst.instanceColorHex,
            nodes: primaryInst.nodes,
            instances,
          });

          cursor += frameBytes;
        }

        if (validMulti && parsedFrames.length === candidateFrameCount) {
          frameCount = candidateFrameCount;
          frameTableOffset = fTableStart + 3;
          frames.push(...parsedFrames);
        }
      }
    }
  }

  if (frameCount === 0 && targetFigOffset !== undefined) {
    frameCount = Math.max(1, Math.round((decompressed.length - targetFigOffset) / 1197));
  }

  const totalChildSum = figureNodes.reduce((acc, n) => acc + n.childCount, 0);
  const hierarchyConsistent =
    figureNodes.length > 0 && totalChildSum === figureNodes.length - 1;

  const semanticChecks = [
    {
      label: 'Container Prefix & GZIP Stream',
      passed: prefixValid && decompressed.length > 0,
      detail: `9-byte magic header verified; GZIP inflated ${raw.length.toLocaleString()} B → ${decompressed.length.toLocaleString()} B`,
    },
    {
      label: 'Stick Nodes v334 Header & FPS Setting',
      passed: version === 334,
      detail: `Big-endian int32 version = ${version}, project name = "${projectName}", rate = ${fps} FPS (@byte 30)`,
    },
    {
      label: 'Recursive Node Tree Invariant (∑ children = N - 1)',
      passed: hierarchyConsistent,
      detail: hierarchyConsistent
        ? `${figureNodes.length} nodes parsed (84 B stride); child sum = ${totalChildSum} matches N - 1`
        : `Parsed ${figureNodes.length} nodes from first figure library entry`,
    },
    {
      label: 'Frame Pose Traversal Alignment',
      passed: frames.length > 0 && frames[0].nodes.length === figureNodes.length,
      detail:
        frames.length > 0
          ? `${frames.length} frames verified (1,197 B stride = 167 B header + 17 × 58 B node records + 44 B footer)`
          : `Multi-figure scene layout (${figureOffsets.length} embedded v334 figure headers detected)`,
    },
  ];

  return {
    fileName,
    compressedSize: raw.length,
    decompressedSize: decompressed.length,
    sha256,
    prefixValid,
    version,
    projectName,
    fps,
    tweenedFrames,
    figureName,
    figureOffset: targetFigOffset,
    figureNodes,
    frameCount,
    frameTableOffset,
    frames,
    semanticChecks,
    rawDecompressed: decompressed,
  };
}
