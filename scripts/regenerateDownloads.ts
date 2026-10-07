import fs from 'node:fs';
import {
  inspectStkndsBuffer,
  synthesizeTeleportStknds,
  synthesizeSneezeStknds,
  synthesizeSuperheroStknds,
  synthesizeSpeedStrengthStknds,
  synthesizePhantomShadowboxStknds,
} from '../src/lib/stkndsCodec';
import { synthesizeSitWalkKickStknds } from '../src/lib/sitWalkKickBallFrames';

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

  // 4. Speed vs Strength (12 FPS 36f, 24 FPS 36f, 24 FPS 71f baked)
  const speed12 = await synthesizeSpeedStrengthStknds(raw27, {
    projectName: 'speed_vs_strength',
    targetFps: 12,
    interpolate24FpsFrames: false,
    speedColorHex: '#F59E0B',
    strengthColorHex: '#1E293B',
    cameraDynamicTrack: true,
  });
  fs.writeFileSync('public/downloads/speed_vs_strength_12fps.stknds', speed12);

  const speed24 = await synthesizeSpeedStrengthStknds(raw27, {
    projectName: 'speed_vs_strength',
    targetFps: 24,
    interpolate24FpsFrames: false,
    speedColorHex: '#F59E0B',
    strengthColorHex: '#1E293B',
    cameraDynamicTrack: true,
  });
  fs.writeFileSync('public/downloads/speed_vs_strength_24fps.stknds', speed24);

  const speed24Baked = await synthesizeSpeedStrengthStknds(raw27, {
    projectName: 'speed_vs_strength',
    targetFps: 24,
    interpolate24FpsFrames: true,
    speedColorHex: '#F59E0B',
    strengthColorHex: '#1E293B',
    cameraDynamicTrack: true,
  });
  fs.writeFileSync('public/downloads/speed_vs_strength_24fps_71f.stknds', speed24Baked);

  // 5. The Phantom Shadowbox (12 FPS 75f, 24 FPS 75f, 24 FPS 147f baked)
  const phantom12 = await synthesizePhantomShadowboxStknds(raw27, {
    projectName: 'phantom_shadowbox',
    targetFps: 12,
    interpolate24FpsFrames: false,
    primaryColorHex: '#0F172A',
    headColorHex: '#0284C7',
    stillnessHoldFrames: 30,
    crouchHoldFrames: 6,
    jabExtensionSnap: 1.0,
  });
  fs.writeFileSync('public/downloads/phantom_shadowbox_12fps.stknds', phantom12);
  fs.writeFileSync('public/downloads/phantom_shadowbox_12fps_75f.stknds', phantom12);

  const phantom24 = await synthesizePhantomShadowboxStknds(raw27, {
    projectName: 'phantom_shadowbox',
    targetFps: 24,
    interpolate24FpsFrames: false,
    primaryColorHex: '#0F172A',
    headColorHex: '#0284C7',
    stillnessHoldFrames: 30,
    crouchHoldFrames: 6,
    jabExtensionSnap: 1.0,
  });
  fs.writeFileSync('public/downloads/phantom_shadowbox_24fps.stknds', phantom24);
  fs.writeFileSync('public/downloads/phantom_shadowbox_24fps_75f.stknds', phantom24);

  const phantom24Baked = await synthesizePhantomShadowboxStknds(raw27, {
    projectName: 'phantom_shadowbox',
    targetFps: 24,
    interpolate24FpsFrames: true,
    primaryColorHex: '#0F172A',
    headColorHex: '#0284C7',
    stillnessHoldFrames: 30,
    crouchHoldFrames: 6,
    jabExtensionSnap: 1.0,
  });
  fs.writeFileSync('public/downloads/phantom_shadowbox_24fps_147f.stknds', phantom24Baked);
  fs.writeFileSync('public/downloads/phantom_shadowbox_24fps_79f.stknds', phantom24Baked); // backwards compat

  // 6. The Stroll & Kick (24 FPS 216f Master, 12 FPS 108f)
  const strollKick24 = await synthesizeSitWalkKickStknds(raw27, {
    projectName: 'sit_stand_kick_24fps',
    targetFps: 24,
    manColorHex: '#1E293B',
    ballColorHex: '#EA580C',
    ballRadius: 18,
    enableHitStop: true,
  });
  fs.writeFileSync('public/downloads/sit_stand_kick_24fps_216f.stknds', strollKick24);
  fs.writeFileSync('public/downloads/sit_stand_kick_24fps.stknds', strollKick24);

  const strollKick12 = await synthesizeSitWalkKickStknds(raw27, {
    projectName: 'sit_stand_kick_12fps',
    targetFps: 12,
    manColorHex: '#1E293B',
    ballColorHex: '#EA580C',
    ballRadius: 18,
    enableHitStop: true,
  });
  fs.writeFileSync('public/downloads/sit_stand_kick_12fps_108f.stknds', strollKick12);
  fs.writeFileSync('public/downloads/sit_stand_kick_12fps.stknds', strollKick12);

  console.log('Successfully regenerated all .stknds binaries including The Stroll & Kick (216f Master) in public/downloads/!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
