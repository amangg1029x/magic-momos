/**
 * Generates a classic "double ring" telephone ringtone as a WAV file.
 * Pattern: ring(0.4s) silence(0.2s) ring(0.4s) silence(1.0s) — loops.
 * The WAV is written to android/app/src/main/res/raw/order_ringtone.wav
 */
const fs = require("fs");
const path = require("path");

const SAMPLE_RATE = 22050; // Hz
const NUM_CHANNELS = 1;    // Mono
const BITS_PER_SAMPLE = 16;
const BYTES_PER_SAMPLE = BITS_PER_SAMPLE / 8;

// Ring pattern: [durationSec, frequency1Hz, frequency2Hz, amplitude(0-1)]
// Classic telephone uses dual-tone: 480 Hz + 620 Hz
const PATTERN = [
  { dur: 0.4, freq1: 480, freq2: 620, amp: 0.4 },  // Ring
  { dur: 0.2, freq1: 0,   freq2: 0,   amp: 0.0 },  // Silence
  { dur: 0.4, freq1: 480, freq2: 620, amp: 0.4 },  // Ring
  { dur: 1.0, freq1: 0,   freq2: 0,   amp: 0.0 },  // Long silence
];

// Generate all samples
const allSamples = [];
for (const seg of PATTERN) {
  const numSamples = Math.floor(seg.dur * SAMPLE_RATE);
  for (let i = 0; i < numSamples; i++) {
    let val = 0;
    if (seg.amp > 0) {
      const t = i / SAMPLE_RATE;
      const tone1 = Math.sin(2 * Math.PI * seg.freq1 * t);
      const tone2 = Math.sin(2 * Math.PI * seg.freq2 * t);
      val = ((tone1 + tone2) / 2) * seg.amp;
    }
    // Apply fade-in/out to first and last 10ms of each ring segment to avoid clicks
    const fadeSamples = Math.floor(0.01 * SAMPLE_RATE);
    const fadeIn  = Math.min(1, i / fadeSamples);
    const fadeOut = Math.min(1, (numSamples - 1 - i) / fadeSamples);
    val *= Math.min(fadeIn, fadeOut);

    // Convert to 16-bit signed int
    const intVal = Math.max(-32768, Math.min(32767, Math.round(val * 32767)));
    allSamples.push(intVal);
  }
}

const dataSize = allSamples.length * BYTES_PER_SAMPLE;
const headerSize = 44;
const fileSize = headerSize + dataSize;

const buffer = Buffer.alloc(fileSize);
let offset = 0;

// RIFF header
buffer.write("RIFF", offset); offset += 4;
buffer.writeUInt32LE(fileSize - 8, offset); offset += 4;
buffer.write("WAVE", offset); offset += 4;

// fmt chunk
buffer.write("fmt ", offset); offset += 4;
buffer.writeUInt32LE(16, offset); offset += 4;             // PCM
buffer.writeUInt16LE(1, offset); offset += 2;              // PCM format
buffer.writeUInt16LE(NUM_CHANNELS, offset); offset += 2;
buffer.writeUInt32LE(SAMPLE_RATE, offset); offset += 4;
buffer.writeUInt32LE(SAMPLE_RATE * NUM_CHANNELS * BYTES_PER_SAMPLE, offset); offset += 4; // byte rate
buffer.writeUInt16LE(NUM_CHANNELS * BYTES_PER_SAMPLE, offset); offset += 2; // block align
buffer.writeUInt16LE(BITS_PER_SAMPLE, offset); offset += 2;

// data chunk
buffer.write("data", offset); offset += 4;
buffer.writeUInt32LE(dataSize, offset); offset += 4;

for (const sample of allSamples) {
  buffer.writeInt16LE(sample, offset);
  offset += 2;
}

const outPath = path.join(__dirname, "..", "android", "app", "src", "main", "res", "raw", "order_ringtone.wav");
fs.writeFileSync(outPath, buffer);
console.log(`✅  order_ringtone.wav written to: ${outPath}`);
console.log(`    Size: ${(fileSize / 1024).toFixed(1)} KB | Duration: ${PATTERN.reduce((a, s) => a + s.dur, 0)}s`);
