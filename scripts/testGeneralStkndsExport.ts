import * as fs from 'fs';
import * as path from 'path';
import { synthesizeGeneralPhysicsStknds } from '../src/lib/physics/generalStkndsExporter';
import { DEFAULT_GENERAL_GENERATOR_CONFIG } from '../src/lib/physics/generalMotionGenerator';
import { inspectStkndsBuffer } from '../src/lib/stknds/stkndsCore';

async function testExport() {
  console.log('Testing General Physics .stknds binary generation...');
  const templatePath = path.resolve('public/templates/rpoject5.stknds');
  const templateBuf = fs.readFileSync(templatePath);

  const ab = templateBuf.buffer.slice(
    templateBuf.byteOffset,
    templateBuf.byteOffset + templateBuf.byteLength
  );

  const parsed27 = await inspectStkndsBuffer('rpoject5.stknds', ab);
  if (!parsed27.rawDecompressed) {
    throw new Error('Failed to decompress rpoject5.stknds');
  }
  const raw27 = parsed27.rawDecompressed;
  console.log(`Decompressed template: ${parsed27.frameCount} frames, ${parsed27.decompressedBytes} bytes.`);

  // Synthesize general physics project
  const stkndsBytes = await synthesizeGeneralPhysicsStknds(raw27, {
    ...DEFAULT_GENERAL_GENERATOR_CONFIG,
    scenario: 'LIFT_HEAVY_VS_LIGHT',
    objMass: 50.0,
  });

  console.log(`Generated .stknds file: ${stkndsBytes.byteLength} bytes.`);

  // Verify container & semantics with inspectStkndsBuffer
  const exportAb = stkndsBytes.buffer.slice(
    stkndsBytes.byteOffset,
    stkndsBytes.byteOffset + stkndsBytes.byteLength
  );
  const exportReport = await inspectStkndsBuffer('general_physics.stknds', exportAb);
  console.log(`Inspection report:`);
  console.log(`- Format Version: ${exportReport.version}`);
  console.log(`- Frame Count: ${exportReport.frameCount}`);
  console.log(`- Frames parsed: ${exportReport.frames.length}`);
  console.log(`- Figure Nodes: ${exportReport.figureNodes.length}`);
  console.log(`- Semantic checks:`, exportReport.semanticChecks.map(c => `${c.label}: ${c.passed}`));

  if (exportReport.version === 334 && exportReport.frames.length > 0) {
    console.log('[✓ PASS] .stknds binary container & figure serialization verified successfully!');
  } else {
    throw new Error('Verification failed: invalid format version or no frames parsed.');
  }
}

testExport().catch((err) => {
  console.error('Export test failed:', err);
  process.exit(1);
});
