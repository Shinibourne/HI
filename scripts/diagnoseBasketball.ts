import {
  buildCanonicalBasketballFrames,
  validateBasketballBiomechanics,
} from '../src/lib/basketballChoreographyFrames';

const frames = buildCanonicalBasketballFrames();
const audit = validateBasketballBiomechanics(frames);

console.log('Failed checks:');
for (const item of audit.items) {
  if (!item.passed) {
    console.log(`FAIL: #${item.ruleNumber} ${item.label} -> ${item.metric}`);
  }
}

// Inspect Ground Plane
for (const f of frames) {
  if ([0, 1, 7, 12, 13, 14, 15, 16, 17, 19, 20, 23].includes(f.frame)) {
    // print foot Y
    console.log(`F${f.frame}: charY=${f.charY}, RShin=${f.angles[2].toFixed(1)}, RFoot=${f.angles[3].toFixed(1)}`);
  }
}

// Inspect Max Angle Jumps
for (let i = 1; i < frames.length; i++) {
  for (let j = 0; j < 17; j++) {
    const diff = Math.abs(frames[i].angles[j] - frames[i - 1].angles[j]);
    if (diff > 25) {
      console.log(`Jump > 25° at F${i} Bone ${j}: prev=${frames[i - 1].angles[j].toFixed(1)}, curr=${frames[i].angles[j].toFixed(1)}, diff=${diff.toFixed(1)}°`);
    }
  }
}
