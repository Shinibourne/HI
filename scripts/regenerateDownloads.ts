import fs from 'node:fs';
import {
  inspectStkndsBuffer,
  synthesizeTeleportStknds,
  synthesizeSneezeStknds,
  synthesizeSuperheroStknds,
} from '../src/lib/stkndsCodec';

async function main() {
  const compressed27 = fs.readFileSync('public/templates/rpoject5.stknds');
  const ab = compressed27.buffer.slice(
    compressed27.byteOffset,
    compressed27.byteOffset + compressed27.byteLength
  );
  const parsed27 = await inspectStkndsBuffer('rpoject5.stknds', ab);
  if (!parsed27.rawDecompressed) {
    throw new Error('Failed to decompress rpoject5.stknds');
  }
  const raw27 = parsed27.rawDecompressed;

  // 1. Teleport Ambush (12 FPS 36f, 24 FPS 36f, 24 FPS 71f baked)
  const tele12 = await synthesizeTeleportStknds(raw27, {
    projectName: 'teleport_ambush',
    targetFps: 12,
    interpolate24FpsFrames: false,
    closeUpZoom: 2.35,
    whipPanOffsetX: 124,
    screenShakeAmplitudePx: 20,
    redColorHex: '#DC2626',
    blueColorHex: '#2563EB',
  });
  fs.writeFileSync('public/downloads/teleport_ambush_12fps.stknds', tele12);

  const tele24 = await synthesizeTeleportStknds(raw27, {
    projectName: 'teleport_ambush',
    targetFps: 24,
    interpolate24FpsFrames: false,
    closeUpZoom: 2.35,
    whipPanOffsetX: 124,
    screenShakeAmplitudePx: 20,
    redColorHex: '#DC2626',
    blueColorHex: '#2563EB',
  });
  fs.writeFileSync('public/downloads/teleport_ambush_24fps.stknds', tele24);

  const tele24Baked = await synthesizeTeleportStknds(raw27, {
    projectName: 'teleport_ambush',
    targetFps: 24,
    interpolate24FpsFrames: true,
    closeUpZoom: 2.35,
    whipPanOffsetX: 124,
    screenShakeAmplitudePx: 20,
    redColorHex: '#DC2626',
    blueColorHex: '#2563EB',
  });
  fs.writeFileSync('public/downloads/teleport_ambush_24fps_71f.stknds', tele24Baked);

  // 2. Epic Sneeze (12 FPS 36f, 24 FPS 36f, 24 FPS 71f baked)
  const sneeze12 = await synthesizeSneezeStknds(raw27, {
    projectName: 'epic_sneeze',
    targetFps: 12,
    interpolate24FpsFrames: false,
    holdTrembleDeg: 6,
    recoilApexY: 218,
    limbBounceDeg: 36,
    twitchAngleDeg: 28,
    primaryColorHex: '#1F2937',
    headColorHex: '#0284C7',
  });
  fs.writeFileSync('public/downloads/epic_sneeze_12fps.stknds', sneeze12);

  const sneeze24 = await synthesizeSneezeStknds(raw27, {
    projectName: 'epic_sneeze',
    targetFps: 24,
    interpolate24FpsFrames: false,
    holdTrembleDeg: 6,
    recoilApexY: 218,
    limbBounceDeg: 36,
    twitchAngleDeg: 28,
    primaryColorHex: '#1F2937',
    headColorHex: '#0284C7',
  });
  fs.writeFileSync('public/downloads/epic_sneeze_24fps.stknds', sneeze24);

  const sneeze24Baked = await synthesizeSneezeStknds(raw27, {
    projectName: 'epic_sneeze',
    targetFps: 24,
    interpolate24FpsFrames: true,
    holdTrembleDeg: 6,
    recoilApexY: 218,
    limbBounceDeg: 36,
    twitchAngleDeg: 28,
    primaryColorHex: '#1F2937',
    headColorHex: '#0284C7',
  });
  fs.writeFileSync('public/downloads/epic_sneeze_24fps_71f.stknds', sneeze24Baked);

  // 3. Walk, Scratch & Sky Flight (12 FPS 27f, 24 FPS 27f, 24 FPS 53f baked)
  const hero12 = await synthesizeSuperheroStknds(raw27, {
    projectName: 'walk_scratch_fly_superhero',
    targetFps: 12,
    interpolate24FpsFrames: false,
    flightApexY: 144,
    scratchAmplitudeDeg: 18,
    landingCompressionPx: 12,
    primaryColorHex: '#1F2937',
    headColorHex: '#0284C7',
  });
  fs.writeFileSync('public/downloads/walk_scratch_fly_superhero_12fps.stknds', hero12);

  const hero24 = await synthesizeSuperheroStknds(raw27, {
    projectName: 'walk_scratch_fly_superhero',
    targetFps: 24,
    interpolate24FpsFrames: false,
    flightApexY: 144,
    scratchAmplitudeDeg: 18,
    landingCompressionPx: 12,
    primaryColorHex: '#1F2937',
    headColorHex: '#0284C7',
  });
  fs.writeFileSync('public/downloads/walk_scratch_fly_superhero_24fps.stknds', hero24);

  const hero24Baked = await synthesizeSuperheroStknds(raw27, {
    projectName: 'walk_scratch_fly_superhero',
    targetFps: 24,
    interpolate24FpsFrames: true,
    flightApexY: 144,
    scratchAmplitudeDeg: 18,
    landingCompressionPx: 12,
    primaryColorHex: '#1F2937',
    headColorHex: '#0284C7',
  });
  fs.writeFileSync('public/downloads/walk_scratch_fly_superhero_24fps_53f.stknds', hero24Baked);

  console.log('Successfully regenerated all 9 .stknds binaries in public/downloads/!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
